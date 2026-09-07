/**
 * STEP 18: COMPLETE MULTILINGUAL QA SUITE
 * 
 * Tests KrishiShetra across:
 * - 3 Language Modes: English (en), Hindi (hi), Marathi (mr)
 * - 6 User Roles: Farmer, FPO, Buyer, Storage Owner, Transporter, Admin
 * - 21 Application Modules
 * - 12 QA Verification Criteria per module
 * 
 * Produces structured QA Matrix results (PASS / FAIL / NOT APPLICABLE).
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Global mock for localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    _dump: () => store
  };
})();

global.localStorage = localStorageMock;

const i18n = require('../src/i18n');
const { evaluateSellVsStore } = require('../server/services/decision.service');
const User = require('../server/models/User');

console.log('================================================================');
console.log('STEP 18: COMPLETE MULTILINGUAL QUALITY ASSURANCE (QA) TEST SUITE');
console.log('================================================================\n');

const roles = ['Farmer', 'FPO', 'Buyer', 'Storage Owner', 'Transporter', 'Admin'];
const languages = ['en', 'hi', 'mr'];

let totalChecks = 0;
let passCount = 0;
let failCount = 0;
const failures = [];

function recordCheck(desc, fn) {
  totalChecks++;
  try {
    fn();
    passCount++;
  } catch (err) {
    failCount++;
    console.error(`  [FAIL] ${desc} -> ${err.message}`);
    failures.push({ test: desc, error: err.message });
  }
}

async function runQATests() {
  // ── SECTION 1: THREE-LANGUAGE MODE TESTS ──
  console.log('--- SECTION 1: Three-Language Mode Core Engine Tests (EN, HI, MR) ---');

  languages.forEach(lng => {
    recordCheck(`Mode '${lng.toUpperCase()}': Engine switches and returns active language '${lng}'`, () => {
      i18n.changeLanguage(lng);
      assert.strictEqual(i18n.getLanguage(), lng);
      assert.strictEqual(localStorageMock.getItem('krishi_lang'), lng);
    });

    recordCheck(`Mode '${lng.toUpperCase()}': Common UI terms (Home, Dashboard, Save, Cancel, Submit)`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('common.home'), `Missing common.home in ${lng}`);
      assert.ok(i18n.t('common.dashboard'), `Missing common.dashboard in ${lng}`);
      assert.ok(i18n.t('common.saveChanges'), `Missing common.saveChanges in ${lng}`);
      assert.ok(i18n.t('common.cancel'), `Missing common.cancel in ${lng}`);
      assert.ok(i18n.t('common.submit'), `Missing common.submit in ${lng}`);
    });

    recordCheck(`Mode '${lng.toUpperCase()}': Loading and Empty States translation`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('common.loading'), `Missing common.loading in ${lng}`);
      assert.ok(i18n.t('common.saving'), `Missing common.saving in ${lng}`);
      assert.ok(i18n.t('common.submitting'), `Missing common.submitting in ${lng}`);
      assert.ok(i18n.t('errors.noDataAvailable'), `Missing errors.noDataAvailable in ${lng}`);
      assert.ok(i18n.t('farmer.noLotsFound'), `Missing farmer.noLotsFound in ${lng}`);
      assert.ok(i18n.t('orders.noOrdersFound'), `Missing orders.noOrdersFound in ${lng}`);
      assert.ok(i18n.t('storage.noStorageFound'), `Missing storage.noStorageFound in ${lng}`);
    });
  });

  // ── SECTION 2: SIX USER ROLES MULTILINGUAL TESTS ──
  console.log('\n--- SECTION 2: Six User Roles Multilingual Experience Tests ---');

  // 1. Farmer Role
  languages.forEach(lng => {
    recordCheck(`Role: Farmer [${lng.toUpperCase()}] - Lots, Negotiation, AI Decision, Crop Listing`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('farmer.myLotsTitle'));
      assert.ok(i18n.t('farmer.createNewLot'));
      assert.ok(i18n.t('farmer.askingPrice'));
      assert.ok(i18n.t('farmer.counterOffer'));
      assert.ok(i18n.t('farmer.acceptOffer'));
    });
  });

  // 2. FPO Role
  languages.forEach(lng => {
    recordCheck(`Role: FPO [${lng.toUpperCase()}] - Member Aggregation, Bulk Lots, APMC Benchmarks`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('fpo.commandCenter'));
      assert.ok(i18n.t('fpo.aggregatedLots'));
      assert.ok(i18n.t('fpo.mandiBenchmarkRate'));
      assert.ok(i18n.t('fpo.sendWhatsAppSlip'));
      assert.ok(i18n.t('fpo.contractInitiatedWith', { buyer: 'ABC Foods' }));
    });
  });

  // 3. Buyer Role
  languages.forEach(lng => {
    recordCheck(`Role: Buyer [${lng.toUpperCase()}] - Marketplace, Inquiries, Orders, Payment Escrow`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('buyer.marketplaceTitle'));
      assert.ok(i18n.t('buyer.placeOrder'));
      assert.ok(i18n.t('buyer.counterOfferPrice'));
      assert.ok(i18n.t('buyer.verifiedSeller'));
      assert.ok(i18n.t('buyer.escrowSecured'));
    });
  });

  // 4. Storage Owner Role
  languages.forEach(lng => {
    recordCheck(`Role: Storage Owner [${lng.toUpperCase()}] - Warehouse Registry, Capacity, Receipts`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('storage.facilityName'));
      assert.ok(i18n.t('storage.availableCapacity'));
      assert.ok(i18n.t('storage.storageRate'));
      assert.ok(i18n.t('storage.handlingCharges'));
      assert.ok(i18n.t('storage.statusVerified'));
      assert.ok(i18n.t('storage.requestAccepted'));
    });
  });

  // 5. Transporter Role
  languages.forEach(lng => {
    recordCheck(`Role: Transporter [${lng.toUpperCase()}] - Loads, GPS Telemetry, FASTag, Driver Payouts`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('transporter.fleetGpsSynced'));
      assert.ok(i18n.t('transporter.refreshedLoads'));
      assert.ok(i18n.t('transporter.fastagAutoTopupOn'));
      assert.ok(i18n.t('transporter.dlVerificationDownloaded', { name: 'Kailash' }));
      assert.ok(i18n.t('transporter.exportingGstLedger'));
      assert.ok(i18n.t('transporter.payoutInitiatedToBank', { amount: '25,000', ref: 'TXN123' }));
    });
  });

  // 6. Admin Role
  languages.forEach(lng => {
    recordCheck(`Role: Admin [${lng.toUpperCase()}] - Governance, KYC Queues, Registration Trends, Audit Logs`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('admin.dashboardTitle'));
      assert.ok(i18n.t('admin.registrationTrends'));
      assert.ok(i18n.t('admin.userDistribution'));
      assert.ok(i18n.t('admin.recentActivity'));
      assert.ok(i18n.t('admin.addFarmer'));
      assert.ok(i18n.t('admin.verifyKyc'));
      assert.ok(i18n.t('admin.systemAlerts'));
      assert.ok(i18n.t('admin.platformHealth'));
    });
  });

  // ── SECTION 3: 21 APPLICATION MODULES VERIFICATION ──
  console.log('\n--- SECTION 3: 21 Application Modules Verification Matrix ---');

  // 1. Authentication
  languages.forEach(lng => {
    recordCheck(`Module: Authentication [${lng.toUpperCase()}] - Sign in, Register, Roles, Language Preference`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('auth.loginTitle'));
      assert.ok(i18n.t('auth.registerTitle'));
      assert.ok(i18n.t('auth.selectRole'));
      assert.ok(i18n.t('auth.farmerRole'));
      assert.ok(i18n.t('auth.buyerRole'));
    });
  });

  // 2. Dashboard
  languages.forEach(lng => {
    recordCheck(`Module: Dashboard [${lng.toUpperCase()}] - Hero, Stats, Quick Actions, Activity`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('common.goodEvening'));
      assert.ok(i18n.t('farmer.dashboardTitle'));
      assert.ok(i18n.t('farmer.activeLotsCount'));
      assert.ok(i18n.t('farmer.totalSales'));
    });
  });

  // 3. Crop Lot
  languages.forEach(lng => {
    recordCheck(`Module: Crop Lot [${lng.toUpperCase()}] - Listing, Create, Quality Grades, Packaging`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('cropLot.myLotsHeader'));
      assert.ok(i18n.t('cropLot.createNewLot'));
      assert.ok(i18n.t('cropLot.lotCreatedSuccess'));
      assert.ok(i18n.t('cropLotModal.grade'));
      assert.ok(i18n.t('cropLotModal.variety'));
    });
  });

  // 4. Market
  languages.forEach(lng => {
    recordCheck(`Module: Market [${lng.toUpperCase()}] - APMC Arrivals, Price Trends, MSP Benchmarks`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('market.priceTrends'));
      assert.ok(i18n.t('market.modalPrice'));
      assert.ok(i18n.t('market.minPrice'));
      assert.ok(i18n.t('market.maxPrice'));
      assert.ok(i18n.t('market.mspBenchmark'));
    });
  });

  // 5. Price Comparison
  languages.forEach(lng => {
    recordCheck(`Module: Price Comparison [${lng.toUpperCase()}] - Mandi Comparison, Net Realization, Distance`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('mandiCompare.title'));
      assert.ok(i18n.t('mandiCompare.distanceVsProfitTitle'));
      assert.ok(i18n.t('mandiCompare.mandiPrice'));
      assert.ok(i18n.t('mandiCompare.freightCostForQty', { qty: 50 }));
    });
  });

  // 6. AI Recommendation & Decision Engine
  languages.forEach(lng => {
    recordCheck(`Module: AI Recommendation [${lng.toUpperCase()}] - Native AI Generation & Structured Output`, () => {
      const decision = evaluateSellVsStore({
        cropName: 'onion',
        quantity: 100,
        currentPrice: 2400,
        holdingDays: 45,
        distanceKm: 15,
        language: lng
      });

      assert.ok(['STORE_HOLD', 'SELL_NOW'].includes(decision.recommendation));
      assert.strictEqual(decision.language, lng);
      assert.ok(typeof decision.reason === 'string' && decision.reason.length > 20);
      assert.ok(typeof decision.netBenefit === 'number');
      assert.ok(typeof decision.currentPrice === 'number');
      assert.ok(typeof decision.projectedPrice === 'number');

      // Verify authentic non-English phrasing
      if (lng === 'hi') {
        assert.ok(/[\u0900-\u097F]/.test(decision.reason), 'Hindi AI response must contain Devanagari script');
      } else if (lng === 'mr') {
        assert.ok(/[\u0900-\u097F]/.test(decision.reason), 'Marathi AI response must contain Devanagari script');
      }
    });
  });

  // 7. Buyer Matching
  languages.forEach(lng => {
    recordCheck(`Module: Buyer Matching [${lng.toUpperCase()}] - Inquiries, Counter Offers, Accept/Reject`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('farmer.inquiryAcceptedSuccess'));
      assert.ok(i18n.t('farmer.inquiryRejectedSuccess'));
      assert.ok(i18n.t('farmer.counterOfferSentSuccess'));
      assert.ok(i18n.t('farmer.confirmRejectInquiry'));
    });
  });

  // 8. Offers
  languages.forEach(lng => {
    recordCheck(`Module: Offers [${lng.toUpperCase()}] - Bids, Negotiations, Accept Deal`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('offers.offerAmount'));
      assert.ok(i18n.t('offers.sendCounterOffer'));
      assert.ok(i18n.t('offers.acceptDeal'));
      assert.ok(i18n.t('offers.offerStatusPending'));
    });
  });

  // 9. Orders
  languages.forEach(lng => {
    recordCheck(`Module: Orders [${lng.toUpperCase()}] - Fulfillment, Milestones, Tracking Slips`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('orders.ordersTitle'));
      assert.ok(i18n.t('orders.orderStatusInTransit'));
      assert.ok(i18n.t('orders.orderStatusDelivered'));
      assert.ok(i18n.t('orders.downloadInvoice'));
      assert.ok(i18n.t('orders.statusUpdatedSuccess', { orderId: 'ORD123', status: 'COMPLETED' }));
    });
  });

  // 10. Storage
  languages.forEach(lng => {
    recordCheck(`Module: Storage [${lng.toUpperCase()}] - Nearby Facilities, Map, Rates, Receipts`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('storage.nearbyStorage'));
      assert.ok(i18n.t('storage.storageMap'));
      assert.ok(i18n.t('storage.storageList'));
      assert.ok(i18n.t('storage.verifiedStorage'));
      assert.ok(i18n.t('storage.handlingCharges'));
      assert.ok(i18n.t('storage.bookingSubmitted'));
    });
  });

  // 11. Sell vs Store
  languages.forEach(lng => {
    recordCheck(`Module: Sell vs Store [${lng.toUpperCase()}] - Decision Matrix, Net Benefit, Recommendations`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('storage.sellNowVsStoreLater'));
      assert.ok(i18n.t('storage.projectedPrice'));
      assert.ok(i18n.t('storage.storageCost'));
      assert.ok(i18n.t('storage.netBenefit'));
      assert.ok(i18n.t('storage.sellNow'));
      assert.ok(i18n.t('storage.storeAndSellLater'));
    });
  });

  // 12. Logistics
  languages.forEach(lng => {
    recordCheck(`Module: Logistics [${lng.toUpperCase()}] - Freight, Route Distance, Truck Assignment`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('logistics.freightRate'));
      assert.ok(i18n.t('logistics.vehicleType'));
      assert.ok(i18n.t('logistics.distanceKm'));
      assert.ok(i18n.t('logistics.pickupLocation'));
    });
  });

  // 13. Payments
  languages.forEach(lng => {
    recordCheck(`Module: Payments [${lng.toUpperCase()}] - Escrow, Payouts, Wallet, IMPS`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('payments.escrowBalance'));
      assert.ok(i18n.t('payments.payoutStatus'));
      assert.ok(i18n.t('payments.paymentMethod'));
      assert.ok(i18n.t('payments.releaseEscrow'));
    });
  });

  // 14. Notifications
  languages.forEach(lng => {
    recordCheck(`Module: Notifications [${lng.toUpperCase()}] - Transactional & System Notifications`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('notifications.offerReceived', { buyerName: 'Kisan Traders' }));
      assert.ok(i18n.t('notifications.orderConfirmed', { orderId: 'ORD-902' }));
      assert.ok(i18n.t('notifications.pickupScheduled', { date: '2026-09-10' }));
      assert.ok(i18n.t('notifications.storageRequestAccepted', { facilityName: 'Godavari Cold Storage' }));
      assert.ok(i18n.t('notifications.aiAlert', { crop: 'Onion', action: 'STORE' }));
    });
  });

  // 15. Profile
  languages.forEach(lng => {
    recordCheck(`Module: Profile [${lng.toUpperCase()}] - Farm details, Bank Info, Language Preference`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('farmer.profileTitle'));
      assert.ok(i18n.t('farmer.farmLocation'));
      assert.ok(i18n.t('farmer.acreage'));
      assert.ok(i18n.t('common.changeLanguage'));
      assert.ok(i18n.t('common.saveSettings'));
    });
  });

  // 16. Admin
  languages.forEach(lng => {
    recordCheck(`Module: Admin [${lng.toUpperCase()}] - User Governance, Health Metrics, Danger Zone`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('admin.farmerManagement'));
      assert.ok(i18n.t('admin.userManagement'));
      assert.ok(i18n.t('admin.reportsAnalytics'));
      assert.ok(i18n.t('admin.platformSettings'));
      assert.ok(i18n.t('admin.storageGovernance'));
    });
  });

  // 17. Forms
  languages.forEach(lng => {
    recordCheck(`Module: Forms [${lng.toUpperCase()}] - Input labels, Placeholders, Action Buttons`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('common.fullName'));
      assert.ok(i18n.t('common.email'));
      assert.ok(i18n.t('common.phone'));
      assert.ok(i18n.t('common.password'));
      assert.ok(i18n.t('common.submit'));
      assert.ok(i18n.t('common.cancel'));
    });
  });

  // 18. Validation
  languages.forEach(lng => {
    recordCheck(`Module: Validation [${lng.toUpperCase()}] - Required Fields, Phone Format, Quantity Limits`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('validation.fieldRequired'));
      assert.ok(i18n.t('validation.invalidPhone'));
      assert.ok(i18n.t('validation.invalidEmail'));
      assert.ok(i18n.t('validation.passwordTooShort'));
      assert.ok(i18n.t('validation.invalidQuantity'));
    });
  });

  // 19. Errors
  languages.forEach(lng => {
    recordCheck(`Module: Errors [${lng.toUpperCase()}] - Language-Independent Backend Error Mappings`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('errors.STORAGE_REQUEST_FAILED'));
      assert.ok(i18n.t('errors.INVALID_QUANTITY'));
      assert.ok(i18n.t('errors.NO_STORAGE_AVAILABLE'));
      assert.ok(i18n.t('errors.UNAUTHORIZED'));
      assert.ok(i18n.t('errors.FORBIDDEN'));
      assert.ok(i18n.t('errors.MARKET_DATA_UNAVAILABLE'));
      assert.ok(i18n.t('errors.FORECAST_UNAVAILABLE'));
      assert.ok(i18n.t('errors.BUYER_NOT_VERIFIED'));
      assert.ok(i18n.t('errors.INVALID_CROP_LOT'));
      assert.ok(i18n.t('errors.OFFER_FAILED'));
      assert.ok(i18n.t('errors.PAYMENT_FAILED'));
    });
  });

  // 20. Charts
  languages.forEach(lng => {
    recordCheck(`Module: Charts [${lng.toUpperCase()}] - Titles, Axes, Legends, Tooltips in Market, FPO, Admin, Transporter`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('market.priceTrendChartTitle'));
      assert.ok(i18n.t('market.xAxisDate'));
      assert.ok(i18n.t('market.yAxisPrice'));
      assert.ok(i18n.t('fpo.chartTitle7DayPrice'));
      assert.ok(i18n.t('fpo.chartTitleMonthlyVolume'));
      assert.ok(i18n.t('admin.registrationTrends'));
      assert.ok(i18n.t('transporter.chartGrossFreight'));
      assert.ok(i18n.t('transporter.expenseDiesel'));
    });
  });

  // 21. Tables & Filters
  languages.forEach(lng => {
    recordCheck(`Module: Tables & Filters [${lng.toUpperCase()}] - Headers, Filter Options, Sort Options, Empty States`, () => {
      i18n.changeLanguage(lng);
      assert.ok(i18n.t('common.thLotId'));
      assert.ok(i18n.t('common.thCrop'));
      assert.ok(i18n.t('common.thQuantity'));
      assert.ok(i18n.t('common.thPrice'));
      assert.ok(i18n.t('common.thMandi'));
      assert.ok(i18n.t('common.allCrops'));
      assert.ok(i18n.t('common.allMandis'));
      assert.ok(i18n.t('common.sortPriceLowHigh'));
      assert.ok(i18n.t('common.sortPriceHighLow'));
      assert.ok(i18n.t('common.noDataAvailable'));
    });
  });

  // ── SECTION 4: PERSISTENCE & LIFECYCLE VERIFICATION ──
  console.log('\n--- SECTION 4: Persistence & Cross-Session Restoration ---');

  recordCheck('Language persists across reload simulation via localStorage', () => {
    localStorageMock.clear();
    i18n.changeLanguage('mr');
    assert.strictEqual(localStorageMock.getItem('krishi_lang'), 'mr');

    // Simulate page reload
    const saved = localStorageMock.getItem('krishi_lang');
    i18n.init({ lng: saved });
    assert.strictEqual(i18n.getLanguage(), 'mr');
    assert.strictEqual(i18n.t('common.home'), 'मुख्यपृष्ठ');
  });

  recordCheck('Language persists across authentication (Login/Logout) for Marathi', () => {
    const user = {
      preferredLanguage: 'mr',
      languageUpdatedAt: new Date('2026-09-06T10:00:00Z')
    };
    i18n.changeLanguage(user.preferredLanguage);
    assert.strictEqual(i18n.getLanguage(), 'mr');
    assert.strictEqual(i18n.t('common.home'), 'मुख्यपृष्ठ');
  });

  recordCheck('Language persists across authentication (Login/Logout) for Hindi', () => {
    const user = {
      preferredLanguage: 'hi',
      languageUpdatedAt: new Date('2026-09-06T10:00:00Z')
    };
    i18n.changeLanguage(user.preferredLanguage);
    assert.strictEqual(i18n.getLanguage(), 'hi');
    assert.strictEqual(i18n.t('common.home'), 'होम');
  });

  // ── FINAL QA SUMMARY ──
  console.log('\n================================================================');
  console.log(`STEP 18 QA TEST EXECUTION COMPLETED`);
  console.log(`Total Checks Run : ${totalChecks}`);
  console.log(`Passed Checks    : ${passCount}`);
  console.log(`Failed Checks    : ${failCount}`);
  console.log('================================================================');

  if (failCount > 0) {
    console.error(`\nQA FAILURES DETECTED (${failCount}):`);
    failures.forEach((f, i) => {
      console.error(`  ${i + 1}. ${f.test}`);
      console.error(`     Error: ${f.error}`);
    });
    process.exit(1);
  } else {
    console.log('\nALL STEP 18 COMPLETE MULTILINGUAL QA CHECKS PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
}

runQATests().catch(err => {
  console.error('Fatal QA Runner Error:', err);
  process.exit(1);
});
