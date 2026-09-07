/**
 * KRISHISHETRA — COMPREHENSIVE DASHBOARD JAVASCRIPT
 * Real Mock Data Architecture, Central Reactive State (krishiStore),
 * AI Market Forecast Engine (forecastService), My Lots CRUD,
 * Interactive Offer Negotiations, and Complete Responsive Handlers.
 */

// ═════════════════════════════════════════════════════════════════════
// 1. REUSABLE DATA DEFINITIONS (All 15 Crops & Mandis)
// ═════════════════════════════════════════════════════════════════════

const CROPS_DATA = [
  { id: 'rice', name: 'Rice', iconName: 'sprout', price: 2850, unit: '₹/q', change: 5.2, dir: 'up', market: 'Pune APMC', demand: 'high', image: 'assets/images/crop-rice.jpg', variety: 'Basmati / Sona Masoori' },
  { id: 'wheat', name: 'Wheat', iconName: 'wheat', price: 2650, unit: '₹/q', change: 6.2, dir: 'up', market: 'Nashik APMC', demand: 'medium', image: 'assets/images/crop-wheat.jpg', variety: 'Lokwan / Sharbati' },
  { id: 'maize', name: 'Maize', iconName: 'corn', price: 2300, unit: '₹/q', change: 2.1, dir: 'up', market: 'Nashik APMC', demand: 'medium', image: 'assets/images/crop-maize.jpg', variety: 'Yellow Corn' },
  { id: 'soybean', name: 'Soybean', iconName: 'leaf', price: 4650, unit: '₹/q', change: 4.8, dir: 'up', market: 'Indore Mandi', demand: 'high', image: 'assets/images/crop-soybean.jpg', variety: 'JS 335 / JS 9560' },
  { id: 'pulses', name: 'Pulses', iconName: 'sprout', price: 5200, unit: '₹/q', change: 1.5, dir: 'up', market: 'Nagpur APMC', demand: 'medium', image: 'assets/images/crop-pulses.jpg', variety: 'Tur Dal / Chana' },
  { id: 'onion', name: 'Onion', iconName: 'sprout', price: 2850, unit: '₹/q', change: 3.8, dir: 'up', market: 'Nashik APMC', demand: 'high', image: 'assets/images/crop-onion.jpg', variety: 'Garwa / Red Onion' },
  { id: 'tomato', name: 'Tomato', iconName: 'sprout', price: 2400, unit: '₹/q', change: 1.4, dir: 'down', market: 'Pune APMC', demand: 'medium', image: 'assets/images/crop-tomato.jpg', variety: 'Hybrid Round / Roma' },
  { id: 'potato', name: 'Potato', iconName: 'sprout', price: 1800, unit: '₹/q', change: 0.8, dir: 'up', market: 'Pune APMC', demand: 'low', image: 'assets/images/crop-potato.jpg', variety: 'Jyoti / Pukhraj' },
  { id: 'chilli', name: 'Chilli', iconName: 'flame', price: 8500, unit: '₹/q', change: 7.2, dir: 'up', market: 'Guntur APMC', demand: 'high', image: 'assets/images/crop-chilli.jpg', variety: 'Teja / Byadgi' },
  { id: 'groundnut', name: 'Groundnut', iconName: 'leaf', price: 5600, unit: '₹/q', change: 2.9, dir: 'up', market: 'Rajkot APMC', demand: 'medium', image: 'assets/images/crop-groundnut.jpg', variety: 'TG 37A / Bold' },
  { id: 'cotton', name: 'Cotton', iconName: 'wind', price: 6800, unit: '₹/q', change: 0.6, dir: 'down', market: 'Nagpur APMC', demand: 'medium', image: 'assets/images/crop-cotton.jpg', variety: 'Medium Staple' },
  { id: 'sugarcane', name: 'Sugarcane', iconName: 'tree-pine', price: 350, unit: '₹/q', change: 1.2, dir: 'up', market: 'Kolhapur APMC', demand: 'medium', image: 'assets/images/crop-sugarcane.jpg', variety: 'Co 86032' },
  { id: 'mango', name: 'Mango', iconName: 'sun', price: 4500, unit: '₹/q', change: 3.5, dir: 'up', market: 'Ratnagiri', demand: 'high', image: 'assets/images/crop-mango.jpg', variety: 'Alphonso / Kesar' },
  { id: 'banana', name: 'Banana', iconName: 'leaf', price: 2200, unit: '₹/q', change: 2.1, dir: 'down', market: 'Jalgaon APMC', demand: 'low', image: 'assets/images/crop-banana.jpg', variety: 'Grand Naine (G9)' },
  { id: 'grapes', name: 'Grapes', iconName: 'sparkles', price: 6200, unit: '₹/q', change: 4.1, dir: 'up', market: 'Nashik APMC', demand: 'high', image: 'assets/images/crop-grapes.jpg', variety: 'Thompson Seedless' }
];

const MANDIS_LIST = [
  { name: 'Pune APMC', state: 'Maharashtra', dist: '12 km' },
  { name: 'Mumbai APMC (Vashi)', state: 'Maharashtra', dist: '140 km' },
  { name: 'Nashik APMC', state: 'Maharashtra', dist: '180 km' },
  { name: 'Nagpur APMC', state: 'Maharashtra', dist: '450 km' },
  { name: 'Solapur APMC', state: 'Maharashtra', dist: '220 km' },
  { name: 'Indore Mandi', state: 'Madhya Pradesh', dist: '520 km' },
  { name: 'Guntur APMC', state: 'Andhra Pradesh', dist: '720 km' },
  { name: 'Rajkot APMC', state: 'Gujarat', dist: '650 km' }
];

const CORPORATE_BUYERS = [
  { id: 'b1', name: 'ABC Foods Ltd', verified: true, rating: '4.9 ★', crops: ['Rice', 'Wheat', 'Tomato'], location: 'Pune / Mumbai', minQty: '10 quintals', demand: '500 kg / 25 quintals', offerPrice: '₹2,850/q', distance: '38 km', reliability: '98%', deals: '184 Completed Deals', paymentDays: 'Instant 24h Bank Transfer' },
  { id: 'b2', name: 'Reliance Fresh Procurement', verified: true, rating: '4.8 ★', crops: ['Rice', 'Onion', 'Tomato', 'Banana'], location: 'Pan-Maharashtra', minQty: '20 quintals', demand: '1,200 kg / 60 quintals', offerPrice: '₹2,920/q', distance: '42 km', reliability: '99%', deals: '320 Completed Deals', paymentDays: 'Direct APMC Escrow' },
  { id: 'b3', name: 'ITC Agri Business Division', verified: true, rating: '4.9 ★', crops: ['Wheat', 'Soybean', 'Chilli', 'Maize'], location: 'Indore / Nagpur', minQty: '15 quintals', demand: '800 kg / 40 quintals', offerPrice: '₹2,780/q', distance: '51 km', reliability: '99%', deals: '410 Completed Deals', paymentDays: 'Instant NEFT' },
  { id: 'b4', name: 'BigBasket Direct Sourcing', verified: true, rating: '4.7 ★', crops: ['Onion', 'Tomato', 'Potato', 'Grapes'], location: 'Pune Warehouse', minQty: '5 quintals', demand: '350 kg / 18 quintals', offerPrice: '₹2,820/q', distance: '24 km', reliability: '97%', deals: '290 Completed Deals', paymentDays: '48h Farm Gate' },
  { id: 'b5', name: 'XYZ Agro Exports', verified: true, rating: '4.8 ★', crops: ['Grapes', 'Mango', 'Chilli', 'Cotton'], location: 'Nashik / Mumbai', minQty: '25 quintals', demand: '2,500 kg / 100 quintals', offerPrice: '₹3,050/q', distance: '45 km', reliability: '98%', deals: '145 Completed Deals', paymentDays: 'Escrow Guarantee' },
  { id: 'b6', name: 'Green Valley Organic Mills', verified: true, rating: '4.6 ★', crops: ['Pulses', 'Rice', 'Soybean'], location: 'Nagpur APMC', minQty: '10 quintals', demand: '400 kg / 20 quintals', offerPrice: '₹5,350/q', distance: '85 km', reliability: '96%', deals: '88 Completed Deals', paymentDays: 'Direct UPI/Bank' }
];

// ═════════════════════════════════════════════════════════════════════
// 2. CENTRAL REACTIVE STORE (LocalStorage Backed)
// ═════════════════════════════════════════════════════════════════════

class KrishiStore {
  constructor() {
    this.storageKey = 'krishishetra_state_v1';
    this.state = this.loadState();
  }

  getDefaultState() {
    return {
      lots: [
        {
          id: 'lot-demo-tomato',
          cropId: 'tomato',
          crop: 'Tomato',
          quantity: 50,
          expectedPrice: 2500,
          marketPrice: 2400,
          location: 'Nashik, Maharashtra',
          harvestDate: '2026-08-25',
          grade: 'Grade A',
          description: 'Hybrid Abhinav fresh farm harvest, graded premium export quality.',
          image: 'assets/images/crop-tomato.jpg',
          status: 'listed',
          createdAt: new Date().toISOString()
        },
        {
          id: 'lot-1',
          cropId: 'wheat',
          crop: 'Wheat',
          quantity: 25,
          expectedPrice: 3000,
          marketPrice: 2650,
          location: 'Pune, Maharashtra',
          harvestDate: '2026-08-15',
          grade: 'Grade A',
          description: 'Lokwan variety, moisture under 9%, clean machine harvested grains.',
          image: 'assets/images/crop-wheat.jpg',
          status: 'listed',
          createdAt: new Date().toISOString()
        },
        {
          id: 'lot-2',
          cropId: 'onion',
          crop: 'Onion',
          quantity: 12,
          expectedPrice: 3000,
          marketPrice: 2850,
          location: 'Nashik, Maharashtra',
          harvestDate: '2026-08-20',
          grade: 'Grade A',
          description: 'Red Garwa onions, medium-large bulb size, dry and ventilated storage.',
          image: 'assets/images/crop-onion.jpg',
          status: 'listed',
          createdAt: new Date().toISOString()
        },
        {
          id: 'lot-3',
          cropId: 'rice',
          crop: 'Rice',
          quantity: 25,
          expectedPrice: 3000,
          marketPrice: 2850,
          location: 'Pune, Maharashtra',
          harvestDate: '2026-08-10',
          grade: 'Grade A',
          description: 'Basmati long grain paddy, clean sorted batch.',
          image: 'assets/images/crop-rice.jpg',
          status: 'listed',
          createdAt: new Date().toISOString()
        }
      ],
      offers: [
        {
          id: 'off-demo-tomato',
          lotId: 'lot-demo-tomato',
          crop: 'Tomato',
          buyerName: 'ABC Foods Ltd',
          verified: true,
          quantity: 50,
          pricePerQ: 2500,
          totalAmount: 125000,
          status: 'pending',
          date: 'Just now'
        },
        {
          id: 'off-1',
          lotId: 'lot-3',
          crop: 'Rice',
          buyerName: 'ABC Foods',
          verified: true,
          quantity: 20,
          pricePerQ: 2950,
          totalAmount: 59000,
          status: 'pending',
          date: 'Today, 10:30 AM'
        },
        {
          id: 'off-2',
          lotId: 'lot-1',
          crop: 'Wheat',
          buyerName: 'XYZ Agro',
          verified: true,
          quantity: 15,
          pricePerQ: 2700,
          totalAmount: 40500,
          status: 'pending',
          date: 'Today, 09:15 AM'
        },
        {
          id: 'off-3',
          lotId: 'lot-2',
          crop: 'Onion',
          buyerName: 'Green Valley',
          verified: true,
          quantity: 10,
          pricePerQ: 2820,
          totalAmount: 28200,
          status: 'pending',
          date: 'Yesterday'
        },
        {
          id: 'off-4',
          lotId: 'lot-3',
          crop: 'Rice',
          buyerName: 'Reliance Fresh',
          verified: true,
          quantity: 30,
          pricePerQ: 3000,
          totalAmount: 90000,
          status: 'pending',
          date: 'Yesterday'
        }
      ],
      orders: [
        {
          id: 'KS-ORD-DEMO-001',
          crop: 'Tomato',
          cropImage: 'assets/images/crop-tomato.jpg',
          buyer: 'ABC Foods Ltd',
          quantity: 50,
          price: 2500,
          total: 125000,
          status: 'Delivered · Payment Completed',
          date: 'Today'
        },
        {
          id: 'ORD-9482',
          crop: 'Wheat',
          cropImage: 'assets/images/crop-wheat.jpg',
          buyer: 'ABC Foods Ltd',
          quantity: 20,
          price: 2750,
          total: 55000,
          status: 'Pending Mandi Pickup',
          date: '28 Aug 2026'
        },
        {
          id: 'ORD-8921',
          crop: 'Onion',
          cropImage: 'assets/images/crop-onion.jpg',
          buyer: 'Reliance Fresh',
          quantity: 15,
          price: 2900,
          total: 43500,
          status: 'In Transit · Verified',
          date: '25 Aug 2026'
        }
      ],
      alerts: [
        { id: 'alt-1', crop: 'Rice', cropId: 'rice', price: 3000, market: 'Pune APMC', active: true, via: 'App & SMS' },
        { id: 'alt-2', crop: 'Onion', cropId: 'onion', price: 3200, market: 'Nashik APMC', active: true, via: 'WhatsApp' },
        { id: 'alt-3', crop: 'Wheat', cropId: 'wheat', price: 2800, market: 'Mumbai APMC', active: false, via: 'SMS' }
      ],
      notifications: [
        { id: 'n1', title: 'Payment Received', desc: '₹13,000 payment received. Credited to HDFC Bank A/C **4821.', time: 'Just now', unread: true },
        { id: 'n2', title: 'Payment Due Tomorrow', desc: '₹18,000 payment is due tomorrow for Wheat fulfillment (ITC Agri).', time: '1 hour ago', unread: true },
        { id: 'n3', title: 'New Buyer Offer Received', desc: 'ABC Foods offered ₹2,950/q for 20q Rice.', time: '2 hours ago', unread: true },
        { id: 'n4', title: 'Price Spike Alert · Pune', desc: 'Rice APMC rate surged +5.2% today.', time: 'Today', unread: false }
      ],
      profile: {
        name: 'Rajesh Patil',
        phone: '+91 98765 43210',
        landSize: 12,
        preferredMandi: 'Pune APMC'
      }
    };
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const state = JSON.parse(saved);
        const userPhone = localStorage.getItem('krishi_user_phone');
        if (userPhone && state.profile) {
          state.profile.phone = userPhone;
        }
        return state;
      }
    } catch (e) {
      console.warn('LocalStorage error, using defaults', e);
    }
    const def = this.getDefaultState();
    const userPhone = localStorage.getItem('krishi_user_phone');
    if (userPhone) def.profile.phone = userPhone;
    return def;
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to persist state', e);
    }
  }

  // Lots CRUD
  getLots(filter = 'all') {
    if (filter === 'all') return this.state.lots;
    return this.state.lots.filter(l => l.status === filter);
  }

  getLot(id) {
    return this.state.lots.find(l => l.id === id);
  }

  addLot(lotData) {
    const cropInfo = CROPS_DATA.find(c => c.id === lotData.cropId) || CROPS_DATA[0];
    const newLot = {
      id: 'lot-' + Date.now(),
      cropId: lotData.cropId,
      crop: cropInfo.name,
      quantity: Number(lotData.quantity),
      expectedPrice: Number(lotData.expectedPrice),
      marketPrice: cropInfo.price,
      location: lotData.location || 'Pune, Maharashtra',
      harvestDate: lotData.harvestDate || new Date().toISOString().split('T')[0],
      grade: lotData.grade || 'Grade A',
      description: lotData.description || 'Fresh harvest ready for procurement.',
      image: cropInfo.image,
      status: 'listed',
      createdAt: new Date().toISOString()
    };
    this.state.lots.unshift(newLot);
    this.saveState();
    return newLot;
  }

  updateLot(id, updates) {
    const lot = this.getLot(id);
    if (lot) {
      Object.assign(lot, updates);
      this.saveState();
    }
    return lot;
  }

  deleteLot(id) {
    this.state.lots = this.state.lots.filter(l => l.id !== id);
    this.state.offers = this.state.offers.filter(o => o.lotId !== id);
    this.saveState();
  }

  togglePauseLot(id) {
    const lot = this.getLot(id);
    if (lot) {
      lot.status = lot.status === 'listed' ? 'paused' : 'listed';
      this.saveState();
    }
    return lot;
  }

  // Offers
  getOffers(lotId = null) {
    if (lotId) return this.state.offers.filter(o => o.lotId === lotId);
    return this.state.offers;
  }

  acceptOffer(offerId) {
    const offer = this.state.offers.find(o => o.id === offerId);
    if (offer) {
      offer.status = 'accepted';
      const cropInfo = CROPS_DATA.find(c => c.name.toLowerCase() === offer.crop.toLowerCase()) || CROPS_DATA[0];
      // Create confirmed order
      const newOrder = {
        id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        crop: offer.crop,
        cropImage: cropInfo.image,
        buyer: offer.buyerName,
        quantity: offer.quantity,
        price: offer.pricePerQ,
        total: offer.totalAmount,
        status: 'Order Confirmed · Pickup Pending',
        date: 'Today'
      };
      this.state.orders.unshift(newOrder);
      this.saveState();
    }
    return offer;
  }

  negotiateOffer(offerId, counterPrice, note) {
    const offer = this.state.offers.find(o => o.id === offerId);
    if (offer) {
      offer.status = 'negotiating';
      offer.counterPrice = Number(counterPrice);
      offer.farmerNote = note;
      this.saveState();
    }
    return offer;
  }

  rejectOffer(offerId) {
    this.state.offers = this.state.offers.filter(o => o.id !== offerId);
    this.saveState();
  }

  // Alerts
  getAlerts() { return this.state.alerts; }

  addAlert(alertData) {
    const cropInfo = CROPS_DATA.find(c => c.id === alertData.cropId) || CROPS_DATA[0];
    const newAlert = {
      id: 'alt-' + Date.now(),
      crop: cropInfo.name,
      cropId: cropInfo.id,
      price: Number(alertData.price),
      market: alertData.market || 'Pune APMC',
      active: true,
      via: alertData.via || 'App & SMS'
    };
    this.state.alerts.unshift(newAlert);
    this.saveState();
    return newAlert;
  }

  toggleAlert(id) {
    const alert = this.state.alerts.find(a => a.id === id);
    if (alert) {
      alert.active = !alert.active;
      this.saveState();
    }
    return alert;
  }

  deleteAlert(id) {
    this.state.alerts = this.state.alerts.filter(a => a.id !== id);
    this.saveState();
  }

  // Notifications
  getNotifications() { return this.state.notifications; }
  markAllNotificationsRead() {
    this.state.notifications.forEach(n => n.unread = false);
    this.saveState();
  }

  // Orders
  getOrders() { return this.state.orders; }

  // Profile
  getProfile() { return this.state.profile; }
  updateProfile(profileData) {
    Object.assign(this.state.profile, profileData);
    this.saveState();
  }
}

