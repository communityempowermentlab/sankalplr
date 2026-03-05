const express = require('express');
const router = express.Router();
const labourController = require('../controllers/labourController');
const { protect } = require('../middleware/auth');

// POST route to add a new patient
router.post('/add-patient', protect, labourController.addPatient);

// PUT route to update an existing patient
router.put('/update-patient/:id', protect, labourController.updatePatient);

// GET route to list patients
router.get('/list', protect, labourController.getPatients);

module.exports = router;
