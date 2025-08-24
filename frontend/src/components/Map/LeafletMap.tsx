import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, LayersControl, useMap, useMapEvents } from 'react-leaflet';
import { LatLngBounds, LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setViewport } from '../../store/slices/mapSlice';
import LayerRenderer from './LayerRenderer';
import DrawingControls from './DrawingControls';
import MeasurementTools from './MeasurementTools';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

interface MapEventHandlerProps {
  onViewportChange: (center: [number, number], zoom: number, bounds?: [[number, number], [number, number]]) => void;
}

const MapEventHandler: React.FC<MapEventHandlerProps> = ({ onViewportChange }) => {
  const map = useMap();

  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      onViewportChange(
        [center.lat, center.lng],
        zoom,
        [[bounds.getSouth(), bounds.getWest()], [bounds.getNorth(), bounds.getEast()]]
      );
    },
    zoomend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      onViewportChange(
        [center.lat, center.lng],
        zoom,
        [[bounds.getSouth(), bounds.getWest()], [bounds.getNorth(), bounds.getEast()]]
      );
    },
  });

  return null;
};

// Component to handle auto-zooming to layer bounds
const AutoZoomToLayers: React.FC<{ layers: any[] }> = ({ layers }) => {
  const map = useMap();

  useEffect(() => {
    if (!layers || layers.length === 0) return;

    const bounds = new L.LatLngBounds([]);
    let hasValidBounds = false;

    layers.forEach(layer => {
      if (layer.visible && layer.data && layer.data.features) {
        layer.data.features.forEach((feature: any) => {
          if (feature.geometry && feature.geometry.coordinates) {
            const coords = feature.geometry.coordinates;
            
            switch (feature.geometry.type) {
              case 'Point':
                bounds.extend([coords[1], coords[0]]);
                hasValidBounds = true;
                break;
              case 'LineString':
                coords.forEach((coord: number[]) => {
                  bounds.extend([coord[1], coord[0]]);
                  hasValidBounds = true;
                });
                break;
              case 'MultiLineString':
                coords.forEach((line: number[][]) => {
                  line.forEach((coord: number[]) => {
                    bounds.extend([coord[1], coord[0]]);
                    hasValidBounds = true;
                  });
                });
                break;
              case 'Polygon':
                coords[0]?.forEach((coord: number[]) => {
                  bounds.extend([coord[1], coord[0]]);
                  hasValidBounds = true;
                });
                break;
            }
          }
        });
      }
    });

    if (hasValidBounds && bounds.isValid()) {
      // Add some padding around the bounds
      const paddedBounds = bounds.pad(0.1);
      map.fitBounds(paddedBounds);
    }
  }, [layers, map]);

  return null;
};

const LeafletMap: React.FC = () => {
  const dispatch = useAppDispatch();
  const { viewport, mapStyle, drawingMode, measurementMode } = useAppSelector((state) => state.map);
  const { currentProject } = useAppSelector((state) => state.project);
  const layers = currentProject?.layers || [];
  const mapRef = useRef<any>(null);

  const handleViewportChange = (
    center: [number, number],
    zoom: number,
    bounds?: [[number, number], [number, number]]
  ) => {
    dispatch(setViewport({ center, zoom, bounds }));
  };

  const getTileLayerUrl = (style: string) => {
    switch (style) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getTileLayerAttribution = (style: string) => {
    switch (style) {
      case 'satellite':
        return '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      case 'terrain':
        return '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community';
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        ref={mapRef}
        center={viewport.center as LatLngExpression}
        zoom={viewport.zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapEventHandler onViewportChange={handleViewportChange} />
        
        <LayersControl position="topright">
          <BaseLayer checked={mapStyle === 'street'} name="Street Map">
            <TileLayer
              url={getTileLayerUrl('street')}
              attribution={getTileLayerAttribution('street')}
            />
          </BaseLayer>
          <BaseLayer checked={mapStyle === 'satellite'} name="Satellite">
            <TileLayer
              url={getTileLayerUrl('satellite')}
              attribution={getTileLayerAttribution('satellite')}
            />
          </BaseLayer>
          <BaseLayer checked={mapStyle === 'terrain'} name="Terrain">
            <TileLayer
              url={getTileLayerUrl('terrain')}
              attribution={getTileLayerAttribution('terrain')}
            />
          </BaseLayer>
        </LayersControl>

        <AutoZoomToLayers layers={layers} />
        
        {layers.map((layer) => (
          <LayerRenderer key={layer.id} layer={layer} />
        ))}

        {drawingMode !== 'none' && <DrawingControls />}
        {measurementMode && <MeasurementTools />}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;