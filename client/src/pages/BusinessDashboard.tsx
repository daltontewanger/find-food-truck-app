import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Container, TextField, Button, Typography, Box, Modal, Chip } from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BusinessDashboard: React.FC = () => {
    const { userRole, emailVerified, getUserId } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [foodType, setFoodType] = useState('');
    const [menuLink, setMenuLink] = useState('');
    const [schedule, setSchedule] = useState([{ address: '', day: '', startTime: '', endTime: '' }]);
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState('');
    const [rejectionNote, setRejectionNote] = useState('');
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (userRole !== 'business' || !emailVerified) {
                alert('You must be a verified business to access your food truck information.');
                return;
            }

            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    alert('Authorization token not found');
                    return;
                }

                // Fetch user details (including verification status and rejection note)
                const userResponse = await axios.get('http://localhost:5000/api/auth/details', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (userResponse.status === 200) {
                    const { verificationStatus, rejectionNote } = userResponse.data;
                    setVerificationStatus(verificationStatus);
                    setRejectionNote(rejectionNote || '');
                }

                // Fetch food truck details
                const foodTruckResponse = await axios.get('http://localhost:5000/api/foodtruck/details', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (foodTruckResponse.status === 200) {
                    const { name, description, foodType, menuLink, schedules } = foodTruckResponse.data;
                    setName(name || '');
                    setDescription(description || '');
                    setFoodType(foodType || '');
                    setMenuLink(menuLink || '');
                    setSchedule(schedules.length > 0 ? schedules : [{ address: '', day: '', startTime: '', endTime: '' }]);
                }
            } catch (error) {
                console.error('Error fetching details:', error);
                alert('Failed to fetch details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [userRole, emailVerified]);

    const handleAddSchedule = () => {
        setSchedule([...schedule, { address: '', day: '', startTime: '', endTime: '' }]);
    };

    const handleScheduleChange = (index: number, field: string, value: string) => {
        const updatedSchedule = schedule.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setSchedule(updatedSchedule);
    };

    const handleSameAsAbove = (index: number) => {
        if (index > 0) {
            const prevItem = schedule[index - 1];
            const updatedSchedule = schedule.map((item, i) =>
                i === index ? { ...item, address: prevItem.address, startTime: prevItem.startTime, endTime: prevItem.endTime } : item
            );
            setSchedule(updatedSchedule);
        }
    };

    const handleDetailsSubmit = async () => {
        if (userRole !== 'business' || !emailVerified) {
            alert('You must have a verified email to update your food truck information.');
            return;
        }
    
        const userId = getUserId();
        if (!userId) {
            alert('User ID is missing. Please try logging in again.');
            return;
        }
    
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                'http://localhost:5000/api/foodtruck/update-details',
                {
                    userId, // Use the userId obtained from the getUserId function
                    name,
                    description,
                    foodType,
                    menuLink,
                    status: verificationStatus, // Send the current status to decide whether to change it
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200) {
                alert('Food truck details updated successfully!');
                if (verificationStatus === 'rejected') {
                    setVerificationStatus('pending'); // Update the status locally to pending after resubmission
                }
            }
        } catch (error) {
            console.error('Error updating food truck details:', error);
            alert('Failed to update food truck details. Please try again.');
        }
    };

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const getStatusChip = () => {
        switch (verificationStatus) {
            case 'verified':
                return <Chip label="Verified" color="success" />;
            case 'pending':
                return <Chip label="Pending" color="warning" />;
            case 'rejected':
                return <Chip label="Rejected" color="error" onClick={handleOpenModal} clickable />;
            default:
                return <Chip label="Unverified" color="warning" />;
        }
    };

    const handleScheduleSubmit = async () => {
        if (userRole !== 'business' || verificationStatus !== 'verified') {
            alert('You must be a fully verified business to update your schedule.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                'http://localhost:5000/api/foodtruck/update-schedule',
                {
                    schedule,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200) {
                alert('Schedule updated successfully!');
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
            alert('Failed to update schedule. Please try again.');
        }
    };

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom>
                    Business Dashboard
                </Typography>

                <Box mb={2}>
                    <Typography variant="h6">Verification Status:</Typography>
                    {getStatusChip()}
                </Box>

                <Typography variant="h6" gutterBottom>
                    Food Truck Details
                </Typography>
                <TextField
                    label="Food Truck Name"
                    variant="outlined"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ marginBottom: '20px' }}
                />
                <TextField
                    label="Description"
                    variant="outlined"
                    multiline
                    rows={4}
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ marginBottom: '20px' }}
                />
                <TextField
                    label="Food Type"
                    variant="outlined"
                    fullWidth
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    style={{ marginBottom: '20px' }}
                />
                <TextField
                    label="Menu Link"
                    variant="outlined"
                    fullWidth
                    value={menuLink}
                    onChange={(e) => setMenuLink(e.target.value)}
                    style={{ marginBottom: '20px' }}
                />
                <Button variant="contained" color="primary" onClick={handleDetailsSubmit} style={{ marginBottom: '40px', display: 'block' }}>
                    Update Details
                </Button>

                <Typography variant="h6" gutterBottom>
                    Schedule and Location
                </Typography>
                {schedule.map((item, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                        <TextField
                            label="Address"
                            variant="outlined"
                            fullWidth
                            value={item.address}
                            onChange={(e) => handleScheduleChange(index, 'address', e.target.value)}
                            style={{ marginBottom: '10px' }}
                        />
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <DatePicker
                                label="Date"
                                value={item.day ? dayjs(item.day) : null}
                                onChange={(newValue) => handleScheduleChange(index, 'day', newValue ? newValue.format('YYYY-MM-DD') : '')}
                                sx={{ flex: 1 }}
                            />
                            <TimePicker
                                label="Start Time"
                                value={item.startTime ? dayjs(item.startTime, 'HH:mm') : null}
                                onChange={(newValue) => handleScheduleChange(index, 'startTime', newValue ? newValue.format('HH:mm') : '')}
                                minutesStep={15}
                                sx={{ flex: 1 }}
                            />
                            <TimePicker
                                label="End Time"
                                value={item.endTime ? dayjs(item.endTime, 'HH:mm') : null}
                                onChange={(newValue) => handleScheduleChange(index, 'endTime', newValue ? newValue.format('HH:mm') : '')}
                                minutesStep={15}
                                sx={{ flex: 1 }}
                            />
                            {index > 0 && (
                                <Button variant="outlined" onClick={() => handleSameAsAbove(index)} sx={{ marginLeft: '10px' }}>
                                    Same as Above
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <Button variant="outlined" onClick={handleAddSchedule}>
                        Add Another Schedule
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleScheduleSubmit}>
                        Update Schedule
                    </Button>
                </div>

                <Modal
                    open={openModal}
                    onClose={handleCloseModal}
                    aria-labelledby="rejection-note-title"
                    aria-describedby="rejection-note-description"
                >
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                        <Typography id="rejection-note-title" variant="h6" component="h2">
                            Rejection Note
                        </Typography>
                        <Typography id="rejection-note-description" sx={{ mt: 2 }}>
                            {rejectionNote}
                        </Typography>
                        <Button onClick={handleCloseModal} sx={{ mt: 2 }}>
                            Close
                        </Button>
                    </Box>
                </Modal>
            </Container>
        </LocalizationProvider>
    );
};

export default BusinessDashboard;