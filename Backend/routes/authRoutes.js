const express = require('express');
const router = express.Router();
const { signup, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes — no token needed
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Private route — token required
router.get('/me', protect, getMe);

module.exports = router;