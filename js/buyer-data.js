/**
 * KRISHILINK — B2B BUYER MODULE DATA SERVICES
 * API-Ready Abstraction Services for Buyer Dashboard, Marketplace,
 * Lot Intelligence, Offer Negotiations, Orders, Logistics, and Payments.
 */

// ═════════════════════════════════════════════════════════════════════
// 1. MOCK DATASETS (Realistic Indian Agricultural Sourcing Data)
// ═════════════════════════════════════════════════════════════════════

const BUYER_PROFILE_DEMO = {
  id: 'buyer-901',
  companyName: 'ABC Foods Pvt Ltd',
  businessType: 'Food Processor & Wholesale Sourcing',
  gstin: '27AABCA1234F1ZM',
  pan: 'AABCA1234F',
  regNumber: 'U15400MH2021PTC356789',
  contactPerson: 'Rajesh Patil',
  email: 'procurement@abcfoods.in',
  phone: '+91 98230 45678',
  address: 'Plot 42, MIDC Industrial Area, Chakan',
  district: 'Pune',
  state: 'Maharashtra',
  pincode: '410501',
  kycStatus: 'VERIFIED', // VERIFIED | PENDING | NOT_SUBMITTED
  kycSubmittedAt: '2026-08-10',
  bankDetails: {
    accountHolder: 'ABC Foods Pvt Ltd',
    accountNumber: '••••••••8901',
    ifsc: 'HDFC0001234',
    bankName: 'HDFC Bank',
    branch: 'Chakan MIDC'
  },
  sourcingRequirements: {
    crop: 'Onion',
    minQty: 100,
    maxQty: 500,
    unit: 'Quintals',
    grade: 'Grade A',
    preferredRegion: 'Maharashtra (Nashik / Pune)',
    targetPriceMin: 2700,
    targetPriceMax: 2850
  }
};

