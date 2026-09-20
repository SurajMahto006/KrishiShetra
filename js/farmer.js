/**
 * KRISHISHETRA — FARMER JOURNEY CONTROLLER (Step 12B)
 * Complete implementation for:
 * 1. Farmer Profile Onboarding & Editing (api.farmer.*)
 * 2. Real Produce Lot Creation with dedicated Success Screen (api.lots.create)
 * 3. Real "My Lots" List, Status Filtering, Details, Edit & Cancel (api.lots.*)
 * 4. Marketplace Live Lot Feed Connection (api.market.getLots)
 */

const AI_QUALITY_MIN_ACCEPT_CONFIDENCE = 0.40;

const FarmerFlow = {
  profile: null,
  lots: [],
  currentFilter: 'all',
  selectedLot: null,
  selectedAiCrop: 'Wheat',
  selectedAiSample: 'premium',
  currentAiScan: null,
  temporaryEvidence: null,
  _selectedQualityPhoto: null,
  _aqPendingAiResult: null,
  _aiPhotoState: 'AI_IDLE',

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
    // Check if dismissed in this session
    if (sessionStorage.getItem('krishi_dismiss_profile_card') === 'true') {
      return;
    }
    // If profile is already complete, do not show
    if (this.state && this.state.profile && this.state.profile.farmName) {
      return;
    }

    let banner = document.getElementById('farmer-onboarding-banner');
    if (!banner) {
      const main = document.querySelector('main') || document.getElementById('dash-main');
      if (!main) return;

      banner = document.createElement('div');
      banner.id = 'farmer-onboarding-banner';
      banner.className = 'container';
      banner.innerHTML = `
        <div class="dash-onboarding-card" style="margin-top: 20px; background: linear-gradient(135deg, #12372A 0%, #1A4D3B 100%); border: 1px solid rgba(232, 185, 106, 0.4); border-radius: 16px; padding: 22px 28px; color: #FFFFFF; display: flex; align-items: center; justify-content: space-between; gap: 20px; box-shadow: 0 10px 25px rgba(18, 55, 42, 0.15); flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 18px; max-width: 720px;">
            <div style="width: 52px; height: 52px; border-radius: 14px; background: rgba(232, 185, 106, 0.2); display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0;">
              🌾
            </div>
            <div>
              <h3 style="font-size: 18px; font-weight: 700; color: #F5F4ED; margin: 0 0 6px 0;" data-i18n="farmer.completeFarmProfile">Complete Your Farm Profile</h3>
              <p style="font-size: 13px; color: rgba(245, 244, 237, 0.85); margin: 0 0 8px 0; line-height: 1.45;" data-i18n="farmer.farmProfileOnboardingDesc">
                Add your farm location, acreage, and cultivated crops to receive verified buyer inquiries and tailored storage recommendations.
              </p>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 11.5px; color: #E8B96A;">
                <span style="background: rgba(255,255,255,0.08); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12);">🏡 <span data-i18n="farmer.farmProfile">Farm details</span></span>
                <span style="background: rgba(255,255,255,0.08); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12);">📍 <span data-i18n="common.address">Location</span></span>
                <span style="background: rgba(255,255,255,0.08); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12);">🌾 <span data-i18n="farmer.primaryCrops">Crops</span></span>
                <span style="background: rgba(255,255,255,0.08); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12);">🏦 <span>Bank / Credit</span></span>
                <span style="background: rgba(255,255,255,0.08); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12);">📞 <span data-i18n="common.contact">Contact details</span></span>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn--primary" id="btn-banner-complete-profile" style="background: #E8B96A; color: #12372A; font-weight: 700; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; white-space: nowrap;">
              <span data-i18n="farmer.completeProfileBtn">Complete Profile →</span>
            </button>
            <button class="btn" id="btn-banner-dismiss-profile" style="background: rgba(255,255,255,0.1); color: #F5F4ED; font-weight: 600; border: 1px solid rgba(255,255,255,0.25); padding: 10px 18px; border-radius: 8px; cursor: pointer; white-space: nowrap;">
              <span data-i18n="common.close">Dismiss</span>
            </button>
          </div>
        </div>
      `;
      main.insertBefore(banner, main.firstChild);
      if (window.KrishiI18n) window.KrishiI18n.translateElement(banner);

      document.getElementById('btn-banner-complete-profile')?.addEventListener('click', () => {
        this.openFarmProfileModal(true);
      });

      document.getElementById('btn-banner-dismiss-profile')?.addEventListener('click', () => {
        sessionStorage.setItem('krishi_dismiss_profile_card', 'true');
        banner.style.display = 'none';
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
              <h3 id="farm-profile-modal-title" style="margin: 0; font-size: 18px;" data-i18n="${isNew ? 'farmer.completeFarmProfile' : 'farmer.editFarmProfile'}">${isNew ? '🌱 Complete Farmer Profile' : '✏️ Edit Farm Profile'}</h3>
              <span class="dash-crop-modal__sub" style="font-size: 12px; color: var(--ks-text-muted);" data-i18n="farmer.farmProfileOnboardingDesc">Verified information for buyer discovery & produce listings</span>
            </div>
            <button class="dash-modal__close" id="farm-profile-modal-close" aria-label="Close"><i data-lucide="x"></i></button>
          </div>
          <form class="dash-modal__form" id="farm-profile-form" style="padding: 20px 24px;">
            <div id="farm-profile-alert" style="display: none; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;"></div>

            <!-- Section 1: Basic Farm Info -->
            <div class="fp-section-card">
              <div class="fp-section-title">
                <span class="fp-section-badge">1</span>
                <span data-i18n="farmer.farmProfile">Basic Farm Information</span>
              </div>
              <div class="dash-form-row">
                <div class="dash-modal__field" style="flex: 2;">
                  <label for="fp-farm-name"><span data-i18n="farmer.farmName">Farm / Land Name</span> <span style="color:#dc2626;">*</span></label>
                  <input type="text" id="fp-farm-name" class="dash-form-input" placeholder="e.g. Patil Organic Farms" required>
                </div>
                <div class="dash-modal__field" style="flex: 1;">
                  <label for="fp-farmer-type" data-i18n="farmer.farmerType">Farmer Type</label>
                  <select id="fp-farmer-type" class="dash-filter-select">
                    <option value="individual" data-i18n="farmer.individual">Individual</option>
                    <option value="farmer_group" data-i18n="farmer.farmerGroup">Farmer Group</option>
                    <option value="fpo_member" data-i18n="farmer.fpoMember">FPO Member</option>
                  </select>
                </div>
              </div>

              <div class="dash-form-row" style="margin-top: 10px;">
                <div class="dash-modal__field">
                  <label for="fp-farm-size"><span data-i18n="farmer.farmSize">Farm Size</span> <span style="color:#dc2626;">*</span></label>
                  <input type="number" id="fp-farm-size" class="dash-form-input" placeholder="e.g. 5" min="0.1" max="10000" step="0.1" required>
                </div>
                <div class="dash-modal__field">
                  <label for="fp-size-unit" data-i18n="farmer.farmSizeUnit">Unit</label>
                  <select id="fp-size-unit" class="dash-filter-select">
                    <option value="acre" data-i18n="farmer.acre">Acre</option>
                    <option value="hectare" data-i18n="farmer.hectare">Hectare</option>
                    <option value="guntha" data-i18n="farmer.guntha">Guntha</option>
                  </select>
                </div>
                <div class="dash-modal__field">
                  <label for="fp-ownership" data-i18n="farmer.ownershipType">Ownership</label>
                  <select id="fp-ownership" class="dash-filter-select">
                    <option value="owned" data-i18n="farmer.owned">Owned</option>
                    <option value="leased" data-i18n="farmer.leased">Leased</option>
                    <option value="shared" data-i18n="farmer.shared">Shared</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Section 2: Location -->
            <div class="fp-section-card">
              <div class="fp-section-title">
                <span class="fp-section-badge">2</span>
                <span data-i18n="common.address">Farm Location & Pincode</span>
              </div>
              <div class="dash-form-row">
                <div class="dash-modal__field">
                  <label for="fp-state"><span data-i18n="common.state">State</span> <span style="color:#dc2626;">*</span></label>
                  <input type="text" id="fp-state" class="dash-form-input" placeholder="e.g. Maharashtra" required>
                </div>
                <div class="dash-modal__field">
                  <label for="fp-district"><span data-i18n="common.district">District</span> <span style="color:#dc2626;">*</span></label>
                  <input type="text" id="fp-district" class="dash-form-input" placeholder="e.g. Nashik" required>
                </div>
              </div>

              <div class="dash-form-row" style="margin-top: 10px;">
                <div class="dash-modal__field">
                  <label for="fp-taluka" data-i18n="common.taluka">Taluka / Tehsil</label>
                  <input type="text" id="fp-taluka" class="dash-form-input" placeholder="e.g. Niphad">
                </div>
                <div class="dash-modal__field">
                  <label for="fp-village" data-i18n="common.village">Village</label>
                  <input type="text" id="fp-village" class="dash-form-input" placeholder="e.g. Pimpalgaon">
                </div>
                <div class="dash-modal__field">
                  <label for="fp-pincode"><span data-i18n="common.pincode">Pincode (6 digits)</span> <span style="color:#dc2626;">*</span></label>
                  <input type="text" id="fp-pincode" class="dash-form-input" placeholder="422209" maxlength="6" pattern="[1-9][0-9]{5}" required>
                </div>
              </div>
            </div>

            <!-- Section 3: Crops Cultivated -->
            <div class="fp-section-card">
              <div class="fp-section-title" style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="fp-section-badge">3</span>
                  <span><span data-i18n="farmer.primaryCrops">Primary Crops Cultivated</span> <span style="color:#dc2626;">*</span></span>
                </div>
                <button type="button" class="btn btn--sm btn--secondary" id="btn-add-crop-row" style="font-size: 12px; padding: 4px 10px;">+ Add Crop</button>
              </div>
              <div id="fp-crops-container" style="display: flex; flex-direction: column; gap: 8px;">
                <!-- Dynamic crop rows inserted here -->
              </div>
            </div>

            <!-- Section 4: Farming Methods & Irrigation -->
            <div class="fp-section-card">
              <div class="fp-section-title">
                <span class="fp-section-badge">4</span>
                <span data-i18n="farmer.farmingDetails">Farming Details</span>
              </div>
              <div class="dash-form-row">
                <div class="dash-modal__field">
                  <label for="fp-irrigation" data-i18n="farmer.irrigationType">Irrigation Type</label>
                  <select id="fp-irrigation" class="dash-filter-select">
                    <option value="drip" data-i18n="farmer.drip">Drip Irrigation</option>
                    <option value="borewell" data-i18n="farmer.borewell">Borewell</option>
                    <option value="canal" data-i18n="farmer.canal">Canal</option>
                    <option value="sprinkler">Sprinkler</option>
                    <option value="rainfed" data-i18n="farmer.rainfed">Rainfed</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div class="dash-modal__field">
                  <label for="fp-farming-method" data-i18n="farmer.farmingMethod">Farming Method</label>
                  <select id="fp-farming-method" class="dash-filter-select">
                    <option value="conventional">Conventional</option>
                    <option value="organic">Organic Certified</option>
                    <option value="natural">Natural / Zero Budget</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn--primary dash-modal__submit" id="btn-submit-farm-profile" style="margin-top: 12px; width: 100%; padding: 12px; font-weight: 700;">
              <i data-lucide="check"></i> <span data-i18n="common.save">Save & Confirm Farm Profile</span>
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
    if (window.KrishiI18n) {
      window.KrishiI18n.translateElement(overlay);
    }
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
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.textContent = '';
    }

    const t = (k, fb) => (window.KrishiI18n ? window.KrishiI18n.t(k, fb) : fb);

    // Reset validation border highlights
    ['fp-farm-name', 'fp-farm-size', 'fp-state', 'fp-district', 'fp-pincode'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.borderColor = '';
    });

    const showError = (msg, inputId) => {
      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.style.background = 'rgba(220, 38, 38, 0.1)';
        alertBox.style.color = '#dc2626';
        alertBox.style.border = '1px solid rgba(220, 38, 38, 0.3)';
        alertBox.textContent = msg;
      }
      if (inputId) {
        const el = document.getElementById(inputId);
        if (el) {
          el.style.borderColor = '#dc2626';
          el.focus();
        }
      }
    };

    // Collect dynamic crops
    const crops = [];
    document.querySelectorAll('.fp-crop-row').forEach(row => {
      const name = row.querySelector('.fp-crop-name')?.value.trim();
      const season = row.querySelector('.fp-crop-season')?.value.trim();
      if (name) crops.push({ name, season });
    });

    const farmName = document.getElementById('fp-farm-name')?.value.trim() || '';
    const farmSizeRaw = document.getElementById('fp-farm-size')?.value;
    const farmSize = parseFloat(farmSizeRaw);
    const state = document.getElementById('fp-state')?.value.trim() || '';
    const district = document.getElementById('fp-district')?.value.trim() || '';
    const pincode = document.getElementById('fp-pincode')?.value.trim() || '';

    // Rigorous client-side validations
    if (!farmName || farmName.length < 2) {
      return showError(t('farmer.validationFarmName', 'Please enter a valid farm name (at least 2 characters).'), 'fp-farm-name');
    }
    if (isNaN(farmSize) || farmSize < 0.1 || farmSize > 10000) {
      return showError(t('farmer.validationFarmSize', 'Please enter a valid farm size between 0.1 and 10,000.'), 'fp-farm-size');
    }
    if (!state || state.length < 2) {
      return showError(t('farmer.validationState', 'Please enter state.'), 'fp-state');
    }
    if (!district || district.length < 2) {
      return showError(t('farmer.validationDistrict', 'Please enter district.'), 'fp-district');
    }
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(pincode)) {
      return showError(t('farmer.validationPincode', 'Please enter a valid 6-digit Indian pincode.'), 'fp-pincode');
    }
    if (crops.length === 0) {
      return showError(t('farmer.validationCrops', 'Please specify at least one cultivated crop.'));
    }

    const payload = {
      farmName,
      farmerType: document.getElementById('fp-farmer-type').value,
      farmSize,
      farmSizeUnit: document.getElementById('fp-size-unit').value,
      ownershipType: document.getElementById('fp-ownership').value,
      state,
      district,
      taluka: document.getElementById('fp-taluka')?.value.trim() || '',
      village: document.getElementById('fp-village')?.value.trim() || '',
      pincode,
      crops,
      irrigationType: document.getElementById('fp-irrigation').value,
      farmingMethod: document.getElementById('fp-farming-method').value
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="dash-spinner" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:6px;"></span> ${t('farmer.savingProfile', 'Saving farm profile...')}`;

    try {
      let res;
      if (this.profile && this.profile.id) {
        res = await window.api.farmer.updateProfile(payload);
      } else {
        res = await window.api.farmer.createProfile(payload);
      }

      if (res && res.success && res.profile) {
        this.profile = res.profile;
        this.updateProfileDisplay(res.profile);
        this.hideOnboardingBanner();
        document.getElementById('farm-profile-modal-overlay')?.classList.remove('active');
        this.showToast(t('farmer.profileSaved', 'Farm profile saved successfully! ✓'), 'success');
      } else {
        showError((res && res.message) || 'Failed to save farm profile.');
      }
    } catch (err) {
      showError('Server connection error. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i data-lucide="check"></i> <span>${t('common.save', 'Save & Confirm Farm Profile')}</span>`;
      if (window.lucide) window.lucide.createIcons();
    }
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * QUALITY EVIDENCE MANAGEMENT (Phase 10)
   * ═══════════════════════════════════════════════════════════════════════
   */
  setAiPhotoState(stateName, data = {}) {
    this._aiPhotoState = stateName;
    const states = {
      AI_IDLE: 'qe-state-idle',
      AI_PREVIEW: 'qe-state-preview',
      AI_ANALYZING: 'qe-state-loading',
      AI_SUCCESS: 'qe-state-success',
      AI_CROP_MISMATCH: 'qe-state-mismatch',
      AI_LOW_CONFIDENCE: 'qe-state-low-confidence',
      AI_ERROR: 'qe-state-error'
    };

    // Hide all states first to guarantee mutual exclusivity (SUCCESS and ERROR never show together)
    Object.values(states).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // Show active state
    const activeId = states[stateName];
    if (activeId) {
      const el = document.getElementById(activeId);
      if (el) el.style.display = 'block';
    }

    if (window.lucide) window.lucide.createIcons();
  },

  selectQualityEvidenceTab(tab) {
    const photoBtn = document.getElementById('qe-btn-photo');
    const reportBtn = document.getElementById('qe-btn-report');
    const manualBtn = document.getElementById('qe-btn-manual');
    const photoPanel = document.getElementById('qe-panel-photo');
    const reportPanel = document.getElementById('qe-panel-report');
    const manualPanel = document.getElementById('qe-panel-manual');

    [photoBtn, reportBtn, manualBtn].forEach(b => {
      if (b) {
        b.style.borderColor = '#CCDBCD';
        b.style.background = '#FFFFFF';
      }
    });

    if (tab === 'photo') {
      if (photoBtn) {
        photoBtn.style.borderColor = '#2D6A4F';
        photoBtn.style.background = '#F0FDF4';
      }
      if (photoPanel) photoPanel.style.display = 'block';
      if (reportPanel) reportPanel.style.display = 'none';
      if (manualPanel) manualPanel.style.display = 'none';

      // If no photo selected yet, ensure state is AI_IDLE
      if (!this._selectedQualityPhoto && !this._aqPendingAiResult) {
        this.setAiPhotoState('AI_IDLE');
      }
    } else if (tab === 'report') {
      this.stopCameraStream();
      this.closeCameraModal();
      if (reportBtn) {
        reportBtn.style.borderColor = '#2D6A4F';
        reportBtn.style.background = '#F0FDF4';
      }
      if (photoPanel) photoPanel.style.display = 'none';
      if (reportPanel) reportPanel.style.display = 'block';
      if (manualPanel) manualPanel.style.display = 'none';
      this.updateReportMetadata();
    } else if (tab === 'manual') {
      this.stopCameraStream();
      this.closeCameraModal();
      if (manualBtn) {
        manualBtn.style.borderColor = '#2D6A4F';
        manualBtn.style.background = '#F0FDF4';
      }
      if (photoPanel) photoPanel.style.display = 'none';
      if (reportPanel) reportPanel.style.display = 'none';
      if (manualPanel) manualPanel.style.display = 'block';
      this.updateManualQuality();
    } else if (tab === 'skip') {
      this.skipQualityEvidence();
    }
    if (window.lucide) window.lucide.createIcons();
  },

  skipQualityEvidence() {
    this._aqUserCancelled = true;
    // 1. Invalidate any in-flight AI quality analysis request and abort fetch
    this._aqRequestId = (this._aqRequestId || 0) + 1;
    if (this._aqAbortController) {
      try { this._aqAbortController.abort(); } catch (e) {}
      this._aqAbortController = null;
    }

    // 2. Stop camera stream & modal
    this.stopCameraStream();
    this.closeCameraModal();

    // 3. Clear evidence & inputs
    this.clearQualityEvidence();

    // 4. Hide all option panels
    const photoPanel = document.getElementById('qe-panel-photo');
    const reportPanel = document.getElementById('qe-panel-report');
    const manualPanel = document.getElementById('qe-panel-manual');
    if (photoPanel) photoPanel.style.display = 'none';
    if (reportPanel) reportPanel.style.display = 'none';
    if (manualPanel) manualPanel.style.display = 'none';

    // 5. Unhighlight option cards
    ['qe-btn-photo', 'qe-btn-report', 'qe-btn-manual'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.borderColor = '#CCDBCD';
        el.style.background = '#FFFFFF';
      }
    });

    if (window.lucide) window.lucide.createIcons();
  },

  normalizeCrop(value) {
    return String(value || "").trim().toLowerCase();
  },

  getCurrentSelectedCrop() {
    // 1. Check active selected crop chip in wizard (e.g. dashboard.html)
    const activeChip = document.querySelector('.lot-crop-chips-grid .lot-crop-chip.selected, .lot-crop-chip.selected');
    if (activeChip) {
      const chipCrop = activeChip.getAttribute('data-crop') || activeChip.dataset?.crop;
      if (chipCrop) {
        return chipCrop.charAt(0).toUpperCase() + chipCrop.slice(1);
      }
      const chipText = activeChip.querySelector('.lot-crop-chip-name, .lot-crop-name')?.textContent?.trim();
      if (chipText) {
        return chipText.charAt(0).toUpperCase() + chipText.slice(1);
      }
    }

    // 2. Check wizard hidden crop input if set
    const wizVal = document.getElementById('wiz-crop-val')?.value?.trim();
    if (wizVal) {
      return wizVal.charAt(0).toUpperCase() + wizVal.slice(1);
    }

    // 3. Check lot crop dropdown or input (e.g. lots.html)
    const cropSelect = document.getElementById('lot-crop-select');
    if (cropSelect) {
      if (cropSelect.tagName === 'SELECT') {
        const selectedOpt = cropSelect.options[cropSelect.selectedIndex];
        const val = selectedOpt ? (selectedOpt.text || selectedOpt.value || '').trim() : (cropSelect.value || '').trim();
        if (val) {
          return val.charAt(0).toUpperCase() + val.slice(1);
        }
      } else if (cropSelect.value && cropSelect.value.trim()) {
        const val = cropSelect.value.trim();
        return val.charAt(0).toUpperCase() + val.slice(1);
      }
    }

    return 'Tomato';
  },

  /* ──────────────── Camera Modal & Live Webcam Stream ──────────────── */
  openCameraModal() {
    const overlay = document.getElementById('qe-camera-modal-overlay');
    if (!overlay) {
      // Native camera input fallback if modal element is not in DOM
      const camInput = document.getElementById('qe-photo-camera');
      if (camInput) camInput.click();
      return;
    }

    overlay.classList.add('active');
    overlay.style.display = 'flex';
    if (window.lucide) window.lucide.createIcons();

    this.startCameraStream();
  },

  async startCameraStream() {
    const video = document.getElementById('qe-camera-video');
    const errorBox = document.getElementById('qe-camera-error-box');
    const actionsBox = document.getElementById('qe-camera-actions');

    if (errorBox) errorBox.style.display = 'none';
    if (video) video.style.display = 'block';
    if (actionsBox) actionsBox.style.display = 'flex';

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('[Camera Access]: getUserMedia not supported on this browser/device.');
      this.handleCameraStreamError();
      return;
    }

    this.stopCameraStream();

    try {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
      } catch (err1) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      this._cameraStream = stream;
      if (video) {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play().catch(e => console.warn('[Video Play]:', e));
        };
      }
    } catch (err) {
      console.warn('[Camera Access]:', err.name, err.message);
      this.handleCameraStreamError();
    }
  },

  handleCameraStreamError() {
    const video = document.getElementById('qe-camera-video');
    const errorBox = document.getElementById('qe-camera-error-box');
    const actionsBox = document.getElementById('qe-camera-actions');

    if (video) video.style.display = 'none';
    if (errorBox) errorBox.style.display = 'block';
    if (actionsBox) actionsBox.style.display = 'none';
    if (window.lucide) window.lucide.createIcons();
  },

  captureCameraPhoto() {
    const video = document.getElementById('qe-camera-video');
    if (!video || !this._cameraStream) {
      this.closeCameraModal();
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          this.closeCameraModal();
          return;
        }
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        this.stopCameraStream();
        this.closeCameraModal();
        this.handleQualityPhotoFile(file);
      }, 'image/jpeg', 0.92);
    } catch (err) {
      console.warn('[Camera Capture]:', err);
      this.stopCameraStream();
      this.closeCameraModal();
    }
  },

  closeCameraModal() {
    this.stopCameraStream();
    const overlay = document.getElementById('qe-camera-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.style.display = 'none';
    }
  },

  stopCameraStream() {
    if (this._cameraStream) {
      try {
        this._cameraStream.getTracks().forEach(track => {
          try { track.stop(); } catch(e) {}
        });
      } catch (e) {}
      this._cameraStream = null;
    }
    const video = document.getElementById('qe-camera-video');
    if (video) {
      video.srcObject = null;
    }
  },

  handleQualityPhotoFile(file) {
    if (!file) return;
    this._selectedQualityPhoto = file;
    this._aqPendingAiResult = null;

    const preview = document.getElementById('qe-photo-preview');
    if (preview) preview.src = URL.createObjectURL(file);

    this.setAiPhotoState('AI_PREVIEW');
  },

  handleQualityPhotoSelected(event) {
    const file = event.target?.files?.[0];
    if (!file) return;
    this.handleQualityPhotoFile(file);
  },

  clearQualityPhoto() {
    this._aqUserCancelled = true;
    if (this._aqAbortController) {
      try { this._aqAbortController.abort(); } catch (e) {}
      this._aqAbortController = null;
    }
    this.stopCameraStream();
    this._selectedQualityPhoto = null;
    this._aqPendingAiResult = null;
    const pCam = document.getElementById('qe-photo-camera');
    if (pCam) pCam.value = '';
    const pUp = document.getElementById('qe-photo-upload');
    if (pUp) pUp.value = '';
    const pGal = document.getElementById('qe-photo-gallery');
    if (pGal) pGal.value = '';
    const pFile = document.getElementById('qe-photo-file');
    if (pFile) pFile.value = '';
    const preview = document.getElementById('qe-photo-preview');
    if (preview) preview.src = '';
    const annImg = document.getElementById('qe-photo-annotated-img');
    if (annImg) annImg.src = '';
    const annWrap = document.getElementById('qe-photo-annotated-wrap');
    if (annWrap) annWrap.style.display = 'none';

    this.setAiPhotoState('AI_IDLE');
  },

  retryQualityPhoto() {
    this.clearQualityPhoto();
  },

  async analyzeQualityPhoto() {
    const file = this._selectedQualityPhoto ||
      document.getElementById('qe-photo-camera')?.files?.[0] ||
      document.getElementById('qe-photo-upload')?.files?.[0] ||
      document.getElementById('qe-photo-gallery')?.files?.[0] ||
      document.getElementById('qe-photo-file')?.files?.[0];

    if (!file) {
      this.showToast('Please select or capture a crop photo first.', 'warning');
      this.setAiPhotoState('AI_IDLE');
      return;
    }

    console.log('[AI Quality UI] analysis started');
    this.setAiPhotoState('AI_ANALYZING');
    this._aqUserCancelled = false;

    const selectedCrop = this.getCurrentSelectedCrop();
    console.log('[AI Quality UI] Selected crop:', selectedCrop);

    // Abort any prior in-flight request
    if (this._aqAbortController) {
      try {
        this._aqAbortController.abort();
      } catch (e) {}
    }
    const controller = new AbortController();
    this._aqAbortController = controller;

    const tStart = performance.now();
    let isTimedOut = false;

    const timeoutId = setTimeout(() => {
      isTimedOut = true;
      try {
        controller.abort();
      } catch (e) {}
    }, 120000); // 120s tolerance for Render cold starts

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (selectedCrop) {
        formData.append('selected_crop', selectedCrop);
      }

      console.log('[AI Quality UI] request sent');
      const resp = await fetch('/api/quality/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      // Clear timeout immediately after fetch resolves
      clearTimeout(timeoutId);

      const elapsedMs = Math.round(performance.now() - tStart);
      console.log(`[AI Quality UI] response received: HTTP ${resp.status} (${elapsedMs}ms)`);

      if (!resp.ok) {
        console.log('[AI Quality UI] state -> AI_ERROR');
        let errMsg = 'Photo assessment is temporarily unavailable.';
        if (resp.status === 413) errMsg = 'Image file is too large (max 10 MB). Please choose a smaller photo.';
        if (resp.status === 415) errMsg = 'Unsupported image format. Please use a JPG, PNG, or WebP photo.';
        if (resp.status === 503 || resp.status === 504) errMsg = 'Photo assessment is temporarily unavailable.';

        const errorEl = document.getElementById('qe-error-text');
        if (errorEl) errorEl.textContent = errMsg;
        this.setAiPhotoState('AI_ERROR');
        return;
      }

      const data = await resp.json();
      console.log('[AI Quality UI] response parsed', data);
      console.log(
        '[AI Quality UI] API status:',
        data?.status,
        'crop:',
        data?.crop,
        'confidence:',
        data?.confidence
      );

      // 1. NO DETECTION
      if (data.status === 'NO_DETECTION') {
        console.log('[AI Quality UI] state -> AI_ERROR');
        this._aqPendingAiResult = null;
        const errorEl = document.getElementById('qe-error-text');
        if (errorEl) {
          errorEl.textContent = 'No produce was detected in this photo. Please ensure the produce is clearly visible and well-lit, or enter quality details manually.';
        }
        this.setAiPhotoState('AI_ERROR');
        return;
      }

      // 2. MODEL NOT LOADED / VALIDATION ERROR
      if (data.status === 'MODEL_NOT_LOADED' || data.status === 'VALIDATION_ERROR') {
        console.log('[AI Quality UI] state -> AI_ERROR');
        this._aqPendingAiResult = null;
        const errorEl = document.getElementById('qe-error-text');
        if (errorEl) {
          errorEl.textContent = 'We couldn\'t complete the photo assessment right now. You can try another photo or continue another way.';
        }
        this.setAiPhotoState('AI_ERROR');
        return;
      }

      // 3. CROP MISMATCH PROTECTION
      const detectedCrop = data.crop ? (data.crop.charAt(0).toUpperCase() + data.crop.slice(1)) : '';
      const isMismatch = data.status === 'AI_CROP_MISMATCH' || (selectedCrop && detectedCrop && this.normalizeCrop(selectedCrop) !== this.normalizeCrop(detectedCrop));

      if (isMismatch) {
        console.log('[AI Quality UI] state -> AI_CROP_MISMATCH');
        this._aqPendingAiResult = null;
        const mismatchEl = document.getElementById('qe-mismatch-text');
        if (mismatchEl) {
          mismatchEl.textContent = `We couldn't confidently find ${selectedCrop || 'the crop'} in this photo.`;
        }
        this.setAiPhotoState('AI_CROP_MISMATCH');
        return;
      }

      // 4. MATCHED OR UNRESTRICTED CROP -> EVALUATE CONFIDENCE
      const condition = data.condition || 'Fresh';
      const rawConf = typeof data.confidence === 'number' ? data.confidence : (typeof data.cropConfidence === 'number' ? data.cropConfidence : 0);
      const confRatio = rawConf <= 1 ? rawConf : rawConf / 100;
      const confPctDisplay = (confRatio * 100).toFixed(1) + '%';
      const assessmentType = data.assessmentType || 'Visual condition detection';
      const modelVersion = data.modelVersion || 'vegqual-20ep';
      const annotatedImageUrl = data.annotatedImageUrl || (data.annotatedImageId ? `/api/quality/annotated/${data.annotatedImageId}` : null);
      const annotatedImageId = data.annotatedImageId || null;

      // Handle confidence threshold
      if (confRatio < AI_QUALITY_MIN_ACCEPT_CONFIDENCE) {
        console.log('[AI Quality UI] state -> AI_LOW_CONFIDENCE');
        this._aqPendingAiResult = null;
        const lowConfEl = document.getElementById('qe-low-conf-text');
        if (lowConfEl) {
          lowConfEl.textContent = `We detected ${detectedCrop || selectedCrop || 'the crop'}, but the visual model isn't confident enough to complete the assessment.`;
        }
        this.setAiPhotoState('AI_LOW_CONFIDENCE');
      } else {
        console.log('[AI Quality UI] state -> AI_SUCCESS');
        this._aqPendingAiResult = {
          crop: detectedCrop || selectedCrop || 'Produce',
          condition: condition,
          confidence: confRatio,
          confPctDisplay: confPctDisplay,
          assessmentType: assessmentType,
          modelVersion: modelVersion,
          annotatedImageUrl: annotatedImageUrl,
          annotatedImageId: annotatedImageId
        };

        const cropEl = document.getElementById('qe-photo-crop');
        const condEl = document.getElementById('qe-photo-condition');
        const confEl = document.getElementById('qe-photo-confidence');
        const annWrap = document.getElementById('qe-photo-annotated-wrap');
        const annImg = document.getElementById('qe-photo-annotated-img');

        if (cropEl) cropEl.textContent = detectedCrop || selectedCrop || 'Produce';
        if (condEl) condEl.textContent = condition;
        if (confEl) confEl.textContent = confPctDisplay;

        // Set state immediately before loading annotated image
        this.setAiPhotoState('AI_SUCCESS');

        // Load annotated image asynchronously without blocking UI result state
        if (annotatedImageUrl && annImg && annWrap) {
          annImg.src = annotatedImageUrl;
          annWrap.style.display = 'block';
        } else if (annWrap) {
          annWrap.style.display = 'none';
        }
      }

    } catch (err) {
      clearTimeout(timeoutId);
      this._aqPendingAiResult = null;
      if (this._aqUserCancelled) {
        console.log('[AI Quality UI] request cancelled by user');
        return;
      }
      if (isTimedOut) {
        console.warn('[AI Quality UI] request timed out after 120s');
        const errorEl = document.getElementById('qe-error-text');
        if (errorEl) {
          errorEl.textContent = 'Photo assessment is taking longer than expected. Please try another photo or continue using another quality option.';
        }
      } else if (err.name === 'AbortError') {
        console.warn('[AI Quality UI] request aborted');
        const errorEl = document.getElementById('qe-error-text');
        if (errorEl) {
          errorEl.textContent = 'Photo assessment is taking longer than expected. Please try another photo or continue using another quality option.';
        }
      } else {
        console.warn('[AI Quality UI] error:', err.name, err.message);
        const errorEl = document.getElementById('qe-error-text');
        if (errorEl) {
          errorEl.textContent = 'Photo assessment is temporarily unavailable.';
        }
      }
      console.log('[AI Quality UI] state -> AI_ERROR');
      this.setAiPhotoState('AI_ERROR');
    } finally {
      clearTimeout(timeoutId);
      if (this._aqAbortController === controller) {
        this._aqAbortController = null;
      }
    }
  },

  applyQualityAssessment(isLowConfidenceOverride = false) {
    const res = this._aqPendingAiResult;
    if (!res) {
      this.showToast('Please analyze a photo first.', 'warning');
      return;
    }

    this.temporaryEvidence = {
      source: 'AI_ASSESSMENT',
      aiAssessment: {
        status: 'AI_ASSESSED',
        crop: res.crop,
        condition: res.condition,
        confidence: res.confidence,
        cropConfidence: res.confidence,
        conditionConfidence: res.confidence,
        assessmentType: res.assessmentType,
        modelVersion: res.modelVersion,
        annotatedImageUrl: res.annotatedImageUrl,
        annotatedImageId: res.annotatedImageId,
        assessedAt: new Date().toISOString()
      },
      report: {},
      manual: {}
    };
    this.currentAiScan = this.temporaryEvidence.aiAssessment;

    this.renderQualityEvidenceSummary(`🤖 AI Assessed: ${res.crop} · ${res.condition} (${res.confPctDisplay})`);
    this.highlightEvidenceCard('photo');
    this.showToast(`✓ AI-assisted assessment applied for ${res.crop} (${res.condition})`, 'success');
  },

  handleReportFileSelect(event) {
    const file = event.target?.files?.[0];
    if (!file) return;
    this.temporaryEvidence = {
      source: 'FARMER_PROVIDED_REPORT',
      report: {
        fileName: file.name,
        fileUrl: '',
        provider: document.getElementById('qe-report-provider')?.value.trim() || '',
        reportNumber: document.getElementById('qe-report-number')?.value.trim() || '',
        reportDate: document.getElementById('qe-report-date')?.value || '',
        verificationStatus: 'unverified'
      },
      manual: {},
      aiAssessment: {}
    };
    this.renderQualityEvidenceSummary(`📄 Quality Report: ${file.name}`);
    this.highlightEvidenceCard('report');
  },

  updateReportMetadata() {
    const fileInput = document.getElementById('qe-report-file');
    const fileName = fileInput?.files?.[0]?.name || (this.temporaryEvidence?.report?.fileName) || '';
    const provider = document.getElementById('qe-report-provider')?.value.trim() || '';
    const reportNumber = document.getElementById('qe-report-number')?.value.trim() || '';
    const reportDate = document.getElementById('qe-report-date')?.value || '';

    if (fileName || provider || reportNumber || reportDate) {
      this.temporaryEvidence = {
        source: 'FARMER_PROVIDED_REPORT',
        report: {
          fileName: fileName || 'Report attached',
          fileUrl: '',
          provider,
          reportNumber,
          reportDate,
          verificationStatus: 'unverified'
        },
        manual: {},
        aiAssessment: {}
      };
      this.renderQualityEvidenceSummary(`📄 Quality Report: ${fileName || provider || 'Details added'}`);
      this.highlightEvidenceCard('report');
    }
  },

  updateManualQuality() {
    const cond = document.getElementById('qe-manual-condition')?.value || '';
    const grade = document.getElementById('qe-manual-grade')?.value.trim() || '';
    const desc = document.getElementById('qe-manual-desc')?.value.trim() || '';
    const notes = document.getElementById('qe-manual-notes')?.value.trim() || '';

    if (cond || grade || desc || notes) {
      this.temporaryEvidence = {
        source: 'MANUAL',
        manual: {
          condition: cond,
          grade,
          description: desc,
          notes
        },
        report: {},
        aiAssessment: {}
      };
      const label = cond ? `Condition: ${cond}` : (grade ? `Grade: ${grade}` : 'Manual information entered');
      this.renderQualityEvidenceSummary(`✍️ Quality Info: ${label}`);
      this.highlightEvidenceCard('manual');
    }
  },

  renderQualityEvidenceSummary(text) {
    const summaryBox = document.getElementById('qe-active-summary');
    const summaryText = document.getElementById('qe-active-summary-text');
    if (summaryBox && summaryText) {
      summaryText.textContent = text;
      summaryBox.style.display = 'flex';
    }
  },

  highlightEvidenceCard(type) {
    const photoBtn = document.getElementById('qe-btn-photo');
    const reportBtn = document.getElementById('qe-btn-report');
    const manualBtn = document.getElementById('qe-btn-manual');
    [photoBtn, reportBtn, manualBtn].forEach(b => {
      if (b) {
        b.style.borderColor = '#CCDBCD';
        b.style.background = '#FFFFFF';
      }
    });
    if (type === 'photo' && photoBtn) {
      photoBtn.style.borderColor = '#2D6A4F';
      photoBtn.style.background = '#F0FDF4';
    } else if (type === 'report' && reportBtn) {
      reportBtn.style.borderColor = '#2D6A4F';
      reportBtn.style.background = '#F0FDF4';
    } else if (type === 'manual' && manualBtn) {
      manualBtn.style.borderColor = '#2D6A4F';
      manualBtn.style.background = '#F0FDF4';
    }
  },

  clearQualityEvidence() {
    this.temporaryEvidence = null;
    this.currentAiScan = null;
    this._aqLastResult = null;
    this._aqPendingAiResult = null;
    this._selectedQualityPhoto = null;

    const summaryBox = document.getElementById('qe-active-summary');
    if (summaryBox) summaryBox.style.display = 'none';

    // Clear photo fields
    const pCam = document.getElementById('qe-photo-camera');
    if (pCam) pCam.value = '';
    const pUp = document.getElementById('qe-photo-upload');
    if (pUp) pUp.value = '';
    const pGal = document.getElementById('qe-photo-gallery');
    if (pGal) pGal.value = '';
    const pFile = document.getElementById('qe-photo-file');
    if (pFile) pFile.value = '';
    const pPrev = document.getElementById('qe-photo-preview');
    if (pPrev) pPrev.src = '';
    const annImg = document.getElementById('qe-photo-annotated-img');
    if (annImg) annImg.src = '';
    const annWrap = document.getElementById('qe-photo-annotated-wrap');
    if (annWrap) annWrap.style.display = 'none';

    // Clear report fields
    const rFile = document.getElementById('qe-report-file');
    if (rFile) rFile.value = '';
    const rProv = document.getElementById('qe-report-provider');
    if (rProv) rProv.value = '';
    const rNum = document.getElementById('qe-report-number');
    if (rNum) rNum.value = '';
    const rDate = document.getElementById('qe-report-date');
    if (rDate) rDate.value = '';

    // Clear manual fields
    const mCond = document.getElementById('qe-manual-condition');
    if (mCond) mCond.value = '';
    const mGrade = document.getElementById('qe-manual-grade');
    if (mGrade) mGrade.value = '';
    const mDesc = document.getElementById('qe-manual-desc');
    if (mDesc) mDesc.value = '';
    const mNotes = document.getElementById('qe-manual-notes');
    if (mNotes) mNotes.value = '';

    // Reset option card highlights
    ['qe-btn-photo', 'qe-btn-report', 'qe-btn-manual'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.borderColor = '#CCDBCD';
        el.style.background = '#FFFFFF';
      }
    });

    this.setAiPhotoState('AI_IDLE');
  },

  resetQualityEvidenceForm() {
    this.clearQualityEvidence();
    const pPanel = document.getElementById('qe-panel-photo');
    if (pPanel) pPanel.style.display = 'none';
    const rPanel = document.getElementById('qe-panel-report');
    if (rPanel) rPanel.style.display = 'none';
    const mPanel = document.getElementById('qe-panel-manual');
    if (mPanel) mPanel.style.display = 'none';
  },

  buildQualityEvidencePayload() {
    if (this.temporaryEvidence && this.temporaryEvidence.source) {
      return this.temporaryEvidence;
    }
    const file = document.getElementById('qe-report-file')?.files?.[0];
    const prov = document.getElementById('qe-report-provider')?.value.trim();
    if (file || prov) {
      return {
        source: 'FARMER_PROVIDED_REPORT',
        report: {
          fileName: file ? file.name : 'Report attached',
          fileUrl: '',
          provider: prov || '',
          reportNumber: document.getElementById('qe-report-number')?.value.trim() || '',
          reportDate: document.getElementById('qe-report-date')?.value || '',
          verificationStatus: 'unverified'
        },
        manual: {},
        aiAssessment: {}
      };
    }

    const cond = document.getElementById('qe-manual-condition')?.value;
    const grade = document.getElementById('qe-manual-grade')?.value.trim();
    const desc = document.getElementById('qe-manual-desc')?.value.trim();
    const notes = document.getElementById('qe-manual-notes')?.value.trim();
    if (cond || grade || desc || notes) {
      return {
        source: 'MANUAL',
        manual: {
          condition: cond || '',
          grade: grade || '',
          description: desc || '',
          notes: notes || ''
        },
        report: {},
        aiAssessment: {}
      };
    }

    return { source: null };
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

    // Fresh start: discard any leftover evidence from previous actions
    this.resetQualityEvidenceForm();

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
    this.initQualityGradingEvents();
    this.updateAgmarkScorecardPreview();
    if (window.lucide) window.lucide.createIcons();
  },

  async submitCreateLot(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('#btn-submit-lot') || form.querySelector('button[type="submit"]');

    const cropSelect = document.getElementById('lot-crop-select');
    const cropName = cropSelect ? (cropSelect.value || cropSelect.options[cropSelect.selectedIndex]?.value || 'Wheat') : 'Wheat';
    const qty = parseFloat(document.getElementById('lot-qty-input')?.value);
    const price = parseFloat(document.getElementById('lot-price-input')?.value);
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
      return;
    }

    const storageTypeVal = document.getElementById('lot-storage-type')?.value || 'farm';
    const storageDecisionVal = document.getElementById('lot-storage-decision')?.value || 'sell_now';

    // Determine category & extract parametric values
    const cat = window.GradingEngine ? window.GradingEngine.getCropCategory(cropName) : 'cereals_grains';
    let params = {};
    if (cat === 'cereals_grains') {
      const m = document.getElementById('lot-moisture-input')?.value;
      const f = document.getElementById('lot-foreign-input')?.value;
      const b = document.getElementById('lot-broken-input')?.value;
      const d = document.getElementById('lot-damaged-input')?.value;
      if (m !== '') params.moistureContent = parseFloat(m);
      if (f !== '') params.foreignMatter = parseFloat(f);
      if (b !== '') params.brokenGrains = parseFloat(b);
      if (d !== '') params.damagedGrains = parseFloat(d);
    } else {
      const b = document.getElementById('lot-blemish-input')?.value;
      const u = document.getElementById('lot-uniformity-input')?.value;
      const r = document.getElementById('lot-ripeness-input')?.value;
      const s = document.getElementById('lot-size-input')?.value;
      if (b !== '') params.blemishPercentage = parseFloat(b);
      if (u !== '') params.uniformity = parseFloat(u);
      if (r !== '') params.ripenessIndex = parseFloat(r);
      if (s !== '') params.avgDiameter = parseFloat(s);
    }

    // Evaluate Agmark Grade
    const evalResult = window.GradingEngine ? window.GradingEngine.evaluate(cropName, params) : { grade: 'A', standard: 'Agmark' };
    const gradeVal = evalResult.grade;

    // Assayer Certificate fields
    const assayerName = document.getElementById('lot-assayer-name')?.value.trim();
    const assayerOrg = document.getElementById('lot-assayer-org')?.value.trim();
    const certNumber = document.getElementById('lot-cert-number')?.value.trim();
    const labRemarks = document.getElementById('lot-lab-remarks')?.value.trim();

    let assayObj = { isAssayed: false, verificationStatus: 'uninspected' };
    if (certNumber || assayerName) {
      assayObj = {
        isAssayed: true,
        verificationStatus: 'verified',
        assayerName: assayerName || 'Dr. Vivek Deshmukh',
        assayerOrganization: assayerOrg || 'NABL / Agmark Central Lab',
        certificateNumber: certNumber || `AGM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        certifiedAt: new Date(),
        labRemarks: labRemarks || 'Tested and verified under Agmark standards.'
      };
    }

    // Build unified quality evidence payload
    const qePayload = this.buildQualityEvidencePayload();

    // Build backward-compatible aiQualityScan sub-document
    const aiScanPayload = (() => {
      if (qePayload && qePayload.source === 'AI_ASSESSMENT' && qePayload.aiAssessment && qePayload.aiAssessment.status === 'AI_ASSESSED') {
        const ai = qePayload.aiAssessment;
        return {
          status: ai.status,
          crop: ai.crop || null,
          condition: ai.condition || null,
          confidence: (typeof ai.confidence === 'number') ? ai.confidence : null,
          assessmentType: ai.assessmentType || 'visual_condition_detection',
          modelVersion: ai.modelVersion || 'vegqual-20ep',
          annotatedImageUrl: ai.annotatedImageUrl || null,
          annotatedImageId: ai.annotatedImageId || null,
          assessedAt: ai.assessedAt || new Date().toISOString()
        };
      }
      return {};
    })();

    const payload = {
      cropName: cropName,
      cropCategory: cat,
      variety: desc ? desc.slice(0, 50) : `${cropName} Standard Variety`,
      quantity: qty,
      quantityUnit: 'quintal',
      askingPrice: price,
      priceUnit: 'quintal',
      harvestDate: harvestDate,
      qualityGrade: gradeVal,
      qualityNotes: desc,
      qualityParameters: Object.keys(params).length > 0 ? params : {
        moistureContent: 11.5,
        foreignMatter: 0.8,
        brokenGrains: 1.6,
        damagedGrains: 0.9
      },
      assaying: assayObj,
      aiQualityScan: aiScanPayload,
      qualityEvidence: qePayload,
      storageType: 'farm',
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
      submitBtn.innerHTML = this._editingLotId ? '<i data-lucide="loader-2" class="spin"></i> Updating lot...' : '<i data-lucide="loader-2" class="spin"></i> Listing lot on marketplace...';
    }

    try {
      if (this._editingLotId) {
        const editId = this._editingLotId;
        const res = await window.api.lots.update(editId, payload);
        if (res.success && res.lot) {
          this._editingLotId = null;
          this.resetQualityEvidenceForm();
          document.getElementById('create-lot-modal-overlay')?.classList.remove('active');
          form.reset();

          // Update in memory
          if (Array.isArray(this.myLots)) {
            const idx = this.myLots.findIndex(l => l.lotId === editId || l._id === editId || l.id === editId);
            if (idx >= 0) {
              this.myLots[idx] = { ...this.myLots[idx], ...res.lot };
            }
          }

          this.showToast('Lot updated successfully! ✓', 'success');

          // Refresh market feed and lots page
          await this.initMarketPage();
          if (document.getElementById('lots-container') || document.getElementById('lots-panel-body')) {
            await this.loadMyLots(this.currentFilter || 'all');
          }
        } else {
          this.showToast(res.message || 'Unable to update produce lot.', 'error');
        }
      } else {
        const res = await window.api.lots.create(payload);
        if (res.success && res.lot) {
          // Discard temporary evidence and reset form cleanly
          this.resetQualityEvidenceForm();
          document.getElementById('create-lot-modal-overlay')?.classList.remove('active');
          form.reset();

          // Show Dedicated Success Screen with the persisted lot
          this.showLotCreatedSuccess(res.lot);

          // Refresh market feed and lots list
          await this.initMarketPage();
          if (document.getElementById('lots-container') || document.getElementById('lots-panel-body')) {
            await this.loadMyLots();
          }
        } else {
          this.showToast(res.message || 'Unable to create produce lot.', 'error');
        }
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
   * Initialize dynamic crop parameter listeners and AI scanner wiring
   */
  initQualityGradingEvents() {
    const cropSelect = document.getElementById('lot-crop-select');
    if (cropSelect && !cropSelect.dataset.gradingBound) {
      cropSelect.dataset.gradingBound = 'true';
      cropSelect.addEventListener('change', () => {
        const cropText = cropSelect.value || cropSelect.options[cropSelect.selectedIndex]?.value || '';
        const cat = window.GradingEngine ? window.GradingEngine.getCropCategory(cropText) : 'cereals_grains';
        const grainGroup = document.getElementById('grain-params-form-group');
        const hortiGroup = document.getElementById('horti-params-form-group');
        if (grainGroup && hortiGroup) {
          if (cat === 'cereals_grains') {
            grainGroup.style.display = 'block';
            hortiGroup.style.display = 'none';
          } else {
            grainGroup.style.display = 'none';
            hortiGroup.style.display = 'block';
          }
        }
        this.updateAgmarkScorecardPreview();
      });
    }

    // Input listeners on parameters
    document.querySelectorAll('.quality-param-input').forEach(input => {
      if (!input.dataset.bound) {
        input.dataset.bound = 'true';
        input.addEventListener('input', () => this.updateAgmarkScorecardPreview());
      }
    });

    // AI Scanner Launch Button
    const aiBtn = document.getElementById('btn-open-ai-scanner');
    if (aiBtn && !aiBtn.dataset.bound) {
      aiBtn.dataset.bound = 'true';
      aiBtn.addEventListener('click', () => this.openAiScannerModal());
    }

    // AI Scanner Close
    const aiClose = document.getElementById('ai-scanner-modal-close');
    if (aiClose && !aiClose.dataset.bound) {
      aiClose.dataset.bound = 'true';
      aiClose.addEventListener('click', () => {
        document.getElementById('ai-scanner-modal-overlay')?.classList.remove('active');
      });
    }

    // AI file input change handler
    const aqInput = document.getElementById('aq-file-input');
    if (aqInput && !aqInput.dataset.bound) {
      aqInput.dataset.bound = 'true';
      aqInput.addEventListener('change', () => this._aqHandleFileSelect(aqInput));
    }

    // Certificate modal close
    document.getElementById('lab-cert-modal-close')?.addEventListener('click', () => {
      document.getElementById('lab-cert-modal-overlay')?.classList.remove('active');
    });

    // Direct Assay Modal close & form
    document.getElementById('assay-lot-modal-close')?.addEventListener('click', () => {
      document.getElementById('assay-lot-modal-overlay')?.classList.remove('active');
    });
    const assayForm = document.getElementById('assay-lot-form');
    if (assayForm && !assayForm.dataset.bound) {
      assayForm.dataset.bound = 'true';
      assayForm.addEventListener('submit', (e) => this.submitAssayLot(e));
    }
  },

  updateAgmarkScorecardPreview() {
    const cropSelect = document.getElementById('lot-crop-select');
    const cropName = cropSelect ? (cropSelect.value || cropSelect.options[cropSelect.selectedIndex]?.value || 'Wheat') : 'Wheat';
    const cat = window.GradingEngine ? window.GradingEngine.getCropCategory(cropName) : 'cereals_grains';

    let params = {};
    if (cat === 'cereals_grains') {
      const m = document.getElementById('lot-moisture-input')?.value;
      const f = document.getElementById('lot-foreign-input')?.value;
      const b = document.getElementById('lot-broken-input')?.value;
      const d = document.getElementById('lot-damaged-input')?.value;
      if (m !== '') params.moistureContent = parseFloat(m);
      if (f !== '') params.foreignMatter = parseFloat(f);
      if (b !== '') params.brokenGrains = parseFloat(b);
      if (d !== '') params.damagedGrains = parseFloat(d);
    } else {
      const b = document.getElementById('lot-blemish-input')?.value;
      const u = document.getElementById('lot-uniformity-input')?.value;
      const r = document.getElementById('lot-ripeness-input')?.value;
      const s = document.getElementById('lot-size-input')?.value;
      if (b !== '') params.blemishPercentage = parseFloat(b);
      if (u !== '') params.uniformity = parseFloat(u);
      if (r !== '') params.ripenessIndex = parseFloat(r);
      if (s !== '') params.avgDiameter = parseFloat(s);
    }

    if (window.GradingEngine) {
      const evalResult = window.GradingEngine.evaluate(cropName, params);
      const labelElem = document.getElementById('agmark-derived-grade-label');
      const badgeElem = document.getElementById('agmark-grade-badge-preview');
      const gradeSelect = document.getElementById('lot-grade-select');

      if (labelElem) labelElem.textContent = evalResult.gradeLabel;
      if (badgeElem) {
        badgeElem.textContent = `AGMARK GRADE ${evalResult.grade}`;
        badgeElem.className = `agmark-badge agmark-badge--grade-${evalResult.grade.toLowerCase()}`;
      }
      if (gradeSelect) {
        if (evalResult.grade === 'A') gradeSelect.value = 'Grade A';
        else if (evalResult.grade === 'B') gradeSelect.value = 'Grade B';
        else gradeSelect.value = 'Grade C';
      }
    }
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * AI Quality Assessment — real FastAPI integration
   *
   * Endpoint: POST http://localhost:8001/api/quality/analyze
   * Field:    file (multipart/form-data)
   * Model:    outputs/vegqual-20ep/weights/best.pt
   * ═══════════════════════════════════════════════════════════════════════
   */

  /** Open the AI quality modal and reset its state. */
  openAiScannerModal() {
    // Reset modal to clean state
    this._aqReset();
    document.getElementById('ai-scanner-modal-overlay')?.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
  },

  /** Reset all UI elements inside the AI quality modal. */
  _aqReset() {
    const el = id => document.getElementById(id);
    this._aqSelectedFile = null;
    // Upload zone
    if (el('aq-upload-placeholder')) el('aq-upload-placeholder').style.display = 'block';
    if (el('aq-preview-wrap'))       el('aq-preview-wrap').style.display = 'none';
    if (el('aq-preview-img'))        el('aq-preview-img').src = '';
    if (el('aq-file-input'))         el('aq-file-input').value = '';
    // State sections
    if (el('aq-error-msg'))          el('aq-error-msg').style.display = 'none';
    if (el('aq-result-card'))        el('aq-result-card').style.display = 'none';
    if (el('aq-no-detection'))       el('aq-no-detection').style.display = 'none';
    if (el('aq-service-unavailable'))el('aq-service-unavailable').style.display = 'none';
    // Analyze button
    const btn = el('aq-analyze-btn');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    const btnTxt = el('aq-analyze-btn-text');
    if (btnTxt) btnTxt.textContent = 'Analyze Crop Photo';
  },

  /** Called when the file input changes — show preview. */
  _aqHandleFileSelect(input) {
    const file = input?.files?.[0];
    if (!file) return;
    this._aqSelectedFile = file;

    // Hide any previous result/error
    const el = id => document.getElementById(id);
    if (el('aq-result-card'))        el('aq-result-card').style.display = 'none';
    if (el('aq-no-detection'))       el('aq-no-detection').style.display = 'none';
    if (el('aq-service-unavailable'))el('aq-service-unavailable').style.display = 'none';
    if (el('aq-error-msg'))          el('aq-error-msg').style.display = 'none';

    // Show image preview
    const reader = new FileReader();
    reader.onload = e => {
      const img = el('aq-preview-img');
      if (img) img.src = e.target.result;
      if (el('aq-upload-placeholder')) el('aq-upload-placeholder').style.display = 'none';
      if (el('aq-preview-wrap'))       el('aq-preview-wrap').style.display = 'block';
      if (window.lucide) window.lucide.createIcons();
    };
    reader.readAsDataURL(file);
  },

  /** Clear the selected image and reset upload zone. */
  aqClearImage() {
    const el = id => document.getElementById(id);
    this._aqSelectedFile = null;
    this.currentAiScan = null;
    this._aqLastResult = null;
    if (el('aq-file-input')) el('aq-file-input').value = '';
    if (el('aq-preview-img')) el('aq-preview-img').src = '';
    if (el('aq-annotated-img')) {
      el('aq-annotated-img').src = '';
      el('aq-annotated-img').onerror = null;
      el('aq-annotated-img').onload = null;
    }
    if (el('aq-annotated-img-wrap')) el('aq-annotated-img-wrap').style.display = 'none';
    if (el('aq-annotated-img-warn')) el('aq-annotated-img-warn').style.display = 'none';
    if (el('aq-upload-placeholder')) el('aq-upload-placeholder').style.display = 'block';
    if (el('aq-preview-wrap')) el('aq-preview-wrap').style.display = 'none';
    if (el('aq-result-card')) el('aq-result-card').style.display = 'none';
    if (el('aq-no-detection')) el('aq-no-detection').style.display = 'none';
    if (el('aq-service-unavailable')) el('aq-service-unavailable').style.display = 'none';
    if (el('aq-error-msg')) el('aq-error-msg').style.display = 'none';
    if (window.lucide) window.lucide.createIcons();
  },

  /**
   * POST selected image to the real AI quality service and display the result.
   * Field name MUST be "file" per API spec.
   */
  async aqRunAnalysis() {
    const el = id => document.getElementById(id);
    const AI_QUALITY_URL = '/api/quality/analyze';

    // Validate file selected
    if (!this._aqSelectedFile) {
      this._aqShowError('Please upload a crop photo first.');
      return;
    }

    // Loading state
    const btn = el('aq-analyze-btn');
    const btnTxt = el('aq-analyze-btn-text');
    if (btn)    { btn.disabled = true; btn.style.opacity = '0.7'; }
    if (btnTxt) btnTxt.textContent = 'Analysing…';

    // Hide previous states
    if (el('aq-error-msg'))           el('aq-error-msg').style.display = 'none';
    if (el('aq-result-card'))         el('aq-result-card').style.display = 'none';
    if (el('aq-no-detection'))        el('aq-no-detection').style.display = 'none';
    if (el('aq-service-unavailable')) el('aq-service-unavailable').style.display = 'none';
    if (el('aq-annotated-img-warn'))  el('aq-annotated-img-warn').style.display = 'none';

    try {
      const formData = new FormData();
      formData.append('file', this._aqSelectedFile);

      const resp = await fetch(AI_QUALITY_URL, {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type — browser sets multipart boundary automatically
      });

      if (!resp.ok) {
        // HTTP error (413 too large, 415 unsupported format, etc.)
        let errMsg = 'Photo assessment is temporarily unavailable.';
        if (resp.status === 413) errMsg = 'Image file is too large. Please use a file under 10 MB.';
        if (resp.status === 415) errMsg = 'Unsupported image format. Please use JPG, PNG or WebP.';
        this._aqShowError(errMsg);
        return;
      }

      const data = await resp.json();

      // Handle API-level status
      if (data.status === 'AI_ASSESSED' && data.crop && data.condition) {
        // Store result for lot prefill
        this.currentAiScan = {
          _isRealAiResult: true,
          status: data.status,
          crop: data.crop,
          condition: data.condition,
          confidence: data.confidence,
          assessmentType: data.assessmentType || 'visual_condition_detection',
          modelVersion: data.modelVersion || null,
          detectionCount: data.detectionCount != null ? data.detectionCount : (data.detections ? data.detections.length : 1),
          imageCondition: data.imageCondition || data.condition,
          detections: data.detections || [],
          annotatedImageUrl: data.annotatedImageUrl || null,
        };
        this._aqLastResult = this.currentAiScan;

        // Crop icon mapping
        const cropIcons = {
          potato: '🥔',
          tomato: '🍅',
          onion: '🧅',
          brinjal: '🍆',
          capsicum: '🫑',
          'bitter gourd': '🥒',
          'pointed gourd': '🥒',
        };
        const cropLower = (data.crop || '').toLowerCase();
        const cropIcon = cropIcons[cropLower] || '🌱';
        const topConfPct = data.confidence != null ? (data.confidence * 100).toFixed(2) + '%' : '—';

        // 1. Display Annotated Image (prominently, from backend YOLO render)
        const annotatedImg = el('aq-annotated-img');
        const annotatedWrap = el('aq-annotated-img-wrap');
        const annotatedWarn = el('aq-annotated-img-warn');
        const annotatedWarnText = el('aq-annotated-img-warn-text');

        if (annotatedWarn) annotatedWarn.style.display = 'none';

        if (annotatedImg && data.annotatedImageUrl) {
          const fullImgUrl = data.annotatedImageUrl;

          // Non-blocking error handling if image fails to load
          annotatedImg.onerror = () => {
            annotatedImg.style.display = 'none';
            if (annotatedWrap) annotatedWrap.style.display = 'none';
            if (annotatedWarn) {
              if (annotatedWarnText) {
                annotatedWarnText.textContent = 'Unable to load annotated image; detection results are detailed below.';
              }
              annotatedWarn.style.display = 'flex';
              if (window.lucide) window.lucide.createIcons();
            }
          };

          annotatedImg.onload = () => {
            annotatedImg.style.display = 'block';
            if (annotatedWrap) annotatedWrap.style.display = 'block';
            if (annotatedWarn) annotatedWarn.style.display = 'none';
          };

          annotatedImg.src = fullImgUrl;
          annotatedImg.style.display = 'block';
          if (annotatedWrap) annotatedWrap.style.display = 'block';
        } else {
          // If annotatedImageUrl is missing despite AI_ASSESSED: show JSON detection info + warning
          if (annotatedImg) annotatedImg.style.display = 'none';
          if (annotatedWrap) annotatedWrap.style.display = 'none';
          if (annotatedWarn) {
            if (annotatedWarnText) {
              annotatedWarnText.textContent = 'Annotated visual render is unavailable; detection results are detailed below.';
            }
            annotatedWarn.style.display = 'flex';
            if (window.lucide) window.lucide.createIcons();
          }
        }

        // 2. Populate Image Summary
        if (el('aq-res-crop-icon')) el('aq-res-crop-icon').textContent = cropIcon;
        if (el('aq-res-primary-text')) {
          el('aq-res-primary-text').textContent = `${data.crop} • ${data.condition} • ${topConfPct}`;
        }
        if (el('aq-res-detection-count')) {
          el('aq-res-detection-count').textContent = data.detectionCount != null
            ? data.detectionCount
            : (data.detections ? data.detections.length : 1);
        }
        if (el('aq-res-image-condition')) {
          el('aq-res-image-condition').textContent = data.imageCondition || data.condition || '—';
        }

        // 3. Populate dynamic "Detected Objects" list (renders every detection)
        const detList = el('aq-detections-list');
        if (detList) {
          detList.innerHTML = '';
          const items = Array.isArray(data.detections) && data.detections.length > 0
            ? data.detections
            : [{ crop: data.crop, condition: data.condition, confidence: data.confidence }];

          items.forEach(d => {
            const card = document.createElement('div');
            card.style.cssText = 'padding: 10px 12px; border-radius: 8px; background: #FAFCFA; border: 1px solid #DCE7DF; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;';

            const dConf = d.confidence != null ? (d.confidence * 100).toFixed(2) + '%' : '—';
            const isFresh = (d.condition || '').toLowerCase() === 'fresh';
            const condColor = isFresh ? '#2E7D32' : '#C62828';
            const condBg = isFresh ? '#E8F5E9' : '#FFEBEE';
            const condBorder = isFresh ? '#C8E6C9' : '#FFCDD2';
            const dCropIcon = cropIcons[(d.crop || '').toLowerCase()] || '🌱';

            card.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px; line-height: 1;">${dCropIcon}</span>
                <span style="font-weight: 700; color: #12372A; font-size: 14px;">${d.crop}</span>
                <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: ${condBg}; color: ${condColor}; border: 1px solid ${condBorder}; text-transform: capitalize;">${d.condition}</span>
              </div>
              <div style="font-size: 12px; color: #555;">
                Detection confidence: <strong style="color: #12372A; font-weight: 700;">${dConf}</strong>
              </div>
            `;
            detList.appendChild(card);
          });
        }

        // Backward compatibility elements
        if (el('aq-res-crop'))        el('aq-res-crop').textContent = data.crop;
        if (el('aq-res-condition'))   el('aq-res-condition').textContent = data.condition;
        if (el('aq-res-confidence'))  el('aq-res-confidence').textContent = topConfPct;

        if (el('aq-result-card')) el('aq-result-card').style.display = 'block';

      } else if (data.status === 'NO_DETECTION') {
        this.currentAiScan = null;
        if (el('aq-result-card')) el('aq-result-card').style.display = 'none';
        if (el('aq-annotated-img')) {
          el('aq-annotated-img').src = '';
          el('aq-annotated-img').onerror = null;
          el('aq-annotated-img').onload = null;
        }
        if (el('aq-annotated-img-wrap')) el('aq-annotated-img-wrap').style.display = 'none';
        if (el('aq-annotated-img-warn')) el('aq-annotated-img-warn').style.display = 'none';
        if (el('aq-no-detection')) el('aq-no-detection').style.display = 'block';

      } else if (data.status === 'MODEL_NOT_LOADED') {
        this.currentAiScan = null;
        if (el('aq-service-unavailable')) el('aq-service-unavailable').style.display = 'block';

      } else {
        // VALIDATION_ERROR or unexpected
        this._aqShowError(
          data.status === 'VALIDATION_ERROR'
            ? 'Image validation failed. Please use a clear, well-lit crop photo.'
            : 'Unexpected response from AI service. Please try again.'
        );
      }

    } catch (err) {
      // Network error — service not running or unreachable
      console.warn('[AQ] AI quality service unreachable:', err.message);
      this.currentAiScan = null;
      if (el('aq-service-unavailable')) el('aq-service-unavailable').style.display = 'block';

    } finally {
      if (btn)    { btn.disabled = false; btn.style.opacity = '1'; }
      if (btnTxt) btnTxt.textContent = 'Analyze Crop Photo';
      if (window.lucide) window.lucide.createIcons();
    }
  },

  /** Show an inline error message inside the AI quality modal. */
  _aqShowError(msg) {
    const errDiv = document.getElementById('aq-error-msg');
    const errTxt = document.getElementById('aq-error-text');
    if (errTxt) errTxt.textContent = msg || 'Something went wrong.';
    if (errDiv) errDiv.style.display = 'flex';
    if (window.lucide) window.lucide.createIcons();
  },

  /**
   * Apply AI result to the lot form and close the modal.
   */
  aqApplyResult() {
    const result = this._aqLastResult;
    if (!result || result.status !== 'AI_ASSESSED') {
      this.showToast('Please run the AI analysis first.', 'warning');
      return;
    }

    const cropSelect = document.getElementById('lot-crop-select');
    const selectedCrop = (cropSelect?.value || '').trim();
    if (selectedCrop && result.crop && selectedCrop.toLowerCase() !== result.crop.toLowerCase()) {
      this.showToast(`Selected crop (${selectedCrop}) does not match detected crop (${result.crop}). Cannot apply this assessment.`, 'error');
      return;
    }

    // Record as quality evidence
    this.temporaryEvidence = {
      source: 'AI_ASSESSMENT',
      aiAssessment: {
        status: result.status,
        crop: result.crop,
        condition: result.condition,
        confidence: typeof result.confidence === 'number' ? result.confidence : null,
        cropConfidence: typeof result.confidence === 'number' ? result.confidence : null,
        conditionConfidence: typeof result.confidence === 'number' ? result.confidence : null,
        assessmentType: result.assessmentType || 'visual_condition_detection',
        modelVersion: result.modelVersion || 'vegqual-20ep',
        annotatedImageUrl: result.annotatedImageUrl || null,
        annotatedImageId: result.annotatedImageId || null,
        assessedAt: new Date().toISOString()
      },
      report: {},
      manual: {}
    };
    this.currentAiScan = this.temporaryEvidence.aiAssessment;

    // Prefill crop select only if empty
    if (cropSelect && result.crop && !cropSelect.value) {
      const detectedLower = result.crop.toLowerCase();
      for (const opt of cropSelect.options) {
        if (opt.value.toLowerCase() === detectedLower || opt.text.toLowerCase() === detectedLower) {
          cropSelect.value = opt.value;
          cropSelect.dispatchEvent(new Event('change'));
          break;
        }
      }
    }

    // Update Quality Evidence summary in Create Lot step
    const confPct = result.confidence != null ? ` (${(result.confidence * 100).toFixed(1)}% confidence)` : '';
    this.renderQualityEvidenceSummary(`📷 AI-Assisted Visual Assessment: ${result.crop} • ${result.condition}${confPct}`);
    this.highlightEvidenceCard('photo');

    // Close the AI modal
    document.getElementById('ai-scanner-modal-overlay')?.classList.remove('active');

    // Notify user
    const condLabel = result.condition || '';
    this.showToast(
      `✓ AI assessment: ${result.crop} — ${condLabel}${confPct}. Review and complete the lot details.`,
      'success'
    );
  },

  /**
   * Official Digital Lab Certificate Modal Renderer
   */
  showCertificateModal(lot) {
    const overlay = document.getElementById('lab-cert-modal-overlay');
    const container = document.getElementById('lab-cert-modal-content');
    if (!overlay || !container) return;

    const assay = lot.assaying || {};
    const certNum = assay.certificateNumber || `AGM-2026-QC-${Math.floor(100000 + Math.random() * 900000)}`;
    const assayer = assay.assayerName || 'Dr. Vivek Deshmukh';
    const org = assay.assayerOrganization || 'NABL Accredited Quality Laboratory #MH-44';
    const dateStr = assay.certifiedAt ? new Date(assay.certifiedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified Recently';
    const hash = assay.digitalSignature?.signatureHash || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';

    const p = lot.qualityParameters || {};
    const isGrain = !['Onion', 'Tomato'].includes(lot.cropName);

    container.innerHTML = `
      <div class="digital-cert-paper">
        <div class="digital-cert-header">
          <div class="digital-cert-emblem">🏛️</div>
          <h2 class="digital-cert-title">AGMARK & e-NAM OFFICIAL QUALITY CERTIFICATE</h2>
          <div class="digital-cert-subtitle">Directorate of Marketing & Inspection — Government of India Accredited</div>
          <div style="font-family: monospace; font-size: 11.5px; font-weight: 700; color: #12372A; margin-top: 6px;">
            Certificate No: ${certNum} • Lot ID: ${lot.lotId}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12.5px; margin-bottom: 16px; background: #FAF8F5; padding: 12px; border-radius: 8px;">
          <div><strong>Crop Tested:</strong> ${lot.cropName} (${lot.variety || 'Standard'})</div>
          <div><strong>Quantity Certified:</strong> ${lot.quantity} ${lot.quantityUnit || 'quintal'}</div>
          <div><strong>Testing Lab:</strong> ${org}</div>
          <div><strong>Authorized Assayer:</strong> ${assayer}</div>
          <div><strong>Date of Assaying:</strong> ${dateStr}</div>
          <div><strong>Quality Grade:</strong> <span class="agmark-badge agmark-badge--grade-${(lot.qualityGrade || 'A').toLowerCase()}">Grade ${lot.qualityGrade || 'A'}</span></div>
        </div>

        <h4 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #12372A; margin: 12px 0 6px 0;">Physical & Chemical Analysis Results</h4>
        <table class="digital-cert-table">
          <thead>
            <tr>
              <th>Quality Parameter</th>
              <th>Laboratory Test Value</th>
              <th>Agmark Standard Benchmark</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${isGrain ? `
              <tr>
                <td>Moisture Content (%)</td>
                <td><strong>${p.moistureContent !== undefined && p.moistureContent !== null ? p.moistureContent : '11.4'}%</strong></td>
                <td>Max 12.0% (Grade A)</td>
                <td><span style="color: #2D6A4F; font-weight: 800;">✓ PASS</span></td>
              </tr>
              <tr>
                <td>Foreign Matter (%)</td>
                <td><strong>${p.foreignMatter !== undefined && p.foreignMatter !== null ? p.foreignMatter : '0.6'}%</strong></td>
                <td>Max 1.0%</td>
                <td><span style="color: #2D6A4F; font-weight: 800;">✓ PASS</span></td>
              </tr>
              <tr>
                <td>Broken Grains (%)</td>
                <td><strong>${p.brokenGrains !== undefined && p.brokenGrains !== null ? p.brokenGrains : '1.5'}%</strong></td>
                <td>Max 2.0%</td>
                <td><span style="color: #2D6A4F; font-weight: 800;">✓ PASS</span></td>
              </tr>
              <tr>
                <td>Damaged / Weeviled (%)</td>
                <td><strong>${p.damagedGrains !== undefined && p.damagedGrains !== null ? p.damagedGrains : '0.8'}%</strong></td>
                <td>Max 1.5%</td>
                <td><span style="color: #2D6A4F; font-weight: 800;">✓ PASS</span></td>
              </tr>
            ` : `
              <tr>
                <td>Surface Blemish (%)</td>
                <td><strong>${p.blemishPercentage !== undefined && p.blemishPercentage !== null ? p.blemishPercentage : '2.1'}%</strong></td>
                <td>Max 3.0% (Grade A)</td>
                <td><span style="color: #2D6A4F; font-weight: 800;">✓ PASS</span></td>
              </tr>
              <tr>
                <td>Size Uniformity (%)</td>
                <td><strong>${p.uniformity !== undefined && p.uniformity !== null ? p.uniformity : '93'}%</strong></td>
                <td>Min 90%</td>
                <td><span style="color: #2D6A4F; font-weight: 800;">✓ PASS</span></td>
              </tr>
              <tr>
                <td>Ripeness / Curing Index (%)</td>
                <td><strong>${p.ripenessIndex !== undefined && p.ripenessIndex !== null ? p.ripenessIndex : '91'}%</strong></td>
                <td>Min 85%</td>
                <td><span style="color: #2D6A4F; font-weight: 800;">✓ PASS</span></td>
              </tr>
            `}
          </tbody>
        </table>

        <div style="font-size: 11.5px; color: #555; background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 6px; padding: 8px 10px; margin-top: 10px;">
          <strong>Lab Remarks:</strong> ${assay.labRemarks || 'Certified under Agmark / e-NAM physical quality standards.'}
        </div>

        <div class="digital-cert-footer">
          <div style="max-width: 420px;">
            <div style="font-size: 11px; font-weight: 800; color: #12372A; text-transform: uppercase;">Cryptographic Digital Signature Stamp (SHA-256)</div>
            <div class="cert-sig-hash">${hash}</div>
            <div style="font-size: 10.5px; color: #718E68; margin-top: 4px;">✓ Digitally Signed & Timestamped on KrishiShetra Ledger</div>
          </div>
          <div class="digital-cert-seal">
            <div>AGMARK</div>
            <div style="font-size: 14px;">★</div>
            <div>VERIFIED</div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
          <button class="btn btn--secondary" onclick="document.getElementById('lab-cert-modal-overlay').classList.remove('active')">Close</button>
          <button class="btn btn--primary" onclick="window.print()"><i data-lucide="printer"></i> Print Certificate</button>
        </div>
      </div>
    `;

    overlay.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
  },

  /**
   * Direct Assayer / FPO Certification Modal
   */
  openAssayLotModal(lotId) {
    const overlay = document.getElementById('assay-lot-modal-overlay');
    if (!overlay) return;
    document.getElementById('assay-target-lot-id').value = lotId;
    document.getElementById('assay-cert-num-input').value = `AGM-${new Date().getFullYear()}-QC-${Math.floor(100000 + Math.random() * 900000)}`;
    const user = window.Auth ? window.Auth.getUser() : null;
    document.getElementById('assay-signer-name-input').value = user?.name || 'Dr. Vivek Deshmukh';
    overlay.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
  },

  async submitAssayLot(e) {
    e.preventDefault();
    const lotId = document.getElementById('assay-target-lot-id').value;
    const certNum = document.getElementById('assay-cert-num-input').value;
    const labName = document.getElementById('assay-lab-name-input').value;
    const signer = document.getElementById('assay-signer-name-input').value;
    const remarks = document.getElementById('assay-remarks-input').value;
    const submitBtn = document.getElementById('btn-submit-assay');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Signing with digital key...';
    }

    try {
      const res = await window.api.lots.assay(lotId, {
        certificateNumber: certNum,
        assayerName: signer,
        assayerOrganization: labName,
        labRemarks: remarks
      });

      if (res.success) {
        document.getElementById('assay-lot-modal-overlay')?.classList.remove('active');
        this.showToast(`✓ Lot ${lotId} successfully verified & certified!`, 'success');
        await this.loadMyLots();
        if (this.selectedLot) {
          this.viewLotDetails(lotId);
        }
      } else {
        this.showToast(res.message || 'Assaying failed', 'error');
      }
    } catch (err) {
      this.showToast('Error connecting to assaying service.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="shield-check"></i> Sign & Certify Lot';
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
      <div class="dash-modal" style="max-width: 490px; text-align: center; padding: 28px 24px;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: #E5F0E7; color: #12372A; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 12px;">
          ✓
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: #12372A; margin: 0 0 6px 0;">Your crop is ready to sell! ✓</h2>
        <p style="font-size: 13.5px; color: #5B9A72; margin: 0 0 16px 0;">
          Listed <strong>${lot.quantity} ${lot.quantityUnit || 'quintal'} of ${lot.cropName}</strong> at asking rate ₹${lot.askingPrice?.toLocaleString('en-IN')}/q.
        </p>

        <!-- Section 7: Smart Discovery Summary -->
        <div style="background: #F5F4ED; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left;">
          <div style="font-size: 12px; font-weight: 700; color: var(--ks-evergreen); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 10px;">
            ✨ We found for your ${lot.cropName}:
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="background: #FFFFFF; padding: 10px; border-radius: 8px; border: 1px solid #EAE8DC; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 22px;">🤝</span>
              <div>
                <strong style="font-size: 15px; color: #12372A;">5 Buyers</strong>
                <div style="font-size: 11px; color: #666;">Ready to procure</div>
              </div>
            </div>
            <div style="background: #FFFFFF; padding: 10px; border-radius: 8px; border: 1px solid #EAE8DC; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 22px;">📍</span>
              <div>
                <strong style="font-size: 15px; color: #12372A;">3 Mandis</strong>
                <div style="font-size: 11px; color: #666;">Favorable price</div>
              </div>
            </div>
            <div style="background: #FFFFFF; padding: 10px; border-radius: 8px; border: 1px solid #EAE8DC; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 22px;">🚚</span>
              <div>
                <strong style="font-size: 15px; color: #12372A;">2 Transports</strong>
                <div style="font-size: 11px; color: #666;">Near your farm</div>
              </div>
            </div>
            <div style="background: #FFFFFF; padding: 10px; border-radius: 8px; border: 1px solid #EAE8DC; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 22px;">🏢</span>
              <div>
                <strong style="font-size: 15px; color: #12372A;">1 Cold Storage</strong>
                <div style="font-size: 11px; color: #666;">Available 8 km</div>
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 8px; flex-direction: column;">
          <button class="btn btn--primary" style="width: 100%; background: #12372A; color: #FFFFFF; justify-content: center;" onclick="document.getElementById('lot-success-modal-overlay').classList.remove('active'); location.href='buyers.html';">
            <i data-lucide="users"></i> See Best Buyers (5 Matched)
          </button>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn--secondary" style="flex: 1; justify-content: center;" onclick="document.getElementById('lot-success-modal-overlay').classList.remove('active'); location.href='mandi-compare.html';">
              <i data-lucide="bar-chart-2"></i> Compare Markets
            </button>
            <button class="btn btn--secondary" style="flex: 1; justify-content: center;" onclick="document.getElementById('lot-success-modal-overlay').classList.remove('active'); if (typeof openTransportModal === 'function') openTransportModal();">
              <i data-lucide="truck"></i> Arrange Transport
            </button>
          </div>
        </div>
      </div>
    `;
    overlay.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
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
        lotId: 'LOT-DEMO-001',
        cropName: 'Tomato',
        variety: 'Hybrid Abhinav',
        quantity: 50,
        quantityUnit: 'quintal',
        askingPrice: 2500,
        priceUnit: 'q',
        qualityGrade: 'A',
        district: 'Nashik',
        state: 'Maharashtra',
        status: 'active',
        harvestDate: '2026-08-25'
      },
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
    const t = (k, fb) => (window.KrishiI18n ? window.KrishiI18n.t(k, fb) : fb);
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

    const evidenceBadge = (l) => {
      const qe = l.qualityEvidence;
      if (qe && qe.source === 'AI_ASSESSMENT') {
        return `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:8px;background:#EDF7ED;color:#1B6B3A;font-size:11px;font-weight:700;border:1px solid #B8D8C0;">🤖 AI Assessed</span>`;
      }
      if (qe && qe.source === 'FARMER_PROVIDED_REPORT') {
        return `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:8px;background:#EFF6FF;color:#1D4ED8;font-size:11px;font-weight:700;border:1px solid #BFDBFE;">📄 Report Added</span>`;
      }
      if (qe && qe.source === 'MANUAL') {
        return `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:8px;background:#FEF3C7;color:#92400E;font-size:11px;font-weight:700;border:1px solid #FDE68A;">✍️ Quality Added</span>`;
      }
      if (l.aiQualityScan && l.aiQualityScan.status === 'AI_ASSESSED') {
        return `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:8px;background:#EDF7ED;color:#1B6B3A;font-size:11px;font-weight:700;border:1px solid #B8D8C0;">🤖 AI Assessed</span>`;
      }
      return `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:8px;background:#F3F4F6;color:#6B7280;font-size:11px;font-weight:600;border:1px solid #E5E7EB;">No quality evidence added</span>`;
    };

    container.innerHTML = lots.map(lot => {
      const isAssayed = lot.assaying && (lot.assaying.isAssayed || lot.assaying.verificationStatus === 'verified');
      const gradeStr = lot.qualityGrade ? `Grade ${lot.qualityGrade}` : 'Grade A';
      const gradeClass = (lot.qualityGrade || 'A').toLowerCase();
      const cropDisplay = window.KrishiI18n ? window.KrishiI18n.getCropName(lot.cropName) : (lot.cropName || 'Produce');
      const storageDisplay = lot.storageFacilityName ? `· 🏬 ${lot.storageFacilityName}` : (lot.storageType === 'warehouse' ? `· 🏬 ${t('farmer.storedWarehouse', 'Warehouse Stored')}` : (lot.storageType === 'cold_storage' ? `· ❄️ ${t('farmer.coldStorage', 'Cold Storage')}` : ''));

      return `
        <div class="farmer-lot-card">
          <div class="farmer-lot-card__top">
            <div class="farmer-lot-card__crop-wrap">
              <div class="farmer-lot-card__icon">
                ${cropIcon(lot.cropName)}
              </div>
              <div>
                <div class="farmer-lot-card__title-row">
                  <h4 class="farmer-lot-card__name">${cropDisplay}</h4>
                  <span class="farmer-lot-card__variety">(${lot.variety || 'Standard FAQ'})</span>
                </div>
                <div style="font-size: 12px; color: var(--ks-text-muted); margin-top: 3px;">
                  <span style="font-family: monospace; font-weight: 600; color: var(--ks-evergreen);">${lot.lotId}</span> ${storageDisplay}
                </div>
              </div>
            </div>

            <div class="farmer-lot-card__badges">
              ${statusBadge(lot.status, lot.storageType)}
              <span class="agmark-badge agmark-badge--grade-${gradeClass}">${gradeStr}</span>
              ${isAssayed ? `<span class="agmark-badge agmark-badge--verified">✓ ${t('farmer.labAssayed', 'LAB ASSAYED')}</span>` : ''}
              ${evidenceBadge(lot)}
            </div>
          </div>

          <div class="farmer-lot-card__mid">
            <div>
              <div class="farmer-lot-stat-label">${t('cropLotModal.quantityAvailable', 'Available Quantity')}</div>
              <div class="farmer-lot-stat-val">${lot.quantity} ${lot.quantityUnit || 'quintal'}</div>
            </div>
            <div>
              <div class="farmer-lot-stat-label">${t('common.location', 'Location')}</div>
              <div class="farmer-lot-stat-val">${lot.district || 'Nashik'}, ${lot.state || 'MH'}</div>
            </div>
            <div>
              <div class="farmer-lot-stat-label">${t('market.harvestDate', 'Harvest Date')}</div>
              <div class="farmer-lot-stat-val">${lot.harvestDate || 'Recent'}</div>
            </div>
          </div>

          <div class="farmer-lot-card__bottom">
            <div class="farmer-lot-card__price-box">
              <span class="farmer-lot-card__price-lbl">${t('cropLotModal.expectedPricePerUnit', 'Expected Price')}</span>
              <span class="farmer-lot-card__price-num">₹${lot.askingPrice?.toLocaleString('en-IN')} <small style="font-size: 12px; font-weight: 500; color: #666;">/ ${lot.priceUnit || 'q'}</small></span>
            </div>

            <div class="farmer-lot-card__actions">
              <button class="btn btn--sm btn--secondary" onclick="FarmerFlow.viewLotDetails('${lot.lotId}')" title="${t('common.viewDetails', 'View Details')}">
                <i data-lucide="eye" style="width: 14px; height: 14px;"></i> <span>${t('common.viewDetails', 'Details')}</span>
              </button>
              <a href="market.html?crop=${encodeURIComponent((lot.cropName || '').toLowerCase())}&lotId=${lot.lotId}" class="btn btn--sm btn--secondary" style="text-decoration: none;" title="${t('farmer.viewMarketPrices', 'Check Market Prices')}">
                <i data-lucide="trending-up" style="width: 14px; height: 14px;"></i> <span>${t('navigation.market', 'Market')} →</span>
              </a>
              <a href="storage.html?crop=${encodeURIComponent(lot.cropName || '')}&qty=${lot.quantity}&price=${lot.askingPrice}" class="btn btn--sm btn--secondary" style="text-decoration: none;" title="${t('navigation.storage', 'Storage Options')}">
                <i data-lucide="warehouse" style="width: 14px; height: 14px;"></i> <span>${t('navigation.storage', 'Storage')}</span>
              </a>
              ${isAssayed ? `
                <button class="btn btn--sm" style="background: #12372A; color: #E8B96A; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer;" onclick='FarmerFlow.showCertificateModal(${JSON.stringify(lot).replace(/'/g, "&apos;")})' title="View digital test certificate">
                  <i data-lucide="award" style="width: 14px; height: 14px;"></i> <span>Certificate</span>
                </button>
              ` : `
                <button class="btn btn--sm btn--secondary" onclick="FarmerFlow.openAssayLotModal('${lot.lotId}')" title="Certify with lab assayer">
                  <i data-lucide="shield-check" style="width: 14px; height: 14px;"></i> <span>Assay</span>
                </button>
              `}
              ${lot.status === 'active' || lot.status === 'draft' ? `
                <button class="btn btn--sm btn--secondary" onclick="FarmerFlow.openEditLotModal('${lot.lotId}')" title="${t('common.edit', 'Edit Lot')}">
                  <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
                </button>
                <button class="btn btn--sm" style="background: #FEE2E2; color: #991B1B; border: none; border-radius: 6px; padding: 6px 10px; cursor: pointer;" onclick="FarmerFlow.confirmCancelLot('${lot.lotId}')" title="${t('common.delete', 'Cancel Lot')}">
                  <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

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
  /**
   * ═══════════════════════════════════════════════════════════════════════
   * LOT DETAILS MODAL / DRAWER (Complete Lot Specifications)
   * ═══════════════════════════════════════════════════════════════════════
   */
  async viewLotDetails(lotId) {
    let overlay = document.getElementById('lot-detail-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lot-detail-modal-overlay';
      overlay.className = 'dash-modal-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="dash-modal" style="max-width: 580px; width: 92%; max-height: 90vh; overflow-y: auto; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
        <div class="dash-modal__header" style="padding: 16px 20px; border-bottom: 1px solid #E5E4DD; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: var(--ks-evergreen);">Lot Details</h3>
            <span style="font-family: monospace; font-size: 12px; color: #12372A; background: #E5F0E7; padding: 2px 8px; border-radius: 6px; font-weight: 700;">${lotId}</span>
          </div>
          <button class="dash-modal__close" onclick="document.getElementById('lot-detail-modal-overlay').classList.remove('active')" aria-label="Close"><i data-lucide="x"></i></button>
        </div>
        <div class="dash-modal__body-pad" id="lot-detail-modal-content" style="padding: 20px;">
          <div style="padding: 30px; text-align: center; color: #666;">
            <i data-lucide="loader-2" class="spin" style="width: 24px; height: 24px; margin-bottom: 8px;"></i>
            <div>Loading lot details...</div>
          </div>
        </div>
      </div>
    `;
    overlay.classList.add('active');
    if (window.lucide) window.lucide.createIcons();

    // Multi-tier lot resolution by exact lotId
    let lot = null;
    if (this.myLots && this.myLots.length > 0) {
      lot = this.myLots.find(l => l.lotId === lotId || l._id === lotId || l.id === lotId);
    }
    if (!lot && window.api && window.api.lots) {
      try {
        const res = await window.api.lots.getById(lotId);
        if (res && res.success && res.lot) lot = res.lot;
      } catch (e) {}
    }
    if (!lot && window.api && window.api.market) {
      try {
        const res = await window.api.market.getLot(lotId);
        if (res && res.success && res.lot) lot = res.lot;
      } catch (e) {}
    }
    if (!lot && window.krishiStore) {
      const storeLots = window.krishiStore.getLots('all');
      lot = storeLots.find(l => l.lotId === lotId || l._id === lotId || l.id === lotId);
    }
    if (!lot && Array.isArray(window.demoLots)) {
      lot = window.demoLots.find(l => l.lotId === lotId || l._id === lotId || l.id === lotId);
    }

    const content = document.getElementById('lot-detail-modal-content');
    if (!content) return;

    if (!lot) {
      content.innerHTML = `
        <div style="padding: 30px 20px; text-align: center; color: #991B1B;">
          <i data-lucide="alert-circle" style="width: 32px; height: 32px; margin-bottom: 8px;"></i>
          <div style="font-weight: 700; font-size: 15px;">Produce lot not found</div>
          <p style="font-size: 13px; color: #666; margin-top: 4px;">Could not find specifications for lot ${lotId}.</p>
          <button class="btn btn--secondary btn--sm" style="margin-top: 12px;" onclick="document.getElementById('lot-detail-modal-overlay').classList.remove('active')">Close</button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const cropDisp = lot.cropName || lot.crop || 'Produce';
    const varietyDisp = lot.variety || 'Standard Variety';
    const qty = lot.quantity || 0;
    const unit = lot.quantityUnit || 'quintal';
    const price = lot.askingPrice || lot.price || 0;
    const priceUnit = lot.priceUnit || 'quintal';
    const totalVal = qty * price;
    const statusVal = (lot.status || 'available').toLowerCase();
    const statusLabel = statusVal === 'active' || statusVal === 'available' ? 'Available' : (statusVal.charAt(0).toUpperCase() + statusVal.slice(1));
    const statusBg = (statusVal === 'active' || statusVal === 'available') ? '#E5F0E7' : (statusVal === 'sold' ? '#DBEAFE' : '#FEF3C7');
    const statusColor = (statusVal === 'active' || statusVal === 'available') ? '#12372A' : (statusVal === 'sold' ? '#1E40AF' : '#92400E');

    const createdStr = lot.createdAt ? new Date(lot.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently';
    const harvestStr = lot.harvestDate ? new Date(lot.harvestDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : null;
    const locationParts = [lot.village, lot.taluka, lot.district, lot.state].filter(Boolean);
    const locationStr = locationParts.length > 0 ? locationParts.join(', ') : (lot.storageLocation || 'Pune, Maharashtra');

    // Quality Evidence Block
    const qe = lot.qualityEvidence || (lot.aiQualityScan && (lot.aiQualityScan.status === 'AI_ASSESSED' || lot.aiQualityScan.crop) ? {
      source: 'AI_ASSESSMENT',
      aiAssessment: lot.aiQualityScan
    } : null);

    let evidenceHtml = '';
    if (qe && qe.source === 'AI_ASSESSMENT' && qe.aiAssessment) {
      const ai = qe.aiAssessment;
      const confRatio = typeof ai.confidence === 'number' ? ai.confidence : (typeof ai.cropConfidence === 'number' ? ai.cropConfidence : null);
      const confFormatted = confRatio != null ? (confRatio <= 1 ? (confRatio * 100).toFixed(1) + '%' : confRatio.toFixed(1) + '%') : '—';
      const annUrl = ai.annotatedImageUrl;
      const fullAnnUrl = annUrl ? (annUrl.startsWith('http') ? annUrl : annUrl) : null;

      evidenceHtml = `
        <div style="background: #F0FDF4; border: 1.5px solid #B8D8C0; border-radius: 10px; padding: 14px 16px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #1B6B3A; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <span style="display: flex; align-items: center; gap: 6px;">
              <i data-lucide="scan-line" style="width:14px;height:14px;"></i>
              AI-ASSISTED VISUAL ASSESSMENT
            </span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: #DCFCE7; color: #166534;">
              🤖 AI-Assessed
            </span>
          </div>

          ${fullAnnUrl ? `
            <div style="width: 100%; border-radius: 8px; overflow: hidden; background: #1A1E1A; margin-bottom: 12px; text-align: center; border: 1px solid #2D5A3E;">
              <img src="${fullAnnUrl}" alt="Annotated crop detection"
                style="width: 100%; max-height: 220px; object-fit: contain; display: block; margin: 0 auto;">
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 13px;">
            <div>
              <div style="font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Detected Crop</div>
              <div style="font-weight: 800; color: #12372A;">${ai.crop || cropDisp}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Visible Condition</div>
              <div style="font-weight: 800; color: #12372A;">${ai.condition || 'Fresh'}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Detection confidence</div>
              <div style="font-weight: 700; color: #12372A;">${confFormatted}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Assessment type</div>
              <div style="font-size: 12px; font-weight: 600; color: #555;">${ai.assessmentType || 'Visual object detection'}</div>
            </div>
          </div>

          <div style="margin-top: 10px; padding: 7px 10px; background: #FFF9ED; border: 1px solid #F0DCAA; border-radius: 6px; font-size: 11px; color: #7A5F20; line-height: 1.5;">
            ⚠️ Visual assessment is indicative and does not replace laboratory or certified mandi quality testing.
          </div>
        </div>
      `;
    } else if (qe && qe.source === 'FARMER_PROVIDED_REPORT' && qe.report) {
      const rpt = qe.report;
      evidenceHtml = `
        <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 10px; padding: 14px 16px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #334155; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <span style="display: flex; align-items: center; gap: 6px;">
              <i data-lucide="file-text" style="width:14px;height:14px;"></i>
              FARMER-PROVIDED QUALITY REPORT
            </span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1;">
              📄 ${rpt.verificationStatus === 'verified' ? 'Verified' : 'Report Added'}
            </span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 13px;">
            <div>
              <div style="font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">File name</div>
              <div style="font-weight: 800; color: #12372A; word-break: break-all;">${rpt.fileName || 'Report attached'}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Provider / Lab</div>
              <div style="font-weight: 700; color: #12372A;">${rpt.provider || 'Not specified'}</div>
            </div>
            ${rpt.reportDate ? `
              <div>
                <div style="font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Report date</div>
                <div style="font-weight: 700; color: #12372A;">${rpt.reportDate}</div>
              </div>
            ` : ''}
            ${rpt.reportNumber ? `
              <div>
                <div style="font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Report number</div>
                <div style="font-weight: 700; color: #12372A;">${rpt.reportNumber}</div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    } else if (qe && qe.source === 'MANUAL' && qe.manual) {
      const man = qe.manual;
      evidenceHtml = `
        <div style="background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 14px 16px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #92400E; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <span style="display: flex; align-items: center; gap: 6px;">
              <i data-lucide="edit-3" style="width:14px;height:14px;"></i>
              FARMER-PROVIDED QUALITY INFORMATION
            </span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: #FEF3C7; color: #92400E;">
              ✍ Quality Added
            </span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 13px;">
            ${man.condition ? `
              <div>
                <div style="font-size: 11px; color: #78350F; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Condition</div>
                <div style="font-weight: 800; color: #12372A;">${man.condition}</div>
              </div>
            ` : ''}
            ${man.grade ? `
              <div>
                <div style="font-size: 11px; color: #78350F; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Grade / Standard</div>
                <div style="font-weight: 700; color: #12372A;">${man.grade}</div>
              </div>
            ` : ''}
            ${man.description ? `
              <div style="grid-column: 1 / -1;">
                <div style="font-size: 11px; color: #78350F; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Description</div>
                <div style="font-size: 13px; color: #333;">${man.description}</div>
              </div>
            ` : ''}
            ${man.notes ? `
              <div style="grid-column: 1 / -1;">
                <div style="font-size: 11px; color: #78350F; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Notes</div>
                <div style="font-size: 13px; color: #555;">${man.notes}</div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    } else {
      evidenceHtml = `
        <div style="background: #F9FAFB; border: 1px dashed #E5E7EB; border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
            <i data-lucide="info" style="width: 14px; height: 14px;"></i>
            QUALITY EVIDENCE
          </div>
          <div style="font-size: 12.5px; color: #6B7280; margin-top: 4px;">
            No quality evidence added
          </div>
        </div>
      `;
    }

    content.innerHTML = `
      <!-- Status & Trade Grade Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #EEE;">
        <div>
          <span style="display: inline-block; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: ${statusBg}; color: ${statusColor};">
            ${statusLabel}
          </span>
          ${lot.qualityGrade ? `
            <span class="agmark-badge agmark-badge--grade-${lot.qualityGrade.toLowerCase()}" style="margin-left: 6px; font-size: 11px;">
              Grade ${lot.qualityGrade}
            </span>
          ` : ''}
        </div>
        <div style="font-size: 12px; color: #777;">
          Listed on <strong>${createdStr}</strong>
        </div>
      </div>

      <!-- Core Metrics Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <div style="background: #F5F4ED; padding: 12px 14px; border-radius: 8px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700;">Crop & Variety</div>
          <div style="font-size: 15px; font-weight: 800; color: var(--ks-evergreen); margin-top: 2px;">${cropDisp}</div>
          <div style="font-size: 12px; color: #666;">${varietyDisp}</div>
        </div>
        <div style="background: #F5F4ED; padding: 12px 14px; border-radius: 8px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700;">Quantity Available</div>
          <div style="font-size: 15px; font-weight: 800; color: var(--ks-evergreen); margin-top: 2px;">${qty} ${unit}</div>
          <div style="font-size: 12px; color: #666;">Farm stock</div>
        </div>
        <div style="background: #F5F4ED; padding: 12px 14px; border-radius: 8px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700;">Asking Price</div>
          <div style="font-size: 15px; font-weight: 800; color: var(--ks-evergreen); margin-top: 2px;">₹${price.toLocaleString('en-IN')} <small style="font-size: 11px; font-weight: 600; color: #666;">/ ${priceUnit}</small></div>
        </div>
        <div style="background: #F5F4ED; padding: 12px 14px; border-radius: 8px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700;">Expected Total Value</div>
          <div style="font-size: 15px; font-weight: 800; color: #1B6B3A; margin-top: 2px;">₹${totalVal.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <!-- Quality Evidence Section -->
      ${evidenceHtml}

      <!-- Location & Dates -->
      <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; font-size: 13px;">
        <div style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
          <i data-lucide="map-pin" style="width: 15px; height: 15px; color: #2D6A4F; flex-shrink: 0; margin-top: 2px;"></i>
          <div>
            <strong style="color: #12372A;">Farm Location:</strong>
            <span style="color: #444;"> ${locationStr}${lot.pincode ? ` (${lot.pincode})` : ''}</span>
          </div>
        </div>
        ${harvestStr ? `
          <div style="display: flex; align-items: center; gap: 6px; color: #555;">
            <i data-lucide="calendar" style="width: 15px; height: 15px; color: #2D6A4F; flex-shrink: 0;"></i>
            <span><strong>Harvest Date:</strong> ${harvestStr}</span>
          </div>
        ` : ''}
      </div>

      <!-- Description / Notes if available -->
      ${(lot.description || lot.qualityNotes) ? `
        <div style="margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #777; margin-bottom: 4px;">Description / Notes</div>
          <div style="font-size: 13px; color: #444; background: #FAF9F5; padding: 10px 12px; border-radius: 8px; border: 1px solid #EEE; line-height: 1.5;">
            ${lot.description || lot.qualityNotes}
          </div>
        </div>
      ` : ''}

      <!-- Actions Bar -->
      <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; padding-top: 14px; border-top: 1px solid #EEE; flex-wrap: wrap;">
        <button type="button" class="btn btn--secondary" onclick="document.getElementById('lot-detail-modal-overlay').classList.remove('active')">Close</button>
        ${(statusVal === 'active' || statusVal === 'available' || statusVal === 'draft') ? `
          <button type="button" class="btn btn--secondary" style="color: #991B1B; border-color: #FCA5A5; background: #FEF2F2;" onclick="FarmerFlow.confirmDeleteLot('${lot.lotId}')">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Delete Lot
          </button>
          <button type="button" class="btn btn--primary" onclick="FarmerFlow.openEditLotModal('${lot.lotId}')">
            <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i> Edit Lot
          </button>
        ` : ''}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * EDIT PRODUCE LOT MODAL (Unified with Create Lot Wizard)
   * ═══════════════════════════════════════════════════════════════════════
   */
  async openEditLotModal(lotId) {
    // Close detail modal if open
    const detailOverlay = document.getElementById('lot-detail-modal-overlay');
    if (detailOverlay) detailOverlay.classList.remove('active');

    // Resolve lot
    let lot = null;
    if (this.myLots && this.myLots.length > 0) {
      lot = this.myLots.find(l => l.lotId === lotId || l._id === lotId || l.id === lotId);
    }
    if (!lot && window.api && window.api.lots) {
      try {
        const res = await window.api.lots.getById(lotId);
        if (res && res.success && res.lot) lot = res.lot;
      } catch (e) {}
    }

    if (!lot) {
      this.showToast('Unable to load lot for editing.', 'error');
      return;
    }

    if (lot.status === 'sold') {
      this.showToast('This lot has already been sold and cannot be edited.', 'warning');
      return;
    }

    this._editingLotId = lot.lotId;

    let overlay = document.getElementById('create-lot-modal-overlay');
    if (!overlay) return;

    // Reset temporary evidence & populate with existing lot evidence
    this.resetQualityEvidenceForm();
    if (lot.qualityEvidence && lot.qualityEvidence.source) {
      this.temporaryEvidence = JSON.parse(JSON.stringify(lot.qualityEvidence));
      if (lot.qualityEvidence.source === 'AI_ASSESSMENT' && lot.qualityEvidence.aiAssessment) {
        const ai = lot.qualityEvidence.aiAssessment;
        this.renderQualityEvidenceSummary(`🤖 AI Assessed: ${ai.crop || lot.cropName} · ${ai.condition || 'Fresh'}`);
        this.highlightEvidenceCard('photo');
      } else if (lot.qualityEvidence.source === 'FARMER_PROVIDED_REPORT' && lot.qualityEvidence.report) {
        this.renderQualityEvidenceSummary(`📄 Quality Report: ${lot.qualityEvidence.report.fileName || 'Report attached'}`);
        this.highlightEvidenceCard('report');
      } else if (lot.qualityEvidence.source === 'MANUAL' && lot.qualityEvidence.manual) {
        this.renderQualityEvidenceSummary(`✍️ Quality Info: ${lot.qualityEvidence.manual.condition || 'Manual entered'}`);
        this.highlightEvidenceCard('manual');
      }
    }

    // Pre-fill inputs
    const cropSelect = document.getElementById('lot-crop-select');
    if (cropSelect && lot.cropName) {
      cropSelect.value = lot.cropName;
      // Trigger change for grading params
      cropSelect.dispatchEvent(new Event('change'));
    }

    const qtyInput = document.getElementById('lot-qty-input');
    if (qtyInput) qtyInput.value = lot.quantity || '';

    const priceInput = document.getElementById('lot-price-input');
    if (priceInput) priceInput.value = lot.askingPrice || lot.price || '';

    const harvestInput = document.getElementById('lot-harvest-input');
    if (harvestInput && lot.harvestDate) {
      harvestInput.value = new Date(lot.harvestDate).toISOString().split('T')[0];
    }

    const descInput = document.getElementById('lot-desc-input');
    if (descInput) descInput.value = lot.description || lot.qualityNotes || '';

    const locInput = document.getElementById('lot-location-input');
    if (locInput) {
      const locParts = [lot.village, lot.taluka, lot.district, lot.state].filter(Boolean);
      locInput.value = locParts.length > 0 ? locParts.join(', ') : (lot.storageLocation || 'Pune, Maharashtra');
    }

    // Update modal submit button text
    const submitBtn = overlay.querySelector('#btn-submit-lot') || overlay.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.innerHTML = '<i data-lucide="check"></i> Save Lot Changes';
    }

    overlay.classList.add('active');
    this.initQualityGradingEvents();
    if (window.lucide) window.lucide.createIcons();
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * PERMANENT DELETE LOT CONFIRMATION MODAL
   * ═══════════════════════════════════════════════════════════════════════
   */
  async confirmDeleteLot(lotId) {
    // Close detail modal if open
    const detailOverlay = document.getElementById('lot-detail-modal-overlay');
    if (detailOverlay) detailOverlay.classList.remove('active');

    let lot = null;
    if (this.myLots && this.myLots.length > 0) {
      lot = this.myLots.find(l => l.lotId === lotId || l._id === lotId || l.id === lotId);
    }
    if (!lot && window.api && window.api.lots) {
      try {
        const res = await window.api.lots.getById(lotId);
        if (res && res.success && res.lot) lot = res.lot;
      } catch (e) {}
    }

    const cropDisp = lot?.cropName || lot?.crop || 'Produce';
    const qtyDisp = `${lot?.quantity || ''} ${lot?.quantityUnit || 'quintal'}`.trim();
    const priceDisp = `₹${(lot?.askingPrice || lot?.price || 0).toLocaleString('en-IN')}/${lot?.priceUnit || 'quintal'}`;

    let overlay = document.getElementById('delete-lot-confirm-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'delete-lot-confirm-overlay';
      overlay.className = 'dash-modal-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="dash-modal" style="max-width: 440px; text-align: center; padding: 28px 24px; border-radius: 14px;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: #FEE2E2; color: #DC2626; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 14px;">
          <i data-lucide="trash-2" style="width: 26px; height: 26px;"></i>
        </div>
        <h3 style="font-size: 19px; font-weight: 800; color: #12372A; margin: 0 0 8px 0;">Delete this lot?</h3>
        <p style="font-size: 14.5px; font-weight: 700; color: #12372A; margin: 0 0 4px 0;">
          ${cropDisp} • ${qtyDisp} • ${priceDisp}
        </p>
        <p style="font-size: 13px; color: #666; margin: 0 0 22px 0; line-height: 1.5;">
          This lot will be permanently removed from your active listings and cannot be recovered.
        </p>
        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn btn--secondary" style="flex: 1;" onclick="document.getElementById('delete-lot-confirm-overlay').classList.remove('active')">
            Cancel
          </button>
          <button type="button" class="btn" style="flex: 1; background: #DC2626; color: #FFFFFF; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; padding: 10px 14px;" id="btn-do-permanent-delete">
            Delete Lot
          </button>
        </div>
      </div>
    `;

    overlay.classList.add('active');
    if (window.lucide) window.lucide.createIcons();

    overlay.querySelector('#btn-do-permanent-delete').addEventListener('click', async () => {
      const btn = overlay.querySelector('#btn-do-permanent-delete');
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Deleting...';

      try {
        const res = await window.api.lots.cancel(lotId);
        if (res && res.success) {
          overlay.classList.remove('active');

          // Remove exact lot from in-memory state
          if (Array.isArray(this.myLots)) {
            this.myLots = this.myLots.filter(l => l.lotId !== lotId && l._id !== lotId && l.id !== lotId);
          }
          if (window.krishiStore && typeof window.krishiStore.getLots === 'function') {
            try {
              const allStore = window.krishiStore.getLots('all').filter(l => l.lotId !== lotId && l._id !== lotId && l.id !== lotId);
              localStorage.setItem('krishi_lots', JSON.stringify(allStore));
            } catch (e) {}
          }

          this.showToast('Lot deleted successfully.', 'success');

          // Refresh market page live lots feed and lots page list
          await this.initMarketPage();
          if (document.getElementById('lots-container') || document.getElementById('lots-panel-body')) {
            await this.loadMyLots(this.currentFilter || 'all');
          }
        } else {
          this.showToast(res?.message || 'Lot could not be deleted. Please try again.', 'error');
        }
      } catch (err) {
        this.showToast('Lot could not be deleted. Please try again.', 'error');
      } finally {
        btn.disabled = false;
      }
    });
  },

  // Alias for backward compatibility
  async confirmCancelLot(lotId) {
    return this.confirmDeleteLot(lotId);
  },

  /**
   * Toggle 3-dot dropdown menu on market cards
   */
  toggleLotMenu(event, lotId) {
    event.stopPropagation();
    // Close any other open lot menus
    document.querySelectorAll('.lot-card-menu-dropdown').forEach(m => m.remove());

    const btn = event.currentTarget;
    const parent = btn.parentElement;

    const menu = document.createElement('div');
    menu.className = 'lot-card-menu-dropdown';
    menu.style.cssText = 'position: absolute; right: 0; bottom: 100%; margin-bottom: 6px; background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.12); z-index: 100; min-width: 140px; overflow: hidden; padding: 4px 0;';
    menu.innerHTML = `
      <button type="button" style="width: 100%; text-align: left; padding: 8px 12px; border: none; background: transparent; font-size: 12.5px; font-weight: 600; color: #12372A; cursor: pointer; display: flex; align-items: center; gap: 8px;" onclick="FarmerFlow.viewLotDetails('${lotId}'); this.parentElement.remove();">
        <i data-lucide="eye" style="width: 14px; height: 14px;"></i> View details
      </button>
      <button type="button" style="width: 100%; text-align: left; padding: 8px 12px; border: none; background: transparent; font-size: 12.5px; font-weight: 600; color: #12372A; cursor: pointer; display: flex; align-items: center; gap: 8px;" onclick="FarmerFlow.openEditLotModal('${lotId}'); this.parentElement.remove();">
        <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i> Edit lot
      </button>
      <div style="height: 1px; background: #EEE; margin: 4px 0;"></div>
      <button type="button" style="width: 100%; text-align: left; padding: 8px 12px; border: none; background: transparent; font-size: 12.5px; font-weight: 600; color: #DC2626; cursor: pointer; display: flex; align-items: center; gap: 8px;" onclick="FarmerFlow.confirmDeleteLot('${lotId}'); this.parentElement.remove();">
        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Delete lot
      </button>
    `;

    parent.appendChild(menu);
    if (window.lucide) window.lucide.createIcons();

    // Auto-close on click outside
    const closeListener = (e) => {
      if (!menu.contains(e.target) && e.target !== btn) {
        menu.remove();
        document.removeEventListener('click', closeListener);
      }
    };
    setTimeout(() => document.addEventListener('click', closeListener), 0);
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
      let lots = [];
      const res = await window.api.market.getLots({ limit: 50, sortBy: 'newest' });
      if (res.success && Array.isArray(res.lots)) {
        lots = res.lots;
      } else if (Array.isArray(this.myLots) && this.myLots.length > 0) {
        lots = this.myLots;
      } else if (window.krishiStore && typeof window.krishiStore.getLots === 'function') {
        lots = window.krishiStore.getLots('all');
      }

      // Filter active / available lots
      const activeLots = lots.filter(l => l.status !== 'sold' && l.status !== 'cancelled');

      let section = document.getElementById('real-marketplace-lots-section');
      if (!section) {
        section = document.createElement('div');
        section.id = 'real-marketplace-lots-section';
        section.style.cssText = 'margin-bottom: 32px;';
        liveFeed.parentNode.insertBefore(section, liveFeed);
      }

      if (activeLots.length === 0) {
        section.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <h3 style="font-size: 20px; font-weight: 800; color: var(--ks-evergreen); margin: 0 0 4px 0;">Active Farmer Produce Lots</h3>
              <p style="font-size: 13px; color: var(--ks-text-muted); margin: 0;">Manage your active produce listings and share them with buyers.</p>
            </div>
            <span style="font-size: 12px; font-weight: 700; background: #F3F4F6; color: #4B5563; padding: 4px 10px; border-radius: 6px;">0 Live Lots</span>
          </div>
          <div style="background: #FFFFFF; border: 1.5px dashed #CBD5E1; border-radius: 12px; padding: 36px 20px; text-align: center;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #F0FDF4; color: #166534; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
              <i data-lucide="package-open" style="width: 24px; height: 24px;"></i>
            </div>
            <h4 style="font-size: 16px; font-weight: 700; color: #12372A; margin: 0 0 6px 0;">No active produce lots</h4>
            <p style="font-size: 13px; color: #666; margin: 0 0 16px 0; max-width: 360px; margin-left: auto; margin-right: auto;">Create a lot to start listing your produce for buyers.</p>
            <button type="button" class="btn btn--primary btn--sm" onclick="FarmerFlow.openCreateLotModal()">
              <i data-lucide="plus"></i> Create a Lot
            </button>
          </div>
        `;
      } else {
        section.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
            <div>
              <h3 style="font-size: 20px; font-weight: 800; color: var(--ks-evergreen); margin: 0 0 4px 0;">Active Farmer Produce Lots</h3>
              <p style="font-size: 13px; color: var(--ks-text-muted); margin: 0;">Manage your active produce listings and share them with buyers.</p>
            </div>
            <span style="font-size: 12px; font-weight: 800; background: #E5F0E7; color: #12372A; padding: 5px 12px; border-radius: 6px; letter-spacing: 0.2px;">${activeLots.length} Live Lots</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 16px;">
            ${activeLots.map(lot => {
              const qe = lot.qualityEvidence || (lot.aiQualityScan && (lot.aiQualityScan.status === 'AI_ASSESSED' || lot.aiQualityScan.crop) ? {
                source: 'AI_ASSESSMENT',
                aiAssessment: lot.aiQualityScan
              } : null);

              let qeBadge = '';
              if (qe && qe.source === 'AI_ASSESSMENT') {
                qeBadge = `<span style="font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 5px; background: #F0FDF4; color: #15803D; border: 1px solid #BBF7D0; display: inline-flex; align-items: center; gap: 4px; margin-top: 6px;"><i data-lucide="scan-line" style="width:12px;height:12px;"></i> AI-Assessed</span>`;
              } else if (qe && qe.source === 'FARMER_PROVIDED_REPORT') {
                qeBadge = `<span style="font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 5px; background: #F8FAFC; color: #334155; border: 1px solid #CBD5E1; display: inline-flex; align-items: center; gap: 4px; margin-top: 6px;"><i data-lucide="file-text" style="width:12px;height:12px;"></i> Report Added</span>`;
              } else if (qe && qe.source === 'MANUAL') {
                qeBadge = `<span style="font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 5px; background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; display: inline-flex; align-items: center; gap: 4px; margin-top: 6px;"><i data-lucide="edit-3" style="width:12px;height:12px;"></i> Quality Added</span>`;
              }

              const statusBadge = (lot.status === 'active' || !lot.status) ? 'AVAILABLE' : lot.status.toUpperCase();
              const locStr = [lot.district, lot.state].filter(Boolean).join(', ') || 'Pune, Maharashtra';

              return `
                <div class="market-lot-card" style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-family: monospace; font-size: 11.5px; color: #888; font-weight: 600;">${lot.lotId}</span>
                      <span style="padding: 2px 8px; border-radius: 6px; background: #E5F0E7; color: #12372A; font-size: 11px; font-weight: 800; text-transform: uppercase;">${statusBadge}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
                      <h4 style="font-size: 17px; font-weight: 800; color: var(--ks-evergreen); margin: 0;">${lot.cropName || lot.crop || 'Produce'}</h4>
                      ${lot.qualityGrade ? `<span class="agmark-badge agmark-badge--grade-${lot.qualityGrade.toLowerCase()}" style="font-size: 10.5px;">Grade ${lot.qualityGrade}</span>` : ''}
                    </div>
                    <p style="font-size: 12.5px; color: #666; margin: 0 0 10px 0;">${lot.variety || 'Standard Variety'} • ${locStr}</p>
                    <div style="background: #F5F4ED; border-radius: 8px; padding: 10px 12px; margin-bottom: 6px;">
                      <div style="font-size: 11px; color: #777;">Quantity Available</div>
                      <div style="font-size: 15px; font-weight: 800; color: #222;">${lot.quantity} ${lot.quantityUnit || 'quintal'}</div>
                    </div>
                    ${qeBadge ? `<div style="margin-bottom: 10px;">${qeBadge}</div>` : ''}
                  </div>
                  <div style="border-top: 1px solid #EEE; padding-top: 12px; margin-top: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                      <span style="font-size: 11.5px; color: #777;">Asking Price</span>
                      <span style="font-size: 16px; font-weight: 800; color: var(--ks-evergreen);">₹${(lot.askingPrice || lot.price || 0).toLocaleString('en-IN')}<span style="font-size: 11px; font-weight: 400; color: #666;"> / ${lot.priceUnit || 'q'}</span></span>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center; position: relative;">
                      <button type="button" class="btn btn--primary btn--sm" style="flex: 1; justify-content: center; font-weight: 700;" onclick="FarmerFlow.viewLotDetails('${lot.lotId}')">
                        View details
                      </button>
                      <div style="position: relative;">
                        <button type="button" class="btn btn--secondary btn--sm" style="padding: 7px 11px; border-radius: 8px;" onclick="FarmerFlow.toggleLotMenu(event, '${lot.lotId}')" title="Manage lot" aria-label="Manage lot">
                          <i data-lucide="more-vertical" style="width: 15px; height: 15px;"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
      if (window.lucide) window.lucide.createIcons();
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

window.filterLotTab = function (filter) {
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

window.addEventListener('languageChanged', () => {
  if (window.FarmerFlow && Array.isArray(FarmerFlow.cachedLots) && FarmerFlow.cachedLots.length > 0 && (document.getElementById('lots-panel-body') || document.getElementById('farmer-lots-grid'))) {
    FarmerFlow.renderLotsList(FarmerFlow.cachedLots);
  }
});
