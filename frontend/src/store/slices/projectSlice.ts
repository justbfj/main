import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../api/projectApi';

interface ProjectState {
  currentProject: Project | null;
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  currentProject: null,
  selectedProjectId: null,
  isLoading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
      state.selectedProjectId = action.payload?.id || null;
    },
    setSelectedProjectId: (state, action: PayloadAction<string | null>) => {
      state.selectedProjectId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCurrentProject,
  setSelectedProjectId,
  setLoading,
  setError,
  clearError,
} = projectSlice.actions;

export default projectSlice.reducer;