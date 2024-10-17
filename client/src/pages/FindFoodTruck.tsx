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
  const [filteredTrucks, setFilteredTrucks] = useState<TruckData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch currently open trucks initially
    const fetchOpenTrucks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/foodtruck/open');
        setTrucks(response.data);
        setFilteredTrucks(response.data); // Set initial filtered trucks as well
      } catch (error) {
        console.error('Error fetching open food trucks:', error);
      }
    };

    fetchOpenTrucks();
  }, []);

  const handleSearch = () => {
    // Filter trucks based on the search term
    const filtered = trucks.filter((truck) =>
      truck.foodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTrucks(filtered);
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
      <TheMap trucks={filteredTrucks} />
    </Container>
  );
};

export default FindFoodTruck;
