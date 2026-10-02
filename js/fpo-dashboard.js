/**
 * KrishiShetra — FPO Dashboard Interactive Logic
 * Light Premium Universal AgriTech Design System Implementation
 */

// Global Chart Instances
let marketChartInstance = null;
let monthlyVolumeChartInstance = null;
let cropShareChartInstance = null;

// Language helper (standard English)
function changeLanguage(lang) {
  // Multilingual disabled - standard English interface
}

// Search and Filter Farmer Table
function filterFarmerTable() {
  const query = document.getElementById('farmerSearchInput').value.toLowerCase();
  const rows = document.querySelectorAll('#farmerTable tbody tr');

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    if (text.includes(query)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

function setFarmerFilter(crop, btnElement) {
  document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');

  const rows = document.querySelectorAll('#farmerTable tbody tr');
  rows.forEach(row => {
    if (crop === 'all') {
      row.style.display = '';
    } else {
      const rowCrop = row.getAttribute('data-crop');
      if (rowCrop === crop) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    }
  });
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const nav = document.getElementById('navMenu');
  nav.classList.toggle('open');
}

// Modal Handlers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

function openAddFarmerModal() {
  openModal('addFarmerModal');
}

function openAIForecastModal() {
  openModal('aiForecastModal');
}

function handleAddFarmer(e) {
  e.preventDefault();
  const name = document.getElementById('farmerNameInput').value;
  const village = document.getElementById('farmerVillageInput').value;
  const crop = document.getElementById('farmerCropInput').value;
  const qty = document.getElementById('farmerQtyInput').value;
  const grade = document.getElementById('farmerGradeInput').value;
  const lot = document.getElementById('farmerLotSelect').value;

  // Add new row to table
  const tbody = document.querySelector('#farmerTable tbody');
  const tr = document.createElement('tr');
  tr.setAttribute('data-crop', crop);

  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'FM';

  tr.innerHTML = `
    <td>
      <div class="farmer-name-cell">
        <div class="farmer-avatar-mini">${initials}</div>
        <div class="farmer-details">
          <span class="farmer-title">${name}</span>
          <span class="farmer-location">${village}</span>
        </div>
      </div>
    </td>
    <td><span class="crop-tag">${crop === 'Wheat' ? '🌾' : crop === 'Onion' ? '🧅' : crop === 'Tomato' ? '🍅' : '🌾'} ${crop}</span></td>
    <td><strong>${qty}</strong></td>
    <td><span class="badge badge-info">${lot}</span></td>
    <td><span class="grade-badge grade-a">${grade}</span></td>
    <td><span class="badge badge-success">✓ Verified & Logged</span></td>
    <td style="text-align:right;">
      <button class="btn btn-secondary btn-sm" onclick="showFarmerDetails('${name}', '${crop}', '${qty}', '${grade}', 'Calculating...')">Details</button>
    </td>
  `;

  tbody.insertBefore(tr, tbody.firstChild);

  closeModal('addFarmerModal');
  document.getElementById('addFarmerForm').reset();
  showToast(`Farmer ${name} successfully registered to ${lot}!`);
  lucide.createIcons();
}

function showFarmerDetails(name, crop, qty, grade, val) {
  const content = `
    <div style="background:#F5F4ED;border:1px solid #E7E6DC;padding:1.25rem;border-radius:var(--radius-md);margin-bottom:1.25rem;">
      <h4 style="font-size:1.2rem;color:#12372A;margin-bottom:0.25rem;">${name}</h4>
      <p style="font-size:0.85rem;color:#6F7F75;">FPO Registered Member • Nashik Zone</p>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem;padding-top:1rem;border-top:1px solid #E4E3D8;">
        <div>
          <span style="font-size:0.72rem;color:#6F7F75;text-transform:uppercase;font-weight:600;">Crop & Grade</span>
          <div style="font-weight:700;color:#17221D;">${crop} (${grade})</div>
        </div>
        <div>
          <span style="font-size:0.72rem;color:#6F7F75;text-transform:uppercase;font-weight:600;">Contributed Quantity</span>
          <div style="font-weight:700;color:#17221D;">${qty}</div>
        </div>
        <div>
          <span style="font-size:0.72rem;color:#6F7F75;text-transform:uppercase;font-weight:600;">Expected Value</span>
          <div style="font-weight:700;color:#12372A;">${val}</div>
        </div>
        <div>
          <span style="font-size:0.72rem;color:#6F7F75;text-transform:uppercase;font-weight:600;">Payment Status</span>
          <div style="font-weight:700;color:#2E7246;">Escrow Linked ✓</div>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:0.75rem;">
      <button class="btn btn-secondary" style="flex:1;" onclick="closeModal('lotDetailModal')">Close</button>
      <button class="btn btn-primary" style="flex:1;" onclick="showToast('Receipt sent to farmer WhatsApp!'); closeModal('lotDetailModal');">Send WhatsApp Slip</button>
    </div>
  `;
  document.getElementById('lotModalTitle').innerText = "👨‍🌾 Member Profile & Produce";
  document.getElementById('lotModalContent').innerHTML = content;
  openModal('lotDetailModal');
}

function openLotDetailModal(crop, volume, farmersCount, price, lotId) {
  const content = `
    <div style="background:#F5F4ED;border:1px solid #E7E6DC;padding:1.25rem;border-radius:var(--radius-md);margin-bottom:1.25rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
        <h4 style="font-size:1.2rem;color:#12372A;">${lotId} — ${crop}</h4>
        <span class="badge badge-success">Ready for Sale</span>
      </div>
      
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin-top:1rem;background:#FFFFFF;border:1px solid #E4E3D8;padding:0.85rem;border-radius:var(--radius-sm);">
        <div>
          <span style="font-size:0.7rem;color:#6F7F75;text-transform:uppercase;font-weight:600;">Volume</span>
          <div style="font-size:1.1rem;font-weight:700;color:#17221D;">${volume}</div>
        </div>
        <div>
          <span style="font-size:0.7rem;color:#6F7F75;text-transform:uppercase;font-weight:600;">Pooled Farmers</span>
          <div style="font-size:1.1rem;font-weight:700;color:#17221D;">${farmersCount}</div>
        </div>
        <div>
          <span style="font-size:0.7rem;color:#6F7F75;text-transform:uppercase;font-weight:600;">Base Rate</span>
          <div style="font-size:1.1rem;font-weight:700;color:#12372A;">${price}</div>
        </div>
      </div>

      <div style="margin-top:1rem;font-size:0.85rem;color:#17221D;line-height:1.6;">
        <p><strong>Storage Facility:</strong> Nashik Central Aggregation Hub (Bay #2)</p>
        <p><strong>Quality Parameters:</strong> Moisture 11.2%, Foreign Matter &lt; 0.5%, Grade A Certified.</p>
        <p><strong>Available Bids:</strong> 3 Institutional Buyers active for this lot.</p>
      </div>
    </div>

    <div style="display:flex;gap:0.75rem;">
      <button class="btn btn-secondary" style="flex:1;" onclick="closeModal('lotDetailModal')">Close</button>
      <button class="btn btn-primary" style="flex:1;" onclick="closeModal('lotDetailModal'); openFindBuyersModal('${crop}', '${volume}', '${price}');">
        Find Matching Buyers
      </button>
    </div>
  `;
  document.getElementById('lotModalTitle').innerText = `📦 ${lotId} Aggregated Lot Details`;
  document.getElementById('lotModalContent').innerHTML = content;
  openModal('lotDetailModal');
}

function openFindBuyersModal(crop, volume, price) {
  const content = `
    <div style="margin-bottom:1.25rem;">
      <div style="background:#E8F5EC;border:1px solid #8FCB9B;padding:1rem;border-radius:var(--radius-md);margin-bottom:1rem;">
        <div style="font-weight:700;color:#2E7246;font-size:0.95rem;">
          ✨ 4 Verified Institutional Buyers matched for ${crop} (${volume})
        </div>
        <div style="font-size:0.82rem;color:#17221D;margin-top:0.25rem;">
          Base Lot Target: ${price} • All buyers have KYC & Escrow ready.
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;background:#F5F4ED;border:1px solid #E7E6DC;padding:0.85rem;border-radius:var(--radius-sm);">
          <div>
            <strong>ABC Foods Pvt Ltd</strong> (Pune)
            <div style="font-size:0.75rem;color:#8C6517;font-weight:600;">Offer: ₹2,800/q (+₹120/q premium)</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="showToast('Contract initiated with ABC Foods!'); closeModal('lotDetailModal');">Accept ₹2,800</button>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;background:#F5F4ED;border:1px solid #E7E6DC;padding:0.85rem;border-radius:var(--radius-sm);">
          <div>
            <strong>Pristine Agri Milling Co</strong> (Mumbai)
            <div style="font-size:0.75rem;color:#8C6517;font-weight:600;">Offer: ₹2,820/q (+₹140/q premium)</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="showToast('Contract initiated with Pristine Agri!'); closeModal('lotDetailModal');">Accept ₹2,820</button>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:0.75rem;">
      <button class="btn btn-secondary" style="flex:1;" onclick="closeModal('lotDetailModal')">Close</button>
    </div>
  `;
  document.getElementById('lotModalTitle').innerText = `🤝 Buyer Matching: ${crop}`;
  document.getElementById('lotModalContent').innerHTML = content;
  openModal('lotDetailModal');
}

function openCreateLotModal() {
  const content = `
    <form onsubmit="handleCreateLot(event)">
      <div class="form-group">
        <label class="form-label">Select Crop Category *</label>
        <select class="form-select" id="newLotCrop" required>
          <option value="Wheat">🌾 Wheat (Sharbati)</option>
          <option value="Onion">🧅 Red Garwa Onion</option>
          <option value="Tomato">🍅 Red Hybrid Tomato</option>
          <option value="Rice">🌾 Basmati 1121 Rice</option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Total Volume (Tons) *</label>
          <input type="number" class="form-input" placeholder="e.g. 20" required>
        </div>
        <div class="form-group">
          <label class="form-label">Participating Farmers *</label>
          <input type="number" class="form-input" placeholder="e.g. 10" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Base Target Price (₹/q) *</label>
          <input type="number" class="form-input" placeholder="e.g. 2800" required>
        </div>
        <div class="form-group">
          <label class="form-label">Warehouse Bay</label>
          <input type="text" class="form-input" placeholder="e.g. Nashik Bay 3">
        </div>
      </div>

      <div style="display:flex;gap:0.75rem;margin-top:1.5rem;">
        <button type="button" class="btn btn-secondary" style="flex:1;" onclick="closeModal('lotDetailModal')">Cancel</button>
        <button type="submit" class="btn btn-primary" style="flex:1;">Create & Publish Lot</button>
      </div>
    </form>
  `;
  document.getElementById('lotModalTitle').innerText = `✨ Create New Aggregated Lot`;
  document.getElementById('lotModalContent').innerHTML = content;
  openModal('lotDetailModal');
}

function handleCreateLot(e) {
  e.preventDefault();
  closeModal('lotDetailModal');
  showToast("New Aggregated Lot successfully published to buyers network!");
}

function openOfferModal(buyer, crop, qty, price, location) {
  const content = `
    <div style="background:#F5F4ED;border:1px solid #E7E6DC;padding:1.25rem;border-radius:var(--radius-md);margin-bottom:1.25rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h4 style="font-size:1.2rem;color:#12372A;">${buyer} ✓</h4>
        <span class="badge badge-success">Verified Buyer</span>
      </div>
      <p style="font-size:0.82rem;color:#6F7F75;margin-top:0.2rem;">Location: ${location} • Verified GST & FSSAI</p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-top:1rem;background:#FFFFFF;border:1px solid #E4E3D8;padding:1rem;border-radius:var(--radius-sm);">
        <div>
          <span style="font-size:0.72rem;color:#6F7F75;text-transform:uppercase;font-weight:600;">Required Crop</span>
          <div style="font-weight:700;color:#17221D;">${crop} — ${qty}</div>
        </div>
        <div>
          <span style="font-size:0.72rem;color:#6F7F75;text-transform:uppercase;font-weight:600;">Offered Price</span>
          <div style="font-size:1.2rem;font-weight:800;color:#12372A;">${price}</div>
        </div>
        <div>
          <span style="font-size:0.72rem;color:#6F7F75;text-transform:uppercase;font-weight:600;">Total Contract Value</span>
          <div style="font-weight:700;color:#2E7246;">₹5,60,000</div>
        </div>
        <div>
          <span style="font-size:0.72rem;color:#6F7F75;text-transform:uppercase;font-weight:600;">Payment Guarantee</span>
          <div style="font-weight:700;color:#17221D;">100% Escrow Backed</div>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:0.75rem;">
      <button class="btn btn-secondary" style="flex:1;" onclick="closeModal('lotDetailModal')">Close</button>
      <button class="btn btn-primary" style="flex:1;" onclick="openAcceptModal('${buyer}', '${crop}', '${qty}', '${price}');">Proceed to Accept</button>
    </div>
  `;
  document.getElementById('lotModalTitle').innerText = `📋 Buyer Offer Details`;
  document.getElementById('lotModalContent').innerHTML = content;
  openModal('lotDetailModal');
}

function openAcceptModal(buyer, crop, qty, price) {
  const content = `
    <div style="margin-bottom:1.25rem;">
      <div style="background:#E8F5EC;border:1px solid #8FCB9B;padding:1.25rem;border-radius:var(--radius-md);margin-bottom:1rem;">
        <h4 style="color:#2E7246;margin-bottom:0.35rem;">Confirm Sales Agreement</h4>
        <p style="font-size:0.85rem;color:#17221D;line-height:1.5;">
          You are locking <strong>${qty} of ${crop}</strong> with <strong>${buyer}</strong> at <strong>${price}</strong>.
        </p>
      </div>

      <div style="font-size:0.82rem;color:#6F7F75;display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem;">
        <div>✓ Automatic e-Way bill and gate pass will be generated.</div>
        <div>✓ Transporter fleet will be alerted for immediate scheduling.</div>
        <div>✓ Buyer escrow deposit will be reserved upon confirmation.</div>
      </div>
    </div>

    <div style="display:flex;gap:0.75rem;">
      <button class="btn btn-secondary" style="flex:1;" onclick="closeModal('lotDetailModal')">Cancel</button>
      <button class="btn btn-primary" style="flex:1;" onclick="closeModal('lotDetailModal'); showToast('🎉 Order confirmed! Dispatched to Logistics fulfillment.');">
        Confirm & Sign Agreement
      </button>
    </div>
  `;
  document.getElementById('lotModalTitle').innerText = `✍️ Lock Contract`;
  document.getElementById('lotModalContent').innerHTML = content;
  openModal('lotDetailModal');
}

function openCompareOffersModal() {
  const content = `
    <div style="overflow-x:auto;">
      <table class="custom-table" style="font-size:0.82rem;">
        <thead>
          <tr>
            <th>Buyer Name</th>
            <th>Crop & Qty</th>
            <th>Offer Price</th>
            <th>Pickup / Terms</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>ABC Foods</strong> ✓</td>
            <td>Wheat (20 T)</td>
            <td style="color:#12372A;font-weight:700;">₹2,800/q</td>
            <td>Ex-Nashik Hub</td>
            <td><button class="btn btn-primary btn-sm" onclick="closeModal('lotDetailModal'); showToast('Selected ABC Foods offer');">Accept</button></td>
          </tr>
          <tr>
            <td><strong>FreshAgro Ltd</strong> ✓</td>
            <td>Onion (15 T)</td>
            <td style="color:#12372A;font-weight:700;">₹2,900/q</td>
            <td>Doorstep Pickup</td>
            <td><button class="btn btn-primary btn-sm" onclick="closeModal('lotDetailModal'); showToast('Selected FreshAgro offer');">Accept</button></td>
          </tr>
          <tr>
            <td><strong>MahaAgri Exports</strong> ✓</td>
            <td>Onion (25 T)</td>
            <td style="color:#12372A;font-weight:700;">₹2,950/q</td>
            <td>JNPT Port</td>
            <td><button class="btn btn-gold btn-sm" onclick="closeModal('lotDetailModal'); showToast('Selected MahaAgri Exports offer');">Accept</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="margin-top:1.25rem;">
      <button class="btn btn-secondary" style="width:100%;" onclick="closeModal('lotDetailModal')">Close</button>
    </div>
  `;
  document.getElementById('lotModalTitle').innerText = `⚖️ Compare Active Buyer Offers`;
  document.getElementById('lotModalContent').innerHTML = content;
  openModal('lotDetailModal');
}

function openProfileModal() {
  const content = `
    <div style="background:#F5F4ED;border:1px solid #E7E6DC;padding:1.25rem;border-radius:var(--radius-md);margin-bottom:1.25rem;">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">
        <div class="profile-avatar" style="width:48px;height:48px;font-size:1.2rem;">NF</div>
        <div>
          <h4 style="font-size:1.2rem;color:#12372A;">Nashik Kisan Samriddhi FPC</h4>
          <span style="font-size:0.8rem;color:#8C6517;font-weight:600;">Registration CIN: U01111MH2022PTC123456</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.85rem;color:#17221D;border-top:1px solid #E4E3D8;padding-top:1rem;">
        <div><strong>District:</strong> Nashik, Maharashtra</div>
        <div><strong>Total Share Capital:</strong> ₹15,00,000</div>
        <div><strong>NABARD Rating:</strong> A+ Certified</div>
        <div><strong>Bank Escrow:</strong> State Bank of India (Active)</div>
      </div>
    </div>
    <button class="btn btn-secondary" style="width:100%;" onclick="closeModal('lotDetailModal')">Close</button>
  `;
  document.getElementById('lotModalTitle').innerText = `👤 FPO Organization Profile`;
  document.getElementById('lotModalContent').innerHTML = content;
  openModal('lotDetailModal');
}

function toggleNotificationMenu() {
  showToast("🔔 3 New buyer purchase inquiries received in the last 2 hours!");
}

// Toast Notifications System
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i data-lucide="bell" style="width:16px;height:16px;color:#8FCB9B;flex-shrink:0;"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Chart.js Visualizations Setup — Light Premium Theme
function initCharts() {
  // Chart 1: Market Price Trends (7 Days)
  const ctxMarket = document.getElementById('marketPriceChart')?.getContext('2d');
  if (ctxMarket) {
    marketChartInstance = new Chart(ctxMarket, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Government Mandi Rate (₹/q)',
            data: [],
            borderColor: '#5B9A72',
            backgroundColor: 'rgba(91, 154, 114, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#5B9A72',
            pointBorderColor: '#FFFFFF'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#17221D',
              font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }
            }
          },
          tooltip: {
            backgroundColor: '#12372A',
            borderColor: '#5B9A72',
            borderWidth: 1,
            titleColor: '#FFFFFF',
            bodyColor: '#F5F4ED'
          }
        },
        scales: {
          x: {
            grid: { color: '#EBEAE1' },
            ticks: { color: '#6F7F75', font: { size: 11 } }
          },
          y: {
            grid: { color: '#EBEAE1' },
            ticks: {
              color: '#6F7F75',
              font: { size: 11 },
              callback: val => `₹${val}`
            }
          }
        }
      }
    });
    fetchFpoMandiData('wheat');
  }

  // Chart 2: Monthly Aggregation Volume & Revenue (Smooth Line Chart)
  const ctxVolume = document.getElementById('monthlyVolumeChart')?.getContext('2d');
  if (ctxVolume) {
    monthlyVolumeChartInstance = new Chart(ctxVolume, {
      type: 'line',
      data: {
        labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep (Est)'],
        datasets: [
          {
            label: 'Aggregated (Tons)',
            data: [15, 22, 28, 35, 42, 50],
            borderColor: '#5B9A72',
            backgroundColor: 'rgba(91, 154, 114, 0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: '#5B9A72',
            pointBorderColor: '#FFFFFF',
            yAxisID: 'y'
          },
          {
            label: 'Revenue (₹ Lakh)',
            data: [3.8, 5.6, 7.2, 9.1, 11.4, 13.5],
            borderColor: '#D6A84F',
            backgroundColor: 'transparent',
            borderDash: [4, 4],
            fill: false,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: '#D6A84F',
            pointBorderColor: '#FFFFFF',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#17221D', font: { size: 11, weight: '600' } }
          },
          tooltip: {
            backgroundColor: '#12372A',
            titleColor: '#FFFFFF',
            bodyColor: '#F5F4ED'
          }
        },
        scales: {
          x: {
            grid: { color: '#EBEAE1' },
            ticks: { color: '#6F7F75' }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: '#EBEAE1' },
            ticks: { color: '#6F7F75', callback: val => `${val} T` }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#8C6517', callback: val => `₹${val}L` }
          }
        }
      }
    });
  }

  // Chart 3: Commodity Share Breakdown
  const ctxShare = document.getElementById('cropShareChart')?.getContext('2d');
  if (ctxShare) {
    cropShareChartInstance = new Chart(ctxShare, {
      type: 'doughnut',
      data: {
        labels: ['Wheat (Sharbati)', 'Nashik Red Onion', 'Hybrid Tomato', 'Basmati Rice', 'Others'],
        datasets: [
          {
            data: [42, 32, 18, 10, 6],
            backgroundColor: [
              '#D6A84F',
              '#5B9A72',
              '#C96D5B',
              '#8FCB9B',
              '#12372A'
            ],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#17221D', font: { size: 11, weight: '500' } }
          },
          tooltip: {
            backgroundColor: '#12372A',
            titleColor: '#FFFFFF',
            bodyColor: '#F5F4ED'
          }
        },
        cutout: '68%'
      }
    });
  }
}

