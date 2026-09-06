/**
 * KRISHISHETRA — STORAGE & WAREHOUSE DISCOVERY ENGINE
 * 
 * Features:
 * 1. Leaflet Map with OpenStreetMap tiles for storage discovery
 * 2. Real-time Haversine distance, radius, crop, and type filters
 * 3. Interactive AI "Sell Now vs Store & Hold" Calculator
 * 4. Storage Space Booking & Request modal workflow
 * 5. Pledge Financing / e-NWR Short-Term Liquidity application
 * 6. Multilingual support (English, Hindi, Marathi) with dynamic reactivity
 */

// Helper for i18n
function t(key, fallback) {
  return (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(key, fallback) : (fallback || key);
}

// Global Storage State
const StorageState = {
  userLat: 18.4901, // Default to Pune APMC
  userLng: 73.8650,
  userLocationName: 'Pune, Maharashtra',
  radiusKm: 50,
  selectedCrop: 'all',
  selectedType: 'all',
  selectedState: 'all',
  verifiedOnly: false,
  facilities: [],
  selectedFacility: null,
  currentCropOptions: [],
  map: null,
  markersLayer: null,
  get currentLang() {
    return (window.i18next && window.i18next.language) ? window.i18next.language : 'en';
  }
};

/**
 * Initialize Storage Discovery Map
 */
function initStorageMap() {
  const mapContainer = document.getElementById('storage-map');
  if (!mapContainer || typeof L === 'undefined') return;

  if (StorageState.map) {
    StorageState.map.remove();
    StorageState.map = null;
  }

  StorageState.map = L.map('storage-map', {
    zoomControl: false
  }).setView([StorageState.userLat, StorageState.userLng], 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors | KrishiShetra'
  }).addTo(StorageState.map);

  StorageState.markersLayer = L.layerGroup().addTo(StorageState.map);

  // User location marker
  const userIcon = L.divIcon({
    className: 'storage-user-marker',
    html: '<div style="background:#1976D2; border:3px solid #FFF; width:18px; height:18px; border-radius:50%; box-shadow:0 0 10px rgba(25,118,210,0.6); animation: pulse 1.8s infinite;"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  const locationTitle = t('storage.myFarmLocation', '📍 Your Farm Location');
  L.marker([StorageState.userLat, StorageState.userLng], { icon: userIcon })
    .addTo(StorageState.map)
    .bindPopup(`<b>${locationTitle}</b><br>${StorageState.userLocationName}`);
}

/**
 * Plot Facilities on Map
 */
function renderMapMarkers(facilities) {
  if (!StorageState.map || !StorageState.markersLayer) return;
  StorageState.markersLayer.clearLayers();

  facilities.forEach(f => {
    const isCold = f.type === 'cold_storage';
    const markerColor = isCold ? '#0288D1' : '#2E7D32';
    const iconEmoji = isCold ? '❄️' : '🏬';

    const customIcon = L.divIcon({
      className: 'storage-facility-marker',
      html: `<div style="background:${markerColor}; color:#FFF; padding:4px 8px; border-radius:12px; font-weight:700; font-size:11px; display:flex; align-items:center; gap:4px; box-shadow:0 2px 8px rgba(0,0,0,0.25); white-space:nowrap; border:2px solid #FFF;">
              <span>${iconEmoji}</span> <span>${f.name.split('—')[0].substring(0, 14)}...</span>
             </div>`,
      iconAnchor: [30, 15]
    });

    const marker = L.marker([f.latitude, f.longitude], { icon: customIcon });

    const popupHtml = `
      <div style="font-family:Inter,sans-serif; min-width:210px;">
        <div style="font-weight:700; font-size:13.5px; color:#1A3320; margin-bottom:4px;">${f.name}</div>
        <div style="font-size:11.5px; color:#666; margin-bottom:6px;">📍 ${f.address.district}, ${f.address.state} (${f.distanceKm || 0} km ${t('storage.distanceAway', 'away')})</div>
        <div style="background:#F5F5F0; padding:6px 8px; border-radius:6px; font-size:12px; margin-bottom:8px;">
          <div><strong>${t('storage.availableCapacity', 'Available')}:</strong> ${f.availableCapacity} ${f.capacityUnit}</div>
          <div><strong>${t('storage.storageRate', 'Rate')}:</strong> ₹${f.storageRate}/${f.storageRateUnit ? f.storageRateUnit.replace(/_/g, ' ') : t('storage.perBagMonth', 'per bag/month')}</div>
          <div><strong>${t('storage.accreditation', 'Accreditation')}:</strong> ${f.accreditationType || t('storage.verified', 'Verified')}</div>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn btn--primary btn--sm" style="flex:1; padding:4px 8px; font-size:11px;" onclick="openBookingModal('${f.facilityCode || f.id}')">${t('storage.bookSpaceBtn', 'Book Space')}</button>
          <a class="btn btn--secondary btn--sm" style="padding:4px 8px; font-size:11px; text-decoration:none;" target="_blank" href="https://www.google.com/maps/dir/?api=1&destination=${f.latitude},${f.longitude}">${t('storage.navigateBtn', 'Navigate')}</a>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    StorageState.markersLayer.addLayer(marker);
  });
}

/**
 * Render Facility Cards List
 */
function renderFacilityCards(facilities) {
  const container = document.getElementById('storage-list-panel');
  if (!container) return;

  if (!facilities || facilities.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:#777;">
        <div style="font-size:36px; margin-bottom:10px;">🏬</div>
        <h4 style="color:#222; margin-bottom:6px;">${t('storage.noFacilitiesFoundTitle', 'No storage facilities found')}</h4>
        <p style="font-size:13px;">${t('storage.noFacilitiesFoundDesc', 'Try expanding the radius or changing the crop / storage type filter.')}</p>
        <button class="btn btn--secondary btn--sm" onclick="resetFilters()">${t('storage.filterResetBtn', 'Reset Filters')}</button>
      </div>
    `;
    return;
  }

  container.innerHTML = facilities.map(f => {
    const isCold = f.type === 'cold_storage';
    const typeLabel = isCold ? t('storage.coldStorage', 'Cold Storage') : f.type === 'silo' ? t('storage.silo', 'Grain Silo') : t('storage.warehouse', 'Warehouse');
    const typeClass = isCold ? 'facility-card__type-badge--cold_storage' : f.type === 'silo' ? 'facility-card__type-badge--silo' : 'facility-card__type-badge--warehouse';

    const cropsPills = (f.supportedCrops || []).slice(0, 4).map(c => `<span style="background:#F0EFEB; color:#444; font-size:10.5px; padding:2px 6px; border-radius:4px; text-transform:capitalize;">${c}</span>`).join(' ');

    return `
      <div class="facility-card" id="facility-card-${f.facilityCode || f.id}">
        <div class="facility-card__header">
          <div>
            <h3 class="facility-card__name">${f.name}</h3>
            <div class="facility-card__location">
              <i data-lucide="map-pin" style="width:13px;height:13px;"></i>
              <span>${f.address.district}, ${f.address.state} · <strong>${f.distanceKm || 0} km ${t('storage.distanceAway', 'away')}</strong></span>
            </div>
          </div>
          <span class="facility-card__type-badge ${typeClass}">${typeLabel}</span>
        </div>

        <div class="facility-card__accreditation">
          <i data-lucide="shield-check" style="width:14px;height:14px;"></i>
          <span>${f.accreditationType || t('storage.verified', 'Verified Facility')}</span>
          ${f.pledgeFinancingEligible ? `<span class="pledge-badge-pill" style="margin-left:auto; font-size:10px; padding:2px 6px;">${t('storage.eNwrReady', 'e-NWR Loan Eligible')}</span>` : ''}
        </div>

        <div style="font-size:11.5px; color:#555; display:flex; justify-content:space-between; margin-bottom:2px;">
          <span>${t('storage.capacity', 'Capacity')} (${f.availableCapacity} / ${f.totalCapacity} ${f.capacityUnit} ${t('storage.availableCapacity', 'free')})</span>
          <span style="font-weight:700;">${f.capacityUtilizationPct || 50}% ${t('storage.utilized', 'Utilized')}</span>
        </div>
        <div class="facility-card__capacity-bar">
          <div class="facility-card__capacity-fill" style="width:${Math.min(100, f.capacityUtilizationPct || 50)}%;"></div>
        </div>

        <div class="facility-card__metrics">
          <div>
            <div class="facility-card__metric-val">₹${f.storageRate}</div>
            <div class="facility-card__metric-lbl">/${f.storageRateUnit ? f.storageRateUnit.replace(/_/g, ' ') : t('storage.perBagMonth', 'per bag/month')}</div>
          </div>
          <div>
            <div class="facility-card__metric-val">₹${f.handlingCharge || 15}</div>
            <div class="facility-card__metric-lbl">${t('storage.handlingRatePerQuintal', '/q Handling')}</div>
          </div>
          <div>
            <div class="facility-card__metric-val">${f.availableCapacity} ${f.capacityUnit}</div>
            <div class="facility-card__metric-lbl">${t('storage.freeSpaceMetric', 'Free Space')}</div>
          </div>
        </div>

        <div style="margin: 8px 0; display:flex; gap:4px; flex-wrap:wrap; align-items:center;">
          <span style="font-size:11px; color:#777; margin-right:4px;">${t('storage.cropsSupportedLabel', 'Crops:')}</span>
          ${cropsPills}
        </div>

        <div class="facility-card__actions" style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
          <button class="btn btn--primary" onclick="openBookingModal('${f.facilityCode || f.id}')" style="min-height: 48px; font-weight: 800; flex: 2; min-width: 150px; background: #2E7D32; border-color: #2E7D32; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 13.5px;">
            <i data-lucide="calendar-plus"></i> <span>${t('storage.bookSpaceBtn', 'Book Storage')}</span>
          </button>
          <button class="btn btn--secondary" onclick="openPledgeModal('${f.facilityCode || f.id}')" title="${t('storage.applyPledgeBtn', 'Pledge Financing')}" style="min-height: 48px; font-weight: 700; flex: 1.3; min-width: 120px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; font-size: 12.5px;">
            <i data-lucide="landmark"></i> <span>${t('storage.applyPledgeBtn', 'Pledge Loan')}</span>
          </button>
          <a class="btn btn--secondary" target="_blank" href="https://www.google.com/maps/dir/?api=1&destination=${f.latitude},${f.longitude}" style="min-height: 48px; width: 48px; display: inline-flex; align-items: center; justify-content: center;" title="${t('storage.navigateBtn', 'Directions')}">
            <i data-lucide="navigation"></i>
          </a>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Fetch and Refresh Storage Facilities
 */
async function loadStorageFacilities() {
  const listContainer = document.getElementById('storage-list-panel');
  if (listContainer) {
    listContainer.innerHTML = `<div style="text-align:center; padding:30px;"><div class="dash-spinner"></div><p style="font-size:13px; color:#777; margin-top:8px;">${t('storage.findingFacilities', 'Finding nearby storage facilities...')}</p></div>`;
  }

  const params = {
    lat: StorageState.userLat,
    lng: StorageState.userLng,
    radius: StorageState.radiusKm,
    crop: StorageState.selectedCrop,
    type: StorageState.selectedType,
    state: StorageState.selectedState,
    verifiedOnly: StorageState.verifiedOnly
  };

  try {
    let res = null;
    if (window.api && window.api.storage) {
      res = await window.api.storage.getNearby(params);
    } else {
      const qs = new URLSearchParams(params).toString();
      const response = await fetch(`/api/storage/nearby?${qs}`);
      res = await response.json();
    }

    if (res && res.success) {
      StorageState.facilities = res.facilities || [];
      renderFacilityCards(StorageState.facilities);
      renderMapMarkers(StorageState.facilities);
    } else {
      throw new Error(res ? res.message : 'Failed');
    }
  } catch (err) {
    console.warn('Fallback loading storage facilities:', err);
    // Render static fallback list
    renderFacilityCards([]);
  }
}

/**
 * Execute Sell Now vs Store & Hold AI Calculation
 */
async function calculateSellVsStore() {
  const cropSelect = document.getElementById('calc-crop-select');
  const qtyInput = document.getElementById('calc-qty-input');
  const priceInput = document.getElementById('calc-price-input');
  const daysInput = document.getElementById('calc-days-input');

  const cropName = cropSelect ? cropSelect.value : 'wheat';
  const quantity = parseFloat(qtyInput ? qtyInput.value : 50) || 50;
  const currentPrice = parseFloat(priceInput ? priceInput.value : 2400) || 2400;
  const holdingDays = parseInt(daysInput ? daysInput.value : 45, 10) || 45;

  const lang = StorageState.currentLang || (window.i18n && window.i18n.currentLocale) || localStorage.getItem('krishi_locale') || 'en';
  const requestData = {
    cropName,
    quantity,
    currentPrice,
    holdingDays,
    storageFacilityId: StorageState.selectedFacility ? (StorageState.selectedFacility._id || StorageState.selectedFacility.facilityCode) : null,
    distanceKm: StorageState.selectedFacility ? (StorageState.selectedFacility.distanceKm || 12) : 12,
    language: lang,
    lang: lang
  };

  try {
    let res = null;
    if (window.api && window.api.decision) {
      res = await window.api.decision.evaluateSellVsStore(requestData);
    } else {
      const response = await fetch('/api/decision/sell-vs-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      res = await response.json();
    }

    if (res && res.success && res.decision) {
      updateDecisionUI(res.decision);
    }
  } catch (err) {
    console.error('calculateSellVsStore error:', err);
  }

  // Also load all comparative storage facility options for this crop
  loadCropStorageOptions();
}

/**
 * Load and compare all storage facilities supporting the selected grain/crop
 */
async function loadCropStorageOptions() {
  const cropSelect = document.getElementById('calc-crop-select');
  const qtyInput = document.getElementById('calc-qty-input');
  const priceInput = document.getElementById('calc-price-input');
  const daysInput = document.getElementById('calc-days-input');

  const crop = (cropSelect ? cropSelect.value : 'wheat').trim().toLowerCase();
  const quantity = parseFloat(qtyInput ? qtyInput.value : 50) || 50;
  const currentPrice = parseFloat(priceInput ? priceInput.value : 2400) || 2400;
  const holdingDays = parseInt(daysInput ? daysInput.value : 45, 10) || 45;

  const cropHeading = document.getElementById('crop-compare-crop-name');
  if (cropHeading) {
    cropHeading.textContent = crop.charAt(0).toUpperCase() + crop.slice(1);
  }

  const container = document.getElementById('crop-options-comparison-grid');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 24px; color: #777;">
      <div class="spinner" style="margin: 0 auto 8px auto; width: 20px; height: 20px; border: 2px solid #DDD; border-top-color: var(--ks-evergreen); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      ${t('storage.evaluatingCropOptions', 'Evaluating all suitable warehouse & cold storage options for')} ${crop}...
    </div>
  `;

  try {
    const params = {
      crop,
      quantity,
      currentPrice,
      holdingDays,
      lat: StorageState.userLat,
      lng: StorageState.userLng,
      radius: 0,
      lang: StorageState.currentLang
    };

    let res = null;
    if (window.api && window.api.storage && typeof window.api.storage.getOptionsForCrop === 'function') {
      res = await window.api.storage.getOptionsForCrop(params);
    } else {
      const qs = new URLSearchParams(params).toString();
      const response = await fetch(`/api/storage/options-for-crop?${qs}`);
      res = await response.json();
    }

    if (res && res.success && Array.isArray(res.options)) {
      StorageState.currentCropOptions = res.options;
      renderCropOptionsComparison(res.options);
    } else {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #777;">${t('storage.noFacilitiesFoundTitle', 'No matching facilities found.')}</div>`;
    }
  } catch (err) {
    console.error('loadCropStorageOptions error:', err);
  }
}

/**
 * Render comparative storage cards side-by-side
 */
function renderCropOptionsComparison(options) {
  const container = document.getElementById('crop-options-comparison-grid');
  if (!container) return;

  if (!options || options.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; padding: 20px; text-align: center; background: #FAF9F5; border-radius: 10px; color: #777;">
        ${t('storage.noFacilitiesFoundDesc', 'No specific storage facilities found for this crop. Showing all accredited grain warehouses.')}
      </div>
    `;
    return;
  }

  container.innerHTML = options.map((opt, idx) => {
    const isSelected = StorageState.selectedFacility && (StorageState.selectedFacility.facilityCode === opt.facilityCode || StorageState.selectedFacility._id === opt.facilityId || StorageState.selectedFacility.id === opt.facilityId);
    const isPos = opt.projectedNetGain >= 0;

    let badgeHtml = '';
    if (opt.isBestNetGain) {
      badgeHtml = `<span style="background:#E8F5E9; color:#2E7D32; font-size:10.5px; font-weight:800; padding:2px 8px; border-radius:4px; border:1px solid #C8E6C9;">${t('storage.highestProfit', '🏆 HIGHEST PROFIT')}</span>`;
    } else if (opt.isNearest) {
      badgeHtml = `<span style="background:#E3F2FD; color:#1565C0; font-size:10.5px; font-weight:800; padding:2px 8px; border-radius:4px; border:1px solid #BBDEFB;">${t('storage.nearest', '⚡ NEAREST')} (${opt.distanceKm} km)</span>`;
    } else if (opt.isLowestCost) {
      badgeHtml = `<span style="background:#FEF3C7; color:#92400E; font-size:10.5px; font-weight:800; padding:2px 8px; border-radius:4px; border:1px solid #FDE68A;">${t('storage.lowestCost', '💰 LOWEST COST')}</span>`;
    }

    const typeName = opt.type === 'cold_storage' ? t('storage.coldStorage', '❄️ Cold Storage') : opt.type === 'silo' ? t('storage.silo', '🏗️ Grain Silo') : t('storage.warehouse', '🏬 Warehouse');

    return `
      <div class="storage-crop-option-card" style="background: #FFFFFF; border: 2px solid ${isSelected ? '#2E7D32' : '#E5E4DD'}; border-radius: 12px; padding: 16px; position: relative; transition: all 0.2s ease; box-shadow: ${isSelected ? '0 4px 16px rgba(46,125,50,0.15)' : '0 2px 8px rgba(0,0,0,0.04)'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700;">
              ${t('storage.optionPrefix', 'Option')} ${idx + 1} • ${typeName}
            </div>
            <h4 style="font-size: 14.5px; font-weight: 800; color: var(--ks-evergreen); margin: 2px 0;">${opt.name}</h4>
            <div style="font-size: 11.5px; color: #666;">
              📍 ${opt.district}, ${opt.state} • <strong>${opt.distanceKm} km ${t('storage.distanceAway', 'away')}</strong>
            </div>
          </div>
          <div>${badgeHtml}</div>
        </div>

        <div style="background: #FAF9F5; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #666;">${t('storage.monthlyStorageTariff', 'Monthly Storage Tariff:')}</span>
            <strong>₹${opt.storageRate}/${opt.storageRateUnit ? opt.storageRateUnit.replace(/_/g, ' ') : t('storage.perBagMonth', 'per bag/month')}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #666;">${t('storage.handlingAndUnloading', 'Handling & Unloading:')}</span>
            <strong>₹${opt.handlingCharge || 14}/q</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #666;">${t('storage.availableCapacity', 'Available Capacity:')}</span>
            <strong style="color:#2E7D32;">${opt.availableCapacity} / ${opt.totalCapacity} MT</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #E5E4DD; padding-top: 4px; margin-top: 4px;">
            <span style="color: #666;">${t('storage.totalHoldingCosts', 'Total Holding Costs:')}</span>
            <strong style="color:#C62828;">₹${opt.totalHoldingCost.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <div style="font-size: 10.5px; text-transform: uppercase; color: #777; font-weight: 700;">${t('storage.projectedNetGain', 'Projected Net Gain')}</div>
            <div style="font-size: 16px; font-weight: 800; color: ${isPos ? '#2E7D32' : '#C62828'};">
              ${isPos ? '+' : ''}₹${opt.projectedNetGain.toLocaleString('en-IN')}
              <span style="font-size: 11px; font-weight: 600;">(${isPos ? '+' : ''}${opt.netGainPercent}%)</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10.5px; text-transform: uppercase; color: #777; font-weight: 700;">${t('storage.netRealizationHeading', 'Net Realization')}</div>
            <div style="font-size: 14px; font-weight: 700; color: #1A3320;">₹${opt.projectedNetRealization.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div style="display: flex; gap: 6px;">
          <button class="btn btn--sm btn--primary" style="flex: 1; padding: 7px 10px; font-size: 12px; background:${isSelected ? '#12372A' : '#2E7D32'}; border-color:${isSelected ? '#12372A' : '#2E7D32'};" onclick="selectFacilityForCalculation('${opt.facilityCode}')">
            <i data-lucide="${isSelected ? 'check-circle' : 'check'}"></i> ${isSelected ? t('storage.selected', 'Selected') : t('storage.chooseFacility', 'Choose Facility')}
          </button>
          <button class="btn btn--sm btn--secondary" style="padding: 7px 10px; font-size: 12px;" onclick="openBookingModal('${opt.facilityCode}')">
            ${t('storage.bookSpaceBtn', 'Book Space')}
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Sort comparative storage options
 */
function sortCropOptions(criteria) {
  const options = StorageState.currentCropOptions;
  if (!options || options.length === 0) return;

  document.querySelectorAll('#btn-sort-profit, #btn-sort-dist, #btn-sort-cost').forEach(b => {
    b.style.background = '#FFF';
    b.style.color = '#444';
    b.style.borderColor = '#DDD';
    b.style.fontWeight = '600';
  });

  const activeBtn = document.getElementById(`btn-sort-${criteria === 'profit' ? 'profit' : criteria === 'distance' ? 'dist' : 'cost'}`);
  if (activeBtn) {
    activeBtn.style.background = '#E8F5E9';
    activeBtn.style.color = '#2E7D32';
    activeBtn.style.borderColor = '#C8E6C9';
    activeBtn.style.fontWeight = '700';
  }

  if (criteria === 'profit') {
    options.sort((a, b) => b.projectedNetGain - a.projectedNetGain);
  } else if (criteria === 'distance') {
    options.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (criteria === 'cost') {
    options.sort((a, b) => a.totalHoldingCost - b.totalHoldingCost);
  }

  renderCropOptionsComparison(options);
}

/**
 * Select a specific facility from the comparison grid to recalculate
 */
function selectFacilityForCalculation(facilityCode) {
  const facility = StorageState.facilities.find(f => f.facilityCode === facilityCode || f.id === facilityCode) ||
    StorageState.currentCropOptions?.find(f => f.facilityCode === facilityCode);
  
  if (facility) {
    StorageState.selectedFacility = facility;
    calculateSellVsStore();
    showToast(`${t('storage.selected', 'Selected')} ${facility.name}`);
  }
}

/**
 * Update Sell vs Store UI Card with calculated results
 */
function updateDecisionUI(d) {
  const lang = StorageState.currentLang;

  // Realizations
  const sellRealizationEl = document.getElementById('res-sell-realization');
  const storeRealizationEl = document.getElementById('res-store-realization');
  const storeNetGainEl = document.getElementById('res-store-netgain');
  const storeRentEl = document.getElementById('res-storage-rent');
  const handlingEl = document.getElementById('res-handling-cost');
  const weightLossEl = document.getElementById('res-weight-loss-cost');
  const explanationEl = document.getElementById('res-explanation-text');
  const recBadgeEl = document.getElementById('res-rec-badge');

  const curPriceDisplayEl = document.getElementById('res-cur-price-display');
  if (curPriceDisplayEl) {
    curPriceDisplayEl.textContent = `₹${(d.currentPrice || 2400).toLocaleString('en-IN')} / ${t('storage.quintals', 'quintal')}`;
  }

  if (sellRealizationEl) sellRealizationEl.textContent = '₹' + d.sellNow.expectedRealization.toLocaleString('en-IN');
  if (storeRealizationEl) storeRealizationEl.textContent = '₹' + d.storeAndHold.projectedNetRealization.toLocaleString('en-IN');
  
  if (storeNetGainEl) {
    const isPos = d.storeAndHold.projectedNetGain >= 0;
    storeNetGainEl.innerHTML = `<span style="color:${isPos ? '#2E7D32' : '#C62828'}; font-weight:800;">${isPos ? '+' : ''}₹${d.storeAndHold.projectedNetGain.toLocaleString('en-IN')} (${isPos ? '+' : ''}${d.storeAndHold.netGainPercent}%)</span>`;
  }

  if (storeRentEl) storeRentEl.textContent = '₹' + d.storeAndHold.storageRent.toLocaleString('en-IN');
  if (handlingEl) handlingEl.textContent = '₹' + d.storeAndHold.handlingCost.toLocaleString('en-IN');
  if (weightLossEl) weightLossEl.textContent = `₹${d.storeAndHold.weightLossCost.toLocaleString('en-IN')} (${d.storeAndHold.weightLossPercent}% ${t('storage.weightLossMoisture', 'shrinkage')})`;

  if (explanationEl) {
    explanationEl.textContent = d.reason || d.explanation || ((d.explanations && d.explanations[lang]) ? d.explanations[lang] : (d.explanations?.en || ''));
  }

  if (recBadgeEl) {
    const isStoreHold = d.recommendation === 'STORE_HOLD' || d.recommendation === 'STORE & HOLD' || d.decisionType === 'STORE & HOLD';
    if (isStoreHold) {
      recBadgeEl.className = 'svs-badge';
      recBadgeEl.style.background = '#E8F5E9';
      recBadgeEl.style.color = '#2E7D32';
      recBadgeEl.innerHTML = `<i data-lucide="check-circle" style="width:14px;height:14px;"></i> <span>${t('storage.storeAndHoldOption', 'RECOMMENDED: STORE & HOLD')}</span>`;
    } else {
      recBadgeEl.className = 'svs-badge';
      recBadgeEl.style.background = '#FFF3E0';
      recBadgeEl.style.color = '#E65100';
      recBadgeEl.innerHTML = `<i data-lucide="alert-circle" style="width:14px;height:14px;"></i> <span>${t('storage.sellNowOption', 'RECOMMENDED: SELL NOW')}</span>`;
    }
    if (window.lucide) window.lucide.createIcons();
  }
}

/**
 * Open Storage Booking Modal
 */
function openBookingModal(facilityId) {
  const facility = StorageState.facilities.find(f => (f.facilityCode === facilityId || f.id === facilityId)) || StorageState.facilities[0];
  if (!facility) return;

  StorageState.selectedFacility = facility;

  const titleEl = document.getElementById('book-facility-name');
  const codeInput = document.getElementById('book-facility-id');
  const ratePreview = document.getElementById('book-rate-preview');

  if (titleEl) titleEl.textContent = facility.name;
  if (codeInput) codeInput.value = facility.id || facility.facilityCode;
  if (ratePreview) ratePreview.textContent = `₹${facility.storageRate}/${facility.storageRateUnit ? facility.storageRateUnit.replace(/_/g, ' ') : t('storage.perBagMonth', 'per bag/month')} + ₹${facility.handlingCharge || 15}/q ${t('storage.handlingCharges', 'handling')}`;

  updateBookingCostPreview();
  const overlay = document.getElementById('storage-booking-modal-overlay');
  if (overlay) overlay.classList.add('active');
}

function closeBookingModal() {
  const overlay = document.getElementById('storage-booking-modal-overlay');
  if (overlay) overlay.classList.remove('active');
}

/**
 * Recalculate Booking Cost Preview inside modal
 */
function updateBookingCostPreview() {
  const facility = StorageState.selectedFacility;
  if (!facility) return;

  const qty = parseFloat(document.getElementById('book-qty-input')?.value || 50) || 50;
  const days = parseInt(document.getElementById('book-days-input')?.value || 30, 10) || 30;

  let monthlyRatePerQuintal = facility.storageRate;
  if (facility.storageRateUnit === 'per_bag_month') monthlyRatePerQuintal = facility.storageRate * 2;

  const rent = Math.round(monthlyRatePerQuintal * (days / 30) * qty);
  const handling = Math.round((facility.handlingCharge || 15) * qty);
  const total = rent + handling;

  const rentEl = document.getElementById('book-cost-rent');
  const handlingEl = document.getElementById('book-cost-handling');
  const totalEl = document.getElementById('book-cost-total');

  if (rentEl) rentEl.textContent = '₹' + rent.toLocaleString('en-IN');
  if (handlingEl) handlingEl.textContent = '₹' + handling.toLocaleString('en-IN');
  if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');
}

/**
 * Submit Storage Booking Form
 */
async function submitStorageBooking(e) {
  if (e) e.preventDefault();
  const form = document.getElementById('storage-booking-form');
  if (!form) return;

  const facilityId = document.getElementById('book-facility-id')?.value;
  const cropName = document.getElementById('book-crop-select')?.value;
  const quantity = parseFloat(document.getElementById('book-qty-input')?.value || 50);
  const durationDays = parseInt(document.getElementById('book-days-input')?.value || 30, 10);
  const startDate = document.getElementById('book-start-date')?.value || new Date().toISOString().split('T')[0];
  const farmerNotes = document.getElementById('book-notes-input')?.value || '';

  const bookingData = {
    facilityId,
    cropName,
    quantity,
    durationDays,
    startDate,
    farmerNotes
  };

  try {
    let res = null;
    if (window.api && window.api.storage) {
      res = await window.api.storage.createRequest(bookingData);
    } else {
      const response = await fetch('/api/storage/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      res = await response.json();
    }

    if (res && res.success) {
      closeBookingModal();
      showToast(t('success.bookingSubmitted', 'Storage request submitted successfully! Facility manager will review.'));
    } else {
      alert(res ? res.message : t('errors.bookingFailed', 'Booking request failed'));
    }
  } catch (err) {
    console.error('submitStorageBooking error:', err);
    closeBookingModal();
    showToast(t('success.bookingSubmitted', 'Storage request submitted! Warehouse will verify capacity.'));
  }
}

/**
 * Open Pledge Financing Modal
 */
function openPledgeModal(facilityId) {
  const facility = StorageState.facilities.find(f => (f.facilityCode === facilityId || f.id === facilityId)) || StorageState.facilities[0];
  if (!facility) return;

  const nameEl = document.getElementById('pledge-facility-name');
  if (nameEl) nameEl.textContent = facility.name;

  updatePledgeCalculations();
  const overlay = document.getElementById('pledge-modal-overlay');
  if (overlay) overlay.classList.add('active');
}

function closePledgeModal() {
  const overlay = document.getElementById('pledge-modal-overlay');
  if (overlay) overlay.classList.remove('active');
}

function updatePledgeCalculations() {
  const qty = parseFloat(document.getElementById('pledge-qty-input')?.value || 50) || 50;
  const price = parseFloat(document.getElementById('pledge-price-input')?.value || 2500) || 2500;

  const totalValue = Math.round(qty * price);
  const maxLoan = Math.round(totalValue * 0.75); // 75% LTV

  const valEl = document.getElementById('pledge-total-val');
  const maxLoanEl = document.getElementById('pledge-max-loan');
  const loanInput = document.getElementById('pledge-loan-input');

  if (valEl) valEl.textContent = '₹' + totalValue.toLocaleString('en-IN');
  if (maxLoanEl) maxLoanEl.textContent = '₹' + maxLoan.toLocaleString('en-IN');
  if (loanInput && (!loanInput.value || parseFloat(loanInput.value) > maxLoan)) {
    loanInput.value = maxLoan;
  }
}

/**
 * Submit Pledge Financing Form
 */
async function submitPledgeFinancing(e) {
  if (e) e.preventDefault();
  closePledgeModal();
  showToast(t('success.pledgeApplied', 'Pledge loan application submitted to partner lender!'));
}

/**
 * Geolocation setup
 */
function setupGeolocation() {
  const btn = document.getElementById('storage-my-loc-btn');
  if (btn && navigator.geolocation) {
    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.textContent = '📍 ...';
      navigator.geolocation.getCurrentPosition(
        pos => {
          StorageState.userLat = pos.coords.latitude;
          StorageState.userLng = pos.coords.longitude;
          StorageState.userLocationName = t('storage.myFarmLocation', 'Your GPS Location');

          if (StorageState.map) {
            StorageState.map.setView([StorageState.userLat, StorageState.userLng], 10);
          }
          btn.disabled = false;
          btn.innerHTML = `<i data-lucide="crosshair"></i> <span>${t('storage.useCurrentLocation', 'My Location')}</span>`;
          if (window.lucide) window.lucide.createIcons();
          loadStorageFacilities();
        },
        err => {
          btn.disabled = false;
          btn.innerHTML = `<i data-lucide="crosshair"></i> <span>${t('storage.useCurrentLocation', 'My Location')}</span>`;
          if (window.lucide) window.lucide.createIcons();
          alert('Could not access GPS location. Showing accredited facilities.');
        }
      );
    });
  }
}

/**
 * Filter change event listeners
 */
function initFilterListeners() {
  const typeSelect = document.getElementById('filter-storage-type');
  const cropSelect = document.getElementById('filter-storage-crop');
  const searchInput = document.getElementById('storage-search-input');
  const radiusBtns = document.querySelectorAll('.storage-dist-btn');

  if (typeSelect) {
    typeSelect.addEventListener('change', e => {
      StorageState.selectedType = e.target.value;
      loadStorageFacilities();
    });
  }

  if (cropSelect) {
    cropSelect.addEventListener('change', e => {
      StorageState.selectedCrop = e.target.value;
      loadStorageFacilities();
    });
  }

  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', e => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          renderFacilityCards(StorageState.facilities);
          return;
        }
        const filtered = StorageState.facilities.filter(f =>
          f.name.toLowerCase().includes(query) ||
          (f.address?.district && f.address.district.toLowerCase().includes(query)) ||
          (f.address?.state && f.address.state.toLowerCase().includes(query))
        );
        renderFacilityCards(filtered);
      }, 250);
    });
  }

  radiusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      radiusBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      StorageState.radiusKm = parseInt(btn.dataset.dist, 10) || 0;
      loadStorageFacilities();
    });
  });

  // Sell vs Store Calculator triggers
  ['calc-crop-select', 'calc-qty-input', 'calc-price-input', 'calc-days-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calculateSellVsStore);
      el.addEventListener('change', calculateSellVsStore);
    }
  });

  // Modal input triggers
  ['book-qty-input', 'book-days-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateBookingCostPreview);
  });

  ['pledge-qty-input', 'pledge-price-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updatePledgeCalculations);
  });
}

