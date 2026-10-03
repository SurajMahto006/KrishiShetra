/**
 * Unified Market Price Service
 * Manages provider priority (CEDA primary -> data.gov.in fallback),
 * timeout/error resilience, India timezone date calculations, and caching.
 */

const CEDAMarketPriceProvider = require('./providers/cedaMarketPriceProvider');
const DataGovMarketPriceProvider = require('./providers/dataGovMarketPriceProvider');

// Lightweight in-memory cache
const memoryCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Get current date string (YYYY-MM-DD) in India Standard Time (Asia/Kolkata)
 */
function getIndiaTodayDate() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date()); // Formats as YYYY-MM-DD
}

/**
 * Strip any potential API keys, authorization headers, or secrets from log messages
 */
function sanitizeErrorMessage(err) {
  if (!err) return 'Unknown error';
  const msg = err.message || String(err);
  return msg
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
    .replace(/api[-_]?key=[A-Za-z0-9._-]+/gi, 'api_key=[REDACTED]')
    .replace(/key=[A-Za-z0-9._-]+/gi, 'key=[REDACTED]');
}

class MarketPriceService {
  constructor(options = {}) {
    this.cedaProvider = options.cedaProvider || new CEDAMarketPriceProvider(options.ceda || {});
    this.dataGovProvider = options.dataGovProvider || new DataGovMarketPriceProvider(options.dataGov || {});
    this.memoryCache = options.cache || new Map();
    this.cacheTtlMs = options.cacheTtlMs !== undefined ? options.cacheTtlMs : (10 * 60 * 1000);
  }

  /**
   * Main method to retrieve market prices with CEDA -> data.gov.in fallback
   * @param {Object} queryParams - { commodity, crop, state, district, market, mandi, date }
   */
  async getMarketPrices(queryParams = {}) {
    const commodity = queryParams.commodity || queryParams.crop || 'Tomato';
    const state = queryParams.state || 'Maharashtra';
    const district = queryParams.district || '';
    const market = queryParams.market || queryParams.mandi || '';

    // Calculate today's date in IST if no specific date was passed
    const date = queryParams.date || getIndiaTodayDate();

    const cacheKey = `${commodity.toLowerCase()}_${state.toLowerCase()}_${district.toLowerCase()}_${market.toLowerCase()}_${date}`;
    const now = Date.now();

    // Check memory cache
    const cached = this.memoryCache.get(cacheKey);
    if (cached && (now - cached.timestamp < this.cacheTtlMs)) {
      return {
        ...cached.data,
        cached: true
      };
    }

    const requestParams = {
      commodity,
      state,
      district,
      market,
      date,
      limit: queryParams.limit || 50
    };

    let cedaResult = null;
    let cedaFailed = false;
    let cedaFailureReason = '';

    // ─────────────────────────────────────────────────────────────────
    // STEP 1: Attempt Primary Provider (CEDA)
    // ─────────────────────────────────────────────────────────────────
    try {
      cedaResult = await this.cedaProvider.getMarketPrices(requestParams);

      // Distinguish provider failure from legitimate empty result:
      // If cedaResult returned without throwing, and was a valid response
      if (cedaResult && cedaResult.success) {
        // Cache successful response (only if data is valid or legitimate empty)
        this.memoryCache.set(cacheKey, { timestamp: now, data: cedaResult });
        return {
          ...cedaResult,
          fallback_used: false
        };
      } else {
        cedaFailed = true;
        cedaFailureReason = cedaResult ? cedaResult.message : 'Invalid response from CEDA';
      }
    } catch (err) {
      cedaFailed = true;
      cedaFailureReason = sanitizeErrorMessage(err);
      console.warn(`⚠️ CEDA provider failed: ${cedaFailureReason}. Falling back to data.gov.in.`);
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 2: Fallback Provider (data.gov.in)
    // ─────────────────────────────────────────────────────────────────
    if (cedaFailed) {
      try {
        const fallbackResult = await this.dataGovProvider.getMarketPrices(requestParams);

        if (fallbackResult && fallbackResult.success && Array.isArray(fallbackResult.data) && fallbackResult.data.length > 0) {
          const finalResult = {
            ...fallbackResult,
            provider: 'data.gov.in',
            fallback_used: true,
            ceda_failure_reason: cedaFailureReason
          };

          // Cache fallback result
          this.memoryCache.set(cacheKey, { timestamp: now, data: finalResult });
          return finalResult;
        } else {
          // data.gov.in returned no data or was unavailable
          return {
            success: false,
            provider: 'data.gov.in',
            fallback_used: true,
            commodity,
            state,
            district,
            market,
            date,
            data_available: false,
            data: [],
            message: 'Market price data currently unavailable across all providers.'
          };
        }
      } catch (fallbackErr) {
        const fallbackReason = sanitizeErrorMessage(fallbackErr);
        console.warn(`⚠️ Fallback provider (data.gov.in) also failed: ${fallbackReason}`);

        return {
          success: false,
          provider: 'none',
          fallback_used: true,
          commodity,
          state,
          district,
          market,
          date,
          data_available: false,
          data: [],
          message: 'Market price services temporarily unavailable.'
        };
      }
    }

    // Default clean fallback
    return {
      success: false,
      provider: 'none',
      fallback_used: false,
      data_available: false,
      data: [],
      message: 'No price data available'
    };
  }

  /**
   * Helper to fetch commodities
   */
  async getCommodities() {
    try {
      return await this.cedaProvider.getCommodities();
    } catch (err) {
      return await this.dataGovProvider.getCommodities();
    }
  }

  /**
   * Helper to fetch geographies
   */
  async getGeographies() {
    try {
      return await this.cedaProvider.getGeographies();
    } catch (err) {
      return await this.dataGovProvider.getGeographies();
    }
  }

  /**
   * Helper to fetch markets
   */
  async getMarkets(params) {
    try {
      return await this.cedaProvider.getMarkets(params);
    } catch (err) {
      return await this.dataGovProvider.getMarkets(params);
    }
  }
}

// Export singleton instance and class
const marketPriceService = new MarketPriceService();

module.exports = {
  MarketPriceService,
  marketPriceService,
  getIndiaTodayDate,
  sanitizeErrorMessage
};
