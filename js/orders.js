/**
 * KRISHISHETRA — ORDERS & PAYMENT STATUS CONTROLLER
 * Full order lifecycle management, payment status tracking (Pending, Processing, Received),
 * transaction details modal, digital receipt generation, and dispute handling.
 */

// Central mock / default data for farmer's verified orders & payments
const DEFAULT_FARMER_ORDERS = [
  {
    orderId: 'KS-ORD-2026-000102',
    transactionId: 'KS-TRX-2026-000102',
    cropName: 'Tomato',
    variety: 'Hybrid Round (Grade A)',
    buyerName: 'ABC Foods',
    buyerPhone: '+91 98231 55420',
    buyerCompany: 'ABC Foods Ltd · Verified Institutional Buyer',
    deliveryHub: 'Nashik APMC Processing Unit, Yard #4',
    quantity: '500 kg',
    rawQuantity: 500,
    quantityUnit: 'kg',
    agreedPrice: 2600,
    priceUnit: 'q',
    rateDisplay: '₹2,600/q (₹26/kg)',
    totalAmount: 13000,
    amountToReceive: 13000,
    dueDateText: 'Payment expected by 7 Sept',
    dateLabel: 'Expected: 7 Sept',
    status: 'pending', // Active order
    paymentStatus: 'pending', // 🟠 Payment Pending
    deliveryStatus: 'Harvest Ready · Scheduled for Mandi Gate Pickup',
    escrowStatus: '100% Escrow Secured in APMC Guarantee Fund',
    orderDate: '04 Sep 2026',
    utrNumber: 'ESCROW-PEND-9921',
    bankAccount: 'HDFC Bank A/C **4821 (IFSC: HDFC0001243)'
  },
  {
    orderId: 'KS-ORD-2026-000099',
    transactionId: 'KS-TRX-2026-000099',
    cropName: 'Wheat',
    variety: 'Sharbati Lokwan (Grade A)',
    buyerName: 'ITC Agri Business',
    buyerPhone: '+91 97654 88321',
    buyerCompany: 'ITC Agri Business Division · Verified Enterprise',
    deliveryHub: 'Indore Mandi Terminal Hub, Silo #2',
    quantity: '600 kg',
    rawQuantity: 600,
    quantityUnit: 'kg',
    agreedPrice: 3000,
    priceUnit: 'q',
    rateDisplay: '₹3,000/q (₹30/kg)',
    totalAmount: 18000,
    amountToReceive: 18000,
    dueDateText: 'Payment expected by 6 Sept (Due tomorrow)',
    dateLabel: 'Due: Tomorrow (6 Sept)',
    status: 'processing', // Active order
    paymentStatus: 'processing', // 🔵 Payment Processing
    deliveryStatus: 'In Transit · Truck MH-15-EG-4412 (ETA 4 hrs)',
    escrowStatus: 'Escrow Deposited · Payout Initiated to Bank',
    orderDate: '03 Sep 2026',
    utrNumber: 'NEFT-PRC-774921',
    bankAccount: 'HDFC Bank A/C **4821 (IFSC: HDFC0001243)'
  },
  {
    orderId: 'KS-ORD-2026-000098',
    transactionId: 'KS-TRX-2026-000098',
    cropName: 'Onion',
    variety: 'Red Garwa (Grade A)',
    buyerName: 'Reliance Fresh',
    buyerPhone: '+91 99881 22345',
    buyerCompany: 'Reliance Retail Ltd · Verified Direct Sourcing',
    deliveryHub: 'Mumbai Vashi APMC Terminal Hub',
    quantity: '500 kg',
    rawQuantity: 500,
    quantityUnit: 'kg',
    agreedPrice: 2850,
    priceUnit: 'q',
    rateDisplay: '₹2,850/q (₹28.5/kg)',
    totalAmount: 14250,
    amountToReceive: 14250,
    dueDateText: '₹14,250 received on 5 Sept',
    dateLabel: 'Received on 5 Sept',
    status: 'delivered', // Completed order
    paymentStatus: 'paid', // 🟢 Payment Received
    deliveryStatus: 'Delivered & Weighbridge Quality Verified',
    escrowStatus: 'Settled & Direct Bank Credited',
    orderDate: '01 Sep 2026',
    settledDate: '05 Sep 2026',
    utrNumber: 'HDFC8829103948',
    bankAccount: 'HDFC Bank A/C **4821 (IFSC: HDFC0001243)'
  },
  {
    orderId: 'KS-ORD-2026-000085',
    transactionId: 'KS-TRX-2026-000085',
    cropName: 'Potato',
    variety: 'Pukhraj Fresh (Grade A)',
    buyerName: 'BigBasket',
    buyerPhone: '+91 98450 11982',
    buyerCompany: 'Supermarket Grocery Supplies · BigBasket',
    deliveryHub: 'Pune Hadapsar Cold Hub',
    quantity: '400 kg',
    rawQuantity: 400,
    quantityUnit: 'kg',
    agreedPrice: 2400,
    priceUnit: 'q',
    rateDisplay: '₹2,400/q (₹24/kg)',
    totalAmount: 9600,
    amountToReceive: 9600,
    dueDateText: '₹9,600 received on 28 Aug',
    dateLabel: 'Received on 28 Aug',
    status: 'delivered', // Completed order
    paymentStatus: 'paid', // 🟢 Payment Received
    deliveryStatus: 'Delivered & Weighbridge Verified',
    escrowStatus: 'Settled & Direct Bank Credited',
    orderDate: '24 Aug 2026',
    settledDate: '28 Aug 2026',
    utrNumber: 'HDFC7710294812',
    bankAccount: 'HDFC Bank A/C **4821 (IFSC: HDFC0001243)'
  }
];

