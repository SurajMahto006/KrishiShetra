/**
 * KRISHILINK — BUYER MODULE FRONTEND APPLICATION & ROUTER
 * Handles SPA Hash Routing, Views Rendering, KYC Multi-Step Wizard,
 * Interactive Landed Cost Calculator, Offer Negotiation Engine,
 * Leaflet GPS Logistics Tracking Map, and Modal Controllers.
 */

// ═════════════════════════════════════════════════════════════════════
// 1. ROUTER & VIEW CONTROLLER
// ═════════════════════════════════════════════════════════════════════

let currentRoute = 'dashboard';
let currentSelectedLotId = 'lot-101';
let currentSelectedOrderId = 'ord-10245';
let activeMapInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  initBuyerRouter();
  initGlobalHeaderSearch();
  initKYCFormHandlers();
  
  // Listen for hash changes
  window.addEventListener('hashchange', handleRouteUpdate);
  
  // Initial Route Check
  handleRouteUpdate();
});

function initBuyerRouter() {
  document.querySelectorAll('[data-route]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetRoute = link.getAttribute('data-route');
      window.location.hash = targetRoute;
    });
  });
}

function handleRouteUpdate() {
  const hash = window.location.hash.replace('#', '') || '/buyer/dashboard';
  
  // Route Parsing
  if (hash.includes('/kyc-verification')) {
    currentRoute = 'kyc-verification';
  } else if (hash.includes('/marketplace')) {
    currentRoute = 'marketplace';
  } else if (hash.includes('/lots/')) {
    currentRoute = 'lot-detail';
    const parts = hash.split('/lots/');
    if (parts[1]) currentSelectedLotId = parts[1];
  } else if (hash.includes('/lots')) {
    currentRoute = 'lots';
  } else if (hash.includes('/offers')) {
    currentRoute = 'offers';
  } else if (hash.includes('/orders/')) {
    currentRoute = 'order-detail';
    const parts = hash.split('/orders/');
    if (parts[1]) currentSelectedOrderId = parts[1];
  } else if (hash.includes('/orders')) {
    currentRoute = 'orders';
  } else if (hash.includes('/logistics')) {
    currentRoute = 'logistics';
  } else if (hash.includes('/payments')) {
    currentRoute = 'payments';
  } else if (hash.includes('/profile')) {
    currentRoute = 'profile';
  } else {
    currentRoute = 'dashboard';
  }

  updateSidebarActiveNav(currentRoute);
  renderActiveRouteView(currentRoute);
}

function updateSidebarActiveNav(route) {
  document.querySelectorAll('.buyer-nav-item, .buyer-mnav-item').forEach(el => {
    el.classList.remove('active');
    const itemRoute = el.getAttribute('data-route') || '';
    if (itemRoute.includes(route) || (route === 'lot-detail' && itemRoute.includes('lots'))) {
      el.classList.add('active');
    }
  });
}

