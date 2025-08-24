import proj4 from 'proj4';

// Cache for EPSG definitions to avoid repeated fetches
const epsgCache: { [key: string]: string } = {};

// Common EPSG definitions that are often used
const commonProjections: { [key: string]: string } = {
  '3857': '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',
  '4326': '+proj=longlat +datum=WGS84 +no_defs',
  '26915': '+proj=utm +zone=15 +datum=NAD83 +units=m +no_defs',
  '26916': '+proj=utm +zone=16 +datum=NAD83 +units=m +no_defs',
  '26914': '+proj=utm +zone=14 +datum=NAD83 +units=m +no_defs',
  '32615': '+proj=utm +zone=15 +datum=WGS84 +units=m +no_defs',
  '32616': '+proj=utm +zone=16 +datum=WGS84 +units=m +no_defs',
  '32614': '+proj=utm +zone=14 +datum=WGS84 +units=m +no_defs',
  '6346': '+proj=utm +zone=15 +datum=NAD83 +units=m +no_defs +type=crs', // NAD83(2011) / UTM zone 15N
};

// Fetch EPSG definition from epsg.io
const fetchEPSGDefinition = async (epsgCode: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://epsg.io/${epsgCode}.proj4`);
    if (response.ok) {
      const proj4String = await response.text();
      epsgCache[epsgCode] = proj4String.trim();
      return proj4String.trim();
    }
  } catch (error) {
    console.warn(`Failed to fetch EPSG:${epsgCode} from epsg.io:`, error);
  }
  return null;
};

// Get projection definition for EPSG code
const getProjectionDefinition = async (epsgCode: string): Promise<string | null> => {
  // Check cache first
  if (epsgCache[epsgCode]) {
    return epsgCache[epsgCode];
  }

  // Check common projections
  if (commonProjections[epsgCode]) {
    epsgCache[epsgCode] = commonProjections[epsgCode];
    return commonProjections[epsgCode];
  }

  // Try to fetch from epsg.io
  return await fetchEPSGDefinition(epsgCode);
};

// Transform a single coordinate pair
export const transformCoordinate = async (
  coord: [number, number], 
  fromEPSG: string, 
  toEPSG: string = '4326'
): Promise<[number, number]> => {
  try {
    const fromProj = await getProjectionDefinition(fromEPSG);
    const toProj = toEPSG === '4326' ? '+proj=longlat +datum=WGS84 +no_defs' : await getProjectionDefinition(toEPSG);

    if (!fromProj) {
      throw new Error(`Unknown projection: EPSG:${fromEPSG}`);
    }
    if (!toProj && toEPSG !== '4326') {
      throw new Error(`Unknown projection: EPSG:${toEPSG}`);
    }

    const result = proj4(fromProj, toProj || '+proj=longlat +datum=WGS84 +no_defs', coord);
    return [result[0], result[1]];
  } catch (error) {
    console.error(`Coordinate transformation failed from EPSG:${fromEPSG} to EPSG:${toEPSG}:`, error);
    
    // Fallback based on coordinate ranges
    return fallbackTransformation(coord, fromEPSG);
  }
};

// Fallback transformation based on coordinate analysis
const fallbackTransformation = (coord: [number, number], fromEPSG: string): [number, number] => {
  const [x, y] = coord;

  // If coordinates are already in lat/lng range, return as-is
  if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
    return [x, y];
  }

  // UTM-like coordinates (large x, y values)
  if (x > 100000 && y > 1000000) {
    // Determine UTM zone based on x coordinate
    const zone = Math.floor((x - 166021.44) / 1000000) + 31;
    const centralMeridian = (zone - 1) * 6 - 180 + 3;
    
    // Simple UTM to lat/lng approximation
    const lng = centralMeridian + (x - 500000) / (111320 * Math.cos(Math.PI * y / 20003931.46));
    const lat = (y - 0) / 111320;
    
    console.log(`Fallback UTM transformation: [${x}, ${y}] → [${lng}, ${lat}]`);
    return [lng, lat];
  }

  // State Plane or other regional projections - use regional approximation
  if (x > 100000 && y > 100000) {
    // Basic approximation for North American coordinates
    const lng = -95 + (x - 500000) / 111320;
    const lat = 45 + (y - 5000000) / 111320;
    
    console.log(`Fallback regional transformation: [${x}, ${y}] → [${lng}, ${lat}]`);
    return [lng, lat];
  }

  // Unknown coordinate system, return original
  console.warn(`Unknown coordinate system for [${x}, ${y}], returning original coordinates`);
  return [x, y];
};

// Transform coordinates in GeoJSON geometry
export const transformGeometry = async (
  coordinates: any,
  geometryType: string,
  fromEPSG: string,
  toEPSG: string = '4326'
): Promise<any> => {
  const transformPoint = async (coord: number[]): Promise<number[]> => {
    if (coord.length < 2) return coord;
    const [lon, lat] = await transformCoordinate([coord[0], coord[1]], fromEPSG, toEPSG);
    return [lon, lat, ...coord.slice(2)]; // Preserve Z coordinate if present
  };

  switch (geometryType) {
    case 'Point':
      return await transformPoint(coordinates);
    
    case 'LineString':
      return await Promise.all(coordinates.map(transformPoint));
    
    case 'MultiLineString':
      return await Promise.all(
        coordinates.map((line: number[][]) => Promise.all(line.map(transformPoint)))
      );
    
    case 'Polygon':
      return await Promise.all(
        coordinates.map((ring: number[][]) => Promise.all(ring.map(transformPoint)))
      );
    
    case 'MultiPolygon':
      return await Promise.all(
        coordinates.map((polygon: number[][][]) =>
          Promise.all(polygon.map((ring: number[][]) => Promise.all(ring.map(transformPoint))))
        )
      );
    
    default:
      return coordinates;
  }
};

// Extract EPSG code from various CRS formats
export const extractEPSGCode = (crs: any): string | null => {
  if (!crs) return null;
  
  if (crs.type === 'name' && crs.properties?.name) {
    const name = crs.properties.name;
    // Handle different CRS name formats
    if (name.includes('EPSG::')) {
      return name.split('EPSG::')[1];
    } else if (name.includes('EPSG:')) {
      return name.split('EPSG:')[1];
    } else if (name.includes('urn:ogc:def:crs:EPSG::')) {
      return name.split('urn:ogc:def:crs:EPSG::')[1];
    }
  }
  
  return null;
};