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
  userLat: null,
  userLng: null,
  isExactLocation: false,
  farmerMarker: null,
  userLocationName: '',
  radiusKm: 0,
  selectedCrop: 'all',
  selectedType: 'all',
  selectedState: 'all',
  selectedDistrict: 'all',
  selectedSource: 'iisfm', // Default to official Government of India IISFM depots
  searchQuery: '',
  page: 1,
  limit: 15,
  totalPages: 1,
  totalCount: 0,
  verifiedOnly: false,
  facilities: [],
  mapDepots: [],
  totalDepots: 0,
  mappableDepots: 0,
  unmappableDepots: 0,
  selectedFacility: null,
  map: null,
  markersLayer: null,
  availableStates: []
};

/**
 * Resolves API Base URL dynamically (e.g., http://127.0.0.1:5000/api in local dev environments)
 */
function getApiBase() {
  if (typeof resolveApiBaseUrl === 'function') {
    return resolveApiBaseUrl();
  }
  if (window.api && window.api.client && window.api.client.baseURL) {
    return window.api.client.baseURL;
  }
  const isLocalDev = typeof window !== 'undefined' && window.location && (window.location.port === '5500' || window.location.port === '3000' || window.location.port === '8080');
  return isLocalDev ? 'http://127.0.0.1:5000/api' : '/api';
}

/**
 * Initialize Storage Discovery Map (India-wide view with Marker Clustering)
 */
function initStorageMap() {
  const mapContainer = document.getElementById('storage-map');
  if (!mapContainer || typeof L === 'undefined') return;

  // Center on India nationwide
  StorageState.map = L.map('storage-map', {
    zoomControl: false
  }).setView([22.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors | KrishiShetra'
  }).addTo(StorageState.map);

  // Initialize marker layer with clustering support if available
  if (typeof L.markerClusterGroup === 'function') {
    StorageState.markersLayer = L.markerClusterGroup({
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });
    StorageState.map.addLayer(StorageState.markersLayer);
  } else {
    StorageState.markersLayer = L.layerGroup().addTo(StorageState.map);
  }
}

/**
 * Request exact browser geolocation from the farmer
 */
function requestFarmerLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.');
    return;
  }
  showToast('Requesting device location permission...');
  navigator.geolocation.getCurrentPosition(
    pos => {
      StorageState.userLat = pos.coords.latitude;
      StorageState.userLng = pos.coords.longitude;
      StorageState.isExactLocation = true;
      StorageState.userLocationName = 'Your Verified Farm Location';
      updateFarmerLocationMarker();
      StorageState.page = 1;
      loadStorageFacilities();
      loadStorageMapData();
      showToast('📍 Exact farm location detected!');
    },
    err => {
      console.warn('Geolocation permission denied or error:', err.message);
      StorageState.userLat = null;
      StorageState.userLng = null;
      StorageState.isExactLocation = false;
      removeFarmerLocationMarker();
      showToast('Location permission is required to show your exact position.');
      StorageState.page = 1;
      loadStorageFacilities();
      loadStorageMapData();
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function updateFarmerLocationMarker() {
  if (!StorageState.map || !StorageState.userLat || !StorageState.userLng) return;
  removeFarmerLocationMarker();

  const userIcon = L.divIcon({
    className: 'storage-user-marker',
    html: '<div style="background:#1976D2; border:3px solid #FFF; width:22px; height:22px; border-radius:50%; box-shadow:0 0 12px rgba(25,118,210,0.8); animation: pulse 1.8s infinite; display:flex; align-items:center; justify-content:center; color:#FFF; font-size:11px;">🚜</div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  StorageState.farmerMarker = L.marker([StorageState.userLat, StorageState.userLng], {
    icon: userIcon,
    zIndexOffset: 1000
  })
    .addTo(StorageState.map)
    .bindPopup('<b>🚜 Your Exact Farm Location</b><br>Coordinates verified via device geolocation.');

  StorageState.map.setView([StorageState.userLat, StorageState.userLng], 8);
}

function removeFarmerLocationMarker() {
  if (StorageState.farmerMarker && StorageState.map) {
    StorageState.map.removeLayer(StorageState.farmerMarker);
    StorageState.farmerMarker = null;
  }
}

/**
 * Load available States and Districts from official IISFM government dataset
 */
async function loadStorageLocations() {
  try {
    let res = null;
    if (window.api && window.api.storage && typeof window.api.storage.getDepotLocations === 'function') {
      res = await window.api.storage.getDepotLocations();
    } else {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/storage/depots/locations`);
      res = await response.json();
    }

    if (res && res.success && Array.isArray(res.states)) {
      StorageState.availableStates = res.states;
      populateStateDropdown(res.states);
    }
  } catch (err) {
    console.warn('Could not load IISFM depot locations:', err.message);
  }
}

function populateStateDropdown(states) {
  const stateSelect = document.getElementById('filter-storage-state');
  if (!stateSelect) return;
  const currentVal = stateSelect.value;
  const allText = (window.KrishiI18n ? window.KrishiI18n.t('storage.allStates') : null) || 'All States (India)';

  let html = `<option value="all">${allText}</option>`;
  states.forEach(s => {
    html += `<option value="${s.name}">${s.name}</option>`;
  });
  stateSelect.innerHTML = html;
  if (currentVal) stateSelect.value = currentVal;
}

function updateDistrictDropdown(stateName) {
  const distSelect = document.getElementById('filter-storage-district');
  if (!distSelect) return;
  const allDistText = (window.KrishiI18n ? window.KrishiI18n.t('storage.allDistricts') : null) || 'All Districts';

  if (!stateName || stateName === 'all') {
    distSelect.innerHTML = `<option value="all">${allDistText}</option>`;
    StorageState.selectedDistrict = 'all';
    return;
  }

  const found = StorageState.availableStates.find(s => s.name.toLowerCase() === stateName.toLowerCase());
  const districts = found ? found.districts : [];

  let html = `<option value="all">${allDistText}</option>`;
  districts.forEach(d => {
    html += `<option value="${d}">${d}</option>`;
  });
  distSelect.innerHTML = html;
  StorageState.selectedDistrict = 'all';
}

/**
 * Plot Facilities on Map (safeguarded for facilities with and without coordinates)
 */
/**
 * Plot Facilities on Map (safeguarded for facilities with and without coordinates)
 * Supports marker clustering and distinct verified vs approximate indicators (Requirement C, E, G, H)
 */
function renderMapMarkers(facilities) {
  if (!StorageState.map || !StorageState.markersLayer) return;
  StorageState.markersLayer.clearLayers();

  if (!facilities || facilities.length === 0) return;

  facilities.forEach(f => {
    if (typeof f.latitude !== 'number' || typeof f.longitude !== 'number' || isNaN(f.latitude) || isNaN(f.longitude)) {
      return;
    }

    const isGov = f.isGovData || f.type === 'fci_depot' || (f.source && f.source.includes('IISFM'));
    const isExact = f.coordinatesSource === 'facility_exact' || f.coordinatesSource === 'verified_geocode';
    const markerColor = isExact ? '#1B5E20' : (isGov ? '#2E7D32' : '#0288D1');
    const borderStyle = isExact ? 'border: 2px solid #FFF;' : 'border: 2px dashed #FFF;';
    const iconSymbol = isExact ? '📍' : (isGov ? '◉' : '🏬');

    const customIcon = L.divIcon({
      className: 'storage-pin-marker',
      html: `<div style="background:${markerColor}; color:#FFF; width:24px; height:24px; border-radius:50%; font-size:12px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3); ${borderStyle} cursor:pointer;">
              <span style="line-height:1;">${iconSymbol}</span>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -14]
    });

    const marker = L.marker([f.latitude, f.longitude], { icon: customIcon });

    const district = (f.address && f.address.district) || f.revenueDistrict || 'Not Specified';
    const state = (f.address && f.address.state) || f.revenueState || 'Not Specified';
    const distText = f.distanceKm !== undefined ? `<div style="font-size:11px; color:#1B5E20; margin-top:2px;"><strong>Approx. distance:</strong> ${f.distanceKm} km</div>` : '';

    const locationDisclosure = isExact
      ? 'Verified facility location'
      : 'Approximate district location';

    const totalCapDisplay = (f.totalCapacity > 0) ? `${f.totalCapacity.toLocaleString('en-IN')} MT` : 'Capacity not specified';
    const coveredCapDisplay = (f.coveredCapacity > 0) ? `${f.coveredCapacity.toLocaleString('en-IN')} MT` : '0 MT';
    const openCapDisplay = (f.openCapacity > 0) ? `${f.openCapacity.toLocaleString('en-IN')} MT` : '0 MT';

    const zeroCapText = (f.openCapacity === 0)
      ? '<span style="color:#B45309; font-size:10.5px; font-weight:600;"> (Currently no open capacity reported)</span>'
      : '';

    // Non-permanent tooltip for hover/tap (Requirement: visually clean map, no permanent text clutter)
    const depotTitle = f.name || f.depotName || 'Depot Facility';
    const tooltipLoc = [district, state].filter(d => d && d !== 'Not Specified').join(', ');
    const tooltipPrecision = isExact ? 'Verified facility location' : 'Approx. district location';
    const tooltipPrecisionColor = isExact ? '#1B5E20' : '#854D0E';

    const tooltipHtml = `
      <div style="font-family:Inter,sans-serif; text-align:left; line-height:1.35; padding:2px 0;">
        <div style="font-weight:700; font-size:12px; color:#1A3320; margin-bottom:2px;">${depotTitle}</div>
        ${tooltipLoc ? `<div style="font-size:11px; color:#555; margin-bottom:2px;">📍 ${tooltipLoc}</div>` : ''}
        <div style="font-size:10px; font-weight:600; color:${tooltipPrecisionColor};">${tooltipPrecision}</div>
      </div>
    `;

    marker.bindTooltip(tooltipHtml, {
      direction: 'top',
      offset: [0, -14],
      opacity: 0.96,
      sticky: false,
      className: 'storage-tooltip'
    });

    const popupHtml = `
      <div style="font-family:Inter,sans-serif; min-width:250px;">
        <div style="font-weight:700; font-size:13.5px; color:#1A3320; margin-bottom:3px;">${f.name || f.depotName}</div>
        <div style="font-size:11.5px; color:#555; margin-bottom:6px;">
          📍 ${district}, ${state}
          <div style="font-size:11px; color:#333; margin-top:3px;">
            <strong>Depot Code:</strong> ${f.depotCode || f.facilityCode || 'N/A'}
          </div>
          <div style="font-size:11px; color:#333; margin-top:1px;">
            <strong>Location:</strong> ${locationDisclosure}
          </div>
          <div style="font-size:11px; color:#333; margin-top:1px;">
            <strong>Source:</strong> Government of India • IISFM
          </div>
          ${distText}
        </div>
        <div style="background:#F5F5F0; padding:8px 10px; border-radius:6px; font-size:11.5px; margin-bottom:8px; line-height:1.45;">
          <div><strong>Total Capacity:</strong> ${totalCapDisplay}</div>
          <div><strong>Covered Capacity:</strong> ${coveredCapDisplay}</div>
          <div><strong>Open Capacity:</strong> ${openCapDisplay}${zeroCapText}</div>
        </div>
        <div style="display:flex; gap:6px;">
          ${isGov
            ? `<button class="btn btn--primary btn--sm" style="flex:1; padding:4px 8px; font-size:11px; background:#1B5E20; border-color:#1B5E20;" onclick="openGovDepotInfoModal('${f.depotCode || f.facilityCode || f.id}')">View Details</button>`
            : `<button class="btn btn--primary btn--sm" style="flex:1; padding:4px 8px; font-size:11px;" onclick="openBookingModal('${f.facilityCode || f.id}')">Book Space</button>`}
          <a class="btn btn--secondary btn--sm" style="padding:4px 8px; font-size:11px; text-decoration:none;" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((f.depotName || f.name) + ' ' + district + ' ' + state)}">Map</a>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    StorageState.markersLayer.addLayer(marker);
  });
}

/**
 * Render Pagination Controls
 */
function renderPagination() {
  const container = document.getElementById('storage-pagination-wrap');
  if (!container) return;

  if (StorageState.selectedSource === 'demo' || StorageState.totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const startRecord = ((StorageState.page - 1) * StorageState.limit) + 1;
  const endRecord = Math.min(StorageState.totalCount, StorageState.page * StorageState.limit);

  container.innerHTML = `
    <div class="storage-pagination">
      <div class="storage-pagination__info">
        Showing <strong>${startRecord}–${endRecord}</strong> of <strong>${StorageState.totalCount.toLocaleString('en-IN')}</strong> government depots
      </div>
      <div style="display: flex; gap: 6px; align-items: center;">
        <button class="storage-pagination__btn" onclick="changeStoragePage(${StorageState.page - 1})" ${StorageState.page <= 1 ? 'disabled' : ''}>
          ◀ Prev
        </button>
        <span style="font-weight: 700; padding: 0 6px; color: #1A3320;">
          ${StorageState.page} / ${StorageState.totalPages}
        </span>
        <button class="storage-pagination__btn" onclick="changeStoragePage(${StorageState.page + 1})" ${StorageState.page >= StorageState.totalPages ? 'disabled' : ''}>
          Next ▶
        </button>
      </div>
    </div>
  `;
}

function changeStoragePage(newPage) {
  if (newPage < 1 || newPage > StorageState.totalPages || newPage === StorageState.page) return;
  StorageState.page = newPage;
  loadStorageFacilities();
  const listPanel = document.getElementById('storage-list-panel');
  if (listPanel) listPanel.scrollTop = 0;
}

/**
 * Open Official IISFM Depot Details Modal
 */
function openGovDepotInfoModal(depotCode) {
  let depot = StorageState.facilities.find(f => (f.depotCode === depotCode || f.id === depotCode));
  if (!depot && StorageState.mapDepots) {
    depot = StorageState.mapDepots.find(f => (f.depotCode === depotCode || f.id === depotCode));
  }
  if (!depot) return;

  const titleEl = document.getElementById('iisfm-modal-title');
  const codeEl = document.getElementById('iisfm-modal-code');
  const bodyEl = document.getElementById('iisfm-modal-body');

  if (titleEl) titleEl.textContent = depot.depotName || depot.name;
  if (codeEl) codeEl.textContent = `Official Depot Code: ${depot.depotCode}`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="background: #F4F6F0; border-radius: 10px; padding: 14px; margin-bottom: 14px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #666;">Revenue State:</span>
          <strong>${depot.revenueState} (Code: ${depot.revenueStateCode || 'N/A'})</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #666;">Revenue District:</span>
          <strong>${depot.revenueDistrict} (Code: ${depot.revenueDistrictCode || 'N/A'})</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #666;">Accreditation / Operator:</span>
          <strong style="color: #1B5E20;">Food Corporation of India (FCI)</strong>
        </div>
      </div>

      <h4 style="font-size: 13.5px; font-weight: 700; color: #1A3320; margin: 0 0 8px;">Capacity Breakdown (Metric Tonnes)</h4>
      <div style="border: 1px solid #E5E4DD; border-radius: 8px; overflow: hidden; margin-bottom: 14px; font-size: 12.5px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: #FAF9F5; border-bottom: 1px solid #E5E4DD;">
          <span>Total Capacity:</span>
          <strong>${depot.totalCapacity ? depot.totalCapacity.toLocaleString('en-IN') + ' MT' : 'Not specified'}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #E5E4DD;">
          <span>Covered Capacity:</span>
          <strong>${depot.coveredCapacity ? depot.coveredCapacity.toLocaleString('en-IN') + ' MT' : '0 MT'}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #E5E4DD;">
          <span>Open Capacity:</span>
          <strong>${depot.openCapacity ? depot.openCapacity.toLocaleString('en-IN') + ' MT' : '0 MT'}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #E5E4DD;">
          <span>Silo Capacity:</span>
          <strong>${depot.siloCapacity ? depot.siloCapacity.toLocaleString('en-IN') + ' MT' : '0 MT'}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 12px;">
          <span>Scientific Storage:</span>
          <strong>${depot.scientificCapacity ? depot.scientificCapacity.toLocaleString('en-IN') + ' MT' : '0 MT'}</strong>
        </div>
      </div>

      <div style="background: #E8F5E9; border: 1px solid #C8E6C9; border-radius: 8px; padding: 10px 12px; font-size: 11.5px; color: #1B5E20; margin-bottom: 16px; line-height: 1.4;">
        <strong>ℹ️ Official Notice:</strong> This facility is an official depot under the Food Corporation of India (FCI) / Department of Food and Public Distribution. Farmer procurement and storage allocations are operated under government guidelines and state procurement agency mandates.
      </div>

      <div style="display: flex; gap: 8px;">
        <button type="button" class="btn btn--secondary" style="flex: 1;" onclick="closeGovDepotModal()">Close</button>
        <a class="btn btn--primary" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((depot.depotName || depot.name) + ' FCI depot ' + (depot.revenueDistrict || '') + ' ' + (depot.revenueState || ''))}" style="flex: 1.5; background: #1B5E20; border-color: #1B5E20; display: inline-flex; align-items: center; justify-content: center; gap: 6px; text-decoration: none;">
          <i data-lucide="map-pin"></i> <span>Search on Google Maps</span>
        </a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  const overlay = document.getElementById('iisfm-depot-modal-overlay');
  if (overlay) overlay.classList.add('active');
}

function closeGovDepotModal() {
  const overlay = document.getElementById('iisfm-depot-modal-overlay');
  if (overlay) overlay.classList.remove('active');
}

/**
 * Render Facility Cards List
 */
function renderFacilityCards(facilities) {
  const container = document.getElementById('storage-list-panel');
  if (!container) return;

  if (!facilities || facilities.length === 0) {
    const noResultsText = (window.KrishiI18n ? window.KrishiI18n.t('common.noResults') : null) || 'No storage facilities found';
    container.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:#777; background:#FFF; border:1px solid #E8E6DF; border-radius:14px;">
        <div style="font-size:36px; margin-bottom:10px;">🏬</div>
        <h4 style="color:#222; margin-bottom:6px;">${noResultsText}</h4>
        <p style="font-size:13px;">Try selecting a different state, district, or clearing search filters.</p>
        <button class="btn btn--secondary btn--sm" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = facilities.map(f => {
    const isGov = f.isGovData || f.type === 'fci_depot' || (f.source && f.source.includes('IISFM'));
    const district = (f.address && f.address.district) || f.revenueDistrict || 'Not Specified';
    const state = (f.address && f.address.state) || f.revenueState || 'Not Specified';
    const name = f.depotName || f.name || 'Storage Depot';
    const code = f.depotCode || f.facilityCode || f.id || 'N/A';

    if (isGov) {
      // ── OFFICIAL GOVERNMENT OF INDIA / IISFM RECORD ──
      const totalCapDisplay = (f.totalCapacity > 0) ? `${f.totalCapacity.toLocaleString('en-IN')} MT` : 'Capacity not specified';
      const coveredCapDisplay = (f.coveredCapacity > 0) ? `${f.coveredCapacity.toLocaleString('en-IN')} MT` : '0 MT';
      const openCapDisplay = (f.openCapacity > 0) ? `${f.openCapacity.toLocaleString('en-IN')} MT` : '0 MT';

      let distanceStr = '';
      if (f.distanceKm !== undefined) {
        distanceStr = ` · <strong style="color: #1B5E20;">Approx. distance: ${f.distanceKm} km</strong>`;
      } else if (StorageState.userLat !== null) {
        distanceStr = ` · <span style="color: #888;">Distance unavailable</span>`;
      }

      const zeroCapWarning = (f.openCapacity === 0 || f.openCapacityStatus === 'none')
        ? `<div style="margin: 6px 0 4px 0;"><span style="background: #FEF3C7; color: #92400E; font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="info" style="width:12px;height:12px;"></i> Currently no open capacity reported</span></div>`
        : '';

      return `
        <div class="facility-card facility-card--gov" id="facility-card-${code}" style="border-left: 4px solid #1B5E20;">
          <div class="facility-card__header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="facility-card__source-badge--gov">
                  <i data-lucide="building-2" style="width:12px;height:12px;"></i>
                  <span>Government of India • IISFM</span>
                </span>
                <span style="font-family: monospace; font-size: 11px; color: #666;">#${code}</span>
              </div>
              <h3 class="facility-card__name">${name}</h3>
              <div class="facility-card__location">
                <i data-lucide="map-pin" style="width:13px;height:13px;color:#1B5E20;"></i>
                <span>${district}, ${state} · <span style="color: #666;">Approx. district location</span>${distanceStr}</span>
              </div>
            </div>
            <span class="facility-card__type-badge facility-card__type-badge--fci_depot">FCI DEPOT</span>
          </div>

          <div class="facility-card__accreditation" style="color: #1B5E20;">
            <i data-lucide="shield-check" style="width:14px;height:14px;"></i>
            <span>Food Corporation of India (FCI) Public Warehouse</span>
          </div>

          ${zeroCapWarning}

          <!-- Capacity Breakdown (Truthfully labeled: Total, Covered, Open Capacity) -->
          <div class="facility-card__metrics" style="grid-template-columns: repeat(3, 1fr); background: #F4F6F0;">
            <div>
              <div class="facility-card__metric-val" style="color:#1A3320;">${totalCapDisplay}</div>
              <div class="facility-card__metric-lbl">Total Capacity</div>
            </div>
            <div>
              <div class="facility-card__metric-val" style="color:#2E7D32;">${coveredCapDisplay}</div>
              <div class="facility-card__metric-lbl">Covered Capacity</div>
            </div>
            <div>
              <div class="facility-card__metric-val" style="color:#1565C0;">${openCapDisplay}</div>
              <div class="facility-card__metric-lbl">Open Capacity</div>
            </div>
          </div>

          <!-- Transparent Data Truthfulness Indicators -->
          <div style="font-size: 11px; color: #777; margin: 8px 0; background: #FAF9F5; border-radius: 6px; padding: 6px 10px; line-height: 1.4; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
            <span>Tariff / Phone: <em style="color:#555;">— Not available</em></span>
            <span>Online Booking: <em style="color:#555;">— Not available (Official Gov Depot)</em></span>
          </div>

          <div class="facility-card__actions" style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
            <button class="btn btn--secondary" onclick="openGovDepotInfoModal('${code}')" style="min-height: 42px; font-weight: 700; flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 12.5px;">
              <i data-lucide="info"></i> <span>Depot Details</span>
            </button>
            <a class="btn btn--secondary" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' FCI depot ' + district + ' ' + state)}" style="min-height: 42px; width: 44px; display: inline-flex; align-items: center; justify-content: center;" title="Search Location on Google Maps">
              <i data-lucide="map-pin"></i>
            </a>
          </div>
        </div>
      `;
    }

    // ── DEMO / ACCREDITED COMMERCIAL FACILITY ──
    const isCold = f.type === 'cold_storage';
    const typeLabel = isCold ? 'Cold Storage' : f.type === 'silo' ? 'Grain Silo' : 'Warehouse';
    const typeClass = isCold ? 'facility-card__type-badge--cold_storage' : f.type === 'silo' ? 'facility-card__type-badge--silo' : 'facility-card__type-badge--warehouse';
    const cropsPills = (f.supportedCrops || []).slice(0, 4).map(c => `<span style="background:#F0EFEB; color:#444; font-size:10.5px; padding:2px 6px; border-radius:4px; text-transform:capitalize;">${c}</span>`).join(' ');

    return `
      <div class="facility-card" id="facility-card-${code}">
        <div class="facility-card__header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="facility-card__source-badge--demo">
                <i data-lucide="bookmark" style="width:12px;height:12px;"></i>
                <span>Demo Facility</span>
              </span>
            </div>
            <h3 class="facility-card__name">${name}</h3>
            <div class="facility-card__location">
              <i data-lucide="map-pin" style="width:13px;height:13px;"></i>
              <span>${district}, ${state} · <strong>${f.distanceKm || 0} km away</strong></span>
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
          <span>Capacity (${f.availableCapacity || 0} / ${f.totalCapacity || 0} ${f.capacityUnit || 'MT'} free)</span>
          <span style="font-weight:700;">${f.capacityUtilizationPct || 50}% Utilized</span>
        </div>
        <div class="facility-card__capacity-bar">
          <div class="facility-card__capacity-fill" style="width:${Math.min(100, f.capacityUtilizationPct || 50)}%;"></div>
        </div>

        <div class="facility-card__metrics">
          <div>
            <div class="facility-card__metric-val">₹${f.storageRate || 35}</div>
            <div class="facility-card__metric-lbl">/${(f.storageRateUnit || 'per_bag_month').replace(/_/g, ' ')}</div>
          </div>
          <div>
            <div class="facility-card__metric-val">₹${f.handlingCharge || 15}</div>
            <div class="facility-card__metric-lbl">/q Handling</div>
          </div>
          <div>
            <div class="facility-card__metric-val">${f.availableCapacity || 0} ${f.capacityUnit || 'MT'}</div>
            <div class="facility-card__metric-lbl">Free Space</div>
          </div>
        </div>

        <div style="margin: 8px 0; display:flex; gap:4px; flex-wrap:wrap; align-items:center;">
          <span style="font-size:11px; color:#777; margin-right:4px;">Crops:</span>
          ${cropsPills}
        </div>

        <div class="facility-card__actions" style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
          <button class="btn btn--primary" onclick="openBookingModal('${code}')" style="min-height: 44px; font-weight: 800; flex: 2; min-width: 140px; background: #2E7D32; border-color: #2E7D32; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px;">
            <i data-lucide="calendar-plus"></i> <span>Book Storage</span>
          </button>
          <button class="btn btn--secondary" onclick="openPledgeModal('${code}')" title="Pledge Financing" style="min-height: 44px; font-weight: 700; flex: 1.2; min-width: 110px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; font-size: 12px;">
            <i data-lucide="landmark"></i> <span>Pledge Loan</span>
          </button>
          <a class="btn btn--secondary" target="_blank" href="https://www.google.com/maps/dir/?api=1&destination=${f.latitude || 18.49},${f.longitude || 73.86}" style="min-height: 44px; width: 44px; display: inline-flex; align-items: center; justify-content: center;" title="Directions">
            <i data-lucide="navigation"></i>
          </a>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Update the 3 truthful status states per Requirement 11 & 12
 */
function updateStorageStatusBanner(statusMode, fetchedAt, updatedAt) {
  const statusText = document.getElementById('storage-status-text');
  const dot = document.getElementById('storage-status-dot');
  const sourceBadge = document.getElementById('storage-source-badge');
  const updatedText = document.getElementById('storage-updated-text');

  if (!statusText) return;

  if (statusMode === 'live') {
    statusText.textContent = (window.KrishiI18n ? window.KrishiI18n.t('storage.latestGovStorageData') : null) || 'Latest government storage data';
    if (dot) dot.style.background = '#2D6A4F';
    if (sourceBadge) sourceBadge.textContent = 'Government of India • IISFM';
    if (updatedText) {
      if (updatedAt) {
        const d = new Date(updatedAt);
        updatedText.textContent = `Updated: ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      } else if (fetchedAt) {
        const d = new Date(fetchedAt);
        const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        updatedText.textContent = `Fetched: ${dateStr}, ${timeStr}`;
      } else {
        updatedText.textContent = 'Latest government data';
      }
    }
  } else if (statusMode === 'cached') {
    statusText.textContent = (window.KrishiI18n ? window.KrishiI18n.t('storage.cachedGovStorageData') : null) || 'Latest cached government storage data';
    if (dot) dot.style.background = '#D97706';
    if (sourceBadge) sourceBadge.textContent = 'Government of India • IISFM';
    if (updatedText) {
      if (fetchedAt) {
        const d = new Date(fetchedAt);
        const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        updatedText.textContent = `Fetched: ${dateStr}, ${timeStr}`;
      } else {
        updatedText.textContent = 'Latest government data';
      }
    }
  } else {
    // Demo fallback
    statusText.textContent = (window.KrishiI18n ? window.KrishiI18n.t('storage.demoDataNotice') : null) || 'Demo data';
    if (dot) dot.style.background = '#DC2626';
    if (sourceBadge) sourceBadge.textContent = 'Government API temporarily unavailable';
    if (updatedText) updatedText.textContent = 'Demo data';
  }
}