const krishiStore = new KrishiStore();

// ═════════════════════════════════════════════════════════════════════
// 3. AI MARKET FORECAST SERVICE (Dynamic Prediction Engine)
// ═════════════════════════════════════════════════════════════════════

const forecastService = {
  generate(cropId, mandiName, days = 7) {
    const crop = CROPS_DATA.find(c => c.id === cropId) || CROPS_DATA[0];
    const basePrice = crop.price;

    // Deterministic realistic variance based on crop and days
    const multiplier = 1 + (crop.change > 0 ? (days * 0.006) : -(days * 0.003));
    const expectedPrice = Math.round(basePrice * multiplier);
    const changeAmount = expectedPrice - basePrice;
    const changePct = ((changeAmount / basePrice) * 100).toFixed(1);
    const isUp = changeAmount >= 0;

    let recommendation = 'WAIT 3 DAYS';
    let actionBadge = 'WAIT';
    let reason = `"Increasing buyer demand and lower mandi arrivals expected in ${mandiName}. Optimal selling window in 3-5 days."`;

    if (!isUp) {
      recommendation = 'SELL NOW';
      actionBadge = 'SELL';
      reason = `"Market arrivals are surging in ${mandiName}. Selling current stock immediately protects from expected 2-4% softening."`;
    } else if (changePct > 6) {
      recommendation = 'HOLD 7 DAYS';
      actionBadge = 'HOLD';
      reason = `"Institutional procurement bids rising rapidly across regional APMCs. High probability of crossing ₹${expectedPrice}/q."`;
    }

    const confidence = Math.min(94, Math.max(82, 85 + Math.round((Math.sin(basePrice) * 5))));

    return {
      cropId: crop.id,
      cropName: crop.name,
      mandi: mandiName,
      days: days,
      currentPrice: basePrice,
      expectedPrice: expectedPrice,
      changeAmount: changeAmount,
      changePct: (isUp ? '+' : '') + changePct + '%',
      isUp: isUp,
      confidence: confidence,
      recommendation: recommendation,
      actionBadge: actionBadge,
      reason: reason,
      variety: crop.variety
    };
  }
};

// ═════════════════════════════════════════════════════════════════════
// 4. TOAST NOTIFICATION SYSTEM
// ═════════════════════════════════════════════════════════════════════

function showToast(message, type = 'success') {
  let container = document.getElementById('dash-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'dash-toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 24px;
      z-index: 3000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? '#12372A' : (type === 'danger' ? '#C96D5B' : '#5B9A72');
  toast.style.cssText = `
    background: ${bg};
    color: #FFFFFF;
    padding: 12px 18px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: auto;
  `;
  toast.innerHTML = `<i data-lucide="sprout" style="width:16px;height:16px;color:var(--ks-mint);"></i> <span>${message}</span>`;
  container.appendChild(toast);
  if (window.lucide) lucide.createIcons({ root: toast });

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ═════════════════════════════════════════════════════════════════════
// 5. DASHBOARD RENDERERS
// ═════════════════════════════════════════════════════════════════════

// Render Market Overview (15 Real Crop Cards)
function renderMarketGrid(filterText = '', cropFilter = 'all', locationFilter = 'all', demandFilter = 'all') {
  const grid = document.getElementById('market-grid');
  const emptyState = document.getElementById('market-empty');
  if (!grid) return;

  let crops = CROPS_DATA;

  if (filterText) {
    const q = filterText.toLowerCase();
    crops = crops.filter(c => c.name.toLowerCase().includes(q) || c.market.toLowerCase().includes(q));
  }
  if (cropFilter !== 'all') {
    crops = crops.filter(c => c.id === cropFilter);
  }
  if (locationFilter !== 'all') {
    crops = crops.filter(c => c.market.toLowerCase().includes(locationFilter.toLowerCase()));
  }
  if (demandFilter !== 'all') {
    crops = crops.filter(c => c.demand === demandFilter);
  }

  if (crops.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';

  grid.innerHTML = crops.map(c => `
    <div class="dash-crop-card" onclick="openCropDetails('${c.id}')" data-crop-id="${c.id}">
      <div class="dash-crop-card__image-wrap">
        <img src="${c.image}" alt="${c.name}" class="dash-crop-card__img" loading="lazy" onerror="this.style.display='none';">
        <span class="dash-crop-card__demand-badge dash-crop-card__demand-badge--${c.demand}">
          ${c.demand === 'high' ? '<i data-lucide="trending-up" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> High Demand' : (c.demand === 'medium' ? '<i data-lucide="activity" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> Medium' : 'Low Demand')}
        </span>
      </div>
      <div class="dash-crop-card__body">
        <div class="dash-crop-card__header">
          <div class="dash-crop-card__title-row">
            <span class="dash-crop-card__name">${c.name}</span>
          </div>
          <span class="dash-crop-card__market">${c.market}</span>
        </div>
        <div class="dash-crop-card__price-row">
          <div class="dash-crop-card__price">
            <span class="dash-crop-card__price-value">₹${c.price.toLocaleString('en-IN')}</span>
            <span class="dash-crop-card__price-unit">${c.unit}</span>
          </div>
          <div class="dash-crop-card__change dash-crop-card__change--${c.dir}">
            ${c.dir === 'up' ? '↑' : '↓'} ${c.change}%
          </div>
        </div>
        <button class="btn btn--secondary dash-crop-card__btn" onclick="event.stopPropagation(); openCropDetails('${c.id}')">
          View Details
        </button>
      </div>
    </div>
  `).join('');
}

// Render "What Farmers Are Selling"
function renderFarmerListings() {
  const scroll = document.getElementById('farmer-listings-scroll');
  if (!scroll) return;

  const popular = [
    { id: 'rice', count: 42, demand: 'hot', demandText: 'High demand' },
    { id: 'wheat', count: 36, demand: 'rising', demandText: 'Medium demand' },
    { id: 'onion', count: 28, demand: 'hot', demandText: 'High demand' },
    { id: 'tomato', count: 21, demand: 'rising', demandText: 'Rising demand' },
    { id: 'maize', count: 18, demand: 'stable', demandText: 'Stable' },
    { id: 'soybean', count: 24, demand: 'hot', demandText: 'High demand' },
    { id: 'chilli', count: 15, demand: 'hot', demandText: 'Export order' }
  ];

  scroll.innerHTML = popular.map(item => {
    const crop = CROPS_DATA.find(c => c.id === item.id) || CROPS_DATA[0];
    return `
      <div class="dash-farmer-listing" onclick="openCropDetails('${crop.id}')">
        <div class="dash-farmer-listing__img-wrap">
          <img src="${crop.image}" alt="${crop.name}" class="dash-farmer-listing__img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
          <div class="dash-farmer-listing__fallback" style="display:none;">${crop.emoji}</div>
        </div>
        <div class="dash-farmer-listing__body">
          <div class="dash-farmer-listing__crop">${crop.name}</div>
          <div class="dash-farmer-listing__count">${item.count} farmer listings</div>
          <div class="dash-farmer-listing__price">₹${crop.price.toLocaleString('en-IN')}/q</div>
          <span class="dash-farmer-listing__demand dash-farmer-listing__demand--${item.demand}">${item.demandText}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Render My Active Lots Panel
function renderLotsPanel(filter = 'all') {
  const container = document.getElementById('lots-panel-body');
  if (!container) return;

  const lots = krishiStore.getLots(filter);

  if (lots.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:32px 16px; color:var(--ks-text-muted);">
        <p style="font-size:14px; font-weight:600; margin-bottom:8px;">No ${filter !== 'all' ? filter : ''} crop listings.</p>
        <button class="btn btn--secondary btn--sm" onclick="openCreateLotModal()">+ Add Your First Lot</button>
      </div>
    `;
    return;
  }

  container.innerHTML = lots.map(lot => {
    const totalVal = lot.quantity * lot.expectedPrice;
    const isPaused = lot.status === 'paused';
    return `
      <div class="dash-lot-row" id="lot-row-${lot.id}">
        <div class="dash-lot-row__thumb">
          <img src="${lot.image}" alt="${lot.crop}" onerror="this.src='assets/images/crop-wheat.jpg'">
        </div>
        <div class="dash-lot-row__info">
          <div class="dash-lot-row__crop">${lot.crop}</div>
          <div class="dash-lot-row__details">
            <span><strong>${lot.quantity}</strong> quintals</span>
            <span class="dash-lot-row__sep">·</span>
            <span>${lot.grade}</span>
          </div>
          <div class="dash-lot-row__meta">
            <span class="dash-lot-row__meta-item">Expected: ₹${lot.expectedPrice.toLocaleString('en-IN')}/q</span>
            <span class="dash-lot-row__meta-item">Market: ₹${lot.marketPrice.toLocaleString('en-IN')}/q</span>
            <span class="dash-lot-row__meta-item dash-lot-row__meta-item--value">Value: ₹${totalVal.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div class="dash-lot-row__right">
          <span class="dash-status-badge dash-status-badge--${lot.status}">
            <span class="dash-status-badge__dot"></span> ${lot.status === 'listed' ? 'Listed' : (lot.status === 'paused' ? 'Paused' : 'Sold')}
          </span>
          <div class="dash-lot-row__actions">
            <button class="dash-lot-btn" title="View Details" onclick="openCropDetails('${lot.cropId}')"><i data-lucide="eye"></i></button>
            <button class="dash-lot-btn" title="Edit Lot" onclick="openEditLotModal('${lot.id}')"><i data-lucide="pencil"></i></button>
            <button class="dash-lot-btn" title="${isPaused ? 'Resume' : 'Pause'}" onclick="openPauseLotModal('${lot.id}')">
              <i data-lucide="${isPaused ? 'play' : 'pause'}"></i>
            </button>
            <button class="dash-lot-btn dash-lot-btn--danger" title="Delete Lot" onclick="openDeleteLotModal('${lot.id}')"><i data-lucide="trash-2"></i></button>
            <button class="dash-lot-btn" title="View Offers" onclick="openOffersForLot('${lot.id}')" style="background:var(--ks-pale-sage); color:var(--ks-evergreen);"><i data-lucide="handshake"></i></button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
  updateStatsCounts();
}

// Render Buyer Offers Panel
function renderOffersPanel() {
  const container = document.getElementById('offers-panel-body');
  if (!container) return;

  const offers = krishiStore.getOffers();

  if (offers.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:32px 16px; color:var(--ks-text-muted);">
        <p style="font-size:14px;">No active buyer offers currently.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = offers.map(off => `
    <div class="dash-offer-row" id="offer-row-${off.id}">
      <div class="dash-offer-row__avatar">${off.buyerName.charAt(0)}</div>
      <div class="dash-offer-row__info">
        <div class="dash-offer-row__name">
          ${off.buyerName}
          ${off.verified ? '<span class="dash-offer-row__verified"><i data-lucide="badge-check"></i> Verified</span>' : ''}
        </div>
        <div class="dash-offer-row__details">${off.crop} · ${off.quantity} quintals · ₹${off.pricePerQ.toLocaleString('en-IN')}/q</div>
        <div class="dash-offer-row__total">Total: ₹${off.totalAmount.toLocaleString('en-IN')}</div>
      </div>
      <div class="dash-offer-row__btns">
        ${off.status === 'accepted'
      ? '<span class="dash-status-badge dash-status-badge--live">Accepted</span>'
      : `
            <button class="btn btn--primary btn--sm" onclick="handleAcceptOffer('${off.id}')">Accept</button>
            <button class="btn btn--secondary btn--sm" onclick="openNegotiateModal('${off.id}')">Negotiate</button>
          `
    }
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// Render Verified Corporate Buyers Directory (SIH 26132)
function renderBuyersDirectory() {
  const container = document.getElementById('buyers-directory-list');
  const modalContainer = document.getElementById('buyers-directory-list-modal');
  if (!container && !modalContainer) return;

  const html = `
    <div style="margin-bottom:18px; background:var(--ks-bg-ivory); border-radius:12px; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <strong style="color:var(--ks-evergreen); font-size:14px;">🎯 Best Institutional Matches for Your Harvest</strong>
        <p style="font-size:12px; color:var(--ks-text-muted); margin:2px 0 0 0;">Pre-verified buyers with direct APMC escrow and 24h bank settlement guarantee.</p>
      </div>
      <div style="display:flex; gap:6px;">
        <span style="font-size:11px; font-weight:700; background:#EAF6ED; color:#2D6A4F; padding:4px 8px; border-radius:4px;">✓ 100% Verified</span>
        <span style="font-size:11px; font-weight:700; background:#E0F2FE; color:#0369A1; padding:4px 8px; border-radius:4px;">🛡️ Escrow Payouts</span>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(310px, 1fr)); gap:16px;">
      ${CORPORATE_BUYERS.map(b => `
        <div class="dash-card" style="background:#FFFFFF; border:1px solid var(--ks-border); border-radius:14px; padding:18px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:var(--shadow-sm);">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <div>
                <h4 style="font-size:16px; font-weight:800; color:var(--ks-evergreen); margin:0 0 2px 0;">${b.name}</h4>
                <div style="font-size:12px; color:var(--ks-text-muted); display:flex; align-items:center; gap:6px;">
                  <span style="color:#2D6A4F; font-weight:700;">✓ Verified Buyer</span>
                  <span>•</span>
                  <span>📍 ${b.distance} away</span>
                </div>
              </div>
              <span style="background:#FDF7EA; color:#92400E; font-size:11px; font-weight:800; padding:3px 8px; border-radius:6px; border:1px solid #EED7A1;">
                ${b.rating}
              </span>
            </div>

            <div style="background:var(--ks-bg-ivory); border-radius:8px; padding:10px 12px; margin-bottom:12px; font-size:12.5px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="color:#666;">Needs / Demand:</span>
                <strong>${b.demand}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="color:#666;">Procuring Crops:</span>
                <span style="font-weight:600; color:var(--ks-charcoal);">${b.crops.join(', ')}</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="color:#666;">Indicative Rate:</span>
                <strong style="color:var(--ks-evergreen); font-size:13.5px;">${b.offerPrice}</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span style="color:#666;">Payment Reliability:</span>
                <strong style="color:#2D6A4F;">${b.reliability} (${b.deals})</strong>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:8px; border-top:1px solid #EEE; padding-top:12px;">
            <button class="btn btn--secondary btn--sm" style="flex:1;" onclick="showToast('Connecting with ${b.name} procurement manager...')">
              <i data-lucide="eye"></i> View Buyer
            </button>
            <button class="btn btn--primary btn--sm" style="flex:1;" onclick="openMakeOfferModal('${b.id}', '${b.name}')">
              <i data-lucide="send"></i> Make Offer
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  if (container) container.innerHTML = html;
  if (modalContainer) modalContainer.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

function openMakeOfferModal(buyerId, buyerName) {
  const modal = document.getElementById('negotiate-modal-overlay');
  if (!modal) {
    showToast(`Quote request sent to ${buyerName}! You will receive price negotiation on SMS & Portal.`);
    return;
  }
  const info = document.getElementById('negotiate-buyer-info');
  if (info) {
    info.innerHTML = `Submitting direct produce quote to <strong>${buyerName}</strong> (Institutional Procurement)`;
  }
  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}


// Render Orders Grid
function renderOrdersGrid() {
  const container = document.getElementById('orders-grid');
  if (!container) return;

  const orders = krishiStore.getOrders();
  container.innerHTML = orders.map(ord => `
    <div class="dash-order-card">
      <div class="dash-order-card__top">
        <span class="dash-order-card__id">${ord.id}</span>
        <span style="font-size:11px; color:var(--ks-text-muted);">${ord.date}</span>
      </div>
      <div class="dash-order-card__body">
        <img src="${ord.cropImage}" alt="${ord.crop}" class="dash-order-card__img" onerror="this.src='assets/images/crop-wheat.jpg'">
        <div class="dash-order-card__details">
          <div class="dash-order-card__crop">${ord.crop} (${ord.quantity}q)</div>
          <div class="dash-order-card__buyer">Buyer: <strong>${ord.buyer}</strong></div>
          <div class="dash-order-card__amount">₹${ord.total.toLocaleString('en-IN')}</div>
        </div>
      </div>
      <div class="dash-order-card__status-bar">
        <i data-lucide="truck" style="width:14px; height:14px;"></i>
        <span>${ord.status}</span>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// Render Price Alerts Grid
function renderAlertsGrid() {
  const container = document.getElementById('alerts-grid');
  if (!container) return;

  const alerts = krishiStore.getAlerts();
  container.innerHTML = alerts.map(a => `
    <div class="dash-alert-card ${!a.active ? 'dash-alert-card--paused' : ''}" id="alert-card-${a.id}">
      <div class="dash-alert-card__icon">${a.active ? '🔔' : '🔕'}</div>
      <div class="dash-alert-card__body">
        <div class="dash-alert-card__crop">${a.crop} reaches ₹${a.price.toLocaleString('en-IN')}/q</div>
        <div class="dash-alert-card__meta">${a.market} · Via ${a.via}</div>
      </div>
      <div class="dash-alert-card__actions">
        <label class="dash-toggle" for="toggle-${a.id}">
          <input type="checkbox" id="toggle-${a.id}" ${a.active ? 'checked' : ''} onchange="handleToggleAlert('${a.id}')">
          <span class="dash-toggle__slider"></span>
        </label>
        <button class="dash-alert-card__delete" onclick="handleDeleteAlert('${a.id}')" aria-label="Delete alert">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// Update Top Counter Stats
function updateStatsCounts() {
  const lots = krishiStore.getLots('listed');
  const offers = krishiStore.getOffers();
  const orders = krishiStore.getOrders();

  const lotsEl = document.getElementById('stat-lots-val');
  if (lotsEl) lotsEl.textContent = lots.length;

  const offersEl = document.getElementById('stat-offers-val');
  if (offersEl) offersEl.textContent = offers.length;

  const ordersEl = document.getElementById('stat-orders-val');
  if (ordersEl) ordersEl.textContent = orders.length;
}

// ═════════════════════════════════════════════════════════════════════
// 6. AI FORECAST MODULE (Interactive Engine)
// ═════════════════════════════════════════════════════════════════════

let currentForecastDays = 7;

function initAIForecast() {
  const cropSelect = document.getElementById('forecast-crop-select');
  const marketSelect = document.getElementById('forecast-market-select');
  const generateBtn = document.getElementById('btn-generate-forecast');
  const tabBtns = document.querySelectorAll('.dash-forecast-tab');
  const sellActionBtn = document.getElementById('btn-forecast-sell-action');
  const alertActionBtn = document.getElementById('btn-set-alert-ai');

  // Timeframe tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('dash-forecast-tab--active'));
      btn.classList.add('dash-forecast-tab--active');
      currentForecastDays = Number(btn.getAttribute('data-days')) || 7;
      triggerGenerateForecast();
    });
  });

  if (generateBtn) {
    generateBtn.addEventListener('click', () => triggerGenerateForecast());
  }

  if (cropSelect) {
    cropSelect.addEventListener('change', () => triggerGenerateForecast());
  }

  if (marketSelect) {
    marketSelect.addEventListener('change', () => triggerGenerateForecast());
  }

  if (sellActionBtn) {
    sellActionBtn.addEventListener('click', () => {
      const cropId = cropSelect ? cropSelect.value : 'rice';
      openCreateLotModal(cropId);
    });
  }

  if (alertActionBtn) {
    alertActionBtn.addEventListener('click', () => {
      const cropId = cropSelect ? cropSelect.value : 'rice';
      openAlertModal(cropId);
    });
  }
}

function triggerGenerateForecast() {
  const cropSelect = document.getElementById('forecast-crop-select');
  const marketSelect = document.getElementById('forecast-market-select');
  const loadingEl = document.getElementById('forecast-loading');
  const contentEl = document.getElementById('forecast-result-content');
  const generateBtn = document.getElementById('btn-generate-forecast');

  const cropId = cropSelect ? cropSelect.value : 'rice';
  const mandi = marketSelect ? marketSelect.value : 'Pune APMC';

  if (loadingEl && contentEl) {
    contentEl.style.display = 'none';
    loadingEl.style.display = 'block';
  }
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<div class="dash-spinner" style="width:16px;height:16px;border-width:2px;margin:0;"></div> <span>Analyzing...</span>';
  }

  setTimeout(() => {
    const result = forecastService.generate(cropId, mandi, currentForecastDays);
    applyForecastResults(result);

    if (loadingEl && contentEl) {
      loadingEl.style.display = 'none';
      contentEl.style.display = 'grid';
    }
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<i data-lucide="sparkles"></i> <span>Generate Forecast</span>';
      if (window.lucide) lucide.createIcons();
    }
    showToast(`AI forecast updated for ${result.cropName} in ${mandi}`);
  }, 450);
}

function applyForecastResults(res) {
  const headline = document.getElementById('forecast-headline');
  const insight = document.getElementById('forecast-insight-text');
  const recBadge = document.getElementById('forecast-rec-badge');
  const curPrice = document.getElementById('forecast-current-price');
  const expPrice = document.getElementById('forecast-expected-price');
  const changeVal = document.getElementById('forecast-change-val');
  const confVal = document.getElementById('forecast-confidence-val');
  const reasonText = document.getElementById('forecast-reason-text');
  const ringText = document.getElementById('forecast-ring-text');
  const miniToday = document.getElementById('forecast-mini-today');
  const miniTarget = document.getElementById('forecast-mini-target');
  const miniLabel = document.getElementById('forecast-mini-target-label');
  const alertBtn = document.getElementById('btn-set-alert-ai');
  const trendLabel = document.getElementById('forecast-trend-label');

  if (headline) headline.textContent = `${res.cropName} — ${res.mandi} Forecast`;
  if (insight) {
    insight.innerHTML = `"${res.cropName} prices are projected to <em>${res.isUp ? 'rise by ' + res.changePct : 'soften by ' + res.changePct}</em> over the next ${res.days} days."`;
  }
  if (trendLabel) {
    trendLabel.textContent = res.isUp ? '📈 Price Rising' : '📉 Price Falling';
    trendLabel.parentElement.style.background = res.isUp ? '#E8F5E9' : '#FFEBEE';
    trendLabel.parentElement.style.color = res.isUp ? '#2E7D32' : '#C62828';
  }
  if (recBadge) {
    const verdictText = res.isUp ? '⏳ WAIT 3 DAYS' : '⚡ SELL NOW';
    recBadge.textContent = verdictText;
    recBadge.style.background = res.isUp ? 'var(--ks-amber)' : 'var(--ks-terracotta)';
    recBadge.style.color = res.isUp ? 'var(--ks-evergreen)' : '#FFFFFF';
  }
  if (curPrice) curPrice.textContent = `₹${res.currentPrice.toLocaleString('en-IN')}/q`;
  if (expPrice) expPrice.textContent = `₹${res.expectedPrice.toLocaleString('en-IN')}/q`;
  if (changeVal) {
    changeVal.textContent = `${res.changePct} (${res.isUp ? '↑' : '↓'} ₹${Math.abs(res.changeAmount)}/q)`;
    changeVal.style.color = res.isUp ? 'var(--ks-mint)' : 'var(--ks-terracotta)';
  }
  if (confVal) confVal.textContent = `${res.confidence}%`;
  if (reasonText) reasonText.innerHTML = `<i data-lucide="info"></i> ${res.reason}`;
  if (ringText) ringText.textContent = `${res.confidence}%`;
  if (miniToday) miniToday.textContent = `₹${res.currentPrice.toLocaleString('en-IN')}`;
  if (miniTarget) miniTarget.textContent = `₹${res.expectedPrice.toLocaleString('en-IN')}`;
  if (miniLabel) miniLabel.textContent = `In ${res.days} Days`;
  if (alertBtn) alertBtn.innerHTML = `<i data-lucide="bell-ring"></i> Set Target Alert (₹${res.expectedPrice.toLocaleString('en-IN')})`;

  // Animate ring
  const circle = document.getElementById('forecast-ring-circle');
  if (circle) {
    const total = 326.73;
    const offset = total - (total * (res.confidence / 100));
    circle.style.strokeDashoffset = offset;
  }

  if (window.lucide) lucide.createIcons();
}

let isSpeakingForecast = false;
function speakForecastRecommendation() {
  const insight = document.getElementById('forecast-insight-text')?.textContent || '';
  const reason = document.getElementById('forecast-reason-text')?.textContent || '';
  const text = `${insight}. ${reason}`;
  if (!text.trim()) return;

  const btn = document.getElementById('btn-speak-forecast');
  const voiceIcon = document.getElementById('forecast-voice-icon');
  const voiceText = document.getElementById('forecast-voice-text');

  if (isSpeakingForecast) {
    window.speechSynthesis?.cancel();
    isSpeakingForecast = false;
    btn?.classList.remove('speaking');
    if (voiceIcon) voiceIcon.textContent = '🔊';
    if (voiceText) voiceText.textContent = 'Listen';
    return;
  }

  if (!('speechSynthesis' in window)) {
    showToast('Voice read-aloud is not supported on this browser.');
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN';
  utterance.rate = 0.92;

  utterance.onstart = () => {
    isSpeakingForecast = true;
    btn?.classList.add('speaking');
    if (voiceIcon) voiceIcon.textContent = '⏹️';
    if (voiceText) voiceText.textContent = 'Stop';
  };

  utterance.onend = () => {
    isSpeakingForecast = false;
    btn?.classList.remove('speaking');
    if (voiceIcon) voiceIcon.textContent = '🔊';
    if (voiceText) voiceText.textContent = 'Listen';
  };

  utterance.onerror = () => {
    isSpeakingForecast = false;
    btn?.classList.remove('speaking');
    if (voiceIcon) voiceIcon.textContent = '🔊';
    if (voiceText) voiceText.textContent = 'Listen';
  };

  window.speechSynthesis.speak(utterance);
}

window.speakForecastRecommendation = speakForecastRecommendation;


// ═════════════════════════════════════════════════════════════════════
// 7. MODALS WORKFLOW (Create, Edit, Pause, Delete, Offers, Buyers, Orders)
// ═════════════════════════════════════════════════════════════════════

let currentPendingLotId = null;
let currentPendingOfferId = null;

// Generic helper to open modal
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.lucide) lucide.createIcons();
  }
}

// Generic helper to close modal
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Global modal bindings
function initModalCloseHandlers() {
  document.querySelectorAll('.dash-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.dash-modal-overlay.active').forEach(ov => ov.classList.remove('active'));
      document.body.style.overflow = '';
    }
  });
}

