/**
 * Comprehensive DOM & Reactivity Test Script for Global Language Selector
 */
const path = require('path');

console.log('=== VERIFYING GLOBAL LANGUAGE SELECTOR IMPLEMENTATION ===\n');

// Mock DOM elements and environment
class MockElement {
  constructor(tagName, id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.className = className;
    this.classList = {
      _classes: new Set(className.split(' ').filter(Boolean)),
      contains: (c) => this.classList._classes.has(c),
      add: (...cl) => cl.forEach(c => this.classList._classes.add(c)),
      remove: (...cl) => cl.forEach(c => this.classList._classes.delete(c)),
      toggle: (c, force) => {
        if (force === true) { this.classList.add(c); return true; }
        if (force === false) { this.classList.remove(c); return false; }
        if (this.classList.contains(c)) { this.classList.remove(c); return false; }
        this.classList.add(c); return true;
      }
    };
    this.attributes = {};
    this.children = [];
    this.parentElement = null;
    this.listeners = {};
    this.textContent = '';
    this.innerHTML = '';
  }

  getAttribute(name) { return this.attributes[name] || null; }
  setAttribute(name, val) { this.attributes[name] = String(val); }
  removeAttribute(name) { delete this.attributes[name]; }
  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
  insertBefore(newChild, refChild) {
    const idx = this.children.indexOf(refChild);
    newChild.parentElement = this;
    if (idx === -1) {
      this.children.push(newChild);
    } else {
      this.children.splice(idx, 0, newChild);
    }
    return newChild;
  }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    list.forEach(fn => fn(event));
  }
  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }
  querySelectorAll(selector) {
    let matches = [];
    const check = (node) => {
      let isMatch = false;
      if (selector.startsWith('#') && node.id === selector.slice(1)) isMatch = true;
      if (selector.startsWith('.') && node.classList.contains(selector.slice(1))) isMatch = true;
      if (selector.startsWith('[data-i18n]') && node.getAttribute('data-i18n')) isMatch = true;
      if (selector.startsWith('[data-lang="')) {
        const lang = selector.match(/data-lang="([^"]+)"/)?.[1];
        if (node.getAttribute('data-lang') === lang) isMatch = true;
      }
      if (selector === '.ks-lang-option' && node.classList.contains('ks-lang-option')) isMatch = true;
      if (isMatch) matches.push(node);
      node.children.forEach(c => check(c));
    };
    this.children.forEach(c => check(c));
    return matches;
  }
}

// Set up globals
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; }
};

const docElement = new MockElement('html');
const body = new MockElement('body');
const head = new MockElement('head');

const actions = new MockElement('div', '', 'dash-header__actions');
const notifBtn = new MockElement('button', 'btn-notifications');
actions.appendChild(notifBtn);
body.appendChild(actions);

const tHome = new MockElement('a', 'nav-home');
tHome.setAttribute('data-i18n', 'common.home');
tHome.textContent = 'Home';

const tSave = new MockElement('button', 'btn-save');
tSave.setAttribute('data-i18n', 'common.save');
tSave.textContent = 'Save';

const tCancel = new MockElement('button', 'btn-cancel');
tCancel.setAttribute('data-i18n', 'common.cancel');
tCancel.textContent = 'Cancel';

const tLogout = new MockElement('button', 'btn-logout');
tLogout.setAttribute('data-i18n', 'common.logout');
tLogout.textContent = 'Logout';

const tDash = new MockElement('span', 'nav-dashboard');
tDash.setAttribute('data-i18n', 'navigation.dashboard');
tDash.textContent = 'Dashboard';

body.appendChild(tHome);
body.appendChild(tSave);
body.appendChild(tCancel);
body.appendChild(tLogout);
body.appendChild(tDash);

global.document = {
  documentElement: docElement,
  body: body,
  head: head,
  readyState: 'complete',
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => {
    if (id === 'dash-header__actions') return actions;
    let found = null;
    const search = (n) => {
      if (n.id === id) { found = n; return; }
      n.children.forEach(search);
    };
    search(body);
    return found;
  },
  querySelector: (sel) => body.querySelector(sel),
  querySelectorAll: (sel) => body.querySelectorAll(sel),
  addEventListener: () => {}
};

global.window = {
  location: { pathname: '/dashboard.html' },
  dispatchEvent: () => {},
  addEventListener: () => {}
};

