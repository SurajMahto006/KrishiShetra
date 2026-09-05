/**
 * KRISHISHETRA — DISPUTE & GRIEVANCE REDRESSAL CONTROLLER (Gap 3)
 * Handles dispute lifecycles, 5-step status timelines, evidence previews,
 * simulated payment protection, and FPO/Admin mediation & resolution.
 */

const state = {
  disputes: [],
  filteredDisputes: [],
  selectedDispute: null,
  activeFilter: 'all',
  orders: [],
  evidenceFiles: [],
  currentUserRole: 'farmer'
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.Auth && !window.Auth.requireAuth()) {
    return;
  }

  state.currentUserRole = window.Auth ? window.Auth.getRole() : 'farmer';
  initDisputeCenter();
});

/**
 * Initialize Dispute Center: read query params, load user orders, and load disputes
 */
async function initDisputeCenter() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetOrderId = urlParams.get('orderId');
  const targetDisputeId = urlParams.get('disputeId') || (targetOrderId === 'KS-ORD-DEMO-001' ? 'KS-DSP-DEMO-001' : null);

  // Update dynamic breadcrumbs based on role
  const role = state.currentUserRole;
  const bcHome = document.getElementById('bc-home-link');
  const bcOrders = document.getElementById('bc-orders-link');
  const heading = document.getElementById('disputes-list-heading');

  if (role === 'buyer') {
    if (bcHome) { bcHome.href = 'buyer.html#/buyer/dashboard'; bcHome.textContent = 'Buyer Portal'; }
    if (bcOrders) { bcOrders.href = 'buyer.html#/buyer/orders'; bcOrders.textContent = 'My Orders'; }
    if (heading) { heading.textContent = 'My Disputes'; }
  } else if (role === 'fpo') {
    if (bcHome) { bcHome.href = 'fpo-dashboard.html'; bcHome.textContent = 'FPO Hub'; }
    if (bcOrders) { bcOrders.href = 'fpo-dashboard.html#orders'; bcOrders.textContent = 'Orders'; }
    if (heading) { heading.textContent = 'Mediation Cases'; }
  } else if (role === 'admin') {
    if (bcHome) { bcHome.href = 'admin/dashboard.html'; bcHome.textContent = 'Admin Portal'; }
    if (bcOrders) { bcOrders.style.display = 'none'; }
    if (heading) { heading.textContent = 'Platform Disputes'; }
  } else {
    if (heading) { heading.textContent = 'My Disputes'; }
  }

  await loadUserOrdersForModal();
  await loadDisputes(targetDisputeId);

  // If redirected with ?orderId, auto-open the Raise Dispute modal with pre-selected order
  if (targetOrderId && targetOrderId !== 'KS-ORD-DEMO-001') {
    openRaiseDisputeModal(targetOrderId);
  } else if (urlParams.get('open') === 'modal') {
    openRaiseDisputeModal();
  }
}

/**
 * Load user's orders to populate the "Select Order" dropdown in Raise Dispute modal
 */
async function loadUserOrdersForModal() {
  const selectElem = document.getElementById('modal-order-select');
  if (!selectElem) return;

  try {
    const role = state.currentUserRole;
    let res;
    if (role === 'farmer') {
      res = await window.api.orders.getFarmer();
    } else {
      res = await window.api.orders.getMine();
    }

    if (res && res.success && Array.isArray(res.orders)) {
      state.orders = res.orders;
      selectElem.innerHTML = `
        <option value="">Select an order to dispute...</option>
        ${res.orders
          .filter(o => o.status !== 'cancelled')
          .map(o => `
            <option value="${o.orderId}">
              ${o.orderId} — ${o.cropName} (${o.quantity} ${o.quantityUnit || 'q'}, ₹${o.totalAmount?.toLocaleString('en-IN')})
            </option>
          `).join('')}
      `;
    }
  } catch (err) {
    console.warn('Could not load orders for dispute modal:', err);
  }
}

/**
 * Fetch disputes from backend
 */
