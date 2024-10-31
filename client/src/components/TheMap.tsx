import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  trucks: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    menuLink: string;
    description: string;
    foodType: string;
  }>;
  onMarkerClick: (truck: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    menuLink: string;
    description: string;
    foodType: string;
  }) => void;
}

const TheMap: React.FC<MapComponentProps> = ({ trucks, onMarkerClick  }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Initialize the map on first render
    if (mapRef.current && !leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([32.7157, -117.1611], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMapRef.current);
    }
  }, []);

  useEffect(() => {
    if (leafletMapRef.current) {
      // Remove previous markers before adding new ones
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
      } else {
        markersLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);
      }

      // Add new markers for currently open trucks, validating coordinates
      trucks.forEach((truck) => {
        if (truck.latitude !== undefined && truck.longitude !== undefined) {
          const marker = L.marker([truck.latitude, truck.longitude]).addTo(markersLayerRef.current!);
          marker.bindPopup(`
            <b>${truck.name}</b><br>
            <a href="${truck.menuLink}" target="_blank">Click To View Our Menu</a><br>
            <button onclick="window.dispatchEvent(new CustomEvent('truckClick', { detail: '${truck.id}' }))">See Full Info</button>
          `);

          marker.on('popupopen', () => {
            window.addEventListener('truckClick', (e: any) => {
              if (e.detail === truck.id) {
                onMarkerClick(truck);
              }
            });
          });
        } else {
          console.warn(`Skipping truck with id ${truck.id} due to missing coordinates`);
        }
      });
    }
  }, [trucks, onMarkerClick]);

  return <div id="map" ref={mapRef} style={{ height: '500px', width: '100%' }} />;
};

export default TheMap;
