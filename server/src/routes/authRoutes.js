const express = require('express');
const router = express.Router();
const { loginUser, registerUser, logoutUser, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/logout', protect, logoutUser);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;