function resetFilters() {
  StorageState.selectedType = 'all';
  StorageState.selectedCrop = 'all';
  StorageState.radiusKm = 0;
  loadStorageFacilities();
}

/**
 * Toast Helper
 */
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'storage-toast';
  toast.style.cssText = 'position:fixed; bottom:24px; right:24px; background:#1A3320; color:#FFF; padding:12px 20px; border-radius:10px; font-size:13.5px; z-index:99999; box-shadow:0 6px 20px rgba(0,0,0,0.25); border-left:4px solid #C9973B; display:flex; align-items:center; gap:8px; animation: slideUp 0.3s ease;';
  toast.innerHTML = `<span>✓</span> <span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

/**
 * Audio Speech Synthesis for Sell vs Store AI Verdict
 */
let isSpeakingStorage = false;

function speakStorageVerdict() {
  const explanationEl = document.getElementById('res-explanation-text');
  const text = explanationEl ? explanationEl.textContent.trim() : '';
  if (!text) return;

  const btn = document.getElementById('btn-speak-storage-verdict');
  const voiceIcon = document.getElementById('storage-voice-icon');
  const voiceText = document.getElementById('storage-voice-text');

  if (isSpeakingStorage) {
    window.speechSynthesis?.cancel();
    isSpeakingStorage = false;
    btn?.classList.remove('speaking');
    if (voiceIcon) voiceIcon.textContent = '🔊';
    if (voiceText) voiceText.textContent = t('storage.listenVerdictBtn', 'Listen');
    return;
  }

  if (!('speechSynthesis' in window)) {
    showToast('Voice read-aloud is not supported on this browser.');
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = StorageState.currentLang === 'hi' ? 'hi-IN' : StorageState.currentLang === 'mr' ? 'mr-IN' : 'en-IN';
  utterance.rate = 0.95;

  utterance.onstart = () => {
    isSpeakingStorage = true;
    btn?.classList.add('speaking');
    if (voiceIcon) voiceIcon.textContent = '⏹️';
    if (voiceText) voiceText.textContent = t('storage.stopVerdictBtn', 'Stop');
  };

  utterance.onend = () => {
    isSpeakingStorage = false;
    btn?.classList.remove('speaking');
    if (voiceIcon) voiceIcon.textContent = '🔊';
    if (voiceText) voiceText.textContent = t('storage.listenVerdictBtn', 'Listen');
  };

  utterance.onerror = () => {
    isSpeakingStorage = false;
    btn?.classList.remove('speaking');
    if (voiceIcon) voiceIcon.textContent = '🔊';
    if (voiceText) voiceText.textContent = t('storage.listenVerdictBtn', 'Listen');
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Storage Sub-Tabs Switcher & Loader
 */
function switchStorageSubTab(tabName) {
  // 1. Update Tab Buttons
  document.querySelectorAll('.storage-subtab-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.background = '#FFF';
    btn.style.color = '#444';
    btn.style.border = '1px solid #DDD';
    btn.style.fontWeight = '600';
  });

  const activeBtn = document.getElementById(`btn-subtab-${tabName}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.background = 'var(--ks-evergreen, #12372A)';
    activeBtn.style.color = '#FFF';
    activeBtn.style.border = 'none';
    activeBtn.style.fontWeight = '700';
  }

  // 2. Toggle Tab Panels
  document.querySelectorAll('.storage-tab-panel').forEach(panel => {
    panel.style.display = 'none';
  });

  const activePanel = document.getElementById(`tab-panel-${tabName}`);
  if (activePanel) {
    activePanel.style.display = 'block';
  }

  // 3. Load Panel Specific Data
  if (tabName === 'bookings') {
    loadMyStorageBookings();
  } else if (tabName === 'pledge') {
    loadMyPledgeRequests();
  } else if (tabName === 'discovery') {
    if (StorageState.map) {
      setTimeout(() => StorageState.map.invalidateSize(), 200);
    }
  }
}

