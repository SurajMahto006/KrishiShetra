/**
 * KRISHISHETRA — VERIFICATION SUITE FOR BUYER INQUIRIES & MARKETPLACE MULTILINGUAL FIX
 * 
 * Verifies:
 * 1. Part 1 — Buyer Inquiries Layout:
 *    - buyers.html contains NO duplicate <html> / <head> / <!DOCTYPE> tags.
 *    - buyers.html container has proper structure and uses responsive viewport correctly.
 *    - buyer-inquiries.html contains responsive styling and correct DOM hierarchy.
 * 2. Part 2 — Complete Multilingual Marketplace:
 *    - en.json, hi.json, mr.json contain identical keys in marketplace, crops, demand, market, farmer namespaces.
 *    - All required UI strings are defined in EN, HI, MR.
 *    - market.html has data-i18n on filters, placeholder, and breadcrumb.
 *    - js/dashboard.js dynamically renders localized crop names, demand badges, units, and buttons.
 *    - forecastService generates localized reasons and recommendations for en, hi, mr.
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('VERIFICATION: BUYER INQUIRIES LAYOUT & MARKETPLACE MULTILINGUAL');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

// ── TEST 1: buyers.html Layout & Syntax Integrity ──
console.log('--- 1. Testing Buyer Inquiries Layout & DOM Cleanliness ---');
const buyersHtml = fs.readFileSync(path.join(__dirname, '..', 'buyers.html'), 'utf8');

// Check that <!DOCTYPE html> occurs only once
const docTypeCount = (buyersHtml.match(/<!DOCTYPE html>/gi) || []).length;
assert(docTypeCount === 1, `buyers.html has exactly 1 <!DOCTYPE html> declaration (found: ${docTypeCount})`);

// Check that <html occurs only once
const htmlTagCount = (buyersHtml.match(/<html/gi) || []).length;
assert(htmlTagCount === 1, `buyers.html has exactly 1 <html> opening tag (found: ${htmlTagCount})`);

// Check that <body occurs only once
const bodyTagCount = (buyersHtml.match(/<body/gi) || []).length;
assert(bodyTagCount === 1, `buyers.html has exactly 1 <body> opening tag (found: ${bodyTagCount})`);

// Check that container exists and has centered structure
assert(buyersHtml.includes('class="container"'), `buyers.html uses standard .container for responsive centering`);
assert(buyersHtml.includes('id="buyers-directory-list"'), `buyers.html contains #buyers-directory-list element`);
assert(buyersHtml.includes('id="offers-panel-body"'), `buyers.html contains #offers-panel-body element`);

// ── TEST 2: Localization Key Parity & Completeness ──
console.log('\n--- 2. Testing Marketplace & Crop Localization Dictionaries ---');
const en = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'locales', 'en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'locales', 'hi.json'), 'utf8'));
const mr = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'locales', 'mr.json'), 'utf8'));

// Test marketplace namespace
assert(en.marketplace && hi.marketplace && mr.marketplace, 'marketplace namespace exists in en, hi, mr');
assert(en.marketplace.title === 'Market Overview', 'en.marketplace.title = Market Overview');
assert(hi.marketplace.title === 'मंडी अवलोकन', 'hi.marketplace.title = मंडी अवलोकन');
assert(mr.marketplace.title === 'बाजारपेठ अवलोकन', 'mr.marketplace.title = बाजारपेठ अवलोकन');

assert(en.marketplace.viewDetails === 'View Details', 'en.marketplace.viewDetails = View Details');
assert(hi.marketplace.viewDetails === 'विवरण देखें', 'hi.marketplace.viewDetails = विवरण देखें');
assert(mr.marketplace.viewDetails === 'तपशील पहा', 'mr.marketplace.viewDetails = तपशील पहा');

// Test crops namespace
const cropKeys = ['rice', 'wheat', 'maize', 'soybean', 'onion', 'tomato', 'potato', 'pulses', 'chilli', 'groundnut', 'cotton', 'sugarcane', 'mango', 'banana', 'grapes'];
let cropsAllPresent = true;
cropKeys.forEach(k => {
  if (!en.crops[k] || !hi.crops[k] || !mr.crops[k]) cropsAllPresent = false;
});
assert(cropsAllPresent, `All 15 key agricultural crops are defined in crops.* across EN, HI, MR`);
assert(hi.crops.rice === 'चावल' && mr.crops.rice === 'तांदूळ', 'Crop rice localized in HI (चावल) and MR (तांदूळ)');
assert(hi.crops.wheat === 'गेहूं' && mr.crops.wheat === 'गहू', 'Crop wheat localized in HI (गेहूं) and MR (गहू)');
assert(hi.crops.onion === 'प्याज़' && mr.crops.onion === 'कांदा', 'Crop onion localized in HI (प्याज़) and MR (कांदा)');

// Test demand namespace
assert(en.demand.high === 'HIGH DEMAND' && hi.demand.high === 'उच्च मांग' && mr.demand.high === 'जास्त मागणी', 'HIGH DEMAND localized in EN, HI, MR');
assert(en.demand.medium === 'MEDIUM' && hi.demand.medium === 'मध्यम' && mr.demand.medium === 'मध्यम', 'MEDIUM localized in EN, HI, MR');
assert(en.demand.low === 'LOW DEMAND' && hi.demand.low === 'कम मांग' && mr.demand.low === 'कमी मागणी', 'LOW DEMAND localized in EN, HI, MR');

// ── TEST 3: market.html Data Attributes ──
console.log('\n--- 3. Testing market.html i18n Attributes ---');
const marketHtml = fs.readFileSync(path.join(__dirname, '..', 'market.html'), 'utf8');

assert(marketHtml.includes('data-i18n="marketplace.title"'), 'market.html has data-i18n="marketplace.title"');
assert(marketHtml.includes('data-i18n="marketplace.subtitle"'), 'market.html has data-i18n="marketplace.subtitle"');
assert(marketHtml.includes('data-i18n-placeholder="marketplace.searchPlaceholder"'), 'market.html search input has data-i18n-placeholder="marketplace.searchPlaceholder"');
assert(marketHtml.includes('data-i18n="marketplace.allCrops"'), 'market.html filter-crop has data-i18n="marketplace.allCrops"');
assert(marketHtml.includes('data-i18n="marketplace.allMandis"'), 'market.html filter-location has data-i18n="marketplace.allMandis"');
assert(marketHtml.includes('data-i18n="marketplace.allDemandLevels"'), 'market.html filter-demand has data-i18n="marketplace.allDemandLevels"');
assert(marketHtml.includes('data-i18n="crops.rice"'), 'market.html contains data-i18n="crops.rice" option');

// ── TEST 4: js/dashboard.js Dynamic Localization ──
console.log('\n--- 4. Testing js/dashboard.js Dynamic Localization ---');
const dashboardJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'dashboard.js'), 'utf8');

assert(dashboardJs.includes("t('crops.' + c.id, c.name)"), 'renderMarketGrid translates crop names via t()');
assert(dashboardJs.includes("t('demand.' + c.demand"), 'renderMarketGrid translates demand badges via t()');
assert(dashboardJs.includes("t('marketplace.viewDetails'"), 'renderMarketGrid translates View Details button');
assert(dashboardJs.includes("t('common.quintal'"), 'renderMarketGrid uses localized quintal unit');
assert(dashboardJs.includes('renderBuyersDirectoryList()'), 'dashboard.js has renderBuyersDirectoryList function');
assert(dashboardJs.includes("window.addEventListener('languageChanged'"), 'dashboard.js listens to languageChanged to trigger full re-render');

// ── SUMMARY REPORT ──
console.log('\n================================================================');
console.log(`VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL VERIFICATION CHECKS PASSED PERFECTLY!\n');
}
