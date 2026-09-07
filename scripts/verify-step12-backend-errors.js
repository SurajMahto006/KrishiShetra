const i18next = require('../src/i18n.js');
const { protect, authorize } = require('../server/middleware/auth.middleware.js');
const storageController = require('../server/controllers/storage.controller.js');
const lotController = require('../server/controllers/lot.controller.js');

console.log('═════════════════════════════════════════════════════════════════════');
console.log('  STEP 12 — IMPLEMENT LANGUAGE-INDEPENDENT BACKEND ERRORS (TEST SUITE)');
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

// 1. Mandatory Error Codes from Step 12 Specification
console.log('--- 1. AUDITING REQUIRED BACKEND ERROR CODES ACROSS EN, HI, MR ---');

const REQUIRED_ERROR_CODES = [
  'STORAGE_REQUEST_FAILED',
  'INVALID_QUANTITY',
  'NO_STORAGE_AVAILABLE',
  'INSUFFICIENT_STORAGE_CAPACITY',
  'STORAGE_FACILITY_NOT_FOUND',
  'INVALID_STORAGE_DURATION',
  'PLEDGE_FINANCING_FAILED',
  'STORAGE_DATA_UNAVAILABLE',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'MARKET_DATA_UNAVAILABLE',
  'FORECAST_UNAVAILABLE',
  'MANDI_NOT_FOUND',
  'INVALID_COMMODITY',
  'BUYER_NOT_VERIFIED',
  'BUYER_NOT_FOUND',
  'BUYER_PROFILE_REQUIRED',
  'INVALID_CROP_LOT',
  'LOT_NOT_FOUND',
  'LOT_CREATION_FAILED',
  'INVALID_ASKING_PRICE',
  'LOT_ALREADY_SOLD',
  'OFFER_FAILED',
  'OFFER_NOT_FOUND',
  'OFFER_ALREADY_RESOLVED',
  'PAYMENT_FAILED',
  'ORDER_CREATION_FAILED',
  'ORDER_NOT_FOUND',
  'ORDER_UPDATE_FAILED',
  'ESCROW_RELEASE_FAILED',
  'TRANSPORT_BOOKING_FAILED',
  'VEHICLE_NOT_AVAILABLE',
  'DRIVER_NOT_FOUND',
  'USER_ALREADY_EXISTS',
  'INVALID_CREDENTIALS',
  'USER_NOT_FOUND',
  'ACCOUNT_DEACTIVATED',
  'ACCOUNT_UNVERIFIED',
  'INVALID_OTP',
  'OTP_EXPIRED',
  'VALIDATION_FAILED',
  'INTERNAL_SERVER_ERROR',
  'NETWORK_ERROR',
  'ACTION_FAILED'
];

['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  let missing = [];

  REQUIRED_ERROR_CODES.forEach(code => {
    const key = `errors.${code}`;
    const translated = i18next.t(key);
    if (!translated || translated === key) {
      missing.push(code);
    }
  });

  assert(
    missing.length === 0,
    `[${lang.toUpperCase()}]: All ${REQUIRED_ERROR_CODES.length} error codes resolved in dictionary (missing: ${missing.length})`
  );
});

// 2. Test Error Code Translation Samples in EN, HI, MR
console.log('\n--- 2. TESTING ERROR CODE TRANSLATIONS (EN, HI, MR) ---');

const sampleCodes = [
  'STORAGE_REQUEST_FAILED',
  'INVALID_QUANTITY',
  'NO_STORAGE_AVAILABLE',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'MARKET_DATA_UNAVAILABLE',
  'FORECAST_UNAVAILABLE',
  'BUYER_NOT_VERIFIED',
  'INVALID_CROP_LOT',
  'OFFER_FAILED',
  'PAYMENT_FAILED'
];

sampleCodes.forEach(code => {
  i18next.changeLanguage('en');
  const enText = i18next.t(`errors.${code}`);
  i18next.changeLanguage('hi');
  const hiText = i18next.t(`errors.${code}`);
  i18next.changeLanguage('mr');
  const mrText = i18next.t(`errors.${code}`);

  assert(enText && enText.length > 5, `EN [${code}]: "${enText}"`);
  assert(hiText && /[\u0900-\u097F]/.test(hiText), `HI [${code}]: "${hiText}" (Devanagari verified)`);
  assert(mrText && /[\u0900-\u097F]/.test(mrText), `MR [${code}]: "${mrText}" (Devanagari verified)`);
});

// 3. Test Auth Middleware Error Responses (Stable Error Codes)
console.log('\n--- 3. TESTING AUTH MIDDLEWARE ERROR RESPONSES ---');

function mockResponse() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

// 3.1 Test Protect without token -> 401 UNAUTHORIZED
(() => {
  const req = { headers: {} };
  const res = mockResponse();
  let nextCalled = false;
  protect(req, res, () => { nextCalled = true; });

  assert(res.statusCode === 401, 'Auth protect: Returns HTTP 401 on missing token');
  assert(res.body && res.body.success === false, 'Auth protect: success is false');
  assert(res.body && res.body.code === 'UNAUTHORIZED', 'Auth protect: code is "UNAUTHORIZED"');
  assert(res.body && typeof res.body.message === 'string', 'Auth protect: backward-compatible message preserved');
})();

