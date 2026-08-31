require('dotenv').config();
const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const testRoutes = require('./routes/test.routes');
const authRoutes = require('./routes/auth.routes');
const farmerRoutes = require('./routes/farmer.routes');
const buyerRoutes = require('./routes/buyer.routes');
const { marketRouter: buyerMarketRoutes, savedLotsRouter: buyerSavedLotsRoutes } = require('./routes/buyer.market.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const lotRoutes = require('./routes/lot.routes');
const marketRoutes = require('./routes/market.routes');
const offerRoutes = require('./routes/offer.routes');
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
app.use('/api/farmer', farmerRoutes);
app.use('/api/buyer/market', buyerMarketRoutes);
app.use('/api/buyer/saved-lots', buyerSavedLotsRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/offers', offerRoutes);
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
