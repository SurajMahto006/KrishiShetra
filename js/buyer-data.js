/**
 * KRISHILINK — B2B BUYER MODULE DATA SERVICES v2.2
 * Production-Grade Storage, Abstractions, and Business Logic
 */

// ═══════════════════════════════════════════════
// 1. BUYER PROFILE
// ═══════════════════════════════════════════════
const DEFAULT_BUYER_PROFILE = {
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
  kycStatus: 'VERIFIED',
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
  },
  preferences: {
    notifications: true,
    language: 'English',
    currency: 'INR',
    autoNegotiate: false
  }
};

let BUYER_PROFILE_DEMO = (() => {
  try {
    const saved = localStorage.getItem('krishi_buyer_profile');
    if (saved) return { ...DEFAULT_BUYER_PROFILE, ...JSON.parse(saved) };
  } catch (e) {}
  return { ...DEFAULT_BUYER_PROFILE };
})();

// ═══════════════════════════════════════════════
// 2. LOTS DATA (8 realistic lots)
// ═══════════════════════════════════════════════
const B2B_LOTS_DATA = [
  {
    id: 'lot-101', crop: 'Onion', variety: 'Red Garwa', emoji: '🧅',
    grade: 'Grade A', quantity: 100, unit: 'Quintals',
    sellerAskPrice: 2750, marketRefPrice: 2650,
    marketRangeMin: 2600, marketRangeMax: 2800,
    mandiCessPerQ: 15, location: 'Nashik, Maharashtra',
    mandi: 'Nashik APMC', distanceKm: 42,
    estimatedTransportTotal: 4000, otherCostTotal: 1500,
    sellerName: 'Nashik Farmer Producer Co (FPO)',
    sellerVerified: true, sellerTrustScore: 92,
    sellerCompletedOrders: 48, disputeRate: '0.4%',
    aiMatchPct: 94, harvestDate: '2026-08-24',
    availableUntil: '2026-09-05',
    image: 'assets/images/crop-onion.jpg',
    lat: 19.9975, lng: 73.7898,
    qualityMetrics: { moisturePct: '12%', sizeMm: '45–60mm', defectsPct: 'Low (< 1.5%)', aiConfidencePct: 91 },
    trustBreakdown: { verification: 95, paymentReliability: 90, orderCompletion: 94, transactionHistory: 88 }
  },
  {
    id: 'lot-102', crop: 'Wheat', variety: 'Lokwan Premium', emoji: '🌾',
    grade: 'Grade A', quantity: 250, unit: 'Quintals',
    sellerAskPrice: 2680, marketRefPrice: 2650,
    marketRangeMin: 2580, marketRangeMax: 2720,
    mandiCessPerQ: 12, location: 'Nashik, Maharashtra',
    mandi: 'Nashik APMC', distanceKm: 65,
    estimatedTransportTotal: 8500, otherCostTotal: 2200,
    sellerName: 'Sahyadri Agro Farmers Union',
    sellerVerified: true, sellerTrustScore: 96,
    sellerCompletedOrders: 112, disputeRate: '0.1%',
    aiMatchPct: 89, harvestDate: '2026-08-20',
    availableUntil: '2026-09-10',
    image: 'assets/images/crop-wheat.jpg',
    lat: 20.0050, lng: 73.7700,
    qualityMetrics: { moisturePct: '8.5%', sizeMm: 'Clean Bold Grains', defectsPct: 'Nil (< 0.5%)', aiConfidencePct: 95 },
    trustBreakdown: { verification: 98, paymentReliability: 96, orderCompletion: 97, transactionHistory: 94 }
  },
  {
    id: 'lot-103', crop: 'Soybean', variety: 'JS 335 Organic', emoji: '🫘',
    grade: 'Grade A+', quantity: 300, unit: 'Quintals',
    sellerAskPrice: 4700, marketRefPrice: 4650,
    marketRangeMin: 4550, marketRangeMax: 4800,
    mandiCessPerQ: 20, location: 'Indore, Madhya Pradesh',
    mandi: 'Indore Mandi', distanceKm: 520,
    estimatedTransportTotal: 32000, otherCostTotal: 4500,
    sellerName: 'Malwa Organic Sourcing Co-op',
    sellerVerified: true, sellerTrustScore: 95,
    sellerCompletedOrders: 86, disputeRate: '0.2%',
    aiMatchPct: 92, harvestDate: '2026-08-18',
    availableUntil: '2026-09-15',
    image: 'assets/images/crop-soybean.jpg',
    lat: 22.7196, lng: 75.8577,
    qualityMetrics: { moisturePct: '9.2%', sizeMm: '19.8% Oil', defectsPct: 'Low (< 1.0%)', aiConfidencePct: 93 },
    trustBreakdown: { verification: 96, paymentReliability: 94, orderCompletion: 95, transactionHistory: 92 }
  },
  {
    id: 'lot-104', crop: 'Rice', variety: 'Sona Masoori Raw', emoji: '🍚',
    grade: 'Grade A', quantity: 400, unit: 'Quintals',
    sellerAskPrice: 2890, marketRefPrice: 2850,
    marketRangeMin: 2800, marketRangeMax: 2950,
    mandiCessPerQ: 14, location: 'Pune, Maharashtra',
    mandi: 'Pune APMC', distanceKm: 18,
    estimatedTransportTotal: 4500, otherCostTotal: 1800,
    sellerName: 'Deccan Grain Growers FPO',
    sellerVerified: true, sellerTrustScore: 94,
    sellerCompletedOrders: 64, disputeRate: '0.3%',
    aiMatchPct: 96, harvestDate: '2026-08-22',
    availableUntil: '2026-09-08',
    image: 'assets/images/crop-rice.jpg',
    lat: 18.5204, lng: 73.8567,
    qualityMetrics: { moisturePct: '11.0%', sizeMm: 'Broken < 3%', defectsPct: 'Nil', aiConfidencePct: 94 },
    trustBreakdown: { verification: 94, paymentReliability: 93, orderCompletion: 96, transactionHistory: 90 }
  },
  {
    id: 'lot-105', crop: 'Chilli', variety: 'Teja Red Dry', emoji: '🌶️',
    grade: 'Export Grade', quantity: 80, unit: 'Quintals',
    sellerAskPrice: 8650, marketRefPrice: 8500,
    marketRangeMin: 8300, marketRangeMax: 8850,
    mandiCessPerQ: 35, location: 'Guntur, Andhra Pradesh',
    mandi: 'Guntur APMC', distanceKm: 720,
    estimatedTransportTotal: 28000, otherCostTotal: 3800,
    sellerName: 'Guntur Spice Traders Association',
    sellerVerified: true, sellerTrustScore: 97,
    sellerCompletedOrders: 140, disputeRate: '0.1%',
    aiMatchPct: 88, harvestDate: '2026-08-15',
    availableUntil: '2026-09-20',
    image: 'assets/images/crop-chilli.jpg',
    lat: 16.3067, lng: 80.4365,
    qualityMetrics: { moisturePct: '9.0%', sizeMm: 'ASTA 120+', defectsPct: 'SHU 45,000', aiConfidencePct: 96 },
    trustBreakdown: { verification: 98, paymentReliability: 97, orderCompletion: 98, transactionHistory: 96 }
  },
  {
    id: 'lot-106', crop: 'Potato', variety: 'Kufri Jyoti', emoji: '🥔',
    grade: 'Grade A', quantity: 200, unit: 'Quintals',
    sellerAskPrice: 1950, marketRefPrice: 1900,
    marketRangeMin: 1850, marketRangeMax: 2000,
    mandiCessPerQ: 10, location: 'Pune, Maharashtra',
    mandi: 'Pune APMC', distanceKm: 22,
    estimatedTransportTotal: 3200, otherCostTotal: 1200,
    sellerName: 'Western Maharashtra FPO Alliance',
    sellerVerified: false, sellerTrustScore: 91,
    sellerCompletedOrders: 56, disputeRate: '0.5%',
    aiMatchPct: 85, harvestDate: '2026-08-26',
    availableUntil: '2026-09-12',
    image: 'assets/images/crop-potato.jpg',
    lat: 18.5204, lng: 73.8567,
    qualityMetrics: { moisturePct: '78% (fresh)', sizeMm: '40–60mm', defectsPct: 'Low (< 2%)', aiConfidencePct: 88 },
    trustBreakdown: { verification: 92, paymentReliability: 89, orderCompletion: 93, transactionHistory: 87 }
  },
  {
    id: 'lot-107', crop: 'Tomato', variety: 'Hybrid Abhinav', emoji: '🍅',
    grade: 'Grade A', quantity: 150, unit: 'Quintals',
    sellerAskPrice: 2800, marketRefPrice: 2700,
    marketRangeMin: 2600, marketRangeMax: 2900,
    mandiCessPerQ: 12, location: 'Ahmednagar, Maharashtra',
    mandi: 'Ahmednagar APMC', distanceKm: 95,
    estimatedTransportTotal: 7800, otherCostTotal: 2000,
    sellerName: 'Ahmednagar Tomato Growers FPO',
    sellerVerified: true, sellerTrustScore: 89,
    sellerCompletedOrders: 38, disputeRate: '0.6%',
    aiMatchPct: 91, harvestDate: '2026-08-28',
    availableUntil: '2026-09-04',
    image: 'assets/images/crop-tomato.jpg',
    lat: 19.0955, lng: 74.7496,
    qualityMetrics: { moisturePct: '92% (fresh)', sizeMm: '55–75mm', defectsPct: 'Low (< 1.8%)', aiConfidencePct: 90 },
    trustBreakdown: { verification: 90, paymentReliability: 87, orderCompletion: 91, transactionHistory: 85 }
  },
  {
    id: 'lot-108', crop: 'Cotton', variety: 'Shankar-6 MCU', emoji: '🏵️',
    grade: 'Grade A', quantity: 500, unit: 'Quintals',
    sellerAskPrice: 6800, marketRefPrice: 6700,
    marketRangeMin: 6500, marketRangeMax: 7000,
    mandiCessPerQ: 25, location: 'Nagpur, Maharashtra',
    mandi: 'Nagpur APMC', distanceKm: 680,
    estimatedTransportTotal: 42000, otherCostTotal: 5500,
    sellerName: 'Vidarbha Cotton Farmers Consortium',
    sellerVerified: true, sellerTrustScore: 93,
    sellerCompletedOrders: 72, disputeRate: '0.3%',
    aiMatchPct: 82, harvestDate: '2026-08-12',
    availableUntil: '2026-10-01',
    image: 'assets/images/crop-cotton.jpg',
    lat: 21.1458, lng: 79.0882,
    qualityMetrics: { moisturePct: '7.5%', sizeMm: 'Staple 28mm+', defectsPct: 'Nil (< 0.5%)', aiConfidencePct: 92 },
    trustBreakdown: { verification: 94, paymentReliability: 92, orderCompletion: 95, transactionHistory: 91 }
  }
];

