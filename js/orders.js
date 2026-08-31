/**
 * KRISHISHETRA — ORDERS & FULFILLMENT CONTROLLER (Step 13)
 * Full order lifecycle management with visual progress steppers,
 * role-specific operations, cancellation, and status updates.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.Auth && !window.Auth.requireAuth()) {
    return;
  }

  loadOrders();
});

async function loadOrders() {
  const grid = document.getElementById('orders-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div style="padding: 48px; text-align: center; color: var(--ks-text-muted); grid-column: 1 / -1;">
      <div class="spinner" style="margin: 0 auto 12px auto; width: 28px; height: 28px; border: 3px solid #E5E4DD; border-top-color: var(--ks-evergreen); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      Loading orders from database...
    </div>
  `;

  const role = window.Auth ? window.Auth.getRole() : 'farmer';

  try {
    let res;
    if (role === 'farmer') {
      res = await window.api.orders.getFarmer();
    } else {
      res = await window.api.orders.getMine();
    }

    if (res.success && Array.isArray(res.orders) && res.orders.length > 0) {
      grid.innerHTML = res.orders.map(ord => {
        const s = getOrderStatusBadge(ord.status);
        const dateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
        const counterparty = role === 'farmer' ? `Buyer: <strong>${ord.buyerName || 'Verified Buyer'}</strong>` : `Farmer: <strong>${ord.farmerName || 'Verified Farm'}</strong>`;

        const steps = ['pending', 'confirmed', 'processing', 'ready_for_pickup', 'in_transit', 'delivered'];
        const stepLabels = ['Pending', 'Confirmed', 'Processing', 'Pickup Ready', 'In Transit', 'Delivered'];
        const currentStepIndex = steps.indexOf(ord.status);

        return `
          <div class="dash-card" style="background: #FFFFFF; border: 1px solid var(--border-light, #E5E4DD); border-radius: 14px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 14px rgba(0,0,0,0.03); margin-bottom: 20px;">
            <div>
              <!-- Header Info -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                <div>
                  <span style="font-family: monospace; font-size: 13.5px; font-weight: 800; color: var(--ks-evergreen);">${ord.orderId}</span>
                  <span style="font-size: 12px; color: #888; margin-left: 8px;">• ${dateStr}</span>
                </div>
                <span style="padding: 3px 10px; border-radius: 6px; background: ${s.bg}; color: ${s.color}; font-size: 11.5px; font-weight: 700; text-transform: uppercase;">${s.text}</span>
              </div>

              <h3 style="font-size: 18px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">${ord.cropName} <span style="font-size: 13.5px; font-weight: 400; color: #666;">(${ord.variety || 'Standard Variety'})</span></h3>
              <div style="font-size: 13px; color: #666; margin-bottom: 16px;">${counterparty}</div>

              <!-- Visual Progress Stepper -->
              ${ord.status !== 'cancelled' ? `
                <div style="margin: 18px 0 20px 0;">
                  <div style="display: flex; justify-content: space-between; position: relative; margin-bottom: 8px;">
                    <div style="position: absolute; top: 11px; left: 16px; right: 16px; height: 2px; background: #E5E4DD; z-index: 1;"></div>
                    ${steps.map((st, idx) => {
                      const isDone = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      return `
                        <div style="position: relative; z-index: 2; text-align: center; flex: 1;">
                          <div style="width: 24px; height: 24px; border-radius: 50%; margin: 0 auto 4px auto; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; background: ${isDone ? 'var(--ks-evergreen)' : '#FFFFFF'}; color: ${isDone ? '#FFFFFF' : '#999'}; border: 2px solid ${isDone ? 'var(--ks-evergreen)' : '#DDD'};">
                            ${isDone && !isCurrent ? '✓' : idx + 1}
                          </div>
                          <div style="font-size: 10.5px; font-weight: ${isCurrent ? '700' : '500'}; color: ${isCurrent ? 'var(--ks-evergreen)' : isDone ? '#444' : '#999'};">
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
              <div style="display: flex; gap: 10px; justify-content: flex-end; align-items: center; border-top: 1px solid #EEE; padding-top: 14px;">
                ${role === 'farmer' && ord.status !== 'delivered' && ord.status !== 'cancelled' ? `
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
    grid.innerHTML = `<div style="padding: 30px; text-align: center; color: #dc2626; grid-column: 1 / -1;">Unable to load orders. Please refresh.</div>`;
  }
}

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

  const selected = prompt(`Select next status for order ${orderId}:\nAllowed options: ${allowed.join(', ')}`, allowed[0]);
  if (!selected || !allowed.includes(selected.toLowerCase())) return;

  window.api.orders.updateStatus(orderId, selected.toLowerCase()).then(res => {
    if (res.success) {
      alert(`Order ${orderId} status updated to ${selected.toUpperCase()} ✓`);
      loadOrders();
    } else {
      alert(res.message || 'Failed to update order status.');
    }
  }).catch(() => alert('Network error.'));
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
