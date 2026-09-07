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

['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  console.log(`\n=== LANGUAGE: ${lang} ===`);
  farmerPages.forEach(page => {
    const filePath = path.join(__dirname, '..', page);
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = [...content.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
    const missing = matches.filter(k => {
      const val = i18next.t(k);
      return !val || val === k;
    });
    if (missing.length > 0) {
      console.log(`[${page}] missing (${missing.length}):`, missing);
    }
  });
});
