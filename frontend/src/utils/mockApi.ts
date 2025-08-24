import { Project, Layer, FlightPlan } from '../store/api/projectApi';
import { transformGeometry, extractEPSGCode, detectCRSFromCoordinates } from './coordinateTransform';

// Mock localStorage-based data store for development
const STORAGE_KEY = 'bfgeo_projects';

let mockProjects: Project[] = [];

export const getMockProjects = (): Project[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    mockProjects = JSON.parse(stored);
  }
  return mockProjects;
};

export const saveMockProjects = (projects: Project[]) => {
  mockProjects = projects;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const createMockProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'owner' | 'layers' | 'flightPlans'>): Project => {
  const newProject: Project = {
    ...projectData,
    id: `project_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: 'mock_user',
    layers: [],
    flightPlans: [],
  };

  const projects = getMockProjects();
  projects.push(newProject);
  saveMockProjects(projects);

  return newProject;
};

export const updateMockProject = (id: string, updates: Partial<Project>): Project | null => {
  const projects = getMockProjects();
  const index = projects.findIndex(p => p.id === id);
  
  if (index === -1) return null;

  const updatedProject = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  projects[index] = updatedProject;
  saveMockProjects(projects);

  return updatedProject;
};

export const deleteMockProject = (id: string): boolean => {
  const projects = getMockProjects();
  const filteredProjects = projects.filter(p => p.id !== id);
  
  if (filteredProjects.length === projects.length) return false;

  saveMockProjects(filteredProjects);
  return true;
};

export const uploadMockGeospatialData = async (projectId: string, file: File): Promise<Layer> => {
  try {
    // Read the file content
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });

    // Process the file content
    let geoData: any; // Using any to allow CRS property which isn't in standard GeoJSON types
    
    // Parse the file based on its type
    if (file.name.toLowerCase().endsWith('.geojson') || file.name.toLowerCase().endsWith('.json')) {
      geoData = JSON.parse(fileContent);
      
      // Check if there's a CRS defined in the GeoJSON
      if (geoData.crs) {
        const epsgCode = extractEPSGCode(geoData.crs);
        console.log('Detected CRS:', geoData.crs, 'EPSG Code:', epsgCode);
        
        if (epsgCode && epsgCode !== '4326') {
          console.log(`Converting coordinates from EPSG:${epsgCode} to WGS84...`);
          
          // Transform all features asynchronously
          const transformedFeatures = await Promise.all(
            geoData.features.map(async (feature: any) => {
              if (feature.geometry && feature.geometry.coordinates) {
                feature.geometry.coordinates = await transformGeometry(
                  feature.geometry.coordinates, 
                  feature.geometry.type, 
                  epsgCode
                );
              }
              return feature;
            })
          );
          
          geoData.features = transformedFeatures;
          
          // Update the CRS to WGS84
          geoData.crs = {
            type: 'name',
            properties: {
              name: 'urn:ogc:def:crs:EPSG::4326'
            }
          };
          
          console.log('Coordinate transformation completed');
        }
      } else {
        // No CRS defined, try to detect it intelligently
        if (geoData.features && geoData.features.length > 0) {
          const firstFeature = geoData.features[0];
          if (firstFeature.geometry && firstFeature.geometry.coordinates) {
            const coords = firstFeature.geometry.coordinates;
            let coordinatesArray: number[][] = [];
            
            // Extract coordinate array based on geometry type
            if (firstFeature.geometry.type === 'MultiLineString' && coords[0] && coords[0].length > 0) {
              coordinatesArray = coords[0];
            } else if (firstFeature.geometry.type === 'LineString') {
              coordinatesArray = coords;
            } else if (firstFeature.geometry.type === 'Point') {
              coordinatesArray = [coords];
            } else if (firstFeature.geometry.type === 'Polygon' && coords[0]) {
              coordinatesArray = coords[0];
            }
            
            // Try to detect the CRS
            const detectedEPSG = detectCRSFromCoordinates(coordinatesArray);
            
            if (detectedEPSG && detectedEPSG !== '4326') {
              console.log(`No CRS specified, but detected likely projection: EPSG:${detectedEPSG}`);
              console.log(`Converting coordinates from EPSG:${detectedEPSG} to WGS84...`);
              
              // Transform all features using the detected CRS
              const transformedFeatures = await Promise.all(
                geoData.features.map(async (feature: any) => {
                  if (feature.geometry && feature.geometry.coordinates) {
                    feature.geometry.coordinates = await transformGeometry(
                      feature.geometry.coordinates, 
                      feature.geometry.type, 
                      detectedEPSG
                    );
                  }
                  return feature;
                })
              );
              
              geoData.features = transformedFeatures;
              
              // Add the detected CRS information
              geoData.crs = {
                type: 'name',
                properties: {
                  name: 'urn:ogc:def:crs:EPSG::4326'
                }
              };
              
              console.log('Automatic coordinate transformation completed');
            } else if (coordinatesArray.length > 0 && coordinatesArray[0].length >= 2) {
              const [x, y] = coordinatesArray[0];
              // If coordinates are very large (> 180), warn about unknown CRS
              if (Math.abs(x) > 180 || Math.abs(y) > 180) {
                console.warn('Coordinates appear to be projected but CRS could not be detected. Data may not display correctly.');
                console.warn(`Sample coordinates: [${x}, ${y}]`);
              }
            }
          }
        }
      }
    } else if (file.name.toLowerCase().endsWith('.csv')) {
      // For CSV, create a simple mock parsing (in real app, you'd use a proper CSV to GeoJSON converter)
      geoData = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: { name: 'CSV Data' },
          geometry: {
            type: 'Point',
            coordinates: [-98.5795, 39.8283]
          }
        }]
      };
    } else {
      // For other formats, create a mock feature
      geoData = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: { name: 'Uploaded Data' },
          geometry: {
            type: 'Point',
            coordinates: [-98.5795, 39.8283]
          }
        }]
      };
    }

    // Create a new layer
    const newLayer: Layer = {
      id: `layer_${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      type: 'vector',
      visible: true,
      opacity: 1,
      data: geoData
    };

    // Add the layer to the project
    const projects = getMockProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    projects[projectIndex].layers.push(newLayer);
    saveMockProjects(projects);

    return newLayer;
  } catch (error) {
    throw new Error('Failed to process file: ' + (error as Error).message);
  }
};