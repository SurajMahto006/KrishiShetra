const path = require('path');
const i18next = require('../src/i18n.js');

console.log('=== STEP 3: TESTING GLOBAL LANGUAGE SELECTOR & REACTIVE SWITCHING ===\n');

// Mock localStorage
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

const testKeys = [
  'common.home',
  'common.save',
  'common.cancel',
  'common.logout',
  'navigation.dashboard'
];

console.log('1. Testing Initial State (Default: EN)');
i18next.init();
console.log('Active Language:', i18next.getLanguage());
testKeys.forEach(k => console.log(`  [EN] ${k} -> "${i18next.t(k)}"`));

console.log('\n2. Testing Switch: English -> Hindi');
i18next.changeLanguage('hi');
console.log('Active Language:', i18next.getLanguage());
console.log('Stored in localStorage krishi_lang:', localStorage.getItem('krishi_lang'));
if (localStorage.getItem('krishi_lang') !== 'hi') {
  console.error('FAIL: localStorage not updated with hi');
  process.exit(1);
}
testKeys.forEach(k => console.log(`  [HI] ${k} -> "${i18next.t(k)}"`));

if (i18next.t('common.home') !== 'होम' || i18next.t('navigation.dashboard') !== 'डैशबोर्ड') {
  console.error('FAIL: Hindi translations do not match expected strings');
  process.exit(1);
}

console.log('\n3. Testing Switch: Hindi -> Marathi');
i18next.changeLanguage('mr');
console.log('Active Language:', i18next.getLanguage());
console.log('Stored in localStorage krishi_lang:', localStorage.getItem('krishi_lang'));
if (localStorage.getItem('krishi_lang') !== 'mr') {
  console.error('FAIL: localStorage not updated with mr');
  process.exit(1);
}
testKeys.forEach(k => console.log(`  [MR] ${k} -> "${i18next.t(k)}"`));

if (i18next.t('common.home') !== 'मुख्यपृष्ठ' || i18next.t('navigation.dashboard') !== 'डॅशबोर्ड') {
  console.error('FAIL: Marathi translations do not match expected strings');
  process.exit(1);
}

console.log('\n4. Testing Switch: Marathi -> English');
i18next.changeLanguage('en');
console.log('Active Language:', i18next.getLanguage());
console.log('Stored in localStorage krishi_lang:', localStorage.getItem('krishi_lang'));
if (localStorage.getItem('krishi_lang') !== 'en') {
  console.error('FAIL: localStorage not updated with en');
  process.exit(1);
}
testKeys.forEach(k => console.log(`  [EN] ${k} -> "${i18next.t(k)}"`));

if (i18next.t('common.home') !== 'Home' || i18next.t('navigation.dashboard') !== 'Dashboard') {
  console.error('FAIL: English translations do not match expected strings');
  process.exit(1);
}

console.log('\n5. Testing Reload / Language Restoration from localStorage');
localStorage.setItem('krishi_lang', 'mr');
i18next.init();
console.log('Restored Language after simulated page reload:', i18next.getLanguage());
if (i18next.getLanguage() !== 'mr' || i18next.t('common.home') !== 'मुख्यपृष्ठ') {
  console.error('FAIL: Language restoration from localStorage failed');
  process.exit(1);
}

console.log('\n=== ALL LANGUAGE SELECTOR & REACTIVITY TESTS PASSED! ===');
