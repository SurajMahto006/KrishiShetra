const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('STEP 14: VERIFY DATA VISUALIZATION TRANSLATIONS (EN / HI / MR)');
console.log('====================================================\n');

// 1. Load Locales
const en = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'locales', 'en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'locales', 'hi.json'), 'utf8'));
const mr = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'locales', 'mr.json'), 'utf8'));

const devanagariRegex = /[\u0900-\u097F]/;

let passCount = 0;
let totalChecks = 0;

function check(desc, fn) {
  totalChecks++;
  try {
    fn();
    console.log(`  [PASS] ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${desc} -> ${err.message}`);
  }
}

// ── TEST SUITE 1: CHART TITLES, AXES, LEGENDS, TOOLTIPS ──
console.log('--- TEST SUITE 1: Charts, Axes, Legends, Tooltips in EN, HI, MR ---');

check('Market Price Trends Chart Titles (EN, HI, MR)', () => {
  assert.strictEqual(en.market.priceTrend, 'Price Trend');
  assert.strictEqual(hi.market.priceTrend, 'मूल्य रुझान');
  assert.strictEqual(mr.market.priceTrend, 'किंमत कल');
  assert.ok(devanagariRegex.test(hi.market.priceTrend));
  assert.ok(devanagariRegex.test(mr.market.priceTrend));
});

check('Mandi Price & Profitability Comparison Chart (EN, HI, MR)', () => {
  assert.strictEqual(en.market.mandiComparison, 'Mandi Price & Profitability Comparison');
  assert.strictEqual(hi.market.mandiComparison, 'मंडी भाव व लाभप्रदता तुलना');
  assert.strictEqual(mr.market.mandiComparison, 'बाजार भाव व नफा तुलना');
});

check('Distance vs Profit Chart Title (EN, HI, MR)', () => {
  assert.strictEqual(en.market.distanceVsProfit, 'Distance vs Net Realization');
  assert.strictEqual(hi.market.distanceVsProfit, 'दूरी बनाम शुद्ध आय');
  assert.strictEqual(mr.market.distanceVsProfit, 'अंतर विरुद्ध निव्वळ नफा');
});

check('Scatter Plot Tooltip & Dataset Labels (EN, HI, MR)', () => {
  assert.strictEqual(en.market.mandiDecisionPoint, 'Mandi Decision Point');
  assert.strictEqual(hi.market.mandiDecisionPoint, 'मंडी निर्णय बिंदु');
  assert.strictEqual(mr.market.mandiDecisionPoint, 'बाजार निर्णय बिंदू');

  assert.strictEqual(en.market.netRealizationLabelShort, 'Net Realization (₹/q)');
  assert.strictEqual(hi.market.netRealizationLabelShort, 'शुद्ध आय (₹/क्विंटल)');
  assert.strictEqual(mr.market.netRealizationLabelShort, 'निव्वळ प्राप्ती (₹/क्विंटल)');
});

check('FPO APMC Price Trends & Volume Charts (EN, HI, MR)', () => {
  assert.strictEqual(en.fpo.priceTrendsCardTitle, '7-Day APMC Price Trends (₹/Quintal)');
  assert.strictEqual(hi.fpo.priceTrendsCardTitle, '7-दिवसीय एपीएमसी मूल्य रुझान (₹/क्विंटल)');
  assert.strictEqual(mr.fpo.priceTrendsCardTitle, '7-दिवसीय एपीएमसी बाजार भाव कल (₹/क्विंटल)');

  assert.strictEqual(en.fpo.monthlyVolumeCardTitle, 'Monthly Aggregation Volume & Revenue (2026)');
  assert.strictEqual(hi.fpo.monthlyVolumeCardTitle, 'मासिक एकत्रीकरण मात्रा व राजस्व (2026)');
  assert.strictEqual(mr.fpo.monthlyVolumeCardTitle, 'मासिक संकलन प्रमाण व महसूल (2026)');

  assert.strictEqual(en.fpo.commodityShareCardTitle, 'Commodity Share Breakdown');
  assert.strictEqual(hi.fpo.commodityShareCardTitle, 'वस्तु हिस्सेदारी वितरण');
  assert.strictEqual(mr.fpo.commodityShareCardTitle, 'शेतमाल हिस्सा विभागणी');
});

