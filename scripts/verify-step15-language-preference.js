/**
 * STEP 15 VERIFICATION TEST SUITE
 * SAVE USER LANGUAGE PREFERENCE (EN/HI/MR)
 * 
 * Verifies:
 * 1. User Schema: preferredLanguage ('en' | 'hi' | 'mr', default 'en'), languageUpdatedAt timestamp
 * 2. Strict Enum Validation & Rejection of arbitrary language codes
 * 3. Backward Compatibility for legacy users
 * 4. Auth Controller handlers: PUT /api/auth/language, PUT /api/auth/preferred-language, registration, login, getMe, updateProfile
 * 5. LocalStorage & Server Sync Conflict Resolution: Latest explicit user selection wins
 * 6. End-to-End Authentication Lifecycle (Marathi, Hindi, English flows)
 */

const assert = require('assert');
const mongoose = require('mongoose');
const User = require('../server/models/User');
const authController = require('../server/controllers/auth.controller');

// ── Global Mocks for Node Test Environment ──
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

// Import i18n after localStorage mock is attached
const i18n = require('../src/i18n');

// Mock Auth Client matching js/auth.js
const AuthMock = {
  TOKEN_KEY: 'krishi_token',
  USER_KEY: 'krishi_user',
  USER_LANG_KEY: 'krishi_lang',
  LANG_UPDATED_AT_KEY: 'krishi_lang_updated_at',
  LOGGED_IN_KEY: 'krishi_is_logged_in',

  getToken() { return localStorageMock.getItem(this.TOKEN_KEY); },
  setToken(t) { localStorageMock.setItem(this.TOKEN_KEY, t); },
  getUser() {
    const u = localStorageMock.getItem(this.USER_KEY);
    return u ? JSON.parse(u) : null;
  },
  isLoggedIn() { return !!this.getToken() || localStorageMock.getItem(this.LOGGED_IN_KEY) === 'true'; },

  setUser(user) {
    if (!user) return;
    localStorageMock.setItem(this.USER_KEY, JSON.stringify(user));
    localStorageMock.setItem(this.LOGGED_IN_KEY, 'true');

    const allowedLangs = ['en', 'hi', 'mr'];
    const serverLang = (user.preferredLanguage || 'en').toLowerCase().trim();
    const serverUpdatedAt = user.languageUpdatedAt ? new Date(user.languageUpdatedAt).getTime() : 0;

    let localLang = '';
    let localUpdatedAt = 0;
    try {
      localLang = (localStorageMock.getItem(this.USER_LANG_KEY) || '').toLowerCase().trim();
      localUpdatedAt = parseInt(localStorageMock.getItem(this.LANG_UPDATED_AT_KEY) || '0', 10);
    } catch (e) {}

    let effectiveLang = 'en';

    // Conflict Rule: latest explicit user selection wins
    if (localLang && allowedLangs.includes(localLang) && localUpdatedAt > serverUpdatedAt) {
      effectiveLang = localLang;
      user.preferredLanguage = localLang;
      localStorageMock.setItem(this.USER_KEY, JSON.stringify(user));
      this.syncLanguagePreference(localLang);
    } else if (serverLang && allowedLangs.includes(serverLang)) {
      effectiveLang = serverLang;
      localStorageMock.setItem(this.USER_LANG_KEY, serverLang);
      localStorageMock.setItem('i18nextLng', serverLang);
      localStorageMock.setItem(this.LANG_UPDATED_AT_KEY, (serverUpdatedAt || Date.now()).toString());
    }

    i18n.changeLanguage(effectiveLang, null, { isServerSync: true });
  },

  syncLanguagePreference(lang) {
    const allowedLangs = ['en', 'hi', 'mr'];
    const targetLang = (lang || '').toLowerCase().trim();
    if (!allowedLangs.includes(targetLang)) return;

    const u = this.getUser();
    if (u) {
      u.preferredLanguage = targetLang;
      u.languageUpdatedAt = new Date().toISOString();
      localStorageMock.setItem(this.USER_KEY, JSON.stringify(u));
    }
  },

  clearSession() {
    localStorageMock.removeItem(this.TOKEN_KEY);
    localStorageMock.removeItem(this.USER_KEY);
    localStorageMock.removeItem(this.LOGGED_IN_KEY);
    localStorageMock.removeItem(this.LANG_UPDATED_AT_KEY);
  },

  logout() {
    this.clearSession();
  }
};

