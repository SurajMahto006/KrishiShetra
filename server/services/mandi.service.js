const path = require('path');
// Ensure .env is loaded regardless of working directory
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config();

const https = require('https');

// Default official dataset resource ID on data.gov.in
const DEFAULT_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = 'https://api.data.gov.in/resource';

// In-Memory Cache configuration
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL
const memoryCache = new Map();

// Commodity name aliases for data.gov.in Agmarknet naming standards
const COMMODITY_ALIASES = {
  rice: ['Rice', 'Paddy(Dhan)(Common)'],
  paddy: ['Paddy(Dhan)(Common)', 'Rice'],
  wheat: ['Wheat'],
  onion: ['Onion'],
  tomato: ['Tomato'],
  potato: ['Potato'],
  maize: ['Maize'],
  soybean: ['Soyabean', 'Soybean'],
  cotton: ['Cotton'],
  chilli: ['Green Chilli', 'Chilli Green'],
  groundnut: ['Groundnut'],
  sugarcane: ['Sugarcane'],
  mango: ['Mango', 'Mango(Raw-Ripe)'],
  banana: ['Banana'],
  grapes: ['Grapes'],
  pulses: ['Gram Raw(Chhana)', 'Bengal Gram(Gram)(Whole)', 'Red gram/Arhar/Tur(whole)', 'Green Gram(Moong)(Whole)']
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
 * Returns array of Agmarknet commodity aliases to try
 */
function getCommodityAliases(commodity) {
  if (!commodity || commodity === 'all') return [null];
  const key = commodity.toLowerCase().trim();
  if (COMMODITY_ALIASES[key]) return COMMODITY_ALIASES[key];
  return [key.charAt(0).toUpperCase() + key.slice(1)];
}

/**
 * Normalizes input commodity term to primary Agmarknet convention
 */
function normalizeCommodity(commodity) {
  const aliases = getCommodityAliases(commodity);
  return aliases[0];
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
 * Structured logger for Market Mandi API requests without leaking secret credentials
 */
function logMarketApi({ request, status, externalUrl, responseReceived, records, error, apiKeyPresent }) {
  console.log('--------------------------------------------------');
  console.log('[MARKET API]');
  console.log(`Request: ${request || 'N/A'}`);
  console.log(`API_KEY_PRESENT: ${Boolean(apiKeyPresent)}`);
  console.log(`Status: ${status !== undefined ? status : 'N/A'}`);
  console.log(`External URL: ${externalUrl || 'N/A'}`);
  console.log(`Response received: ${Boolean(responseReceived)}`);
  console.log(`Records: ${records !== undefined ? records : 0}`);
  if (error) console.log(`Error: ${error}`);
  console.log('--------------------------------------------------');
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

// Local Benchmark Fallback Dataset (Preserves existing mandi data when external API is unreachable)
const FALLBACK_MANDIS = [
  { market: 'Pune APMC', district: 'Pune', state: 'Maharashtra', dist: 12, arrivals: 1420, prices: { rice: 2850, wheat: 2620, onion: 2850, tomato: 2400, maize: 2280, soybean: 4550, potato: 1800, chilli: 8350, groundnut: 6450, cotton: 6750, sugarcane: 3150, mango: 5500, banana: 1850, grapes: 6200, pulses: 7400 } },
  { market: 'Mumbai APMC (Vashi)', district: 'Thane', state: 'Maharashtra', dist: 140, arrivals: 2650, prices: { rice: 2920, wheat: 2700, onion: 2950, tomato: 2550, maize: 2350, soybean: 4700, potato: 1900, chilli: 8600, groundnut: 6600, cotton: 6900, sugarcane: 3200, mango: 6200, banana: 1950, grapes: 6600, pulses: 7650 } },
  { market: 'Nashik APMC', district: 'Nashik', state: 'Maharashtra', dist: 180, arrivals: 1850, prices: { rice: 2760, wheat: 2580, onion: 2980, tomato: 2300, maize: 2250, soybean: 4480, potato: 1750, chilli: 8200, groundnut: 6350, cotton: 6680, sugarcane: 3100, mango: 5100, banana: 1750, grapes: 6800, pulses: 7250 } },
  { market: 'Nagpur APMC', district: 'Nagpur', state: 'Maharashtra', dist: 450, arrivals: 1620, prices: { rice: 2800, wheat: 2660, onion: 2720, tomato: 2380, maize: 2320, soybean: 4620, potato: 1820, chilli: 8450, groundnut: 6500, cotton: 6820, sugarcane: 3080, mango: 4900, banana: 1800, grapes: 5900, pulses: 7550 } },
  { market: 'Solapur APMC', district: 'Solapur', state: 'Maharashtra', dist: 220, arrivals: 980, prices: { rice: 2780, wheat: 2590, onion: 2800, tomato: 2450, maize: 2260, soybean: 4500, potato: 1780, chilli: 8300, groundnut: 6420, cotton: 6700, sugarcane: 3250, mango: 4800, banana: 1900, grapes: 6300, pulses: 7450 } },
  { market: 'Kolhapur APMC', district: 'Kolhapur', state: 'Maharashtra', dist: 270, arrivals: 890, prices: { rice: 2810, wheat: 2600, onion: 2830, tomato: 2420, maize: 2270, soybean: 4520, potato: 1790, chilli: 8280, groundnut: 6400, cotton: 6720, sugarcane: 3400, mango: 5200, banana: 1820, grapes: 6100, pulses: 7350 } },
  { market: 'Latur APMC', district: 'Latur', state: 'Maharashtra', dist: 340, arrivals: 1560, prices: { rice: 2770, wheat: 2630, onion: 2740, tomato: 2380, maize: 2290, soybean: 4720, potato: 1790, chilli: 8460, groundnut: 6540, cotton: 6800, sugarcane: 3180, mango: 5100, banana: 1830, grapes: 5900, pulses: 7750 } },
  { market: 'Sambhajinagar APMC', district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', dist: 210, arrivals: 1140, prices: { rice: 2790, wheat: 2640, onion: 2770, tomato: 2360, maize: 2300, soybean: 4580, potato: 1810, chilli: 8380, groundnut: 6480, cotton: 6780, sugarcane: 3120, mango: 5300, banana: 1840, grapes: 6050, pulses: 7480 } },
  { market: 'Indore Mandi', district: 'Indore', state: 'Madhya Pradesh', dist: 520, arrivals: 2850, prices: { rice: 2750, wheat: 2680, onion: 2790, tomato: 2320, maize: 2340, soybean: 4780, potato: 1780, chilli: 8400, groundnut: 6560, cotton: 6850, sugarcane: 2950, mango: 5300, banana: 1840, grapes: 6100, pulses: 7600 } },
  { market: 'Bhopal Mandi', district: 'Bhopal', state: 'Madhya Pradesh', dist: 580, arrivals: 1750, prices: { rice: 2730, wheat: 2650, onion: 2760, tomato: 2350, maize: 2310, soybean: 4680, potato: 1760, chilli: 8320, groundnut: 6490, cotton: 6790, sugarcane: 2980, mango: 5200, banana: 1820, grapes: 6000, pulses: 7540 } },
  { market: 'Ahmedabad APMC', district: 'Ahmedabad', state: 'Gujarat', dist: 640, arrivals: 2450, prices: { rice: 2820, wheat: 2690, onion: 2840, tomato: 2480, maize: 2330, soybean: 4600, potato: 1840, chilli: 8520, groundnut: 6680, cotton: 6920, sugarcane: 3050, mango: 5600, banana: 1910, grapes: 6350, pulses: 7580 } },
  { market: 'Surat APMC', district: 'Surat', state: 'Gujarat', dist: 410, arrivals: 1820, prices: { rice: 2840, wheat: 2670, onion: 2880, tomato: 2500, maize: 2320, soybean: 4570, potato: 1830, chilli: 8480, groundnut: 6620, cotton: 6880, sugarcane: 3120, mango: 5700, banana: 1930, grapes: 6400, pulses: 7520 } },
  { market: 'Jaipur Mandi', district: 'Jaipur', state: 'Rajasthan', dist: 780, arrivals: 2100, prices: { rice: 2780, wheat: 2710, onion: 2820, tomato: 2390, maize: 2340, soybean: 4620, potato: 1820, chilli: 8550, groundnut: 6580, cotton: 6870, sugarcane: 2990, mango: 5400, banana: 1860, grapes: 6200, pulses: 7680 } },
  { market: 'Bengaluru APMC (Yeshwanthpur)', district: 'Bengaluru Urban', state: 'Karnataka', dist: 840, arrivals: 2300, prices: { rice: 2900, wheat: 2680, onion: 2920, tomato: 2600, maize: 2360, soybean: 4550, potato: 1920, chilli: 8650, groundnut: 6640, cotton: 6840, sugarcane: 3300, mango: 5800, banana: 1980, grapes: 6500, pulses: 7620 } }
];

/**
 * Generate structured fallback mandi data from local benchmark dataset
 */
function getFallbackMandiData(rawCommodity, rawState, limit = 15) {
  const cropKey = (rawCommodity || 'rice').toLowerCase().trim();
  const stateKey = (rawState || 'all').toLowerCase().trim();
  const displayCrop = cropKey.charAt(0).toUpperCase() + cropKey.slice(1);

  let filtered = FALLBACK_MANDIS.filter(m => m.prices && m.prices[cropKey] > 0);

  if (stateKey !== 'all' && stateKey !== '') {
    const stateMatched = filtered.filter(m => m.state.toLowerCase() === stateKey);
    if (stateMatched.length > 0) {
      filtered = stateMatched;
    }
  }

  const records = filtered.slice(0, limit).map(m => {
    const basePrice = m.prices[cropKey] || 2500;
    return {
      commodity: displayCrop,
      state: m.state,
      district: m.district,
      market: m.market,
      variety: 'Local Benchmark',
      grade: 'FAQ',
      minPrice: Math.round(basePrice * 0.94),
      maxPrice: Math.round(basePrice * 1.06),
      modalPrice: basePrice,
      arrivalDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      arrivalVolume: m.arrivals,
      isGovData: false,
      isFallback: true
    };
  });

  return {
    success: true,
    source: 'local-fallback',
    fallback: true,
    message: 'Estimated mandi prices based on local regional market benchmark data.',
    updatedAt: new Date().toISOString(),
    count: records.length,
    data: records
  };
}

const { mandiCacheManager } = require('../utils/mandiCache');

/**
 * Retrieve Government of India Mandi Prices from data.gov.in
 * Follows strict 4-Tier Provenance Pipeline:
 * PRIORITY 1: LIVE GOVERNMENT DATA (data.gov.in / Agmarknet)
 * PRIORITY 2: RECENT REAL CACHED DATA (< 36 hours)
 * PRIORITY 3: OLDER REAL HISTORICAL OBSERVATIONS
 * PRIORITY 4: CALCULATED ESTIMATE (from genuine observations only)
 * If ZERO genuine observations exist: UNAVAILABLE (never fabricated)
 */
async function getGovernmentMandiPrices(params = {}) {
  const apiKey = process.env.DATA_GOV_API_KEY || process.env.DATAGOV_API_KEY || process.env.GOV_MANDI_API_KEY || '';
  const resourceId = process.env.DATA_GOV_RESOURCE_ID || DEFAULT_RESOURCE_ID;

  const rawCommodity = params.commodity || params.crop || 'rice';
  const rawState = params.state || params.location || 'all';
  const market = params.market ? params.market.trim() : '';
  const limit = Math.min(Math.max(parseInt(params.limit, 10) || 25, 1), 100);

  const state = normalizeState(rawState);
  const aliases = getCommodityAliases(rawCommodity);

  const requestSummary = `commodity='${rawCommodity}' (aliases: ${aliases.join(', ')}) / state='${state || 'all'}' / market='${market || 'all'}'`;

  // In-memory cache check for ultra-fast response
  const cacheKey = `${String(rawCommodity).toLowerCase()}_${state || 'all'}_${market || 'all'}_${limit}`;
  const now = Date.now();
  const memCached = memoryCache.get(cacheKey);

  if (memCached && (now - memCached.timestamp < CACHE_TTL_MS)) {
    return {
      success: true,
      source: 'government',
      verified: true,
      status: memCached.status || 'CACHED',
      statusLabel: memCached.statusLabel || `Cached government data · Last updated ${memCached.arrivalDate || 'recently'}`,
      updatedAt: memCached.updatedAt,
      fetchedAt: memCached.fetchedAt || memCached.updatedAt,
      arrivalDate: memCached.arrivalDate,
      count: memCached.data.length,
      data: memCached.data
    };
  }

  // If no API key configured, seamlessly resolve from persistent genuine cache / historical data
  if (!apiKey) {
    logMarketApi({
      request: requestSummary,
      status: 401,
      externalUrl: `${BASE_URL}/${resourceId}?filters[commodity]=...&api-key=REDACTED`,
      responseReceived: false,
      records: 0,
      error: 'DATA_GOV_API_KEY is not configured in environment',
      apiKeyPresent: false
    });
    return mandiCacheManager.resolveCachedOrHistorical(rawCommodity, state || rawState, market);
  }

  // PRIORITY 1: ATTEMPT LIVE GOVERNMENT API FETCH (TRY ALL ALIASES)
  let liveRecords = null;
  let lastStatus = 0;
  let lastExternalUrl = '';
  let lastError = null;

  for (const commodityName of aliases) {
    const queryParams = new URLSearchParams({
      'api-key': apiKey,
      format: 'json',
      offset: '0',
      limit: '50' // retrieve ample records to rank by market locally
    });

    if (commodityName) {
      queryParams.append('filters[commodity]', commodityName);
    }
    if (state) {
      queryParams.append('filters[state]', state);
    }

    const targetUrl = `${BASE_URL}/${resourceId}?${queryParams.toString()}`;
    // Sanitize target URL for safe logging (NEVER print actual secret)
    const sanitizedUrl = targetUrl.replace(encodeURIComponent(apiKey), 'REDACTED').replace(apiKey, 'REDACTED');
    lastExternalUrl = sanitizedUrl;

    try {
      const response = await fetchJson(targetUrl, 12000);
      lastStatus = 200;

      if (response && Array.isArray(response.records) && response.records.length > 0) {
        // Normalize government records
        const valid = response.records
          .filter(rec => rec && (rec.modal_price || rec.min_price))
          .map(rec => {
            const minP = parseFloat(rec.min_price);
            const maxP = parseFloat(rec.max_price);
            const modalP = parseFloat(rec.modal_price);
            const resolvedModal = !isNaN(modalP) && modalP > 0 ? modalP : (!isNaN(minP) ? minP : 0);
            const arrDate = rec.arrival_date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

            return {
              market: rec.market ? rec.market.trim() : '',
              commodity: rec.commodity || commodityName || rawCommodity,
              modalPrice: resolvedModal,
              minPrice: isNaN(minP) ? resolvedModal : minP,
              maxPrice: isNaN(maxP) ? resolvedModal : maxP,
              date: arrDate,
              arrivalDate: arrDate,
              state: rec.state || state || '',
              district: rec.district || '',
              variety: rec.variety || 'Standard',
              grade: rec.grade || 'FAQ',
              arrivalVolume: rec.arrival_volume ? parseFloat(rec.arrival_volume) : null,
              source: 'government',
              verified: true,
              fetchedAt: new Date().toISOString()
            };
          })
          .filter(r => r.modalPrice > 0);

        if (valid.length > 0) {
          liveRecords = valid;
          logMarketApi({
            request: requestSummary,
            status: 200,
            externalUrl: sanitizedUrl,
            responseReceived: true,
            records: valid.length,
            error: null,
            apiKeyPresent: true
          });
          break; // Found matching live records
        }
      }
    } catch (err) {
      lastError = err.message || err;
      const statusMatch = (err.message || '').match(/HTTP Error (\d+)/i);
      lastStatus = statusMatch ? parseInt(statusMatch[1], 10) : 500;
    }
  }

  if (liveRecords && liveRecords.length > 0) {
    // Save fresh records into persistent cache immediately
    mandiCacheManager.saveFreshRecords(liveRecords, 'government');

    // Rank matching records: prioritize requested market keyword, then district, then state
    let rankedRecords = [...liveRecords];
    if (market) {
      const keyword = market.split(' ')[0].toLowerCase();
      rankedRecords.sort((a, b) => {
        const aMatch = (a.market && a.market.toLowerCase().includes(keyword)) ? 1 : 0;
        const bMatch = (b.market && b.market.toLowerCase().includes(keyword)) ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    const latestObservationDate = rankedRecords[0]?.arrivalDate || 'Today';

    const resultPayload = {
      success: true,
      source: 'government',
      verified: true,
      status: 'LIVE',
      statusLabel: `Live government data · Updated ${latestObservationDate}`,
      fetchedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      arrivalDate: latestObservationDate,
      count: rankedRecords.length,
      data: rankedRecords.slice(0, limit)
    };

    // Cache in memory for quick reuse
    memoryCache.set(cacheKey, {
      timestamp: now,
      status: 'LIVE',
      statusLabel: `Live government data · Updated ${latestObservationDate}`,
      updatedAt: resultPayload.updatedAt,
      fetchedAt: resultPayload.fetchedAt,
      arrivalDate: latestObservationDate,
      data: resultPayload.data
    });

    return resultPayload;
  }

  // Live request produced 0 records or threw an error -> log structured error
  logMarketApi({
    request: requestSummary,
    status: lastStatus || 404,
    externalUrl: lastExternalUrl,
    responseReceived: !lastError,
    records: 0,
    error: lastError || 'No live government records found for specified commodity/state query',
    apiKeyPresent: true
  });

  // PRIORITY 2: RESOLVE LAST-KNOWN-GOOD VERIFIED CACHE (NEVER MOCK PRICES)
  return mandiCacheManager.resolveCachedOrHistorical(rawCommodity, state || rawState, market);
}

module.exports = {
  getGovernmentMandiPrices,
  getFallbackMandiData,
  normalizeCommodity,
  normalizeState
};