// ═══════════════════════════════════════════════
// 3. OFFERS DATA
// ═══════════════════════════════════════════════
const INITIAL_OFFERS_DATA = [
  {
    id: 'off-501', lotId: 'lot-101', crop: 'Onion', quantity: 100,
    sellerName: 'Nashik Farmer Producer Co (FPO)',
    sellerAsk: 2750, currentBuyerOffer: 2725,
    status: 'NEGOTIATING', updatedAt: '10 mins ago',
    history: [
      { party: 'Seller', price: 2750, note: 'Listed ask price for 100Q Grade A Onion' },
      { party: 'Buyer', price: 2700, note: 'Initial procurement bid' },
      { party: 'Seller', price: 2735, note: 'Counter: High demand in Nashik mandi this week' },
      { party: 'Buyer', price: 2725, note: 'Final revised counter offer' }
    ]
  },
  {
    id: 'off-502', lotId: 'lot-104', crop: 'Rice', quantity: 200,
    sellerName: 'Deccan Grain Growers FPO',
    sellerAsk: 2890, currentBuyerOffer: 2870,
    status: 'ACCEPTED', updatedAt: '2 hours ago',
    history: [
      { party: 'Seller', price: 2890, note: 'Listed ask price for 200Q Sona Masoori' },
      { party: 'Buyer', price: 2850, note: 'Procurement bid for 200Q' },
      { party: 'Seller', price: 2870, note: 'Final counter offer' },
      { party: 'Buyer', price: 2870, note: 'Accepted seller counter offer' }
    ]
  },
  {
    id: 'off-503', lotId: 'lot-106', crop: 'Potato', quantity: 200,
    sellerName: 'Western Maharashtra FPO Alliance',
    sellerAsk: 1950, currentBuyerOffer: 1880,
    status: 'REJECTED', updatedAt: '1 day ago',
    history: [
      { party: 'Seller', price: 1950, note: 'Listed price for 200Q Kufri Jyoti' },
      { party: 'Buyer', price: 1880, note: 'Bid below market range' },
      { party: 'Seller', price: 0, note: 'Rejected: Offer below acceptable range' }
    ]
  },
  {
    id: 'off-504', lotId: 'lot-107', crop: 'Tomato', quantity: 150,
    sellerName: 'Ahmednagar Tomato Growers FPO',
    sellerAsk: 2800, currentBuyerOffer: 2780,
    status: 'NEGOTIATING', updatedAt: '35 mins ago',
    history: [
      { party: 'Seller', price: 2800, note: 'Listed ask price for 150Q Hybrid Abhinav' },
      { party: 'Buyer', price: 2750, note: 'Initial procurement bid' },
      { party: 'Seller', price: 2790, note: 'Counter: Perishable lot, premium quality' },
      { party: 'Buyer', price: 2780, note: 'Revised counter offer' }
    ]
  }
];

