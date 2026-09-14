const fs = require('fs');
const assert = require('assert');

const transCode = fs.readFileSync('js/translations.js', 'utf8');
const i18nCode = fs.readFileSync('js/i18n.js', 'utf8');

const mockWindow = {
  location: { pathname: '/dashboard.html' },
  localStorage: {
    getItem: () => 'mr',
    setItem: () => {}
  },
  document: {
    documentElement: { lang: 'mr' },
    head: { appendChild: () => {} },
    body: { querySelectorAll: () => [] },
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
      setAttribute: () => {},
      appendChild: () => {},
      classList: { add: () => {}, remove: () => {} },
      style: {}
    }),
    readyState: 'complete',
    addEventListener: () => {}
  },
  dispatchEvent: () => {},
  addEventListener: () => {}
};

new Function('window', transCode)(mockWindow);
new Function('window', 'document', 'localStorage', i18nCode)(
  mockWindow,
  mockWindow.document,
  mockWindow.localStorage
);

const i18n = mockWindow.KrishiI18n;

const expected = [
  { id: 'rice', en: 'Rice', hi: 'चावल', mr: 'तांदूळ' },
  { id: 'wheat', en: 'Wheat', hi: 'गेहूँ', mr: 'गहू' },
  { id: 'maize', en: 'Maize', hi: 'मक्का', mr: 'मका' },
  { id: 'soybean', en: 'Soybean', hi: 'सोयाबीन', mr: 'सोयाबीन' },
  { id: 'pulses', en: 'Pulses', hi: 'दलहन', mr: 'कडधान्ये' },
  { id: 'onion', en: 'Onion', hi: 'प्याज़', mr: 'कांदा' },
  { id: 'tomato', en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' },
  { id: 'potato', en: 'Potato', hi: 'आलू', mr: 'बटाटा' },
  { id: 'chilli', en: 'Chilli', hi: 'मिर्च', mr: 'मिरची' },
  { id: 'groundnut', en: 'Groundnut', hi: 'मूंगफली', mr: 'भुईमूग' },
  { id: 'cotton', en: 'Cotton', hi: 'कपास', mr: 'कापूस' },
  { id: 'sugarcane', en: 'Sugarcane', hi: 'गन्ना', mr: 'ऊस' },
  { id: 'mango', en: 'Mango', hi: 'आम', mr: 'आंबा' },
  { id: 'banana', en: 'Banana', hi: 'केला', mr: 'केळी' },
  { id: 'grapes', en: 'Grapes', hi: 'अंगूर', mr: 'द्राक्षे' },
  { id: 'turmeric', en: 'Turmeric', hi: 'हल्दी', mr: 'हळद' },
  { id: 'ginger', en: 'Ginger', hi: 'अदरक', mr: 'आले' },
  { id: 'garlic', en: 'Garlic', hi: 'लहसुन', mr: 'लसूण' },
  { id: 'mustard', en: 'Mustard', hi: 'सरसों', mr: 'मोहरी' },
  { id: 'bajra', en: 'Bajra', hi: 'बाजरा', mr: 'बाजरी' },
  { id: 'jowar', en: 'Jowar', hi: 'ज्वार', mr: 'ज्वारी' }
];

console.log('=== VERIFYING CROP NAME MAPPINGS ===');
expected.forEach(c => {
  const enVal = i18n.getCropName(c.id, 'en');
  const hiVal = i18n.getCropName(c.id, 'hi');
  const mrVal = i18n.getCropName(c.id, 'mr');

  assert.strictEqual(enVal, c.en, `EN mismatch for ${c.id}: got ${enVal}, expected ${c.en}`);
  assert.strictEqual(hiVal, c.hi, `HI mismatch for ${c.id}: got ${hiVal}, expected ${c.hi}`);
  assert.strictEqual(mrVal, c.mr, `MR mismatch for ${c.id}: got ${mrVal}, expected ${c.mr}`);

  console.log(`✓ ${c.id.padEnd(12)} -> EN: ${enVal.padEnd(10)} | HI: ${hiVal.padEnd(10)} | MR: ${mrVal}`);
});

console.log('\nAll crop translations match requested agricultural terminology perfectly!');
