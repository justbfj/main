import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { projectApi } from './api/projectApi';
import projectSlice from './slices/projectSlice';
import mapSlice from './slices/mapSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    project: projectSlice,
    map: mapSlice,
    ui: uiSlice,
    [projectApi.reducerPath]: projectApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(projectApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;