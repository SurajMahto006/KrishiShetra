/**
 * seedAdminDev.js
 *
 * Development-only seed script that creates (or resets) a demo administrator
 * account in the connected MongoDB database.
 *
 * SAFETY RULES:
 *  1. Exits immediately if NODE_ENV === 'production'.
 *  2. Never stores plain-text passwords - password hashing is delegated to
 *     the existing User model pre('save') bcryptjs hook (salt rounds: 10).
 *  3. Never touches production data.  Only the single demo admin doc is
 *     written; all other collections are left untouched.
 *  4. Credentials are supplied via environment variables so they are never
 *     committed to source control.
 *
 * Usage:
 *   npm run seed:admin          (uses DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASS from .env)
 */

'use strict';

require('dotenv').config();

// Guard: refuse to run in production
const env = (process.env.NODE_ENV || 'development').toLowerCase();
if (env === 'production') {
  console.error('\n[seedAdminDev] ABORTED - this script must not run in production.\n');
  process.exit(1);
}

const mongoose = require('mongoose');
const User = require('./models/User');

const DEMO_EMAIL    = (process.env.DEMO_ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
const DEMO_PASSWORD = process.env.DEMO_ADMIN_PASS   || 'DemoAdmin!2026';
const DEMO_NAME     = 'Demo Admin';
const DEMO_ROLE     = 'admin';

async function seedAdminDev() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('your_mongodb_connection_string')) {
    console.error('MONGODB_URI is not configured. Set it in .env and retry.');
    process.exit(1);
  }

  console.log('KrishiShetra - Dev Admin Seed [env: ' + env + ']');

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB.');

  const existing = await User.findOne({ email: DEMO_EMAIL });

  if (existing) {
    existing.name          = DEMO_NAME;
    existing.role          = DEMO_ROLE;
    existing.emailVerified = true;
    existing.password      = DEMO_PASSWORD;
    await existing.save();
    console.log('Updated existing admin account: ' + DEMO_EMAIL + ' (ID: ' + existing._id + ')');
  } else {
    const created = await User.create({
      name:          DEMO_NAME,
      email:         DEMO_EMAIL,
      password:      DEMO_PASSWORD,
      role:          DEMO_ROLE,
      phone:         '',
      location:      'Local Development',
      emailVerified: true
    });
    console.log('Created demo admin account: ' + DEMO_EMAIL + ' (ID: ' + created._id + ')');
  }

  console.log('');
  console.log('Admin Portal : http://localhost:5000/admin');
  console.log('Email        : ' + DEMO_EMAIL);
  console.log('Password     : (set via DEMO_ADMIN_PASS in .env, default: DemoAdmin!2026)');
  console.log('');
  console.log('WARNING: This account is for LOCAL DEVELOPMENT ONLY.');

  await mongoose.disconnect();
  process.exit(0);
}

seedAdminDev().catch(err => {
  console.error('Seed failed:', err.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
