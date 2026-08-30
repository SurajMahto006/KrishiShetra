/**
 * KRISHILINK — BUYER MODULE APPLICATION v2.0
 * Production-Grade SPA Router, View Renderers, Modal/Toast System,
 * KYC Wizard, Offer Negotiation, Logistics Map, and Animations.
 */

// ═══════════════════════════════════════════════
// 1. STATE & INITIALIZATION
// ═══════════════════════════════════════════════
let currentRoute = 'dashboard';
let currentSelectedLotId = 'lot-101';
let currentSelectedOrderId = 'ord-10245';
let activeMapInstance = null;
let kycCurrentStep = 0;

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('hashchange', handleRouteUpdate);
  initSearchDropdown();
  initNotificationPanel();
  handleRouteUpdate();
});

// ═══════════════════════════════════════════════
// 2. ROUTER
// ═══════════════════════════════════════════════
function handleRouteUpdate() {
  const hash = window.location.hash.replace('#', '') || '/buyer/dashboard';

  if (hash.includes('/kyc-verification')) currentRoute = 'kyc';
  else if (hash.includes('/marketplace')) currentRoute = 'marketplace';
  else if (hash.includes('/lots/')) { currentRoute = 'lot-detail'; const p = hash.split('/lots/'); if (p[1]) currentSelectedLotId = p[1]; }
  else if (hash.includes('/lots')) currentRoute = 'lots';
  else if (hash.includes('/offers')) currentRoute = 'offers';
  else if (hash.includes('/orders/')) { currentRoute = 'order-detail'; const p = hash.split('/orders/'); if (p[1]) currentSelectedOrderId = p[1]; }
  else if (hash.includes('/orders')) currentRoute = 'orders';
  else if (hash.includes('/logistics')) currentRoute = 'logistics';
  else if (hash.includes('/payments')) currentRoute = 'payments';
  else if (hash.includes('/profile')) currentRoute = 'profile';
  else currentRoute = 'dashboard';

  // Update active top nav links
  document.querySelectorAll('.dash-header__link').forEach(el => {
    el.classList.remove('dash-header__link--active');
    const r = el.getAttribute('data-route') || '';
    const match = (currentRoute === 'lot-detail' && r.includes('lots')) ||
                  (currentRoute === 'order-detail' && r.includes('orders')) ||
                  r.includes(currentRoute);
    if (match) el.classList.add('dash-header__link--active');
  });

  renderView(currentRoute);
}

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

// Close profile dropdown when clicking outside
document.addEventListener('click', (e) => {
  const wrap = document.getElementById('dash-profile-wrap');
  if (wrap && !wrap.contains(e.target)) {
    closeProfileDropdown();
  }
});

// Keyboard shortcut Ctrl+K
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('global-buyer-search');
    if (searchInput) searchInput.focus();
  }
});

function renderView(route) {
  const c = document.getElementById('buyer-page-content');
  if (!c) return;
  if (activeMapInstance) { activeMapInstance.remove(); activeMapInstance = null; }

  const renderers = {
    'kyc': renderKycView,
    'dashboard': renderDashboardView,
    'marketplace': renderMarketplaceView,
    'lot-detail': () => renderLotDetailView(currentSelectedLotId),
    'lots': renderMyLotsView,
    'offers': renderOffersView,
    'orders': renderOrdersView,
    'order-detail': () => renderOrderDetailView(currentSelectedOrderId),
    'logistics': renderLogisticsView,
    'payments': renderPaymentsView,
    'profile': renderProfileView
  };

  c.innerHTML = (renderers[route] || renderDashboardView)();
  if (window.lucide) lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Post-render hooks
  if (route === 'dashboard') animateCountUps();
  if (route === 'logistics') setTimeout(initLogisticsMap, 150);
}

// ═══════════════════════════════════════════════
// 3. UTILITY SYSTEMS (Modal, Toast, CountUp)
// ═══════════════════════════════════════════════
function showModal(title, bodyHtml, footerHtml = '') {
  document.getElementById('kl-modal-title').textContent = title;
  document.getElementById('kl-modal-body').innerHTML = bodyHtml;
  document.getElementById('kl-modal-footer').innerHTML = footerHtml;
  document.getElementById('kl-modal-overlay').classList.add('is-open');
  if (window.lucide) lucide.createIcons();
}
function closeModal() { document.getElementById('kl-modal-overlay').classList.remove('is-open'); }
function closeModalOnBackdrop(e) { if (e.target.id === 'kl-modal-overlay') closeModal(); }

