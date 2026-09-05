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

    let disputesMap = {};
    try {
      if (window.api && window.api.disputes) {
        const dRes = await window.api.disputes.getAll();
        if (dRes && dRes.disputes) {
          dRes.disputes.forEach(d => {
            if (d.orderId) disputesMap[d.orderId] = d;
          });
        }
      }
    } catch (e) {
      console.warn('Disputes lookup non-blocking notice:', e);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const isTrackFlow = urlParams.get('flow') === 'track';
    let storedDemo = null;
    try {
      storedDemo = JSON.parse(localStorage.getItem('krishi_demo_order') || 'null');
    } catch (_) { }

    // Determine demo order status:
    // If tracking flow or stored status exists, use that; otherwise default to completed (final happy path)
    const demoStatus = storedDemo && storedDemo.status ? storedDemo.status : (isTrackFlow ? 'confirmed' : 'completed');

    let ordersList = (res && res.success && Array.isArray(res.orders)) ? [...res.orders] : [];
    const demoExistingIdx = ordersList.findIndex(o => o.orderId === 'KS-ORD-DEMO-001');
    const demoOrderObj = {
      orderId: 'KS-ORD-DEMO-001',
      cropName: 'Tomato',
      variety: 'Hybrid Abhinav',
      quantity: 50,
      quantityUnit: 'quintal',
      agreedPrice: 2500,
      priceUnit: 'quintal',
      totalAmount: 125000,
      status: demoStatus,
      farmerName: 'Rajesh Patil (Nashik Farmer)',
      buyerName: 'ABC Foods Ltd',
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
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
        pickupLocation: 'Rajesh Patil Farm Gate, Nashik (MH)',
        destination: 'ABC Foods Processing Warehouse, MIDC Chakan, Pune (MH)',
        status: demoStatus === 'completed' || demoStatus === 'delivered' ? 'Delivered' : (demoStatus === 'in_transit' ? 'In Transit' : (demoStatus === 'picked_up' ? 'Picked Up' : 'Assigned'))
      }
    };

    if (demoExistingIdx >= 0) {
      ordersList[demoExistingIdx] = { ...demoOrderObj, ...ordersList[demoExistingIdx], status: demoStatus };
    } else {
      ordersList.unshift(demoOrderObj);
    }

    if (ordersList.length > 0) {
      grid.innerHTML = ordersList.map(ord => {
        const isDemo = ord.orderId === 'KS-ORD-DEMO-001';
        const s = getOrderStatusBadge(ord.status);
        const dateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
        const counterparty = role === 'farmer' ? `Buyer: <strong>${ord.buyerName || 'Verified Buyer'}</strong>` : `Farmer: <strong>${ord.farmerName || 'Verified Farm'}</strong>`;

        const steps = isDemo
          ? ['confirmed', 'transport_assigned', 'picked_up', 'in_transit', 'delivered', 'completed']
          : ['pending', 'confirmed', 'processing', 'ready_for_pickup', 'in_transit', 'delivered'];

        const stepLabels = isDemo
          ? ['Order Confirmed', 'Transport Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Payment Completed']
          : ['Pending', 'Confirmed', 'Processing', 'Pickup Ready', 'In Transit', 'Delivered'];

        let currentStepIndex = steps.indexOf(ord.status);
        if (currentStepIndex === -1) {
          if (ord.status === 'delivered') currentStepIndex = 4;
          else if (ord.status === 'completed') currentStepIndex = 5;
          else currentStepIndex = 0;
        }

        const isCompleted = currentStepIndex >= 4 || ord.status === 'completed' || ord.status === 'delivered';
        const disp = disputesMap[ord.orderId];
        const hasDispute = disp && !['Resolved', 'Rejected'].includes(disp.status);

        // Dynamic Transport status for demo
        let transportLiveStatus = '🚚 Transport Assigned · Vehicle MH 15 AB 4589 arriving for pickup';
        if (currentStepIndex === 2) transportLiveStatus = '📦 Picked Up from Farm Gate · Lab Quality Verified';
        else if (currentStepIndex === 3) transportLiveStatus = '🚚 In Transit to Chakan, Pune (Est. arrival in 2 hrs)';
        else if (currentStepIndex >= 4) transportLiveStatus = '✓ Delivered at ABC Foods Warehouse · Proof of Delivery Verified';
        else if (currentStepIndex === 0) transportLiveStatus = '📋 Order Confirmed · Transporter dispatch scheduled';

        return `
          <div class="dash-card" style="background: #FFFFFF; border: ${isDemo ? '2px solid var(--ks-sage, #5B9A72)' : '1px solid var(--border-light, #E5E4DD)'}; border-radius: 14px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: ${isDemo ? '0 4px 20px rgba(91, 154, 114, 0.1)' : '0 4px 14px rgba(0,0,0,0.03)'}; margin-bottom: 20px;">
            <div>
              <!-- Header Info -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-family: monospace; font-size: 13.5px; font-weight: 800; color: var(--ks-evergreen);">${ord.orderId}</span>
                  ${isDemo ? `<span style="padding: 2px 8px; border-radius: 6px; background: #E5F0E7; color: #12372A; font-size: 11px; font-weight: 700;">PRIMARY DEMO ORDER</span>` : ''}
                  <span style="font-size: 12px; color: #888;">• ${dateStr}</span>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                  <span style="padding: 3px 10px; border-radius: 6px; background: ${s.bg}; color: ${s.color}; font-size: 11.5px; font-weight: 700; text-transform: uppercase;">${s.text}</span>
                  ${isDemo && isCompleted ? `
                    <span style="padding: 3px 8px; border-radius: 6px; background: #E5F0E7; color: #12372A; font-size: 11px; font-weight: 700;">✓ PAID</span>
                  ` : ''}
                </div>
              </div>

              <!-- Crop & Counterparty -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 6px;">
                <div>
                  <h3 style="font-size: 20px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">
                    ${isDemo ? '🍅 ' : ''}${ord.cropName} ${ord.variety ? `<span style="font-size: 14px; font-weight: 400; color: #666;">(${ord.variety})</span>` : ''}
                  </h3>
                  <div style="font-size: 13px; color: #555;">
                    ${counterparty}
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 11.5px; text-transform: uppercase; color: #777; font-weight: 600;">Total Order Value</div>
                  <div style="font-size: 20px; font-weight: 800; color: var(--ks-evergreen);">₹${ord.totalAmount?.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <!-- Visual Progress Stepper (6 Stages) -->
              ${ord.status !== 'cancelled' ? `
                <div style="margin: 20px 0 22px 0;">
                  <div style="display: flex; justify-content: space-between; position: relative; margin-bottom: 8px;">
                    <div style="position: absolute; top: 12px; left: 18px; right: 18px; height: 2px; background: #E5E4DD; z-index: 1;"></div>
                    ${steps.map((st, idx) => {
          const isDone = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return `
                        <div style="position: relative; z-index: 2; text-align: center; flex: 1;">
                          <div style="width: 26px; height: 26px; border-radius: 50%; margin: 0 auto 5px auto; display: flex; align-items: center; justify-content: center; font-size: 11.5px; font-weight: 700; background: ${isDone ? 'var(--ks-evergreen)' : '#FFFFFF'}; color: ${isDone ? '#FFFFFF' : '#999'}; border: 2px solid ${isDone ? 'var(--ks-evergreen)' : '#DDD'}; box-shadow: ${isCurrent ? '0 0 0 3px rgba(91, 154, 114, 0.25)' : 'none'};">
                            ${isDone && !isCurrent ? '✓' : (idx + 1)}
                          </div>
                          <div style="font-size: 10.5px; font-weight: ${isCurrent ? '700' : '500'}; color: ${isCurrent ? 'var(--ks-evergreen)' : (isDone ? '#333' : '#999')}; line-height: 1.2;">
                            ${stepLabels[idx]}
                          </div>
                        </div>
                      `;
        }).join('')}
                  </div>
                </div>
              ` : `
                <div style="background: #FEE2E2; color: #991B1B; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 16px;">
                  ⚠️ This order was cancelled and inventory has been returned to the produce lot.
                </div>
              `}

              <!-- Transport Details Box (Connected Transporter Functionality) -->
              ${isDemo ? `
                <div style="background: #F5F4ED; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px 18px; margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                    <strong style="color: var(--ks-evergreen, #12372A); font-size: 13.5px; display: flex; align-items: center; gap: 6px;">
                      <span>🚚</span> Transport Assigned: Kisan Express Logistics
                    </strong>
                    <span style="padding: 2px 8px; border-radius: 6px; background: #E5F0E7; color: #12372A; font-size: 11px; font-weight: 700;">
                      Vehicle: MH 15 AB 4589
                    </span>
                  </div>
                  <div style="font-size: 12.5px; color: #444; line-height: 1.6;">
                    <div><strong>Driver:</strong> Suresh Patil (+91 98230 45891) · Verified Commercial Driver</div>
                    <div><strong>Pickup:</strong> Rajesh Patil Farm Gate, Nashik (MH)</div>
                    <div><strong>Destination:</strong> ABC Foods Warehouse, Plot 42 MIDC Chakan, Pune (MH)</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #DDD; flex-wrap: wrap; gap: 8px;">
                      <span style="font-weight: 600; color: var(--ks-evergreen);">${transportLiveStatus}</span>
                      <a href="transporter/dashboard.html" target="_blank" style="color: var(--ks-sage, #5B9A72); font-weight: 700; font-size: 12px; text-decoration: none;">View in Transporter Portal →</a>
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- Payment Status Box -->
              ${isCompleted ? `
                <div style="background: #E5F0E7; border: 1px solid #8FCB9B; border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #5B9A72; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800;">✓</div>
                    <div>
                      <strong style="color: var(--ks-evergreen, #12372A); font-size: 14px; display: block;">✓ Payment Received: ₹1,25,000</strong>
                      <span style="color: #486653; font-size: 12px;">Transferred to Farmer Bank A/C (...4928) via Digital Escrow Settlement</span>
                    </div>
                  </div>
                  <span style="padding: 4px 10px; border-radius: 6px; background: #FFFFFF; color: #12372A; font-size: 11.5px; font-weight: 700; border: 1px solid #8FCB9B;">PAID IN FULL</span>
                </div>
              ` : ''}

              ${hasDispute ? `
                <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #D97706; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 16px;">🔒</div>
                    <div>
                      <strong style="color: #92400E; font-size: 14px; display: block;">🔒 Payment Protected During Dispute</strong>
                      <span style="color: #B45309; font-size: 12px;">₹1,25,000 securely held in escrow pending FPO/Admin mediation</span>
                    </div>
                  </div>
                  <a href="disputes.html?disputeId=${disp.disputeId}" style="padding: 5px 12px; border-radius: 6px; background: #D97706; color: #FFFFFF; font-size: 12px; font-weight: 700; text-decoration: none;">View Dispute →</a>
                </div>
              ` : ''}

              <!-- Order Pricing & Delivery Details Box -->
              <div style="background: #F5F4ED; border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; font-size: 13px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 6px;">
                  <div>
                    <span style="color: #666;">Quantity Ordered:</span>
                    <strong style="color: #222; display: block;">${ord.quantity} ${ord.quantityUnit || 'quintal'}</strong>
                  </div>
                  <div>
                    <span style="color: #666;">Agreed Rate:</span>
                    <strong style="color: #222; display: block;">₹${ord.agreedPrice?.toLocaleString('en-IN')}/${ord.priceUnit || 'q'}</strong>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; border-top: 1px dashed #DDD; padding-top: 8px; margin-top: 8px;">
                  <strong style="color: var(--ks-evergreen); font-size: 14px;">Total Order Amount:</strong>
                  <strong style="color: var(--ks-evergreen); font-size: 16px;">₹${ord.totalAmount?.toLocaleString('en-IN')}</strong>
                </div>

                ${ord.deliveryAddress?.addressLine1 ? `
                  <div style="border-top: 1px dashed #DDD; padding-top: 8px; margin-top: 8px; font-size: 12px; color: #555;">
                    <strong>Delivery:</strong> ${ord.deliveryAddress.name || ''} (${ord.deliveryAddress.phone || ''}) · ${ord.deliveryAddress.addressLine1}, ${ord.deliveryAddress.village || ''}, ${ord.deliveryAddress.state || ''} - ${ord.deliveryAddress.pincode || ''}
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Actions Bar -->
            <div>
              <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; border-top: 1px solid #EEE; padding-top: 14px; flex-wrap: wrap;">
                <div>
                  ${(() => {
            if (hasDispute) {
              return `
                        <a href="disputes.html?disputeId=${disp.disputeId}" class="btn btn--sm" style="background: #E5F0E7; color: #12372A; border: 1px solid #8FCB9B; padding: 7px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                          🔒 Payment Protected · View Dispute
                        </a>
                      `;
            }
            if (ord.status !== 'cancelled') {
              return `
                        <a href="disputes.html?orderId=${ord.orderId}" style="color: #6F7F75; font-size: 12.5px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 6px 0;" title="Raise grievance or quality claim for this order">
                          Problem with this order? <span style="text-decoration: underline; font-weight: 600;">Raise Dispute</span>
                        </a>
                      `;
            }
            return '';
          })()}
                </div>
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                  ${isDemo ? `
                    ${!isCompleted ? `
                      <button class="btn btn--sm btn--primary" onclick="advanceDemoOrder()">
                        Advance to Next Step →
                      </button>
                      <button class="btn btn--sm btn--secondary" onclick="completeDemoOrder()">
                        Complete Journey ✓
                      </button>
                    ` : `
                      <button class="btn btn--sm btn--secondary" style="font-size: 11.5px; color: #555;" onclick="resetDemoOrder()">
                        Replay Journey ↻
                      </button>
                    `}
                  ` : ''}
                  ${!isDemo && role === 'farmer' && ord.status !== 'delivered' && ord.status !== 'cancelled' ? `
                    <button class="btn btn--sm btn--primary" onclick="openUpdateStatusModal('${ord.orderId}', '${ord.status}')">
                      Advance Fulfillment Status →
                    </button>
                  ` : ''}
                  ${role === 'buyer' && (ord.status === 'pending' || ord.status === 'confirmed') ? `
                    <button class="btn btn--sm" style="background: rgba(220, 38, 38, 0.08); color: #dc2626; border: none; padding: 8px 14px; border-radius: 6px; font-size: 12px; cursor: pointer;" onclick="cancelOrderAction('${ord.orderId}')">
                      Cancel Order
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      grid.innerHTML = `
        <div style="padding: 56px 24px; text-align: center; color: #888; grid-column: 1 / -1; background: #FAF9F5; border-radius: 14px; border: 1px dashed #DDD;">
          <div style="font-size: 42px; margin-bottom: 12px;">📋</div>
          <h3 style="font-size: 17px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">No Orders Yet</h3>
          <p style="font-size: 13.5px; color: #666; margin: 0 0 20px 0; max-width: 480px; margin-left: auto; margin-right: auto;">
            ${role === 'farmer' ? 'When buyers accept your negotiation quotes and confirm purchase contracts, your fulfillment jobs will appear here.' : 'When farmers accept your produce inquiries, confirmed orders will appear here for logistics tracking.'}
          </p>
          <a href="${role === 'farmer' ? 'dashboard.html' : 'market.html'}" class="btn btn--primary" style="text-decoration: none;">
            ${role === 'farmer' ? 'Back to Dashboard' : 'Browse Marketplace'}
          </a>
        </div>
      `;
    }
    if (window.lucide) lucide.createIcons();
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
  }
}

// ── Demo Flow Progression Handlers for KS-ORD-DEMO-001 ──
window.advanceDemoOrder = function () {
  const steps = ['confirmed', 'transport_assigned', 'picked_up', 'in_transit', 'delivered', 'completed'];
  let currentStored = {};
  try {
    currentStored = JSON.parse(localStorage.getItem('krishi_demo_order') || '{}');
  } catch (_) { }

  let curStatus = currentStored.status || 'confirmed';
  let idx = steps.indexOf(curStatus);
  let nextStatus = idx < steps.length - 1 ? steps[idx + 1] : 'completed';
  currentStored.status = nextStatus;
  localStorage.setItem('krishi_demo_order', JSON.stringify(currentStored));

  if (window.api && window.api.orders && typeof window.api.orders.updateStatus === 'function') {
    window.api.orders.updateStatus('KS-ORD-DEMO-001', nextStatus).catch(() => { });
  }
  loadOrders();
};

window.completeDemoOrder = function () {
  let currentStored = {};
  try {
    currentStored = JSON.parse(localStorage.getItem('krishi_demo_order') || '{}');
  } catch (_) { }

  currentStored.status = 'completed';
  localStorage.setItem('krishi_demo_order', JSON.stringify(currentStored));

  if (window.api && window.api.orders && typeof window.api.orders.updateStatus === 'function') {
    window.api.orders.updateStatus('KS-ORD-DEMO-001', 'completed').catch(() => { });
  }
  loadOrders();
};

window.resetDemoOrder = function () {
  let currentStored = {};
  try {
    currentStored = JSON.parse(localStorage.getItem('krishi_demo_order') || '{}');
  } catch (_) { }

  currentStored.status = 'confirmed';
  localStorage.setItem('krishi_demo_order', JSON.stringify(currentStored));

  if (window.api && window.api.orders && typeof window.api.orders.updateStatus === 'function') {
    window.api.orders.updateStatus('KS-ORD-DEMO-001', 'confirmed').catch(() => { });
  }
  loadOrders();
};

async function cancelOrderAction(orderId) {
  if (!confirm(`Are you sure you want to cancel order ${orderId}? This will immediately release the reserved lot stock.`)) return;

  try {
    const res = await window.api.orders.cancel(orderId);
    if (res.success) {
      alert(`Order ${orderId} has been cancelled successfully.`);
      loadOrders();
    } else {
      alert(res.message || 'Unable to cancel order.');
    }
  } catch (err) {
    alert('Server error while cancelling order.');
  }
}

function openUpdateStatusModal(orderId, currentStatus) {
  const nextStatuses = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['ready_for_pickup', 'cancelled'],
    ready_for_pickup: ['delivered', 'cancelled'],
    in_transit: ['delivered']
  };

  const allowed = nextStatuses[currentStatus] || [];
  if (allowed.length === 0) {
    alert('No further status transitions available for this order.');
    return;
  }

  grid.innerHTML = activeOrders.map(ord => renderActiveOrderCard(ord)).join('');
}

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
