const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// GET route to fetch dashboard stats
router.get('/stats', protect, dashboardController.getStats);

module.exports = router;
