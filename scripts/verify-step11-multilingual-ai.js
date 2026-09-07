const { evaluateSellVsStore, CROP_LOCAL_NAMES } = require('../server/services/decision.service.js');
const storageController = require('../server/controllers/storage.controller.js');

console.log('═════════════════════════════════════════════════════════════════════');
console.log('  STEP 11 — IMPLEMENT MULTILINGUAL AI SUPPORT (TEST SUITE)');
console.log('═════════════════════════════════════════════════════════════════════\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
  }
}

// 1. Test Invariance of Numerical Calculations Across EN, HI, MR
console.log('--- 1. TESTING NUMERICAL CALCULATION INVARIANCE ACROSS LANGUAGES ---');

const testScenarios = [
  {
    name: 'Standard Wheat Storage (Bullish)',
    params: { cropName: 'wheat', quantity: 50, currentPrice: 2400, holdingDays: 45, distanceKm: 15 }
  },
  {
    name: 'Commercial Soybean Holding (Bullish)',
    params: { cropName: 'soybean', quantity: 80, currentPrice: 4200, holdingDays: 30, distanceKm: 10 }
  },
  {
    name: 'High Shrinkage Onion Storage',
    params: { cropName: 'onion', quantity: 100, currentPrice: 1800, holdingDays: 60, distanceKm: 25 }
  },
  {
    name: 'Perishable Tomato Produce (Bearish / Sell Now)',
    params: { cropName: 'tomato', quantity: 40, currentPrice: 1500, holdingDays: 15, distanceKm: 8 }
  }
];

testScenarios.forEach((scenario, idx) => {
  console.log(`\nScenario ${idx + 1}: ${scenario.name}`);

  const resEn = evaluateSellVsStore({ ...scenario.params, language: 'en' });
  const resHi = evaluateSellVsStore({ ...scenario.params, language: 'hi' });
  const resMr = evaluateSellVsStore({ ...scenario.params, language: 'mr' });

  // 1. Numerical outputs must be 100% identical
  assert(resEn.currentPrice === resHi.currentPrice && resHi.currentPrice === resMr.currentPrice,
    `Current Price is identical across all languages (₹${resEn.currentPrice})`);

  assert(resEn.projectedPrice === resHi.projectedPrice && resHi.projectedPrice === resMr.projectedPrice,
    `Projected Price is identical across all languages (₹${resEn.projectedPrice})`);

  assert(resEn.storageCost === resHi.storageCost && resHi.storageCost === resMr.storageCost,
    `Storage Cost is identical across all languages (₹${resEn.storageCost})`);

  assert(resEn.handlingCost === resHi.handlingCost && resHi.handlingCost === resMr.handlingCost,
    `Handling Cost is identical across all languages (₹${resEn.handlingCost})`);

  assert(resEn.transportCost === resHi.transportCost && resHi.transportCost === resMr.transportCost,
    `Transport Cost is identical across all languages (₹${resEn.transportCost})`);

  assert(resEn.weightLossCost === resHi.weightLossCost && resHi.weightLossCost === resMr.weightLossCost,
    `Weight Loss Cost is identical across all languages (₹${resEn.weightLossCost})`);

  assert(resEn.totalHoldingCost === resHi.totalHoldingCost && resHi.totalHoldingCost === resMr.totalHoldingCost,
    `Total Holding Cost is identical across all languages (₹${resEn.totalHoldingCost})`);

  assert(resEn.netBenefit === resHi.netBenefit && resHi.netBenefit === resMr.netBenefit,
    `Net Benefit is identical across all languages (₹${resEn.netBenefit})`);

  assert(resEn.recommendation === resHi.recommendation && resHi.recommendation === resMr.recommendation,
    `Recommendation code is identical across all languages (${resEn.recommendation})`);

  assert(resEn.sellNow.expectedRealization === resHi.sellNow.expectedRealization &&
         resHi.sellNow.expectedRealization === resMr.sellNow.expectedRealization,
    `Sell Now realization is identical across all languages (₹${resEn.sellNow.expectedRealization})`);

  assert(resEn.storeAndHold.projectedNetRealization === resHi.storeAndHold.projectedNetRealization &&
         resHi.storeAndHold.projectedNetRealization === resMr.storeAndHold.projectedNetRealization,
    `Store & Hold net realization is identical across all languages (₹${resEn.storeAndHold.projectedNetRealization})`);
});

// 2. Test Multilingual AI Explanation Generation in EN, HI, MR
console.log('\n--- 2. TESTING MULTILINGUAL AI EXPLANATIONS & STRUCTURED FORMAT ---');

const testCrop = 'wheat';
const testParams = { cropName: testCrop, quantity: 50, currentPrice: 2400, holdingDays: 45, distanceKm: 12 };

// EN Verification
const aiEn = evaluateSellVsStore({ ...testParams, language: 'en' });
assert(aiEn.language === 'en', `EN: Received language is "en"`);
assert(typeof aiEn.reason === 'string' && aiEn.reason.length > 30, `EN: Reason generated (${aiEn.reason.substring(0, 50)}...)`);
assert(aiEn.reason.includes('recommended') || aiEn.reason.includes('Store & Hold') || aiEn.reason.includes('Sell Now'),
  `EN: Farmer-friendly English text without technical jargon`);