let allOrdersList = [...DEFAULT_FARMER_ORDERS];
let currentPaymentFilter = 'all';
let currentActiveTab = 'active';

document.addEventListener('DOMContentLoaded', () => {
  if (window.Auth && !window.Auth.requireAuth()) {
    return;
  }

  // Check URL hash: e.g. orders.html#payments or orders.html#active or orders.html#completed
  const hash = (window.location.hash || '').replace('#', '').toLowerCase();
  if (hash === 'active') {
    currentActiveTab = 'active';
  } else if (hash === 'completed') {
    currentActiveTab = 'completed';
  } else {
    // Default to 'payments' tab so farmer immediately sees all payment features
    currentActiveTab = 'payments';
  }

  window.addEventListener('hashchange', () => {
    const h = (window.location.hash || '').replace('#', '').toLowerCase();
    if (h === 'active' || h === 'completed' || h === 'payments') {
      switchOrdersTab(h);
    }
  });

  loadOrders();
  setupDisputeForm();
});

/**
 * Fetch orders from backend API or fallback to rich mock data
 */
async function loadOrders() {
  const role = window.Auth ? window.Auth.getRole() : 'farmer';

  try {
    if (window.api && window.api.orders) {
      const res = role === 'farmer' ? await window.api.orders.getFarmer() : await window.api.orders.getMine();
      if (res && res.success && Array.isArray(res.orders) && res.orders.length > 0) {
        // Merge with our user-requested standard mock so requested items are always available
        const liveItems = res.orders.map(o => ({
          orderId: o.orderId,
          transactionId: 'KS-TRX-' + (o.orderId.split('-')[2] || '2026') + '-' + (o.orderId.split('-')[3] || '0001'),
          cropName: o.cropName || 'Crop',
          variety: o.variety || 'Grade A',
          buyerName: o.buyerName || 'Verified Buyer',
          buyerPhone: '+91 98765 00000',
          buyerCompany: (o.buyerName || 'Buyer') + ' · Verified Corporate Partner',
          deliveryHub: 'Local APMC Hub',
          quantity: `${o.quantity} ${o.quantityUnit || 'quintals'}`,
          rawQuantity: o.quantity,
          quantityUnit: o.quantityUnit || 'quintals',
          agreedPrice: o.agreedPrice || 0,
          priceUnit: o.priceUnit || 'q',
          rateDisplay: `₹${Number(o.agreedPrice).toLocaleString('en-IN')}/${o.priceUnit || 'q'}`,
          totalAmount: o.totalAmount || 0,
          amountToReceive: o.totalAmount || 0,
          dueDateText: o.paymentStatus === 'paid' ? `Settled on ${new Date(o.updatedAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` : 'Payment expected in 24 hours',
          dateLabel: o.paymentStatus === 'paid' ? 'Received' : 'Expected soon',
          status: o.status || 'pending',
          paymentStatus: o.paymentStatus || 'pending',
          deliveryStatus: o.status === 'delivered' ? 'Delivered' : 'In Transit / Pickup',
          escrowStatus: 'KrishiShetra Escrow Protected',
          orderDate: new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
          utrNumber: 'HDFC' + Math.floor(1000000000 + Math.random() * 9000000000),
          bankAccount: 'HDFC Bank A/C **4821'
        }));

        // Put user-requested key orders first, then append any new live items
        const existingIds = new Set(allOrdersList.map(item => item.orderId));
        liveItems.forEach(item => {
          if (!existingIds.has(item.orderId)) {
            allOrdersList.push(item);
          }
        });
      }
    }
  } catch (err) {
    console.warn('Orders API network fallback active:', err);
  }

  // Update counts
  updateTabCounts();

  // Render all 3 views
  renderActiveOrders();
  renderCompletedOrders();
  renderPayments();
  renderPaymentHistory();

  // Switch to initial tab
  switchOrdersTab(currentActiveTab);

  if (window.lucide) lucide.createIcons();
}

/**
 * Update counters on tabs and filter pills
 */
function updateTabCounts() {
  const activeCount = allOrdersList.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const completedCount = allOrdersList.filter(o => o.status === 'delivered').length;
  const paymentsList = allOrdersList.filter(o => o.status !== 'cancelled');

  const pendingPay = paymentsList.filter(o => o.paymentStatus === 'pending').length;
  const procPay = paymentsList.filter(o => o.paymentStatus === 'processing').length;
  const recvPay = paymentsList.filter(o => o.paymentStatus === 'paid').length;

  const badgeActive = document.getElementById('badge-count-active');
  const badgeComp = document.getElementById('badge-count-completed');
  const badgePay = document.getElementById('badge-count-payments');

  if (badgeActive) badgeActive.textContent = activeCount;
  if (badgeComp) badgeComp.textContent = completedCount;
  if (badgePay) badgePay.textContent = paymentsList.length;

  const cntAll = document.getElementById('pay-cnt-all');
  const cntPend = document.getElementById('pay-cnt-pending');
  const cntProc = document.getElementById('pay-cnt-processing');
  const cntRecv = document.getElementById('pay-cnt-received');

  if (cntAll) cntAll.textContent = paymentsList.length;
  if (cntPend) cntPend.textContent = pendingPay;
  if (cntProc) cntProc.textContent = procPay;
  if (cntRecv) cntRecv.textContent = recvPay;
}

