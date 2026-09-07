const fs = require('fs');
const path = require('path');
const i18next = require('../src/i18n.js');

console.log('═════════════════════════════════════════════════════════════════════');
console.log('  STEP 9 — TRANSLATE STORAGE OWNER MODULE (VERIFICATION SUITE)');
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

// 1. Audit HTML Files for Storage Owner & Storage Discovery
console.log('--- 1. AUDITING HTML FILES FOR STORAGE TRANSLATION KEYS ---');
const htmlFiles = [
  { name: 'storage.html', path: path.join(__dirname, '..', 'storage.html') },
  { name: 'admin/storage.html', path: path.join(__dirname, '..', 'admin', 'storage.html') },
  { name: 'register.html', path: path.join(__dirname, '..', 'register.html') }
];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file.path, 'utf8');
  const i18nMatches = [...content.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
  const placeholderMatches = [...content.matchAll(/data-i18n-placeholder="([^"]+)"/g)].map(m => m[1]);
  const titleMatches = [...content.matchAll(/data-i18n-title="([^"]+)"/g)].map(m => m[1]);
  const allHtmlKeys = [...new Set([...i18nMatches, ...placeholderMatches, ...titleMatches])];

  assert(allHtmlKeys.length > 0, `${file.name}: Found ${allHtmlKeys.length} translation attributes.`);

  ['en', 'hi', 'mr'].forEach(lang => {
    i18next.changeLanguage(lang);
    let missing = [];
    allHtmlKeys.forEach(k => {
      const val = i18next.t(k);
      if (!val || val === k) {
        missing.push(k);
      }
    });
    assert(missing.length === 0, `${file.name} [${lang.toUpperCase()}]: All ${allHtmlKeys.length} keys resolved successfully (missing: ${missing.length})`);
  });
});

// 2. Verify All Required Step 9 Storage Submodules Across Languages
console.log('\n--- 2. VERIFYING ALL STEP 9 STORAGE MODULES ACROSS EN, HI, MR ---');

const storageComponentMap = {
  "REGISTRATION": [
    "storage.storageOwnerRegistration", "storage.registerAsStorageOwner",
    "storage.ownerName", "storage.ownerNamePlaceholder",
    "storage.facilityName", "storage.facilityNamePlaceholder",
    "storage.facilityType", "storage.facilityTypeSelect",
    "storage.warehouse", "storage.coldStorage", "storage.silo", "storage.dryStorage", "storage.hermeticStorage",
    "storage.address", "storage.addressLine1", "storage.district", "storage.state", "storage.taluka", "storage.pincode", "storage.landmark",
    "storage.location", "storage.latitude", "storage.longitude", "storage.gpsCoordinates", "storage.useCurrentLocation",
    "storage.capacity", "storage.totalCapacity", "storage.availableCapacity", "storage.capacityUnit", "storage.metricTonnes", "storage.quintals", "storage.bags",
    "storage.storageRate", "storage.storageRateUnit", "storage.perBagMonth", "storage.perQuintalMonth", "storage.perTonMonth", "storage.perDayQuintal",
    "storage.handlingCharges", "storage.handlingRatePerQuintal",
    "storage.supportedCrops",
    "storage.facilityFeatures", "storage.temperatureControlled", "storage.cctvSecurity", "storage.pestManagement", "storage.weighbridgeOnsite", "storage.assayingLab", "storage.eNwrReady",
    "storage.submitFacility", "storage.addStorageFacilityModalTitle", "storage.editStorageFacilityModalTitle"
  ],
  "DASHBOARD": [
    "storage.storageDashboardTitle", "storage.storageDashboardSubtitle",
    "storage.totalStorageCapacity", "storage.availableStorageSpace", "storage.occupiedCapacity",
    "storage.storageRequests", "storage.activeStorage", "storage.completedStorage",
    "storage.facilityStatus", "storage.averageUtilization", "storage.activeSpaceBookings", "storage.accreditedFacilities",
    "storage.operational", "storage.full", "storage.underMaintenance", "storage.closed",
    "storage.liveCapacityTracking", "storage.activeStorageFacilities"
  ],
  "VERIFICATION": [
    "storage.pendingVerification", "storage.verified", "storage.rejected", "storage.suspended",
    "storage.accreditation", "storage.accreditationType", "storage.wdraAccredited", "storage.mswcAccredited", "storage.cwcAccredited", "storage.fssaiCertified", "storage.apmcLicensed"
  ],
  "REQUEST MANAGEMENT": [
    "storage.newRequest", "storage.incomingRequests",
    "storage.accept", "storage.acceptRequest",
    "storage.reject", "storage.rejectRequest",
    "storage.active", "storage.completed", "storage.cancelled", "storage.requested", "storage.pendingConfirmation",
    "storage.warehouseReceiptNumber", "storage.farmerName", "storage.depositStartDate", "storage.depositEndDate", "storage.durationDays", "storage.farmerNotes", "storage.requestDetails"
  ],
  "BUTTONS & ACTIONS": [
    "storage.addFacilityBtn", "storage.bookSpaceBtn", "storage.applyPledgeBtn", "storage.navigateBtn",
    "storage.viewDetailsBtn", "storage.filterResetBtn", "storage.recalculateBtn", "storage.listenVerdictBtn", "storage.stopVerdictBtn",
    "storage.chooseFacility", "storage.selected", "storage.bookStorage", "storage.pledgeLoan", "storage.farmerStorageView"
  ],
  "TABLES & METRICS": [
    "storage.tableName", "storage.tableType", "storage.tableLocation", "storage.tableCapacity",
    "storage.tableTariff", "storage.tableAccreditation", "storage.tableStatus", "storage.tableActions",
    "storage.monthlyStorageTariff", "storage.handlingAndUnloading", "storage.totalHoldingCosts", "storage.projectedNetGain", "storage.netRealizationHeading", "storage.freeSpaceMetric"
  ],
  "EMPTY STATES": [
    "storage.noFacilitiesFoundTitle", "storage.noFacilitiesFoundDesc",
    "storage.noBookingsTitle", "storage.noBookingsDesc",
    "storage.noPledgeRequestsTitle", "storage.noPledgeRequestsDesc",
    "storage.noRequestsTitle", "storage.noRequestsDesc"
  ],
  "VALIDATION": [
    "validation.facilityNameRequired", "validation.ownerNameRequired", "validation.facilityTypeRequired",
    "validation.totalCapacityRequired", "validation.availableCapacityRequired", "validation.storageRateRequired",
    "validation.districtRequired", "validation.stateRequired", "validation.cropRequired", "validation.durationRequired",
    "validation.capacityExceeded", "validation.quantityRequired", "validation.positiveNumberRequired"
  ],
  "ERRORS": [
    "errors.facilityCreateFailed", "errors.facilityUpdateFailed", "errors.facilityNotFound",
    "errors.requestAcceptFailed", "errors.requestRejectFailed", "errors.bookingFailed", "errors.pledgeFailed", "errors.storageDataLoadFailed"
  ],
  "SUCCESS": [
    "success.facilityCreated", "success.facilityUpdated", "success.requestAccepted",
    "success.requestRejected", "success.requestCancelled", "success.bookingSubmitted", "success.pledgeApplied", "success.storageLanguageUpdated"
  ]
};