const B2B_LOTS_DATA = [
  {
    id: 'lot-101',
    crop: 'Onion',
    variety: 'Red Garwa',
    emoji: '🧅',
    grade: 'Grade A',
    quantity: 100,
    unit: 'Quintals',
    sellerAskPrice: 2750,
    marketRefPrice: 2650,
    marketRangeMin: 2600,
    marketRangeMax: 2800,
    mandiCessPerQ: 15,
    location: 'Nashik, Maharashtra',
    mandi: 'Nashik APMC',
    distanceKm: 42,
    estimatedTransportTotal: 4000,
    otherCostTotal: 1500,
    sellerName: 'Nashik Farmer Producer Co (FPO)',
    sellerVerified: true,
    sellerTrustScore: 92,
    sellerCompletedOrders: 48,
    disputeRate: '0.4%',
    aiMatchPct: 94,
    harvestDate: '2026-08-24',
    availableUntil: '2026-09-05',
    image: 'assets/images/crop-onion.jpg',
    lat: 19.9975,
    lng: 73.7898,
    qualityMetrics: {
      moisturePct: '12%',
      sizeMm: '45–60mm',
      defectsPct: 'Low (< 1.5%)',
      aiConfidencePct: 91
    }
  },
  {
    id: 'lot-102',
    crop: 'Wheat',
    variety: 'Lokwan Premium',
    emoji: '🌾',
    grade: 'Grade A',
    quantity: 250,
    unit: 'Quintals',
    sellerAskPrice: 2680,
    marketRefPrice: 2650,
    marketRangeMin: 2580,
    marketRangeMax: 2720,
    mandiCessPerQ: 12,
    location: 'Nashik, Maharashtra',
    mandi: 'Nashik APMC',
    distanceKm: 65,
    estimatedTransportTotal: 8500,
    otherCostTotal: 2200,
    sellerName: 'Sahyadri Agro Farmers Union',
    sellerVerified: true,
    sellerTrustScore: 96,
    sellerCompletedOrders: 112,
    disputeRate: '0.1%',
    aiMatchPct: 89,
    harvestDate: '2026-08-20',
    availableUntil: '2026-09-10',
    image: 'assets/images/crop-wheat.jpg',
    lat: 20.0050,
    lng: 73.7700,
    qualityMetrics: {
      moisturePct: '8.5%',
      sizeMm: 'Clean Bold Grains',
      defectsPct: 'Nil (< 0.5%)',
      aiConfidencePct: 95
    }
  },
  {
    id: 'lot-103',
    crop: 'Soybean',
    variety: 'JS 335 Organic',
    emoji: '🫘',
    grade: 'Grade A+',
    quantity: 300,
    unit: 'Quintals',
    sellerAskPrice: 4700,
    marketRefPrice: 4650,
    marketRangeMin: 4550,
    marketRangeMax: 4800,
    mandiCessPerQ: 20,
    location: 'Indore, Madhya Pradesh',
    mandi: 'Indore Mandi',
    distanceKm: 520,
    estimatedTransportTotal: 32000,
    otherCostTotal: 4500,
    sellerName: 'Malwa Organic Sourcing Co-op',
    sellerVerified: true,
    sellerTrustScore: 95,
    sellerCompletedOrders: 86,
    disputeRate: '0.2%',
    aiMatchPct: 92,
    harvestDate: '2026-08-18',
    availableUntil: '2026-09-15',
    image: 'assets/images/crop-soybean.jpg',
    lat: 22.7196,
    lng: 75.8577,
    qualityMetrics: {
      moisturePct: '9.2%',
      oilContentPct: '19.8%',
      defectsPct: 'Low (< 1.0%)',
      aiConfidencePct: 93
    }
  },
  {
    id: 'lot-104',
    crop: 'Rice',
    variety: 'Sona Masoori Raw',
    emoji: '🌾',
    grade: 'Grade A',
    quantity: 400,
    unit: 'Quintals',
    sellerAskPrice: 2890,
    marketRefPrice: 2850,
    marketRangeMin: 2800,
    marketRangeMax: 2950,
    mandiCessPerQ: 14,
    location: 'Pune, Maharashtra',
    mandi: 'Pune APMC',
    distanceKm: 18,
    estimatedTransportTotal: 4500,
    otherCostTotal: 1800,
    sellerName: 'Deccan Grain Growers FPO',
    sellerVerified: true,
    sellerTrustScore: 94,
    sellerCompletedOrders: 64,
    disputeRate: '0.3%',
    aiMatchPct: 96,
    harvestDate: '2026-08-22',
    availableUntil: '2026-09-08',
    image: 'assets/images/crop-rice.jpg',
    lat: 18.5204,
    lng: 73.8567,
    qualityMetrics: {
      moisturePct: '11.0%',
      brokenPct: '< 3%',
      defectsPct: 'Nil',
      aiConfidencePct: 94
    }
  },
  {
    id: 'lot-105',
    crop: 'Chilli',
    variety: 'Teja Red Dry',
    emoji: '🌶️',
    grade: 'Export Grade',
    quantity: 80,
    unit: 'Quintals',
    sellerAskPrice: 8650,
    marketRefPrice: 8500,
    marketRangeMin: 8300,
    marketRangeMax: 8850,
    mandiCessPerQ: 35,
    location: 'Guntur, Andhra Pradesh',
    mandi: 'Guntur APMC',
    distanceKm: 720,
    estimatedTransportTotal: 28000,
    otherCostTotal: 3800,
    sellerName: 'Guntur Spice Traders Association',
    sellerVerified: true,
    sellerTrustScore: 97,
    sellerCompletedOrders: 140,
    disputeRate: '0.1%',
    aiMatchPct: 88,
    harvestDate: '2026-08-15',
    availableUntil: '2026-09-20',
    image: 'assets/images/crop-chilli.jpg',
    lat: 16.3067,
    lng: 80.4365,
    qualityMetrics: {
      moisturePct: '9.0%',
      colorASTA: '120+',
      pungencySHU: '45,000',
      aiConfidencePct: 96
    }
  }
];

const INITIAL_OFFERS_DATA = [
  {
    id: 'off-501',
    lotId: 'lot-101',
    crop: 'Onion',
    quantity: 100,
    sellerName: 'Nashik Farmer Producer Co (FPO)',
    sellerAsk: 2750,
    currentBuyerOffer: 2800,
    status: 'NEGOTIATING', // NEGOTIATING | ACCEPTED | REJECTED | WITHDRAWN
    updatedAt: '10 mins ago',
    history: [
      { party: 'Seller', price: 2750, note: 'Listed ask price for 100Q Grade A Onion' },
      { party: 'Buyer', price: 2700, note: 'Initial procurement bid' },
      { party: 'Seller', price: 2735, note: 'Counter offer: High demand in Nashik mandi' },
      { party: 'Buyer', price: 2725, note: 'Final revised counter offer' }
    ]
  }
];