// ═══════════════════════════════════════════════
// 4. ORDERS DATA
// ═══════════════════════════════════════════════
const INITIAL_ORDERS_DATA = [
  {
    id: 'ord-10245', lotId: 'lot-101', crop: 'Onion', variety: 'Red Garwa',
    quantity: 100, pricePerQ: 2800,
    productTotal: 280000, transportCost: 4000, taxesTotal: 1500,
    grandTotal: 285500,
    sellerName: 'Nashik Farmer Producer Co (FPO)',
    status: 'IN_TRANSIT', paymentStatus: 'ESCROW_PAID',
    pickupAddress: 'Nashik APMC Yard No 4',
    deliveryAddress: 'ABC Foods Warehouse, Chakan, Pune',
    orderedAt: '2026-08-29 14:30',
    logistics: {
      truckNumber: 'MH 04 AB 1234', driverName: 'Suresh Shinde',
      driverPhone: '+91 97654 32109',
      currentLocation: 'Khed Toll Plaza, Pune Highway',
      distanceRemainingKm: 42, eta: '2h 20m', status: 'ON TIME'
    },
    timeline: [
      { stage: 'ORDER_CREATED', label: 'Order Created', time: '29 Aug 14:30', done: true, party: 'Buyer' },
      { stage: 'OFFER_ACCEPTED', label: 'Offer Accepted', time: '29 Aug 14:35', done: true, party: 'Seller' },
      { stage: 'ORDER_CONFIRMED', label: 'Order Confirmed', time: '29 Aug 14:40', done: true, party: 'Escrow System' },
      { stage: 'LOGISTICS_ASSIGNED', label: 'Logistics Assigned', time: '29 Aug 16:00', done: true, party: 'KrishiExpress' },
      { stage: 'PICKUP_COMPLETED', label: 'Pickup Completed', time: '30 Aug 09:15', done: true, party: 'Truck MH 04 AB 1234' },
      { stage: 'IN_TRANSIT', label: 'In Transit', time: '30 Aug 11:30', done: true, active: true, party: 'In Transit' },
      { stage: 'DELIVERED', label: 'Delivered', time: 'Pending', done: false, party: 'Chakan Warehouse' },
      { stage: 'QUALITY_CONFIRMED', label: 'Quality Confirmed', time: 'Pending', done: false, party: 'Inspector' },
      { stage: 'PAYMENT_RELEASED', label: 'Payment Released', time: 'Pending', done: false, party: 'Escrow System' }
    ]
  },
  {
    id: 'ord-10112', lotId: 'lot-104', crop: 'Rice', variety: 'Sona Masoori',
    quantity: 200, pricePerQ: 2870,
    productTotal: 574000, transportCost: 4500, taxesTotal: 2800,
    grandTotal: 581300,
    sellerName: 'Deccan Grain Growers FPO',
    status: 'DELIVERED', paymentStatus: 'RELEASED',
    pickupAddress: 'Pune APMC Yard No 2',
    deliveryAddress: 'ABC Foods Warehouse, Chakan, Pune',
    orderedAt: '2026-08-15 10:00',
    logistics: {
      truckNumber: 'MH 12 EF 5678', driverName: 'Ramesh Sawant',
      driverPhone: '+91 98111 22334',
      currentLocation: 'Delivered at Chakan Facility',
      distanceRemainingKm: 0, eta: 'Delivered', status: 'DELIVERED'
    },
    timeline: [
      { stage: 'ORDER_CREATED', label: 'Order Created', time: '15 Aug 10:00', done: true, party: 'Buyer' },
      { stage: 'OFFER_ACCEPTED', label: 'Offer Accepted', time: '15 Aug 10:05', done: true, party: 'Seller' },
      { stage: 'ORDER_CONFIRMED', label: 'Order Confirmed', time: '15 Aug 10:10', done: true, party: 'Escrow' },
      { stage: 'LOGISTICS_ASSIGNED', label: 'Logistics Assigned', time: '15 Aug 12:00', done: true, party: 'KrishiExpress' },
      { stage: 'PICKUP_COMPLETED', label: 'Pickup Completed', time: '16 Aug 08:30', done: true, party: 'MH 12 EF 5678' },
      { stage: 'IN_TRANSIT', label: 'In Transit', time: '16 Aug 09:00', done: true, party: 'In Transit' },
      { stage: 'DELIVERED', label: 'Delivered', time: '16 Aug 11:45', done: true, party: 'Chakan Warehouse' },
      { stage: 'QUALITY_CONFIRMED', label: 'Quality Confirmed', time: '16 Aug 14:00', done: true, party: 'Inspector' },
      { stage: 'PAYMENT_RELEASED', label: 'Payment Released', time: '17 Aug 10:00', done: true, party: 'Escrow System' }
    ]
  },
  {
    id: 'ord-10340', lotId: 'lot-102', crop: 'Wheat', variety: 'Lokwan Premium',
    quantity: 250, pricePerQ: 2680,
    productTotal: 670000, transportCost: 8500, taxesTotal: 3000,
    grandTotal: 681500,
    sellerName: 'Sahyadri Agro Farmers Union',
    status: 'CONFIRMED', paymentStatus: 'ESCROW_PAID',
    pickupAddress: 'Nashik APMC Yard No 7',
    deliveryAddress: 'ABC Foods Warehouse, Chakan, Pune',
    orderedAt: '2026-08-30 09:00',
    logistics: {
      truckNumber: 'Pending Assignment', driverName: 'Carrier Dispatch',
      driverPhone: '+91 98222 33445',
      currentLocation: 'Awaiting Mandi Loading',
      distanceRemainingKm: 65, eta: '4h 15m', status: 'ASSIGNED'
    },
    timeline: [
      { stage: 'ORDER_CREATED', label: 'Order Created', time: '30 Aug 09:00', done: true, party: 'Buyer' },
      { stage: 'OFFER_ACCEPTED', label: 'Offer Accepted', time: '30 Aug 09:05', done: true, party: 'Seller' },
      { stage: 'ORDER_CONFIRMED', label: 'Order Confirmed', time: '30 Aug 09:10', done: true, active: true, party: 'Escrow' },
      { stage: 'LOGISTICS_ASSIGNED', label: 'Logistics Assigned', time: 'Pending', done: false, party: 'KrishiExpress' },
      { stage: 'PICKUP_COMPLETED', label: 'Pickup Completed', time: 'Pending', done: false, party: 'Carrier' },
      { stage: 'IN_TRANSIT', label: 'In Transit', time: 'Pending', done: false, party: 'In Transit' },
      { stage: 'DELIVERED', label: 'Delivered', time: 'Pending', done: false, party: 'Warehouse' },
      { stage: 'QUALITY_CONFIRMED', label: 'Quality Confirmed', time: 'Pending', done: false, party: 'Inspector' },
      { stage: 'PAYMENT_RELEASED', label: 'Payment Released', time: 'Pending', done: false, party: 'Escrow' }
    ]
  }
];

