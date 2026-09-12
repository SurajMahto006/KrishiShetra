const fs = require('fs');
const vm = require('vm');

const transCode = fs.readFileSync('js/translations.js', 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(transCode, sandbox);
const T = sandbox.window.KrishiTranslations;

function getVal(obj, path) {
  return path.split('.').reduce((p, c) => (p && p[c] !== undefined ? p[c] : undefined), obj);
}

const pages = [
  'dashboard.html',
  'lots.html',
  'market.html',
  'mandi-compare.html',
  'buyers.html',
  'orders.html',
  'storage.html',
  'ai-forecast.html',
  'disputes.html'
];

pages.forEach(file => {
  const html = fs.readFileSync(file, 'utf8');
  const matches = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
  const missingEn = [...new Set(matches.filter(k => getVal(T.en, k) === undefined))];
  const missingHi = [...new Set(matches.filter(k => getVal(T.hi, k) === undefined))];
  const missingMr = [...new Set(matches.filter(k => getVal(T.mr, k) === undefined))];

  console.log(`\n=== ${file} ===`);
  console.log(`Tagged keys: ${matches.length} (Unique: ${new Set(matches).size})`);
  console.log(`Missing in EN: ${missingEn.length}`, missingEn);
  console.log(`Missing in HI: ${missingHi.length}`, missingHi);
  console.log(`Missing in MR: ${missingMr.length}`, missingMr);
});
