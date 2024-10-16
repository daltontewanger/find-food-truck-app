const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Handle user sign-up
exports.signup = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ username, password: await bcrypt.hash(password, 10), role });
        await user.save();

        res.status(201).json({ message: 'User successfully registered' });
    } catch (error) {
        console.error('Sign-Up Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Handle user login
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({ token, role: user.role, emailVerified: user.emailVerified });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};