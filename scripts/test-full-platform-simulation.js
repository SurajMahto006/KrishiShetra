const fs = require('fs');
const path = require('path');

console.log('=== RUNNING FULL MULTILINGUAL PLATFORM SIMULATION ===\n');

// Mock localStorage and window
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

const i18n = require('../js/i18n.js');

const htmlFiles = [
  'index.html',
  'dashboard.html',
  'lots.html',
  'market.html',
  'ai-forecast.html',
  'storage.html',
  'fpo-dashboard.html',
  'mandi-compare.html',
  'buyers.html',
  'orders.html',
  'disputes.html',
  'register.html',
  'login.html',
  'admin/dashboard.html',
  'admin/farmers.html',
  'admin/storage.html',
  'admin/users.html',
  'admin/reports.html',
  'admin/settings.html',
  'transporter/dashboard.html',
  'transporter/available-loads.html',
  'transporter/active-trips.html',
  'transporter/fleet.html',
  'transporter/drivers.html',
  'transporter/earnings.html',
  'transporter/onboarding.html',
  'transporter/profile.html'
];

let totalKeysChecked = 0;
let filesTested = 0;

for (const relPath of htmlFiles) {
  const fullPath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) continue;

  filesTested++;
  const html = fs.readFileSync(fullPath, 'utf8');

  // Extract all data-i18n keys
  const tagRegex = /data-i18n(?:-[a-z]+)?=["']([^"']+)["']/g;
  let match;
  const keys = [];
  while ((match = tagRegex.exec(html)) !== null) {
    keys.push(match[1]);
  }

  // Test that every single key resolves in all 3 languages
  for (const lang of ['en', 'hi', 'mr']) {
    i18n.changeLanguage(lang);
    for (const key of keys) {
      totalKeysChecked++;
      const translated = i18n.t(key);
      if (!translated || translated === key) {
        // Fallback check
        console.error(`[FAIL] ${relPath} [${lang}] Key "${key}" failed to resolve.`);
        process.exit(1);
      }
    }
  }
}

console.log(`Successfully verified ${filesTested} HTML files across EN, HI, and MR.`);
console.log(`Total key translation evaluations performed: ${totalKeysChecked}`);
console.log('Zero missing keys. All keys successfully resolve in English, Hindi, and Marathi!');
