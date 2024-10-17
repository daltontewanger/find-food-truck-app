const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FoodTruck = require('../models/FoodTruck');

exports.signup = async (req, res) => {
    try {
        const { username, password, role, emailVerified } = req.body;
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hashedPassword,
            role,
            emailVerified,
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
                verificationStatus: 'pending', // Default status for the food truck
                schedules: [],
            });
            await foodTruck.save();
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role, emailVerified: user.emailVerified, verificationStatus: user.verificationStatus }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, role: user.role, emailVerified: user.emailVerified });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};