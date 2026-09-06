/**
 * KRISHISHETRA — BUYER INQUIRIES & NEGOTIATION CONTROLLER (Step 12C)
 * Connects directly to /api/inquiries and /api/orders
 * Multilingual support across English, Hindi, Marathi.
 */

const t = (key, fallback) => (window.i18next ? window.i18next.t(key, fallback) : (fallback || key));

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  if (window.Auth && !window.Auth.requireRole('buyer')) {
    return;
  }

  initFilterTabs();
  loadInquiries();

  window.addEventListener('languageChanged', () => {
    loadInquiries();
  });
});

function initFilterTabs() {
  const bar = document.getElementById('inquiries-filter-bar');
  if (!bar) return;

  bar.querySelectorAll('.inq-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.inq-filter-btn').forEach(b => {
        b.classList.remove('btn--primary');
        b.classList.add('btn--secondary');
      });
      btn.classList.add('btn--primary');
      btn.classList.remove('btn--secondary');
      currentFilter = btn.dataset.status;
      loadInquiries();
    });
  });
}

async function loadInquiries() {
  const list = document.getElementById('buyer-inquiries-list');
  if (!list) return;

  list.innerHTML = `<div style="padding: 40px; text-align: center; color: #888;">${t('common.loading', 'Loading inquiries...')}</div>`;

  const params = {};
  if (currentFilter !== 'all') params.status = currentFilter;

  try {
    const res = await window.api.inquiries.getMine(params);
    if (res.success && Array.isArray(res.inquiries) && res.inquiries.length > 0) {
      list.innerHTML = res.inquiries.map(inq => {
        const s = getStatusBadge(inq.status);
        const dateStr = inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
        return `
          <div class="dash-lot-card" style="background: #FFFFFF; border: 1px solid var(--border-light, #E5E4DD); border-radius: 12px; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="font-family: monospace; font-size: 12px; color: #888; font-weight: 600;">Lot: ${inq.lotId}</span>
                <span style="padding: 3px 8px; border-radius: 6px; background: ${s.bg}; color: ${s.color}; font-size: 11px; font-weight: 700; text-transform: uppercase;">${s.text}</span>
                <span style="font-size: 12px; color: #888;">• ${dateStr}</span>
              </div>
              <h3 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">${inq.crop} <span style="font-size: 13px; font-weight: 400; color: #666;">(${inq.variety || 'Standard'})</span></h3>
              <div style="font-size: 13px; color: #555;">
                ${t('offers.offeredRate', 'Offered:')} <strong>₹${inq.offeredPrice?.toLocaleString('en-IN')}/q</strong> ${t('common.for', 'for')} <strong>${inq.quantityRequired} ${t('common.quintals', 'quintals')}</strong> • ${t('orders.farmer', 'Farmer:')} <strong>${inq.farmerName || t('common.verified', 'Verified Farm')}</strong>
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <button class="btn btn--secondary btn--sm" onclick="openNegotiationModal('${inq.inquiryId}')">
                ${t('buyer.negotiationTimeline', 'Timeline & Offers')} (${inq.totalOffers || 0})
              </button>
              ${inq.status === 'accepted' ? `
                <button class="btn btn--primary btn--sm" style="background: #E8B96A; color: #12372A; font-weight: 700;" onclick="openCreateOrderModal('${inq.inquiryId}')">
                  ${t('buyer.confirmDeal', 'Confirm Deal / Create Order →')}
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
          <h4 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">${t('buyer.noInquiries', 'No inquiries found')}</h4>
          <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">${currentFilter === 'all' ? t('buyer.noInquiriesDesc', 'You have not submitted any purchase inquiries yet.') : `${t('common.noData', 'No inquiries with status')} '${currentFilter}'.`}</p>
          <a href="market.html" class="btn btn--primary btn--sm" style="text-decoration: none;">${t('navigation.marketplace', 'Browse Marketplace')}</a>
        </div>
      `;
    }
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    list.innerHTML = `<div style="padding: 30px; text-align: center; color: #dc2626;">${t('errors.serverError', 'Failed to load inquiries.')}</div>`;
  }
}

async function openNegotiationModal(inquiryId) {
  let overlay = document.getElementById('inq-negotiation-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'inq-negotiation-overlay';
    overlay.className = 'dash-modal-overlay active';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="dash-modal" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
      <div class="dash-modal__header">
        <div>
          <h3 style="margin: 0;">${t('buyer.negotiationTimeline', 'Inquiry Negotiation Timeline')}</h3>
          <span style="font-size: 12px; color: var(--ks-text-muted);" id="modal-sub">${t('common.loading', 'Loading history...')}</span>
        </div>
        <button class="dash-modal__close" onclick="document.getElementById('inq-negotiation-overlay').classList.remove('active')"><i data-lucide="x"></i></button>
      </div>
      <div class="dash-modal__body-pad" id="modal-timeline-body">
        <div style="padding: 30px; text-align: center;">${t('common.loading', 'Loading...')}</div>
      </div>
    </div>
  `;
  overlay.classList.add('active');

  try {
    const res = await window.api.inquiries.getById(inquiryId);
    if (res.success && res.inquiry) {
      const inq = res.inquiry;
      const s = getStatusBadge(inq.status);
      document.getElementById('modal-sub').textContent = `Lot: ${inq.lot?.lotId || ''} • ${t('common.status', 'Status')}: ${inq.status.toUpperCase()}`;

      document.getElementById('modal-timeline-body').innerHTML = `
        <div style="background: #F5F4ED; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: var(--ks-evergreen); font-size: 15px;">${inq.lot?.cropName || 'Produce Lot'} (${inq.lot?.variety || 'Standard'})</strong>
            <span style="padding: 2px 8px; border-radius: 4px; background: ${s.bg}; color: ${s.color}; font-size: 11px; font-weight: 700; text-transform: uppercase;">${s.text}</span>
          </div>
          <div style="font-size: 13px; color: #555;">
            ${t('orders.farmer', 'Farmer:')} <strong>${inq.farmer?.farmName || inq.farmer?.farmerName || t('common.verified', 'Verified Farm')}</strong> • ${t('cropLot.askingPrice', 'Asking Price:')} <strong>₹${inq.lot?.askingPrice?.toLocaleString('en-IN')}/q</strong>
          </div>
        </div>

        <h4 style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 12px 0;">${t('offers.offerHistory', 'Offer History')}</h4>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
          <div style="background: #FAF9F5; border-left: 3px solid var(--ks-evergreen); padding: 10px 14px; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
              <strong style="color: var(--ks-evergreen);">${t('buyer.initialInquiry', 'YOU (Initial Inquiry)')}</strong>
              <span style="color: #888;">${new Date(inq.createdAt).toLocaleString('en-IN')}</span>
            </div>
            <div style="font-size: 13px;">${t('offers.offeredRate', 'Offered')} <strong>₹${inq.offeredPrice?.toLocaleString('en-IN')}/q</strong> for ${inq.quantityRequired} quintals</div>
            ${inq.message ? `<div style="font-size: 12px; color: #666; font-style: italic; margin-top: 2px;">"${inq.message}"</div>` : ''}
          </div>

          ${(inq.offers || []).map(offer => {
            const isBuyer = offer.senderRole === 'buyer' || String(offer.sender).includes('Buyer');
            const color = isBuyer ? 'var(--ks-evergreen)' : '#d97706';
            const senderLabel = isBuyer ? t('buyer.counterOffer', 'YOU (Counter Offer)') : t('farmer.counterOffer', 'FARMER (Counter Offer)');
            return `
              <div style="background: ${isBuyer ? '#FAF9F5' : '#FFFBEB'}; border-left: 3px solid ${color}; padding: 10px 14px; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
                  <strong style="color: ${color};">${senderLabel}</strong>
                  <span style="color: #888;">${new Date(offer.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div style="font-size: 13px;">${t('buyer.countered', 'Countered')} <strong>₹${offer.offeredPrice?.toLocaleString('en-IN')}/q</strong> for ${offer.quantityRequired} quintals</div>
                ${offer.message ? `<div style="font-size: 12px; color: #666; font-style: italic; margin-top: 2px;">"${offer.message}"</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>

        ${inq.status === 'accepted' ? `
          <div style="background: #E5F0E7; border-radius: 10px; padding: 16px; text-align: center;">
            <div style="font-size: 14px; font-weight: 700; color: #12372A; margin-bottom: 6px;">🎉 ${t('buyer.quotationAccepted', 'Farmer Accepted Your Quotation!')}</div>
            <button class="btn btn--primary" style="background: #12372A; color: #FFFFFF; font-weight: 700; width: 100%;" onclick="document.getElementById('inq-negotiation-overlay').classList.remove('active'); openCreateOrderModal('${inq.inquiryId}')">
              ${t('buyer.confirmDeal', 'Confirm Deal & Create Order →')}
            </button>
          </div>
        ` : inq.status === 'pending' || inq.status === 'negotiating' ? `
          <div style="border-top: 1px solid #EEE; padding-top: 16px;">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 10px 0;">${t('buyer.sendCounterOffer', 'Send Counter Offer')}</h4>
            <form id="standalone-counter-form">
              <div class="dash-form-row" style="display: flex; gap: 10px; margin-bottom: 10px;">
                <div class="dash-modal__field" style="flex: 1;">
                  <label for="sc-price" style="font-size: 12px;">${t('buyer.counterPrice', 'Counter Price (₹/q)')}</label>
                  <input type="number" id="sc-price" class="dash-form-input" value="${inq.offeredPrice}" min="1" required>
                </div>
                <div class="dash-modal__field" style="flex: 1;">
                  <label for="sc-qty" style="font-size: 12px;">${t('common.quantity', 'Quantity (q)')}</label>
                  <input type="number" id="sc-qty" class="dash-form-input" value="${inq.quantityRequired}" min="0.1" required>
                </div>
              </div>
              <div class="dash-modal__field" style="margin-bottom: 12px;">
                <input type="text" id="sc-msg" class="dash-form-input" placeholder="${t('buyer.optionalMessage', 'Optional message with counter offer')}">
              </div>
              <button type="submit" class="btn btn--primary btn--sm" id="btn-submit-sc" style="width: 100%;">
                ${t('buyer.submitCounter', 'Submit Counter Offer')}
              </button>
            </form>
          </div>
        ` : ''}
      `;

      if (window.lucide) lucide.createIcons();

      const scForm = document.getElementById('standalone-counter-form');
      if (scForm) {
        scForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const btn = document.getElementById('btn-submit-sc');
          btn.disabled = true;
          try {
            const sendRes = await window.api.inquiries.sendOffer(inquiryId, {
              offeredPrice: parseFloat(document.getElementById('sc-price').value),
              quantityRequired: parseFloat(document.getElementById('sc-qty').value),
              message: document.getElementById('sc-msg').value.trim()
            });
            if (sendRes.success) {
              openNegotiationModal(inquiryId);
              loadInquiries();
            } else {
              alert(sendRes.message || t('errors.generic', 'Failed to submit offer.'));
            }
          } catch (err) {
            alert(t('errors.serverError', 'Server error.'));
          } finally {
            btn.disabled = false;
          }
        });
      }
    }
  } catch (err) {
    document.getElementById('modal-timeline-body').innerHTML = `<div style="padding: 20px; text-align: center; color: #dc2626;">${t('errors.serverError', 'Failed to load timeline.')}</div>`;
  }
}

async function openCreateOrderModal(inquiryId) {
  let overlay = document.getElementById('inq-order-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'inq-order-overlay';
    overlay.className = 'dash-modal-overlay active';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="dash-modal" style="max-width: 540px; max-height: 90vh; overflow-y: auto;">
      <div class="dash-modal__header">
        <div>
          <h3 style="margin: 0;">${t('buyer.confirmDeal', 'Confirm Deal & Place Order')}</h3>
          <span style="font-size: 12px; color: var(--ks-text-muted);">${t('buyer.contractSub', 'Convert accepted inquiry to official procurement contract')}</span>
        </div>
        <button class="dash-modal__close" onclick="document.getElementById('inq-order-overlay').classList.remove('active')"><i data-lucide="x"></i></button>
      </div>
      <form class="dash-modal__form" id="inq-order-form" style="padding: 20px 24px;">
        <div id="order-msg-alert" style="display: none; padding: 10px; border-radius: 6px; margin-bottom: 14px; font-size: 13px;"></div>
        <div id="deal-summary-box" style="background: #F5F4ED; border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 13px;">${t('common.loading', 'Loading terms...')}</div>

        <h4 style="font-size: 13.5px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 10px 0;">${t('orders.deliveryLocation', 'Delivery Address')}</h4>
        <div class="dash-form-row">
          <div class="dash-modal__field" style="flex: 1;">
            <label for="iord-name">${t('auth.fullName', 'Recipient Name')}</label>
            <input type="text" id="iord-name" class="dash-form-input" value="${window.Auth?.getUser()?.name || ''}" required>
          </div>
          <div class="dash-modal__field" style="flex: 1;">
            <label for="iord-phone">${t('auth.mobileNumber', 'Mobile Number (10 digits)')}</label>
            <input type="tel" id="iord-phone" class="dash-form-input" value="${window.Auth?.getUser()?.phone || '9876543210'}" maxlength="10" pattern="[6-9][0-9]{9}" required>
          </div>
        </div>

        <div class="dash-modal__field">
          <label for="iord-address">${t('orders.deliveryLocation', 'Delivery Address / Warehouse')}</label>
          <input type="text" id="iord-address" class="dash-form-input" placeholder="e.g. Warehouse 4B, APMC Market Yard" required>
        </div>

        <div class="dash-form-row">
          <div class="dash-modal__field">
            <label for="iord-city">${t('common.city', 'City / Village')}</label>
            <input type="text" id="iord-city" class="dash-form-input" value="Pune" required>
          </div>
          <div class="dash-modal__field">
            <label for="iord-state">${t('common.state', 'State')}</label>
            <input type="text" id="iord-state" class="dash-form-input" value="Maharashtra" required>
          </div>
          <div class="dash-modal__field">
            <label for="iord-pin">${t('common.pincode', 'Pincode (6 digits)')}</label>
            <input type="text" id="iord-pin" class="dash-form-input" value="411001" maxlength="6" pattern="[1-9][0-9]{5}" required>
          </div>
        </div>

        <div class="dash-modal__field" style="margin-top: 10px;">
          <label for="iord-payment">${t('payments.paymentMethod', 'Payment Method')}</label>
          <select id="iord-payment" class="dash-filter-select">
            <option value="cod">${t('payments.escrowGuarantee', 'Escrow Bank Guarantee / COD')}</option>
            <option value="online">${t('payments.instantUpi', 'Instant UPI / NetBanking')}</option>
            <option value="offline">${t('payments.bankTransfer', 'Bank Transfer (NEFT/RTGS)')}</option>
          </select>
        </div>

        <button type="submit" class="btn btn--primary dash-modal__submit" id="btn-submit-iord" style="width: 100%; margin-top: 18px; background: #12372A; color: #FFFFFF; font-weight: 700;">
          ${t('orders.confirmOrder', 'Place Confirmed Order')}
        </button>
      </form>
    </div>
  `;

  overlay.classList.add('active');
  if (window.lucide) lucide.createIcons();

  try {
    const res = await window.api.inquiries.getById(inquiryId);
    if (res.success && res.inquiry) {
      const inq = res.inquiry;
      const total = (inq.offeredPrice || 0) * (inq.quantityRequired || 0);
      document.getElementById('deal-summary-box').innerHTML = `
        <div>${t('market.commodity', 'Crop:')} <strong>${inq.lot?.cropName || 'Produce Lot'} (${inq.lot?.variety || 'Standard'})</strong></div>
        <div>${t('orders.agreedRate', 'Agreed Price:')} <strong>₹${inq.offeredPrice?.toLocaleString('en-IN')}/q</strong> for <strong>${inq.quantityRequired} q</strong></div>
        <div style="border-top: 1px dashed #CCC; padding-top: 4px; margin-top: 4px; color: var(--ks-evergreen);">
          <strong>${t('orders.totalOrderValue', 'Total Order Value:')} ₹${total.toLocaleString('en-IN')}</strong>
        </div>
      `;

      document.getElementById('inq-order-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-submit-iord');
        const alertBox = document.getElementById('order-msg-alert');
        alertBox.style.display = 'none';
        btn.disabled = true;
        btn.textContent = t('common.loading', 'Placing order...');

        const payload = {
          inquiryId: inq.inquiryId,
          quantity: inq.quantityRequired,
          deliveryAddress: {
            name: document.getElementById('iord-name').value.trim(),
            phone: document.getElementById('iord-phone').value.trim(),
            addressLine1: document.getElementById('iord-address').value.trim(),
            village: document.getElementById('iord-city').value.trim(),
            state: document.getElementById('iord-state').value.trim(),
            pincode: document.getElementById('iord-pin').value.trim()
          },
          paymentMethod: document.getElementById('iord-payment').value,
          notes: 'Standard procurement order'
        };

        try {
          const ordRes = await window.api.orders.create(payload);
          if (ordRes.success && ordRes.order) {
            overlay.classList.remove('active');
            alert(`🎉 ${t('orders.orderPlacedSuccess', 'Order Created Successfully!')}\n${t('orders.orderId', 'Order ID')}: ${ordRes.order.orderId}\n${t('orders.totalOrderValue', 'Total')}: ₹${ordRes.order.totalAmount?.toLocaleString('en-IN')}`);
            window.location.href = 'orders.html';
          } else {
            alertBox.style.display = 'block';
            alertBox.style.background = '#FEE2E2';
            alertBox.style.color = '#dc2626';
            alertBox.textContent = ordRes.message || t('errors.generic', 'Failed to place order.');
          }
        } catch (err) {
          alertBox.style.display = 'block';
          alertBox.style.background = '#FEE2E2';
          alertBox.style.color = '#dc2626';
          alertBox.textContent = t('errors.networkError', 'Network error.');
        } finally {
          btn.disabled = false;
          btn.textContent = t('orders.confirmOrder', 'Place Confirmed Order');
        }
      });
    }
  } catch (err) {
    document.getElementById('deal-summary-box').textContent = t('errors.generic', 'Error fetching terms.');
  }
}

function getStatusBadge(status) {
  const map = {
    pending: { bg: '#FEF3C7', color: '#92400E', text: t('common.pending', 'Pending') },
    negotiating: { bg: '#E0E7FF', color: '#3730A3', text: t('common.negotiating', 'Negotiating') },
    accepted: { bg: '#E5F0E7', color: '#12372A', text: t('common.accepted', 'Accepted') },
    rejected: { bg: '#FEE2E2', color: '#991B1B', text: t('common.rejected', 'Rejected') },
    completed: { bg: '#DBEAFE', color: '#1E40AF', text: t('common.completed', 'Completed') }
  };
  return map[status] || map.pending;
}

window.openNegotiationModal = openNegotiationModal;
window.openCreateOrderModal = openCreateOrderModal;