async function loadDisputes(preferredDisputeId = null) {
  const container = document.getElementById('disputes-list-container');
  if (!container) return;

  try {
    const res = await window.api.disputes.getAll();
    if (res && res.success && Array.isArray(res.disputes)) {
      state.disputes = res.disputes;
    } else {
      state.disputes = [];
    }
  } catch (err) {
    console.warn('Backend disputes API notice:', err);
    state.disputes = [];
  }

  // Ensure authorized roles (buyer, farmer, fpo, admin) see the demo dispute KS-DSP-DEMO-001
  const role = state.currentUserRole;
  const isAuthorizedRole = ['buyer', 'farmer', 'admin', 'fpo'].includes(role);
  if (isAuthorizedRole && !state.disputes.some(d => d.disputeId === 'KS-DSP-DEMO-001')) {
    const demoDisp = {
      _id: '660000000000000000000999',
      disputeId: 'KS-DSP-DEMO-001',
      orderId: 'KS-ORD-DEMO-001',
      cropName: 'Tomato',
      quantity: 50,
      quantityUnit: 'Qtl',
      orderAmount: 125000,
      reason: 'Quality Mismatch',
      description: 'Received produce does not match the agreed quality specification.',
      status: 'Under Review',
      raisedByRole: 'buyer',
      raisedBy: {
        name: 'ABC Foods Pvt Ltd (Rajesh Patil)',
        role: 'buyer',
        email: 'procurement@abcfoods.in'
      },
      counterparty: {
        name: 'Nashik Farmer Producer Co (FPO)',
        role: 'farmer',
        email: 'farmer@krishishetra.in'
      },
      paymentProtection: {
        isProtected: true,
        protectedAmount: 125000,
        statusText: 'Protected During Dispute'
      },
      timeline: [
        {
          status: 'Raised',
          title: 'Dispute Raised',
          note: 'Buyer opened dispute for Quality Mismatch. Payment protected.',
          actorRole: 'buyer',
          timestamp: new Date(Date.now() - 36 * 3600 * 1000)
        },
        {
          status: 'Evidence Submitted',
          title: 'Evidence Submitted',
          note: '2 inspection photos and quality lab report attached.',
          actorRole: 'buyer',
          timestamp: new Date(Date.now() - 34 * 3600 * 1000)
        },
        {
          status: 'Under Review',
          title: 'Under Review',
          note: 'Assigned to FPO / Admin mediation panel.',
          actorRole: 'fpo',
          timestamp: new Date(Date.now() - 12 * 3600 * 1000)
        }
      ],
      evidence: [
        {
          name: 'Batch_Inspection_Report.pdf',
          fileUrl: '',
          previewUrl: '',
          note: 'APMC quality grading certificate documenting grade divergence',
          uploadedAt: new Date(Date.now() - 34 * 3600 * 1000)
        },
        {
          name: 'Tomato_Delivery_Sample.jpg',
          fileUrl: '',
          previewUrl: 'assets/images/hero-farm.jpg',
          note: 'Photographic evidence taken at unloading dock',
          uploadedAt: new Date(Date.now() - 34 * 3600 * 1000)
        }
      ],
      resolution: {
        type: 'None',
        refundAmount: 0,
        comment: ''
      },
      createdAt: new Date(Date.now() - 36 * 3600 * 1000),
      updatedAt: new Date(Date.now() - 12 * 3600 * 1000)
    };
    state.disputes.unshift(demoDisp);
  }

  filterDisputes(state.activeFilter, false);

  // Select targeted dispute or default to the first
  let toSelect = null;
  if (preferredDisputeId) {
    toSelect = state.disputes.find(d => d.disputeId === preferredDisputeId || d._id === preferredDisputeId || d.orderId === preferredDisputeId);
  }
  if (!toSelect && state.disputes.length > 0) {
    toSelect = state.disputes[0];
  }

  if (toSelect) {
    selectDispute(toSelect._id || toSelect.disputeId);
  } else {
    renderDisputeDetail(null);
  }
}

/**
 * Filter disputes by tab
 */
