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

  // Close modals when clicking backdrop overlay
  document.querySelectorAll('.dash-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Close open modals when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeReceiptModal();
      closeTransactionDetailsModal();
      closeDisputesModal();
    }
  });

  // Reset PDF saving button when print dialog closes
  window.addEventListener('afterprint', () => {
    const btn = document.getElementById('btn-save-voucher-pdf');
    if (btn && btn.disabled) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="arrow-down-to-line"></i> <span>↓ Save as PDF</span>`;
      if (window.lucide) window.lucide.createIcons();
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
        if (window.KrishiLogger) {
          window.KrishiLogger.info('ORDERS', 'Live orders loaded successfully', { count: liveItems.length });
        }
      }
    }
  } catch (err) {
    if (window.KrishiLogger) {
      window.KrishiLogger.warn('ORDERS', 'Orders live API unavailable, retaining existing verified orders', { error: err.message || err });
    } else {
      console.warn('Orders API network fallback active:', err);
    }
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

  if (window.lucide) window.lucide.createIcons();
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
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, null, `#${tabKey}`);
  }

  if (window.lucide) window.lucide.createIcons();
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
  if (window.lucide) window.lucide.createIcons();
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
 * Exact Farmer's Payment Card HTML Component (Clean Agricultural Fintech Dashboard)
 */
function renderFarmerPaymentCard(item) {
  const isPaid = item.paymentStatus === 'paid';
  const isProcessing = item.paymentStatus === 'processing';
  const isPending = item.paymentStatus === 'pending';

  // Extract clean TRX number
  const trxNum = item.transactionId 
    ? (item.transactionId.split('-')[3] || item.transactionId.replace('KS-TRX-', ''))
    : (item.orderId.split('-')[3] || item.orderId.replace('KS-ORD-', ''));

  // Dates
  let displayDate = '7 Sept 2026';
  if (isPaid) {
    displayDate = item.settledDate || '5 Sept 2026';
  } else if (item.dateLabel) {
    displayDate = item.dateLabel.replace('Expected:', '').replace('Due:', '').trim();
    if (!displayDate.includes('2026') && !displayDate.includes('Tomorrow')) {
      displayDate += ' 2026';
    }
  }

  // Status Treatment
  let statusModifier = 'pending';
  let statusBadgeText = 'Payment Pending';
  let statusExplanation = item.dueDateText || 'Payment expected by 7 Sept';

  if (isPaid) {
    statusModifier = 'received';
    statusBadgeText = 'Payment Received';
    statusExplanation = `₹${Number(item.amountToReceive).toLocaleString('en-IN')} received on ${item.settledDate ? item.settledDate.replace('2026', '').trim() : '5 Sept'}`;
  } else if (isProcessing) {
    statusModifier = 'processing';
    statusBadgeText = 'Payment Processing';
    statusExplanation = 'Payment expected tomorrow · NEFT transfer in transit';
  } else {
    statusModifier = 'pending';
    statusBadgeText = 'Payment Pending';
    statusExplanation = item.dueDateText || 'Payment expected by 7 Sept';
  }

  return `
    <div class="payment-card farmer-payment-card payment-card--${statusModifier} farmer-payment-card--${statusModifier}" id="pay-card-${item.orderId}">
      <div>
        <!-- Top: Payment for Crop + TRX -->
        <div class="payment-card-header farmer-payment-card__header">
          <div class="payment-card-crop">
            <h3 class="payment-card-crop-name farmer-payment-card__title">Payment for ${item.cropName}</h3>
          </div>
          <span class="payment-card-trx">TRX: ${trxNum}</span>
        </div>

        <!-- Clean Information Section: Buyer, Quantity, Amount, Expected/Received -->
        <div class="payment-card-details farmer-payment-card__details">
          <div class="payment-detail-col">
            <div class="payment-detail-item">
              <span class="payment-detail-label">Buyer</span>
              <span class="payment-detail-val payment-detail-val--buyer">${item.buyerName}</span>
            </div>
            <div class="payment-detail-item">
              <span class="payment-detail-label">Amount</span>
              <span class="payment-detail-val payment-detail-val--amount">₹${Number(item.amountToReceive).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="payment-detail-col">
            <div class="payment-detail-item">
              <span class="payment-detail-label">Quantity</span>
              <span class="payment-detail-val">${item.quantity}</span>
            </div>
            <div class="payment-detail-item">
              <span class="payment-detail-label">${isPaid ? 'Received' : 'Expected'}</span>
              <span class="payment-detail-val">${displayDate}</span>
            </div>
          </div>
        </div>

        <!-- Status & Explanation Box -->
        <div class="payment-card-status payment-card-status--${statusModifier} farmer-payment-card__status-box">
          <div class="payment-status-header">
            <span class="payment-status-badge">
              <span class="payment-status-dot"></span>
              ${statusBadgeText}
            </span>
          </div>
          <div class="payment-status-explanation">${statusExplanation}</div>
        </div>
      </div>

      <!-- Action Buttons (38–42px, fits inside card, no overflow) -->
      <div class="payment-card-actions farmer-payment-card__actions">
        <button class="btn btn--primary btn-payment-action" onclick="openTransactionDetails('${item.transactionId || item.orderId}')">
          <i data-lucide="activity"></i> <span>Track Payment</span>
        </button>

        ${isPaid ? `
          <button class="btn btn--secondary btn-payment-action" onclick="viewTransactionReceipt('${item.transactionId || item.orderId}')">
            <i data-lucide="file-text"></i> <span>View Receipt</span>
          </button>
        ` : `
          <button class="btn btn--secondary btn-payment-action" onclick="openDisputeForOrder('${item.orderId}', '${item.cropName}', '${item.buyerName}', '${item.amountToReceive}')">
            <i data-lucide="alert-circle"></i> <span>Report Problem</span>
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
  if (window.lucide) window.lucide.createIcons();
}

function closeTransactionDetailsModal() {
  const modal = document.getElementById('trx-details-modal-overlay');
  if (modal) modal.classList.remove('active');
}

let currentViewingReceiptTrx = null;

function showToast(message, type = 'info') {
  if (window.FarmerFlow && typeof window.FarmerFlow.showToast === 'function') {
    window.FarmerFlow.showToast(message, type);
    return;
  }
  let container = document.getElementById('dash-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'dash-toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const bg = type === 'error' ? '#DC2626' : (type === 'success' ? '#12372A' : '#1F2937');
  toast.style.cssText = `background:${bg};color:#fff;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.18);pointer-events:auto;transition:all 0.25s ease;opacity:0;transform:translateY(10px);`;
  toast.textContent = message;
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

function handleReceiptBackdropClick(e) {
  if (e && e.target && e.target.id === 'receipt-modal-overlay') {
    closeReceiptModal();
  }
}

function closeReceiptModal() {
  const modal = document.getElementById('receipt-modal-overlay');
  if (modal) modal.classList.remove('active');
  document.body.classList.remove('receipt-modal-open');
}

/**
 * Print Voucher directly using dedicated A4 print layout
 */
function printVoucherReceipt(trxOrOrderId) {
  const trxTarget = trxOrOrderId || currentViewingReceiptTrx || 'KS-TRX-VOUCHER';
  const trxClean = String(trxTarget).replace(/[^a-zA-Z0-9-_]/g, '-');
  const originalTitle = document.title;
  document.title = `KrishiShetra-Settlement-Voucher-${trxClean}`;
  window.print();
  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}

/**
 * Save currently displayed Digital Settlement Voucher as an official PDF
 * Dynamically names file: KrishiShetra-Settlement-Voucher-[TRX-ID].pdf
 * Shows "Generating PDF…" loading state on the button
 */
async function saveVoucherAsPdf(trxOrOrderId) {
  const btn = document.getElementById('btn-save-voucher-pdf');
  const originalHtml = btn ? btn.innerHTML : '';
  const originalTitle = document.title;

  const trxTarget = trxOrOrderId || currentViewingReceiptTrx || (document.querySelector('.voucher-meta__trx') ? document.querySelector('.voucher-meta__trx').textContent.replace(/^TRX:\s*/i, '').trim() : 'KS-TRX-VOUCHER');
  const trxClean = String(trxTarget).replace(/[^a-zA-Z0-9-_]/g, '-');
  const targetPdfName = `KrishiShetra-Settlement-Voucher-${trxClean}.pdf`;

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon" style="width:14px;height:14px;"></i> <span>Generating PDF…</span>`;
    if (window.lucide) window.lucide.createIcons();
  }

  const voucherSheet = document.getElementById('voucher-sheet-printable') || document.querySelector('.voucher-sheet');
  if (!voucherSheet) {
    showToast('Could not locate voucher document for PDF generation.', 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml || `<i data-lucide="arrow-down-to-line"></i> <span>↓ Save as PDF</span>`;
      if (window.lucide) window.lucide.createIcons();
    }
    return;
  }

  try {
    if (typeof html2pdf !== 'undefined') {
      // Clone element for pristine off-screen A4 canvas capture
      const clone = voucherSheet.cloneNode(true);
      // Remove UI-only controls from the PDF
      clone.querySelectorAll('.voucher-no-pdf, .voucher-close-btn').forEach(el => el.remove());
      
      // Enforce clean A4 document styling on clone
      clone.style.width = '700px';
      clone.style.maxWidth = '700px';
      clone.style.margin = '0 auto';
      clone.style.boxSizing = 'border-box';
      clone.style.background = '#FAF9F5';
      clone.style.position = 'fixed';
      clone.style.top = '-99999px';
      clone.style.left = '0';
      clone.style.zIndex = '-9999';
      document.body.appendChild(clone);

      const opt = {
        margin: [8, 8, 8, 8],
        filename: targetPdfName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#FAF9F5',
          logging: false,
          letterRendering: true,
          windowWidth: 700
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy']
        }
      };

      try {
        await html2pdf().set(opt).from(clone).save();
        showToast('Settlement voucher downloaded successfully as PDF!', 'success');
      } finally {
        if (clone && clone.parentNode) {
          clone.parentNode.removeChild(clone);
        }
      }
    } else {
      // Reliable fallback: Browser print to PDF with dynamic file title
      document.title = targetPdfName.replace(/\.pdf$/i, '');
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
      showToast('Opening print dialog to Save as PDF...', 'info');
    }
  } catch (err) {
    console.error('PDF Generation Error:', err);
    showToast('PDF download encountered an issue. You can click "Print Voucher" to print or save as PDF.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="arrow-down-to-line"></i> <span>↓ Save as PDF</span>`;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

function downloadVoucherReceipt(trxOrOrderId) {
  saveVoucherAsPdf(trxOrOrderId);
}

/**
 * View / Download / Print Digital Settlement Voucher (Fintech Payment Receipt)
 */
function viewTransactionReceipt(trxOrOrderId) {
  const item = allOrdersList.find(o => o.transactionId === trxOrOrderId || o.orderId === trxOrOrderId) || allOrdersList[0];
  const modal = document.getElementById('receipt-modal-overlay');
  const body = document.getElementById('receipt-content-body');
  if (!modal || !body) return;

  const dateStr = item.settledDate || item.orderDate || '05 Sep 2026';
  const trxNum = item.transactionId || item.orderId;
  currentViewingReceiptTrx = trxNum;
  const isPaid = item.paymentStatus === 'paid';

  body.innerHTML = `
    <div class="voucher-modal-layout">
      <!-- 1. Scrollable Receipt Content Area -->
      <div class="voucher-scroll-area" id="voucher-scroll-area" tabindex="0" role="region" aria-label="Settlement Voucher Document">
        <div class="voucher-sheet" id="voucher-sheet-printable">
          
          <!-- 1. RECEIPT HEADER -->
          <div class="voucher-header">
            <div class="voucher-brand">
              <div class="voucher-brand__logo" aria-hidden="true">
                <i data-lucide="sprout"></i>
              </div>
              <div>
                <div class="voucher-brand__name">KrishiShetra</div>
                <h2 class="voucher-brand__title" id="voucher-brand-title" style="margin:0; font-size:14px; font-weight:700;">Digital Settlement Voucher</h2>
                <div class="voucher-brand__sub">Verified Electronic Produce Settlement Record</div>
                <div class="voucher-brand__ref">e-NAM Mandi Modernization Reference: SIH26132</div>
              </div>
            </div>

            <div class="voucher-meta">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="voucher-meta__status">
                  <i data-lucide="check-circle-2" style="width:13px; height:13px;"></i>
                  ${isPaid ? 'Payment Verified' : 'Escrow Secured'}
                </span>
                <button type="button" class="voucher-close-btn voucher-no-pdf" onclick="closeReceiptModal()" aria-label="Close Voucher" title="Close Voucher (Esc)" data-html2canvas-ignore="true">
                  <i data-lucide="x" style="width:14px; height:14px;"></i>
                </button>
              </div>
              <div class="voucher-meta__trx">
                <span style="font-size:10px; color:#888; text-transform:uppercase; font-family:sans-serif; margin-right:4px;">TRX:</span>${trxNum}
              </div>
              <div class="voucher-meta__date">
                <i data-lucide="calendar" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:2px; color:#888;"></i>
                Date: <strong>${dateStr}</strong>
              </div>
            </div>
          </div>

      <!-- 2. PARTIES INVOLVED (2-Column Grid) -->
      <div class="voucher-parties-grid">
        <!-- Farmer / Seller -->
        <div class="voucher-party-card">
          <div class="voucher-party-card__label">
            <i data-lucide="user" style="width:12px; height:12px; color:var(--ks-evergreen);"></i>
            Farmer / Seller (Beneficiary)
          </div>
          <div class="voucher-party-card__name">Rajesh Patil</div>
          <span class="voucher-party-card__badge">
            <i data-lucide="badge-check" style="width:11px; height:11px;"></i>
            Verified Farmer (Aadhaar & Land Linked)
          </span>
          <div class="voucher-party-card__detail">
            <div><strong>Farmer Reg ID:</strong> MH-NSK-2026-F9821</div>
            <div><strong>Origin Mandi:</strong> Nashik APMC Market, Maharashtra</div>
          </div>
        </div>

        <!-- Buyer / Payer -->
        <div class="voucher-party-card">
          <div class="voucher-party-card__label">
            <i data-lucide="building-2" style="width:12px; height:12px; color:var(--ks-evergreen);"></i>
            Buyer / Payer (Counterparty)
          </div>
          <div class="voucher-party-card__name">${item.buyerCompany.split('·')[0].trim()}</div>
          <span class="voucher-party-card__badge">
            <i data-lucide="shield-check" style="width:11px; height:11px;"></i>
            Verified Corporate Buyer
          </span>
          <div class="voucher-party-card__detail">
            <div><strong>Representative:</strong> ${item.buyerName} (${item.buyerPhone})</div>
            <div><strong>Delivery Terminal:</strong> ${item.deliveryHub}</div>
          </div>
        </div>
      </div>

      <!-- 3. PAYMENT DETAILS (Commodity & Bank Specs) -->
      <div class="voucher-details-card">
        <div class="voucher-details-title">
          <i data-lucide="clipboard-list" style="width:13px; height:13px; color:var(--ks-evergreen);"></i>
          Produce Specifications & Beneficiary Bank
        </div>
        <div class="voucher-details-grid">
          <div class="voucher-detail-row">
            <span class="voucher-detail-row__key">Commodity / Crop:</span>
            <span class="voucher-detail-row__val">${item.cropName}</span>
          </div>
          <div class="voucher-detail-row">
            <span class="voucher-detail-row__key">Quality Grade / Variety:</span>
            <span class="voucher-detail-row__val">${item.variety}</span>
          </div>
          <div class="voucher-detail-row">
            <span class="voucher-detail-row__key">Quantity Weighed:</span>
            <span class="voucher-detail-row__val">${item.quantity}</span>
          </div>
          <div class="voucher-detail-row">
            <span class="voucher-detail-row__key">Agreed Mandi Price:</span>
            <span class="voucher-detail-row__val">${item.rateDisplay}</span>
          </div>
          <div class="voucher-detail-row">
            <span class="voucher-detail-row__key">Quality Inspection:</span>
            <span class="voucher-detail-row__val" style="color:#065F46;">✓ APMC Weighbridge Certified</span>
          </div>
          <div class="voucher-detail-row">
            <span class="voucher-detail-row__key">Beneficiary Account:</span>
            <span class="voucher-detail-row__val" style="font-family:monospace; font-size:11.5px;">${item.bankAccount}</span>
          </div>
        </div>
      </div>

      <!-- 4. PAYMENT SUMMARY (Ledger Breakdown + Prominent Net Credit Callout) -->
      <div class="voucher-summary-card">
        <div class="voucher-summary-title">
          <i data-lucide="receipt" style="width:13px; height:13px; color:var(--ks-evergreen);"></i>
          Financial Settlement Breakdown
        </div>

        <div class="voucher-summary-table">
          <div class="voucher-summary-item">
            <span>Gross Produce Value:</span>
            <strong>₹${Number(item.totalAmount).toLocaleString('en-IN')}</strong>
          </div>
          <div class="voucher-summary-item voucher-summary-item--free">
            <span>KrishiShetra Platform Fee:</span>
            <strong>₹0.00 (100% Free for Farmers)</strong>
          </div>
          <div class="voucher-summary-item">
            <span>APMC Mandi Cess (Paid by Buyer):</span>
            <span>Waived / Paid by Payer</span>
          </div>
          <div class="voucher-summary-item">
            <span>Statutory Deductions / TDS (u/s 10(1)):</span>
            <span>₹0.00 (Agricultural Exemption)</span>
          </div>
        </div>

        <!-- Strongest Visual Element: Net Amount Credited -->
        <div class="voucher-summary-highlight">
          <div>
            <div class="voucher-summary-highlight__label">Net Amount Credited to Farmer</div>
            <div class="voucher-summary-highlight__note">
              <i data-lucide="check" style="width:12px; height:12px; display:inline-block; vertical-align:middle;"></i>
              Direct Bank Settlement via e-NAM / Escrow Clearing
            </div>
          </div>
          <div class="voucher-summary-highlight__amount">
            ₹${Number(item.amountToReceive).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <!-- 5. ESCROW / PAYMENT VERIFICATION -->
      <div class="voucher-escrow-box">
        <div class="voucher-escrow-info">
          <i data-lucide="shield-check"></i>
          <div>
            <div>Escrow Guaranteed Bank Payout</div>
            <div style="font-size:11px; font-weight:500; opacity:0.88;">${item.escrowStatus}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:11px; color:#065F46; font-weight:600;">Bank Reference / UTR:</span>
          <span class="voucher-escrow-utr">${item.utrNumber}</span>
        </div>
      </div>

      <!-- 6. PROFESSIONAL FOOTER & COMPLIANCE -->
      <div class="voucher-footer-branding">
        <div style="display:flex; align-items:center; gap:5px;">
          <i data-lucide="sprout" style="width:13px; height:13px; color:var(--ks-evergreen);"></i>
          <span>KrishiShetra Digital Settlement Network • e-NAM SIH26132</span>
        </div>
        <div>
          <strong style="color:var(--ks-evergreen);">Secure • Transparent • Farmer First</strong>
        </div>
      </div>

        </div><!-- /.voucher-sheet -->
      </div><!-- /.voucher-scroll-area -->

      <!-- 2. Fixed / Pinned Action Bar at Modal Bottom -->
      <div class="voucher-actions-bar" id="voucher-actions-bar" role="toolbar" aria-label="Settlement Voucher Actions">
        <div class="voucher-actions-bar__left">
          <button type="button" class="btn btn--primary btn--sm btn-save-pdf" id="btn-save-voucher-pdf" onclick="saveVoucherAsPdf('${trxNum}')" aria-label="Save settlement voucher as PDF">
            <i data-lucide="arrow-down-to-line"></i>
            <span>↓ Save as PDF</span>
          </button>
          <button type="button" class="btn btn--secondary btn--sm btn-print-voucher" id="btn-print-voucher" onclick="printVoucherReceipt('${trxNum}')" aria-label="Print settlement voucher">
            <i data-lucide="printer"></i>
            <span>Print Voucher</span>
          </button>
        </div>

        <div class="voucher-actions-bar__right">
          <button type="button" class="btn btn--secondary btn--sm btn-close-voucher" onclick="closeReceiptModal()" aria-label="Close dialog">
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.classList.add('receipt-modal-open');
  if (window.lucide) window.lucide.createIcons();
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
  if (window.lucide) window.lucide.createIcons();
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
window.saveVoucherAsPdf = saveVoucherAsPdf;
window.printVoucherReceipt = printVoucherReceipt;
window.closeReceiptModal = closeReceiptModal;
window.downloadVoucherReceipt = downloadVoucherReceipt;
window.handleReceiptBackdropClick = handleReceiptBackdropClick;
window.openDisputeForOrder = openDisputeForOrder;
window.closeDisputesModal = closeDisputesModal;


// Backward compatibility helpers
function getOrderStatusBadge(status) {
  const map = {
    pending: { bg: '#FEF3C7', color: '#92400E', text: 'Pending' },
    confirmed: { bg: '#E5F0E7', color: '#12372A', text: 'Order Confirmed' },
    transport_assigned: { bg: '#E0E7FF', color: '#3730A3', text: 'Transport Assigned' },
    picked_up: { bg: '#FDE68A', color: '#78350F', text: 'Picked Up' },
    in_transit: { bg: '#CFFAFE', color: '#155E75', text: 'In Transit' },
    delivered: { bg: '#D1FAE5', color: '#065F46', text: 'Delivered' },
    completed: { bg: '#D1FAE5', color: '#065F46', text: 'Delivered · Paid' },
    cancelled: { bg: '#FEE2E2', color: '#991B1B', text: 'Cancelled' }
  };
  const item = map[status] || { bg: '#E5E7EB', color: '#374151', text: status || 'Unknown' };
  return '<span style="padding: 4px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 700; background: ' + item.bg + '; color: ' + item.color + ';">' + item.text + '</span>';
}

async function cancelOrderAction(orderId) {
  if (!confirm('Are you sure you want to cancel order ' + orderId + '? This will immediately release the reserved lot stock.')) return;
  try {
    if (window.api && window.api.orders && typeof window.api.orders.cancel === 'function') {
      const res = await window.api.orders.cancel(orderId);
      if (res && res.success) {
        if (window.KrishiLogger) window.KrishiLogger.info('ORDERS', `Order ${orderId} cancelled`);
        if (window.showToast) window.showToast(`Order ${orderId} has been cancelled successfully.`, 'info');
        else alert('Order ' + orderId + ' has been cancelled successfully.');
        loadOrders();
      } else {
        const msg = res?.error?.message || res?.message || 'Unable to cancel order.';
        if (window.KrishiLogger) window.KrishiLogger.warn('ORDERS', `Cancel failed: ${msg}`);
        if (window.showToast) window.showToast(msg, 'error');
        else alert(msg);
      }
    } else {
      allOrdersList = allOrdersList.filter(o => o.orderId !== orderId);
      updateTabCounts();
      renderActiveOrders();
      renderCompletedOrders();
      renderPayments();
      renderPaymentHistory();
      if (window.showToast) window.showToast(`Order ${orderId} has been cancelled.`, 'info');
      else alert('Order ' + orderId + ' has been cancelled.');
    }
  } catch (err) {
    if (window.KrishiLogger) window.KrishiLogger.error('ORDERS', 'Server error while cancelling order', { error: err.message || err });
    if (window.showToast) window.showToast('Unable to cancel order right now. Please check connection.', 'error');
    else alert('Server error while cancelling order.');
  }
}

window.getOrderStatusBadge = getOrderStatusBadge;
window.cancelOrderAction = cancelOrderAction;
