const express = require('express');
const router = express.Router();
const { verifyBusiness, getPendingBusinesses } = require('../controllers/adminController');
const isAdmin = require('../middleware/isAdmin');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/pending', authMiddleware, isAdmin, getPendingBusinesses);
router.post('/verify', authMiddleware, isAdmin, verifyBusiness);

module.exports = router;