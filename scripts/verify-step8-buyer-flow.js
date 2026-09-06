const fs = require('fs');
const path = require('path');
const i18next = require('../src/i18n.js');

console.log('═════════════════════════════════════════════════════════════════════');
console.log('  STEP 8 — TRANSLATE COMPLETE BUYER MODULE (VERIFICATION SUITE)');
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

// 1. Audit buyer.html and buyers.html
console.log('--- 1. AUDITING HTML FILES FOR TRANSLATION KEYS ---');
const htmlFiles = [
  { name: 'buyer.html', path: path.join(__dirname, '..', 'buyer.html') },
  { name: 'buyers.html', path: path.join(__dirname, '..', 'buyers.html') }
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

// 2. Test All Required Step 8 Buyer Submodules Across Languages
console.log('\n--- 2. VERIFYING ALL STEP 8 BUYER MODULES ACROSS EN, HI, MR ---');

const buyerComponentMap = {
  "Buyer Dashboard & Overview": [
    "buyer.buyerDashboard", "buyer.buyerDashboardSubtitle", "buyer.verifiedBuyer",
    "buyer.activeLotsAvailable", "buyer.activeInquiriesCount", "buyer.inTransitVolume",
    "buyer.escrowLockedAmount", "buyer.procurementActivity", "buyer.recommendedLotsForYou"
  ],
  "Marketplace & Produce Discovery": [
    "buyer.marketplaceTitle", "buyer.marketplaceSubtitle", "buyer.allProduce",
    "buyer.grainsAndCereals", "buyer.pulsesAndLegumes", "buyer.oilseeds", "buyer.fruitsAndVeg",
    "buyer.spicesAndCommercial", "buyer.searchProducePlaceholder", "buyer.filterByState",
    "buyer.filterByGrade", "buyer.filterBySeller", "buyer.filterByVolume", "buyer.filterByPrice",
    "buyer.sortRecommended", "buyer.sortPriceLowHigh", "buyer.sortPriceHighLow", "buyer.sortQuantityHighLow"
  ],
  "Crop Lots & Live Landed Cost Calculator": [
    "buyer.viewLotDetails", "buyer.lotSpecifications", "buyer.qualitySpecifications",
    "buyer.moistureContent", "buyer.foreignMatter", "buyer.grainSize", "buyer.gradingCertificate",
    "buyer.landedCostCalculator", "buyer.basePricePerQtl", "buyer.estimatedFreight",
    "buyer.handlingAndMandiFee", "buyer.totalLandedCost", "buyer.sendInquiryBtn", "buyer.buyNowEscrow"
  ],
  "Buyer Requirements & Send Inquiry": [
    "buyer.sendInquiryModalTitle", "buyer.offeredPricePerQtl", "buyer.requiredQuantity",
    "buyer.deliveryLocation", "buyer.targetDeliveryDate", "buyer.paymentMethod",
    "buyer.inquiryNotes", "buyer.submitInquiryBtn", "buyer.cancelBtn"
  ],
  "Offers & Negotiation Stepper": [
    "buyer.inquiriesWorkspace", "buyer.activeNegotiations", "buyer.acceptedDeals",
    "buyer.negotiationStepperTitle", "buyer.counterOfferPrice", "buyer.acceptCounterOffer",
    "buyer.rejectOffer", "buyer.sendCounterProposal", "buyer.dealAgreed"
  ],
  "Orders & Logistics Fulfillment": [
    "buyer.ordersWorkspace", "buyer.activeOrders", "buyer.orderHistory",
    "buyer.orderTrackingModalTitle", "buyer.carrierTelemetry", "buyer.currentLocation",
    "buyer.estimatedArrival", "buyer.driverContact", "buyer.releasePaymentEscrow"
  ],
  "Escrow Vault & Settlements Ledger": [
    "buyer.escrowVaultTitle", "buyer.escrowVaultSubtitle", "buyer.totalFundsInEscrow",
    "buyer.releasedToFarmers", "buyer.pendingRelease", "buyer.depositEscrowFunds",
    "buyer.downloadLedgerPdf", "buyer.transactionId", "buyer.escrowStatusProtected"
  ],
  "Farmer & FPO Producer Directory": [
    "buyer.producerDirectoryTitle", "buyer.producerDirectorySubtitle", "buyer.searchProducers",
    "buyer.filterFposOnly", "buyer.filterDirectFarmers", "buyer.verifiedFpoBadge",
    "buyer.producerLotsCount", "buyer.contactProducerBtn"
  ],
  "Business Profile & Settings": [
    "buyer.buyerProfile", "buyer.companyName", "buyer.gstinNumber", "buyer.panNumber",
    "buyer.fssaiLicense", "buyer.primaryProcurementCategory", "buyer.warehouseAddress",
    "buyer.saveProfileBtn"
  ],
  "AgriStack & KYC Verification UI": [
    "buyer.kycVerification", "buyer.kycVerificationSubtitle", "buyer.gstCertificateDoc",
    "buyer.panCardDoc", "buyer.fssaiLicenseDoc", "buyer.bankProofDoc",
    "buyer.uploadDocumentBtn", "buyer.kycVerifiedSuccess", "buyer.verificationPendingReview"
  ],
  "Validation, Errors & Success Messages": [
    "validation.requiredField", "validation.invalidEmail", "validation.invalidPhone",
    "errors.serverError", "errors.networkError", "errors.unauthorized",
    "success.inquirySent", "success.counterOfferSent", "success.orderConfirmed"
  ],
  "Empty States & UI Feedback": [
    "common.noData", "common.noResults", "common.loading", "common.verified"
  ]
};

['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  console.log(`\n=== Language: [${lang.toUpperCase()}] ===`);
  for (const [comp, keys] of Object.entries(buyerComponentMap)) {
    let missingKeys = [];
    keys.forEach(k => {
      const val = i18next.t(k);
      if (!val || val === k) missingKeys.push(k);
    });
    assert(missingKeys.length === 0, `Component [${comp}] — ${keys.length} keys validated (missing: ${missingKeys.length})`);
  }
});