// 3.2 Test Authorize with wrong role -> 403 FORBIDDEN
(() => {
  const req = { user: { role: 'farmer' } };
  const res = mockResponse();
  let nextCalled = false;
  authorize('admin', 'storage_owner')(req, res, () => { nextCalled = true; });

  assert(res.statusCode === 403, 'Auth authorize: Returns HTTP 403 on role mismatch');
  assert(res.body && res.body.success === false, 'Auth authorize: success is false');
  assert(res.body && res.body.code === 'FORBIDDEN', 'Auth authorize: code is "FORBIDDEN"');
})();

// 4. Test Storage Controller Error Responses
console.log('\n--- 4. TESTING STORAGE CONTROLLER ERROR RESPONSES ---');

// 4.1 Missing required parameters -> 400 VALIDATION_FAILED
(async () => {
  const req = { body: {} };
  const res = mockResponse();
  await storageController.createStorageRequest(req, res);

  assert(res.statusCode === 400, 'Storage request: Returns HTTP 400 on missing params');
  assert(res.body && res.body.code === 'VALIDATION_FAILED', 'Storage request: code is "VALIDATION_FAILED"');
})();

// 4.2 Invalid quantity -> 400 INVALID_QUANTITY
(async () => {
  const req = { body: { facilityId: 'WH-PUN-001', cropName: 'wheat', quantity: -5 } };
  const res = mockResponse();
  await storageController.createStorageRequest(req, res);

  assert(res.statusCode === 400, 'Storage request: Returns HTTP 400 on negative quantity');
  assert(res.body && res.body.code === 'INVALID_QUANTITY', 'Storage request: code is "INVALID_QUANTITY"');
})();

// 4.3 Facility not found -> 404 STORAGE_FACILITY_NOT_FOUND
(async () => {
  const req = { body: { facilityId: 'NON_EXISTENT_FACILITY_999', cropName: 'wheat', quantity: 50 } };
  const res = mockResponse();
  await storageController.createStorageRequest(req, res);

  assert(res.statusCode === 404, 'Storage request: Returns HTTP 404 for unknown facility');
  assert(res.body && res.body.code === 'STORAGE_FACILITY_NOT_FOUND', 'Storage request: code is "STORAGE_FACILITY_NOT_FOUND"');
})();

// 5. Test Produce Lot Controller Error Responses
console.log('\n--- 5. TESTING PRODUCE LOT CONTROLLER ERROR RESPONSES ---');

// 5.1 Single Lot Not Found -> 404 INVALID_CROP_LOT
(async () => {
  const req = { params: { lotId: 'KS-2099-000999' }, user: { _id: 'fake_user_id' } };
  const res = mockResponse();
  await lotController.getSingleLot(req, res);

  assert(res.statusCode === 404, 'Produce lot: Returns HTTP 404 on missing lot');
  assert(res.body && res.body.code === 'INVALID_CROP_LOT', 'Produce lot: code is "INVALID_CROP_LOT"');
})();

// 6. Test Client-Side Error Translation Simulation
console.log('\n--- 6. TESTING CLIENT-SIDE ERROR TRANSLATION INTEGRATION ---');

function simulateClientErrorTranslation(backendErrorResponse, currentLocale) {
  i18next.changeLanguage(currentLocale);
  const code = backendErrorResponse.code;
  const fallback = backendErrorResponse.message;
  return i18next.t(`errors.${code}`, fallback);
}

const mockBackendErrors = [
  { code: 'STORAGE_REQUEST_FAILED', message: 'Failed to submit storage request' },
  { code: 'INVALID_QUANTITY', message: 'Quantity must be greater than zero' },
  { code: 'UNAUTHORIZED', message: 'Token missing or expired' },
  { code: 'FORBIDDEN', message: 'Access denied' },
  { code: 'PAYMENT_FAILED', message: 'Payment failed' }
];

['en', 'hi', 'mr'].forEach(lang => {
  mockBackendErrors.forEach(errObj => {
    const translatedMsg = simulateClientErrorTranslation(errObj, lang);
    assert(
      translatedMsg && translatedMsg !== `errors.${errObj.code}`,
      `Client Translation [${lang.toUpperCase()}] for code "${errObj.code}": "${translatedMsg}"`
    );
  });
});

// Summary
console.log('\n═════════════════════════════════════════════════════════════════════');
console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log('═════════════════════════════════════════════════════════════════════\n');

if (passedTests === totalTests) {
  console.log('SUCCESS: STEP 12 — Language-Independent Backend Errors implemented & verified with 100% accuracy in EN, HI, MR!');
  process.exit(0);
} else {
  console.error(`FAILURE: ${totalTests - passedTests} tests failed.`);
  process.exit(1);
}
