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
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user based on the decoded payload
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(400).json({ message: 'Invalid token or user does not exist.' });
        }

        // Check if the email is already verified
        if (user.emailVerified) {
            return res.status(200).json({ message: 'Email is already verified.' });
        }

        // Update user email verification status
        user.emailVerified = true;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            console.error('Invalid token:', error.message);
            return res.status(400).json({ message: 'Invalid token. Please request a new verification link.' });
        }
        if (error.name === 'TokenExpiredError') {
            console.error('Expired token:', error.message);
            return res.status(400).json({ message: 'Verification link expired. Please request a new verification link.' });
        }
        
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
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, role: user.role, emailVerified: user.emailVerified });
    } catch (error) {
        console.error('Login error:', error.message || error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};
