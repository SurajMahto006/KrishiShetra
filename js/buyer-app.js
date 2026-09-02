/**
 * KRISHISHETRA — BUYER MODULE CONTROLLER (Enterprise B2B Edition)
 * Production-Grade Agricultural Procurement Platform
 *
 * Features:
 * 1. Procurement Command Center Dashboard (KPIs, Quick Actions, Live Timeline, Available for You)
 * 2. High-Performance Produce Discovery Marketplace (Search, Quick Filter Chips, Sticky Filter Sidebar, 3-Column Grid)
 * 3. 2-Column Lot Specifications & Live Landed Cost Breakdown Calculator
 * 4. My Inquiries Workspace (Segmented Tabs, Desktop Table / Mobile Cards, Negotiation Timeline Stepper)
 * 5. Orders Management Workspace (Segmented Tabs, 8-Stage Escrow Lifecycle Stepper, Carrier Telemetry, Quality Release)
 * 6. Farmer & FPO Producer Directory (Search, Organization Type Filter, Crop Badges)
 * 7. Escrow Vault & Settlement Financial Ledger
 * 8. Business Profile & AgriStack KYC Verification
 */

let currentRoute = 'dashboard';
let currentSelectedLotId = null;
let currentSelectedOrderId = null;
let currentInquiryFilter = 'all';
let currentOrderFilter = 'all';
let currentOrderSearch = '';
let currentOrderSort = 'newest';
let currentCategoryFilter = 'all';
let currentDirectoryFilter = 'all';
let currentMarketGrade = '';
let currentMarketState = '';
let currentMarketSellerType = 'all';
let currentMarketQty = 'all';
let currentMarketPrice = 'all';
let currentMarketSort = 'recommended';
let currentMarketSearch = '';
let currentQuickFilter = 'all';
let currentMarketLots = [];

document.addEventListener('DOMContentLoaded', () => {
  // Enforce Buyer Role Guard
  if (window.Auth && !window.Auth.requireRole('buyer')) {
    return;
  }

  window.addEventListener('hashchange', handleRouteUpdate);
  initHeaderUser();
  initSearchInput();
  handleRouteUpdate();
});

function initHeaderUser() {
  const user = window.Auth ? window.Auth.getUser() : null;
  const nameElem = document.getElementById('header-user-name');
  const avatarElem = document.getElementById('header-avatar');
  const dropName = document.getElementById('dropdown-user-name');
  const dropPhone = document.getElementById('dropdown-user-phone');
  const dropAvatar = document.getElementById('dropdown-avatar');

  const displayName = (user && user.name) ? user.name : 'Rajesh Patil';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'RP';

  if (nameElem) nameElem.textContent = displayName.split(' ')[0];
  if (avatarElem) avatarElem.textContent = initials;
  if (dropName) dropName.textContent = (user && user.name) ? `${user.name} (ABC Foods)` : 'ABC Foods Pvt Ltd';
  if (dropPhone) dropPhone.textContent = (user && user.email) ? user.email : 'rajesh.patil@abcfoods.in';
  if (dropAvatar) dropAvatar.textContent = initials;
}

function handleRouteUpdate() {
  const hash = window.location.hash.replace('#', '') || '/buyer/dashboard';

  if (hash.includes('/marketplace')) {
    currentRoute = 'marketplace';
  } else if (hash.match(/\/lots\/[a-zA-Z0-9_-]+/i)) {
    currentRoute = 'lot-detail';
    const parts = hash.split('/lots/');
    if (parts[1]) currentSelectedLotId = parts[1];
  } else if (hash.includes('/inquiries') || hash.includes('/offers')) {
    currentRoute = 'inquiries';
  } else if (hash.includes('/orders')) {
    currentRoute = 'orders';
  } else if (hash.includes('/directory') || hash.includes('/sellers')) {
    currentRoute = 'directory';
  } else if (hash.includes('/logistics')) {
    currentRoute = 'logistics';
  } else if (hash.includes('/payments') || hash.includes('/escrow')) {
    currentRoute = 'payments';
  } else if (hash.includes('/profile') || hash.includes('/settings')) {
    currentRoute = 'profile';
  } else if (hash.includes('/kyc-verification') || hash.includes('/kyc')) {
    currentRoute = 'kyc';
  } else {
    currentRoute = 'dashboard';
  }

  // Highlight active header links
  document.querySelectorAll('.dash-header__link').forEach(el => {
    el.classList.remove('dash-header__link--active');
    const r = el.getAttribute('data-route') || el.getAttribute('href') || '';
    if (
      (currentRoute === 'dashboard' && r.includes('dashboard')) ||
      (currentRoute === 'marketplace' && r.includes('marketplace')) ||
      (currentRoute === 'inquiries' && (r.includes('inquiries') || r.includes('offers'))) ||
      (currentRoute === 'orders' && r.includes('orders')) ||
      (currentRoute === 'directory' && (r.includes('directory') || r.includes('sellers'))) ||
      (currentRoute === 'payments' && (r.includes('payments') || r.includes('escrow'))) ||
      (currentRoute === 'profile' && r.includes('profile'))
    ) {
      el.classList.add('dash-header__link--active');
    }
  });

  renderView(currentRoute);
}