// Dynamic Government Mandi Rates & APMC Price Trends for FPO
async function fetchFpoMandiData(crop = 'wheat') {
  const chartCanvas = document.getElementById('marketPriceChart');
  const chartFallback = document.getElementById('marketPriceChartFallback');
  const dateEl = document.getElementById('fpo-mandi-report-date');

  const elNashik = document.getElementById('fpo-bench-nashik');
  const elPune = document.getElementById('fpo-bench-pune');
  const elVashi = document.getElementById('fpo-bench-vashi');
  const elPimpalgaon = document.getElementById('fpo-bench-pimpalgaon');

  try {
    const resp = await fetch(`/api/market/mandi-prices?commodity=${encodeURIComponent(crop)}&state=Maharashtra`);
    const json = await resp.json();
    const records = (json.success && Array.isArray(json.data)) ? json.data : [];

    const findMandi = (name) => records.find(r => (r.mandi || r.market || '').toLowerCase().includes(name.toLowerCase()));

    const rNashik = findMandi('Nashik');
    const rPune = findMandi('Pune');
    const rVashi = findMandi('Vashi') || findMandi('Mumbai');
    const rPimpalgaon = findMandi('Pimpalgaon');

    if (elNashik) elNashik.textContent = rNashik && rNashik.modalPrice ? `₹${rNashik.modalPrice.toLocaleString('en-IN')}/q` : 'Price unavailable';
    if (elPune) elPune.textContent = rPune && rPune.modalPrice ? `₹${rPune.modalPrice.toLocaleString('en-IN')}/q` : 'Price unavailable';
    if (elVashi) elVashi.textContent = rVashi && rVashi.modalPrice ? `₹${rVashi.modalPrice.toLocaleString('en-IN')}/q` : 'Price unavailable';
    if (elPimpalgaon) elPimpalgaon.textContent = rPimpalgaon && rPimpalgaon.modalPrice ? `₹${rPimpalgaon.modalPrice.toLocaleString('en-IN')}/q` : 'Price unavailable';

    const latestRec = rNashik || rPune || rVashi || rPimpalgaon || records[0];
    if (dateEl && latestRec && latestRec.reportDate) {
      dateEl.textContent = `Reported: ${latestRec.reportDate}`;
    }

    // Historical records check for trend chart
    const dateMap = new Map();
    records.forEach(r => {
      const d = r.reportDate || r.arrivalDate;
      if (d && r.modalPrice && !dateMap.has(d)) {
        dateMap.set(d, r.modalPrice);
      }
    });

    const uniqueDates = Array.from(dateMap.keys());

    if (uniqueDates.length >= 3) {
      if (chartCanvas) chartCanvas.style.display = 'block';
      if (chartFallback) chartFallback.style.display = 'none';

      const labels = uniqueDates;
      const dataPoints = uniqueDates.map(d => dateMap.get(d));

      if (marketChartInstance) {
        marketChartInstance.data.labels = labels;
        marketChartInstance.data.datasets[0].data = dataPoints;
        marketChartInstance.data.datasets[0].label = `Govt Modal Rate (${crop.toUpperCase()})`;
        marketChartInstance.update();
      }
    } else {
      if (chartCanvas) chartCanvas.style.display = 'none';
      if (chartFallback) chartFallback.style.display = 'block';
    }

  } catch (err) {
    console.error('Failed to load FPO mandi data:', err);
    if (chartCanvas) chartCanvas.style.display = 'none';
    if (chartFallback) chartFallback.style.display = 'block';
    if (elNashik) elNashik.textContent = 'Price unavailable';
    if (elPune) elPune.textContent = 'Price unavailable';
    if (elVashi) elVashi.textContent = 'Price unavailable';
    if (elPimpalgaon) elPimpalgaon.textContent = 'Price unavailable';
  }
}

