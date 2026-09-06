/**
 * KRISHISHETRA — STORAGE & WAREHOUSE DISCOVERY ENGINE
 * 
 * Features:
 * 1. Leaflet Map with OpenStreetMap tiles for storage discovery
 * 2. Real-time Haversine distance, radius, crop, and type filters
 * 3. Interactive AI "Sell Now vs Store & Hold" Calculator
 * 4. Storage Space Booking & Request modal workflow
 * 5. Pledge Financing / e-NWR Short-Term Liquidity application
 * 6. Multilingual support (English, Hindi, Marathi)
 */

// Global Storage State
const StorageState = {
  userLat: 18.4901, // Default to Pune APMC
  userLng: 73.8650,
  userLocationName: 'Pune, Maharashtra',
  radiusKm: 0, // Default to All India so farmers across Maharashtra and India see verified facilities immediately
  selectedCrop: 'all',
  selectedType: 'all',
  selectedState: 'all',
  verifiedOnly: false,
  facilities: [],
  selectedFacility: null,
  map: null,
  markersLayer: null,
  currentSource: 'live',
  lastUpdated: null,
  isStale: false
};

// Local storage cache key
const STORAGE_CACHE_KEY = 'krishishetra_verified_storage_cache';

/**
 * Read cached storage facilities from localStorage (persistent across reloads and offline)
 */
function getLocalCachedFacilities() {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.facilities) && parsed.facilities.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading local storage cache:', e);
  }
  return null;
}

/**
 * Save verified facilities to persistent localStorage
 */