// ═══════════════════════════════════════════════
// 5. TRANSACTIONS DATA
// ═══════════════════════════════════════════════
const INITIAL_TRANSACTIONS_DATA = [
  { id: 'tx-88901', orderId: 'ord-10245', date: '2026-08-29', seller: 'Nashik Farmer Producer Co', crop: 'Onion (100 Q)', amount: 285500, type: 'Escrow Deposit', status: 'HELD', invoiceId: 'INV-2026-88901' },
  { id: 'tx-88742', orderId: 'ord-10112', date: '2026-08-17', seller: 'Deccan Grain Growers FPO', crop: 'Rice (200 Q)', amount: 581300, type: 'Bank Transfer', status: 'COMPLETED', invoiceId: 'INV-2026-88742' },
  { id: 'tx-88850', orderId: 'ord-10340', date: '2026-08-30', seller: 'Sahyadri Agro Farmers Union', crop: 'Wheat (250 Q)', amount: 681500, type: 'Escrow Deposit', status: 'HELD', invoiceId: 'INV-2026-88850' },
  { id: 'tx-87610', orderId: 'ord-10050', date: '2026-08-01', seller: 'Pune Vegetable Growers FPO', crop: 'Potato (150 Q)', amount: 292500, type: 'Bank Transfer', status: 'COMPLETED', invoiceId: 'INV-2026-87610' },
  { id: 'tx-87520', orderId: 'ord-10002', date: '2026-07-25', seller: 'Nashik Onion Traders', crop: 'Onion (200 Q)', amount: 540000, type: 'Bank Transfer', status: 'COMPLETED', invoiceId: 'INV-2026-87520' }
];