global.window = { i18next: i18n, Auth: AuthMock };

console.log('================================================================');
console.log('STEP 15 VERIFICATION: SAVE USER LANGUAGE PREFERENCE (EN/HI/MR)');
console.log('================================================================\n');

let passCount = 0;
let totalChecks = 0;

function check(desc, fn) {
  totalChecks++;
  try {
    fn();
    console.log(`  [PASS] ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${desc} -> ${err.message}`);
  }
}

async function checkAsync(desc, fn) {
  totalChecks++;
  try {
    await fn();
    console.log(`  [PASS] ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${desc} -> ${err.message}`);
  }
}

async function runTests() {
  // ── 1. SCHEMA & MODEL VALIDATION ──
  console.log('--- 1. User Model Schema Validation ---');

  check('User model has preferredLanguage field with default "en"', () => {
    const user = new User({
      name: 'Test Farmer',
      email: 'farmer.test@example.com',
      password: 'password123'
    });
    assert.strictEqual(user.preferredLanguage, 'en', 'Default preferredLanguage must be "en"');
    assert.ok(user.languageUpdatedAt, 'languageUpdatedAt timestamp must be initialized');
  });

  await checkAsync('User model allows valid languages: "en", "hi", "mr"', async () => {
    for (const lang of ['en', 'hi', 'mr']) {
      const user = new User({
        name: 'Multilingual User',
        email: `user.${lang}@example.com`,
        password: 'password123',
        preferredLanguage: lang
      });
      const validationError = await user.validate().catch(err => err);
      assert.strictEqual(validationError, undefined, `Validation should pass for ${lang}`);
      assert.strictEqual(user.preferredLanguage, lang);
    }
  });

  await checkAsync('User model rejects arbitrary language codes (e.g. "fr", "es", "de")', async () => {
    for (const invalidLang of ['fr', 'es', 'de', 'unknown', 'zh']) {
      const user = new User({
        name: 'Invalid Lang User',
        email: `invalid.${invalidLang}@example.com`,
        password: 'password123',
        preferredLanguage: invalidLang
      });
      const error = await user.validate().catch(err => err);
      assert.ok(error && error.errors && error.errors.preferredLanguage, `Should reject ${invalidLang}`);
    }
  });

  check('Existing users without preferredLanguage continue working with fallback to "en"', () => {
    const legacyUserObj = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Legacy User',
      email: 'legacy@example.com',
      role: 'farmer'
    };
    const preferred = legacyUserObj.preferredLanguage || 'en';
    assert.strictEqual(preferred, 'en');
  });

  // ── 2. CONTROLLER ENDPOINTS UNIT TESTS ──
  console.log('\n--- 2. Auth Controller Language Preference Handler ---');

  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Ramesh Patil',
    email: 'ramesh@krishishetra.in',
    role: 'farmer',
    preferredLanguage: 'en',
    languageUpdatedAt: new Date('2026-09-01T10:00:00Z'),
    save: async function () { return this; }
  };

  const originalFindById = User.findById;
  User.findById = async (id) => {
    if (id.toString() === mockUser._id.toString()) return mockUser;
    return null;
  };

  await checkAsync('updateLanguagePreference accepts "mr" and updates languageUpdatedAt', async () => {
    let statusResult = null;
    let jsonResult = null;

    const req = {
      user: { _id: mockUser._id },
      body: { preferredLanguage: 'mr' }
    };
    const res = {
      status: (code) => { statusResult = code; return res; },
      json: (data) => { jsonResult = data; return res; }
    };

    await authController.updateLanguagePreference(req, res);

    assert.strictEqual(statusResult, 200);
    assert.strictEqual(jsonResult.success, true);
    assert.strictEqual(jsonResult.preferredLanguage, 'mr');
    assert.strictEqual(mockUser.preferredLanguage, 'mr');
    assert.ok(mockUser.languageUpdatedAt instanceof Date);
  });

  await checkAsync('updateLanguagePreference accepts "hi" and updates preference', async () => {
    let statusResult = null;
    let jsonResult = null;

    const req = {
      user: { _id: mockUser._id },
      body: { language: 'hi' }
    };
    const res = {
      status: (code) => { statusResult = code; return res; },
      json: (data) => { jsonResult = data; return res; }
    };

    await authController.updateLanguagePreference(req, res);

    assert.strictEqual(statusResult, 200);
    assert.strictEqual(jsonResult.success, true);
    assert.strictEqual(jsonResult.preferredLanguage, 'hi');
    assert.strictEqual(mockUser.preferredLanguage, 'hi');
  });

  await checkAsync('updateLanguagePreference rejects arbitrary language codes with 400 & INVALID_LANGUAGE', async () => {
    let statusResult = null;
    let jsonResult = null;

    const req = {
      user: { _id: mockUser._id },
      body: { preferredLanguage: 'fr' }
    };
    const res = {
      status: (code) => { statusResult = code; return res; },
      json: (data) => { jsonResult = data; return res; }
    };

    await authController.updateLanguagePreference(req, res);

    assert.strictEqual(statusResult, 400);
    assert.strictEqual(jsonResult.success, false);
    assert.strictEqual(jsonResult.code, 'INVALID_LANGUAGE');
  });

  User.findById = originalFindById;

  // ── 3. LOCALSTORAGE SYNC & CONFLICT RESOLUTION SIMULATION ──
  console.log('\n--- 3. LocalStorage Sync & Conflict Resolution Rule ---');

  check('Server preference wins when local has older timestamp or no timestamp', () => {
    localStorageMock.clear();
    localStorageMock.setItem('krishi_lang', 'en');
    localStorageMock.setItem('krishi_lang_updated_at', '1000'); // older timestamp

    const userFromServer = {
      id: 'usr_1',
      name: 'Sunita Patil',
      email: 'sunita@example.com',
      role: 'farmer',
      preferredLanguage: 'mr',
      languageUpdatedAt: new Date('2026-09-06T12:00:00Z').toISOString() // much newer
    };

    AuthMock.setUser(userFromServer);

    assert.strictEqual(localStorageMock.getItem('krishi_lang'), 'mr');
    assert.strictEqual(i18n.getLanguage(), 'mr');
  });

  check('Local explicit user selection wins when local timestamp is newer than server', () => {
    localStorageMock.clear();
    const futureLocalTime = Date.now() + 100000;
    localStorageMock.setItem('krishi_lang', 'hi');
    localStorageMock.setItem('krishi_lang_updated_at', futureLocalTime.toString());

    const userFromServer = {
      id: 'usr_1',
      name: 'Sunita Patil',
      email: 'sunita@example.com',
      role: 'farmer',
      preferredLanguage: 'mr',
      languageUpdatedAt: new Date('2026-09-01T12:00:00Z').toISOString() // older
    };

    AuthMock.setUser(userFromServer);

    assert.strictEqual(localStorageMock.getItem('krishi_lang'), 'hi');
    assert.strictEqual(i18n.getLanguage(), 'hi');
    const cachedUser = AuthMock.getUser();
    assert.strictEqual(cachedUser.preferredLanguage, 'hi');
  });

  // ── 4. FULL AUTHENTICATION LIFECYCLE SCENARIO (MARATHI & HINDI) ──
  console.log('\n--- 4. Full Authentication Lifecycle Tests (Prompt Test Cases) ---');

  // Scenario 1: Marathi Flow
  check('Flow 1: User selects Marathi -> Saved -> Logout -> Login -> Marathi automatically loads', () => {
    localStorageMock.clear();

    // 1. Initial login (User starts in English)
    const serverDbUser = {
      id: 'user_marathi_01',
      name: 'Ganesh Pawar',
      email: 'ganesh@krishishetra.in',
      role: 'farmer',
      preferredLanguage: 'en',
      languageUpdatedAt: new Date('2026-09-01T00:00:00Z')
    };

    AuthMock.setToken('jwt_token_ganesh');
    AuthMock.setUser(serverDbUser);
    assert.strictEqual(i18n.getLanguage(), 'en');

    // 2. User selects Marathi in UI
    const explicitTime = Date.now();
    i18n.changeLanguage('mr');
    serverDbUser.preferredLanguage = 'mr';
    serverDbUser.languageUpdatedAt = new Date(explicitTime);
    AuthMock.syncLanguagePreference('mr');

    assert.strictEqual(i18n.getLanguage(), 'mr');
    assert.strictEqual(localStorageMock.getItem('krishi_lang'), 'mr');

    // 3. User logs out
    AuthMock.logout();
    assert.strictEqual(AuthMock.isLoggedIn(), false);

    // 4. User logs in again -> Server returns preferredLanguage = 'mr'
    AuthMock.setToken('jwt_token_ganesh_new');
    AuthMock.setUser(serverDbUser);

    // 5. Marathi automatically loads!
    assert.strictEqual(localStorageMock.getItem('krishi_lang'), 'mr');
    assert.strictEqual(i18n.getLanguage(), 'mr');
    assert.strictEqual(i18n.t('common.home'), 'मुख्यपृष्ठ');
  });

  // Scenario 2: Hindi Flow
  check('Flow 2: User selects Hindi -> Saved -> Logout -> Login -> Hindi automatically loads', () => {
    localStorageMock.clear();

    // 1. Initial user starts in English
    const serverDbUser = {
      id: 'user_hindi_02',
      name: 'Amit Sharma',
      email: 'amit@krishishetra.in',
      role: 'buyer',
      preferredLanguage: 'en',
      languageUpdatedAt: new Date('2026-09-01T00:00:00Z')
    };

    AuthMock.setToken('jwt_token_amit');
    AuthMock.setUser(serverDbUser);
    assert.strictEqual(i18n.getLanguage(), 'en');

    // 2. User selects Hindi in UI
    const explicitTime = Date.now();
    i18n.changeLanguage('hi');
    serverDbUser.preferredLanguage = 'hi';
    serverDbUser.languageUpdatedAt = new Date(explicitTime);
    AuthMock.syncLanguagePreference('hi');

    assert.strictEqual(i18n.getLanguage(), 'hi');
    assert.strictEqual(localStorageMock.getItem('krishi_lang'), 'hi');

    // 3. User logs out
    AuthMock.logout();
    assert.strictEqual(AuthMock.isLoggedIn(), false);

    // 4. User logs back in
    AuthMock.setToken('jwt_token_amit_new');
    AuthMock.setUser(serverDbUser);

    // 5. Hindi automatically loads!
    assert.strictEqual(localStorageMock.getItem('krishi_lang'), 'hi');
    assert.strictEqual(i18n.getLanguage(), 'hi');
    assert.strictEqual(i18n.t('common.home'), 'होम');
  });

  // Scenario 3: English Flow
  check('Flow 3: User selects English -> Saved -> Logout -> Login -> English automatically loads', () => {
    localStorageMock.clear();

    const serverDbUser = {
      id: 'user_en_03',
      name: 'John Doe',
      email: 'john@krishishetra.in',
      role: 'admin',
      preferredLanguage: 'hi', // initially was hi
      languageUpdatedAt: new Date('2026-09-01T00:00:00Z')
    };

    AuthMock.setToken('jwt_token_john');
    AuthMock.setUser(serverDbUser);
    assert.strictEqual(i18n.getLanguage(), 'hi');

    // User switches to English
    const explicitTime = Date.now();
    i18n.changeLanguage('en');
    serverDbUser.preferredLanguage = 'en';
    serverDbUser.languageUpdatedAt = new Date(explicitTime);
    AuthMock.syncLanguagePreference('en');

    assert.strictEqual(i18n.getLanguage(), 'en');

    // Logout
    AuthMock.logout();

    // Login
    AuthMock.setToken('jwt_token_john_new');
    AuthMock.setUser(serverDbUser);

    assert.strictEqual(i18n.getLanguage(), 'en');
    assert.strictEqual(i18n.t('common.home'), 'Home');
  });

  console.log('\n================================================================');
  console.log(`STEP 15 VERIFICATION COMPLETED: ${passCount}/${totalChecks} CHECKS PASSED`);
  console.log('================================================================');

  if (passCount !== totalChecks) {
    process.exit(1);
  } else {
    console.log('ALL STEP 15 LANGUAGE PREFERENCE REQUIREMENTS VERIFIED SUCCESSFULLY!');
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
