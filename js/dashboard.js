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
  { id: 'rice', name: 'Rice', emoji: '🌾', price: 2850, unit: '₹/q', change: 5.2, dir: 'up', market: 'Pune APMC', demand: 'high', image: 'assets/images/crop-rice.jpg', variety: 'Basmati / Sona Masoori' },
  { id: 'wheat', name: 'Wheat', emoji: '🌾', price: 2650, unit: '₹/q', change: 6.2, dir: 'up', market: 'Nashik APMC', demand: 'medium', image: 'assets/images/crop-wheat.jpg', variety: 'Lokwan / Sharbati' },
  { id: 'maize', name: 'Maize', emoji: '🌽', price: 2300, unit: '₹/q', change: 2.1, dir: 'up', market: 'Nashik APMC', demand: 'medium', image: 'assets/images/crop-maize.jpg', variety: 'Yellow Corn' },
  { id: 'soybean', name: 'Soybean', emoji: '🫘', price: 4650, unit: '₹/q', change: 4.8, dir: 'up', market: 'Indore Mandi', demand: 'high', image: 'assets/images/crop-soybean.jpg', variety: 'JS 335 / JS 9560' },
  { id: 'pulses', name: 'Pulses', emoji: '🥜', price: 5200, unit: '₹/q', change: 1.5, dir: 'up', market: 'Nagpur APMC', demand: 'medium', image: 'assets/images/crop-pulses.jpg', variety: 'Tur Dal / Chana' },
  { id: 'onion', name: 'Onion', emoji: '🧅', price: 2850, unit: '₹/q', change: 3.8, dir: 'up', market: 'Nashik APMC', demand: 'high', image: 'assets/images/crop-onion.jpg', variety: 'Garwa / Red Onion' },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', price: 2400, unit: '₹/q', change: 1.4, dir: 'down', market: 'Pune APMC', demand: 'medium', image: 'assets/images/crop-tomato.jpg', variety: 'Hybrid Round / Roma' },
  { id: 'potato', name: 'Potato', emoji: '🥔', price: 1800, unit: '₹/q', change: 0.8, dir: 'up', market: 'Pune APMC', demand: 'low', image: 'assets/images/crop-potato.jpg', variety: 'Jyoti / Pukhraj' },
  { id: 'chilli', name: 'Chilli', emoji: '🌶️', price: 8500, unit: '₹/q', change: 7.2, dir: 'up', market: 'Guntur APMC', demand: 'high', image: 'assets/images/crop-chilli.jpg', variety: 'Teja / Byadgi' },
  { id: 'groundnut', name: 'Groundnut', emoji: '🥜', price: 5600, unit: '₹/q', change: 2.9, dir: 'up', market: 'Rajkot APMC', demand: 'medium', image: 'assets/images/crop-groundnut.jpg', variety: 'TG 37A / Bold' },
  { id: 'cotton', name: 'Cotton', emoji: '☁️', price: 6800, unit: '₹/q', change: 0.6, dir: 'down', market: 'Nagpur APMC', demand: 'medium', image: 'assets/images/crop-cotton.jpg', variety: 'Medium Staple' },
  { id: 'sugarcane', name: 'Sugarcane', emoji: '🎋', price: 350, unit: '₹/q', change: 1.2, dir: 'up', market: 'Kolhapur APMC', demand: 'medium', image: 'assets/images/crop-sugarcane.jpg', variety: 'Co 86032' },
  { id: 'mango', name: 'Mango', emoji: '🥭', price: 4500, unit: '₹/q', change: 3.5, dir: 'up', market: 'Ratnagiri', demand: 'high', image: 'assets/images/crop-mango.jpg', variety: 'Alphonso / Kesar' },
  { id: 'banana', name: 'Banana', emoji: '🍌', price: 2200, unit: '₹/q', change: 2.1, dir: 'down', market: 'Jalgaon APMC', demand: 'low', image: 'assets/images/crop-banana.jpg', variety: 'Grand Naine (G9)' },
  { id: 'grapes', name: 'Grapes', emoji: '🍇', price: 6200, unit: '₹/q', change: 4.1, dir: 'up', market: 'Nashik APMC', demand: 'high', image: 'assets/images/crop-grapes.jpg', variety: 'Thompson Seedless' }
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
  { id: 'b1', name: 'ABC Foods Ltd', verified: true, rating: '4.9 ★', crops: ['Rice', 'Wheat'], location: 'Pune / Mumbai', minQty: '10 quintals', paymentDays: 'Instant 24h Bank Transfer' },
  { id: 'b2', name: 'Reliance Fresh Procurement', verified: true, rating: '4.8 ★', crops: ['Rice', 'Onion', 'Tomato', 'Banana'], location: 'Pan-Maharashtra', minQty: '20 quintals', paymentDays: 'Direct APMC Escrow' },
  { id: 'b3', name: 'ITC Agri Business Division', verified: true, rating: '4.9 ★', crops: ['Wheat', 'Soybean', 'Chilli'], location: 'Indore / Nagpur', minQty: '15 quintals', paymentDays: 'Instant NEFT' },
  { id: 'b4', name: 'BigBasket Direct Sourcing', verified: true, rating: '4.7 ★', crops: ['Onion', 'Tomato', 'Potato', 'Grapes'], location: 'Pune Warehouse', minQty: '5 quintals', paymentDays: '48h Farm Gate' },
  { id: 'b5', name: 'XYZ Agro Exports', verified: true, rating: '4.8 ★', crops: ['Grapes', 'Mango', 'Chilli', 'Cotton'], location: 'Nashik / Mumbai', minQty: '25 quintals', paymentDays: 'Escrow Guarantee' },
  { id: 'b6', name: 'Green Valley Organic Mills', verified: true, rating: '4.6 ★', crops: ['Pulses', 'Rice', 'Soybean'], location: 'Nagpur APMC', minQty: '10 quintals', paymentDays: 'Direct UPI/Bank' }
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
        { id: 'n1', title: 'New Buyer Offer Received', desc: 'ABC Foods offered ₹2,950/q for 20q Rice.', time: '10 mins ago', unread: true },
        { id: 'n2', title: 'Price Spike Alert · Pune', desc: 'Rice APMC rate surged +5.2% today.', time: '2 hours ago', unread: true },
        { id: 'n3', title: 'Order Payment Processed', desc: '₹43,500 transferred to HDFC A/C **4821.', time: 'Yesterday', unread: false }
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
  toast.innerHTML = `<span>🌾</span> <span>${message}</span>`;
  container.appendChild(toast);

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
        <img src="${c.image}" alt="${c.name}" class="dash-crop-card__img" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
        <div class="dash-crop-card__fallback" style="display:none;">${c.emoji}</div>
        <span class="dash-crop-card__demand-badge dash-crop-card__demand-badge--${c.demand}">
          ${c.demand === 'high' ? '🔥 High Demand' : (c.demand === 'medium' ? '⚡ Medium' : 'Low Demand')}
        </span>
      </div>
      <div class="dash-crop-card__body">
        <div class="dash-crop-card__header">
          <div class="dash-crop-card__title-row">
            <span class="dash-crop-card__emoji">${c.emoji}</span>
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
    generateBtn.innerHTML = '<div class="dash-spinner" style="width:16px;height:16px;border-width:2px;margin:0;"></div> <span>Analyzing Market Data...</span>';
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
      generateBtn.innerHTML = '<i data-lucide="sparkles"></i> <span>✦ Generate AI Forecast</span>';
      if (window.lucide) lucide.createIcons();
    }
    showToast(`AI forecast updated for ${result.cropName} in ${mandi}`);
  }, 500);
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

  // New Signal & Range Elements
  const signalTrend = document.getElementById('signal-trend-val');
  const signalArrivals = document.getElementById('signal-arrivals-val');
  const signalDemand = document.getElementById('signal-demand-val');
  const rangeLower = document.getElementById('range-lower-val');
  const rangeExpected = document.getElementById('range-expected-val');
  const rangeUpper = document.getElementById('range-upper-val');

  if (headline) headline.textContent = `${res.cropName} — ${res.mandi} / ${res.days}-Day AI Price Forecast`;
  if (insight) {
    insight.innerHTML = `"${res.cropName} prices are projected to <em>${res.isUp ? 'rise by ' + res.changePct : 'soften by ' + res.changePct}</em> over the next ${res.days} days."`;
  }
  if (recBadge) {
    recBadge.textContent = res.isUp ? `RECOMMENDATION: HOLD INVENTORY 3-5 DAYS` : `RECOMMENDATION: SELL IMMEDIATELY`;
    recBadge.style.background = res.isUp ? 'var(--ks-amber)' : 'var(--ks-terracotta)';
    recBadge.style.color = res.isUp ? 'var(--ks-evergreen)' : '#FFFFFF';
  }
  if (curPrice) curPrice.textContent = `₹${res.currentPrice.toLocaleString('en-IN')}/q`;
  
  // Count-up animation for expected price
  if (expPrice) {
    const startPrice = res.currentPrice;
    const endPrice = res.expectedPrice;
    const duration = 600;
    const startTime = performance.now();

    function stepCount(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const val = Math.round(startPrice + (endPrice - startPrice) * progress);
      expPrice.textContent = `₹${val.toLocaleString('en-IN')}/q`;
      if (progress < 1) {
        requestAnimationFrame(stepCount);
      }
    }
    requestAnimationFrame(stepCount);
  }

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

  // Update Signals & Range
  if (signalTrend) signalTrend.textContent = `${res.isUp ? 'Bullish' : 'Bearish'} (${res.changePct})`;
  if (signalArrivals) signalArrivals.textContent = res.isUp ? 'Moderate (Down 8%)' : 'High Surge (+18%)';
  if (signalDemand) signalDemand.textContent = res.isUp ? 'High ↑' : 'Stable';

  const lowerBound = Math.round(res.expectedPrice * 0.98);
  const upperBound = Math.round(res.expectedPrice * 1.02);

  if (rangeLower) rangeLower.textContent = `₹${lowerBound.toLocaleString('en-IN')}/q`;
  if (rangeExpected) rangeExpected.textContent = `₹${res.expectedPrice.toLocaleString('en-IN')}/q`;
  if (rangeUpper) rangeUpper.textContent = `₹${upperBound.toLocaleString('en-IN')}/q`;

  // Animate ring
  const circle = document.getElementById('forecast-ring-circle');
  if (circle) {
    const total = 326.73;
    const offset = total - (total * (res.confidence / 100));
    circle.style.strokeDashoffset = offset;
  }

  if (window.lucide) lucide.createIcons();
}

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
        <button class="btn btn--primary btn--sm" onclick="closeModal('crop-modal-overlay'); openCreateLotModal('${crop.id}')">Sell to Buyer</button>
      </div>
    `).join('');
  }

  // Action Buttons
  const sellBtn = document.getElementById('crop-modal-sell-btn');
  if (sellBtn) {
    sellBtn.onclick = () => {
      closeModal('crop-modal-overlay');
      openCreateLotModal(crop.id);
    };
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
          <div style="font-size:11px; color:var(--ks-sage); margin-top:2px;">⚡ ${b.paymentDays}</div>
        </div>
        <button class="btn btn--primary btn--sm" onclick="closeModal('buyers-modal-overlay'); openCreateLotModal()">Sell Crop</button>
      </div>
    `).join('');
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