// ═══════════════════════════════════════════════
// 6. NOTIFICATIONS DATA
// ═══════════════════════════════════════════════
const NOTIFICATIONS_DATA = [
  { id: 'n1', type: 'lot', route: '#/buyer/lots/lot-101', iconName: 'sprout', text: '12 new Onion lots matching your requirements posted in Nashik APMC', time: '5 min ago', unread: true },
  { id: 'n2', type: 'offer', route: '#/buyer/offers', iconName: 'message-square', text: 'Seller counter-offered ₹2,735/Q on your Onion bid (Lot #101)', time: '10 min ago', unread: true },
  { id: 'n3', type: 'order', route: '#/buyer/logistics', iconName: 'truck', text: 'Order ORD-10245 is now In Transit — ETA 2h 20m', time: '30 min ago', unread: true },
  { id: 'n4', type: 'lot', route: '#/buyer/marketplace', iconName: 'trending-up', text: 'Wheat prices dropped 2.1% in Nashik APMC today', time: '1 hour ago', unread: false },
  { id: 'n5', type: 'order', route: '#/buyer/payments', iconName: 'check-circle-2', text: 'Payment released for Order ORD-10112 (Rice 200Q)', time: '2 hours ago', unread: false }
];

// ═══════════════════════════════════════════════
// 7. SEARCH INDEX
// ═══════════════════════════════════════════════
const SEARCH_INDEX = [
  { type: 'crop', label: 'Onion — Red Garwa (Nashik APMC)', iconName: 'leaf', route: '#/buyer/lots/lot-101' },
  { type: 'crop', label: 'Wheat — Lokwan Premium (Nashik APMC)', iconName: 'leaf', route: '#/buyer/lots/lot-102' },
  { type: 'crop', label: 'Soybean — JS 335 (Indore Mandi)', iconName: 'leaf', route: '#/buyer/lots/lot-103' },
  { type: 'crop', label: 'Rice — Sona Masoori (Pune APMC)', iconName: 'leaf', route: '#/buyer/lots/lot-104' },
  { type: 'crop', label: 'Chilli — Teja Red Dry (Guntur APMC)', iconName: 'leaf', route: '#/buyer/lots/lot-105' },
  { type: 'crop', label: 'Potato — Kufri Jyoti (Pune APMC)', iconName: 'leaf', route: '#/buyer/lots/lot-106' },
  { type: 'crop', label: 'Tomato — Hybrid Abhinav (Ahmednagar APMC)', iconName: 'leaf', route: '#/buyer/lots/lot-107' },
  { type: 'crop', label: 'Cotton — Shankar-6 MCU (Nagpur APMC)', iconName: 'leaf', route: '#/buyer/lots/lot-108' },
  { type: 'location', label: 'Nashik APMC Mandi, Maharashtra', iconName: 'map-pin', route: '#/buyer/marketplace' },
  { type: 'location', label: 'Pune APMC Yard, Maharashtra', iconName: 'map-pin', route: '#/buyer/marketplace' },
  { type: 'location', label: 'Indore APMC Mandi, Madhya Pradesh', iconName: 'map-pin', route: '#/buyer/marketplace' },
  { type: 'location', label: 'Guntur APMC Yard, Andhra Pradesh', iconName: 'map-pin', route: '#/buyer/marketplace' },
  { type: 'seller', label: 'Nashik Farmer Producer Co (FPO)', iconName: 'building-2', route: '#/buyer/lots/lot-101' },
  { type: 'seller', label: 'Sahyadri Agro Farmers Union', iconName: 'building-2', route: '#/buyer/lots/lot-102' },
  { type: 'seller', label: 'Deccan Grain Growers FPO', iconName: 'building-2', route: '#/buyer/lots/lot-104' }
];

