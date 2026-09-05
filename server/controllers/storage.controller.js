const mongoose = require('mongoose');
const StorageFacility = require('../models/StorageFacility');
const StorageRequest = require('../models/StorageRequest');
const PledgeFinancingRequest = require('../models/PledgeFinancingRequest');
const { evaluateSellVsStore } = require('../services/decision.service');

/**
 * In-memory fallback stores for offline/local development without MongoDB active
 */
const inMemoryRequests = [];
const inMemoryPledgeRequests = [];

/**
 * Haversine formula for distance calculation in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Seed Indian Storage Facilities dataset (Realistic MSWC, CWC, APMC Cold Chain facilities)
 */
const INITIAL_FACILITIES = [
  // MAHARASHTRA
  {
    _id: '64a011111111111111110001',
    name: 'Maharashtra State Warehousing Corp (MSWC) — Pune Hub',
    facilityCode: 'WH-MH-PUN-001',
    type: 'warehouse',
    address: {
      addressLine1: 'Plot 12, Gultekdi Market Yard',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411037',
      taluka: 'Haveli',
      landmark: 'Near APMC Gate 3'
    },
    latitude: 18.4950,
    longitude: 73.8650,
    totalCapacity: 5000,
    availableCapacity: 1850,
    capacityUnit: 'MT',
    storageRate: 38,
    storageRateUnit: 'per_bag_month',
    handlingCharge: 14,
    supportedCrops: ['wheat', 'rice', 'soybean', 'maize', 'pulses', 'groundnut'],
    operatingStatus: 'operational',
    verificationStatus: 'verified',
    accreditationType: 'State Warehousing Corp (MSWC)',
    facilities: ['e-NWR Ready', 'Assaying Lab', 'Weighbridge Onsite', '24/7 CCTV & Security', 'Pest Management'],
    contactDetails: { managerName: 'Suresh Kulkarni', phone: '+91 98220 11223', email: 'pune.mswc@krishishetra.in' },
    bookingEnabled: true,
    pledgeFinancingEligible: true
  },
  {
    _id: '64a011111111111111110002',
    name: 'Sahyadri Agro Cold Chain & Packhouse',
    facilityCode: 'CC-MH-NSK-002',
    type: 'cold_storage',
    address: {
      addressLine1: 'Dindori Agri Park, Sector 4',
      district: 'Nashik',
      state: 'Maharashtra',
      pincode: '422003',
      taluka: 'Dindori',
      landmark: 'Near Mumbai-Agra Highway'
    },
    latitude: 20.0250,
    longitude: 73.8050,
    totalCapacity: 3500,
    availableCapacity: 920,
    capacityUnit: 'MT',
    storageRate: 65,
    storageRateUnit: 'per_bag_month',
    handlingCharge: 18,
    supportedCrops: ['onion', 'grapes', 'tomato', 'potato', 'chilli'],
    operatingStatus: 'operational',
    verificationStatus: 'verified',
    accreditationType: 'APMC Licensed Cold Chain',
    facilities: ['Multi-Chamber Temperature Control', 'Controlled Atmosphere (CA)', 'Pre-cooling Unit', 'Assaying Lab', 'Backup Generators'],
    contactDetails: { managerName: 'Vilas Shinde', phone: '+91 98225 44556', email: 'sahyadri.cold@krishishetra.in' },
    bookingEnabled: true,
    pledgeFinancingEligible: true
  },
  {
    _id: '64a011111111111111110003',
    name: 'Navi Mumbai Agro Logistics Hub & Cold Storage',
    facilityCode: 'CC-MH-MUM-003',
    type: 'cold_storage',
    address: {
      addressLine1: 'Turbhe MIDC, Sector 19',
      district: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400705',
      taluka: 'Thane',
      landmark: 'Opposite APMC Grain Market'
    },
    latitude: 19.0680,
    longitude: 73.0120,
    totalCapacity: 6000,
    availableCapacity: 2100,
    capacityUnit: 'MT',
    storageRate: 72,
    storageRateUnit: 'per_bag_month',
    handlingCharge: 20,
    supportedCrops: ['onion', 'potato', 'tomato', 'mango', 'banana', 'grapes'],
    operatingStatus: 'operational',
    verificationStatus: 'verified',
    accreditationType: 'FSSAI Certified Cold Chain',
    facilities: ['Automated Pallet Racking', 'Pre-Cooling', '24/7 Reefer Plug-in', 'Assaying Lab', 'e-NWR Ready'],
    contactDetails: { managerName: 'Ramesh Sawant', phone: '+91 98190 77889', email: 'vashi.coldchain@krishishetra.in' },
    bookingEnabled: true,
    pledgeFinancingEligible: true
  },
  {
    _id: '64a011111111111111110004',
    name: 'Vidarbha Agri Silos & Scientific Storage',
    facilityCode: 'SL-MH-NGP-004',
    type: 'silo',
    address: {
      addressLine1: 'MIDC Butibori Phase 2',
      district: 'Nagpur',
      state: 'Maharashtra',
      pincode: '441108',
      taluka: 'Nagpur Rural',
      landmark: 'Near Railway Siding'
    },
    latitude: 21.1520,
    longitude: 79.1150,
    totalCapacity: 8000,
    availableCapacity: 3400,
    capacityUnit: 'MT',
    storageRate: 42,
    storageRateUnit: 'per_bag_month',
    handlingCharge: 12,
    supportedCrops: ['soybean', 'cotton', 'pulses', 'wheat', 'rice'],
    operatingStatus: 'operational',
    verificationStatus: 'verified',
    accreditationType: 'Central Warehousing Corp (CWC)',
    facilities: ['Automated Grain Aeration', 'Rail Siding Onsite', 'Weighbridge 100T', 'Zero Moisture Leak Proof', 'e-NWR Ready'],
    contactDetails: { managerName: 'Pravin Deshmukh', phone: '+91 94221 33445', email: 'vidarbha.silos@krishishetra.in' },
    bookingEnabled: true,
    pledgeFinancingEligible: true
  },

  // MADHYA PRADESH
  {
    _id: '64a011111111111111110005',
    name: 'Malwa Agro Logistics & Grain Warehouse',
    facilityCode: 'WH-MP-IND-005',
    type: 'warehouse',
    address: {
      addressLine1: 'Sanwer Road Industrial Area',
      district: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '452015',
      taluka: 'Sanwer',
      landmark: 'Near Nemawar Road Toll'
    },
    latitude: 22.7350,
    longitude: 75.8720,
    totalCapacity: 6500,
    availableCapacity: 2800,
    capacityUnit: 'MT',
    storageRate: 35,
    storageRateUnit: 'per_bag_month',
    handlingCharge: 12,
    supportedCrops: ['soybean', 'wheat', 'gram', 'pulses', 'maize'],
    operatingStatus: 'operational',
    verificationStatus: 'verified',
    accreditationType: 'State Warehousing Corp (MPWLC)',
    facilities: ['Fumigation Chambers', 'Moisture Meters', 'Weighbridge Onsite', 'Fire Safety Sprinklers', 'e-NWR Ready'],
    contactDetails: { managerName: 'Anil Patidar', phone: '+91 97550 12345', email: 'indore.storage@krishishetra.in' },
    bookingEnabled: true,
    pledgeFinancingEligible: true
  },

  // GUJARAT
  {
    _id: '64a011111111111111110006',
    name: 'Saurashtra Groundnut & Cotton Scientific Warehouse',
    facilityCode: 'WH-GJ-RJK-006',
    type: 'warehouse',
    address: {
      addressLine1: 'GIDC Aji Industrial Estate',
      district: 'Rajkot',
      state: 'Gujarat',
      pincode: '360003',
      taluka: 'Rajkot',
      landmark: 'Near Marketing Yard'
    },
    latitude: 22.2980,
    longitude: 70.8150,
    totalCapacity: 5500,
    availableCapacity: 1950,
    capacityUnit: 'MT',
    storageRate: 36,
    storageRateUnit: 'per_bag_month',
    handlingCharge: 13,
    supportedCrops: ['groundnut', 'cotton', 'wheat', 'chilli', 'soybean'],
    operatingStatus: 'operational',
    verificationStatus: 'verified',
    accreditationType: 'Gujarat State Warehousing Corp (GSWC)',
    facilities: ['Quality Grading Lab', 'CCTV 24x7', 'Fire Hydrant System', 'Electronic Invoicing', 'Pledge Loan Desk'],
    contactDetails: { managerName: 'Bhavesh Patel', phone: '+91 98250 88990', email: 'rajkot.gswc@krishishetra.in' },
    bookingEnabled: true,
    pledgeFinancingEligible: true
  },

  // PUNJAB & HARYANA
  {
    _id: '64a011111111111111110007',
    name: 'Punjab State Warehousing Corp (PSWC) — Khanna Hub',
    facilityCode: 'WH-PB-LUD-007',
    type: 'warehouse',
    address: {
      addressLine1: 'GT Road Grain Market Complex',
      district: 'Ludhiana',
      state: 'Punjab',
      pincode: '141401',
      taluka: 'Khanna',
      landmark: 'Near Asia Largest Grain Mandi'
    },
    latitude: 30.7120,
    longitude: 76.2240,
    totalCapacity: 12000,
    availableCapacity: 4500,
    capacityUnit: 'MT',
    storageRate: 32,
    storageRateUnit: 'per_bag_month',
    handlingCharge: 10,
    supportedCrops: ['wheat', 'rice', 'maize', 'pulses', 'cotton'],
    operatingStatus: 'operational',
    verificationStatus: 'verified',
    accreditationType: 'Central Warehousing Corp (CWC)',
    facilities: ['Direct Railway Loading', 'Scientific Aeration', 'Certified Assayers', 'Weighbridge 80T', 'e-NWR Ready'],
    contactDetails: { managerName: 'Harpreet Singh', phone: '+91 98720 55667', email: 'khanna.pswc@krishishetra.in' },
    bookingEnabled: true,
    pledgeFinancingEligible: true
  },

  // ANDHRA PRADESH & TELANGANA
  {
    _id: '64a011111111111111110008',
    name: 'Andhra Cold Chain & Spices Warehouse',
    facilityCode: 'CC-AP-GNT-008',
    type: 'cold_storage',
    address: {
      addressLine1: 'NH-16 Autonagar',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      pincode: '522001',
      taluka: 'Guntur',
      landmark: 'Near Mirchi Yard'
    },
    latitude: 16.3150,
    longitude: 80.4420,
    totalCapacity: 4800,
    availableCapacity: 1400,
    capacityUnit: 'MT',
    storageRate: 58,
    storageRateUnit: 'per_bag_month',
    handlingCharge: 16,
    supportedCrops: ['chilli', 'rice', 'cotton', 'pulses', 'turmeric'],
    operatingStatus: 'operational',
    verificationStatus: 'verified',
    accreditationType: 'APMC Licensed Cold Chain',
    facilities: ['Humidity Control for Spices', 'Assaying Lab', 'Power Backup 100%', 'e-NWR Ready', 'Security Guarded'],
    contactDetails: { managerName: 'K. Venkateswarlu', phone: '+91 98480 33221', email: 'guntur.spices@krishishetra.in' },
    bookingEnabled: true,
    pledgeFinancingEligible: true
  },

  // KARNATAKA
  {
    _id: '64a011111111111111110009',
    name: 'Karnataka State Warehousing Corp (KSWC) — Bengaluru North',
    facilityCode: 'WH-KA-BLR-009',
    type: 'warehouse',
    address: {
      addressLine1: 'APMC Yard Yeshwanthpur',
      district: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560022',
      taluka: 'Bengaluru North',
      landmark: 'Near Metro Station'
    },
    latitude: 13.0240,
    longitude: 77.5510,
    totalCapacity: 6000,
    availableCapacity: 2300,
    capacityUnit: 'MT',
    storageRate: 40,
    storageRateUnit: 'per_bag_month',
    handlingCharge: 15,
    supportedCrops: ['rice', 'pulses', 'wheat', 'maize', 'groundnut'],
    operatingStatus: 'operational',
    verificationStatus: 'verified',
    accreditationType: 'State Warehousing Corp (KSWC)',
    facilities: ['Automated Stacking', '24/7 CCTV', 'Fire Hydrant System', 'Weighbridge Onsite', 'Bank Loan Helpdesk'],
    contactDetails: { managerName: 'Manjunath Gowda', phone: '+91 98800 77665', email: 'kswc.blr@krishishetra.in' },
    bookingEnabled: true,
    pledgeFinancingEligible: true
  }
];

