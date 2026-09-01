/**
 * KRISHILINK — BUYER MODULE APPLICATION v2.2
 * Production-Grade SPA Router, View Renderers, Modal/Toast System,
 * KYC Wizard, Live Sourcing Editor, Offer Negotiation, GPS Simulation, and Escrow Ledger.
 */

// ═══════════════════════════════════════════════
// 1. STATE & INITIALIZATION
// ═══════════════════════════════════════════════
let currentRoute = 'dashboard';
let currentSelectedLotId = 'lot-101';
let currentSelectedOrderId = 'ord-10245';
let activeMapInstance = null;
let logisticsSimInterval = null;
let kycActiveStep = 2; // Default to step 2 (Documents) or step 0

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('hashchange', handleRouteUpdate);
  initSearchDropdown();
  initNotificationPanel();
  syncHeaderBuyerDetails();
  handleRouteUpdate();
});

function syncHeaderBuyerDetails() {
  const p = buyerService.getProfile();
  const avatarEl = document.getElementById('header-avatar');
  const nameEl = document.getElementById('header-user-name');
  const dropAvatarEl = document.getElementById('dropdown-avatar');
  const dropNameEl = document.getElementById('dropdown-user-name');
  const dropPhoneEl = document.getElementById('dropdown-user-phone');

  const initials = p.companyName ? p.companyName.split(' ').map(w => w[0]).slice(0, 2).join('') : 'BL';
  if (avatarEl) avatarEl.textContent = initials;
  if (nameEl) nameEl.textContent = p.contactPerson ? p.contactPerson.split(' ')[0] : 'Buyer';
  if (dropAvatarEl) dropAvatarEl.textContent = initials;
  if (dropNameEl) dropNameEl.textContent = p.companyName;
  if (dropPhoneEl) dropPhoneEl.textContent = `${p.contactPerson} · ${p.district || p.state}`;
}

// ═══════════════════════════════════════════════
// 2. ROUTER
// ═══════════════════════════════════════════════
function handleRouteUpdate() {
  const hash = window.location.hash.replace('#', '') || '/buyer/dashboard';

  if (hash.includes('/kyc-verification') || hash.includes('/kyc')) currentRoute = 'kyc';
  else if (hash.includes('/marketplace')) currentRoute = 'marketplace';
  else if (hash.includes('/lots/')) {
    currentRoute = 'lot-detail';
    const p = hash.split('/lots/');
    if (p[1]) currentSelectedLotId = p[1];
  }
  else if (hash.includes('/lots')) currentRoute = 'lots';
  else if (hash.includes('/offers')) currentRoute = 'offers';
  else if (hash.includes('/orders/')) {
    currentRoute = 'order-detail';
    const p = hash.split('/orders/');
    if (p[1]) currentSelectedOrderId = p[1];
  }
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
                  (r.includes(currentRoute) && currentRoute !== 'lot-detail' && currentRoute !== 'order-detail');
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
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('global-buyer-search');
    if (searchInput) searchInput.focus();
  }
});

