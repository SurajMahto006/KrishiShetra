require('dotenv').config();
const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const testRoutes = require('./routes/test.routes');
const authRoutes = require('./routes/auth.routes');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);



// Root fallback route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to KrishiShetra API'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
