import { useEffect, useState } from 'react';
import axios from 'axios';
import TheMap from '../components/TheMap';
import { Container, TextField, Button, Typography } from '@mui/material';

interface TruckData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  foodType: string;
}

const FindFoodTruck: React.FC = () => {
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch all trucks initially
    const fetchTrucks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/trucks');
        setTrucks(response.data);
      } catch (error) {
        console.error('Error fetching food trucks:', error);
      }
    };

    fetchTrucks();
  }, []);

  const handleSearch = () => {
    // Fetch trucks based on the search term
    const filteredTrucks = trucks.filter(truck =>
      truck.foodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setTrucks(filteredTrucks);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Find a Food Truck
      </Typography>
      <TextField
        label="Search by food type or name"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <Button variant="contained" color="primary" onClick={handleSearch} style={{ marginBottom: '20px' }}>
        Search
      </Button>
      <TheMap trucks={trucks} />
    </Container>
  );
};

export default FindFoodTruck;