/**
 * Tab Navigation Switcher: 'active' | 'completed' | 'payments'
 */
function switchOrdersTab(tabKey) {
  currentActiveTab = tabKey;

  // Toggle active class on tab buttons
  const btnActive = document.getElementById('tab-btn-active');
  const btnComp = document.getElementById('tab-btn-completed');
  const btnPay = document.getElementById('tab-btn-payments');

  if (btnActive) btnActive.classList.toggle('orders-tab-btn--active', tabKey === 'active');
  if (btnComp) btnComp.classList.toggle('orders-tab-btn--active', tabKey === 'completed');
  if (btnPay) btnPay.classList.toggle('orders-tab-btn--active', tabKey === 'payments');

  // Toggle tab panes
  const paneActive = document.getElementById('pane-active-orders');
  const paneComp = document.getElementById('pane-completed-orders');
  const panePay = document.getElementById('pane-payments');

  if (paneActive) paneActive.style.display = tabKey === 'active' ? 'block' : 'none';
  if (paneComp) paneComp.style.display = tabKey === 'completed' ? 'block' : 'none';
  if (panePay) panePay.style.display = tabKey === 'payments' ? 'block' : 'none';

  // Update URL hash without reload
  if (history.replaceState) {
    history.replaceState(null, null, `#${tabKey}`);
  }

  if (window.lucide) lucide.createIcons();
}

/**
 * Filter payments by status: 'all' | 'pending' | 'processing' | 'received'
 */
function filterPaymentsByStatus(statusKey) {
  currentPaymentFilter = statusKey;

  const pills = document.querySelectorAll('#payment-status-pills .payment-filter-pill');
  pills.forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute('data-status') === statusKey);
  });

  renderPayments();
  if (window.lucide) lucide.createIcons();
}

/**
 * Render Active Orders Tab
 */