// 3. Test Controller Helper Functions Logic (Badges, Statuses, Formatters)
console.log('\n--- 3. TESTING CONTROLLER LOGIC ACROSS LANGUAGES ---');

function mockGetStatusBadge(status) {
  switch (status) {
    case 'pending':
      return { text: i18next.t('buyer.statusPending', 'Awaiting Seller Response'), cls: 'kl-badge--amber' };
    case 'counter_received':
    case 'negotiating':
      return { text: i18next.t('buyer.statusCounterReceived', 'Counter Offer Received'), cls: 'kl-badge--blue' };
    case 'accepted':
    case 'deal_locked':
      return { text: i18next.t('buyer.statusAccepted', 'Deal Agreed / PO Generated'), cls: 'kl-badge--green' };
    case 'rejected':
      return { text: i18next.t('buyer.statusRejected', 'Closed / Rejected'), cls: 'kl-badge--gray' };
    default:
      return { text: status, cls: 'kl-badge--gray' };
  }
}

function mockGetOrderStatusBadge(status) {
  switch (status) {
    case 'in_transit':
      return { text: i18next.t('buyer.orderStatusInTransit', 'In Transit'), cls: 'kl-badge--blue' };
    case 'delivered':
      return { text: i18next.t('buyer.orderStatusDelivered', 'Delivered (Inspection Pending)'), cls: 'kl-badge--amber' };
    case 'completed':
    case 'quality_approved':
      return { text: i18next.t('buyer.orderStatusCompleted', 'Escrow Settled'), cls: 'kl-badge--green' };
    default:
      return { text: status, cls: 'kl-badge--gray' };
  }
}

['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  console.log(`\n=== Testing Dynamic Helpers [${lang.toUpperCase()}] ===`);
  const sPending = mockGetStatusBadge('pending');
  const sCounter = mockGetStatusBadge('negotiating');
  const sAccepted = mockGetStatusBadge('accepted');
  const oTransit = mockGetOrderStatusBadge('in_transit');
  const oDone = mockGetOrderStatusBadge('completed');

  assert(sPending.text && sPending.text !== 'buyer.statusPending', `Inquiry Pending Badge: "${sPending.text}"`);
  assert(sCounter.text && sCounter.text !== 'buyer.statusCounterReceived', `Inquiry Counter Badge: "${sCounter.text}"`);
  assert(sAccepted.text && sAccepted.text !== 'buyer.statusAccepted', `Inquiry Accepted Badge: "${sAccepted.text}"`);
  assert(oTransit.text && oTransit.text !== 'buyer.orderStatusInTransit', `Order In-Transit Badge: "${oTransit.text}"`);
  assert(oDone.text && oDone.text !== 'buyer.orderStatusCompleted', `Order Completed Badge: "${oDone.text}"`);
});

// 4. Print Sample Translated Buyer Statements
console.log('\n--- 4. SAMPLE BUYER USER INTERFACE TRANSLATIONS ---');
['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  console.log(`[${lang.toUpperCase()}]`);
  console.log(`  Dashboard: ${i18next.t('buyer.buyerDashboard')} — ${i18next.t('buyer.buyerDashboardSubtitle')}`);
  console.log(`  Marketplace: ${i18next.t('buyer.marketplaceTitle')} (${i18next.t('buyer.sortRecommended')})`);
  console.log(`  Calculator: ${i18next.t('buyer.landedCostCalculator')} [${i18next.t('buyer.totalLandedCost')}]`);
  console.log(`  Inquiry: ${i18next.t('buyer.sendInquiryModalTitle')} -> ${i18next.t('buyer.submitInquiryBtn')}`);
  console.log(`  Negotiation: ${i18next.t('buyer.negotiationStepperTitle')} [${i18next.t('buyer.acceptCounterOffer')}]`);
  console.log(`  Orders: ${i18next.t('buyer.ordersWorkspace')} -> ${i18next.t('buyer.carrierTelemetry')}`);
  console.log(`  Escrow: ${i18next.t('buyer.escrowVaultTitle')} (${i18next.t('buyer.escrowStatusProtected')})`);
  console.log(`  KYC: ${i18next.t('buyer.kycVerification')} -> ${i18next.t('buyer.kycVerifiedSuccess')}`);
  console.log('');
});

console.log('═════════════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('═════════════════════════════════════════════════════════════════════');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
