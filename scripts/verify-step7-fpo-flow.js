const fs = require('fs');
const path = require('path');
const i18next = require('../src/i18n.js');

console.log('═════════════════════════════════════════════════════════════════════');
console.log('  STEP 7 — TRANSLATE COMPLETE FPO MODULE (VERIFICATION SUITE)');
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

// 1. Audit fpo-dashboard.html
console.log('--- 1. AUDITING FPO-DASHBOARD.HTML FOR TRANSLATION KEYS ---');
const fpoHtmlPath = path.join(__dirname, '..', 'fpo-dashboard.html');
const content = fs.readFileSync(fpoHtmlPath, 'utf8');

const i18nMatches = [...content.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
const placeholderMatches = [...content.matchAll(/data-i18n-placeholder="([^"]+)"/g)].map(m => m[1]);
const allHtmlKeys = [...new Set([...i18nMatches, ...placeholderMatches])];

assert(allHtmlKeys.length > 0, `fpo-dashboard.html: Found ${allHtmlKeys.length} translation attributes.`);

['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  let missing = [];
  allHtmlKeys.forEach(k => {
    const val = i18next.t(k);
    if (!val || val === k) {
      missing.push(k);
    }
  });
  assert(missing.length === 0, `fpo-dashboard.html [${lang.toUpperCase()}]: All ${allHtmlKeys.length} keys resolved successfully (missing: ${missing.length})`);
});

// 2. Test All Required Step 7 FPO Components Across Languages
console.log('\n--- 2. VERIFYING ALL STEP 7 FPO COMPONENTS ACROSS EN, HI, MR ---');

const fpoComponentMap = {
  "FPO Dashboard & Hero": [
    "fpo.fpoCommandCenter", "fpo.fpoHeroSubtitle", "fpo.fpoName",
    "fpo.location", "fpo.registeredFarmers", "fpo.totalProduceAggregated",
    "fpo.activeBuyers", "fpo.liveSync"
  ],
  "Summary KPI Cards": [
    "fpo.farmersCountLabel", "fpo.aggregatedProduceLabel", "fpo.activeLotsCountLabel", "fpo.buyerOffersCountLabel"
  ],
  "Farmer Members Roster": [
    "fpo.farmerMembersTitle", "fpo.farmerMembersSubtitle", "fpo.addFarmerBtn",
    "fpo.viewAllFarmersBtn", "fpo.farmerNameTh", "fpo.cropTh", "fpo.quantityTh", "fpo.lotStatusTh"
  ],
  "Add Farmer Member": [
    "fpo.addFarmerModalTitle", "fpo.farmerFullNameLabel", "fpo.villageTalukaLabel",
    "fpo.phoneNumberLabel", "fpo.cropContributionLabel", "fpo.quantityInputLabel", "fpo.saveFarmerRecordBtn"
  ],
  "Aggregated Lots & Bulk Selling": [
    "fpo.aggregatedLotsTitle", "fpo.aggregatedLotsSubtitle", "fpo.createNewLotBtn",
    "fpo.totalVolumeLabel", "fpo.contributorsLabel", "fpo.basePriceLabel", "fpo.viewLotBtn", "fpo.findBuyersBtn"
  ],
  "Market Intelligence": [
    "fpo.marketIntelligenceTitle", "fpo.marketIntelligenceSubtitle", "fpo.priceTrendsTitle",
    "fpo.priceTrendsSubtitle", "fpo.fpoPremiumBadge", "fpo.collectiveSellingOpportunity", "fpo.viewAiForecastBtn"
  ],
  "Verified Buyer Offers": [
    "fpo.verifiedBuyerOffersTitle", "fpo.verifiedBuyerOffersSubtitle", "fpo.compareOffersBtn",
    "fpo.offeredPriceLabel", "fpo.deliveryTermsLabel", "fpo.paymentTermsLabel", "fpo.viewOfferBtn", "fpo.acceptOfferBtn"
  ],
  "Orders & Logistics Fulfillment": [
    "fpo.ordersAndLogisticsTitle", "fpo.ordersAndLogisticsSubtitle", "fpo.activeShipmentBadge",
    "fpo.buyerConfirmedStep", "fpo.transportAssignedStep", "fpo.pickupInProgressStep", "fpo.callDriverBtn", "fpo.trackLiveBtn"
  ],
  "Dispatch Telemetry": [
    "fpo.dispatchTelemetryTitle", "fpo.netWeighbridgeWeightLabel", "fpo.ewayBillStatusLabel",
    "fpo.estimatedTransitTimeLabel", "fpo.escrowPayoutLabel"
  ],
  "FPO Performance Analytics": [
    "fpo.performanceAnalyticsTitle", "fpo.performanceAnalyticsSubtitle", "fpo.exportPdfReportBtn",
    "fpo.totalFarmersOnboardedLabel", "fpo.totalProduceSoldLabel", "fpo.averageSellingPriceLabel",
    "fpo.revenueGeneratedLabel", "fpo.priceImprovementLabel"
  ],
  "FPO Profile & Settings": [
    "fpo.fpoOrganizationProfile", "fpo.memberFarmersDirectory", "fpo.buyerContractsAndOrders", "common.logout"
  ]
};

['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  console.log(`\n=== Language: [${lang.toUpperCase()}] ===`);
  for (const [comp, keys] of Object.entries(fpoComponentMap)) {
    let resolved = true;
    keys.forEach(k => {
      const val = i18next.t(k);
      if (!val || val === k) resolved = false;
    });
    assert(resolved, `Component [${comp}] — ${keys.length} keys validated.`);
  }
});

// 3. Print Sample Translated FPO Statements
console.log('\n--- 3. SAMPLE FPO USER INTERFACE TRANSLATIONS ---');
['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  console.log(`[${lang.toUpperCase()}]`);
  console.log(`  Hero: ${i18next.t('fpo.fpoCommandCenter')} — ${i18next.t('fpo.fpoHeroSubtitle')}`);
  console.log(`  Farmers Roster: ${i18next.t('fpo.farmerMembersTitle')} (${i18next.t('fpo.addFarmerBtn')})`);
  console.log(`  Aggregated Lots: ${i18next.t('fpo.aggregatedLotsTitle')} — ${i18next.t('fpo.createNewLotBtn')}`);
  console.log(`  Market Intelligence: ${i18next.t('fpo.marketIntelligenceTitle')} [${i18next.t('fpo.fpoPremiumBadge')}]`);
  console.log(`  Buyer Offers: ${i18next.t('fpo.verifiedBuyerOffersTitle')} -> ${i18next.t('fpo.acceptOfferBtn')}`);
  console.log(`  Logistics: ${i18next.t('fpo.ordersAndLogisticsTitle')} [${i18next.t('fpo.activeShipmentBadge')}]`);
  console.log(`  Analytics: ${i18next.t('fpo.performanceAnalyticsTitle')} -> ${i18next.t('fpo.priceImprovementLabel')}`);
  console.log('');
});

console.log('═════════════════════════════════════════════════════════════════════');
console.log(`  STEP 7 RESULTS: ${passedTests} / ${totalTests} CHECKS PASSED`);
console.log('═════════════════════════════════════════════════════════════════════\n');

if (passedTests === totalTests) {
  console.log('>>> COMPLETE FPO MODULE TRANSLATION STEP 7 COMPLETE! <<<\n');
  process.exit(0);
} else {
  console.error('>>> STEP 7 HAD FAILURES <<<\n');
  process.exit(1);
}
