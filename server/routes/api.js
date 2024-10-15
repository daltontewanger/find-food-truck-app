const express = require('express');
const router = express.Router();
const FoodTruck = require('../models/FoodTruck');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User Sign Up
router.post('/signup', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({ username, password: await bcrypt.hash(password, 10), role });

        // Save user to database
        await user.save();

        res.status(201).json({ message: 'User successfully registered' });
    } catch (error) {
        console.error('Sign-Up Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all food trucks
router.get('/food-trucks', async (req, res) => {
    try {
        const foodTrucks = await FoodTruck.find();
        res.json(foodTrucks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new food truck
router.post('/food-trucks', async (req, res) => {
    const foodTruck = new FoodTruck(req.body);
    try {
        const savedFoodTruck = await foodTruck.save();
        res.status(201).json(savedFoodTruck);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update Food Truck Location
router.post('/update-location', async (req, res) => {
    try {
        const { location, schedule } = req.body;
        // Assuming truck is authenticated and identified by its owner
        const foodTruck = await FoodTruck.findOneAndUpdate(
            { owner: req.user.id },
            { location, schedule },
            { new: true }
        );
        res.status(200).json(foodTruck);
    } catch (error) {
        res.status(500).json({ message: 'Unable to update food truck info' });
    }
});

module.exports = router;