function renderActiveRouteView(route) {
  const container = document.getElementById('buyer-page-content');
  if (!container) return;

  switch (route) {
    case 'kyc-verification':
      container.innerHTML = renderKycView();
      initKycWizardLogic();
      break;
    case 'dashboard':
      container.innerHTML = renderDashboardView();
      break;
    case 'marketplace':
      container.innerHTML = renderMarketplaceView();
      initMarketplaceSearchAndFilters();
      break;
    case 'lot-detail':
      container.innerHTML = renderLotDetailView(currentSelectedLotId);
      initLotDetailInteractions();
      break;
    case 'lots':
      container.innerHTML = renderMyLotsView();
      break;
    case 'offers':
      container.innerHTML = renderOffersView();
      break;
    case 'orders':
      container.innerHTML = renderOrdersView();
      break;
    case 'order-detail':
      container.innerHTML = renderOrderDetailView(currentSelectedOrderId);
      break;
    case 'logistics':
      container.innerHTML = renderLogisticsView();
      initLogisticsMap();
      break;
    case 'payments':
      container.innerHTML = renderPaymentsView();
      break;
    case 'profile':
      container.innerHTML = renderProfileView();
      break;
    default:
      container.innerHTML = renderDashboardView();
  }

  // Re-initialize Lucide Icons if available
  if (window.lucide) lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ═════════════════════════════════════════════════════════════════════
// 2. VIEW RENDERERS (HTML Generators)
// ═════════════════════════════════════════════════════════════════════

// ── 1. KYC VERIFICATION VIEW ──
function renderKycView() {
  const profile = buyerService.getProfile();
  return `
    <div class="buyer-view" style="max-width:980px; margin:0 auto;">
      <div style="margin-bottom:24px;">
        <h1 style="font-family:var(--font-display); font-size:28px; font-weight:700;">Verify Your Business (Demo Onboarding)</h1>
        <p style="font-size:14px; color:var(--kl-muted); margin-top:4px;">Complete identity and business verification to unlock verified sourcing lots and escrow contracts.</p>
      </div>

      <!-- KYC Progress Bar -->
      <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-md); padding:20px; margin-bottom:24px; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="font-size:12px; font-weight:700; color:var(--kl-mint);">STEP 3 OF 4: DOCUMENT UPLOAD</span>
          <span style="font-size:12px; font-weight:700; color:var(--kl-muted);">75% Completed</span>
        </div>
        <div style="width:100%; height:8px; background:var(--kl-border-subtle); border-radius:4px; overflow:hidden;">
          <div style="width:75%; height:100%; background:var(--kl-mint); transition:width 0.4s ease;"></div>
        </div>
      </div>

      <!-- KYC Form Card -->
      <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-lg); padding:32px; box-shadow:var(--shadow-md);">
        <form id="kyc-demo-form" onsubmit="handleKycSubmit(event)">
          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:20px; margin-bottom:24px;">
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--kl-slate); display:block; margin-bottom:6px;">Business Entity Name</label>
              <input type="text" class="kl-btn--secondary" style="width:100%; padding:10px; text-align:left;" value="${profile.companyName}" required>
            </div>
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--kl-slate); display:block; margin-bottom:6px;">GSTIN Registration Number</label>
              <input type="text" class="kl-btn--secondary" style="width:100%; padding:10px; text-align:left;" value="${profile.gstin}" required>
            </div>
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--kl-slate); display:block; margin-bottom:6px;">PAN Number</label>
              <input type="text" class="kl-btn--secondary" style="width:100%; padding:10px; text-align:left;" value="${profile.pan}" required>
            </div>
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--kl-slate); display:block; margin-bottom:6px;">Bank Account Number (Escrow Payout)</label>
              <input type="text" class="kl-btn--secondary" style="width:100%; padding:10px; text-align:left;" value="${profile.bankDetails.accountNumber}" required>
            </div>
          </div>

          <div style="border:2px dashed var(--kl-border); border-radius:var(--radius-md); padding:28px; text-align:center; background:var(--kl-bg-ivory); margin-bottom:24px;">
            <i data-lucide="upload-cloud" style="width:36px; height:36px; color:var(--kl-mint); margin-bottom:8px;"></i>
            <h4 style="font-size:15px; font-weight:700; color:var(--kl-charcoal);">Upload Business Registration & GST Certificate</h4>
            <p style="font-size:12px; color:var(--kl-muted); margin-top:4px;">Drag and drop PDF/JPG document files (Max 10MB)</p>
            <button type="button" class="kl-btn kl-btn--secondary" style="margin-top:14px;">Select Documents</button>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; color:var(--kl-muted);"><i data-lucide="shield-check" style="width:14px;height:14px;vertical-align:middle;"></i> Prototype Verification Mode Enabled</span>
            <button type="submit" class="kl-btn kl-btn--primary">Submit Verification Details <i data-lucide="arrow-right"></i></button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// ── 2. BUYER DASHBOARD VIEW ──
function renderDashboardView() {
  const profile = buyerService.getProfile();
  const stats = marketService.getDashboardStats();
  const req = profile.sourcingRequirements;

  return `
    <div class="buyer-view">
      <!-- Welcome Header -->
      <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px;">
        <div>
          <div style="font-size:13px; font-weight:700; color:var(--kl-mint); text-transform:uppercase; letter-spacing:0.04em;">PROCURER DASHBOARD</div>
          <h1 style="font-family:var(--font-display); font-size:30px; font-weight:700; color:var(--kl-charcoal);">Good morning, ${profile.companyName}</h1>
        </div>
        <div style="display:flex; gap:10px;">
          <span class="kl-badge kl-badge--verified"><i data-lucide="check-circle-2" style="width:14px;height:14px;"></i> KYC VERIFIED</span>
          <a href="#/buyer/marketplace" class="kl-btn kl-btn--primary"><i data-lucide="search"></i> Source Produce</a>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kl-kpi-grid">
        <div class="kl-kpi-card">
          <div class="kl-kpi-card__top">Active Requirements <i data-lucide="list-checks"></i></div>
          <div class="kl-kpi-card__val">${stats.activeRequirements}</div>
          <div class="kl-kpi-card__sub">Across 4 States</div>
        </div>
        <div class="kl-kpi-card">
          <div class="kl-kpi-card__top">Matching Lots <i data-lucide="package-search"></i></div>
          <div class="kl-kpi-card__val">${stats.newMatchingLots}</div>
          <div class="kl-kpi-card__sub">94% AI Match Score</div>
        </div>
        <div class="kl-kpi-card">
          <div class="kl-kpi-card__top">Offers Pending <i data-lucide="message-square"></i></div>
          <div class="kl-kpi-card__val">${stats.offersPending}</div>
          <div class="kl-kpi-card__sub">Active Bids</div>
        </div>
        <div class="kl-kpi-card">
          <div class="kl-kpi-card__top">Active Orders <i data-lucide="truck"></i></div>
          <div class="kl-kpi-card__val">${stats.activeOrders}</div>
          <div class="kl-kpi-card__sub">In Transit</div>
        </div>
        <div class="kl-kpi-card">
          <div class="kl-kpi-card__top">Monthly Procurement <i data-lucide="wallet"></i></div>
          <div class="kl-kpi-card__val">${stats.monthlyProcurement}</div>
          <div class="kl-kpi-card__sub">Aug 2026 Volume</div>
        </div>
      </div>

      <!-- Procurement Intelligence Card -->
      <div style="background:linear-gradient(135deg, var(--kl-evergreen), var(--kl-evergreen-light)); color:#FFFFFF; border-radius:var(--radius-lg); padding:28px; margin-bottom:28px; box-shadow:var(--shadow-md); position:relative; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; position:relative; z-index:2;">
          <div>
            <span style="font-size:11px; font-weight:800; letter-spacing:0.08em; background:rgba(91,154,114,0.25); color:var(--kl-mint); padding:4px 10px; border-radius:var(--radius-full);">YOUR CURRENT SOURCING REQUIREMENT</span>
            <h2 style="font-family:var(--font-display); font-size:26px; font-weight:700; margin-top:10px;">🧅 ${req.crop} (${req.grade})</h2>
            <p style="font-size:14px; color:rgba(255,255,255,0.85); margin-top:4px;">Target Volume: <strong>${req.minQty}–${req.maxQty} ${req.unit}</strong> | Target Price Range: <strong>₹${req.targetPriceMin}–₹${req.targetPriceMax}/Q</strong> | Preferred: <strong>${req.preferredRegion}</strong></p>
          </div>
          <a href="#/buyer/marketplace" class="kl-btn kl-btn--primary" style="background:#FFFFFF; color:var(--kl-evergreen); border:none;">Explore 48 Matched Lots <i data-lucide="arrow-right"></i></a>
        </div>

        <div style="margin-top:20px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.12); display:flex; gap:24px; font-size:13px; color:rgba(255,255,255,0.9);">
          <div>🤖 <strong>AI Intelligence Alert:</strong> 12 lots currently match your exact target price range in Nashik APMC with Grade A moisture certification.</div>
        </div>
      </div>

      <!-- Quick Market Snapshot Table -->
      <div class="kl-table-wrap">
        <div style="padding:18px 24px; border-bottom:1px solid var(--kl-border); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-size:16px; font-weight:700; color:var(--kl-charcoal);">Live Produce Market Snapshot</h3>
          <a href="#/buyer/marketplace" style="font-size:12px; font-weight:700; color:var(--kl-mint); text-decoration:none;">View Full Marketplace →</a>
        </div>
        <table class="kl-table">
          <thead>
            <tr>
              <th>Produce</th>
              <th>Current Mandi Price</th>
              <th>Weekly Trend</th>
              <th>Demand Level</th>
              <th>Available Lots</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>🧅 Onion (Grade A)</strong></td>
              <td><strong>₹2,650/Q</strong></td>
              <td><span style="color:var(--kl-mint); font-weight:700;">↑ 8.2%</span></td>
              <td><span class="kl-badge kl-badge--verified">High Demand</span></td>
              <td>12 Lots</td>
              <td><a href="#/buyer/lots/lot-101" class="kl-btn kl-btn--secondary" style="padding:4px 10px; font-size:11px;">View Lots</a></td>
            </tr>
            <tr>
              <td><strong>🌾 Wheat (Lokwan)</strong></td>
              <td><strong>₹2,650/Q</strong></td>
              <td><span style="color:var(--kl-mint); font-weight:700;">↑ 6.2%</span></td>
              <td><span class="kl-badge kl-badge--pending">Medium</span></td>
              <td>18 Lots</td>
              <td><a href="#/buyer/lots/lot-102" class="kl-btn kl-btn--secondary" style="padding:4px 10px; font-size:11px;">View Lots</a></td>
            </tr>
            <tr>
              <td><strong>🫘 Soybean (JS 335)</strong></td>
              <td><strong>₹4,650/Q</strong></td>
              <td><span style="color:var(--kl-mint); font-weight:700;">↑ 4.8%</span></td>
              <td><span class="kl-badge kl-badge--verified">High Demand</span></td>
              <td>15 Lots</td>
              <td><a href="#/buyer/lots/lot-103" class="kl-btn kl-btn--secondary" style="padding:4px 10px; font-size:11px;">View Lots</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── 3. MARKETPLACE VIEW ──
function renderMarketplaceView() {
  const lots = marketService.getMarketplaceLots();

  return `
    <div class="buyer-view">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <h1 style="font-family:var(--font-display); font-size:28px; font-weight:700;">B2B Agricultural Sourcing Marketplace</h1>
          <p style="font-size:13px; color:var(--kl-muted);">Discover verified FPO and farmer produce lots with AI price matching & quality analytics</p>
        </div>
      </div>

      <!-- Filters & Results Layout -->
      <div style="display:grid; grid-template-columns: 260px 1fr; gap:24px;">
        <!-- Filters Sidebar -->
        <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-md); padding:20px; height:fit-content; box-shadow:var(--shadow-sm);">
          <h3 style="font-size:14px; font-weight:700; color:var(--kl-charcoal); margin-bottom:16px; display:flex; align-items:center; justify-content:space-between;">
            <span><i data-lucide="filter" style="width:14px;height:14px;vertical-align:middle;"></i> Filters</span>
            <button onclick="resetMarketplaceFilters()" style="font-size:11px; color:var(--kl-mint); background:none; border:none; cursor:pointer;">Clear All</button>
          </h3>

          <div style="display:flex; flex-direction:column; gap:16px;">
            <div>
              <label style="font-size:12px; font-weight:700; color:var(--kl-slate); display:block; margin-bottom:6px;">Select Crop</label>
              <select id="mkt-filter-crop" class="kl-btn--secondary" style="width:100%; padding:8px;" onchange="applyMarketplaceFilters()">
                <option value="all">All Crops</option>
                <option value="onion">Onion</option>
                <option value="wheat">Wheat</option>
                <option value="soybean">Soybean</option>
                <option value="rice">Rice</option>
                <option value="chilli">Chilli</option>
              </select>
            </div>

            <div>
              <label style="font-size:12px; font-weight:700; color:var(--kl-slate); display:block; margin-bottom:6px;">Quality Grade</label>
              <select id="mkt-filter-grade" class="kl-btn--secondary" style="width:100%; padding:8px;" onchange="applyMarketplaceFilters()">
                <option value="all">All Grades</option>
                <option value="Grade A">Grade A Only</option>
                <option value="Export Grade">Export Grade</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Lots Grid -->
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px;" id="marketplace-lots-grid">
          ${lots.map(l => `
            <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-md); overflow:hidden; box-shadow:var(--shadow-sm); display:flex; flex-direction:column;">
              <div style="position:relative; height:140px; background:#F1F5F9;">
                <img src="${l.image}" alt="${l.crop}" style="width:100%; height:100%; object-fit:cover;">
                <span class="kl-badge kl-badge--verified" style="position:absolute; top:8px; right:8px; font-size:10px;">${l.aiMatchPct}% AI MATCH</span>
              </div>
              <div style="padding:16px; display:flex; flex-direction:column; flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <div>
                    <h3 style="font-size:16px; font-weight:700; color:var(--kl-charcoal);">${l.emoji} ${l.crop}</h3>
                    <span style="font-size:12px; color:var(--kl-muted);">${l.variety} · ${l.grade}</span>
                  </div>
                  <span style="font-size:14px; font-weight:800; color:var(--kl-evergreen);">₹${l.sellerAskPrice.toLocaleString('en-IN')}/Q</span>
                </div>
                
                <div style="margin-top:12px; font-size:12px; color:var(--kl-slate); display:flex; flex-direction:column; gap:4px;">
                  <div>📍 <strong>${l.location}</strong> (${l.distanceKm} km)</div>
                  <div>🏢 <strong>Seller:</strong> ${l.sellerName} <span style="color:var(--kl-mint); font-weight:700;">✓</span></div>
                  <div>📦 <strong>Quantity Available:</strong> ${l.quantity} Quintals</div>
                </div>

                <div style="margin-top:auto; padding-top:14px;">
                  <a href="#/buyer/lots/${l.id}" class="kl-btn kl-btn--primary" style="width:100%; text-align:center;">View Lot & Make Offer</a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ── 4. LOT DETAIL VIEW ──
function renderLotDetailView(lotId) {
  const lot = lotService.getLotById(lotId);
  const landed = lotService.calculateLandedCost(lot);

  return `
    <div class="buyer-view">
      <div style="margin-bottom:20px; display:flex; align-items:center; gap:10px;">
        <a href="#/buyer/marketplace" style="color:var(--kl-muted); text-decoration:none; font-size:13px;">← Back to Marketplace</a>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 380px; gap:28px;">
        <!-- Left Details Panel -->
        <div>
          <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-lg); padding:28px; margin-bottom:24px; box-shadow:var(--shadow-sm);">
            <div style="display:flex; gap:24px; align-items:flex-start;">
              <div style="width:180px; height:140px; border-radius:var(--radius-md); overflow:hidden; flex-shrink:0;">
                <img src="${lot.image}" alt="${lot.crop}" style="width:100%; height:100%; object-fit:cover;">
              </div>
              <div style="flex:1;">
                <div style="display:flex; justify-content:space-between;">
                  <h1 style="font-family:var(--font-display); font-size:32px; font-weight:700;">${lot.emoji} ${lot.crop} (${lot.variety})</h1>
                  <span class="kl-badge kl-badge--verified" style="font-size:12px;">✓ VERIFIED SELLER</span>
                </div>
                <p style="font-size:14px; color:var(--kl-muted); margin-top:4px;">Lot ID: <strong>${lot.id}</strong> | Mandi: <strong>${lot.mandi}</strong> | Available: <strong>${lot.quantity} Quintals</strong></p>
                <div style="margin-top:14px; display:flex; gap:16px;">
                  <div style="background:var(--kl-bg-body); padding:8px 14px; border-radius:var(--radius-sm); border:1px solid var(--kl-border);">
                    <span style="font-size:11px; color:var(--kl-muted); display:block;">SELLER ASK PRICE</span>
                    <strong style="font-size:18px; color:var(--kl-evergreen);">₹${lot.sellerAskPrice.toLocaleString('en-IN')}/Q</strong>
                  </div>
                  <div style="background:var(--kl-bg-body); padding:8px 14px; border-radius:var(--radius-sm); border:1px solid var(--kl-border);">
                    <span style="font-size:11px; color:var(--kl-muted); display:block;">MARKET REF PRICE</span>
                    <strong style="font-size:18px; color:var(--kl-slate);">₹${lot.marketRefPrice.toLocaleString('en-IN')}/Q</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quality Analytics Radar -->
          <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-lg); padding:24px; margin-bottom:24px; box-shadow:var(--shadow-sm);">
            <h3 style="font-size:16px; font-weight:700; color:var(--kl-charcoal); margin-bottom:16px;">🔍 Quality & AI Grading Analytics</h3>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; background:var(--kl-bg-ivory); padding:16px; border-radius:var(--radius-md); border:1px solid var(--kl-border-subtle);">
              <div><span style="font-size:11px; color:var(--kl-muted);">MOISTURE LEVEL</span><strong style="display:block; font-size:15px; color:var(--kl-charcoal); margin-top:2px;">${lot.qualityMetrics.moisturePct}</strong></div>
              <div><span style="font-size:11px; color:var(--kl-muted);">GRAIN / BULB SIZE</span><strong style="display:block; font-size:15px; color:var(--kl-charcoal); margin-top:2px;">${lot.qualityMetrics.sizeMm}</strong></div>
              <div><span style="font-size:11px; color:var(--kl-muted);">DEFECT RATE</span><strong style="display:block; font-size:15px; color:var(--kl-charcoal); margin-top:2px;">${lot.qualityMetrics.defectsPct}</strong></div>
              <div><span style="font-size:11px; color:var(--kl-muted);">AI CONFIDENCE</span><strong style="display:block; font-size:15px; color:var(--kl-mint); margin-top:2px;">${lot.qualityMetrics.aiConfidencePct}%</strong></div>
            </div>
          </div>
        </div>

        <!-- Right Landed Cost Calculator -->
        <div>
          <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-lg); padding:24px; box-shadow:var(--shadow-md); position:sticky; top:84px;">
            <h3 style="font-size:16px; font-weight:700; color:var(--kl-charcoal); margin-bottom:16px;">🧮 Smart Procurement Landed Cost</h3>
            
            <div style="display:flex; flex-direction:column; gap:10px; font-size:13px; border-bottom:1px solid var(--kl-border); padding-bottom:14px; margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between;">
                <span>Produce Cost (${lot.quantity} Q @ ₹${lot.sellerAskPrice})</span>
                <strong>₹${landed.productCost.toLocaleString('en-IN')}</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Estimated Freight (${lot.distanceKm} km)</span>
                <strong>₹${landed.transportCost.toLocaleString('en-IN')}</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>APMC Mandi Cess & Taxes</span>
                <strong>₹${landed.mandiCess.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:20px;">
              <span style="font-size:14px; font-weight:700; color:var(--kl-charcoal);">Effective Landed Cost/Q:</span>
              <strong style="font-size:22px; font-weight:800; color:var(--kl-evergreen);">₹${landed.effectiveCostPerQ.toLocaleString('en-IN')}/Q</strong>
            </div>

            <button class="kl-btn kl-btn--primary" style="width:100%; padding:12px; font-size:14px;" onclick="openMakeOfferModal('${lot.id}')">✦ Make Procurement Offer</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── 5. MY LOTS VIEW ──
function renderMyLotsView() {
  const lots = marketService.getMarketplaceLots();
  return `
    <div class="buyer-view">
      <h1 style="font-family:var(--font-display); font-size:28px; font-weight:700; margin-bottom:20px;">My Saved & Sourced Lots</h1>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px;">
        ${lots.map(l => `
          <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-md); padding:20px; box-shadow:var(--shadow-sm);">
            <h3>${l.emoji} ${l.crop}</h3>
            <p style="font-size:12px; color:var(--kl-muted);">${l.sellerName} · ${l.location}</p>
            <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:center;">
              <strong style="font-size:16px;">₹${l.sellerAskPrice}/Q</strong>
              <a href="#/buyer/lots/${l.id}" class="kl-btn kl-btn--secondary" style="padding:5px 12px; font-size:12px;">View Details</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ── 6. OFFERS VIEW ──
function renderOffersView() {
  const offers = offerService.getOffers();
  return `
    <div class="buyer-view">
      <h1 style="font-family:var(--font-display); font-size:28px; font-weight:700; margin-bottom:20px;">Digital Offer Negotiations</h1>
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${offers.map(o => `
          <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-md); padding:20px; box-shadow:var(--shadow-sm); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span class="kl-badge kl-badge--pending" style="margin-bottom:8px;">${o.status}</span>
              <h3 style="font-size:18px; font-weight:700;">${o.crop} (${o.quantity} Quintals)</h3>
              <p style="font-size:13px; color:var(--kl-muted);">Seller: <strong>${o.sellerName}</strong> | Your Offer: <strong>₹${o.currentBuyerOffer}/Q</strong> (Ask: ₹${o.sellerAsk}/Q)</p>
            </div>
            <div>
              <button class="kl-btn kl-btn--primary" onclick="handleAcceptOfferAction('${o.id}')">Accept Counter Offer (₹${o.currentBuyerOffer})</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ── 7. ORDERS VIEW ──
function renderOrdersView() {
  const orders = orderService.getOrders();
  return `
    <div class="buyer-view">
      <h1 style="font-family:var(--font-display); font-size:28px; font-weight:700; margin-bottom:20px;">Procurement Orders & Shipments</h1>
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${orders.map(o => `
          <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-md); padding:20px; box-shadow:var(--shadow-sm); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span class="kl-badge kl-badge--verified" style="margin-bottom:8px;">ORDER ${o.id} · ${o.status}</span>
              <h3 style="font-size:18px; font-weight:700;">🧅 ${o.crop} (${o.quantity} Quintals)</h3>
              <p style="font-size:13px; color:var(--kl-muted);">Grand Total: <strong>₹${o.grandTotal.toLocaleString('en-IN')}</strong> | Pickup: ${o.pickupAddress}</p>
            </div>
            <div style="display:flex; gap:10px;">
              <a href="#/buyer/logistics" class="kl-btn kl-btn--secondary"><i data-lucide="map-pin"></i> Track Logistics</a>
              <a href="#/buyer/payments" class="kl-btn kl-btn--primary"><i data-lucide="credit-card"></i> View Payment</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ── 8. ORDER DETAIL VIEW ──
function renderOrderDetailView(orderId) {
  const o = orderService.getOrderById(orderId);
  return `
    <div class="buyer-view">
      <h1 style="font-family:var(--font-display); font-size:28px; font-weight:700; margin-bottom:20px;">Order Details #${o.id}</h1>
      <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-md); padding:24px;">
        <h3>${o.crop} — ${o.quantity} Quintals</h3>
        <p style="margin-top:8px;">Total Paid to Escrow: <strong>₹${o.grandTotal.toLocaleString('en-IN')}</strong></p>
      </div>
    </div>
  `;
}

// ── 9. LOGISTICS VIEW (Leaflet GPS Map) ──
function renderLogisticsView() {
  const log = logisticsService.getTrackingInfo('ord-10245');
  return `
    <div class="buyer-view">
      <h1 style="font-family:var(--font-display); font-size:28px; font-weight:700; margin-bottom:20px;">Live Fleet & Shipment GPS Logistics Tracking</h1>
      
      <div style="display:grid; grid-template-columns: 1fr 360px; gap:24px; height:520px;">
        <div id="buyer-logistics-map" style="width:100%; height:100%; border-radius:var(--radius-lg); border:1px solid var(--kl-border); overflow:hidden; box-shadow:var(--shadow-sm);"></div>
        
        <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-lg); padding:24px; box-shadow:var(--shadow-sm);">
          <span class="kl-badge kl-badge--verified" style="margin-bottom:12px;">STATUS: ${log.status}</span>
          <h3 style="font-size:18px; font-weight:700; color:var(--kl-charcoal);">Truck: ${log.truckNumber}</h3>
          <p style="font-size:13px; color:var(--kl-muted); margin-top:4px;">Driver: <strong>${log.driverName}</strong> (${log.driverPhone})</p>
          
          <div style="margin-top:20px; border-top:1px solid var(--kl-border); padding-top:16px; display:flex; flex-direction:column; gap:12px; font-size:13px;">
            <div>📍 <strong>Current GPS Location:</strong> ${log.currentLocation}</div>
            <div>⏱️ <strong>Estimated Arrival (ETA):</strong> <strong style="color:var(--kl-mint);">${log.eta}</strong></div>
            <div>🛣️ <strong>Distance Remaining:</strong> ${log.distanceRemainingKm} km</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── 10. PAYMENTS VIEW ──
function renderPaymentsView() {
  const p = paymentService.getSummary();
  const txs = paymentService.getTransactions();

  return `
    <div class="buyer-view">
      <h1 style="font-family:var(--font-display); font-size:28px; font-weight:700; margin-bottom:20px;">Fintech Procurement Escrow & Transaction Ledger</h1>
      
      <div class="kl-kpi-grid">
        <div class="kl-kpi-card">
          <div class="kl-kpi-card__top">Total Sourced</div>
          <div class="kl-kpi-card__val">${p.totalProcurement}</div>
        </div>
        <div class="kl-kpi-card">
          <div class="kl-kpi-card__top">In Escrow</div>
          <div class="kl-kpi-card__val">${p.pendingEscrow}</div>
        </div>
        <div class="kl-kpi-card">
          <div class="kl-kpi-card__top">Paid Out</div>
          <div class="kl-kpi-card__val">${p.paidCompleted}</div>
        </div>
      </div>

      <div class="kl-table-wrap">
        <table class="kl-table">
          <thead>
            <tr>
              <th>Tx ID</th>
              <th>Date</th>
              <th>Seller / FPO</th>
              <th>Produce</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${txs.map(t => `
              <tr>
                <td><strong>${t.id}</strong></td>
                <td>${t.date}</td>
                <td>${t.seller}</td>
                <td>${t.crop}</td>
                <td><strong>₹${t.amount.toLocaleString('en-IN')}</strong></td>
                <td><span class="kl-badge kl-badge--verified">✓ ${t.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── 11. PROFILE VIEW ──
function renderProfileView() {
  const profile = buyerService.getProfile();
  return `
    <div class="buyer-view" style="max-width:800px; margin:0 auto;">
      <h1 style="font-family:var(--font-display); font-size:28px; font-weight:700; margin-bottom:20px;">Procuer Business Profile</h1>
      <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-lg); padding:28px; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <div>
            <h2 style="font-size:22px; font-weight:700;">${profile.companyName}</h2>
            <p style="font-size:13px; color:var(--kl-muted);">${profile.businessType}</p>
          </div>
          <span class="kl-badge kl-badge--verified">✓ KYC VERIFIED</span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:16px; font-size:13px;">
          <div><strong>GSTIN:</strong> ${profile.gstin}</div>
          <div><strong>PAN:</strong> ${profile.pan}</div>
          <div><strong>Contact Person:</strong> ${profile.contactPerson}</div>
          <div><strong>Email:</strong> ${profile.email}</div>
          <div><strong>Address:</strong> ${profile.address}, ${profile.district}, ${profile.state}</div>
        </div>
      </div>
    </div>
  `;
}

// ═════════════════════════════════════════════════════════════════════
// 3. INTERACTION CONTROLLERS & MAP INTEGRATION
// ═════════════════════════════════════════════════════════════════════

function initKycWizardLogic() {}
function handleKycSubmit(e) {
  e.preventDefault();
  buyerService.submitKyc({});
  alert('Demo KYC Submitted Successfully! Access granted to verified lots.');
  window.location.hash = '/buyer/dashboard';
}

function initMarketplaceSearchAndFilters() {}
function resetMarketplaceFilters() {
  document.getElementById('mkt-filter-crop').value = 'all';
  document.getElementById('mkt-filter-grade').value = 'all';
  applyMarketplaceFilters();
}
function applyMarketplaceFilters() {
  const crop = document.getElementById('mkt-filter-crop').value;
  const grade = document.getElementById('mkt-filter-grade').value;
  const lots = marketService.getMarketplaceLots({ crop, grade });
  
  const grid = document.getElementById('marketplace-lots-grid');
  if (grid) {
    grid.innerHTML = lots.map(l => `
      <div style="background:var(--kl-card-white); border:1px solid var(--kl-border); border-radius:var(--radius-md); overflow:hidden; box-shadow:var(--shadow-sm); display:flex; flex-direction:column;">
        <div style="position:relative; height:140px; background:#F1F5F9;">
          <img src="${l.image}" alt="${l.crop}" style="width:100%; height:100%; object-fit:cover;">
          <span class="kl-badge kl-badge--verified" style="position:absolute; top:8px; right:8px; font-size:10px;">${l.aiMatchPct}% AI MATCH</span>
        </div>
        <div style="padding:16px; display:flex; flex-direction:column; flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <h3 style="font-size:16px; font-weight:700; color:var(--kl-charcoal);">${l.emoji} ${l.crop}</h3>
              <span style="font-size:12px; color:var(--kl-muted);">${l.variety} · ${l.grade}</span>
            </div>
            <span style="font-size:14px; font-weight:800; color:var(--kl-evergreen);">₹${l.sellerAskPrice.toLocaleString('en-IN')}/Q</span>
          </div>
          
          <div style="margin-top:12px; font-size:12px; color:var(--kl-slate); display:flex; flex-direction:column; gap:4px;">
            <div>📍 <strong>${l.location}</strong> (${l.distanceKm} km)</div>
            <div>🏢 <strong>Seller:</strong> ${l.sellerName} <span style="color:var(--kl-mint); font-weight:700;">✓</span></div>
            <div>📦 <strong>Quantity Available:</strong> ${l.quantity} Quintals</div>
          </div>

          <div style="margin-top:auto; padding-top:14px;">
            <a href="#/buyer/lots/${l.id}" class="kl-btn kl-btn--primary" style="width:100%; text-align:center;">View Lot & Make Offer</a>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function initLotDetailInteractions() {}

function openMakeOfferModal(lotId) {
  const lot = lotService.getLotById(lotId);
  const offerPrice = prompt(`Enter your counter offer price per quintal for ${lot.crop} (Seller Ask: ₹${lot.sellerAskPrice}/Q):`, lot.sellerAskPrice - 50);
  
  if (offerPrice) {
    offerService.createOffer(lot.id, offerPrice, 'Digital bid submitted via KrishiLink Marketplace');
    alert(`Offer of ₹${offerPrice}/Q submitted to ${lot.sellerName}! Redirecting to Offers Negotiation dashboard.`);
    window.location.hash = '/buyer/offers';
  }
}

function handleAcceptOfferAction(offerId) {
  const res = offerService.acceptOffer(offerId);
  if (res) {
    alert(`Offer Accepted! Order ${res.order.id} generated and escrow reserved.`);
    window.location.hash = '/buyer/orders';
  }
}

function initLogisticsMap() {
  setTimeout(() => {
    const container = document.getElementById('buyer-logistics-map');
    if (!container || !window.L) return;

    if (activeMapInstance) activeMapInstance.remove();
    
    // Nashik APMC to Pune Chakan Coordinates
    const nashik = [19.9975, 73.7898];
    const pune = [18.5204, 73.8567];
    const midTruck = [19.2500, 73.8200];

    activeMapInstance = L.map('buyer-logistics-map').setView(midTruck, 9);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(activeMapInstance);

    L.marker(nashik).addTo(activeMapInstance).bindPopup('<b>Pickup:</b> Nashik APMC Yard').openPopup();
    L.marker(pune).addTo(activeMapInstance).bindPopup('<b>Destination:</b> ABC Foods Warehouse');
    L.marker(midTruck).addTo(activeMapInstance).bindPopup('🚛 <b>Truck MH 04 AB 1234</b> (In Transit - On Time)');

    L.polyline([nashik, midTruck, pune], { color: '#5B9A72', weight: 4, opacity: 0.8 }).addTo(activeMapInstance);
  }, 100);
}

function initGlobalHeaderSearch() {
  const input = document.getElementById('global-buyer-search');
  if (input) {
    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        window.location.hash = '/buyer/marketplace';
      }
    });
  }
}