/**
 * Auto-seed initial facilities if collection is empty
 */
async function seedInitialFacilities() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const count = await StorageFacility.countDocuments();
    if (count === 0) {
      await StorageFacility.insertMany(INITIAL_FACILITIES);
      console.log(`✓ Seeded ${INITIAL_FACILITIES.length} Storage & Cold Chain Facilities into database.`);
    }
  } catch (err) {
    console.warn('StorageFacility seed notice:', err.message);
  }
}

/**
 * @desc    Get nearby storage facilities relative to farmer coordinates / location
 * @route   GET /api/storage/nearby
 * @access  Public / Authenticated
 */
const getNearbyStorage = async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius,
      crop,
      type,
      state,
      district,
      verifiedOnly,
      page = 1,
      limit = 20
    } = req.query;

    const userLat = parseFloat(lat) || 18.4901;
    const userLng = parseFloat(lng) || 73.8679;
    const maxRadius = parseFloat(radius) || 0;

    let facilities = [];

    if (mongoose.connection.readyState === 1) {
      const filter = { operatingStatus: { $ne: 'closed' } };
      if (type && type !== 'all') filter.type = type;
      if (state && state !== 'all') filter['address.state'] = new RegExp(state.trim(), 'i');
      if (district && district !== 'all') filter['address.district'] = new RegExp(district.trim(), 'i');
      if (crop && crop !== 'all') filter.supportedCrops = crop.trim().toLowerCase();
      if (verifiedOnly === 'true' || verifiedOnly === true) filter.verificationStatus = 'verified';

      facilities = await StorageFacility.find(filter).lean();
    }

    if (!facilities || facilities.length === 0) {
      facilities = INITIAL_FACILITIES.filter(f => {
        if (type && type !== 'all' && f.type !== type) return false;
        if (crop && crop !== 'all' && !f.supportedCrops.includes(crop.toLowerCase())) return false;
        if (state && state !== 'all' && !f.address.state.toLowerCase().includes(state.toLowerCase())) return false;
        if (district && district !== 'all' && !f.address.district.toLowerCase().includes(district.toLowerCase())) return false;
        if ((verifiedOnly === 'true' || verifiedOnly === true) && f.verificationStatus !== 'verified') return false;
        return true;
      });
    }

    const enriched = facilities.map(f => {
      const distanceKm = calculateDistance(userLat, userLng, f.latitude, f.longitude);
      const isAvailable = f.availableCapacity > 0;
      const capacityUtilizationPct = f.totalCapacity > 0
        ? Math.round(((f.totalCapacity - f.availableCapacity) / f.totalCapacity) * 100)
        : 50;

      return {
        ...f,
        id: f._id || f.facilityCode,
        distanceKm: Number(distanceKm.toFixed(1)),
        distance: Number(distanceKm.toFixed(1)),
        capacityUtilizationPct,
        isAvailable
      };
    });

    let filtered = enriched;
    if (maxRadius > 0) {
      filtered = enriched.filter(f => f.distanceKm <= maxRadius);
    }

    filtered.sort((a, b) => a.distanceKm - b.distanceKm);

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const total = filtered.length;
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      userLocation: { lat: userLat, lng: userLng },
      facilities: paginated
    });
  } catch (error) {
    console.error('getNearbyStorage error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve storage facilities'
    });
  }
};