function renderActiveOrders() {
  const grid = document.getElementById('orders-grid');
  if (!grid) return;

  const activeOrders = allOrdersList.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

  if (activeOrders.length === 0) {
    grid.innerHTML = `
      <div style="padding: 48px 24px; text-align: center; color: #888; grid-column: 1 / -1; background: #FAF9F5; border-radius: 14px; border: 1px dashed #DDD;">
        <div style="font-size: 38px; margin-bottom: 10px;">📦</div>
        <h3 style="font-size: 17px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">No Active Orders in Progress</h3>
        <p style="font-size: 13.5px; color: #666; margin: 0 0 16px 0;">All your harvest lots are either listed or completely fulfilled.</p>
        <button class="btn btn--primary" onclick="switchOrdersTab('payments')">View Payments →</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = activeOrders.map(ord => renderActiveOrderCard(ord)).join('');
}

/**
 * Render Completed Orders Tab
 */
function renderCompletedOrders() {
  const grid = document.getElementById('completed-orders-grid');
  if (!grid) return;

  const completed = allOrdersList.filter(o => o.status === 'delivered');

  if (completed.length === 0) {
    grid.innerHTML = `
      <div style="padding: 48px 24px; text-align: center; color: #888; grid-column: 1 / -1; background: #FAF9F5; border-radius: 14px; border: 1px dashed #DDD;">
        <div style="font-size: 38px; margin-bottom: 10px;">✅</div>
        <h3 style="font-size: 17px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">No Completed Orders Yet</h3>
        <p style="font-size: 13.5px; color: #666; margin: 0;">Delivered orders with completed payouts will be archived here.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = completed.map(ord => renderCompletedOrderCard(ord)).join('');
}

/**
 * Render Payments Tab with Farmer Payment Cards matching user specification:
 * 
 * Payment for [Crop]
 * 👤 Buyer: ABC Foods
 * 🌾 Quantity: 500 kg
 * 💰 Amount: ₹13,000
 * 📅 Expected: 7 Sept (or "Received on 7 Sept")
 * 🟠 Payment Pending / 🔵 Payment Processing / 🟢 Payment Received
 * [Track Payment]  [Report Problem]
 */
function renderPayments() {
  const grid = document.getElementById('payments-cards-grid');
  if (!grid) return;

  let list = allOrdersList.filter(o => o.status !== 'cancelled');

  if (currentPaymentFilter === 'pending') {
    list = list.filter(o => o.paymentStatus === 'pending');
  } else if (currentPaymentFilter === 'processing') {
    list = list.filter(o => o.paymentStatus === 'processing');
  } else if (currentPaymentFilter === 'received') {
    list = list.filter(o => o.paymentStatus === 'paid');
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="padding: 48px 24px; text-align: center; color: #888; grid-column: 1 / -1; background: #FAF9F5; border-radius: 14px; border: 1px dashed #DDD;">
        <div style="font-size: 38px; margin-bottom: 10px;">💳</div>
        <h3 style="font-size: 17px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">No ${currentPaymentFilter.toUpperCase()} Payments Found</h3>
        <p style="font-size: 13.5px; color: #666; margin: 0 0 14px 0;">Try selecting a different filter above.</p>
        <button class="btn btn--secondary btn--sm" onclick="filterPaymentsByStatus('all')">Show All Payments</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(item => renderFarmerPaymentCard(item)).join('');
}

/**
 * Exact Farmer's Payment Card HTML Component
 */
function renderFarmerPaymentCard(item) {
  const isPaid = item.paymentStatus === 'paid';
  const isProcessing = item.paymentStatus === 'processing';
  const isPending = item.paymentStatus === 'pending';

  let cardModifier = 'farmer-payment-card--pending';
  let statusBoxClass = 'farmer-payment-card__status-box--pending';
  let statusBadgeHtml = '';

  if (isPaid) {
    cardModifier = 'farmer-payment-card--received';
    statusBoxClass = 'farmer-payment-card__status-box--received';
    statusBadgeHtml = `
      <div class="farmer-payment-card__status-tag" style="color:#065F46;">
        <span>🟢</span> Payment Received
      </div>
      <div class="farmer-payment-card__status-sub" style="color:#065F46;">
        ₹${Number(item.amountToReceive).toLocaleString('en-IN')} received on ${item.settledDate ? item.settledDate.replace('2026', '').trim() : '7 Sept'}
      </div>
    `;
  } else if (isProcessing) {
    cardModifier = 'farmer-payment-card--processing';
    statusBoxClass = 'farmer-payment-card__status-box--processing';
    statusBadgeHtml = `
      <div class="farmer-payment-card__status-tag" style="color:#1E40AF;">
        <span>🔵</span> Payment Processing
      </div>
      <div class="farmer-payment-card__status-sub" style="color:#1E40AF;">
        Due: Tomorrow (Direct Bank Transfer)
      </div>
    `;
  } else {
    // Pending
    cardModifier = 'farmer-payment-card--pending';
    statusBoxClass = 'farmer-payment-card__status-box--pending';
    statusBadgeHtml = `
      <div class="farmer-payment-card__status-tag" style="color:#92400E;">
        <span>🟠</span> Payment Pending
      </div>
      <div class="farmer-payment-card__status-sub" style="color:#92400E;">
        ${item.dueDateText}
      </div>
    `;
  }

  return `
    <div class="farmer-payment-card ${cardModifier}" id="pay-card-${item.orderId}">
      <div>
        <!-- Title -->
        <div class="farmer-payment-card__header">
          <h3 class="farmer-payment-card__title">
            <span>Payment for ${item.cropName}</span>
            <span style="font-family:monospace; font-size:11.5px; font-weight:700; color:#777; background:#FAF8F2; padding:2px 6px; border-radius:4px; border:1px solid #DDD;">
              TRX: ${item.orderId.split('-')[3] || item.orderId}
            </span>
          </h3>
        </div>

        <!-- 4 Key Details matching user specification -->
        <div class="farmer-payment-card__details">
          <div class="farmer-payment-card__row">
            <span class="farmer-payment-card__icon">👤</span>
            <span>Buyer: <strong>${item.buyerName}</strong></span>
          </div>

          <div class="farmer-payment-card__row">
            <span class="farmer-payment-card__icon">🌾</span>
            <span>Quantity: <strong>${item.quantity}</strong></span>
          </div>

          <div class="farmer-payment-card__row">
            <span class="farmer-payment-card__icon">💰</span>
            <span>Amount: <strong style="font-size:16px; color:var(--ks-evergreen); font-weight:800;">₹${Number(item.amountToReceive).toLocaleString('en-IN')}</strong> <span style="font-size:11.5px; color:#666;">(Amount to Receive)</span></span>
          </div>

          <div class="farmer-payment-card__row">
            <span class="farmer-payment-card__icon">📅</span>
            <span>${isPaid ? 'Received:' : 'Expected:'} <strong>${isPaid ? (item.settledDate || '7 Sept') : (item.dateLabel.replace('Expected:', '').replace('Due:', '').trim() || '7 Sept')}</strong></span>
          </div>
        </div>

        <!-- Status Box -->
        <div class="farmer-payment-card__status-box ${statusBoxClass}">
          ${statusBadgeHtml}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="farmer-payment-card__actions">
        <button class="btn btn--primary btn--sm" style="flex:1;" onclick="openTransactionDetails('${item.transactionId || item.orderId}')">
          <i data-lucide="activity"></i> Track Payment
        </button>

        ${isPaid ? `
          <button class="btn btn--secondary btn--sm" onclick="viewTransactionReceipt('${item.transactionId || item.orderId}')">
            <i data-lucide="file-text"></i> View Receipt
          </button>
        ` : `
          <button class="btn btn--secondary btn--sm" onclick="openDisputeForOrder('${item.orderId}', '${item.cropName}', '${item.buyerName}', '${item.amountToReceive}')">
            <i data-lucide="alert-circle"></i> Report Problem
          </button>
        `}
      </div>
    </div>
  `;
}

/**
 * Render Payment History Table
 */
function renderPaymentHistory() {
  const tbody = document.getElementById('payment-history-tbody');
  if (!tbody) return;

  const historyItems = allOrdersList.filter(o => o.status !== 'cancelled');

  tbody.innerHTML = historyItems.map(item => {
    const isPaid = item.paymentStatus === 'paid';
    const isProcessing = item.paymentStatus === 'processing';
    const badgeHtml = isPaid 
      ? `<span class="status-pill-received">🟢 Received</span>`
      : isProcessing 
        ? `<span class="status-pill-processing">🔵 Processing</span>`
        : `<span class="status-pill-pending">🟠 Pending</span>`;

    return `
      <tr>
        <td style="font-family:monospace; font-weight:700; color:var(--ks-evergreen);">
          ${item.transactionId || item.orderId}
        </td>
        <td><strong>${item.buyerName}</strong></td>
        <td>${item.cropName} (${item.variety.split('(')[0].trim()})</td>
        <td>${item.quantity}</td>
        <td><strong style="color:var(--ks-evergreen); font-size:14px;">₹${Number(item.amountToReceive).toLocaleString('en-IN')}</strong></td>
        <td style="color:#666;">${item.settledDate || item.dateLabel || item.orderDate}</td>
        <td>${badgeHtml}</td>
        <td>
          <button class="btn btn--secondary btn--sm" style="font-size:11px; padding:3px 8px;" onclick="viewTransactionReceipt('${item.transactionId || item.orderId}')">
            <i data-lucide="file-text" style="width:12px;height:12px;"></i> Receipt
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Active Order Card
 */
function renderActiveOrderCard(ord) {
  const isPaid = ord.paymentStatus === 'paid';
  const isProcessing = ord.paymentStatus === 'processing';

  const statusPill = isPaid 
    ? `<span class="status-pill-received">🟢 Payment Received</span>`
    : isProcessing 
      ? `<span class="status-pill-processing">🔵 Payment Processing</span>`
      : `<span class="status-pill-pending">🟠 Payment Pending</span>`;

  return `
    <div class="dash-card" style="background:#FFFFFF; border:1px solid #E5E2D6; border-radius:14px; padding:20px; margin-bottom:16px; box-shadow:0 2px 10px rgba(0,0,0,0.03);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
        <div>
          <span style="font-family:monospace; font-size:13px; font-weight:800; color:var(--ks-evergreen); background:#FAF9F5; padding:3px 8px; border-radius:4px; border:1px solid #E2E0D5;">
            TRX: ${ord.orderId}
          </span>
          <span style="font-size:12px; color:#777; margin-left:8px;">• ${ord.orderDate}</span>
        </div>
        <div>${statusPill}</div>
      </div>

      <h3 style="font-size:18px; font-weight:700; color:var(--ks-evergreen); margin:4px 0;">
        ${ord.cropName} <span style="font-size:13px; font-weight:400; color:#666;">(${ord.variety})</span>
      </h3>
      <div style="font-size:13px; color:#555; margin-bottom:12px;">
        Buyer: <strong>${ord.buyerName}</strong> · 📍 Destination: ${ord.deliveryHub}
      </div>

      <!-- Specs Box -->
      <div style="background:#FAF9F5; border:1px solid #ECE8DB; border-radius:10px; padding:12px 16px; margin-bottom:14px; font-size:13px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div>
          <span style="color:#777;">Quantity:</span>
          <strong style="color:#222; display:block;">${ord.quantity}</strong>
        </div>
        <div>
          <span style="color:#777;">Agreed Rate:</span>
          <strong style="color:#222; display:block;">${ord.rateDisplay}</strong>
        </div>
        <div style="grid-column:1 / -1; border-top:1px dashed #DDD; padding-top:6px; margin-top:2px; display:flex; justify-content:space-between; align-items:center;">
          <span style="color:var(--ks-evergreen); font-weight:700;">Amount to Receive:</span>
          <strong style="font-size:16px; color:var(--ks-evergreen); font-weight:800;">₹${Number(ord.amountToReceive).toLocaleString('en-IN')}</strong>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="font-size:12px; color:#777;">
          <i data-lucide="clock" style="width:12px;height:12px;display:inline-block;vertical-align:middle;"></i> ${ord.dueDateText}
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn--secondary btn--sm" onclick="openDisputeForOrder('${ord.orderId}', '${ord.cropName}', '${ord.buyerName}', '${ord.amountToReceive}')">
            <i data-lucide="alert-circle"></i> Report Problem
          </button>
          <button class="btn btn--primary btn--sm" onclick="openTransactionDetails('${ord.transactionId || ord.orderId}')">
            <i data-lucide="activity"></i> Track Payment
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Completed Order Card
 */
function renderCompletedOrderCard(ord) {
  return `
    <div class="dash-card" style="background:#FFFFFF; border:1px solid #E5E2D6; border-radius:14px; padding:20px; margin-bottom:16px; box-shadow:0 2px 10px rgba(0,0,0,0.03);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
        <div>
          <span style="font-family:monospace; font-size:13px; font-weight:800; color:var(--ks-evergreen); background:#FAF9F5; padding:3px 8px; border-radius:4px; border:1px solid #E2E0D5;">
            TRX: ${ord.orderId}
          </span>
          <span style="font-size:12px; color:#777; margin-left:8px;">• Completed on ${ord.settledDate || ord.orderDate}</span>
        </div>
        <span class="status-pill-received">🟢 Payment Received</span>
      </div>

      <h3 style="font-size:18px; font-weight:700; color:var(--ks-evergreen); margin:4px 0;">
        ${ord.cropName} <span style="font-size:13px; font-weight:400; color:#666;">(${ord.variety})</span>
      </h3>
      <div style="font-size:13px; color:#555; margin-bottom:12px;">
        Buyer: <strong>${ord.buyerName}</strong> · Delivered & Settled
      </div>

      <div style="background:#FAF9F5; border:1px solid #ECE8DB; border-radius:10px; padding:12px 16px; margin-bottom:14px; font-size:13px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="color:#777; font-size:12px;">Quantity Delivered: ${ord.quantity}</span>
          <div style="font-size:12px; color:#2D6A4F; font-weight:700; margin-top:2px;">✓ Credited to HDFC Bank A/C **4821</div>
        </div>
        <div style="text-align:right;">
          <span style="color:#777; font-size:12px;">Amount Received:</span>
          <div style="font-size:18px; font-weight:800; color:var(--ks-evergreen);">₹${Number(ord.amountToReceive).toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn btn--secondary btn--sm" onclick="openTransactionDetails('${ord.transactionId || ord.orderId}')">
          <i data-lucide="info"></i> Full Details
        </button>
        <button class="btn btn--primary btn--sm" onclick="viewTransactionReceipt('${ord.transactionId || ord.orderId}')">
          <i data-lucide="file-text"></i> Official Receipt
        </button>
      </div>
    </div>
  `;
}

/**
 * Open Transaction Details Modal
 * Covers: Order Details, Buyer Details, Amount to Receive, Delivery Status, Payment Status, Transaction ID
 */
function openTransactionDetails(trxOrOrderId) {
  const item = allOrdersList.find(o => o.transactionId === trxOrOrderId || o.orderId === trxOrOrderId) || allOrdersList[0];
  if (!item) return;

  const modal = document.getElementById('trx-details-modal-overlay');
  const title = document.getElementById('td-modal-title');
  const badgeId = document.getElementById('td-trx-id');
  const body = document.getElementById('trx-details-body');

  if (title) title.textContent = `Transaction Details · ${item.cropName}`;
  if (badgeId) badgeId.textContent = item.transactionId || item.orderId;

  const isPaid = item.paymentStatus === 'paid';
  const isProcessing = item.paymentStatus === 'processing';
  const isPending = item.paymentStatus === 'pending';

  // 4-Stage Stepper Nodes
  const step1Done = true;
  const step2Done = !isPending;
  const step3Done = isPaid;
  const step4Done = isPaid;

  body.innerHTML = `
    <!-- Stepper -->
    <div class="trx-stepper">
      <div class="trx-step completed">
        <div class="trx-step-circle">✓</div>
        <div class="trx-step-label">1. Order Accepted</div>
      </div>
      <div class="trx-step ${step2Done ? 'completed' : 'current'}">
        <div class="trx-step-circle">${step2Done ? '✓' : '2'}</div>
        <div class="trx-step-label">2. Crop Dispatched</div>
      </div>
      <div class="trx-step ${step3Done ? 'completed' : isProcessing ? 'current' : 'pending'}">
        <div class="trx-step-circle">${step3Done ? '✓' : '3'}</div>
        <div class="trx-step-label">3. Weighbridge & Escrow</div>
      </div>
      <div class="trx-step ${step4Done ? 'completed' : 'pending'}">
        <div class="trx-step-circle">${step4Done ? '✓' : '4'}</div>
        <div class="trx-step-label">4. Payment Received</div>
      </div>
    </div>

    <!-- Amount to Receive Banner -->
    <div style="background:linear-gradient(135deg, #12372A 0%, #1A4D3B 100%); color:#FFFFFF; border-radius:12px; padding:18px 20px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <span style="font-size:12px; text-transform:uppercase; letter-spacing:0.04em; opacity:0.8; display:block;">Amount to Receive</span>
        <div style="font-size:28px; font-weight:800; color:#E8B96A;">₹${Number(item.amountToReceive).toLocaleString('en-IN')}</div>
        <span style="font-size:12px; opacity:0.85;">100% Guaranteed Farmer Payout · Zero Brokerage Deduction</span>
      </div>
      <div style="text-align:right;">
        <span style="font-size:12px; opacity:0.8; display:block;">Payment Status</span>
        ${isPaid 
          ? `<span style="background:#D1FAE5; color:#065F46; padding:5px 12px; border-radius:20px; font-weight:800; font-size:13px; display:inline-flex; align-items:center; gap:4px; margin-top:4px;">🟢 Payment Received</span>`
          : isProcessing 
            ? `<span style="background:#DBEAFE; color:#1E40AF; padding:5px 12px; border-radius:20px; font-weight:800; font-size:13px; display:inline-flex; align-items:center; gap:4px; margin-top:4px;">🔵 Payment Processing</span>`
            : `<span style="background:#FEF3C7; color:#92400E; padding:5px 12px; border-radius:20px; font-weight:800; font-size:13px; display:inline-flex; align-items:center; gap:4px; margin-top:4px;">🟠 Payment Pending</span>`
        }
        <div style="font-size:12px; margin-top:6px; opacity:0.9;">${item.dueDateText}</div>
      </div>
    </div>

    <!-- 2-Column Info Grid: Order Details & Buyer Details -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px; margin-bottom:16px;">
      
      <!-- Box 1: Order Details -->
      <div style="background:#FAF9F5; border:1px solid #E5E2D6; border-radius:12px; padding:16px; font-size:13px;">
        <h4 style="font-size:14px; font-weight:800; color:var(--ks-evergreen); margin:0 0 10px 0; display:flex; align-items:center; gap:6px;">
          <span>🌾</span> Order Details
        </h4>
        <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #E5E2D6;">
          <span style="color:#666;">Crop:</span>
          <strong>${item.cropName} (${item.variety})</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #E5E2D6;">
          <span style="color:#666;">Quantity:</span>
          <strong>${item.quantity}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #E5E2D6;">
          <span style="color:#666;">Agreed Price:</span>
          <strong>${item.rateDisplay}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #E5E2D6;">
          <span style="color:#666;">Order Date:</span>
          <strong>${item.orderDate}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:5px 0;">
          <span style="color:#666;">Total Order Value:</span>
          <strong style="color:var(--ks-evergreen); font-size:15px;">₹${Number(item.totalAmount).toLocaleString('en-IN')}</strong>
        </div>
      </div>

      <!-- Box 2: Buyer Details -->
      <div style="background:#FAF9F5; border:1px solid #E5E2D6; border-radius:12px; padding:16px; font-size:13px;">
        <h4 style="font-size:14px; font-weight:800; color:var(--ks-evergreen); margin:0 0 10px 0; display:flex; align-items:center; gap:6px;">
          <span>👤</span> Buyer Details
        </h4>
        <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #E5E2D6;">
          <span style="color:#666;">Buyer Name:</span>
          <strong>${item.buyerName}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #E5E2D6;">
          <span style="color:#666;">Enterprise:</span>
          <span>${item.buyerCompany.split('·')[0].trim()}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #E5E2D6;">
          <span style="color:#666;">Contact / Phone:</span>
          <strong>${item.buyerPhone}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #E5E2D6;">
          <span style="color:#666;">Buyer Verification:</span>
          <strong style="color:#2D6A4F;">✓ Verified Corporate Buyer</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:5px 0;">
          <span style="color:#666;">Delivery Hub:</span>
          <span style="text-align:right;">${item.deliveryHub}</span>
        </div>
      </div>

    </div>

    <!-- Delivery Status & Bank Payment Channel -->
    <div style="background:#FAF9F5; border:1px solid #E5E2D6; border-radius:12px; padding:14px 16px; margin-bottom:18px; font-size:13px;">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <span style="color:#666; font-size:12px; display:block;">🚚 Delivery Status:</span>
          <strong style="color:#12372A;">${item.deliveryStatus}</strong>
        </div>
        <div>
          <span style="color:#666; font-size:12px; display:block;">🏦 Beneficiary Account:</span>
          <strong>${item.bankAccount}</strong>
        </div>
        <div>
          <span style="color:#666; font-size:12px; display:block;">🔒 Escrow Protection:</span>
          <span style="color:#2D6A4F; font-weight:700;">${item.escrowStatus}</span>
        </div>
        <div>
          <span style="color:#666; font-size:12px; display:block;">🆔 Transaction ID & UTR:</span>
          <span style="font-family:monospace; font-weight:700; color:#12372A;">${item.transactionId} · ${item.utrNumber}</span>
        </div>
      </div>
    </div>

    <!-- Modal Action Buttons -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; border-top:1px solid #E5E2D6; padding-top:14px;">
      <button class="btn btn--secondary" onclick="openDisputeForOrder('${item.orderId}', '${item.cropName}', '${item.buyerName}', '${item.amountToReceive}')">
        <i data-lucide="shield-alert"></i> Report Payment Problem
      </button>

      <div style="display:flex; gap:8px;">
        <button class="btn btn--secondary" onclick="viewTransactionReceipt('${item.transactionId || item.orderId}')">
          <i data-lucide="file-text"></i> View Settlement Voucher
        </button>
        <button class="btn btn--primary" onclick="closeTransactionDetailsModal()">
          Close
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeTransactionDetailsModal() {
  const modal = document.getElementById('trx-details-modal-overlay');
  if (modal) modal.classList.remove('active');
}

/**
 * View / Download / Print Payment Receipt
 */
function viewTransactionReceipt(trxOrOrderId) {
  const item = allOrdersList.find(o => o.transactionId === trxOrOrderId || o.orderId === trxOrOrderId) || allOrdersList[0];
  const modal = document.getElementById('receipt-modal-overlay');
  const body = document.getElementById('receipt-content-body');
  if (!modal || !body) return;

  const dateStr = item.settledDate || item.orderDate || '05 Sep 2026';

  body.innerHTML = `
    <div style="background:#FAF9F5; border:1px solid #E2E0D5; border-radius:12px; padding:20px; font-size:13px; line-height:1.6; position:relative;">
      
      <!-- Voucher Header -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid var(--ks-evergreen); padding-bottom:12px; margin-bottom:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:18px;">🌾</span>
            <strong style="color:var(--ks-evergreen); font-size:18px;">KrishiShetra</strong>
          </div>
          <div style="font-size:11px; color:#666; margin-top:2px;">Digital Agricultural Settlement Voucher</div>
          <div style="font-size:10.5px; color:#888;">e-NAM Mandi Modernization Reference: SIH26132</div>
        </div>
        <div style="text-align:right;">
          <span style="font-family:monospace; font-size:13px; font-weight:800; color:var(--ks-evergreen); background:#FFF; padding:3px 8px; border-radius:4px; border:1px solid #DDD; display:inline-block;">
            ${item.transactionId || item.orderId}
          </span>
          <div style="font-size:11px; color:#666; margin-top:4px;">Date: ${dateStr}</div>
        </div>
      </div>

      <!-- Voucher Details Table -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; background:#FFF; border:1px solid #E8E5DA; border-radius:8px; padding:12px;">
        <div><span style="color:#777;">Farmer Name:</span><br><strong>Rajesh Patil (Verified)</strong></div>
        <div><span style="color:#777;">Buyer Enterprise:</span><br><strong>${item.buyerCompany.split('·')[0].trim()}</strong></div>
        <div><span style="color:#777;">Commodity / Grade:</span><br><strong>${item.cropName} (${item.variety})</strong></div>
        <div><span style="color:#777;">Quantity Weighed:</span><br><strong>${item.quantity}</strong></div>
        <div><span style="color:#777;">Agreed Price:</span><br><strong>${item.rateDisplay}</strong></div>
        <div><span style="color:#777;">Beneficiary Bank:</span><br><strong>${item.bankAccount}</strong></div>
      </div>

      <!-- Financial Calculation -->
      <div style="background:#FAF8F2; border:1px solid #E5DFCF; border-radius:8px; padding:12px; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="color:#666;">Gross Produce Value:</span>
          <strong>₹${Number(item.totalAmount).toLocaleString('en-IN')}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:#2D6A4F;">
          <span>KrishiShetra Platform Fee:</span>
          <strong>₹0 (100% Free for Farmers)</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:#666;">
          <span>APMC Mandi Cess (Paid by Buyer):</span>
          <span>Waived / Paid</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-top:2px solid var(--ks-evergreen); padding-top:8px; margin-top:6px; font-size:16px; font-weight:800; color:var(--ks-evergreen);">
          <span>Net Amount Credited:</span>
          <span>₹${Number(item.amountToReceive).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- Escrow & UTR Guarantee Note -->
      <div style="background:#EAF6ED; color:#2D6A4F; padding:8px 12px; border-radius:6px; font-size:11.5px; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
        <span>✓ Escrow Guaranteed Bank Payout</span>
        <span style="font-family:monospace; font-size:11px;">UTR: ${item.utrNumber}</span>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; gap:8px; margin-top:16px;">
      <button class="btn btn--secondary btn--sm" onclick="window.print()">
        <i data-lucide="printer"></i> Print / Save as PDF
      </button>
      <button class="btn btn--primary btn--sm" onclick="document.getElementById('receipt-modal-overlay').classList.remove('active')">
        Close Voucher
      </button>
    </div>
  `;

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

/**
 * Open Grievance / Dispute Modal
 */
function openDisputeForOrder(orderId, crop, buyer, amount) {
  const modal = document.getElementById('disputes-modal-overlay');
  if (!modal) return;
  const input = document.getElementById('disp-order-id');
  if (input) input.value = `${orderId} · ${crop || 'Produce'} · ${buyer || 'Buyer'} (₹${amount || '0'})`;
  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeDisputesModal() {
  const modal = document.getElementById('disputes-modal-overlay');
  if (modal) modal.classList.remove('active');
}

function setupDisputeForm() {
  const form = document.getElementById('order-dispute-form');
  if (!form) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    const trx = document.getElementById('disp-order-id')?.value || 'Transaction';
    const reason = document.getElementById('disp-reason')?.value || 'Payment Delay';
    
    alert(`✓ Grievance Ticket Registered!\nReference ID: TKT-PAY-${Math.floor(10000 + Math.random() * 90000)}\n\nOrder: ${trx}\nReason: ${reason}\n\nOur APMC dispute resolution officer will contact you and the buyer within 4 hours.`);
    closeDisputesModal();
    form.reset();
  };
}

// Global exposure for inline onclick handlers
window.loadOrders = loadOrders;
window.switchOrdersTab = switchOrdersTab;
window.filterPaymentsByStatus = filterPaymentsByStatus;
window.openTransactionDetails = openTransactionDetails;
window.closeTransactionDetailsModal = closeTransactionDetailsModal;
window.viewTransactionReceipt = viewTransactionReceipt;
window.openDisputeForOrder = openDisputeForOrder;
window.closeDisputesModal = closeDisputesModal;
