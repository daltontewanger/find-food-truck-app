// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { getPendingBusinesses, verifyBusiness } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

// Route to get pending businesses for verification
router.get('/pending', authMiddleware, isAdmin, getPendingBusinesses);

// Route to verify a business (approve/deny)
router.post('/verify-business', authMiddleware, isAdmin, verifyBusiness);

module.exports = router;
