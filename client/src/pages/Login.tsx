import { useState } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errorMessage, setErrorMessage] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                'http://localhost:5000/api/auth/login',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                const { token, role, emailVerified } = response.data;

                login(token, role, emailVerified); // Save the JWT to localStorage
                alert('Login successful!');
                // Navigate based on user role
                if (role === 'user') {
                    navigate('/find-food-truck');
                } else if (role === 'business') {
                    navigate('/business-dashboard');
                } else if (role === 'admin') {
                    navigate('/admin-dashboard');
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Axios error response:', error.response.data);
            } else {
                console.error('Error during login:', error);
            }

            setErrorMessage('Invalid email or password. Please try again.');
        }
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '50px' }}>
            <Typography variant="h4" gutterBottom>
                Login
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    required
                    type="email"
                />
                <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    required
                />
                {errorMessage && <Typography color="error">{errorMessage}</Typography>}
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Login
                </Button>
            </form>
        </Container>
    );
};

export default Login;