// ═══════════════════════════════════════════════
// 8. DATA SERVICES
// ═══════════════════════════════════════════════

const buyerService = {
  getProfile() {
    return BUYER_PROFILE_DEMO;
  },
  updateProfile(data) {
    Object.assign(BUYER_PROFILE_DEMO, data);
    try {
      localStorage.setItem('krishi_buyer_profile', JSON.stringify(BUYER_PROFILE_DEMO));
    } catch (e) {}
    return BUYER_PROFILE_DEMO;
  },
  updateSourcingRequirements(req) {
    BUYER_PROFILE_DEMO.sourcingRequirements = { ...BUYER_PROFILE_DEMO.sourcingRequirements, ...req };
    try {
      localStorage.setItem('krishi_buyer_profile', JSON.stringify(BUYER_PROFILE_DEMO));
    } catch (e) {}
    return BUYER_PROFILE_DEMO.sourcingRequirements;
  },
  getSavedLots() {
    try {
      const saved = localStorage.getItem('krishi_saved_lots');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['lot-101', 'lot-102'];
  },
  isLotSaved(lotId) {
    const list = this.getSavedLots();
    return list.includes(lotId);
  },
  toggleSaveLot(lotId) {
    let list = this.getSavedLots();
    const isCurrentlySaved = list.includes(lotId);
    if (isCurrentlySaved) {
      list = list.filter(id => id !== lotId);
    } else {
      list.push(lotId);
    }
    try {
      localStorage.setItem('krishi_saved_lots', JSON.stringify(list));
    } catch (e) {}
    return !isCurrentlySaved;
  },
  submitKyc(formData = {}) {
    BUYER_PROFILE_DEMO.kycStatus = 'VERIFIED';
    BUYER_PROFILE_DEMO.kycSubmittedAt = new Date().toISOString().split('T')[0];
    if (formData.companyName) BUYER_PROFILE_DEMO.companyName = formData.companyName;
    if (formData.gstin) BUYER_PROFILE_DEMO.gstin = formData.gstin;
    if (formData.pan) BUYER_PROFILE_DEMO.pan = formData.pan;
    if (formData.accountNumber && BUYER_PROFILE_DEMO.bankDetails) {
      BUYER_PROFILE_DEMO.bankDetails.accountNumber = formData.accountNumber;
    }
    try {
      localStorage.setItem('krishi_buyer_profile', JSON.stringify(BUYER_PROFILE_DEMO));
    } catch (e) {}
    return { success: true, status: 'VERIFIED', message: 'KYC verified successfully.' };
  },
  approveDemoKyc() {
    BUYER_PROFILE_DEMO.kycStatus = 'VERIFIED';
    try {
      localStorage.setItem('krishi_buyer_profile', JSON.stringify(BUYER_PROFILE_DEMO));
    } catch (e) {}
    return { success: true, status: 'VERIFIED' };
  }
};

const marketService = {
  getDashboardStats() {
    const totalVolume = INITIAL_TRANSACTIONS_DATA.reduce((acc, t) => acc + t.amount, 0);
    const volumeLakhs = (totalVolume / 100000).toFixed(1);
    return {
      activeRequirements: 12,
      newMatchingLots: B2B_LOTS_DATA.length,
      offersPending: INITIAL_OFFERS_DATA.filter(o => o.status === 'NEGOTIATING').length,
      activeOrders: INITIAL_ORDERS_DATA.filter(o => o.status !== 'DELIVERED').length,
      monthlyProcurement: `₹${volumeLakhs}L`
    };
  },
  getMarketSnapshot() {
    return [
      { crop: 'Onion', iconName: 'sprout', grade: 'Grade A', price: '₹2,650/Q', trend: '↑ 8.2%', trendUp: true, demand: 'High Demand', lots: 12 },
      { crop: 'Potato', iconName: 'sprout', grade: 'Grade A', price: '₹1,950/Q', trend: '↓ 2.1%', trendUp: false, demand: 'Stable', lots: 8 },
      { crop: 'Tomato', iconName: 'sprout', grade: 'Grade A', price: '₹2,800/Q', trend: '↑ 4.4%', trendUp: true, demand: 'High Demand', lots: 10 },
      { crop: 'Wheat', iconName: 'sprout', grade: 'Grade A', price: '₹2,650/Q', trend: '↑ 1.8%', trendUp: true, demand: 'Medium', lots: 18 },
      { crop: 'Rice', iconName: 'sprout', grade: 'Grade A', price: '₹2,850/Q', trend: '↑ 3.5%', trendUp: true, demand: 'High Demand', lots: 15 }
    ];
  },
  getMarketplaceLots(filters = {}) {
    let lots = [...B2B_LOTS_DATA];
    
    // Keyword search
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      lots = lots.filter(l => 
        l.crop.toLowerCase().includes(q) || 
        l.location.toLowerCase().includes(q) || 
        l.mandi.toLowerCase().includes(q) || 
        l.sellerName.toLowerCase().includes(q) || 
        l.variety.toLowerCase().includes(q)
      );
    }

    // Crop filter
    if (filters.crop && filters.crop !== 'all') {
      lots = lots.filter(l => l.crop.toLowerCase() === filters.crop.toLowerCase());
    }

    // Grade filter
    if (filters.grade && filters.grade !== 'all') {
      lots = lots.filter(l => l.grade.toLowerCase().includes(filters.grade.toLowerCase()));
    }

    // Seller verification
    if (filters.sellerVerified === 'verified') {
      lots = lots.filter(l => l.sellerVerified === true);
    }

    // Distance filter
    if (filters.maxDistance && filters.maxDistance !== 'all') {
      const maxD = parseInt(filters.maxDistance, 10);
      if (!isNaN(maxD)) lots = lots.filter(l => l.distanceKm <= maxD);
    }

    // Sorting
    const sort = filters.sort || 'match';
    if (sort === 'price-asc') {
      lots.sort((a, b) => a.sellerAskPrice - b.sellerAskPrice);
    } else if (sort === 'price-desc') {
      lots.sort((a, b) => b.sellerAskPrice - a.sellerAskPrice);
    } else if (sort === 'trust') {
      lots.sort((a, b) => b.sellerTrustScore - a.sellerTrustScore);
    } else if (sort === 'distance') {
      lots.sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      // Default: AI Match score
      lots.sort((a, b) => b.aiMatchPct - a.aiMatchPct);
    }

    return lots;
  }
};

