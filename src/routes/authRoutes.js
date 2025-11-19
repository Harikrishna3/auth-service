const express = require('express');
const router = express.Router();
const { signup, signin, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateSignup,
  validateSignin,
  handleValidationErrors,
} = require('../middleware/validate');

router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/signin', validateSignin, handleValidationErrors, signin);
router.get('/profile', protect, getProfile);

module.exports = router;
