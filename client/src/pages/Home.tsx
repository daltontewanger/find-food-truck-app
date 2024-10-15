import { Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <Container maxWidth="md" style={{ textAlign: 'center', marginTop: '50px' }}>
            <Typography variant="h2" gutterBottom>
                Welcome to Food Truck Finder
            </Typography>
            <Typography variant="body1" paragraph>
                Discover the best food trucks in San Diego. Whether you're craving tacos, vegan delights, or a variety of gourmet cuisines, we've got you covered!
            </Typography>
            <Button variant="contained" color="primary" component={Link} to="/find-food-truck">
                Find a Food Truck
            </Button>
            <Button variant="outlined" color="secondary" component={Link} to="/signup" style={{ marginLeft: '10px' }}>
                Sign Up as a Food Truck
            </Button>
        </Container>
    );
};

export default Home;
