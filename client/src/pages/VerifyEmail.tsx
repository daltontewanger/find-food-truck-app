import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Container, Typography, Button } from '@mui/material';
import axios from 'axios';

const VerifyEmail: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/auth/verify-email/${token}`);
                if (response.status === 200) {
                    setVerificationStatus('success');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setVerificationStatus('failed');
            }
        };

        if (token) {
            verifyEmail();
        } else {
            setVerificationStatus('failed');
        }
    }, [token]);

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
                        The link may be invalid or expired. Please check your email and try again.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => navigate('/signup')}>
                        Go to Signup
                    </Button>
                </>
            )}
        </Container>
    );
};

export default VerifyEmail;