check('Admin Growth, GMV, and Registration Charts (EN, HI, MR)', () => {
  assert.strictEqual(en.admin.registrationTrendsTitle, 'New User Registrations');
  assert.strictEqual(hi.admin.registrationTrendsTitle, 'नए उपयोगकर्ता पंजीकरण');
  assert.strictEqual(mr.admin.registrationTrendsTitle, 'नवीन वापरकर्ता नोंदणी');

  assert.strictEqual(en.admin.roleDistributionTitle, 'User Role Distribution');
  assert.strictEqual(hi.admin.roleDistributionTitle, 'उपयोगकर्ता भूमिका वितरण');
  assert.strictEqual(mr.admin.roleDistributionTitle, 'वापरकर्ता भूमिका वितरण');

  assert.strictEqual(en.admin.cropDistributionTitle, 'Crop Cultivation Distribution');
  assert.strictEqual(hi.admin.cropDistributionTitle, 'फसल खेती वितरण');
  assert.strictEqual(mr.admin.cropDistributionTitle, 'पीक लागवड वितरण');

  assert.strictEqual(en.admin.gmvTrendTitle, 'Gross Merchandise Value (GMV) Trend');
  assert.strictEqual(hi.admin.gmvTrendTitle, 'सकल व्यापार मूल्य (GMV) रुझान');
  assert.strictEqual(mr.admin.gmvTrendTitle, 'एकूण व्यापारी मूल्य (GMV) कल');
});

check('Transporter Earnings & Expense Breakdown Charts (EN, HI, MR)', () => {
  assert.strictEqual(en.transporter.earningsChartTitle, 'Monthly Earnings & Freight');
  assert.strictEqual(hi.transporter.earningsChartTitle, 'मासिक कमाई व मालभाड़ा');
  assert.strictEqual(mr.transporter.earningsChartTitle, 'मासिक कमाई व वाहतूक भाडे');

  assert.strictEqual(en.transporter.expenseChartTitle, 'Trip Expense Breakdown');
  assert.strictEqual(hi.transporter.expenseChartTitle, 'ट्रिप व्यय वितरण');
  assert.strictEqual(mr.transporter.expenseChartTitle, 'ट्रिप खर्च विभागणी');

  assert.strictEqual(en.transporter.grossFreight, 'Gross Freight (₹)');
  assert.strictEqual(hi.transporter.grossFreight, 'सकल मालभाड़ा (₹)');
  assert.strictEqual(mr.transporter.grossFreight, 'एकूण वाहतूक भाडे (₹)');
});

// ── TEST SUITE 2: TABLE HEADERS ACROSS EN, HI, MR ──
console.log('\n--- TEST SUITE 2: Table Headers ---');

