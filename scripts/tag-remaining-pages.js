const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// 1. TAG buyers.html
const buyersPath = path.join(rootDir, 'buyers.html');
let buyers = fs.readFileSync(buyersPath, 'utf8');

buyers = buyers.replace(
  '<h1 class="dash-section__title" style="font-size: 28px;">🤝 Verified Corporate & Institutional Buyers</h1>',
  '<h1 class="dash-section__title" style="font-size: 28px;" data-i18n="farmer.verifiedBuyersTitle">🤝 Verified Corporate & Institutional Buyers</h1>'
);
buyers = buyers.replace(
  '<p class="dash-section__subtitle">Direct procurement partners offering verified credentials, fair pricing, and\n            24h bank transfers.</p>',
  '<p class="dash-section__subtitle" data-i18n="farmer.verifiedBuyersDesc">Direct procurement partners offering verified credentials, fair pricing, and 24h bank transfers.</p>'
);
buyers = buyers.replace(
  '<h3 style="font-size: 20px; font-weight: 700; color: var(--ks-evergreen); margin-bottom: 16px;">Active\n            Procurement Partners</h3>',
  '<h3 style="font-size: 20px; font-weight: 700; color: var(--ks-evergreen); margin-bottom: 16px;" data-i18n="farmer.activeProcurementPartners">Active Procurement Partners</h3>'
);
buyers = buyers.replace(
  '<h3 class="dash-panel__title">Incoming Bids & Direct Offers</h3>',
  '<h3 class="dash-panel__title" data-i18n="farmer.incomingOffersTitle">Incoming Bids & Direct Offers</h3>'
);
buyers = buyers.replace(
  '<p class="dash-panel__subtitle">Quotes received for your active crop listings</p>',
  '<p class="dash-panel__subtitle" data-i18n="farmer.receivedOffersTitle">Quotes received for your active crop listings</p>'
);

fs.writeFileSync(buyersPath, buyers, 'utf8');
console.log('Tagged buyers.html');

// 2. TAG orders.html
const ordersPath = path.join(rootDir, 'orders.html');
let orders = fs.readFileSync(ordersPath, 'utf8');

orders = orders.replace(
  '<strong>Orders & Fulfillment</strong>',
  '<strong data-i18n="orders.ordersAndFulfillment">Orders & Fulfillment</strong>'
);
orders = orders.replace(
  '<h1 class="dash-section__title" style="font-size: 26px;">📋 Confirmed Orders & Procurement Pipeline</h1>',
  '<h1 class="dash-section__title" style="font-size: 26px;" data-i18n="orders.ordersAndFulfillment">📋 Confirmed Orders & Procurement Pipeline</h1>'
);
orders = orders.replace(
  '<p class="dash-section__subtitle">Track fulfillment progress, mandi dispatches, delivery progress, and payment\n            settlements.</p>',
  '<p class="dash-section__subtitle" data-i18n="orders.ordersSubtitle">Track fulfillment progress, mandi dispatches, delivery progress, and payment settlements.</p>'
);

fs.writeFileSync(ordersPath, orders, 'utf8');
console.log('Tagged orders.html');

// Add languageChanged listener in js/orders.js
const ordersJsPath = path.join(rootDir, 'js', 'orders.js');
let ordersJs = fs.readFileSync(ordersJsPath, 'utf8');
if (!ordersJs.includes("window.addEventListener('languageChanged'")) {
  ordersJs += `\n\n// Re-render orders on language change\nif (typeof window !== 'undefined') {\n  window.addEventListener('languageChanged', () => {\n    if (typeof loadOrders === 'function') {\n      loadOrders();\n    }\n  });\n}\n`;
  fs.writeFileSync(ordersJsPath, ordersJs, 'utf8');
  console.log('Added languageChanged listener to js/orders.js');
}

// 3. TAG disputes.html
const disputesPath = path.join(rootDir, 'disputes.html');
let disputes = fs.readFileSync(disputesPath, 'utf8');

