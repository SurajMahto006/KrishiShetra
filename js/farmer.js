/**
 * KRISHISHETRA — FARMER JOURNEY CONTROLLER (Step 12B)
 * Complete implementation for:
 * 1. Farmer Profile Onboarding & Editing (api.farmer.*)
 * 2. Real Produce Lot Creation with dedicated Success Screen (api.lots.create)
 * 3. Real "My Lots" List, Status Filtering, Details, Edit & Cancel (api.lots.*)
 * 4. Marketplace Live Lot Feed Connection (api.market.getLots)
 */

const FarmerFlow = {
  profile: null,
  lots: [],
  currentFilter: 'all',
  selectedLot: null,

  async init() {
    // 1. Enforce Farmer Role Guard
    if (window.Auth && !window.Auth.requireRole('farmer')) {
      return;
    }

    // 2. Fetch Farmer Profile & Update UI
    await this.checkProfile();

    // 3. Page-specific initializers
    const path = window.location.pathname.toLowerCase();
    if (typeof this.initDashboard === 'function' && (path.endsWith('dashboard.html') || path.endsWith('/'))) {
      await this.initDashboard();
    } else if (typeof this.initLotsPage === 'function' && path.endsWith('lots.html')) {
      await this.initLotsPage();
    } else if (typeof this.initMarketPage === 'function' && path.endsWith('market.html')) {
      await this.initMarketPage();
    }

    // 4. Bind Global Modals and Buttons
    this.bindGlobalEvents();
  },

  /**
   * Check if Farmer Profile exists; if not, show onboarding banner
   */
  async checkProfile() {
    try {
      const res = await window.api.farmer.getProfile();
      if (res.success && res.profile) {
        this.profile = res.profile;
        this.updateProfileDisplay(res.profile);
        this.hideOnboardingBanner();
      } else {
        this.profile = null;
        this.showOnboardingBanner();
      }
    } catch (err) {
      console.warn('[FarmerFlow] Profile not found or network error:', err);
      this.profile = null;
      this.showOnboardingBanner();
    }
  },

  /**
   * Update header/dashboard details with real profile info
   */
  updateProfileDisplay(profile) {
    const locElem = document.getElementById('dash-location');
    if (locElem && (profile.village || profile.district || profile.state)) {
      const locStr = [profile.village, profile.district, profile.state].filter(Boolean).join(', ');
      locElem.innerHTML = `<i data-lucide="map-pin"></i> ${locStr}`;
    }

    const nameElem = document.getElementById('header-user-name');
    const user = window.Auth ? window.Auth.getUser() : null;
    if (nameElem && user && user.name) {
      nameElem.textContent = user.name.split(' ')[0];
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  },

  /**
   * Display Farmer Onboarding Banner if profile is missing
   */
  showOnboardingBanner() {
    let banner = document.getElementById('farmer-onboarding-banner');
    if (!banner) {
      const main = document.querySelector('main') || document.getElementById('dash-main');
      if (!main) return;

      banner = document.createElement('div');
      banner.id = 'farmer-onboarding-banner';
      banner.className = 'container';
      banner.innerHTML = `
        <div class="dash-onboarding-card" style="margin-top: 20px; background: linear-gradient(135deg, #12372A 0%, #1A4D3B 100%); border: 1px solid rgba(232, 185, 106, 0.4); border-radius: 16px; padding: 24px 30px; color: #FFFFFF; display: flex; align-items: center; justify-content: space-between; gap: 20px; box-shadow: 0 10px 25px rgba(18, 55, 42, 0.15); flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 18px; max-width: 680px;">
            <div style="width: 52px; height: 52px; border-radius: 14px; background: rgba(232, 185, 106, 0.2); display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0;">
              🌾
            </div>
            <div>
              <h3 style="font-size: 19px; font-weight: 700; color: #F5F4ED; margin: 0 0 6px 0;">Complete Your Farm Profile</h3>
              <p style="font-size: 13.5px; color: rgba(245, 244, 237, 0.82); margin: 0; line-height: 1.5;">
                Before creating your first produce lot, tell us about your farm, location, and cultivated crops to receive verified buyer inquiries and tailored market intelligence.
              </p>
            </div>
          </div>
          <button class="btn btn--primary" id="btn-banner-complete-profile" style="background: #E8B96A; color: #12372A; font-weight: 700; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; white-space: nowrap;">
            Complete Farm Profile →
          </button>
        </div>
      `;
      main.insertBefore(banner, main.firstChild);

      document.getElementById('btn-banner-complete-profile')?.addEventListener('click', () => {
        this.openFarmProfileModal(true);
      });
    } else {
      banner.style.display = 'block';
    }
  },

  hideOnboardingBanner() {
    const banner = document.getElementById('farmer-onboarding-banner');
    if (banner) banner.style.display = 'none';
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * FARMER PROFILE MODAL & CRUD
   * ═══════════════════════════════════════════════════════════════════════
   */
  openFarmProfileModal(isNew = false) {
    let overlay = document.getElementById('farm-profile-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'farm-profile-modal-overlay';
      overlay.className = 'dash-modal-overlay';
      overlay.innerHTML = `
        <div class="dash-modal" id="farm-profile-modal" style="max-width: 620px; max-height: 90vh; overflow-y: auto;">
          <div class="dash-modal__header">
            <div>
              <h3 id="farm-profile-modal-title" style="margin: 0; font-size: 18px;">${isNew ? '🌱 Complete Farmer Profile' : '✏️ Edit Farm Profile'}</h3>
              <span class="dash-crop-modal__sub" style="font-size: 12px; color: var(--ks-text-muted);">Verified information for buyer discovery & produce listings</span>
            </div>
            <button class="dash-modal__close" id="farm-profile-modal-close"><i data-lucide="x"></i></button>
          </div>
          <form class="dash-modal__form" id="farm-profile-form" style="padding: 20px 24px;">
            <div id="farm-profile-alert" style="display: none; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;"></div>

            <!-- Section 1: Basic Farm Info -->
            <div style="font-weight: 700; font-size: 13.5px; color: var(--ks-evergreen); margin-bottom: 10px;">1. Basic Farm Information</div>
            <div class="dash-form-row">
              <div class="dash-modal__field" style="flex: 2;">
                <label for="fp-farm-name">Farm / Land Name</label>
                <input type="text" id="fp-farm-name" class="dash-form-input" placeholder="e.g. Patil Organic Farms" required>
              </div>
              <div class="dash-modal__field" style="flex: 1;">
                <label for="fp-farmer-type">Farmer Type</label>
                <select id="fp-farmer-type" class="dash-filter-select">
                  <option value="individual">Individual</option>
                  <option value="farmer_group">Farmer Group</option>
                  <option value="fpo_member">FPO Member</option>
                </select>
              </div>
            </div>

            <div class="dash-form-row">
              <div class="dash-modal__field">
                <label for="fp-farm-size">Farm Size</label>
                <input type="number" id="fp-farm-size" class="dash-form-input" placeholder="e.g. 5" min="0.1" step="0.1" required>
              </div>
              <div class="dash-modal__field">
                <label for="fp-size-unit">Unit</label>
                <select id="fp-size-unit" class="dash-filter-select">
                  <option value="acre">Acre</option>
                  <option value="hectare">Hectare</option>
                  <option value="guntha">Guntha</option>
                </select>
              </div>
              <div class="dash-modal__field">
                <label for="fp-ownership">Ownership</label>
                <select id="fp-ownership" class="dash-filter-select">
                  <option value="owned">Owned</option>
                  <option value="leased">Leased</option>
                  <option value="shared">Shared</option>
                </select>
              </div>
            </div>

            <!-- Section 2: Location -->
            <div style="font-weight: 700; font-size: 13.5px; color: var(--ks-evergreen); margin: 18px 0 10px 0;">2. Farm Location</div>
            <div class="dash-form-row">
              <div class="dash-modal__field">
                <label for="fp-state">State</label>
                <input type="text" id="fp-state" class="dash-form-input" placeholder="e.g. Maharashtra" required>
              </div>
              <div class="dash-modal__field">
                <label for="fp-district">District</label>
                <input type="text" id="fp-district" class="dash-form-input" placeholder="e.g. Nashik" required>
              </div>
            </div>

            <div class="dash-form-row">
              <div class="dash-modal__field">
                <label for="fp-taluka">Taluka / Tehsil</label>
                <input type="text" id="fp-taluka" class="dash-form-input" placeholder="e.g. Niphad">
              </div>
              <div class="dash-modal__field">
                <label for="fp-village">Village</label>
                <input type="text" id="fp-village" class="dash-form-input" placeholder="e.g. Pimpalgaon">
              </div>
              <div class="dash-modal__field">
                <label for="fp-pincode">Pincode (6 digits)</label>
                <input type="text" id="fp-pincode" class="dash-form-input" placeholder="422209" maxlength="6" pattern="[1-9][0-9]{5}" required>
              </div>
            </div>

            <!-- Section 3: Crops Cultivated -->
            <div style="font-weight: 700; font-size: 13.5px; color: var(--ks-evergreen); margin: 18px 0 10px 0; display: flex; justify-content: space-between; align-items: center;">
              <span>3. Primary Crops Cultivated</span>
              <button type="button" class="btn btn--sm btn--secondary" id="btn-add-crop-row" style="font-size: 12px; padding: 4px 10px;">+ Add Crop</button>
            </div>
            <div id="fp-crops-container" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;">
              <!-- Dynamic crop rows inserted here -->
            </div>

            <!-- Section 4: Farming Methods & Irrigation -->
            <div style="font-weight: 700; font-size: 13.5px; color: var(--ks-evergreen); margin: 18px 0 10px 0;">4. Farming Details</div>
            <div class="dash-form-row">
              <div class="dash-modal__field">
                <label for="fp-irrigation">Irrigation Type</label>
                <select id="fp-irrigation" class="dash-filter-select">
                  <option value="drip">Drip Irrigation</option>
                  <option value="borewell">Borewell</option>
                  <option value="canal">Canal</option>
                  <option value="sprinkler">Sprinkler</option>
                  <option value="rainfed">Rainfed</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div class="dash-modal__field">
                <label for="fp-farming-method">Farming Method</label>
                <select id="fp-farming-method" class="dash-filter-select">
                  <option value="conventional">Conventional</option>
                  <option value="organic">Organic Certified</option>
                  <option value="natural">Natural / Zero Budget</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <button type="submit" class="btn btn--primary dash-modal__submit" id="btn-submit-farm-profile" style="margin-top: 20px; width: 100%;">
              <i data-lucide="check"></i> Save & Confirm Farm Profile
            </button>
          </form>
        </div>
      `;
      document.body.appendChild(overlay);

      // Event listeners
      overlay.querySelector('#farm-profile-modal-close').addEventListener('click', () => {
        overlay.classList.remove('active');
      });
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
      overlay.querySelector('#btn-add-crop-row').addEventListener('click', () => {
        this.addCropRow();
      });
      overlay.querySelector('#farm-profile-form').addEventListener('submit', (e) => {
        this.submitFarmProfile(e);
      });
    }

    // Populate existing profile data if editing
    this.populateFarmProfileForm(this.profile);
    overlay.classList.add('active');
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  },

  addCropRow(name = '', season = 'Rabi') {
    const container = document.getElementById('fp-crops-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'fp-crop-row';
    row.style.cssText = 'display: flex; gap: 8px; align-items: center;';
    row.innerHTML = `
      <input type="text" class="dash-form-input fp-crop-name" placeholder="Crop Name (e.g. Onion)" value="${name}" required style="flex: 2;">
      <select class="dash-filter-select fp-crop-season" style="flex: 1;">
        <option value="Kharif" ${season === 'Kharif' ? 'selected' : ''}>Kharif</option>
        <option value="Rabi" ${season === 'Rabi' ? 'selected' : ''}>Rabi</option>
        <option value="Zaid" ${season === 'Zaid' ? 'selected' : ''}>Zaid</option>
        <option value="Perennial" ${season === 'Perennial' ? 'selected' : ''}>Perennial</option>
      </select>
      <button type="button" class="btn btn--sm" style="background: rgba(220, 38, 38, 0.1); color: #dc2626; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(row);
  },

  populateFarmProfileForm(profile) {
    const p = profile || {};
    document.getElementById('fp-farm-name').value = p.farmName || '';
    document.getElementById('fp-farmer-type').value = p.farmerType || 'individual';
    document.getElementById('fp-farm-size').value = p.farmSize || '';
    document.getElementById('fp-size-unit').value = p.farmSizeUnit || 'acre';
    document.getElementById('fp-ownership').value = p.ownershipType || 'owned';
    document.getElementById('fp-state').value = p.state || 'Maharashtra';
    document.getElementById('fp-district').value = p.district || 'Pune';
    document.getElementById('fp-taluka').value = p.taluka || '';
    document.getElementById('fp-village').value = p.village || '';
    document.getElementById('fp-pincode').value = p.pincode || '';
    document.getElementById('fp-irrigation').value = p.irrigationType || 'drip';
    document.getElementById('fp-farming-method').value = p.farmingMethod || 'conventional';

    const container = document.getElementById('fp-crops-container');
    if (container) {
      container.innerHTML = '';
      if (Array.isArray(p.crops) && p.crops.length > 0) {
        p.crops.forEach(c => this.addCropRow(c.name, c.season));
      } else {
        this.addCropRow('Onion', 'Rabi');
        this.addCropRow('Wheat', 'Rabi');
      }
    }
  },

  async submitFarmProfile(e) {
    e.preventDefault();
    const alertBox = document.getElementById('farm-profile-alert');
    const submitBtn = document.getElementById('btn-submit-farm-profile');
    if (alertBox) alertBox.style.display = 'none';

    // Collect dynamic crops
    const crops = [];
    document.querySelectorAll('.fp-crop-row').forEach(row => {
      const name = row.querySelector('.fp-crop-name')?.value.trim();
      const season = row.querySelector('.fp-crop-season')?.value.trim();
      if (name) crops.push({ name, season });
    });

    const payload = {
      farmName: document.getElementById('fp-farm-name').value.trim(),
      farmerType: document.getElementById('fp-farmer-type').value,
      farmSize: parseFloat(document.getElementById('fp-farm-size').value) || 0,
      farmSizeUnit: document.getElementById('fp-size-unit').value,
      ownershipType: document.getElementById('fp-ownership').value,
      state: document.getElementById('fp-state').value.trim(),
      district: document.getElementById('fp-district').value.trim(),
      taluka: document.getElementById('fp-taluka').value.trim(),
      village: document.getElementById('fp-village').value.trim(),
      pincode: document.getElementById('fp-pincode').value.trim(),
      crops: crops,
      irrigationType: document.getElementById('fp-irrigation').value,
      farmingMethod: document.getElementById('fp-farming-method').value
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Saving farm profile...';

    try {
      let res;
      if (this.profile && this.profile.id) {
        res = await window.api.farmer.updateProfile(payload);
      } else {
        res = await window.api.farmer.createProfile(payload);
      }

      if (res.success && res.profile) {
        this.profile = res.profile;
        this.updateProfileDisplay(res.profile);
        this.hideOnboardingBanner();
        document.getElementById('farm-profile-modal-overlay')?.classList.remove('active');
        this.showToast('Farm profile saved successfully! ✓', 'success');
      } else {
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(220, 38, 38, 0.1)';
          alertBox.style.color = '#dc2626';
          alertBox.textContent = res.message || 'Failed to save farm profile.';
        }
      }
    } catch (err) {
      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.style.background = 'rgba(220, 38, 38, 0.1)';
        alertBox.style.color = '#dc2626';
        alertBox.textContent = 'Server connection error. Please try again.';
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="check"></i> Save & Confirm Farm Profile';
      if (window.lucide) window.lucide.createIcons();
    }
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * CREATE PRODUCE LOT MODAL & SUCCESS SCREEN
   * ═══════════════════════════════════════════════════════════════════════
   */
  openCreateLotModal() {
    // Check if farmer profile exists first!
    if (!this.profile) {
      this.showToast('Please complete your farm profile before creating a produce lot.', 'warning');
      this.openFarmProfileModal(true);
      return;
    }

    let overlay = document.getElementById('create-lot-modal-overlay');
    if (!overlay) return;

    // Prefill location from profile if available
    const locInput = document.getElementById('lot-location-input');
    if (locInput && this.profile) {
      const locStr = [this.profile.village, this.profile.district, this.profile.state].filter(Boolean).join(', ');
      locInput.value = locStr || 'Pune, Maharashtra';
    }

    // Set today's date as default harvest date
    const harvestInput = document.getElementById('lot-harvest-input');
    if (harvestInput && !harvestInput.value) {
      harvestInput.value = new Date().toISOString().split('T')[0];
    }

    overlay.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
  },

  async submitCreateLot(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('#btn-submit-lot') || form.querySelector('button[type="submit"]');

    const cropSelect = document.getElementById('lot-crop-select');
    const cropName = cropSelect ? cropSelect.options[cropSelect.selectedIndex].text : 'Onion';
    const qty = parseFloat(document.getElementById('lot-qty-input')?.value);
    const price = parseFloat(document.getElementById('lot-price-input')?.value);
    const gradeSelect = document.getElementById('lot-grade-select');
    let gradeVal = gradeSelect ? gradeSelect.value : 'A';
    // Normalize grade to backend enum: 'A', 'B', or 'C'
    if (gradeVal.includes('A') || gradeVal.toLowerCase().includes('export') || gradeVal.toLowerCase().includes('organic')) {
      gradeVal = 'A';
    } else if (gradeVal.includes('B')) {
      gradeVal = 'B';
    } else {
      gradeVal = 'C';
    }

    const harvestDate = document.getElementById('lot-harvest-input')?.value;
    const desc = document.getElementById('lot-desc-input')?.value.trim() || '';

    // Validation
    if (!qty || qty <= 0) {
      this.showToast('Please enter a valid quantity greater than 0', 'error');
      return;
    }
    if (!price || price <= 0) {
      this.showToast('Please enter a valid asking price greater than 0', 'error');
      return;
    }
    if (!harvestDate) {
      this.showToast('Please select a harvest date', 'error');
    const storageTypeVal = document.getElementById('lot-storage-type')?.value || 'farm';
    const storageDecisionVal = document.getElementById('lot-storage-decision')?.value || 'sell_now';

    const payload = {
      cropName: cropName,
      variety: desc ? desc.slice(0, 50) : `${cropName} Standard Variety`,
      quantity: qty,
      quantityUnit: 'quintal',
      askingPrice: price,
      priceUnit: 'quintal',
      harvestDate: harvestDate,
      qualityGrade: gradeVal,
      qualityNotes: desc,
      storageType: storageTypeVal,
      preferredStorageType: storageTypeVal,
      storageRequired: storageTypeVal !== 'farm',
      currentStorageStatus: storageTypeVal !== 'farm' ? 'stored_in_warehouse' : 'on_farm',
      sellNowOrHoldDecision: {
        recommendation: storageDecisionVal === 'store_and_hold' ? 'STORE_AND_HOLD' : 'SELL_NOW',
        calculatedAt: new Date()
      },
      storageLocation: this.profile ? `${this.profile.district || ''}, ${this.profile.state || ''}` : '',
      state: this.profile?.state || 'Maharashtra',
      district: this.profile?.district || 'Pune',
      taluka: this.profile?.taluka || '',
      village: this.profile?.village || '',
      pincode: this.profile?.pincode || '411001',
      status: 'active'
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Listing lot on marketplace...';
    }

    try {
      const res = await window.api.lots.create(payload);
      if (res.success && res.lot) {
        // Hide form modal
        document.getElementById('create-lot-modal-overlay')?.classList.remove('active');
        form.reset();

        // Show Dedicated Success Screen
        this.showLotCreatedSuccess(res.lot);

        // Refresh lots list
        await this.loadMyLots();
      } else {
        this.showToast(res.message || 'Unable to create produce lot.', 'error');
      }
    } catch (err) {
      this.showToast('Server connection error. Please try again.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="check"></i> Create & List Lot';
        if (window.lucide) window.lucide.createIcons();
      }
    }
  },

  /**
   * Display Dedicated Lot Creation Success Modal
   */
  showLotCreatedSuccess(lot) {
    let overlay = document.getElementById('lot-success-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lot-success-modal-overlay';
      overlay.className = 'dash-modal-overlay active';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="dash-modal" style="max-width: 480px; text-align: center; padding: 32px 24px;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: #E5F0E7; color: #12372A; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 16px;">
          ✓
        </div>
        <h2 style="font-size: 22px; font-weight: 700; color: #12372A; margin: 0 0 8px 0;">Produce Lot Created!</h2>
        <p style="font-size: 13.5px; color: #5B9A72; margin: 0 0 24px 0;">Your produce is now live and discoverable by verified buyers on KrishiShetra Marketplace.</p>

        <div style="background: #F5F4ED; border: 1px solid #E5E4DD; border-radius: 12px; padding: 18px 20px; text-align: left; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #DDD; padding-bottom: 10px; margin-bottom: 10px;">
            <span style="font-size: 12px; text-transform: uppercase; color: #777; font-weight: 600;">Lot ID</span>
            <span style="font-size: 14px; font-weight: 800; color: #12372A; font-family: monospace;">${lot.lotId}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13.5px;">
            <span style="color: #666;">Crop & Variety:</span>
            <strong style="color: #222;">${lot.cropName} (${lot.variety || 'Standard'})</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13.5px;">
            <span style="color: #666;">Quantity Listed:</span>
            <strong style="color: #222;">${lot.quantity} ${lot.quantityUnit || 'quintal'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13.5px;">
            <span style="color: #666;">Asking Price:</span>
            <strong style="color: #12372A;">₹${lot.askingPrice?.toLocaleString('en-IN')} / ${lot.priceUnit || 'quintal'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13.5px;">
            <span style="color: #666;">Status:</span>
            <span style="padding: 2px 8px; border-radius: 6px; background: #E5F0E7; color: #12372A; font-size: 11.5px; font-weight: 700; text-transform: uppercase;">${lot.status}</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px; flex-direction: column;">
          <div style="display: flex; gap: 10px;">
            <button class="btn btn--secondary" style="flex: 1;" onclick="FarmerFlow.viewLotDetails('${lot.lotId}'); document.getElementById('lot-success-modal-overlay').classList.remove('active');">
              View Lot Details
            </button>
            <button class="btn btn--primary" style="flex: 1;" onclick="document.getElementById('lot-success-modal-overlay').classList.remove('active'); FarmerFlow.openCreateLotModal();">
              + Create Another
            </button>
          </div>
          <a href="lots.html" class="btn btn--secondary" style="width: 100%; text-decoration: none; justify-content: center;">
            View All My Lots →
          </a>
        </div>
      </div>
    `;
    overlay.classList.add('active');
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * MY LOTS FEED, STATUS FILTERING & EMPTY STATES
   * ═══════════════════════════════════════════════════════════════════════
   */
  async loadMyLots(filter = 'all') {
    this.currentFilter = filter;
    const container = document.getElementById('lots-panel-body') || document.getElementById('farmer-lots-grid');
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 40px 20px; text-align: center; color: var(--ks-text-muted);">
        <div class="spinner" style="margin: 0 auto 12px auto; width: 28px; height: 28px; border: 3px solid #E5E4DD; border-top-color: var(--ks-evergreen); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        Loading your produce lots...
      </div>
    `;

    const isDev = window.Auth && typeof window.Auth.isLocalEnv === 'function' && window.Auth.isLocalEnv() && localStorage.getItem('krishishetra_dev_session');

    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      const res = await window.api.lots.getMine(params);

      if (res.success && Array.isArray(res.lots) && res.lots.length > 0) {
        this.lots = res.lots;
        this.renderLotsList(res.lots);
        this.updateStatsCounters(res.lots);
      } else if (res.success && Array.isArray(res.lots) && res.lots.length === 0) {
        if (isDev) {
          const demo = this.getDemoLots(filter);
          this.lots = demo;
          this.renderLotsList(demo);
          this.updateStatsCounters(demo);
        } else {
          this.lots = [];
          this.renderLotsList([]);
          this.updateStatsCounters([]);
        }
      } else {
        if (isDev) {
          const demo = this.getDemoLots(filter);
          this.lots = demo;
          this.renderLotsList(demo);
          this.updateStatsCounters(demo);
        } else {
          this.renderLotsError(container);
        }
      }
    } catch (err) {
      if (isDev) {
        const demo = this.getDemoLots(filter);
        this.lots = demo;
        this.renderLotsList(demo);
        this.updateStatsCounters(demo);
      } else {
        this.renderLotsError(container);
      }
    }
  },

  getDemoLots(filter = 'all') {
    const demo = [
      {
        lotId: 'LOT-2026-001',
        cropName: 'Wheat',
        variety: 'Lokwan (High Yield)',
        quantity: 25,
        quantityUnit: 'quintal',
        askingPrice: 3000,
        priceUnit: 'q',
        qualityGrade: 'A',
        district: 'Pune',
        state: 'Maharashtra',
        status: 'active',
        storageType: 'warehouse',
        storageFacilityName: 'MSWC Pune Warehouse',
        sellNowOrHoldDecision: 'STORE_AND_HOLD',
        harvestDate: '2026-08-15'
      },
      {
        lotId: 'LOT-2026-002',
        cropName: 'Onion',
        variety: 'Red Garwa',
        quantity: 12,
        quantityUnit: 'quintal',
        askingPrice: 2800,
        priceUnit: 'q',
        qualityGrade: 'A',
        district: 'Nashik',
        state: 'Maharashtra',
        status: 'active',
        storageType: 'cold_storage',
        storageFacilityName: 'Sahyadri Agro Cold Chain',
        sellNowOrHoldDecision: 'STORE_AND_HOLD',
        harvestDate: '2026-08-20'
      },
      {
        lotId: 'LOT-2026-003',
        cropName: 'Rice',
        variety: 'Basmati Long Grain',
        quantity: 25,
        quantityUnit: 'quintal',
        askingPrice: 3800,
        priceUnit: 'q',
        qualityGrade: 'A',
        district: 'Pune',
        state: 'Maharashtra',
        status: 'draft',
        storageType: 'farm',
        harvestDate: '2026-08-10'
      }
    ];
    if (filter === 'all') return demo;
    if (filter === 'stored') {
      return demo.filter(l => l.storageType === 'warehouse' || l.storageType === 'cold_storage' || l.storageRequired);
    }
    return demo.filter(l => l.status === filter);
  },

  renderLotsError(container) {
    if (!container) return;
    container.innerHTML = `
      <div style="padding: 40px 24px; text-align: center; background: #FAF9F5; border-radius: 12px; border: 1px dashed #DDD;">
        <div style="font-size: 36px; margin-bottom: 10px;">🌾</div>
        <h4 style="font-size: 15px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">Unable to load lots from database</h4>
        <p style="font-size: 13px; color: var(--ks-text-muted); margin: 0 0 16px 0;">We couldn't connect to the produce database. Please check your connection and try again.</p>
        <button class="btn btn--sm btn--primary" onclick="FarmerFlow.loadMyLots('${this.currentFilter || 'all'}')">
          Try Again
        </button>
      </div>
    `;
  },

  renderLotsList(lots) {
    const container = document.getElementById('lots-panel-body') || document.getElementById('farmer-lots-grid');
    if (!container) return;

    if (!lots || lots.length === 0) {
      container.innerHTML = `
        <div style="padding: 48px 24px; text-align: center; background: #FAF9F5; border-radius: 12px; border: 1px dashed #DDD;">
          <div style="font-size: 38px; margin-bottom: 12px;">📦</div>
          <h4 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 6px 0;">No produce lots found</h4>
          <p style="font-size: 13px; color: var(--ks-text-muted); margin: 0 0 18px 0;">
            ${this.currentFilter === 'all' ? 'You have not listed any produce lots yet. Create your first lot to start receiving buyer offers.' : `No lots with status '${this.currentFilter}'.`}
          </p>
          <button class="btn btn--primary btn--sm" onclick="FarmerFlow.openCreateLotModal()">
            <i data-lucide="plus-circle"></i> + Create Produce Lot
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const cropIcon = (name = '') => {
      const n = name.toLowerCase();
      if (n.includes('onion')) return '🧅';
      if (n.includes('wheat')) return '🌾';
      if (n.includes('rice')) return '🌾';
      if (n.includes('potato')) return '🥔';
      if (n.includes('tomato')) return '🍅';
      if (n.includes('soybean')) return '🫘';
      if (n.includes('maize')) return '🌽';
      if (n.includes('chilli')) return '🌶️';
      if (n.includes('groundnut')) return '🥜';
      if (n.includes('cotton')) return '☁️';
      if (n.includes('sugarcane')) return '🎋';
      if (n.includes('mango')) return '🥭';
      if (n.includes('banana')) return '🍌';
      if (n.includes('grapes')) return '🍇';
      if (n.includes('pulses')) return '🥣';
      return '🌾';
    };

    const statusBadge = (status, storageType) => {
      if (storageType === 'warehouse') {
        return `<span style="padding: 4px 10px; border-radius: 8px; background: #E8F5E9; color: #2E7D32; font-size: 12px; font-weight: 800;">🏬 Stored in Warehouse</span>`;
      }
      if (storageType === 'cold_storage') {
        return `<span style="padding: 4px 10px; border-radius: 8px; background: #E1F5FE; color: #0288D1; font-size: 12px; font-weight: 800;">❄️ Cold Storage</span>`;
      }
      if (status === 'active') {
        return `<span style="padding: 4px 10px; border-radius: 8px; background: #E8F5E9; color: #12372A; font-size: 12px; font-weight: 800; border: 1px solid #C8E6C9;">🟢 Active for Sale</span>`;
      }
      if (status === 'draft') {
        return `<span style="padding: 4px 10px; border-radius: 8px; background: #FEF3C7; color: #92400E; font-size: 12px; font-weight: 800;">📝 Draft</span>`;
      }
      if (status === 'sold') {
        return `<span style="padding: 4px 10px; border-radius: 8px; background: #DBEAFE; color: #1E40AF; font-size: 12px; font-weight: 800;">✓ Sold</span>`;
      }
      return `<span style="padding: 4px 10px; border-radius: 8px; background: #F5F4ED; color: #666; font-size: 12px; font-weight: 700;">${status}</span>`;
    };

    container.innerHTML = lots.map(lot => `
      <div class="kisan-lot-card">
        <div class="kisan-lot-card__left">
          <div class="kisan-lot-card__icon">
            ${cropIcon(lot.cropName)}
          </div>
          <div class="kisan-lot-card__details">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
              <span style="font-family: monospace; font-size: 12px; color: #777; font-weight: 700;">${lot.lotId}</span>
              ${statusBadge(lot.status, lot.storageType)}
            </div>
            <h4>${lot.cropName} <span style="font-size: 13.5px; font-weight: 500; color: #666;">(${lot.variety || 'Standard Grade'})</span></h4>
            <p>
              <strong>${lot.quantity} ${lot.quantityUnit || 'quintal'}</strong> • Grade: <strong>Grade ${lot.qualityGrade || 'A'}</strong> • 📍 ${lot.district || 'Pune'}, ${lot.state || 'Maharashtra'}
            </p>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
          <div style="text-align: right;">
            <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700;">Asking Price</div>
            <div class="kisan-lot-card__price-tag">
              ₹${lot.askingPrice?.toLocaleString('en-IN')} <span style="font-size: 12px; font-weight: 500; color: #555;">/ ${lot.priceUnit || 'quintal'}</span>
            </div>
          </div>

          <div class="kisan-lot-card__actions">
            ${lot.status === 'active' || lot.status === 'draft' ? `
              <button class="btn btn--secondary" onclick="FarmerFlow.openEditLotModal('${lot.lotId}')" title="Edit Lot" style="min-height: 48px; padding: 10px 14px;">
                <i data-lucide="edit-3"></i>
              </button>
              <button class="btn" style="min-height: 48px; padding: 10px 14px; background: #FEE2E2; color: #991B1B; border: none; border-radius: 10px; cursor: pointer;" onclick="FarmerFlow.confirmCancelLot('${lot.lotId}')" title="Delete Lot">
                <i data-lucide="trash-2"></i>
              </button>
            ` : ''}
            <button class="btn btn--primary kisan-lot-card__btn" onclick="FarmerFlow.viewLotOffers('${lot.lotId}')" style="background: #12372A; border-color: #12372A; min-height: 48px; padding: 10px 18px; font-weight: 800;">
              <i data-lucide="handshake"></i> <span>Sell & View Offers</span>
            </button>
            <a href="storage.html?crop=${encodeURIComponent(lot.cropName)}&qty=${lot.quantity}&price=${lot.askingPrice}" class="btn btn--secondary kisan-lot-card__btn" style="min-height: 48px; padding: 10px 18px; font-weight: 700; border-color: #D8C28A; color: #12372A;">
              <i data-lucide="warehouse"></i> <span>Storage Options</span>
            </a>
            <button class="btn btn--secondary" onclick="FarmerFlow.viewLotDetails('${lot.lotId}')" title="View Details" style="min-height: 48px; padding: 10px 14px;">
              <i data-lucide="eye"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  updateStatsCounters(lots) {
    const activeLots = lots.filter(l => l.status === 'active');
    const statLotsVal = document.getElementById('stat-lots-val');
    const statLotsSub = document.getElementById('stat-lots-sub');

    if (statLotsVal) {
      statLotsVal.textContent = activeLots.length;
    }
    if (statLotsSub) {
      const distinctCrops = new Set(activeLots.map(l => l.cropName)).size;
      statLotsSub.textContent = `${distinctCrops} crop${distinctCrops === 1 ? '' : 's'} currently listed`;
    }
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * LOT DETAILS MODAL
   * ═══════════════════════════════════════════════════════════════════════
   */
  async viewLotDetails(lotId) {
    let overlay = document.getElementById('lot-detail-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lot-detail-modal-overlay';
      overlay.className = 'dash-modal-overlay active';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="dash-modal" style="max-width: 540px;">
        <div class="dash-modal__header">
          <div>
            <h3 style="margin: 0;">Lot Details</h3>
            <span style="font-family: monospace; font-size: 13px; color: var(--ks-gold); font-weight: 700;">${lotId}</span>
          </div>
          <button class="dash-modal__close" onclick="document.getElementById('lot-detail-modal-overlay').classList.remove('active')"><i data-lucide="x"></i></button>
        </div>
        <div class="dash-modal__body-pad" id="lot-detail-modal-content">
          <div style="padding: 30px; text-align: center;">Loading lot details...</div>
        </div>
      </div>
    `;
    overlay.classList.add('active');

    try {
      const res = await window.api.lots.getById(lotId);
      if (res.success && res.lot) {
        const lot = res.lot;
        const harvestStr = lot.harvestDate ? new Date(lot.harvestDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
        const content = document.getElementById('lot-detail-modal-content');

        content.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
            <div style="background: #F5F4ED; padding: 12px 14px; border-radius: 8px;">
              <div style="font-size: 11px; text-transform: uppercase; color: #777;">Crop & Variety</div>
              <div style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin-top: 2px;">${lot.cropName} (${lot.variety || 'Standard'})</div>
            </div>
            <div style="background: #F5F4ED; padding: 12px 14px; border-radius: 8px;">
              <div style="font-size: 11px; text-transform: uppercase; color: #777;">Quantity Listed</div>
              <div style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin-top: 2px;">${lot.quantity} ${lot.quantityUnit || 'quintal'}</div>
            </div>
            <div style="background: #F5F4ED; padding: 12px 14px; border-radius: 8px;">
              <div style="font-size: 11px; text-transform: uppercase; color: #777;">Asking Price</div>
              <div style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin-top: 2px;">₹${lot.askingPrice?.toLocaleString('en-IN')} / ${lot.priceUnit || 'q'}</div>
            </div>
            <div style="background: #F5F4ED; padding: 12px 14px; border-radius: 8px;">
              <div style="font-size: 11px; text-transform: uppercase; color: #777;">Quality Grade</div>
              <div style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin-top: 2px;">Grade ${lot.qualityGrade || 'A'}</div>
            </div>
            <div style="background: #F5F4ED; padding: 12px 14px; border-radius: 8px;">
              <div style="font-size: 11px; text-transform: uppercase; color: #777;">Harvest Date</div>
              <div style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin-top: 2px;">${harvestStr}</div>
            </div>
            <div style="background: #F5F4ED; padding: 12px 14px; border-radius: 8px;">
              <div style="font-size: 11px; text-transform: uppercase; color: #777;">Status</div>
              <div style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin-top: 2px; text-transform: uppercase;">${lot.status}</div>
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--ks-evergreen); margin-bottom: 4px;">Storage & Location</div>
            <div style="font-size: 13.5px; color: #444;">Storage: ${lot.storageType || 'Farm Storage'} · ${lot.village || ''} ${lot.taluka || ''} ${lot.district || 'Pune'}, ${lot.state || 'Maharashtra'} (${lot.pincode || ''})</div>
          </div>

          ${lot.qualityNotes ? `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--ks-evergreen); margin-bottom: 4px;">Quality Notes & Description</div>
              <div style="font-size: 13px; color: #555; background: #FAF9F5; padding: 10px 12px; border-radius: 6px; border: 1px solid #EEE;">${lot.qualityNotes}</div>
            </div>
          ` : ''}

          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; flex-wrap: wrap;">
            <button class="btn btn--secondary" onclick="document.getElementById('lot-detail-modal-overlay').classList.remove('active')">Close</button>
            ${window.Auth && window.Auth.getRole() === 'buyer' && lot.status === 'active' ? `
              <button class="btn btn--primary" style="background: #E8B96A; color: #12372A; font-weight: 700;" onclick="document.getElementById('lot-detail-modal-overlay').classList.remove('active'); window.location.href='buyer.html#/buyer/marketplace';">
                Send Purchase Inquiry →
              </button>
            ` : (!window.Auth || !window.Auth.isAuthenticated()) ? `
              <a href="login.html" class="btn btn--primary" style="text-decoration: none;">
                Login to Send Inquiry →
              </a>
            ` : (lot.status === 'active' || lot.status === 'draft') ? `
              <button class="btn btn--primary" onclick="document.getElementById('lot-detail-modal-overlay').classList.remove('active'); FarmerFlow.openEditLotModal('${lot.lotId}')">Edit Lot</button>
            ` : ''}
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
      }
    } catch (err) {
      document.getElementById('lot-detail-modal-content').innerHTML = `
        <div style="padding: 20px; text-align: center; color: #dc2626;">Unable to load lot details.</div>
      `;
    }
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * EDIT PRODUCE LOT MODAL
   * ═══════════════════════════════════════════════════════════════════════
   */
  async openEditLotModal(lotId) {
    let overlay = document.getElementById('edit-lot-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'edit-lot-modal-overlay';
      overlay.className = 'dash-modal-overlay';
      document.body.appendChild(overlay);
    }

    try {
      const res = await window.api.lots.getById(lotId);
      if (!res.success || !res.lot) {
        this.showToast('Unable to load lot for editing.', 'error');
        return;
      }
      const lot = res.lot;

      if (lot.status === 'sold') {
        this.showToast('This lot has already been sold and cannot be edited.', 'warning');
        return;
      }

      overlay.innerHTML = `
        <div class="dash-modal" style="max-width: 500px;">
          <div class="dash-modal__header">
            <div>
              <h3 style="margin: 0;">Edit Produce Lot</h3>
              <span style="font-family: monospace; font-size: 12px; color: var(--ks-gold);">${lot.lotId} — ${lot.cropName}</span>
            </div>
            <button class="dash-modal__close" onclick="document.getElementById('edit-lot-modal-overlay').classList.remove('active')"><i data-lucide="x"></i></button>
          </div>
          <form class="dash-modal__form" id="edit-lot-form" style="padding: 20px 24px;">
            <div class="dash-form-row">
              <div class="dash-modal__field">
                <label for="edit-lot-qty">Quantity (${lot.quantityUnit || 'quintal'})</label>
                <input type="number" id="edit-lot-qty" class="dash-form-input" value="${lot.quantity}" min="0.1" step="0.1" required>
              </div>
              <div class="dash-modal__field">
                <label for="edit-lot-price">Asking Price (₹ / ${lot.priceUnit || 'q'})</label>
                <input type="number" id="edit-lot-price" class="dash-form-input" value="${lot.askingPrice}" min="1" required>
              </div>
            </div>

            <div class="dash-form-row">
              <div class="dash-modal__field">
                <label for="edit-lot-grade">Quality Grade</label>
                <select id="edit-lot-grade" class="dash-filter-select">
                  <option value="A" ${lot.qualityGrade === 'A' ? 'selected' : ''}>Grade A (Premium)</option>
                  <option value="B" ${lot.qualityGrade === 'B' ? 'selected' : ''}>Grade B (Standard)</option>
                  <option value="C" ${lot.qualityGrade === 'C' ? 'selected' : ''}>Grade C</option>
                </select>
              </div>
              <div class="dash-modal__field">
                <label for="edit-lot-status">Status</label>
                <select id="edit-lot-status" class="dash-filter-select">
                  <option value="active" ${lot.status === 'active' ? 'selected' : ''}>Active (Marketplace)</option>
                  <option value="draft" ${lot.status === 'draft' ? 'selected' : ''}>Draft</option>
                </select>
              </div>
            </div>

            <div class="dash-modal__field">
              <label for="edit-lot-notes">Quality Notes / Variety</label>
              <textarea id="edit-lot-notes" class="dash-form-textarea" rows="2">${lot.qualityNotes || lot.variety || ''}</textarea>
            </div>

            <button type="submit" class="btn btn--primary dash-modal__submit" id="btn-save-edit-lot" style="width: 100%; margin-top: 14px;">
              <i data-lucide="check"></i> Save Lot Changes
            </button>
          </form>
        </div>
      `;

      overlay.classList.add('active');
      if (window.lucide) window.lucide.createIcons();

      overlay.querySelector('#edit-lot-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = overlay.querySelector('#btn-save-edit-lot');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Saving changes...';

        const payload = {
          quantity: parseFloat(document.getElementById('edit-lot-qty').value),
          askingPrice: parseFloat(document.getElementById('edit-lot-price').value),
          qualityGrade: document.getElementById('edit-lot-grade').value,
          status: document.getElementById('edit-lot-status').value,
          qualityNotes: document.getElementById('edit-lot-notes').value.trim()
        };

        try {
          const updateRes = await window.api.lots.update(lot.lotId, payload);
          if (updateRes.success) {
            overlay.classList.remove('active');
            this.showToast('Produce lot updated successfully! ✓', 'success');
            await this.loadMyLots(this.currentFilter);
          } else {
            this.showToast(updateRes.message || 'Failed to update lot.', 'error');
          }
        } catch (err) {
          this.showToast('Server error while updating lot.', 'error');
        } finally {
          submitBtn.disabled = false;
        }
      });
    } catch (err) {
      this.showToast('Unable to open edit lot modal.', 'error');
    }
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * CANCEL PRODUCE LOT (Soft Cancel)
   * ═══════════════════════════════════════════════════════════════════════
   */
  async confirmCancelLot(lotId) {
    let overlay = document.getElementById('cancel-lot-confirm-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'cancel-lot-confirm-overlay';
      overlay.className = 'dash-modal-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="dash-modal" style="max-width: 440px; text-align: center; padding: 28px 24px;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: #FEE2E2; color: #dc2626; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 14px;">
          ⚠️
        </div>
        <h3 style="font-size: 18px; font-weight: 700; color: #12372A; margin: 0 0 8px 0;">Cancel Produce Lot?</h3>
        <p style="font-size: 13.5px; color: #666; margin: 0 0 20px 0; line-height: 1.5;">
          Are you sure you want to cancel <strong>${lotId}</strong>? This lot will no longer appear for buyer discovery on the marketplace.
        </p>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn--secondary" style="flex: 1;" onclick="document.getElementById('cancel-lot-confirm-overlay').classList.remove('active')">
            Keep Lot
          </button>
          <button class="btn" style="flex: 1; background: #dc2626; color: #FFFFFF; font-weight: 700; border: none; border-radius: 8px; cursor: pointer;" id="btn-do-cancel-lot">
            Cancel Lot
          </button>
        </div>
      </div>
    `;

    overlay.classList.add('active');

    overlay.querySelector('#btn-do-cancel-lot').addEventListener('click', async () => {
      const btn = overlay.querySelector('#btn-do-cancel-lot');
      btn.disabled = true;
      btn.textContent = 'Cancelling...';

      try {
        const res = await window.api.lots.cancel(lotId);
        if (res.success) {
          overlay.classList.remove('active');
          this.showToast(`Lot ${lotId} has been cancelled.`, 'success');
          await this.loadMyLots(this.currentFilter);
        } else {
          this.showToast(res.message || 'Failed to cancel lot.', 'error');
        }
      } catch (err) {
        this.showToast('Server error while cancelling lot.', 'error');
      }
    });
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * RECEIVED BUYER INQUIRIES & NEGOTIATION (Farmer Side)
   * ═══════════════════════════════════════════════════════════════════════
   */
  async loadReceivedInquiries() {
    const container = document.getElementById('offers-panel-body') || document.getElementById('farmer-offers-container');
    const badgeCount = document.getElementById('stat-offers-val');

    try {
      const res = await window.api.inquiries.getFarmer();
      if (res.success && Array.isArray(res.inquiries)) {
        if (badgeCount) badgeCount.textContent = res.inquiries.length;

        if (!container) return;

        if (res.inquiries.length === 0) {
          container.innerHTML = `
            <div style="padding: 32px 16px; text-align: center; color: var(--ks-text-muted);">
              <div style="font-size: 28px; margin-bottom: 8px;">📬</div>
              <p style="font-size: 13px; margin: 0;">No buyer offers received yet. When verified buyers inquire about your lots, they will appear here.</p>
            </div>
          `;
          return;
        }

        container.innerHTML = res.inquiries.map(inq => {
          const s = inq.status || 'pending';
          const isPending = s === 'pending' || s === 'negotiating';
          return `
            <div class="dash-offer-card" style="background: #FFFFFF; border: 1px solid var(--border-light, #E5E4DD); border-radius: 10px; padding: 14px 16px; margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-family: monospace; font-size: 11.5px; color: #888; font-weight: 600;">Lot: ${inq.lotId}</span>
                <span style="padding: 2px 6px; border-radius: 4px; background: ${s === 'accepted' ? '#E5F0E7' : s === 'rejected' ? '#FEE2E2' : '#FEF3C7'}; color: ${s === 'accepted' ? '#12372A' : s === 'rejected' ? '#991B1B' : '#92400E'}; font-size: 10.5px; font-weight: 700; text-transform: uppercase;">${s}</span>
              </div>
              <h4 style="font-size: 14.5px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 2px 0;">${inq.crop}</h4>
              <div style="font-size: 12.5px; color: #555; margin-bottom: 8px;">
                Buyer Offered: <strong>₹${inq.offeredPrice?.toLocaleString('en-IN')}/q</strong> for <strong>${inq.quantityRequired} quintals</strong> • ${inq.buyerName || 'Verified Buyer'}
              </div>
              ${isPending ? `
                <div style="display: flex; gap: 6px;">
                  <button class="btn btn--sm btn--primary" style="padding: 4px 10px; font-size: 12px;" onclick="FarmerFlow.farmerAcceptInquiry('${inq.inquiryId}')">
                    Accept Deal
                  </button>
                  <button class="btn btn--sm btn--secondary" style="padding: 4px 10px; font-size: 12px;" onclick="FarmerFlow.farmerCounterInquiry('${inq.inquiryId}', ${inq.offeredPrice}, ${inq.quantityRequired})">
                    Counter
                  </button>
                  <button class="btn btn--sm" style="background: rgba(220, 38, 38, 0.08); color: #dc2626; border: none; padding: 4px 10px; border-radius: 6px; font-size: 12px; cursor: pointer;" onclick="FarmerFlow.farmerRejectInquiry('${inq.inquiryId}')">
                    Reject
                  </button>
                </div>
              ` : ''}
            </div>
          `;
        }).join('');
      }
    } catch (err) {
      console.warn('[Farmer Inquiries Error]:', err);
    }
  },

  async farmerAcceptInquiry(inquiryId) {
    if (!confirm('Accept this buyer offer? The buyer will be authorized to confirm the purchase order.')) return;

    try {
      const res = await window.api.inquiries.updateStatus(inquiryId, 'accepted');
      if (res.success) {
        this.showToast('Inquiry accepted! Buyer can now confirm order. ✓', 'success');
        await this.loadReceivedInquiries();
      } else {
        this.showToast(res.message || 'Failed to accept inquiry.', 'error');
      }
    } catch (err) {
      this.showToast('Server error.', 'error');
    }
  },

  async farmerRejectInquiry(inquiryId) {
    if (!confirm('Reject this buyer inquiry?')) return;

    try {
      const res = await window.api.inquiries.updateStatus(inquiryId, 'rejected');
      if (res.success) {
        this.showToast('Inquiry rejected.', 'info');
        await this.loadReceivedInquiries();
      } else {
        this.showToast(res.message || 'Failed to reject inquiry.', 'error');
      }
    } catch (err) {
      this.showToast('Server error.', 'error');
    }
  },

  async farmerCounterInquiry(inquiryId, currentPrice, currentQty) {
    const newPrice = prompt(`Enter your counter price in ₹/quintal:`, currentPrice);
    if (!newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0) return;

    try {
      const res = await window.api.inquiries.sendOffer(inquiryId, {
        offeredPrice: parseFloat(newPrice),
        quantityRequired: currentQty,
        message: 'Counter offer from farmer'
      });
      if (res.success) {
        this.showToast('Counter offer sent to buyer! ✓', 'success');
        await this.loadReceivedInquiries();
      } else {
        this.showToast(res.message || 'Failed to send counter offer.', 'error');
      }
    } catch (err) {
      this.showToast('Server error.', 'error');
    }
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * PAGE-SPECIFIC INITIALIZATIONS
   * ═══════════════════════════════════════════════════════════════════════
   */
  async initDashboard() {
    await this.loadMyLots('all');
    await this.loadReceivedInquiries();
  },

  async initLotsPage() {
    await this.loadReceivedInquiries();
    // Add Filter Chips to lots.html if not already present
    const header = document.querySelector('.dash-section__header');
    if (header && !document.getElementById('lots-status-filters')) {
      const filterWrap = document.createElement('div');
      filterWrap.id = 'lots-status-filters';
      filterWrap.style.cssText = 'display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap;';
      filterWrap.innerHTML = `
        <button class="btn btn--sm btn--primary lot-filter-btn" data-status="all">All Lots</button>
        <button class="btn btn--sm btn--secondary lot-filter-btn" data-status="active">Active</button>
        <button class="btn btn--sm btn--secondary lot-filter-btn" data-status="draft">Draft</button>
        <button class="btn btn--sm btn--secondary lot-filter-btn" data-status="sold">Sold</button>
        <button class="btn btn--sm btn--secondary lot-filter-btn" data-status="cancelled">Cancelled</button>
      `;
      header.parentNode.insertBefore(filterWrap, header.nextSibling);

      filterWrap.querySelectorAll('.lot-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          filterWrap.querySelectorAll('.lot-filter-btn').forEach(b => {
            b.classList.remove('btn--primary');
            b.classList.add('btn--secondary');
          });
          btn.classList.add('btn--primary');
          btn.classList.remove('btn--secondary');
          this.loadMyLots(btn.dataset.status);
        });
      });
    }

    await this.loadMyLots('all');
  },

  async initMarketPage() {
    // Render live lots on marketplace page if container is present
    const liveFeed = document.getElementById('market-live-lots-grid') || document.getElementById('market-grid');
    if (!liveFeed) return;

    try {
      const res = await window.api.market.getLots({ limit: 12, sortBy: 'newest' });
      if (res.success && Array.isArray(res.lots) && res.lots.length > 0) {
        // Prepend real marketplace lots section
        const existingContainer = document.getElementById('real-marketplace-lots-section');
        if (!existingContainer) {
          const section = document.createElement('div');
          section.id = 'real-marketplace-lots-section';
          section.style.cssText = 'margin-bottom: 32px;';
          section.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <h3 style="font-size: 20px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">Active Farmer Produce Lots</h3>
                <p style="font-size: 13px; color: var(--ks-text-muted); margin: 0;">Direct farm-gate lots available for purchase and procurement</p>
              </div>
              <span style="font-size: 12px; font-weight: 700; background: #E5F0E7; color: #12372A; padding: 4px 10px; border-radius: 6px;">${res.lots.length} Live Lots</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
              ${res.lots.map(lot => `
                <div style="background: #FFFFFF; border: 1px solid var(--border-light, #E5E4DD); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-family: monospace; font-size: 11.5px; color: #888; font-weight: 600;">${lot.lotId}</span>
                      <span style="padding: 2px 8px; border-radius: 6px; background: #E5F0E7; color: #12372A; font-size: 11px; font-weight: 700;">GRADE ${lot.qualityGrade || 'A'}</span>
                    </div>
                    <h4 style="font-size: 16px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">${lot.cropName}</h4>
                    <p style="font-size: 12.5px; color: #666; margin: 0 0 12px 0;">${lot.variety || 'Standard Variety'} • ${lot.district || 'Pune'}, ${lot.state || 'Maharashtra'}</p>
                    <div style="background: #F5F4ED; border-radius: 8px; padding: 10px 12px; margin-bottom: 14px;">
                      <div style="font-size: 11px; color: #777;">Quantity Available</div>
                      <div style="font-size: 15px; font-weight: 700; color: #222;">${lot.quantity} ${lot.quantityUnit || 'quintal'}</div>
                    </div>
                  </div>
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #EEE; padding-top: 10px; margin-bottom: 12px;">
                      <span style="font-size: 11.5px; color: #777;">Asking Price</span>
                      <span style="font-size: 16px; font-weight: 800; color: var(--ks-evergreen);">₹${lot.askingPrice?.toLocaleString('en-IN')}<span style="font-size: 11px; font-weight: 400;"> / ${lot.priceUnit || 'q'}</span></span>
                    </div>
                    <button class="btn btn--primary btn--sm" style="width: 100%; justify-content: center;" onclick="FarmerFlow.viewLotDetails('${lot.lotId}')">
                      View Lot Specifications
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
          liveFeed.parentNode.insertBefore(section, liveFeed);
        }
      }
    } catch (err) {
      console.warn('[Marketplace Live Feed]:', err);
    }
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * GLOBAL EVENT HANDLERS & TOASTS
   * ═══════════════════════════════════════════════════════════════════════
   */
  bindGlobalEvents() {
    // 1. Sell Crop buttons
    document.querySelectorAll('#btn-sell-crop, #action-sell, #btn-create-lot, #btn-create-lot-page, #btn-sell-now').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openCreateLotModal();
      });
    });

    // 2. Create Lot Form submission
    const createLotForm = document.getElementById('create-lot-form');
    if (createLotForm) {
      createLotForm.addEventListener('submit', (e) => this.submitCreateLot(e));
    }

    // 3. Edit Profile in dropdown
    const menuProfile = document.getElementById('menu-profile');
    if (menuProfile) {
      menuProfile.addEventListener('click', (e) => {
        e.preventDefault();
        this.openFarmProfileModal(false);
      });
    }
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 99999; display: flex; flex-direction: column; gap: 8px;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bg = type === 'success' ? '#12372A' : type === 'error' ? '#dc2626' : type === 'warning' ? '#d97706' : '#2563eb';
    toast.style.cssText = `background: ${bg}; color: #FFFFFF; padding: 12px 20px; border-radius: 8px; font-size: 13.5px; font-weight: 600; box-shadow: 0 6px 20px rgba(0,0,0,0.2); opacity: 0; transform: translateY(10px); transition: all 0.3s ease;`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

window.FarmerFlow = FarmerFlow;

window.filterLotTab = function(filter) {
  document.querySelectorAll('.dash-lot-tab').forEach(btn => {
    btn.classList.remove('active');
    btn.style.background = '#FFF';
    btn.style.color = '#444';
    btn.style.border = '1px solid #DDD';
    btn.style.fontWeight = '600';
  });

  const activeBtn = document.getElementById(`tab-lot-${filter}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.background = 'var(--ks-evergreen, #12372A)';
    activeBtn.style.color = '#FFF';
    activeBtn.style.border = 'none';
    activeBtn.style.fontWeight = '700';
  }

  const titleElem = document.getElementById('lots-panel-title');
  if (titleElem) {
    if (filter === 'stored') titleElem.textContent = '🏬 Stored & Warehouse Lots (Storage Linkages)';
    else if (filter === 'active') titleElem.textContent = '🌾 Active Farm Lots';
    else titleElem.textContent = 'My Active Produce Lots';
  }

  FarmerFlow.loadMyLots(filter);
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  FarmerFlow.init();
});
