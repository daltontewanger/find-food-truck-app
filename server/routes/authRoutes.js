const express = require('express');
const router = express.Router();
const { signup, login, verifyEmail } = require('../controllers/authController');
const { getUserProfile } = require('../controllers/userController.js')
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.get('/details', authMiddleware, getUserProfile);

module.exports = router;