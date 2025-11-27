const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route - anyone can login
router.post('/login', login);

// Protected routes - require authentication
router.get('/me', protect, getMe);

// Admin only - only Admin can create new users
router.post('/register', protect, authorize('Admin'), register);

module.exports = router;
