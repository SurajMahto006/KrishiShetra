/**
 * KRISHISHETRA — GOVERNMENT OF INDIA / NIC IISFM STORAGE SERVICE
 * Primary Source: Government of India / NIC IISFM (Indian Information System for Foodgrain Management)
 * Endpoint: GET http://api.iisfm.nic.in/DepotsWithCap
 * 
 * Pipeline:
 * storage.html -> js/storage.js -> KrishiShetra Express backend -> IISFM API -> normalize -> cache -> frontend
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const IISFM_API_URL = 'http://api.iisfm.nic.in/DepotsWithCap';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes in-memory TTL
const DISK_CACHE_PATH = path.join(__dirname, '..', 'data', 'iisfm_cache.json');
const CENTROIDS_PATH = path.join(__dirname, '..', 'data', 'district_centroids.json');
const HTTP_TIMEOUT_MS = 10000; // 10-second timeout

let memoryCache = {
  data: null,
  fetchedAt: null,
  expiresAt: 0
};

// Load verified district and state centroid lookup
let geoLookup = { districts: {}, states: {} };
try {
  if (fs.existsSync(CENTROIDS_PATH)) {
    geoLookup = JSON.parse(fs.readFileSync(CENTROIDS_PATH, 'utf8'));
  }
} catch (geoErr) {
  console.warn('⚠️ Could not load district centroids lookup:', geoErr.message);
}

/**
 * Safe numeric parser for capacity values (MT)
 */
function parseCapacity(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed);
}

/**
 * Haversine formula for calculating distance in kilometers between two GPS coordinates
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Normalizes raw IISFM government record into KrishiShetra's internal model
 */
function normalizeDepotRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const depotCode = String(raw.Depot_Code || raw.depot_code || raw.depotCode || '').trim();
  const depotName = String(raw.Depot_Name || raw.depot_name || raw.depotName || '').trim();
  const revenueState = String(raw.RevenueStateName || raw.revenueState || raw.StateName || '').trim();
  const revenueStateCode = String(raw.RevenueStateCode || raw.revenueStateCode || '').trim();
  const revenueDistrict = String(raw.RevenueDistrict || raw.revenueDistrict || raw.DistrictName || '').trim();
  const revenueDistrictCode = String(raw.RevenueDistrictCode || raw.revenueDistrictCode || '').trim();

  const totalCapacity = parseCapacity(raw.TotCap || raw.totalCapacity || raw.TotalCapacity);
  const coveredCapacity = parseCapacity(raw.CapCovered || raw.coveredCapacity || raw.CoveredCapacity);
  const openCapacity = parseCapacity(raw.CapOpen || raw.openCapacity || raw.OpenCapacity);
  const siloCapacity = parseCapacity(raw.CapSilo || raw.siloCapacity);
  const scientificCapacity = parseCapacity(raw.CapScientific || raw.scientificCapacity);
  const nonScientificCapacity = parseCapacity(raw.CapNonScientific || raw.nonScientificCapacity);

  // Zero Capacity & Availability Status Handling (Truthful semantics per Requirement 3)
  let openCapacityStatus = 'none'; // 'available' | 'none' | 'unspecified'
  let capacityStatusLabel = 'Currently no open capacity reported';

  if (totalCapacity === 0 || totalCapacity === null) {
    openCapacityStatus = 'unspecified';
    capacityStatusLabel = 'Capacity not specified';
  } else if (openCapacity > 0) {
    openCapacityStatus = 'available';
    capacityStatusLabel = `${openCapacity.toLocaleString('en-IN')} MT Open`;
  } else {
    openCapacityStatus = 'none';
    capacityStatusLabel = 'Currently no open capacity reported';
  }

  // Coordinate mapping adhering strictly to source priority per Requirement C
  let latitude = null;
  let longitude = null;
  let coordinatesSource = null; // 'facility_exact' | 'verified_geocode' | 'district_centroid_approximate' | null
  let coordinatesLabel = 'Distance unavailable';

  const distKey = revenueDistrict.toUpperCase().trim();

  // 1 & 2. Existing verified facility or geocoded coordinates
  if (typeof raw.Latitude === 'number' && typeof raw.Longitude === 'number' && !isNaN(raw.Latitude) && !isNaN(raw.Longitude) && raw.Latitude !== 0 && raw.Longitude !== 0) {
    latitude = raw.Latitude;
    longitude = raw.Longitude;
    coordinatesSource = 'facility_exact';
    coordinatesLabel = 'Verified facility location';
  } else if (raw.coordinatesSource === 'facility_exact' || raw.coordinatesSource === 'verified_geocode') {
    latitude = raw.latitude;
    longitude = raw.longitude;
    coordinatesSource = raw.coordinatesSource;
    coordinatesLabel = raw.coordinatesSource === 'facility_exact' ? 'Verified facility location' : 'Verified geocoded location';
  } else if (geoLookup.districts && geoLookup.districts[distKey]) {
    // 4. District centroid ONLY as clearly marked approximate fallback
    latitude = geoLookup.districts[distKey].lat;
    longitude = geoLookup.districts[distKey].lng;
    coordinatesSource = 'district_centroid_approximate';
    coordinatesLabel = 'Approximate district location';
  } else {
    // 5. No coordinate -> do not create a map marker (null)
    latitude = null;
    longitude = null;
    coordinatesSource = null;
    coordinatesLabel = 'Distance unavailable';
  }

  return {
    id: depotCode || `IISFM-${Math.random().toString(36).substring(2, 9)}`,
    depotCode: depotCode || 'N/A',
    facilityCode: depotCode || 'N/A',
    name: depotName || 'FCI Government Depot',
    depotName: depotName || 'FCI Government Depot',
    totalCapacity,
    coveredCapacity,
    openCapacity,
    siloCapacity,
    scientificCapacity,
    nonScientificCapacity,
    capacityUnit: 'MT',
    openCapacityStatus,
    capacityStatusLabel,
    revenueState: revenueState || 'Not Specified',
    revenueStateCode,
    revenueDistrict: revenueDistrict || 'Not Specified',
    revenueDistrictCode,
    address: {
      district: revenueDistrict || 'Not Specified',
      state: revenueState || 'Not Specified'
    },
    type: 'fci_depot',
    accreditationType: 'Food Corporation of India (FCI) • IISFM',
    source: 'Government of India • IISFM',
    dataSource: 'Government of India • IISFM',
    isGovData: true,
    // Fields that IISFM does not provide are truthfully marked unavailable:
    storageRate: null,
    storageRateUnit: null,
    handlingCharge: null,
    bookingEnabled: false,
    pledgeFinancingEligible: false,
    contactDetails: {
      phone: null,
      managerName: null
    },
    latitude,
    longitude,
    coordinatesSource,
    coordinatesLabel,
    updatedAt: raw.Updated_Date || raw.updatedAt || null
  };
}

/**
 * Load persistent disk cache if present
 */
