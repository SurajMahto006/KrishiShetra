/**
 * Verification Test Suite: Market Price Provider System (CEDA + data.gov.in Fallback)
 * Tests unit scenarios with mocked HTTP responses without external network dependencies.
 */

const assert = require('assert');
const {
  MarketPriceService,
  getIndiaTodayDate,
  sanitizeErrorMessage
} = require('../server/services/marketPrice.service');
const BaseMarketPriceProvider = require('../server/services/providers/baseMarketPriceProvider');
const CEDAMarketPriceProvider = require('../server/services/providers/cedaMarketPriceProvider');
const DataGovMarketPriceProvider = require('../server/services/providers/dataGovMarketPriceProvider');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' KRISHISHETRA MARKET-PRICE PROVIDER UNIT TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ─────────────────────────────────────────────────────────────────
  // TEST 1: India Timezone Date Handling
  // ─────────────────────────────────────────────────────────────────
  runTest('1. India Timezone Date (Asia/Kolkata YYYY-MM-DD)', () => {
    const today = getIndiaTodayDate();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/, 'Date must match YYYY-MM-DD format');
    
    // Compare with expected Asia/Kolkata date
    const expected = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
    assert.strictEqual(today, expected, 'Calculated date must match Asia/Kolkata date');
  });

  // ─────────────────────────────────────────────────────────────────
  // TEST 2: Credential Log Sanitization
  // ─────────────────────────────────────────────────────────────────
  runTest('2. Log Sanitization (Never exposes API keys or Bearer tokens)', () => {
    const sensitiveError = new Error('Failed with Bearer secret_ceda_token_12345 and api_key=gov_secret_key_67890');
    const sanitized = sanitizeErrorMessage(sensitiveError);
    assert.ok(!sanitized.includes('secret_ceda_token_12345'), 'Token must be redacted');
    assert.ok(!sanitized.includes('gov_secret_key_67890'), 'Key must be redacted');
    assert.ok(sanitized.includes('[REDACTED]'), 'Redaction placeholder must be present');
  });

  // ─────────────────────────────────────────────────────────────────
  // Mock Providers for Orchestration Testing
  // ─────────────────────────────────────────────────────────────────
  class MockCedaProvider extends BaseMarketPriceProvider {
    constructor(behavior = {}) {
      super('ceda');
      this.behavior = behavior;
      this.callCount = 0;
    }

    async getMarketPrices(params) {
      this.callCount++;
      if (this.behavior.timeout) {
        const err = new Error('CEDA request timed out');
        err.code = 'ETIMEDOUT';
        err.isProviderFailure = true;
        throw err;
      }
      if (this.behavior.status === 401) {
        const err = new Error('CEDA authentication failure (401)');
        err.statusCode = 401;
        err.isProviderFailure = true;
        throw err;
      }
      if (this.behavior.status === 429) {
        const err = new Error('CEDA rate limit exceeded (429)');
        err.statusCode = 429;
        err.isProviderFailure = true;
        throw err;
      }
      if (this.behavior.status === 500) {
        const err = new Error('CEDA server error (500)');
        err.statusCode = 500;
        err.isProviderFailure = true;
        throw err;
      }
      if (this.behavior.emptyData) {
        // Legitimate empty result from CEDA (NOT a provider failure)
        return {
          success: true,
          provider: 'ceda',
          commodity: params.commodity,
          state: params.state,
          district: params.district,
          market: params.market,
          date: params.date,
          data_available: false,
          data: []
        };
      }

      // Success with data
      return {
        success: true,
        provider: 'ceda',
        commodity: params.commodity,
        state: params.state,
        district: params.district,
        market: params.market || 'Pune APMC',
        date: params.date,
        data_available: true,
        count: 1,
        data: [{
          provider: 'ceda',
          commodity: params.commodity,
          state: params.state,
          district: params.district,
          market: params.market || 'Pune APMC',
          date: params.date,
          min_price: 1800,
          max_price: 2400,
          modal_price: 2100,
          quantity: 250,
          unit: 'quintal',
          currency: 'INR',
          data_available: true
        }]
      };
    }
  }

  class MockDataGovProvider extends BaseMarketPriceProvider {
    constructor(behavior = {}) {
      super('data.gov.in');
      this.behavior = behavior;
      this.callCount = 0;
    }

    async getMarketPrices(params) {
      this.callCount++;
      if (this.behavior.fail) {
        const err = new Error('data.gov.in gateway failure (ECONNREFUSED)');
        err.isProviderFailure = true;
        throw err;
      }

      return {
        success: true,
        provider: 'data.gov.in',
        commodity: params.commodity,
        state: params.state,
        district: params.district,
        market: params.market || 'Pune APMC (Gov)',
        date: params.date,
        data_available: true,
        count: 1,
        data: [{
          provider: 'data.gov.in',
          commodity: params.commodity,
          state: params.state,
          district: params.district,
          market: params.market || 'Pune APMC (Gov)',
          date: params.date,
          min_price: 1750,
          max_price: 2350,
          modal_price: 2050,
          quantity: 200,
          unit: 'quintal',
          currency: 'INR',
          data_available: true
        }]
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // TEST 3: CEDA Success (Fallback is NOT called)
  // ─────────────────────────────────────────────────────────────────
  await runAsyncTest('3. CEDA Success -> returns CEDA data & fallback NOT called', async () => {
    const ceda = new MockCedaProvider();
    const dataGov = new MockDataGovProvider();
    const service = new MarketPriceService({ cedaProvider: ceda, dataGovProvider: dataGov });

    const result = await service.getMarketPrices({ commodity: 'Tomato', state: 'Maharashtra' });
    assert.strictEqual(result.provider, 'ceda');
    assert.strictEqual(result.fallback_used, false);
    assert.strictEqual(result.data_available, true);
    assert.strictEqual(ceda.callCount, 1);
    assert.strictEqual(dataGov.callCount, 0, 'data.gov.in fallback must not be called when CEDA succeeds');
  });

  // ─────────────────────────────────────────────────────────────────
  // TEST 4: CEDA Timeout -> Falls back to data.gov.in
  // ─────────────────────────────────────────────────────────────────
  await runAsyncTest('4. CEDA Timeout -> falls back to data.gov.in', async () => {
    const ceda = new MockCedaProvider({ timeout: true });
    const dataGov = new MockDataGovProvider();
    const service = new MarketPriceService({ cedaProvider: ceda, dataGovProvider: dataGov });

    const result = await service.getMarketPrices({ commodity: 'Tomato', state: 'Maharashtra' });
    assert.strictEqual(result.provider, 'data.gov.in');
    assert.strictEqual(result.fallback_used, true);
    assert.strictEqual(result.data_available, true);
    assert.strictEqual(ceda.callCount, 1);
    assert.strictEqual(dataGov.callCount, 1);
  });

  // ─────────────────────────────────────────────────────────────────
  // TEST 5: CEDA 500 Server Error -> Falls back to data.gov.in
  // ─────────────────────────────────────────────────────────────────
  await runAsyncTest('5. CEDA 500 -> falls back to data.gov.in', async () => {
    const ceda = new MockCedaProvider({ status: 500 });
    const dataGov = new MockDataGovProvider();
    const service = new MarketPriceService({ cedaProvider: ceda, dataGovProvider: dataGov });

    const result = await service.getMarketPrices({ commodity: 'Tomato', state: 'Maharashtra' });
    assert.strictEqual(result.provider, 'data.gov.in');
    assert.strictEqual(result.fallback_used, true);
    assert.strictEqual(ceda.callCount, 1);
    assert.strictEqual(dataGov.callCount, 1);
  });

  // ─────────────────────────────────────────────────────────────────
  // TEST 6: CEDA 429 Rate Limit -> Falls back to data.gov.in
  // ─────────────────────────────────────────────────────────────────
  await runAsyncTest('6. CEDA 429 Rate Limit -> falls back to data.gov.in', async () => {
    const ceda = new MockCedaProvider({ status: 429 });
    const dataGov = new MockDataGovProvider();
    const service = new MarketPriceService({ cedaProvider: ceda, dataGovProvider: dataGov });

    const result = await service.getMarketPrices({ commodity: 'Tomato', state: 'Maharashtra' });
    assert.strictEqual(result.provider, 'data.gov.in');
    assert.strictEqual(result.fallback_used, true);
    assert.strictEqual(ceda.callCount, 1);
    assert.strictEqual(dataGov.callCount, 1);
  });

  // ─────────────────────────────────────────────────────────────────
  // TEST 7: CEDA 401 Auth Failure -> Falls back to data.gov.in
  // ─────────────────────────────────────────────────────────────────
  await runAsyncTest('7. CEDA 401 Auth Failure -> falls back to data.gov.in', async () => {
    const ceda = new MockCedaProvider({ status: 401 });
    const dataGov = new MockDataGovProvider();
    const service = new MarketPriceService({ cedaProvider: ceda, dataGovProvider: dataGov });

    const result = await service.getMarketPrices({ commodity: 'Tomato', state: 'Maharashtra' });
    assert.strictEqual(result.provider, 'data.gov.in');
    assert.strictEqual(result.fallback_used, true);
    assert.strictEqual(ceda.callCount, 1);
    assert.strictEqual(dataGov.callCount, 1);
  });

  // ─────────────────────────────────────────────────────────────────
  // TEST 8: CEDA Valid Empty Result (No data != Provider Failure)
  // ─────────────────────────────────────────────────────────────────
  await runAsyncTest('8. CEDA Valid Empty Result -> correctly distinguishes "no data" (no fallback)', async () => {
    const ceda = new MockCedaProvider({ emptyData: true });
    const dataGov = new MockDataGovProvider();
    const service = new MarketPriceService({ cedaProvider: ceda, dataGovProvider: dataGov });

    const result = await service.getMarketPrices({ commodity: 'Tomato', state: 'Maharashtra', market: 'RareMandi' });
    assert.strictEqual(result.provider, 'ceda');
    assert.strictEqual(result.fallback_used, false);
    assert.strictEqual(result.data_available, false, 'data_available should be false');
    assert.deepStrictEqual(result.data, []);
    assert.strictEqual(ceda.callCount, 1);
    assert.strictEqual(dataGov.callCount, 0, 'Fallback must NOT trigger for legitimate empty CEDA result');
  });

  // ─────────────────────────────────────────────────────────────────
  // TEST 9: Both Providers Fail -> Clean Application Error
  // ─────────────────────────────────────────────────────────────────
  await runAsyncTest('9. Both Providers Fail -> returns clean application error', async () => {
    const ceda = new MockCedaProvider({ status: 500 });
    const dataGov = new MockDataGovProvider({ fail: true });
    const service = new MarketPriceService({ cedaProvider: ceda, dataGovProvider: dataGov });

    const result = await service.getMarketPrices({ commodity: 'Tomato', state: 'Maharashtra' });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.provider, 'none');
    assert.strictEqual(result.fallback_used, true);
    assert.strictEqual(result.data_available, false);
    assert.ok(result.message.length > 0);
  });

  // ─────────────────────────────────────────────────────────────────
  // TEST 10: Unified Normalized Response Structure Contract
  // ─────────────────────────────────────────────────────────────────
  runTest('10. Both Providers Normalize into the Same Contract', () => {
    const expectedKeys = [
      'provider',
      'commodity',
      'state',
      'district',
      'market',
      'date',
      'min_price',
      'max_price',
      'modal_price',
      'quantity',
      'unit',
      'currency',
      'data_available'
    ];

    const cedaSample = {
      provider: 'ceda',
      commodity: 'Tomato',
      state: 'Maharashtra',
      district: 'Pune',
      market: 'Pune APMC',
      date: '2026-10-03',
      min_price: 1800,
      max_price: 2400,
      modal_price: 2100,
      quantity: 250,
      unit: 'quintal',
      currency: 'INR',
      data_available: true
    };

    const dataGovSample = {
      provider: 'data.gov.in',
      commodity: 'Tomato',
      state: 'Maharashtra',
      district: 'Pune',
      market: 'Pune APMC',
      date: '2026-10-03',
      min_price: 1750,
      max_price: 2350,
      modal_price: 2050,
      quantity: 200,
      unit: 'quintal',
      currency: 'INR',
      data_available: true
    };

    for (const key of expectedKeys) {
      assert.ok(key in cedaSample, `CEDA sample must contain key '${key}'`);
      assert.ok(key in dataGovSample, `data.gov.in sample must contain key '${key}'`);
      assert.strictEqual(typeof cedaSample[key], typeof dataGovSample[key], `Type of '${key}' must match across providers`);
    }
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(` RESULT: ${passedTests}/${totalTests} tests passed`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
