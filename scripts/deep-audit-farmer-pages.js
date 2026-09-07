const fs = require('fs');
const path = require('path');
const i18next = require('../src/i18n.js');

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

console.log('═══════════════════════════════════════════════════════════════════');
console.log('  DEEP AUDIT OF ALL FARMER ROUTES ACROSS EN, HI, MR');
console.log('═══════════════════════════════════════════════════════════════════\n');

let totalChecks = 0;
let passedChecks = 0;

farmerPages.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract all data-i18n attributes
  const matches = [...content.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
  const placeholderMatches = [...content.matchAll(/data-i18n-placeholder="([^"]+)"/g)].map(m => m[1]);
  const allKeys = [...new Set([...matches, ...placeholderMatches])];

  ['en', 'hi', 'mr'].forEach(lang => {
    i18next.changeLanguage(lang);
    let missing = [];
    allKeys.forEach(k => {
      totalChecks++;
      const val = i18next.t(k);
      if (!val || val === k) {
        missing.push(k);
      } else {
        passedChecks++;
      }
    });

    if (missing.length === 0) {
      console.log(`✓ [${lang.toUpperCase()}] ${file}: ${allKeys.length} keys verified 100%`);
    } else {
      console.error(`✗ [${lang.toUpperCase()}] ${file}: Missing ${missing.length} keys ->`, missing);
    }
  });
});

console.log(`\nAUDIT COMPLETED: ${passedChecks} / ${totalChecks} checks passed!`);