const INITIAL_ORDERS_DATA = [
  {
    id: 'ord-10245',
    lotId: 'lot-101',
    crop: 'Onion',
    variety: 'Red Garwa',
    quantity: 100,
    pricePerQ: 2800,
    productTotal: 280000,
    transportCost: 4000,
    taxesTotal: 1500,
    grandTotal: 285500,
    sellerName: 'Nashik Farmer Producer Co (FPO)',
    status: 'IN_TRANSIT', // CONFIRMED | PICKUP | IN_TRANSIT | DELIVERED | COMPLETED
    paymentStatus: 'ESCROW_PAID', // PENDING | ESCROW_PAID | RELEASED
    pickupAddress: 'Nashik APMC Yard No 4',
    deliveryAddress: 'ABC Foods Warehouse, Chakan, Pune',
    orderedAt: '2026-08-29 14:30',
    logistics: {
      truckNumber: 'MH 04 AB 1234',
      driverName: 'Suresh Shinde',
      driverPhone: '+91 97654 32109',
      currentLocation: 'Khed Toll Plaza, Pune Highway',
      distanceRemainingKm: 42,
      eta: '2h 20m',
      status: 'ON TIME'
    },
    timeline: [
      { stage: 'ORDER_CREATED', time: '29 Aug 14:30', done: true, party: 'Buyer' },
      { stage: 'OFFER_ACCEPTED', time: '29 Aug 14:35', done: true, party: 'Seller' },
      { stage: 'ORDER_CONFIRMED', time: '29 Aug 14:40', done: true, party: 'System Escrow' },
      { stage: 'LOGISTICS_ASSIGNED', time: '29 Aug 16:00', done: true, party: 'KrishiExpress Transport' },
      { stage: 'PICKUP_COMPLETED', time: '30 Aug 09:15', done: true, party: 'Truck MH 04 AB 1234' },
      { stage: 'IN_TRANSIT', time: '30 Aug 11:30', done: true, party: 'In Transit' },
      { stage: 'DELIVERED', time: 'Pending', done: false, party: 'Chakan Warehouse' },
      { stage: 'QUALITY_CONFIRMED', time: 'Pending', done: false, party: 'Quality Inspector' },
      { stage: 'PAYMENT_RELEASED', time: 'Pending', done: false, party: 'Escrow System' }
    ]
  }
];

const INITIAL_TRANSACTIONS_DATA = [
  {
    id: 'tx-88901',
    orderId: 'ord-10245',
    date: '2026-08-29',
    seller: 'Nashik Farmer Producer Co',
    crop: 'Onion (100 Q)',
    amount: 285500,
    type: 'Escrow Deposit',
    status: 'COMPLETED',
    invoiceId: 'INV-2026-88901'
  },
  {
    id: 'tx-88742',
    orderId: 'ord-10112',
    date: '2026-08-15',
    seller: 'Deccan Grain Growers FPO',
    crop: 'Rice (200 Q)',
    amount: 574000,
    type: 'Bank Transfer',
    status: 'COMPLETED',
    invoiceId: 'INV-2026-88742'
  }
];

// ═════════════════════════════════════════════════════════════════════
// 2. SERVICE ABSTRACTION LAYER (API Ready)
// ═════════════════════════════════════════════════════════════════════

const buyerService = {
  getProfile() {
    return BUYER_PROFILE_DEMO;
  },
  updateProfile(data) {
    Object.assign(BUYER_PROFILE_DEMO, data);
    return BUYER_PROFILE_DEMO;
  },
  submitKyc(formData) {
    BUYER_PROFILE_DEMO.kycStatus = 'PENDING';
    BUYER_PROFILE_DEMO.kycSubmittedAt = new Date().toISOString().split('T')[0];
    return { success: true, status: 'PENDING', message: 'KYC submitted successfully and is currently under prototype review.' };
  },
  approveDemoKyc() {
    BUYER_PROFILE_DEMO.kycStatus = 'VERIFIED';
    return { success: true, status: 'VERIFIED' };
  }
};

const marketService = {
  getDashboardStats() {
    return {
      activeRequirements: 12,
      newMatchingLots: B2B_LOTS_DATA.length,
      offersPending: INITIAL_OFFERS_DATA.length,
      activeOrders: INITIAL_ORDERS_DATA.length,
      monthlyProcurement: '₹42.8L'
    };
  },
  getMarketplaceLots(filters = {}) {
    let lots = [...B2B_LOTS_DATA];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      lots = lots.filter(l => l.crop.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.sellerName.toLowerCase().includes(q));
    }
    if (filters.crop && filters.crop !== 'all') {
      lots = lots.filter(l => l.crop.toLowerCase() === filters.crop.toLowerCase());
    }
    if (filters.grade && filters.grade !== 'all') {
      lots = lots.filter(l => l.grade.toLowerCase().includes(filters.grade.toLowerCase()));
    }
    return lots;
  }
};

const lotService = {
  getLotById(lotId) {
    return B2B_LOTS_DATA.find(l => l.id === lotId) || B2B_LOTS_DATA[0];
  },
  calculateLandedCost(lot, customPricePerQ = null) {
    const pPerQ = customPricePerQ || lot.sellerAskPrice;
    const prodCost = pPerQ * lot.quantity;
    const transport = lot.estimatedTransportTotal;
    const cess = lot.mandiCessPerQ * lot.quantity;
    const grand = prodCost + transport + cess;
    const effectivePerQ = Math.round(grand / lot.quantity);

    return {
      quantity: lot.quantity,
      pricePerQ: pPerQ,
      productCost: prodCost,
      transportCost: transport,
      mandiCess: cess,
      grandTotal: grand,
      effectiveCostPerQ: effectivePerQ
    };
  }
};

