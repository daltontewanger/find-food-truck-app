const express = require('express');
const router = express.Router();
const FoodTruck = require('../models/FoodTruck');

// Example route for signing up
router.post('/signup', async (req, res) => {
    const { username, password, role } = req.body;
    const user = new User({ username, password, role });
    await user.save();
    res.status(201).send(user);
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

module.exports = router;
