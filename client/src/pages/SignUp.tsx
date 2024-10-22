import { useState } from 'react';
import { Container, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Alert } from '@mui/material';
import axios from 'axios';

const SignUp = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'user', // default role is 'user'
    });

    const [errorMessage, setErrorMessage] = useState('');

    const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name as string]: value,
        }));
    };

    const isEmailValid = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password || !formData.role) {
            setErrorMessage('All fields are required.');
            return;
        }

        if (!isEmailValid(formData.email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/signup', formData);
            if (response.status === 201) {
                alert('User successfully registered! Please check your email to verify your account.');
                setFormData({ email: '', password: '', role: 'user' }); // Reset form
                setErrorMessage('');
            }
        } catch (error: any) {
            console.error('Error during sign-up:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to register user. Please try again.');
        }
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '50px' }}>
            <Typography variant="h4" gutterBottom>
                Sign Up
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleTextFieldChange}
                    margin="normal"
                    variant="outlined"
                    required
                />
                <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleTextFieldChange}
                    margin="normal"
                    variant="outlined"
                    required
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                        labelId="role-label"
                        name="role"
                        value={formData.role}
                        onChange={handleSelectChange}
                    >
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="business">Business</MenuItem>
                    </Select>
                </FormControl>
                {errorMessage && (
                    <Alert severity="error" style={{ marginBottom: '20px' }}>
                        {errorMessage}
                    </Alert>
                )}
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Sign Up
                </Button>
            </form>
        </Container>
    );
};

export default SignUp;