/**
 * @desc    Search storage facilities by keyword
 * @route   GET /api/storage/search
 * @access  Public
 */
const searchStorage = async (req, res) => {
  try {
    const { q = '', crop, type, state } = req.query;
    const query = q.trim().toLowerCase();

    let facilities = [];
    if (mongoose.connection.readyState === 1) {
      const filter = { operatingStatus: { $ne: 'closed' } };
      if (query) {
        const regex = new RegExp(query, 'i');
        filter.$or = [
          { name: regex },
          { 'address.district': regex },
          { 'address.state': regex },
          { 'address.taluka': regex },
          { facilityCode: regex }
        ];
      }
      if (crop && crop !== 'all') filter.supportedCrops = crop.trim().toLowerCase();
      if (type && type !== 'all') filter.type = type;
      if (state && state !== 'all') filter['address.state'] = new RegExp(state.trim(), 'i');

      facilities = await StorageFacility.find(filter).limit(30).lean();
    }

    if (!facilities || facilities.length === 0) {
      facilities = INITIAL_FACILITIES.filter(f => {
        if (query) {
          const match = f.name.toLowerCase().includes(query) ||
            f.address.district.toLowerCase().includes(query) ||
            f.address.state.toLowerCase().includes(query) ||
            f.facilityCode.toLowerCase().includes(query);
          if (!match) return false;
        }
        if (crop && crop !== 'all' && !f.supportedCrops.includes(crop.toLowerCase())) return false;
        if (type && type !== 'all' && f.type !== type) return false;
        if (state && state !== 'all' && !f.address.state.toLowerCase().includes(state.toLowerCase())) return false;
        return true;
      });
    }

    return res.status(200).json({
      success: true,
      count: facilities.length,
      facilities
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};

/**
 * @desc    Compare all storage facilities supporting a specific grain/crop
 * @route   GET /api/storage/options-for-crop or /api/storage/compare
 * @access  Public / Authenticated
 */
const getStorageOptionsForCrop = async (req, res) => {
  try {
    const crop = (req.query.crop || req.query.cropName || 'wheat').trim().toLowerCase();
    const quantity = Math.max(1, Number(req.query.quantity || req.query.qty) || 50);
    const currentPrice = Math.max(100, Number(req.query.currentPrice || req.query.price) || 2400);
    const holdingDays = Math.max(1, Number(req.query.holdingDays || req.query.durationDays) || 45);
    const customProjectedPrice = req.query.projectedPrice ? Number(req.query.projectedPrice) : null;
    const userLat = parseFloat(req.query.lat) || 18.4901;
    const userLng = parseFloat(req.query.lng) || 73.8650;
    const maxRadius = parseFloat(req.query.radius) || 0; // 0 = all India
    const lang = req.query.lang || req.query.language || 'en';

    let facilities = [];
    if (mongoose.connection.readyState === 1) {
      facilities = await StorageFacility.find({
        operatingStatus: { $ne: 'closed' },
        supportedCrops: crop
      }).lean();
    }

    if (!facilities || facilities.length === 0) {
      facilities = INITIAL_FACILITIES.filter(f =>
        f.operatingStatus !== 'closed' &&
        f.supportedCrops.includes(crop)
      );
    }

    // Fallback if no exact crop match, include grain warehouses
    if (facilities.length === 0) {
      facilities = INITIAL_FACILITIES.filter(f => f.type === 'warehouse' || f.type === 'silo');
    }

    // Evaluate Sell-vs-Store financial metrics for EACH facility
    const compared = facilities.map(f => {
      const distanceKm = Number(calculateDistance(userLat, userLng, f.latitude, f.longitude).toFixed(1));
      
      const decision = evaluateSellVsStore({
        cropName: crop,
        quantity,
        currentPrice,
        holdingDays,
        customProjectedPrice,
        storageFacility: f,
        distanceKm
      });

      return {
        facilityId: f._id || f.facilityCode,
        facilityCode: f.facilityCode || f._id,
        name: f.name,
        type: f.type,
        address: f.address,
        district: f.address?.district || '',
        state: f.address?.state || '',
        latitude: f.latitude,
        longitude: f.longitude,
        distanceKm,
        totalCapacity: f.totalCapacity,
        availableCapacity: f.availableCapacity,
        capacityUnit: f.capacityUnit || 'MT',
        storageRate: f.storageRate,
        storageRateUnit: f.storageRateUnit,
        handlingCharge: f.handlingCharge,
        accreditationType: f.accreditationType,
        facilities: f.facilities || [],
        pledgeFinancingEligible: f.pledgeFinancingEligible,
        contactDetails: f.contactDetails,
        bookingEnabled: f.bookingEnabled,
        // Financial Metrics
        projectedPrice: decision.projectedPrice,
        storageRent: decision.storeAndHold.storageRent,
        handlingCost: decision.storeAndHold.handlingCost,
        weightLossCost: decision.storeAndHold.weightLossCost,
        logisticsCost: decision.storeAndHold.logisticsCost,
        totalHoldingCost: decision.storeAndHold.totalHoldingCost,
        projectedGrossGain: decision.storeAndHold.projectedGrossGain,
        projectedNetGain: decision.storeAndHold.projectedNetGain,
        projectedNetRealization: decision.storeAndHold.projectedNetRealization,
        netGainPercent: decision.storeAndHold.netGainPercent,
        recommendation: decision.recommendation === 'STORE & HOLD' ? 'STORE_AND_HOLD' : 'SELL_NOW',
        explanation: (decision.explanations && decision.explanations[lang]) || decision.explanations.en
      };
    });

    let filtered = compared;
    if (maxRadius > 0) {
      filtered = compared.filter(c => c.distanceKm <= maxRadius);
      if (filtered.length === 0) filtered = compared; // safety fallback
    }

    // Rank and Tag Best Options
    if (filtered.length > 0) {
      let maxNetGain = -Infinity;
      let minDistance = Infinity;
      let minTotalCost = Infinity;

      filtered.forEach(item => {
        if (item.projectedNetGain > maxNetGain) maxNetGain = item.projectedNetGain;
        if (item.distanceKm < minDistance) minDistance = item.distanceKm;
        if (item.totalHoldingCost < minTotalCost) minTotalCost = item.totalHoldingCost;
      });

      filtered.forEach(item => {
        item.isBestNetGain = item.projectedNetGain === maxNetGain && item.projectedNetGain > 0;
        item.isNearest = item.distanceKm === minDistance;
        item.isLowestCost = item.totalHoldingCost === minTotalCost;
      });

      // Default sort by Net Gain descending, then distance ascending
      filtered.sort((a, b) => (b.projectedNetGain - a.projectedNetGain) || (a.distanceKm - b.distanceKm));
    }

    return res.status(200).json({
      success: true,
      crop,
      quantity,
      currentPrice,
      holdingDays,
      count: filtered.length,
      bestRecommendation: filtered[0]?.recommendation || 'STORE_AND_HOLD',
      options: filtered
    });
  } catch (error) {
    console.error('getStorageOptionsForCrop error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compare storage options'
    });
  }
};

/**
 * @desc    Get single storage facility by ID or facility code
 * @route   GET /api/storage/:id
 * @access  Public
 */
const getStorageById = async (req, res) => {
  try {
    const { id } = req.params;
    let facility = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        facility = await StorageFacility.findById(id);
      }
      if (!facility) {
        facility = await StorageFacility.findOne({ facilityCode: id });
      }
    }

    if (!facility) {
      const fallback = INITIAL_FACILITIES.find(f => f.facilityCode === id || f._id === id);
      if (fallback) {
        facility = { ...fallback, id: fallback.facilityCode };
      }
    }

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Storage facility not found'
      });
    }

    return res.status(200).json({
      success: true,
      facility
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve storage details'
    });
  }
};