const offerService = {
  getOffers() {
    return INITIAL_OFFERS_DATA;
  },
  createOffer(lotId, offerPricePerQ, note = '') {
    const lot = lotService.getLotById(lotId);
    const newOffer = {
      id: `off-${Date.now().toString().slice(-4)}`,
      lotId: lot.id,
      crop: lot.crop,
      quantity: lot.quantity,
      sellerName: lot.sellerName,
      sellerAsk: lot.sellerAskPrice,
      currentBuyerOffer: parseFloat(offerPricePerQ),
      status: 'NEGOTIATING',
      updatedAt: 'Just now',
      history: [
        { party: 'Seller', price: lot.sellerAskPrice, note: `Listed ask for ${lot.quantity}Q ${lot.crop}` },
        { party: 'Buyer', price: parseFloat(offerPricePerQ), note: note || 'Digital procurement bid submitted' }
      ]
    };
    INITIAL_OFFERS_DATA.unshift(newOffer);
    return newOffer;
  },
  acceptOffer(offerId) {
    const off = INITIAL_OFFERS_DATA.find(o => o.id === offerId);
    if (!off) return null;
    off.status = 'ACCEPTED';
    
    // Automatically create Order
    const lot = lotService.getLotById(off.lotId);
    const landed = lotService.calculateLandedCost(lot, off.currentBuyerOffer);

    const newOrder = {
      id: `ord-${Math.floor(10000 + Math.random() * 90000)}`,
      lotId: lot.id,
      crop: lot.crop,
      variety: lot.variety,
      quantity: lot.quantity,
      pricePerQ: off.currentBuyerOffer,
      productTotal: landed.productCost,
      transportCost: landed.transportCost,
      taxesTotal: landed.mandiCess,
      grandTotal: landed.grandTotal,
      sellerName: lot.sellerName,
      status: 'CONFIRMED',
      paymentStatus: 'ESCROW_PAID',
      pickupAddress: `${lot.mandi} Yard No 2`,
      deliveryAddress: 'ABC Foods Warehouse, Chakan, Pune',
      orderedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      logistics: {
        truckNumber: 'MH 12 CD 5678',
        driverName: 'Ramesh Patil',
        driverPhone: '+91 98111 22334',
        currentLocation: 'Mandi Pickup Terminal',
        distanceRemainingKm: lot.distanceKm,
        eta: '3h 10m',
        status: 'ASSIGNED'
      },
      timeline: [
        { stage: 'ORDER_CREATED', time: 'Just now', done: true, party: 'Buyer' },
        { stage: 'OFFER_ACCEPTED', time: 'Just now', done: true, party: 'Seller' },
        { stage: 'ORDER_CONFIRMED', time: 'Just now', done: true, party: 'Escrow System' },
        { stage: 'LOGISTICS_ASSIGNED', time: 'Pending', done: false, party: 'KrishiExpress' },
        { stage: 'PICKUP_COMPLETED', time: 'Pending', done: false, party: 'Carrier' },
        { stage: 'IN_TRANSIT', time: 'Pending', done: false, party: 'In Transit' },
        { stage: 'DELIVERED', time: 'Pending', done: false, party: 'Warehouse' },
        { stage: 'QUALITY_CONFIRMED', time: 'Pending', done: false, party: 'Inspector' },
        { stage: 'PAYMENT_RELEASED', time: 'Pending', done: false, party: 'Escrow System' }
      ]
    };

    INITIAL_ORDERS_DATA.unshift(newOrder);
    return { offer: off, order: newOrder };
  }
};

const orderService = {
  getOrders() {
    return INITIAL_ORDERS_DATA;
  },
  getOrderById(orderId) {
    return INITIAL_ORDERS_DATA.find(o => o.id === orderId) || INITIAL_ORDERS_DATA[0];
  }
};

const logisticsService = {
  getTrackingInfo(orderId) {
    const order = orderService.getOrderById(orderId);
    return order ? order.logistics : INITIAL_ORDERS_DATA[0].logistics;
  }
};

const paymentService = {
  getSummary() {
    return {
      totalProcurement: '₹42.8L',
      pendingEscrow: '₹2.85L',
      paidCompleted: '₹39.95L',
      transactionCount: INITIAL_TRANSACTIONS_DATA.length
    };
  },
  getTransactions() {
    return INITIAL_TRANSACTIONS_DATA;
  }
};