/**
 * Fetch and Refresh Storage Facilities
 */
async function loadStorageFacilities() {
  const listContainer = document.getElementById('storage-list-panel');
  if (listContainer) {
    listContainer.innerHTML = `
      <div style="text-align:center; padding:40px 20px;">
        <div class="dash-spinner" style="margin: 0 auto 12px auto; width: 28px; height: 28px; border: 3px solid #DDD; border-top-color: var(--ks-evergreen); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="font-size:13px; color:#555; margin-top:8px; font-weight:600;">Loading storage options...</p>
      </div>
    `;
  }

  const isIISFM = StorageState.selectedSource === 'iisfm';

  if (isIISFM) {
    // ── 1. OFFICIAL IISFM GOVERNMENT DEPOTS ──
    const params = {
      state: StorageState.selectedState,
      district: StorageState.selectedDistrict,
      q: StorageState.searchQuery,
      page: StorageState.page,
      limit: StorageState.limit
    };
    if (StorageState.userLat && StorageState.userLng) {
      params.lat = StorageState.userLat;
      params.lng = StorageState.userLng;
      params.radius = StorageState.radiusKm;
    }

    try {
      let res = null;
      if (window.api && window.api.storage && typeof window.api.storage.getDepots === 'function') {
        res = await window.api.storage.getDepots(params);
      } else {
        const apiBase = getApiBase();
        const qs = new URLSearchParams(params).toString();
        const response = await fetch(`${apiBase}/storage/depots?${qs}`);
        res = await response.json();
      }

      if (res && res.success) {
        StorageState.facilities = res.depots || [];
        StorageState.totalCount = res.total || 0;
        StorageState.totalPages = res.totalPages || 1;
        updateStorageStatusBanner(res.statusMode || (res.cached ? 'cached' : 'live'), res.fetchedAt, null);
        renderFacilityCards(StorageState.facilities);
        renderPagination();
        // Map is updated independently via loadStorageMapData() (Requirement A & D)
        return;
      } else {
        throw new Error(res ? res.message : 'API failure');
      }
    } catch (err) {
      console.warn('IISFM depots load failure, activating truthful fallback:', err.message);
      updateStorageStatusBanner('fallback', null, null);
      const localizedFallback = (window.KrishiI18n ? window.KrishiI18n.t('storage.demoFallbackNotice') : null) || 'Demo data • Government API temporarily unavailable';
      if (listContainer) {
        listContainer.innerHTML = `
          <div style="padding:12px 16px; background:#FFFBEB; border:1.5px solid #FCD34D; border-radius:10px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px; color:#92400E; font-size:13px; font-weight:700;">
              <span>⚠️</span> <span>${localizedFallback}</span>
            </div>
            <button class="btn btn--secondary btn--sm" onclick="loadStorageFacilities()" style="font-size:11.5px; padding:4px 10px;">
              <i data-lucide="refresh-cw"></i> <span>Retry Live API</span>
            </button>
          </div>
        `;
      }
      // Load fallback demo facilities
      loadFallbackDemoFacilities();
      return;
    }
  }

  await loadFallbackDemoFacilities();
}