// Update Market Chart on Dropdown Select
async function updateMarketChart(crop) {
  await fetchFpoMandiData(crop);
  showToast(`Updated government mandi prices for ${crop.toUpperCase()}`);
}

// Header Sticky Scroll Effect
window.addEventListener('scroll', () => {
  const header = document.getElementById('mainHeader');
  if (window.scrollY > 20) {
    header?.classList.add('scrolled');
  } else {
    header?.classList.remove('scrolled');
  }
});

// FPO Profile Dropdown & Logout
function toggleFpoProfileDropdown() {
  const dropdown = document.getElementById('fpoProfileDropdown');
  if (dropdown) dropdown.classList.toggle('active');
}

function closeFpoProfileDropdown() {
  const dropdown = document.getElementById('fpoProfileDropdown');
  if (dropdown) dropdown.classList.remove('active');
}

function handleFpoLogout() {
  if (window.Auth && typeof window.Auth.logout === 'function') {
    window.Auth.logout();
  } else {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
  }
}

// Click outside to dismiss FPO profile dropdown & mobile menu
document.addEventListener('click', (e) => {
  const wrap = document.getElementById('fpoProfileWrap');
  const dropdown = document.getElementById('fpoProfileDropdown');
  if (dropdown && dropdown.classList.contains('active')) {
    if (wrap && !wrap.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  }
  const nav = document.getElementById('navMenu');
  const toggleBtn = document.getElementById('mobileMenuToggle');
  if (nav && nav.classList.contains('open')) {
    if (toggleBtn && !toggleBtn.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
    }
  }
});

window.toggleFpoProfileDropdown = toggleFpoProfileDropdown;
window.closeFpoProfileDropdown = closeFpoProfileDropdown;
window.handleFpoLogout = handleFpoLogout;

// Demo Flow: Consolidate Lot handler
function handleFpoConsolidateLot() {
  const btn = document.getElementById('btn-fpo-accept-lot');
  const badge = document.getElementById('fpo-lot-status-badge');
  if (btn) {
    btn.innerHTML = '<span>✓</span> Lot Consolidated with Vashi Lot';
    btn.classList.remove('btn-gold');
    btn.classList.add('btn-secondary');
    btn.disabled = true;
  }
  if (badge) {
    badge.textContent = 'Lot Consolidated · Matching Amit Shah';
    badge.className = 'badge badge-success';
  }
  if (window.KrishiDemo) {
    window.KrishiDemo.setFlowState({ fpoAccepted: true });
  }
  showToast('✓ Ramesh Patil\'s 850 kg tomato lot consolidated with Vashi dispatch batch.');
}
window.handleFpoConsolidateLot = handleFpoConsolidateLot;

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  initCharts();

  // Restore dev demo state if active
  if (window.KrishiDemo && window.KrishiDemo.isDevDemo()) {
    const state = window.KrishiDemo.getFlowState();
    if (state && state.fpoAccepted) {
      const btn = document.getElementById('btn-fpo-accept-lot');
      const badge = document.getElementById('fpo-lot-status-badge');
      if (btn) {
        btn.innerHTML = '<span>✓</span> Lot Consolidated with Vashi Lot';
        btn.disabled = true;
      }
      if (badge) {
        badge.textContent = 'Lot Consolidated · Matching Amit Shah';
        badge.className = 'badge badge-success';
      }
    }
  }

  // Active navigation alignment handler
  const navLinks = document.querySelectorAll('#navMenu .nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });
});
