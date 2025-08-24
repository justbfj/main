import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Layer } from '../api/projectApi';

interface MapViewport {
  center: [number, number];
  zoom: number;
  bounds?: [[number, number], [number, number]];
}

interface MapState {
  viewport: MapViewport;
  layers: Layer[];
  selectedLayerId: string | null;
  drawingMode: 'none' | 'line' | 'polygon' | 'point';
  measurementMode: boolean;
  selectedFeatures: any[];
  mapStyle: 'street' | 'satellite' | 'terrain';
}

const initialState: MapState = {
  viewport: {
    center: [39.8283, -98.5795], // Geographic center of US
    zoom: 4,
  },
  layers: [],
  selectedLayerId: null,
  drawingMode: 'none',
  measurementMode: false,
  selectedFeatures: [],
  mapStyle: 'street',
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setViewport: (state, action: PayloadAction<MapViewport>) => {
      state.viewport = action.payload;
    },
    setLayers: (state, action: PayloadAction<Layer[]>) => {
      state.layers = action.payload;
    },
    addLayer: (state, action: PayloadAction<Layer>) => {
      state.layers.push(action.payload);
    },
    updateLayer: (state, action: PayloadAction<{ id: string; updates: Partial<Layer> }>) => {
      const index = state.layers.findIndex(layer => layer.id === action.payload.id);
      if (index !== -1) {
        state.layers[index] = { ...state.layers[index], ...action.payload.updates };
      }
    },
    removeLayer: (state, action: PayloadAction<string>) => {
      state.layers = state.layers.filter(layer => layer.id !== action.payload);
    },
    setSelectedLayerId: (state, action: PayloadAction<string | null>) => {
      state.selectedLayerId = action.payload;
    },
    setDrawingMode: (state, action: PayloadAction<'none' | 'line' | 'polygon' | 'point'>) => {
      state.drawingMode = action.payload;
    },
    toggleMeasurementMode: (state) => {
      state.measurementMode = !state.measurementMode;
    },
    setSelectedFeatures: (state, action: PayloadAction<any[]>) => {
      state.selectedFeatures = action.payload;
    },
    setMapStyle: (state, action: PayloadAction<'street' | 'satellite' | 'terrain'>) => {
      state.mapStyle = action.payload;
    },
  },
});

export const {
  setViewport,
  setLayers,
  addLayer,
  updateLayer,
  removeLayer,
  setSelectedLayerId,
  setDrawingMode,
  toggleMeasurementMode,
  setSelectedFeatures,
  setMapStyle,
} = mapSlice.actions;

export default mapSlice.reducer;