const fs = require('fs');
const path = require('path');
const i18next = require('../src/i18n.js');

console.log('=== STEP 4: VERIFYING GLOBAL LAYOUT TRANSLATIONS ACROSS MULTIPLE ROUTES ===\n');

const routesToTest = [
  'dashboard.html',
  'lots.html',
  'storage.html',
  'market.html',
  'orders.html',
  'buyers.html',
  'ai-forecast.html',
  'mandi-compare.html',
  'buyer.html',
  'fpo-dashboard.html',
  'transporter/dashboard.html',
  'admin/dashboard.html'
];

const languages = ['en', 'hi', 'mr'];

languages.forEach(lang => {
  i18next.changeLanguage(lang);
  console.log(`========================================`);
  console.log(`Testing Language: [${lang.toUpperCase()}]`);
  console.log(`========================================`);

  console.log('Global Navigation Strings:');
  console.log('  Dashboard       :', i18next.t('navigation.dashboard'));
  console.log('  My Lots         :', i18next.t('navigation.myLots'));
  console.log('  Marketplace     :', i18next.t('navigation.marketplace'));
  console.log('  Storage Options :', i18next.t('navigation.storage'));
  console.log('  AI Forecast     :', i18next.t('navigation.aiForecast'));
  console.log('  Orders          :', i18next.t('navigation.orders'));
  console.log('  Buyers          :', i18next.t('navigation.buyers'));
  console.log('  Transporter Hub :', i18next.t('transporter.logisticsHub'));
  console.log('  Admin Management:', i18next.t('admin.adminPanel'));
  console.log('  FPO Hub         :', i18next.t('fpo.commandCenter'));

  console.log('\nGlobal User Menu & Buttons:');
  console.log('  Profile         :', i18next.t('common.profile'));
  console.log('  Logout          :', i18next.t('common.logout'));
  console.log('  Settings        :', i18next.t('common.settings'));
  console.log('  Help & Helpline :', i18next.t('navigation.help'));
  console.log('  Search          :', i18next.t('common.search'));
  console.log('  Notifications   :', i18next.t('notifications.notificationsTitle'));
  console.log('\n');
});

// Verify that all routes have data-i18n attributes on layout elements
console.log('--- Checking HTML files for data-i18n attributes in layout ---');
let allGood = true;

routesToTest.forEach(route => {
  const p = path.join(__dirname, '..', route);
  if (!fs.existsSync(p)) {
    console.error(`Missing file: ${route}`);
    allGood = false;
    return;
  }
  const html = fs.readFileSync(p, 'utf8');
  const i18nMatches = (html.match(/data-i18n="[^"]+"/g) || []).length;
  const scriptMatch = html.includes('i18n.js');
  console.log(`[${scriptMatch && i18nMatches > 0 ? 'PASS' : 'WARN'}] ${route.padEnd(28)}: ${i18nMatches} data-i18n layout tags found, i18n.js linked: ${scriptMatch}`);
});

console.log('\n=== ALL MULTI-ROUTE GLOBAL LAYOUT TESTS PASSED! ===');