// 1. Crop Details Modal
function openCropDetails(cropId) {
  const crop = CROPS_DATA.find(c => c.id === cropId) || CROPS_DATA[0];
  const overlay = document.getElementById('crop-modal-overlay');
  if (!overlay) return;

  document.getElementById('crop-modal-emoji').textContent = crop.emoji;
  document.getElementById('crop-modal-name').textContent = `${crop.name} Market Details`;
  document.getElementById('crop-modal-market').textContent = `${crop.market} · Live Market Data`;
  document.getElementById('crop-modal-img').src = crop.image;
  document.getElementById('crop-modal-price').textContent = `₹${crop.price.toLocaleString('en-IN')}/q`;
  document.getElementById('crop-modal-change').textContent = `${crop.dir === 'up' ? '↑' : '↓'} ${crop.change}% from last week`;
  document.getElementById('crop-modal-change').className = `dash-crop-modal__price-change dash-crop-modal__price-change--${crop.dir}`;

  // Mandis
  const mandisContainer = document.getElementById('crop-modal-mandis');
  if (mandisContainer) {
    const list = MANDIS_LIST.slice(0, 4);
    mandisContainer.innerHTML = list.map((m, idx) => {
      const variance = (idx * 30) - 20;
      const mPrice = crop.price + variance;
      return `
        <div class="dash-crop-modal__mandi-row">
          <div>
            <strong>${m.name}</strong>
            <span style="font-size:11px; color:var(--ks-text-muted); display:block;">${m.dist}</span>
          </div>
          <div style="font-weight:700; color:var(--ks-evergreen);">₹${mPrice.toLocaleString('en-IN')}/q</div>
        </div>
      `;
    }).join('');
  }

  // Buyers
  const buyersContainer = document.getElementById('crop-modal-buyers');
  if (buyersContainer) {
    const matchedBuyers = CORPORATE_BUYERS.filter(b => b.crops.some(c => c.toLowerCase() === crop.name.toLowerCase())).slice(0, 3);
    buyersContainer.innerHTML = (matchedBuyers.length ? matchedBuyers : CORPORATE_BUYERS.slice(0, 2)).map(b => `
      <div class="dash-crop-modal__buyer-row">
        <div>
          <strong>${b.name}</strong>
          <span style="font-size:11px; color:var(--ks-sage); display:block;">✓ Verified · ${b.rating}</span>
        </div>
        ${crop.id === 'tomato' ? `
          <button class="btn btn--primary btn--sm" onclick="closeModal('crop-modal-overlay'); openConfirmOrderModal();">Sell at Best Price →</button>
        ` : `
          <button class="btn btn--primary btn--sm" onclick="closeModal('crop-modal-overlay'); openCreateLotModal('${crop.id}')">Sell to Buyer</button>
        `}
      </div>
    `).join('');
  }

  // Action Buttons
  const sellBtn = document.getElementById('crop-modal-sell-btn');
  if (sellBtn) {
    if (crop.id === 'tomato') {
      sellBtn.innerHTML = '<i data-lucide="check-circle"></i> Sell at Best Price (₹2,500/q) →';
      sellBtn.onclick = (e) => {
        e.preventDefault();
        closeModal('crop-modal-overlay');
        openConfirmOrderModal();
      };
    } else {
      sellBtn.innerHTML = '<i data-lucide="plus-circle"></i> Sell This Crop';
      sellBtn.onclick = () => {
        closeModal('crop-modal-overlay');
        openCreateLotModal(crop.id);
      };
    }
  }

  const alertBtn = document.getElementById('crop-modal-alert-btn');
  if (alertBtn) {
    alertBtn.onclick = () => {
      closeModal('crop-modal-overlay');
      openAlertModal(crop.id);
    };
  }

  openModal('crop-modal-overlay');
}

// 2. Create Lot Modal
function openCreateLotModal(cropId = 'rice') {
  const form = document.getElementById('create-lot-form');
  if (form) form.reset();
  const select = document.getElementById('lot-crop-select');
  if (select && cropId) select.value = cropId;
  const dateInput = document.getElementById('lot-harvest-input');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  openModal('create-lot-modal-overlay');
}

function initCreateLotForm() {
  const form = document.getElementById('create-lot-form');
  const closeBtn = document.getElementById('create-lot-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal('create-lot-modal-overlay');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const cropId = document.getElementById('lot-crop-select').value;
      const quantity = document.getElementById('lot-qty-input').value;
      const expectedPrice = document.getElementById('lot-price-input').value;
      const grade = document.getElementById('lot-grade-select').value;
      const harvestDate = document.getElementById('lot-harvest-input').value;
      const location = document.getElementById('lot-location-input').value;
      const description = document.getElementById('lot-desc-input').value;

      const newLot = krishiStore.addLot({
        cropId,
        quantity,
        expectedPrice,
        grade,
        harvestDate,
        location,
        description
      });

      closeModal('create-lot-modal-overlay');
      renderLotsPanel();
      showToast(`+ New lot created for ${newLot.crop} (${newLot.quantity} quintals)!`);
    });
  }
}

// 3. Edit Lot Modal
function openEditLotModal(lotId) {
  const lot = krishiStore.getLot(lotId);
  if (!lot) return;

  document.getElementById('edit-lot-id').value = lot.id;
  document.getElementById('edit-lot-crop-name').textContent = `${lot.crop} Listing Details`;
  document.getElementById('edit-lot-qty').value = lot.quantity;
  document.getElementById('edit-lot-price').value = lot.expectedPrice;
  document.getElementById('edit-lot-grade').value = lot.grade;
  document.getElementById('edit-lot-location').value = lot.location;
  document.getElementById('edit-lot-desc').value = lot.description || '';

  openModal('edit-lot-modal-overlay');
}

function initEditLotForm() {
  const form = document.getElementById('edit-lot-form');
  const closeBtn = document.getElementById('edit-lot-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal('edit-lot-modal-overlay');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-lot-id').value;
      const quantity = document.getElementById('edit-lot-qty').value;
      const expectedPrice = document.getElementById('edit-lot-price').value;
      const grade = document.getElementById('edit-lot-grade').value;
      const location = document.getElementById('edit-lot-location').value;
      const description = document.getElementById('edit-lot-desc').value;

      krishiStore.updateLot(id, {
        quantity: Number(quantity),
        expectedPrice: Number(expectedPrice),
        grade,
        location,
        description
      });

      closeModal('edit-lot-modal-overlay');
      renderLotsPanel();
      showToast('Crop lot details updated successfully.');
    });
  }
}

// 4. Pause / Resume Lot Modal
function openPauseLotModal(lotId) {
  const lot = krishiStore.getLot(lotId);
  if (!lot) return;
  currentPendingLotId = lotId;

  const isPaused = lot.status === 'paused';
  const title = document.getElementById('pause-modal-title');
  const desc = document.getElementById('pause-modal-desc');
  const btn = document.getElementById('btn-confirm-pause');

  if (title) title.textContent = isPaused ? 'Resume Listing?' : 'Pause Listing?';
  if (desc) {
    desc.textContent = isPaused
      ? `This will make your ${lot.crop} listing visible to buyers again on the live market.`
      : `Paused listings will temporarily be hidden from buyers on the marketplace. You can resume anytime.`;
  }
  if (btn) btn.textContent = isPaused ? 'Resume Listing' : 'Confirm Pause';

  openModal('pause-lot-modal-overlay');
}

function initPauseLotHandlers() {
  const closeBtn = document.getElementById('pause-lot-modal-close');
  const cancelBtn = document.getElementById('btn-cancel-pause');
  const confirmBtn = document.getElementById('btn-confirm-pause');

  if (closeBtn) closeBtn.onclick = () => closeModal('pause-lot-modal-overlay');
  if (cancelBtn) cancelBtn.onclick = () => closeModal('pause-lot-modal-overlay');

  if (confirmBtn) {
    confirmBtn.onclick = () => {
      if (currentPendingLotId) {
        const lot = krishiStore.togglePauseLot(currentPendingLotId);
        closeModal('pause-lot-modal-overlay');
        renderLotsPanel();
        showToast(lot.status === 'paused' ? 'Listing paused.' : 'Listing resumed and live on marketplace.');
      }
    };
  }
}

// 5. Delete Lot Modal
function openDeleteLotModal(lotId) {
  currentPendingLotId = lotId;
  openModal('delete-lot-modal-overlay');
}

function initDeleteLotHandlers() {
  const closeBtn = document.getElementById('delete-lot-modal-close');
  const cancelBtn = document.getElementById('btn-cancel-delete');
  const confirmBtn = document.getElementById('btn-confirm-delete');

  if (closeBtn) closeBtn.onclick = () => closeModal('delete-lot-modal-overlay');
  if (cancelBtn) cancelBtn.onclick = () => closeModal('delete-lot-modal-overlay');

  if (confirmBtn) {
    confirmBtn.onclick = () => {
      if (currentPendingLotId) {
        krishiStore.deleteLot(currentPendingLotId);
        closeModal('delete-lot-modal-overlay');
        renderLotsPanel();
        showToast('Crop listing removed successfully.', 'danger');
      }
    };
  }
}

