const fs = require('fs');
const path = require('path');
const i18next = require('../src/i18n.js');
const { evaluateSellVsStore } = require('../server/services/decision.service.js');

console.log('═════════════════════════════════════════════════════════════════════');
console.log('  STEP 10 — TRANSLATE FARMER STORAGE DECISION SYSTEM (TEST SUITE)');
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

// 1. Audit storage.html for all Step 10 Translation Keys
console.log('--- 1. AUDITING STORAGE.HTML FOR DECISION SYSTEM TRANSLATION KEYS ---');
const storageHtmlPath = path.join(__dirname, '..', 'storage.html');
const content = fs.readFileSync(storageHtmlPath, 'utf8');
const i18nMatches = [...content.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
const placeholderMatches = [...content.matchAll(/data-i18n-placeholder="([^"]+)"/g)].map(m => m[1]);
const allHtmlKeys = [...new Set([...i18nMatches, ...placeholderMatches])];

assert(allHtmlKeys.length > 0, `storage.html: Found ${allHtmlKeys.length} translation attributes.`);

['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  let missing = [];
  allHtmlKeys.forEach(k => {
    const val = i18next.t(k);
    if (!val || val === k) {
      missing.push(k);
    }
  });
  assert(missing.length === 0, `storage.html [${lang.toUpperCase()}]: All ${allHtmlKeys.length} keys resolved successfully (missing: ${missing.length})`);
});

// 2. Verify All Required Step 10 Decision Components Across Languages
console.log('\n--- 2. VERIFYING ALL STEP 10 SPECIFIED FIELDS ACROSS EN, HI, MR ---');

const decisionFieldsMap = {
  "Storage Discovery & Facilities": [
    "storage.nearbyStorage", "storage.nearbyWarehouses", "storage.nearbyWarehousesTab",
    "storage.storageMap", "storage.liveMapView",
    "storage.storageList", "storage.availableWarehousesTitle",
    "storage.storageComparison", "storage.compareStorageOptions",
    "storage.verifiedStorage", "storage.verifiedFacility", "storage.verified",
    "storage.distance", "storage.distanceKm", "storage.distanceRadius", "storage.filterRadius",
    "storage.capacity", "storage.totalCapacity", "storage.availableCapacity",
    "storage.storageRate", "storage.storageTariffRate",
    "storage.handlingCharges", "storage.handlingRatePerQuintal", "storage.inOutHandling",
    "storage.supportedCrops", "storage.cropSuitability",
    "storage.estimatedCost", "storage.totalEstimatedCost",
    "storage.requestStorage", "storage.bookStorageSpace",
    "storage.storageDuration", "storage.holdingDuration"
  ],
  "Sell Now vs Store & Sell Later Interface": [
    "storage.sellNowVsStoreLater", "storage.sellNow", "storage.sellNowOption", "ai.optionASellNow",
    "storage.storeAndSellLater", "storage.storeAndHoldOption", "ai.optionBStore",
    "storage.currentPrice", "storage.currentMandiPrice", "storage.currentSpotPrice",
    "storage.projectedPrice", "storage.postStoragePrice",
    "storage.storageCost", "storage.storageRent",
    "storage.handlingCost", "storage.inOutHandling",
    "storage.transportCost", "storage.logisticsCost",
    "storage.estimatedWeightLoss", "storage.weightLossMoisture", "storage.weightLossRisk",
    "storage.expectedGain", "storage.projectedGrossGain",
    "storage.netBenefit", "storage.netFinancialGain", "storage.netGain",
    "storage.recommendation", "storage.aiRecommendation", "storage.recommendedVerdict",
    "storage.reason", "storage.decisionReason", "storage.aiExplanation"
  ]
};

Object.entries(decisionFieldsMap).forEach(([section, keys]) => {
  ['en', 'hi', 'mr'].forEach(lang => {
    i18next.changeLanguage(lang);
    let missingKeys = [];
    keys.forEach(k => {
      const val = i18next.t(k);
      if (!val || val === k) {
        missingKeys.push(k);
      }
    });

    assert(
      missingKeys.length === 0,
      `[${lang.toUpperCase()}] ${section}: All ${keys.length} keys resolved successfully`
    );
  });
});

// 3. Test AI Decision Engine with Multilingual Explanations & Numerical Precision
console.log('\n--- 3. TESTING AI DECISION ENGINE CALCULATION & MULTILINGUAL OUTPUTS ---');

const testCases = [
  { crop: 'wheat', qty: 50, price: 2400, days: 45, facility: { name: 'MSWC Pune Warehouse', storageRate: 38, handlingCharge: 14 } },
  { crop: 'onion', qty: 100, price: 1800, days: 60, facility: { name: 'Sahyadri Agro Cold Chain', storageRate: 65, handlingCharge: 18 } },
  { crop: 'soybean', qty: 80, price: 4200, days: 30, facility: { name: 'Vidarbha Agri Silos', storageRate: 42, handlingCharge: 12 } }
];

