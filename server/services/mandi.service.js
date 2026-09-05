/**
 * KRISHISHETRA — GOVERNMENT MANDI PRICE SERVICE
 * Official Government of India Open Government Data Platform (data.gov.in) Integration
 * Dataset: "Current Daily Price of Various Commodities from Various Markets (Mandi)"
 * Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
 */

const https = require('https');

// Default official dataset resource ID on data.gov.in
const DEFAULT_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = 'https://api.data.gov.in/resource';

// In-Memory Cache configuration
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL
const memoryCache = new Map();
let lastKnownGoodData = null;

// Commodity name normalizer for data.gov.in Agmarknet naming standards
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
  haryana: 'Haryana'
};

/**
 * Normalizes input commodity term to match Agmarknet / data.gov.in conventions
 */
function normalizeCommodity(commodity) {
  if (!commodity || commodity === 'all') return null;
  const key = commodity.toLowerCase().trim();
  return COMMODITY_MAP[key] || (key.charAt(0).toUpperCase() + key.slice(1));
}

/**
 * Normalizes input state term to match Agmarknet / data.gov.in conventions
 */
function normalizeState(state) {
  if (!state || state === 'all') return null;
  const key = state.toLowerCase().trim();
  return STATE_MAP[key] || (key.charAt(0).toUpperCase() + key.slice(1));
}

/**
 * Perform HTTPS GET request with timeout support
 */
function fetchJson(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    // If native global fetch is available (Node 18+), prefer it with AbortController
    if (typeof fetch === 'function') {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      fetch(url, { signal: controller.signal })
        .then(res => {
          clearTimeout(timer);
          if (!res.ok) {
            throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(json => resolve(json))
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
      return;
    }

    // Fallback to standard Node.js https module
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode >= 400) {
            return reject(new Error(`HTTP Error ${res.statusCode}`));
          }
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse JSON response: ${e.message}`));
        }
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Request timed out while connecting to data.gov.in'));
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Retrieve Government of India Mandi Prices from data.gov.in
 * Supports caching, filtering, and graceful error handling
 */
async function getGovernmentMandiPrices(params = {}) {
  const apiKey = process.env.DATA_GOV_API_KEY || process.env.DATAGOV_API_KEY || process.env.GOV_MANDI_API_KEY || '';
  const resourceId = process.env.DATA_GOV_RESOURCE_ID || DEFAULT_RESOURCE_ID;

  const rawCommodity = params.commodity || params.crop || '';
  const rawState = params.state || params.location || '';
  const market = params.market ? params.market.trim() : '';
  const limit = Math.min(Math.max(parseInt(params.limit, 10) || 50, 1), 100);

  const commodity = normalizeCommodity(rawCommodity);
  const state = normalizeState(rawState);

  // Check In-Memory Cache
  const cacheKey = `${commodity || 'all'}_${state || 'all'}_${market || 'all'}_${limit}`;
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return {
      success: true,
      source: 'Government of India - data.gov.in',
      cached: true,
      updatedAt: cached.updatedAt,
      data: cached.data
    };
  }

  // If no API key is provided, check if we have last known good data or return unavailable
  if (!apiKey) {
    if (cached && cached.data) {
      return {
        success: true,
        source: 'Government of India - data.gov.in',
        stale: true,
        message: 'Last available government data',
        updatedAt: cached.updatedAt,
        data: cached.data
      };
    }
    return {
      success: false,
      source: 'Government of India - data.gov.in',
      message: 'Government mandi prices are temporarily unavailable. Please try again.',
      data: []
    };
  }

  // Construct official data.gov.in API query
  try {
    const queryParams = new URLSearchParams({
      'api-key': apiKey,
      format: 'json',
      offset: '0',
      limit: String(limit)
    });

    if (commodity) {
      queryParams.append('filters[commodity]', commodity);
    }
    if (state) {
      queryParams.append('filters[state]', state);
    }
    if (market) {
      queryParams.append('filters[market]', market);
    }

    const targetUrl = `${BASE_URL}/${resourceId}?${queryParams.toString()}`;
    const response = await fetchJson(targetUrl);

    if (!response || !Array.isArray(response.records)) {
      throw new Error('Unexpected response format from data.gov.in');
    }

    // Normalize government records into clean KrishiShetra format
    const normalizedData = response.records.map(rec => {
      const minP = parseFloat(rec.min_price);
      const maxP = parseFloat(rec.max_price);
      const modalP = parseFloat(rec.modal_price);

      return {
        commodity: rec.commodity || commodity || 'Unknown Commodity',
        state: rec.state || state || '',
        district: rec.district || '',
        market: rec.market || '',
        variety: rec.variety || 'Standard',
        grade: rec.grade || 'FAQ',
        minPrice: isNaN(minP) ? 0 : minP,
        maxPrice: isNaN(maxP) ? 0 : maxP,
        modalPrice: isNaN(modalP) ? (isNaN(minP) ? 0 : minP) : modalP,
        arrivalDate: rec.arrival_date || '',
        // Arrival volume only if officially provided in dataset; do not manufacture fake volume
        arrivalVolume: rec.arrival_volume ? parseFloat(rec.arrival_volume) : null,
        isGovData: true
      };
    });

    const updatedAt = response.updated_date || new Date().toISOString();

    // Cache the successful result
    memoryCache.set(cacheKey, {
      timestamp: now,
      updatedAt,
      data: normalizedData
    });

    lastKnownGoodData = {
      updatedAt,
      data: normalizedData
    };

    return {
      success: true,
      source: 'Government of India - data.gov.in',
      updatedAt,
      count: normalizedData.length,
      data: normalizedData
    };

  } catch (err) {
    // Graceful error handling: If stale cache exists, serve it clearly labelled
    if (cached && cached.data && cached.data.length > 0) {
      return {
        success: true,
        source: 'Government of India - data.gov.in',
        stale: true,
        message: 'Last available government data',
        updatedAt: cached.updatedAt,
        data: cached.data
      };
    } else if (lastKnownGoodData && lastKnownGoodData.data && lastKnownGoodData.data.length > 0) {
      return {
        success: true,
        source: 'Government of India - data.gov.in',
        stale: true,
        message: 'Last available government data',
        updatedAt: lastKnownGoodData.updatedAt,
        data: lastKnownGoodData.data
      };
    }

    // Do NOT silently replace with fake numbers
    return {
      success: false,
      source: 'Government of India - data.gov.in',
      message: 'Government mandi prices are temporarily unavailable. Please try again.',
      data: []
    };
  }
}

module.exports = {
  getGovernmentMandiPrices,
  normalizeCommodity,
  normalizeState
};
