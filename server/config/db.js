const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('your_mongodb_connection_string') || process.env.MONGODB_URI.trim() === '') {
    console.warn('⚠️ MongoDB warning: MONGODB_URI is unconfigured in .env. (Frontend developer testing mode will still work)');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB connection failed: ${error.message}. (Server continuing in offline dev mode)`);
  }
};

module.exports = connectDB;