// 13. Profile Modal
function openProfileModal() {
  const profile = krishiStore.getProfile();
  document.getElementById('prof-name').value = profile.name;
  document.getElementById('prof-phone').value = profile.phone;
  document.getElementById('prof-land').value = profile.landSize;
  document.getElementById('prof-mandi').value = profile.preferredMandi;

  const closeBtn = document.getElementById('profile-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal('profile-modal-overlay');
  openModal('profile-modal-overlay');
}

function initProfileForm() {
  const form = document.getElementById('profile-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('prof-name').value;
      const phone = document.getElementById('prof-phone').value;
      const landSize = document.getElementById('prof-land').value;
      const preferredMandi = document.getElementById('prof-mandi').value;

      krishiStore.updateProfile({ name, phone, landSize, preferredMandi });
      
      const headerName = document.getElementById('header-user-name');
      const dropName = document.getElementById('dropdown-user-name');
      if (headerName) headerName.textContent = name.split(' ')[0];
      if (dropName) dropName.textContent = name;

      closeModal('profile-modal-overlay');
      showToast('Profile updated successfully.');
    });
  }
}

// 14. Help & Language Modals
function openHelpModal() {
  const closeBtn = document.getElementById('help-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal('help-modal-overlay');
  openModal('help-modal-overlay');
}

function openLanguageModal() {
  const closeBtn = document.getElementById('language-modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal('language-modal-overlay');
  openModal('language-modal-overlay');
}

function setLanguage(lang) {
  closeModal('language-modal-overlay');
  const map = { en: 'English', mr: 'मराठी', hi: 'हिन्दी', te: 'తెలుగు', ta: 'தமிழ்' };
  showToast(`Language changed to ${map[lang] || 'English'}`);
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

  function renderComparison() {
    const cropId = cropSelect ? cropSelect.value : 'rice';
    const crop = CROPS_DATA.find(c => c.id === cropId) || CROPS_DATA[0];

    const mandis = [
      { name: 'Mumbai APMC (Vashi)', price: crop.price + 70, change: '+6.1%', dir: 'up', demand: 'Very High', best: true },
      { name: 'Pune APMC', price: crop.price, change: '+5.2%', dir: 'up', demand: 'High', best: false },
      { name: 'Nashik APMC', price: crop.price - 90, change: '+3.8%', dir: 'up', demand: 'Medium', best: false },
      { name: 'Nagpur APMC', price: crop.price - 150, change: '-1.2%', dir: 'down', demand: 'Medium', best: false },
      { name: 'Solapur APMC', price: crop.price - 40, change: '+2.4%', dir: 'up', demand: 'High', best: false }
    ];

    if (tableBody) {
      tableBody.innerHTML = mandis.map(m => `
        <tr class="${m.best ? 'tr-best' : ''}">
          <td><strong>${m.name}</strong> ${m.best ? '⭐' : ''}</td>
          <td class="td-price">₹${m.price.toLocaleString('en-IN')}/q</td>
          <td class="td-change--${m.dir}">${m.change}</td>
          <td class="td-demand">${m.demand}</td>
          <td class="td-btn"><a href="javascript:void(0)" onclick="openCropDetails('${crop.id}')">View Mandi</a></td>
        </tr>
      `).join('');
    }

    if (cardsWrap) {
      cardsWrap.innerHTML = mandis.map(m => `
        <div class="dash-compare-mobile-card">
          <div class="dash-compare-mobile-card__name">${m.name} ${m.best ? '⭐ (Best Market)' : ''}</div>
          <div class="dash-compare-mobile-card__row"><span class="dash-compare-mobile-card__label">Price</span><span class="dash-compare-mobile-card__val">₹${m.price.toLocaleString('en-IN')}/q</span></div>
          <div class="dash-compare-mobile-card__row"><span class="dash-compare-mobile-card__label">Trend</span><span class="dash-compare-mobile-card__val dash-compare-mobile-card__val--${m.dir}">${m.change}</span></div>
          <div class="dash-compare-mobile-card__row"><span class="dash-compare-mobile-card__label">Demand</span><span class="dash-compare-mobile-card__val">${m.demand}</span></div>
        </div>
      `).join('');
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
// 10. INITIALIZATION
// ═════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
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

  // 4. Initialize Forms & Modals
  initModalCloseHandlers();
  initCreateLotForm();
  initEditLotForm();
  initPauseLotHandlers();
  initDeleteLotHandlers();
  initNegotiateForm();
  initAlertForm();
  initProfileForm();

  // 5. Header Profile Dropdown Toggle
  const profBtn = document.getElementById('btn-profile');
  const profWrap = document.getElementById('dash-profile-wrap');
  if (profBtn && profWrap) {
    profBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profWrap.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#dash-profile-wrap')) profWrap.classList.remove('open');
    });
  }

  // Header quick buttons
  const notifBtn = document.getElementById('btn-notifications');
  if (notifBtn) notifBtn.onclick = openNotificationsModal;

  const langBtn = document.getElementById('btn-language');
  if (langBtn) langBtn.onclick = openLanguageModal;

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
    menuLogout.addEventListener('click', () => {
      localStorage.removeItem('krishi_is_logged_in');
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

  // Initialize Lucide icons
  if (window.lucide) lucide.createIcons();
});
