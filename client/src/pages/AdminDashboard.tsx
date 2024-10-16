// Under Construction

import { SetStateAction, useEffect, useState } from 'react';
import { Container, Button, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import axios from 'axios';

const AdminDashboard = () => {
    const [pendingBusinesses, setPendingBusinesses] = useState<any[]>([]);
    const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const response = await axios.get('/api/admin/pending');
                setPendingBusinesses(response.data);
            } catch (error) {
                console.error('Error fetching pending businesses', error);
            }
        };

        fetchPending();
    }, []);

    const handleApprove = async (id: any) => {
        try {
            await axios.post('/api/admin/verify-business', { userId: id, action: 'approve' });
            setPendingBusinesses((prev) => prev.filter((business) => business._id !== id));
            alert('Business approved');
        } catch (error) {
            console.error('Error approving business', error);
        }
    };

    const handleDeny = async (id: any) => {
        try {
            await axios.post('/api/admin/verify-business', { userId: id, action: 'deny' });
            setPendingBusinesses((prev) => prev.filter((business) => business._id !== id));
            alert('Business denied');
        } catch (error) {
            console.error('Error denying business', error);
        }
    };

    const handleOpenDialog = (business: SetStateAction<null>) => {
        setSelectedBusiness(business);
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setSelectedBusiness(null);
    };

    return (
        <Container>
            <Typography variant="h4">Admin Dashboard</Typography>
            {pendingBusinesses.map((business) => (
                <div key={business._id}>
                    <Typography>{business.name}</Typography>
                    <Button variant="contained" color="primary" onClick={() => handleApprove(business._id)}>
                        Approve
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => handleOpenDialog(business)}>
                        Deny
                    </Button>
                </div>
            ))}
            <Dialog
                open={open}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Deny Business Application"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to deny the application for {selectedBusiness?.name}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => handleDeny(selectedBusiness?._id)} color="secondary" autoFocus>
                        Deny
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard;
