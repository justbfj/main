import { getMockProjects, createMockProject, saveMockProjects } from '../mockApi';

describe('Mock API Functions', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Also reset the in-memory cache by saving empty array
    saveMockProjects([]);
  });

  test('should create and retrieve a mock project', () => {
    const projectData = {
      name: 'Test Project',
      description: 'Test Description',
      dateRange: {
        start: '2024-01-01',
        end: '2024-01-07',
      },
      boundingBox: [-180, -90, 180, 90],
      settings: {
        mapCenter: [39.8283, -98.5795] as [number, number],
        mapZoom: 4,
        units: 'metric' as const,
      },
    };

    // Create a project
    const newProject = createMockProject(projectData);

    // Verify project properties
    expect(newProject.id).toBeDefined();
    expect(newProject.name).toBe('Test Project');
    expect(newProject.description).toBe('Test Description');
    expect(newProject.layers).toEqual([]);
    expect(newProject.flightPlans).toEqual([]);

    // Retrieve projects
    const projects = getMockProjects();
    expect(projects.length).toBe(1);
    expect(projects[0].id).toBe(newProject.id);
  });

  test('should persist projects in localStorage', () => {
    const projectData = {
      name: 'Persistent Project',
      description: 'Should persist',
      dateRange: {
        start: '2024-01-01',
        end: '2024-01-07',
      },
      boundingBox: [-180, -90, 180, 90],
      settings: {
        mapCenter: [39.8283, -98.5795] as [number, number],
        mapZoom: 4,
        units: 'metric' as const,
      },
    };

    // Create and save project
    createMockProject(projectData);

    // Clear in-memory cache and retrieve from localStorage
    const stored = localStorage.getItem('bfgeo_projects');
    expect(stored).toBeTruthy();
    
    const parsedProjects = JSON.parse(stored!);
    expect(parsedProjects.length).toBe(1);
    expect(parsedProjects[0].name).toBe('Persistent Project');
  });

  test('should handle empty project list', () => {
    const projects = getMockProjects();
    expect(projects).toEqual([]);
  });
});

console.log('✅ Mock API test module loaded successfully');