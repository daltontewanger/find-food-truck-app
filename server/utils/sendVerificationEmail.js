require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

// Set credentials with refresh token
if (process.env.REFRESH_TOKEN) {
    console.log('Setting Refresh Token:', process.env.REFRESH_TOKEN); // Debug log for refresh token
    oAuth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
    });
} else {
    console.error('No REFRESH_TOKEN found in environment variables.');
}

const sendVerificationEmail = async (email, token) => {
    try {
        console.log('Attempting to get access token...');
        
        // Get access token using the refresh token
        const accessTokenResponse = await oAuth2Client.getAccessToken();
        const accessToken = accessTokenResponse?.token;

        if (!accessToken) {
            throw new Error('Failed to obtain access token. Make sure the refresh token is valid.');
        }

        // Create transporter with OAuth2 authentication
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        // Verification email details
        const verificationUrl = `${process.env.CLIENT_ORIGIN}/verify-email/${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email Address',
            html: `<p>Thank you for signing up. Please verify your email by clicking the link below:</p><p><a href="${verificationUrl}">Verify Email</a></p>`,
        };

        // Send the verification email
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully to:', email);
    } catch (error) {
        console.error('Error sending verification email:', error.message || error);
        throw new Error('Could not send verification email');
    }
};

module.exports = sendVerificationEmail;