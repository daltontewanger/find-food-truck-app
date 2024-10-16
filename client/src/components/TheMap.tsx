import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  trucks: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    description: string;
  }>;
}

const TheMap: React.FC<MapComponentProps> = ({ trucks }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([32.7157, -117.1611], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMapRef.current);
    }
  }, []);

  useEffect(() => {
    if (leafletMapRef.current) {
      trucks.forEach(truck => {
        const marker = L.marker([truck.latitude, truck.longitude]).addTo(leafletMapRef.current!);
        marker.bindPopup(`<b>${truck.name}</b><br>${truck.description}`).openPopup();
      });
    }
  }, [trucks]);

  return <div id="map" ref={mapRef} style={{ height: '500px', width: '100%' }} />;
};

export default TheMap;