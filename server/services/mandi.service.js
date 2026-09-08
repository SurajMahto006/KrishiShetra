/**
 * KRISHISHETRA — GOVERNMENT MANDI PRICE SERVICE
 * Official Government of India Open Government Data Platform (data.gov.in) Integration
 * Dataset: "Current Daily Price of Various Commodities from Various Markets (Mandi)"
 * Official Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
 * 
 * Pipeline Architecture:
 * Frontend -> KrishiShetra backend -> data.gov.in -> normalize -> persistent & memory cache -> frontend
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Official dataset resource ID on data.gov.in
const DEFAULT_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = 'https://api.data.gov.in/resource';

// Cache configuration
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes in-memory TTL
const memoryCache = new Map();
const DISK_CACHE_PATH = path.join(__dirname, '..', 'data', 'mandi_cache.json');

// In-memory reference to last known successful government data
let lastKnownGoodGovData = null;

// Commodity name normalizer for Agmarknet / data.gov.in standards
const COMMODITY_MAP = {
  rice: 'Rice',
  paddy: 'Paddy(Dhan)(Common)',
  wheat: 'Wheat',
  onion: 'Onion',
  tomato: 'Tomato',
  potato: 'Potato',
  maize: 'Maize',
  soybean: 'Soyabean',
  chilli: 'Chilli Green',
  groundnut: 'Groundnut',
  cotton: 'Cotton',
  sugarcane: 'Sugarcane',
  mango: 'Mango',
  banana: 'Banana',
  grapes: 'Grapes',
  pulses: 'Gram Raw(Chhana)'
};

// State name normalizer
const STATE_MAP = {
  maharashtra: 'Maharashtra',
  mp: 'Madhya Pradesh',
  'madhya pradesh': 'Madhya Pradesh',
  gujarat: 'Gujarat',
  rajasthan: 'Rajasthan',
  karnataka: 'Karnataka',
  telangana: 'Telangana',
  up: 'Uttar Pradesh',
  'uttar pradesh': 'Uttar Pradesh',
  andhra: 'Andhra Pradesh',
  'andhra pradesh': 'Andhra Pradesh',
  punjab: 'Punjab',
  haryana: 'Haryana',
  bihar: 'Bihar',
  'tamil nadu': 'Tamil Nadu',
  'west bengal': 'West Bengal'
};

// Aliases for flexible, case-insensitive, typo-tolerant matching
const COMMODITY_ALIASES = {
  rice: ['rice', 'paddy', 'dhan', 'paddy(dhan)(common)', 'basmati', 'kolam', 'sona masuri'],
  wheat: ['wheat', 'gehun', 'gehu', 'sharbati', 'lokwan', 'kalyan sona'],
  onion: ['onion', 'pyaz', 'kanda', 'red onion'],
  tomato: ['tomato', 'tamatar'],
  potato: ['potato', 'aloo', 'batata', 'jyoti', 'kufri'],
  maize: ['maize', 'corn', 'makka', 'makai'],
  soybean: ['soybean', 'soyabean', 'soya', 'yellow soybean'],
  chilli: ['chilli', 'chilli green', 'green chilli', 'mirchi', 'chilli red', 'byadagi', 'g4', 'teja'],
  groundnut: ['groundnut', 'peanut', 'moongphali', 'shengdana'],
  cotton: ['cotton', 'kapas', 'shankar-6'],
  sugarcane: ['sugarcane', 'ganna', 'us'],
  mango: ['mango', 'aam', 'alphonso', 'dasheri', 'kesar'],
  banana: ['banana', 'kela', 'robusta', 'yelakki'],
  grapes: ['grapes', 'angoor', 'thompson', 'tas-a-ganesh'],
  pulses: ['gram', 'chhana', 'chana', 'tur', 'arhar', 'urad', 'moong', 'pulses', 'dal']
};

const STATE_ALIASES = {
  maharashtra: ['maharashtra', 'mh'],
  'madhya pradesh': ['madhya pradesh', 'mp'],
  mp: ['madhya pradesh', 'mp'],
  gujarat: ['gujarat', 'gj'],
  rajasthan: ['rajasthan', 'rj'],
  karnataka: ['karnataka', 'ka'],
  telangana: ['telangana', 'ts', 'tg'],
  'uttar pradesh': ['uttar pradesh', 'up'],
  up: ['uttar pradesh', 'up'],
  'andhra pradesh': ['andhra pradesh', 'ap'],
  andhra: ['andhra pradesh', 'ap'],
  punjab: ['punjab', 'pb'],
  haryana: ['haryana', 'hr'],
  bihar: ['bihar', 'br'],
  'tamil nadu': ['tamil nadu', 'tn'],
  'west bengal': ['west bengal', 'wb']
};

/**
 * Normalizes input commodity term
 */
