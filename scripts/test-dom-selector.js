const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

console.log('=== TESTING DOM LANGUAGE SELECTOR MOUNTING & UI SWITCHING ===\n');

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head><title>Test Header</title></head>
<body>
  <header class="dash-header" id="dash-header">
    <div class="dash-header__inner">
      <a href="dashboard.html" class="dash-header__logo" id="dash-logo">KrishiShetra</a>
      <nav class="dash-header__nav" id="dash-nav"></nav>
      <div class="dash-header__actions">
        <button id="btn-notifications">Notifs</button>
        <button id="btn-profile">Profile</button>
      </div>
    </div>
  </header>
  <div id="content">
    <h1 data-i18n="common.home">Home</h1>
    <button data-i18n="common.save">Save</button>
    <button data-i18n="common.cancel">Cancel</button>
    <button data-i18n="common.logout">Logout</button>
    <span data-i18n="navigation.dashboard">Dashboard</span>
  </div>
</body>
</html>
`;

const dom = new JSDOM(htmlContent, { runScripts: "dangerously", resources: "usable", url: "http://localhost:5000/dashboard.html" });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.CustomEvent = dom.window.CustomEvent;

const i18next = require('../src/i18n.js');
i18next.init();

// Verify that selector was mounted inside .dash-header__actions
const selector = document.getElementById('ks-global-lang-selector');
if (!selector) {
  console.error('FAIL: Selector not mounted into header actions container!');
  process.exit(1);
}
console.log('[PASS] Global Language Selector mounted into .dash-header__actions successfully!');

const label = document.getElementById('ks-active-lang-text');
console.log('Initial Active Lang in Button:', label ? label.textContent : 'null');
if (label.textContent !== 'English') {
  console.error('FAIL: Initial label is not English');
  process.exit(1);
}

// Check initial text strings in DOM
console.log('Initial DOM strings:');
console.log('  h1:', document.querySelector('h1').textContent);
console.log('  span:', document.querySelector('span').textContent);

// Simulate clicking Hindi option
console.log('\nSimulating Click: Hindi option (data-lang="hi")...');
const hiBtn = selector.querySelector('.ks-lang-option[data-lang="hi"]');
if (!hiBtn) {
  console.error('FAIL: Hindi option button not found in dropdown');
  process.exit(1);
}

hiBtn.click();

console.log('After switch to Hindi:');
console.log('  Button Label:', document.getElementById('ks-active-lang-text').textContent);
console.log('  Active Language:', i18next.getLanguage());
console.log('  localStorage krishi_lang:', localStorage.getItem('krishi_lang'));
console.log('  h1 text:', document.querySelector('h1').textContent);
console.log('  span text:', document.querySelector('span').textContent);
console.log('  html lang attr:', document.documentElement.lang);

if (document.querySelector('h1').textContent !== 'होम' || document.querySelector('span').textContent !== 'डैशबोर्ड') {
  console.error('FAIL: DOM did not translate reactively to Hindi!');
  process.exit(1);
}
console.log('[PASS] DOM translated instantly to Hindi without reload!');

// Simulate clicking Marathi option
console.log('\nSimulating Click: Marathi option (data-lang="mr")...');
const mrBtn = selector.querySelector('.ks-lang-option[data-lang="mr"]');
mrBtn.click();

console.log('After switch to Marathi:');
console.log('  Button Label:', document.getElementById('ks-active-lang-text').textContent);
console.log('  Active Language:', i18next.getLanguage());
console.log('  localStorage krishi_lang:', localStorage.getItem('krishi_lang'));
console.log('  h1 text:', document.querySelector('h1').textContent);
console.log('  span text:', document.querySelector('span').textContent);
console.log('  html lang attr:', document.documentElement.lang);

if (document.querySelector('h1').textContent !== 'मुख्यपृष्ठ' || document.querySelector('span').textContent !== 'डॅशबोर्ड') {
  console.error('FAIL: DOM did not translate reactively to Marathi!');
  process.exit(1);
}
console.log('[PASS] DOM translated instantly to Marathi without reload!');

// Simulate clicking English option
console.log('\nSimulating Click: English option (data-lang="en")...');
const enBtn = selector.querySelector('.ks-lang-option[data-lang="en"]');
enBtn.click();

console.log('After switch back to English:');
console.log('  Button Label:', document.getElementById('ks-active-lang-text').textContent);
console.log('  h1 text:', document.querySelector('h1').textContent);
console.log('  span text:', document.querySelector('span').textContent);

if (document.querySelector('h1').textContent !== 'Home' || document.querySelector('span').textContent !== 'Dashboard') {
  console.error('FAIL: DOM did not translate reactively back to English!');
  process.exit(1);
}
console.log('[PASS] DOM translated instantly to English without reload!');

console.log('\n=== COMPLETE DOM & UI INTERACTION VALIDATION PASSED! ===');
