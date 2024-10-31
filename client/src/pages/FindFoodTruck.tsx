import { useEffect, useState } from 'react';
import axios from 'axios';
import TheMap from '../components/TheMap';
import { Container, TextField, Button, Typography, Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';

interface TruckData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  menuLink: string;
  foodType: string;
  description: string;
}

const FindFoodTruck: React.FC = () => {
  const { userRole } = useAuth();
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [filteredTrucks, setFilteredTrucks] = useState<TruckData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTruck, setSelectedTruck] = useState<TruckData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleOpenModal = (truck: TruckData) => {
    setSelectedTruck(truck);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTruck(null);
    setModalOpen(false);
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
        <form onSubmit={handleSearch}>
          <TextField
            label="Search by food type or name"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <Button type="submit" variant="contained" color="primary" style={{ marginBottom: '20px' }}>
            Search
          </Button>
        </form>
        <TheMap trucks={filteredTrucks} onMarkerClick={handleOpenModal} />

        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: 200,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              overflowY: 'auto',
              maxHeight: '90vh',
            }}
          >
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            {selectedTruck && (
              <>
                <Typography variant="h4" gutterBottom>
                  {selectedTruck.name}
                </Typography>
                <Typography variant="body1" style={{ marginBottom: '10px' }}>
                  {selectedTruck.description}
                </Typography>
                <Typography variant="body2" style={{ marginBottom: '10px' }}>
                  <b>Food Type:</b> {selectedTruck.foodType}
                </Typography>
                <Button variant="contained" color="primary" href={selectedTruck.menuLink} target="_blank">
                  View Menu
                </Button>
              </>
            )}
          </Box>
        </Modal>

      </Container>
    );
  }
};

export default FindFoodTruck;
