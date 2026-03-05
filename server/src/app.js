const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const labourRoutes = require('./routes/labourRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const systemRoutes = require('./routes/systemRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/system-activity', systemRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('SankalpLR API is running');
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
