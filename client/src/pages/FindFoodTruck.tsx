import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const FindFoodTruck = () => {
    const [foodTrucks, setFoodTrucks] = useState([]);

    useEffect(() => {
        socket.on('locationUpdated', (data) => {
            // Update the list of food trucks
            setFoodTrucks((current) => [...current, data]);
        });

        return () => {
            socket.off('locationUpdated');
        };
    }, []);

    return (
        <div>
            <h2>Find a Food Truck</h2>
            <MapContainer center={[32.7157, -117.1611]} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {foodTrucks.map((truck) => (
                    <Marker key={truck.id} position={truck.coordinates}>
                        <Popup>{truck.name}</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default FindFoodTruck;
