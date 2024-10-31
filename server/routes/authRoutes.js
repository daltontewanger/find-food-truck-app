const express = require('express');
const router = express.Router();
const { signup, login, verifyEmail, resendVerificationEmail } = require('../controllers/authController');
const { getUserProfile } = require('../controllers/userController.js')
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/resend-verification', resendVerificationEmail)
router.get('/verify-email/:token', verifyEmail);
router.get('/details', authMiddleware, getUserProfile);

module.exports = router;