function loadDiskCache() {
  try {
    if (fs.existsSync(DISK_CACHE_PATH)) {
      const raw = fs.readFileSync(DISK_CACHE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.depots) && parsed.depots.length > 0) {
        return {
          source: 'Government of India • IISFM (Cached)',
          fetchedAt: parsed.fetchedAt || new Date().toISOString(),
          depots: parsed.depots.map(normalizeDepotRecord).filter(Boolean)
        };
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not load IISFM disk cache:', err.message);
  }
  return null;
}

/**
 * Save persistent cache to disk asynchronously
 */
function saveDiskCache(depots, fetchedAt) {
  try {
    const dir = path.dirname(DISK_CACHE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const payload = {
      source: 'Government of India • IISFM',
      endpoint: IISFM_API_URL,
      fetchedAt,
      depots
    };
    fs.writeFile(DISK_CACHE_PATH, JSON.stringify(payload), 'utf8', err => {
      if (err) console.warn('⚠️ Failed to save IISFM disk cache:', err.message);
    });
  } catch (err) {
    console.warn('⚠️ Failed to write IISFM disk cache directory:', err.message);
  }
}

/**
 * Raw HTTP GET request with timeout and safe buffer collection
 */
function httpGetJson(url, timeoutMs = HTTP_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    let timer = null;
    const req = http.get(url, res => {
      clearTimeout(timer);
      if (res.statusCode !== 200) {
        res.resume(); // consume response data to free memory
        return reject(new Error(`IISFM API returned HTTP status ${res.statusCode}`));
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (parseErr) {
          reject(new Error(`Malformed JSON received from IISFM: ${parseErr.message}`));
        }
      });
    });

    req.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });

    timer = setTimeout(() => {
      req.destroy();
      reject(new Error(`IISFM API request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
}

/**
 * Format current date dynamically as YYYYMMDD for official IISFM /Utilization endpoint
 * Uses backend current date, never fabricated or hardcoded.
 */
function getCurrentFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

let utilizationCache = {
  data: null,
  dateStr: null,
  fetchedAt: null,
  expiresAt: 0
};

/**
 * Fetch latest IISFM live capacity utilization for today's date
 * GET http://api.iisfm.nic.in/Utilization/{YYYYMMDD}
 */
async function fetchTodayUtilization() {
  const now = Date.now();
  const todayStr = getCurrentFormattedDate();

  if (utilizationCache.data && utilizationCache.dateStr === todayStr && utilizationCache.expiresAt > now) {
    return utilizationCache.data;
  }

  try {
    const url = `http://api.iisfm.nic.in/Utilization/${todayStr}`;
    const raw = await httpGetJson(url, 6000);
    if (raw && typeof raw === 'object') {
      const parsed = {
        date: todayStr,
        totCap: parseCapacity(raw.TotCap),
        capCovered: parseCapacity(raw.CapCovered),
        capOpen: parseCapacity(raw.CapOpen),
        stockCovered: parseCapacity(raw.StockCovered),
        stockOpen: parseCapacity(raw.StockOpen),
        utilizationPct: typeof raw.PerUtilTot === 'number' ? Math.round(raw.PerUtilTot * 10) / 10 : null,
        statesCount: Array.isArray(raw.RSList) ? raw.RSList.length : 0
      };
      utilizationCache = {
        data: parsed,
        dateStr: todayStr,
        fetchedAt: new Date().toISOString(),
        expiresAt: now + CACHE_TTL_MS
      };
      return parsed;
    }
  } catch (utilErr) {
    console.warn(`[IISFM Service Notice] Live utilization endpoint http://api.iisfm.nic.in/Utilization/${todayStr} unavailable:`, utilErr.message);
  }
  return utilizationCache.data || null;
}

/**
 * Fetch all IISFM depots with in-memory & disk caching
 */
async function fetchAllDepots(forceRefresh = false) {
  const now = Date.now();

  // 1. Return valid in-memory cache
  if (!forceRefresh && memoryCache.data && memoryCache.expiresAt > now) {
    const liveUtil = await fetchTodayUtilization();
    return {
      depots: memoryCache.data,
      source: 'Government of India • IISFM',
      cached: true,
      statusMode: 'cached',
      liveUtilization: liveUtil,
      fetchedAt: memoryCache.fetchedAt
    };
  }

  // 2. Attempt live network fetch
  try {
    const rawData = await httpGetJson(IISFM_API_URL);
    if (!Array.isArray(rawData)) {
      throw new Error('Unexpected response format from IISFM (expected array)');
    }

    const normalized = rawData.map(normalizeDepotRecord).filter(Boolean);
    const fetchedAt = new Date().toISOString();
    const liveUtil = await fetchTodayUtilization();

    memoryCache = {
      data: normalized,
      fetchedAt,
      expiresAt: now + CACHE_TTL_MS
    };

    saveDiskCache(normalized, fetchedAt);

    return {
      depots: normalized,
      source: 'Government of India • IISFM',
      cached: false,
      statusMode: 'live',
      liveUtilization: liveUtil,
      fetchedAt
    };
  } catch (liveErr) {
    console.warn(`[IISFM Service Warning] Live API failed: ${liveErr.message}`);

    // Fallback A: in-memory cache even if expired
    if (memoryCache.data && memoryCache.data.length > 0) {
      return {
        depots: memoryCache.data,
        source: 'Government of India • IISFM',
        cached: true,
        stale: true,
        statusMode: 'cached',
        liveUtilization: utilizationCache.data || null,
        fetchedAt: memoryCache.fetchedAt
      };
    }

    // Fallback B: persistent disk cache
    const disk = loadDiskCache();
    if (disk && disk.depots && disk.depots.length > 0) {
      memoryCache = {
        data: disk.depots,
        fetchedAt: disk.fetchedAt,
        expiresAt: now + CACHE_TTL_MS
      };
      return {
        depots: disk.depots,
        source: 'Government of India • IISFM',
        cached: true,
        stale: true,
        statusMode: 'cached',
        liveUtilization: utilizationCache.data || null,
        fetchedAt: disk.fetchedAt
      };
    }

    // Fallback C: Propagate error without fabricating data
    throw liveErr;
  }
}

/**
 * Query & Filter IISFM depots
 * Supports: state, district, keyword search, min capacity, pagination
 */
async function queryDepots({
  state = '',
  district = '',
  q = '',
  minCap = 0,
  page = 1,
  limit = 20,
  lat = null,
  lng = null,
  radius = 0
} = {}) {
  const result = await fetchAllDepots();
  let list = result.depots || [];

  const stateQuery = (state || '').trim().toLowerCase();
  const districtQuery = (district || '').trim().toLowerCase();
  const searchQuery = (q || '').trim().toLowerCase();
  const minCapacity = parseFloat(minCap) || 0;
  const userLat = lat !== null && lat !== undefined && lat !== '' ? parseFloat(lat) : null;
  const userLng = lng !== null && lng !== undefined && lng !== '' ? parseFloat(lng) : null;
  const filterRadius = parseFloat(radius) || 0;

  if (stateQuery && stateQuery !== 'all') {
    list = list.filter(d => d.revenueState.toLowerCase().includes(stateQuery));
  }

  if (districtQuery && districtQuery !== 'all') {
    list = list.filter(d => d.revenueDistrict.toLowerCase().includes(districtQuery));
  }

  if (searchQuery) {
    list = list.filter(d =>
      d.depotName.toLowerCase().includes(searchQuery) ||
      d.depotCode.toLowerCase().includes(searchQuery) ||
      d.revenueDistrict.toLowerCase().includes(searchQuery) ||
      d.revenueState.toLowerCase().includes(searchQuery)
    );
  }

  if (minCapacity > 0) {
    list = list.filter(d => d.totalCapacity >= minCapacity);
  }

  // Calculate distance if farmer latitude and longitude are provided
  if (userLat !== null && !isNaN(userLat) && userLng !== null && !isNaN(userLng)) {
    list = list.map(d => {
      if (typeof d.latitude === 'number' && typeof d.longitude === 'number' && !isNaN(d.latitude) && !isNaN(d.longitude)) {
        const dist = calculateDistance(userLat, userLng, d.latitude, d.longitude);
        const distanceKm = Math.round(dist * 10) / 10;
        return {
          ...d,
          distanceKm,
          distanceLabel: `Approx. distance: ${distanceKm} km`
        };
      }
      return {
        ...d,
        distanceKm: undefined,
        distanceLabel: 'Distance unavailable'
      };
    });

    // Optional radius filter
    if (filterRadius > 0) {
      list = list.filter(d => d.distanceKm !== undefined && d.distanceKm <= filterRadius);
    }

    // Sort: items with distance sorted ascending, then remaining items by total capacity
    list.sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== undefined) return -1;
      if (b.distanceKm !== undefined) return 1;
      return (b.totalCapacity || 0) - (a.totalCapacity || 0);
    });
  }

  const total = list.length;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const totalPages = Math.ceil(total / pageSize) || 1;
  const offset = (pageNum - 1) * pageSize;
  const paginated = list.slice(offset, offset + pageSize);

  return {
    success: true,
    statusMode: result.statusMode || (result.stale || result.cached ? 'cached' : 'live'),
    source: result.source,
    cached: !!result.cached,
    stale: !!result.stale,
    fetchedAt: result.fetchedAt,
    liveUtilization: result.liveUtilization || null,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages,
    depots: paginated
  };
}