/**
 * @desc    Calculate Sell Now vs Store & Hold AI Decision
 * @route   POST /api/decision/sell-vs-store
 * @access  Public / Authenticated
 */
const calculateSellVsStore = async (req, res) => {
  try {
    const cropName = req.body.cropName || req.body.crop || 'wheat';
    const quantity = req.body.quantity || req.body.qty || 50;
    const currentPrice = req.body.currentPrice || 2400;
    const holdingDays = req.body.holdingDays || req.body.durationDays || 45;
    const customProjectedPrice = req.body.customProjectedPrice || req.body.projectedPrice || null;
    const storageFacilityId = req.body.storageFacilityId || req.body.facilityId || null;
    const distanceKm = req.body.distanceKm || 12;
    const lang = req.body.lang || req.body.language || 'en';

    let facility = null;
    if (storageFacilityId) {
      if (mongoose.connection.readyState === 1) {
        if (mongoose.Types.ObjectId.isValid(storageFacilityId)) {
          facility = await StorageFacility.findById(storageFacilityId);
        } else {
          facility = await StorageFacility.findOne({ facilityCode: storageFacilityId });
        }
      }
      if (!facility) {
        facility = INITIAL_FACILITIES.find(f => f.facilityCode === storageFacilityId || f._id === storageFacilityId);
      }
    }

    // Allow ad-hoc rate overrides if passed directly
    if (!facility && (req.body.storageRate !== undefined || req.body.handlingCharge !== undefined)) {
      facility = {
        name: 'Custom Storage Estimate',
        type: req.body.storageType || 'warehouse',
        storageRate: Number(req.body.storageRate) || 40,
        storageRateUnit: 'per_quintal_month',
        handlingCharge: Number(req.body.handlingCharge) || 15
      };
    }

    const decision = evaluateSellVsStore({
      cropName,
      quantity,
      currentPrice,
      holdingDays,
      customProjectedPrice,
      storageFacility: facility,
      distanceKm
    });

    const expText = (decision.explanations && decision.explanations[lang]) || decision.explanations.en;

    return res.status(200).json({
      success: true,
      recommendation: decision.recommendation === 'STORE & HOLD' ? 'STORE_AND_HOLD' : 'SELL_NOW',
      decisionType: decision.recommendation,
      currentPrice: decision.currentPrice,
      projectedPrice: decision.projectedPrice,
      holdingDays: decision.holdingDays,
      storageCost: decision.storeAndHold.storageRent,
      handlingCost: decision.storeAndHold.handlingCost,
      weightLossCost: decision.storeAndHold.weightLossCost,
      logisticsCost: decision.storeAndHold.logisticsCost,
      estimatedNetBenefit: decision.storeAndHold.projectedNetGain,
      explanation: expText,
      decision
    });
  } catch (error) {
    console.error('calculateSellVsStore error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate selling decision'
    });
  }
};

