const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FoodTruck = require('../models/FoodTruck');
const sendVerificationEmail = require('../utils/sendVerificationEmail');

exports.signup = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
            role,
            emailVerified: false,
            verificationStatus: role === 'business' ? 'pending' : 'verified',
            emailVerificationExpiry: Date.now() + 12 * 60 * 60 * 1000, // 12 hours from now
        });
        await user.save();

        // If the user is a business, create an associated FoodTruck document
        if (role === 'business') {
            const foodTruck = new FoodTruck({
                owner: user._id,
                name: '',
                description: '',
                foodType: [],
                menuLink: '',
                schedules: [],
            });
            await foodTruck.save();
        }

        // Send verification email
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
        await sendVerificationEmail(user.email, token);

        res.status(201).json({ message: 'User created successfully. Please check your email for verification.' });
    } catch (error) {
        console.error('Signup error:', error.message || error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Check if token exists
        if (!token) {
            return res.status(400).json({ message: 'Invalid or missing token.' });
        }

        // Verify the token and decode the payload
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                console.error('Expired token:', error.message);
                return res.status(400).json({ message: 'Verification link expired. Please request a new verification link.' });
            }
            if (error.name === 'JsonWebTokenError') {
                console.error('Invalid token:', error.message);
                return res.status(400).json({ message: 'Invalid token. Please request a new verification link.' });
            }
            throw error; // Re-throw any other error
        }

        // Find user based on the decoded payload
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: 'Invalid token or user does not exist.' });
        }

        // Check if the email verification token has expired in the database
        if (user.emailVerificationExpiry && Date.now() > user.emailVerificationExpiry) {
            return res.status(400).json({ message: 'Verification link has expired. Please request a new one.' });
        }

        // Check if the email is already verified
        if (user.emailVerified) {
            return res.status(200).json({ message: 'Email is already verified.' });
        }

        // Update user email verification status
        user.emailVerified = true;
        user.emailVerificationToken = undefined; // Clear the token
        user.emailVerificationExpiry = undefined; // Clear the expiry
        await user.save();

        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
        console.error('Email verification error:', error.message || error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials. Please try again.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials. Please try again.' });
        }

        if (!user.emailVerified) {
            return res.status(403).json({ message: 'Please verify your email to log in.' });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
                emailVerified: user.emailVerified,
                verificationStatus: user.verificationStatus,
            },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        res.status(200).json({ token, role: user.role, emailVerified: user.emailVerified });
    } catch (error) {
        console.error('Login error:', error.message || error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};

exports.resendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email, emailVerified: false });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or email already verified.' });
        }

        // Generate a new token and expiry time
        const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
        user.emailVerificationToken = newToken;
        user.emailVerificationExpiry = Date.now() + 12 * 60 * 60 * 1000; // 12 hours from now

        await user.save();

        // Send the new verification email
        await sendVerificationEmail(user.email, newToken);

        res.status(200).json({ message: 'Verification email has been resent.' });
    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

