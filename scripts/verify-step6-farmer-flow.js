const fs = require('fs');
const path = require('path');
const i18next = require('../src/i18n.js');

console.log('═════════════════════════════════════════════════════════════════════');
console.log('  STEP 6 — TRANSLATE COMPLETE FARMER MODULE (VERIFICATION SUITE)');
console.log('═════════════════════════════════════════════════════════════════════\n');

const farmerPages = [
  'dashboard.html',
  'lots.html',
  'market.html',
  'mandi-compare.html',
  'ai-forecast.html',
  'buyer-inquiries.html',
  'buyers.html',
  'orders.html',
  'storage.html'
];

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

// 1. Check HTML Tagging & Key Resolution
console.log('--- 1. AUDITING FARMER HTML PAGES FOR TRANSLATION KEYS ---');

farmerPages.forEach(page => {
  const filePath = path.join(__dirname, '..', page);
  if (!fs.existsSync(filePath)) {
    assert(false, `File exists: ${page}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract all data-i18n keys
  const i18nMatches = [...content.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
  assert(i18nMatches.length > 0, `${page}: Found ${i18nMatches.length} data-i18n attributes.`);

  // Test that every key in this HTML page resolves in EN, HI, and MR
  ['en', 'hi', 'mr'].forEach(lang => {
    i18next.changeLanguage(lang);
    let missingKeys = [];
    i18nMatches.forEach(k => {
      const val = i18next.t(k);
      if (!val || val === k) {
        missingKeys.push(k);
      }
    });
    assert(missingKeys.length === 0, `${page} [${lang.toUpperCase()}]: All ${i18nMatches.length} keys resolved successfully (missing: ${missingKeys.length})`);
  });
});

// 2. Test All Required Farmer Component Key Categories
console.log('\n--- 2. VERIFYING ALL 19 STEP 6 FARMER COMPONENTS ACROSS LANGUAGES ---');

const componentKeyMap = {
  "Farmer Dashboard": [
    "farmer.greetingMorning", "farmer.makeSmarterDecisions", "farmer.sellYourCrop", 
    "farmer.viewMarketPrices", "farmer.dailyAiAdvice", "farmer.todayMandiPrices", 
    "farmer.activeLotsLabel", "farmer.bestMarketPriceLabel", "farmer.buyerOffersLabel"
  ],
  "Create Crop Lot": [
    "cropLotModal.createLotHeading", "cropLotModal.cropCategory", "cropLotModal.quantityAvailable",
    "cropLotModal.expectedPricePerUnit", "cropLotModal.gradeSelection", "cropLotModal.publishBtn"
  ],
  "My Crop Lots": [
    "farmer.cropListingsTitle", "farmer.cropListingsSubtitle", "farmer.allProduceLotsTab",
    "farmer.onFarmActiveTab", "farmer.storedWarehouseLotsTab", "farmer.myActiveLotsTitle"
  ],
  "Crop Lot Details": [
    "cropLot.viewProduceLot", "cropLot.editProduceLot", "cropLot.deleteProduceLot", "cropLot.pauseProduceLot"
  ],
  "Market": [
    "market.marketOverview", "market.livePricesSubtitle", "market.refreshPrices",
    "market.allCrops", "market.allMandis", "market.commodity", "market.mandiName", "market.modalRate"
  ],
  "Market Comparison": [
    "mandiCompare.compareTitle", "mandiCompare.compareSubtitle", "mandiCompare.bestNetRealization",
    "mandiCompare.lowestTransportCost", "mandiCompare.closestMandi", "mandiCompare.multiMandiMatrix"
  ],
  "Price Trends": [
    "market.priceTrendAnalysis", "market.historicalModalPrice", "market.current", "market.highest", "market.lowest"
  ],
  "AI Recommendation": [
    "ai.forecastEngineTitle", "ai.forecastEngineSubtitle", "ai.aiRecommendationLive",
    "ai.priceRising", "ai.optimalSellingWindow", "ai.decisionVerdict"
  ],
  "Buyer Matching": [
    "farmer.receivedOffersTitle", "farmer.receivedOffersSubtitle", "farmer.browseAllBuyers", "farmer.findBestBuyer"
  ],
  "Offers & Negotiations": [
    "offers.offersTitle", "offers.counterOffer", "offers.offeredRate", "buyer.negotiationTimeline"
  ],
  "Orders & Logistics": [
    "orders.ordersAndFulfillment", "orders.ordersSubtitle", "orders.pending", "orders.confirmed",
    "orders.processing", "orders.pickupReady", "orders.inTransit", "orders.delivered", "orders.cancelled"
  ],
  "Storage": [
    "storage.storageDiscovery", "storage.warehouseColdStorageTitle", "storage.nearbyWarehousesTab",
    "storage.searchFacilities", "storage.allStorageTypes", "storage.warehouse", "storage.coldStorage"
  ],
  "Sell Now vs Store & Hold": [
    "farmer.sellNowVsStore", "storage.sellVsStoreTab", "ai.sellNowVsStoreAnalysis", "ai.optionASellNow", "ai.optionBStore"
  ],
  "Pledge Financing (e-NWR)": [
    "storage.pledgeFinancingTitle", "storage.pledgeFinancingSubtitle", "storage.applyPledgeLoan", "storage.applyForLoan"
  ],
  "Payments": [
    "payments.escrowGuarantee", "payments.instantUpi", "payments.bankTransfer", "payments.paymentMethod"
  ],
  "Notifications": [
    "notifications.notificationsTitle", "notifications.noNotifications"
  ],
  "Profile": [
    "farmer.farmProfile", "farmer.completeFarmProfile", "auth.fullName", "auth.mobileNumber", "common.save"
  ],
  "Help & Kisan Helpline": [
    "farmer.kisanSupportTitle", "farmer.kisanCallCenterTollFree", "farmer.availableHours", "navigation.help"
  ]
};

['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  console.log(`\n=== Language: [${lang.toUpperCase()}] ===`);
  for (const [comp, keys] of Object.entries(componentKeyMap)) {
    let resolved = true;
    keys.forEach(k => {
      const val = i18next.t(k);
      if (!val || val === k) resolved = false;
    });
    assert(resolved, `Component [${comp}] — ${keys.length} keys validated.`);
  }
});

// 3. Print sample translated farmer statements
console.log('\n--- 3. SAMPLE FARMER USER INTERFACE TRANSLATIONS ---');
['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  console.log(`[${lang.toUpperCase()}]`);
  console.log(`  Hero: ${i18next.t('farmer.greetingMorning')} Rajesh! ${i18next.t('farmer.makeSmarterDecisions')} KrishiShetra.`);
  console.log(`  CTA 1: ${i18next.t('farmer.sellYourCrop')}`);
  console.log(`  CTA 2: ${i18next.t('farmer.viewMarketPrices')}`);
  console.log(`  Storage: ${i18next.t('storage.storageDiscovery')} — ${i18next.t('storage.distressSellingPrevention')}`);
  console.log(`  Decision: ${i18next.t('ai.recommendationStoreHold')} (${i18next.t('ai.optionBStore')})`);
  console.log(`  Orders: ${i18next.t('orders.ordersAndFulfillment')} [${i18next.t('orders.inTransit')}]`);
  console.log(`  Helpline: ${i18next.t('farmer.kisanSupportTitle')} -> ${i18next.t('farmer.kisanCallCenterTollFree')}`);
  console.log('');
});

console.log('═════════════════════════════════════════════════════════════════════');
console.log(`  STEP 6 RESULTS: ${passedTests} / ${totalTests} CHECKS PASSED`);
console.log('═════════════════════════════════════════════════════════════════════\n');

if (passedTests === totalTests) {
  console.log('>>> COMPLETE FARMER MODULE TRANSLATION STEP 6 COMPLETE! <<<');
  process.exit(0);
} else {
  console.error('>>> STEP 6 HAD FAILURES <<<');
  process.exit(1);
}
