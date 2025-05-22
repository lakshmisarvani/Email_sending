const express = require('express');
const router = express.Router();

const {
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

// @route   POST /api/auth/signup
router.post('/signup', signup);

// @route   GET /api/auth/verify/:token
router.get('/verify/:token', verifyEmail);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/reset-password/:token
router.post('/reset-password/:token', resetPassword);

module.exports = router;