testCases.forEach((tc, idx) => {
  const result = evaluateSellVsStore({
    cropName: tc.crop,
    quantity: tc.qty,
    currentPrice: tc.price,
    holdingDays: tc.days,
    storageFacility: tc.facility
  });

  // Calculation assertions (invariant across all languages)
  assert(result.currentPrice === tc.price, `Case ${idx+1} (${tc.crop}): Current price preserved (₹${result.currentPrice})`);
  assert(result.quantity === tc.qty, `Case ${idx+1} (${tc.crop}): Quantity preserved (${result.quantity} q)`);
  assert(result.sellNow.expectedRealization === tc.price * tc.qty, `Case ${idx+1} (${tc.crop}): Sell now realization exact`);
  assert(typeof result.storeAndHold.projectedNetGain === 'number', `Case ${idx+1} (${tc.crop}): Projected net gain calculated`);
  assert(result.recommendation === 'STORE & HOLD' || result.recommendation === 'SELL NOW', `Case ${idx+1} (${tc.crop}): Valid recommendation verdict`);

  // Multilingual Explanations assertions
  ['en', 'hi', 'mr'].forEach(lang => {
    const expl = result.explanations && result.explanations[lang];
    assert(
      typeof expl === 'string' && expl.length > 20,
      `Case ${idx+1} (${tc.crop}) [${lang.toUpperCase()}]: Explanation generated (${expl?.substring(0, 40)}...)`
    );
    assert(
      expl.includes(result.storeAndHold.projectedNetGain.toLocaleString('en-IN')) || expl.includes(result.currentPrice.toLocaleString('en-IN')),
      `Case ${idx+1} (${tc.crop}) [${lang.toUpperCase()}]: Accurate numbers in explanation`
    );
  });
});

// 4. Test UI Presentation Invariants & Translation Strings
console.log('\n--- 4. TESTING PRESENTATION LABELS & RUNTIME TRANSLATION VALUES ---');

['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  
  const currentPriceLbl = i18next.t('storage.currentPrice');
  const projectedPriceLbl = i18next.t('storage.projectedPrice');
  const storageCostLbl = i18next.t('storage.storageCost');
  const handlingCostLbl = i18next.t('storage.handlingCost');
  const weightLossLbl = i18next.t('storage.estimatedWeightLoss');
  const netBenefitLbl = i18next.t('storage.netBenefit');
  const sellNowLbl = i18next.t('storage.sellNow');
  const storeLaterLbl = i18next.t('storage.storeAndSellLater');
  const recLbl = i18next.t('storage.recommendation');

  assert(currentPriceLbl && currentPriceLbl !== 'storage.currentPrice', `[${lang.toUpperCase()}] Current Price: "${currentPriceLbl}"`);
  assert(projectedPriceLbl && projectedPriceLbl !== 'storage.projectedPrice', `[${lang.toUpperCase()}] Projected Price: "${projectedPriceLbl}"`);
  assert(storageCostLbl && storageCostLbl !== 'storage.storageCost', `[${lang.toUpperCase()}] Storage Cost: "${storageCostLbl}"`);
  assert(handlingCostLbl && handlingCostLbl !== 'storage.handlingCost', `[${lang.toUpperCase()}] Handling Cost: "${handlingCostLbl}"`);
  assert(weightLossLbl && weightLossLbl !== 'storage.estimatedWeightLoss', `[${lang.toUpperCase()}] Weight Loss: "${weightLossLbl}"`);
  assert(netBenefitLbl && netBenefitLbl !== 'storage.netBenefit', `[${lang.toUpperCase()}] Net Benefit: "${netBenefitLbl}"`);
  assert(sellNowLbl && sellNowLbl !== 'storage.sellNow', `[${lang.toUpperCase()}] Sell Now: "${sellNowLbl}"`);
  assert(storeLaterLbl && storeLaterLbl !== 'storage.storeAndSellLater', `[${lang.toUpperCase()}] Store & Sell Later: "${storeLaterLbl}"`);
  assert(recLbl && recLbl !== 'storage.recommendation', `[${lang.toUpperCase()}] Recommendation: "${recLbl}"`);
});

// Summary
console.log('\n═════════════════════════════════════════════════════════════════════');
console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log('═════════════════════════════════════════════════════════════════════\n');

if (passedTests === totalTests) {
  console.log('SUCCESS: STEP 10 — Farmer Storage Decision System translated & verified with 100% accuracy in EN, HI, MR!');
  process.exit(0);
} else {
  console.error(`FAILURE: ${totalTests - passedTests} tests failed.`);
  process.exit(1);
}
