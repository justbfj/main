import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setDrawingMode } from '../../store/slices/mapSlice';

const DrawingControls: React.FC = () => {
  const map = useMap();
  const dispatch = useAppDispatch();
  const { drawingMode } = useAppSelector((state) => state.map);
  const [drawingLayer, setDrawingLayer] = useState<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    const featureGroup = new L.FeatureGroup();
    map.addLayer(featureGroup);
    setDrawingLayer(featureGroup);

    let currentDrawing: L.Layer | null = null;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (drawingMode === 'none') return;

      const { lat, lng } = e.latlng;

      switch (drawingMode) {
        case 'point':
          const marker = new L.Marker([lat, lng]);
          featureGroup.addLayer(marker);
          dispatch(setDrawingMode('none'));
          break;

        case 'line':
          if (!currentDrawing) {
            currentDrawing = new L.Polyline([[lat, lng]], { color: 'red' });
            featureGroup.addLayer(currentDrawing);
          } else {
            (currentDrawing as L.Polyline).addLatLng([lat, lng]);
          }
          break;

        case 'polygon':
          if (!currentDrawing) {
            currentDrawing = new L.Polygon([[lat, lng]], { color: 'blue' });
            featureGroup.addLayer(currentDrawing);
          } else {
            (currentDrawing as L.Polygon).addLatLng([lat, lng]);
          }
          break;
      }
    };

    const handleMapDoubleClick = (e: L.LeafletMouseEvent) => {
      if (currentDrawing && (drawingMode === 'line' || drawingMode === 'polygon')) {
        currentDrawing = null;
        dispatch(setDrawingMode('none'));
      }
    };

    map.on('click', handleMapClick);
    map.on('dblclick', handleMapDoubleClick);

    return () => {
      map.off('click', handleMapClick);
      map.off('dblclick', handleMapDoubleClick);
      if (featureGroup) {
        map.removeLayer(featureGroup);
      }
    };
  }, [map, drawingMode, dispatch]);

  return null;
};

export default DrawingControls;