// 6. Lot Offers Modal (View Offers)
function openOffersForLot(lotId) {
  const lot = krishiStore.getLot(lotId);
  if (!lot) return;

  const title = document.getElementById('offers-modal-title');
  const sub = document.getElementById('offers-modal-sub');
  const list = document.getElementById('offers-modal-list');

  if (title) title.textContent = `Buyer Offers for ${lot.crop}`;
  const offers = krishiStore.getOffers(lotId);

  if (sub) sub.textContent = `${offers.length} active procurement offers`;

  if (list) {
    if (offers.length === 0) {
      list.innerHTML = `<p style="padding:20px; text-align:center; color:var(--ks-text-muted);">No offers submitted on this lot yet.</p>`;
    } else {
      list.innerHTML = offers.map(off => `
        <div class="dash-offer-row" style="margin-bottom:10px;">
          <div class="dash-offer-row__avatar">${off.buyerName.charAt(0)}</div>
          <div class="dash-offer-row__info">
            <div class="dash-offer-row__name">${off.buyerName} <span class="dash-offer-row__verified">✓ Verified</span></div>
            <div class="dash-offer-row__details">${off.quantity} quintals · ₹${off.pricePerQ.toLocaleString('en-IN')}/q</div>
            <div class="dash-offer-row__total">Total: ₹${off.totalAmount.toLocaleString('en-IN')}</div>
          </div>
          <div class="dash-offer-row__btns">
            ${off.status === 'accepted'
          ? '<span class="dash-status-badge dash-status-badge--live">Accepted</span>'
          : `
                <button class="btn btn--primary btn--sm" onclick="handleAcceptOffer('${off.id}'); closeModal('offers-modal-overlay');">Accept</button>
                <button class="btn btn--secondary btn--sm" onclick="closeModal('offers-modal-overlay'); openNegotiateModal('${off.id}');">Negotiate</button>
              `
        }
          </div>
        </div>
      `).join('');
    }
  }

  const closeBtn = document.getElementById('offers-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal('offers-modal-overlay');

  openModal('offers-modal-overlay');
}

// 7. Accept Offer Handler
function handleAcceptOffer(offerId) {
  const offer = krishiStore.acceptOffer(offerId);
  renderOffersPanel();
  renderOrdersGrid();
  updateStatsCounts();
  showToast(`Offer accepted from ${offer.buyerName}! Total ₹${offer.totalAmount.toLocaleString('en-IN')}. Scheduled for mandi pickup.`);
}

// 8. Negotiate Modal
function openNegotiateModal(offerId) {
  const offer = krishiStore.getOffers().find(o => o.id === offerId);
  if (!offer) return;
  currentPendingOfferId = offerId;

  document.getElementById('negotiate-offer-id').value = offer.id;
  document.getElementById('negotiate-buyer-info').innerHTML = `
    <div><strong>${offer.buyerName}</strong> offering ₹${offer.pricePerQ}/q for ${offer.quantity}q ${offer.crop}</div>
  `;
  document.getElementById('negotiate-price-input').value = offer.pricePerQ + 100;
  document.getElementById('negotiate-note-input').value = '';

  openModal('negotiate-modal-overlay');
}

function initNegotiateForm() {
  const form = document.getElementById('negotiate-form');
  const closeBtn = document.getElementById('negotiate-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal('negotiate-modal-overlay');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('negotiate-offer-id').value;
      const counterPrice = document.getElementById('negotiate-price-input').value;
      const note = document.getElementById('negotiate-note-input').value;

      krishiStore.negotiateOffer(id, counterPrice, note);
      closeModal('negotiate-modal-overlay');
      renderOffersPanel();
      showToast(`Counter offer of ₹${counterPrice}/q sent to buyer.`);
    });
  }
}

// 9. Buyers Directory Modal
function openBuyersModal() {
  const list = document.getElementById('buyers-directory-list');
  if (list) {
    list.innerHTML = CORPORATE_BUYERS.map(b => `
      <div class="dash-crop-modal__buyer-row" style="margin-bottom:10px; padding:12px 14px;">
        <div>
          <div style="font-size:15px; font-weight:700; color:var(--ks-charcoal);">${b.name} <span class="dash-offer-row__verified">✓ ${b.rating}</span></div>
          <div style="font-size:12px; color:var(--ks-text-muted); margin-top:2px;">Purchasing: ${b.crops.join(', ')} · Min ${b.minQty}</div>
          <div style="font-size:11px; color:var(--ks-sage); margin-top:2px;"><i data-lucide="zap" style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> ${b.paymentDays}</div>
        </div>
        <button class="btn btn--primary btn--sm" onclick="closeModal('buyers-modal-overlay'); openCreateLotModal()">Sell Crop</button>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons({ root: list });
  }

  const closeBtn = document.getElementById('buyers-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal('buyers-modal-overlay');
  openModal('buyers-modal-overlay');
}

// 10. Orders Modal
function openOrdersModal() {
  const list = document.getElementById('orders-modal-list');
  if (list) {
    const orders = krishiStore.getOrders();
    list.innerHTML = orders.map(ord => `
      <div class="dash-order-card" style="margin-bottom:12px;">
        <div class="dash-order-card__top">
          <span class="dash-order-card__id">${ord.id}</span>
          <span style="font-size:12px; font-weight:600; color:var(--ks-sage);">${ord.status}</span>
        </div>
        <div class="dash-order-card__body">
          <img src="${ord.cropImage}" alt="${ord.crop}" class="dash-order-card__img">
          <div class="dash-order-card__details">
            <div class="dash-order-card__crop">${ord.crop} — ${ord.quantity} Quintals</div>
            <div class="dash-order-card__buyer">Buyer: <strong>${ord.buyer}</strong></div>
            <div class="dash-order-card__amount">Total: ₹${ord.total.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  const closeBtn = document.getElementById('orders-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal('orders-modal-overlay');
  openModal('orders-modal-overlay');
}

// 11. Alerts Modal
function openAlertModal(cropId = 'rice') {
  const form = document.getElementById('alert-form');
  if (form) form.reset();
  const select = document.getElementById('alert-crop-input');
  if (select && cropId) select.value = cropId;
  const closeBtn = document.getElementById('alert-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal('alert-modal-overlay');
  openModal('alert-modal-overlay');
}

function initAlertForm() {
  const form = document.getElementById('alert-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const cropId = document.getElementById('alert-crop-input').value;
      const price = document.getElementById('alert-price-input').value;
      const market = document.getElementById('alert-market-input').value;
      const app = document.getElementById('alert-ch-app').checked;
      const sms = document.getElementById('alert-ch-sms').checked;
      const wa = document.getElementById('alert-ch-wa').checked;

      const via = [app ? 'App' : null, sms ? 'SMS' : null, wa ? 'WhatsApp' : null].filter(Boolean).join(' & ') || 'App';

      krishiStore.addAlert({ cropId, price, market, via });
      closeModal('alert-modal-overlay');
      renderAlertsGrid();
      showToast(`Target price alert set for ₹${price}/q via ${via}`);
    });
  }
}

function handleToggleAlert(id) {
  const a = krishiStore.toggleAlert(id);
  renderAlertsGrid();
  showToast(a.active ? 'Alert enabled.' : 'Alert paused.');
}

function handleDeleteAlert(id) {
  krishiStore.deleteAlert(id);
  renderAlertsGrid();
  showToast('Alert deleted.', 'danger');
}

// 12. Notifications Modal
function openNotificationsModal() {
  const list = document.getElementById('notifications-list');
  if (list) {
    const notifs = krishiStore.getNotifications();
    list.innerHTML = notifs.map(n => `
      <div class="dash-notif-item ${n.unread ? 'dash-notif-item--unread' : ''}">
        <i data-lucide="bell" style="width:16px;height:16px;color:var(--ks-sage);flex-shrink:0;"></i>
        <div>
          <div class="dash-notif-item__title">${n.title}</div>
          <div class="dash-notif-item__desc">${n.desc}</div>
          <div class="dash-notif-item__time">${n.time}</div>
        </div>
      </div>
    `).join('');

    const badge = document.getElementById('notifications-badge');
    if (badge) badge.style.display = 'none';
  }

  const closeBtn = document.getElementById('notifications-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal('notifications-modal-overlay');
  openModal('notifications-modal-overlay');
}

// 13. Profile Modal & Authentication UI
function showModalAlert(elementId, message, type = 'error') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = `dash-modal-alert dash-modal-alert--${type}`;
  el.style.display = 'block';
}

function hideModalAlert(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.style.display = 'none';
  el.textContent = '';
}

function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function updateUserUI(user) {
  const timeGreeting = getTimeBasedGreeting();
  const isDemo = window.KrishiDemo && typeof window.KrishiDemo.isDevDemo === 'function' && window.KrishiDemo.isDevDemo();
  const rawName = (user && user.name) ? user.name.trim() : (isDemo ? 'Ramesh Patil' : '');
  const firstName = rawName ? rawName.split(' ')[0] : '';
  const initial = rawName ? rawName.charAt(0).toUpperCase() : (isDemo ? 'R' : 'F');

  // Header Avatar & Name
  const headerAvatar = document.getElementById('header-avatar');
  const headerName = document.getElementById('header-user-name');
  if (headerAvatar) headerAvatar.textContent = initial;
  if (headerName) headerName.textContent = firstName || (isDemo ? 'Ramesh' : 'Farmer');

  // Dropdown Avatar, Name, Phone
  const dropdownAvatar = document.getElementById('dropdown-avatar');
  const dropdownName = document.getElementById('dropdown-user-name');
  const dropdownPhone = document.getElementById('dropdown-user-phone');
  if (dropdownAvatar) dropdownAvatar.textContent = initial;
  if (dropdownName) dropdownName.textContent = rawName || (isDemo ? 'Ramesh Patil' : 'Farmer');
  if (dropdownPhone) dropdownPhone.textContent = (user && user.phone) ? `+91 ${user.phone}` : (isDemo ? '+91 98201 44521' : ((user && user.email) || ''));

  // Welcome Hero Greeting (Dynamic Time-based)
  const greetingEl = document.getElementById('dash-greeting');
  if (greetingEl) {
    greetingEl.textContent = firstName ? `${timeGreeting}, ${firstName} 👋` : `${timeGreeting} 👋`;
  }

  // Demo Location & Context
  if (isDemo) {
    const locEl = document.getElementById('dash-location');
    if (locEl) locEl.innerHTML = '<i data-lucide="map-pin"></i> Navi Mumbai (Vashi APMC Hub)';
  }
}

function handleSendToFpo() {
  const btn = document.getElementById('btn-send-fpo');
  const hint = document.getElementById('send-fpo-status-hint');
  const badge = document.getElementById('demo-pipeline-badge');
  const fpoStatus = document.getElementById('journey-status-fpo');
  const fpoHint = document.getElementById('journey-hint-fpo');

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Submitted to FPO ✓';
    btn.style.background = '#2E7D32';
  }
  if (hint) {
    hint.textContent = 'FPO accepted & consolidated with Vashi shipment (Suresh Jadhav)';
    hint.style.color = '#2E7D32';
  }
  if (badge) {
    badge.textContent = 'FPO Consolidated';
    badge.style.background = '#E8F5E9';
    badge.style.color = '#2E7D32';
  }
  if (fpoStatus) {
    fpoStatus.textContent = '✓ Consolidated';
    fpoStatus.style.color = '#2E7D32';
  }
  if (fpoHint) {
    fpoHint.textContent = 'Suresh Jadhav verified';
  }

  if (window.KrishiDemo && typeof window.KrishiDemo.setFlowState === 'function') {
    window.KrishiDemo.setFlowState({
      stage: 'fpo_accepted',
      farmerSentToFpo: true,
      fpoAccepted: true
    });
  }

  if (typeof showToast === 'function') {
    showToast('Tomato lot (850 kg Grade A) submitted to Suresh Jadhav at Vashi FPO!');
  }
}
window.handleSendToFpo = handleSendToFpo;

function openProfileModal() {
  const user = (window.Auth && window.Auth.getUser()) || krishiStore.getProfile();

  // Set modal badge card
  const modalAvatar = document.getElementById('modal-avatar');
  const modalName = document.getElementById('modal-user-name');
  const modalEmail = document.getElementById('modal-user-email');
  const modalRole = document.getElementById('modal-user-role');
  const modalVerified = document.getElementById('modal-user-verified');

  if (modalAvatar) modalAvatar.textContent = (user.name ? user.name.charAt(0).toUpperCase() : 'F');
  if (modalName) modalName.textContent = user.name || 'Farmer';
  if (modalEmail) modalEmail.textContent = user.email || '';
  if (modalRole) modalRole.textContent = (user.role || 'farmer').toUpperCase();
  if (modalVerified) {
    if (user.emailVerified) {
      modalVerified.textContent = '✓ VERIFIED';
      modalVerified.className = 'dash-profile-tag dash-profile-tag--verified';
    } else {
      modalVerified.textContent = 'UNVERIFIED';
      modalVerified.className = 'dash-profile-tag';
      modalVerified.style.background = '#FDF0EE';
      modalVerified.style.color = '#C96D5B';
    }
  }

  // Populate form fields
  const profNameInput = document.getElementById('prof-name');
  const profPhoneInput = document.getElementById('prof-phone');
  if (profNameInput) profNameInput.value = user.name || '';
  if (profPhoneInput) profPhoneInput.value = user.phone || '';

  // Clear alerts
  hideModalAlert('profile-alert');
  hideModalAlert('password-alert');

  const closeBtn = document.getElementById('profile-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal('profile-modal-overlay');
  openModal('profile-modal-overlay');
}

function initProfileForm() {
  const form = document.getElementById('profile-form');
  const submitBtn = document.getElementById('btn-save-profile');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideModalAlert('profile-alert');

    const name = document.getElementById('prof-name').value.trim();
    const phone = document.getElementById('prof-phone').value.trim();

    if (!name) {
      showModalAlert('profile-alert', 'Please enter your full name.', 'error');
      return;
    }

    if (phone && (!/^[6-9]\d{9}$/.test(phone))) {
      showModalAlert('profile-alert', 'Please provide a valid 10-digit Indian mobile number starting with 6-9.', 'error');
      return;
    }

    // Disable button during submission
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="dash-spinner" style="width:14px;height:14px;border-width:2px;margin:0;display:inline-block;vertical-align:middle;margin-right:6px;"></div> Saving...';

    const result = await window.Auth.updateProfile({ name, phone });
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
    if (window.lucide) lucide.createIcons();

    if (result && result.success && result.user) {
      updateUserUI(result.user);
      showModalAlert('profile-alert', 'Profile updated successfully!', 'success');
      showToast('Profile updated successfully.');
      setTimeout(() => {
        hideModalAlert('profile-alert');
      }, 3000);
    } else {
      showModalAlert('profile-alert', (result && result.message) || 'Failed to update profile.', 'error');
    }
  });
}

function initPasswordForm() {
  const form = document.getElementById('password-form');
  const submitBtn = document.getElementById('btn-save-password');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideModalAlert('password-alert');

    const currentPassword = document.getElementById('prof-current-pass').value;
    const newPassword = document.getElementById('prof-new-pass').value;

    if (!currentPassword || !newPassword) {
      showModalAlert('password-alert', 'Please enter both current and new password.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showModalAlert('password-alert', 'New password must be at least 6 characters.', 'error');
      return;
    }

    if (currentPassword === newPassword) {
      showModalAlert('password-alert', 'New password must be different from current password.', 'error');
      return;
    }

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="dash-spinner" style="width:14px;height:14px;border-width:2px;margin:0;display:inline-block;vertical-align:middle;margin-right:6px;"></div> Updating...';

    const result = await window.Auth.changePassword({ currentPassword, newPassword });
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
    if (window.lucide) lucide.createIcons();

    if (result && result.success) {
      showModalAlert('password-alert', 'Password changed successfully!', 'success');
      showToast('Password changed successfully.');
      document.getElementById('prof-current-pass').value = '';
      document.getElementById('prof-new-pass').value = '';
      setTimeout(() => {
        hideModalAlert('password-alert');
      }, 3000);
    } else {
      showModalAlert('password-alert', (result && result.message) || 'Failed to change password.', 'error');
    }
  });
}

// ═════════════════════════════════════════════════════════════════════
// 14. KISAN VOICE SYNTHESIS SYSTEM
// ═════════════════════════════════════════════════════════════════════

let isSpeakingTip = false;

function speakCurrentTip() {
  const tipText = document.getElementById('kisan-tip-text')?.textContent?.trim() || '';
  if (!tipText) return;

  const btn = document.getElementById('btn-speak-tip');
  const voiceIcon = document.getElementById('voice-icon');
  const voiceText = document.getElementById('voice-btn-text');

  if (isSpeakingTip) {
    window.speechSynthesis?.cancel();
    isSpeakingTip = false;
    btn?.classList.remove('speaking');
    if (voiceIcon) voiceIcon.textContent = '🔊';
    if (voiceText) voiceText.textContent = 'Listen';
    return;
  }

  if (!('speechSynthesis' in window)) {
    showToast('Voice read-aloud is not supported on this browser.');
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(tipText);
  utterance.lang = 'en-IN';
  utterance.rate = 0.95;

  utterance.onstart = () => {
    isSpeakingTip = true;
    btn?.classList.add('speaking');
    if (voiceIcon) voiceIcon.textContent = '⏹️';
    if (voiceText) voiceText.textContent = 'Stop';
  };

  utterance.onend = () => {
    isSpeakingTip = false;
    btn?.classList.remove('speaking');
    if (voiceIcon) voiceIcon.textContent = '🔊';
    if (voiceText) voiceText.textContent = 'Listen';
  };

  utterance.onerror = () => {
    isSpeakingTip = false;
    btn?.classList.remove('speaking');
    if (voiceIcon) voiceIcon.textContent = '🔊';
    if (voiceText) voiceText.textContent = 'Listen';
  };

  window.speechSynthesis.speak(utterance);
}

function speakText(text) {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN';
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

window.speakCurrentTip = speakCurrentTip;
window.speakText = speakText;

// 14. Help Modal
function openHelpModal() {
  const closeBtn = document.getElementById('help-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal('help-modal-overlay');
  openModal('help-modal-overlay');
}




// ═════════════════════════════════════════════════════════════════════
// 8. INTERACTIVE SEARCH & FILTERS
// ═════════════════════════════════════════════════════════════════════

function initSearchAndFilters() {
  const searchInput = document.getElementById('market-search-input');
  const cropFilter = document.getElementById('filter-crop');
  const locFilter = document.getElementById('filter-location');
  const demandFilter = document.getElementById('filter-demand');
  const clearBtn = document.getElementById('btn-clear-search');

  function doFilter() {
    renderMarketGrid(
      searchInput ? searchInput.value : '',
      cropFilter ? cropFilter.value : 'all',
      locFilter ? locFilter.value : 'all',
      demandFilter ? demandFilter.value : 'all'
    );
  }

  if (searchInput) searchInput.addEventListener('input', doFilter);
  if (cropFilter) cropFilter.addEventListener('change', doFilter);
  if (locFilter) locFilter.addEventListener('change', doFilter);
  if (demandFilter) demandFilter.addEventListener('change', doFilter);

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (cropFilter) cropFilter.value = 'all';
      if (locFilter) locFilter.value = 'all';
      if (demandFilter) demandFilter.value = 'all';
      doFilter();
    });
  }

  // Global Header Search
  const globalInput = document.getElementById('dash-search-input');
  const globalResults = document.getElementById('dash-search-results');

  if (globalInput && globalResults) {
    globalInput.addEventListener('input', () => {
      const q = globalInput.value.trim().toLowerCase();
      if (!q) {
        globalResults.classList.remove('active');
        return;
      }

      const matches = CROPS_DATA.filter(c => c.name.toLowerCase().includes(q) || c.market.toLowerCase().includes(q));
      if (matches.length === 0) {
        globalResults.innerHTML = `<div style="padding:12px; font-size:13px; color:var(--ks-text-muted); text-align:center;">No matching crops found</div>`;
      } else {
        globalResults.innerHTML = matches.map(c => `
          <div class="dash-search__result-item" onclick="openCropDetails('${c.id}'); document.getElementById('dash-search-results').classList.remove('active');">
            <img src="${c.image}" alt="${c.name}" class="dash-search__img">
            <div>
              <div style="font-weight:700;">${c.name} — ₹${c.price}/q</div>
              <div class="dash-search__result-sub">${c.market} · ${c.demand.toUpperCase()} Demand</div>
            </div>
          </div>
        `).join('');
      }
      globalResults.classList.add('active');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#dash-search')) {
        globalResults.classList.remove('active');
      }
    });

    // Keyboard shortcut Ctrl+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        globalInput.focus();
      }
    });
  }
}

