/**
 * KrishiShetra Transporter Portal - Core Controller & Modal Engine
 * Unified Production-Grade Agri-Logistics Experience
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Handle URL Hash for deep links (e.g. #loads/LD-8042 or #active-trips/TRIP-9021)
  handleHashNavigation();
  window.addEventListener('hashchange', handleHashNavigation);

  // Initialize shared header navigation and user profile
  initCommonHeader();

  // Dynamic time-based greeting for dashboard
  initDashboardGreeting();
});

function initDashboardGreeting() {
  const greetingEl = document.getElementById('dashboardGreeting');
  if (greetingEl) {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
    } else if (hour >= 17) {
      timeGreeting = 'Good evening';
    }
    const nameEl = document.getElementById('transHeaderName');
    const name = nameEl?.textContent || 'Vijay More';
    greetingEl.innerHTML = `${timeGreeting}, <em>${name}</em> 👋`;
  }
}

function initCommonHeader() {
  const hamburger = document.getElementById('transHamburger');
  const navMenu = document.getElementById('transNavMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('mobile-open');
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        navMenu.classList.remove('mobile-open');
      }
    });
  }

  initTransporterProfileDropdown();
  populateTransporterUserData();
}

function initTransporterProfileDropdown() {
  const btn = document.getElementById('btnTransProfile');
  const wrap = document.getElementById('transProfileWrap');
  const logoutBtn = document.getElementById('transLogoutBtn');

  if (btn && wrap) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wrap.classList.contains('open')) {
        wrap.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.Auth && typeof window.Auth.logout === 'function') {
        window.Auth.logout();
      } else {
        localStorage.removeItem('krishi_token');
        localStorage.removeItem('krishi_user');
        localStorage.removeItem('krishi_is_logged_in');
        localStorage.removeItem('krishishetra_dev_session');
        window.location.href = '../login.html';
      }
    });
  }
}

function populateTransporterUserData() {
  if (!window.Auth || typeof window.Auth.getUser !== 'function') return;
  const user = window.Auth.getUser();
  if (user) {
    const name = user.name || user.companyName || (user.email ? user.email.split('@')[0] : 'Kisan Express');
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'KE';
    
    const hName = document.getElementById('transHeaderName');
    const hAvatar = document.getElementById('transHeaderAvatar');
    const dName = document.getElementById('transDropdownName');
    const dAvatar = document.getElementById('transDropdownAvatar');
    const dSub = document.getElementById('transDropdownSub');

    if (hName) hName.textContent = name;
    if (hAvatar) hAvatar.textContent = initials;
    if (dName) dName.textContent = user.companyName || name;
    if (dAvatar) dAvatar.textContent = initials;
    if (dSub && user.email) dSub.textContent = `${user.email} · Verified Carrier`;
  }
}

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? 'check-circle' : (type === 'warning' ? 'alert-triangle' : 'info');
  toast.innerHTML = `
    <i data-lucide="${icon}" style="width:18px;height:18px;color:#C8963E;flex-shrink:0;"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Global modal helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    if (window.lucide) lucide.createIcons();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
}

// Handle Hash deep link routing
function handleHashNavigation() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;

  if (hash.startsWith('/loads/') || hash.startsWith('loads/')) {
    const loadId = hash.split('/')[2] || hash.split('/')[1];
    viewLoadDetail(loadId);
  } else if (hash.startsWith('/active-trips/') || hash.startsWith('active-trips/')) {
    const tripId = hash.split('/')[2] || hash.split('/')[1];
    viewTripDetail(tripId);
  }
}

// =========================================================================
// LOAD DETAIL & BIDDING MODAL (:loadId)
// =========================================================================
function viewLoadDetail(loadId) {
  const load = TransporterData.availableLoads.find(l => l.id === loadId) || TransporterData.availableLoads[0];
  if (!load) return;

  const modalHtml = `
    <div class="modal-overlay show" id="loadDetailModal" onclick="if(event.target===this)closeModal('loadDetailModal')">
      <div class="modal-container" style="max-width:740px;">
        <div class="modal-header">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="trip-id-badge">${load.id}</span>
              <span class="badge-tag status-badge available">● Open for Acceptance</span>
            </div>
            <h3 class="modal-title" style="margin-top:6px;">${load.commodity}</h3>
          </div>
          <button class="modal-close-btn" onclick="closeModal('loadDetailModal')" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          
          <!-- Shipper & Origin-Destination Route -->
          <div style="background:var(--transporter-surface-warm);padding:16px;border-radius:var(--radius-md);margin-bottom:18px;border:1px solid var(--transporter-border-subtle);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
              <span style="font-size:13px;font-weight:700;color:var(--transporter-text);display:inline-flex;align-items:center;gap:6px;">
                <i data-lucide="building-2" style="width:15px;height:15px;color:var(--transporter-primary);"></i> Posted by: ${load.fpoName}
              </span>
              <span class="status-badge available" style="font-size:11.5px;">100% Escrow Backed ✓</span>
            </div>
            
            <div class="route-timeline" style="margin-left:6px;">
              <div class="route-point">
                <span class="route-dot origin"></span>
                <div class="route-city">${load.origin}</div>
                <div class="route-mandi">Loading Schedule: <strong>${load.pickupDate}</strong></div>
              </div>
              <div class="route-point">
                <span class="route-dot dest"></span>
                <div class="route-city">${load.destination}</div>
                <div class="route-mandi">Est. Highway Transit: ~${load.transitEst} (${load.distance})</div>
              </div>
            </div>
          </div>

          <!-- Specs Grid -->
          <div class="form-grid-2" style="margin-bottom:18px;">
            <div style="background:var(--transporter-surface);padding:14px;border-radius:var(--radius-sm);border:1px solid var(--transporter-border);">
              <div style="font-size:11px;color:var(--transporter-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">CARGO WEIGHT & REQUIRED VEHICLE</div>
              <div style="font-size:16px;font-weight:800;color:var(--transporter-text);margin-top:4px;">${load.weightMT} Metric Tons</div>
              <div style="font-size:12px;color:var(--transporter-primary);font-weight:600;margin-top:2px;">${load.truckRequired}</div>
            </div>
            <div style="background:var(--transporter-surface);padding:14px;border-radius:var(--radius-sm);border:1px solid var(--transporter-border);">
              <div style="font-size:11px;color:var(--transporter-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">PERISHABILITY & TEMPERATURE</div>
              <div style="font-size:16px;font-weight:800;color:var(--transporter-text);margin-top:4px;">${load.perishability}</div>
              <div style="font-size:12px;color:var(--transporter-accent-dark);font-weight:600;margin-top:2px;">Temp: ${load.tempRequired}</div>
            </div>
          </div>

          <!-- Offered Freight Box -->
          <div style="background:#FFFBF3;border:1px solid #F4DFB0;border-radius:var(--radius-md);padding:16px;margin-bottom:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
              <div>
                <span style="font-size:11px;font-weight:700;color:#8A6010;text-transform:uppercase;letter-spacing:0.05em;">Offered Freight Payout</span>
                <div style="font-size:26px;font-weight:800;color:var(--transporter-primary);font-family:var(--font-display);">₹${load.totalPayout.toLocaleString()}</div>
                <span style="font-size:12px;color:#8A6010;">(₹${load.ratePerMT} / MT · ${load.paymentTerms})</span>
              </div>
              <div>
                <span class="status-badge available" style="padding:5px 12px;font-size:12px;">Zero TDS Escrow</span>
              </div>
            </div>
          </div>

          <!-- Dispatch Assignments -->
          <div class="form-group" style="margin-bottom:14px;">
            <label class="form-label">Assign Available Vehicle from Fleet</label>
            <select class="form-select" id="bidSelectedTruck">
              ${TransporterData.fleet.map(f => `<option value="${f.regNo}">${f.regNo} — ${f.type} (${f.capacity}) [${f.status}]</option>`).join('')}
            </select>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Confirmed Freight Rate (₹ Total)</label>
              <input type="number" class="form-input" id="bidAmountInput" value="${load.totalPayout}">
            </div>
            <div class="form-group">
              <label class="form-label">Assign Certified Driver</label>
              <select class="form-select" id="bidSelectedDriver">
                ${TransporterData.drivers.map(d => `<option value="${d.name}">${d.name} (${d.dlType})</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('loadDetailModal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitBidAction('${load.id}')"><i data-lucide="check" style="width:16px;height:16px;"></i> Accept Load</button>
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById('loadDetailModal');
  if (existing) existing.remove();

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (window.lucide) lucide.createIcons();
}

function submitBidAction(loadId) {
  const truck = document.getElementById('bidSelectedTruck')?.value || 'MH 15 EG 4820';
  const driver = document.getElementById('bidSelectedDriver')?.value || 'Vijay More';
  const amount = document.getElementById('bidAmountInput')?.value || 34225;

  closeModal('loadDetailModal');
  showToast(`✅ Load ${loadId} accepted! Assigned to ${truck} (${driver}) for ₹${Number(amount).toLocaleString()}.`, 'success');
}

// =========================================================================
// ACTIVE TRIP TELEMETRY & LIVE TRACKING MODAL (:tripId)
// =========================================================================
function viewTripDetail(tripId) {
  const trip = TransporterData.activeTrips.find(t => t.id === tripId) || TransporterData.activeTrips[0];
  if (!trip) return;

  const modalHtml = `
    <div class="modal-overlay show" id="tripDetailModal" onclick="if(event.target===this)closeModal('tripDetailModal')">
      <div class="modal-container" style="max-width:820px;">
        <div class="modal-header">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="trip-id-badge">${trip.id}</span>
              <span class="trip-status-badge ${trip.statusBadgeClass}">● ${trip.status}</span>
            </div>
            <h3 class="modal-title" style="margin-top:6px;">${trip.commodity}</h3>
          </div>
          <button class="modal-close-btn" onclick="closeModal('tripDetailModal')" aria-label="Close modal">&times;</button>
        </div>
        
        <div class="modal-body">
          <!-- Live Radar Simulation -->
          <div class="gps-radar-box" style="height:220px;margin-bottom:18px;">
            <div class="radar-grid-bg"></div>
            <div class="radar-sweep"></div>
            <div class="radar-truck-pin" style="top:44%;left:52%;">
              <i data-lucide="truck" style="width:13px;height:13px;"></i>
              <span>${trip.vehicleNo} · ${trip.speedKmh}</span>
            </div>
            <div style="position:absolute;bottom:10px;left:14px;background:rgba(7,38,30,0.85);backdrop-filter:blur(4px);padding:5px 12px;border-radius:var(--radius-sm);color:#FFF;font-size:11.5px;font-family:monospace;border:1px solid rgba(255,255,255,0.2);">
              <i data-lucide="map-pin" style="width:12px;height:12px;display:inline;vertical-align:middle;color:var(--transporter-accent);"></i> Current Location: ${trip.currentLocation}
            </div>
          </div>

          <!-- Milestone Timeline -->
          <div class="milestone-stepper">
            <div class="milestone-node completed">
              <div class="milestone-dot"><i data-lucide="check" style="width:14px;height:14px;"></i></div>
              <div class="milestone-label">Booked</div>
            </div>
            <div class="milestone-node completed">
              <div class="milestone-dot"><i data-lucide="check" style="width:14px;height:14px;"></i></div>
              <div class="milestone-label">Pickup</div>
            </div>
            <div class="milestone-node ${trip.status === 'Delivered' ? 'completed' : 'current'}">
              <div class="milestone-dot">${trip.status === 'Delivered' ? '<i data-lucide="check" style="width:14px;height:14px;"></i>' : '3'}</div>
              <div class="milestone-label">In Transit</div>
            </div>
            <div class="milestone-node ${trip.status === 'Delivered' ? 'completed' : ''}">
              <div class="milestone-dot">${trip.status === 'Delivered' ? '<i data-lucide="check" style="width:14px;height:14px;"></i>' : '4'}</div>
              <div class="milestone-label">Arrived</div>
            </div>
            <div class="milestone-node ${trip.status === 'Delivered' ? 'current' : ''}">
              <div class="milestone-dot">${trip.status === 'Delivered' ? '✓' : '5'}</div>
              <div class="milestone-label">Delivered</div>
            </div>
          </div>

          <!-- Trip Progress Route Bar -->
          <div class="trip-progress-container">
            <div class="trip-progress-meta">
              <span><strong>Origin:</strong> ${trip.origin}</span>
              <span><strong>ETA:</strong> ${trip.eta}</span>
              <span><strong>Destination:</strong> ${trip.destination}</span>
            </div>
            <div class="trip-progress-track">
              <div class="trip-progress-fill" style="width:${trip.progressPct}%;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--transporter-muted);margin-top:4px;">
              <span>${trip.completedDistance} completed</span>
              <span style="font-weight:700;color:var(--transporter-primary);">${trip.progressPct}% Journey Completed</span>
              <span>${trip.totalDistance} total</span>
            </div>
          </div>

          <!-- Telemetry Specs Grid -->
          <div class="dashboard-grid-3" style="gap:10px;margin:18px 0;">
            <div style="background:var(--transporter-surface);padding:12px 14px;border-radius:var(--radius-sm);border:1px solid var(--transporter-border-subtle);">
              <div style="font-size:10.5px;color:var(--transporter-muted);font-weight:700;text-transform:uppercase;">DRIVER & CONTACT</div>
              <div style="font-size:13.5px;font-weight:700;color:var(--transporter-text);margin-top:2px;">${trip.driverName}</div>
              <a href="tel:${trip.driverPhone}" style="font-size:12px;color:var(--transporter-primary);font-weight:600;"><i data-lucide="phone" style="width:12px;height:12px;display:inline;"></i> ${trip.driverPhone}</a>
            </div>

            <div style="background:var(--transporter-surface);padding:12px 14px;border-radius:var(--radius-sm);border:1px solid var(--transporter-border-subtle);">
              <div style="font-size:10.5px;color:var(--transporter-muted);font-weight:700;text-transform:uppercase;">E-WAY BILL & TOLLS</div>
              <div style="font-size:13px;font-weight:700;color:var(--transporter-text);margin-top:2px;font-family:monospace;">${trip.eWayBill}</div>
              <div style="font-size:11.5px;color:var(--transporter-accent-dark);">${trip.tollCrossed}</div>
            </div>

            <div style="background:var(--transporter-surface);padding:12px 14px;border-radius:var(--radius-sm);border:1px solid var(--transporter-border-subtle);">
              <div style="font-size:10.5px;color:var(--transporter-muted);font-weight:700;text-transform:uppercase;">COLD CHAIN / SENSORS</div>
              <div style="font-size:13.5px;font-weight:700;color:var(--transporter-text);margin-top:2px;">${trip.reeferTemp}</div>
              <div style="font-size:11.5px;color:var(--transporter-success);font-weight:600;">AIS-140 GPS Synchronized</div>
            </div>
          </div>

          <!-- Digital POD Verification Box -->
          <div style="background:var(--transporter-surface-warm);border:1px solid var(--transporter-border);border-radius:var(--radius-md);padding:16px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <i data-lucide="file-check-2" style="width:18px;height:18px;color:var(--transporter-primary);"></i>
              <h4 style="font-size:14px;font-weight:800;color:var(--transporter-text);">Digital Proof of Delivery (POD) & Instant Settlement</h4>
            </div>
            <p style="font-size:12px;color:var(--transporter-muted);margin-bottom:12px;">Upon arrival at mandi dock, input the 4-digit receiver OTP to release 100% freight payout directly to your escrow wallet.</p>
            
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <input type="text" class="form-input" id="podOtpInput" placeholder="Enter Receiver 4-Digit OTP" style="max-width:240px;font-weight:700;letter-spacing:0.1em;">
              <button class="btn btn-amber btn-sm" onclick="verifyPodOtp('${trip.id}')"><i data-lucide="check-circle" style="width:14px;height:14px;"></i> Verify POD OTP</button>
              <button class="btn btn-secondary btn-sm" onclick="showToast('Driver pinged via automated SMS & WhatsApp notification.')"><i data-lucide="send" style="width:14px;height:14px;"></i> Ping Driver</button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('tripDetailModal')">Close Telemetry</button>
          <a href="active-trips.html" class="btn btn-primary">Open Full Trips Console</a>
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById('tripDetailModal');
  if (existing) existing.remove();

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (window.lucide) lucide.createIcons();
}

function verifyPodOtp(tripId) {
  const otp = document.getElementById('podOtpInput')?.value;
  if (!otp || otp.length < 4) {
    alert('Please enter valid 4-digit OTP provided by the destination mandi receiver.');
    return;
  }
  closeModal('tripDetailModal');
  showToast(`🎉 POD OTP verified for ${tripId}! Escrow freight payout ₹34,225 released to your wallet.`, 'success');
}

// =========================================================================
// ONBOARDING & COMPLIANCE STEPPER CONTROLLER
// =========================================================================
let currentStep = 1;

function goToStep(stepNumber) {
  currentStep = stepNumber;
  const nodes = document.querySelectorAll('.step-node');
  const totalSteps = nodes.length || 5;
  
  // Update step nodes
  nodes.forEach(node => {
    const step = parseInt(node.getAttribute('data-step'));
    node.classList.remove('active', 'completed');
    if (step === currentStep) {
      node.classList.add('active');
    } else if (step < currentStep) {
      node.classList.add('completed');
    }
  });

  // Update progress line
  const progressLine = document.getElementById('stepperProgressLine');
  if (progressLine) {
    const pct = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressLine.style.width = `${pct}%`;
  }

  // Update step cards visibility
  document.querySelectorAll('.step-content-card').forEach(card => {
    const cardStep = parseInt(card.getAttribute('data-step'));
    if (cardStep === currentStep) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  if (window.lucide) lucide.createIcons();
}

function nextStep() {
  const totalSteps = document.querySelectorAll('.step-node').length || 5;
  if (currentStep < totalSteps) {
    goToStep(currentStep + 1);
  } else {
    showToast('🎉 Verification complete! Government VAHAN / Sarathi match confirmed. Gold Carrier status active.', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1800);
  }
}

function prevStep() {
  if (currentStep > 1) {
    goToStep(currentStep - 1);
  }
}

function simulateDocUpload(inputId, statusTargetId) {
  const statusEl = document.getElementById(statusTargetId);
  if (statusEl) {
    statusEl.innerHTML = `<span style="color:var(--transporter-accent-dark);font-size:12px;font-weight:700;"><i data-lucide="loader" style="width:14px;height:14px;display:inline;animation:spin 1s linear infinite;"></i> AI OCR Verifying with VAHAN Database...</span>`;
    if (window.lucide) lucide.createIcons();
    setTimeout(() => {
      statusEl.innerHTML = `<span style="color:var(--transporter-success);font-size:12px;font-weight:700;"><i data-lucide="check-circle-2" style="width:14px;height:14px;display:inline;"></i> Verified ✓ (Ministry of Road Transport Match)</span>`;
      if (window.lucide) lucide.createIcons();
      showToast('Document verified with Ministry of Road Transport database!', 'success');
    }, 1200);
  }
}

// Add Vehicle Modal
function openAddVehicleModal() {
  const modalHtml = `
    <div class="modal-overlay show" id="addVehicleModal" onclick="if(event.target===this)closeModal('addVehicleModal')">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Register New Fleet Truck</h3>
          <button class="modal-close-btn" onclick="closeModal('addVehicleModal')" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Vehicle Registration No. (RC)</label>
              <input type="text" class="form-input" id="newVehReg" placeholder="e.g. MH 15 FG 9182">
            </div>
            <div class="form-group">
              <label class="form-label">Truck Body Type</label>
              <select class="form-select" id="newVehType">
                <option>10-Wheeler Open Body</option>
                <option>32ft Cold Reefer</option>
                <option>14ft / 19ft Eicher Closed</option>
                <option>Tata 407 LPT</option>
                <option>22ft Multi-Axle</option>
              </select>
            </div>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Payload Capacity (Tonnage MT)</label>
              <input type="text" class="form-input" id="newVehCap" placeholder="e.g. 16.0 MT">
            </div>
            <div class="form-group">
              <label class="form-label">National Permit Validity</label>
              <input type="date" class="form-input" id="newVehPermit" value="2028-12-31">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Upload RC Smart Card Document</label>
            <div class="upload-dropzone" onclick="showToast('RC file attached successfully!')">
              <div class="upload-icon"><i data-lucide="upload-cloud"></i></div>
              <div style="font-size:13.5px;font-weight:700;">Click to upload RC Smart Card photo or PDF</div>
              <div style="font-size:12px;color:var(--transporter-muted);">Instant VAHAN validation check</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('addVehicleModal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitNewVehicle()"><i data-lucide="plus" style="width:16px;height:16px;"></i> Register Truck</button>
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById('addVehicleModal');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (window.lucide) lucide.createIcons();
}

function submitNewVehicle() {
  const reg = document.getElementById('newVehReg')?.value || 'MH 15 FG 9182';
  const type = document.getElementById('newVehType')?.value || '14ft Eicher';
  const cap = document.getElementById('newVehCap')?.value || '9 MT';

  TransporterData.fleet.unshift({
    id: `VEH-0${TransporterData.fleet.length + 1}`,
    regNo: reg,
    type: type,
    capacity: cap,
    driver: "Unassigned",
    status: "Available",
    rcExpiry: "2030-05-12",
    fitnessExpiry: "2027-08-20",
    insuranceExpiry: "2027-04-15",
    gpsSignal: "Live"
  });

  closeModal('addVehicleModal');
  showToast(`🚛 Vehicle ${reg} registered successfully!`, 'success');
  if (typeof renderFleetTable === 'function') renderFleetTable();
}

// Add Driver Modal
function openAddDriverModal() {
  const modalHtml = `
    <div class="modal-overlay show" id="addDriverModal" onclick="if(event.target===this)closeModal('addDriverModal')">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Onboard New Driver</h3>
          <button class="modal-close-btn" onclick="closeModal('addDriverModal')" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Driver Full Name</label>
              <input type="text" class="form-input" id="newDrvName" placeholder="e.g. Tukaram Gaikwad">
            </div>
            <div class="form-group">
              <label class="form-label">Mobile Number</label>
              <input type="tel" class="form-input" id="newDrvPhone" placeholder="+91 98XXX XXXXX">
            </div>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Driving License No. (SARATHI)</label>
              <input type="text" class="form-input" id="newDrvDl" placeholder="e.g. MH15-2018009142">
            </div>
            <div class="form-group">
              <label class="form-label">License Class</label>
              <select class="form-select" id="newDrvType">
                <option>Commercial Heavy (HMV)</option>
                <option>Commercial Cold Chain Reefer</option>
                <option>Commercial Medium (LMV/HMV)</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Upload Driving License Scan</label>
            <div class="upload-dropzone" onclick="showToast('DL scan attached and Sarathi verified!')">
              <div class="upload-icon"><i data-lucide="id-card"></i></div>
              <div style="font-size:13.5px;font-weight:700;">Upload Front & Back Photo of Driving License</div>
              <div style="font-size:12px;color:var(--transporter-muted);">Automatic Sarathi commercial verification</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('addDriverModal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitNewDriver()"><i data-lucide="user-plus" style="width:16px;height:16px;"></i> Onboard Driver</button>
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById('addDriverModal');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (window.lucide) lucide.createIcons();
}

function submitNewDriver() {
  const name = document.getElementById('newDrvName')?.value || 'Tukaram Gaikwad';
  const phone = document.getElementById('newDrvPhone')?.value || '+91 98220 19284';
  const dl = document.getElementById('newDrvDl')?.value || 'MH15-2018009142';
  const type = document.getElementById('newDrvType')?.value || 'Commercial Heavy (HMV)';

  TransporterData.drivers.unshift({
    id: `DRV-0${TransporterData.drivers.length + 1}`,
    name: name,
    phone: phone,
    dlNumber: dl,
    dlType: type,
    assignedTruck: "MH 15 AA 9921",
    experience: "9 yrs",
    safetyRating: 4.90,
    trips: 0,
    status: "Available"
  });

  closeModal('addDriverModal');
  showToast(`👨‍✈️ Driver ${name} onboarded and verified!`, 'success');
  if (typeof renderDriversTable === 'function') renderDriversTable();
}

// Withdraw Modal
function openWithdrawModal() {
  const modalHtml = `
    <div class="modal-overlay show" id="withdrawModal" onclick="if(event.target===this)closeModal('withdrawModal')">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Instant Settlement Withdrawal</h3>
          <button class="modal-close-btn" onclick="closeModal('withdrawModal')" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <div style="background:#E8F7F0;border:1px solid #BCE7D2;border-radius:var(--radius-md);padding:16px;margin-bottom:18px;">
            <div style="font-size:11px;font-weight:700;color:var(--transporter-success);text-transform:uppercase;">Available Escrow Clear Balance</div>
            <div style="font-size:26px;font-weight:800;color:var(--transporter-primary);font-family:var(--font-display);">₹${TransporterData.earnings.walletBalance.toLocaleString()}</div>
            <div style="font-size:12px;color:var(--transporter-muted);margin-top:2px;">Transfers via Instant IMPS / UPI within 15 minutes.</div>
          </div>
          <div class="form-group" style="margin-bottom:14px;">
            <label class="form-label">Withdrawal Amount (₹)</label>
            <input type="number" class="form-input" id="withdrawAmount" value="${TransporterData.earnings.walletBalance}" max="${TransporterData.earnings.walletBalance}">
          </div>
          <div class="form-group" style="margin-bottom:14px;">
            <label class="form-label">Receiving Bank Account / UPI VPA</label>
            <div style="padding:12px 14px;background:var(--transporter-surface);border:1px solid var(--transporter-border);border-radius:var(--radius-sm);">
              <div style="font-weight:700;font-size:13.5px;">${TransporterData.profile.bankDetails.accountName}</div>
              <div style="font-size:12px;color:var(--transporter-muted);">${TransporterData.profile.bankDetails.bankName} · A/C: ${TransporterData.profile.bankDetails.accountNumber}</div>
              <div style="font-size:12px;color:var(--transporter-primary);font-weight:600;">IFSC: ${TransporterData.profile.bankDetails.ifsc} · UPI: ${TransporterData.profile.bankDetails.upiId}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('withdrawModal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitWithdrawal()"><i data-lucide="arrow-up-right" style="width:16px;height:16px;"></i> Confirm Instant Transfer</button>
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById('withdrawModal');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (window.lucide) lucide.createIcons();
}

function submitWithdrawal() {
  const amt = document.getElementById('withdrawAmount')?.value || TransporterData.earnings.walletBalance;
  closeModal('withdrawModal');
  showToast(`💸 ₹${Number(amt).toLocaleString()} initiated to HDFC Bank A/C ...1729! IMPS Ref: TXN-${Math.floor(Math.random()*900000+100000)}`, 'success');
}
