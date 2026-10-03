/**
 * Live test of CEDA Agmarknet API integration using the configured CEDA_API_KEY
 * SECURITY: Never logs or prints the API key.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const CEDAMarketPriceProvider = require('../server/services/providers/cedaMarketPriceProvider');
const { marketPriceService, getIndiaTodayDate } = require('../server/services/marketPrice.service');

async function testLiveCeda() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' TESTING LIVE CEDA AGMARKNET API INTEGRATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const apiKeyConfigured = Boolean(process.env.CEDA_API_KEY && process.env.CEDA_API_KEY.trim());
  console.log('API Key configured in .env:', apiKeyConfigured ? 'YES (Protected)' : 'NO');
  if (!apiKeyConfigured) {
    console.error('ERROR: CEDA_API_KEY is not set or empty in .env');
    return;
  }

  const provider = new CEDAMarketPriceProvider({ timeoutMs: 15000 });
  const today = getIndiaTodayDate();
  console.log(`Current India Date (Asia/Kolkata): ${today}\n`);

  // ─────────────────────────────────────────────────────────────────
  // STEP 1: GET /agmarknet/commodities
  // ─────────────────────────────────────────────────────────────────
  console.log('--- STEP 1: GET /agmarknet/commodities ---');
  let tomatoId = null;
  const rawComm = await provider._request('/agmarknet/commodities');
  const commList = (rawComm.output && rawComm.output.data) ? rawComm.output.data : [];
  console.log(`✓ Total commodities: ${commList.length}`);
  const tomatoObj = commList.find(c => c.commodity_name.toLowerCase() === 'tomato');
  console.log('Tomato object:', tomatoObj);
  tomatoId = tomatoObj ? tomatoObj.commodity_id : 78;

  console.log('\n--- STEP 2: GET /agmarknet/geographies ---');
  const rawGeo = await provider._request('/agmarknet/geographies');
  const geoList = (rawGeo.output && rawGeo.output.data) ? rawGeo.output.data : [];
  console.log(`✓ Total geo rows: ${geoList.length}`);
  const mhRows = geoList.filter(g => g.census_state_name.toLowerCase().includes('maharashtra'));
  console.log(`✓ Maharashtra rows: ${mhRows.length}`);
  if (mhRows.length > 0) {
    console.log('Sample Maharashtra row:', mhRows[0]);
    console.log('Unique Maharashtra districts count:', [...new Set(mhRows.map(m => m.census_district_name))].length);
    console.log('Districts sample:', [...new Set(mhRows.map(m => `${m.census_district_name} (ID: ${m.census_district_id})`))].slice(0, 10));
  }

  // ─────────────────────────────────────────────────────────────────
  // STEP 3: Provider getMarketPrices for Today (Maharashtra, Pune, Tomato)
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- STEP 3: Provider getMarketPrices for Today (Tomato, Maharashtra, Pune) ---');
  try {
    const todayRes = await provider.getMarketPrices({
      commodity: 'Tomato',
      state: 'Maharashtra',
      district: 'Pune',
      date: today
    });
    console.log('Today query result:');
    console.log(`- Success: ${todayRes.success}`);
    console.log(`- Provider: ${todayRes.provider}`);
    console.log(`- Data Available: ${todayRes.data_available}`);
    console.log(`- Records count: ${(todayRes.data || []).length}`);
    if (todayRes.data && todayRes.data.length > 0) {
      console.log('First Record:', todayRes.data[0]);
    }
  } catch (err) {
    console.error('Error on today price request:', err.message);
  }

  // ─────────────────────────────────────────────────────────────────
  // STEP 4: Provider getMarketPrices with Historical Date to Verify Normalization
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- STEP 4: Provider getMarketPrices with Historical Date (2023-05-01) ---');
  try {
    const histRes = await provider.getMarketPrices({
      commodity: 'Tomato',
      state: 'Maharashtra',
      district: 'Pune',
      date: '2023-05-01'
    });
    console.log('Historical query result:');
    console.log(`- Success: ${histRes.success}`);
    console.log(`- Provider: ${histRes.provider}`);
    console.log(`- Data Available: ${histRes.data_available}`);
    console.log(`- Records count: ${(histRes.data || []).length}`);
    if (histRes.data && histRes.data.length > 0) {
      console.log('First Normalized Live Record:');
      console.log(JSON.stringify(histRes.data[0], null, 2));
    }
  } catch (err) {
    console.error('Error on historical price request:', err.message);
  }

  // ─────────────────────────────────────────────────────────────────
  // STEP 5: Full Unified MarketPriceService Flow
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- STEP 5: Full Unified MarketPriceService Flow (Tomato, Maharashtra) ---');
  try {
    const serviceRes = await marketPriceService.getMarketPrices({
      commodity: 'Tomato',
      state: 'Maharashtra'
    });
    console.log('Service result:');
    console.log(`- Success: ${serviceRes.success}`);
    console.log(`- Provider used: ${serviceRes.provider}`);
    console.log(`- Fallback used: ${serviceRes.fallback_used}`);
    console.log(`- Data Available: ${serviceRes.data_available}`);
    console.log(`- Total records: ${(serviceRes.data || []).length}`);
    if (serviceRes.data && serviceRes.data.length > 0) {
      console.log('\nFirst Normalized Record:');
      console.log(JSON.stringify(serviceRes.data[0], null, 2));
    }
  } catch (err) {
    console.error('✗ Failed in STEP 5:', err.message);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(' LIVE TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
}

testLiveCeda().catch(console.error);
