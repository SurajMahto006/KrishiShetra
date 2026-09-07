/**
 * KRISHISHETRA — DEMO MANDI DATA SEEDER
 * 
 * Seeds 8 real Maharashtra Mandis with authentic coordinates and expense configurations.
 * Seeds 90 days of continuous historical price series for 5 major crops:
 * Onion, Tomato, Soybean, Wheat, Potato.
 * 
 * IMPORTANT: All records are clearly marked with `isDemo: true` to adhere to the
 * strict rule: "Never claim sample/demo data is live market data."
 */

'use strict';

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Mandi = require('../models/Mandi');
const MandiPrice = require('../models/MandiPrice');

const MANDI_DATA = [
  {
    name: 'Pune APMC (Gultekdi)',
    district: 'Pune',
    state: 'Maharashtra',
    latitude: 18.4975,
    longitude: 73.8682,
    expenseConfig: {
      commissionRate: 0.02,
      commissionType: 'percentage',
      fixedMandiCharge: 250,
      transportRate: 60,
      transportRateType: 'per_km_per_trip',
      labourRate: 500,
      labourRateType: 'per_worker_day',
      defaultLabourWorkers: 4,
      defaultLabourDays: 1,
      loadingRate: 20,
      loadingRateType: 'per_quintal',
      unloadingRate: 15,
      unloadingRateType: 'per_quintal'
    },
    isDemo: true
  },
  {
    name: 'Nashik APMC (Dindori Road)',
    district: 'Nashik',
    state: 'Maharashtra',
    latitude: 20.0110,
    longitude: 73.7903,
    expenseConfig: {
      commissionRate: 0.02,
      commissionType: 'percentage',
      fixedMandiCharge: 200,
      transportRate: 60,
      transportRateType: 'per_km_per_trip',
      labourRate: 450,
      labourRateType: 'per_worker_day',
      defaultLabourWorkers: 4,
      defaultLabourDays: 1,
      loadingRate: 18,
      loadingRateType: 'per_quintal',
      unloadingRate: 15,
      unloadingRateType: 'per_quintal'
    },
    isDemo: true
  },
  {
    name: 'Lasalgaon APMC (Asia\'s Onion Hub)',
    district: 'Nashik',
    state: 'Maharashtra',
    latitude: 20.1472,
    longitude: 74.2286,
    expenseConfig: {
      commissionRate: 0.025,
      commissionType: 'percentage',
      fixedMandiCharge: 300,
      transportRate: 65,
      transportRateType: 'per_km_per_trip',
      labourRate: 500,
      labourRateType: 'per_worker_day',
      defaultLabourWorkers: 4,
      defaultLabourDays: 1,
      loadingRate: 22,
      loadingRateType: 'per_quintal',
      unloadingRate: 18,
      unloadingRateType: 'per_quintal'
    },
    isDemo: true
  },
  {
    name: 'Kolhapur APMC (Market Yard)',
    district: 'Kolhapur',
    state: 'Maharashtra',
    latitude: 16.7050,
    longitude: 74.2433,
    expenseConfig: {
      commissionRate: 0.02,
      commissionType: 'percentage',
      fixedMandiCharge: 180,
      transportRate: 58,
      transportRateType: 'per_km_per_trip',
      labourRate: 480,
      labourRateType: 'per_worker_day',
      defaultLabourWorkers: 4,
      defaultLabourDays: 1,
      loadingRate: 18,
      loadingRateType: 'per_quintal',
      unloadingRate: 14,
      unloadingRateType: 'per_quintal'
    },
    isDemo: true
  },
  {
    name: 'Nagpur Kalamna APMC',
    district: 'Nagpur',
    state: 'Maharashtra',
    latitude: 21.1632,
    longitude: 79.1412,
    expenseConfig: {
      commissionRate: 0.02,
      commissionType: 'percentage',
      fixedMandiCharge: 350,
      transportRate: 65,
      transportRateType: 'per_km_per_trip',
      labourRate: 500,
      labourRateType: 'per_worker_day',
      defaultLabourWorkers: 4,
      defaultLabourDays: 1,
      loadingRate: 25,
      loadingRateType: 'per_quintal',
      unloadingRate: 20,
      unloadingRateType: 'per_quintal'
    },
    isDemo: true
  },
  {
    name: 'Solapur APMC (Siddheshwar)',
    district: 'Solapur',
    state: 'Maharashtra',
    latitude: 17.6599,
    longitude: 75.9064,
    expenseConfig: {
      commissionRate: 0.02,
      commissionType: 'percentage',
      fixedMandiCharge: 150,
      transportRate: 55,
      transportRateType: 'per_km_per_trip',
      labourRate: 450,
      labourRateType: 'per_worker_day',
      defaultLabourWorkers: 4,
      defaultLabourDays: 1,
      loadingRate: 18,
      loadingRateType: 'per_quintal',
      unloadingRate: 14,
      unloadingRateType: 'per_quintal'
    },
    isDemo: true
  },
  {
    name: 'Chhatrapati Sambhajinagar APMC',
    district: 'Aurangabad',
    state: 'Maharashtra',
    latitude: 19.8762,
    longitude: 75.3433,
    expenseConfig: {
      commissionRate: 0.02,
      commissionType: 'percentage',
      fixedMandiCharge: 200,
      transportRate: 60,
      transportRateType: 'per_km_per_trip',
      labourRate: 460,
      labourRateType: 'per_worker_day',
      defaultLabourWorkers: 4,
      defaultLabourDays: 1,
      loadingRate: 20,
      loadingRateType: 'per_quintal',
      unloadingRate: 15,
      unloadingRateType: 'per_quintal'
    },
    isDemo: true
  },
  {
    name: 'Mumbai Vashi APMC',
    district: 'Thane',
    state: 'Maharashtra',
    latitude: 19.0760,
    longitude: 72.9977,
    expenseConfig: {
      commissionRate: 0.03,
      commissionType: 'percentage',
      fixedMandiCharge: 500,
      transportRate: 75,
      transportRateType: 'per_km_per_trip',
      labourRate: 650,
      labourRateType: 'per_worker_day',
      defaultLabourWorkers: 4,
      defaultLabourDays: 1,
      loadingRate: 30,
      loadingRateType: 'per_quintal',
      unloadingRate: 25,
      unloadingRateType: 'per_quintal'
    },
    isDemo: true
  }
];