const expectedHeaders = [
  { key: 'thLotId', en: 'Lot ID', hi: 'लॉट आईडी', mr: 'लॉट आयडी' },
  { key: 'thCrop', en: 'Crop & Variety', hi: 'फसल व किस्म', mr: 'पीक व जात' },
  { key: 'thQuantity', en: 'Quantity (q)', hi: 'मात्रा (क्विंटल)', mr: 'प्रमाण (क्विंटल)' },
  { key: 'thPrice', en: 'Price (₹/q)', hi: 'भाव (₹/क्विंटल)', mr: 'दर (₹/क्विंटल)' },
  { key: 'thMandi', en: 'Mandi / Location', hi: 'मंडी / स्थान', mr: 'बाजार / ठिकाण' },
  { key: 'thDistance', en: 'Distance', hi: 'दूरी', mr: 'अंतर' },
  { key: 'thNetProfit', en: 'Net Realization', hi: 'शुद्ध आय', mr: 'निव्वळ प्राप्ती' },
  { key: 'thFarmer', en: 'Farmer / Seller', hi: 'किसान / विक्रेता', mr: 'शेतकरी / विक्रेता' },
  { key: 'thBuyer', en: 'Buyer / Company', hi: 'खरीदार / कंपनी', mr: 'खरेदीदार / कंपनी' },
  { key: 'thTransporter', en: 'Transporter / Vehicle', hi: 'परिवहनकर्ता / वाहन', mr: 'वाहतूकदार / वाहन' },
  { key: 'thStatus', en: 'Status', hi: 'स्थिति', mr: 'स्थिती' },
  { key: 'thStorageFacility', en: 'Storage Facility', hi: 'भंडारण सुविधा', mr: 'साठवणूक सुविधा' },
  { key: 'thCapacity', en: 'Available Capacity', hi: 'उपलब्ध क्षमता', mr: 'उपलब्ध क्षमता' },
  { key: 'thStorageRate', en: 'Storage Rate', hi: 'भंडारण दर', mr: 'साठवणूक दर' },
  { key: 'thEstimatedCost', en: 'Estimated Cost', hi: 'अनुमानित लागत', mr: 'अंदाजित खर्च' },
  { key: 'thTripId', en: 'Trip ID', hi: 'ट्रिप आईडी', mr: 'ट्रिप आयडी' },
  { key: 'thVehicle', en: 'Vehicle No', hi: 'वाहन क्रमांक', mr: 'वाहन क्र.' }
];

expectedHeaders.forEach(th => {
  check(`Table Header: ${th.key}`, () => {
    assert.strictEqual(en.common[th.key], th.en);
    assert.strictEqual(hi.common[th.key], th.hi);
    assert.strictEqual(mr.common[th.key], th.mr);
    assert.ok(devanagariRegex.test(hi.common[th.key]));
    assert.ok(devanagariRegex.test(mr.common[th.key]));
  });
});

// ── TEST SUITE 3: FILTER LABELS & DROPDOWN OPTIONS ──
console.log('\n--- TEST SUITE 3: Filters & Dropdown Options ---');

const expectedFilters = [
  { key: 'allCrops', en: 'All Crops', hi: 'सभी फसलें', mr: 'सर्व पिके' },
  { key: 'allMandis', en: 'All Mandis', hi: 'सभी मंडियां', mr: 'सर्व बाजार समित्या' },
  { key: 'allStatuses', en: 'All Statuses', hi: 'सभी स्थितियां', mr: 'सर्व स्थिती' },
  { key: 'allDistricts', en: 'All Districts', hi: 'सभी जिले', mr: 'सर्व जिल्हे' },
  { key: 'allFacilities', en: 'All Facility Types', hi: 'सभी सुविधा प्रकार', mr: 'सर्व सुविधा प्रकार' },
  { key: 'filterByCommodity', en: 'Filter by Crop', hi: 'फसल अनुसार फ़िल्टर', mr: 'पिकानुसार फिल्टर' },
  { key: 'filterByDistrict', en: 'Filter by District', hi: 'जिले अनुसार फ़िल्टर', mr: 'जिल्ह्यानुसार फिल्टर' },
  { key: 'searchPlaceholder', en: 'Search by crop, mandi, seller...', hi: 'फसल, मंडी, विक्रेता खोजें...', mr: 'पीक, बाजार, विक्रेता शोधा...' }
];

expectedFilters.forEach(f => {
  check(`Filter Option: ${f.key}`, () => {
    assert.strictEqual(en.common[f.key], f.en);
    assert.strictEqual(hi.common[f.key], f.hi);
    assert.strictEqual(mr.common[f.key], f.mr);
    assert.ok(devanagariRegex.test(hi.common[f.key]));
    assert.ok(devanagariRegex.test(mr.common[f.key]));
  });
});

// ── TEST SUITE 4: SORT OPTIONS & EMPTY STATES ──
console.log('\n--- TEST SUITE 4: Sort Options & Empty States ---');

