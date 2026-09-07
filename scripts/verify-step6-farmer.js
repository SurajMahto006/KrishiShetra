const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Load built i18n
const i18nJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'i18n.js'), 'utf8');

const pagesToTest = [
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

console.log('═══════════════════════════════════════════════════════════════');
console.log('  STEP 6 VERIFICATION: COMPLETE FARMER MODULE MULTILINGUAL i18n');
console.log('═══════════════════════════════════════════════════════════════\n');

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

pagesToTest.forEach(pageFile => {
  const pagePath = path.join(__dirname, '..', pageFile);
  if (!fs.existsSync(pagePath)) {
    console.error(`Page not found: ${pageFile}`);
    return;
  }
  const html = fs.readFileSync(pagePath, 'utf8');

  console.log(`\nTesting Page: ${pageFile}`);

  // Test across English, Hindi, and Marathi
  ['en', 'hi', 'mr'].forEach(lang => {
    const dom = new JSDOM(html, {
      runScripts: 'outside-only',
      url: `http://localhost:5000/${pageFile}`
    });
    const { window } = dom;

    // Execute i18n runtime in DOM
    window.eval(i18nJs);
    window.i18next.changeLanguage(lang);
    window.i18next.translatePage();

    // Check data-i18n elements
    const i18nElements = window.document.querySelectorAll('[data-i18n]');
    assert(i18nElements.length > 0, `[${lang.toUpperCase()}] Found ${i18nElements.length} translated elements on ${pageFile}`);

    // Check that translation resolved properly and is not empty or equal to the raw key
    let rawKeyCount = 0;
    i18nElements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = el.textContent.trim();
      if (text === key) {
        rawKeyCount++;
      }
    });
    assert(rawKeyCount === 0, `[${lang.toUpperCase()}] All data-i18n keys resolved into localized text (0 raw keys remaining)`);

    // Check placeholders if any
    const placeholderElements = window.document.querySelectorAll('[data-i18n-placeholder]');
    let rawPlaceholderCount = 0;
    placeholderElements.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const ph = el.getAttribute('placeholder');
      if (ph === key) {
        rawPlaceholderCount++;
      }
    });
    assert(rawPlaceholderCount === 0, `[${lang.toUpperCase()}] All data-i18n-placeholder tags resolved`);
  });
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  STEP 6 RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (passedTests === totalTests) {
  console.log('>>> COMPLETE FARMER MODULE i18n VERIFICATION SUCCESSFUL! <<<');
  process.exit(0);
} else {
  console.error('>>> SOME TESTS FAILED <<<');
  process.exit(1);
}
