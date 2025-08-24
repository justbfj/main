import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  activePanel: 'projects' | 'layers' | 'analysis' | 'flightplan' | null;
  dialogOpen: boolean;
  dialogType: 'createProject' | 'uploadData' | 'settings' | null;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  loading: boolean;
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  sidebarOpen: true,
  activePanel: 'projects',
  dialogOpen: false,
  dialogType: null,
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  loading: false,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setActivePanel: (state, action: PayloadAction<'projects' | 'layers' | 'analysis' | 'flightplan' | null>) => {
      state.activePanel = action.payload;
    },
    openDialog: (state, action: PayloadAction<'createProject' | 'uploadData' | 'settings'>) => {
      state.dialogOpen = true;
      state.dialogType = action.payload;
    },
    closeDialog: (state) => {
      state.dialogOpen = false;
      state.dialogType = null;
    },
    showSnackbar: (state, action: PayloadAction<{ message: string; severity?: 'success' | 'error' | 'warning' | 'info' }>) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setActivePanel,
  openDialog,
  closeDialog,
  showSnackbar,
  hideSnackbar,
  setLoading,
  toggleTheme,
} = uiSlice.actions;

export default uiSlice.reducer;