// ═════════════════════════════════════════════════════════════════════
// 9. COMPARE TABLE & CHART MODULES
// ═════════════════════════════════════════════════════════════════════

function initMarketComparison() {
  const cropSelect = document.getElementById('compare-crop');
  const locSelect = document.getElementById('compare-location');
  const tableBody = document.getElementById('compare-table-body');
  const cardsWrap = document.getElementById('compare-cards');
  const bestBadgeName = document.getElementById('best-market-name');
  const bestBadgePrice = document.getElementById('best-market-price');

  async function renderComparison() {
    const cropId = cropSelect ? cropSelect.value : 'rice';
    const locId = locSelect ? locSelect.value : 'maharashtra';

    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 24px; color: var(--ks-text-muted);">
            <div class="spinner" style="margin: 0 auto 8px auto; width: 22px; height: 22px; border: 2px solid #E5E4DD; border-top-color: var(--ks-evergreen); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
            Fetching live Government of India (data.gov.in) mandi prices...
          </td>
        </tr>
      `;
    }

    try {
      const res = await (window.api?.market?.getMandiPrices
        ? window.api.market.getMandiPrices({ commodity: cropId, state: locId, limit: 15 })
        : fetch(`/api/market/mandi-prices?commodity=${encodeURIComponent(cropId)}&state=${encodeURIComponent(locId)}&limit=15`).then(r => r.json()));

      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        // Sort descending by modalPrice
        const mandis = [...res.data].sort((a, b) => (b.modalPrice || 0) - (a.modalPrice || 0));
        const best = mandis[0];

        if (bestBadgeName) bestBadgeName.textContent = `${best.market} APMC`;
        if (bestBadgePrice) bestBadgePrice.textContent = `₹${best.modalPrice?.toLocaleString('en-IN')}/q`;

        const updateLabel = res.updatedAt ? new Date(res.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Latest';

        // Update Compare Mandi Prices entry card summary (Farmer quick glance)
        const govCropNameEl = document.getElementById('dash-gov-crop-name');
        const govBestPriceEl = document.getElementById('dash-gov-best-price');
        const govNetRealEl = document.getElementById('dash-gov-net-realization');
        const govFreshnessText = document.getElementById('dash-gov-freshness-text');

        if (govCropNameEl) {
          const cropDisplay = cropSelect ? cropSelect.options[cropSelect.selectedIndex]?.text || cropId : 'Rice';
          govCropNameEl.textContent = cropDisplay;
        }
        if (govBestPriceEl && best) {
          govBestPriceEl.textContent = `₹${best.modalPrice?.toLocaleString('en-IN')}/qtl`;
        }
        if (govNetRealEl && best) {
          const estTransport = 200; // estimated regional transport cost
          const net = Math.max(0, (best.modalPrice || 0) - estTransport);
          govNetRealEl.textContent = `₹${net.toLocaleString('en-IN')}/qtl`;
        }
        if (govFreshnessText) {
          govFreshnessText.textContent = best && best.arrivalDate ? `· Updated ${best.arrivalDate}` : `· Updated ${updateLabel}`;
        }

        if (tableBody) {
          tableBody.innerHTML = mandis.map((m, idx) => {
            const isBest = idx === 0;
            const arrivalDateStr = m.arrivalDate || updateLabel;
            return `
              <tr class="${isBest ? 'tr-best' : ''}">
                <td>
                  <strong>${m.market} APMC</strong>
                  <span style="font-size: 11px; color: #666; display: block;">${m.district ? m.district + ', ' : ''}${m.state}</span>
                  ${isBest ? '<span class="ks-badge ks-badge-protected" style="margin-top: 2px; font-size: 10px;">⭐ HIGHEST MODAL PRICE</span>' : ''}
                </td>
                <td class="td-price" style="font-weight: 800; color: var(--ks-evergreen);">
                  ₹${m.modalPrice?.toLocaleString('en-IN')}/q
                </td>
                <td style="font-size: 12.5px; color: #444;">
                  ₹${m.minPrice?.toLocaleString('en-IN')} – ₹${m.maxPrice?.toLocaleString('en-IN')}/q
                </td>
                <td>
                  <div style="font-size: 11.5px; color: #555;">Updated ${arrivalDateStr}</div>
                  <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: #E5F0E7; color: #12372A; font-size: 10px; font-weight: 700; margin-top: 2px;">✓ Gov Data</span>
                </td>
                <td class="td-btn">
                  <a href="mandi-compare.html" style="font-weight: 700; color: var(--ks-sage); text-decoration: none;">Compare →</a>
                </td>
              </tr>
            `;
          }).join('');
        }

        if (cardsWrap) {
          cardsWrap.innerHTML = mandis.map((m, idx) => {
            const isBest = idx === 0;
            return `
              <div class="dash-compare-mobile-card" style="border: ${isBest ? '2px solid var(--ks-sage)' : '1px solid #E5E4DD'}; border-radius: 10px; padding: 14px; margin-bottom: 12px; background: #FFF;">
                <div class="dash-compare-mobile-card__name" style="font-weight: 800; color: var(--ks-evergreen); font-size: 15px;">
                  ${m.market} APMC ${isBest ? '⭐ (Top Price)' : ''}
                </div>
                <div style="font-size: 11.5px; color: #666; margin-bottom: 8px;">${m.district ? m.district + ', ' : ''}${m.state}</div>
                <div class="dash-compare-mobile-card__row"><span class="dash-compare-mobile-card__label">Modal Price</span><span class="dash-compare-mobile-card__val" style="font-weight: 800; color: var(--ks-evergreen);">₹${m.modalPrice?.toLocaleString('en-IN')}/q</span></div>
                <div class="dash-compare-mobile-card__row"><span class="dash-compare-mobile-card__label">Price Range</span><span class="dash-compare-mobile-card__val">₹${m.minPrice?.toLocaleString('en-IN')} – ₹${m.maxPrice?.toLocaleString('en-IN')}/q</span></div>
                <div class="dash-compare-mobile-card__row"><span class="dash-compare-mobile-card__label">Source</span><span class="dash-compare-mobile-card__val" style="color: #065F46; font-weight: 700;">✓ data.gov.in</span></div>
              </div>
            `;
          }).join('');
        }
      } else {
        // Government data temporarily unavailable (Never fake numbers!)
        const govBestPriceEl = document.getElementById('dash-gov-best-price');
        const govNetRealEl = document.getElementById('dash-gov-net-realization');
        const govFreshnessText = document.getElementById('dash-gov-freshness-text');
        if (govBestPriceEl) govBestPriceEl.textContent = 'Unavailable';
        if (govNetRealEl) govNetRealEl.textContent = 'Unavailable';
        if (govFreshnessText) govFreshnessText.textContent = '· Please try again';

        if (tableBody) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="5" style="text-align: center; padding: 28px; color: #78350F; background: #FFFBEB; border-radius: 8px;">
                <div style="font-size: 24px; margin-bottom: 6px;">🏛️</div>
                <strong style="display: block; font-size: 14px; margin-bottom: 4px;">Government mandi prices are temporarily unavailable. Please try again.</strong>
                <span style="font-size: 12px; color: #92400E;">Source: Government of India (data.gov.in Agmarknet)</span>
                <div style="margin-top: 10px;">
                  <button class="btn btn--sm btn--secondary" onclick="initMarketComparison()">Retry Fetch</button>
                </div>
              </td>
            </tr>
          `;
        }
        if (cardsWrap) {
          cardsWrap.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #78350F; background: #FFFBEB; border-radius: 8px; font-size: 13px;">
              ⚠️ Government mandi prices are temporarily unavailable. Please try again.
            </div>
          `;
        }
      }
    } catch (err) {
      const govBestPriceEl = document.getElementById('dash-gov-best-price');
      const govNetRealEl = document.getElementById('dash-gov-net-realization');
      const govFreshnessText = document.getElementById('dash-gov-freshness-text');
      if (govBestPriceEl) govBestPriceEl.textContent = 'Unavailable';
      if (govNetRealEl) govNetRealEl.textContent = 'Unavailable';
      if (govFreshnessText) govFreshnessText.textContent = '· Please try again';

      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 28px; color: #78350F; background: #FFFBEB; border-radius: 8px;">
              <div style="font-size: 24px; margin-bottom: 6px;">🏛️</div>
              <strong style="display: block; font-size: 14px; margin-bottom: 4px;">Government mandi prices are temporarily unavailable. Please try again.</strong>
              <span style="font-size: 12px; color: #92400E;">Source: Government of India (data.gov.in Agmarknet)</span>
              <div style="margin-top: 10px;">
                <button class="btn btn--sm btn--secondary" onclick="initMarketComparison()">Retry Fetch</button>
              </div>
            </td>
          </tr>
        `;
      }
    }
  }

  if (cropSelect) cropSelect.addEventListener('change', renderComparison);
  if (locSelect) locSelect.addEventListener('change', renderComparison);
  renderComparison();
}

function initPriceTrendChart() {
  const cropSelect = document.getElementById('chart-crop-select');
  const tabs = document.querySelectorAll('.dash-chart-tab');
  const linePath = document.getElementById('chart-line');
  const areaPath = document.getElementById('chart-area');

  function updateChart(cropId, range) {
    const crop = CROPS_DATA.find(c => c.id === cropId) || CROPS_DATA[0];
    const base = crop.price;

    const elCurrent = document.getElementById('chart-stat-current');
    const elHigh = document.getElementById('chart-stat-high');
    const elLow = document.getElementById('chart-stat-low');
    const elAvg = document.getElementById('chart-stat-avg');
    const elTitle = document.getElementById('chart-title');

    if (elCurrent) elCurrent.textContent = `₹${base.toLocaleString('en-IN')}`;
    if (elHigh) elHigh.textContent = `₹${(base + 80).toLocaleString('en-IN')}`;
    if (elLow) elLow.textContent = `₹${(base - 180).toLocaleString('en-IN')}`;
    if (elAvg) elAvg.textContent = `₹${(base - 40).toLocaleString('en-IN')}`;
    if (elTitle) elTitle.textContent = `${crop.name} Price Trend (${range}D)`;

    // Simple smooth curve coordinates
    const points = [
      [80, 180], [180, 150], [280, 170], [380, 130],
      [480, 150], [580, 110], [680, 85], [780, 95], [880, 70]
    ];
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i][0]} ${points[i][1]}`;
    }

    if (linePath) linePath.setAttribute('d', d);
    if (areaPath) areaPath.setAttribute('d', `${d} L 880 220 L 80 220 Z`);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('dash-chart-tab--active'));
      tab.classList.add('dash-chart-tab--active');
      const range = tab.getAttribute('data-range') || '30';
      const cropId = cropSelect ? cropSelect.value : 'rice';
      updateChart(cropId, range);
    });
  });

  if (cropSelect) {
    cropSelect.addEventListener('change', () => {
      const activeTab = document.querySelector('.dash-chart-tab--active');
      const range = activeTab ? activeTab.getAttribute('data-range') : '30';
      updateChart(cropSelect.value, range);
    });
  }

  updateChart('rice', '30');
}

// ═════════════════════════════════════════════════════════════════════
// 9. CONNECTED FARMER DEMO FLOW: PRICE DISCOVERY ➔ ORDER ➔ TRANSPORT
// ═════════════════════════════════════════════════════════════════════

function openConfirmOrderModal() {
  openModal('confirm-order-modal-overlay');
}

function initFarmerOpportunityFlow() {
  const oppContainer = document.getElementById('farmer-demo-opportunity');
  const urlParams = new URLSearchParams(window.location.search);
  const cropParam = (urlParams.get('crop') || '').toLowerCase();

  if (oppContainer) {
    // Show best buying opportunity for Tomato
    oppContainer.style.display = 'block';
    oppContainer.innerHTML = `
      <div class="dash-card" style="background: #FFFFFF; border: 2px solid var(--ks-sage, #5B9A72); border-radius: 14px; padding: 22px; box-shadow: 0 4px 20px rgba(91, 154, 114, 0.12);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
          <div style="display:flex; gap:16px; align-items:center;">
            <div style="width:54px; height:54px; border-radius:12px; background:#F5F4ED; display:flex; align-items:center; justify-content:center; font-size:32px;">
              🍅
            </div>
            <div>
              <div style="display:inline-flex; align-items:center; gap:6px; padding:3px 10px; border-radius:6px; background:#E5F0E7; color:#12372A; font-size:11.5px; font-weight:700; text-transform:uppercase; margin-bottom:4px;">
                ⭐ Best Buying Opportunity Matched
              </div>
              <h3 style="font-size:20px; font-weight:700; color:var(--ks-evergreen, #12372A); margin:0 0 4px 0;">
                ABC Foods Ltd — Verified Institutional Procurement
              </h3>
              <p style="font-size:13.5px; color:#666; margin:0;">
                Direct purchase contract for your <strong>50 Qtl Tomato</strong> lot at verified premium farm-gate rate.
              </p>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px; color:#777; text-transform:uppercase; font-weight:600;">Offer Price</div>
            <div style="font-size:24px; font-weight:800; color:var(--ks-evergreen, #12372A);">₹2,500 <span style="font-size:14px; font-weight:500;">/ Qtl</span></div>
            <div style="font-size:13px; font-weight:700; color:var(--ks-sage, #5B9A72);">Total Value: ₹1,25,000</div>
          </div>
        </div>

        <div style="margin-top:16px; padding-top:14px; border-top:1px dashed #E5E4DD; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; gap:16px; font-size:12.5px; color:#555; flex-wrap:wrap;">
            <span>🚚 <strong>Transport:</strong> Pickup from Farmer Gate (Nashik)</span>
            <span>🔒 <strong>Payment:</strong> Escrow Protected 24h Bank Transfer</span>
            <span>✓ <strong>Buyer Rating:</strong> 4.9 ★ (Verified Corporate)</span>
          </div>
          <button class="btn btn--primary" id="btn-sell-best-price" style="font-size:14px; font-weight:700; padding:10px 22px;">
            Sell at Best Price →
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-sell-best-price')?.addEventListener('click', () => {
      openConfirmOrderModal();
    });

    if (cropParam === 'tomato') {
      const cropFilter = document.getElementById('filter-crop');
      if (cropFilter) {
        cropFilter.value = 'tomato';
        renderMarketGrid('', 'tomato', 'all', 'all');
      }
      const compareCrop = document.getElementById('compare-crop');
      if (compareCrop) {
        compareCrop.value = 'tomato';
        if (typeof renderComparison === 'function') renderComparison();
      }
    }
  }

  // Bind Confirm Order Modal Buttons
  const confirmCloseBtn = document.getElementById('confirm-order-modal-close');
  if (confirmCloseBtn) confirmCloseBtn.onclick = () => closeModal('confirm-order-modal-overlay');

  const cancelOrderBtn = document.getElementById('btn-cancel-order-modal');
  if (cancelOrderBtn) cancelOrderBtn.onclick = () => closeModal('confirm-order-modal-overlay');

  const executeConfirmBtn = document.getElementById('btn-execute-confirm-order');
  if (executeConfirmBtn) {
    executeConfirmBtn.onclick = async () => {
      executeConfirmBtn.disabled = true;
      executeConfirmBtn.innerHTML = 'Confirming Order… ⏳';

      const demoOrder = {
        orderId: 'KS-ORD-DEMO-001',
        cropName: 'Tomato',
        variety: 'Hybrid Abhinav',
        quantity: 50,
        quantityUnit: 'quintal',
        agreedPrice: 2500,
        priceUnit: 'quintal',
        totalAmount: 125000,
        status: 'confirmed',
        farmerName: 'Rajesh Patil (Nashik Farmer)',
        buyerName: 'ABC Foods Pvt Ltd',
        deliveryAddress: {
          name: 'ABC Foods Warehouse',
          phone: '+91 98230 45678',
          addressLine1: 'Plot 42, MIDC Industrial Area',
          village: 'Chakan',
          state: 'Maharashtra',
          pincode: '410501'
        },
        transport: {
          assigned: true,
          transporterName: 'Kisan Express Logistics',
          vehicleNumber: 'MH 15 AB 4589',
          driverName: 'Suresh Patil',
          driverPhone: '+91 98230 45891',
          pickupLocation: 'Rajesh Patil Farm Gate, Nashik',
          destination: 'ABC Foods Warehouse, MIDC Chakan, Pune',
          status: 'In Transit'
        },
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('krishi_demo_order', JSON.stringify(demoOrder));

      // Attempt server sync if order API is available
      try {
        if (window.api && window.api.orders && typeof window.api.orders.create === 'function') {
          await window.api.orders.create(demoOrder);
        }
      } catch (err) {
        console.warn('Local offline order storage active:', err);
      }

      closeModal('confirm-order-modal-overlay');
      openModal('order-created-modal-overlay');
      executeConfirmBtn.disabled = false;
      executeConfirmBtn.innerHTML = 'Confirm Order →';
    };
  }
}

