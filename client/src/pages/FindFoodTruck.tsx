import { useEffect, useState } from 'react';
import axios from 'axios';
import TheMap from '../components/TheMap';
import { Container, TextField, Button, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

interface TruckData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  foodType: string;
}

const FindFoodTruck: React.FC = () => {
  const { userRole } = useAuth();
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
    const filtered = trucks.filter((truck) => {
      const foodType = truck.foodType ? truck.foodType.toString().toLowerCase() : '';
      const name = truck.name ? truck.name.toString().toLowerCase() : '';
      return (
        foodType.includes(searchTerm.toLowerCase()) ||
        name.includes(searchTerm.toLowerCase())
      );
    });
    setFilteredTrucks(filtered);
  };

  if (!userRole) {
    return (
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>
          Please log in to begin searching food trucks
        </Typography>
      </Container>
    )
  }

  if (userRole) {
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
  }
};

export default FindFoodTruck;