/**
 * Extract unique States and Districts for filtering UI
 */
async function getStatesAndDistricts() {
  const result = await fetchAllDepots();
  const depots = result.depots || [];

  const stateDistrictMap = {};

  for (const d of depots) {
    const s = (d.revenueState || '').trim();
    const dist = (d.revenueDistrict || '').trim();
    if (!s) continue;

    if (!stateDistrictMap[s]) {
      stateDistrictMap[s] = new Set();
    }
    if (dist) {
      stateDistrictMap[s].add(dist);
    }
  }

  const states = Object.keys(stateDistrictMap).sort().map(stateName => ({
    name: stateName,
    districts: Array.from(stateDistrictMap[stateName]).sort()
  }));

  return {
    success: true,
    source: result.source,
    count: states.length,
    states
  };
}

/**
 * Retrieve ALL mappable IISFM depots for Leaflet Map (independent of card pagination)
 * Returns all records with valid coordinates, deduplicated by depotCode, with statistics.
 */
async function getMappableDepots({
  state = '',
  district = '',
  q = ''
} = {}) {
  const result = await fetchAllDepots();
  const allDepots = result.depots || [];

  // Deduplicate by depotCode
  const seenCodes = new Set();
  const deduped = [];
  for (const d of allDepots) {
    const code = d.depotCode || d.facilityCode || d.id;
    if (code && !seenCodes.has(code)) {
      seenCodes.add(code);
      deduped.push(d);
    }
  }

  const totalDepots = deduped.length;

  // Filter mappable depots (must have valid numeric latitude & longitude and valid source)
  const mappableAll = deduped.filter(d =>
    typeof d.latitude === 'number' &&
    typeof d.longitude === 'number' &&
    !isNaN(d.latitude) &&
    !isNaN(d.longitude) &&
    d.coordinatesSource !== null
  );

  const mappableDepotsCount = mappableAll.length;
  const unmappableDepotsCount = totalDepots - mappableDepotsCount;

  // Apply filters if provided
  let filtered = mappableAll;
  const stateQuery = (state || '').trim().toLowerCase();
  const districtQuery = (district || '').trim().toLowerCase();
  const searchQuery = (q || '').trim().toLowerCase();

  if (stateQuery && stateQuery !== 'all') {
    filtered = filtered.filter(d => d.revenueState.toLowerCase().includes(stateQuery));
  }

  if (districtQuery && districtQuery !== 'all') {
    filtered = filtered.filter(d => d.revenueDistrict.toLowerCase().includes(districtQuery));
  }

  if (searchQuery) {
    filtered = filtered.filter(d =>
      d.depotName.toLowerCase().includes(searchQuery) ||
      d.depotCode.toLowerCase().includes(searchQuery) ||
      d.revenueDistrict.toLowerCase().includes(searchQuery) ||
      d.revenueState.toLowerCase().includes(searchQuery)
    );
  }

  // Lightweight map payload (essential metadata for high performance across 2,500+ markers)
  const mapMarkers = filtered.map(d => ({
    id: d.id,
    depotCode: d.depotCode,
    name: d.depotName || d.name,
    depotName: d.depotName || d.name,
    revenueDistrict: d.revenueDistrict,
    revenueState: d.revenueState,
    latitude: d.latitude,
    longitude: d.longitude,
    coordinatesSource: d.coordinatesSource,
    coordinatesLabel: d.coordinatesSource === 'facility_exact'
      ? 'Verified facility location'
      : (d.coordinatesSource === 'verified_geocode' ? 'Verified geocoded location' : 'Approximate district location'),
    totalCapacity: d.totalCapacity,
    coveredCapacity: d.coveredCapacity,
    openCapacity: d.openCapacity,
    capacityStatusLabel: d.capacityStatusLabel,
    source: 'Government of India • IISFM',
    type: 'fci_depot',
    isGovData: true
  }));

  return {
    success: true,
    source: 'Government of India • IISFM',
    statusMode: result.statusMode || (result.cached ? 'cached' : 'live'),
    totalDepots,
    mappableDepots: mappableDepotsCount,
    unmappableDepots: unmappableDepotsCount,
    filteredCount: mapMarkers.length,
    depots: mapMarkers
  };
}

module.exports = {
  fetchAllDepots,
  queryDepots,
  getMappableDepots,
  getStatesAndDistricts,
  normalizeDepotRecord
};
