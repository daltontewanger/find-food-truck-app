const express = require('express');
const router = express.Router();
const { addFoodTruck, updateFoodTruck, getFoodTrucks } = require('../controllers/foodTruckController');
const { protect, admin } = require('../middleware/authMiddleware');

// Route to add a new food truck after business is verified
router.post('/add', protect, admin, addFoodTruck);

// Route to update existing food truck info
router.put('/update/:id', protect, updateFoodTruck);

// Route to get all food trucks to display on the map
router.get('/', getFoodTrucks);

module.exports = router;