function normalizeCommodity(commodity) {
  if (!commodity || commodity === 'all') return null;
  const key = commodity.toLowerCase().trim();
  return COMMODITY_MAP[key] || (key.charAt(0).toUpperCase() + key.slice(1));
}

/**
 * Normalizes input state term
 */
function normalizeState(state) {
  if (!state || state === 'all') return null;
  const key = state.toLowerCase().trim();
  return STATE_MAP[key] || (key.charAt(0).toUpperCase() + key.slice(1));
}

/**
 * Safely parse a numeric price
 */
function parseNumericPrice(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Normalize raw government records (handles all case variations)
 */
function normalizeGovRecord(rec) {
  if (!rec || typeof rec !== 'object') return null;

  const commodity = rec.commodity || rec.Commodity || rec.COMMODITY || '';
  const state = rec.state || rec.State || rec.STATE || '';
  const district = rec.district || rec.District || rec.DISTRICT || '';
  const market = rec.market || rec.Market || rec.MARKET || '';
  const variety = rec.variety || rec.Variety || rec.VARIETY || 'Standard';
  const grade = rec.grade || rec.Grade || rec.GRADE || 'FAQ';
  const arrivalDate = rec.arrival_date || rec.Arrival_Date || rec.ARRIVAL_DATE || rec.arrivalDate || '';

  const minP = parseNumericPrice(rec.min_price || rec.Min_Price || rec.MIN_PRICE || rec.minPrice);
  const maxP = parseNumericPrice(rec.max_price || rec.Max_Price || rec.MAX_PRICE || rec.maxPrice);
  let modalP = parseNumericPrice(rec.modal_price || rec.Modal_Price || rec.MODAL_PRICE || rec.modalPrice);

  // If modal price is missing but range exists, derive safely
  if (modalP <= 0) {
    if (minP > 0 && maxP > 0) modalP = Math.round((minP + maxP) / 2);
    else if (minP > 0) modalP = minP;
    else if (maxP > 0) modalP = maxP;
  }

  const rawVol = rec.arrival_volume || rec.Arrival_Volume || rec.ARRIVAL_VOLUME || rec.arrivalVolume;
  const arrivalVolume = rawVol !== undefined && rawVol !== null && rawVol !== '' ? parseNumericPrice(rawVol) : null;

  return {
    commodity: String(commodity).trim(),
    state: String(state).trim(),
    district: String(district).trim(),
    market: String(market).trim(),
    variety: String(variety).trim(),
    grade: String(grade).trim(),
    minPrice: minP,
    maxPrice: maxP,
    modalPrice: modalP,
    arrivalDate: String(arrivalDate).trim(),
    arrivalVolume,
    isGovData: true
  };
}

/**
 * Load persistent disk cache if available
 */
function loadDiskCache() {
  try {
    if (fs.existsSync(DISK_CACHE_PATH)) {
      const raw = fs.readFileSync(DISK_CACHE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.records) && parsed.records.length > 0) {
        const normalized = parsed.records.map(normalizeGovRecord).filter(Boolean);
        return {
          source: parsed.source || 'data.gov.in',
          fetchedAt: parsed.fetchedAt || new Date().toISOString(),
          records: normalized
        };
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not load mandi disk cache:', err.message);
  }
  return null;
}

/**
 * Save persistent cache to disk asynchronously (merges records across commodities & mandis)
 */
function saveDiskCache(records, fetchedAt) {
  try {
    const dir = path.dirname(DISK_CACHE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let existingRecords = [];
    if (fs.existsSync(DISK_CACHE_PATH)) {
      try {
        const raw = fs.readFileSync(DISK_CACHE_PATH, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.records)) {
          existingRecords = parsed.records.map(normalizeGovRecord).filter(Boolean);
        }
      } catch (_) {}
    }

    const recordMap = new Map();
    for (const r of existingRecords) {
      const key = `${(r.state || '').toLowerCase()}_${(r.district || '').toLowerCase()}_${(r.market || '').toLowerCase()}_${(r.commodity || '').toLowerCase()}_${(r.variety || '').toLowerCase()}`;
      recordMap.set(key, r);
    }
    for (const r of records) {
      const key = `${(r.state || '').toLowerCase()}_${(r.district || '').toLowerCase()}_${(r.market || '').toLowerCase()}_${(r.commodity || '').toLowerCase()}_${(r.variety || '').toLowerCase()}`;
      recordMap.set(key, r);
    }

    const merged = Array.from(recordMap.values());
    const payload = {
      source: 'data.gov.in',
      resourceId: DEFAULT_RESOURCE_ID,
      title: 'Current Daily Price of Various Commodities from Various Markets (Mandi)',
      fetchedAt,
      records: merged
    };

    fs.writeFile(DISK_CACHE_PATH, JSON.stringify(payload, null, 2), 'utf8', (err) => {
      if (err) console.warn('⚠️ Failed to save mandi disk cache:', err.message);
    });

    return merged;
  } catch (err) {
    console.warn('⚠️ Failed to write mandi disk cache:', err.message);
    return records;
  }
}

/**
 * Safe filter matcher across commodity, state, district, and market
 * Guarantees case-insensitivity, whitespace tolerance, and Vashi / Navi Mumbai aliases
 */
function matchesQueryFilter(rec, { commodity, state, district, market }) {
  // 1. Commodity filter
  if (commodity && commodity !== 'all') {
    const reqComm = commodity.toLowerCase().trim();
    const recComm = rec.commodity.toLowerCase().trim();

    const aliases = COMMODITY_ALIASES[reqComm] || [reqComm];
    const commMatched = recComm === reqComm ||
      recComm.includes(reqComm) ||
      reqComm.includes(recComm) ||
      aliases.some(a => recComm.includes(a) || a.includes(recComm));

    if (!commMatched) return false;
  }

  // 2. State filter
  if (state && state !== 'all') {
    const reqState = state.toLowerCase().trim();
    const recState = rec.state.toLowerCase().trim();

    const aliases = STATE_ALIASES[reqState] || [reqState];
    const stateMatched = recState === reqState ||
      recState.includes(reqState) ||
      reqState.includes(recState) ||
      aliases.some(s => recState.includes(s) || s.includes(recState));

    if (!stateMatched) return false;
  }

  // 3. Market filter (Handles Vashi / Navi Mumbai / Mumbai APMC naming)
  if (market && market !== 'all') {
    const reqMarket = market.toLowerCase().trim();
    const recMarket = rec.market.toLowerCase().trim();
    const recDistrict = rec.district.toLowerCase().trim();

    const isVashiQuery = reqMarket.includes('vashi') || reqMarket.includes('navi mumbai');
    if (isVashiQuery) {
      const isVashiRecord = recMarket.includes('vashi') ||
        recMarket.includes('mumbai') ||
        recDistrict.includes('navi mumbai') ||
        recDistrict.includes('mumbai');
      if (!isVashiRecord) return false;
    } else {
      const marketMatched = recMarket.includes(reqMarket) ||
        reqMarket.includes(recMarket) ||
        recDistrict.includes(reqMarket);
      if (!marketMatched) return false;
    }
  }

  // 4. District filter
  if (district && district !== 'all') {
    const reqDist = district.toLowerCase().trim();
    const recDist = rec.district.toLowerCase().trim();
    const recMarket = rec.market.toLowerCase().trim();

    const isNaviMumbai = reqDist.includes('navi mumbai') || reqDist.includes('vashi');
    if (isNaviMumbai) {
      const isNaviRecord = recDist.includes('navi mumbai') ||
        recDist.includes('mumbai') ||
        recMarket.includes('vashi') ||
        recMarket.includes('mumbai');
      if (!isNaviRecord) return false;
    } else {
      const distMatched = recDist.includes(reqDist) ||
        reqDist.includes(recDist) ||
        recMarket.includes(reqDist);
      if (!distMatched) return false;
    }
  }

  return true;
}

/**
 * Execute HTTPS request to data.gov.in with explicit timeout and status categorization
 */
function fetchGovDataWithTimeout(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        const timeoutErr = new Error('TIMEOUT: Connection to data.gov.in timed out');
        timeoutErr.code = 'ETIMEDOUT';
        reject(timeoutErr);
      }
    }, timeoutMs);

    const req = https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);

        const status = res.statusCode;

        // Categorize HTTP status failures
        if (status === 401 || status === 403) {
          const err = new Error(`HTTP ${status}: Invalid or unauthorized data.gov.in API key`);
          err.statusCode = status;
          return reject(err);
        }
        if (status === 429) {
          const err = new Error(`HTTP 429: data.gov.in API rate limit exceeded`);
          err.statusCode = 429;
          return reject(err);
        }
        if (status === 404) {
          const err = new Error(`HTTP 404: data.gov.in resource not found`);
          err.statusCode = 404;
          return reject(err);
        }
        if (status >= 500) {
          const err = new Error(`HTTP ${status}: data.gov.in upstream server error`);
          err.statusCode = status;
          return reject(err);
        }
        if (status !== 200) {
          const err = new Error(`HTTP ${status}: Unexpected status from data.gov.in`);
          err.statusCode = status;
          return reject(err);
        }

        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (parseErr) {
          const err = new Error(`MALFORMED_JSON: Failed to parse data.gov.in JSON response (${parseErr.message})`);
          err.statusCode = 200;
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      const networkErr = new Error(`NETWORK_ERROR: ${err.message}`);
      networkErr.code = err.code || 'NETWORK_FAILURE';
      reject(networkErr);
    });
  });
}

