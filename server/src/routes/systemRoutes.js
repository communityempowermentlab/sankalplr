const express = require('express');
const router = express.Router();
const { getSystemActivityLogs } = require('../controllers/systemController');
const { protect } = require('../middleware/auth');

// Admin and Staff view access
router.route('/').get(protect, getSystemActivityLogs);

module.exports = router;
