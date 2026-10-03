/**
 * CEDA Agmarknet Market Price Provider
 * Integrates with Ashoka University CEDA Agmarknet API (https://api.ceda.ashoka.edu.in/v1)
 */

const https = require('https');
const BaseMarketPriceProvider = require('./baseMarketPriceProvider');

class CEDAMarketPriceProvider extends BaseMarketPriceProvider {
  constructor(options = {}) {
    super('ceda');
    this.baseUrl = (options.baseUrl || process.env.CEDA_API_BASE_URL || 'https://api.ceda.ashoka.edu.in/v1').replace(/\/+$/, '');
    this.apiKey = options.apiKey || process.env.CEDA_API_KEY || '';
    this.timeoutMs = options.timeoutMs || 7000;

    // In-memory caches for reference data to minimize repeated network calls
    this._commoditiesCache = null;
    this._geographiesCache = null;
    this._marketsCache = new Map(); // key: `${commId}_${stateId}_${distId}`
  }

  /**
   * Safe HTTP request helper with timeout and sanitization
   */
  async _request(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const apiKey = this.apiKey;

    if (!apiKey) {
      const err = new Error('CEDA API key not configured');
      err.isProviderFailure = true;
      err.statusCode = 401;
      throw err;
    }

    return new Promise((resolve, reject) => {
      let resolved = false;
      const parsedUrl = new URL(url);

      const reqOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      };

      let bodyData = null;
      if (body) {
        bodyData = JSON.stringify(body);
        reqOptions.headers['Content-Type'] = 'application/json';
        reqOptions.headers['Content-Length'] = Buffer.byteLength(bodyData);
      }

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          req.destroy();
          const err = new Error('CEDA request timed out');
          err.code = 'ETIMEDOUT';
          err.isProviderFailure = true;
          reject(err);
        }
      }, this.timeoutMs);

      const req = https.request(reqOptions, (res) => {
        let resBody = '';
        res.on('data', chunk => { resBody += chunk; });
        res.on('end', () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timer);

          const status = res.statusCode;

          if (status === 401 || status === 403) {
            const err = new Error(`CEDA authentication failure (${status})`);
            err.statusCode = status;
            err.isProviderFailure = true;
            return reject(err);
          }

          if (status === 429) {
            const err = new Error('CEDA rate limit exceeded (429)');
            err.statusCode = 429;
            err.isProviderFailure = true;
            return reject(err);
          }

          if (status >= 500) {
            const err = new Error(`CEDA server error (${status})`);
            err.statusCode = status;
            err.isProviderFailure = true;
            return reject(err);
          }

          if (status < 200 || status >= 300) {
            const err = new Error(`CEDA unexpected response status (${status})`);
            err.statusCode = status;
            err.isProviderFailure = true;
            return reject(err);
          }

          try {
            const parsed = JSON.parse(resBody);
            resolve(parsed);
          } catch (parseErr) {
            const err = new Error(`CEDA malformed JSON response: ${parseErr.message}`);
            err.isProviderFailure = true;
            reject(err);
          }
        });
      });

      req.on('error', (netErr) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        const err = new Error(`CEDA connection error: ${netErr.message}`);
        err.code = netErr.code;
        err.isProviderFailure = true;
        reject(err);
      });

      if (bodyData) {
        req.write(bodyData);
      }
      req.end();
    });
  }

  /**
   * GET /agmarknet/commodities
   */
  async getCommodities() {
    if (this._commoditiesCache) return this._commoditiesCache;
    const res = await this._request('/agmarknet/commodities');
    const rawList = (res && res.output && Array.isArray(res.output.data))
      ? res.output.data
      : (res && Array.isArray(res.commodities))
        ? res.commodities
        : (res && Array.isArray(res.data))
          ? res.data
          : [];

    const normalized = rawList.map(c => ({
      id: c.commodity_id !== undefined ? c.commodity_id : c.id,
      name: c.commodity_name || c.name || ''
    }));

    this._commoditiesCache = normalized;
    return normalized;
  }

  /**
   * Resolve commodity_id by name (e.g. "Tomato" -> 78)
   */
  async resolveCommodityId(cropName) {
    if (!cropName) return null;
    const norm = String(cropName).toLowerCase().trim();

    // Fast-path confirmed ID
    if (norm === 'tomato' || norm === 'tamatar') return 78;

    try {
      const list = await this.getCommodities();
      const match = list.find(c => (c.name || '').toLowerCase().trim() === norm);
      if (match) return match.id;
      const partial = list.find(c => (c.name || '').toLowerCase().includes(norm));
      return partial ? partial.id : null;
    } catch (e) {
      if (norm === 'tomato') return 78;
      throw e;
    }
  }

  /**
   * GET /agmarknet/geographies
   */
  async getGeographies() {
    if (this._geographiesCache) return this._geographiesCache;
    const res = await this._request('/agmarknet/geographies');
    const rawList = (res && res.output && Array.isArray(res.output.data))
      ? res.output.data
      : (res && Array.isArray(res.geographies))
        ? res.geographies
        : (res && Array.isArray(res.data))
          ? res.data
          : [];

    if (rawList.length > 0) {
      // Check if it's already grouped (has districts array)
      if (Array.isArray(rawList[0].districts)) {
        this._geographiesCache = rawList;
        return rawList;
      }

      // Group flat rows into state objects with districts array
      const stateMap = new Map();
      for (const row of rawList) {
        const stateId = row.census_state_id !== undefined ? row.census_state_id : row.state_id;
        const stateName = row.census_state_name || row.state_name;
        const districtId = row.census_district_id !== undefined ? row.census_district_id : row.district_id;
        const districtName = row.census_district_name || row.district_name;

        if (!stateMap.has(stateId)) {
          stateMap.set(stateId, {
            state_id: stateId,
            state_name: stateName,
            districts: []
          });
        }

        if (districtId) {
          const stateObj = stateMap.get(stateId);
          if (!stateObj.districts.some(d => d.district_id === districtId)) {
            stateObj.districts.push({
              district_id: districtId,
              district_name: districtName
            });
          }
        }
      }

      const grouped = Array.from(stateMap.values());
      this._geographiesCache = grouped;
      return grouped;
    }

    return [];
  }

  /**
   * Resolve state_id and district_ids
   */
  async resolveStateAndDistricts(stateName, districtName = null) {
    const geos = await this.getGeographies();
    const sNorm = (stateName || 'Maharashtra').toLowerCase().trim();

    const stateObj = geos.find(g => (g.state_name || '').toLowerCase().trim() === sNorm) ||
      geos.find(g => (g.state_name || '').toLowerCase().includes(sNorm));

    if (!stateObj) {
      return { stateId: null, stateName: stateName || 'Maharashtra', districtId: null, districtName };
    }

    const stateId = stateObj.state_id;
    let distId = null;
    let distNameResolved = districtName;

    if (districtName && Array.isArray(stateObj.districts)) {
      const dNorm = districtName.toLowerCase().trim();
      const distObj = stateObj.districts.find(d => (d.district_name || '').toLowerCase().trim() === dNorm) ||
        stateObj.districts.find(d => (d.district_name || '').toLowerCase().includes(dNorm));
      if (distObj) {
        distId = distObj.district_id;
        distNameResolved = distObj.district_name;
      }
    }

    return {
      stateId,
      stateName: stateObj.state_name,
      districtId: distId,
      districtName: distNameResolved,
      districts: stateObj.districts || []
    };
  }

  /**
   * POST /agmarknet/markets
   */
  async getMarkets(params) {
    const { commodityId, stateId, districtId } = params;
    const cacheKey = `${commodityId}_${stateId}_${districtId || 0}`;

    if (this._marketsCache.has(cacheKey)) {
      return this._marketsCache.get(cacheKey);
    }

    const payload = {
      commodity_id: Number(commodityId),
      state_id: Number(stateId),
      district_id: Number(districtId || 0),
      indicator: 'price'
    };

    const res = await this._request('/agmarknet/markets', 'POST', payload);
    const rawList = (res && res.output && Array.isArray(res.output.data))
      ? res.output.data
      : (res && Array.isArray(res.data))
        ? res.data
        : [];

    const markets = rawList.map(m => ({
      market_id: m.market_id,
      market_name: m.market_name,
      state_id: m.census_state_id || m.state_id,
      district_id: m.census_district_id || m.district_id
    }));

    this._marketsCache.set(cacheKey, markets);
    return markets;
  }

  /**
   * POST /agmarknet/prices
   * Primary method to fetch market prices
   */
  async getMarketPrices(params = {}) {
    const crop = params.commodity || params.crop || 'Tomato';
    const state = params.state || 'Maharashtra';
    const district = params.district || null;
    const market = params.market || params.mandi || null;
    const dateStr = params.date; // YYYY-MM-DD

    // 1. Resolve IDs
    const commodityId = await this.resolveCommodityId(crop);
    if (!commodityId) {
      // Cannot resolve commodity in CEDA
      return {
        success: true,
        provider: 'ceda',
        commodity: crop,
        state: state,
        data_available: false,
        data: [],
        message: `Commodity '${crop}' not found in CEDA directory`
      };
    }

    const geo = await this.resolveStateAndDistricts(state, district);
    if (!geo.stateId) {
      return {
        success: true,
        provider: 'ceda',
        commodity: crop,
        state: state,
        data_available: false,
        data: [],
        message: `State '${state}' not found in CEDA directory`
      };
    }

    // 2. Resolve Market IDs if market filter was provided
    let marketIds = [];
    let resolvedMarketName = market;

    if (market && geo.districtId) {
      try {
        const markets = await this.getMarkets({
          commodityId,
          stateId: geo.stateId,
          districtId: geo.districtId
        });

        const mNorm = market.toLowerCase().trim();
        const matchedMarket = markets.find(m => (m.market_name || '').toLowerCase().trim() === mNorm) ||
          markets.find(m => (m.market_name || '').toLowerCase().includes(mNorm));

        if (matchedMarket) {
          marketIds = [matchedMarket.market_id];
          resolvedMarketName = matchedMarket.market_name;
        }
      } catch (mErr) {
        // If getting markets fails, we proceed without specific market filter
      }
    }

    // 3. Prepare POST /agmarknet/prices payload
    const pricePayload = {
      commodity_id: Number(commodityId),
      state_id: Number(geo.stateId),
      from_date: params.fromDate || dateStr,
      to_date: dateStr
    };

    if (geo.districtId) {
      pricePayload.district_id = [Number(geo.districtId)];
    } else if (Array.isArray(geo.districts) && geo.districts.length > 0) {
      // Optimization: Passing district IDs allows CEDA database to perform fast index scan (<100ms)
      // instead of a broad unindexed state-level full-table scan that can timeout.
      pricePayload.district_id = geo.districts.map(d => Number(d.district_id));
    }

    if (marketIds.length > 0) {
      pricePayload.market_id = marketIds.map(Number);
    }

    // 4. Execute POST /agmarknet/prices
    const res = await this._request('/agmarknet/prices', 'POST', pricePayload);

    // 5. Evaluate response
    const rawRecords = (res && res.output && Array.isArray(res.output.data))
      ? res.output.data
      : (res && Array.isArray(res.data))
        ? res.data
        : [];

    if (rawRecords.length === 0) {
      // Legitimate empty result from CEDA for this date/market (NOT a failure)
      return {
        success: true,
        provider: 'ceda',
        commodity: crop,
        state: geo.stateName || state,
        district: geo.districtName || district || '',
        market: resolvedMarketName || market || '',
        date: dateStr,
        data_available: false,
        data: []
      };
    }

    // 6. Normalize records into unified contract
    const normalizedData = rawRecords.map(r => {
      const minPrice = Number(r.min_price) || 0;
      const maxPrice = Number(r.max_price) || 0;
      const modalPrice = Number(r.modal_price) || (minPrice && maxPrice ? Math.round((minPrice + maxPrice) / 2) : minPrice || maxPrice);
      const marketName = resolvedMarketName || (r.market_name ? r.market_name : `APMC Market ${r.market_id}`);

      return {
        provider: 'ceda',
        commodity: crop,
        state: geo.stateName || state,
        district: geo.districtName || district || '',
        market: marketName,
        market_id: r.market_id,
        date: r.date ? r.date.split('T')[0] : dateStr,
        min_price: minPrice,
        max_price: maxPrice,
        modal_price: modalPrice,
        quantity: 0,
        unit: 'quintal',
        currency: 'INR',
        data_available: true,

        // Backward compatibility aliases for existing frontend
        crop: crop,
        mandi: marketName,
        minPrice: minPrice,
        maxPrice: maxPrice,
        modalPrice: modalPrice,
        reportDate: r.date ? r.date.split('T')[0] : dateStr,
        arrivalDate: r.date ? r.date.split('T')[0] : dateStr,
        source: 'CEDA Agmarknet API (Ashoka University)',
        status: 'LIVE'
      };
    });

    return {
      success: true,
      provider: 'ceda',
      fallback_used: false,
      commodity: crop,
      state: geo.stateName || state,
      district: geo.districtName || district || '',
      market: resolvedMarketName || market || '',
      date: dateStr,
      data_available: true,
      count: normalizedData.length,
      data: normalizedData
    };
  }
}

module.exports = CEDAMarketPriceProvider;