Object.entries(storageComponentMap).forEach(([componentName, keys]) => {
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
      `[${lang.toUpperCase()}] ${componentName}: All ${keys.length} keys resolved successfully`
    );

    if (missingKeys.length > 0) {
      console.error(`       Missing in ${lang}:`, missingKeys);
    }
  });
});

// 3. Dynamic UI Translation Functionality Test (Mock storage.js runtime)
console.log('\n--- 3. TESTING DYNAMIC RUNTIME TRANSLATION SIMULATION ---');

['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  
  // Test dynamic facility card rendering strings
  const coldStorageLabel = i18next.t('storage.coldStorage');
  const warehouseLabel = i18next.t('storage.warehouse');
  const perBagMonthLabel = i18next.t('storage.perBagMonth');
  const bookSpaceLabel = i18next.t('storage.bookSpaceBtn');
  const applyPledgeLabel = i18next.t('storage.applyPledgeBtn');
  const reqAcceptedMsg = i18next.t('success.requestAccepted');
  const reqRejectedMsg = i18next.t('success.requestRejected');

  assert(coldStorageLabel && coldStorageLabel !== 'storage.coldStorage', `[${lang.toUpperCase()}] Dynamic Cold Storage label: "${coldStorageLabel}"`);
  assert(warehouseLabel && warehouseLabel !== 'storage.warehouse', `[${lang.toUpperCase()}] Dynamic Warehouse label: "${warehouseLabel}"`);
  assert(perBagMonthLabel && perBagMonthLabel !== 'storage.perBagMonth', `[${lang.toUpperCase()}] Dynamic Tariff unit: "${perBagMonthLabel}"`);
  assert(bookSpaceLabel && bookSpaceLabel !== 'storage.bookSpaceBtn', `[${lang.toUpperCase()}] Dynamic Action button: "${bookSpaceLabel}"`);
  assert(applyPledgeLabel && applyPledgeLabel !== 'storage.applyPledgeBtn', `[${lang.toUpperCase()}] Dynamic Pledge button: "${applyPledgeLabel}"`);
  assert(reqAcceptedMsg && reqAcceptedMsg !== 'success.requestAccepted', `[${lang.toUpperCase()}] Dynamic Request accepted msg: "${reqAcceptedMsg}"`);
  assert(reqRejectedMsg && reqRejectedMsg !== 'success.requestRejected', `[${lang.toUpperCase()}] Dynamic Request rejected msg: "${reqRejectedMsg}"`);
});

// Summary
console.log('\n═════════════════════════════════════════════════════════════════════');
console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log('═════════════════════════════════════════════════════════════════════\n');

if (passedTests === totalTests) {
  console.log('SUCCESS: STEP 9 — Complete Storage Owner Module translated and verified with 100% accuracy in EN, HI, MR!');
  process.exit(0);
} else {
  console.error(`FAILURE: ${totalTests - passedTests} tests failed.`);
  process.exit(1);
}
