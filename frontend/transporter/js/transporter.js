/**
 * KrishiShetra Transporter Portal - Core Interactive Logic & Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Check URL Hash for deep links like #loads/LD-8042 or #active-trips/TRIP-9021
  handleHashNavigation();
  window.addEventListener('hashchange', handleHashNavigation);

  // Initialize page-specific scripts
  initCommonHeader();
});

function initCommonHeader() {
  const hamburger = document.getElementById('transHamburger');
  const navMenu = document.getElementById('transNavMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
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
  toast.innerHTML = `
    <i data-lucide="check-circle" style="width:18px;height:18px;color:#C8963E;"></i>
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

// Handle Hash-based deep link routing (e.g. #loads/LD-8042 or #active-trips/TRIP-9021)
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
// LOAD DETAIL MODAL & BIDDING ENGINE (:loadid)
// =========================================================================
function viewLoadDetail(loadId) {
  const load = TransporterData.availableLoads.find(l => l.id === loadId) || TransporterData.availableLoads[0];
  if (!load) return;

  const modalHtml = `
    <div class="modal-overlay show" id="loadDetailModal" onclick="if(event.target===this)closeModal('loadDetailModal')">
      <div class="modal-container" style="max-width:760px;">
        <div class="modal-header">
          <div>
            <span class="badge-tag" style="background:var(--amber-pale);color:var(--amber-dark);padding:3px 8px;border-radius:4px;font-size:11px;font-weight:700;">${load.id}</span>
            <h3 class="modal-title" style="margin-top:4px;">${load.commodity}</h3>
          </div>
          <button class="modal-close-btn" onclick="closeModal('loadDetailModal')">&times;</button>
        </div>
        <div class="modal-body">
          <div style="background:var(--bg-surface);padding:16px;border-radius:var(--radius-md);margin-bottom:20px;border:1px solid var(--border-subtle);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <span style="font-size:13px;font-weight:700;color:var(--text-secondary);"><i data-lucide="building" style="width:15px;height:15px;vertical-align:middle;"></i> Posted by: ${load.fpoName}</span>
              <span style="font-size:12px;color:var(--status-success-text);background:var(--status-success-bg);padding:2px 8px;border-radius:var(--radius-full);font-weight:700;">Verified FPO ✓</span>
            </div>
            
            <div class="route-timeline" style="margin-left:8px;">
              <div class="route-point">
                <span class="route-dot origin"></span>
                <div class="route-city">Pickup: ${load.origin}</div>
                <div class="route-mandi">Loading Date: ${load.pickupDate}</div>
              </div>
              <div class="route-point">
                <span class="route-dot dest"></span>
                <div class="route-city">Destination: ${load.destination}</div>
                <div class="route-mandi">Est. Transit: ${load.transitEst} (${load.distance})</div>
              </div>
            </div>
          </div>

          <div class="form-grid-2" style="margin-bottom:20px;">
            <div style="background:var(--bg-input);padding:14px;border-radius:var(--radius-sm);border:1px solid var(--border-light);">
              <div style="font-size:12px;color:var(--text-muted);font-weight:600;">CARGO WEIGHT & VEHICLE</div>
              <div style="font-size:16px;font-weight:800;color:var(--text-heading);margin-top:4px;">${load.weightMT} Metric Tons</div>
              <div style="font-size:12.5px;color:var(--green-mid);font-weight:600;margin-top:2px;">Req: ${load.truckRequired}</div>
            </div>
            <div style="background:var(--bg-input);padding:14px;border-radius:var(--radius-sm);border:1px solid var(--border-light);">
              <div style="font-size:12px;color:var(--text-muted);font-weight:600;">PERISHABILITY & COLD-CHAIN</div>
              <div style="font-size:16px;font-weight:800;color:var(--text-heading);margin-top:4px;">${load.perishability}</div>
              <div style="font-size:12.5px;color:var(--amber-dark);font-weight:600;margin-top:2px;">Req Temp: ${load.tempRequired}</div>
            </div>
          </div>

          <div style="background:#FFF8ED;border:1px solid var(--amber-light);border-radius:var(--radius-md);padding:16px;margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <span style="font-size:12px;font-weight:700;color:#8A6010;text-transform:uppercase;">Offered Freight Payout</span>
                <div style="font-size:24px;font-weight:800;color:var(--green-primary);font-family:var(--font-display);">₹${load.totalPayout.toLocaleString()}</div>
                <span style="font-size:12px;color:#8A6010;">(₹${load.ratePerMT} / MT · ${load.paymentTerms})</span>
              </div>
              <div style="text-align:right;">
                <span class="badge-tag" style="background:#DCF3E5;color:#1E6B40;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:700;">Zero TDS Escrow</span>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="font-weight:700;">Assign Truck from Your Fleet</label>
            <select class="form-select" id="bidSelectedTruck">
              ${TransporterData.fleet.map(f => `<option value="${f.regNo}">${f.regNo} — ${f.type} (${f.capacity}) [${f.status}]</option>`).join('')}
            </select>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Your Quote (₹ Total)</label>
              <input type="number" class="form-input" id="bidAmountInput" value="${load.totalPayout}">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Select Driver</label>
              <select class="form-select" id="bidSelectedDriver">
                ${TransporterData.drivers.map(d => `<option value="${d.name}">${d.name} (${d.dlType})</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('loadDetailModal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitBidAction('${load.id}')"><i data-lucide="check" style="width:16px;height:16px;"></i> Confirm & Accept Load</button>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existing = document.getElementById('loadDetailModal');
  if (existing) existing.remove();

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (window.lucide) lucide.createIcons();
}

function submitBidAction(loadId) {
  const truck = document.getElementById('bidSelectedTruck')?.value;
  const driver = document.getElementById('bidSelectedDriver')?.value;
  const amount = document.getElementById('bidAmountInput')?.value;

  closeModal('loadDetailModal');
  showToast(`✅ Load ${loadId} accepted successfully! Assigned to ${truck} (${driver}) for ₹${Number(amount).toLocaleString()}.`, 'success');
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
            <h3 class="modal-title" style="margin-top:4px;">${trip.commodity}</h3>
          </div>
          <button class="modal-close-btn" onclick="closeModal('tripDetailModal')">&times;</button>
        </div>
        
        <div class="modal-body">
          <!-- Live Radar Simulation Box -->
          <div class="gps-radar-box" style="height:240px;margin-bottom:20px;">
            <div class="radar-grid-bg"></div>
            <div class="radar-sweep"></div>
            <div class="radar-truck-pin" style="top:45%;left:52%;">
              <i data-lucide="truck" style="width:14px;height:14px;"></i>
              <span>${trip.vehicleNo} · ${trip.speedKmh}</span>
            </div>
            <div style="position:absolute;bottom:12px;left:16px;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);padding:6px 12px;border-radius:var(--radius-sm);color:#FFF;font-size:12px;font-family:monospace;border:1px solid rgba(255,255,255,0.2);">
              <i data-lucide="map-pin" style="width:13px;height:13px;display:inline;vertical-align:middle;color:var(--amber);"></i> Live GPS: ${trip.currentLocation}
            </div>
          </div>

          <!-- Trip Progress Bar -->
          <div class="trip-progress-container">
            <div class="trip-progress-meta">
              <span><strong>Origin:</strong> ${trip.origin}</span>
              <span><strong>ETA:</strong> ${trip.eta}</span>
              <span><strong>Destination:</strong> ${trip.destination}</span>
            </div>
            <div class="trip-progress-track">
              <div class="trip-progress-fill" style="width:${trip.progressPct}%;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-muted);margin-top:4px;">
              <span>${trip.completedDistance} completed</span>
              <span>${trip.progressPct}% Journey Done</span>
              <span>${trip.totalDistance} total</span>
            </div>
          </div>

          <!-- Telemetry Specs -->
          <div class="dashboard-grid-3" style="gap:12px;margin:20px 0;">
            <div style="background:var(--bg-input);padding:12px 14px;border-radius:var(--radius-sm);border:1px solid var(--border-light);">
              <div style="font-size:11px;color:var(--text-muted);font-weight:700;">ASSIGNED DRIVER</div>
              <div style="font-size:13.5px;font-weight:700;color:var(--text-heading);margin-top:2px;">${trip.driverName}</div>
              <a href="tel:${trip.driverPhone}" style="font-size:12px;color:var(--green-mid);font-weight:600;"><i data-lucide="phone-call" style="width:12px;height:12px;display:inline;"></i> ${trip.driverPhone}</a>
            </div>

            <div style="background:var(--bg-input);padding:12px 14px;border-radius:var(--radius-sm);border:1px solid var(--border-light);">
              <div style="font-size:11px;color:var(--text-muted);font-weight:700;">E-WAY BILL & FASTAG</div>
              <div style="font-size:13px;font-weight:700;color:var(--text-heading);margin-top:2px;">${trip.eWayBill}</div>
              <div style="font-size:11.5px;color:var(--amber-dark);">${trip.tollCrossed}</div>
            </div>

            <div style="background:var(--bg-input);padding:12px 14px;border-radius:var(--radius-sm);border:1px solid var(--border-light);">
              <div style="font-size:11px;color:var(--text-muted);font-weight:700;">COLD CHAIN / SENSORS</div>
              <div style="font-size:13.5px;font-weight:700;color:var(--text-heading);margin-top:2px;">${trip.reeferTemp}</div>
              <div style="font-size:11.5px;color:var(--status-success-text);">Telemetry: Live Synchronized</div>
            </div>
          </div>

          <!-- POD & Actions -->
          <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:16px;">
            <h4 style="font-size:14px;font-weight:700;margin-bottom:8px;"><i data-lucide="file-check" style="width:16px;height:16px;vertical-align:middle;color:var(--green-mid);"></i> Digital Proof of Delivery (POD)</h4>
            <p style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px;">Upon mandi gate arrival, ask the receiver to provide the 4-digit OTP or upload stamped weighbridge slip for instant 100% freight clearance.</p>
            
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <input type="text" class="form-input" id="podOtpInput" placeholder="Enter Receiver 4-Digit OTP" style="max-width:240px;">
              <button class="btn btn-amber btn-sm" onclick="verifyPodOtp('${trip.id}')"><i data-lucide="check" style="width:14px;height:14px;"></i> Verify POD OTP</button>
              <button class="btn btn-secondary btn-sm" onclick="showToast('Driver location ping sent via SMS & WhatsApp.')"><i data-lucide="send" style="width:14px;height:14px;"></i> Ping Driver</button>
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
  showToast(`🎉 POD OTP verified successfully for ${tripId}! Escrow freight payout ₹34,225 released to your wallet.`, 'success');
}

// =========================================================================
// ONBOARDING & VERIFICATION STEPPER CONTROLLER
// =========================================================================
let currentStep = 1;

function goToStep(stepNumber) {
  currentStep = stepNumber;
  
  // Update step nodes
  document.querySelectorAll('.step-node').forEach(node => {
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
    const pct = ((currentStep - 1) / 3) * 100;
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
  if (currentStep < 4) {
    goToStep(currentStep + 1);
  } else {
    showToast('🎉 Onboarding & Verification documents submitted! AI Verification status: APPROVED (Gold Carrier Badge Granted).', 'success');
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
    statusEl.innerHTML = `<span style="color:var(--amber-dark);font-size:12px;font-weight:700;"><i data-lucide="loader" style="width:14px;height:14px;display:inline;animation:spin 1s linear infinite;"></i> AI Verifying OCR...</span>`;
    if (window.lucide) lucide.createIcons();
    setTimeout(() => {
      statusEl.innerHTML = `<span style="color:var(--status-success-text);font-size:12px;font-weight:700;"><i data-lucide="check-circle" style="width:14px;height:14px;display:inline;"></i> Verified ✓ (Govt VAHAN / Sarathi Match)</span>`;
      if (window.lucide) lucide.createIcons();
      showToast('Document verified with Ministry of Road Transport & Highways database!', 'success');
    }, 1200);
  }
}

// Add Truck Modal Controller
function openAddVehicleModal() {
  const modalHtml = `
    <div class="modal-overlay show" id="addVehicleModal" onclick="if(event.target===this)closeModal('addVehicleModal')">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Register New Fleet Truck</h3>
          <button class="modal-close-btn" onclick="closeModal('addVehicleModal')">&times;</button>
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
            <label class="form-label">Upload RC Smart Card / Document</label>
            <div class="upload-dropzone" onclick="showToast('RC file attached successfully!')">
              <div class="upload-icon"><i data-lucide="upload-cloud"></i></div>
              <div style="font-size:13.5px;font-weight:700;">Drag & Drop or Click to browse RC Document</div>
              <div style="font-size:12px;color:var(--text-muted);">PDF, JPG, PNG up to 10MB</div>
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
  showToast(`🚛 Vehicle ${reg} onboarded successfully!`, 'success');
  if (typeof renderFleetTable === 'function') renderFleetTable();
}

// Add Driver Modal Controller
function openAddDriverModal() {
  const modalHtml = `
    <div class="modal-overlay show" id="addDriverModal" onclick="if(event.target===this)closeModal('addDriverModal')">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Onboard New Driver</h3>
          <button class="modal-close-btn" onclick="closeModal('addDriverModal')">&times;</button>
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
            <label class="form-label">Upload Driver License Scan</label>
            <div class="upload-dropzone" onclick="showToast('DL scan attached and SARATHI verified!')">
              <div class="upload-icon"><i data-lucide="id-card"></i></div>
              <div style="font-size:13.5px;font-weight:700;">Upload Front & Back Photo of Driving License</div>
              <div style="font-size:12px;color:var(--text-muted);">Instant Sarathi AI verification check</div>
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

// Withdraw Payout Modal Controller
function openWithdrawModal() {
  const modalHtml = `
    <div class="modal-overlay show" id="withdrawModal" onclick="if(event.target===this)closeModal('withdrawModal')">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Instant Settlement Withdrawal</h3>
          <button class="modal-close-btn" onclick="closeModal('withdrawModal')">&times;</button>
        </div>
        <div class="modal-body">
          <div style="background:#EDFAF2;border:1px solid #A8DEC0;border-radius:var(--radius-md);padding:16px;margin-bottom:20px;">
            <div style="font-size:12px;font-weight:700;color:var(--status-success-text);text-transform:uppercase;">Available Clear Balance</div>
            <div style="font-size:28px;font-weight:800;color:var(--green-primary);font-family:var(--font-display);">₹${TransporterData.earnings.walletBalance.toLocaleString()}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Transfers via Instant IMPS / UPI within 15 minutes.</div>
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Withdrawal Amount (₹)</label>
            <input type="number" class="form-input" id="withdrawAmount" value="${TransporterData.earnings.walletBalance}" max="${TransporterData.earnings.walletBalance}">
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Receiving Bank Account / UPI</label>
            <div style="padding:12px 14px;background:var(--bg-input);border:1px solid var(--border-light);border-radius:var(--radius-sm);">
              <div style="font-weight:700;font-size:13.5px;">${TransporterData.profile.bankDetails.accountName}</div>
              <div style="font-size:12px;color:var(--text-secondary);">${TransporterData.profile.bankDetails.bankName} · A/C: ${TransporterData.profile.bankDetails.accountNumber}</div>
              <div style="font-size:12px;color:var(--green-mid);font-weight:600;">IFSC: ${TransporterData.profile.bankDetails.ifsc} · UPI: ${TransporterData.profile.bankDetails.upiId}</div>
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