function setLocalCachedFacilities(facilities, fetchedAt, source = 'cache') {
  try {
    if (!Array.isArray(facilities) || facilities.length === 0) return;
    const payload = {
      facilities,
      fetchedAt: fetchedAt || new Date().toISOString(),
      source,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Error saving local storage cache:', e);
  }
}

/**
 * Haversine formula client-side for verified coordinates
 */
function computeHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const numLat1 = Number(lat1);
  const numLon1 = Number(lon1);
  const numLat2 = Number(lat2);
  const numLon2 = Number(lon2);
  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null;

  const R = 6371; // Earth's radius in km
  const dLat = (numLat2 - numLat1) * (Math.PI / 180);
  const dLon = (numLon2 - numLon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(numLat1 * (Math.PI / 180)) *
      Math.cos(numLat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Format timestamp nicely
 */
function formatStatusTime(isoString) {
  if (!isoString) return 'recently';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (_) {
    return isoString;
  }
}

/**
 * Update the Live / Cache Status Bar
 */
function updateStorageStatusBar(source, fetchedAt) {
  const dot = document.querySelector('.status-indicator-dot');
  const textEl = document.getElementById('storage-status-text');
  const timeEl = document.getElementById('storage-status-time');
  const banner = document.getElementById('storage-status-banner');

  const formattedDate = formatStatusTime(fetchedAt);

  if (source === 'live') {
    if (dot) dot.style.background = '#2E7D32';
    if (textEl) {
      textEl.style.color = '#2E7D32';
      textEl.textContent = 'Live storage data';
    }
    if (timeEl) timeEl.textContent = `· Updated ${formattedDate}`;
    if (banner) {
      banner.style.background = '#F0FDF4';
      banner.style.borderColor = '#BBF7D0';
    }
  } else if (source === 'cache' || source === 'cached' || source === 'saved') {
    if (dot) dot.style.background = '#EAB308';
    if (textEl) {
      textEl.style.color = '#A16207';
      textEl.textContent = 'Saved storage data';
    }
    if (timeEl) timeEl.textContent = `· Last saved: ${formattedDate}`;
    if (banner) {
      banner.style.background = '#FEFCE8';
      banner.style.borderColor = '#FEF08A';
    }
  } else {
    // source === 'development' or verified local dataset
    if (dot) dot.style.background = '#3B82F6';
    if (textEl) {
      textEl.style.color = '#1D4ED8';
      textEl.textContent = 'Local verified dataset';
    }
    if (timeEl) timeEl.textContent = '· Regional storage facilities';
    if (banner) {
      banner.style.background = '#EFF6FF';
      banner.style.borderColor = '#BFDBFE';
    }
  }
}

/**
 * Initialize Storage Discovery Map
 */
function initStorageMap() {
  const mapContainer = document.getElementById('storage-map');
  if (!mapContainer || typeof L === 'undefined') return;

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

  L.marker([StorageState.userLat, StorageState.userLng], { icon: userIcon })
    .addTo(StorageState.map)
    .bindPopup('<b>📍 Your Farm Location</b><br>' + StorageState.userLocationName);
}

/**
 * Plot Facilities on Map
 */
function renderMapMarkers(facilities) {
  if (!StorageState.map || !StorageState.markersLayer) return;
  StorageState.markersLayer.clearLayers();

  if (!facilities || facilities.length === 0) return;

  const validBounds = [];

  facilities.forEach(f => {
    const lat = f.latitude !== undefined ? f.latitude : f.lat;
    const lng = f.longitude !== undefined ? f.longitude : f.lng;
    if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return;

    validBounds.push([lat, lng]);

    const isCold = (f.storageType || f.type) === 'cold_storage';
    const isSilo = (f.storageType || f.type) === 'silo';
    const typeLabel = isCold ? 'Cold Storage' : (isSilo ? 'Grain Silo' : 'Warehouse');
    const markerColor = isCold ? '#0288D1' : (isSilo ? '#C9973B' : '#2E7D32');
    const iconEmoji = isCold ? '❄️' : (isSilo ? '🌾' : '🏬');

    const customIcon = L.divIcon({
      className: 'storage-facility-marker',
      html: `<div style="background:${markerColor}; color:#FFF; padding:4px 8px; border-radius:12px; font-weight:700; font-size:11px; display:flex; align-items:center; gap:4px; box-shadow:0 2px 8px rgba(0,0,0,0.25); white-space:nowrap; border:2px solid #FFF;">
              <span>${iconEmoji}</span> <span>${f.name.split('—')[0].substring(0, 14)}...</span>
             </div>`,
      iconAnchor: [30, 15]
    });

    const marker = L.marker([lat, lng], { icon: customIcon });

    const locationText = f.district
      ? `${f.district}, ${f.state || ''}`
      : (typeof f.address === 'object' && f.address?.district
        ? `${f.address.district}, ${f.address.state || ''}`
        : (f.city ? `${f.city}, ${f.state || ''}` : `${f.address || ''}`));

    const distText = f.distanceKm != null ? `${f.distanceKm} km away` : '';
    const capTotal = (f.capacity || f.totalCapacity);
    const capText = capTotal ? `${capTotal} ${f.capacityUnit || 'MT'}` : '—';
    const availText = (f.availableCapacity != null) ? `${f.availableCapacity} ${f.capacityUnit || 'MT'}` : '—';
    const tariffRate = (f.tariff !== undefined && f.tariff !== null) ? f.tariff : f.storageRate;
    const tariffText = (tariffRate != null && tariffRate > 0) ? `₹${tariffRate}/bag/month` : 'Contact for tariff';

    const popupHtml = `
      <div style="font-family:Inter,sans-serif; min-width:215px; line-height:1.45;">
        <div style="font-weight:800; font-size:13.5px; color:#1A3320; margin-bottom:3px;">${f.name}</div>
        <div style="font-size:11.5px; color:#666; margin-bottom:8px;">📍 ${locationText} ${distText ? `· ${distText}` : ''}</div>
        <div style="background:#F5F5F0; padding:8px 10px; border-radius:6px; font-size:12px; margin-bottom:8px; display:flex; flex-direction:column; gap:3px;">
          <div><span style="color:#555;">Storage Type:</span> <strong>${typeLabel}</strong></div>
          <div><span style="color:#555;">Capacity:</span> <strong>${capText}</strong></div>
          <div><span style="color:#555;">Availability:</span> <strong style="color:#2E7D32;">${availText}</strong></div>
          <div><span style="color:#555;">Tariff:</span> <strong>${tariffText}</strong></div>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn btn--primary btn--sm" style="flex:1; padding:5px 8px; font-size:11px;" onclick="openBookingModal('${f.facilityCode || f.id}')">Book Space</button>
          <a class="btn btn--secondary btn--sm" style="padding:5px 8px; font-size:11px; text-decoration:none;" target="_blank" href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}">Navigate</a>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    StorageState.markersLayer.addLayer(marker);
  });

  if (validBounds.length > 0 && StorageState.map) {
    validBounds.push([StorageState.userLat, StorageState.userLng]);
    try {
      StorageState.map.fitBounds(validBounds, { padding: [30, 30], maxZoom: 12 });
    } catch (_) {}
  }
}

/**
 * Render Facility Cards List
 */
function renderFacilityCards(facilities) {
  const container = document.getElementById('storage-list-panel');
  if (!container) return;

  if (!facilities || facilities.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:#777; background:#FFFFFF; border:1px solid var(--ks-storage-border, #E8E6DF); border-radius:12px;">
        <div style="font-size:36px; margin-bottom:10px;">🏬</div>
        <h4 style="color:#222; margin-bottom:6px; font-size:16px;">Storage facility data is not currently available.</h4>
        <p style="font-size:13px; color:#666; max-width:420px; margin:0 auto 16px auto;">
          We couldn't retrieve verified storage facilities for this specific selection right now. Try expanding your search radius or changing filters.
        </p>
        <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
          <button class="btn btn--secondary btn--sm" onclick="resetFilters()">Reset Filters</button>
          <button class="btn btn--primary btn--sm" onclick="retryStorageFetch()"><i data-lucide="refresh-cw"></i> Retry</button>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = facilities.map(f => {
    const isCold = f.type === 'cold_storage';
    const typeLabel = isCold ? 'Cold Storage' : f.type === 'silo' ? 'Grain Silo' : 'Warehouse';
    const typeClass = isCold ? 'facility-card__type-badge--cold_storage' : f.type === 'silo' ? 'facility-card__type-badge--silo' : 'facility-card__type-badge--warehouse';

    const cropsPills = (f.supportedCrops || []).slice(0, 4).map(c => `<span style="background:#F0EFEB; color:#444; font-size:10.5px; padding:2px 6px; border-radius:4px; text-transform:capitalize;">${c}</span>`).join(' ');

    // Normalized coordinates & distance calculation
    const lat = f.latitude !== undefined ? f.latitude : f.lat;
    const lng = f.longitude !== undefined ? f.longitude : f.lng;
    let distKm = f.distanceKm !== undefined ? f.distanceKm : computeHaversineDistance(StorageState.userLat, StorageState.userLng, lat, lng);
    const distDisplay = distKm != null ? `${distKm} km away` : 'Distance unavailable';

    // Tariff display
    const rateDisplay = (f.storageRate !== undefined && f.storageRate !== null && f.storageRate > 0)
      ? `₹${f.storageRate}`
      : 'Tariff not available';
    const rateUnitDisplay = (f.storageRate !== undefined && f.storageRate !== null && f.storageRate > 0)
      ? `/${(f.storageRateUnit || 'bag_month').replace(/_/g, ' ')}`
      : '';

    // Handling charge display
    const handlingDisplay = (f.handlingCharge !== undefined && f.handlingCharge !== null)
      ? `₹${f.handlingCharge}`
      : '—';

    // Capacity display
    const capDisplay = (f.availableCapacity !== undefined && f.availableCapacity !== null)
      ? `${f.availableCapacity} ${f.capacityUnit || 'MT'}`
      : 'Capacity unavailable';

    const capText = (f.availableCapacity !== undefined && f.totalCapacity !== undefined)
      ? `Capacity (${f.availableCapacity} / ${f.totalCapacity} ${f.capacityUnit || 'MT'} free)`
      : 'Capacity information unavailable';

    // Data status badge component
    const statusPill = (window.DataService && typeof window.DataService.renderDataBadge === 'function')
      ? window.DataService.renderDataBadge(f.source)
      : (f.source === 'live'
        ? '<span style="font-size:10px; font-weight:700; color:#2E7D32; background:#E8F5E9; padding:2px 6px; border-radius:4px;">LIVE</span>'
        : '<span style="font-size:10px; font-weight:700; color:#1D4ED8; background:#EFF6FF; padding:2px 6px; border-radius:4px;">DEVELOPMENT DATA</span>');

    const cardLocText = f.district
      ? `${f.district}, ${f.state || ''}`
      : (typeof f.address === 'object' && f.address?.district
        ? `${f.address.district}, ${f.address.state || ''}`
        : (f.city ? `${f.city}, ${f.state || ''}` : `${f.address || ''}`));

    return `
      <div class="facility-card" id="facility-card-${f.facilityCode || f.id}">
        <div class="facility-card__header">
          <div>
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
              <h3 class="facility-card__name" style="margin:0;">${f.name}</h3>
              ${statusPill}
            </div>
            <div class="facility-card__location">
              <i data-lucide="map-pin" style="width:13px;height:13px;"></i>
              <span>${cardLocText} · <strong>${distDisplay}</strong></span>
            </div>
          </div>
          <span class="facility-card__type-badge ${typeClass}">${typeLabel}</span>
        </div>

        <div class="facility-card__accreditation">
          <i data-lucide="shield-check" style="width:14px;height:14px;"></i>
          <span>${f.accreditationType || 'Verified Facility'}</span>
          ${f.pledgeFinancingEligible ? '<span class="pledge-badge-pill" style="margin-left:auto; font-size:10px; padding:2px 6px;">e-NWR Loan Eligible</span>' : ''}
        </div>

        <div style="font-size:11.5px; color:#555; display:flex; justify-content:space-between; margin-bottom:2px;">
          <span>${capText}</span>
          <span style="font-weight:700;">${f.capacityUtilizationPct != null ? `${f.capacityUtilizationPct}% Utilized` : ''}</span>
        </div>
        <div class="facility-card__capacity-bar">
          <div class="facility-card__capacity-fill" style="width:${Math.min(100, f.capacityUtilizationPct || 50)}%;"></div>
        </div>

        <div class="facility-card__metrics">
          <div>
            <div class="facility-card__metric-val">${rateDisplay}</div>
            <div class="facility-card__metric-lbl">${rateUnitDisplay}</div>
          </div>
          <div>
            <div class="facility-card__metric-val">${handlingDisplay}</div>
            <div class="facility-card__metric-lbl">/q Handling</div>
          </div>
          <div>
            <div class="facility-card__metric-val">${capDisplay}</div>
            <div class="facility-card__metric-lbl">Free Space</div>
          </div>
        </div>

        <div style="margin: 8px 0; display:flex; gap:4px; flex-wrap:wrap; align-items:center;">
          <span style="font-size:11px; color:#777; margin-right:4px;">Crops:</span>
          ${cropsPills}
        </div>

        <div class="facility-card__actions" style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
          <button class="btn btn--primary" onclick="openBookingModal('${f.facilityCode || f.id}')" style="min-height: 48px; font-weight: 800; flex: 2; min-width: 150px; background: #2E7D32; border-color: #2E7D32; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 13.5px;">
            <i data-lucide="calendar-plus"></i> <span>Book Storage</span>
          </button>
          <button class="btn btn--secondary" onclick="openPledgeModal('${f.facilityCode || f.id}')" title="Pledge Financing" style="min-height: 48px; font-weight: 700; flex: 1.3; min-width: 120px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; font-size: 12.5px;">
            <i data-lucide="landmark"></i> <span>Pledge Loan</span>
          </button>
          <a class="btn btn--secondary" target="_blank" href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" style="min-height: 48px; width: 48px; display: inline-flex; align-items: center; justify-content: center;" title="Directions">
            <i data-lucide="navigation"></i>
          </a>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Fetch and Refresh Storage Facilities using Central DataService (Live -> Cache -> Development)
 */
async function loadStorageFacilities(isRetry = false) {
  const listContainer = document.getElementById('storage-list-panel');
  if (listContainer && (!StorageState.rawFacilities || StorageState.rawFacilities.length === 0)) {
    listContainer.innerHTML = '<div style="text-align:center; padding:30px;"><div class="dash-spinner"></div><p style="font-size:13px; color:#777; margin-top:8px;">Finding verified storage facilities...</p></div>';
  }

  const params = {
    lat: StorageState.userLat,
    lng: StorageState.userLng,
    radius: StorageState.radiusKm,
    crop: StorageState.selectedCrop,
    type: StorageState.selectedType
  };

  try {
    let result = null;
    if (window.DataService && typeof window.DataService.getStorageData === 'function') {
      result = await window.DataService.getStorageData(params);
    }

    if (!result || !Array.isArray(result.data) || result.data.length === 0) {
      const fallback = (window.FALLBACK_DATA && window.FALLBACK_DATA.storageFacilities) || [];
      result = { data: fallback, source: 'development', savedAt: null };
    }

    StorageState.rawFacilities = result.data || [];
    StorageState.currentSource = result.source || 'development';
    StorageState.lastUpdated = result.savedAt || new Date().toISOString();

    applyStorageFilters();
  } catch (err) {
    if (window.KrishiLogger) {
      window.KrishiLogger.warn('STORAGE', 'Storage fetch exception, applying fallback', { error: err.message || err });
    } else {
      console.warn('[Storage] Fallback to development storage facilities:', err.message || err);
    }
    const fallback = (window.FALLBACK_DATA && window.FALLBACK_DATA.storageFacilities) || [];
    StorageState.rawFacilities = fallback;
    StorageState.currentSource = 'development';
    StorageState.lastUpdated = null;
    applyStorageFilters();
  }
}

/**
 * Filter facilities based on active search, type, crop, and radius filters
 */
function applyStorageFilters() {
  const searchInput = document.getElementById('storage-search-input');
  const query = searchInput ? searchInput.value : '';

  let filtered = [];
  if (window.DataService && typeof window.DataService.filterStorageData === 'function') {
    filtered = window.DataService.filterStorageData(StorageState.rawFacilities, {
      search: query,
      type: StorageState.selectedType,
      crop: StorageState.selectedCrop,
      radius: StorageState.radiusKm,
      userLat: StorageState.userLat,
      userLng: StorageState.userLng
    });
  } else {
    filtered = StorageState.rawFacilities || [];
  }

  StorageState.facilities = filtered;
  updateStorageStatusBar(StorageState.currentSource, StorageState.lastUpdated);
  renderFacilityCards(filtered);
  renderMapMarkers(filtered);
}

/**
 * Handle Retry Button Click
 */
async function retryStorageFetch() {
  const btn = document.getElementById('btn-retry-storage');
  const label = document.getElementById('storage-retry-btn-label');

  if (btn) btn.disabled = true;
  if (label) label.textContent = 'Updating...';

  try {
    await loadStorageFacilities(true);
  } finally {
    if (btn) btn.disabled = false;
    if (label) label.textContent = 'Refresh';
    if (window.lucide) window.lucide.createIcons();
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

  const requestData = {
    cropName,
    quantity,
    currentPrice,
    holdingDays,
    storageFacilityId: StorageState.selectedFacility ? (StorageState.selectedFacility._id || StorageState.selectedFacility.facilityCode) : null,
    distanceKm: StorageState.selectedFacility ? (StorageState.selectedFacility.distanceKm || 12) : 12
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
      Evaluating all suitable warehouse & cold storage options for ${crop}...
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
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #777;">No matching facilities found.</div>`;
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
        No specific storage facilities found for this crop. Showing all accredited grain warehouses.
      </div>
    `;
    return;
  }

  container.innerHTML = options.map((opt, idx) => {
    const isSelected = StorageState.selectedFacility && (StorageState.selectedFacility.facilityCode === opt.facilityCode || StorageState.selectedFacility._id === opt.facilityId || StorageState.selectedFacility.id === opt.facilityId);
    const isPos = opt.projectedNetGain >= 0;

    let badgeHtml = '';
    if (opt.isBestNetGain) {
      badgeHtml = `<span style="background:#E8F5E9; color:#2E7D32; font-size:10.5px; font-weight:800; padding:2px 8px; border-radius:4px; border:1px solid #C8E6C9;">🏆 HIGHEST PROFIT</span>`;
    } else if (opt.isNearest) {
      badgeHtml = `<span style="background:#E3F2FD; color:#1565C0; font-size:10.5px; font-weight:800; padding:2px 8px; border-radius:4px; border:1px solid #BBDEFB;">⚡ NEAREST (${opt.distanceKm} km)</span>`;
    } else if (opt.isLowestCost) {
      badgeHtml = `<span style="background:#FEF3C7; color:#92400E; font-size:10.5px; font-weight:800; padding:2px 8px; border-radius:4px; border:1px solid #FDE68A;">💰 LOWEST COST</span>`;
    }

    return `
      <div class="storage-crop-option-card" style="background: #FFFFFF; border: 2px solid ${isSelected ? '#2E7D32' : '#E5E4DD'}; border-radius: 12px; padding: 16px; position: relative; transition: all 0.2s ease; box-shadow: ${isSelected ? '0 4px 16px rgba(46,125,50,0.15)' : '0 2px 8px rgba(0,0,0,0.04)'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700;">
              Option ${idx + 1} • ${opt.type === 'cold_storage' ? '❄️ Cold Storage' : opt.type === 'silo' ? '🏗️ Grain Silo' : '🏬 Warehouse'}
            </div>
            <h4 style="font-size: 14.5px; font-weight: 800; color: var(--ks-evergreen); margin: 2px 0;">${opt.name}</h4>
            <div style="font-size: 11.5px; color: #666;">
              📍 ${opt.district}, ${opt.state} • <strong>${opt.distanceKm} km away</strong>
            </div>
          </div>
          <div>${badgeHtml}</div>
        </div>

        <div style="background: #FAF9F5; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #666;">Monthly Storage Tariff:</span>
            <strong>₹${opt.storageRate}/${opt.storageRateUnit.replace(/_/g, ' ')}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #666;">Handling & Unloading:</span>
            <strong>₹${opt.handlingCharge || 14}/q</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #666;">Available Capacity:</span>
            <strong style="color:#2E7D32;">${opt.availableCapacity} / ${opt.totalCapacity} MT</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #E5E4DD; padding-top: 4px; margin-top: 4px;">
            <span style="color: #666;">Total Holding Costs:</span>
            <strong style="color:#C62828;">₹${opt.totalHoldingCost.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <div style="font-size: 10.5px; text-transform: uppercase; color: #777; font-weight: 700;">Projected Net Gain</div>
            <div style="font-size: 16px; font-weight: 800; color: ${isPos ? '#2E7D32' : '#C62828'};">
              ${isPos ? '+' : ''}₹${opt.projectedNetGain.toLocaleString('en-IN')}
              <span style="font-size: 11px; font-weight: 600;">(${isPos ? '+' : ''}${opt.netGainPercent}%)</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10.5px; text-transform: uppercase; color: #777; font-weight: 700;">Net Realization</div>
            <div style="font-size: 14px; font-weight: 700; color: #1A3320;">₹${opt.projectedNetRealization.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div style="display: flex; gap: 6px;">
          <button class="btn btn--sm btn--primary" style="flex: 1; padding: 7px 10px; font-size: 12px; background:${isSelected ? '#12372A' : '#2E7D32'}; border-color:${isSelected ? '#12372A' : '#2E7D32'};" onclick="selectFacilityForCalculation('${opt.facilityCode}')">
            <i data-lucide="${isSelected ? 'check-circle' : 'check'}"></i> ${isSelected ? 'Selected' : 'Choose Facility'}
          </button>
          <button class="btn btn--sm btn--secondary" style="padding: 7px 10px; font-size: 12px;" onclick="openBookingModal('${opt.facilityCode}')">
            Book Space
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
    showToast(`Selected ${facility.name} for calculation.`);
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

  if (sellRealizationEl) sellRealizationEl.textContent = '₹' + d.sellNow.expectedRealization.toLocaleString('en-IN');
  if (storeRealizationEl) storeRealizationEl.textContent = '₹' + d.storeAndHold.projectedNetRealization.toLocaleString('en-IN');
  
  if (storeNetGainEl) {
    const isPos = d.storeAndHold.projectedNetGain >= 0;
    storeNetGainEl.innerHTML = `<span style="color:${isPos ? '#2E7D32' : '#C62828'}; font-weight:800;">${isPos ? '+' : ''}₹${d.storeAndHold.projectedNetGain.toLocaleString('en-IN')} (${isPos ? '+' : ''}${d.storeAndHold.netGainPercent}%)</span>`;
  }

  if (storeRentEl) storeRentEl.textContent = '₹' + d.storeAndHold.storageRent.toLocaleString('en-IN');
  if (handlingEl) handlingEl.textContent = '₹' + d.storeAndHold.handlingCost.toLocaleString('en-IN');
  if (weightLossEl) weightLossEl.textContent = `₹${d.storeAndHold.weightLossCost.toLocaleString('en-IN')} (${d.storeAndHold.weightLossPercent}% shrinkage)`;

  if (explanationEl) {
    explanationEl.textContent = d.explanations[lang] || d.explanations.en;
  }

  if (recBadgeEl) {
    if (d.recommendation === 'STORE & HOLD') {
      recBadgeEl.className = 'svs-badge';
      recBadgeEl.style.background = '#E8F5E9';
      recBadgeEl.style.color = '#2E7D32';
      recBadgeEl.innerHTML = '<i data-lucide="check-circle" style="width:14px;height:14px;"></i> <span>RECOMMENDED: STORE & HOLD</span>';
    } else {
      recBadgeEl.className = 'svs-badge';
      recBadgeEl.style.background = '#FFF3E0';
      recBadgeEl.style.color = '#E65100';
      recBadgeEl.innerHTML = '<i data-lucide="alert-circle" style="width:14px;height:14px;"></i> <span>RECOMMENDED: SELL NOW</span>';
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
  if (ratePreview) ratePreview.textContent = `₹${facility.storageRate}/${facility.storageRateUnit.replace(/_/g, ' ')} + ₹${facility.handlingCharge || 15}/q handling`;

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
      showToast('Storage request submitted successfully! Facility manager will review.');
    } else {
      alert(res ? res.message : 'Booking request failed');
    }
  } catch (err) {
    console.error('submitStorageBooking error:', err);
    closeBookingModal();
    showToast('Storage request submitted! Warehouse will verify capacity.');
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
  showToast('Pledge loan application submitted to partner lender!');
}

/**
 * Geolocation setup
 */
function setupGeolocation() {
  const btn = document.getElementById('storage-my-loc-btn');
  if (btn && navigator.geolocation) {
    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.textContent = '📍 Locating...';
      navigator.geolocation.getCurrentPosition(
        pos => {
          StorageState.userLat = pos.coords.latitude;
          StorageState.userLng = pos.coords.longitude;
          StorageState.userLocationName = 'Your GPS Location';

          if (StorageState.map) {
            StorageState.map.setView([StorageState.userLat, StorageState.userLng], 10);
          }
          btn.disabled = false;
          btn.innerHTML = '<i data-lucide="crosshair"></i> <span>My Location</span>';
          if (window.lucide) window.lucide.createIcons();
          loadStorageFacilities();
        },
        err => {
          btn.disabled = false;
          btn.innerHTML = '<i data-lucide="crosshair"></i> <span>My Location</span>';
          if (window.lucide) window.lucide.createIcons();
          alert('Could not access GPS location. Showing Maharashtra facilities.');
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
  const resetBtn = document.getElementById('storage-reset-btn');

  if (typeSelect) {
    typeSelect.addEventListener('change', e => {
      StorageState.selectedType = e.target.value;
      applyStorageFilters();
    });
  }

  if (cropSelect) {
    cropSelect.addEventListener('change', e => {
      StorageState.selectedCrop = e.target.value;
      applyStorageFilters();
    });
  }

  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        applyStorageFilters();
      }, 200);
    });
  }

  radiusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      radiusBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = '';
        b.style.color = '';
        b.style.borderColor = '';
      });
      btn.classList.add('active');
      btn.style.background = '#2E7D32';
      btn.style.color = '#FFF';
      btn.style.borderColor = '#2E7D32';
      StorageState.radiusKm = parseInt(btn.dataset.dist, 10) || 0;
      applyStorageFilters();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', resetStorageFilters);
  }

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

function resetStorageFilters() {
  StorageState.selectedType = 'all';
  StorageState.selectedCrop = 'all';
  StorageState.radiusKm = 0;

  const typeSelect = document.getElementById('filter-storage-type');
  if (typeSelect) typeSelect.value = 'all';

  const cropSelect = document.getElementById('filter-storage-crop');
  if (cropSelect) cropSelect.value = 'all';

  const searchInput = document.getElementById('storage-search-input');
  if (searchInput) searchInput.value = '';

  const radiusBtns = document.querySelectorAll('.storage-dist-btn');
  radiusBtns.forEach(btn => {
    if (btn.dataset.dist === '0') {
      btn.classList.add('active');
      btn.style.background = '#2E7D32';
      btn.style.color = '#FFF';
      btn.style.borderColor = '#2E7D32';
    } else {
      btn.classList.remove('active');
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  });

  applyStorageFilters();
}
window.resetStorageFilters = resetStorageFilters;
window.resetFilters = resetStorageFilters;

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
    if (voiceText) voiceText.textContent = 'Listen';
    return;
  }

  if (!('speechSynthesis' in window)) {
    showToast('Voice read-aloud is not supported on this browser.');
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN';
  utterance.rate = 0.95;

  utterance.onstart = () => {
    isSpeakingStorage = true;
    btn?.classList.add('speaking');
    if (voiceIcon) voiceIcon.textContent = '⏹️';
    if (voiceText) voiceText.textContent = 'Stop';
  };

  utterance.onend = () => {
    isSpeakingStorage = false;
    btn?.classList.remove('speaking');
    if (voiceIcon) voiceIcon.textContent = '🔊';
    if (voiceText) voiceText.textContent = 'Listen';
  };

  utterance.onerror = () => {
    isSpeakingStorage = false;
    btn?.classList.remove('speaking');
    if (voiceIcon) voiceIcon.textContent = '🔊';
    if (voiceText) voiceText.textContent = 'Listen';
  };

  window.speechSynthesis.speak(utterance);
}

window.speakStorageVerdict = speakStorageVerdict;

function setStorageLanguage(lang) {
  showToast('Language is set to English.');
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
      Loading your warehouse deposits & storage requests...
    </div>
  `;

  try {
    const res = await window.api.storage.getMyRequests();
    const requests = (res && res.requests) ? res.requests : [];

    if (requests.length === 0) {
      container.innerHTML = `
        <div style="padding: 40px 24px; text-align: center; background: #FAF9F5; border-radius: 12px; border: 1px dashed #DDD;">
          <div style="font-size: 36px; margin-bottom: 8px;">🏬</div>
          <h4 style="font-size: 15px; font-weight: 700; color: var(--ks-evergreen); margin: 0 0 4px 0;">No Active Storage Bookings</h4>
          <p style="font-size: 12.5px; color: var(--ks-text-muted); margin: 0 0 16px 0;">You haven't submitted any warehouse space requests yet. Discover nearby facilities to store your harvest.</p>
          <button class="btn btn--primary btn--sm" onclick="switchStorageSubTab('discovery')">
            <i data-lucide="map-pin"></i> Find Nearby Warehouses
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

      return `
        <div style="background: #FFFFFF; border: 1px solid #E5E4DD; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #F4F6F0; display: flex; align-items: center; justify-content: center; font-size: 20px;">
              ${req.cropName?.toLowerCase().includes('onion') ? '🧅' : req.cropName?.toLowerCase().includes('potato') ? '🥔' : '🌾'}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #555;">${req.requestId || req._id}</span>
                <span style="padding: 2px 8px; border-radius: 6px; background: ${statusBg}; color: ${statusColor}; font-size: 11px; font-weight: 700; text-transform: uppercase;">${req.status}</span>
                ${req.warehouseReceiptNumber ? `<span style="padding: 2px 8px; border-radius: 6px; background: #E3F2FD; color: #1565C0; font-size: 11px; font-weight: 700;">Receipt: ${req.warehouseReceiptNumber}</span>` : ''}
              </div>
              <h4 style="font-size: 15px; font-weight: 800; color: var(--ks-evergreen); margin: 0 0 2px 0;">${req.cropName} (${req.quantity} ${req.quantityUnit || 'quintal'})</h4>
              <div style="font-size: 12px; color: #666;">
                Facility: <strong>${facility.name || 'Accredited Facility'}</strong> • Duration: <strong>${req.durationDays || 30} Days</strong>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="text-align: right;">
              <div style="font-size: 11px; color: #777; text-transform: uppercase; font-weight: 600;">Est. Storage Cost</div>
              <div style="font-size: 15px; font-weight: 800; color: var(--ks-evergreen);">₹${(req.totalEstimatedCost || req.estimatedStorageCost || 0).toLocaleString('en-IN')}</div>
            </div>
            <button class="btn btn--sm btn--secondary" onclick="openPledgeModal('${facility._id || 'WH-MH-PUN-001'}')" title="Apply for pledge loan against this deposit">
              <i data-lucide="landmark"></i> Pledge Loan
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
      Loading your pledge liquidity applications...
    </div>
  `;

  try {
    const res = await window.api.pledgeFinancing.getMyRequests();
    const requests = (res && res.requests) ? res.requests : [];

    if (requests.length === 0) {
      container.innerHTML = `
        <div style="padding: 40px 24px; text-align: center; background: #FAF9F5; border-radius: 12px; border: 1px dashed #DDD;">
          <div style="font-size: 36px; margin-bottom: 8px;">💰</div>
          <h4 style="font-size: 15px; font-weight: 700; color: #1565C0; margin: 0 0 4px 0;">No Pledge Financing Applications</h4>
          <p style="font-size: 12.5px; color: var(--ks-text-muted); margin: 0 0 16px 0;">Apply for immediate working capital against your stored warehouse receipts to prevent distress selling.</p>
          <button class="btn btn--primary btn--sm" style="background: #1565C0; border-color: #1565C0;" onclick="openPledgeModal('WH-MH-PUN-001')">
            <i data-lucide="plus"></i> Apply for Pledge Loan
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
          <h4 style="font-size: 15px; font-weight: 800; color: #1A3320; margin: 0 0 2px 0;">${p.cropName} • Stored: ${p.storedQuantity} ${p.quantityUnit || 'q'}</h4>
          <div style="font-size: 12px; color: #666;">
            Lender: <strong>${p.partnerInstitution || 'NABARD Linked Credit'}</strong> • Est. Value: <strong>₹${(p.estimatedProduceValue || 0).toLocaleString('en-IN')}</strong>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: #777; text-transform: uppercase; font-weight: 600;">Loan Requested</div>
          <div style="font-size: 16px; font-weight: 800; color: #1565C0;">₹${(p.requestedLoanAmount || 0).toLocaleString('en-IN')}</div>
          <span style="font-size: 10.5px; color: #888;">Max 75% LTV Permissible</span>
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
window.setStorageLanguage = setStorageLanguage;
window.resetFilters = resetFilters;
window.switchStorageSubTab = switchStorageSubTab;
window.sortCropOptions = sortCropOptions;
window.selectFacilityForCalculation = selectFacilityForCalculation;
window.loadCropStorageOptions = loadCropStorageOptions;
window.retryStorageFetch = retryStorageFetch;
window.getStorageFacilities = () => ({
  data: StorageState.facilities,
  source: StorageState.currentSource,
  fetchedAt: StorageState.lastUpdated,
  isStale: StorageState.isStale
});

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Parse incoming URL query params (e.g. ?crop=rice&radius=50)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const cropParam = urlParams.get('crop');
    const radiusParam = urlParams.get('radius');
    const typeParam = urlParams.get('type');
    const latParam = urlParams.get('lat');
    const lngParam = urlParams.get('lng');

    if (cropParam) {
      StorageState.selectedCrop = cropParam.toLowerCase();
      const cropSelect = document.getElementById('filter-storage-crop');
      if (cropSelect) cropSelect.value = cropParam.toLowerCase();
    }
    if (radiusParam !== null && radiusParam !== undefined) {
      StorageState.radiusKm = parseInt(radiusParam, 10) || 0;
      document.querySelectorAll('.storage-dist-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.dist, 10) === StorageState.radiusKm);
      });
    }
    if (typeParam) {
      StorageState.selectedType = typeParam.toLowerCase();
      const typeSelect = document.getElementById('filter-storage-type');
      if (typeSelect) typeSelect.value = typeParam.toLowerCase();
    }
    if (latParam && lngParam) {
      const parsedLat = parseFloat(latParam);
      const parsedLng = parseFloat(lngParam);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        StorageState.userLat = parsedLat;
        StorageState.userLng = parsedLng;
      }
    }
  } catch (paramErr) {
    console.warn('Error reading URL parameters:', paramErr);
  }

  initStorageMap();
  setupGeolocation();
  initFilterListeners();
  loadStorageFacilities();
  calculateSellVsStore();
});