// Baseline price profiles per crop and geographic tier (₹/quintal)
const CROP_BASE_PRICES = {
  onion: {
    base: 3200,
    variance: 450,
    mandiMultipliers: {
      'Lasalgaon APMC (Asia\'s Onion Hub)': 1.10,
      'Mumbai Vashi APMC': 1.15,
      'Nashik APMC (Dindori Road)': 1.05,
      'Pune APMC (Gultekdi)': 1.02,
      'Solapur APMC (Siddheshwar)': 0.96,
      'Chhatrapati Sambhajinagar APMC': 0.98,
      'Kolhapur APMC (Market Yard)': 0.97,
      'Nagpur Kalamna APMC': 1.04
    }
  },
  tomato: {
    base: 2400,
    variance: 500,
    mandiMultipliers: {
      'Mumbai Vashi APMC': 1.20,
      'Pune APMC (Gultekdi)': 1.08,
      'Nashik APMC (Dindori Road)': 1.05,
      'Lasalgaon APMC (Asia\'s Onion Hub)': 0.98,
      'Kolhapur APMC (Market Yard)': 1.02,
      'Nagpur Kalamna APMC': 1.06,
      'Solapur APMC (Siddheshwar)': 0.94,
      'Chhatrapati Sambhajinagar APMC': 0.97
    }
  },
  soybean: {
    base: 4600,
    variance: 300,
    mandiMultipliers: {
      'Nagpur Kalamna APMC': 1.08,
      'Chhatrapati Sambhajinagar APMC': 1.05,
      'Solapur APMC (Siddheshwar)': 1.03,
      'Pune APMC (Gultekdi)': 1.01,
      'Kolhapur APMC (Market Yard)': 0.99,
      'Nashik APMC (Dindori Road)': 0.98,
      'Lasalgaon APMC (Asia\'s Onion Hub)': 0.97,
      'Mumbai Vashi APMC': 1.04
    }
  },
  wheat: {
    base: 2650,
    variance: 200,
    mandiMultipliers: {
      'Mumbai Vashi APMC': 1.12,
      'Pune APMC (Gultekdi)': 1.04,
      'Nagpur Kalamna APMC': 1.03,
      'Chhatrapati Sambhajinagar APMC': 1.01,
      'Nashik APMC (Dindori Road)': 1.00,
      'Solapur APMC (Siddheshwar)': 0.97,
      'Kolhapur APMC (Market Yard)': 0.98,
      'Lasalgaon APMC (Asia\'s Onion Hub)': 0.99
    }
  },
  potato: {
    base: 1850,
    variance: 250,
    mandiMultipliers: {
      'Mumbai Vashi APMC': 1.18,
      'Pune APMC (Gultekdi)': 1.06,
      'Nagpur Kalamna APMC': 1.05,
      'Nashik APMC (Dindori Road)': 1.02,
      'Kolhapur APMC (Market Yard)': 1.01,
      'Chhatrapati Sambhajinagar APMC': 0.98,
      'Solapur APMC (Siddheshwar)': 0.96,
      'Lasalgaon APMC (Asia\'s Onion Hub)': 0.97
    }
  }
};

