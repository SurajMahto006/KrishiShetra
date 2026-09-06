const path = require('path');
// Ensure environment variables are loaded regardless of execution working directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
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
const orderRoutes = require('./routes/order.routes');
const transportRoutes = require('./routes/transport.routes');
const notificationRoutes = require('./routes/notification.routes');
const activityRoutes = require('./routes/activity.routes');
const lotRoutes = require('./routes/lot.routes');
const marketRoutes = require('./routes/market.routes');
const offerRoutes = require('./routes/offer.routes');
const storageRoutes = require('./routes/storage.routes');
const decisionRoutes = require('./routes/decision.routes');
const disputeRoutes = require('./routes/dispute.routes');
const connectDB = require('./config/db');
const { seedInitialFacilities } = require('./controllers/storage.controller');
const { apiNotFoundHandler, apiErrorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB & Seed initial storage facilities
connectDB().then(() => {
  seedInitialFacilities();
}).catch(() => {
  seedInitialFacilities();
});

// Dynamic Production & Development CORS Configuration
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://localhost:8080',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:3000'
];

if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/+$/, '')).filter(Boolean);
  allowedOrigins.push(...envOrigins);
}

if (process.env.RENDER_EXTERNAL_URL) {
  allowedOrigins.push(process.env.RENDER_EXTERNAL_URL.trim().replace(/\/+$/, ''));
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, server-to-server, curl)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
      /^https?:\/\/[^/]+\.onrender\.com$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked request from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/buyer/market', buyerMarketRoutes);
app.use('/api/buyer/saved-lots', buyerSavedLotsRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/market', marketRoutes);
app.get('/api/mandi-prices', require('./controllers/market.controller').getMandiPrices);
app.use('/api/offers', offerRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/decision', decisionRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/test', testRoutes);

// Fallback for API health if accessed directly
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to KrishiShetra API'
  });
});

// 404 Catch-all for any undefined /api routes
app.all('/api/*', apiNotFoundHandler);

const frontendDir = path.join(__dirname, '..', 'frontend');

// Serve the entire frontend directory as static files (HTML, CSS, JS, Assets, etc.)
app.use(express.static(frontendDir, { extensions: ['html'] }));

// Explicitly serve frontend/index.html for GET /
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Support /KrishiShetra and /krishishetra path aliases so requests with folder prefix work seamlessly
app.use(['/KrishiShetra', '/krishishetra'], express.static(frontendDir, { extensions: ['html'] }));

// Centralized error handling middleware for all routes (must be 4 parameters)
app.use(apiErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Safe Email Service configuration check
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY.trim() === '' || process.env.BREVO_API_KEY === 'your_brevo_api_key') {
    console.warn('⚠️ Email service configuration warning: BREVO_API_KEY is missing or unconfigured in .env');
  } else if (!process.env.EMAIL_FROM || process.env.EMAIL_FROM.trim() === '' || process.env.EMAIL_FROM === 'your_verified_sender@example.com') {
    console.warn('⚠️ Email service configuration warning: EMAIL_FROM is missing or unconfigured in .env');
  } else {
    console.log('✓ Brevo Transactional Email Service configured');
  }
});

module.exports = app;