function showToast(message, type = 'success') {
  const container = document.getElementById('kl-toast-container');
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `kl-toast kl-toast--${type}`;
  toast.innerHTML = `<span class="kl-toast__icon">${icons[type] || '✓'}</span><span class="kl-toast__msg">${message}</span><button class="kl-toast__close" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('kl-toast--exiting'); setTimeout(() => toast.remove(), 300); }, 4000);
}

function animateCountUps() {
  document.querySelectorAll('[data-countup]').forEach(el => {
    const target = parseInt(el.getAttribute('data-countup'));
    if (isNaN(target)) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      el.textContent = current;
    }, 30);
  });
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('buyer-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('is-open');
  overlay.style.display = sidebar.classList.contains('is-open') ? 'block' : 'none';
}

function initSearchDropdown() {
  const input = document.getElementById('global-buyer-search');
  const panel = document.getElementById('kl-search-results');
  if (!input || !panel) return;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    const results = searchService.search(q);
    if (results.length === 0) { panel.classList.remove('is-open'); return; }
    const grouped = {};
    results.forEach(r => { if (!grouped[r.type]) grouped[r.type] = []; grouped[r.type].push(r); });
    const typeLabels = { crop: 'Crops', location: 'Locations', seller: 'Sellers' };
    let html = '';
    Object.keys(grouped).forEach(type => {
      html += `<div class="kl-search-results__group-title">${typeLabels[type] || type}</div>`;
      grouped[type].forEach(item => {
        html += `<a href="${item.route}" class="kl-search-results__item" onclick="document.getElementById('kl-search-results').classList.remove('is-open')">
          <span class="kl-search-results__item-icon"><i data-lucide="${item.iconName || 'leaf'}"></i></span>${item.label}</a>`;
      });
    });
    panel.innerHTML = html;
    panel.classList.add('is-open');
    if (window.lucide) lucide.createIcons();
  });
  input.addEventListener('blur', () => setTimeout(() => panel.classList.remove('is-open'), 200));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { panel.classList.remove('is-open'); window.location.hash = '/buyer/marketplace'; } });
}

function initNotificationPanel() {
  const btn = document.getElementById('btn-notifications');
  const panel = document.getElementById('kl-notification-panel');
  if (!btn || !panel) return;

  btn.addEventListener('click', () => {
    const isOpen = panel.classList.contains('is-open');
    if (isOpen) { panel.classList.remove('is-open'); return; }
    const notifications = notificationService.getNotifications();
    const typeClass = { lot: 'lot', offer: 'offer', order: 'order' };
    panel.innerHTML = `
      <div class="kl-notification-panel__header">
        <span class="kl-notification-panel__title">Notifications (${notifications.length})</span>
        <button class="kl-notification-panel__clear" onclick="this.closest('.kl-notification-panel').classList.remove('is-open')">Close</button>
      </div>
      ${notifications.map(n => `
        <div class="kl-notification-item">
          <div class="kl-notification-item__icon kl-notification-item__icon--${typeClass[n.type] || 'lot'}"><i data-lucide="${n.iconName || 'sprout'}"></i></div>
          <div class="kl-notification-item__body">
            <div class="kl-notification-item__text">${n.text}</div>
            <div class="kl-notification-item__time">${n.time}</div>
          </div>
        </div>
      `).join('')}`;
    panel.classList.add('is-open');
    if (window.lucide) lucide.createIcons();
  });
  document.addEventListener('click', e => { if (!btn.contains(e.target) && !panel.contains(e.target)) panel.classList.remove('is-open'); });
}

function fmt(n) { return n.toLocaleString('en-IN'); }

// ═══════════════════════════════════════════════
// 4. KYC VIEW
// ═══════════════════════════════════════════════
function renderKycView() {
  const p = buyerService.getProfile();
  const steps = ['Business', 'Identity', 'Documents', 'Bank', 'Review'];
  const activeStep = 2; // Document Upload step (0-indexed)

  return `<div class="buyer-view">
    <div class="kl-kyc-layout">
      <div class="kl-kyc-visual">
        <div class="kl-kyc-visual__content">
          <h1 class="kl-kyc-visual__title">Verify Your Business to Start Sourcing</h1>
          <p class="kl-kyc-visual__subtitle">Complete KYC verification to access verified agricultural lots, escrow contracts, and procurement tools.</p>
          <div class="kl-kyc-visual__features">
            <div class="kl-kyc-visual__feature"><span class="kl-kyc-visual__feature-icon"><i data-lucide="shield-check"></i></span> Secure escrow payment protection</div>
            <div class="kl-kyc-visual__feature"><span class="kl-kyc-visual__feature-icon"><i data-lucide="check-circle-2"></i></span> Access verified FPO & farmer lots</div>
            <div class="kl-kyc-visual__feature"><span class="kl-kyc-visual__feature-icon"><i data-lucide="trending-up"></i></span> AI-powered price intelligence</div>
            <div class="kl-kyc-visual__feature"><span class="kl-kyc-visual__feature-icon"><i data-lucide="truck"></i></span> GPS logistics tracking</div>
          </div>
        </div>
      </div>

      <div class="kl-kyc-form-panel">
        <div class="kl-kyc-steps">
          ${steps.map((s, i) => `
            <div class="kl-kyc-step ${i < activeStep ? 'kl-kyc-step--done' : ''} ${i === activeStep ? 'kl-kyc-step--active' : ''}">
              <div class="kl-kyc-step__number">${i < activeStep ? '✓' : i + 1}</div>
              <div class="kl-kyc-step__label">${s}</div>
            </div>
          `).join('')}
        </div>

        <h2 style="font-size:20px; font-weight:700; margin-bottom:4px;">Upload Business Documents</h2>
        <p class="kl-text-sm kl-text-muted kl-mb-lg">Provide your business registration and GST certification for verification.</p>

        <form onsubmit="handleKycSubmit(event)">
          <div class="kl-form-grid kl-form-grid--2 kl-mb-lg">
            <div class="kl-form-group">
              <label class="kl-label kl-label--required">Business Entity Name</label>
              <input type="text" class="kl-input" value="${p.companyName}" required>
            </div>
            <div class="kl-form-group">
              <label class="kl-label kl-label--required">GSTIN</label>
              <input type="text" class="kl-input" value="${p.gstin}" required>
            </div>
            <div class="kl-form-group">
              <label class="kl-label kl-label--required">PAN Number</label>
              <input type="text" class="kl-input" value="${p.pan}" required>
            </div>
            <div class="kl-form-group">
              <label class="kl-label kl-label--required">Bank Account (Escrow)</label>
              <input type="text" class="kl-input" value="${p.bankDetails.accountNumber}" required>
            </div>
          </div>

          <div class="kl-file-upload kl-mb-lg">
            <div class="kl-file-upload__icon"><i data-lucide="upload-cloud"></i></div>
            <div class="kl-file-upload__title">Upload Business Registration & GST Certificate</div>
            <div class="kl-file-upload__sub">Drag and drop PDF/JPG files (Max 10MB each)</div>
            <button type="button" class="kl-btn kl-btn--secondary kl-btn--sm kl-mt-md">Select Files</button>
          </div>

          <div class="kl-flex kl-flex-between kl-flex-center">
            <span class="kl-text-xs kl-text-muted"><i data-lucide="shield-check" style="width:13px;height:13px;vertical-align:middle;"></i> Prototype Verification Mode</span>
            <button type="submit" class="kl-btn kl-btn--primary">Submit Verification <i data-lucide="arrow-right"></i></button>
          </div>
        </form>
      </div>
    </div>
  </div>`;
}

function handleKycSubmit(e) {
  e.preventDefault();
  buyerService.submitKyc({});
  showToast('KYC submitted successfully! Prototype verification approved.', 'success');
  setTimeout(() => { window.location.hash = '/buyer/dashboard'; }, 800);
}

// ═══════════════════════════════════════════════
// 5. DASHBOARD VIEW
// ═══════════════════════════════════════════════
function renderDashboardView() {
  const p = buyerService.getProfile();
  const s = marketService.getDashboardStats();
  const req = p.sourcingRequirements;
  const snap = marketService.getMarketSnapshot();

  return `<div class="buyer-view">
    <div class="kl-page-header">
      <div class="kl-page-header__row">
        <div>
          <div class="kl-page-header__eyebrow">Procurer Dashboard</div>
          <h1 class="kl-page-header__title">Good morning, ${p.companyName}</h1>
        </div>
        <div class="kl-page-header__actions">
          <span class="kl-badge kl-badge--verified"><i data-lucide="check-circle-2" style="width:12px;height:12px;"></i> KYC Verified</span>
          <a href="#/buyer/marketplace" class="kl-btn kl-btn--primary"><i data-lucide="search"></i> Source Produce</a>
        </div>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="kl-kpi-grid">
      <div class="kl-kpi-card">
        <div class="kl-kpi-card__top">Active Requirements <i data-lucide="list-checks"></i></div>
        <div class="kl-kpi-card__val" data-countup="${s.activeRequirements}">0</div>
        <div class="kl-kpi-card__sub">Across 4 States</div>
      </div>
      <div class="kl-kpi-card">
        <div class="kl-kpi-card__top">Matching Lots <i data-lucide="package-search"></i></div>
        <div class="kl-kpi-card__val" data-countup="${s.newMatchingLots}">0</div>
        <div class="kl-kpi-card__sub">94% AI Match Score</div>
      </div>
      <div class="kl-kpi-card">
        <div class="kl-kpi-card__top">Offers Pending <i data-lucide="message-square"></i></div>
        <div class="kl-kpi-card__val" data-countup="${s.offersPending}">0</div>
        <div class="kl-kpi-card__sub">Active Negotiations</div>
      </div>
      <div class="kl-kpi-card">
        <div class="kl-kpi-card__top">Active Orders <i data-lucide="truck"></i></div>
        <div class="kl-kpi-card__val" data-countup="${s.activeOrders}">0</div>
        <div class="kl-kpi-card__sub">In Transit / Confirmed</div>
      </div>
      <div class="kl-kpi-card">
        <div class="kl-kpi-card__top">Monthly Volume <i data-lucide="wallet"></i></div>
        <div class="kl-kpi-card__val">${s.monthlyProcurement}</div>
        <div class="kl-kpi-card__sub">Aug 2026</div>
      </div>
    </div>

    <!-- Procurement Intelligence Card -->
    <div class="kl-procurement-card">
      <div class="kl-procurement-card__inner">
        <div class="kl-procurement-card__row">
          <div>
            <span class="kl-procurement-card__eyebrow">YOUR CURRENT SOURCING REQUIREMENT</span>
            <h2 class="kl-procurement-card__title">${req.crop} (${req.grade})</h2>
            <p class="kl-procurement-card__meta">Target Volume: <strong>${req.minQty}–${req.maxQty} ${req.unit}</strong> &nbsp;|&nbsp; Target Price: <strong>₹${fmt(req.targetPriceMin)}–₹${fmt(req.targetPriceMax)}/Q</strong> &nbsp;|&nbsp; Region: <strong>${req.preferredRegion}</strong></p>
          </div>
          <a href="#/buyer/marketplace" class="kl-btn kl-btn--lg" style="background:#FFF;color:var(--kl-evergreen);border:none;white-space:nowrap;">Explore ${s.newMatchingLots} Matched Lots <i data-lucide="arrow-right"></i></a>
        </div>
        <div class="kl-procurement-card__ai">
          <span><i data-lucide="sparkles" style="width:15px;height:15px;color:var(--kl-amber);vertical-align:middle;margin-right:4px;"></i></span>
          <span><strong>AI Intelligence:</strong> 12 lots currently match your exact requirements in Nashik APMC with Grade A moisture certification. Prices trending up 8.2% this week.</span>
        </div>
      </div>
    </div>

    <!-- Market Snapshot -->
    <div class="kl-table-wrap">
      <div class="kl-table-wrap__header">
        <span class="kl-table-wrap__title">Live Produce Market Snapshot</span>
        <a href="#/buyer/marketplace" class="kl-btn kl-btn--ghost kl-btn--sm">View Full Marketplace →</a>
      </div>
      <table class="kl-table">
        <thead><tr><th>Produce</th><th>Current Price</th><th>Weekly Trend</th><th>Demand</th><th>Lots</th><th></th></tr></thead>
        <tbody>
          ${snap.map(item => `<tr>
            <td><strong>${item.crop} (${item.grade})</strong></td>
            <td><strong>${item.price}</strong></td>
            <td><span style="color:${item.trendUp ? 'var(--kl-mint)' : 'var(--kl-terracotta)'};font-weight:700;">${item.trend}</span></td>
            <td><span class="kl-badge ${item.demand === 'High Demand' ? 'kl-badge--verified' : 'kl-badge--neutral'}">${item.demand}</span></td>
            <td>${item.lots} Lots</td>
            <td><a href="#/buyer/marketplace" class="kl-btn kl-btn--secondary kl-btn--sm">View</a></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════
// 6. MARKETPLACE VIEW
// ═══════════════════════════════════════════════
function renderMarketplaceView() {
  const lots = marketService.getMarketplaceLots();
  return `<div class="buyer-view">
    <div class="kl-page-header">
      <h1 class="kl-page-header__title">B2B Agricultural Sourcing Marketplace</h1>
      <p class="kl-page-header__subtitle">Discover verified FPO and farmer produce lots with AI-powered price matching and quality analytics</p>
    </div>

    <div class="kl-marketplace-layout">
      <!-- Filters -->
      <div class="kl-filter-panel">
        <div class="kl-filter-panel__header">
          <span class="kl-filter-panel__title"><i data-lucide="filter" style="width:14px;height:14px;"></i> Filters</span>
          <button class="kl-filter-panel__clear" onclick="resetMarketplaceFilters()">Clear All</button>
        </div>
        <div class="kl-filter-group">
          <label class="kl-filter-group__label">Crop</label>
          <select id="mkt-filter-crop" class="kl-select" onchange="applyMarketplaceFilters()">
            <option value="all">All Crops</option>
            <option value="onion">Onion</option><option value="wheat">Wheat</option>
            <option value="soybean">Soybean</option><option value="rice">Rice</option>
            <option value="potato">Potato</option><option value="tomato">Tomato</option>
            <option value="cotton">Cotton</option><option value="chilli">Chilli</option>
          </select>
        </div>
        <div class="kl-filter-group">
          <label class="kl-filter-group__label">Quality Grade</label>
          <select id="mkt-filter-grade" class="kl-select" onchange="applyMarketplaceFilters()">
            <option value="all">All Grades</option>
            <option value="grade a">Grade A</option>
            <option value="export">Export Grade</option>
          </select>
        </div>
        <div class="kl-filter-group">
          <label class="kl-filter-group__label">Seller Verification</label>
          <select class="kl-select"><option>Verified Only</option><option>All Sellers</option></select>
        </div>
        <div class="kl-filter-group">
          <label class="kl-filter-group__label">Max Distance</label>
          <select class="kl-select"><option>Any Distance</option><option>Within 50 km</option><option>Within 100 km</option><option>Within 500 km</option></select>
        </div>
        <button class="kl-btn kl-btn--primary kl-btn--full kl-mt-md" onclick="applyMarketplaceFilters()">Apply Filters</button>
      </div>

      <!-- Lot Grid -->
      <div class="kl-lot-grid" id="marketplace-lots-grid">
        ${renderLotCards(lots)}
      </div>
    </div>
  </div>`;
}

function renderLotCards(lots) {
  if (!lots.length) return `<div class="kl-empty-state" style="grid-column:1/-1;">
    <div class="kl-empty-state__icon"><i data-lucide="package-open" style="width:48px;height:48px;color:var(--kl-muted);"></i></div>
    <h3 class="kl-empty-state__title">No matching lots found</h3>
    <p class="kl-empty-state__text">Try adjusting your filters or expanding the search radius to discover more produce lots.</p>
    <button class="kl-btn kl-btn--secondary" onclick="resetMarketplaceFilters()">Clear Filters</button>
  </div>`;

  return lots.map(l => `
    <div class="kl-lot-card">
      <div class="kl-lot-card__image">
        <img src="${l.image}" alt="${l.crop}" loading="lazy">
        <span class="kl-lot-card__match-badge"><span class="kl-badge kl-badge--verified">${l.aiMatchPct}% AI Match</span></span>
      </div>
      <div class="kl-lot-card__body">
        <div class="kl-lot-card__header-row">
          <span class="kl-lot-card__crop">${l.crop}</span>
          <span class="kl-lot-card__price">₹${fmt(l.sellerAskPrice)}/Q</span>
        </div>
        <div class="kl-lot-card__variety">${l.variety} · ${l.grade} · ${l.quantity} ${l.unit}</div>
        <div class="kl-lot-card__details">
          <div class="kl-lot-card__detail"><span class="kl-lot-card__detail-icon"><i data-lucide="map-pin" style="width:13px;height:13px;color:var(--kl-mint);"></i></span> ${l.location} (${l.distanceKm} km)</div>
          <div class="kl-lot-card__detail"><span class="kl-lot-card__detail-icon"><i data-lucide="building-2" style="width:13px;height:13px;color:var(--kl-slate);"></i></span> ${l.sellerName} <span class="kl-text-mint kl-fw-700">✓</span></div>
          <div class="kl-lot-card__detail"><span class="kl-lot-card__detail-icon"><i data-lucide="shield-check" style="width:13px;height:13px;color:var(--kl-amber);"></i></span> Trust Score: <strong>${l.sellerTrustScore}/100</strong></div>
        </div>
        <div class="kl-lot-card__footer">
          <a href="#/buyer/lots/${l.id}" class="kl-btn kl-btn--primary kl-btn--full">View Lot & Make Offer</a>
        </div>
      </div>
    </div>
  `).join('');
}

function resetMarketplaceFilters() {
  const crop = document.getElementById('mkt-filter-crop');
  const grade = document.getElementById('mkt-filter-grade');
  if (crop) crop.value = 'all';
  if (grade) grade.value = 'all';
  applyMarketplaceFilters();
}

function applyMarketplaceFilters() {
  const crop = document.getElementById('mkt-filter-crop')?.value || 'all';
  const grade = document.getElementById('mkt-filter-grade')?.value || 'all';
  const lots = marketService.getMarketplaceLots({ crop, grade });
  const grid = document.getElementById('marketplace-lots-grid');
  if (grid) { grid.innerHTML = renderLotCards(lots); if (window.lucide) lucide.createIcons(); }
}

// ═══════════════════════════════════════════════
// 7. LOT DETAIL VIEW
// ═══════════════════════════════════════════════
function renderLotDetailView(lotId) {
  const l = lotService.getLotById(lotId);
  const landed = lotService.calculateLandedCost(l);
  const tb = l.trustBreakdown;
  const priceDiff = (((l.sellerAskPrice - l.marketRefPrice) / l.marketRefPrice) * 100).toFixed(1);

  return `<div class="buyer-view">
    <a href="#/buyer/marketplace" class="kl-btn kl-btn--ghost kl-mb-md" style="padding-left:0;"><i data-lucide="arrow-left" style="width:14px;height:14px;"></i> Back to Marketplace</a>

    <div class="kl-lot-detail-layout">
      <!-- Left Column -->
      <div>
        <!-- Hero -->
        <div class="kl-card kl-mb-lg">
          <div class="kl-card__body">
            <div class="kl-lot-hero">
              <div class="kl-lot-hero__image"><img src="${l.image}" alt="${l.crop}"></div>
              <div class="kl-lot-hero__info">
                <div class="kl-flex kl-flex-between kl-flex-center kl-mb-sm">
                  <h1 class="kl-lot-hero__title">${l.crop} (${l.variety})</h1>
                  <span class="kl-badge kl-badge--verified"><i data-lucide="shield-check" style="width:12px;height:12px;"></i> Verified Seller</span>
                </div>
                <p class="kl-lot-hero__meta">Lot ID: <strong>${l.id}</strong> &nbsp;|&nbsp; Mandi: <strong>${l.mandi}</strong> &nbsp;|&nbsp; Available: <strong>${l.quantity} ${l.unit}</strong></p>
                <div class="kl-price-pair">
                  <div class="kl-price-box"><div class="kl-price-box__label">Seller Ask</div><div class="kl-price-box__value">₹${fmt(l.sellerAskPrice)}/Q</div></div>
                  <div class="kl-price-box kl-price-box--muted"><div class="kl-price-box__label">Market Ref</div><div class="kl-price-box__value">₹${fmt(l.marketRefPrice)}/Q</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Price Intelligence -->
        <div class="kl-card kl-mb-lg">
          <div class="kl-card__header"><span class="kl-card__header-title"><i data-lucide="trending-up" style="width:15px;height:15px;vertical-align:middle;margin-right:6px;color:var(--kl-mint);"></i> Price Intelligence</span></div>
          <div class="kl-card__body">
            <p class="kl-text-sm kl-text-muted kl-mb-md">Seller price is <strong style="color:${priceDiff > 0 ? 'var(--kl-terracotta)' : 'var(--kl-mint)'};">${priceDiff > 0 ? '+' : ''}${priceDiff}%</strong> ${priceDiff > 0 ? 'above' : 'below'} the current market reference price.</p>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
              <span class="kl-text-xs kl-fw-700" style="width:50px;">₹${fmt(l.marketRangeMin)}</span>
              <div style="flex:1;height:8px;background:var(--kl-border-subtle);border-radius:4px;position:relative;overflow:visible;">
                <div style="position:absolute;left:${((l.marketRefPrice - l.marketRangeMin) / (l.marketRangeMax - l.marketRangeMin)) * 100}%;top:-4px;width:3px;height:16px;background:var(--kl-muted);border-radius:2px;" title="Market Ref"></div>
                <div style="position:absolute;left:${((l.sellerAskPrice - l.marketRangeMin) / (l.marketRangeMax - l.marketRangeMin)) * 100}%;top:-6px;width:12px;height:20px;background:var(--kl-mint);border-radius:3px;opacity:0.8;" title="Seller Ask"></div>
              </div>
              <span class="kl-text-xs kl-fw-700" style="width:50px;text-align:right;">₹${fmt(l.marketRangeMax)}</span>
            </div>
            <div class="kl-flex kl-gap-lg kl-text-sm">
              <span>Market Range: <strong>₹${fmt(l.marketRangeMin)}–₹${fmt(l.marketRangeMax)}/Q</strong></span>
            </div>
          </div>
        </div>

        <!-- Quality Analytics -->
        <div class="kl-card kl-mb-lg">
          <div class="kl-card__header"><span class="kl-card__header-title"><i data-lucide="sparkles" style="width:15px;height:15px;vertical-align:middle;margin-right:6px;color:var(--kl-mint);"></i> Quality & AI Grading</span><span class="kl-badge kl-badge--verified">AI Confidence: ${l.qualityMetrics.aiConfidencePct}%</span></div>
          <div class="kl-card__body">
            <div class="kl-quality-grid">
              <div><div class="kl-quality-item__label">Moisture</div><div class="kl-quality-item__value">${l.qualityMetrics.moisturePct}</div></div>
              <div><div class="kl-quality-item__label">Size / Spec</div><div class="kl-quality-item__value">${l.qualityMetrics.sizeMm}</div></div>
              <div><div class="kl-quality-item__label">Defect Rate</div><div class="kl-quality-item__value">${l.qualityMetrics.defectsPct}</div></div>
              <div><div class="kl-quality-item__label">Grade</div><div class="kl-quality-item__value kl-quality-item__value--highlight">${l.grade}</div></div>
            </div>
            <p class="kl-text-xs kl-text-muted kl-mt-md"><i data-lucide="info" style="width:12px;height:12px;vertical-align:middle;"></i> AI-assisted quality estimate. Actual grading confirmed at delivery inspection.</p>
          </div>
        </div>

        <!-- Seller Trust Score -->
        <div class="kl-card kl-mb-lg">
          <div class="kl-card__header"><span class="kl-card__header-title"><i data-lucide="shield-check" style="width:15px;height:15px;vertical-align:middle;margin-right:6px;color:var(--kl-mint);"></i> Seller Trust Score</span></div>
          <div class="kl-card__body">
            <div class="kl-trust-score">
              <div class="kl-trust-score__circle" style="--score:${l.sellerTrustScore}">
                <div class="kl-trust-score__circle-inner">${l.sellerTrustScore}</div>
              </div>
              <div class="kl-trust-score__breakdown">
                <div class="kl-trust-bar"><span class="kl-trust-bar__label">Verification</span><div class="kl-trust-bar__track"><div class="kl-trust-bar__fill" style="width:${tb.verification}%"></div></div></div>
                <div class="kl-trust-bar"><span class="kl-trust-bar__label">Payment Reliability</span><div class="kl-trust-bar__track"><div class="kl-trust-bar__fill" style="width:${tb.paymentReliability}%"></div></div></div>
                <div class="kl-trust-bar"><span class="kl-trust-bar__label">Order Completion</span><div class="kl-trust-bar__track"><div class="kl-trust-bar__fill" style="width:${tb.orderCompletion}%"></div></div></div>
                <div class="kl-trust-bar"><span class="kl-trust-bar__label">Transaction History</span><div class="kl-trust-bar__track"><div class="kl-trust-bar__fill" style="width:${tb.transactionHistory}%"></div></div></div>
              </div>
            </div>
            <div class="kl-flex kl-gap-lg kl-mt-md kl-text-sm kl-text-muted">
              <span><i data-lucide="clipboard-check" style="width:13px;height:13px;vertical-align:middle;"></i> ${l.sellerCompletedOrders} orders completed</span>
              <span><i data-lucide="alert-circle" style="width:13px;height:13px;vertical-align:middle;"></i> Dispute rate: ${l.disputeRate}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Landed Cost -->
      <div>
        <div class="kl-card kl-landed-cost">
          <div class="kl-card__header"><span class="kl-card__header-title"><i data-lucide="calculator" style="width:15px;height:15px;vertical-align:middle;margin-right:6px;color:var(--kl-mint);"></i> Landed Cost Calculator</span></div>
          <div class="kl-card__body">
            <div class="kl-landed-cost__row"><span>Produce Cost (${l.quantity} Q × ₹${fmt(l.sellerAskPrice)})</span><strong>₹${fmt(landed.productCost)}</strong></div>
            <div class="kl-landed-cost__row"><span>Freight (${l.distanceKm} km)</span><strong>₹${fmt(landed.transportCost)}</strong></div>
            <div class="kl-landed-cost__row"><span>APMC Mandi Cess</span><strong>₹${fmt(landed.mandiCess)}</strong></div>
            <hr class="kl-landed-cost__divider">
            <div class="kl-landed-cost__row"><span><strong>Grand Total</strong></span><strong>₹${fmt(landed.grandTotal)}</strong></div>
            <div class="kl-landed-cost__total">
              <span class="kl-landed-cost__total-label">Effective Cost/Q</span>
              <span class="kl-landed-cost__total-value">₹${fmt(landed.effectiveCostPerQ)}/Q</span>
            </div>
            <button class="kl-btn kl-btn--primary kl-btn--full kl-btn--lg kl-mt-lg" onclick="openMakeOfferModal('${l.id}')"><i data-lucide="sparkles" style="width:15px;height:15px;"></i> Make Procurement Offer</button>
            <button class="kl-btn kl-btn--secondary kl-btn--full kl-mt-sm"><i data-lucide="bookmark" style="width:14px;height:14px;"></i> Add to Watchlist</button>
          </div>
        </div>

        <!-- Logistics Estimate -->
        <div class="kl-card kl-mt-lg">
          <div class="kl-card__header"><span class="kl-card__header-title"><i data-lucide="truck" style="width:15px;height:15px;vertical-align:middle;margin-right:6px;color:var(--kl-mint);"></i> Logistics Estimate</span></div>
          <div class="kl-card__body">
            <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="map-pin" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Distance: <strong>${l.distanceKm} km</strong></span></div>
            <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="credit-card" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Est. Transport: <strong>₹${fmt(l.estimatedTransportTotal)}</strong></span></div>
            <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="clock" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Est. Delivery: <strong>${l.distanceKm < 50 ? '2–3 hours' : l.distanceKm < 200 ? '4–6 hours' : '1–2 days'}</strong></span></div>
            <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="package" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Buyer Pickup: <strong>Available</strong></span></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function openMakeOfferModal(lotId) {
  const l = lotService.getLotById(lotId);
  showModal('Make Procurement Offer', `
    <p class="kl-text-sm kl-text-muted kl-mb-md">Submit a digital procurement bid for <strong>${l.emoji} ${l.crop} (${l.quantity} ${l.unit})</strong> from <strong>${l.sellerName}</strong></p>
    <div class="kl-form-group">
      <label class="kl-label kl-label--required">Your Offer Price per Quintal (₹)</label>
      <input type="number" id="modal-offer-price" class="kl-input" value="${l.sellerAskPrice - 50}" min="1" required>
      <p class="kl-text-xs kl-text-muted kl-mt-sm">Seller Ask: ₹${fmt(l.sellerAskPrice)}/Q &nbsp;|&nbsp; Market Ref: ₹${fmt(l.marketRefPrice)}/Q</p>
    </div>
    <div class="kl-form-group">
      <label class="kl-label">Note (optional)</label>
      <textarea id="modal-offer-note" class="kl-textarea" placeholder="Add any procurement requirements or terms..."></textarea>
    </div>
  `, `
    <button class="kl-btn kl-btn--secondary" onclick="closeModal()">Cancel</button>
    <button class="kl-btn kl-btn--primary" onclick="submitOfferFromModal('${l.id}')">Submit Offer <i data-lucide="send"></i></button>
  `);
}

function submitOfferFromModal(lotId) {
  const price = document.getElementById('modal-offer-price')?.value;
  const note = document.getElementById('modal-offer-note')?.value || '';
  if (!price) return;
  offerService.createOffer(lotId, price, note || 'Digital procurement bid via KrishiLink');
  closeModal();
  showToast(`Offer of ₹${fmt(parseFloat(price))}/Q submitted successfully!`, 'success');
  setTimeout(() => { window.location.hash = '/buyer/offers'; }, 600);
}

// ═══════════════════════════════════════════════
// 8. MY LOTS VIEW
// ═══════════════════════════════════════════════
function renderMyLotsView() {
  const lots = marketService.getMarketplaceLots();
  return `<div class="buyer-view">
    <div class="kl-page-header">
      <h1 class="kl-page-header__title">My Saved & Sourced Lots</h1>
      <p class="kl-page-header__subtitle">Lots you have shortlisted, negotiated, or purchased</p>
    </div>
    <div class="kl-tabs">
      <button class="kl-tab active" onclick="filterMyLots(this, 'all')">All (${lots.length})</button>
      <button class="kl-tab" onclick="filterMyLots(this, 'saved')">Saved (${lots.length})</button>
      <button class="kl-tab" onclick="filterMyLots(this, 'negotiating')">Negotiating (2)</button>
      <button class="kl-tab" onclick="filterMyLots(this, 'purchased')">Purchased (1)</button>
    </div>
    <div class="kl-lot-grid" id="my-lots-grid">
      ${renderLotCards(lots)}
    </div>
  </div>`;
}

function filterMyLots(btn, filter) {
  document.querySelectorAll('.kl-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  // In production, filter by status — for demo, show all lots
  const lots = marketService.getMarketplaceLots();
  const grid = document.getElementById('my-lots-grid');
  if (grid) { grid.innerHTML = renderLotCards(lots); if (window.lucide) lucide.createIcons(); }
}

// ═══════════════════════════════════════════════
// 9. OFFERS VIEW
// ═══════════════════════════════════════════════
function renderOffersView() {
  const offers = offerService.getOffers();
  const statusCounts = { NEGOTIATING: 0, ACCEPTED: 0, REJECTED: 0 };
  offers.forEach(o => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });

  return `<div class="buyer-view">
    <div class="kl-page-header">
      <h1 class="kl-page-header__title">Digital Offer Negotiations</h1>
      <p class="kl-page-header__subtitle">Manage procurement bids, counter-offers, and negotiation status</p>
    </div>
    <div class="kl-tabs">
      <button class="kl-tab active" onclick="filterOffers(this, 'all')">All (${offers.length})</button>
      <button class="kl-tab" onclick="filterOffers(this, 'NEGOTIATING')">Negotiating (${statusCounts.NEGOTIATING})</button>
      <button class="kl-tab" onclick="filterOffers(this, 'ACCEPTED')">Accepted (${statusCounts.ACCEPTED})</button>
      <button class="kl-tab" onclick="filterOffers(this, 'REJECTED')">Rejected (${statusCounts.REJECTED})</button>
    </div>
    <div class="kl-flex kl-flex-col kl-gap-md" id="offers-list">
      ${renderOfferCards(offers)}
    </div>
  </div>`;
}

function renderOfferCards(offers) {
  if (!offers.length) return `<div class="kl-empty-state"><div class="kl-empty-state__icon">💬</div><h3 class="kl-empty-state__title">No offers yet</h3><p class="kl-empty-state__text">Browse the marketplace to discover produce lots and submit your first procurement bid.</p><a href="#/buyer/marketplace" class="kl-btn kl-btn--primary">Explore Marketplace</a></div>`;

  const badgeMap = { NEGOTIATING: 'kl-badge--pending', ACCEPTED: 'kl-badge--verified', REJECTED: 'kl-badge--rejected' };

  return offers.map(o => `
    <div class="kl-offer-card">
      <div class="kl-offer-card__header">
        <div>
          <span class="kl-badge ${badgeMap[o.status] || 'kl-badge--neutral'} kl-mb-sm">${o.status}</span>
          <h3 class="kl-offer-card__crop">${o.crop} (${o.quantity} Quintals)</h3>
          <p class="kl-offer-card__meta">Seller: <strong>${o.sellerName}</strong> &nbsp;|&nbsp; Updated: ${o.updatedAt}</p>
        </div>
      </div>
      <div class="kl-offer-card__prices">
        <div class="kl-offer-card__price-col"><div class="kl-offer-card__price-label">Your Offer</div><div class="kl-offer-card__price-val kl-offer-card__price-val--buyer">₹${fmt(o.currentBuyerOffer)}/Q</div></div>
        <div class="kl-offer-card__price-col"><div class="kl-offer-card__price-label">Seller Ask</div><div class="kl-offer-card__price-val kl-offer-card__price-val--seller">₹${fmt(o.sellerAsk)}/Q</div></div>
      </div>
      <!-- Negotiation History -->
      <div class="kl-negotiation-timeline">
        ${o.history.map(h => `
          <div class="kl-negotiation-msg">
            <div class="kl-negotiation-msg__party kl-negotiation-msg__party--${h.party.toLowerCase()}">${h.party}</div>
            <div class="kl-negotiation-msg__content">
              ${h.price > 0 ? `<div class="kl-negotiation-msg__price">₹${fmt(h.price)}/Q</div>` : ''}
              <div class="kl-negotiation-msg__note">${h.note}</div>
            </div>
          </div>
        `).join('')}
      </div>
      ${o.status === 'NEGOTIATING' ? `
        <div class="kl-offer-card__actions">
          <button class="kl-btn kl-btn--danger kl-btn--sm" onclick="withdrawOffer('${o.id}')">Withdraw</button>
          <button class="kl-btn kl-btn--secondary kl-btn--sm" onclick="counterOffer('${o.id}')">Counter Offer</button>
          <button class="kl-btn kl-btn--primary kl-btn--sm" onclick="acceptOffer('${o.id}')">Accept (₹${fmt(o.currentBuyerOffer)}/Q)</button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function filterOffers(btn, status) {
  document.querySelectorAll('.kl-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const offers = offerService.getOffers(status);
  const list = document.getElementById('offers-list');
  if (list) { list.innerHTML = renderOfferCards(offers); if (window.lucide) lucide.createIcons(); }
}

function acceptOffer(offerId) {
  const res = offerService.acceptOffer(offerId);
  if (res) {
    showToast(`Offer Accepted! Order ${res.order.id} created. Escrow reserved.`, 'success');
    setTimeout(() => { window.location.hash = '/buyer/orders'; }, 800);
  }
}

function withdrawOffer(offerId) {
  showModal('Withdraw Offer', '<p class="kl-text-sm">Are you sure you want to withdraw this procurement bid? This action cannot be undone.</p>',
    `<button class="kl-btn kl-btn--secondary" onclick="closeModal()">Cancel</button>
     <button class="kl-btn kl-btn--danger" onclick="closeModal(); showToast('Offer withdrawn.', 'info');">Confirm Withdraw</button>`);
}

function counterOffer(offerId) {
  const offer = INITIAL_OFFERS_DATA.find(o => o.id === offerId);
  if (!offer) return;
  showModal('Submit Counter Offer', `
    <p class="kl-text-sm kl-text-muted kl-mb-md">Current seller ask: <strong>₹${fmt(offer.sellerAsk)}/Q</strong></p>
    <div class="kl-form-group">
      <label class="kl-label kl-label--required">Your Counter Price (₹/Q)</label>
      <input type="number" id="counter-price" class="kl-input" value="${offer.currentBuyerOffer + 10}" min="1">
    </div>
  `, `<button class="kl-btn kl-btn--secondary" onclick="closeModal()">Cancel</button>
     <button class="kl-btn kl-btn--primary" onclick="submitCounter('${offerId}')">Submit Counter</button>`);
}

function submitCounter(offerId) {
  const price = document.getElementById('counter-price')?.value;
  if (!price) return;
  const offer = INITIAL_OFFERS_DATA.find(o => o.id === offerId);
  if (offer) {
    offer.currentBuyerOffer = parseFloat(price);
    offer.history.push({ party: 'Buyer', price: parseFloat(price), note: 'Counter offer submitted' });
    offer.updatedAt = 'Just now';
  }
  closeModal();
  showToast(`Counter offer of ₹${fmt(parseFloat(price))}/Q submitted.`, 'success');
  renderView('offers');
}

// ═══════════════════════════════════════════════
// 10. ORDERS VIEW
// ═══════════════════════════════════════════════
function renderOrdersView() {
  const orders = orderService.getOrders();
  const badgeMap = { CONFIRMED: 'kl-badge--pending', IN_TRANSIT: 'kl-badge--transit', DELIVERED: 'kl-badge--completed' };

  return `<div class="buyer-view">
    <div class="kl-page-header">
      <h1 class="kl-page-header__title">Procurement Orders & Shipments</h1>
      <p class="kl-page-header__subtitle">Track all agricultural procurement orders from confirmation to delivery</p>
    </div>
    <div class="kl-flex kl-flex-col kl-gap-md">
      ${orders.map(o => `
        <div class="kl-card">
          <div class="kl-card__body">
            <div class="kl-flex kl-flex-between kl-flex-center kl-mb-md" style="flex-wrap:wrap;gap:12px;">
              <div>
                <span class="kl-badge ${badgeMap[o.status] || 'kl-badge--neutral'} kl-mb-sm">${o.id} · ${o.status.replace('_', ' ')}</span>
                <h3 style="font-size:18px;font-weight:700;">${o.crop} — ${o.variety} (${o.quantity} Q)</h3>
                <p class="kl-text-sm kl-text-muted">Seller: <strong>${o.sellerName}</strong> &nbsp;|&nbsp; Ordered: ${o.orderedAt}</p>
              </div>
              <div style="text-align:right;">
                <div class="kl-text-xs kl-text-muted">Grand Total</div>
                <div style="font-size:20px;font-weight:800;color:var(--kl-evergreen);">₹${fmt(o.grandTotal)}</div>
              </div>
            </div>

            <!-- Compact Timeline -->
            <div class="kl-order-timeline">
              ${o.timeline.map(t => `
                <div class="kl-timeline-step ${t.done ? 'kl-timeline-step--done' : 'kl-timeline-step--pending'} ${t.active ? 'kl-timeline-step--active' : ''}">
                  <div class="kl-timeline-step__dot"></div>
                  <div class="kl-timeline-step__title">${t.label}</div>
                  <div class="kl-timeline-step__meta">${t.time} — ${t.party}</div>
                </div>
              `).join('')}
            </div>

            <div class="kl-flex kl-gap-sm kl-mt-lg" style="justify-content:flex-end;flex-wrap:wrap;">
              ${o.status === 'IN_TRANSIT' ? `<a href="#/buyer/logistics" class="kl-btn kl-btn--secondary kl-btn--sm"><i data-lucide="map-pin"></i> Track Shipment</a>` : ''}
              <a href="#/buyer/payments" class="kl-btn kl-btn--primary kl-btn--sm"><i data-lucide="credit-card"></i> Payment Details</a>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════
// 11. ORDER DETAIL VIEW
// ═══════════════════════════════════════════════
function renderOrderDetailView(orderId) {
  const o = orderService.getOrderById(orderId);
  return `<div class="buyer-view">
    <a href="#/buyer/orders" class="kl-btn kl-btn--ghost kl-mb-md" style="padding-left:0;"><i data-lucide="arrow-left" style="width:14px;height:14px;"></i> Back to Orders</a>
    <div class="kl-page-header"><h1 class="kl-page-header__title">Order ${o.id}</h1></div>
    <div class="kl-card">
      <div class="kl-card__body">
        <h3 style="font-size:18px;font-weight:700;margin-bottom:16px;">${o.crop} — ${o.quantity} Quintals</h3>
        <div class="kl-order-timeline">
          ${o.timeline.map(t => `
            <div class="kl-timeline-step ${t.done ? 'kl-timeline-step--done' : 'kl-timeline-step--pending'} ${t.active ? 'kl-timeline-step--active' : ''}">
              <div class="kl-timeline-step__dot"></div>
              <div class="kl-timeline-step__title">${t.label}</div>
              <div class="kl-timeline-step__meta">${t.time} — ${t.party}</div>
            </div>
          `).join('')}
        </div>
        <div class="kl-flex kl-gap-sm kl-mt-lg" style="justify-content:flex-end;">
          ${o.status === 'IN_TRANSIT' ? `<a href="#/buyer/logistics" class="kl-btn kl-btn--primary kl-btn--sm"><i data-lucide="map-pin"></i> Track Logistics</a>` : ''}
          <a href="#/buyer/payments" class="kl-btn kl-btn--secondary kl-btn--sm"><i data-lucide="credit-card"></i> Payment</a>
        </div>
      </div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════
// 12. LOGISTICS VIEW
// ═══════════════════════════════════════════════
function renderLogisticsView() {
  const tracking = logisticsService.getTrackingInfo('ord-10245');
  return `<div class="buyer-view">
    <div class="kl-page-header">
      <h1 class="kl-page-header__title">Live GPS Logistics Tracking</h1>
      <p class="kl-page-header__subtitle">Real-time shipment tracking for active procurement orders</p>
    </div>
    <div class="kl-logistics-layout">
      <div class="kl-logistics-map" id="buyer-logistics-map"></div>
      <div class="kl-logistics-panel">
        <div class="kl-logistics-info-card">
          <div class="kl-logistics-info-card__title"><i data-lucide="truck" style="width:15px;height:15px;"></i> Shipment Status</div>
          <span class="kl-badge kl-badge--transit kl-mb-md">${tracking.status}</span>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="truck" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Truck: <strong>${tracking.truckNumber}</strong></span></div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="user" style="width:14px;height:14px;color:var(--kl-slate);"></i></span> <span>Driver: <strong>${tracking.driverName}</strong></span></div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="phone" style="width:14px;height:14px;color:var(--kl-slate);"></i></span> <span>Phone: <strong>${tracking.driverPhone}</strong></span></div>
        </div>
        <div class="kl-logistics-info-card">
          <div class="kl-logistics-info-card__title"><i data-lucide="navigation" style="width:15px;height:15px;"></i> Route Details</div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="map-pin" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Current: <strong>${tracking.currentLocation}</strong></span></div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="clock" style="width:14px;height:14px;color:var(--kl-amber);"></i></span> <span>ETA: <strong style="color:var(--kl-mint);">${tracking.eta}</strong></span></div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="milestone" style="width:14px;height:14px;color:var(--kl-slate);"></i></span> <span>Remaining: <strong>${tracking.distanceRemainingKm} km</strong></span></div>
        </div>
        <div class="kl-logistics-info-card">
          <div class="kl-logistics-info-card__title"><i data-lucide="package" style="width:15px;height:15px;"></i> Consignment</div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="sprout" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Produce: <strong>${tracking.crop}</strong></span></div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="upload" style="width:14px;height:14px;color:var(--kl-slate);"></i></span> <span>From: <strong>${tracking.pickupAddress}</strong></span></div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="building" style="width:14px;height:14px;color:var(--kl-slate);"></i></span> <span>To: <strong>${tracking.deliveryAddress}</strong></span></div>
        </div>
      </div>
    </div>
  </div>`;
}

function initLogisticsMap() {
  const container = document.getElementById('buyer-logistics-map');
  if (!container || !window.L) return;
  if (activeMapInstance) activeMapInstance.remove();

  const nashik = [19.9975, 73.7898];
  const pune = [18.5204, 73.8567];
  const truck = [19.2500, 73.8200];

  activeMapInstance = L.map('buyer-logistics-map').setView(truck, 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(activeMapInstance);

  const greenIcon = L.divIcon({ html: '<div style="background:#5B9A72;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;font-weight:700;">A</div>', className: '', iconSize: [28, 28] });
  const truckIcon = L.divIcon({ html: '<div style="background:#0F3D2E;color:#5B9A72;border:2px solid #5B9A72;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.4);font-size:14px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg></div>', className: '', iconSize: [34, 34] });
  const destIcon = L.divIcon({ html: '<div style="background:#C96D5B;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;font-weight:700;">B</div>', className: '', iconSize: [28, 28] });

  L.marker(nashik, { icon: greenIcon }).addTo(activeMapInstance).bindPopup('<b>Pickup:</b> Nashik APMC Yard');
  L.marker(pune, { icon: destIcon }).addTo(activeMapInstance).bindPopup('<b>Destination:</b> ABC Foods Warehouse, Chakan');
  L.marker(truck, { icon: truckIcon }).addTo(activeMapInstance).bindPopup('<b>MH 04 AB 1234</b><br>Status: In Transit — On Time').openPopup();

  L.polyline([nashik, truck, pune], { color: '#5B9A72', weight: 4, opacity: 0.8, dashArray: '8, 8' }).addTo(activeMapInstance);
}

// ═══════════════════════════════════════════════
// 13. PAYMENTS VIEW
// ═══════════════════════════════════════════════
function renderPaymentsView() {
  const p = paymentService.getSummary();
  const txs = paymentService.getTransactions();
  const badgeMap = { COMPLETED: 'kl-badge--completed', HELD: 'kl-badge--pending' };

  return `<div class="buyer-view">
    <div class="kl-page-header">
      <h1 class="kl-page-header__title">Procurement Escrow & Payment Ledger</h1>
      <p class="kl-page-header__subtitle">Track escrow deposits, payment releases, and download transaction invoices</p>
    </div>

    <div class="kl-kpi-grid" style="grid-template-columns:repeat(4,1fr);">
      <div class="kl-kpi-card"><div class="kl-kpi-card__top">Total Procurement</div><div class="kl-kpi-card__val">${p.totalProcurement}</div><div class="kl-kpi-card__sub">FY 2026-27</div></div>
      <div class="kl-kpi-card"><div class="kl-kpi-card__top">In Escrow</div><div class="kl-kpi-card__val">${p.pendingEscrow}</div><div class="kl-kpi-card__sub">Held</div></div>
      <div class="kl-kpi-card"><div class="kl-kpi-card__top">Released / Paid</div><div class="kl-kpi-card__val">${p.paidCompleted}</div><div class="kl-kpi-card__sub">Completed</div></div>
      <div class="kl-kpi-card"><div class="kl-kpi-card__top">Transactions</div><div class="kl-kpi-card__val">${p.transactionCount}</div><div class="kl-kpi-card__sub">Total Records</div></div>
    </div>

    <div class="kl-table-wrap">
      <div class="kl-table-wrap__header">
        <span class="kl-table-wrap__title">Transaction Ledger</span>
      </div>
      <table class="kl-table">
        <thead><tr><th>Tx ID</th><th>Date</th><th>Seller / FPO</th><th>Produce</th><th>Amount</th><th>Type</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${txs.map(t => `<tr>
            <td><strong>${t.id}</strong></td>
            <td>${t.date}</td>
            <td>${t.seller}</td>
            <td>${t.crop}</td>
            <td><strong>₹${fmt(t.amount)}</strong></td>
            <td class="kl-text-sm">${t.type}</td>
            <td><span class="kl-badge ${badgeMap[t.status] || 'kl-badge--neutral'}">${t.status}</span></td>
            <td><button class="kl-btn kl-btn--ghost kl-btn--sm" onclick="showToast('Invoice ${t.invoiceId} download started.', 'info')"><i data-lucide="download" style="width:13px;height:13px;"></i></button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════
// 14. PROFILE VIEW
// ═══════════════════════════════════════════════
function renderProfileView() {
  const p = buyerService.getProfile();
  return `<div class="buyer-view">
    <div class="kl-page-header">
      <h1 class="kl-page-header__title">Procurer Business Profile</h1>
      <p class="kl-page-header__subtitle">Manage your business information, verification, and procurement preferences</p>
    </div>

    <div class="kl-profile-layout">
      <!-- Business Profile -->
      <div class="kl-profile-section">
        <div class="kl-profile-section__header">
          <span class="kl-profile-section__title"><i data-lucide="building-2" style="width:16px;height:16px;"></i> Business Profile</span>
          <span class="kl-badge kl-badge--verified">✓ KYC Verified</span>
        </div>
        <div class="kl-profile-section__body">
          <div class="kl-profile-grid">
            <div class="kl-profile-field"><div class="kl-profile-field__label">Company Name</div><div class="kl-profile-field__value">${p.companyName}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Business Type</div><div class="kl-profile-field__value">${p.businessType}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Registration No.</div><div class="kl-profile-field__value">${p.regNumber}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">GSTIN</div><div class="kl-profile-field__value">${p.gstin}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">PAN</div><div class="kl-profile-field__value">${p.pan}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">KYC Submitted</div><div class="kl-profile-field__value">${p.kycSubmittedAt}</div></div>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="kl-profile-section">
        <div class="kl-profile-section__header">
          <span class="kl-profile-section__title"><i data-lucide="contact" style="width:16px;height:16px;"></i> Contact Information</span>
        </div>
        <div class="kl-profile-section__body">
          <div class="kl-profile-grid">
            <div class="kl-profile-field"><div class="kl-profile-field__label">Contact Person</div><div class="kl-profile-field__value">${p.contactPerson}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Email</div><div class="kl-profile-field__value">${p.email}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Phone</div><div class="kl-profile-field__value">${p.phone}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Address</div><div class="kl-profile-field__value">${p.address}, ${p.district}, ${p.state} — ${p.pincode}</div></div>
          </div>
        </div>
      </div>

      <!-- Bank Details -->
      <div class="kl-profile-section">
        <div class="kl-profile-section__header">
          <span class="kl-profile-section__title"><i data-lucide="landmark" style="width:16px;height:16px;"></i> Bank & Escrow Details</span>
        </div>
        <div class="kl-profile-section__body">
          <div class="kl-profile-grid">
            <div class="kl-profile-field"><div class="kl-profile-field__label">Account Holder</div><div class="kl-profile-field__value">${p.bankDetails.accountHolder}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Account Number</div><div class="kl-profile-field__value">${p.bankDetails.accountNumber}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">IFSC Code</div><div class="kl-profile-field__value">${p.bankDetails.ifsc}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Bank</div><div class="kl-profile-field__value">${p.bankDetails.bankName} — ${p.bankDetails.branch}</div></div>
          </div>
        </div>
      </div>

      <!-- Sourcing Preferences -->
      <div class="kl-profile-section">
        <div class="kl-profile-section__header">
          <span class="kl-profile-section__title"><i data-lucide="settings" style="width:16px;height:16px;"></i> Sourcing Preferences</span>
        </div>
        <div class="kl-profile-section__body">
          <div class="kl-profile-grid">
            <div class="kl-profile-field"><div class="kl-profile-field__label">Primary Crop</div><div class="kl-profile-field__value">${p.sourcingRequirements.crop}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Target Volume</div><div class="kl-profile-field__value">${p.sourcingRequirements.minQty}–${p.sourcingRequirements.maxQty} ${p.sourcingRequirements.unit}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Quality Requirement</div><div class="kl-profile-field__value">${p.sourcingRequirements.grade}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Preferred Region</div><div class="kl-profile-field__value">${p.sourcingRequirements.preferredRegion}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Target Price Range</div><div class="kl-profile-field__value">₹${fmt(p.sourcingRequirements.targetPriceMin)}–₹${fmt(p.sourcingRequirements.targetPriceMax)}/Q</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Language</div><div class="kl-profile-field__value">${p.preferences.language}</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function initKYCFormHandlers() {}
