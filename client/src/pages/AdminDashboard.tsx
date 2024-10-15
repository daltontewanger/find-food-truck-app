import { useEffect, useState } from 'react';
import { Container, Button, Typography } from '@mui/material';
import axios from 'axios';

const AdminDashboard = () => {
    const [pendingBusinesses, setPendingBusinesses] = useState([]);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const response = await axios.get('/api/admin/pending');
                setPendingBusinesses(response.data);
            } catch (error) {
                console.error('Error fetching pending approvals', error);
            }
        };

        fetchPending();
    }, []);

    const handleApprove = async (id) => {
        // Logic to approve business signup
    };

    return (
        <Container>
            <Typography variant="h4">Admin Dashboard</Typography>
            {pendingBusinesses.map((business) => (
                <div key={business._id}>
                    <Typography>{business.name}</Typography>
                    <Button onClick={() => handleApprove(business._id)}>Approve</Button>
                </div>
            ))}
        </Container>
    );
};

export default AdminDashboard;
