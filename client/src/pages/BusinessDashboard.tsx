import { useState } from 'react';
import { Container, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';

const BusinessDashboard = () => {
    const [location, setLocation] = useState('');
    const [schedule, setSchedule] = useState('');

    const handleUpdate = async () => {
        try {
            const response = await axios.post('/api/update-location', { location, schedule });
            console.log(response.data);
            alert('Successfully updated!');
        } catch (error) {
            console.error(error);
            alert('Failed to update');
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
            <Button variant="contained" color="primary" onClick={handleUpdate}>
                Update Location and Schedule
            </Button>
        </Container>
    );
};

export default BusinessDashboard;
