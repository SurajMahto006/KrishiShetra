const path = require('path');
const fs = require('fs');
const i18next = require('../src/i18n.js');

console.log('=== RUNTIME TRANSLATION VERIFICATION ===\n');

const en = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/locales/en.json'), 'utf8'));

function getKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((res, el) => {
    if (Array.isArray(obj[el])) return res;
    if (typeof obj[el] === 'object' && obj[el] !== null) return [...res, ...getKeys(obj[el], prefix + el + '.')];
    return [...res, prefix + el];
  }, []);
}

const allKeys = getKeys(en);
console.log(`Verifying all ${allKeys.length} keys across languages...`);

['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  let resolved = 0;
  let missing = 0;
  allKeys.forEach(k => {
    const translation = i18next.t(k);
    if (!translation || translation === k) {
      console.error(`[FAIL] Unresolved key for '${lang}': ${k}`);
      missing++;
    } else {
      resolved++;
    }
  });

  if (missing === 0) {
    console.log(`[PASS] ${lang.toUpperCase()}: All ${resolved} / ${allKeys.length} keys resolved cleanly.`);
  } else {
    console.error(`[FAIL] ${lang.toUpperCase()}: ${missing} keys missing!`);
    process.exit(1);
  }
});

console.log('\n--- Specific Sample Output Verification ---');
['en', 'hi', 'mr'].forEach(lang => {
  i18next.changeLanguage(lang);
  console.log(`\n[${lang.toUpperCase()}] Samples:`);
  console.log('  common.search            :', i18next.t('common.search'));
  console.log('  navigation.marketplace   :', i18next.t('navigation.marketplace'));
  console.log('  farmer.dashboardTitle    :', i18next.t('farmer.dashboardTitle'));
  console.log('  storage.sellVsStoreTitle :', i18next.t('storage.sellVsStoreTitle'));
  console.log('  ai.aiPriceForecast       :', i18next.t('ai.aiPriceForecast'));
  console.log('  validation.requiredField :', i18next.t('validation.requiredField'));
  console.log('  success.lotCreated       :', i18next.t('success.lotCreated'));
});

console.log('\n=== ALL 414 KEYS AND RUNTIME LOCALIZATION TESTS PASSED SUCCESSFULLY! ===');
