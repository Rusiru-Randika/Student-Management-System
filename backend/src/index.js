require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const { logRequests } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logRequests);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
