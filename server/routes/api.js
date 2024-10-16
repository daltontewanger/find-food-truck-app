const express = require('express');
const router = express.Router();
const FoodTruck = require('../models/FoodTruck');
const { signup, login } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminRoutes = require('./admin');

// User Sign-Up Route
router.post('/signup', signup);

// User Login Route
router.post('/login', login);

// Admin Routes
router.use('/admin', authMiddleware, adminRoutes);

///////
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
