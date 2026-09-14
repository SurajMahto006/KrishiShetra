const fs = require('fs');
const vm = require('vm');

const s = { window: {} };
vm.runInNewContext(fs.readFileSync('js/translations.js', 'utf8'), s);
const T = s.window.KrishiTranslations;

function getVal(obj, path) {
  return path.split('.').reduce((p, c) => (p && p[c] !== undefined ? p[c] : undefined), obj);
}

['login.html', 'register.html', 'index.html'].forEach(f => {
  const html = fs.readFileSync(f, 'utf8');
  const matches = [...html.matchAll(/data-i18n(?:-placeholder)?="([^"]+)"/g)].map(m => m[1]);
  const missingEn = [...new Set(matches.filter(k => getVal(T.en, k) === undefined))];
  const missingHi = [...new Set(matches.filter(k => getVal(T.hi, k) === undefined))];
  const missingMr = [...new Set(matches.filter(k => getVal(T.mr, k) === undefined))];
  console.log(f, 'Matches:', matches.length, 'Missing EN:', missingEn.length, 'HI:', missingHi.length, 'MR:', missingMr.length);
  if (missingEn.length) console.log('  EN missing:', missingEn);
  if (missingHi.length) console.log('  HI missing:', missingHi);
  if (missingMr.length) console.log('  MR missing:', missingMr);
});