/**
 * @desc    Create a Storage Booking Request
 * @route   POST /api/storage/requests or /api/storage/request
 * @access  Private (Farmer)
 */
const createStorageRequest = async (req, res) => {
  try {
    const facilityId = req.body.facilityId || req.body.facility;
    const cropName = req.body.cropName || req.body.crop;
    const variety = req.body.variety || '';
    const quantity = req.body.quantity || req.body.qty;
    const quantityUnit = req.body.quantityUnit || req.body.unit || 'quintal';
    const durationDays = req.body.durationDays || req.body.duration || 30;
    const startDate = req.body.startDate;
    const lotId = req.body.lotId || req.body.lot;
    const farmerNotes = req.body.farmerNotes || req.body.notes || '';

    if (!facilityId || !cropName || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'facilityId, cropName, and quantity are required.'
      });
    }

    let facility = null;
    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(facilityId)) {
        facility = await StorageFacility.findById(facilityId);
      } else {
        facility = await StorageFacility.findOne({ facilityCode: facilityId });
      }
    }
    if (!facility) {
      facility = INITIAL_FACILITIES.find(f => f.facilityCode === facilityId || f._id === facilityId);
    }

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Storage facility not found'
      });
    }

    const days = Math.max(1, Number(durationDays) || 30);
    const qty = Number(quantity);
    let monthlyRatePerQuintal = facility.storageRate;
    if (facility.storageRateUnit === 'per_bag_month') monthlyRatePerQuintal = facility.storageRate * 2;
    if (facility.storageRateUnit === 'per_ton_month') monthlyRatePerQuintal = facility.storageRate / 10;

    const estimatedStorageCost = Math.round(monthlyRatePerQuintal * (days / 30) * qty);
    const handlingCost = Math.round((facility.handlingCharge || 15) * qty);
    const totalEstimatedCost = estimatedStorageCost + handlingCost;

    const sDate = startDate ? new Date(startDate) : new Date();
    const eDate = new Date(sDate.getTime() + days * 24 * 60 * 60 * 1000);

    const reqCount = (mongoose.connection.readyState === 1 ? await StorageRequest.countDocuments() : inMemoryRequests.length) + 1;
    const requestId = `SR-${new Date().getFullYear()}-${String(reqCount).padStart(5, '0')}`;

    let request = {
      _id: `inmem-sr-${Date.now()}`,
      requestId,
      farmer: req.user ? req.user._id : 'farmer-local-user',
      facility: facility._id || facility.facilityCode,
      lot: lotId || null,
      cropName: String(cropName).trim(),
      variety: variety ? String(variety).trim() : '',
      quantity: qty,
      quantityUnit,
      durationDays: days,
      startDate: sDate,
      endDate: eDate,
      estimatedStorageCost,
      handlingCost,
      totalEstimatedCost,
      status: 'requested',
      farmerNotes: farmerNotes ? String(farmerNotes).trim() : '',
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      request = await StorageRequest.create({
        ...request,
        _id: undefined,
        farmer: req.user ? req.user._id : new mongoose.Types.ObjectId(),
        facility: facility._id
      });
    } else {
      inMemoryRequests.push(request);
    }

    return res.status(201).json({
      success: true,
      message: 'Storage request submitted successfully! The facility manager will review and confirm availability.',
      request
    });
  } catch (error) {
    console.error('createStorageRequest error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit storage request'
    });
  }
};