// ═════════════════════════════════════════════════════════════════════
// 10. INITIALIZATION
// ═════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  // Authentication State Verification
  let authenticatedUser = null;
  if (window.Auth) {
    authenticatedUser = await window.Auth.verifyAuth();
    if (!authenticatedUser) {
      return;
    }
  }

  // Populate authenticated user info & personalized time-based greeting
  const currentUser = authenticatedUser || (window.Auth && window.Auth.getUser()) || JSON.parse(localStorage.getItem('krishi_user') || 'null');
  updateUserUI(currentUser);

  // 1. Date Display in Hero
  const dateEl = document.getElementById('dash-date-display');
  if (dateEl) {
    const opts = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    dateEl.innerHTML = `<i data-lucide="calendar"></i> ${new Date().toLocaleDateString('en-IN', opts)}`;
  }

  // 2. Render all dynamic panels
  renderMarketGrid();
  renderFarmerListings();
  renderLotsPanel();
  renderOffersPanel();
  renderOrdersGrid();
  renderAlertsGrid();
  updateStatsCounts();

  // 3. Initialize feature engines
  initAIForecast();
  initSearchAndFilters();
  initMarketComparison();
  initPriceTrendChart();
  initFarmerOpportunityFlow();

  // 4. Initialize Forms & Modals
  initModalCloseHandlers();
  initCreateLotForm();
  initEditLotForm();
  initPauseLotHandlers();
  initDeleteLotHandlers();
  initNegotiateForm();
  initAlertForm();
  initProfileForm();
  initPasswordForm();

  // 5. Header quick buttons
  const notifBtn = document.getElementById('btn-notifications');
  if (notifBtn) notifBtn.onclick = openNotificationsModal;



  const helpBtn = document.getElementById('btn-help');
  if (helpBtn) helpBtn.onclick = openHelpModal;

  const sellHeroBtn = document.getElementById('btn-sell-crop');
  if (sellHeroBtn) sellHeroBtn.onclick = () => openCreateLotModal();

  const actionSellBtn = document.getElementById('action-sell');
  if (actionSellBtn) actionSellBtn.onclick = () => openCreateLotModal();

  const createLotPanelBtn = document.getElementById('btn-create-lot');
  if (createLotPanelBtn) createLotPanelBtn.onclick = () => openCreateLotModal();

  const createAlertBtn = document.getElementById('btn-create-alert');
  if (createAlertBtn) createAlertBtn.onclick = () => openAlertModal();

  const menuProfile = document.getElementById('menu-profile');
  if (menuProfile) menuProfile.onclick = (e) => { e.preventDefault(); openProfileModal(); };

  const menuLots = document.getElementById('menu-lots');
  if (menuLots) menuLots.onclick = (e) => { e.preventDefault(); location.href = 'lots.html'; };

  const menuAlerts = document.getElementById('menu-alerts');
  if (menuAlerts) menuAlerts.onclick = (e) => { e.preventDefault(); openAlertModal(); };

  const menuHelp = document.getElementById('menu-help');
  if (menuHelp) menuHelp.onclick = (e) => { e.preventDefault(); openHelpModal(); };

  const menuLogout = document.querySelector('.dash-profile-dropdown__item--danger');
  if (menuLogout) {
    menuLogout.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.Auth) {
        window.Auth.logout();
      } else {
        localStorage.removeItem('krishi_is_logged_in');
        window.location.href = 'login.html';
      }
    });
  }

  // Mobile navigation toggle
  const mobileToggle = document.getElementById('dash-nav-toggle');
  const mobileNav = document.getElementById('dash-mobile-nav');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });
    document.querySelectorAll('.dash-mobile-nav__link').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileNav.classList.remove('active');
      });
    });
  }

  // Lot filter tabs in Panel
  document.querySelectorAll('.dash-lot-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dash-lot-filter-btn').forEach(b => b.classList.remove('dash-lot-filter-btn--active'));
      btn.classList.add('dash-lot-filter-btn--active');
      renderLotsPanel(btn.getAttribute('data-filter') || 'all');
    });
  });

  // Refresh prices button
  const refreshBtn = document.getElementById('btn-refresh-market');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.innerHTML = '<div class="dash-spinner" style="width:14px;height:14px;border-width:2px;margin:0;"></div> Updating...';
      setTimeout(() => {
        renderMarketGrid();
        refreshBtn.innerHTML = '<i data-lucide="refresh-cw"></i> Refresh Prices';
        if (window.lucide) lucide.createIcons();
        showToast('Live mandi prices refreshed.');
      }, 500);
    });
  }

  // Mobile Profile Nav link
  const mobileProf = document.getElementById('mobile-nav-profile');
  if (mobileProf) mobileProf.onclick = openProfileModal;

  // Render buyer & offer sections if present
  renderOffersPanel();
  renderBuyersDirectory();

  // Initialize SIH 26132 Farmer Experience Modules
  initDecisionEngine();
  initLotWizard();
  initStorageModule();
  initTransportModule();
  initDisputesModule();

  // Initialize Lucide icons
  if (window.lucide) lucide.createIcons();
});

// =====================================================================
// 12. SIH 26132: FARMER DECISION ENGINE
// (Full upgraded implementation with crop data, best options & APMC ranks in Section 17 below)
// =====================================================================
// ═════════════════════════════════════════════════════════════════════
// 13. SIH 26132: 8-STEP CROP LOT CREATION WIZARD
// ═════════════════════════════════════════════════════════════════════

let currentWizardStep = 1;
const totalWizardSteps = 8;

const wizardStepSubtitles = [
  'Select the agricultural commodity to sell',
  'Specify total available harvest quantity & variety',
  'Select certified quality grade and sorting level',
  'Confirm farm origin village and dispatch pincode',
  'Set your expected base price per quintal',
  'Specify harvest date and dispatch deadline',
  'Add moisture level and crop specifications',
  'Review your complete lot listing before publishing'
];

function initLotWizard() {
  const modal = document.getElementById('create-lot-modal-overlay');
  if (!modal) return;

  // Crop Chip click selection in Step 1
  const chips = document.querySelectorAll('.lot-crop-chips-grid .lot-crop-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      const crop = chip.getAttribute('data-crop');
      const cropVal = document.getElementById('wiz-crop-val');
      if (cropVal) cropVal.value = crop;

      // Update variety placeholder
      const varietyInput = document.getElementById('wiz-variety-input');
      if (varietyInput) {
        varietyInput.value = chip.querySelector('.lot-crop-name')?.textContent + ' (Grade A Premium)';
      }
    });
  });

  // Next / Prev button handlers
  const btnNext = document.getElementById('wiz-btn-next');
  const btnPrev = document.getElementById('wiz-btn-prev');
  const btnPublish = document.getElementById('wiz-btn-publish');
  const form = document.getElementById('create-lot-form');

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (validateWizardStep(currentWizardStep)) {
        if (currentWizardStep < totalWizardSteps) {
          goToWizardStep(currentWizardStep + 1);
        }
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentWizardStep > 1) {
        goToWizardStep(currentWizardStep - 1);
      }
    });
  }

  // Stepper Node direct clicks
  document.querySelectorAll('.lot-wizard-step').forEach(stepNode => {
    stepNode.addEventListener('click', () => {
      const targetStep = parseInt(stepNode.getAttribute('data-step'), 10);
      if (targetStep < currentWizardStep || validateWizardStep(currentWizardStep)) {
        goToWizardStep(targetStep);
      }
    });
  });

  // Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const cropKey = document.getElementById('wiz-crop-val')?.value || 'tomato';
      const cropName = cropKey.charAt(0).toUpperCase() + cropKey.slice(1);
      const qty = parseFloat(document.getElementById('wiz-qty-input')?.value || 25);
      const price = parseFloat(document.getElementById('wiz-price-input')?.value || 2850);
      const grade = document.getElementById('wiz-grade-select')?.value || 'Grade A';
      const location = document.getElementById('wiz-location-input')?.value || 'Nashik, Maharashtra';
      const harvestDate = document.getElementById('wiz-harvest-date')?.value || new Date().toISOString().split('T')[0];
      const desc = document.getElementById('wiz-desc-input')?.value || 'Fresh harvest, machine cleaned and sorted.';

      const newLot = {
        id: `lot-${Date.now()}`,
        cropId: cropKey,
        crop: cropName,
        quantity: qty,
        expectedPrice: price,
        marketPrice: price - 150,
        location: location,
        harvestDate: harvestDate,
        grade: grade,
        description: desc,
        image: `assets/images/crop-${cropKey}.jpg`,
        status: 'listed',
        createdAt: new Date().toISOString()
      };

      if (window.krishiStore) {
        window.krishiStore.addLot(newLot);
      }

      if (btnPublish) {
        btnPublish.disabled = true;
        btnPublish.innerHTML = '<div class="dash-spinner" style="width:14px;height:14px;border-width:2px;margin:0 auto;"></div> Publishing...';
      }

      setTimeout(() => {
        if (btnPublish) {
          btnPublish.disabled = false;
          btnPublish.innerHTML = '<i data-lucide="check-circle-2"></i> Confirm & Publish Lot';
        }
        closeModal(modal);
        showToast(`🌾 Success! Your ${qty} quintal ${cropName} lot is now live for 120+ verified buyers.`);
        renderLotsPanel('all');
        goToWizardStep(1);
        if (window.lucide) lucide.createIcons();
      }, 700);
    });
  }

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const harvestInp = document.getElementById('wiz-harvest-date');
  const availInp = document.getElementById('wiz-available-until');
  if (harvestInp && !harvestInp.value) harvestInp.value = today;
  if (availInp && !availInp.value) availInp.value = nextWeek;
}

function goToWizardStep(step) {
  currentWizardStep = step;

  // Update step indicator
  document.querySelectorAll('.lot-wizard-step').forEach(node => {
    const s = parseInt(node.getAttribute('data-step'), 10);
    node.classList.remove('active', 'completed');
    if (s === step) node.classList.add('active');
    else if (s < step) node.classList.add('completed');
  });

  // Update step panes
  document.querySelectorAll('.lot-wizard-pane').forEach((pane, idx) => {
    pane.classList.remove('active');
    if (idx + 1 === step) pane.classList.add('active');
  });

  // Update titles
  const stepNumEl = document.getElementById('wizard-curr-step-num');
  const stepSubEl = document.getElementById('wizard-step-subtitle');
  if (stepNumEl) stepNumEl.textContent = step;
  if (stepSubEl) stepSubEl.textContent = wizardStepSubtitles[step - 1] || '';

  // Update Buttons
  const btnPrev = document.getElementById('wiz-btn-prev');
  const btnNext = document.getElementById('wiz-btn-next');
  const btnPublish = document.getElementById('wiz-btn-publish');

  if (btnPrev) btnPrev.style.visibility = step === 1 ? 'hidden' : 'visible';
  if (btnNext) btnNext.style.display = step === totalWizardSteps ? 'none' : 'inline-flex';
  if (btnPublish) btnPublish.style.display = step === totalWizardSteps ? 'inline-flex' : 'none';

  // Render review summary on Step 8
  if (step === 8) {
    renderWizardSummary();
  }

  if (window.lucide) lucide.createIcons();
}

function validateWizardStep(step) {
  if (step === 2) {
    const qty = document.getElementById('wiz-qty-input')?.value;
    if (!qty || parseFloat(qty) <= 0) {
      showToast('Please enter a valid harvest quantity.');
      return false;
    }
  } else if (step === 4) {
    const loc = document.getElementById('wiz-location-input')?.value;
    if (!loc) {
      showToast('Please specify your farm dispatch location.');
      return false;
    }
  } else if (step === 5) {
    const price = document.getElementById('wiz-price-input')?.value;
    if (!price || parseFloat(price) <= 0) {
      showToast('Please enter your expected rate in ₹/quintal.');
      return false;
    }
  }
  return true;
}

function renderWizardSummary() {
  const summaryEl = document.getElementById('wiz-summary-preview');
  if (!summaryEl) return;

  const cropKey = document.getElementById('wiz-crop-val')?.value || 'tomato';
  const cropName = cropKey.charAt(0).toUpperCase() + cropKey.slice(1);
  const qty = document.getElementById('wiz-qty-input')?.value || 25;
  const variety = document.getElementById('wiz-variety-input')?.value || 'Standard Variety';
  const grade = document.getElementById('wiz-grade-select')?.value || 'Grade A';
  const location = document.getElementById('wiz-location-input')?.value || 'Nashik, Maharashtra';
  const price = document.getElementById('wiz-price-input')?.value || 2850;
  const harvest = document.getElementById('wiz-harvest-date')?.value || 'Today';
  const avail = document.getElementById('wiz-available-until')?.value || 'Next 7 Days';
  const totalVal = (parseFloat(qty) * parseFloat(price)).toLocaleString('en-IN');

  summaryEl.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; border-bottom:1px dashed #DDD; padding-bottom:10px;">
      <div>
        <h4 style="font-size:18px; font-weight:800; color:var(--ks-evergreen); margin:0 0 2px 0;">${cropName} (${variety})</h4>
        <span style="font-size:12px; color:var(--ks-text-muted);">📍 ${location}</span>
      </div>
      <span style="background:var(--ks-mint-light); color:var(--ks-evergreen); font-size:11.5px; font-weight:700; padding:3px 10px; border-radius:6px;">${grade}</span>
    </div>
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; font-size:13px; margin-bottom:12px;">
      <div><span style="color:#777; font-size:11px; display:block;">Quantity:</span><strong>${qty} Quintals</strong></div>
      <div><span style="color:#777; font-size:11px; display:block;">Expected Rate:</span><strong>₹${parseFloat(price).toLocaleString('en-IN')}/q</strong></div>
      <div><span style="color:#777; font-size:11px; display:block;">Estimated Lot Value:</span><strong style="color:var(--ks-evergreen);">₹${totalVal}</strong></div>
    </div>
    <div style="font-size:12px; color:#555; background:#FFFFFF; padding:8px 12px; border-radius:6px; border:1px solid #ECEAE1;">
      📅 <strong>Dispatch Window:</strong> ${harvest} until ${avail} · Direct farm gate pickup ready.
    </div>
  `;
}

// ═════════════════════════════════════════════════════════════════════
// 14. SIH 26132: STORAGE DISCOVERY & BOOKING ("Storage Near You")
// ═════════════════════════════════════════════════════════════════════

const STORAGE_FACILITIES = [
  {
    name: 'Nashik Agro Cold Storage',
    loc: '📍 8.4 km · Dindori Road, Nashik',
    type: 'Cold Chain',
    typeClass: 'badge-cold',
    capacity: '12 Tonnes',
    rate: '₹2.5/kg/day',
    rateNum: 2.5,
    crops: 'Tomato, Onion, Grapes, Pomegranate',
    temp: '2°C to 8°C (Humidity Controlled)',
    subsidy: 'Save ₹3,400 by avoiding immediate distress sale.'
  },
  {
    name: 'Pune Krishi Dry Warehouse',
    loc: '📍 14.2 km · Gultekdi Market Yard, Pune',
    type: 'Dry Storage',
    typeClass: 'badge-dry',
    capacity: '45 Tonnes',
    rate: '₹45/quintal/month',
    rateNum: 1.5,
    crops: 'Wheat, Rice, Soybean, Pulses, Maize',
    temp: 'Ambient Aerated Silo',
    subsidy: 'WDRA registered · Eligible for e-NWR pledge financing.'
  },
  {
    name: 'Solapur Central Cold Chain',
    loc: '📍 22.0 km · Mohol Highway, Solapur',
    type: 'Controlled Temp',
    typeClass: 'badge-cold',
    capacity: '18 Tonnes',
    rate: '₹2.8/kg/day',
    rateNum: 2.8,
    crops: 'Chilli, Onion, Tomato, Pomegranate',
    temp: 'Multi-Chamber Dehumidified',
    subsidy: 'Zero spoilage guarantee with IoT telematics monitoring.'
  },
  {
    name: 'Baramati MahaAgro Terminal Warehouse',
    loc: '📍 38.5 km · MIDC Agro Zone, Baramati',
    type: 'Integrated Logistics Hub',
    typeClass: 'badge-dry',
    capacity: '120 Tonnes',
    rate: '₹1.8/kg/day',
    rateNum: 1.8,
    crops: 'Grains, Oilseeds, Pulses, Cotton',
    temp: 'Scientific Grain Storage Vault',
    subsidy: 'Direct rail-siding link with institutional buyer pickup.'
  }
];

function initStorageModule() {
  const modal = document.getElementById('storage-modal-overlay');
  const bookingModal = document.getElementById('storage-booking-modal-overlay');
  const closeBtn = document.getElementById('storage-modal-close');
  const bookCloseBtn = document.getElementById('storage-booking-modal-close');
  const form = document.getElementById('storage-booking-form');

  if (closeBtn) closeBtn.onclick = () => closeModal(modal);
  if (bookCloseBtn) bookCloseBtn.onclick = () => closeModal(bookingModal);

  // Search input filter
  const searchInp = document.getElementById('storage-search-input');
  if (searchInp) {
    searchInp.addEventListener('input', (e) => {
      renderStorageList(e.target.value.toLowerCase());
    });
  }

  // Booking Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const facility = document.getElementById('sb-facility-name')?.value;
      const crop = document.getElementById('sb-crop-select')?.value;
      const qty = document.getElementById('sb-qty-input')?.value;
      const days = document.getElementById('sb-duration-days')?.value;

      closeModal(bookingModal);
      showToast(`🏢 Reservation Confirmed! ${qty} Tonnes of ${crop} booked at ${facility} for ${days} days. Booking ID: KS-STR-${Math.floor(1000 + Math.random() * 9000)}`);
    });
  }
}

function openStorageModal() {
  const modal = document.getElementById('storage-modal-overlay');
  if (modal) {
    renderStorageList('');
    openModal(modal);
  }
}

function renderStorageList(query = '') {
  const grid = document.getElementById('storage-modal-grid');
  if (!grid) return;

  const filtered = STORAGE_FACILITIES.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.loc.toLowerCase().includes(query) ||
    s.crops.toLowerCase().includes(query)
  );

  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; color:#888;">No storage facilities match your search.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(s => `
    <div class="storage-card">
      <div>
        <div class="storage-card__header">
          <div>
            <h4 class="storage-card__title">${s.name}</h4>
            <span class="storage-card__loc">${s.loc}</span>
          </div>
          <span class="storage-type-badge">${s.type}</span>
        </div>
        <div class="storage-card__specs">
          <div class="storage-spec-row"><span>Available Capacity:</span><strong>${s.capacity}</strong></div>
          <div class="storage-spec-row"><span>Storage Cost:</span><strong>${s.rate}</strong></div>
          <div class="storage-spec-row"><span>Environment:</span><span>${s.temp}</span></div>
          <div class="storage-spec-row"><span>Suitable For:</span><span>${s.crops}</span></div>
          <div class="storage-spec-row"><span>Status:</span><span style="color:#2D6A4F; font-weight:700;">🟢 Available</span></div>
        </div>
        <div class="distress-savings-box">
          <span>💡</span>
          <span>${s.subsidy}</span>
        </div>
      </div>
      <button class="btn btn--primary btn--sm" style="width:100%;" onclick="bookStorageDirect('${s.name}', '${s.type}', ${s.rateNum})">
        <i data-lucide="bookmark-check"></i> Book Storage Space
      </button>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function bookStorageDirect(facilityName, type, rate) {
  const modal = document.getElementById('storage-booking-modal-overlay');
  if (!modal) return;

  const facInput = document.getElementById('sb-facility-name');
  if (facInput) facInput.value = facilityName;

  const summary = document.getElementById('sb-cost-summary');
  if (summary) {
    summary.innerHTML = `Estimated Total Cost: <strong>₹${(5 * 1000 * rate * 14 / 100).toLocaleString('en-IN')}</strong> (${rate}/kg/day)`;
  }

  openModal(modal);
}

// ═════════════════════════════════════════════════════════════════════
// 15. SIH 26132: ARRANGE TRANSPORT ("Driver → Vehicle → ETA → Status")
// ═════════════════════════════════════════════════════════════════════

const TRANSPORTER_FLEET = [
  {
    driver: 'Santosh Shinde',
    phone: '+91 98234 11223',
    vehicle: 'Tata 407 (Mini Truck)',
    capacity: '2.5 Tonnes (25 Quintals)',
    costPerKm: '₹22/km',
    estFare: '₹1,450',
    distance: '35 km haul',
    eta: '35 mins away',
    status: '🟢 Available at Nashik Hub',
    rating: '4.9 ★ (140+ Trips)'
  },
  {
    driver: 'Mahesh Gaikwad',
    phone: '+91 97654 88776',
    vehicle: 'Eicher 1110 (Closed Container)',
    capacity: '7.5 Tonnes (75 Quintals)',
    costPerKm: '₹34/km',
    estFare: '₹3,200',
    distance: '85 km haul',
    eta: '1 hour away',
    status: '🟢 Available at Pune Bypass',
    rating: '4.8 ★ (98 Trips)'
  },
  {
    driver: 'Rameshwar Pawar',
    phone: '+91 99221 44332',
    vehicle: 'Mahindra Bolero Maxi Truck',
    capacity: '1.5 Tonnes (15 Quintals)',
    costPerKm: '₹16/km',
    estFare: '₹950',
    distance: '20 km haul',
    eta: '20 mins away',
    status: '🟢 Available near Farm Gate',
    rating: '5.0 ★ (210+ Trips)'
  }
];

function initTransportModule() {
  const modal = document.getElementById('transport-modal-overlay');
  const closeBtn = document.getElementById('transport-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal(modal);
}

function openTransportModal() {
  const modal = document.getElementById('transport-modal-overlay');
  const grid = document.getElementById('transport-modal-grid');
  if (!modal || !grid) return;

  grid.innerHTML = TRANSPORTER_FLEET.map(t => `
    <div class="transport-card">
      <div>
        <div class="transport-card__header">
          <div>
            <h4 class="transport-vehicle-title">${t.vehicle}</h4>
            <span style="font-size:12px; color:var(--ks-text-muted);">Driver: <strong>${t.driver}</strong> (${t.rating})</span>
          </div>
          <span class="transport-eta-pill">⚡ ${t.eta}</span>
        </div>
        <div style="background:var(--ks-bg-ivory); border-radius:8px; padding:10px 12px; margin:10px 0 12px 0; font-size:12.5px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Capacity:</span><strong>${t.capacity}</strong></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Freight Rate:</span><strong>${t.costPerKm}</strong></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Estimated Cost:</span><strong style="color:var(--ks-evergreen); font-size:14px;">${t.estFare}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Status:</span><span style="color:#2D6A4F; font-weight:700;">${t.status}</span></div>
        </div>
      </div>
      <button class="btn btn--primary btn--sm" style="width:100%;" onclick="bookTransportDirect('${t.driver}', '${t.vehicle}', '${t.estFare}')">
        <i data-lucide="truck"></i> Book Pickup Now
      </button>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
  openModal(modal);
}

function bookTransportDirect(driver, vehicle, fare) {
  const modal = document.getElementById('transport-modal-overlay');
  if (modal) closeModal(modal);
  showToast(`🚚 Pickup Booked! ${vehicle} driven by ${driver} is dispatched to your farm. Estimated fare: ${fare}. Tracking ID: KS-TRP-${Math.floor(1000 + Math.random() * 9000)}`);
}

// ═════════════════════════════════════════════════════════════════════
// 16. SIH 26132: KISAN DISPUTE & GRIEVANCE REDRESSAL SYSTEM
// ═════════════════════════════════════════════════════════════════════

const DEFAULT_DISPUTES = [
  {
    id: 'DSP-2026-8812',
    trxId: 'KS-ORD-2026-000102',
    category: 'Payment delay past 24 hours',
    crop: 'Rice (25q)',
    buyer: 'ABC Foods Ltd',
    amount: '₹71,250',
    date: '04 Sep 2026',
    status: 'review',
    statusText: 'Under Review',
    statusClass: 'dispute-status-pill--review',
    resolution: 'Platform Escrow Officer has verified dispatch slip. Buyer notified to clear payout within 4 hours.'
  }
];

function initDisputesModule() {
  const modal = document.getElementById('disputes-modal-overlay');
  const closeBtn = document.getElementById('disputes-modal-close');
  const form = document.getElementById('dispute-form');

  if (closeBtn) closeBtn.onclick = () => closeModal(modal);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const trx = document.getElementById('disp-trx-select')?.value || 'KS-ORD-2026-000102';
      const category = document.getElementById('disp-reason-select')?.value || 'Payment not received';
      const desc = document.getElementById('disp-desc-input')?.value || 'Grievance submitted';
      const newId = `DSP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newDispute = {
        id: newId,
        trxId: trx,
        category: category,
        crop: 'Produce Shipment',
        buyer: 'Institutional Procurement Partner',
        amount: '₹28,500',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'submitted',
        statusText: 'Submitted (Ticket Active)',
        statusClass: 'dispute-status-pill--submitted',
        resolution: 'Your ticket has been assigned to Kisan Grievance Officer. Investigation is in progress.'
      };

      DEFAULT_DISPUTES.unshift(newDispute);
      showToast(`🛡️ Grievance Ticket Created: ${newId}. Our Kisan Redressal Team will contact you within 6 hours.`);
      form.reset();
      switchDisputeTab('history');
    });
  }
}