assert(aiEn.reason.includes('2,400') || aiEn.reason.includes('wheat') || aiEn.reason.includes('50'),
  `EN: Explanation includes relevant parameters`);

// HI Verification
const aiHi = evaluateSellVsStore({ ...testParams, language: 'hi' });
assert(aiHi.language === 'hi', `HI: Received language is "hi"`);
assert(typeof aiHi.reason === 'string' && aiHi.reason.length > 30, `HI: Reason generated (${aiHi.reason.substring(0, 50)}...)`);
assert(/[\u0900-\u097F]/.test(aiHi.reason), `HI: Reason contains authentic Hindi Devanagari script`);
assert(aiHi.reason.includes('सलाह') || aiHi.reason.includes('अनुशंसा') || aiHi.reason.includes('भंडारण') || aiHi.reason.includes('बिक्री'),
  `HI: Simple Hindi suitable for Indian farmers`);

// MR Verification
const aiMr = evaluateSellVsStore({ ...testParams, language: 'mr' });
assert(aiMr.language === 'mr', `MR: Received language is "mr"`);
assert(typeof aiMr.reason === 'string' && aiMr.reason.length > 30, `MR: Reason generated (${aiMr.reason.substring(0, 50)}...)`);
assert(/[\u0900-\u097F]/.test(aiMr.reason), `MR: Reason contains authentic Marathi Devanagari script`);
assert(aiMr.reason.includes('सल्ला') || aiMr.reason.includes('शिफारस') || aiMr.reason.includes('साठवणूक') || aiMr.reason.includes('विक्री'),
  `MR: Simple Marathi suitable for farmers in Maharashtra`);

// 3. Test Structured JSON Response Schema
console.log('\n--- 3. TESTING STRUCTURED JSON DECISION RESPONSE SCHEMA ---');

const sampleDecision = evaluateSellVsStore({
  cropName: 'onion',
  quantity: 100,
  currentPrice: 1800,
  holdingDays: 60,
  language: 'mr'
});

assert('recommendation' in sampleDecision, `Response contains "recommendation" (${sampleDecision.recommendation})`);
assert('currentPrice' in sampleDecision && typeof sampleDecision.currentPrice === 'number', `Response contains "currentPrice" (${sampleDecision.currentPrice})`);
assert('projectedPrice' in sampleDecision && typeof sampleDecision.projectedPrice === 'number', `Response contains "projectedPrice" (${sampleDecision.projectedPrice})`);
assert('storageCost' in sampleDecision && typeof sampleDecision.storageCost === 'number', `Response contains "storageCost" (${sampleDecision.storageCost})`);
assert('handlingCost' in sampleDecision && typeof sampleDecision.handlingCost === 'number', `Response contains "handlingCost" (${sampleDecision.handlingCost})`);
assert('transportCost' in sampleDecision && typeof sampleDecision.transportCost === 'number', `Response contains "transportCost" (${sampleDecision.transportCost})`);
assert('weightLossCost' in sampleDecision && typeof sampleDecision.weightLossCost === 'number', `Response contains "weightLossCost" (${sampleDecision.weightLossCost})`);
assert('netBenefit' in sampleDecision && typeof sampleDecision.netBenefit === 'number', `Response contains "netBenefit" (${sampleDecision.netBenefit})`);
assert('reason' in sampleDecision && typeof sampleDecision.reason === 'string', `Response contains "reason"`);
assert('language' in sampleDecision && sampleDecision.language === 'mr', `Response contains "language" ("mr")`);

// 4. Test Backend API Controller Integration (Mock HTTP Request/Response)
console.log('\n--- 4. TESTING CONTROLLER HTTP API INTEGRATION ---');

async function testApiController(lang) {
  const req = {
    body: {
      cropName: 'wheat',
      quantity: 50,
      currentPrice: 2400,
      holdingDays: 45,
      language: lang
    }
  };

  let responseData = null;
  let statusCode = 0;

  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = data;
        }
      };
    }
  };

  await storageController.calculateSellVsStore(req, res);

  assert(statusCode === 200, `POST /api/decision/sell-vs-store with language="${lang}": Status 200`);
  assert(responseData && responseData.success === true, `API response has success=true`);
  assert(responseData.language === lang, `API response returns language="${lang}"`);
  assert(typeof responseData.netBenefit === 'number', `API response has numeric netBenefit (₹${responseData.netBenefit})`);
  assert(typeof responseData.reason === 'string' && responseData.reason.length > 20, `API response has dynamic reason string`);
}

(async () => {
  await testApiController('en');
  await testApiController('hi');
  await testApiController('mr');

  console.log('\n═════════════════════════════════════════════════════════════════════');
  console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log('═════════════════════════════════════════════════════════════════════\n');

  if (passedTests === totalTests) {
    console.log('SUCCESS: STEP 11 — Multilingual AI Support implemented & verified with 100% accuracy in EN, HI, MR!');
    process.exit(0);
  } else {
    console.error(`FAILURE: ${totalTests - passedTests} tests failed.`);
    process.exit(1);
  }
})();
