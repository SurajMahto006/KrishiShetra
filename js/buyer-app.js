/**
 * KRISHISHETRA — BUYER MODULE CONTROLLER (Step 12C)
 * Real Backend Integration for:
 * 1. Buyer Dashboard with live marketplace preview, inquiry summaries, and order counts
 * 2. Live Produce Marketplace discovery, search, filters & pagination
 * 3. Single Lot Details & Send Inquiry Modal (api.inquiries.create)
 * 4. My Inquiries with Status Filters & Real Negotiation Timeline (api.inquiries.getMine / getById / sendOffer)
 * 5. Accepted Inquiry -> Deal Confirmation / Order Creation Modal (api.orders.create)
 * 6. Real Orders Tracking & Cancellation (api.orders.getMine / cancel)
 */

let currentRoute = 'dashboard';
let currentSelectedLotId = null;
let currentSelectedOrderId = null;
let currentInquiryFilter = 'all';

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

  const displayName = (user && user.name) ? user.name : 'Buyer';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'BY';

  if (nameElem) nameElem.textContent = displayName.split(' ')[0];
  if (avatarElem) avatarElem.textContent = initials;
  if (dropName) dropName.textContent = displayName;
  if (dropPhone) dropPhone.textContent = (user && user.email) ? user.email : 'Verified Buyer';
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
  } else if (hash.includes('/lots')) {
    currentRoute = 'lots';
  } else if (hash.includes('/offers') || hash.includes('/inquiries')) {
    currentRoute = 'inquiries';
  } else if (hash.includes('/orders')) {
    currentRoute = 'orders';
  } else if (hash.includes('/logistics')) {
    currentRoute = 'logistics';
  } else if (hash.includes('/payments')) {
    currentRoute = 'payments';
  } else if (hash.includes('/profile') || hash.includes('/settings')) {
    currentRoute = 'profile';
  } else if (hash.includes('/kyc-verification')) {
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
      (currentRoute === 'lots' && r.includes('lots')) ||
      (currentRoute === 'inquiries' && (r.includes('offers') || r.includes('inquiries'))) ||
      (currentRoute === 'orders' && r.includes('orders')) ||
      (currentRoute === 'logistics' && r.includes('logistics')) ||
      (currentRoute === 'payments' && r.includes('payments')) ||
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
    case 'lots':
      renderLotsView(container);
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
// 1. BUYER DASHBOARD VIEW
// ═══════════════════════════════════════════════════════════════════════
async function renderDashboardView(container) {
  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <!-- Hero Welcome Card -->
      <div class="kl-card" style="background: linear-gradient(135deg, #12372A 0%, #1A4D3B 100%); color: #FFFFFF; border-radius: 16px; padding: 28px 32px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
        <div>
          <span style="display: inline-block; font-size: 12px; font-weight: 700; background: rgba(232, 185, 106, 0.2); color: #E8B96A; padding: 4px 10px; border-radius: 6px; margin-bottom: 8px;">
            B2B PROCUREMENT COMMAND
          </span>
          <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 6px 0; color: #F5F4ED;">
            Welcome, <span id="dash-buyer-greeting">${window.Auth?.getUser()?.name || 'Buyer'}</span> 👋
          </h1>
          <p style="font-size: 13.5px; color: rgba(245, 244, 237, 0.85); margin: 0; max-width: 600px;">
            Discover verified farm-gate produce lots, negotiate wholesale prices with farmers, and execute secure orders.
          </p>
        </div>
        <div style="display: flex; gap: 12px;">
          <a href="#/buyer/marketplace" class="btn btn--primary" style="background: #E8B96A; color: #12372A; font-weight: 700; text-decoration: none;">
            <i data-lucide="store"></i> Browse Marketplace
          </a>
        </div>
      </div>

      <!-- Key Metrics Counters -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px;" id="buyer-stats-grid">
        <div class="kl-stat-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 20px;">
          <div style="font-size: 12px; text-transform: uppercase; color: #777; font-weight: 600;">Active Marketplace Lots</div>
          <div style="font-size: 28px; font-weight: 800; color: var(--ks-evergreen); margin-top: 4px;" id="stat-active-lots">--</div>
          <div style="font-size: 12px; color: #5B9A72; margin-top: 4px;">Live from verified farms</div>
        </div>
        <div class="kl-stat-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 20px;">
          <div style="font-size: 12px; text-transform: uppercase; color: #777; font-weight: 600;">My Inquiries</div>
          <div style="font-size: 28px; font-weight: 800; color: var(--ks-evergreen); margin-top: 4px;" id="stat-total-inquiries">--</div>
          <div style="font-size: 12px; color: #777; margin-top: 4px;" id="stat-inquiries-breakdown">Loading inquiries...</div>
        </div>
        <div class="kl-stat-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 20px;">
          <div style="font-size: 12px; text-transform: uppercase; color: #777; font-weight: 600;">Active Orders</div>
          <div style="font-size: 28px; font-weight: 800; color: var(--ks-evergreen); margin-top: 4px;" id="stat-total-orders">--</div>
          <div style="font-size: 12px; color: #5B9A72; margin-top: 4px;" id="stat-orders-sub">In fulfillment pipeline</div>
        </div>
      </div>

      <!-- 2-Column Section: Live Marketplace Preview & Recent Inquiries -->
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px;" class="buyer-dash-grid">
        <!-- Column 1: Marketplace Preview -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-size: 18px; font-weight: 700; color: var(--ks-evergreen); margin: 0;">Featured Marketplace Lots</h3>
            <a href="#/buyer/marketplace" style="font-size: 13px; font-weight: 600; color: var(--ks-sage); text-decoration: none;">View All Lots →</a>
          </div>
          <div id="dash-marketplace-preview" style="display: flex; flex-direction: column; gap: 12px;">
            <div style="padding: 30px; text-align: center; color: #888;">Loading marketplace lots...</div>
          </div>
        </div>

        <!-- Column 2: Recent Inquiries -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-size: 18px; font-weight: 700; color: var(--ks-evergreen); margin: 0;">Recent Inquiries & Deals</h3>
            <a href="#/buyer/offers" style="font-size: 13px; font-weight: 600; color: var(--ks-sage); text-decoration: none;">All Inquiries →</a>
          </div>
          <div id="dash-recent-inquiries" style="display: flex; flex-direction: column; gap: 12px;">
            <div style="padding: 30px; text-align: center; color: #888;">Loading inquiries...</div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Load Real Data in Parallel
  loadDashboardData();
}

async function loadDashboardData() {
  try {
    const [lotsRes, inquiriesRes, ordersRes] = await Promise.all([
      window.api.market.getLots({ limit: 4, sortBy: 'newest' }),
      window.api.inquiries.getMine({ limit: 5 }),
      window.api.orders.getMine({ limit: 5 })
    ]);

    // 1. Render Stats
    if (lotsRes.success) {
      document.getElementById('stat-active-lots').textContent = lotsRes.count || (lotsRes.lots ? lotsRes.lots.length : 0);
    }
    if (inquiriesRes.success && Array.isArray(inquiriesRes.inquiries)) {
      const inqs = inquiriesRes.inquiries;
      document.getElementById('stat-total-inquiries').textContent = inqs.length;
      const accepted = inqs.filter(i => i.status === 'accepted').length;
      const negotiating = inqs.filter(i => i.status === 'negotiating' || i.status === 'pending').length;
      document.getElementById('stat-inquiries-breakdown').textContent = `${accepted} accepted · ${negotiating} active`;
    }
    if (ordersRes.success && Array.isArray(ordersRes.orders)) {
      const activeOrds = ordersRes.orders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered');
      document.getElementById('stat-total-orders').textContent = activeOrds.length;
    }

    // 2. Render Marketplace Preview Cards
    const marketPreview = document.getElementById('dash-marketplace-preview');
    if (marketPreview) {
      if (lotsRes.success && Array.isArray(lotsRes.lots) && lotsRes.lots.length > 0) {
        marketPreview.innerHTML = lotsRes.lots.map(lot => `
          <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 14px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-family: monospace; font-size: 11px; color: #888; font-weight: 600;">${lot.lotId}</span>
                <span style="padding: 2px 6px; border-radius: 4px; background: #E5F0E7; color: #12372A; font-size: 10.5px; font-weight: 700;">GRADE ${lot.qualityGrade || 'A'}</span>
              </div>
              <h4 style="font-size: 15px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 2px 0;">${lot.cropName} <span style="font-weight: 400; font-size: 13px; color: #666;">(${lot.variety || 'Standard'})</span></h4>
              <div style="font-size: 12px; color: #777;">${lot.quantity} ${lot.quantityUnit || 'quintal'} • ${lot.district || 'Pune'}, ${lot.state || 'Maharashtra'}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 15px; font-weight: 800; color: var(--ks-evergreen);">₹${lot.askingPrice?.toLocaleString('en-IN')}<span style="font-size: 11px; font-weight: 400;">/${lot.priceUnit || 'q'}</span></div>
              <button class="btn btn--sm btn--primary" style="margin-top: 6px;" onclick="openLotDetailModal('${lot.lotId}')">
                View & Inquire
              </button>
            </div>
          </div>
        `).join('');
      } else {
        marketPreview.innerHTML = `<div style="padding: 30px; text-align: center; color: #888; background: #FAF9F5; border-radius: 10px;">No produce lots currently listed on marketplace.</div>`;
      }
    }

    // 3. Render Recent Inquiries
    const inquiriesPreview = document.getElementById('dash-recent-inquiries');
    if (inquiriesPreview) {
      if (inquiriesRes.success && Array.isArray(inquiriesRes.inquiries) && inquiriesRes.inquiries.length > 0) {
        inquiriesPreview.innerHTML = inquiriesRes.inquiries.map(inq => {
          const s = getStatusBadge(inq.status);
          return `
            <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 14px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="font-family: monospace; font-size: 11px; color: #888;">${inq.lotId}</span>
                  <span style="padding: 2px 6px; border-radius: 4px; background: ${s.bg}; color: ${s.color}; font-size: 10.5px; font-weight: 700; text-transform: uppercase;">${s.text}</span>
                </div>
                <h4 style="font-size: 14.5px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 2px 0;">${inq.crop || 'Produce Lot'}</h4>
                <div style="font-size: 12px; color: #777;">Offered: <strong>₹${inq.offeredPrice?.toLocaleString('en-IN')}/q</strong> for ${inq.quantityRequired} quintals</div>
              </div>
              <div>
                ${inq.status === 'accepted' ? `
                  <button class="btn btn--sm btn--primary" style="background: #E8B96A; color: #12372A; font-weight: 700;" onclick="openCreateOrderModal('${inq.inquiryId}')">
                    Create Order →
                  </button>
                ` : `
                  <button class="btn btn--sm btn--secondary" onclick="openNegotiationModal('${inq.inquiryId}')">
                    Negotiate
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('');
      } else {
        inquiriesPreview.innerHTML = `
          <div style="padding: 30px; text-align: center; color: #888; background: #FAF9F5; border-radius: 10px;">
            You haven't sent any inquiries yet.<br>
            <a href="#/buyer/marketplace" class="btn btn--sm btn--primary" style="margin-top: 10px; text-decoration: none;">Browse Marketplace</a>
          </div>
        `;
      }
    }
  } catch (err) {
    console.error('[Buyer Dashboard Data Error]:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 2. MARKETPLACE VIEW
// ═══════════════════════════════════════════════════════════════════════
async function renderMarketplaceView(container) {
  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 14px;">
        <div>
          <h2 style="font-size: 22px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">Wholesale Produce Marketplace</h2>
          <p style="font-size: 13.5px; color: #666; margin: 0;">Direct farm-gate listings from verified farmers with live pricing and quantity</p>
        </div>
      </div>

      <!-- Filter Controls Bar -->
      <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <input type="text" id="market-filter-search" class="dash-form-input" placeholder="Search by crop, variety, district..." style="flex: 2; min-width: 200px;">
        <select id="market-filter-grade" class="dash-filter-select" style="flex: 1; min-width: 140px;">
          <option value="">All Quality Grades</option>
          <option value="A">Grade A (Premium)</option>
          <option value="B">Grade B (Standard)</option>
          <option value="C">Grade C</option>
        </select>
        <select id="market-filter-sort" class="dash-filter-select" style="flex: 1; min-width: 140px;">
          <option value="newest">Newest Listed</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="quantity_desc">Quantity: High to Low</option>
        </select>
        <button class="btn btn--primary" id="btn-apply-market-filter" style="padding: 10px 18px;">
          <i data-lucide="filter"></i> Filter
        </button>
      </div>

      <!-- Lots Grid -->
      <div id="buyer-marketplace-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        <div style="padding: 40px; text-align: center; color: #888; grid-column: 1 / -1;">Loading marketplace lots...</div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const searchInput = document.getElementById('market-filter-search');
  const gradeSelect = document.getElementById('market-filter-grade');
  const sortSelect = document.getElementById('market-filter-sort');
  const filterBtn = document.getElementById('btn-apply-market-filter');

  const fetchLots = async () => {
    const params = {
      limit: 24,
      sortBy: sortSelect.value
    };
    if (searchInput.value.trim()) params.crop = searchInput.value.trim();
    if (gradeSelect.value) params.qualityGrade = gradeSelect.value;

    const grid = document.getElementById('buyer-marketplace-grid');
    grid.innerHTML = `<div style="padding: 40px; text-align: center; color: #888; grid-column: 1 / -1;">Loading active lots...</div>`;

    try {
      const res = await window.api.market.getLots(params);
      if (res.success && Array.isArray(res.lots) && res.lots.length > 0) {
        grid.innerHTML = res.lots.map(lot => `
          <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 14px rgba(0,0,0,0.03);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-family: monospace; font-size: 12px; color: #888; font-weight: 600;">${lot.lotId}</span>
                <span style="padding: 3px 8px; border-radius: 6px; background: #E5F0E7; color: #12372A; font-size: 11px; font-weight: 700;">GRADE ${lot.qualityGrade || 'A'}</span>
              </div>
              <h3 style="font-size: 17px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">${lot.cropName}</h3>
              <p style="font-size: 13px; color: #666; margin: 0 0 14px 0;">${lot.variety || 'Standard Variety'} • ${lot.district || 'Pune'}, ${lot.state || 'Maharashtra'}</p>

              <div style="background: #F5F4ED; border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;">
                <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 600;">Available Stock</div>
                <div style="font-size: 16px; font-weight: 800; color: #222; margin-top: 2px;">${lot.quantity} ${lot.quantityUnit || 'quintal'}</div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; border-top: 1px solid #EEE; padding-top: 12px; margin-bottom: 14px;">
                <span style="font-size: 12px; color: #777;">Asking Price:</span>
                <span style="font-size: 18px; font-weight: 800; color: var(--ks-evergreen);">₹${lot.askingPrice?.toLocaleString('en-IN')}<span style="font-size: 11px; font-weight: 400;"> / ${lot.priceUnit || 'q'}</span></span>
              </div>

              <button class="btn btn--primary" style="width: 100%; justify-content: center;" onclick="openLotDetailModal('${lot.lotId}')">
                View Details & Send Inquiry →
              </button>
            </div>
          </div>
        `).join('');
      } else {
        grid.innerHTML = `
          <div style="padding: 48px; text-align: center; color: #888; grid-column: 1 / -1; background: #FAF9F5; border-radius: 12px;">
            <div style="font-size: 36px; margin-bottom: 10px;">🌾</div>
            <h4 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">No produce lots match your criteria</h4>
            <p style="font-size: 13px; color: #666; margin: 0;">Try adjusting your filter or search keywords.</p>
          </div>
        `;
      }
    } catch (err) {
      grid.innerHTML = `<div style="padding: 30px; text-align: center; color: #dc2626; grid-column: 1 / -1;">Failed to load marketplace lots.</div>`;
    }
  };

  filterBtn.addEventListener('click', fetchLots);
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') fetchLots(); });
  fetchLots();
}

// ═══════════════════════════════════════════════════════════════════════
// 3. LOT DETAILS MODAL & SEND INQUIRY
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
    <div class="dash-modal" style="max-width: 560px;">
      <div class="dash-modal__header">
        <div>
          <h3 style="margin: 0;">Lot Specifications</h3>
          <span style="font-family: monospace; font-size: 12px; color: var(--ks-gold); font-weight: 700;">${lotId}</span>
        </div>
        <button class="dash-modal__close" onclick="document.getElementById('buyer-lot-detail-overlay').classList.remove('active')"><i data-lucide="x"></i></button>
      </div>
      <div class="dash-modal__body-pad" id="b-lot-detail-content">
        <div style="padding: 30px; text-align: center; color: #888;">Loading specifications...</div>
      </div>
    </div>
  `;
  overlay.classList.add('active');

  try {
    const res = await window.api.market.getLot(lotId);
    if (res.success && res.lot) {
      const lot = res.lot;
      const harvestStr = lot.harvestDate ? new Date(lot.harvestDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent';

      document.getElementById('b-lot-detail-content').innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px;">
          <div style="background: #F5F4ED; padding: 12px; border-radius: 8px;">
            <div style="font-size: 11px; color: #777; text-transform: uppercase;">Crop & Variety</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen);">${lot.cropName} (${lot.variety || 'Standard'})</div>
          </div>
          <div style="background: #F5F4ED; padding: 12px; border-radius: 8px;">
            <div style="font-size: 11px; color: #777; text-transform: uppercase;">Available Stock</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen);">${lot.quantity} ${lot.quantityUnit || 'quintal'}</div>
          </div>
          <div style="background: #F5F4ED; padding: 12px; border-radius: 8px;">
            <div style="font-size: 11px; color: #777; text-transform: uppercase;">Asking Price</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen);">₹${lot.askingPrice?.toLocaleString('en-IN')} / ${lot.priceUnit || 'q'}</div>
          </div>
          <div style="background: #F5F4ED; padding: 12px; border-radius: 8px;">
            <div style="font-size: 11px; color: #777; text-transform: uppercase;">Quality Grade</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen);">Grade ${lot.qualityGrade || 'A'}</div>
          </div>
        </div>

        <div style="margin-bottom: 14px; font-size: 13px; color: #444;">
          <strong>Farm Location:</strong> ${lot.district || 'Pune'}, ${lot.state || 'Maharashtra'} (${lot.storageLocation || 'Farm Storage'})<br>
          <strong>Harvest Date:</strong> ${harvestStr}
        </div>

        ${lot.qualityNotes ? `
          <div style="margin-bottom: 18px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--ks-evergreen); margin-bottom: 4px;">Quality Notes:</div>
            <div style="background: #FAF9F5; padding: 10px; border-radius: 6px; border: 1px solid #EEE; font-size: 12.5px; color: #555;">${lot.qualityNotes}</div>
          </div>
        ` : ''}

        <div style="border-top: 1px solid #EEE; padding-top: 16px; margin-top: 16px; display: flex; gap: 10px;">
          <button class="btn btn--secondary" style="flex: 1;" onclick="document.getElementById('buyer-lot-detail-overlay').classList.remove('active')">
            Close
          </button>
          <button class="btn btn--primary" style="flex: 2; background: #E8B96A; color: #12372A; font-weight: 700;" onclick="document.getElementById('buyer-lot-detail-overlay').classList.remove('active'); openSendInquiryModal('${lot.lotId}', ${lot.askingPrice}, ${lot.quantity})">
            Send Purchase Inquiry →
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    document.getElementById('b-lot-detail-content').innerHTML = `<div style="padding: 20px; text-align: center; color: #dc2626;">Unable to load lot details.</div>`;
  }
}

function openSendInquiryModal(lotId, askingPrice, maxQty) {
  let overlay = document.getElementById('send-inquiry-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'send-inquiry-modal-overlay';
    overlay.className = 'dash-modal-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="dash-modal" style="max-width: 480px;">
      <div class="dash-modal__header">
        <div>
          <h3 style="margin: 0;">Send Purchase Inquiry</h3>
          <span style="font-family: monospace; font-size: 12px; color: var(--ks-gold); font-weight: 700;">Lot: ${lotId}</span>
        </div>
        <button class="dash-modal__close" onclick="document.getElementById('send-inquiry-modal-overlay').classList.remove('active')"><i data-lucide="x"></i></button>
      </div>
      <form class="dash-modal__form" id="send-inquiry-form" style="padding: 20px 24px;">
        <div id="inquiry-alert" style="display: none; padding: 10px; border-radius: 6px; margin-bottom: 14px; font-size: 13px;"></div>

        <div class="dash-form-row">
          <div class="dash-modal__field">
            <label for="inq-price">Offered Price (₹/quintal)</label>
            <input type="number" id="inq-price" class="dash-form-input" value="${askingPrice || ''}" min="1" required>
            <span style="font-size: 11px; color: #777;">Farmer asking: ₹${askingPrice?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div class="dash-modal__field">
            <label for="inq-qty">Quantity Required (q)</label>
            <input type="number" id="inq-qty" class="dash-form-input" value="${maxQty || ''}" min="0.1" max="${maxQty || 10000}" step="0.1" required>
            <span style="font-size: 11px; color: #777;">Max available: ${maxQty || 0} q</span>
          </div>
        </div>

        <div class="dash-modal__field">
          <label for="inq-msg">Message to Farmer (Optional)</label>
          <textarea id="inq-msg" class="dash-form-textarea" rows="3" placeholder="e.g. Ready for immediate dispatch. Need moisture certificate."></textarea>
        </div>

        <button type="submit" class="btn btn--primary dash-modal__submit" id="btn-submit-inquiry" style="width: 100%; margin-top: 14px;">
          Submit Inquiry to Farmer
        </button>
      </form>
    </div>
  `;

  overlay.classList.add('active');
  if (window.lucide) lucide.createIcons();

  overlay.querySelector('#send-inquiry-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = overlay.querySelector('#btn-submit-inquiry');
    const alertBox = overlay.querySelector('#inquiry-alert');
    alertBox.style.display = 'none';

    const offeredPrice = parseFloat(document.getElementById('inq-price').value);
    const quantityRequired = parseFloat(document.getElementById('inq-qty').value);
    const message = document.getElementById('inq-msg').value.trim();

    if (!offeredPrice || offeredPrice <= 0) {
      alertBox.style.display = 'block';
      alertBox.style.background = '#FEE2E2';
      alertBox.style.color = '#dc2626';
      alertBox.textContent = 'Please enter a valid offered price greater than 0';
      return;
    }

    if (!quantityRequired || quantityRequired <= 0) {
      alertBox.style.display = 'block';
      alertBox.style.background = '#FEE2E2';
      alertBox.style.color = '#dc2626';
      alertBox.textContent = 'Please enter a valid quantity greater than 0';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting inquiry...';

    try {
      const res = await window.api.inquiries.create({
        lotId,
        offeredPrice,
        quantityRequired,
        message
      });

      if (res.success && res.inquiry) {
        overlay.classList.remove('active');
        showInquirySentSuccess(res.inquiry);
      } else {
        alertBox.style.display = 'block';
        alertBox.style.background = '#FEE2E2';
        alertBox.style.color = '#dc2626';
        alertBox.textContent = res.message || 'Unable to submit inquiry.';
      }
    } catch (err) {
      alertBox.style.display = 'block';
      alertBox.style.background = '#FEE2E2';
      alertBox.style.color = '#dc2626';
      alertBox.textContent = 'Network error while sending inquiry.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Inquiry to Farmer';
    }
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
      <div style="width: 60px; height: 60px; border-radius: 50%; background: #E5F0E7; color: #12372A; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; margin-bottom: 14px;">
        ✓
      </div>
      <h3 style="font-size: 20px; font-weight: 700; color: #12372A; margin: 0 0 6px 0;">Inquiry Sent Successfully!</h3>
      <p style="font-size: 13.5px; color: #666; margin: 0 0 20px 0;">The farmer has received your quotation. You can track their response and counter-negotiate in My Inquiries.</p>

      <div style="background: #F5F4ED; border-radius: 10px; padding: 14px 18px; text-align: left; margin-bottom: 20px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #666;">Offered Price:</span>
          <strong>₹${inquiry.offeredPrice?.toLocaleString('en-IN')}/q</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #666;">Quantity:</span>
          <strong>${inquiry.quantityRequired} quintals</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #666;">Status:</span>
          <span style="padding: 2px 6px; border-radius: 4px; background: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 700; text-transform: uppercase;">${inquiry.status || 'PENDING'}</span>
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <a href="#/buyer/offers" class="btn btn--primary" style="flex: 1; text-decoration: none; justify-content: center;" onclick="document.getElementById('inquiry-success-overlay').classList.remove('active')">
          View My Inquiries →
        </a>
        <button class="btn btn--secondary" style="flex: 1;" onclick="document.getElementById('inquiry-success-overlay').classList.remove('active')">
          Continue Marketplace
        </button>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

// ═══════════════════════════════════════════════════════════════════════
// 4. MY INQUIRIES & NEGOTIATION TIMELINE
// ═══════════════════════════════════════════════════════════════════════
async function renderInquiriesView(container) {
  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 14px;">
        <div>
          <h2 style="font-size: 22px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">My Purchase Inquiries & Negotiations</h2>
          <p style="font-size: 13.5px; color: #666; margin: 0;">Track farmer responses, counter-offer prices, and confirm accepted deals</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;" id="inquiries-filter-bar">
        <button class="btn btn--sm btn--primary inq-filter-btn" data-status="all">All Inquiries</button>
        <button class="btn btn--sm btn--secondary inq-filter-btn" data-status="pending">Pending</button>
        <button class="btn btn--sm btn--secondary inq-filter-btn" data-status="negotiating">Negotiating</button>
        <button class="btn btn--sm btn--secondary inq-filter-btn" data-status="accepted">Accepted (Ready to Order)</button>
        <button class="btn btn--sm btn--secondary inq-filter-btn" data-status="rejected">Rejected</button>
      </div>

      <div id="buyer-inquiries-list" style="display: flex; flex-direction: column; gap: 14px;">
        <div style="padding: 40px; text-align: center; color: #888;">Loading inquiries...</div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const filterBar = document.getElementById('inquiries-filter-bar');
  filterBar.querySelectorAll('.inq-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterBar.querySelectorAll('.inq-filter-btn').forEach(b => {
        b.classList.remove('btn--primary');
        b.classList.add('btn--secondary');
      });
      btn.classList.add('btn--primary');
      btn.classList.remove('btn--secondary');
      currentInquiryFilter = btn.dataset.status;
      fetchInquiries();
    });
  });

  const fetchInquiries = async () => {
    const list = document.getElementById('buyer-inquiries-list');
    list.innerHTML = `<div style="padding: 40px; text-align: center; color: #888;">Loading inquiries...</div>`;

    const params = {};
    if (currentInquiryFilter !== 'all') params.status = currentInquiryFilter;

    try {
      const res = await window.api.inquiries.getMine(params);
      if (res.success && Array.isArray(res.inquiries) && res.inquiries.length > 0) {
        list.innerHTML = res.inquiries.map(inq => {
          const s = getStatusBadge(inq.status);
          const dateStr = inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
          return `
            <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 20px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <span style="font-family: monospace; font-size: 12px; color: #888; font-weight: 600;">Lot: ${inq.lotId}</span>
                  <span style="padding: 3px 8px; border-radius: 6px; background: ${s.bg}; color: ${s.color}; font-size: 11px; font-weight: 700; text-transform: uppercase;">${s.text}</span>
                  <span style="font-size: 12px; color: #888;">• Sent on ${dateStr}</span>
                </div>
                <h3 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">${inq.crop} <span style="font-size: 13px; font-weight: 400; color: #666;">(${inq.variety || 'Standard'})</span></h3>
                <div style="font-size: 13px; color: #555;">
                  Offered: <strong>₹${inq.offeredPrice?.toLocaleString('en-IN')}/q</strong> for <strong>${inq.quantityRequired} quintals</strong> • Farmer: <strong>${inq.farmerName || 'Verified Farm'}</strong>
                </div>
              </div>

              <div style="display: flex; gap: 8px;">
                <button class="btn btn--secondary btn--sm" onclick="openNegotiationModal('${inq.inquiryId}')">
                  View Timeline & Offers (${inq.totalOffers || 0})
                </button>
                ${inq.status === 'accepted' ? `
                  <button class="btn btn--primary btn--sm" style="background: #E8B96A; color: #12372A; font-weight: 700;" onclick="openCreateOrderModal('${inq.inquiryId}')">
                    Confirm Deal / Create Order →
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('');
      } else {
        list.innerHTML = `
          <div style="padding: 48px; text-align: center; color: #888; background: #FAF9F5; border-radius: 12px;">
            <div style="font-size: 36px; margin-bottom: 10px;">📋</div>
            <h4 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">No inquiries found</h4>
            <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">${currentInquiryFilter === 'all' ? 'You have not submitted any purchase inquiries yet.' : `No inquiries with status '${currentInquiryFilter}'.`}</p>
            <a href="#/buyer/marketplace" class="btn btn--primary btn--sm" style="text-decoration: none;">Browse Marketplace</a>
          </div>
        `;
      }
    } catch (err) {
      list.innerHTML = `<div style="padding: 30px; text-align: center; color: #dc2626;">Failed to load inquiries.</div>`;
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

  overlay.innerHTML = `
    <div class="dash-modal" style="max-width: 620px; max-height: 90vh; overflow-y: auto;">
      <div class="dash-modal__header">
        <div>
          <h3 style="margin: 0;">Inquiry Negotiation Timeline</h3>
          <span style="font-size: 12px; color: var(--ks-text-muted);" id="neg-header-subtitle">Loading inquiry details...</span>
        </div>
        <button class="dash-modal__close" onclick="document.getElementById('negotiation-modal-overlay').classList.remove('active')"><i data-lucide="x"></i></button>
      </div>
      <div class="dash-modal__body-pad" id="neg-modal-content">
        <div style="padding: 30px; text-align: center; color: #888;">Loading timeline...</div>
      </div>
    </div>
  `;
  overlay.classList.add('active');

  try {
    const res = await window.api.inquiries.getById(inquiryId);
    if (res.success && res.inquiry) {
      const inq = res.inquiry;
      const s = getStatusBadge(inq.status);
      document.getElementById('neg-header-subtitle').textContent = `Lot: ${inq.lot?.lotId || ''} • Status: ${inq.status.toUpperCase()}`;

      const content = document.getElementById('neg-modal-content');
      content.innerHTML = `
        <!-- Original Inquiry Header Summary -->
        <div style="background: #F5F4ED; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: var(--ks-evergreen); font-size: 15px;">${inq.lot?.cropName || 'Produce Lot'} (${inq.lot?.variety || 'Standard'})</strong>
            <span style="padding: 2px 8px; border-radius: 4px; background: ${s.bg}; color: ${s.color}; font-size: 11px; font-weight: 700; text-transform: uppercase;">${s.text}</span>
          </div>
          <div style="font-size: 13px; color: #555;">
            Farmer: <strong>${inq.farmer?.farmName || inq.farmer?.farmerName || 'Verified Farm'}</strong> • Asking Price: <strong>₹${inq.lot?.askingPrice?.toLocaleString('en-IN')}/q</strong>
          </div>
          <div style="font-size: 13px; color: #555; margin-top: 4px;">
            Initial Offer: <strong>₹${inq.offeredPrice?.toLocaleString('en-IN')}/q</strong> for <strong>${inq.quantityRequired} quintals</strong>
          </div>
        </div>

        <!-- Negotiation Timeline -->
        <h4 style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 12px 0;">Offer History</h4>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
          <!-- Initial offer -->
          <div style="background: #FAF9F5; border-left: 3px solid var(--ks-evergreen); padding: 10px 14px; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
              <strong style="color: var(--ks-evergreen);">YOU (Initial Inquiry)</strong>
              <span style="color: #888;">${new Date(inq.createdAt).toLocaleString('en-IN')}</span>
            </div>
            <div style="font-size: 13px;">Offered <strong>₹${inq.offeredPrice?.toLocaleString('en-IN')}/q</strong> for ${inq.quantityRequired} quintals</div>
            ${inq.message ? `<div style="font-size: 12px; color: #666; font-style: italic; margin-top: 2px;">"${inq.message}"</div>` : ''}
          </div>

          <!-- Counter Offers -->
          ${(inq.offers || []).map(offer => {
            const isBuyer = offer.senderRole === 'buyer' || String(offer.sender).includes('Buyer');
            const color = isBuyer ? 'var(--ks-evergreen)' : '#d97706';
            const senderLabel = isBuyer ? 'YOU (Counter Offer)' : 'FARMER (Counter Offer)';
            return `
              <div style="background: ${isBuyer ? '#FAF9F5' : '#FFFBEB'}; border-left: 3px solid ${color}; padding: 10px 14px; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
                  <strong style="color: ${color};">${senderLabel}</strong>
                  <span style="color: #888;">${new Date(offer.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div style="font-size: 13px;">Countered <strong>₹${offer.offeredPrice?.toLocaleString('en-IN')}/q</strong> for ${offer.quantityRequired} quintals</div>
                ${offer.message ? `<div style="font-size: 12px; color: #666; font-style: italic; margin-top: 2px;">"${offer.message}"</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Actions / Counter Form -->
        ${inq.status === 'accepted' ? `
          <div style="background: #E5F0E7; border-radius: 10px; padding: 16px; text-align: center;">
            <div style="font-size: 14px; font-weight: 700; color: #12372A; margin-bottom: 6px;">🎉 Farmer Accepted Your Quotation!</div>
            <p style="font-size: 12.5px; color: #12372A; margin: 0 0 14px 0;">Lock in this transaction and establish delivery tracking by confirming your order.</p>
            <button class="btn btn--primary" style="background: #12372A; color: #FFFFFF; font-weight: 700; width: 100%;" onclick="document.getElementById('negotiation-modal-overlay').classList.remove('active'); openCreateOrderModal('${inq.inquiryId}')">
              Confirm Deal & Create Order →
            </button>
          </div>
        ` : inq.status === 'pending' || inq.status === 'negotiating' ? `
          <div style="border-top: 1px solid #EEE; padding-top: 16px;">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 10px 0;">Send Counter Offer</h4>
            <form id="counter-offer-form">
              <div class="dash-form-row" style="display: flex; gap: 10px; margin-bottom: 10px;">
                <div class="dash-modal__field" style="flex: 1;">
                  <label for="co-price" style="font-size: 12px;">Counter Price (₹/q)</label>
                  <input type="number" id="co-price" class="dash-form-input" value="${inq.offeredPrice}" min="1" required>
                </div>
                <div class="dash-modal__field" style="flex: 1;">
                  <label for="co-qty" style="font-size: 12px;">Quantity (q)</label>
                  <input type="number" id="co-qty" class="dash-form-input" value="${inq.quantityRequired}" min="0.1" required>
                </div>
              </div>
              <div class="dash-modal__field" style="margin-bottom: 12px;">
                <input type="text" id="co-msg" class="dash-form-input" placeholder="Optional message with your counter offer">
              </div>
              <button type="submit" class="btn btn--primary btn--sm" id="btn-submit-counter" style="width: 100%;">
                Submit Counter Offer
              </button>
            </form>
          </div>
        ` : `
          <div style="padding: 12px; background: #F5F4ED; border-radius: 8px; text-align: center; font-size: 13px; color: #777;">
            This inquiry is closed (${inq.status}).
          </div>
        `}
      `;

      if (window.lucide) lucide.createIcons();

      const counterForm = document.getElementById('counter-offer-form');
      if (counterForm) {
        counterForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const submitBtn = document.getElementById('btn-submit-counter');
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';

          try {
            const sendRes = await window.api.inquiries.sendOffer(inquiryId, {
              offeredPrice: parseFloat(document.getElementById('co-price').value),
              quantityRequired: parseFloat(document.getElementById('co-qty').value),
              message: document.getElementById('co-msg').value.trim()
            });

            if (sendRes.success) {
              openNegotiationModal(inquiryId); // refresh timeline
            } else {
              alert(sendRes.message || 'Failed to submit counter offer.');
            }
          } catch (err) {
            alert('Server error while sending counter offer.');
          } finally {
            submitBtn.disabled = false;
          }
        });
      }
    }
  } catch (err) {
    document.getElementById('neg-modal-content').innerHTML = `<div style="padding: 20px; text-align: center; color: #dc2626;">Unable to load negotiation history.</div>`;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 5. ACCEPTED INQUIRY -> CREATE ORDER MODAL
// ═══════════════════════════════════════════════════════════════════════
async function openCreateOrderModal(inquiryId) {
  let overlay = document.getElementById('create-order-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'create-order-modal-overlay';
    overlay.className = 'dash-modal-overlay active';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="dash-modal" style="max-width: 540px; max-height: 90vh; overflow-y: auto;">
      <div class="dash-modal__header">
        <div>
          <h3 style="margin: 0;">Confirm Deal & Place Order</h3>
          <span style="font-size: 12px; color: var(--ks-text-muted);">Convert accepted inquiry to official procurement contract</span>
        </div>
        <button class="dash-modal__close" onclick="document.getElementById('create-order-modal-overlay').classList.remove('active')"><i data-lucide="x"></i></button>
      </div>
      <form class="dash-modal__form" id="confirm-order-form" style="padding: 20px 24px;">
        <div id="order-alert" style="display: none; padding: 10px; border-radius: 6px; margin-bottom: 14px; font-size: 13px;"></div>

        <!-- Order Summary Card -->
        <div id="order-summary-box" style="background: #F5F4ED; border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 13px;">
          Loading deal terms...
        </div>

        <h4 style="font-size: 13.5px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 10px 0;">Delivery Address Details</h4>
        <div class="dash-form-row">
          <div class="dash-modal__field" style="flex: 1;">
            <label for="ord-name">Recipient Name</label>
            <input type="text" id="ord-name" class="dash-form-input" value="${window.Auth?.getUser()?.name || ''}" required>
          </div>
          <div class="dash-modal__field" style="flex: 1;">
            <label for="ord-phone">Phone Number (10 digits)</label>
            <input type="tel" id="ord-phone" class="dash-form-input" value="${window.Auth?.getUser()?.phone || '9876543210'}" maxlength="10" pattern="[6-9][0-9]{9}" required>
          </div>
        </div>

        <div class="dash-modal__field">
          <label for="ord-address">Warehouse / Address Line 1</label>
          <input type="text" id="ord-address" class="dash-form-input" placeholder="e.g. Warehouse 4B, APMC Market Yard" required>
        </div>

        <div class="dash-form-row">
          <div class="dash-modal__field">
            <label for="ord-city">City / Village</label>
            <input type="text" id="ord-city" class="dash-form-input" value="Pune" required>
          </div>
          <div class="dash-modal__field">
            <label for="ord-state">State</label>
            <input type="text" id="ord-state" class="dash-form-input" value="Maharashtra" required>
          </div>
          <div class="dash-modal__field">
            <label for="ord-pin">Pincode (6 digits)</label>
            <input type="text" id="ord-pin" class="dash-form-input" value="411001" maxlength="6" pattern="[1-9][0-9]{5}" required>
          </div>
        </div>

        <div class="dash-modal__field" style="margin-top: 10px;">
          <label for="ord-payment">Payment Method</label>
          <select id="ord-payment" class="dash-filter-select">
            <option value="cod">Escrow Bank Guarantee / COD</option>
            <option value="online">Instant UPI / NetBanking</option>
            <option value="offline">Bank Transfer (NEFT/RTGS)</option>
          </select>
        </div>

        <button type="submit" class="btn btn--primary dash-modal__submit" id="btn-submit-order" style="width: 100%; margin-top: 18px; background: #12372A; color: #FFFFFF; font-weight: 700;">
          Place Confirmed Order
        </button>
      </form>
    </div>
  `;

  overlay.classList.add('active');
  if (window.lucide) lucide.createIcons();

  // Fetch inquiry deal terms
  try {
    const res = await window.api.inquiries.getById(inquiryId);
    if (res.success && res.inquiry) {
      const inq = res.inquiry;
      const total = (inq.offeredPrice || 0) * (inq.quantityRequired || 0);
      document.getElementById('order-summary-box').innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Crop:</span>
          <strong>${inq.lot?.cropName || 'Produce Lot'} (${inq.lot?.variety || 'Standard'})</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Agreed Price:</span>
          <strong>₹${inq.offeredPrice?.toLocaleString('en-IN')}/quintal</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Quantity:</span>
          <strong>${inq.quantityRequired} quintals</strong>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px dashed #CCC; padding-top: 6px; margin-top: 6px; font-size: 14px;">
          <strong style="color: var(--ks-evergreen);">Total Order Value:</strong>
          <strong style="color: var(--ks-evergreen);">₹${total.toLocaleString('en-IN')}</strong>
        </div>
      `;

      // Form submission
      const form = document.getElementById('confirm-order-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-submit-order');
        const alertBox = document.getElementById('order-alert');
        alertBox.style.display = 'none';

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating official order...';

        const payload = {
          inquiryId: inq.inquiryId,
          quantity: inq.quantityRequired,
          deliveryAddress: {
            name: document.getElementById('ord-name').value.trim(),
            phone: document.getElementById('ord-phone').value.trim(),
            addressLine1: document.getElementById('ord-address').value.trim(),
            village: document.getElementById('ord-city').value.trim(),
            state: document.getElementById('ord-state').value.trim(),
            pincode: document.getElementById('ord-pin').value.trim()
          },
          paymentMethod: document.getElementById('ord-payment').value,
          notes: 'Standard B2B procurement contract'
        };

        try {
          const ordRes = await window.api.orders.create(payload);
          if (ordRes.success && ordRes.order) {
            overlay.classList.remove('active');
            showOrderCreatedSuccess(ordRes.order);
          } else {
            alertBox.style.display = 'block';
            alertBox.style.background = '#FEE2E2';
            alertBox.style.color = '#dc2626';
            alertBox.textContent = ordRes.message || 'Failed to place order.';
          }
        } catch (err) {
          alertBox.style.display = 'block';
          alertBox.style.background = '#FEE2E2';
          alertBox.style.color = '#dc2626';
          alertBox.textContent = 'Server connection error.';
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Place Confirmed Order';
        }
      });
    }
  } catch (err) {
    document.getElementById('order-summary-box').textContent = 'Unable to fetch deal terms.';
  }
}

function showOrderCreatedSuccess(order) {
  let overlay = document.getElementById('order-success-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'order-success-overlay';
    overlay.className = 'dash-modal-overlay active';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="dash-modal" style="max-width: 480px; text-align: center; padding: 32px 24px;">
      <div style="width: 64px; height: 64px; border-radius: 50%; background: #E5F0E7; color: #12372A; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 14px;">
        🎉
      </div>
      <h3 style="font-size: 22px; font-weight: 700; color: #12372A; margin: 0 0 6px 0;">Order Created Successfully!</h3>
      <p style="font-size: 13.5px; color: #666; margin: 0 0 20px 0;">Your procurement contract is now locked and entered into the order fulfillment pipeline.</p>

      <div style="background: #F5F4ED; border-radius: 10px; padding: 16px 18px; text-align: left; margin-bottom: 20px; font-size: 13.5px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #DDD; padding-bottom: 8px; margin-bottom: 8px;">
          <span style="color: #666; font-size: 12px; text-transform: uppercase;">Order ID:</span>
          <strong style="font-family: monospace; color: #12372A; font-size: 14px;">${order.orderId}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #666;">Crop & Quantity:</span>
          <strong>${order.cropName} (${order.quantity} ${order.quantityUnit || 'q'})</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #666;">Total Value:</span>
          <strong style="color: var(--ks-evergreen);">₹${order.totalAmount?.toLocaleString('en-IN')}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #666;">Status:</span>
          <span style="padding: 2px 6px; border-radius: 4px; background: #DBEAFE; color: #1E40AF; font-size: 11px; font-weight: 700; text-transform: uppercase;">${order.status || 'PENDING'}</span>
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <a href="#/buyer/orders" class="btn btn--primary" style="flex: 1; text-decoration: none; justify-content: center;" onclick="document.getElementById('order-success-overlay').classList.remove('active')">
          View My Orders →
        </a>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

// ═══════════════════════════════════════════════════════════════════════
// 6. MY ORDERS VIEW
// ═══════════════════════════════════════════════════════════════════════
async function renderOrdersView(container) {
  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 22px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">My Orders & Procurement Pipeline</h2>
        <p style="font-size: 13.5px; color: #666; margin: 0;">Track order status, delivery progress, and payment settlements</p>
      </div>

      <div id="buyer-orders-list" style="display: flex; flex-direction: column; gap: 14px;">
        <div style="padding: 40px; text-align: center; color: #888;">Loading orders...</div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const list = document.getElementById('buyer-orders-list');
  try {
    const res = await window.api.orders.getMine();
    if (res.success && Array.isArray(res.orders) && res.orders.length > 0) {
      list.innerHTML = res.orders.map(ord => {
        const dateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
        const s = getOrderStatusBadge(ord.status);
        return `
          <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 20px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="font-family: monospace; font-size: 12px; color: #888; font-weight: 700;">${ord.orderId}</span>
                <span style="padding: 3px 8px; border-radius: 6px; background: ${s.bg}; color: ${s.color}; font-size: 11px; font-weight: 700; text-transform: uppercase;">${s.text}</span>
                <span style="font-size: 12px; color: #888;">• ${dateStr}</span>
              </div>
              <h3 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">${ord.cropName} <span style="font-size: 13px; font-weight: 400; color: #666;">(${ord.variety || 'Standard'})</span></h3>
              <div style="font-size: 13px; color: #555;">
                <strong>${ord.quantity} ${ord.quantityUnit || 'q'}</strong> @ ₹${ord.agreedPrice?.toLocaleString('en-IN')}/q • Total: <strong style="color: var(--ks-evergreen);">₹${ord.totalAmount?.toLocaleString('en-IN')}</strong> • Farmer: <strong>${ord.farmerName || 'Verified Farm'}</strong>
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              ${ord.status === 'pending' || ord.status === 'confirmed' ? `
                <button class="btn btn--sm" style="background: rgba(220, 38, 38, 0.08); color: #dc2626; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;" onclick="cancelBuyerOrder('${ord.orderId}')">
                  Cancel Order
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    } else {
      list.innerHTML = `
        <div style="padding: 48px; text-align: center; color: #888; background: #FAF9F5; border-radius: 12px;">
          <div style="font-size: 36px; margin-bottom: 10px;">📦</div>
          <h4 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">No active orders yet</h4>
          <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">When a farmer accepts your purchase inquiry, you can confirm the deal here.</p>
          <a href="#/buyer/marketplace" class="btn btn--primary btn--sm" style="text-decoration: none;">Browse Marketplace</a>
        </div>
      `;
    }
  } catch (err) {
    list.innerHTML = `<div style="padding: 30px; text-align: center; color: #dc2626;">Failed to load orders.</div>`;
  }
}

async function cancelBuyerOrder(orderId) {
  if (!confirm(`Are you sure you want to cancel order ${orderId}? This will release the reserved lot stock.`)) return;

  try {
    const res = await window.api.orders.cancel(orderId);
    if (res.success) {
      alert(`Order ${orderId} cancelled successfully.`);
      renderOrdersView(document.getElementById('buyer-page-content'));
    } else {
      alert(res.message || 'Unable to cancel order.');
    }
  } catch (err) {
    alert('Server error while cancelling order.');
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 7. BUYER LOTS VIEW (Watchlist & Saved Produce)
// ═══════════════════════════════════════════════════════════════════════
async function renderLotsView(container) {
  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 style="font-size: 22px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">My Saved Lots & Watchlist</h1>
          <p style="font-size: 13.5px; color: #666; margin: 0;">Monitor premium farm-gate lots you have bookmarked for procurement.</p>
        </div>
        <a href="#/buyer/marketplace" class="btn btn--primary btn--sm" style="text-decoration: none;">
          <i data-lucide="store"></i> Explore Produce
        </a>
      </div>

      <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 24px;">
        <div id="buyer-saved-lots-container">
          <div style="text-align: center; padding: 36px; color: #777;">
            <div style="font-size: 32px; margin-bottom: 8px;">📑</div>
            <h4 style="font-size: 15px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">No saved lots currently</h4>
            <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">Bookmark produce lots in the marketplace to monitor real-time availability and prices.</p>
            <a href="#/buyer/marketplace" class="btn btn--secondary btn--sm" style="text-decoration: none;">Browse Available Produce</a>
          </div>
        </div>
      </div>
    </div>
  `;
  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
}

// ═══════════════════════════════════════════════════════════════════════
// 8. LOGISTICS TRACKING VIEW
// ═══════════════════════════════════════════════════════════════════════
async function renderLogisticsView(container) {
  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 style="font-size: 22px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">Logistics & Fleet Dispatch</h1>
          <p style="font-size: 13.5px; color: #666; margin: 0;">Real-time shipment transit status and delivery schedules for confirmed procurement orders.</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <a href="#/buyer/orders" class="btn btn--secondary btn--sm" style="text-decoration: none;"><i data-lucide="package"></i> View Orders</a>
        </div>
      </div>

      <div id="buyer-logistics-content">
        <div style="padding: 40px; text-align: center; color: #888;">Loading logistics status...</div>
      </div>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();

  const contentEl = document.getElementById('buyer-logistics-content');
  try {
    const res = await window.api?.orders?.getMine?.();
    const orders = (res && res.success && Array.isArray(res.orders)) ? res.orders : [];
    const activeShipments = orders.filter(o => ['confirmed', 'processing', 'ready_for_pickup', 'in_transit'].includes(o.status));

    if (activeShipments.length > 0) {
      contentEl.innerHTML = `
        <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 24px;">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 16px 0;">Active Order Dispatches (${activeShipments.length})</h3>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
              <thead>
                <tr style="border-bottom: 2px solid #E5E4DD; text-align: left; color: #777; font-size: 12px; text-transform: uppercase;">
                  <th style="padding: 10px 12px;">Order ID</th>
                  <th style="padding: 10px 12px;">Produce & Quantity</th>
                  <th style="padding: 10px 12px;">Farmer / Origin</th>
                  <th style="padding: 10px 12px;">Destination</th>
                  <th style="padding: 10px 12px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${activeShipments.map(ord => {
                  const s = getOrderStatusBadge(ord.status);
                  const dest = ord.deliveryAddress ? `${ord.deliveryAddress.village || ''}, ${ord.deliveryAddress.state || ''}` : 'Pending Confirmation';
                  return `
                    <tr style="border-bottom: 1px solid #F0EFEA;">
                      <td style="padding: 12px; font-weight: 700; color: var(--ks-evergreen); font-family: monospace;">${ord.orderId}</td>
                      <td style="padding: 12px;">${ord.cropName} (${ord.quantity} ${ord.quantityUnit || 'q'})</td>
                      <td style="padding: 12px;">${ord.farmerName || 'Verified Farm'}</td>
                      <td style="padding: 12px;">${dest}</td>
                      <td style="padding: 12px;"><span style="background: ${s.bg}; color: ${s.color}; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px;">${s.text}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      contentEl.innerHTML = `
        <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 48px 24px; text-align: center;">
          <div style="font-size: 36px; margin-bottom: 12px;">🚛</div>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">No Active Shipments in Transit</h3>
          <p style="font-size: 13px; color: #666; max-width: 440px; margin: 0 auto 16px auto;">
            When your purchase orders are confirmed with farmers, vehicle allocation and shipment dispatch updates will appear here.
          </p>
          <a href="#/buyer/marketplace" class="btn btn--primary btn--sm" style="text-decoration: none;">Browse Available Produce</a>
        </div>
      `;
    }
  } catch (e) {
    contentEl.innerHTML = `
      <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 36px; text-align: center; color: #666;">
        <p>No active logistics records found for this account.</p>
      </div>
    `;
  }

  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
}

// ═══════════════════════════════════════════════════════════════════════
// 9. ESCROW & PAYMENTS VIEW
// ═══════════════════════════════════════════════════════════════════════
async function renderPaymentsView(container) {
  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 style="font-size: 22px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">Escrow & Settlement Ledger</h1>
          <p style="font-size: 13.5px; color: #666; margin: 0;">Secured B2B smart contract escrow accounts for zero-risk produce procurement.</p>
        </div>
      </div>

      <div id="buyer-payments-content">
        <div style="padding: 40px; text-align: center; color: #888;">Loading ledger...</div>
      </div>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();

  const contentEl = document.getElementById('buyer-payments-content');
  try {
    const res = await window.api?.orders?.getMine?.();
    const orders = (res && res.success && Array.isArray(res.orders)) ? res.orders : [];

    let lockedAmount = 0;
    let settledAmount = 0;

    orders.forEach(o => {
      const amt = Number(o.totalAmount) || 0;
      if (['pending', 'confirmed', 'processing', 'in_transit'].includes(o.status)) {
        lockedAmount += amt;
      } else if (o.status === 'delivered') {
        settledAmount += amt;
      }
    });

    if (orders.length > 0) {
      contentEl.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div class="kl-stat-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 20px;">
            <div style="font-size: 12px; text-transform: uppercase; color: #777; font-weight: 600;">Locked in Escrow</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--ks-evergreen); margin-top: 4px;">₹${lockedAmount.toLocaleString('en-IN')}</div>
            <div style="font-size: 12px; color: #5B9A72; margin-top: 4px;">For active procurement orders</div>
          </div>
          <div class="kl-stat-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 20px;">
            <div style="font-size: 12px; text-transform: uppercase; color: #777; font-weight: 600;">Total Settled</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--ks-evergreen); margin-top: 4px;">₹${settledAmount.toLocaleString('en-IN')}</div>
            <div style="font-size: 12px; color: #5B9A72; margin-top: 4px;">Completed transactions</div>
          </div>
        </div>

        <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 24px;">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 16px 0;">Order Settlement Ledger</h3>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
              <thead>
                <tr style="border-bottom: 2px solid #E5E4DD; text-align: left; color: #777; font-size: 12px; text-transform: uppercase;">
                  <th style="padding: 10px 12px;">Order ID</th>
                  <th style="padding: 10px 12px;">Amount</th>
                  <th style="padding: 10px 12px;">Farmer / Beneficiary</th>
                  <th style="padding: 10px 12px;">Payment Method</th>
                  <th style="padding: 10px 12px;">Escrow Status</th>
                </tr>
              </thead>
              <tbody>
                ${orders.map(ord => {
                  const s = getOrderStatusBadge(ord.status);
                  const isLocked = ['pending', 'confirmed', 'processing', 'in_transit'].includes(ord.status);
                  return `
                    <tr style="border-bottom: 1px solid #F0EFEA;">
                      <td style="padding: 12px; font-family: monospace; font-weight: 700;">${ord.orderId}</td>
                      <td style="padding: 12px; font-weight: 700; color: var(--ks-evergreen);">₹${(ord.totalAmount || 0).toLocaleString('en-IN')}</td>
                      <td style="padding: 12px;">${ord.farmerName || 'Verified Farm'}</td>
                      <td style="padding: 12px; text-transform: capitalize;">${ord.paymentMethod || 'Escrow'}</td>
                      <td style="padding: 12px;">
                        <span style="background: ${isLocked ? '#FEF3C7' : '#D1FAE5'}; color: ${isLocked ? '#92400E' : '#065F46'}; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px;">
                          ${isLocked ? 'Funds Locked (Escrow)' : 'Settled / Released'}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      contentEl.innerHTML = `
        <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 48px 24px; text-align: center;">
          <div style="font-size: 36px; margin-bottom: 12px;">💳</div>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">No Active Escrow Settlements</h3>
          <p style="font-size: 13px; color: #666; max-width: 440px; margin: 0 auto 16px auto;">
            Funds are locked into secure bank-grade escrow when you place confirmed wholesale orders with farmers.
          </p>
          <a href="#/buyer/marketplace" class="btn btn--primary btn--sm" style="text-decoration: none;">Explore Produce Marketplace</a>
        </div>
      `;
    }
  } catch (e) {
    contentEl.innerHTML = `
      <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 36px; text-align: center; color: #666;">
        <p>No escrow transaction records found.</p>
      </div>
    `;
  }

  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
}

// ═══════════════════════════════════════════════════════════════════════
// 10. BUSINESS PROFILE VIEW
// ═══════════════════════════════════════════════════════════════════════
function renderProfileView(container) {
  const user = window.Auth ? window.Auth.getUser() : null;
  const userName = user?.name || 'Verified Institutional Buyer';
  const userEmail = user?.email || 'buyer@krishishetra.in';

  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px; max-width: 800px; margin: 0 auto;">
      <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 16px; padding: 28px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px; flex-wrap: wrap;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--ks-evergreen); color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800;">
            ${userName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 style="font-size: 20px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">${userName}</h2>
            <div style="font-size: 13.5px; color: #666; margin-bottom: 6px;">${userEmail} · Institutional Procurement</div>
            <span style="background: #E5F0E7; color: #12372A; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px;">
              ✓ KYC Verified B2B Account
            </span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div style="background: #FAF9F5; padding: 16px; border-radius: 10px;">
            <div style="font-size: 11.5px; text-transform: uppercase; color: #777; font-weight: 600;">Entity Type</div>
            <div style="font-size: 14.5px; font-weight: 700; color: var(--ks-evergreen); margin-top: 4px;">Private Limited / FMCG Processor</div>
          </div>
          <div style="background: #FAF9F5; padding: 16px; border-radius: 10px;">
            <div style="font-size: 11.5px; text-transform: uppercase; color: #777; font-weight: 600;">Primary Mandi Delivery Hub</div>
            <div style="font-size: 14.5px; font-weight: 700; color: var(--ks-evergreen); margin-top: 4px;">Vashi APMC / Pune Central</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E5E4DD; padding-top: 20px; flex-wrap: wrap; gap: 12px;">
          <a href="#/buyer/dashboard" class="btn btn--secondary btn--sm" style="text-decoration: none;">Back to Command</a>
          <button class="btn btn--danger btn--sm" style="background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; font-weight: 700; cursor: pointer;" onclick="if (window.Auth && window.Auth.logout) { window.Auth.logout(); } else { localStorage.clear(); window.location.href='login.html'; }">
            <i data-lucide="log-out"></i> Log Out of KrishiShetra
          </button>
        </div>
      </div>
    </div>
  `;
  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
}

// ═══════════════════════════════════════════════════════════════════════
// 11. KYC PLACEHOLDER
// ═══════════════════════════════════════════════════════════════════════
function renderKycView(container) {
  container.innerHTML = `
    <div class="buyer-view" style="padding-top: 24px;">
      <div class="kl-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 14px; padding: 28px; max-width: 600px; margin: 0 auto; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 12px;">🛡️</div>
        <h2 style="font-size: 20px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 8px 0;">Buyer Business Verification</h2>
        <p style="font-size: 13.5px; color: #666; line-height: 1.5; margin: 0 0 20px 0;">Your business profile is active and verified for marketplace bidding and direct farm procurement.</p>
        <div style="background: #E5F0E7; color: #12372A; padding: 10px 14px; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;">
          ✓ Verified Institutional Procurement Account
        </div>
      </div>
    </div>
  `;
  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
}

// ═══════════════════════════════════════════════════════════════════════
// 12. HELPERS & BADGES
// ═══════════════════════════════════════════════════════════════════════
function getStatusBadge(status) {
  const map = {
    pending: { bg: '#FEF3C7', color: '#92400E', text: 'Pending' },
    negotiating: { bg: '#E0E7FF', color: '#3730A3', text: 'Negotiating' },
    accepted: { bg: '#E5F0E7', color: '#12372A', text: 'Accepted' },
    rejected: { bg: '#FEE2E2', color: '#991B1B', text: 'Rejected' },
    completed: { bg: '#DBEAFE', color: '#1E40AF', text: 'Completed' }
  };
  return map[status] || map.pending;
}

function getOrderStatusBadge(status) {
  const map = {
    pending: { bg: '#FEF3C7', color: '#92400E', text: 'Pending' },
    confirmed: { bg: '#E5F0E7', color: '#12372A', text: 'Confirmed' },
    processing: { bg: '#E0E7FF', color: '#3730A3', text: 'Processing' },
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
window.cancelBuyerOrder = cancelBuyerOrder;
window.renderLotsView = renderLotsView;
window.renderLogisticsView = renderLogisticsView;
window.renderPaymentsView = renderPaymentsView;
window.renderProfileView = renderProfileView;