/**
 * Generate 90-day time series price curves
 */
function generatePriceSeries(basePrice, variance, multiplier, days = 90) {
  const series = [];
  const now = new Date();
  
  // Seed a random walk trend with seasonal wave
  let current = basePrice * multiplier;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    // Sinusoidal seasonal wave + slight random walk
    const cycle = Math.sin((days - i) / 12) * (variance * 0.4);
    const noise = (Math.random() - 0.48) * (variance * 0.2);
    current = Math.max(100, Math.round(basePrice * multiplier + cycle + noise));

    const minPrice = Math.round(current * 0.92);
    const maxPrice = Math.round(current * 1.08);
    const arrivalQuantity = Math.round(150 + Math.random() * 400);

    series.push({
      date: d,
      minPrice,
      maxPrice,
      modalPrice: current,
      arrivalQuantity
    });
  }

  return series;
}

async function seedMandiData() {
  console.log('🌾 Starting KrishiShetra Mandi Data Seeder (DEMO DATA)...');

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  }

  // 1. Seed or Update Mandis
  const savedMandis = [];
  for (const m of MANDI_DATA) {
    let doc = await Mandi.findOne({ name: m.name });
    if (!doc) {
      doc = await Mandi.create(m);
      console.log(`[+] Created Mandi: ${doc.name}`);
    } else {
      doc.set(m);
      await doc.save();
      console.log(`[*] Updated Mandi: ${doc.name}`);
    }
    savedMandis.push(doc);
  }

  // 2. Clear old demo prices
  await MandiPrice.deleteMany({ isDemo: true });
  console.log('Cleared previous demo price records.');

  // 3. Seed 90 days of prices for every mandi and crop
  const priceDocs = [];
  for (const mandi of savedMandis) {
    for (const [crop, config] of Object.entries(CROP_BASE_PRICES)) {
      const multiplier = config.mandiMultipliers[mandi.name] || 1.0;
      const series = generatePriceSeries(config.base, config.variance, multiplier, 90);

      for (const item of series) {
        priceDocs.push({
          mandi: mandi._id,
          crop,
          date: item.date,
          minPrice: item.minPrice,
          maxPrice: item.maxPrice,
          modalPrice: item.modalPrice,
          arrivalQuantity: item.arrivalQuantity,
          isDemo: true
        });
      }
    }
  }

  console.log(`Inserting ${priceDocs.length} historical price entries (90 days × 8 mandis × 5 crops)...`);
  await MandiPrice.insertMany(priceDocs);
  console.log('✅ Mandi prices seeded successfully with isDemo: true flags!');
}

if (require.main === module) {
  seedMandiData().then(() => {
    console.log('Seeding finished.');
    process.exit(0);
  }).catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = {
  seedMandiData,
  MANDI_DATA,
  CROP_BASE_PRICES
};