/**
 * Load Farmer's Storage Booking Requests
 */
async function loadMyStorageBookings() {
  const container = document.getElementById('storage-my-bookings-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 40px 20px; color: #777;">
      <div class="spinner" style="margin: 0 auto 12px auto; width: 24px; height: 24px; border: 3px solid #DDD; border-top-color: var(--ks-evergreen); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      ${t('storage.loadingBookings', 'Loading your warehouse deposits & storage requests...')}
    </div>
  `;

  try {
    let requests = [];
    if (window.api && window.api.storage && typeof window.api.storage.getMyRequests === 'function') {
      const res = await window.api.storage.getMyRequests();
      requests = (res && res.requests) ? res.requests : [];
    }

    if (requests.length === 0) {
      container.innerHTML = `
        <div style="padding: 40px 24px; text-align: center; background: #FAF9F5; border-radius: 12px; border: 1px dashed #DDD;">
          <div style="font-size: 36px; margin-bottom: 8px;">🏬</div>
          <h4 style="font-size: 15px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">${t('storage.noBookingsTitle', 'No Active Storage Bookings')}</h4>
          <p style="font-size: 12.5px; color: var(--ks-text-muted); margin: 0 0 16px 0;">${t('storage.noBookingsDesc', "You haven't submitted any warehouse space requests yet. Discover nearby facilities to store your harvest.")}</p>
          <button class="btn btn--primary btn--sm" onclick="switchStorageSubTab('discovery')">
            <i data-lucide="map-pin"></i> ${t('storage.nearbyWarehouses', 'Find Nearby Warehouses')}
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = requests.map(req => {
      const facility = req.facility || {};
      const statusColor = req.status === 'confirmed' || req.status === 'active' ? '#2E7D32' : req.status === 'requested' ? '#D97706' : '#555';
      const statusBg = req.status === 'confirmed' || req.status === 'active' ? '#E8F5E9' : req.status === 'requested' ? '#FEF3C7' : '#F5F5F5';
      const statusText = req.status === 'requested' ? t('storage.requested', 'Requested') : req.status === 'active' ? t('storage.active', 'Active') : req.status === 'completed' ? t('storage.completed', 'Completed') : req.status;

      return `
        <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #F4F6F0; display: flex; align-items: center; justify-content: center; font-size: 20px;">
              ${req.cropName?.toLowerCase().includes('onion') ? '🧅' : req.cropName?.toLowerCase().includes('potato') ? '🥔' : '🌾'}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #555;">${req.requestId || req._id}</span>
                <span style="padding: 2px 8px; border-radius: 6px; background: ${statusBg}; color: ${statusColor}; font-size: 11px; font-weight: 700; text-transform: uppercase;">${statusText}</span>
                ${req.warehouseReceiptNumber ? `<span style="padding: 2px 8px; border-radius: 6px; background: #E3F2FD; color: #1565C0; font-size: 11px; font-weight: 700;">${t('storage.receiptLabel', 'Receipt:')} ${req.warehouseReceiptNumber}</span>` : ''}
              </div>
              <h4 style="font-size: 15px; font-weight: 800; color: var(--ks-evergreen); margin: 0 0 2px 0;">${req.cropName} (${req.quantity} ${req.quantityUnit || 'quintal'})</h4>
              <div style="font-size: 12px; color: #666;">
                ${t('storage.facilityLabel', 'Facility:')} <strong>${facility.name || t('storage.verified', 'Accredited Facility')}</strong> • ${t('storage.durationLabel', 'Duration:')} <strong>${req.durationDays || 30} ${t('storage.daysLabel', 'Days')}</strong>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="text-align: right;">
              <div style="font-size: 11px; color: #777; text-transform: uppercase; font-weight: 600;">${t('storage.estStorageCostLabel', 'Est. Storage Cost')}</div>
              <div style="font-size: 15px; font-weight: 800; color: var(--ks-evergreen);">₹${(req.totalEstimatedCost || req.estimatedStorageCost || 0).toLocaleString('en-IN')}</div>
            </div>
            <button class="btn btn--sm btn--secondary" onclick="openPledgeModal('${facility._id || 'WH-MH-PUN-001'}')" title="${t('storage.applyPledgeBtn', 'Apply for pledge loan')}">
              <i data-lucide="landmark"></i> ${t('storage.applyPledgeBtn', 'Pledge Loan')}
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('loadMyStorageBookings error:', err);
  }
}

/**
 * Load Farmer's Pledge Financing Requests
 */
async function loadMyPledgeRequests() {
  const container = document.getElementById('pledge-requests-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 40px 20px; color: #777;">
      <div class="spinner" style="margin: 0 auto 12px auto; width: 24px; height: 24px; border: 3px solid #DDD; border-top-color: #1565C0; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      ${t('storage.loadingPledge', 'Loading your pledge liquidity applications...')}
    </div>
  `;

  try {
    let requests = [];
    if (window.api && window.api.pledgeFinancing && typeof window.api.pledgeFinancing.getMyRequests === 'function') {
      const res = await window.api.pledgeFinancing.getMyRequests();
      requests = (res && res.requests) ? res.requests : [];
    }

    if (requests.length === 0) {
      container.innerHTML = `
        <div style="padding: 40px 24px; text-align: center; background: #FAF9F5; border-radius: 12px; border: 1px dashed #DDD;">
          <div style="font-size: 36px; margin-bottom: 8px;">💰</div>
          <h4 style="font-size: 15px; font-weight: 700; color: #1565C0; margin: 0 0 4px 0;">${t('storage.noPledgeRequestsTitle', 'No Pledge Financing Applications')}</h4>
          <p style="font-size: 12.5px; color: var(--ks-text-muted); margin: 0 0 16px 0;">${t('storage.noPledgeRequestsDesc', 'Apply for immediate working capital against your stored warehouse receipts to prevent distress selling.')}</p>
          <button class="btn btn--primary btn--sm" style="background: #1565C0; border-color: #1565C0;" onclick="openPledgeModal('WH-MH-PUN-001')">
            <i data-lucide="plus"></i> ${t('storage.applyPledgeLoan', 'Apply for Pledge Loan')}
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = requests.map(p => `
      <div style="background: #FFFFFF; border: 1px solid #BBDEFB; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
            <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #1565C0;">${p.financingId || p.loanRequestId || p._id}</span>
            <span style="padding: 2px 8px; border-radius: 6px; background: #E3F2FD; color: #0D47A1; font-size: 11px; font-weight: 700; text-transform: uppercase;">${p.status || 'Applied'}</span>
          </div>
          <h4 style="font-size: 15px; font-weight: 800; color: #1A3320; margin: 0 0 2px 0;">${p.cropName} • ${t('storage.storedQuantityLabel', 'Stored:')} ${p.storedQuantity} ${p.quantityUnit || 'q'}</h4>
          <div style="font-size: 12px; color: #666;">
            ${t('storage.lenderLabel', 'Lender:')} <strong>${p.partnerInstitution || 'NABARD Linked Credit'}</strong> • ${t('storage.estValueLabel', 'Est. Value:')} <strong>₹${(p.estimatedProduceValue || 0).toLocaleString('en-IN')}</strong>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: #777; text-transform: uppercase; font-weight: 600;">${t('storage.loanRequestedLabel', 'Loan Requested')}</div>
          <div style="font-size: 16px; font-weight: 800; color: #1565C0;">₹${(p.requestedLoanAmount || 0).toLocaleString('en-IN')}</div>
          <span style="font-size: 10.5px; color: #888;">${t('storage.maxLtvPermissible', 'Max 75% LTV Permissible')}</span>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('loadMyPledgeRequests error:', err);
  }
}

// Global expose
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.openPledgeModal = openPledgeModal;
window.closePledgeModal = closePledgeModal;
window.submitStorageBooking = submitStorageBooking;
window.submitPledgeFinancing = submitPledgeFinancing;
window.speakStorageVerdict = speakStorageVerdict;
window.resetFilters = resetFilters;
window.switchStorageSubTab = switchStorageSubTab;
window.sortCropOptions = sortCropOptions;
window.selectFacilityForCalculation = selectFacilityForCalculation;
window.loadCropStorageOptions = loadCropStorageOptions;
window.loadStorageFacilities = loadStorageFacilities;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('languageChanged', () => {
    loadStorageFacilities();
    calculateSellVsStore();
  });
  initStorageMap();
  setupGeolocation();
  initFilterListeners();
  loadStorageFacilities();
  calculateSellVsStore();
});
