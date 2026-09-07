const fs = require('fs');
const i18next = require('../src/i18n.js');

const content = fs.readFileSync('buyers.html', 'utf8');
const allHtmlKeys = [...content.matchAll(/data-i18n(?:-placeholder|-title)?="([^"]+)"/g)].map(m => m[1]);
console.log('Total keys in buyers.html:', allHtmlKeys.length);

['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  const missing = allHtmlKeys.filter(k => {
    const v = i18next.t(k);
    return !v || v === k;
  });
  console.log(`[${lang}] Missing (${missing.length}):`, missing);
});