const expectedSorts = [
  { key: 'sortPriceLowHigh', en: 'Price: Low to High', hi: 'भाव: कम से अधिक', mr: 'दर: कमी ते जास्त' },
  { key: 'sortPriceHighLow', en: 'Price: High to Low', hi: 'भाव: अधिक से कम', mr: 'दर: जास्त ते कमी' },
  { key: 'sortDistanceNearest', en: 'Distance: Nearest First', hi: 'दूरी: निकटतम पहले', mr: 'अंतर: सर्वात जवळचे आधी' },
  { key: 'sortCapacityHighLow', en: 'Capacity: High to Low', hi: 'क्षमता: अधिक से कम', mr: 'क्षमता: जास्त ते कमी' },
  { key: 'sortNetProfitHighLow', en: 'Net Realization: Highest First', hi: 'शुद्ध आय: अधिकतम पहले', mr: 'निव्वळ प्राप्ती: सर्वाधिक आधी' },
  { key: 'sortNewestFirst', en: 'Date: Newest First', hi: 'दिनांक: नवीनतम पहले', mr: 'तारीख: नवीन आधी' }
];

expectedSorts.forEach(s => {
  check(`Sort Option: ${s.key}`, () => {
    assert.strictEqual(en.common[s.key], s.en);
    assert.strictEqual(hi.common[s.key], s.hi);
    assert.strictEqual(mr.common[s.key], s.mr);
  });
});

const expectedEmptyStates = [
  { key: 'noDataAvailable', en: 'No data available for the selected filters.', hi: 'चयनित फ़िल्टर के लिए कोई डेटा उपलब्ध नहीं है।', mr: 'निवडलेल्या फिल्टरसाठी कोणताही डेटा उपलब्ध नाही.' },
  { key: 'noLotsFound', en: 'No produce lots found matching your criteria.', hi: 'आपके मानदंडों से मेल खाने वाला कोई लॉट नहीं मिला।', mr: 'तुमच्या निकषांशी जुळणारा कोणताही शेतमाल लॉट आढळला नाही.' },
  { key: 'noOrdersFound', en: 'No orders recorded yet.', hi: 'अभी तक कोई ऑर्डर दर्ज नहीं किया गया है।', mr: 'अद्याप कोणतीही ऑर्डर नोंदवलेली नाही.' },
  { key: 'noStorageFound', en: 'No storage facilities found nearby.', hi: 'पास में कोई भंडारण सुविधा नहीं मिली।', mr: 'जवळ कोणतीही साठवणूक सुविधा आढळली नाही.' },
  { key: 'noChartData', en: 'Insufficient data to plot chart.', hi: 'चार्ट प्रदर्शित करने के लिए पर्याप्त डेटा नहीं है।', mr: 'आलेख काढण्यासाठी पुरेसा डेटा नाही.' }
];

expectedEmptyStates.forEach(es => {
  check(`Empty State: ${es.key}`, () => {
    assert.strictEqual(en.common[es.key], es.en);
    assert.strictEqual(hi.common[es.key], es.hi);
    assert.strictEqual(mr.common[es.key], es.mr);
  });
});

// ── TEST SUITE 5: TIME RANGES, MONTHS, DAYS & AXES ──
console.log('\n--- TEST SUITE 5: Time Ranges, Months, Days & Axes ---');

const expectedMonths = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
expectedMonths.forEach(m => {
  const k = `month${m}`;
  check(`Month: ${k}`, () => {
    assert.ok(en.common[k], `Missing EN for ${k}`);
    assert.ok(hi.common[k], `Missing HI for ${k}`);
    assert.ok(mr.common[k], `Missing MR for ${k}`);
    assert.ok(devanagariRegex.test(hi.common[k]));
    assert.ok(devanagariRegex.test(mr.common[k]));
  });
});

check('Chart Axes Localization', () => {
  assert.strictEqual(en.common.xAxisDistance, 'Distance from Origin (km)');
  assert.strictEqual(hi.common.xAxisDistance, 'मूल स्थान से दूरी (किमी)');
  assert.strictEqual(mr.common.xAxisDistance, 'मूळ ठिकाणापासून अंतर (किमी)');

  assert.strictEqual(en.common.yAxisNetProfit, 'Net Realization (₹/quintal after freight)');
  assert.strictEqual(hi.common.yAxisNetProfit, 'शुद्ध प्राप्ति (₹/क्विंटल भाड़ा उपरांत)');
  assert.strictEqual(mr.common.yAxisNetProfit, 'निव्वळ प्राप्ती (₹/क्विंटल वाहतूक वजा)');
});

