const fs = require('fs');
const i18n = require('../src/i18n.js');
const content = fs.readFileSync('./admin/storage.html', 'utf8');
const i18nMatches = [...content.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
const placeholderMatches = [...content.matchAll(/data-i18n-placeholder="([^"]+)"/g)].map(m => m[1]);
const all = [...new Set([...i18nMatches, ...placeholderMatches])];
all.forEach(k => {
  const v = i18n.t(k);
  if (!v || v === k) {
    console.log('Missing key in admin/storage.html:', k);
  }
});
