/**
 * Base Market Price Provider Interface
 * All concrete providers (CEDA, data.gov.in) must implement this interface.
 */
class BaseMarketPriceProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Get commodities supported by provider
   * @returns {Promise<Array<{ id: number|string, name: string }>>}
   */
  async getCommodities() {
    throw new Error('getCommodities() must be implemented by provider');
  }

  /**
   * Get geographies (states & districts) supported by provider
   * @returns {Promise<Array<{ state_id: number|string, state_name: string, districts: Array }>>}
   */
  async getGeographies() {
    throw new Error('getGeographies() must be implemented by provider');
  }

  /**
   * Get markets for given commodity, state, district
   * @param {Object} params
   * @returns {Promise<Array<{ market_id: number|string, market_name: string }>>}
   */
  async getMarkets(params) {
    throw new Error('getMarkets() must be implemented by provider');
  }

  /**
   * Get unified market prices
   * @param {Object} params - { commodity, state, district, market, date }
   * @returns {Promise<{ success: boolean, provider: string, data: Array, isProviderFailure?: boolean }>}
   */
  async getMarketPrices(params) {
    throw new Error('getMarketPrices() must be implemented by provider');
  }
}

module.exports = BaseMarketPriceProvider;
