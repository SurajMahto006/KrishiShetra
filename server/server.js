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
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

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

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, server-to-server, curl)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);

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
app.use('/api/offers', offerRoutes);
app.use('/api/test', testRoutes);



const path = require('path');

const rootDir = path.join(__dirname, '..');

// Serve root static files (HTML, CSS, JS, Assets)
app.use(express.static(rootDir));

// Support /KrishiShetra and /krishishetra path aliases so requests with folder prefix work seamlessly
app.use(['/KrishiShetra', '/krishishetra'], express.static(rootDir));

// Fallback for API health if accessed directly
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to KrishiShetra API'
  });
});

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
