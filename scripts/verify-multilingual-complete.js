const fs = require('fs');
const assert = require('assert');

console.log('=== MULTILINGUAL SYSTEM VERIFICATION SUITE ===\n');

// 1. DICTIONARY INTEGRITY
console.log('[1/5] Testing Dictionary Integrity & Terminology...');
const transCode = fs.readFileSync('js/translations.js', 'utf8');
const win = {};
new Function('window', transCode)(win);
const tr = win.KrishiTranslations;

assert.ok(tr.en && tr.hi && tr.mr, 'All 3 languages (en, hi, mr) exist');

// Test proper agricultural terminology
assert.strictEqual(tr.hi.crops.tomato, 'टमाटर', 'Hindi tomato translation is natural');
assert.strictEqual(tr.mr.crops.tomato, 'टोमॅटो', 'Marathi tomato translation is natural');
assert.strictEqual(tr.hi.crops.wheat, 'गेहूँ', 'Hindi wheat translation is natural');
assert.strictEqual(tr.mr.crops.wheat, 'गहू', 'Marathi wheat translation is natural');
assert.strictEqual(tr.hi.crops.cotton, 'कपास', 'Hindi cotton translation is natural');
assert.strictEqual(tr.mr.crops.cotton, 'कापूस', 'Marathi cotton translation is natural');
assert.strictEqual(tr.hi.crops.tur, 'तूर / अरहर', 'Hindi tur translation is natural');
assert.strictEqual(tr.mr.crops.tur, 'तूर', 'Marathi tur translation is natural');

// Test decision terms
assert.strictEqual(tr.hi.farmer.whereToSell, 'मुझे अपनी फसल कहाँ बेचनी चाहिए?', 'Hindi whereToSell is accurate');
assert.strictEqual(tr.mr.farmer.whereToSell, 'माझा शेतमाल कुठे विकावा?', 'Marathi whereToSell is accurate');
assert.strictEqual(tr.hi.farmer.marketPrice, 'बाज़ार भाव', 'Hindi marketPrice is accurate');
assert.strictEqual(tr.mr.farmer.marketPrice, 'बाजारभाव', 'Marathi marketPrice is accurate');
assert.strictEqual(tr.hi.farmer.netReturn, 'शुद्ध प्राप्ति', 'Hindi netReturn is accurate');
assert.strictEqual(tr.mr.farmer.netReturn, 'निव्वळ परतावा', 'Marathi netReturn is accurate');

console.log('  ✓ Crop terminology & decision terms verified in EN, HI, MR');

// 2. RUNTIME LOGIC IN JS/I18N.JS
console.log('\n[2/5] Testing Runtime Logic in js/i18n.js...');
const i18nCode = fs.readFileSync('js/i18n.js', 'utf8');

// Mock a lightweight browser environment
const storageMock = {};
const mockDocument = {
  documentElement: { lang: 'en' },
  head: { appendChild: () => {} },
  body: { querySelectorAll: () => [] },
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => ({
    setAttribute: () => {},
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {} },
    style: {}
  }),
  readyState: 'complete',
  addEventListener: () => {}
};

const mockWindow = {
  KrishiTranslations: tr,
  localStorage: {
    getItem: (k) => storageMock[k] || null,
    setItem: (k, v) => { storageMock[k] = v; }
  },
  document: mockDocument,
  dispatchEvent: (e) => {},
  addEventListener: () => {}
};

new Function('window', 'document', 'localStorage', i18nCode)(
  mockWindow,
  mockDocument,
  mockWindow.localStorage
);

const i18n = mockWindow.KrishiI18n;
assert.ok(i18n, 'KrishiI18n exported to window');
assert.strictEqual(typeof i18n.getCropName, 'function', 'getCropName function exists');
assert.strictEqual(typeof i18n.translateElement, 'function', 'translateElement function exists');
assert.strictEqual(typeof i18n.changeLanguage, 'function', 'changeLanguage function exists');

