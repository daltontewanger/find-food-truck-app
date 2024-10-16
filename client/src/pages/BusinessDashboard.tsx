import { useState } from 'react';
import { Container, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
import Loader from '../components/Loader';

const BusinessDashboard = () => {
    const [location, setLocation] = useState('');
    const [schedule, setSchedule] = useState('');
    const [menuLink, setMenuLink] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/update-location', { location, schedule, menuLink });
            console.log(response.data);
            alert('Successfully updated!');
        } catch (error) {
            console.error(error);
            alert('Failed to update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h5">Business Dashboard</Typography>
            <TextField
                label="Location"
                fullWidth
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                margin="normal"
            />
            <TextField
                label="Schedule"
                fullWidth
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                margin="normal"
            />
            <TextField
                label="Menu Link"
                fullWidth
                value={menuLink}
                onChange={(e) => setMenuLink(e.target.value)}
                margin="normal"
            />
            {loading ? (
                <Loader />
            ) : (
                <Button variant="contained" color="primary" onClick={handleUpdate}>
                    Update Location, Schedule, and Menu Link
                </Button>
            )}
        </Container>
    );
};

export default BusinessDashboard;