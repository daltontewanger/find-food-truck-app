const express = require('express');
const router = express.Router();
const { updateDetails, updateSchedule, getFoodTrucks, getFoodTruckDetails, getOpenFoodTrucks } = require('../controllers/foodTruckController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getFoodTrucks);
router.get('/open', getOpenFoodTrucks);
router.post('/update-details', authMiddleware, updateDetails);
router.post('/update-schedule', authMiddleware, updateSchedule);
router.get('/details', authMiddleware, getFoodTruckDetails);

module.exports = router;