import { useEffect, useState } from 'react';
import { Container, Button, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import axios from 'axios';

const AdminDashboard = () => {
    const [pendingBusinesses, setPendingBusinesses] = useState<any[]>([]);
    const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
    const [open, setOpen] = useState(false);
    const [rejectionNote, setRejectionNote] = useState('');

    // Utility function to retrieve token
    const getAuthToken = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No auth token found.');
            return null;
        }
        return token;
    };

    useEffect(() => {
        const fetchPending = async () => {
            const token = getAuthToken();
            if (!token) {
                console.error('No token found. Cannot fetch pending businesses.');
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/admin/pending', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (Array.isArray(response.data)) {
                    setPendingBusinesses(response.data);
                } else {
                    console.error('Unexpected response format', response.data);
                    setPendingBusinesses([]);
                }
            } catch (error) {
                console.error('Error fetching pending businesses', error);
                setPendingBusinesses([]);
            }
        };

        fetchPending();
    }, []);

    const handleApprove = async (id: any) => {
        const token = getAuthToken();
        if (!token) {
            console.error('No token found. Cannot approve business.');
            return;
        }

        try {
            await axios.post(
                'http://localhost:5000/api/admin/verify',
                { businessId: id, action: 'approve' },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setPendingBusinesses((prev) => prev.filter((business) => business._id !== id));
            alert('Business approved');
        } catch (error) {
            console.error('Error approving business', error);
        }
    };

    const handleDeny = async (id: any) => {
        const token = getAuthToken();
        if (!token) {
            console.error('No token found. Cannot deny business.');
            return;
        }

        try {
            await axios.post(
                'http://localhost:5000/api/admin/reject',
                { businessId: id, action: 'deny', note: rejectionNote },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setPendingBusinesses((prev) => prev.filter((business) => business._id !== id));
            alert('Business denied');
        } catch (error) {
            console.error('Error denying business', error);
        }
    };

    const handleOpenDialog = (business: any) => {
        setSelectedBusiness(business);
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setSelectedBusiness(null);
        setRejectionNote('');
    };

    return (
        <Container>
            <Typography variant="h4">Admin Dashboard</Typography>
            {pendingBusinesses.map((business) => (
                <div key={business.email}>
                    <Typography>{business.email}</Typography>
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
                    <TextField
                        label="Rejection Note"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectionNote}
                        onChange={(e) => setRejectionNote(e.target.value)}
                        style={{ marginTop: '20px' }}
                    />
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