function openDisputesModal() {
  const modal = document.getElementById('disputes-modal-overlay');
  if (!modal) return;
  switchDisputeTab('raise');
  renderDisputeHistory();
  openModal(modal);
}

function switchDisputeTab(tab) {
  const tabRaise = document.getElementById('tab-dispute-raise');
  const tabHistory = document.getElementById('tab-dispute-history');
  const paneRaise = document.getElementById('dispute-pane-raise');
  const paneHistory = document.getElementById('dispute-pane-history');

  if (tab === 'raise') {
    if (tabRaise) { tabRaise.className = 'btn btn--sm btn--primary'; }
    if (tabHistory) { tabHistory.className = 'btn btn--sm btn--secondary'; }
    if (paneRaise) paneRaise.style.display = 'block';
    if (paneHistory) paneHistory.style.display = 'none';
  } else {
    if (tabRaise) { tabRaise.className = 'btn btn--sm btn--secondary'; }
    if (tabHistory) { tabHistory.className = 'btn btn--sm btn--primary'; }
    if (paneRaise) paneRaise.style.display = 'none';
    if (paneHistory) paneHistory.style.display = 'block';
    renderDisputeHistory();
  }
}

function renderDisputeHistory() {
  const list = document.getElementById('dispute-history-list');
  const badge = document.getElementById('dispute-count-badge');
  if (!list) return;

  if (badge) badge.textContent = DEFAULT_DISPUTES.length;

  list.innerHTML = DEFAULT_DISPUTES.map(d => `
    <div class="dispute-card">
      <div style="flex:1; min-width:240px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <span style="font-family:monospace; font-weight:800; color:var(--ks-evergreen); font-size:13px;">${d.id}</span>
          <span class="dispute-status-pill ${d.statusClass}">${d.statusText}</span>
        </div>
        <h4 style="font-size:15px; font-weight:700; color:#222; margin:0 0 2px 0;">${d.category}</h4>
        <div style="font-size:12px; color:#666;">Transaction: <strong>${d.trxId}</strong> · ${d.date}</div>
        <div style="background:#FAF9F5; border-left:3px solid var(--ks-evergreen); padding:8px 10px; border-radius:4px; margin-top:8px; font-size:12px; color:#444;">
          <strong>Resolution Progress:</strong> ${d.resolution}
        </div>
      </div>
      <button class="btn btn--secondary btn--sm" onclick="showToast('Helpline connecting to Dispute Officer for ticket ${d.id}...')">
        <i data-lucide="phone-call"></i> Call Officer
      </button>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// ═════════════════════════════════════════════════════════════════════
// 17. SIH 26132: FARMER DECISION ENGINE & BEST OPTION RECOMMENDATION
// ═════════════════════════════════════════════════════════════════════

const DECISION_CROP_DATA = {
  tomato: {
    cropName: 'Tomato',
    emoji: '🍅',
    qty: '500 kg',
    curPrice: '₹2,490',
    bestMandi: 'Nashik APMC',
    mandiDist: '42 km · Highest Net Realization',
    bestPrice: '₹2,920',
    netVal: '₹2,780/q',
    expPrice: '₹3,050',
    trendBadge: '↑ +4.2%',
    trendClass: 'farmer-metric-badge--up',
    demandText: '🔥 High',
    demandClass: 'farmer-metric-badge--high',
    adviceIcon: '🟢',
    adviceTitle: 'Good Time to Sell (Next 2–3 Days)',
    adviceDesc: 'Prices are trending upward across nearby APMCs with strong institutional buyer demand. Consider listing or dispatching within the next 48 to 72 hours for maximum net realization.',
    optTitle: '⭐ Best Option for Your Tomato (500 kg)',
    optMandi: 'Nashik APMC · 42 km away',
    optPrice: '₹2,920/q',
    optExp: '₹3,050/q',
    optDemand: '🔥 High',
    optTransport: '₹1,800 approx.',
    optNet: '₹13,000',
    reasons: [
      '<strong>Better price:</strong> ₹430/q higher than local village baseline.',
      '<strong>High buyer demand:</strong> 4 verified institutional food processors bidding today.',
      '<strong>Reasonable transport cost:</strong> Only ₹36/q with return-trip verified truckers.',
      '<strong>Prices trending upward:</strong> AI forecast predicts peak price in next 48 hours.'
    ],
    ranks: [
      { name: '🥇 Nashik APMC', badge: '⭐ Best for you', price: '₹2,920/q', trend: '↑ 4.2%', trendCol: '#2D6A4F', dist: '42 km', demand: 'High', demandCol: '#D6A84F', net: '₹13,000 net', gold: true },
      { name: '🥈 Pune APMC', badge: '', price: '₹2,850/q', trend: '↑ 2.1%', trendCol: '#2D6A4F', dist: '128 km', demand: 'Medium', demandCol: '#3B82F6', net: '₹12,400 net', gold: false },
      { name: '🥉 Mumbai APMC', badge: '', price: '₹2,760/q', trend: '↓ 0.8%', trendCol: '#DC2626', dist: '165 km', demand: 'Moderate', demandCol: '#6B7280', net: '₹11,900 net', gold: false }
    ]
  },
  onion: {
    cropName: 'Onion',
    emoji: '🧅',
    qty: '1,200 kg',
    curPrice: '₹2,720',
    bestMandi: 'Lasalgaon APMC',
    mandiDist: '28 km · Asia’s Largest Onion Hub',
    bestPrice: '₹3,180',
    netVal: '₹3,060/q',
    expPrice: '₹3,290',
    trendBadge: '↑ +6.8%',
    trendClass: 'farmer-metric-badge--up',
    demandText: '🔥 Very High',
    demandClass: 'farmer-metric-badge--high',
    adviceIcon: '🟢',
    adviceTitle: 'Prime Selling Opportunity (Next 3–5 Days)',
    adviceDesc: 'Lasalgaon and Pimpalgaon buyers are aggressively purchasing Grade A red onions for South India dispatch. Outstanding returns expected this week.',
    optTitle: '⭐ Best Option for Your Onion (1,200 kg)',
    optMandi: 'Lasalgaon APMC · 28 km away',
    optPrice: '₹3,180/q',
    optExp: '₹3,290/q',
    optDemand: '🔥 Very High',
    optTransport: '₹1,440 approx.',
    optNet: '₹36,720',
    reasons: [
      '<strong>Highest Regional Rate:</strong> ₹460/q above national benchmark.',
      '<strong>Instant Escrow Payout:</strong> Same-day direct NEFT bank settlement.',
      '<strong>High Export Demand:</strong> GCC consignment packers buying Grade A.',
      '<strong>Low Freight Overhead:</strong> Short 28 km transit route.'
    ],
    ranks: [
      { name: '🥇 Lasalgaon APMC', badge: '⭐ Best for you', price: '₹3,180/q', trend: '↑ 6.8%', trendCol: '#2D6A4F', dist: '28 km', demand: 'Very High', demandCol: '#D6A84F', net: '₹36,720 net', gold: true },
      { name: '🥈 Nashik APMC', badge: '', price: '₹2,990/q', trend: '↑ 3.4%', trendCol: '#2D6A4F', dist: '36 km', demand: 'High', demandCol: '#D6A84F', net: '₹34,440 net', gold: false },
      { name: '🥉 Pimpalgaon APMC', badge: '', price: '₹2,910/q', trend: '↑ 1.8%', trendCol: '#2D6A4F', dist: '49 km', demand: 'Medium', demandCol: '#3B82F6', net: '₹33,120 net', gold: false }
    ]
  },
  wheat: {
    cropName: 'Wheat',
    emoji: '🌾',
    qty: '2,000 kg',
    curPrice: '₹2,640',
    bestMandi: 'Pune APMC',
    mandiDist: '54 km · Flour Mill Institutional Buying',
    bestPrice: '₹2,840',
    netVal: '₹2,720/q',
    expPrice: '₹2,890',
    trendBadge: '↑ +1.9%',
    trendClass: 'farmer-metric-badge--up',
    demandText: '🟢 Steady',
    demandClass: 'farmer-metric-badge--high',
    adviceIcon: '🟢',
    adviceTitle: 'Stable Market (Fair Time to Sell)',
    adviceDesc: 'FMCG biscuit and flour mills maintaining regular buying orders. Rates are well above MSP of ₹2,275. Recommended to sell or pledge against e-NWR if holding for festival peak.',
    optTitle: '⭐ Best Option for Your Wheat (2,000 kg)',
    optMandi: 'Pune APMC · 54 km away',
    optPrice: '₹2,840/q',
    optExp: '₹2,890/q',
    optDemand: '🟢 Steady',
    optTransport: '₹2,400 approx.',
    optNet: '₹54,400',
    reasons: [
      '<strong>₹565/q Above MSP:</strong> Excellent premium for Sharbati/Lokwan varieties.',
      '<strong>FMCG Procurement:</strong> Direct intake by ITC & Britannia contract hubs.',
      '<strong>Warehouse Receipt Option:</strong> WDRA warehouse available at ₹45/q/mo.',
      '<strong>Low Volatility:</strong> Reliable price floor over the next 10 days.'
    ],
    ranks: [
      { name: '🥇 Pune APMC', badge: '⭐ Best for you', price: '₹2,840/q', trend: '↑ 1.9%', trendCol: '#2D6A4F', dist: '54 km', demand: 'Steady', demandCol: '#2D6A4F', net: '₹54,400 net', gold: true },
      { name: '🥈 Daund APMC', badge: '', price: '₹2,780/q', trend: '↑ 0.8%', trendCol: '#2D6A4F', dist: '72 km', demand: 'Moderate', demandCol: '#3B82F6', net: '₹52,800 net', gold: false },
      { name: '🥉 Ahmednagar APMC', badge: '', price: '₹2,710/q', trend: '→ 0.0%', trendCol: '#6B7280', dist: '88 km', demand: 'Moderate', demandCol: '#6B7280', net: '₹51,200 net', gold: false }
    ]
  },
  soybean: {
    cropName: 'Soybean',
    emoji: '🫘',
    qty: '1,500 kg',
    curPrice: '₹4,750',
    bestMandi: 'Nagpur APMC',
    mandiDist: '68 km · Oil Extraction Plant Hub',
    bestPrice: '₹5,180',
    netVal: '₹5,020/q',
    expPrice: '₹5,320',
    trendBadge: '↑ +4.8%',
    trendClass: 'farmer-metric-badge--up',
    demandText: '🔥 High',
    demandClass: 'farmer-metric-badge--high',
    adviceIcon: '🟢',
    adviceTitle: 'Strong Bullish Trend (Sell in 4–6 Days)',
    adviceDesc: 'Solvent extractors and global feed demand driving strong bidding for yellow soybean with >18% oil content. Prices projected to climb further.',
    optTitle: '⭐ Best Option for Your Soybean (1,500 kg)',
    optMandi: 'Nagpur APMC · 68 km away',
    optPrice: '₹5,180/q',
    optExp: '₹5,320/q',
    optDemand: '🔥 High',
    optTransport: '₹2,400 approx.',
    optNet: '₹75,300',
    reasons: [
      '<strong>Oil Mill Direct Contracts:</strong> Solvent plants offering +₹280/q premium.',
      '<strong>Moisture Bonus:</strong> Lots under 10% moisture receive instant A grade.',
      '<strong>High Liquidity:</strong> 100% digital escrow settlement in 12 hours.',
      '<strong>Rising Global Oil Prices:</strong> Crushing demand projected strong.'
    ],
    ranks: [
      { name: '🥇 Nagpur APMC', badge: '⭐ Best for you', price: '₹5,180/q', trend: '↑ 4.8%', trendCol: '#2D6A4F', dist: '68 km', demand: 'High', demandCol: '#D6A84F', net: '₹75,300 net', gold: true },
      { name: '🥈 Latur APMC', badge: '', price: '₹5,040/q', trend: '↑ 3.1%', trendCol: '#2D6A4F', dist: '110 km', demand: 'High', demandCol: '#D6A84F', net: '₹72,800 net', gold: false },
      { name: '🥉 Akola APMC', badge: '', price: '₹4,950/q', trend: '↑ 1.5%', trendCol: '#2D6A4F', dist: '142 km', demand: 'Medium', demandCol: '#3B82F6', net: '₹70,650 net', gold: false }
    ]
  },
  potato: {
    cropName: 'Potato',
    emoji: '🥔',
    qty: '3,000 kg',
    curPrice: '₹1,620',
    bestMandi: 'Indore APMC',
    mandiDist: '85 km · Chip Wafers Processing Hub',
    bestPrice: '₹1,950',
    netVal: '₹1,840/q',
    expPrice: '₹2,020',
    trendBadge: '↑ +3.5%',
    trendClass: 'farmer-metric-badge--up',
    demandText: '🔥 High',
    demandClass: 'farmer-metric-badge--high',
    adviceIcon: '🟢',
    adviceTitle: 'Favorable Processor Demand',
    adviceDesc: 'Snack food processors actively procuring high solid sugar-free potatoes (Lady Rosetta / Chipsona) at premium rates.',
    optTitle: '⭐ Best Option for Your Potato (3,000 kg)',
    optMandi: 'Indore APMC · 85 km away',
    optPrice: '₹1,950/q',
    optExp: '₹2,020/q',
    optDemand: '🔥 High',
    optTransport: '₹3,300 approx.',
    optNet: '₹55,200',
    reasons: [
      '<strong>Processor Premium:</strong> ₹330/q above ordinary table potato.',
      '<strong>Bulk Truckload Rates:</strong> ₹1.10/q/km with KrishiShetra logistics.',
      '<strong>Cold Storage Alternative:</strong> Local cold vaults available at ₹1.6/kg/mo.',
      '<strong>High Acceptance Rate:</strong> 99% verified clearance on delivered weight.'
    ],
    ranks: [
      { name: '🥇 Indore APMC', badge: '⭐ Best for you', price: '₹1,950/q', trend: '↑ 3.5%', trendCol: '#2D6A4F', dist: '85 km', demand: 'High', demandCol: '#D6A84F', net: '₹55,200 net', gold: true },
      { name: '🥈 Nashik APMC', badge: '', price: '₹1,820/q', trend: '↑ 1.2%', trendCol: '#2D6A4F', dist: '62 km', demand: 'Medium', demandCol: '#3B82F6', net: '₹52,100 net', gold: false },
      { name: '🥉 Mumbai APMC', badge: '', price: '₹1,740/q', trend: '↓ 0.5%', trendCol: '#DC2626', dist: '165 km', demand: 'Medium', demandCol: '#6B7280', net: '₹48,900 net', gold: false }
    ]
  },
  rice: {
    cropName: 'Rice',
    emoji: '🌾',
    qty: '2,500 kg',
    curPrice: '₹2,850',
    bestMandi: 'Pune APMC',
    mandiDist: '48 km · Basmati & Kolam Hub',
    bestPrice: '₹3,150',
    netVal: '₹3,020/q',
    expPrice: '₹3,240',
    trendBadge: '↑ +3.2%',
    trendClass: 'farmer-metric-badge--up',
    demandText: '🔥 High',
    demandClass: 'farmer-metric-badge--high',
    adviceIcon: '🟢',
    adviceTitle: 'Strong Demand (Next 3–5 Days)',
    adviceDesc: 'Urban retail demand in Pune and Mumbai is steady for aromatic rice. Exporters active for Grade A milled paddy.',
    optTitle: '⭐ Best Option for Your Rice (2,500 kg)',
    optMandi: 'Pune APMC · 48 km away',
    optPrice: '₹3,150/q',
    optExp: '₹3,240/q',
    optDemand: '🔥 High',
    optTransport: '₹3,250 approx.',
    optNet: '₹75,500',
    reasons: [
      '<strong>Exporter Benchmark:</strong> ₹300/q premium for premium Kolam & Wada Kolam.',
      '<strong>Instant Digital Payment:</strong> 24h escrow transfer to bank account.',
      '<strong>Minimal Rejection:</strong> Clear grading specifications on moisture & broken grains.',
      '<strong>Low Logistics Friction:</strong> Fast turn-around at Pune APMC unload bays.'
    ],
    ranks: [
      { name: '🥇 Pune APMC', badge: '⭐ Best for you', price: '₹3,150/q', trend: '↑ 3.2%', trendCol: '#2D6A4F', dist: '48 km', demand: 'High', demandCol: '#D6A84F', net: '₹75,500 net', gold: true },
      { name: '🥈 Daund APMC', badge: '', price: '₹2,980/q', trend: '↑ 1.4%', trendCol: '#2D6A4F', dist: '65 km', demand: 'Medium', demandCol: '#3B82F6', net: '₹71,800 net', gold: false },
      { name: '🥉 Baramati APMC', badge: '', price: '₹2,890/q', trend: '→ 0.0%', trendCol: '#6B7280', dist: '90 km', demand: 'Moderate', demandCol: '#6B7280', net: '₹68,750 net', gold: false }
    ]
  },
  cotton: {
    cropName: 'Cotton',
    emoji: '☁️',
    qty: '1,000 kg',
    curPrice: '₹6,800',
    bestMandi: 'Jalgaon APMC',
    mandiDist: '78 km · Textile Ginning Cluster',
    bestPrice: '₹7,450',
    netVal: '₹7,220/q',
    expPrice: '₹7,600',
    trendBadge: '↑ +5.1%',
    trendClass: 'farmer-metric-badge--up',
    demandText: '🔥 Very High',
    demandClass: 'farmer-metric-badge--high',
    adviceIcon: '🟢',
    adviceTitle: 'Prime Selling Window (High Ginning Demand)',
    adviceDesc: 'Textile spinning mills operating at high capacity with low raw cotton inventories. Grade A long-staple cotton fetching solid premiums.',
    optTitle: '⭐ Best Option for Your Cotton (1,000 kg)',
    optMandi: 'Jalgaon APMC · 78 km away',
    optPrice: '₹7,450/q',
    optExp: '₹7,600/q',
    optDemand: '🔥 Very High',
    optTransport: '₹2,300 approx.',
    optNet: '₹72,200',
    reasons: [
      '<strong>Ginning Mill Direct:</strong> ₹650/q premium over local village aggregators.',
      '<strong>Quality Transparency:</strong> Digital micronaire and staple length testing on-site.',
      '<strong>Guaranteed MSP Protection:</strong> Market price is well above government MSP.',
      '<strong>Organized Weighment:</strong> Digital weighbridge integration with SMS slip.'
    ],
    ranks: [
      { name: '🥇 Jalgaon APMC', badge: '⭐ Best for you', price: '₹7,450/q', trend: '↑ 5.1%', trendCol: '#2D6A4F', dist: '78 km', demand: 'Very High', demandCol: '#D6A84F', net: '₹72,200 net', gold: true },
      { name: '🥈 Dhule APMC', badge: '', price: '₹7,210/q', trend: '↑ 2.8%', trendCol: '#2D6A4F', dist: '94 km', demand: 'High', demandCol: '#D6A84F', net: '₹69,800 net', gold: false },
      { name: '🥉 Aurangabad APMC', badge: '', price: '₹7,080/q', trend: '↑ 1.1%', trendCol: '#2D6A4F', dist: '125 km', demand: 'Medium', demandCol: '#3B82F6', net: '₹68,100 net', gold: false }
    ]
  },
  chilli: {
    cropName: 'Chilli',
    emoji: '🌶️',
    qty: '600 kg',
    curPrice: '₹14,500',
    bestMandi: 'Guntur APMC',
    mandiDist: 'Direct Buyer Hub',
    bestPrice: '₹16,200',
    netVal: '₹15,600/q',
    expPrice: '₹16,800',
    trendBadge: '↑ +6.2%',
    trendClass: 'farmer-metric-badge--up',
    demandText: '🔥 High',
    demandClass: 'farmer-metric-badge--high',
    adviceIcon: '🟢',
    adviceTitle: 'High Export & Spice Industry Demand',
    adviceDesc: 'Spice processing companies procuring deep red Teja and Byadgi varieties. Moisture under 12% fetches top bid.',
    optTitle: '⭐ Best Option for Your Chilli (600 kg)',
    optMandi: 'Solapur APMC · 52 km away',
    optPrice: '₹16,200/q',
    optExp: '₹16,800/q',
    optDemand: '🔥 High',
    optTransport: '₹1,200 approx.',
    optNet: '₹93,600',
    reasons: [
      '<strong>High Value Realization:</strong> ₹1,700/q above local farm-gate offers.',
      '<strong>Cold Vault Support:</strong> Safe storage available at Solapur Cold Hub.',
      '<strong>Direct Spice Exporters:</strong> Zero middleman commissions deducted.',
      '<strong>Rapid Settlement:</strong> Verified buyer escrow guarantee.'
    ],
    ranks: [
      { name: '🥇 Solapur APMC', badge: '⭐ Best for you', price: '₹16,200/q', trend: '↑ 6.2%', trendCol: '#2D6A4F', dist: '52 km', demand: 'High', demandCol: '#D6A84F', net: '₹93,600 net', gold: true },
      { name: '🥈 Pune APMC', badge: '', price: '₹15,400/q', trend: '↑ 3.0%', trendCol: '#2D6A4F', dist: '120 km', demand: 'Medium', demandCol: '#3B82F6', net: '₹89,200 net', gold: false },
      { name: '🥉 Kolhapur APMC', badge: '', price: '₹14,800/q', trend: '↑ 1.2%', trendCol: '#2D6A4F', dist: '160 km', demand: 'Medium', demandCol: '#6B7280', net: '₹85,400 net', gold: false }
    ]
  },
  maize: {
    cropName: 'Maize',
    emoji: '🌽',
    qty: '2,500 kg',
    curPrice: '₹2,100',
    bestMandi: 'Niphad APMC',
    mandiDist: '36 km · Poultry & Starch Procurement',
    bestPrice: '₹2,380',
    netVal: '₹2,270/q',
    expPrice: '₹2,440',
    trendBadge: '↑ +3.9%',
    trendClass: 'farmer-metric-badge--up',
    demandText: '🔥 High',
    demandClass: 'farmer-metric-badge--high',
    adviceIcon: '🟢',
    adviceTitle: 'Strong Feed Industry Procurement',
    adviceDesc: 'Poultry and starch manufacturing industries purchasing yellow feed maize in bulk. Favorable transport corridors available.',
    optTitle: '⭐ Best Option for Your Maize (2,500 kg)',
    optMandi: 'Niphad APMC · 36 km away',
    optPrice: '₹2,380/q',
    optExp: '₹2,440/q',
    optDemand: '🔥 High',
    optTransport: '₹2,750 approx.',
    optNet: '₹56,750',
    reasons: [
      '<strong>Starch Plant Direct:</strong> ₹280/q premium over local village baseline.',
      '<strong>Bulk Truck Availability:</strong> Return trips available at discounted freight.',
      '<strong>Low Deduction Rates:</strong> Fair FAQ specifications on foreign matter.',
      '<strong>Immediate Payment:</strong> Verified direct bank transfer.'
    ],
    ranks: [
      { name: '🥇 Niphad APMC', badge: '⭐ Best for you', price: '₹2,380/q', trend: '↑ 3.9%', trendCol: '#2D6A4F', dist: '36 km', demand: 'High', demandCol: '#D6A84F', net: '₹56,750 net', gold: true },
      { name: '🥈 Nashik APMC', badge: '', price: '₹2,290/q', trend: '↑ 2.0%', trendCol: '#2D6A4F', dist: '44 km', demand: 'Medium', demandCol: '#3B82F6', net: '₹54,500 net', gold: false },
      { name: '🥉 Yeola APMC', badge: '', price: '₹2,210/q', trend: '↑ 0.5%', trendCol: '#2D6A4F', dist: '72 km', demand: 'Moderate', demandCol: '#6B7280', net: '₹52,500 net', gold: false }
    ]
  },
  pulses: {
    cropName: 'Pulses (Tur / Chana)',
    emoji: '🥣',
    qty: '1,200 kg',
    curPrice: '₹6,900',
    bestMandi: 'Latur APMC',
    mandiDist: 'Pulse Capital of India',
    bestPrice: '₹7,650',
    netVal: '₹7,420/q',
    expPrice: '₹7,850',
    trendBadge: '↑ +5.5%',
    trendClass: 'farmer-metric-badge--up',
    demandText: '🔥 Very High',
    demandClass: 'farmer-metric-badge--high',
    adviceIcon: '🟢',
    adviceTitle: 'High Dal Mill Procurement & Buffer Stocking',
    adviceDesc: 'Dal millers actively replenishing stocks. Tur and Chana prices are trading significantly above minimum support price.',
    optTitle: '⭐ Best Option for Your Pulses (1,200 kg)',
    optMandi: 'Latur APMC · Dal Mill Cluster',
    optPrice: '₹7,650/q',
    optExp: '₹7,850/q',
    optDemand: '🔥 Very High',
    optTransport: '₹2,760 approx.',
    optNet: '₹89,040',
    reasons: [
      '<strong>Dal Mill Direct Purchase:</strong> ₹750/q higher than local intermediaries.',
      '<strong>Govt Buffer Procurement:</strong> NAFED procurement center benchmark support.',
      '<strong>Moisture Incentive:</strong> Premium paid for dry clean grain lots.',
      '<strong>Digital Weighbridge:</strong> 100% transparent weight and quality assessment.'
    ],
    ranks: [
      { name: '🥇 Latur APMC', badge: '⭐ Best for you', price: '₹7,650/q', trend: '↑ 5.5%', trendCol: '#2D6A4F', dist: '88 km', demand: 'Very High', demandCol: '#D6A84F', net: '₹89,040 net', gold: true },
      { name: '🥈 Solapur APMC', badge: '', price: '₹7,380/q', trend: '↑ 3.2%', trendCol: '#2D6A4F', dist: '96 km', demand: 'High', demandCol: '#D6A84F', net: '₹85,800 net', gold: false },
      { name: '🥉 Ahmednagar APMC', badge: '', price: '₹7,150/q', trend: '↑ 1.5%', trendCol: '#2D6A4F', dist: '112 km', demand: 'Medium', demandCol: '#3B82F6', net: '₹83,040 net', gold: false }
    ]
  }
};

function initDecisionEngine() {
  const pills = document.querySelectorAll('#decision-crop-pills .farmer-crop-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cropKey = pill.getAttribute('data-crop') || 'tomato';
      updateDecisionSummary(cropKey);
    });
  });

  // Initial populate with default crop
  updateDecisionSummary('tomato');
}

function updateDecisionSummary(cropKey = 'tomato') {
  const data = DECISION_CROP_DATA[cropKey] || DECISION_CROP_DATA.tomato;

  // 1. Metric Cards
  const curEl = document.getElementById('dec-cur-price');
  if (curEl) curEl.innerHTML = `${data.curPrice}<span style="font-size:14px;font-weight:600;color:#666;">/q</span>`;

  const mandiEl = document.getElementById('dec-best-mandi');
  if (mandiEl) mandiEl.textContent = data.bestMandi;

  const distEl = document.getElementById('dec-mandi-dist');
  if (distEl) distEl.textContent = data.mandiDist;

  const priceEl = document.getElementById('dec-best-price');
  if (priceEl) priceEl.innerHTML = `${data.bestPrice}<span style="font-size:14px;font-weight:600;color:#666;">/q</span>`;

  const netEl = document.getElementById('dec-net-val');
  if (netEl) netEl.innerHTML = `Est. Net: <strong>${data.netVal}</strong> after freight`;

  const expEl = document.getElementById('dec-exp-price');
  if (expEl) expEl.innerHTML = `${data.expPrice}<span style="font-size:14px;font-weight:600;color:#666;">/q</span>`;

  const trendEl = document.getElementById('dec-trend-badge');
  if (trendEl) {
    trendEl.textContent = data.trendBadge;
    trendEl.className = `farmer-metric-badge ${data.trendClass}`;
  }

  const demandEl = document.getElementById('dec-demand-badge');
  if (demandEl) {
    demandEl.textContent = `${data.demandText} Demand`;
  }

  // 2. Advice Banner
  const titleEl = document.getElementById('dec-advice-title');
  if (titleEl) titleEl.textContent = data.adviceTitle;

  const descEl = document.getElementById('dec-advice-desc');
  if (descEl) descEl.textContent = data.adviceDesc;

  // 3. ⭐ Best Option for You Card (Section 8)
  const optTitle = document.getElementById('best-opt-title');
  if (optTitle) optTitle.innerHTML = `<span>⭐</span> ${data.optTitle}`;

  const optMandi = document.getElementById('best-opt-mandi');
  if (optMandi) optMandi.textContent = data.optMandi;

  const optPrice = document.getElementById('best-opt-price');
  if (optPrice) optPrice.textContent = data.optPrice;

  const optExp = document.getElementById('best-opt-exp');
  if (optExp) optExp.textContent = data.optExp;

  const optDemand = document.getElementById('best-opt-demand');
  if (optDemand) optDemand.textContent = data.optDemand;

  const optTransport = document.getElementById('best-opt-transport');
  if (optTransport) optTransport.textContent = data.optTransport;

  const optNet = document.getElementById('best-opt-net');
  if (optNet) optNet.textContent = data.optNet;

  const reasonsList = document.getElementById('best-opt-reasons-list');
  if (reasonsList && data.reasons) {
    reasonsList.innerHTML = data.reasons.map(r => `<li>${r}</li>`).join('');
  }

  // 4. Ranked Markets 🥇 🥈 🥉 (Section 9)
  const ranksGrid = document.getElementById('market-ranks-grid');
  if (ranksGrid && data.ranks) {
    ranksGrid.innerHTML = data.ranks.map(r => `
      <div class="market-rank-card ${r.gold ? 'market-rank-card--gold' : ''}">
        ${r.badge ? `<span class="market-rank-card__badge">${r.badge}</span>` : ''}
        <div>
          <h5 class="market-rank-card__title">${r.name}</h5>
          <div class="market-rank-card__price-row">
            <span class="market-rank-card__price">${r.price}</span>
            <span style="font-size:12px; font-weight:700; color:${r.trendCol};">${r.trend}</span>
          </div>
          <div style="font-size:12px; color:#666; margin-bottom:8px;">📍 ${r.dist} away · Demand: <strong style="color:${r.demandCol};">${r.demand}</strong></div>
          <div class="market-rank-card__net-box">
            <span>You may receive:</span>
            <strong style="color:#2D6A4F; font-size:15px;">${r.net}</strong>
          </div>
        </div>
        <div style="display:flex; gap:6px; margin-top:8px;">
          <button class="btn btn--secondary btn--sm" style="flex:1;" onclick="location.href='mandi-compare.html'">View</button>
          <button class="btn btn--primary btn--sm" style="flex:1; background:var(--ks-evergreen); color:#FFF;" onclick="FarmerFlow.openCreateLotModal()">Sell Here</button>
        </div>
      </div>
    `).join('');
  }

  if (window.lucide) lucide.createIcons();
}


