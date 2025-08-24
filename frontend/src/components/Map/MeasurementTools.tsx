import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const MeasurementTools: React.FC = () => {
  const map = useMap();
  const [measuring, setMeasuring] = useState<'distance' | 'area' | null>(null);
  const [measurementLayer, setMeasurementLayer] = useState<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    const featureGroup = new L.FeatureGroup();
    map.addLayer(featureGroup);
    setMeasurementLayer(featureGroup);

    let currentMeasurement: L.Polyline | L.Polygon | null = null;
    let measurementPoints: L.LatLng[] = [];

    const calculateDistance = (latlngs: L.LatLng[]): number => {
      let totalDistance = 0;
      for (let i = 0; i < latlngs.length - 1; i++) {
        totalDistance += latlngs[i].distanceTo(latlngs[i + 1]);
      }
      return totalDistance;
    };

    const calculateArea = (latlngs: L.LatLng[]): number => {
      if (latlngs.length < 3) return 0;
      
      const polygon = new L.Polygon(latlngs);
      return L.GeometryUtil ? (L.GeometryUtil as any).geodesicArea(latlngs) : 0;
    };

    const formatDistance = (distance: number): string => {
      if (distance < 1000) {
        return `${distance.toFixed(1)} m`;
      }
      return `${(distance / 1000).toFixed(2)} km`;
    };

    const formatArea = (area: number): string => {
      if (area < 10000) {
        return `${area.toFixed(1)} m²`;
      }
      return `${(area / 10000).toFixed(2)} ha`;
    };

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!measuring) return;

      measurementPoints.push(e.latlng);

      if (measuring === 'distance') {
        if (!currentMeasurement) {
          currentMeasurement = new L.Polyline(measurementPoints, { 
            color: 'red', 
            weight: 3,
            dashArray: '5, 5'
          });
          featureGroup.addLayer(currentMeasurement);
        } else {
          (currentMeasurement as L.Polyline).setLatLngs(measurementPoints);
        }

        if (measurementPoints.length > 1) {
          const distance = calculateDistance(measurementPoints);
          const popup = new L.Popup()
            .setLatLng(e.latlng)
            .setContent(`Distance: ${formatDistance(distance)}`);
          featureGroup.addLayer(popup);
        }
      } else if (measuring === 'area') {
        if (!currentMeasurement) {
          currentMeasurement = new L.Polygon(measurementPoints, { 
            color: 'blue', 
            weight: 3,
            fillColor: 'blue',
            fillOpacity: 0.2
          });
          featureGroup.addLayer(currentMeasurement);
        } else {
          (currentMeasurement as L.Polygon).setLatLngs([measurementPoints]);
        }

        if (measurementPoints.length > 2) {
          const area = calculateArea(measurementPoints);
          const popup = new L.Popup()
            .setLatLng(e.latlng)
            .setContent(`Area: ${formatArea(area)}`);
          featureGroup.addLayer(popup);
        }
      }
    };

    const handleMapDoubleClick = () => {
      if (currentMeasurement && measurementPoints.length > 0) {
        currentMeasurement = null;
        measurementPoints = [];
        setMeasuring(null);
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd' && !measuring) {
        setMeasuring('distance');
      } else if (e.key === 'a' && !measuring) {
        setMeasuring('area');
      } else if (e.key === 'Escape') {
        setMeasuring(null);
        featureGroup.clearLayers();
        currentMeasurement = null;
        measurementPoints = [];
      }
    };

    map.on('click', handleMapClick);
    map.on('dblclick', handleMapDoubleClick);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      map.off('click', handleMapClick);
      map.off('dblclick', handleMapDoubleClick);
      document.removeEventListener('keydown', handleKeyPress);
      if (featureGroup) {
        map.removeLayer(featureGroup);
      }
    };
  }, [map, measuring]);

  return null;
};

export default MeasurementTools;