function filterDisputes(filterKey, reselect = true) {
  state.activeFilter = filterKey;

  // Update active pill button UI
  document.querySelectorAll('.filter-pill-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === filterKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const activeStatuses = ['Raised', 'Under Review', 'Mediation', 'Resolution Proposed'];
  const reviewStatuses = ['Under Review', 'Mediation'];
  const resolvedStatuses = ['Resolved', 'Rejected'];

  if (filterKey === 'active') {
    state.filteredDisputes = state.disputes.filter(d => activeStatuses.includes(d.status));
  } else if (filterKey === 'review') {
    state.filteredDisputes = state.disputes.filter(d => reviewStatuses.includes(d.status));
  } else if (filterKey === 'resolved') {
    state.filteredDisputes = state.disputes.filter(d => resolvedStatuses.includes(d.status));
  } else {
    state.filteredDisputes = [...state.disputes];
  }

  renderDisputesList();

  if (reselect) {
    if (state.filteredDisputes.length > 0) {
      selectDispute(state.filteredDisputes[0]._id || state.filteredDisputes[0].disputeId);
    } else {
      renderDisputeDetail(null);
    }
  }
}

/**
 * Render dispute cards in the left column
 */
function renderDisputesList() {
  const container = document.getElementById('disputes-list-container');
  if (!container) return;

  if (!state.filteredDisputes || state.filteredDisputes.length === 0) {
    container.innerHTML = `
      <div style="padding: 42px 18px; text-align: center; background: #FFFFFF; border-radius: 14px; border: 1px dashed var(--ks-border, #E2E0D5); color: var(--ks-text-muted, #6F7F75);">
        <div style="font-size: 32px; margin-bottom: 8px;">🛡️</div>
        <div style="font-weight: 700; color: var(--ks-evergreen, #12372A); font-size: 15px; margin-bottom: 4px;">No Disputes in this View</div>
        <p style="font-size: 12.5px; margin: 0;">No active or past claims found under the selected category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.filteredDisputes.map(d => {
    const isSelected = state.selectedDispute && (state.selectedDispute._id === d._id || state.selectedDispute.disputeId === d.disputeId);
    const badge = getStatusBadge(d.status);
    const isProtected = d.paymentProtection ? d.paymentProtection.isProtected : true;

    return `
      <div class="dispute-item-card ${isSelected ? 'dispute-item-card--active' : ''}" onclick="selectDispute('${d._id || d.disputeId}')">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-family: monospace; font-size: 13px; font-weight: 800; color: var(--ks-evergreen, #12372A);">
            Order #${d.orderId}
          </span>
          <span class="badge-status ${badge.cssClass}">
            🟡 ${d.status}
          </span>
        </div>

        <div style="font-size: 16px; font-weight: 700; color: var(--ks-charcoal, #17221D); margin-bottom: 4px;">
          ${d.cropName || 'Produce'} · ${d.quantity} ${d.quantityUnit || 'Qtl'}
        </div>

        <div style="font-size: 13px; color: var(--ks-charcoal, #17221D); margin-bottom: 12px;">
          <strong>${d.reason}</strong>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--ks-border, #E2E0D5); padding-top: 10px; font-size: 12px;">
          <span style="color: var(--ks-evergreen, #12372A); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
            ${isProtected ? '🔒 Payment Protected' : '✓ Settled'}
          </span>
          <span style="color: var(--ks-sage, #5B9A72); font-weight: 700; display: inline-flex; align-items: center; gap: 2px;">
            View Dispute →
          </span>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Select a dispute and show details in right column
 */
async function selectDispute(id) {
  try {
    const res = await window.api.disputes.getById(id);
    if (res && res.success && res.dispute) {
      state.selectedDispute = res.dispute;
    } else {
      state.selectedDispute = state.disputes.find(d => d._id === id || d.disputeId === id);
    }
  } catch (err) {
    state.selectedDispute = state.disputes.find(d => d._id === id || d.disputeId === id);
  }

  renderDisputesList();
  renderDisputeDetail(state.selectedDispute);
}

/**
 * Render right column detail & mediation panel
 */
function renderDisputeDetail(dispute) {
  const panel = document.getElementById('dispute-detail-panel');
  if (!panel) return;

  if (!dispute) {
    panel.innerHTML = `
      <div class="detail-section-block" style="text-align: center; padding: 60px 24px; color: var(--ks-text-muted, #6F7F75);">
        <div style="font-size: 40px; margin-bottom: 12px;">⚖️</div>
        <h3 style="font-size: 18px; font-weight: 700; color: var(--ks-evergreen, #12372A); margin: 0 0 6px 0;">No Dispute Selected</h3>
        <p style="font-size: 13.5px; max-width: 420px; margin: 0 auto 20px auto;">
          Select an existing dispute or raise a new one to inspect details, view payment protection status, or access mediation.
        </p>
        <button class="btn btn--primary btn--sm" onclick="openRaiseDisputeModal()">
          <i data-lucide="plus-circle" style="width: 14px; height: 14px;"></i> Raise a Dispute
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const badge = getStatusBadge(dispute.status);
  const isFpoOrAdmin = state.currentUserRole === 'fpo' || state.currentUserRole === 'admin';
  const isProtected = dispute.paymentProtection && dispute.paymentProtection.isProtected;
  const isResolved = dispute.status === 'Resolved' || dispute.status === 'Rejected';

  // Determine 5-step status stepper states
  // Steps: 1. Dispute Raised, 2. Evidence Submitted, 3. Under Review, 4. FPO/Admin Mediation, 5. Resolution
  const stepsState = calculateStepperStates(dispute);

  panel.innerHTML = `
    <!-- 1. Header Overview Card -->
    <div class="detail-section-block">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-family: monospace; font-size: 14px; font-weight: 800; color: var(--ks-evergreen, #12372A);">
              ${dispute.disputeId}
            </span>
            <span class="badge-status ${badge.cssClass}">
              ${badge.label}
            </span>
          </div>
          <h2 style="font-size: 21px; font-weight: 800; color: var(--ks-evergreen, #12372A); margin: 0;">
            ${dispute.cropName || 'Produce Batch'} · Order #${dispute.orderId}
          </h2>
        </div>

        <div style="text-align: right;">
          <div style="font-size: 11.5px; color: var(--ks-text-muted, #6F7F75);">Total Contract Value</div>
          <div style="font-size: 18px; font-weight: 800; color: var(--ks-evergreen, #12372A);">
            ₹${dispute.orderAmount?.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <!-- Payment Protection Pill / Banner -->
      <div style="background: ${isProtected ? 'var(--ks-pale-sage, #E5F0E7)' : '#F5F4ED'}; border: 1px solid ${isProtected ? 'var(--ks-mint, #8FCB9B)' : '#E2E0D5'}; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; font-size: 13.5px; margin-top: 12px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px; color: var(--ks-evergreen, #12372A); font-weight: 700;">
          <i data-lucide="shield-check" style="width: 18px; height: 18px; color: var(--ks-sage, #5B9A72);"></i>
          ${isProtected ? `🔒 Payment Protected During Dispute` : `✓ Protection Status: ${dispute.paymentProtection?.statusText || 'Settled'}`}
        </div>
        <span style="font-size: 12px; color: var(--ks-evergreen, #12372A); font-weight: 600;">
          ${isProtected ? `₹${(dispute.paymentProtection?.protectedAmount || dispute.orderAmount)?.toLocaleString('en-IN')} held securely` : 'Case Concluded'}
        </span>
      </div>

      <!-- 2. 5-Step Visual Timeline Stepper -->
      <div style="margin-top: 24px;">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--ks-text-muted, #6F7F75); margin-bottom: 8px;">
          Resolution Progress
        </div>
        <div class="dispute-timeline-stepper">
          ${renderStepNode(1, 'Dispute Raised', stepsState[0])}
          ${renderStepNode(2, 'Evidence Submitted', stepsState[1])}
          ${renderStepNode(3, 'Under Review', stepsState[2])}
          ${renderStepNode(4, 'FPO/Admin Mediation', stepsState[3])}
          ${renderStepNode(5, dispute.status === 'Rejected' ? 'Rejected' : 'Resolution', stepsState[4])}
        </div>
      </div>
    </div>

    <!-- 3. Details & Evidence Block -->
    <div class="detail-section-block">
      <h3 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen, #12372A); margin: 0 0 16px 0; border-bottom: 1px solid var(--ks-border, #E2E0D5); padding-bottom: 8px;">
        Dispute Details & Claim
      </h3>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; font-size: 13px;">
        <div>
          <span style="color: var(--ks-text-muted, #6F7F75); display: block; margin-bottom: 2px;">Reason</span>
          <strong style="color: var(--ks-charcoal, #17221D); font-size: 14px;">${dispute.reason}</strong>
        </div>
        <div>
          <span style="color: var(--ks-text-muted, #6F7F75); display: block; margin-bottom: 2px;">Raised By</span>
          <strong style="color: var(--ks-charcoal, #17221D);">
            ${dispute.raisedBy?.name || 'Verified User'} (${dispute.raisedByRole?.toUpperCase() || 'USER'})
          </strong>
        </div>
        <div>
          <span style="color: var(--ks-text-muted, #6F7F75); display: block; margin-bottom: 2px;">Counterparty</span>
          <strong style="color: var(--ks-charcoal, #17221D);">${dispute.counterparty?.name || 'Verified Party'}</strong>
        </div>
        <div>
          <span style="color: var(--ks-text-muted, #6F7F75); display: block; margin-bottom: 2px;">Batch Quantity</span>
          <strong style="color: var(--ks-charcoal, #17221D);">${dispute.quantity} ${dispute.quantityUnit || 'kg'}</strong>
        </div>
      </div>

      <div style="background: #FAF9F5; border: 1px solid var(--ks-border, #E2E0D5); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <div style="font-size: 11.5px; font-weight: 700; color: var(--ks-text-muted, #6F7F75); text-transform: uppercase; margin-bottom: 4px;">
          Description / Problem Summary
        </div>
        <p style="font-size: 13.5px; color: var(--ks-charcoal, #17221D); margin: 0; line-height: 1.6; white-space: pre-wrap;">${dispute.description}</p>
      </div>

      <!-- Evidence Gallery -->
      <div>
        <div style="font-size: 12.5px; font-weight: 700; color: var(--ks-evergreen, #12372A); margin-bottom: 8px;">
          Submitted Evidence Documents & Photos (${dispute.evidence?.length || 0})
        </div>
        ${dispute.evidence && dispute.evidence.length > 0 ? `
          <div class="evidence-grid">
            ${dispute.evidence.map(e => `
              <div class="evidence-preview-box">
                ${e.previewUrl ? `
                  <img src="${e.previewUrl}" alt="${e.name}" onclick="window.open('${e.previewUrl}', '_blank')" style="cursor: pointer;" title="Click to view full preview">
                ` : `
                  <div style="height: 80px; display: flex; align-items: center; justify-content: center; background: #ECEAE1; border-radius: 4px; margin-bottom: 6px;">
                    <i data-lucide="file-text" style="width: 28px; height: 28px; color: var(--ks-sage, #5B9A72);"></i>
                  </div>
                `}
                <span title="${e.name}">${e.name}</span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="font-size: 12.5px; color: var(--ks-text-muted, #6F7F75); font-style: italic;">
            No photos or documents were attached to this dispute.
          </div>
        `}
      </div>
    </div>

    <!-- 4. Formal Resolution Outcome (Visible if Resolved or Rejected) -->
    ${isResolved ? `
      <div class="detail-section-block" style="background: ${dispute.status === 'Resolved' ? '#F4F9F5' : '#FDF3F2'}; border-color: ${dispute.status === 'Resolved' ? '#A7F3D0' : '#F5C5BE'};">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${dispute.status === 'Resolved' ? 'var(--ks-sage, #5B9A72)' : 'var(--ks-terracotta, #C96D5B)'}; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 16px;">
            ${dispute.status === 'Resolved' ? '✓' : '✕'}
          </div>
          <div>
            <h4 style="font-size: 16px; font-weight: 800; color: var(--ks-evergreen, #12372A); margin: 0;">
              Dispute Outcome: ${dispute.resolution?.type || dispute.status}
            </h4>
            <span style="font-size: 12px; color: var(--ks-text-muted, #6F7F75);">
              Concluded by ${dispute.resolution?.resolvedBy?.name || 'Authorized Mediator'} on ${dispute.resolution?.resolvedAt ? new Date(dispute.resolution.resolvedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Record'}
            </span>
          </div>
        </div>

        ${dispute.resolution?.refundAmount ? `
          <div style="background: #FFFFFF; border-radius: 6px; padding: 10px 14px; margin-bottom: 10px; font-size: 13.5px; font-weight: 600; color: var(--ks-evergreen, #12372A); display: inline-block;">
            Settlement / Refund Amount: ₹${dispute.resolution.refundAmount.toLocaleString('en-IN')}
          </div>
        ` : ''}

        ${dispute.resolution?.comment ? `
          <div style="font-size: 13px; color: var(--ks-charcoal, #17221D); background: rgba(255,255,255,0.7); padding: 10px 14px; border-radius: 6px;">
            <strong>Mediator Remarks:</strong> ${dispute.resolution.comment}
          </div>
        ` : ''}
      </div>
    ` : ''}

    <!-- 5. FPO / Admin Mediation & Redressal Controls (Only for FPO/Admin roles when not yet resolved) -->
    ${isFpoOrAdmin && !isResolved ? `
      <div class="detail-section-block" style="border-left: 4px solid var(--ks-amber, #D6A84F);">
        <h3 style="font-size: 16px; font-weight: 800; color: var(--ks-evergreen, #12372A); margin: 0 0 6px 0; display: flex; align-items: center; gap: 8px;">
          <i data-lucide="scale" style="width: 18px; height: 18px; color: var(--ks-amber, #D6A84F);"></i>
          FPO & Admin Mediation Center
        </h3>
        <p style="font-size: 12.5px; color: var(--ks-text-muted, #6F7F75); margin: 0 0 16px 0;">
          As an authorized FPO officer or KrishiShetra Admin, you can advance the grievance stage or formulate a binding settlement decision.
        </p>

        <!-- Stage progression buttons -->
        <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
          ${dispute.status === 'Raised' ? `
            <button class="btn btn--sm" style="background: var(--ks-pale-sage, #E5F0E7); color: var(--ks-evergreen, #12372A); border: 1px solid var(--ks-mint, #8FCB9B);" onclick="handleStatusUpdate('${dispute._id || dispute.disputeId}', 'Under Review')">
              Move to Under Review →
            </button>
          ` : ''}
          ${dispute.status === 'Under Review' ? `
            <button class="btn btn--sm" style="background: #EEF4FD; color: #1A569E; border: 1px solid #B8D4FB;" onclick="handleStatusUpdate('${dispute._id || dispute.disputeId}', 'Mediation')">
              Initiate FPO Mediation →
            </button>
          ` : ''}
        </div>

        <!-- Binding Resolution Form -->
        <form onsubmit="handleResolveDispute(event, '${dispute._id || dispute.disputeId}')" style="background: #FAF9F5; border: 1px solid var(--ks-border, #E2E0D5); border-radius: 8px; padding: 16px;">
          <div style="font-size: 13.5px; font-weight: 700; color: var(--ks-evergreen, #12372A); margin-bottom: 12px;">
            Issue Mediation Resolution
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 12.5px; font-weight: 600; color: var(--ks-charcoal, #17221D); margin-bottom: 4px;">
              Resolution Type <span style="color: var(--ks-terracotta, #C96D5B);">*</span>
            </label>
            <select id="resolve-type-select" required onchange="toggleRefundInput(this.value)" style="width: 100%; padding: 8px 12px; border: 1px solid var(--ks-border, #E2E0D5); border-radius: 6px; font-size: 13px; background: #FFFFFF;">
              <option value="">Select resolution decision...</option>
              <option value="Mutual Settlement">Mutual Settlement (Both parties agree to adjust terms)</option>
              <option value="Partial Refund">Partial Refund (Deduct specified amount for defect)</option>
              <option value="Return Batch">Return Batch (Counterparty to return physical lot)</option>
              <option value="Re-inspection">Re-inspection (Authorized FPO lab re-check)</option>
              <option value="Reject Dispute">Reject Dispute (Claim unfounded, clear funds to seller)</option>
            </select>
          </div>

          <!-- Conditional Refund Amount -->
          <div id="resolve-refund-wrap" style="margin-bottom: 12px; display: none;">
            <label style="display: block; font-size: 12.5px; font-weight: 600; color: var(--ks-charcoal, #17221D); margin-bottom: 4px;">
              Settlement / Refund Amount (₹)
            </label>
            <input type="number" id="resolve-refund-amount" min="0" max="${dispute.orderAmount || 9999999}" placeholder="e.g. 5000" style="width: 100%; padding: 8px 12px; border: 1px solid var(--ks-border, #E2E0D5); border-radius: 6px; font-size: 13px;">
          </div>

          <div style="margin-bottom: 14px;">
            <label style="display: block; font-size: 12.5px; font-weight: 600; color: var(--ks-charcoal, #17221D); margin-bottom: 4px;">
              Mediation Justification & Decision Note <span style="color: var(--ks-terracotta, #C96D5B);">*</span>
            </label>
            <textarea id="resolve-comment" rows="3" required placeholder="Explain why this decision was reached based on evidence, mandi standards, or joint agreement..." style="width: 100%; padding: 8px 12px; border: 1px solid var(--ks-border, #E2E0D5); border-radius: 6px; font-size: 13px; font-family: inherit; resize: vertical;"></textarea>
          </div>

          <button type="submit" class="btn btn--primary btn--sm" style="display: inline-flex; align-items: center; gap: 6px;">
            <i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> Conclude & Apply Resolution
          </button>
        </form>
      </div>
    ` : ''}

    <!-- 6. Chronological Activity / Timeline Log -->
    <div class="detail-section-block">
      <h3 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen, #12372A); margin: 0 0 14px 0; border-bottom: 1px solid var(--ks-border, #E2E0D5); padding-bottom: 8px;">
        Audit Log & Timeline Activity
      </h3>

      <div style="position: relative; padding-left: 20px;">
        <div style="position: absolute; left: 6px; top: 8px; bottom: 8px; width: 2px; background: var(--ks-border, #E2E0D5);"></div>
        ${dispute.timeline && dispute.timeline.length > 0 ? dispute.timeline.map(t => {
          const tDate = t.timestamp ? new Date(t.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
          return `
            <div style="position: relative; margin-bottom: 14px;">
              <div style="position: absolute; left: -18px; top: 3px; width: 10px; height: 10px; border-radius: 50%; background: var(--ks-sage, #5B9A72); border: 2px solid #FFFFFF;"></div>
              <div style="display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 700; color: var(--ks-charcoal, #17221D);">
                <span>${t.title}</span>
                <span style="font-weight: 400; font-size: 11px; color: var(--ks-text-muted, #6F7F75);">${tDate}</span>
              </div>
              ${t.note ? `<div style="font-size: 12px; color: var(--ks-text-muted, #6F7F75); margin-top: 2px;">${t.note}</div>` : ''}
              ${t.actorRole ? `<div style="font-size: 10.5px; color: var(--ks-sage, #5B9A72); text-transform: uppercase; font-weight: 600;">By ${t.actorRole}</div>` : ''}
            </div>
          `;
        }).join('') : `
          <div style="font-size: 12px; color: var(--ks-text-muted, #6F7F75);">No timeline events recorded yet.</div>
        `}
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Calculate done/active states for the 5-step timeline
 * Steps:
 * 1. Dispute Raised
 * 2. Evidence Submitted
 * 3. Under Review
 * 4. FPO/Admin Mediation
 * 5. Resolution
 */
function calculateStepperStates(dispute) {
  // states: 'done', 'active', 'pending', 'rejected'
  const st = dispute.status;

  let s1 = 'done'; // ✓ Dispute Raised
  let s2 = 'done'; // ✓ Evidence Submitted
  let s3 = 'pending';
  let s4 = 'pending';
  let s5 = 'pending';

  if (st === 'Raised') {
    s3 = 'pending';
    s4 = 'pending';
    s5 = 'pending';
  } else if (st === 'Under Review') {
    s3 = 'active'; // ● Under Review
    s4 = 'pending'; // ○ FPO/Admin Mediation
    s5 = 'pending'; // ○ Resolution
  } else if (st === 'Mediation' || st === 'Resolution Proposed') {
    s3 = 'done';
    s4 = 'active'; // ● FPO/Admin Mediation
    s5 = 'pending'; // ○ Resolution
  } else if (st === 'Resolved') {
    s3 = 'done';
    s4 = 'done';
    s5 = 'done'; // ✓ Resolution
  } else if (st === 'Rejected') {
    s3 = 'done';
    s4 = 'done';
    s5 = 'rejected'; // ✕ Rejected
  }

  return [s1, s2, s3, s4, s5];
}

/**
 * Helper to render individual timeline nodes
 */
function renderStepNode(index, label, stateStr) {
  let iconHtml = `${index}`;
  let cssClass = '';

  if (stateStr === 'done') {
    iconHtml = '✓';
    cssClass = 'is-done';
  } else if (stateStr === 'active') {
    iconHtml = '●';
    cssClass = 'is-active';
  } else if (stateStr === 'rejected') {
    iconHtml = '✕';
    cssClass = 'is-rejected';
  } else {
    iconHtml = '○';
  }

  return `
    <div class="timeline-step-node ${cssClass}">
      <div class="timeline-step-circle">
        ${iconHtml}
      </div>
      <div class="timeline-step-label">${label}</div>
    </div>
  `;
}

/**
 * Returns human-readable label and styling for dispute status
 */
function getStatusBadge(status) {
  switch (status) {
    case 'Raised':
      return { label: 'Dispute Raised', cssClass: 'badge-status--raised' };
    case 'Under Review':
      return { label: 'Under Review', cssClass: 'badge-status--review' };
    case 'Mediation':
      return { label: 'In Mediation', cssClass: 'badge-status--mediation' };
    case 'Resolution Proposed':
      return { label: 'Resolution Proposed', cssClass: 'badge-status--mediation' };
    case 'Resolved':
      return { label: 'Resolved', cssClass: 'badge-status--resolved' };
    case 'Rejected':
      return { label: 'Rejected', cssClass: 'badge-status--rejected' };
    default:
      return { label: status, cssClass: 'badge-status--raised' };
  }
}

/**
 * Toggle refund amount input in mediation form
 */
function toggleRefundInput(value) {
  const wrap = document.getElementById('resolve-refund-wrap');
  if (!wrap) return;
  if (value === 'Partial Refund' || value === 'Mutual Settlement') {
    wrap.style.display = 'block';
  } else {
    wrap.style.display = 'none';
  }
}

/**
 * Handle FPO/Admin updating status to Under Review or Mediation
 */
async function handleStatusUpdate(id, newStatus) {
  try {
    const res = await window.api.disputes.updateStatus(id, newStatus, `Advanced to ${newStatus} by mediator`);
    if (res && res.success) {
      showToastNotification(`Status updated to ${newStatus}`);
      await loadDisputes(id);
    } else {
      alert(res.message || 'Failed to update status');
    }
  } catch (err) {
    console.error('Status update error:', err);
    alert('Server error while updating status');
  }
}

/**
 * Handle FPO/Admin concluding dispute
 */
async function handleResolveDispute(event, id) {
  event.preventDefault();
  const resolutionType = document.getElementById('resolve-type-select').value;
  const refundAmount = document.getElementById('resolve-refund-amount')?.value || 0;
  const comment = document.getElementById('resolve-comment')?.value || '';

  if (!resolutionType) {
    alert('Please select a resolution type');
    return;
  }

  try {
    const payload = {
      resolutionType,
      refundAmount: Number(refundAmount) || 0,
      comment
    };

    const res = await window.api.disputes.resolve(id, payload);
    if (res && res.success) {
      showToastNotification('Dispute successfully concluded!');
      await loadDisputes(id);
    } else {
      alert(res.message || 'Failed to conclude dispute');
    }
  } catch (err) {
    console.error('Dispute resolution error:', err);
    alert('Server error while resolving dispute');
  }
}

/**
 * Modal: Open Raise Dispute
 */
function openRaiseDisputeModal(preselectedOrderId = '') {
  const modal = document.getElementById('raise-dispute-modal');
  const select = document.getElementById('modal-order-select');
  if (!modal) return;

  modal.classList.add('open');
  if (select && preselectedOrderId) {
    select.value = preselectedOrderId;
  }
}

/**
 * Modal: Close Raise Dispute
 */
function closeRaiseDisputeModal() {
  const modal = document.getElementById('raise-dispute-modal');
  if (modal) {
    modal.classList.remove('open');
  }
  state.evidenceFiles = [];
  renderEvidencePreview();
}

/**
 * Handle evidence file picker selection (client-side preview)
 */
function handleEvidenceFileSelect(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  Array.from(files).forEach(file => {
    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : '';

    state.evidenceFiles.push({
      name: file.name,
      fileUrl: '',
      previewUrl,
      note: ''
    });
  });

  renderEvidencePreview();
}

/**
 * Render client-side thumbnails in raise dispute modal
 */
function renderEvidencePreview() {
  const previewContainer = document.getElementById('modal-evidence-preview');
  if (!previewContainer) return;

  if (state.evidenceFiles.length === 0) {
    previewContainer.innerHTML = '';
    return;
  }

  previewContainer.innerHTML = state.evidenceFiles.map((item, idx) => `
    <div class="evidence-preview-box">
      ${item.previewUrl ? `
        <img src="${item.previewUrl}" alt="${item.name}">
      ` : `
        <div style="height: 80px; display: flex; align-items: center; justify-content: center; background: #ECEAE1; border-radius: 4px; margin-bottom: 6px;">
          <i data-lucide="file" style="width: 24px; height: 24px; color: var(--ks-sage, #5B9A72);"></i>
        </div>
      `}
      <span title="${item.name}">${item.name}</span>
      <button type="button" onclick="removeEvidenceItem(${idx})" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: #FFF; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Remove an item from the evidence file queue
 */
function removeEvidenceItem(index) {
  state.evidenceFiles.splice(index, 1);
  renderEvidencePreview();
}

/**
 * Handle submission of new dispute
 */
async function handleDisputeSubmit(event) {
  event.preventDefault();

  const orderId = document.getElementById('modal-order-select').value;
  const reason = document.getElementById('modal-dispute-reason').value;
  const description = document.getElementById('modal-dispute-description').value;
  const submitBtn = document.getElementById('submit-dispute-btn');

  if (!orderId) {
    alert('Please select an order');
    return;
  }
  if (!reason) {
    alert('Please choose a reason');
    return;
  }
  if (!description || !description.trim()) {
    alert('Please provide a description of the problem');
    return;
  }

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Submitting & Protecting Payment...';
    }

    const payload = {
      orderId,
      reason,
      description: description.trim(),
      evidence: state.evidenceFiles.map(e => ({
        name: e.name,
        previewUrl: e.previewUrl,
        fileUrl: e.fileUrl,
        note: e.note
      }))
    };

    const res = await window.api.disputes.create(payload);

    if (res && res.success && res.dispute) {
      showToastNotification('✓ Dispute submitted. Payment protection is active.');
      closeRaiseDisputeModal();
      document.getElementById('raise-dispute-form').reset();
      state.evidenceFiles = [];
      await loadDisputes(res.dispute.disputeId);
    } else {
      alert(res.message || 'Failed to create dispute');
    }
  } catch (err) {
    console.error('Error submitting dispute:', err);
    alert(err.message || 'Server error while creating dispute');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="shield-check" style="width: 15px; height: 15px;"></i> Submit Dispute & Protect Payment';
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

/**
 * Simple toast notification banner
 */
function showToastNotification(message) {
  const existing = document.getElementById('ks-toast-dispute');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'ks-toast-dispute';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--ks-evergreen, #12372A);
    color: #FFFFFF;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    font-size: 13.5px;
    font-weight: 600;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  toast.innerHTML = `<span>🛡️</span> <span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