// ── TEST SUITE 6: NUMERICAL INTEGRITY & DYNAMIC INTERPOLATION ──
console.log('\n--- TEST SUITE 6: Numerical Integrity in Tooltips & Interpolation ---');

function interpolate(template, params) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{{${k}}}`));
}

check('Freight Cost For Qty interpolation preserves numbers', () => {
  const resEn = interpolate(en.market.freightCostForQty, { qty: 25 });
  const resHi = interpolate(hi.market.freightCostForQty, { qty: 25 });
  const resMr = interpolate(mr.market.freightCostForQty, { qty: 25 });

  assert.strictEqual(resEn, 'Total Freight Cost (₹) for 25q');
  assert.strictEqual(resHi, '25 क्विंटल के लिए कुल मालभाड़ा (₹)');
  assert.strictEqual(resMr, '25 क्विंटलसाठी एकूण वाहतूक खर्च (₹)');
});

check('Distance & Price Label tooltip interpolation preserves numbers', () => {
  const distHi = interpolate(hi.market.distanceLabel, { distance: 48 });
  const distMr = interpolate(mr.market.distanceLabel, { distance: 48 });
  assert.strictEqual(distHi, 'दूरी: 48 किमी');
  assert.strictEqual(distMr, 'अंतर: 48 किमी');

  const priceHi = interpolate(hi.market.mandiPriceLabel, { price: '₹2,850' });
  const priceMr = interpolate(mr.market.mandiPriceLabel, { price: '₹2,850' });
  assert.strictEqual(priceHi, 'मंडी भाव: ₹2,850/क्विंटल');
  assert.strictEqual(priceMr, 'बाजार भाव: ₹2,850/क्विंटल');
});

check('Admin User Count & Percentage tooltip interpolation preserves numbers', () => {
  const userEn = interpolate(en.admin.usersCountPct, { label: 'Farmers', count: '856', pct: '68.5' });
  const userHi = interpolate(hi.admin.usersCountPct, { label: 'किसान', count: '856', pct: '68.5' });
  const userMr = interpolate(mr.admin.usersCountPct, { label: 'शेतकरी', count: '856', pct: '68.5' });

  assert.strictEqual(userEn, 'Farmers: 856 users (68.5%)');
  assert.strictEqual(userHi, 'किसान: 856 उपयोगकर्ता (68.5%)');
  assert.strictEqual(userMr, 'शेतकरी: 856 वापरकर्ते (68.5%)');
});

// ── TEST SUITE 7: CODEBASE AUDIT FOR DYNAMIC CHART RE-RENDERING ──
console.log('\n--- TEST SUITE 7: Dynamic Chart Re-rendering & Language Listeners ---');

const chartFiles = [
  'js/mandi-compare.js',
  'js/fpo-dashboard.js',
  'js/dashboard.js',
  'transporter/earnings.html',
  'admin/dashboard.html',
  'admin/users.html',
  'admin/reports.html',
  'admin/farmers.html'
];

chartFiles.forEach(file => {
  check(`File has 'languageChanged' listener and chart localization: ${file}`, () => {
    const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    assert.ok(content.includes('languageChanged'), `${file} is missing 'languageChanged' event listener`);
    assert.ok(
      content.includes('i18next') || content.includes('window.i18next') || content.includes("t('"),
      `${file} is missing i18n translation calls`
    );
  });
});

console.log('\n====================================================');
console.log(`STEP 14 VERIFICATION COMPLETED: ${passCount}/${totalChecks} CHECKS PASSED`);
console.log('====================================================');

if (passCount !== totalChecks) {
  process.exit(1);
} else {
  console.log('ALL STEP 14 DATA VISUALIZATION TRANSLATIONS VERIFIED SUCCESSFULLY!');
}