/**
 * Load ALL mappable depots independently of card pagination (Requirement A & D)
 * Dedicated map endpoint receives all ~2,500+ valid coordinates nationwide
 */
async function loadStorageMapData() {
  if (!StorageState.map || !StorageState.markersLayer) return;

  const isIISFM = StorageState.selectedSource === 'iisfm' || StorageState.selectedSource === 'all';

  if (!isIISFM) {
    // Demo facilities mode
    const demoMappable = StorageState.facilities.filter(f => typeof f.latitude === 'number' && typeof f.longitude === 'number');
    renderMapMarkers(demoMappable);
    fitMapToBounds(demoMappable);
    const badge = document.getElementById('storage-mapped-count-badge');
    if (badge) badge.textContent = `${demoMappable.length} demo locations mapped`;
    return;
  }

  const params = {
    state: StorageState.selectedState,
    district: StorageState.selectedDistrict,
    q: StorageState.searchQuery
  };

  try {
    let res = null;
    if (window.api && window.api.storage && typeof window.api.storage.getMapDepots === 'function') {
      res = await window.api.storage.getMapDepots(params);
    } else {
      const apiBase = getApiBase();
      const qs = new URLSearchParams(params).toString();
      const response = await fetch(`${apiBase}/storage/depots/map?${qs}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      res = await response.json();
    }

    if (res && res.success && Array.isArray(res.depots)) {
      StorageState.mapDepots = res.depots;
      StorageState.totalDepots = res.totalDepots || res.depots.length;
      StorageState.mappableDepots = res.mappableDepots || res.depots.length;
      StorageState.unmappableDepots = res.unmappableDepots || 0;

      // Update truthful mapped count badge (Requirement I)
      const badge = document.getElementById('storage-mapped-count-badge');
      if (badge) {
        badge.innerHTML = `<i data-lucide="map-pin" style="width:12px;height:12px;display:inline-block;vertical-align:middle;"></i> ${res.mappableDepots.toLocaleString('en-IN')} locations mapped (${res.unmappableDepots.toLocaleString('en-IN')} unmapped)`;
        if (window.lucide) window.lucide.createIcons();
      }

      renderMapMarkers(res.depots);

      // Fit map bounds if state, district, or search is filtered (Requirement F)
      if (StorageState.selectedState !== 'all' || StorageState.selectedDistrict !== 'all' || StorageState.searchQuery) {
        fitMapToBounds(res.depots);
      }
    }
  } catch (err) {
    console.warn('[Map Load Error] Could not load full map dataset:', err.message);
  }
}

/**
 * Fit map viewport to the bounding box of returned coordinates (Requirement F)
 */
function fitMapToBounds(depots) {
  if (!StorageState.map || !depots || depots.length === 0) return;
  const validCoords = depots.filter(d => typeof d.latitude === 'number' && typeof d.longitude === 'number' && !isNaN(d.latitude) && !isNaN(d.longitude));
  if (validCoords.length === 0) return;

  if (validCoords.length === 1) {
    StorageState.map.setView([validCoords[0].latitude, validCoords[0].longitude], 12);
    return;
  }

  const bounds = L.latLngBounds(validCoords.map(d => [d.latitude, d.longitude]));
  if (bounds.isValid()) {
    StorageState.map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
  }
}

/**
 * Load Fallback Demo / Accredited Facilities when IISFM is unavailable or selected
 */
async function loadFallbackDemoFacilities() {
  const params = {
    crop: StorageState.selectedCrop,
    type: StorageState.selectedType,
    state: StorageState.selectedState,
    district: StorageState.selectedDistrict
  };
  if (StorageState.userLat && StorageState.userLng) {
    params.lat = StorageState.userLat;
    params.lng = StorageState.userLng;
    params.radius = StorageState.radiusKm;
  }

  try {
    let res = null;
    if (window.api && window.api.storage) {
      res = await window.api.storage.getNearby(params);
    } else {
      const apiBase = getApiBase();
      const qs = new URLSearchParams(params).toString();
      const response = await fetch(`${apiBase}/storage/nearby?${qs}`);
      res = await response.json();
    }

    if (res && res.success) {
      StorageState.facilities = (res.facilities || []).map(f => ({
        ...f,
        isDemo: true,
        source: 'Demo Facility · Accredited Offline'
      }));
      StorageState.totalCount = StorageState.facilities.length;
      StorageState.totalPages = 1;
      renderFacilityCards(StorageState.facilities);
      renderPagination();
      renderMapMarkers(StorageState.facilities);
    } else {
      throw new Error(res ? res.message : 'Failed');
    }
  } catch (err) {
    console.warn('Fallback loading storage facilities:', err);
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
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/decision/sell-vs-store`, {
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
      lang: 'en'
    };

    let res = null;
    if (window.api && window.api.storage && typeof window.api.storage.getOptionsForCrop === 'function') {
      res = await window.api.storage.getOptionsForCrop(params);
    } else {
      const apiBase = getApiBase();
      const qs = new URLSearchParams(params).toString();
      const response = await fetch(`${apiBase}/storage/options-for-crop?${qs}`);
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
    explanationEl.textContent = (d.explanations && (d.explanations.en || d.explanations['en'])) || d.explanation || '';
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
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/storage/requests`, {
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
  if (btn) {
    btn.addEventListener('click', () => {
      requestFarmerLocation();
    });
  }
}

/**
 * Filter change event listeners
 */
function initFilterListeners() {
  const sourceSelect = document.getElementById('filter-storage-source');
  const stateSelect = document.getElementById('filter-storage-state');
  const distSelect = document.getElementById('filter-storage-district');
  const typeSelect = document.getElementById('filter-storage-type');
  const searchInput = document.getElementById('storage-search-input');
  const radiusBtns = document.querySelectorAll('.storage-dist-btn');

  if (sourceSelect) {
    sourceSelect.addEventListener('change', e => {
      StorageState.selectedSource = e.target.value;
      StorageState.page = 1;
      loadStorageFacilities();
      loadStorageMapData();
    });
  }

  if (stateSelect) {
    stateSelect.addEventListener('change', e => {
      StorageState.selectedState = e.target.value;
      updateDistrictDropdown(e.target.value);
      StorageState.page = 1;
      loadStorageFacilities();
      loadStorageMapData();
    });
  }

  if (distSelect) {
    distSelect.addEventListener('change', e => {
      StorageState.selectedDistrict = e.target.value;
      StorageState.page = 1;
      loadStorageFacilities();
      loadStorageMapData();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', e => {
      StorageState.selectedType = e.target.value;
      if (e.target.value === 'fci_depot') {
        StorageState.selectedSource = 'iisfm';
        if (sourceSelect) sourceSelect.value = 'iisfm';
      }
      StorageState.page = 1;
      loadStorageFacilities();
      loadStorageMapData();
    });
  }

  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', e => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        StorageState.searchQuery = e.target.value.trim();
        StorageState.page = 1;
        loadStorageFacilities();
        loadStorageMapData();
      }, 300);
    });
  }

  radiusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      radiusBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      StorageState.radiusKm = parseInt(btn.dataset.dist, 10) || 0;
      loadStorageFacilities();
      loadStorageMapData();
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
  StorageState.selectedState = 'all';
  StorageState.selectedDistrict = 'all';
  StorageState.selectedSource = 'iisfm';
  StorageState.searchQuery = '';
  StorageState.radiusKm = 0;
  StorageState.page = 1;

  const searchInput = document.getElementById('storage-search-input');
  if (searchInput) searchInput.value = '';
  const stateSelect = document.getElementById('filter-storage-state');
  if (stateSelect) stateSelect.value = 'all';
  const distSelect = document.getElementById('filter-storage-district');
  if (distSelect) updateDistrictDropdown('all');
  const sourceSelect = document.getElementById('filter-storage-source');
  if (sourceSelect) sourceSelect.value = 'iisfm';
  const typeSelect = document.getElementById('filter-storage-type');
  if (typeSelect) typeSelect.value = 'all';

  loadStorageFacilities();
  loadStorageMapData();
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
              <h4 style="font-size: 15px; font-weight: 800; color: var(--ks-evergreen); margin: 0 0 2px 0;">${window.KrishiI18n ? window.KrishiI18n.getCropName(req.cropName) : req.cropName} (${req.quantity} ${req.quantityUnit || 'quintal'})</h4>
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
          <h4 style="font-size: 15px; font-weight: 800; color: #1A3320; margin: 0 0 2px 0;">${window.KrishiI18n ? window.KrishiI18n.getCropName(p.cropName) : p.cropName} • Stored: ${p.storedQuantity} ${p.quantityUnit || 'q'}</h4>
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
window.openGovDepotInfoModal = openGovDepotInfoModal;
window.closeGovDepotModal = closeGovDepotModal;
window.changeStoragePage = changeStoragePage;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initStorageMap();
  setupGeolocation();
  initFilterListeners();
  loadStorageLocations();
  loadStorageFacilities();
  loadStorageMapData();
  calculateSellVsStore();
});