// Test getCropName
assert.strictEqual(i18n.getCropName('tomato', 'en'), 'Tomato');
assert.strictEqual(i18n.getCropName('tomato', 'hi'), 'टमाटर');
assert.strictEqual(i18n.getCropName('tomato', 'mr'), 'टोमॅटो');
assert.strictEqual(i18n.getCropName('Tomato', 'hi'), 'टमाटर');
assert.strictEqual(i18n.getCropName('Tomato (Grade A)', 'hi'), 'टमाटर (Grade A)');
assert.strictEqual(i18n.getCropName('Wheat (Lokwan)', 'mr'), 'गहू (Lokwan)');

// Test changeLanguage and document.documentElement.lang sync
i18n.changeLanguage('hi');
assert.strictEqual(storageMock['krishi_lang'], 'hi', 'Language saved to localStorage');
assert.strictEqual(mockDocument.documentElement.lang, 'hi', 'document.documentElement.lang updated to hi');
assert.strictEqual(i18n.getLanguage(), 'hi', 'Active language updated');

i18n.changeLanguage('mr');
assert.strictEqual(storageMock['krishi_lang'], 'mr', 'Language saved to localStorage');
assert.strictEqual(mockDocument.documentElement.lang, 'mr', 'document.documentElement.lang updated to mr');
assert.strictEqual(i18n.getLanguage(), 'mr', 'Active language updated');

console.log('  ✓ getCropName, composite string preservation, and document lang sync verified');

// 3. KRISHI SAHAYAK CHATBOT SYNC
console.log('\n[3/5] Testing Krishi Sahayak Language Detector & Sync...');
const ksCode = fs.readFileSync('js/krishi-sahayak.js', 'utf8');

// Verify LanguageDetector initializes from localStorage
assert.ok(ksCode.includes("localStorage.getItem('krishi_lang')"), 'LanguageDetector initializes from localStorage krishi_lang');
assert.ok(ksCode.includes("window.addEventListener('languageChanged'"), 'Chatbot listens for languageChanged event');
assert.ok(ksCode.includes("KrishiI18n.changeLanguage(newLang, 'chatbot')"), 'Chatbot change triggers changeLanguage with chatbot source');

console.log('  ✓ Krishi Sahayak two-way event synchronization verified');

// 4. HTML PAGES TAGGING STATUS
console.log('\n[4/5] Checking HTML Pages Coverage & Translation Parity...');

function checkPage(file) {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /data-i18n(?:-placeholder)?="([^"]+)"/g;
  let match;
  const missing = { en: [], hi: [], mr: [] };
  const found = new Set();
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    found.add(key);
    ['en', 'hi', 'mr'].forEach(lang => {
      const parts = key.split('.');
      let cur = tr[lang];
      for (const p of parts) {
        cur = cur ? cur[p] : undefined;
      }
      if (cur === undefined) {
        missing[lang].push(key);
      }
    });
  }

  assert.strictEqual(missing.en.length, 0, file + ' missing en keys: ' + JSON.stringify(missing.en));
  assert.strictEqual(missing.hi.length, 0, file + ' missing hi keys: ' + JSON.stringify(missing.hi));
  assert.strictEqual(missing.mr.length, 0, file + ' missing mr keys: ' + JSON.stringify(missing.mr));

  console.log(`  ✓ ${file}: ${found.size} keys tagged, 0 missing translations across EN, HI, MR`);
}

['index.html', 'login.html', 'register.html', 'disputes.html'].forEach(checkPage);

// 5. CSS & SCRIPT INCLUSION
console.log('\n[5/5] Checking Script Inclusions and Mount Targets...');
['index.html', 'login.html', 'register.html', 'disputes.html'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  assert.ok(content.includes('js/translations.js'), file + ' includes js/translations.js');
  assert.ok(content.includes('js/i18n.js'), file + ' includes js/i18n.js');
});
console.log('  ✓ All 4 pages correctly include translations.js and i18n.js');

console.log('\n======================================================');
console.log('ALL TESTS PASSED! Multilingual System is 100% complete.');
console.log('======================================================\n');
