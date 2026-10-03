/**
 * data.gov.in Market Price Provider
 * Wraps existing data.gov.in integration and normalizes to the unified contract
 */

const BaseMarketPriceProvider = require('./baseMarketPriceProvider');
const { getGovernmentMandiPrices } = require('../mandi.service');

class DataGovMarketPriceProvider extends BaseMarketPriceProvider {
  constructor(options = {}) {
    super('data.gov.in');
    this.resourceId = options.resourceId || process.env.DATA_GOV_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
    this.apiKey = options.apiKey || process.env.DATA_GOV_API_KEY || '';
  }

  async getCommodities() {
    return [
      { id: 'tomato', name: 'Tomato' },
      { id: 'onion', name: 'Onion' },
      { id: 'potato', name: 'Potato' },
      { id: 'rice', name: 'Rice' },
      { id: 'wheat', name: 'Wheat' },
      { id: 'cotton', name: 'Cotton' },
      { id: 'soybean', name: 'Soyabean' }
    ];
  }

  async getGeographies() {
    return [
      { state_id: 'MH', state_name: 'Maharashtra', districts: [] }
    ];
  }

  async getMarkets(params) {
    return [];
  }

  /**
   * Fetch market prices from data.gov.in and normalize to unified contract
   */
  async getMarketPrices(params = {}) {
    const crop = params.commodity || params.crop || 'Tomato';
    const state = params.state || 'Maharashtra';
    const district = params.district || '';
    const market = params.market || params.mandi || '';
    const dateStr = params.date || '';

    const queryParams = {
      commodity: crop,
      state: state,
      district: district,
      market: market,
      limit: params.limit || 50
    };

    const govRes = await getGovernmentMandiPrices(queryParams);

    if (!govRes || !govRes.success || !Array.isArray(govRes.data) || govRes.data.length === 0) {
      return {
        success: false,
        provider: 'data.gov.in',
        fallback_used: true,
        commodity: crop,
        state: state,
        district: district,
        market: market,
        date: dateStr,
        data_available: false,
        data: [],
        message: govRes ? govRes.message : 'No data available from data.gov.in'
      };
    }

    // Normalize records into unified contract
    const normalizedData = govRes.data.map(rec => {
      const minPrice = Number(rec.minPrice) || 0;
      const maxPrice = Number(rec.maxPrice) || 0;
      const modalPrice = Number(rec.modalPrice) || 0;
      const reportDate = rec.reportDate || rec.arrivalDate || dateStr;

      return {
        provider: 'data.gov.in',
        commodity: rec.commodity || crop,
        state: rec.state || state,
        district: rec.district || district || '',
        market: rec.market || market || '',
        date: reportDate,
        min_price: minPrice,
        max_price: maxPrice,
        modal_price: modalPrice,
        quantity: Number(rec.arrivalVolume) || 0,
        unit: 'quintal',
        currency: 'INR',
        data_available: true,

        // Backward compatibility aliases
        crop: rec.commodity || crop,
        mandi: rec.market || market || '',
        minPrice: minPrice,
        maxPrice: maxPrice,
        modalPrice: modalPrice,
        reportDate: reportDate,
        arrivalDate: reportDate,
        source: rec.source || 'Government of India / AGMARKNET',
        status: rec.status || (govRes.cached ? 'CACHED' : 'LIVE')
      };
    });

    return {
      success: true,
      provider: 'data.gov.in',
      fallback_used: true,
      commodity: crop,
      state: state,
      district: district,
      market: market,
      date: dateStr,
      data_available: true,
      count: normalizedData.length,
      data: normalizedData
    };
  }
}

module.exports = DataGovMarketPriceProvider;