function renderView(route) {
  const c = document.getElementById('buyer-page-content');
  if (!c) return;
  if (activeMapInstance) {
    try { activeMapInstance.remove(); } catch (e) {}
    activeMapInstance = null;
  }
  if (logisticsSimInterval) {
    clearInterval(logisticsSimInterval);
    logisticsSimInterval = null;
  }

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
function closeModal() {
  document.getElementById('kl-modal-overlay').classList.remove('is-open');
}
function closeModalOnBackdrop(e) {
  if (e.target.id === 'kl-modal-overlay') closeModal();
}

function showToast(message, type = 'success') {
  const container = document.getElementById('kl-toast-container');
  if (!container) return;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `kl-toast kl-toast--${type}`;
  toast.innerHTML = `<span class="kl-toast__icon">${icons[type] || '✓'}</span><span class="kl-toast__msg">${message}</span><button class="kl-toast__close" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('kl-toast--exiting');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function animateCountUps() {
  document.querySelectorAll('[data-countup]').forEach(el => {
    const target = parseInt(el.getAttribute('data-countup'), 10);
    if (isNaN(target)) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      el.textContent = current;
    }, 25);
  });
}

function initSearchDropdown() {
  const input = document.getElementById('global-buyer-search');
  const panel = document.getElementById('kl-search-results');
  if (!input || !panel) return;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    const results = searchService.search(q);
    if (results.length === 0) {
      panel.classList.remove('is-open');
      return;
    }
    const grouped = {};
    results.forEach(r => {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type].push(r);
    });
    const typeLabels = { crop: 'Available Crops', location: 'Mandi Hubs', seller: 'Verified Sellers / FPOs' };
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

  input.addEventListener('blur', () => setTimeout(() => panel.classList.remove('is-open'), 250));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      panel.classList.remove('is-open');
      window.location.hash = `/buyer/marketplace`;
    }
  });
}

function initNotificationPanel() {
  const btn = document.getElementById('btn-notifications');
  const panel = document.getElementById('kl-notification-panel');
  if (!btn || !panel) return;

  btn.addEventListener('click', () => {
    const isOpen = panel.classList.contains('is-open');
    if (isOpen) {
      panel.classList.remove('is-open');
      return;
    }
    const notifications = notificationService.getNotifications();
    const typeClass = { lot: 'lot', offer: 'offer', order: 'order' };
    panel.innerHTML = `
      <div class="kl-notification-panel__header" style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid var(--kl-border-subtle);">
        <span class="kl-notification-panel__title" style="font-weight:700; font-size:14px;">Live Notifications (${notifications.length})</span>
        <button class="kl-btn kl-btn--ghost kl-btn--sm" style="font-size:12px; padding:2px 6px;" onclick="markAllNotificationsRead()">Mark all read</button>
      </div>
      <div style="max-height:340px; overflow-y:auto;">
        ${notifications.map(n => `
          <a href="${n.route || '#/buyer/dashboard'}" class="kl-notification-item" onclick="document.getElementById('kl-notification-panel').classList.remove('is-open')" style="display:flex; gap:12px; padding:12px 16px; border-bottom:1px solid var(--kl-border-subtle); text-decoration:none; color:inherit; background:${n.unread ? 'rgba(91,154,114,0.06)' : 'transparent'};">
            <div class="kl-notification-item__icon kl-notification-item__icon--${typeClass[n.type] || 'lot'}"><i data-lucide="${n.iconName || 'sprout'}"></i></div>
            <div class="kl-notification-item__body">
              <div class="kl-notification-item__text" style="font-size:13px; font-weight:${n.unread ? '600' : '400'}; line-height:1.4;">${n.text}</div>
              <div class="kl-notification-item__time" style="font-size:11px; color:var(--kl-muted); margin-top:3px;">${n.time}</div>
            </div>
          </a>
        `).join('')}
      </div>`;
    panel.classList.add('is-open');
    if (window.lucide) lucide.createIcons();
  });

  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !panel.contains(e.target)) {
      panel.classList.remove('is-open');
    }
  });
}

function markAllNotificationsRead() {
  notificationService.markAllRead();
  const badge = document.getElementById('notifications-badge');
  if (badge) badge.style.display = 'none';
  const panel = document.getElementById('kl-notification-panel');
  if (panel) panel.classList.remove('is-open');
  showToast('All notifications marked as read.', 'info');
}

function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return n.toLocaleString('en-IN');
}

// ═══════════════════════════════════════════════
// 4. WATCHLIST SYSTEM
// ═══════════════════════════════════════════════
function toggleWatchlist(event, lotId) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const lot = lotService.getLotById(lotId);
  const isSaved = buyerService.toggleSaveLot(lotId);

  if (isSaved) {
    showToast(`Added ${lot.crop} (Lot ${lot.id}) to Watchlist.`, 'success');
  } else {
    showToast(`Removed ${lot.crop} (Lot ${lot.id}) from Watchlist.`, 'info');
  }

  // If currently on lots or marketplace or lot-detail, update UI
  if (currentRoute === 'lots') {
    renderView('lots');
  } else if (currentRoute === 'marketplace') {
    applyMarketplaceFilters();
  } else if (currentRoute === 'lot-detail') {
    renderView('lot-detail');
  }
}

// ═══════════════════════════════════════════════
// 5. KYC VIEW & WIZARD
// ═══════════════════════════════════════════════
function renderKycView() {
  const p = buyerService.getProfile();
  const steps = ['Business Info', 'Tax & Identity', 'Document Upload', 'Escrow Bank', 'Review'];

  return `<div class="buyer-view">
    <div class="kl-kyc-layout">
      <div class="kl-kyc-visual">
        <div class="kl-kyc-visual__content">
          <h1 class="kl-kyc-visual__title">Enterprise Procurer Verification</h1>
          <p class="kl-kyc-visual__subtitle">Verify your corporate entity to unlock direct APMC procurement, digital escrow contracts, and volume discounts.</p>
          <div class="kl-kyc-visual__features">
            <div class="kl-kyc-visual__feature"><span class="kl-kyc-visual__feature-icon"><i data-lucide="shield-check"></i></span> Digital Escrow Contract Protection (Up to ₹1 Cr)</div>
            <div class="kl-kyc-visual__feature"><span class="kl-kyc-visual__feature-icon"><i data-lucide="check-circle-2"></i></span> Direct farm-gate procurement from 120+ FPOs</div>
            <div class="kl-kyc-visual__feature"><span class="kl-kyc-visual__feature-icon"><i data-lucide="trending-up"></i></span> Live Mandi Price Trends & AI Crop Matching</div>
            <div class="kl-kyc-visual__feature"><span class="kl-kyc-visual__feature-icon"><i data-lucide="truck"></i></span> Integrated GPS Carrier Tracking & Delivery Inspection</div>
          </div>
        </div>
      </div>

      <div class="kl-kyc-form-panel">
        <div class="kl-kyc-steps">
          ${steps.map((s, i) => `
            <div class="kl-kyc-step ${i < kycActiveStep ? 'kl-kyc-step--done' : ''} ${i === kycActiveStep ? 'kl-kyc-step--active' : ''}" onclick="setKycStep(${i})" style="cursor:pointer;">
              <div class="kl-kyc-step__number">${i < kycActiveStep ? '✓' : i + 1}</div>
              <div class="kl-kyc-step__label">${s}</div>
            </div>
          `).join('')}
        </div>

        ${renderKycStepContent(kycActiveStep, p)}
      </div>
    </div>
  </div>`;
}

function setKycStep(stepIndex) {
  kycActiveStep = stepIndex;
  renderView('kyc');
}

function renderKycStepContent(step, p) {
  if (step === 0) {
    // Step 1: Business Info
    return `
      <h2 style="font-size:20px; font-weight:700; margin-bottom:4px;">1. Business Details</h2>
      <p class="kl-text-sm kl-text-muted kl-mb-lg">Enter your registered company name and operating address.</p>
      <form onsubmit="handleKycStepNext(event, 1)">
        <div class="kl-form-grid kl-form-grid--2 kl-mb-lg">
          <div class="kl-form-group">
            <label class="kl-label kl-label--required">Registered Company Name</label>
            <input type="text" id="kyc-company" class="kl-input" value="${p.companyName}" required>
          </div>
          <div class="kl-form-group">
            <label class="kl-label kl-label--required">Business Entity Type</label>
            <select id="kyc-type" class="kl-select">
              <option value="Private Limited" selected>Private Limited (Pvt Ltd)</option>
              <option value="Public Limited">Public Limited</option>
              <option value="Partnership">Partnership Firm</option>
              <option value="Proprietorship">Sole Proprietorship</option>
              <option value="FMCG Processor">Food Processor & Exporter</option>
            </select>
          </div>
          <div class="kl-form-group">
            <label class="kl-label kl-label--required">Contact Person</label>
            <input type="text" id="kyc-contact" class="kl-input" value="${p.contactPerson}" required>
          </div>
          <div class="kl-form-group">
            <label class="kl-label kl-label--required">Operating District / State</label>
            <input type="text" id="kyc-location" class="kl-input" value="${p.district}, ${p.state}" required>
          </div>
        </div>
        <div class="kl-flex kl-flex-between kl-flex-center">
          <span class="kl-text-xs kl-text-muted"><i data-lucide="lock" style="width:12px;height:12px;vertical-align:middle;"></i> 256-bit Encrypted</span>
          <button type="submit" class="kl-btn kl-btn--primary">Next: Tax & Identity <i data-lucide="arrow-right"></i></button>
        </div>
      </form>`;
  } else if (step === 1) {
    // Step 2: Tax & Identity
    return `
      <h2 style="font-size:20px; font-weight:700; margin-bottom:4px;">2. Tax & Registration Numbers</h2>
      <p class="kl-text-sm kl-text-muted kl-mb-lg">GSTIN and Corporate PAN for automated tax invoicing and e-Way bills.</p>
      <form onsubmit="handleKycStepNext(event, 2)">
        <div class="kl-form-grid kl-form-grid--2 kl-mb-lg">
          <div class="kl-form-group">
            <label class="kl-label kl-label--required">GSTIN (15 Digits)</label>
            <input type="text" id="kyc-gstin" class="kl-input" value="${p.gstin}" maxlength="15" required>
          </div>
          <div class="kl-form-group">
            <label class="kl-label kl-label--required">Corporate PAN (10 Digits)</label>
            <input type="text" id="kyc-pan" class="kl-input" value="${p.pan}" maxlength="10" required>
          </div>
          <div class="kl-form-group">
            <label class="kl-label">CIN / Registration Number</label>
            <input type="text" id="kyc-reg" class="kl-input" value="${p.regNumber}">
          </div>
          <div class="kl-form-group">
            <label class="kl-label">FSSAI License No (If Food Processor)</label>
            <input type="text" id="kyc-fssai" class="kl-input" value="11521034000189" placeholder="14-digit FSSAI number">
          </div>
        </div>
        <div class="kl-flex kl-flex-between kl-flex-center">
          <button type="button" class="kl-btn kl-btn--secondary" onclick="setKycStep(0)"><i data-lucide="arrow-left"></i> Back</button>
          <button type="submit" class="kl-btn kl-btn--primary">Next: Upload Documents <i data-lucide="arrow-right"></i></button>
        </div>
      </form>`;
  } else if (step === 2) {
    // Step 3: Document Upload
    return `
      <h2 style="font-size:20px; font-weight:700; margin-bottom:4px;">3. Upload Business Documents</h2>
      <p class="kl-text-sm kl-text-muted kl-mb-lg">Upload GST registration copy and authorized signatory certificate.</p>
      <form onsubmit="handleKycStepNext(event, 3)">
        <div class="kl-file-upload kl-mb-lg" onclick="simulateFileUpload(this)" style="cursor:pointer;">
          <div class="kl-file-upload__icon"><i data-lucide="upload-cloud"></i></div>
          <div class="kl-file-upload__title">Drag & Drop or Click to Select Documents</div>
          <div class="kl-file-upload__sub">Supported formats: PDF, JPG, PNG (Max 10MB each)</div>
          <div id="uploaded-files-chips" class="kl-flex kl-gap-sm kl-mt-md" style="justify-content:center; flex-wrap:wrap;">
            <span class="kl-badge kl-badge--verified"><i data-lucide="file-check" style="width:12px;height:12px;"></i> GST_Certificate_2026.pdf</span>
            <span class="kl-badge kl-badge--verified"><i data-lucide="file-check" style="width:12px;height:12px;"></i> PAN_Card_Verified.pdf</span>
          </div>
        </div>
        <div class="kl-flex kl-flex-between kl-flex-center">
          <button type="button" class="kl-btn kl-btn--secondary" onclick="setKycStep(1)"><i data-lucide="arrow-left"></i> Back</button>
          <button type="submit" class="kl-btn kl-btn--primary">Next: Escrow Bank Details <i data-lucide="arrow-right"></i></button>
        </div>
      </form>`;
  } else if (step === 3) {
    // Step 4: Bank Details
    return `
      <h2 style="font-size:20px; font-weight:700; margin-bottom:4px;">4. Escrow Settlement Bank Account</h2>
      <p class="kl-text-sm kl-text-muted kl-mb-lg">Designated bank account used for seamless escrow funding and refunds.</p>
      <form onsubmit="handleKycStepNext(event, 4)">
        <div class="kl-form-grid kl-form-grid--2 kl-mb-lg">
          <div class="kl-form-group">
            <label class="kl-label kl-label--required">Account Holder Name</label>
            <input type="text" id="kyc-acc-name" class="kl-input" value="${p.bankDetails.accountHolder}" required>
          </div>
          <div class="kl-form-group">
            <label class="kl-label kl-label--required">Account Number</label>
            <input type="text" id="kyc-acc-num" class="kl-input" value="${p.bankDetails.accountNumber}" required>
          </div>
          <div class="kl-form-group">
            <label class="kl-label kl-label--required">IFSC Code</label>
            <input type="text" id="kyc-ifsc" class="kl-input" value="${p.bankDetails.ifsc}" required>
          </div>
          <div class="kl-form-group">
            <label class="kl-label kl-label--required">Bank & Branch</label>
            <input type="text" id="kyc-bank" class="kl-input" value="${p.bankDetails.bankName} — ${p.bankDetails.branch}" required>
          </div>
        </div>
        <div class="kl-flex kl-flex-between kl-flex-center">
          <button type="button" class="kl-btn kl-btn--secondary" onclick="setKycStep(2)"><i data-lucide="arrow-left"></i> Back</button>
          <button type="submit" class="kl-btn kl-btn--primary">Next: Final Review <i data-lucide="arrow-right"></i></button>
        </div>
      </form>`;
  } else {
    // Step 5: Final Review & Submit
    return `
      <h2 style="font-size:20px; font-weight:700; margin-bottom:4px;">5. Review & Final Verification</h2>
      <p class="kl-text-sm kl-text-muted kl-mb-lg">Confirm details before activating your verified buyer account.</p>
      <div class="kl-card kl-mb-lg" style="background:var(--kl-bg-ivory);">
        <div class="kl-card__body">
          <div class="kl-profile-grid">
            <div class="kl-profile-field"><div class="kl-profile-field__label">Entity Name</div><div class="kl-profile-field__value"><strong>${p.companyName}</strong></div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">GSTIN</div><div class="kl-profile-field__value">${p.gstin}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">PAN</div><div class="kl-profile-field__value">${p.pan}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Bank Account</div><div class="kl-profile-field__value">${p.bankDetails.bankName} (${p.bankDetails.accountNumber})</div></div>
          </div>
        </div>
      </div>
      <div class="kl-flex kl-flex-between kl-flex-center">
        <button type="button" class="kl-btn kl-btn--secondary" onclick="setKycStep(3)"><i data-lucide="arrow-left"></i> Back</button>
        <button type="button" class="kl-btn kl-btn--primary kl-btn--lg" onclick="handleKycFinalSubmit()">Submit & Activate Account ✓</button>
      </div>`;
  }
}

function handleKycStepNext(e, nextStep) {
  e.preventDefault();
  kycActiveStep = nextStep;
  renderView('kyc');
}

function simulateFileUpload(el) {
  showToast('Uploaded document successfully attached.', 'success');
  const chips = document.getElementById('uploaded-files-chips');
  if (chips) {
    chips.innerHTML += `<span class="kl-badge kl-badge--verified"><i data-lucide="file-check" style="width:12px;height:12px;"></i> Uploaded_Doc_${Date.now().toString().slice(-4)}.pdf</span>`;
    if (window.lucide) lucide.createIcons();
  }
}

function handleKycFinalSubmit() {
  buyerService.submitKyc({});
  showToast('KYC successfully approved! Verified buyer status active.', 'success');
  setTimeout(() => {
    window.location.hash = '/buyer/dashboard';
  }, 700);
}

// ═══════════════════════════════════════════════
// 6. DASHBOARD VIEW
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
          <div class="kl-page-header__eyebrow">Enterprise Procurement Hub</div>
          <h1 class="kl-page-header__title">Good morning, ${p.companyName}</h1>
        </div>
        <div class="kl-page-header__actions">
          <span class="kl-badge kl-badge--verified"><i data-lucide="check-circle-2" style="width:12px;height:12px;"></i> KYC Verified</span>
          <button class="kl-btn kl-btn--secondary" onclick="openEditSourcingModal()"><i data-lucide="sliders-horizontal"></i> Sourcing Rules</button>
          <a href="#/buyer/marketplace" class="kl-btn kl-btn--primary"><i data-lucide="search"></i> Source Produce</a>
        </div>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="kl-kpi-grid">
      <div class="kl-kpi-card" onclick="window.location.hash='/buyer/marketplace'" style="cursor:pointer;" title="Explore matched lots">
        <div class="kl-kpi-card__top">Active Requirements <i data-lucide="list-checks"></i></div>
        <div class="kl-kpi-card__val" data-countup="${s.activeRequirements}">0</div>
        <div class="kl-kpi-card__sub">Across 4 Mandi States</div>
      </div>
      <div class="kl-kpi-card" onclick="window.location.hash='/buyer/marketplace'" style="cursor:pointer;" title="View all lots">
        <div class="kl-kpi-card__top">Matching Lots <i data-lucide="package-search"></i></div>
        <div class="kl-kpi-card__val" data-countup="${s.newMatchingLots}">0</div>
        <div class="kl-kpi-card__sub">94% AI Match Score</div>
      </div>
      <div class="kl-kpi-card" onclick="window.location.hash='/buyer/offers'" style="cursor:pointer;" title="View offers">
        <div class="kl-kpi-card__top">Offers Pending <i data-lucide="message-square"></i></div>
        <div class="kl-kpi-card__val" data-countup="${s.offersPending}">0</div>
        <div class="kl-kpi-card__sub">Active Price Negotiations</div>
      </div>
      <div class="kl-kpi-card" onclick="window.location.hash='/buyer/orders'" style="cursor:pointer;" title="View orders">
        <div class="kl-kpi-card__top">Active Orders <i data-lucide="truck"></i></div>
        <div class="kl-kpi-card__val" data-countup="${s.activeOrders}">0</div>
        <div class="kl-kpi-card__sub">In Transit / Confirmed</div>
      </div>
      <div class="kl-kpi-card" onclick="window.location.hash='/buyer/payments'" style="cursor:pointer;" title="View payment ledger">
        <div class="kl-kpi-card__top">Procurement Volume <i data-lucide="wallet"></i></div>
        <div class="kl-kpi-card__val">${s.monthlyProcurement}</div>
        <div class="kl-kpi-card__sub">FY 2026-27</div>
      </div>
    </div>

    <!-- Procurement Intelligence Card -->
    <div class="kl-procurement-card">
      <div class="kl-procurement-card__inner">
        <div class="kl-procurement-card__row">
          <div>
            <div class="kl-flex kl-gap-sm kl-flex-center kl-mb-xs">
              <span class="kl-procurement-card__eyebrow">YOUR CURRENT SOURCING REQUIREMENT</span>
              <button class="kl-btn kl-btn--ghost kl-btn--sm" style="color:#FFFFFF; opacity:0.85; padding:2px 8px; font-size:11px;" onclick="openEditSourcingModal()"><i data-lucide="edit-3" style="width:11px;height:11px;"></i> Edit Rule</button>
            </div>
            <h2 class="kl-procurement-card__title">${req.crop} (${req.grade})</h2>
            <p class="kl-procurement-card__meta">Target Volume: <strong>${req.minQty}–${req.maxQty} ${req.unit}</strong> &nbsp;|&nbsp; Target Price: <strong>₹${fmt(req.targetPriceMin)}–₹${fmt(req.targetPriceMax)}/Q</strong> &nbsp;|&nbsp; Region: <strong>${req.preferredRegion}</strong></p>
          </div>
          <a href="#/buyer/marketplace" class="kl-btn kl-btn--lg" style="background:#FFF;color:var(--kl-evergreen);border:none;white-space:nowrap;">Explore ${s.newMatchingLots} Matched Lots <i data-lucide="arrow-right"></i></a>
        </div>
        <div class="kl-procurement-card__ai">
          <span><i data-lucide="sparkles" style="width:15px;height:15px;color:var(--kl-amber);vertical-align:middle;margin-right:4px;"></i></span>
          <span><strong>AI Procurement Intelligence:</strong> 8 direct FPO lots currently match your exact grade specifications in Nashik APMC with certified low moisture levels. Average price is trending up 4.2% this week.</span>
        </div>
      </div>
    </div>

    <!-- Market Snapshot -->
    <div class="kl-table-wrap">
      <div class="kl-table-wrap__header">
        <span class="kl-table-wrap__title">Live Produce Mandi Price Snapshot</span>
        <a href="#/buyer/marketplace" class="kl-btn kl-btn--ghost kl-btn--sm">View Full Marketplace →</a>
      </div>
      <table class="kl-table">
        <thead><tr><th>Produce</th><th>Current Price</th><th>Weekly Trend</th><th>Demand</th><th>Available Lots</th><th>Action</th></tr></thead>
        <tbody>
          ${snap.map(item => `<tr>
            <td><strong>${item.crop} (${item.grade})</strong></td>
            <td><strong>${item.price}</strong></td>
            <td><span style="color:${item.trendUp ? 'var(--kl-mint)' : 'var(--kl-terracotta)'};font-weight:700;">${item.trend}</span></td>
            <td><span class="kl-badge ${item.demand === 'High Demand' ? 'kl-badge--verified' : 'kl-badge--neutral'}">${item.demand}</span></td>
            <td>${item.lots} Lots Listed</td>
            <td><a href="#/buyer/marketplace" class="kl-btn kl-btn--secondary kl-btn--sm" onclick="filterMarketplaceByCrop('${item.crop.toLowerCase()}')">Source ${item.crop}</a></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function filterMarketplaceByCrop(cropName) {
  window.location.hash = '/buyer/marketplace';
  setTimeout(() => {
    const cropSelect = document.getElementById('mkt-filter-crop');
    if (cropSelect) {
      cropSelect.value = cropName;
      applyMarketplaceFilters();
    }
  }, 100);
}

// ═══════════════════════════════════════════════
// 7. MARKETPLACE VIEW
// ═══════════════════════════════════════════════
function renderMarketplaceView() {
  const lots = marketService.getMarketplaceLots();
  return `<div class="buyer-view">
    <div class="kl-page-header">
      <div class="kl-page-header__row">
        <div>
          <h1 class="kl-page-header__title">B2B Agricultural Sourcing Marketplace</h1>
          <p class="kl-page-header__subtitle">Discover verified FPO and farm-gate produce lots with AI price benchmarking and escrow protection</p>
        </div>
        <div class="kl-page-header__actions">
          <button class="kl-btn kl-btn--secondary" onclick="resetMarketplaceFilters()"><i data-lucide="rotate-ccw"></i> Reset</button>
          <a href="#/buyer/lots" class="kl-btn kl-btn--primary"><i data-lucide="bookmark"></i> View Saved Lots</a>
        </div>
      </div>
    </div>

    <div class="kl-marketplace-layout">
      <!-- Filters Panel -->
      <div class="kl-filter-panel">
        <div class="kl-filter-panel__header">
          <span class="kl-filter-panel__title"><i data-lucide="filter" style="width:14px;height:14px;"></i> Sourcing Filters</span>
          <button class="kl-filter-panel__clear" onclick="resetMarketplaceFilters()">Clear All</button>
        </div>

        <div class="kl-filter-group">
          <label class="kl-filter-group__label">Search Lots</label>
          <input type="text" id="mkt-filter-search" class="kl-input" placeholder="Crop, mandi, seller..." oninput="applyMarketplaceFilters()">
        </div>

        <div class="kl-filter-group">
          <label class="kl-filter-group__label">Crop Category</label>
          <select id="mkt-filter-crop" class="kl-select" onchange="applyMarketplaceFilters()">
            <option value="all">All Crops</option>
            <option value="onion">🧅 Onion</option>
            <option value="wheat">🌾 Wheat</option>
            <option value="soybean">🫘 Soybean</option>
            <option value="rice">🍚 Rice</option>
            <option value="chilli">🌶️ Chilli</option>
            <option value="potato">🥔 Potato</option>
            <option value="tomato">🍅 Tomato</option>
            <option value="cotton">🏵️ Cotton</option>
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
          <select id="mkt-filter-seller" class="kl-select" onchange="applyMarketplaceFilters()">
            <option value="all">All Sellers</option>
            <option value="verified" selected>Verified FPOs / Farmers Only</option>
          </select>
        </div>

        <div class="kl-filter-group">
          <label class="kl-filter-group__label">Max Distance</label>
          <select id="mkt-filter-distance" class="kl-select" onchange="applyMarketplaceFilters()">
            <option value="all">Any Distance</option>
            <option value="50">Within 50 km</option>
            <option value="100">Within 100 km</option>
            <option value="500">Within 500 km</option>
          </select>
        </div>

        <div class="kl-filter-group">
          <label class="kl-filter-group__label">Sort By</label>
          <select id="mkt-filter-sort" class="kl-select" onchange="applyMarketplaceFilters()">
            <option value="match">Highest AI Match</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="trust">Seller Trust Score</option>
            <option value="distance">Nearest Distance</option>
          </select>
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
  if (!lots || !lots.length) {
    return `<div class="kl-empty-state" style="grid-column:1/-1; background:#FFF; padding:48px 24px; border-radius:var(--radius-lg); text-align:center; border:1px dashed var(--kl-border);">
      <div class="kl-empty-state__icon" style="font-size:38px; margin-bottom:12px;">📦</div>
      <h3 class="kl-empty-state__title" style="font-size:18px; font-weight:700; color:var(--kl-charcoal); margin-bottom:6px;">No matching produce lots found</h3>
      <p class="kl-empty-state__text" style="font-size:14px; color:var(--kl-muted); max-width:440px; margin:0 auto 20px;">Try adjusting your search criteria or resetting filters to view all available agricultural lots.</p>
      <button class="kl-btn kl-btn--secondary" onclick="resetMarketplaceFilters()">Reset Filters</button>
    </div>`;
  }

  return lots.map(l => {
    const isSaved = buyerService.isLotSaved(l.id);
    return `
    <div class="kl-lot-card" style="position:relative;">
      <div class="kl-lot-card__image">
        <img src="${l.image}" alt="${l.crop}" loading="lazy">
        <span class="kl-lot-card__match-badge"><span class="kl-badge kl-badge--verified">${l.aiMatchPct}% AI Match</span></span>
        <button class="kl-lot-card__bookmark-btn" onclick="toggleWatchlist(event, '${l.id}')" title="${isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}" style="position:absolute; top:12px; right:12px; z-index:5; width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.92); border:none; display:flex; align-items:center; justify-content:center; color:${isSaved ? '#C96D5B' : '#6F7F75'}; box-shadow:0 2px 8px rgba(0,0,0,0.15); cursor:pointer; transition:transform 0.2s;">
          <i data-lucide="${isSaved ? 'bookmark-check' : 'bookmark'}" style="width:16px;height:16px;"></i>
        </button>
      </div>
      <div class="kl-lot-card__body">
        <div class="kl-lot-card__header-row">
          <span class="kl-lot-card__crop">${l.crop}</span>
          <span class="kl-lot-card__price">₹${fmt(l.sellerAskPrice)}/Q</span>
        </div>
        <div class="kl-lot-card__variety">${l.variety} · ${l.grade} · ${l.quantity} ${l.unit}</div>
        <div class="kl-lot-card__details">
          <div class="kl-lot-card__detail"><span class="kl-lot-card__detail-icon"><i data-lucide="map-pin" style="width:13px;height:13px;color:var(--kl-mint);"></i></span> ${l.location} (${l.distanceKm} km)</div>
          <div class="kl-lot-card__detail"><span class="kl-lot-card__detail-icon"><i data-lucide="building-2" style="width:13px;height:13px;color:var(--kl-slate);"></i></span> ${l.sellerName} ${l.sellerVerified ? '<span class="kl-text-mint kl-fw-700">✓</span>' : ''}</div>
          <div class="kl-lot-card__detail"><span class="kl-lot-card__detail-icon"><i data-lucide="shield-check" style="width:13px;height:13px;color:var(--kl-amber);"></i></span> Trust Score: <strong>${l.sellerTrustScore}/100</strong></div>
        </div>
        <div class="kl-lot-card__footer" style="display:flex; gap:8px;">
          <a href="#/buyer/lots/${l.id}" class="kl-btn kl-btn--primary kl-btn--full">View Lot & Make Offer</a>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function resetMarketplaceFilters() {
  const search = document.getElementById('mkt-filter-search');
  const crop = document.getElementById('mkt-filter-crop');
  const grade = document.getElementById('mkt-filter-grade');
  const seller = document.getElementById('mkt-filter-seller');
  const distance = document.getElementById('mkt-filter-distance');
  const sort = document.getElementById('mkt-filter-sort');

  if (search) search.value = '';
  if (crop) crop.value = 'all';
  if (grade) grade.value = 'all';
  if (seller) seller.value = 'all';
  if (distance) distance.value = 'all';
  if (sort) sort.value = 'match';

  applyMarketplaceFilters();
}

function applyMarketplaceFilters() {
  const search = document.getElementById('mkt-filter-search')?.value || '';
  const crop = document.getElementById('mkt-filter-crop')?.value || 'all';
  const grade = document.getElementById('mkt-filter-grade')?.value || 'all';
  const sellerVerified = document.getElementById('mkt-filter-seller')?.value || 'all';
  const maxDistance = document.getElementById('mkt-filter-distance')?.value || 'all';
  const sort = document.getElementById('mkt-filter-sort')?.value || 'match';

  const lots = marketService.getMarketplaceLots({
    search,
    crop,
    grade,
    sellerVerified,
    maxDistance,
    sort
  });

  const grid = document.getElementById('marketplace-lots-grid');
  if (grid) {
    grid.innerHTML = renderLotCards(lots);
    if (window.lucide) lucide.createIcons();
  }
}

// ═══════════════════════════════════════════════
// 8. LOT DETAIL VIEW
// ═══════════════════════════════════════════════
function renderLotDetailView(lotId) {
  const l = lotService.getLotById(lotId);
  const landed = lotService.calculateLandedCost(l);
  const tb = l.trustBreakdown;
  const isSaved = buyerService.isLotSaved(l.id);
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
                  <span class="kl-badge kl-badge--verified"><i data-lucide="shield-check" style="width:12px;height:12px;"></i> ${l.sellerVerified ? 'Verified FPO Seller' : 'Farmer Listed'}</span>
                </div>
                <p class="kl-lot-hero__meta">Lot ID: <strong>${l.id}</strong> &nbsp;|&nbsp; Mandi: <strong>${l.mandi}</strong> &nbsp;|&nbsp; Quantity: <strong>${l.quantity} ${l.unit}</strong></p>
                <div class="kl-price-pair">
                  <div class="kl-price-box"><div class="kl-price-box__label">Seller Ask Price</div><div class="kl-price-box__value">₹${fmt(l.sellerAskPrice)}/Q</div></div>
                  <div class="kl-price-box kl-price-box--muted"><div class="kl-price-box__label">Mandi Benchmark</div><div class="kl-price-box__value">₹${fmt(l.marketRefPrice)}/Q</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Price Intelligence -->
        <div class="kl-card kl-mb-lg">
          <div class="kl-card__header"><span class="kl-card__header-title"><i data-lucide="trending-up" style="width:15px;height:15px;vertical-align:middle;margin-right:6px;color:var(--kl-mint);"></i> Price Intelligence & Mandi Benchmark</span></div>
          <div class="kl-card__body">
            <p class="kl-text-sm kl-text-muted kl-mb-md">Seller ask price is <strong style="color:${priceDiff > 0 ? 'var(--kl-terracotta)' : 'var(--kl-mint)'};">${priceDiff > 0 ? '+' : ''}${priceDiff}%</strong> ${priceDiff > 0 ? 'above' : 'below'} the current APMC benchmark.</p>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
              <span class="kl-text-xs kl-fw-700" style="width:60px;">₹${fmt(l.marketRangeMin)}</span>
              <div style="flex:1;height:8px;background:var(--kl-border-subtle);border-radius:4px;position:relative;overflow:visible;">
                <div style="position:absolute;left:${Math.min(95, Math.max(5, ((l.marketRefPrice - l.marketRangeMin) / (l.marketRangeMax - l.marketRangeMin)) * 100))}%;top:-4px;width:3px;height:16px;background:var(--kl-muted);border-radius:2px;" title="APMC Benchmark"></div>
                <div style="position:absolute;left:${Math.min(95, Math.max(5, ((l.sellerAskPrice - l.marketRangeMin) / (l.marketRangeMax - l.marketRangeMin)) * 100))}%;top:-6px;width:12px;height:20px;background:var(--kl-mint);border-radius:3px;opacity:0.85;" title="Seller Ask"></div>
              </div>
              <span class="kl-text-xs kl-fw-700" style="width:60px;text-align:right;">₹${fmt(l.marketRangeMax)}</span>
            </div>
            <div class="kl-flex kl-gap-lg kl-text-sm">
              <span>Mandi Price Range: <strong>₹${fmt(l.marketRangeMin)}–₹${fmt(l.marketRangeMax)}/Q</strong></span>
              <span>Available Until: <strong>${l.availableUntil}</strong></span>
            </div>
          </div>
        </div>

        <!-- Quality Analytics -->
        <div class="kl-card kl-mb-lg">
          <div class="kl-card__header"><span class="kl-card__header-title"><i data-lucide="sparkles" style="width:15px;height:15px;vertical-align:middle;margin-right:6px;color:var(--kl-mint);"></i> Quality & AI Grading Analytics</span><span class="kl-badge kl-badge--verified">AI Confidence: ${l.qualityMetrics.aiConfidencePct}%</span></div>
          <div class="kl-card__body">
            <div class="kl-quality-grid">
              <div><div class="kl-quality-item__label">Moisture Content</div><div class="kl-quality-item__value">${l.qualityMetrics.moisturePct}</div></div>
              <div><div class="kl-quality-item__label">Grain Size / Spec</div><div class="kl-quality-item__value">${l.qualityMetrics.sizeMm}</div></div>
              <div><div class="kl-quality-item__label">Defect Percentage</div><div class="kl-quality-item__value">${l.qualityMetrics.defectsPct}</div></div>
              <div><div class="kl-quality-item__label">Assigned Grade</div><div class="kl-quality-item__value kl-quality-item__value--highlight">${l.grade}</div></div>
            </div>
            <p class="kl-text-xs kl-text-muted kl-mt-md"><i data-lucide="info" style="width:12px;height:12px;vertical-align:middle;"></i> Pre-shipment AI assessment. Final inspection verified upon arrival at warehouse.</p>
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
                <div class="kl-trust-bar"><span class="kl-trust-bar__label">KYC Verification</span><div class="kl-trust-bar__track"><div class="kl-trust-bar__fill" style="width:${tb.verification}%"></div></div></div>
                <div class="kl-trust-bar"><span class="kl-trust-bar__label">Quality Reliability</span><div class="kl-trust-bar__track"><div class="kl-trust-bar__fill" style="width:${tb.paymentReliability}%"></div></div></div>
                <div class="kl-trust-bar"><span class="kl-trust-bar__label">Fulfillment Rate</span><div class="kl-trust-bar__track"><div class="kl-trust-bar__fill" style="width:${tb.orderCompletion}%"></div></div></div>
                <div class="kl-trust-bar"><span class="kl-trust-bar__label">Transaction History</span><div class="kl-trust-bar__track"><div class="kl-trust-bar__fill" style="width:${tb.transactionHistory}%"></div></div></div>
              </div>
            </div>
            <div class="kl-flex kl-gap-lg kl-mt-md kl-text-sm kl-text-muted">
              <span><i data-lucide="clipboard-check" style="width:13px;height:13px;vertical-align:middle;"></i> ${l.sellerCompletedOrders} successful orders</span>
              <span><i data-lucide="alert-circle" style="width:13px;height:13px;vertical-align:middle;"></i> Dispute rate: ${l.disputeRate}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Landed Cost -->
      <div>
        <div class="kl-card kl-landed-cost">
          <div class="kl-card__header"><span class="kl-card__header-title"><i data-lucide="calculator" style="width:15px;height:15px;vertical-align:middle;margin-right:6px;color:var(--kl-mint);"></i> Landed Cost Breakdown</span></div>
          <div class="kl-card__body">
            <div class="kl-landed-cost__row"><span>Produce Cost (${l.quantity} Q × ₹${fmt(l.sellerAskPrice)})</span><strong>₹${fmt(landed.productCost)}</strong></div>
            <div class="kl-landed-cost__row"><span>Freight Logistics (${l.distanceKm} km)</span><strong>₹${fmt(landed.transportCost)}</strong></div>
            <div class="kl-landed-cost__row"><span>APMC Mandi Cess</span><strong>₹${fmt(landed.mandiCess)}</strong></div>
            <hr class="kl-landed-cost__divider">
            <div class="kl-landed-cost__row"><span><strong>Estimated Landed Total</strong></span><strong>₹${fmt(landed.grandTotal)}</strong></div>
            <div class="kl-landed-cost__total">
              <span class="kl-landed-cost__total-label">Effective Landed Cost/Q</span>
              <span class="kl-landed-cost__total-value">₹${fmt(landed.effectiveCostPerQ)}/Q</span>
            </div>
            <button class="kl-btn kl-btn--primary kl-btn--full kl-btn--lg kl-mt-lg" onclick="openMakeOfferModal('${l.id}')"><i data-lucide="sparkles" style="width:15px;height:15px;"></i> Make Procurement Bid</button>
            <button class="kl-btn kl-btn--secondary kl-btn--full kl-mt-sm" onclick="toggleWatchlist(event, '${l.id}')"><i data-lucide="${isSaved ? 'bookmark-check' : 'bookmark'}" style="width:14px;height:14px;"></i> ${isSaved ? 'Saved in Watchlist ✓' : 'Add to Watchlist'}</button>
          </div>
        </div>

        <!-- Logistics Estimate -->
        <div class="kl-card kl-mt-lg">
          <div class="kl-card__header"><span class="kl-card__header-title"><i data-lucide="truck" style="width:15px;height:15px;vertical-align:middle;margin-right:6px;color:var(--kl-mint);"></i> Logistics & Dispatch</span></div>
          <div class="kl-card__body">
            <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="map-pin" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Distance to Chakan: <strong>${l.distanceKm} km</strong></span></div>
            <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="credit-card" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Transport Quote: <strong>₹${fmt(l.estimatedTransportTotal)}</strong></span></div>
            <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="clock" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Transit ETA: <strong>${l.distanceKm < 50 ? '2–3 hours' : l.distanceKm < 200 ? '4–6 hours' : '1–2 days'}</strong></span></div>
            <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="package" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Buyer Self-Pickup: <strong>Available</strong></span></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function openMakeOfferModal(lotId) {
  const l = lotService.getLotById(lotId);
  const defaultOffer = l.sellerAskPrice - 50;
  
  showModal('Make Procurement Bid', `
    <p class="kl-text-sm kl-text-muted kl-mb-md">Submit a digital procurement bid for <strong>${l.emoji} ${l.crop} (${l.variety})</strong> listed by <strong>${l.sellerName}</strong></p>
    
    <div class="kl-form-grid kl-form-grid--2 kl-mb-md">
      <div class="kl-form-group">
        <label class="kl-label kl-label--required">Quantity (${l.unit})</label>
        <input type="number" id="modal-offer-qty" class="kl-input" value="${l.quantity}" min="1" max="${l.quantity}" oninput="recalcModalLandedCost('${l.id}')" required>
      </div>
      <div class="kl-form-group">
        <label class="kl-label kl-label--required">Your Bid Price (₹/Q)</label>
        <input type="number" id="modal-offer-price" class="kl-input" value="${defaultOffer}" min="1" oninput="recalcModalLandedCost('${l.id}')" required>
      </div>
    </div>

    <div class="kl-card kl-mb-md" style="background:var(--kl-bg-ivory); padding:12px 14px;">
      <div class="kl-flex kl-flex-between kl-text-xs kl-mb-xs">
        <span class="kl-text-muted">Seller Ask: ₹${fmt(l.sellerAskPrice)}/Q</span>
        <span class="kl-text-muted">Mandi Ref: ₹${fmt(l.marketRefPrice)}/Q</span>
      </div>
      <div class="kl-flex kl-flex-between kl-text-sm" style="font-weight:700;">
        <span>Estimated Escrow Commitment:</span>
        <span id="modal-offer-total" style="color:var(--kl-evergreen);">₹${fmt((defaultOffer * l.quantity) + l.estimatedTransportTotal + (l.mandiCessPerQ * l.quantity))}</span>
      </div>
    </div>

    <div class="kl-form-group">
      <label class="kl-label">Procurement Terms / Note (optional)</label>
      <textarea id="modal-offer-note" class="kl-textarea" placeholder="e.g. Requires prompt delivery at Chakan warehouse within 48h."></textarea>
    </div>
  `, `
    <button class="kl-btn kl-btn--secondary" onclick="closeModal()">Cancel</button>
    <button class="kl-btn kl-btn--primary" onclick="submitOfferFromModal('${l.id}')">Submit Bid <i data-lucide="send"></i></button>
  `);
}

function recalcModalLandedCost(lotId) {
  const l = lotService.getLotById(lotId);
  const qty = parseFloat(document.getElementById('modal-offer-qty')?.value) || l.quantity;
  const price = parseFloat(document.getElementById('modal-offer-price')?.value) || l.sellerAskPrice;
  const total = Math.round((price * qty) + l.estimatedTransportTotal + (l.mandiCessPerQ * qty));
  const el = document.getElementById('modal-offer-total');
  if (el) el.textContent = `₹${fmt(total)}`;
}

function submitOfferFromModal(lotId) {
  const price = document.getElementById('modal-offer-price')?.value;
  const note = document.getElementById('modal-offer-note')?.value || '';
  if (!price) {
    showToast('Please enter your offer price.', 'error');
    return;
  }
  offerService.createOffer(lotId, price, note);
  closeModal();
  showToast(`Procurement bid of ₹${fmt(parseFloat(price))}/Q submitted successfully!`, 'success');
  setTimeout(() => {
    window.location.hash = '/buyer/offers';
  }, 600);
}

// ═══════════════════════════════════════════════
// 9. MY LOTS VIEW
// ═══════════════════════════════════════════════
function renderMyLotsView() {
  const allLots = marketService.getMarketplaceLots();
  const savedIds = buyerService.getSavedLots();
  const savedLots = allLots.filter(l => savedIds.includes(l.id));
  const offers = offerService.getOffers('NEGOTIATING');
  const offerLotIds = offers.map(o => o.lotId);
  const negotiatingLots = allLots.filter(l => offerLotIds.includes(l.id));
  const orders = orderService.getOrders();
  const orderLotIds = orders.map(o => o.lotId);
  const purchasedLots = allLots.filter(l => orderLotIds.includes(l.id));

  return `<div class="buyer-view">
    <div class="kl-page-header">
      <div class="kl-page-header__row">
        <div>
          <h1 class="kl-page-header__title">My Sourced & Shortlisted Lots</h1>
          <p class="kl-page-header__subtitle">Manage saved lots, active negotiations, and confirmed procurement contracts</p>
        </div>
        <div class="kl-page-header__actions">
          <a href="#/buyer/marketplace" class="kl-btn kl-btn--primary"><i data-lucide="plus"></i> Browse Marketplace</a>
        </div>
      </div>
    </div>

    <div class="kl-tabs">
      <button class="kl-tab active" onclick="filterMyLots(this, 'all')">All Lots (${allLots.length})</button>
      <button class="kl-tab" onclick="filterMyLots(this, 'saved')">Watchlist (${savedLots.length})</button>
      <button class="kl-tab" onclick="filterMyLots(this, 'negotiating')">In Negotiation (${negotiatingLots.length})</button>
      <button class="kl-tab" onclick="filterMyLots(this, 'purchased')">Purchased (${purchasedLots.length})</button>
    </div>

    <div class="kl-lot-grid" id="my-lots-grid">
      ${renderLotCards(allLots)}
    </div>
  </div>`;
}

function filterMyLots(btn, filterType) {
  document.querySelectorAll('.kl-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const allLots = marketService.getMarketplaceLots();
  let filtered = allLots;

  if (filterType === 'saved') {
    const savedIds = buyerService.getSavedLots();
    filtered = allLots.filter(l => savedIds.includes(l.id));
  } else if (filterType === 'negotiating') {
    const offers = offerService.getOffers('NEGOTIATING');
    const offerLotIds = offers.map(o => o.lotId);
    filtered = allLots.filter(l => offerLotIds.includes(l.id));
  } else if (filterType === 'purchased') {
    const orders = orderService.getOrders();
    const orderLotIds = orders.map(o => o.lotId);
    filtered = allLots.filter(l => orderLotIds.includes(l.id));
  }

  const grid = document.getElementById('my-lots-grid');
  if (grid) {
    grid.innerHTML = renderLotCards(filtered);
    if (window.lucide) lucide.createIcons();
  }
}

// ═══════════════════════════════════════════════
// 10. OFFERS VIEW & NEGOTIATION
// ═══════════════════════════════════════════════
function renderOffersView() {
  const offers = offerService.getOffers();
  const statusCounts = { NEGOTIATING: 0, ACCEPTED: 0, REJECTED: 0, WITHDRAWN: 0 };
  offers.forEach(o => {
    if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
  });

  return `<div class="buyer-view">
    <div class="kl-page-header">
      <div class="kl-page-header__row">
        <div>
          <h1 class="kl-page-header__title">Digital Offer Negotiations</h1>
          <p class="kl-page-header__subtitle">Manage real-time price bids, counter-offers, and legal escrow commitments</p>
        </div>
        <div class="kl-page-header__actions">
          <a href="#/buyer/marketplace" class="kl-btn kl-btn--primary"><i data-lucide="plus"></i> New Offer</a>
        </div>
      </div>
    </div>

    <div class="kl-tabs">
      <button class="kl-tab active" onclick="filterOffers(this, 'all')">All (${offers.length})</button>
      <button class="kl-tab" onclick="filterOffers(this, 'NEGOTIATING')">Negotiating (${statusCounts.NEGOTIATING})</button>
      <button class="kl-tab" onclick="filterOffers(this, 'ACCEPTED')">Accepted (${statusCounts.ACCEPTED})</button>
      <button class="kl-tab" onclick="filterOffers(this, 'REJECTED')">Rejected (${statusCounts.REJECTED})</button>
      <button class="kl-tab" onclick="filterOffers(this, 'WITHDRAWN')">Withdrawn (${statusCounts.WITHDRAWN})</button>
    </div>

    <div class="kl-flex kl-flex-col kl-gap-md" id="offers-list">
      ${renderOfferCards(offers)}
    </div>
  </div>`;
}

function renderOfferCards(offers) {
  if (!offers.length) {
    return `<div class="kl-empty-state" style="background:#FFF; padding:48px 24px; border-radius:var(--radius-lg); text-align:center; border:1px dashed var(--kl-border);">
      <div class="kl-empty-state__icon" style="font-size:38px; margin-bottom:12px;">💬</div>
      <h3 class="kl-empty-state__title" style="font-size:18px; font-weight:700; color:var(--kl-charcoal); margin-bottom:6px;">No offers in this tab</h3>
      <p class="kl-empty-state__text" style="font-size:14px; color:var(--kl-muted); max-width:440px; margin:0 auto 20px;">Browse the marketplace to discover produce lots and submit your digital procurement bids.</p>
      <a href="#/buyer/marketplace" class="kl-btn kl-btn--primary">Explore Produce Lots</a>
    </div>`;
  }

  const badgeMap = {
    NEGOTIATING: 'kl-badge--pending',
    ACCEPTED: 'kl-badge--verified',
    REJECTED: 'kl-badge--rejected',
    WITHDRAWN: 'kl-badge--neutral'
  };

  return offers.map(o => `
    <div class="kl-offer-card">
      <div class="kl-offer-card__header">
        <div>
          <span class="kl-badge ${badgeMap[o.status] || 'kl-badge--neutral'} kl-mb-sm">${o.status}</span>
          <h3 class="kl-offer-card__crop">${o.crop} (${o.quantity} Quintals)</h3>
          <p class="kl-offer-card__meta">Seller / FPO: <strong>${o.sellerName}</strong> &nbsp;|&nbsp; Updated: ${o.updatedAt}</p>
        </div>
      </div>
      <div class="kl-offer-card__prices">
        <div class="kl-offer-card__price-col"><div class="kl-offer-card__price-label">Your Bid</div><div class="kl-offer-card__price-val kl-offer-card__price-val--buyer">₹${fmt(o.currentBuyerOffer)}/Q</div></div>
        <div class="kl-offer-card__price-col"><div class="kl-offer-card__price-label">Seller Ask</div><div class="kl-offer-card__price-val kl-offer-card__price-val--seller">₹${fmt(o.sellerAsk)}/Q</div></div>
      </div>
      <!-- Negotiation Timeline -->
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
          <button class="kl-btn kl-btn--danger kl-btn--sm" onclick="openWithdrawOfferModal('${o.id}')">Withdraw Bid</button>
          <button class="kl-btn kl-btn--secondary kl-btn--sm" onclick="openCounterOfferModal('${o.id}')">Counter Offer</button>
          <button class="kl-btn kl-btn--primary kl-btn--sm" onclick="acceptOffer('${o.id}')">Accept Seller Ask (₹${fmt(o.sellerAsk)}/Q)</button>
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
  if (list) {
    list.innerHTML = renderOfferCards(offers);
    if (window.lucide) lucide.createIcons();
  }
}

function acceptOffer(offerId) {
  const res = offerService.acceptOffer(offerId);
  if (res) {
    showToast(`Offer Accepted! Order ${res.order.id} generated with escrow reservation.`, 'success');
    setTimeout(() => {
      window.location.hash = '/buyer/orders';
    }, 700);
  }
}

function openWithdrawOfferModal(offerId) {
  showModal('Withdraw Procurement Bid', `
    <p class="kl-text-sm kl-text-muted kl-mb-md">Are you sure you want to withdraw this procurement bid? The seller will be notified that negotiation is concluded.</p>
  `, `
    <button class="kl-btn kl-btn--secondary" onclick="closeModal()">Cancel</button>
    <button class="kl-btn kl-btn--danger" onclick="confirmWithdrawOffer('${offerId}')">Confirm Withdraw</button>
  `);
}

function confirmWithdrawOffer(offerId) {
  offerService.withdrawOffer(offerId);
  closeModal();
  showToast('Procurement bid withdrawn.', 'info');
  renderView('offers');
}

function openCounterOfferModal(offerId) {
  const offer = INITIAL_OFFERS_DATA.find(o => o.id === offerId);
  if (!offer) return;

  showModal('Submit Revised Counter Offer', `
    <p class="kl-text-sm kl-text-muted kl-mb-md">Current Seller Ask: <strong>₹${fmt(offer.sellerAsk)}/Q</strong> &nbsp;|&nbsp; Your Last Bid: <strong>₹${fmt(offer.currentBuyerOffer)}/Q</strong></p>
    <div class="kl-form-group kl-mb-md">
      <label class="kl-label kl-label--required">New Counter Offer (₹/Quintal)</label>
      <input type="number" id="counter-price-input" class="kl-input" value="${offer.currentBuyerOffer + 15}" min="1" required>
    </div>
    <div class="kl-form-group">
      <label class="kl-label">Add Note for Seller (optional)</label>
      <textarea id="counter-note-input" class="kl-textarea" placeholder="e.g. Ready for instant escrow deposit if accepted today."></textarea>
    </div>
  `, `
    <button class="kl-btn kl-btn--secondary" onclick="closeModal()">Cancel</button>
    <button class="kl-btn kl-btn--primary" onclick="submitCounterOffer('${offerId}')">Send Counter Bid <i data-lucide="send"></i></button>
  `);
}

function submitCounterOffer(offerId) {
  const price = document.getElementById('counter-price-input')?.value;
  const note = document.getElementById('counter-note-input')?.value || '';
  if (!price) return;
  offerService.counterOffer(offerId, price, note);
  closeModal();
  showToast(`Counter offer of ₹${fmt(parseFloat(price))}/Q sent to seller.`, 'success');
  renderView('offers');
}

// ═══════════════════════════════════════════════
// 11. ORDERS & ORDER DETAIL VIEW
// ═══════════════════════════════════════════════
function renderOrdersView() {
  const orders = orderService.getOrders();
  const badgeMap = {
    CONFIRMED: 'kl-badge--pending',
    IN_TRANSIT: 'kl-badge--transit',
    DELIVERED: 'kl-badge--completed'
  };

  return `<div class="buyer-view">
    <div class="kl-page-header">
      <div class="kl-page-header__row">
        <div>
          <h1 class="kl-page-header__title">Procurement Orders & Shipments</h1>
          <p class="kl-page-header__subtitle">Track active agricultural shipments, manage delivery inspections, and view escrow settlements</p>
        </div>
        <div class="kl-page-header__actions">
          <a href="#/buyer/logistics" class="kl-btn kl-btn--secondary"><i data-lucide="map-pin"></i> Live GPS Tracking</a>
          <a href="#/buyer/marketplace" class="kl-btn kl-btn--primary"><i data-lucide="plus"></i> New Order</a>
        </div>
      </div>
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
                <div class="kl-text-xs kl-text-muted">Grand Total (Escrow)</div>
                <div style="font-size:20px;font-weight:800;color:var(--kl-evergreen);">₹${fmt(o.grandTotal)}</div>
                <span class="kl-text-xs" style="color:var(--kl-mint);font-weight:700;">${o.paymentStatus}</span>
              </div>
            </div>

            <!-- Timeline -->
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
              <a href="#/buyer/orders/${o.id}" class="kl-btn kl-btn--ghost kl-btn--sm"><i data-lucide="eye"></i> Order Details</a>
              ${o.status === 'IN_TRANSIT' ? `<a href="#/buyer/logistics" class="kl-btn kl-btn--secondary kl-btn--sm"><i data-lucide="map-pin"></i> Live Tracking</a>` : ''}
              ${o.status === 'IN_TRANSIT' || o.status === 'CONFIRMED' ? `<button class="kl-btn kl-btn--primary kl-btn--sm" onclick="openConfirmDeliveryModal('${o.id}')"><i data-lucide="check-square"></i> Confirm Inspection & Release</button>` : ''}
              <button class="kl-btn kl-btn--secondary kl-btn--sm" onclick="openInvoiceModal('tx-${o.id.replace('ord-','')}')"><i data-lucide="file-text"></i> Invoice</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

function renderOrderDetailView(orderId) {
  const o = orderService.getOrderById(orderId);
  return `<div class="buyer-view">
    <a href="#/buyer/orders" class="kl-btn kl-btn--ghost kl-mb-md" style="padding-left:0;"><i data-lucide="arrow-left" style="width:14px;height:14px;"></i> Back to Orders</a>
    <div class="kl-page-header">
      <div class="kl-page-header__row">
        <div>
          <h1 class="kl-page-header__title">Order ${o.id} Breakdown</h1>
          <p class="kl-page-header__subtitle">Seller: ${o.sellerName} · Placed on ${o.orderedAt}</p>
        </div>
        <div class="kl-page-header__actions">
          <button class="kl-btn kl-btn--secondary" onclick="openInvoiceModal('tx-88901')"><i data-lucide="download"></i> Download Tax Invoice</button>
        </div>
      </div>
    </div>

    <div class="kl-lot-detail-layout">
      <div>
        <div class="kl-card kl-mb-lg">
          <div class="kl-card__header"><span class="kl-card__header-title">Consignment & Milestone Progress</span><span class="kl-badge kl-badge--verified">${o.status}</span></div>
          <div class="kl-card__body">
            <h3 style="font-size:18px;font-weight:700;margin-bottom:12px;">${o.crop} — ${o.variety} (${o.quantity} Quintals)</h3>
            <p class="kl-text-sm kl-text-muted kl-mb-lg">From: <strong>${o.pickupAddress}</strong> → Destination: <strong>${o.deliveryAddress}</strong></p>
            <div class="kl-order-timeline">
              ${o.timeline.map(t => `
                <div class="kl-timeline-step ${t.done ? 'kl-timeline-step--done' : 'kl-timeline-step--pending'} ${t.active ? 'kl-timeline-step--active' : ''}">
                  <div class="kl-timeline-step__dot"></div>
                  <div class="kl-timeline-step__title">${t.label}</div>
                  <div class="kl-timeline-step__meta">${t.time} — ${t.party}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="kl-card">
          <div class="kl-card__header"><span class="kl-card__header-title"><i data-lucide="truck" style="width:15px;height:15px;vertical-align:middle;margin-right:6px;"></i> Assigned Carrier Details</span></div>
          <div class="kl-card__body">
            <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="truck"></i></span> <span>Vehicle: <strong>${o.logistics.truckNumber}</strong></span></div>
            <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="user"></i></span> <span>Driver: <strong>${o.logistics.driverName}</strong></span></div>
            <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="phone"></i></span> <span>Contact: <strong>${o.logistics.driverPhone}</strong></span></div>
            <div class="kl-flex kl-gap-sm kl-mt-md">
              <a href="#/buyer/logistics" class="kl-btn kl-btn--primary kl-btn--sm"><i data-lucide="map-pin"></i> View Live GPS Track</a>
              <button class="kl-btn kl-btn--secondary kl-btn--sm" onclick="showToast('Connecting to dispatch...', 'info')"><i data-lucide="phone-call"></i> Call Driver</button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="kl-card kl-landed-cost">
          <div class="kl-card__header"><span class="kl-card__header-title"><i data-lucide="calculator" style="width:15px;height:15px;vertical-align:middle;margin-right:6px;"></i> Escrow Settlement Summary</span></div>
          <div class="kl-card__body">
            <div class="kl-landed-cost__row"><span>Produce Total (${o.quantity} Q × ₹${fmt(o.pricePerQ)})</span><strong>₹${fmt(o.productTotal)}</strong></div>
            <div class="kl-landed-cost__row"><span>Freight Logistics</span><strong>₹${fmt(o.transportCost)}</strong></div>
            <div class="kl-landed-cost__row"><span>Mandi APMC Cess</span><strong>₹${fmt(o.taxesTotal)}</strong></div>
            <hr class="kl-landed-cost__divider">
            <div class="kl-landed-cost__row"><span><strong>Total In Escrow</strong></span><strong>₹${fmt(o.grandTotal)}</strong></div>
            <div class="kl-landed-cost__total">
              <span class="kl-landed-cost__total-label">Payment Status</span>
              <span class="kl-landed-cost__total-value" style="font-size:16px;">${o.paymentStatus}</span>
            </div>
            ${o.status !== 'DELIVERED' ? `
              <button class="kl-btn kl-btn--primary kl-btn--full kl-btn--lg kl-mt-lg" onclick="openConfirmDeliveryModal('${o.id}')"><i data-lucide="check-circle-2"></i> Quality Inspection Approved (Release Escrow)</button>
            ` : `
              <div class="kl-badge kl-badge--verified kl-mt-lg kl-p-md" style="width:100%; text-align:center;">✓ Delivery & Escrow Released to Seller</div>
            `}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function openConfirmDeliveryModal(orderId) {
  showModal('Confirm Quality Inspection & Release Escrow', `
    <p class="kl-text-sm kl-text-muted kl-mb-md">Confirm that the produce lot for <strong>${orderId}</strong> has arrived at your warehouse, passed quality checks, and is ready for full escrow settlement to the seller.</p>
    <div class="kl-form-group">
      <label class="kl-label">Inspection Grade Result</label>
      <select class="kl-select">
        <option>Grade A — Full Specifications Met (100% Payout)</option>
        <option>Minor Moisture Variance (Approved with Bonus)</option>
      </select>
    </div>
    <div class="kl-form-group kl-mt-sm">
      <label class="kl-label">Warehouse Inspector Initials</label>
      <input type="text" class="kl-input" value="RP — Quality Lead, Chakan Warehouse" readonly>
    </div>
  `, `
    <button class="kl-btn kl-btn--secondary" onclick="closeModal()">Cancel</button>
    <button class="kl-btn kl-btn--primary" onclick="confirmReleaseEscrow('${orderId}')">Confirm & Release Payment ✓</button>
  `);
}

function confirmReleaseEscrow(orderId) {
  orderService.confirmQualityAndRelease(orderId);
  closeModal();
  showToast(`Escrow released for order ${orderId}. Transaction completed!`, 'success');
  renderView('orders');
}

// ═══════════════════════════════════════════════
// 12. LOGISTICS GPS VIEW & LIVE SIMULATION
// ═══════════════════════════════════════════════
function renderLogisticsView() {
  const tracking = logisticsService.getTrackingInfo('ord-10245');
  return `<div class="buyer-view">
    <div class="kl-page-header">
      <div class="kl-page-header__row">
        <div>
          <h1 class="kl-page-header__title">Live GPS Logistics Tracking</h1>
          <p class="kl-page-header__subtitle">Real-time telemetry and waypoint tracking for active agricultural consignments</p>
        </div>
        <div class="kl-page-header__actions">
          <button class="kl-btn kl-btn--secondary" onclick="simulateLogisticsTrip()"><i data-lucide="play"></i> Simulate Truck Live Movement</button>
        </div>
      </div>
    </div>

    <div class="kl-logistics-layout">
      <div class="kl-logistics-map" id="buyer-logistics-map"></div>
      <div class="kl-logistics-panel">
        <div class="kl-logistics-info-card">
          <div class="kl-logistics-info-card__title"><i data-lucide="truck" style="width:15px;height:15px;"></i> Active Consignment</div>
          <span class="kl-badge kl-badge--transit kl-mb-md" id="logistics-badge-status">${tracking.status}</span>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="truck" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Truck: <strong>${tracking.truckNumber}</strong></span></div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="user" style="width:14px;height:14px;color:var(--kl-slate);"></i></span> <span>Driver: <strong>${tracking.driverName}</strong></span></div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="phone" style="width:14px;height:14px;color:var(--kl-slate);"></i></span> <span>Phone: <strong>${tracking.driverPhone}</strong></span></div>
        </div>

        <div class="kl-logistics-info-card">
          <div class="kl-logistics-info-card__title"><i data-lucide="navigation" style="width:15px;height:15px;"></i> Highway Route Telemetry</div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="map-pin" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Current: <strong id="logistics-current-loc">${tracking.currentLocation}</strong></span></div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="clock" style="width:14px;height:14px;color:var(--kl-amber);"></i></span> <span>ETA: <strong style="color:var(--kl-mint);" id="logistics-eta">${tracking.eta}</strong></span></div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="milestone" style="width:14px;height:14px;color:var(--kl-slate);"></i></span> <span>Remaining: <strong id="logistics-rem-km">${tracking.distanceRemainingKm} km</strong></span></div>
        </div>

        <div class="kl-logistics-info-card">
          <div class="kl-logistics-info-card__title"><i data-lucide="package" style="width:15px;height:15px;"></i> Produce Consignment</div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="sprout" style="width:14px;height:14px;color:var(--kl-mint);"></i></span> <span>Item: <strong>${tracking.crop} (${tracking.quantity} Quintals)</strong></span></div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="upload" style="width:14px;height:14px;color:var(--kl-slate);"></i></span> <span>Origin: <strong>${tracking.pickupAddress}</strong></span></div>
          <div class="kl-logistics-detail"><span class="kl-logistics-detail__icon"><i data-lucide="building" style="width:14px;height:14px;color:var(--kl-slate);"></i></span> <span>Destination: <strong>${tracking.deliveryAddress}</strong></span></div>
        </div>
      </div>
    </div>
  </div>`;
}

let truckMarkerInstance = null;

function initLogisticsMap() {
  const container = document.getElementById('buyer-logistics-map');
  if (!container || !window.L) return;
  if (activeMapInstance) {
    try { activeMapInstance.remove(); } catch (e) {}
  }

  const nashik = [19.9975, 73.7898];
  const pune = [18.7180, 73.8567]; // Chakan MIDC Area
  const truck = [19.2500, 73.8200];

  activeMapInstance = L.map('buyer-logistics-map').setView(truck, 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(activeMapInstance);

  const greenIcon = L.divIcon({
    html: '<div style="background:#5B9A72;color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;font-weight:700;">A</div>',
    className: '',
    iconSize: [30, 30]
  });
  const truckIcon = L.divIcon({
    html: '<div style="background:#12372A;color:#8FCB9B;border:2px solid #8FCB9B;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.4);font-size:14px;">🚚</div>',
    className: '',
    iconSize: [36, 36]
  });
  const destIcon = L.divIcon({
    html: '<div style="background:#C96D5B;color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;font-weight:700;">B</div>',
    className: '',
    iconSize: [30, 30]
  });

  L.marker(nashik, { icon: greenIcon }).addTo(activeMapInstance).bindPopup('<b>Origin:</b> Nashik APMC Yard No 4');
  L.marker(pune, { icon: destIcon }).addTo(activeMapInstance).bindPopup('<b>Destination:</b> ABC Foods Warehouse, Chakan');
  truckMarkerInstance = L.marker(truck, { icon: truckIcon }).addTo(activeMapInstance).bindPopup('<b>Truck MH 04 AB 1234</b><br>Speed: 52 km/h · Temperature: Controlled').openPopup();

  L.polyline([nashik, truck, pune], {
    color: '#5B9A72',
    weight: 4,
    opacity: 0.85,
    dashArray: '6, 6'
  }).addTo(activeMapInstance);
}

function simulateLogisticsTrip() {
  if (!activeMapInstance || !truckMarkerInstance) return;
  showToast('Live GPS simulation running along highway route...', 'info');

  const waypoints = [
    { pos: [19.2500, 73.8200], loc: 'Khed Toll Plaza', km: 42, eta: '2h 10m' },
    { pos: [19.0500, 73.8350], loc: 'Manchar Bypass', km: 28, eta: '1h 25m' },
    { pos: [18.8600, 73.8450], loc: 'Rajgurunagar Flyover', km: 14, eta: '45m' },
    { pos: [18.7200, 73.8560], loc: 'Chakan Industrial Gate 2', km: 2, eta: '10m' }
  ];

  let idx = 0;
  if (logisticsSimInterval) clearInterval(logisticsSimInterval);

  logisticsSimInterval = setInterval(() => {
    if (idx >= waypoints.length) {
      clearInterval(logisticsSimInterval);
      showToast('Consignment reached Chakan warehouse destination!', 'success');
      const locEl = document.getElementById('logistics-current-loc');
      const etaEl = document.getElementById('logistics-eta');
      const kmEl = document.getElementById('logistics-rem-km');
      if (locEl) locEl.textContent = 'Arrived at Chakan Dock';
      if (etaEl) etaEl.textContent = 'Arrived';
      if (kmEl) kmEl.textContent = '0 km';
      return;
    }

    const wp = waypoints[idx];
    truckMarkerInstance.setLatLng(wp.pos);
    activeMapInstance.panTo(wp.pos);

    const locEl = document.getElementById('logistics-current-loc');
    const etaEl = document.getElementById('logistics-eta');
    const kmEl = document.getElementById('logistics-rem-km');

    if (locEl) locEl.textContent = wp.loc;
    if (etaEl) etaEl.textContent = wp.eta;
    if (kmEl) kmEl.textContent = `${wp.km} km`;

    idx++;
  }, 1800);
}

// ═══════════════════════════════════════════════
// 13. PAYMENTS & ESCROW LEDGER VIEW
// ═══════════════════════════════════════════════
function renderPaymentsView() {
  const p = paymentService.getSummary();
  const txs = paymentService.getTransactions();
  const badgeMap = {
    COMPLETED: 'kl-badge--completed',
    HELD: 'kl-badge--pending'
  };

  return `<div class="buyer-view">
    <div class="kl-page-header">
      <div class="kl-page-header__row">
        <div>
          <h1 class="kl-page-header__title">Procurement Escrow & Payment Ledger</h1>
          <p class="kl-page-header__subtitle">Manage locked escrow reserves, track direct bank payouts to FPOs, and download tax invoices</p>
        </div>
        <div class="kl-page-header__actions">
          <button class="kl-btn kl-btn--secondary" onclick="openDepositEscrowModal()"><i data-lucide="plus-circle"></i> Top-up Escrow Reserve</button>
          <button class="kl-btn kl-btn--primary" onclick="openInvoiceModal('tx-88901')"><i data-lucide="receipt"></i> Recent Invoice</button>
        </div>
      </div>
    </div>

    <div class="kl-kpi-grid" style="grid-template-columns:repeat(4,1fr);">
      <div class="kl-kpi-card"><div class="kl-kpi-card__top">Total Volume <i data-lucide="bar-chart-2"></i></div><div class="kl-kpi-card__val">${p.totalProcurement}</div><div class="kl-kpi-card__sub">FY 2026-27</div></div>
      <div class="kl-kpi-card"><div class="kl-kpi-card__top">In Escrow <i data-lucide="lock"></i></div><div class="kl-kpi-card__val" style="color:var(--kl-amber);">${p.pendingEscrow}</div><div class="kl-kpi-card__sub">Active Contracts</div></div>
      <div class="kl-kpi-card"><div class="kl-kpi-card__top">Released / Settled <i data-lucide="check-circle-2"></i></div><div class="kl-kpi-card__val" style="color:var(--kl-mint);">${p.paidCompleted}</div><div class="kl-kpi-card__sub">Completed Orders</div></div>
      <div class="kl-kpi-card"><div class="kl-kpi-card__top">Ledger Entries <i data-lucide="list"></i></div><div class="kl-kpi-card__val">${p.transactionCount}</div><div class="kl-kpi-card__sub">All Invoices</div></div>
    </div>

    <div class="kl-tabs kl-mb-md">
      <button class="kl-tab active" onclick="filterPayments(this, 'all')">All Transactions (${txs.length})</button>
      <button class="kl-tab" onclick="filterPayments(this, 'HELD')">Held in Escrow</button>
      <button class="kl-tab" onclick="filterPayments(this, 'COMPLETED')">Completed Releases</button>
    </div>

    <div class="kl-table-wrap">
      <div class="kl-table-wrap__header">
        <span class="kl-table-wrap__title">Procurement Transaction History</span>
      </div>
      <table class="kl-table" id="payments-table">
        <thead><tr><th>Tx ID</th><th>Date</th><th>Seller / Recipient</th><th>Consignment</th><th>Amount</th><th>Type</th><th>Escrow Status</th><th>Invoice</th></tr></thead>
        <tbody>
          ${renderPaymentTableRows(txs)}
        </tbody>
      </table>
    </div>
  </div>`;
}

function renderPaymentTableRows(txs) {
  const badgeMap = {
    COMPLETED: 'kl-badge--completed',
    HELD: 'kl-badge--pending'
  };

  return txs.map(t => `<tr>
    <td><strong>${t.id}</strong></td>
    <td>${t.date}</td>
    <td>${t.seller}</td>
    <td>${t.crop}</td>
    <td><strong>₹${fmt(t.amount)}</strong></td>
    <td class="kl-text-sm">${t.type}</td>
    <td><span class="kl-badge ${badgeMap[t.status] || 'kl-badge--neutral'}">${t.status}</span></td>
    <td><button class="kl-btn kl-btn--ghost kl-btn--sm" onclick="openInvoiceModal('${t.id}')"><i data-lucide="file-text" style="width:13px;height:13px;"></i> Invoice</button></td>
  </tr>`).join('');
}

function filterPayments(btn, status) {
  document.querySelectorAll('.kl-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const txs = paymentService.getTransactions(status);
  const tbody = document.querySelector('#payments-table tbody');
  if (tbody) {
    tbody.innerHTML = renderPaymentTableRows(txs);
    if (window.lucide) lucide.createIcons();
  }
}

function openDepositEscrowModal() {
  showModal('Deposit Funds to Escrow Vault', `
    <p class="kl-text-sm kl-text-muted kl-mb-md">Pre-fund your procurement escrow vault via RTGS/NEFT to enable instant digital bidding.</p>
    <div class="kl-form-group kl-mb-md">
      <label class="kl-label kl-label--required">Deposit Amount (₹)</label>
      <input type="number" id="deposit-escrow-amount" class="kl-input" value="500000" min="10000" step="10000" required>
    </div>
    <div class="kl-card" style="background:var(--kl-bg-ivory); padding:12px 14px;">
      <div class="kl-text-xs kl-text-muted kl-mb-xs">Beneficiary Escrow Account:</div>
      <div class="kl-text-sm" style="font-weight:700;">KrishiShetra Agri-Escrow Trust · HDFC Bank (IFSC: HDFC0001234)</div>
    </div>
  `, `
    <button class="kl-btn kl-btn--secondary" onclick="closeModal()">Cancel</button>
    <button class="kl-btn kl-btn--primary" onclick="submitDepositEscrow()">Confirm Allocation <i data-lucide="check"></i></button>
  `);
}

function submitDepositEscrow() {
  const amount = document.getElementById('deposit-escrow-amount')?.value;
  if (!amount) return;
  paymentService.depositFunds(amount);
  closeModal();
  showToast(`₹${fmt(parseFloat(amount))} allocated to escrow vault successfully!`, 'success');
  renderView('payments');
}

function openInvoiceModal(txId) {
  const tx = INITIAL_TRANSACTIONS_DATA.find(t => t.id === txId) || INITIAL_TRANSACTIONS_DATA[0];
  const p = buyerService.getProfile();

  showModal(`GST Tax Invoice — ${tx.invoiceId}`, `
    <div style="font-family:sans-serif; color:var(--kl-charcoal); line-height:1.5;">
      <div class="kl-flex kl-flex-between kl-mb-md" style="border-bottom:2px solid var(--kl-border); padding-bottom:12px;">
        <div>
          <h2 style="font-size:20px; font-weight:800; color:var(--kl-evergreen);">KrishiShetra B2B AgriTech</h2>
          <p class="kl-text-xs kl-text-muted">GSTIN: 27AAACK1234F1Z8 · APMC Licensed Intermediary</p>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700; font-size:15px;">${tx.invoiceId}</div>
          <div class="kl-text-xs kl-text-muted">Date: ${tx.date}</div>
        </div>
      </div>

      <div class="kl-form-grid kl-form-grid--2 kl-mb-md" style="font-size:13px;">
        <div>
          <strong>Billed To:</strong><br>
          ${p.companyName}<br>
          GSTIN: ${p.gstin}<br>
          ${p.address}, ${p.district}
        </div>
        <div>
          <strong>Seller / FPO:</strong><br>
          ${tx.seller}<br>
          Transaction: ${tx.id}<br>
          Order Reference: ${tx.orderId}
        </div>
      </div>

      <table class="kl-table kl-mb-md" style="font-size:13px;">
        <thead><tr><th>Description</th><th>HSN</th><th>Amount (₹)</th></tr></thead>
        <tbody>
          <tr>
            <td>${tx.crop} (Grade A Produce)</td>
            <td>0703</td>
            <td>₹${fmt(tx.amount - 5500)}</td>
          </tr>
          <tr>
            <td>Freight Logistics & GPS Transport</td>
            <td>9965</td>
            <td>₹4,000</td>
          </tr>
          <tr>
            <td>APMC Mandi Cess & Inspection Fee</td>
            <td>9986</td>
            <td>₹1,500</td>
          </tr>
          <tr style="font-weight:800; background:var(--kl-bg-ivory);">
            <td colspan="2">Grand Total (Escrow Settlement)</td>
            <td>₹${fmt(tx.amount)}</td>
          </tr>
        </tbody>
      </table>
      <div class="kl-text-xs kl-text-muted" style="text-align:center;">This is a computer-generated digital invoice backed by KrishiShetra Escrow Settlement Engine.</div>
    </div>
  `, `
    <button class="kl-btn kl-btn--secondary" onclick="closeModal()">Close</button>
    <button class="kl-btn kl-btn--primary" onclick="window.print()"><i data-lucide="printer"></i> Print Invoice</button>
  `);
}

// ═══════════════════════════════════════════════
// 14. PROFILE & SOURCING RULES VIEW
// ═══════════════════════════════════════════════
function renderProfileView() {
  const p = buyerService.getProfile();
  return `<div class="buyer-view">
    <div class="kl-page-header">
      <div class="kl-page-header__row">
        <div>
          <h1 class="kl-page-header__title">Procurer Business Profile</h1>
          <p class="kl-page-header__subtitle">Manage corporate entity credentials, escrow bank details, and automated sourcing rules</p>
        </div>
        <div class="kl-page-header__actions">
          <button class="kl-btn kl-btn--secondary" onclick="openEditProfileModal()"><i data-lucide="edit"></i> Edit Business Info</button>
          <button class="kl-btn kl-btn--primary" onclick="openEditSourcingModal()"><i data-lucide="sliders"></i> Sourcing Rules</button>
        </div>
      </div>
    </div>

    <div class="kl-profile-layout">
      <!-- Business Profile -->
      <div class="kl-profile-section">
        <div class="kl-profile-section__header">
          <span class="kl-profile-section__title"><i data-lucide="building-2" style="width:16px;height:16px;"></i> Business Information</span>
          <span class="kl-badge kl-badge--verified">✓ ${p.kycStatus}</span>
        </div>
        <div class="kl-profile-section__body">
          <div class="kl-profile-grid">
            <div class="kl-profile-field"><div class="kl-profile-field__label">Company Name</div><div class="kl-profile-field__value"><strong>${p.companyName}</strong></div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Business Type</div><div class="kl-profile-field__value">${p.businessType}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Registration No.</div><div class="kl-profile-field__value">${p.regNumber}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">GSTIN</div><div class="kl-profile-field__value">${p.gstin}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">PAN</div><div class="kl-profile-field__value">${p.pan}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">KYC Verified Date</div><div class="kl-profile-field__value">${p.kycSubmittedAt}</div></div>
          </div>
        </div>
      </div>

      <!-- Sourcing Preferences -->
      <div class="kl-profile-section">
        <div class="kl-profile-section__header">
          <span class="kl-profile-section__title"><i data-lucide="sliders" style="width:16px;height:16px;"></i> Active Sourcing Requirements</span>
          <button class="kl-btn kl-btn--ghost kl-btn--sm" onclick="openEditSourcingModal()"><i data-lucide="edit-3"></i> Edit</button>
        </div>
        <div class="kl-profile-section__body">
          <div class="kl-profile-grid">
            <div class="kl-profile-field"><div class="kl-profile-field__label">Primary Crop</div><div class="kl-profile-field__value"><strong>${p.sourcingRequirements.crop}</strong></div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Target Volume</div><div class="kl-profile-field__value">${p.sourcingRequirements.minQty}–${p.sourcingRequirements.maxQty} ${p.sourcingRequirements.unit}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Quality Requirement</div><div class="kl-profile-field__value">${p.sourcingRequirements.grade}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Preferred Region</div><div class="kl-profile-field__value">${p.sourcingRequirements.preferredRegion}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Target Price Range</div><div class="kl-profile-field__value"><strong>₹${fmt(p.sourcingRequirements.targetPriceMin)}–₹${fmt(p.sourcingRequirements.targetPriceMax)}/Q</strong></div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Language / Currency</div><div class="kl-profile-field__value">${p.preferences.language} (${p.preferences.currency})</div></div>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="kl-profile-section">
        <div class="kl-profile-section__header">
          <span class="kl-profile-section__title"><i data-lucide="contact" style="width:16px;height:16px;"></i> Contact & Facility Location</span>
        </div>
        <div class="kl-profile-section__body">
          <div class="kl-profile-grid">
            <div class="kl-profile-field"><div class="kl-profile-field__label">Contact Person</div><div class="kl-profile-field__value">${p.contactPerson}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Procurement Email</div><div class="kl-profile-field__value">${p.email}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Mobile Phone</div><div class="kl-profile-field__value">${p.phone}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Warehouse Address</div><div class="kl-profile-field__value">${p.address}, ${p.district}, ${p.state} — ${p.pincode}</div></div>
          </div>
        </div>
      </div>

      <!-- Bank Details -->
      <div class="kl-profile-section">
        <div class="kl-profile-section__header">
          <span class="kl-profile-section__title"><i data-lucide="landmark" style="width:16px;height:16px;"></i> Bank & Escrow Linked Account</span>
        </div>
        <div class="kl-profile-section__body">
          <div class="kl-profile-grid">
            <div class="kl-profile-field"><div class="kl-profile-field__label">Account Holder</div><div class="kl-profile-field__value">${p.bankDetails.accountHolder}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Account Number</div><div class="kl-profile-field__value">${p.bankDetails.accountNumber}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">IFSC Code</div><div class="kl-profile-field__value">${p.bankDetails.ifsc}</div></div>
            <div class="kl-profile-field"><div class="kl-profile-field__label">Bank & Branch</div><div class="kl-profile-field__value">${p.bankDetails.bankName} — ${p.bankDetails.branch}</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function openEditSourcingModal() {
  const p = buyerService.getProfile();
  const req = p.sourcingRequirements;

  showModal('Edit Sourcing Requirements', `
    <form onsubmit="submitEditSourcing(event)">
      <div class="kl-form-grid kl-form-grid--2 kl-mb-md">
        <div class="kl-form-group">
          <label class="kl-label kl-label--required">Target Crop</label>
          <select id="edit-req-crop" class="kl-select">
            <option value="Onion" ${req.crop === 'Onion' ? 'selected' : ''}>Onion</option>
            <option value="Wheat" ${req.crop === 'Wheat' ? 'selected' : ''}>Wheat</option>
            <option value="Soybean" ${req.crop === 'Soybean' ? 'selected' : ''}>Soybean</option>
            <option value="Rice" ${req.crop === 'Rice' ? 'selected' : ''}>Rice</option>
            <option value="Chilli" ${req.crop === 'Chilli' ? 'selected' : ''}>Chilli</option>
            <option value="Potato" ${req.crop === 'Potato' ? 'selected' : ''}>Potato</option>
            <option value="Tomato" ${req.crop === 'Tomato' ? 'selected' : ''}>Tomato</option>
            <option value="Cotton" ${req.crop === 'Cotton' ? 'selected' : ''}>Cotton</option>
          </select>
        </div>
        <div class="kl-form-group">
          <label class="kl-label kl-label--required">Required Grade</label>
          <select id="edit-req-grade" class="kl-select">
            <option value="Grade A" ${req.grade === 'Grade A' ? 'selected' : ''}>Grade A</option>
            <option value="Grade A+" ${req.grade === 'Grade A+' ? 'selected' : ''}>Grade A+</option>
            <option value="Export Grade" ${req.grade === 'Export Grade' ? 'selected' : ''}>Export Grade</option>
          </select>
        </div>
        <div class="kl-form-group">
          <label class="kl-label kl-label--required">Min Target Qty (Quintals)</label>
          <input type="number" id="edit-req-minqty" class="kl-input" value="${req.minQty}" required>
        </div>
        <div class="kl-form-group">
          <label class="kl-label kl-label--required">Max Target Qty (Quintals)</label>
          <input type="number" id="edit-req-maxqty" class="kl-input" value="${req.maxQty}" required>
        </div>
        <div class="kl-form-group">
          <label class="kl-label kl-label--required">Target Price Min (₹/Q)</label>
          <input type="number" id="edit-req-minprice" class="kl-input" value="${req.targetPriceMin}" required>
        </div>
        <div class="kl-form-group">
          <label class="kl-label kl-label--required">Target Price Max (₹/Q)</label>
          <input type="number" id="edit-req-maxprice" class="kl-input" value="${req.targetPriceMax}" required>
        </div>
      </div>
      <div class="kl-form-group kl-mb-lg">
        <label class="kl-label kl-label--required">Preferred Sourcing Region</label>
        <input type="text" id="edit-req-region" class="kl-input" value="${req.preferredRegion}" required>
      </div>
      <div class="kl-flex kl-flex-between">
        <button type="button" class="kl-btn kl-btn--secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="kl-btn kl-btn--primary">Save Requirements ✓</button>
      </div>
    </form>
  `, '');
}

function submitEditSourcing(e) {
  e.preventDefault();
  const crop = document.getElementById('edit-req-crop').value;
  const grade = document.getElementById('edit-req-grade').value;
  const minQty = parseInt(document.getElementById('edit-req-minqty').value, 10) || 100;
  const maxQty = parseInt(document.getElementById('edit-req-maxqty').value, 10) || 500;
  const targetPriceMin = parseFloat(document.getElementById('edit-req-minprice').value) || 2500;
  const targetPriceMax = parseFloat(document.getElementById('edit-req-maxprice').value) || 2900;
  const preferredRegion = document.getElementById('edit-req-region').value;

  buyerService.updateSourcingRequirements({
    crop,
    grade,
    minQty,
    maxQty,
    targetPriceMin,
    targetPriceMax,
    preferredRegion
  });

  closeModal();
  showToast('Sourcing requirements updated successfully.', 'success');
  renderView(currentRoute);
}

function openEditProfileModal() {
  const p = buyerService.getProfile();

  showModal('Edit Business Profile', `
    <form onsubmit="submitEditProfile(event)">
      <div class="kl-form-grid kl-form-grid--2 kl-mb-md">
        <div class="kl-form-group">
          <label class="kl-label kl-label--required">Company Name</label>
          <input type="text" id="edit-prof-company" class="kl-input" value="${p.companyName}" required>
        </div>
        <div class="kl-form-group">
          <label class="kl-label kl-label--required">Contact Person</label>
          <input type="text" id="edit-prof-contact" class="kl-input" value="${p.contactPerson}" required>
        </div>
        <div class="kl-form-group">
          <label class="kl-label kl-label--required">Email</label>
          <input type="email" id="edit-prof-email" class="kl-input" value="${p.email}" required>
        </div>
        <div class="kl-form-group">
          <label class="kl-label kl-label--required">Phone Number</label>
          <input type="tel" id="edit-prof-phone" class="kl-input" value="${p.phone}" required>
        </div>
      </div>
      <div class="kl-form-group kl-mb-lg">
        <label class="kl-label kl-label--required">Warehouse / Office Address</label>
        <input type="text" id="edit-prof-addr" class="kl-input" value="${p.address}" required>
      </div>
      <div class="kl-flex kl-flex-between">
        <button type="button" class="kl-btn kl-btn--secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="kl-btn kl-btn--primary">Save Profile ✓</button>
      </div>
    </form>
  `, '');
}

function submitEditProfile(e) {
  e.preventDefault();
  const companyName = document.getElementById('edit-prof-company').value;
  const contactPerson = document.getElementById('edit-prof-contact').value;
  const email = document.getElementById('edit-prof-email').value;
  const phone = document.getElementById('edit-prof-phone').value;
  const address = document.getElementById('edit-prof-addr').value;

  buyerService.updateProfile({
    companyName,
    contactPerson,
    email,
    phone,
    address
  });

  syncHeaderBuyerDetails();
  closeModal();
  showToast('Profile information updated.', 'success');
  renderView('profile');
}