/**
 * Get Government of India Mandi Prices
 * Production Priority: 1. data.gov.in live -> 2. last successful cache -> 3. clean unavailable state
 */
async function getGovernmentMandiPrices(params = {}) {
  const apiKey = (process.env.DATA_GOV_API_KEY || process.env.DATAGOV_API_KEY || process.env.GOV_MANDI_API_KEY || '').trim();
  const resourceId = (process.env.DATA_GOV_RESOURCE_ID || DEFAULT_RESOURCE_ID).trim();

  const rawCommodity = params.commodity || params.crop || '';
  const rawState = params.state || params.location || '';
  const rawDistrict = params.district || '';
  const rawMarket = params.market || '';
  const limit = Math.min(Math.max(parseInt(params.limit, 10) || 50, 1), 250);

  const commodity = normalizeCommodity(rawCommodity);
  const state = normalizeState(rawState);

  const cacheKey = `${commodity || 'all'}_${state || 'all'}_${rawDistrict || 'all'}_${rawMarket || 'all'}_${limit}`;
  const now = Date.now();

  // Check In-Memory Cache (Live TTL)
  const memoryHit = memoryCache.get(cacheKey);
  if (memoryHit && (now - memoryHit.timestamp < CACHE_TTL_MS)) {
    return {
      success: true,
      source: 'data.gov.in',
      sourceStatus: 'live',
      fetchedAt: memoryHit.fetchedAt,
      updatedAt: memoryHit.fetchedAt,
      cached: false,
      stale: false,
      count: memoryHit.data.length,
      data: memoryHit.data
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP A: ATTEMPT LIVE RETRIEVAL FROM DATA.GOV.IN IF API KEY IS CONFIGURED
  // ─────────────────────────────────────────────────────────────────────────
  if (apiKey) {
    try {
      const queryParams = new URLSearchParams({
        'api-key': apiKey,
        format: 'json',
        offset: '0',
        limit: '250' // Fetch broad records and filter accurately on normalized attributes
      });

      if (commodity) {
        queryParams.append('filters[commodity]', commodity);
      }
      if (state) {
        queryParams.append('filters[state]', state);
      }

      const targetUrl = `${BASE_URL}/${resourceId}?${queryParams.toString()}`;
      const response = await fetchGovDataWithTimeout(targetUrl, 8000);

      if (response && Array.isArray(response.records) && response.records.length > 0) {
        const normalizedAll = response.records.map(normalizeGovRecord).filter(Boolean);
        const fetchedAt = response.updated_date || new Date().toISOString();

        const mergedRecords = saveDiskCache(normalizedAll, fetchedAt);

        // Update persistent memory and disk cache
        lastKnownGoodGovData = {
          source: 'data.gov.in',
          fetchedAt,
          records: mergedRecords
        };

        // Apply query filters
        const filtered = normalizedAll
          .filter(rec => matchesQueryFilter(rec, {
            commodity: rawCommodity,
            state: rawState,
            district: rawDistrict,
            market: rawMarket
          }))
          .slice(0, limit);

        // Cache this specific query in memory
        memoryCache.set(cacheKey, {
          timestamp: now,
          fetchedAt,
          data: filtered
        });

        return {
          success: true,
          source: 'data.gov.in',
          sourceStatus: 'live',
          fetchedAt,
          updatedAt: fetchedAt,
          cached: false,
          stale: false,
          count: filtered.length,
          data: filtered
        };
      }
    } catch (apiErr) {
      console.warn(`⚠️ Live data.gov.in fetch failed: ${apiErr.message}. Falling back to cache.`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP B: FALLBACK TO LAST SUCCESSFUL CACHE (Memory or Disk)
  // ─────────────────────────────────────────────────────────────────────────
  let cachedPayload = lastKnownGoodGovData;
  if (!cachedPayload || !Array.isArray(cachedPayload.records) || cachedPayload.records.length === 0) {
    cachedPayload = loadDiskCache();
    if (cachedPayload) {
      lastKnownGoodGovData = cachedPayload;
    }
  }

  if (cachedPayload && Array.isArray(cachedPayload.records) && cachedPayload.records.length > 0) {
    const filtered = cachedPayload.records
      .filter(rec => matchesQueryFilter(rec, {
        commodity: rawCommodity,
        state: rawState,
        district: rawDistrict,
        market: rawMarket
      }))
      .slice(0, limit);

    return {
      success: true,
      source: 'data.gov.in',
      sourceStatus: 'cached',
      fetchedAt: cachedPayload.fetchedAt,
      updatedAt: cachedPayload.fetchedAt,
      cached: true,
      stale: true,
      message: 'Government source temporarily unavailable. Showing the latest successfully retrieved data.',
      count: filtered.length,
      data: filtered
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP C: CLEAN UNAVAILABLE STATE (Production) vs DEMO STATE (Local Dev Only)
  // ─────────────────────────────────────────────────────────────────────────
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, NEVER silently display demo prices.
  if (isProduction) {
    return {
      success: false,
      source: 'data.gov.in',
      sourceStatus: 'unavailable',
      message: 'Current government data is temporarily unavailable.',
      fetchedAt: null,
      updatedAt: null,
      cached: false,
      stale: false,
      count: 0,
      data: []
    };
  }

  // Local development only fallback if no cache and no live data exists
  return {
    success: false,
    source: 'data.gov.in',
    sourceStatus: 'unavailable',
    message: 'Current government data is temporarily unavailable. Configure DATA_GOV_API_KEY in .env for live fetch.',
    fetchedAt: null,
    updatedAt: null,
    cached: false,
    stale: false,
    count: 0,
    data: []
  };
}

module.exports = {
  getGovernmentMandiPrices,
  normalizeCommodity,
  normalizeState,
  matchesQueryFilter,
  normalizeGovRecord
};
