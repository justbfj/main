import React from 'react';
import { GeoJSON, Marker, Popup } from 'react-leaflet';
import { Layer } from '../../store/api/projectApi';
import L from 'leaflet';

interface LayerRendererProps {
  layer: Layer;
}

const LayerRenderer: React.FC<LayerRendererProps> = ({ layer }) => {
  if (!layer.visible) return null;

  const getFeatureStyle = (feature: any) => {
    // Use different colors for different flight line blocks
    const blockColor = feature.properties?.Block === 'BL01' ? '#ff6b35' : '#4ecdc4';
    
    return {
      color: blockColor,
      weight: 3,
      opacity: layer.opacity,
      fillColor: blockColor,
      fillOpacity: layer.opacity * 0.3,
    };
  };

  const onEachFeature = (feature: any, leafletLayer: L.Layer) => {
    if (feature.properties) {
      const popupContent = Object.entries(feature.properties)
        .map(([key, value]) => `<b>${key}:</b> ${value}`)
        .join('<br/>');
      
      leafletLayer.bindPopup(popupContent);
    }
  };

  if (layer.type === 'vector' && layer.data) {
    return (
      <GeoJSON
        key={`${layer.id}-${layer.opacity}`}
        data={layer.data}
        style={getFeatureStyle}
        onEachFeature={onEachFeature}
      />
    );
  }

  return null;
};

export default LayerRenderer;