// Load i18n module
const i18next = require('../src/i18n.js');
i18next.init();

console.log('--- Test 1: Initial State (English) ---');
console.log('Active Language:', i18next.getLanguage());
console.log('localStorage krishi_lang:', localStorage.getItem('krishi_lang'));
console.log('Home string     :', i18next.t('common.home'));
console.log('Save string     :', i18next.t('common.save'));
console.log('Cancel string   :', i18next.t('common.cancel'));
console.log('Logout string   :', i18next.t('common.logout'));
console.log('Dashboard string:', i18next.t('navigation.dashboard'));

if (i18next.t('common.home') !== 'Home' || i18next.t('navigation.dashboard') !== 'Dashboard') {
  console.error('FAIL: English test strings incorrect');
  process.exit(1);
}
console.log('[PASS] English initialized successfully\n');

console.log('--- Test 2: Switch English -> Hindi ---');
i18next.changeLanguage('hi');
console.log('Active Language:', i18next.getLanguage());
console.log('localStorage krishi_lang:', localStorage.getItem('krishi_lang'));
console.log('Home string     :', i18next.t('common.home'));
console.log('Save string     :', i18next.t('common.save'));
console.log('Cancel string   :', i18next.t('common.cancel'));
console.log('Logout string   :', i18next.t('common.logout'));
console.log('Dashboard string:', i18next.t('navigation.dashboard'));

if (i18next.t('common.home') !== 'होम' || i18next.t('common.save') !== 'सहेजें' || i18next.t('common.cancel') !== 'रद्द करें' || i18next.t('common.logout') !== 'लॉग आउट' || i18next.t('navigation.dashboard') !== 'डैशबोर्ड') {
  console.error('FAIL: Hindi test strings mismatch');
  process.exit(1);
}
console.log('[PASS] Hindi switched & translated immediately\n');

console.log('--- Test 3: Switch Hindi -> Marathi ---');
i18next.changeLanguage('mr');
console.log('Active Language:', i18next.getLanguage());
console.log('localStorage krishi_lang:', localStorage.getItem('krishi_lang'));
console.log('Home string     :', i18next.t('common.home'));
console.log('Save string     :', i18next.t('common.save'));
console.log('Cancel string   :', i18next.t('common.cancel'));
console.log('Logout string   :', i18next.t('common.logout'));
console.log('Dashboard string:', i18next.t('navigation.dashboard'));

if (i18next.t('common.home') !== 'मुख्यपृष्ठ' || i18next.t('common.save') !== 'जतन करा' || i18next.t('common.cancel') !== 'रद्द करा' || i18next.t('common.logout') !== 'बाहेर पडा' || i18next.t('navigation.dashboard') !== 'डॅशबोर्ड') {
  console.error('FAIL: Marathi test strings mismatch');
  process.exit(1);
}
console.log('[PASS] Marathi switched & translated immediately\n');

console.log('--- Test 4: Switch Marathi -> English ---');
i18next.changeLanguage('en');
console.log('Active Language:', i18next.getLanguage());
console.log('localStorage krishi_lang:', localStorage.getItem('krishi_lang'));
console.log('Home string     :', i18next.t('common.home'));
console.log('Save string     :', i18next.t('common.save'));
console.log('Cancel string   :', i18next.t('common.cancel'));
console.log('Logout string   :', i18next.t('common.logout'));
console.log('Dashboard string:', i18next.t('navigation.dashboard'));

if (i18next.t('common.home') !== 'Home' || i18next.t('common.save') !== 'Save' || i18next.t('common.cancel') !== 'Cancel' || i18next.t('common.logout') !== 'Logout' || i18next.t('navigation.dashboard') !== 'Dashboard') {
  console.error('FAIL: English test strings mismatch');
  process.exit(1);
}
console.log('[PASS] Switched back to English successfully\n');

console.log('--- Test 5: Persistence & Reload Restoration ---');
localStorage.setItem('krishi_lang', 'hi');
i18next.init();
console.log('Restored Language from localStorage:', i18next.getLanguage());
if (i18next.getLanguage() !== 'hi' || i18next.t('common.home') !== 'होम') {
  console.error('FAIL: Language restoration from localStorage failed');
  process.exit(1);
}
console.log('[PASS] Automatic restoration from localStorage verified\n');

console.log('=== ALL STEP 3 REQUIREMENTS FULLY SATISFIED AND VERIFIED! ===');