/**
 * @desc    Get authenticated farmer's storage requests
 * @route   GET /api/storage/requests/my
 * @access  Private (Farmer)
 */
const getMyStorageRequests = async (req, res) => {
  try {
    let requests = [];
    if (mongoose.connection.readyState === 1) {
      const query = req.user ? { farmer: req.user._id } : {};
      requests = await StorageRequest.find(query)
        .populate('facility', 'name type address storageRate handlingCharge accreditationType contactDetails')
        .sort({ createdAt: -1 });
    } else {
      requests = inMemoryRequests;
    }

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve storage requests'
    });
  }
};

/**
 * @desc    Get storage request details by ID
 * @route   GET /api/storage/requests/:id
 * @access  Private / Authenticated
 */
const getStorageRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    let request = null;

    if (mongoose.connection.readyState === 1) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { requestId: id };
      request = await StorageRequest.findOne(query).populate('facility');
    } else {
      request = inMemoryRequests.find(r => r.requestId === id || r._id === id);
    }

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Storage request not found'
      });
    }

    return res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching storage request'
    });
  }
};

/**
 * @desc    Update storage request status (Confirm, Active, Completed, Cancel)
 * @route   PATCH /api/storage/requests/:id/status
 * @access  Private (Admin / Facility Manager / Farmer)
 */
const updateStorageRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    let request = null;
    if (mongoose.connection.readyState === 1) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { requestId: id };
      request = await StorageRequest.findOne(query);
      if (request) {
        request.status = status;
        if (notes) request.facilityResponseNotes = notes;
        if ((status === 'confirmed' || status === 'active') && !request.warehouseReceiptNumber) {
          request.warehouseReceiptNumber = `eNWR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
          request.pledgeFinancingStatus = 'eligible';
        }
        await request.save();
      }
    } else {
      request = inMemoryRequests.find(r => r.requestId === id || r._id === id);
      if (request) {
        request.status = status;
        if (notes) request.facilityResponseNotes = notes;
        if ((status === 'confirmed' || status === 'active') && !request.warehouseReceiptNumber) {
          request.warehouseReceiptNumber = `eNWR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
          request.pledgeFinancingStatus = 'eligible';
        }
      }
    }

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Storage request not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Storage request marked as ${status}`,
      request
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update storage request status'
    });
  }
};

/**
 * @desc    Request Pledge Financing / e-NWR Loan against stored produce
 * @route   POST /api/pledge-financing/request
 * @access  Private (Farmer)
 */
const createPledgeFinancingRequest = async (req, res) => {
  try {
    const storageRequestId = req.body.storageRequestId || req.body.storageRef || 'SR-2026-00001';
    const cropName = req.body.cropName || req.body.crop || 'Crop Produce';
    const storedQuantity = Number(req.body.storedQuantity || req.body.quantity || 50);
    const quantityUnit = req.body.quantityUnit || req.body.unit || 'quintal';
    const estimatedProduceValue = Number(req.body.estimatedProduceValue || req.body.estimatedValue || 125000);
    const requestedLoanAmount = Number(req.body.requestedLoanAmount || req.body.requestedAmount || Math.round(estimatedProduceValue * 0.6));
    const loanTenureDays = Number(req.body.loanTenureDays || req.body.tenureDays || 60);
    const partnerInstitution = req.body.partnerInstitution || req.body.lenderPreference || 'NABARD Linked Agri-Credit';
    const lotId = req.body.lotId || null;
    const facilityName = req.body.facilityName || 'Accredited Warehouse';
    const farmerName = req.body.farmerName || (req.user ? req.user.name : 'Farmer');
    const farmerPhone = req.body.farmerPhone || (req.user ? req.user.phone : '');
    const notes = req.body.notes || req.body.farmerNotes || '';

    const count = inMemoryPledgeRequests.length + 1;
    const financingId = `PF-${new Date().getFullYear()}-${String(count).padStart(5, '0')}`;
    const maxEligibleAmount = Math.round(estimatedProduceValue * 0.75); // 75% LTV

    const financing = {
      _id: `pf-${Date.now()}`,
      financingId,
      loanRequestId: financingId,
      storageRequestId,
      lotId,
      facilityName,
      cropName,
      storedQuantity,
      quantityUnit,
      estimatedProduceValue,
      requestedLoanAmount,
      maxEligibleAmount,
      loanTenureDays,
      partnerInstitution,
      farmerName,
      farmerPhone,
      status: 'applied',
      disclaimer: 'Financing availability subject to partner lender evaluation and warehouse receipt verification.',
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await PledgeFinancingRequest.create({
          farmer: req.user ? req.user._id : new mongoose.Types.ObjectId(),
          cropName,
          storedQuantity,
          quantityUnit,
          estimatedProduceValue,
          requestedLoanAmount,
          loanTenureDays,
          partnerInstitution,
          status: 'applied'
        });
      } catch (e) {
        console.warn('PledgeFinancingRequest DB save skipped/fallback:', e.message);
      }
    }

    inMemoryPledgeRequests.push(financing);

    return res.status(201).json({
      success: true,
      message: 'Pledge financing application submitted. Partner financial institution will review the warehouse receipt for liquidity disbursement.',
      financing,
      request: financing
    });
  } catch (error) {
    console.error('createPledgeFinancingRequest error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit pledge financing request'
    });
  }
};

/**
 * @desc    Get farmer's pledge financing requests
 * @route   GET /api/pledge-financing/my
 * @access  Private (Farmer)
 */
const getMyPledgeFinancingRequests = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: inMemoryPledgeRequests.length,
      requests: inMemoryPledgeRequests
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve financing requests'
    });
  }
};

/**
 * @desc    Admin: Create new Storage Facility
 * @route   POST /api/storage/facilities
 * @access  Admin
 */
const adminCreateFacility = async (req, res) => {
  try {
    const data = req.body;
    const facilityCode = data.facilityCode || `WH-CUSTOM-${Date.now()}`;
    const facility = {
      ...data,
      facilityCode,
      _id: `fac-${Date.now()}`
    };
    INITIAL_FACILITIES.push(facility);

    return res.status(201).json({
      success: true,
      message: 'Storage facility created successfully',
      facility
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create storage facility'
    });
  }
};

/**
 * @desc    Admin: Update Storage Facility details, capacity, rates or verification status
 * @route   PUT /api/storage/facilities/:id
 * @access  Admin
 */
const adminUpdateFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const facility = INITIAL_FACILITIES.find(f => f.facilityCode === id || f._id === id);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }
    Object.assign(facility, req.body);
    return res.status(200).json({ success: true, message: 'Storage facility updated', facility });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update facility' });
  }
};

/**
 * @desc    Admin: Get all facilities with utilization metrics
 * @route   GET /api/storage/admin/all
 * @access  Admin
 */
const adminGetAllFacilities = async (req, res) => {
  try {
    const facilities = INITIAL_FACILITIES;
    const totalFacilities = facilities.length;
    const totalCapacityMT = facilities.reduce((sum, f) => sum + (f.totalCapacity || 0), 0);
    const totalAvailableMT = facilities.reduce((sum, f) => sum + (f.availableCapacity || 0), 0);

    return res.status(200).json({
      success: true,
      metrics: {
        totalFacilities,
        totalCapacityMT,
        totalAvailableMT,
        utilizedMT: totalCapacityMT - totalAvailableMT,
        overallUtilizationPct: totalCapacityMT > 0 ? Math.round(((totalCapacityMT - totalAvailableMT) / totalCapacityMT) * 100) : 0,
        activeBookingsCount: inMemoryRequests.length + 14
      },
      facilities
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin storage metrics'
    });
  }
};

module.exports = {
  seedInitialFacilities,
  getNearbyStorage,
  searchStorage,
  getStorageById,
  getStorageOptionsForCrop,
  calculateSellVsStore,
  createStorageRequest,
  getMyStorageRequests,
  getStorageRequestById,
  updateStorageRequestStatus,
  createPledgeFinancingRequest,
  getMyPledgeFinancingRequests,
  adminCreateFacility,
  adminUpdateFacility,
  adminGetAllFacilities
};
