import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Container, Typography, Button, TextField } from '@mui/material';
import axios from 'axios';

const VerifyEmail: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed' | 'expired'>('loading');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/auth/verify-email/${token}`);
                if (response.status === 200) {
                    setVerificationStatus('success');
                }
            } catch (error: any) {
                console.error('Verification error:', error);
                if (error.response && error.response.data.message === 'Verification link has expired. Please request a new one.') {
                    setVerificationStatus('expired');
                } else {
                    setVerificationStatus('failed');
                }
            }
        };

        if (token) {
            verifyEmail();
        } else {
            setVerificationStatus('failed');
        }
    }, [token]);

    const handleResendVerificationEmail = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/resend-verification', { email });
            if (response.status === 200) {
                alert('A new verification email has been sent to your email address. Please check your inbox.');
            }
        } catch (error) {
            console.error('Error resending verification email:', error);
            alert('Failed to resend verification email. Please check the email address and try again.');
        }
    };


    return (
        <Container maxWidth="sm" style={{ marginTop: '50px', textAlign: 'center' }}>
            {verificationStatus === 'loading' && (
                <>
                    <CircularProgress />
                    <Typography variant="h6" style={{ marginTop: '20px' }}>
                        Verifying your email, please wait...
                    </Typography>
                </>
            )}

            {verificationStatus === 'success' && (
                <>
                    <Typography variant="h4" gutterBottom>
                        Email Verified Successfully!
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '20px' }}>
                        Thank you for verifying your email. You can now log in.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
                        Go to Login
                    </Button>
                </>
            )}

            {verificationStatus === 'failed' && (
                <>
                    <Typography variant="h4" gutterBottom color="error">
                        Verification Failed
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '20px' }}>
                        The link may be invalid. Please check your email and try again.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => navigate('/signup')}>
                        Go to Signup
                    </Button>
                </>
            )}

            {verificationStatus === 'expired' && (
                <>
                    <Typography variant="h4" gutterBottom color="error">
                        Verification Link Expired
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '20px' }}>
                        The verification link has expired. Please enter your email address below to receive a new verification link.
                    </Typography>
                    <TextField
                        label="Email Address"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />
                    <Button variant="contained" color="primary" onClick={handleResendVerificationEmail} style={{ marginBottom: '20px' }}>
                        Resend Verification Email
                    </Button>
                </>
            )}
        </Container>
    );
};

export default VerifyEmail;
