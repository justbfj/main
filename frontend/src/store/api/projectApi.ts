import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  owner: string;
  dateRange: {
    start: string;
    end: string;
  };
  boundingBox: number[];
  layers: Layer[];
  flightPlans: FlightPlan[];
  settings: ProjectSettings;
}

export interface Layer {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'terrain';
  visible: boolean;
  opacity: number;
  data: GeoJSON.FeatureCollection;
}

export interface FlightPlan {
  id: string;
  name: string;
  route: any;
  schedule: any;
  efficiency: number;
  risks: any;
  alternatives: any[];
}

export interface ProjectSettings {
  mapCenter: [number, number];
  mapZoom: number;
  units: 'metric' | 'imperial';
}

export interface WeatherAnalysis {
  climate: any;
  forecast: any;
  hazards: any;
  recommendations: any;
}

export interface AirspaceAnalysis {
  restrictions: any;
  traffic: any;
  airspace: any;
  compliance: any;
}

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Project', 'Layer', 'FlightPlan'],
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProject: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: '/projects',
        method: 'POST',
        body: project,
      }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation<Project, { id: string; project: Partial<Project> }>({
      query: ({ id, project }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: project,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Project', id }],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
    uploadGeospatialData: builder.mutation<Layer, { projectId: string; file: File }>({
      query: ({ projectId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/projects/${projectId}/upload`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),
    analyzeProject: builder.mutation<{ weather: WeatherAnalysis; airspace: AirspaceAnalysis }, { projectId: string; dateRange: { start: string; end: string } }>({
      query: ({ projectId, dateRange }) => ({
        url: `/projects/${projectId}/analyze`,
        method: 'POST',
        body: { dateRange },
      }),
    }),
    optimizeFlightPlan: builder.mutation<FlightPlan, { projectId: string; constraints?: any }>({
      query: ({ projectId, constraints }) => ({
        url: `/projects/${projectId}/plan`,
        method: 'POST',
        body: { constraints },
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUploadGeospatialDataMutation,
  useAnalyzeProjectMutation,
  useOptimizeFlightPlanMutation,
} = projectApi;