const lotService = {
  getLotById(lotId) {
    return B2B_LOTS_DATA.find(l => l.id === lotId) || B2B_LOTS_DATA[0];
  },
  calculateLandedCost(lot, customPricePerQ = null) {
    const pPerQ = customPricePerQ !== null ? customPricePerQ : lot.sellerAskPrice;
    const prodCost = Math.round(pPerQ * lot.quantity);
    const transport = lot.estimatedTransportTotal;
    const cess = Math.round(lot.mandiCessPerQ * lot.quantity);
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
  getOffers(statusFilter = 'all') {
    if (statusFilter === 'all') return INITIAL_OFFERS_DATA;
    return INITIAL_OFFERS_DATA.filter(o => o.status === statusFilter);
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
        { party: 'Buyer', price: parseFloat(offerPricePerQ), note: note || 'Digital procurement bid submitted via KrishiLink' }
      ]
    };
    INITIAL_OFFERS_DATA.unshift(newOffer);
    return newOffer;
  },
  counterOffer(offerId, newPrice, note = '') {
    const off = INITIAL_OFFERS_DATA.find(o => o.id === offerId);
    if (!off) return null;
    off.currentBuyerOffer = parseFloat(newPrice);
    off.status = 'NEGOTIATING';
    off.updatedAt = 'Just now';
    off.history.push({
      party: 'Buyer',
      price: parseFloat(newPrice),
      note: note || `Counter offer submitted at ₹${newPrice}/Q`
    });
    return off;
  },
  withdrawOffer(offerId) {
    const off = INITIAL_OFFERS_DATA.find(o => o.id === offerId);
    if (!off) return null;
    off.status = 'WITHDRAWN';
    off.updatedAt = 'Just now';
    off.history.push({
      party: 'Buyer',
      price: 0,
      note: 'Offer withdrawn by buyer'
    });
    return off;
  },
  acceptOffer(offerId) {
    const off = INITIAL_OFFERS_DATA.find(o => o.id === offerId);
    if (!off) return null;
    off.status = 'ACCEPTED';
    off.updatedAt = 'Just now';
    
    const lot = lotService.getLotById(off.lotId);
    const landed = lotService.calculateLandedCost(lot, off.currentBuyerOffer);
    
    const newOrderId = `ord-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: newOrderId,
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
      pickupAddress: `${lot.mandi} Yard No ${Math.floor(1 + Math.random() * 8)}`,
      deliveryAddress: 'ABC Foods Warehouse, Chakan, Pune',
      orderedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      logistics: {
        truckNumber: 'MH 12 CD 5678',
        driverName: 'Ramesh Patil',
        driverPhone: '+91 98111 22334',
        currentLocation: 'Mandi Pickup Terminal',
        distanceRemainingKm: lot.distanceKm,
        eta: `${Math.ceil(lot.distanceKm / 35)}h 15m`,
        status: 'ASSIGNED'
      },
      timeline: [
        { stage: 'ORDER_CREATED', label: 'Order Created', time: 'Just now', done: true, party: 'Buyer' },
        { stage: 'OFFER_ACCEPTED', label: 'Offer Accepted', time: 'Just now', done: true, party: 'Seller' },
        { stage: 'ORDER_CONFIRMED', label: 'Order Confirmed', time: 'Just now', done: true, active: true, party: 'Escrow System' },
        { stage: 'LOGISTICS_ASSIGNED', label: 'Logistics Assigned', time: 'Pending', done: false, party: 'KrishiExpress' },
        { stage: 'PICKUP_COMPLETED', label: 'Pickup Completed', time: 'Pending', done: false, party: 'Carrier' },
        { stage: 'IN_TRANSIT', label: 'In Transit', time: 'Pending', done: false, party: 'In Transit' },
        { stage: 'DELIVERED', label: 'Delivered', time: 'Pending', done: false, party: 'Warehouse' },
        { stage: 'QUALITY_CONFIRMED', label: 'Quality Confirmed', time: 'Pending', done: false, party: 'Inspector' },
        { stage: 'PAYMENT_RELEASED', label: 'Payment Released', time: 'Pending', done: false, party: 'Escrow System' }
      ]
    };

    INITIAL_ORDERS_DATA.unshift(newOrder);

    // Add Escrow record
    paymentService.addEscrowTransaction({
      orderId: newOrderId,
      seller: lot.sellerName,
      crop: `${lot.crop} (${lot.quantity} Q)`,
      amount: landed.grandTotal
    });

    return { offer: off, order: newOrder };
  }
};

const orderService = {
  getOrders(statusFilter = 'all') {
    if (statusFilter === 'all') return INITIAL_ORDERS_DATA;
    return INITIAL_ORDERS_DATA.filter(o => o.status === statusFilter);
  },
  getOrderById(orderId) {
    return INITIAL_ORDERS_DATA.find(o => o.id === orderId) || INITIAL_ORDERS_DATA[0];
  },
  confirmQualityAndRelease(orderId) {
    const o = INITIAL_ORDERS_DATA.find(ord => ord.id === orderId);
    if (!o) return null;
    o.status = 'DELIVERED';
    o.paymentStatus = 'RELEASED';
    o.timeline.forEach(t => {
      t.done = true;
      t.active = false;
      if (t.time === 'Pending') t.time = 'Completed';
    });
    // Add completed transaction in ledger
    paymentService.releaseEscrowForOrder(orderId);
    return o;
  }
};

const logisticsService = {
  getTrackingInfo(orderId) {
    const order = orderService.getOrderById(orderId);
    return order ? {
      ...order.logistics,
      orderId: order.id,
      crop: order.crop,
      variety: order.variety,
      quantity: order.quantity,
      sellerName: order.sellerName,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress
    } : null;
  }
};

const paymentService = {
  getSummary() {
    const completed = INITIAL_TRANSACTIONS_DATA.filter(t => t.status === 'COMPLETED');
    const held = INITIAL_TRANSACTIONS_DATA.filter(t => t.status === 'HELD');
    const totalAmount = INITIAL_TRANSACTIONS_DATA.reduce((s, t) => s + t.amount, 0);
    return {
      totalProcurement: `₹${(totalAmount / 100000).toFixed(1)}L`,
      pendingEscrow: `₹${(held.reduce((s, t) => s + t.amount, 0) / 100000).toFixed(1)}L`,
      paidCompleted: `₹${(completed.reduce((s, t) => s + t.amount, 0) / 100000).toFixed(1)}L`,
      transactionCount: INITIAL_TRANSACTIONS_DATA.length
    };
  },
  getTransactions(filter = 'all') {
    if (filter === 'all') return INITIAL_TRANSACTIONS_DATA;
    return INITIAL_TRANSACTIONS_DATA.filter(t => t.status === filter || t.type.toLowerCase().includes(filter.toLowerCase()));
  },
  addEscrowTransaction({ orderId, seller, crop, amount }) {
    const tx = {
      id: `tx-${Math.floor(80000 + Math.random() * 19999)}`,
      orderId: orderId,
      date: new Date().toISOString().split('T')[0],
      seller: seller,
      crop: crop,
      amount: amount,
      type: 'Escrow Deposit',
      status: 'HELD',
      invoiceId: `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`
    };
    INITIAL_TRANSACTIONS_DATA.unshift(tx);
    return tx;
  },
  releaseEscrowForOrder(orderId) {
    const tx = INITIAL_TRANSACTIONS_DATA.find(t => t.orderId === orderId);
    if (tx) {
      tx.status = 'COMPLETED';
      tx.type = 'Bank Transfer (Released)';
    }
  },
  depositFunds(amount) {
    const tx = {
      id: `tx-${Math.floor(80000 + Math.random() * 19999)}`,
      orderId: 'WALLET-TOPUP',
      date: new Date().toISOString().split('T')[0],
      seller: 'KrishiShetra Escrow Vault',
      crop: 'Escrow Fund Allocation',
      amount: parseFloat(amount),
      type: 'Escrow Deposit',
      status: 'HELD',
      invoiceId: `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`
    };
    INITIAL_TRANSACTIONS_DATA.unshift(tx);
    return tx;
  }
};

const searchService = {
  search(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase().trim();
    return SEARCH_INDEX.filter(item => item.label.toLowerCase().includes(q));
  }
};

const notificationService = {
  getNotifications() {
    return NOTIFICATIONS_DATA;
  },
  getCount() {
    return NOTIFICATIONS_DATA.filter(n => n.unread).length || NOTIFICATIONS_DATA.length;
  },
  markAllRead() {
    NOTIFICATIONS_DATA.forEach(n => n.unread = false);
  }
};