disputes = disputes.replace(
  '🛡️ Dispute & Grievance Redressal Center',
  '🛡️ <span data-i18n="disputes.centerTitle">Dispute & Grievance Redressal Center</span>'
);
disputes = disputes.replace(
  'Fair, transparent conflict resolution for trade orders. Protect your payments and resolve quality or delivery issues through certified FPO and Admin mediation.',
  '<span data-i18n="disputes.centerSubtitle">Fair, transparent conflict resolution for trade orders. Protect your payments and resolve quality or delivery issues through certified FPO and Admin mediation.</span>'
);
disputes = disputes.replace(
  '<i data-lucide="plus-circle" style="width: 16px; height: 16px;"></i> Raise a Dispute',
  '<i data-lucide="plus-circle" style="width: 16px; height: 16px;"></i> <span data-i18n="disputes.raiseDispute">Raise a Dispute</span>'
);
disputes = disputes.replace(
  'KrishiShetra Payment Protection Active',
  '<span data-i18n="disputes.paymentProtectionActive">KrishiShetra Payment Protection Active</span>'
);
disputes = disputes.replace(
  'When an order is disputed, transaction funds are automatically held in simulated protection. No funds are cleared until both parties agree or a mediation settlement is recorded.',
  '<span data-i18n="disputes.paymentProtectionDesc">When an order is disputed, transaction funds are automatically held in simulated protection. No funds are cleared until both parties agree or a mediation settlement is recorded.</span>'
);
disputes = disputes.replace(
  '<span>✓ 100% Neutral Protection</span>',
  '<span data-i18n="disputes.neutralProtection">✓ 100% Neutral Protection</span>'
);
disputes = disputes.replace(
  '<button class="filter-pill-btn active" data-filter="all" onclick="filterDisputes(\'all\')">All</button>',
  '<button class="filter-pill-btn active" data-filter="all" onclick="filterDisputes(\'all\')" data-i18n="disputes.filterAll">All</button>'
);
disputes = disputes.replace(
  '<button class="filter-pill-btn" data-filter="active" onclick="filterDisputes(\'active\')">Active</button>',
  '<button class="filter-pill-btn" data-filter="active" onclick="filterDisputes(\'active\')" data-i18n="disputes.filterActive">Active</button>'
);
disputes = disputes.replace(
  '<button class="filter-pill-btn" data-filter="review" onclick="filterDisputes(\'review\')">Review / Mediation</button>',
  '<button class="filter-pill-btn" data-filter="review" onclick="filterDisputes(\'review\')" data-i18n="disputes.filterReview">Review / Mediation</button>'
);
disputes = disputes.replace(
  '<button class="filter-pill-btn" data-filter="resolved" onclick="filterDisputes(\'resolved\')">Resolved</button>',
  '<button class="filter-pill-btn" data-filter="resolved" onclick="filterDisputes(\'resolved\')" data-i18n="disputes.filterResolved">Resolved</button>'
);

fs.writeFileSync(disputesPath, disputes, 'utf8');
console.log('Tagged disputes.html');

// Add languageChanged listener to js/disputes.js
const disputesJsPath = path.join(rootDir, 'js', 'disputes.js');
let disputesJs = fs.readFileSync(disputesJsPath, 'utf8');
if (!disputesJs.includes("window.addEventListener('languageChanged'")) {
  disputesJs += `\n\n// Re-render disputes on language change\nif (typeof window !== 'undefined') {\n  window.addEventListener('languageChanged', () => {\n    if (typeof renderDisputesList === 'function') {\n      renderDisputesList();\n    }\n    if (state && state.selectedDispute && typeof renderDisputeDetail === 'function') {\n      renderDisputeDetail(state.selectedDispute);\n    }\n  });\n}\n`;
  fs.writeFileSync(disputesJsPath, disputesJs, 'utf8');
  console.log('Added languageChanged listener to js/disputes.js');
}

// 4. TAG mandi-compare.html controls
const mandiPath = path.join(rootDir, 'mandi-compare.html');
let mandi = fs.readFileSync(mandiPath, 'utf8');

mandi = mandi.replace(
  '<label class="mpc-label" for="mpc-crop-select">\n              <i data-lucide="wheat"></i> Commodity\n            </label>',
  '<label class="mpc-label" for="mpc-crop-select"><i data-lucide="wheat"></i> <span data-i18n="mandiCompare.commodity">Commodity</span></label>'
);
mandi = mandi.replace(
  '<label class="mpc-label" for="mpc-qty-input">\n              <i data-lucide="scale"></i> Batch Quantity\n            </label>',
  '<label class="mpc-label" for="mpc-qty-input"><i data-lucide="scale"></i> <span data-i18n="mandiCompare.batchQuantity">Batch Quantity</span></label>'
);
mandi = mandi.replace(
  '<span class="mpc-qty-unit-label">Quintals</span>',
  '<span class="mpc-qty-unit-label" data-i18n="mandiCompare.quintals">Quintals</span>'
);
mandi = mandi.replace(
  '<label class="mpc-label" for="mpc-origin-select">\n              <i data-lucide="map-pin"></i> Origin Hub\n            </label>',
  '<label class="mpc-label" for="mpc-origin-select"><i data-lucide="map-pin"></i> <span data-i18n="mandiCompare.originHub">Origin Hub</span></label>'
);

fs.writeFileSync(mandiPath, mandi, 'utf8');
console.log('Tagged mandi-compare.html controls');