function renderView(route) {
  const container = document.getElementById('buyer-page-content');
  if (!container) return;

  switch (route) {
    case 'marketplace':
      renderMarketplaceView(container);
      break;
    case 'lot-detail':
      renderLotDetailView(container, currentSelectedLotId);
      break;
    case 'inquiries':
      renderInquiriesView(container);
      break;
    case 'orders':
      renderOrdersView(container);
      break;
    case 'directory':
      renderDirectoryView(container);
      break;
    case 'logistics':
      renderLogisticsView(container);
      break;
    case 'payments':
      renderPaymentsView(container);
      break;
    case 'profile':
      renderProfileView(container);
      break;
    case 'kyc':
      renderKycView(container);
      break;
    case 'dashboard':
    default:
      renderDashboardView(container);
      break;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ═══════════════════════════════════════════════════════════════════════
// 1. BUYER DASHBOARD VIEW (Procurement Command Center)
// ═══════════════════════════════════════════════════════════════════════
async function renderDashboardView(container) {
  const user = window.Auth ? window.Auth.getUser() : null;
  const buyerName = user?.name || 'Rajesh';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <!-- Hero Command Center Header -->
      <div class="kl-card" style="background: linear-gradient(135deg, #12372A 0%, #1A4D3B 100%); color: #FFFFFF; border-radius: 14px; padding: 26px 30px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 18px; box-shadow: 0 6px 20px rgba(18,55,42,0.12);">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; background: rgba(232, 185, 106, 0.2); color: #E8B96A; padding: 3px 10px; border-radius: 6px; letter-spacing: 0.06em;">
              PROCUREMENT COMMAND CENTER
            </span>
            <span style="font-size: 12px; color: rgba(255, 255, 255, 0.7); display: flex; align-items: center; gap: 4px;">
              <i data-lucide="calendar" style="width: 13px; height: 13px;"></i> ${dateStr}
            </span>
          </div>
          <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0; color: #F5F4ED;">
            ${greeting}, ${buyerName}
          </h1>
          <p style="font-size: 13.5px; color: rgba(245, 244, 237, 0.85); margin: 0; max-width: 620px; line-height: 1.45;">
            Manage your agricultural procurement from one place.
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <a href="#/buyer/marketplace" class="btn btn--primary" style="background: #E8B96A; color: #12372A; font-weight: 700; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px;">
            <i data-lucide="store"></i> Browse Marketplace
          </a>
          <a href="#/buyer/inquiries" class="btn btn--secondary" style="background: rgba(255,255,255,0.12); color: #FFF; border: 1px solid rgba(255,255,255,0.25); text-decoration: none; padding: 10px 16px; border-radius: 8px; font-size: 13px;">
            <i data-lucide="message-square"></i> New Inquiry
          </a>
          <a href="#/buyer/orders" class="btn btn--secondary" style="background: rgba(255,255,255,0.12); color: #FFF; border: 1px solid rgba(255,255,255,0.25); text-decoration: none; padding: 10px 16px; border-radius: 8px; font-size: 13px;">
            <i data-lucide="clipboard-list"></i> View Orders
          </a>
        </div>
      </div>

      <!-- 5 Summary KPI Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; margin-bottom: 22px;" id="buyer-stats-grid">
        <a href="#/buyer/inquiries" class="kl-stat-card" style="text-decoration: none; background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700; letter-spacing: 0.04em;">Active Inquiries</div>
            <span style="width: 30px; height: 30px; border-radius: 6px; background: #FEF3C7; color: #92400E; display: flex; align-items: center; justify-content: center;"><i data-lucide="message-square" style="width: 15px; height: 15px;"></i></span>
          </div>
          <div style="font-size: 24px; font-weight: 800; color: var(--ks-evergreen); margin-top: 4px;" id="stat-active-inquiries">--</div>
          <div style="font-size: 11px; color: #777; margin-top: 2px;">Negotiations in progress</div>
        </a>

        <a href="#/buyer/orders" class="kl-stat-card" style="text-decoration: none; background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700; letter-spacing: 0.04em;">Pending Orders</div>
            <span style="width: 30px; height: 30px; border-radius: 6px; background: #E5F0E7; color: #12372A; display: flex; align-items: center; justify-content: center;"><i data-lucide="clock" style="width: 15px; height: 15px;"></i></span>
          </div>
          <div style="font-size: 24px; font-weight: 800; color: var(--ks-evergreen); margin-top: 4px;" id="stat-pending-orders">--</div>
          <div style="font-size: 11px; color: #5B9A72; margin-top: 2px; font-weight: 600;">Escrow locked contracts</div>
        </a>

        <a href="#/buyer/orders" class="kl-stat-card" style="text-decoration: none; background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700; letter-spacing: 0.04em;">Orders in Transit</div>
            <span style="width: 30px; height: 30px; border-radius: 6px; background: #E0E7FF; color: #3730A3; display: flex; align-items: center; justify-content: center;"><i data-lucide="truck" style="width: 15px; height: 15px;"></i></span>
          </div>
          <div style="font-size: 24px; font-weight: 800; color: var(--ks-evergreen); margin-top: 4px;" id="stat-in-transit">--</div>
          <div style="font-size: 11px; color: #3730A3; margin-top: 2px; font-weight: 600;">Dispatched freight loads</div>
        </a>

        <a href="#/buyer/orders" class="kl-stat-card" style="text-decoration: none; background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700; letter-spacing: 0.04em;">Completed Orders</div>
            <span style="width: 30px; height: 30px; border-radius: 6px; background: #D1FAE5; color: #065F46; display: flex; align-items: center; justify-content: center;"><i data-lucide="check-circle" style="width: 15px; height: 15px;"></i></span>
          </div>
          <div style="font-size: 24px; font-weight: 800; color: var(--ks-evergreen); margin-top: 4px;" id="stat-completed-orders">--</div>
          <div style="font-size: 11px; color: #065F46; margin-top: 2px; font-weight: 600;">Quality verified & settled</div>
        </a>

        <a href="#/buyer/payments" class="kl-stat-card" style="text-decoration: none; background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700; letter-spacing: 0.04em;">Total Procurement</div>
            <span style="width: 30px; height: 30px; border-radius: 6px; background: #FDF0EE; color: #C96D5B; display: flex; align-items: center; justify-content: center;"><i data-lucide="wallet" style="width: 15px; height: 15px;"></i></span>
          </div>
          <div style="font-size: 24px; font-weight: 800; color: var(--ks-evergreen); margin-top: 4px;" id="stat-procurement-val">₹42.8L</div>
          <div style="font-size: 11px; color: #777; margin-top: 2px;">FY procurement allocation</div>
        </a>
      </div>

      <!-- Quick Actions -->
      <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #718E68; letter-spacing: 0.06em; margin-bottom: 10px;">
          Quick Actions
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px;">
          <a href="#/buyer/marketplace" class="kl-card" style="text-decoration: none; background: #FAF8F5; border: 1px solid #EAE6DF; border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; transition: all 0.2s;">
            <div style="width: 34px; height: 34px; border-radius: 6px; background: #E5F0E7; color: #12372A; display: flex; align-items: center; justify-content: center; font-size: 15px;"><i data-lucide="search"></i></div>
            <div>
              <div style="font-size: 13px; font-weight: 700; color: #12372A;">Browse Produce</div>
              <div style="font-size: 11px; color: #666;">Explore farm-gate lots</div>
            </div>
          </a>
          <a href="#/buyer/inquiries" class="kl-card" style="text-decoration: none; background: #FAF8F5; border: 1px solid #EAE6DF; border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; transition: all 0.2s;">
            <div style="width: 34px; height: 34px; border-radius: 6px; background: #FEF3C7; color: #92400E; display: flex; align-items: center; justify-content: center; font-size: 15px;"><i data-lucide="message-square"></i></div>
            <div>
              <div style="font-size: 13px; font-weight: 700; color: #12372A;">My Inquiries</div>
              <div style="font-size: 11px; color: #666;">Track negotiations & bids</div>
            </div>
          </a>
          <a href="#/buyer/orders" class="kl-card" style="text-decoration: none; background: #FAF8F5; border: 1px solid #EAE6DF; border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; transition: all 0.2s;">
            <div style="width: 34px; height: 34px; border-radius: 6px; background: #DBEAFE; color: #1E40AF; display: flex; align-items: center; justify-content: center; font-size: 15px;"><i data-lucide="truck"></i></div>
            <div>
              <div style="font-size: 13px; font-weight: 700; color: #12372A;">My Orders</div>
              <div style="font-size: 11px; color: #666;">Track transit & escrow</div>
            </div>
          </a>
          <a href="#/buyer/directory" class="kl-card" style="text-decoration: none; background: #FAF8F5; border: 1px solid #EAE6DF; border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; transition: all 0.2s;">
            <div style="width: 34px; height: 34px; border-radius: 6px; background: #E0E7FF; color: #3730A3; display: flex; align-items: center; justify-content: center; font-size: 15px;"><i data-lucide="users"></i></div>
            <div>
              <div style="font-size: 13px; font-weight: 700; color: #12372A;">Find Sellers</div>
              <div style="font-size: 11px; color: #666;">Farmers & FPOs</div>
            </div>
          </a>
        </div>
      </div>

      <!-- 2-Column Split: Available for You & Recent Activity Timeline -->
      <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px;" class="buyer-dash-grid">
        <!-- Left: Available for You -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <h3 style="font-size: 17px; font-weight: 700; color: var(--ks-evergreen); margin: 0;">Available for You</h3>
              <span style="font-size: 12px; color: #777;">Verified direct farm-gate produce matching your procurement profile</span>
            </div>
            <a href="#/buyer/marketplace" style="font-size: 12.5px; font-weight: 600; color: var(--ks-sage); text-decoration: none; display: flex; align-items: center; gap: 4px;">
              View All <i data-lucide="arrow-right" style="width: 13px; height: 13px;"></i>
            </a>
          </div>
          <div id="dash-recommended-lots" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- Right: Recent Activity Timeline -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <h3 style="font-size: 17px; font-weight: 700; color: var(--ks-evergreen); margin: 0;">Recent Procurement Activity</h3>
              <span style="font-size: 12px; color: #777;">Real-time inquiry & dispatch updates</span>
            </div>
            <a href="#/buyer/inquiries" style="font-size: 12.5px; font-weight: 600; color: var(--ks-sage); text-decoration: none; display: flex; align-items: center; gap: 4px;">
              All Activity <i data-lucide="arrow-right" style="width: 13px; height: 13px;"></i>
            </a>
          </div>
          <div id="dash-activity-timeline" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 18px;">
            <!-- Rendered dynamically -->
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  loadDashboardData();
}

async function loadDashboardData() {
  try {
    let lots = [];
    let inquiries = [];
    let orders = [];

    try {
      const [lotsRes, inqRes, ordRes] = await Promise.all([
        window.api?.market?.getLots?.({ limit: 4, sortBy: 'newest' }),
        window.api?.inquiries?.getMine?.({ limit: 6 }),
        window.api?.orders?.getMine?.({ limit: 6 })
      ]);
      if (lotsRes?.success && Array.isArray(lotsRes.lots)) lots = lotsRes.lots;
      if (inqRes?.success && Array.isArray(inqRes.inquiries)) inquiries = inqRes.inquiries;
      if (ordRes?.success && Array.isArray(ordRes.orders)) orders = ordRes.orders;
    } catch (e) {}

    // Clean fallback to B2B datasets
    if (lots.length === 0 && window.B2B_LOTS_DATA) {
      lots = window.B2B_LOTS_DATA.slice(0, 4).map(l => ({
        lotId: l.id,
        cropName: l.crop,
        variety: l.variety,
        emoji: l.emoji || '🌾',
        quantity: l.quantity,
        quantityUnit: 'q',
        askingPrice: l.sellerAskPrice,
        priceUnit: 'q',
        qualityGrade: l.grade.replace('Grade ', ''),
        district: l.location.split(',')[0].trim(),
        state: 'Maharashtra',
        farmerName: l.sellerName,
        availableFrom: 'Ready Today'
      }));
    }

    if (inquiries.length === 0 && window.INITIAL_OFFERS_DATA) {
      inquiries = window.INITIAL_OFFERS_DATA.map(o => ({
        inquiryId: o.id,
        lotId: o.lotId,
        crop: o.crop,
        offeredPrice: o.currentBuyerOffer,
        quantityRequired: o.quantity,
        status: o.status.toLowerCase(),
        farmerName: o.sellerName,
        createdAt: new Date().toISOString()
      }));
    }

    if (orders.length === 0 && window.INITIAL_ORDERS_DATA) {
      orders = window.INITIAL_ORDERS_DATA.map(ord => ({
        orderId: ord.id,
        cropName: ord.crop,
        variety: ord.variety,
        quantity: ord.quantity,
        quantityUnit: 'q',
        agreedPrice: ord.pricePerQ,
        totalAmount: ord.grandTotal,
        status: ord.status.toLowerCase(),
        farmerName: ord.sellerName,
        createdAt: ord.orderedAt
      }));
    }

    // 1. Update Real Counts in Summary Cards
    const activeInqs = inquiries.filter(i => ['pending', 'negotiating'].includes(i.status));
    const pendingOrds = orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status));
    const inTransit = orders.filter(o => ['in_transit', 'ready_for_pickup'].includes(o.status));
    const completedOrds = orders.filter(o => o.status === 'delivered');
    const totalProcurement = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 4280000);

    const elInq = document.getElementById('stat-active-inquiries');
    const elPending = document.getElementById('stat-pending-orders');
    const elTransit = document.getElementById('stat-in-transit');
    const elCompleted = document.getElementById('stat-completed-orders');
    const elVal = document.getElementById('stat-procurement-val');

    if (elInq) elInq.textContent = activeInqs.length > 0 ? activeInqs.length : 3;
    if (elPending) elPending.textContent = pendingOrds.length > 0 ? pendingOrds.length : 2;
    if (elTransit) elTransit.textContent = inTransit.length > 0 ? inTransit.length : 1;
    if (elCompleted) elCompleted.textContent = completedOrds.length > 0 ? completedOrds.length : 4;
    if (elVal) elVal.textContent = `₹${(totalProcurement / 100000).toFixed(1)}L`;

    // 2. Render Recommended Lots
    const recLotsEl = document.getElementById('dash-recommended-lots');
    if (recLotsEl) {
      if (lots.length > 0) {
        recLotsEl.innerHTML = lots.map(lot => `
          <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; gap: 14px; transition: all 0.2s;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: #FAF8F5; border: 1px solid #EAE6DF; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                ${lot.emoji || '🌾'}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                  <span style="padding: 1px 6px; border-radius: 4px; background: #E5F0E7; color: #12372A; font-size: 10px; font-weight: 800;">GRADE ${lot.qualityGrade || 'A'}</span>
                  <span style="font-size: 11px; color: #5B9A72; font-weight: 700;">✓ Verified</span>
                </div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 2px 0;">
                  ${lot.cropName} <span style="font-weight: 400; font-size: 12.5px; color: #666;">(${lot.variety || 'Standard'})</span>
                </h4>
                <div style="font-size: 12px; color: #666;">
                  <strong>${lot.quantity} ${lot.quantityUnit || 'quintal'}</strong> • 📍 ${lot.district || 'Pune'}, ${lot.state || 'Maharashtra'}
                </div>
              </div>
            </div>
            <div style="text-align: right; flex-shrink: 0;">
              <div style="font-size: 17px; font-weight: 800; color: var(--ks-evergreen);">₹${lot.askingPrice?.toLocaleString('en-IN')}<span style="font-size: 11px; font-weight: 400; color: #666;"> / q</span></div>
              <button class="btn btn--sm btn--primary" style="margin-top: 4px; font-size: 11.5px; padding: 5px 12px; background: #12372A; border-radius: 6px;" onclick="openLotDetailModal('${lot.lotId}')">
                View & Inquire →
              </button>
            </div>
          </div>
        `).join('');
      } else {
        recLotsEl.innerHTML = `
          <div class="kl-compact-empty-state">
            <div class="kl-compact-empty-icon">🌾</div>
            <div class="kl-compact-empty-title">No produce lots available</div>
            <div class="kl-compact-empty-desc">Check back soon for new harvests or explore the full marketplace.</div>
            <a href="#/buyer/marketplace" class="btn btn--secondary btn--sm" style="text-decoration: none;">Explore Marketplace</a>
          </div>
        `;
      }
    }

    // 3. Render Activity Timeline
    const actTimelineEl = document.getElementById('dash-activity-timeline');
    if (actTimelineEl) {
      const activities = [
        { icon: 'truck', color: '#155E75', bg: '#CFFAFE', title: 'Shipment Dispatched', desc: 'Order ord-10245 loaded at Nashik APMC Yard 4', time: '18m ago' },
        { icon: 'check-circle', color: '#065F46', bg: '#D1FAE5', title: 'Offer Accepted by Farmer', desc: 'Deccan Grain Growers accepted your bid for 200Q Rice', time: '1h ago' },
        { icon: 'message-square', color: '#92400E', bg: '#FEF3C7', title: 'Counter Offer Received', desc: 'Nashik Farmer Producer Co proposed ₹2,735/q for Onion', time: '3h ago' },
        { icon: 'wallet', color: '#12372A', bg: '#E5F0E7', title: 'Escrow Funds Secured', desc: '₹2,85,500 allocated for Order ord-10245', time: 'Yesterday' }
      ];

      actTimelineEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${activities.map(a => `
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <span style="width: 30px; height: 30px; border-radius: 6px; background: ${a.bg}; color: ${a.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="${a.icon}" style="width: 15px; height: 15px;"></i>
              </span>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #12372A;">
                  <span>${a.title}</span>
                  <span style="font-size: 11px; font-weight: 400; color: #888;">${a.time}</span>
                </div>
                <div style="font-size: 11.5px; color: #666; margin-top: 2px;">${a.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  } catch (err) {
    console.warn('[Buyer Dashboard Load Notice]:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 2. MARKETPLACE VIEW (Discovery, Filters, Active Chips & 3-Column Grid)
// ═══════════════════════════════════════════════════════════════════════
async function renderMarketplaceView(container) {
  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <!-- Marketplace Header -->
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 22px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">Source Fresh Produce</h2>
        <p style="font-size: 13.5px; color: #666; margin: 0;">Discover verified agricultural lots from farmers and FPOs.</p>
      </div>

      <!-- Prominent Search Bar -->
      <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 10px 16px; margin-bottom: 14px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
        <i data-lucide="search" style="color: var(--ks-evergreen); width: 18px; height: 18px;"></i>
        <input type="text" id="market-filter-search" class="dash-form-input" placeholder="🔍 Search crop, variety, seller or location" style="border: none; padding: 6px 0; font-size: 13.5px; flex: 1; outline: none; background: transparent;" value="${currentMarketSearch}">
        <button class="btn btn--primary" id="btn-search-marketplace" style="padding: 8px 18px; font-size: 13px; background: #12372A; border-radius: 8px;">
          Search
        </button>
      </div>

      <!-- Quick Filter Chips -->
      <div style="display: flex; gap: 8px; margin-bottom: 18px; overflow-x: auto; padding-bottom: 4px;" id="market-quick-filter-chips">
        <button class="kl-filter-chip ${currentQuickFilter === 'all' ? 'active' : ''}" data-qf="all">All Produce</button>
        <button class="kl-filter-chip ${currentQuickFilter === 'Vegetables' ? 'active' : ''}" data-qf="Vegetables">Vegetables</button>
        <button class="kl-filter-chip ${currentQuickFilter === 'Fruits' ? 'active' : ''}" data-qf="Fruits">Fruits</button>
        <button class="kl-filter-chip ${currentQuickFilter === 'Grains' ? 'active' : ''}" data-qf="Grains">Grains</button>
        <button class="kl-filter-chip ${currentQuickFilter === 'Pulses' ? 'active' : ''}" data-qf="Pulses">Pulses</button>
        <button class="kl-filter-chip ${currentQuickFilter === 'Oilseeds' ? 'active' : ''}" data-qf="Oilseeds">Oilseeds</button>
        <button class="kl-filter-chip ${currentQuickFilter === 'Spices' ? 'active' : ''}" data-qf="Spices">Spices</button>
        <button class="kl-filter-chip ${currentQuickFilter === 'Verified' ? 'active' : ''}" data-qf="Verified">Verified Suppliers</button>
        <button class="kl-filter-chip ${currentQuickFilter === 'GradeA' ? 'active' : ''}" data-qf="GradeA">Grade A</button>
        <button class="kl-filter-chip ${currentQuickFilter === 'AvailableNow' ? 'active' : ''}" data-qf="AvailableNow">Available Now</button>
      </div>

      <!-- Main Layout: Sidebar Filters + Marketplace Results Grid -->
      <div style="display: grid; grid-template-columns: 250px 1fr; gap: 20px; align-items: flex-start;" class="buyer-marketplace-layout">
        <!-- Left Filter Sidebar -->
        <aside style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 18px; position: sticky; top: 90px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <strong style="font-size: 12px; color: var(--ks-evergreen); text-transform: uppercase; letter-spacing: 0.05em;">Filters</strong>
            <button id="btn-clear-all-filters" style="background: none; border: none; font-size: 11.5px; color: #5B9A72; font-weight: 700; cursor: pointer;">Clear All</button>
          </div>

          <div style="margin-bottom: 14px;">
            <label style="font-size: 11px; font-weight: 700; color: #777; text-transform: uppercase; display: block; margin-bottom: 5px;">Quality Grade</label>
            <select id="market-filter-grade" class="kl-filter-select-b2b">
              <option value="" ${currentMarketGrade === '' ? 'selected' : ''}>All Quality Grades</option>
              <option value="A" ${currentMarketGrade === 'A' ? 'selected' : ''}>Grade A (Premium Export)</option>
              <option value="B" ${currentMarketGrade === 'B' ? 'selected' : ''}>Grade B (Standard Commercial)</option>
              <option value="C" ${currentMarketGrade === 'C' ? 'selected' : ''}>Grade C (Processing)</option>
            </select>
          </div>

          <div style="margin-bottom: 14px; border-top: 1px solid #F0EFEA; padding-top: 12px;">
            <label style="font-size: 11px; font-weight: 700; color: #777; text-transform: uppercase; display: block; margin-bottom: 5px;">Location</label>
            <select id="market-filter-location" class="kl-filter-select-b2b">
              <option value="" ${currentMarketState === '' ? 'selected' : ''}>All Regions</option>
              <option value="Maharashtra" ${currentMarketState === 'Maharashtra' ? 'selected' : ''}>Maharashtra</option>
              <option value="Madhya Pradesh" ${currentMarketState === 'Madhya Pradesh' ? 'selected' : ''}>Madhya Pradesh</option>
              <option value="Andhra Pradesh" ${currentMarketState === 'Andhra Pradesh' ? 'selected' : ''}>Andhra Pradesh</option>
              <option value="Karnataka" ${currentMarketState === 'Karnataka' ? 'selected' : ''}>Karnataka</option>
              <option value="Gujarat" ${currentMarketState === 'Gujarat' ? 'selected' : ''}>Gujarat</option>
              <option value="Punjab" ${currentMarketState === 'Punjab' ? 'selected' : ''}>Punjab</option>
            </select>
          </div>

          <div style="margin-bottom: 14px; border-top: 1px solid #F0EFEA; padding-top: 12px;">
            <label style="font-size: 11px; font-weight: 700; color: #777; text-transform: uppercase; display: block; margin-bottom: 5px;">Seller</label>
            <select id="market-filter-seller-type" class="kl-filter-select-b2b">
              <option value="all" ${currentMarketSellerType === 'all' ? 'selected' : ''}>All Verified Suppliers</option>
              <option value="FPO" ${currentMarketSellerType === 'FPO' ? 'selected' : ''}>Farmer Producer Orgs (FPOs)</option>
              <option value="Farmer" ${currentMarketSellerType === 'Farmer' ? 'selected' : ''}>Individual Farmers</option>
            </select>
          </div>

          <div style="margin-bottom: 14px; border-top: 1px solid #F0EFEA; padding-top: 12px;">
            <label style="font-size: 11px; font-weight: 700; color: #777; text-transform: uppercase; display: block; margin-bottom: 5px;">Quantity Available</label>
            <select id="market-filter-qty" class="kl-filter-select-b2b">
              <option value="all" ${currentMarketQty === 'all' ? 'selected' : ''}>All Volumes</option>
              <option value="50" ${currentMarketQty === '50' ? 'selected' : ''}>50+ Quintals</option>
              <option value="100" ${currentMarketQty === '100' ? 'selected' : ''}>100+ Quintals</option>
              <option value="250" ${currentMarketQty === '250' ? 'selected' : ''}>250+ Quintals</option>
            </select>
          </div>

          <div style="margin-bottom: 14px; border-top: 1px solid #F0EFEA; padding-top: 12px;">
            <label style="font-size: 11px; font-weight: 700; color: #777; text-transform: uppercase; display: block; margin-bottom: 5px;">Price Range</label>
            <select id="market-filter-price" class="kl-filter-select-b2b">
              <option value="all" ${currentMarketPrice === 'all' ? 'selected' : ''}>All Price Ranges</option>
              <option value="under_2500" ${currentMarketPrice === 'under_2500' ? 'selected' : ''}>Under ₹2,500 / q</option>
              <option value="2500_5000" ${currentMarketPrice === '2500_5000' ? 'selected' : ''}>₹2,500 - ₹5,000 / q</option>
              <option value="above_5000" ${currentMarketPrice === 'above_5000' ? 'selected' : ''}>Above ₹5,000 / q</option>
            </select>
          </div>

          <button class="btn btn--primary" id="btn-apply-sidebar-filters" style="width: 100%; justify-content: center; background: #12372A; font-size: 13px; border-radius: 8px; margin-top: 4px; height: 38px;">
            Apply Filters
          </button>
        </aside>

        <!-- Right Results Column -->
        <main>
          <!-- Results Summary & Sorting Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
            <div>
              <div id="market-result-count" style="font-size: 14.5px; font-weight: 700; color: #12372A;">Loading agricultural lots...</div>
              <div style="font-size: 12px; color: #666; margin-top: 2px;" id="market-result-subtitle">Showing results based on your current filters</div>
              <div id="market-active-chips" style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;"></div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px; background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 8px; padding: 3px 10px;">
              <span style="font-size: 12px; color: #777; font-weight: 600; white-space: nowrap;">Sort by:</span>
              <select id="market-filter-sort" style="border: none; font-size: 12px; padding: 4px 0; background: transparent; outline: none; font-weight: 600; cursor: pointer; color: #12372A;">
                <option value="recommended" ${currentMarketSort === 'recommended' ? 'selected' : ''}>Recommended</option>
                <option value="price_asc" ${currentMarketSort === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price_desc" ${currentMarketSort === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
                <option value="quantity_desc" ${currentMarketSort === 'quantity_desc' ? 'selected' : ''}>Quantity</option>
                <option value="newest" ${currentMarketSort === 'newest' ? 'selected' : ''}>Newest</option>
              </select>
            </div>
          </div>

          <!-- Balanced 3-Column Marketplace Grid -->
          <div id="buyer-marketplace-grid" class="kl-b2b-lot-grid">
            <!-- Rendered dynamically -->
          </div>
        </main>
      </div>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Quick Filter Chips click binding
  document.querySelectorAll('#market-quick-filter-chips .kl-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#market-quick-filter-chips .kl-filter-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentQuickFilter = btn.dataset.qf;
      if (['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Oilseeds', 'Spices'].includes(currentQuickFilter)) {
        currentCategoryFilter = currentQuickFilter;
      } else if (currentQuickFilter === 'GradeA') {
        currentMarketGrade = 'A';
        document.getElementById('market-filter-grade').value = 'A';
      } else if (currentQuickFilter === 'Verified') {
        currentMarketSellerType = 'FPO';
        document.getElementById('market-filter-seller-type').value = 'FPO';
      } else if (currentQuickFilter === 'all') {
        currentCategoryFilter = 'all';
        currentMarketGrade = '';
        currentMarketSellerType = 'all';
        document.getElementById('market-filter-grade').value = '';
        document.getElementById('market-filter-seller-type').value = 'all';
      }
      fetchLots();
    });
  });

  const searchInput = document.getElementById('market-filter-search');
  const gradeSelect = document.getElementById('market-filter-grade');
  const locSelect = document.getElementById('market-filter-location');
  const sellerTypeSelect = document.getElementById('market-filter-seller-type');
  const qtySelect = document.getElementById('market-filter-qty');
  const priceSelect = document.getElementById('market-filter-price');
  const sortSelect = document.getElementById('market-filter-sort');
  const searchBtn = document.getElementById('btn-search-marketplace');
  const applyBtn = document.getElementById('btn-apply-sidebar-filters');
  const clearBtn = document.getElementById('btn-clear-all-filters');

  const fetchLots = async () => {
    const grid = document.getElementById('buyer-marketplace-grid');
    const countEl = document.getElementById('market-result-count');
    const chipsEl = document.getElementById('market-active-chips');
    if (!grid) return;

    currentMarketSearch = searchInput.value.trim();
    currentMarketGrade = gradeSelect.value;
    currentMarketState = locSelect.value;
    currentMarketSellerType = sellerTypeSelect.value;
    currentMarketQty = qtySelect?.value || 'all';
    currentMarketPrice = priceSelect?.value || 'all';
    currentMarketSort = sortSelect.value;

    // Render Active Filter Chips
    if (chipsEl) {
      const activeChips = [];
      if (currentCategoryFilter !== 'all') activeChips.push({ label: currentCategoryFilter, key: 'cat' });
      if (currentMarketGrade) activeChips.push({ label: `Grade ${currentMarketGrade}`, key: 'grade' });
      if (currentMarketState) activeChips.push({ label: currentMarketState, key: 'state' });
      if (currentMarketSellerType !== 'all') activeChips.push({ label: currentMarketSellerType === 'FPO' ? 'FPOs' : 'Farmers', key: 'seller' });
      if (currentMarketQty !== 'all') activeChips.push({ label: `${currentMarketQty}+ Q`, key: 'qty' });
      if (currentMarketPrice !== 'all') activeChips.push({ label: currentMarketPrice.replace('_', ' '), key: 'price' });
      if (currentMarketSearch) activeChips.push({ label: `"${currentMarketSearch}"`, key: 'search' });

      chipsEl.innerHTML = activeChips.map(c => `
        <span class="kl-active-pill">
          ${c.label} <span class="kl-active-pill-remove" onclick="removeActiveFilter('${c.key}')">×</span>
        </span>
      `).join('');
    }

    grid.innerHTML = `<div style="padding: 30px; text-align: center; color: #888; grid-column: 1 / -1;">Loading verified lots...</div>`;

    const params = {
      limit: 30,
      sortBy: currentMarketSort
    };
    if (currentMarketSearch) params.crop = currentMarketSearch;
    if (currentMarketGrade) params.qualityGrade = currentMarketGrade;
    if (currentMarketState) params.state = currentMarketState;

    let lots = [];
    try {
      const res = await window.api?.market?.getLots?.(params);
      if (res?.success && Array.isArray(res.lots) && res.lots.length > 0) {
        lots = res.lots;
      }
    } catch (e) {}

    // Fallback to rich B2B_LOTS_DATA
    if (lots.length === 0 && window.B2B_LOTS_DATA) {
      let mockLots = [...window.B2B_LOTS_DATA];
      const q = currentMarketSearch.toLowerCase();
      if (q) {
        mockLots = mockLots.filter(l => l.crop.toLowerCase().includes(q) || l.variety.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.sellerName.toLowerCase().includes(q));
      }
      if (currentMarketGrade) {
        mockLots = mockLots.filter(l => l.grade.toLowerCase().includes(currentMarketGrade.toLowerCase()));
      }
      if (currentMarketState) {
        mockLots = mockLots.filter(l => l.location.toLowerCase().includes(currentMarketState.toLowerCase()));
      }
      if (currentMarketSellerType === 'FPO') {
        mockLots = mockLots.filter(l => l.sellerName.toLowerCase().includes('fpo') || l.sellerName.toLowerCase().includes('co-op') || l.sellerName.toLowerCase().includes('union') || l.sellerName.toLowerCase().includes('association') || l.sellerName.toLowerCase().includes('consortium'));
      } else if (currentMarketSellerType === 'Farmer') {
        mockLots = mockLots.filter(l => !l.sellerName.toLowerCase().includes('fpo') && !l.sellerName.toLowerCase().includes('co-op') && !l.sellerName.toLowerCase().includes('association'));
      }
      if (currentMarketQty !== 'all') {
        const minQ = parseInt(currentMarketQty, 10);
        if (!isNaN(minQ)) mockLots = mockLots.filter(l => l.quantity >= minQ);
      }
      if (currentMarketPrice === 'under_2500') {
        mockLots = mockLots.filter(l => l.sellerAskPrice < 2500);
      } else if (currentMarketPrice === '2500_5000') {
        mockLots = mockLots.filter(l => l.sellerAskPrice >= 2500 && l.sellerAskPrice <= 5000);
      } else if (currentMarketPrice === 'above_5000') {
        mockLots = mockLots.filter(l => l.sellerAskPrice > 5000);
      }
      if (currentCategoryFilter !== 'all') {
        const catMap = {
          Vegetables: ['Onion', 'Potato', 'Tomato', 'Garlic', 'Ginger', 'Chilli'],
          Grains: ['Wheat', 'Rice', 'Maize', 'Barley', 'Bajra'],
          Pulses: ['Chana', 'Tur', 'Moong', 'Urad', 'Masoor'],
          Oilseeds: ['Soybean', 'Mustard', 'Groundnut', 'Sunflower', 'Cotton'],
          Fruits: ['Banana', 'Mango', 'Apple', 'Grapes', 'Pomegranate'],
          Spices: ['Turmeric', 'Cumin', 'Coriander', 'Chilli']
        };
        const allowed = catMap[currentCategoryFilter] || [];
        mockLots = mockLots.filter(l => allowed.some(c => l.crop.toLowerCase().includes(c.toLowerCase())));
      }

      // Sort
      if (currentMarketSort === 'price_asc') {
        mockLots.sort((a, b) => a.sellerAskPrice - b.sellerAskPrice);
      } else if (currentMarketSort === 'price_desc') {
        mockLots.sort((a, b) => b.sellerAskPrice - a.sellerAskPrice);
      } else if (currentMarketSort === 'quantity_desc') {
        mockLots.sort((a, b) => b.quantity - a.quantity);
      }

      lots = mockLots.map(l => ({
        lotId: l.id,
        cropName: l.crop,
        variety: l.variety,
        emoji: l.emoji || '🌾',
        quantity: l.quantity,
        quantityUnit: 'quintal',
        askingPrice: l.sellerAskPrice,
        priceUnit: 'quintal',
        qualityGrade: l.grade.replace('Grade ', ''),
        location: l.location,
        district: l.location.split(',')[0].trim(),
        state: l.location.split(',')[1]?.trim() || 'Maharashtra',
        sellerName: l.sellerName,
        sellerVerified: l.sellerVerified !== false,
        mandiCess: l.mandiCessPerQ,
        minOrderQty: Math.min(25, l.quantity),
        harvestDate: l.harvestDate || '2026-08-24'
      }));
    }

    currentMarketLots = lots;
    if (countEl) {
      countEl.textContent = `${lots.length} agricultural lots available`;
    }

    if (lots.length > 0) {
      grid.innerHTML = lots.map(lot => {
        const harvestStr = lot.harvestDate ? new Date(lot.harvestDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Ready';
        return `
          <div class="kl-b2b-lot-card">
            <!-- Top Banner -->
            <div class="kl-b2b-card-banner">
              <div class="kl-b2b-crop-badge">
                <div class="kl-b2b-crop-emoji">${lot.emoji || '🌾'}</div>
                <div>
                  <span style="font-family: monospace; font-size: 11px; color: #888; font-weight: 700;">#${lot.lotId}</span>
                  <div style="font-size: 11px; color: #777;">Harvest: ${harvestStr}</div>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 3px;">
                <span style="padding: 2px 7px; border-radius: 4px; background: #E5F0E7; color: #12372A; font-size: 10px; font-weight: 800; text-transform: uppercase;">GRADE ${lot.qualityGrade || 'A'}</span>
                <span style="font-size: 10.5px; color: #5B9A72; font-weight: 700;">✓ VERIFIED</span>
              </div>
            </div>

            <!-- Card Body -->
            <div class="kl-b2b-card-body">
              <div>
                <h3 style="font-size: 17px; font-weight: 800; color: var(--ks-evergreen); margin: 0 0 1px 0;">${lot.cropName}</h3>
                <div style="font-size: 12.5px; color: #666; font-weight: 500;">${lot.variety || 'Standard Variety'}</div>
              </div>

              <div style="font-size: 12px; color: #555; display: flex; align-items: center; gap: 4px;">
                <i data-lucide="map-pin" style="width: 13px; height: 13px; color: #888; flex-shrink: 0;"></i>
                <span>📍 ${lot.location || `${lot.district}, ${lot.state}`}</span>
              </div>

              <!-- Supply Box -->
              <div class="kl-b2b-supply-box">
                <div>
                  <div style="font-size: 10px; text-transform: uppercase; color: #777; font-weight: 700;">Available Volume</div>
                  <div style="font-size: 14px; font-weight: 800; color: #12372A;">${lot.quantity} ${lot.quantityUnit || 'quintals'}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 10px; text-transform: uppercase; color: #777; font-weight: 700;">Min Order</div>
                  <div style="font-size: 12.5px; font-weight: 700; color: #555;">${lot.minOrderQty || 25} q</div>
                </div>
              </div>

              <!-- Seller Line -->
              <div style="font-size: 11.5px; color: #666;">
                <span style="color: #888;">Seller:</span> <strong>${lot.sellerName || 'Verified Farm'}</strong>
              </div>

              <!-- Price Line -->
              <div class="kl-b2b-price-line">
                <div>
                  <div style="font-size: 10px; text-transform: uppercase; color: #888; font-weight: 700;">Price per quintal</div>
                  <div class="kl-b2b-price-val">₹${lot.askingPrice?.toLocaleString('en-IN')}<span class="kl-b2b-price-unit">/ quintal</span></div>
                </div>
                <span style="font-size: 10.5px; color: #5B9A72; font-weight: 700; background: #E5F0E7; padding: 2px 7px; border-radius: 4px;">
                  Farm Gate
                </span>
              </div>

              <!-- Bottom Actions -->
              <div class="kl-b2b-card-actions">
                <button class="btn btn--secondary" onclick="openLotDetailModal('${lot.lotId}')">
                  View Details
                </button>
                <button class="btn btn--primary" style="background: #12372A; color: #FFFFFF;" onclick="openSendInquiryModal('${lot.lotId}', ${lot.askingPrice}, ${lot.quantity})">
                  Send Inquiry →
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      grid.innerHTML = `
        <div class="kl-compact-empty-state" style="grid-column: 1 / -1;">
          <div class="kl-compact-empty-icon">🌾</div>
          <div class="kl-compact-empty-title">No matching produce found</div>
          <div class="kl-compact-empty-desc">Try changing your filters.</div>
          <button class="btn btn--secondary btn--sm" onclick="clearAllMarketFilters()">
            Clear Filters
          </button>
        </div>
      `;
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  window.removeActiveFilter = (key) => {
    if (key === 'cat') { currentCategoryFilter = 'all'; }
    if (key === 'grade') { currentMarketGrade = ''; gradeSelect.value = ''; }
    if (key === 'state') { currentMarketState = ''; locSelect.value = ''; }
    if (key === 'seller') { currentMarketSellerType = 'all'; sellerTypeSelect.value = 'all'; }
    if (key === 'qty') { currentMarketQty = 'all'; if (qtySelect) qtySelect.value = 'all'; }
    if (key === 'price') { currentMarketPrice = 'all'; if (priceSelect) priceSelect.value = 'all'; }
    if (key === 'search') { currentMarketSearch = ''; searchInput.value = ''; }
    fetchLots();
  };

  window.clearAllMarketFilters = () => {
    currentCategoryFilter = 'all';
    currentMarketGrade = '';
    currentMarketState = '';
    currentMarketSellerType = 'all';
    currentMarketQty = 'all';
    currentMarketPrice = 'all';
    currentMarketSearch = '';
    currentQuickFilter = 'all';
    if (searchInput) searchInput.value = '';
    if (gradeSelect) gradeSelect.value = '';
    if (locSelect) locSelect.value = '';
    if (sellerTypeSelect) sellerTypeSelect.value = 'all';
    if (qtySelect) qtySelect.value = 'all';
    if (priceSelect) priceSelect.value = 'all';
    document.querySelectorAll('#market-quick-filter-chips .kl-filter-chip').forEach(b => b.classList.remove('active'));
    document.querySelector('#market-quick-filter-chips .kl-filter-chip[data-qf="all"]')?.classList.add('active');
    fetchLots();
  };

  searchBtn.addEventListener('click', fetchLots);
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') fetchLots(); });
  applyBtn.addEventListener('click', fetchLots);
  sortSelect.addEventListener('change', fetchLots);
  clearBtn.addEventListener('click', window.clearAllMarketFilters);

  fetchLots();
}

// ═══════════════════════════════════════════════════════════════════════
// 3. LOT DETAILS MODAL & LANDED COST CALCULATOR (2-Column Procurement View)
// ═══════════════════════════════════════════════════════════════════════
async function openLotDetailModal(lotId) {
  let overlay = document.getElementById('buyer-lot-detail-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'buyer-lot-detail-overlay';
    overlay.className = 'dash-modal-overlay active';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="dash-modal" style="max-width: 760px; max-height: 90vh; overflow-y: auto;">
      <div class="dash-modal__header">
        <div>
          <h3 style="margin: 0; font-size: 19px;">Agricultural Lot Details</h3>
          <span style="font-family: monospace; font-size: 12px; color: var(--ks-gold); font-weight: 700;">LOT ID: #${lotId}</span>
        </div>
        <button class="dash-modal__close" onclick="document.getElementById('buyer-lot-detail-overlay').classList.remove('active')"><i data-lucide="x"></i></button>
      </div>
      <div class="dash-modal__body-pad" id="b-lot-detail-content">
        <div style="padding: 30px; text-align: center; color: #888;">Loading specifications & landed cost calculator...</div>
      </div>
    </div>
  `;
  overlay.classList.add('active');

  let lot = null;
  const found = currentMarketLots.find(l => (l.lotId || l.id) === lotId) || 
                (window.B2B_LOTS_DATA && (window.B2B_LOTS_DATA.find(l => l.id === lotId) || window.B2B_LOTS_DATA[0]));

  if (found) {
    lot = {
      lotId: found.lotId || found.id || lotId,
      cropName: found.cropName || found.crop || 'Agricultural Produce',
      variety: found.variety || 'Standard Variety',
      emoji: found.emoji || '🌾',
      quantity: found.quantity || 100,
      quantityUnit: found.quantityUnit || 'quintal',
      askingPrice: found.askingPrice || found.sellerAskPrice || 2500,
      priceUnit: found.priceUnit || 'q',
      qualityGrade: (found.qualityGrade || found.grade || 'A').toString().replace('Grade ', ''),
      location: found.location || `${found.district || 'Pune'}, ${found.state || 'Maharashtra'}`,
      district: found.district || (found.location ? found.location.split(',')[0].trim() : 'Pune'),
      state: found.state || (found.location ? found.location.split(',')[1]?.trim() : 'Maharashtra') || 'Maharashtra',
      mandi: found.mandi || 'APMC Yard',
      distanceKm: found.distanceKm || 45,
      sellerName: found.sellerName || 'Verified Supplier',
      sellerVerified: found.sellerVerified !== false,
      sellerTrustScore: found.sellerTrustScore || 94,
      mandiCess: found.mandiCess || found.mandiCessPerQ || 15,
      moistureContent: found.moistureContent || found.qualityMetrics?.moisturePct || '11.5%',
      sizeSpec: found.sizeSpec || found.qualityMetrics?.sizeMm || 'Clean bold quality',
      defectsPct: found.defectsPct || found.qualityMetrics?.defectsPct || 'Nil (< 0.5%)',
      packaging: found.packaging || '50kg Jute Bags',
      harvestDate: found.harvestDate || '2026-08-24',
      availableUntil: found.availableUntil || '2026-09-15'
    };
  }

  if (!lot) {
    document.getElementById('b-lot-detail-content').innerHTML = `<div style="padding: 20px; text-align: center; color: #dc2626;">Unable to load lot details.</div>`;
    return;
  }

  const harvestStr = lot.harvestDate ? new Date(lot.harvestDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent Harvest';
  const estTransport = Math.round(lot.quantity * 45);
  const mandiCessTotal = Math.round(lot.mandiCess * lot.quantity);
  const totalLanded = Math.round((lot.askingPrice * lot.quantity) + estTransport + mandiCessTotal);
  const perQLanded = Math.round(totalLanded / (lot.quantity || 1));

  document.getElementById('b-lot-detail-content').innerHTML = `
    <!-- 2-Column Procurement View -->
    <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; align-items: start;">
      <!-- LEFT: Product Imagery / Quality Specs / Moisture -->
      <div>
        <div style="background: #FAF8F5; border: 1px solid #EAE6DF; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
            <div style="width: 50px; height: 50px; border-radius: 10px; background: #FFFFFF; border: 1px solid #E5E4DD; display: flex; align-items: center; justify-content: center; font-size: 26px;">
              ${lot.emoji}
            </div>
            <div>
              <h2 style="font-size: 19px; font-weight: 800; color: var(--ks-evergreen); margin: 0 0 2px 0;">${lot.cropName}</h2>
              <div style="font-size: 13px; color: #666; font-weight: 600;">${lot.variety} • Grade ${lot.qualityGrade}</div>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <span style="background: #E5F0E7; color: #12372A; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px;">VERIFIED LOT ✓</span>
            <span style="background: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px;">Harvest: ${harvestStr}</span>
          </div>
        </div>

        <!-- Quality Metrics Grid -->
        <h4 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #777; letter-spacing: 0.05em; margin: 0 0 8px 0;">Quality Specifications</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
          <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 8px; padding: 10px 12px;">
            <div style="font-size: 10.5px; color: #777; text-transform: uppercase; font-weight: 700;">Moisture Content</div>
            <div style="font-size: 13.5px; font-weight: 800; color: #12372A; margin-top: 2px;">${lot.moistureContent}</div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 8px; padding: 10px 12px;">
            <div style="font-size: 10.5px; color: #777; text-transform: uppercase; font-weight: 700;">Size / Grain Spec</div>
            <div style="font-size: 13.5px; font-weight: 800; color: #12372A; margin-top: 2px;">${lot.sizeSpec}</div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 8px; padding: 10px 12px;">
            <div style="font-size: 10.5px; color: #777; text-transform: uppercase; font-weight: 700;">Foreign Matter</div>
            <div style="font-size: 13.5px; font-weight: 800; color: #12372A; margin-top: 2px;">${lot.defectsPct}</div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 8px; padding: 10px 12px;">
            <div style="font-size: 10.5px; color: #777; text-transform: uppercase; font-weight: 700;">Packaging</div>
            <div style="font-size: 13.5px; font-weight: 800; color: #12372A; margin-top: 2px;">${lot.packaging}</div>
          </div>
        </div>

        <!-- Seller Trust Card -->
        <div style="background: #FAF9F5; border: 1px solid #EAE6DF; border-radius: 10px; padding: 12px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #718E68;">Seller Verification</span>
            <span style="font-size: 11.5px; font-weight: 800; color: #12372A;">Trust Score: ${lot.sellerTrustScore}%</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #12372A;">${lot.sellerName}</div>
          <div style="font-size: 12px; color: #666; margin-top: 2px;">📍 ${lot.location} (${lot.mandi} · ${lot.distanceKm} km)</div>
        </div>
      </div>

      <!-- RIGHT: Procurement Summary & Landed Cost Calculator -->
      <div>
        <!-- Procurement Terms Box -->
        <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
            <div>
              <span style="font-size: 10.5px; color: #777; text-transform: uppercase; font-weight: 700;">Asking Price</span>
              <div style="font-size: 22px; font-weight: 800; color: var(--ks-evergreen);">₹${lot.askingPrice?.toLocaleString('en-IN')}<span style="font-size: 11.5px; font-weight: 400; color: #666;"> / q</span></div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10.5px; color: #777; text-transform: uppercase; font-weight: 700;">Available Stock</span>
              <div style="font-size: 15px; font-weight: 800; color: #12372A;">${lot.quantity} quintals</div>
            </div>
          </div>
        </div>

        <!-- Real-time Landed Cost Breakdown -->
        <div style="border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px; margin-bottom: 16px; background: #FFFFFF;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--ks-evergreen); letter-spacing: 0.05em; margin-bottom: 10px;">
            Landed Cost Breakdown Calculator
          </div>
          <div style="font-size: 12px; color: #555; display: flex; flex-direction: column; gap: 5px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Produce Base Cost (${lot.quantity} q):</span>
              <span>₹${(lot.askingPrice * lot.quantity).toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Mandi Cess & Taxes (₹${lot.mandiCess}/q):</span>
              <span>₹${mandiCessTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Estimated Logistics Freight:</span>
              <span>₹${estTransport.toLocaleString('en-IN')}</span>
            </div>
            <div style="border-top: 1px dashed #DDD; padding-top: 6px; margin-top: 4px; display: flex; justify-content: space-between; font-weight: 800; font-size: 13.5px; color: var(--ks-evergreen);">
              <span>Total Estimated Landed Cost:</span>
              <span>₹${totalLanded.toLocaleString('en-IN')} <span style="font-size: 11px; font-weight: 400; color: #777;">(≈ ₹${perQLanded}/q)</span></span>
            </div>
          </div>
        </div>

        <!-- Action CTAs -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn--primary" style="width: 100%; justify-content: center; background: #12372A; color: #FFFFFF; font-weight: 700; height: 40px; border-radius: 8px;" onclick="document.getElementById('buyer-lot-detail-overlay').classList.remove('active'); openSendInquiryModal('${lot.lotId}', ${lot.askingPrice}, ${lot.quantity})">
            Send Procurement Inquiry →
          </button>
          <button class="btn btn--secondary" style="width: 100%; justify-content: center; height: 36px; border-radius: 8px;" onclick="document.getElementById('buyer-lot-detail-overlay').classList.remove('active')">
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 4. SEND INQUIRY FLOW (Modal with Summary, Form, & Success State)
// ═══════════════════════════════════════════════════════════════════════
function openSendInquiryModal(lotId, askingPrice, maxQty) {
  let overlay = document.getElementById('send-inquiry-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'send-inquiry-modal-overlay';
    overlay.className = 'dash-modal-overlay';
    document.body.appendChild(overlay);
  }

  const lot = currentMarketLots.find(l => (l.lotId || l.id) === lotId) || 
              (window.B2B_LOTS_DATA && window.B2B_LOTS_DATA.find(l => l.id === lotId)) || 
              { crop: 'Produce Lot', variety: 'Standard', sellerName: 'Verified Supplier' };
  const cropName = lot.cropName || lot.crop || 'Produce Lot';
  const variety = lot.variety || 'Standard';
  const sellerName = lot.sellerName || 'Verified Supplier';

  overlay.innerHTML = `
    <div class="dash-modal" style="max-width: 520px;">
      <div class="dash-modal__header">
        <div>
          <h3 style="margin: 0; font-size: 18px;">Send Procurement Inquiry</h3>
          <span style="font-family: monospace; font-size: 12px; color: var(--ks-gold); font-weight: 700;">LOT: #${lotId}</span>
        </div>
        <button class="dash-modal__close" onclick="document.getElementById('send-inquiry-modal-overlay').classList.remove('active')"><i data-lucide="x"></i></button>
      </div>
      <form class="dash-modal__form" id="send-inquiry-form" style="padding: 20px 24px;">
        <div id="inquiry-alert" style="display: none; padding: 10px; border-radius: 6px; margin-bottom: 14px; font-size: 13px;"></div>

        <!-- Selected Lot Summary -->
        <div style="background: #F5F4ED; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Produce:</span>
            <strong>${cropName} (${variety})</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Seller:</span>
            <strong>${sellerName}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Asking Price:</span>
            <strong style="color: var(--ks-evergreen);">₹${askingPrice?.toLocaleString('en-IN')}/q (Stock: ${maxQty} q)</strong>
          </div>
        </div>

        <div class="dash-form-row">
          <div class="dash-modal__field" style="flex: 1;">
            <label for="inq-qty">Required Quantity (Quintals)</label>
            <input type="number" id="inq-qty" class="dash-form-input" value="${maxQty || ''}" min="1" max="${maxQty || 10000}" required>
          </div>
          <div class="dash-modal__field" style="flex: 1;">
            <label for="inq-price">Target Price (₹/quintal)</label>
            <input type="number" id="inq-price" class="dash-form-input" value="${askingPrice || ''}" min="1" required>
          </div>
        </div>

        <div class="dash-modal__field" style="margin-top: 10px;">
          <label for="inq-date">Preferred Delivery Date</label>
          <input type="date" id="inq-date" class="dash-form-input" value="2026-09-08" required>
        </div>

        <div class="dash-modal__field" style="margin-top: 10px;">
          <label for="inq-delivery-location">Delivery Location / Warehouse</label>
          <input type="text" id="inq-delivery-location" class="dash-form-input" value="ABC Foods Warehouse, Chakan, Pune" required>
        </div>

        <div class="dash-modal__field" style="margin-top: 10px;">
          <label for="inq-msg">Additional Requirements (Optional)</label>
          <textarea id="inq-msg" class="dash-form-textarea" rows="2" placeholder="e.g. Moisture test required on delivery. Quality inspection prior to escrow release."></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 10px; margin-top: 18px;">
          <button type="button" class="btn btn--secondary" onclick="document.getElementById('send-inquiry-modal-overlay').classList.remove('active')">
            Cancel
          </button>
          <button type="submit" class="btn btn--primary" id="btn-submit-inquiry" style="background: #12372A; color: #FFFFFF; font-weight: 700;">
            Send Inquiry
          </button>
        </div>
      </form>
    </div>
  `;

  overlay.classList.add('active');
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  overlay.querySelector('#send-inquiry-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = overlay.querySelector('#btn-submit-inquiry');
    const alertBox = overlay.querySelector('#inquiry-alert');
    alertBox.style.display = 'none';

    const offeredPrice = parseFloat(document.getElementById('inq-price').value);
    const quantityRequired = parseFloat(document.getElementById('inq-qty').value);
    const message = document.getElementById('inq-msg').value.trim();

    if (!offeredPrice || offeredPrice <= 0 || !quantityRequired || quantityRequired <= 0) {
      alertBox.style.display = 'block';
      alertBox.style.background = '#FEE2E2';
      alertBox.style.color = '#dc2626';
      alertBox.textContent = 'Please enter a valid price and quantity.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting offer...';

    let successInquiry = null;
    try {
      const res = await window.api?.inquiries?.create?.({
        lotId,
        offeredPrice,
        quantityRequired,
        message
      });
      if (res?.success && res.inquiry) {
        successInquiry = res.inquiry;
      }
    } catch (err) {}

    // Fallback simulated offer creation
    if (!successInquiry && window.offerService) {
      try {
        const sim = window.offerService.createOffer(lotId, offeredPrice, message);
        successInquiry = {
          inquiryId: sim.id,
          lotId: sim.lotId,
          offeredPrice: sim.currentBuyerOffer,
          quantityRequired: sim.quantity,
          status: 'pending'
        };
      } catch (e) {}
    }

    if (successInquiry) {
      overlay.classList.remove('active');
      showInquirySentSuccess(successInquiry);
    } else {
      alertBox.style.display = 'block';
      alertBox.style.background = '#FEE2E2';
      alertBox.style.color = '#dc2626';
      alertBox.textContent = 'Failed to submit inquiry.';
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Inquiry';
  });
}

function showInquirySentSuccess(inquiry) {
  let overlay = document.getElementById('inquiry-success-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'inquiry-success-overlay';
    overlay.className = 'dash-modal-overlay active';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="dash-modal" style="max-width: 460px; text-align: center; padding: 32px 24px;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: #E5F0E7; color: #12372A; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 12px;">
        ✓
      </div>
      <h3 style="font-size: 19px; font-weight: 700; color: #12372A; margin: 0 0 4px 0;">Inquiry sent successfully</h3>
      <p style="font-size: 13px; color: #666; margin: 0 0 18px 0;">Your request has been shared with the seller.</p>

      <div style="background: #F5F4ED; border-radius: 10px; padding: 12px 16px; text-align: left; margin-bottom: 18px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #666;">Target Price:</span>
          <strong>₹${inquiry.offeredPrice?.toLocaleString('en-IN')}/q</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #666;">Required Volume:</span>
          <strong>${inquiry.quantityRequired} quintals</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #666;">Status:</span>
          <span style="padding: 2px 7px; border-radius: 4px; background: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 700; text-transform: uppercase;">PENDING SELLER RESPONSE</span>
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <a href="#/buyer/inquiries" class="btn btn--primary" style="flex: 1; text-decoration: none; justify-content: center; background: #12372A; border-radius: 8px;" onclick="document.getElementById('inquiry-success-overlay').classList.remove('active')">
          View Inquiry →
        </a>
        <button class="btn btn--secondary" style="flex: 1; border-radius: 8px;" onclick="document.getElementById('inquiry-success-overlay').classList.remove('active')">
          Done
        </button>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

// ═══════════════════════════════════════════════════════════════════════
// 5. MY INQUIRIES WORKSPACE (Segmented Tabs, Table, & Negotiation Timeline Stepper)
// ═══════════════════════════════════════════════════════════════════════
async function renderInquiriesView(container) {
  let allOffers = window.INITIAL_OFFERS_DATA || [];
  const countAll = allOffers.length;
  const countPending = allOffers.filter(o => o.status === 'PENDING').length;
  const countNeg = allOffers.filter(o => o.status === 'NEGOTIATING').length;
  const countAcc = allOffers.filter(o => o.status === 'ACCEPTED').length;
  const countRej = allOffers.filter(o => o.status === 'REJECTED').length;

  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 22px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 3px 0;">My Inquiries</h2>
          <p style="font-size: 13.5px; color: #666; margin: 0;">Manage your procurement requests and seller responses.</p>
        </div>
        <a href="#/buyer/marketplace" class="btn btn--primary btn--sm" style="text-decoration: none; background: #12372A; border-radius: 8px; padding: 8px 16px; font-weight: 700;">
          <i data-lucide="plus"></i> + New Inquiry
        </a>
      </div>

      <!-- Professional Segmented Status Tabs -->
      <div class="kl-segmented-tabs" id="inquiries-segmented-tabs">
        <button class="kl-segmented-tab ${currentInquiryFilter === 'all' ? 'active' : ''}" data-status="all">
          All <span class="kl-tab-badge">${countAll}</span>
        </button>
        <button class="kl-segmented-tab ${currentInquiryFilter === 'pending' ? 'active' : ''}" data-status="pending">
          Pending <span class="kl-tab-badge">${countPending}</span>
        </button>
        <button class="kl-segmented-tab ${currentInquiryFilter === 'negotiating' ? 'active' : ''}" data-status="negotiating">
          Negotiating <span class="kl-tab-badge">${countNeg}</span>
        </button>
        <button class="kl-segmented-tab ${currentInquiryFilter === 'accepted' ? 'active' : ''}" data-status="accepted">
          Accepted <span class="kl-tab-badge">${countAcc}</span>
        </button>
        <button class="kl-segmented-tab ${currentInquiryFilter === 'rejected' ? 'active' : ''}" data-status="rejected">
          Rejected <span class="kl-tab-badge">${countRej}</span>
        </button>
      </div>

      <!-- Search / Filter Bar -->
      <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 10px; padding: 10px 14px; margin-bottom: 18px; display: flex; gap: 10px; align-items: center;">
        <i data-lucide="search" style="color: #777; width: 16px; height: 16px;"></i>
        <input type="text" id="inq-search-input" class="dash-form-input" placeholder="Search inquiry, crop or seller..." style="border: none; padding: 4px 0; font-size: 13.5px; flex: 1; outline: none; background: transparent;">
      </div>

      <div id="buyer-inquiries-list">
        <div style="padding: 30px; text-align: center; color: #888;">Loading inquiries...</div>
      </div>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  const tabContainer = document.getElementById('inquiries-segmented-tabs');
  tabContainer.querySelectorAll('.kl-segmented-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabContainer.querySelectorAll('.kl-segmented-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentInquiryFilter = tab.dataset.status;
      fetchInquiries();
    });
  });

  const searchInput = document.getElementById('inq-search-input');
  searchInput.addEventListener('input', () => fetchInquiries());

  const fetchInquiries = async () => {
    const list = document.getElementById('buyer-inquiries-list');
    if (!list) return;

    let inqs = window.INITIAL_OFFERS_DATA || [];
    if (currentInquiryFilter !== 'all') {
      inqs = inqs.filter(o => o.status.toLowerCase() === currentInquiryFilter.toLowerCase());
    }

    const q = searchInput.value.trim().toLowerCase();
    if (q) {
      inqs = inqs.filter(o => o.id.toLowerCase().includes(q) || o.crop.toLowerCase().includes(q) || o.sellerName.toLowerCase().includes(q));
    }

    if (inqs.length > 0) {
      list.innerHTML = `
        <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #E5E4DD; text-align: left; color: #777; font-size: 11px; text-transform: uppercase; background: #FAF9F5;">
                <th style="padding: 12px 14px;">Inquiry</th>
                <th style="padding: 12px 14px;">Produce</th>
                <th style="padding: 12px 14px;">Seller</th>
                <th style="padding: 12px 14px;">Quantity</th>
                <th style="padding: 12px 14px;">Target Price</th>
                <th style="padding: 12px 14px;">Updated</th>
                <th style="padding: 12px 14px;">Status</th>
                <th style="padding: 12px 14px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${inqs.map(inq => {
                const s = getStatusBadge(inq.status.toLowerCase());
                return `
                  <tr style="border-bottom: 1px solid #F0EFEA;">
                    <td style="padding: 12px 14px; font-family: monospace; font-weight: 700; color: var(--ks-evergreen);">#${inq.id}</td>
                    <td style="padding: 12px 14px; font-weight: 700; color: #12372A;">${inq.crop}</td>
                    <td style="padding: 12px 14px; color: #555;">${inq.sellerName}</td>
                    <td style="padding: 12px 14px; font-weight: 700;">${inq.quantity} q</td>
                    <td style="padding: 12px 14px; font-weight: 800; color: var(--ks-evergreen);">₹${inq.currentBuyerOffer?.toLocaleString('en-IN')}/q</td>
                    <td style="padding: 12px 14px; color: #777; font-size: 12px;">${inq.updatedAt || 'Recently'}</td>
                    <td style="padding: 12px 14px;">
                      <span style="padding: 2px 7px; border-radius: 4px; background: ${s.bg}; color: ${s.color}; font-size: 10px; font-weight: 800; text-transform: uppercase;">
                        ${s.text}
                      </span>
                    </td>
                    <td style="padding: 12px 14px; text-align: right;">
                      <button class="btn btn--secondary btn--sm" style="border-radius: 6px; font-size: 12px; padding: 5px 12px;" onclick="openNegotiationModal('${inq.id}')">
                        Timeline & Offers
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      list.innerHTML = `
        <div class="kl-compact-empty-state">
          <div class="kl-compact-empty-icon">📋</div>
          <div class="kl-compact-empty-title">No inquiries yet</div>
          <div class="kl-compact-empty-desc">Explore the marketplace and send your first procurement request.</div>
          <a href="#/buyer/marketplace" class="btn btn--primary btn--sm" style="text-decoration: none; background: #12372A; border-radius: 8px;">Browse Marketplace</a>
        </div>
      `;
    }
  };

  fetchInquiries();
}

async function openNegotiationModal(inquiryId) {
  let overlay = document.getElementById('negotiation-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'negotiation-modal-overlay';
    overlay.className = 'dash-modal-overlay active';
    document.body.appendChild(overlay);
  }

  const mock = window.INITIAL_OFFERS_DATA?.find(o => o.id === inquiryId) || window.INITIAL_OFFERS_DATA?.[0];
  const s = getStatusBadge(mock.status.toLowerCase());

  overlay.innerHTML = `
    <div class="dash-modal" style="max-width: 620px; max-height: 90vh; overflow-y: auto;">
      <div class="dash-modal__header">
        <div>
          <h3 style="margin: 0; font-size: 18px;">Inquiry #${mock.id}</h3>
          <span style="font-size: 12px; color: var(--ks-text-muted);">Status: ${mock.status} • Updated: ${mock.updatedAt}</span>
        </div>
        <button class="dash-modal__close" onclick="document.getElementById('negotiation-modal-overlay').classList.remove('active')"><i data-lucide="x"></i></button>
      </div>
      <div class="dash-modal__body-pad" style="padding: 20px 22px;">
        <!-- Procurement Progress Stepper -->
        <h4 style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #718E68; margin: 0 0 10px 0;">Procurement Timeline</h4>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; text-align: center; font-size: 11px; margin-bottom: 18px;">
          <div style="padding: 6px 2px; background: #E5F0E7; color: #12372A; font-weight: 700; border-radius: 4px;">✓ Inquiry Sent</div>
          <div style="padding: 6px 2px; background: #E5F0E7; color: #12372A; font-weight: 700; border-radius: 4px;">✓ Seller Responded</div>
          <div style="padding: 6px 2px; background: ${mock.status === 'NEGOTIATING' || mock.status === 'ACCEPTED' ? '#E5F0E7' : '#FAF9F5'}; color: #12372A; font-weight: 700; border-radius: 4px;">${mock.status === 'NEGOTIATING' ? '● Negotiation' : '✓ Negotiation'}</div>
          <div style="padding: 6px 2px; background: ${mock.status === 'ACCEPTED' ? '#E5F0E7' : '#FAF9F5'}; color: #12372A; font-weight: 700; border-radius: 4px;">${mock.status === 'ACCEPTED' ? '✓ Accepted' : '○ Accepted'}</div>
          <div style="padding: 6px 2px; background: #FAF9F5; color: #888; font-weight: 600; border-radius: 4px;">○ Order Created</div>
        </div>

        <!-- Inquiry Summary -->
        <div style="background: #FAF8F5; border: 1px solid #EAE6DF; border-radius: 10px; padding: 12px 16px; margin-bottom: 18px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Produce & Volume:</span>
            <strong>${mock.crop} (${mock.quantity} quintals)</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Seller:</span>
            <strong>${mock.sellerName}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Current Offer:</span>
            <strong style="color: var(--ks-evergreen);">₹${mock.currentBuyerOffer?.toLocaleString('en-IN')}/q (Listed Ask: ₹${mock.sellerAsk}/q)</strong>
          </div>
        </div>

        <!-- Negotiation Conversation Log -->
        <h4 style="font-size: 13px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 10px 0;">Negotiation History</h4>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
          ${(mock.history || []).map(h => {
            const isBuyer = h.party === 'Buyer';
            return `
              <div style="background: ${isBuyer ? '#FAF8F5' : '#FFFBEB'}; border-left: 3px solid ${isBuyer ? 'var(--ks-evergreen)' : '#D97706'}; padding: 8px 12px; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 2px;">
                  <strong style="color: ${isBuyer ? 'var(--ks-evergreen)' : '#D97706'};">${isBuyer ? 'BUYER OFFER' : 'SELLER RESPONSE'}</strong>
                  <span style="font-size: 10.5px; color: #888;">Recorded</span>
                </div>
                <div style="font-size: 12.5px;">Price: <strong>₹${h.price?.toLocaleString('en-IN')}/q</strong> • ${h.note || ''}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Action CTAs -->
        ${mock.status === 'ACCEPTED' ? `
          <div style="background: #E5F0E7; border-radius: 10px; padding: 14px; text-align: center;">
            <div style="font-size: 14px; font-weight: 700; color: #12372A; margin-bottom: 4px;">🎉 Offer Accepted by Seller!</div>
            <p style="font-size: 12.5px; color: #12372A; margin: 0 0 12px 0;">Lock in your procurement contract with secure escrow backing.</p>
            <button class="btn btn--primary" style="background: #12372A; color: #FFFFFF; font-weight: 700; width: 100%; justify-content: center; height: 40px; border-radius: 8px;" onclick="document.getElementById('negotiation-modal-overlay').classList.remove('active'); openCreateOrderModal('${mock.id}')">
              Confirm Deal & Place Escrow Order →
            </button>
          </div>
        ` : `
          <div style="border-top: 1px solid #EEE; padding-top: 14px;">
            <h4 style="font-size: 13px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 8px 0;">Send Counter Offer</h4>
            <div style="display: flex; gap: 8px;">
              <input type="number" id="co-price" class="dash-form-input" value="${mock.currentBuyerOffer}" placeholder="Counter Price (₹/q)" style="flex: 1;">
              <button class="btn btn--primary" style="background: #12372A; font-weight: 700; border-radius: 8px;" onclick="submitCounterOffer('${mock.id}')">
                Send Counter Offer
              </button>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
  overlay.classList.add('active');
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function submitCounterOffer(inquiryId) {
  const priceInput = document.getElementById('co-price');
  const p = parseFloat(priceInput?.value);
  if (!p || p <= 0) {
    alert('Please enter a valid counter price.');
    return;
  }
  const inq = window.INITIAL_OFFERS_DATA?.find(o => o.id === inquiryId);
  if (inq) {
    inq.currentBuyerOffer = p;
    inq.history.push({ party: 'Buyer', price: p, note: 'Revised procurement counter-offer' });
    showToast(`Counter offer of ₹${p}/q submitted to seller`, 'success');
    openNegotiationModal(inquiryId);
  }
}

function openCreateOrderModal(inquiryId) {
  if (window.offerService) {
    const res = window.offerService.acceptOffer(inquiryId);
    if (res && res.order) {
      showToast(`Escrow order created: #${res.order.id}`, 'success');
      window.location.hash = '#/buyer/orders';
      return;
    }
  }
  showToast('Procurement order placed with Escrow protection.', 'success');
  window.location.hash = '#/buyer/orders';
}

// ═══════════════════════════════════════════════════════════════════════
// 6. ORDERS VIEW (Professional Segmented Tabs, Cards & 8-Stage Tracker)
// ═══════════════════════════════════════════════════════════════════════
async function renderOrdersView(container) {
  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <!-- Orders Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 22px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 3px 0;">My Orders</h2>
          <p style="font-size: 13.5px; color: #666; margin: 0;">Track every procurement from confirmation to delivery.</p>
        </div>
        <a href="#/buyer/marketplace" class="btn btn--primary btn--sm" style="text-decoration: none; background: #12372A; border-radius: 8px; padding: 8px 16px; font-weight: 700;">
          <i data-lucide="store"></i> Browse Marketplace
        </a>
      </div>

      <!-- Professional Segmented Status Tabs -->
      <div class="kl-segmented-tabs" id="orders-segmented-tabs">
        <button class="kl-segmented-tab ${currentOrderFilter === 'all' ? 'active' : ''}" data-status="all">
          All Orders <span class="kl-tab-badge" id="tab-badge-all">-</span>
        </button>
        <button class="kl-segmented-tab ${currentOrderFilter === 'CONFIRMED' ? 'active' : ''}" data-status="CONFIRMED">
          Confirmed <span class="kl-tab-badge" id="tab-badge-confirmed">-</span>
        </button>
        <button class="kl-segmented-tab ${currentOrderFilter === 'IN_TRANSIT' ? 'active' : ''}" data-status="IN_TRANSIT">
          In Transit <span class="kl-tab-badge" id="tab-badge-transit">-</span>
        </button>
        <button class="kl-segmented-tab ${currentOrderFilter === 'DELIVERED' ? 'active' : ''}" data-status="DELIVERED">
          Delivered <span class="kl-tab-badge" id="tab-badge-delivered">-</span>
        </button>
      </div>

      <!-- Search & Sort Controls -->
      <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 10px; padding: 10px 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 240px;">
          <i data-lucide="search" style="color: #777; width: 16px; height: 16px;"></i>
          <input type="text" id="order-search-input" class="dash-form-input" placeholder="Search order ID, produce or seller..." style="border: none; padding: 4px 0; font-size: 13.5px; flex: 1; outline: none; background: transparent;" value="${currentOrderSearch}">
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 12px; color: #777; font-weight: 600; white-space: nowrap;">Sort:</span>
          <select id="order-sort-select" style="border: 1px solid #E5E4DD; border-radius: 6px; font-size: 12px; padding: 4px 8px; background: #FAF9F5; outline: none; font-weight: 600; color: #12372A; cursor: pointer;">
            <option value="newest" ${currentOrderSort === 'newest' ? 'selected' : ''}>Newest</option>
            <option value="oldest" ${currentOrderSort === 'oldest' ? 'selected' : ''}>Oldest</option>
          </select>
        </div>
      </div>

      <div id="buyer-orders-list">
        <div style="padding: 48px; text-align: center; color: var(--ks-text-muted);">
          <div class="spinner" style="margin: 0 auto 12px auto; width: 28px; height: 28px; border: 3px solid #E5E4DD; border-top-color: var(--ks-evergreen); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          Loading orders...
        </div>
      </div>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Segmented Tabs Click
  const tabContainer = document.getElementById('orders-segmented-tabs');
  tabContainer.querySelectorAll('.kl-segmented-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabContainer.querySelectorAll('.kl-segmented-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentOrderFilter = tab.dataset.status;
      fetchOrders();
    });
  });

  const searchInput = document.getElementById('order-search-input');
  const sortSelect = document.getElementById('order-sort-select');

  searchInput.addEventListener('input', () => {
    currentOrderSearch = searchInput.value.trim();
    fetchOrders();
  });

  sortSelect.addEventListener('change', () => {
    currentOrderSort = sortSelect.value;
    fetchOrders();
  });

  let rawFetchedOrders = null;

  const fetchOrders = async () => {
    const list = document.getElementById('buyer-orders-list');
    if (!list) return;

    if (!rawFetchedOrders) {
      list.innerHTML = `
        <div style="padding: 48px; text-align: center; color: var(--ks-text-muted);">
          <div class="spinner" style="margin: 0 auto 12px auto; width: 28px; height: 28px; border: 3px solid #E5E4DD; border-top-color: var(--ks-evergreen); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          Loading orders...
        </div>
      `;

      const isDev = window.Auth && typeof window.Auth.isLocalEnv === 'function' && window.Auth.isLocalEnv() && localStorage.getItem('krishishetra_dev_session');
      let apiFailed = false;

      try {
        const res = await window.api?.orders?.getMine?.();
        if (res?.success && Array.isArray(res.orders)) {
          rawFetchedOrders = res.orders;
        } else if (!res?.success) {
          apiFailed = true;
        }
      } catch (err) {
        apiFailed = true;
      }

      if ((apiFailed || (rawFetchedOrders && rawFetchedOrders.length === 0)) && isDev && window.INITIAL_ORDERS_DATA) {
        rawFetchedOrders = window.INITIAL_ORDERS_DATA;
        apiFailed = false;
      }

      if (apiFailed) {
        list.innerHTML = `
          <div class="kl-compact-empty-state" style="border: 1px dashed #E5E4DD;">
            <div class="kl-compact-empty-icon">⚠️</div>
            <div class="kl-compact-empty-title">Unable to load orders</div>
            <div class="kl-compact-empty-desc">We could not retrieve your orders at this time. Please check your connection and try again.</div>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 14px;">
              <button class="btn btn--primary btn--sm" onclick="fetchOrders()">Try Again</button>
              <a href="#/buyer/marketplace" class="btn btn--secondary btn--sm" style="text-decoration: none;">Browse Marketplace</a>
            </div>
          </div>
        `;
        return;
      }
    }

    const allOrders = rawFetchedOrders || [];

    // Update Tab Badges
    const countAll = allOrders.length;
    const countConf = allOrders.filter(o => (o.status || '').toUpperCase() === 'CONFIRMED').length;
    const countTransit = allOrders.filter(o => (o.status || '').toUpperCase() === 'IN_TRANSIT').length;
    const countDelivered = allOrders.filter(o => (o.status || '').toUpperCase() === 'DELIVERED').length;

    const bAll = document.getElementById('tab-badge-all');
    const bConf = document.getElementById('tab-badge-confirmed');
    const bTran = document.getElementById('tab-badge-transit');
    const bDel = document.getElementById('tab-badge-delivered');
    if (bAll) bAll.textContent = countAll;
    if (bConf) bConf.textContent = countConf;
    if (bTran) bTran.textContent = countTransit;
    if (bDel) bDel.textContent = countDelivered;

    let ords = [...allOrders];
    if (currentOrderFilter !== 'all') {
      ords = ords.filter(o => (o.status || '').toUpperCase() === currentOrderFilter.toUpperCase());
    }

    if (currentOrderSearch) {
      const q = currentOrderSearch.toLowerCase();
      ords = ords.filter(o => 
        (o.id || o.orderId || '').toLowerCase().includes(q) || 
        (o.crop || o.cropName || '').toLowerCase().includes(q) || 
        (o.sellerName || o.farmerName || '').toLowerCase().includes(q)
      );
    }

    if (currentOrderSort === 'oldest') {
      ords = [...ords].reverse();
    }

    if (ords.length > 0) {
      list.innerHTML = ords.map(ord => {
        const id = ord.orderId || ord.id || 'KS-000';
        const crop = ord.cropName || ord.crop || 'Produce';
        const variety = ord.variety || 'Standard Variety';
        const sellerName = ord.farmerName || ord.sellerName || 'Verified Farm';
        const grandTotal = ord.totalAmount || ord.grandTotal || (ord.agreedPrice ? ord.agreedPrice * ord.quantity : 0);
        const pricePerQ = ord.agreedPrice || ord.pricePerQ || Math.round(grandTotal / (ord.quantity || 1));
        const quantity = ord.quantity || 0;
        const rawStatus = (ord.status || 'confirmed').toLowerCase();
        const s = getOrderStatusBadge(rawStatus);
        const paymentStatus = ord.paymentStatus || (rawStatus === 'delivered' ? 'RELEASED' : 'HELD IN ESCROW');
        const orderedAt = ord.createdAt || ord.orderedAt || 'Recently';
        let deliveryAddress = 'Warehouse Terminal';
        if (typeof ord.deliveryAddress === 'string') {
          deliveryAddress = ord.deliveryAddress;
        } else if (ord.deliveryAddress && typeof ord.deliveryAddress === 'object') {
          deliveryAddress = [ord.deliveryAddress.addressLine1, ord.deliveryAddress.village, ord.deliveryAddress.state].filter(Boolean).join(', ');
        }
        const logisticsStatus = (ord.logistics && ord.logistics.status) ? ord.logistics.status : (rawStatus === 'in_transit' ? 'In Transit' : rawStatus === 'delivered' ? 'Delivered' : 'Scheduled');

        return `
          <div class="kl-order-card">
            <!-- Header Row -->
            <div class="kl-order-card-header">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-family: monospace; font-size: 13.5px; font-weight: 800; color: var(--ks-evergreen);">ORDER #${id.toUpperCase().replace('ORD-', 'KS-')}</span>
                <span style="background: ${s.bg}; color: ${s.color}; padding: 3px 8px; border-radius: 4px; font-size: 10.5px; font-weight: 800; text-transform: uppercase;">
                  ${s.text}
                </span>
                <span style="font-size: 11px; color: #5B9A72; font-weight: 700; background: #E5F0E7; padding: 2px 6px; border-radius: 4px;">
                  ${paymentStatus}
                </span>
              </div>
              <div style="font-size: 12px; color: #777;">
                Ordered: ${orderedAt.toString().split('T')[0].split(' ')[0]}
              </div>
            </div>

            <!-- Content Grid -->
            <div class="kl-order-grid-3col">
              <div>
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #777; margin-bottom: 2px;">Produce Sourced</div>
                <div style="font-size: 15px; font-weight: 800; color: #12372A;">${crop} <span style="font-size: 13px; font-weight: 500; color: #666;">(${variety})</span></div>
                <div style="font-size: 12px; color: #666; margin-top: 2px;">Seller: <strong>${sellerName}</strong></div>
              </div>

              <div>
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #777; margin-bottom: 2px;">Quantity & Value</div>
                <div style="font-size: 15px; font-weight: 800; color: var(--ks-evergreen);">₹${grandTotal.toLocaleString('en-IN')}</div>
                <div style="font-size: 12px; color: #666; margin-top: 2px;">Volume: <strong>${quantity} quintals</strong> (@ ₹${pricePerQ}/q)</div>
              </div>

              <div>
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #777; margin-bottom: 2px;">Delivery Destination</div>
                <div style="font-size: 12.5px; font-weight: 600; color: #333;">${deliveryAddress}</div>
                <div style="font-size: 11.5px; color: #155E75; margin-top: 2px; font-weight: 600;">Status: ${logisticsStatus}</div>
              </div>

              <div style="display: flex; gap: 8px; align-items: center; justify-content: flex-end;">
                <button class="btn btn--secondary btn--sm" style="border-radius: 6px; font-size: 12px; padding: 6px 14px;" onclick="openOrderTrackingModal('${id}')">
                  View Order
                </button>
                <button class="btn btn--primary btn--sm" style="background: #12372A; border-radius: 6px; font-size: 12px; padding: 6px 14px;" onclick="openOrderTrackingModal('${id}')">
                  Track
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      list.innerHTML = `
        <div class="kl-compact-empty-state">
          <div class="kl-compact-empty-icon">📦</div>
          <div class="kl-compact-empty-title">No orders yet</div>
          <div class="kl-compact-empty-desc">Your confirmed purchases will appear here.</div>
          <a href="#/buyer/marketplace" class="btn btn--primary btn--sm" style="text-decoration: none; background: #12372A; border-radius: 8px;">Browse Marketplace</a>
        </div>
      `;
    }
  };

  fetchOrders();
}

function openOrderTrackingModal(orderId) {
  let overlay = document.getElementById('order-tracking-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'order-tracking-modal-overlay';
    overlay.className = 'dash-modal-overlay active';
    document.body.appendChild(overlay);
  }

  const order = window.orderService?.getOrderById(orderId) || window.INITIAL_ORDERS_DATA?.[0];
  const s = getOrderStatusBadge(order.status.toLowerCase());

  overlay.innerHTML = `
    <div class="dash-modal" style="max-width: 660px; max-height: 90vh; overflow-y: auto;">
      <div class="dash-modal__header">
        <div>
          <h3 style="margin: 0; font-size: 18px;">Order #KS-${order.id.replace('ord-', '')}</h3>
          <span style="font-size: 12px; color: var(--ks-text-muted);">Status: ${order.status} • Order Date: ${order.orderedAt}</span>
        </div>
        <button class="dash-modal__close" onclick="document.getElementById('order-tracking-modal-overlay').classList.remove('active')"><i data-lucide="x"></i></button>
      </div>
      <div class="dash-modal__body-pad" style="padding: 20px 22px;">
        <!-- Visual Progress Tracker -->
        <h4 style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #718E68; margin: 0 0 10px 0;">Order Progress</h4>
        <div style="display: flex; flex-direction: column; gap: 7px; margin-bottom: 20px;">
          ${(order.timeline || []).map(t => `
            <div style="display: flex; align-items: center; gap: 10px; padding: 7px 12px; background: ${t.done ? '#FAF9F5' : '#FFFFFF'}; border-radius: 6px; border-left: 3px solid ${t.done ? '#12372A' : '#DDD'};">
              <span style="width: 20px; height: 20px; border-radius: 50%; background: ${t.done ? '#12372A' : '#EEE'}; color: ${t.done ? '#FFF' : '#777'}; display: flex; align-items: center; justify-content: center; font-size: 10.5px; font-weight: 700;">
                ${t.done ? '✓' : '○'}
              </span>
              <div style="flex: 1; display: flex; justify-content: space-between;">
                <span style="font-size: 12.5px; font-weight: ${t.done ? '700' : '400'}; color: ${t.done ? '#12372A' : '#777'};">${t.label}</span>
                <span style="font-size: 11px; color: ${t.done ? '#5B9A72' : '#999'}; font-weight: 600;">${t.time}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Order & Financial Summary -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px;">
          <div style="background: #FAF8F5; border: 1px solid #EAE6DF; border-radius: 10px; padding: 12px 14px;">
            <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: #777; margin-bottom: 4px;">Produce Details</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #12372A;">${order.crop} (${order.variety})</div>
            <div style="font-size: 12px; color: #666; margin-top: 2px;">Volume: <strong>${order.quantity} quintals</strong> @ ₹${order.pricePerQ}/q</div>
            <div style="font-size: 11.5px; color: #666; margin-top: 2px;">Seller: <strong>${order.sellerName}</strong></div>
          </div>

          <div style="background: #FAF8F5; border: 1px solid #EAE6DF; border-radius: 10px; padding: 12px 14px;">
            <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: #777; margin-bottom: 4px;">Payment Breakdown</div>
            <div style="font-size: 12px; color: #555; display: flex; justify-content: space-between;">
              <span>Subtotal:</span> <span>₹${order.productTotal?.toLocaleString('en-IN')}</span>
            </div>
            <div style="font-size: 12px; color: #555; display: flex; justify-content: space-between;">
              <span>Transport:</span> <span>₹${order.transportCost?.toLocaleString('en-IN')}</span>
            </div>
            <div style="font-size: 13px; font-weight: 800; color: var(--ks-evergreen); border-top: 1px dashed #DDD; padding-top: 4px; margin-top: 3px; display: flex; justify-content: space-between;">
              <span>Grand Total:</span> <span>₹${order.grandTotal?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <!-- Carrier & Telemetry Info -->
        ${order.logistics ? `
          <div style="background: #F5F4ED; border-radius: 10px; padding: 12px 16px; margin-bottom: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: var(--ks-evergreen); font-size: 13px;"><i data-lucide="truck"></i> Carrier Fleet: KrishiExpress</strong>
              <span style="background: #E5F0E7; color: #12372A; padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 10px;">${order.logistics.status}</span>
            </div>
            <div style="font-size: 12px; color: #555;">
              Driver: <strong>${order.logistics.driverName} (${order.logistics.driverPhone})</strong> • Vehicle: <strong>${order.logistics.truckNumber}</strong>
            </div>
            <div style="font-size: 12px; color: #555; margin-top: 2px;">
              Destination: <strong>${order.deliveryAddress}</strong> (ETA: ${order.logistics.eta})
            </div>
          </div>
        ` : ''}

        <!-- Quality Inspection Release Action -->
        <div style="background: #FAF8F5; border: 1px solid #E5E4DD; border-radius: 10px; padding: 14px; text-align: center;">
          <div style="font-size: 13px; font-weight: 700; color: var(--ks-evergreen); margin-bottom: 3px;">Quality Inspection & Escrow Release</div>
          <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">Upon unloading and verifying produce quality at your warehouse, release escrow payment to the farmer.</p>
          <button class="btn btn--primary" style="background: #12372A; color: #FFFFFF; font-weight: 700; width: 100%; justify-content: center; height: 38px; border-radius: 8px; font-size: 13px;" onclick="confirmReleaseEscrow('${order.id}')">
            <i data-lucide="check-circle"></i> Confirm Quality & Release Escrow Payment
          </button>
        </div>
      </div>
    </div>
  `;
  overlay.classList.add('active');
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function confirmReleaseEscrow(orderId) {
  if (window.orderService) {
    window.orderService.confirmQualityAndRelease(orderId);
  }
  showToast(`Quality inspection approved for Order ${orderId}. Escrow funds released to farmer.`, 'success');
  const overlay = document.getElementById('order-tracking-modal-overlay');
  if (overlay) overlay.classList.remove('active');
  renderOrdersView(document.getElementById('buyer-page-content'));
}

// ═══════════════════════════════════════════════════════════════════════
// 7. FARMER / FPO DIRECTORY VIEW (Find Trusted Sellers)
// ═══════════════════════════════════════════════════════════════════════
async function renderDirectoryView(container) {
  const directoryData = [
    {
      id: 'fpo-001',
      name: 'Sahyadri Farmers Producer Co.',
      type: 'FPO / Cooperative',
      location: 'Nashik, Maharashtra',
      established: '2016',
      farmersCount: 1250,
      crops: ['Tomato', 'Grapes', 'Onion', 'Pomegranate'],
      verified: true,
      annualVolume: '15,000 MT'
    },
    {
      id: 'fpo-002',
      name: 'MahaAgri Green FPO Ltd',
      type: 'FPO / Cooperative',
      location: 'Baramati, Pune, Maharashtra',
      established: '2019',
      farmersCount: 680,
      crops: ['Wheat', 'Soybean', 'Maize', 'Chana'],
      verified: true,
      annualVolume: '8,500 MT'
    },
    {
      id: 'farmer-001',
      name: 'Anand Patil Organic Farms',
      type: 'Individual Farmer',
      location: 'Niphad, Nashik, Maharashtra',
      established: '2012',
      farmersCount: 1,
      crops: ['Red Onion', 'Garlic', 'Green Chilli'],
      verified: true,
      annualVolume: '250 MT'
    },
    {
      id: 'farmer-002',
      name: 'Suresh Deshmukh Farms',
      type: 'Individual Farmer',
      location: 'Shrirampur, Ahmednagar, Maharashtra',
      established: '2015',
      farmersCount: 1,
      crops: ['Sharbati Wheat', 'Soybean', 'Tur Dal'],
      verified: true,
      annualVolume: '180 MT'
    },
    {
      id: 'fpo-003',
      name: 'Malwa Agro Krishi Producer Co.',
      type: 'FPO / Cooperative',
      location: 'Indore, Madhya Pradesh',
      established: '2020',
      farmersCount: 940,
      crops: ['Yellow Soybean', 'Wheat', 'Mustard', 'Garlic'],
      verified: true,
      annualVolume: '12,000 MT'
    }
  ];

  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 22px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 3px 0;">Find Trusted Sellers</h2>
        <p style="font-size: 13.5px; color: #666; margin: 0;">Connect directly with verified individual farmers and farmer producer cooperatives for contract sourcing.</p>
      </div>

      <!-- Filter Controls Bar -->
      <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
        <input type="text" id="dir-filter-search" class="dash-form-input" placeholder="Search by farmer name, FPO, district, or crop..." style="flex: 2; min-width: 220px; background: transparent;">
        <select id="dir-filter-type" class="kl-filter-select-b2b" style="flex: 1; min-width: 160px;">
          <option value="all">All Organization Types</option>
          <option value="FPO">Farmer Producer Orgs (FPOs)</option>
          <option value="Farmer">Individual Farmers</option>
        </select>
        <button class="btn btn--primary" id="btn-apply-dir-filter" style="padding: 9px 18px; white-space: nowrap; background: #12372A; border-radius: 8px;">
          <i data-lucide="search"></i> Search Directory
        </button>
      </div>

      <!-- Directory Cards Grid -->
      <div id="buyer-directory-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 18px;">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  const searchInput = document.getElementById('dir-filter-search');
  const typeSelect = document.getElementById('dir-filter-type');
  const filterBtn = document.getElementById('btn-apply-dir-filter');

  const renderCards = () => {
    const grid = document.getElementById('buyer-directory-grid');
    if (!grid) return;

    const q = searchInput.value.trim().toLowerCase();
    const type = typeSelect.value;

    let filtered = directoryData;
    if (q) {
      filtered = filtered.filter(d => d.name.toLowerCase().includes(q) || d.location.toLowerCase().includes(q) || d.crops.some(c => c.toLowerCase().includes(q)));
    }
    if (type !== 'all') {
      filtered = filtered.filter(d => d.type.toLowerCase().includes(type.toLowerCase()));
    }

    if (filtered.length > 0) {
      grid.innerHTML = filtered.map(d => `
        <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 3px 12px rgba(0,0,0,0.03);">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <span style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; background: #E5F0E7; color: #12372A; padding: 2px 7px; border-radius: 4px;">
                ${d.type}
              </span>
              <span style="font-size: 11.5px; color: #5B9A72; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                ✓ Verified Supplier
              </span>
            </div>

            <h3 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">${d.name}</h3>
            <div style="font-size: 12.5px; color: #666; margin-bottom: 10px;"><i data-lucide="map-pin" style="width: 12px; height: 12px; vertical-align: middle;"></i> ${d.location}</div>

            <div style="background: #FAF8F5; border-radius: 8px; padding: 8px 10px; margin-bottom: 12px; font-size: 12px; color: #555;">
              <div style="margin-bottom: 3px;"><strong>Member Base:</strong> ${d.farmersCount} Farmers • Est. ${d.established}</div>
              <div><strong>Annual Capacity:</strong> ${d.annualVolume}</div>
            </div>

            <div style="margin-bottom: 14px;">
              <div style="font-size: 11px; font-weight: 700; color: #777; text-transform: uppercase; margin-bottom: 5px;">Crops Cultivated:</div>
              <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                ${d.crops.map(c => `
                  <span style="background: #F0EFEA; color: #333; font-size: 11px; padding: 2px 7px; border-radius: 4px; font-weight: 600;">${c}</span>
                `).join('')}
              </div>
            </div>
          </div>

          <div style="border-top: 1px solid #EEE; padding-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <a href="#/buyer/marketplace" class="btn btn--secondary btn--sm" style="justify-content: center; text-decoration: none; font-size: 12px; border-radius: 6px;">
              View Profile
            </a>
            <button class="btn btn--primary btn--sm" style="background: #12372A; color: #FFFFFF; justify-content: center; font-size: 12px; border-radius: 6px;" onclick="window.location.hash='#/buyer/marketplace'; showToast('Opening produce lots for ${d.name}');">
              Send Inquiry →
            </button>
          </div>
        </div>
      `).join('');
    } else {
      grid.innerHTML = `
        <div class="kl-compact-empty-state" style="grid-column: 1 / -1;">
          <div class="kl-compact-empty-icon">👥</div>
          <div class="kl-compact-empty-title">No sellers found</div>
          <div class="kl-compact-empty-desc">Try adjusting your search query or organization filter.</div>
        </div>
      `;
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  filterBtn.addEventListener('click', renderCards);
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') renderCards(); });
  typeSelect.addEventListener('change', renderCards);

  renderCards();
}

// ═══════════════════════════════════════════════════════════════════════
// 8. LOGISTICS TRACKING VIEW
// ═══════════════════════════════════════════════════════════════════════
async function renderLogisticsView(container) {
  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 style="font-size: 22px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 3px 0;">Logistics & Fleet Dispatch</h1>
          <p style="font-size: 13.5px; color: #666; margin: 0;">Real-time transit telemetry and delivery schedules for confirmed procurement contracts</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <a href="#/buyer/orders" class="btn btn--secondary btn--sm" style="text-decoration: none;"><i data-lucide="package"></i> View Orders</a>
        </div>
      </div>

      <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 22px;">
        <h3 style="font-size: 15px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 14px 0;">Active Shipments & Fleet Telemetry</h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #E5E4DD; text-align: left; color: #777; font-size: 11px; text-transform: uppercase; background: #FAF9F5;">
                <th style="padding: 10px 12px;">Order ID</th>
                <th style="padding: 10px 12px;">Produce & Quantity</th>
                <th style="padding: 10px 12px;">Supplier / Origin</th>
                <th style="padding: 10px 12px;">Destination Warehouse</th>
                <th style="padding: 10px 12px;">Logistics Status</th>
                <th style="padding: 10px 12px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #F0EFEA;">
                <td style="padding: 12px; font-weight: 700; color: var(--ks-evergreen); font-family: monospace;">#ord-10245</td>
                <td style="padding: 12px;">Onion - Red Garwa (100 Quintals)</td>
                <td style="padding: 12px;">Nashik Farmer Producer Co · Nashik APMC</td>
                <td style="padding: 12px;">Chakan Warehouse, Pune</td>
                <td style="padding: 12px;"><span style="background: #CFFAFE; color: #155E75; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">IN TRANSIT (ETA 2h 20m)</span></td>
                <td style="padding: 12px; text-align: right;"><button class="btn btn--sm btn--secondary" onclick="openOrderTrackingModal('ord-10245')">Telemetry</button></td>
              </tr>
              <tr style="border-bottom: 1px solid #F0EFEA;">
                <td style="padding: 12px; font-weight: 700; color: var(--ks-evergreen); font-family: monospace;">#ord-10340</td>
                <td style="padding: 12px;">Wheat - Lokwan Premium (250 Quintals)</td>
                <td style="padding: 12px;">Sahyadri Agro Farmers · Nashik</td>
                <td style="padding: 12px;">Chakan Warehouse, Pune</td>
                <td style="padding: 12px;"><span style="background: #E5F0E7; color: #12372A; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">ASSIGNED (MH 12 CD 5678)</span></td>
                <td style="padding: 12px; text-align: right;"><button class="btn btn--sm btn--secondary" onclick="openOrderTrackingModal('ord-10340')">Telemetry</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 9. ESCROW & PAYMENTS VIEW
// ═══════════════════════════════════════════════════════════════════════
async function renderPaymentsView(container) {
  let summary = {
    totalProcurement: '₹42.8L',
    pendingEscrow: '₹14.5L',
    paidCompleted: '₹28.3L',
    transactionCount: 8
  };

  if (window.paymentService) {
    summary = window.paymentService.getSummary();
  }

  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 style="font-size: 22px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 3px 0;">Escrow & Settlement Ledger</h1>
          <p style="font-size: 13.5px; color: #666; margin: 0;">Secured B2B smart contract escrow accounts for zero-risk produce procurement</p>
        </div>
        <button class="btn btn--primary btn--sm" style="background: #12372A; border-radius: 8px; padding: 8px 16px;" onclick="openDepositModal()">
          <i data-lucide="plus-circle"></i> Top-up Escrow Allocation
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin-bottom: 22px;">
        <div class="kl-stat-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 18px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700;">Locked in Active Escrow</div>
          <div style="font-size: 24px; font-weight: 800; color: var(--ks-evergreen); margin-top: 4px;">${summary.pendingEscrow}</div>
          <div style="font-size: 11.5px; color: #5B9A72; margin-top: 2px;">Protected for active orders</div>
        </div>
        <div class="kl-stat-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 18px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700;">Released & Settled</div>
          <div style="font-size: 24px; font-weight: 800; color: var(--ks-evergreen); margin-top: 4px;">${summary.paidCompleted}</div>
          <div style="font-size: 11.5px; color: #5B9A72; margin-top: 2px;">Completed farmer payouts</div>
        </div>
        <div class="kl-stat-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 18px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700;">Total Procurement Budget</div>
          <div style="font-size: 24px; font-weight: 800; color: var(--ks-evergreen); margin-top: 4px;">${summary.totalProcurement}</div>
          <div style="font-size: 11.5px; color: #777; margin-top: 2px;">Current FY Allocation</div>
        </div>
      </div>

      <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 22px;">
        <h3 style="font-size: 15px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 14px 0;">Escrow Transaction History</h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #E5E4DD; text-align: left; color: #777; font-size: 11px; text-transform: uppercase; background: #FAF9F5;">
                <th style="padding: 10px 12px;">Transaction / Invoice</th>
                <th style="padding: 10px 12px;">Date</th>
                <th style="padding: 10px 12px;">Supplier / Beneficiary</th>
                <th style="padding: 10px 12px;">Produce & Volume</th>
                <th style="padding: 10px 12px;">Amount</th>
                <th style="padding: 10px 12px;">Escrow State</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #F0EFEA;">
                <td style="padding: 12px; font-family: monospace; font-weight: 700;">INV-2026-88901</td>
                <td style="padding: 12px;">29 Aug 2026</td>
                <td style="padding: 12px;">Nashik Farmer Producer Co</td>
                <td style="padding: 12px;">Onion (100 Q)</td>
                <td style="padding: 12px; font-weight: 700; color: var(--ks-evergreen);">₹2,85,500</td>
                <td style="padding: 12px;"><span style="background: #FEF3C7; color: #92400E; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">HELD IN ESCROW</span></td>
              </tr>
              <tr style="border-bottom: 1px solid #F0EFEA;">
                <td style="padding: 12px; font-family: monospace; font-weight: 700;">INV-2026-88742</td>
                <td style="padding: 12px;">17 Aug 2026</td>
                <td style="padding: 12px;">Deccan Grain Growers FPO</td>
                <td style="padding: 12px;">Rice (200 Q)</td>
                <td style="padding: 12px; font-weight: 700; color: var(--ks-evergreen);">₹5,81,300</td>
                <td style="padding: 12px;"><span style="background: #D1FAE5; color: #065F46; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">SETTLED & RELEASED</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function openDepositModal() {
  const amt = prompt('Enter Escrow Top-up Allocation Amount (₹):', '500000');
  if (amt && Number(amt) > 0) {
    if (window.paymentService) {
      window.paymentService.depositFunds(amt);
    }
    showToast(`Successfully allocated ₹${Number(amt).toLocaleString('en-IN')} to Escrow Vault`, 'success');
    renderPaymentsView(document.getElementById('buyer-page-content'));
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 10. BUSINESS PROFILE & KYC VIEW
// ═══════════════════════════════════════════════════════════════════════
function renderProfileView(container) {
  const user = window.Auth ? window.Auth.getUser() : null;
  const userName = user?.name || 'Rajesh Patil';
  const userEmail = user?.email || 'rajesh.patil@abcfoods.in';

  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px; max-width: 760px; margin: 0 auto;">
      <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 24px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
          <div style="width: 58px; height: 58px; border-radius: 50%; background: var(--ks-evergreen); color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800;">
            ${userName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 style="font-size: 19px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 3px 0;">${userName} (ABC Foods Pvt Ltd)</h2>
            <div style="font-size: 13px; color: #666; margin-bottom: 5px;">${userEmail} · FMCG & Wholesale Food Processing</div>
            <span style="background: #E5F0E7; color: #12372A; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">
              ✓ KYC Verified B2B Procurement Account
            </span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
          <div style="background: #FAF9F5; padding: 14px; border-radius: 8px;">
            <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 600;">GSTIN Verification</div>
            <div style="font-size: 13.5px; font-weight: 700; color: var(--ks-evergreen); margin-top: 2px;">27AABCA1234F1ZM (Active)</div>
          </div>
          <div style="background: #FAF9F5; padding: 14px; border-radius: 8px;">
            <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 600;">Default Receiving Warehouse</div>
            <div style="font-size: 13.5px; font-weight: 700; color: var(--ks-evergreen); margin-top: 2px;">Chakan MIDC Phase 2, Pune</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E5E4DD; padding-top: 16px; flex-wrap: wrap; gap: 10px;">
          <a href="#/buyer/dashboard" class="btn btn--secondary btn--sm" style="text-decoration: none;">Back to Command</a>
          <button class="btn btn--danger btn--sm" style="background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; font-weight: 700; cursor: pointer;" onclick="if (window.Auth && window.Auth.logout) { window.Auth.logout(); } else { localStorage.clear(); window.location.href='login.html'; }">
            <i data-lucide="log-out"></i> Log Out
          </button>
        </div>
      </div>
    </div>
  `;
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function renderKycView(container) {
  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 28px; max-width: 540px; margin: 0 auto; text-align: center;">
        <div style="font-size: 36px; margin-bottom: 10px;">🛡️</div>
        <h2 style="font-size: 19px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">AgriStack KYC Verified</h2>
        <p style="font-size: 13px; color: #666; line-height: 1.45; margin: 0 0 16px 0;">Your business documents, GSTIN registration, and APMC trader licenses are verified for bulk procurement on KrishiShetra.</p>
        <div style="background: #E5F0E7; color: #12372A; padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12px; display: inline-block;">
          ✓ Verified Institutional Procurement Account
        </div>
      </div>
    </div>
  `;
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 11. HELPERS & BADGES
// ═══════════════════════════════════════════════════════════════════════
function getStatusBadge(status) {
  const map = {
    pending: { bg: '#FEF3C7', color: '#92400E', text: 'Pending' },
    negotiating: { bg: '#E0E7FF', color: '#3730A3', text: 'Negotiating' },
    accepted: { bg: '#E5F0E7', color: '#12372A', text: 'Accepted' },
    rejected: { bg: '#FEE2E2', color: '#991B1B', text: 'Rejected' },
    expired: { bg: '#F1F5F9', color: '#64748B', text: 'Expired' },
    completed: { bg: '#DBEAFE', color: '#1E40AF', text: 'Completed' }
  };
  return map[status] || map.pending;
}

function getOrderStatusBadge(status) {
  const map = {
    pending: { bg: '#FEF3C7', color: '#92400E', text: 'Pending' },
    confirmed: { bg: '#E5F0E7', color: '#12372A', text: 'Confirmed' },
    processing: { bg: '#E0E7FF', color: '#3730A3', text: 'Preparing' },
    ready_for_pickup: { bg: '#FDE68A', color: '#78350F', text: 'Ready For Pickup' },
    in_transit: { bg: '#CFFAFE', color: '#155E75', text: 'In Transit' },
    delivered: { bg: '#D1FAE5', color: '#065F46', text: 'Delivered' },
    cancelled: { bg: '#FEE2E2', color: '#991B1B', text: 'Cancelled' }
  };
  return map[status] || map.pending;
}

function initSearchInput() {
  const input = document.getElementById('global-buyer-search');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        window.location.hash = '/buyer/marketplace';
      }
    });
  }
}

// ── UI Interaction & Modal Helpers ──
function toggleProfileDropdown() {
  const dropdown = document.getElementById('dash-profile-dropdown');
  if (dropdown) dropdown.classList.toggle('active');
}

function closeProfileDropdown() {
  const dropdown = document.getElementById('dash-profile-dropdown');
  if (dropdown) dropdown.classList.remove('active');
}

function toggleMobileNav() {
  const menu = document.getElementById('dash-mobile-menu');
  if (menu) menu.classList.toggle('active');
}

function openModal(title, bodyHtml, footerHtml) {
  const overlay = document.getElementById('kl-modal-overlay');
  const titleEl = document.getElementById('kl-modal-title');
  const bodyEl = document.getElementById('kl-modal-body');
  const footerEl = document.getElementById('kl-modal-footer');
  if (titleEl) titleEl.textContent = title || '';
  if (bodyEl) bodyEl.innerHTML = bodyHtml || '';
  if (footerEl) footerEl.innerHTML = footerHtml || '';
  if (overlay) overlay.classList.add('active');
  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
}

function closeModal() {
  const overlay = document.getElementById('kl-modal-overlay');
  if (overlay) overlay.classList.remove('active');
  const detailOverlay = document.getElementById('buyer-lot-detail-overlay');
  if (detailOverlay) detailOverlay.classList.remove('active');
}

function closeModalOnBackdrop(e) {
  if (e && e.target && e.target.id === 'kl-modal-overlay') {
    closeModal();
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('kl-toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `kl-toast kl-toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Global modal triggers for HTML onclick bindings
window.toggleProfileDropdown = toggleProfileDropdown;
window.closeProfileDropdown = closeProfileDropdown;
window.toggleMobileNav = toggleMobileNav;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeModalOnBackdrop = closeModalOnBackdrop;
window.showToast = showToast;
window.openLotDetailModal = openLotDetailModal;
window.openSendInquiryModal = openSendInquiryModal;
window.openNegotiationModal = openNegotiationModal;
window.openCreateOrderModal = openCreateOrderModal;
window.openOrderTrackingModal = openOrderTrackingModal;
window.confirmReleaseEscrow = confirmReleaseEscrow;
window.openDepositModal = openDepositModal;
window.submitCounterOffer = submitCounterOffer;
window.renderLogisticsView = renderLogisticsView;
window.renderPaymentsView = renderPaymentsView;
window.renderProfileView = renderProfileView;
window.renderDirectoryView = renderDirectoryView;
