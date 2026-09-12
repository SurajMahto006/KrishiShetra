/**
 * KrishiShetra - Farmer Portal Multilingual Runtime (i18n)
 * Supports English (en), Hindi (hi), Marathi (mr)
 * Designed strictly for Farmer, Auth, and Landing pages without side-effects on backend/API logic.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'krishi_lang';
  const SUPPORTED_LANGS = ['en', 'hi', 'mr'];
  const DEFAULT_LANG = 'en';
  let isSyncing = false;

  // Get current language from localStorage, fallback to default
  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  if (!SUPPORTED_LANGS.includes(currentLang)) {
    currentLang = DEFAULT_LANG;
  }

  /**
   * Get localized crop display name without changing internal crop IDs.
   * Supports base IDs ('tomato'), TitleCase ('Tomato'), and composite strings ('Tomato (Grade A)').
   */
  function getCropName(cropId, lang) {
    if (!cropId) return '';
    lang = lang || currentLang;
    var rawStr = String(cropId).trim();

    // Check if there's a parenthetical suffix like (Grade A)
    var suffix = '';
    var parenMatch = rawStr.match(/^([^(]+)(\s*\(.*\))$/);
    var baseName = rawStr;
    if (parenMatch) {
      baseName = parenMatch[1].trim();
      suffix = ' ' + parenMatch[2].trim();
    }

    var key = baseName.toLowerCase().trim();
    var translations = window.KrishiTranslations || {};
    var dict = translations[lang] || {};
    var enDict = translations['en'] || {};
    var cropsDict = dict.crops || {};
    var enCrops = enDict.crops || {};

    var translatedBase = cropsDict[key] || cropsDict[baseName] || enCrops[key] || enCrops[baseName];

    if (!translatedBase && window.KrishiSahayak && window.KrishiSahayakEngine && window.KrishiSahayakEngine.CROP_KEYWORDS) {
      var keywords = window.KrishiSahayakEngine.CROP_KEYWORDS[key];
      if (keywords && keywords.length) {
        translatedBase = keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1);
      }
    }

    if (!translatedBase) {
      translatedBase = key ? (key.charAt(0).toUpperCase() + key.slice(1)) : rawStr;
    }

    return translatedBase + suffix;
  }

  /**
   * Safe nested key lookup (e.g. 'farmer.dashboardTitle')
   */
  function t(key, fallback) {
    if (!key) return '';
    const translations = window.KrishiTranslations || {};
    const dict = translations[currentLang] || {};
    const enDict = translations['en'] || {};

    const resolve = (obj, path) => {
      return path.split('.').reduce((prev, curr) => (prev && prev[curr] !== undefined ? prev[curr] : undefined), obj);
    };

    // Try current language, fallback to English
    let val = resolve(dict, key);
    if (val !== undefined && val !== null) return val;

    let enVal = resolve(enDict, key);
    if (enVal !== undefined && enVal !== null) return enVal;

    // If flat key without dot, search across sections as fallback
    if (!key.includes('.')) {
      const sections = ['storage', 'farmer', 'common', 'navigation', 'marketplace', 'crops', 'demand', 'orders', 'buyers', 'aiforecast', 'mandiCompare', 'landing', 'auth', 'disputes'];
      for (const sec of sections) {
        if (dict[sec] && dict[sec][key] !== undefined) return dict[sec][key];
      }
      for (const sec of sections) {
        if (enDict[sec] && enDict[sec][key] !== undefined) return enDict[sec][key];
      }
    }

    return fallback !== undefined ? fallback : key;
  }

  /**
   * Translate a single element and its subtree (targeted dynamic translation)
   */
  function translateElement(root) {
    if (!root) return;

    // 1. Text elements
    const textEls = [];
    if (root.hasAttribute && root.hasAttribute('data-i18n')) {
      textEls.push(root);
    }
    if (root.querySelectorAll) {
      root.querySelectorAll('[data-i18n]').forEach(el => textEls.push(el));
    }

    textEls.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;

      const translated = t(key, null);
      if (translated === null) return;

      const textSpan = el.querySelector ? el.querySelector('.i18n-text') : null;
      if (textSpan) {
        textSpan.textContent = translated;
      } else {
        const hasElementChildren = el.childNodes && Array.from(el.childNodes).some(n => n.nodeType === Node.ELEMENT_NODE);
        if (hasElementChildren) {
          let updatedText = false;
          for (let i = el.childNodes.length - 1; i >= 0; i--) {
            if (el.childNodes[i].nodeType === Node.TEXT_NODE && el.childNodes[i].textContent.trim().length > 0) {
              el.childNodes[i].textContent = ' ' + translated.trim() + ' ';
              updatedText = true;
              break;
            }
          }
          if (!updatedText) el.textContent = translated;
        } else {
          el.textContent = translated;
        }
      }
    });

    // 2. Placeholders
    const placeholderEls = [];
    if (root.hasAttribute && root.hasAttribute('data-i18n-placeholder')) {
      placeholderEls.push(root);
    }
    if (root.querySelectorAll) {
      root.querySelectorAll('[data-i18n-placeholder]').forEach(el => placeholderEls.push(el));
    }
    placeholderEls.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.placeholder = t(key, el.placeholder);
    });

    // 3. Tooltips & Titles
    const titleEls = [];
    if (root.hasAttribute && root.hasAttribute('data-i18n-title')) {
      titleEls.push(root);
    }
    if (root.querySelectorAll) {
      root.querySelectorAll('[data-i18n-title]').forEach(el => titleEls.push(el));
    }
    titleEls.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) el.title = t(key, el.title);
    });

    // 4. Accessibility
    const ariaEls = [];
    if (root.hasAttribute && root.hasAttribute('data-i18n-aria-label')) {
      ariaEls.push(root);
    }
    if (root.querySelectorAll) {
      root.querySelectorAll('[data-i18n-aria-label]').forEach(el => ariaEls.push(el));
    }
    ariaEls.forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (key) el.setAttribute('aria-label', t(key, el.getAttribute('aria-label')));
    });
  }

  /**
   * Translate all DOM elements with data-i18n attributes
   */
  function translatePage() {
    translateElement(document.body || document.documentElement);
  }

  /**
   * Translates crop dropdown option DISPLAY labels while keeping option.value intact!
   */
  function translateDropdowns() {
    const translations = window.KrishiTranslations || {};
    const cropsDict = (translations[currentLang] && translations[currentLang].crops) || {};

    const cropSelects = document.querySelectorAll(
      'select#lot-crop-select, select#forecast-crop-select, select#cropType, select#cropSelect, select#forecastCrop, ' +
      'select#filter-crop, select#compare-crop, select#chart-crop-select, select#alert-crop-input, ' +
      'select#mpc-crop-select, select#filter-storage-crop, select#calc-crop-select, select#book-crop-select, ' +
      'select[name="crop"], select.crop-select'
    );
    cropSelects.forEach(select => {
      Array.from(select.options).forEach(opt => {
        const val = (opt.value || '').toLowerCase().trim();
        if (cropsDict[val]) {
          opt.textContent = cropsDict[val];
        } else if (cropsDict[opt.value]) {
          opt.textContent = cropsDict[opt.value];
        }
      });
    });
  }

  /**
   * Inject language switcher and CSS-only header protection styles
   */
  function injectStyles() {
    if (document.getElementById('krishi-i18n-styles')) return;
    const style = document.createElement('style');
    style.id = 'krishi-i18n-styles';
    style.textContent = `
      /* Header & Nav Protection for Multilingual Text Expansion */
      .dash-header__nav {
        white-space: nowrap;
      }
      .dash-header__link {
        white-space: nowrap;
      }
      .dash-header__actions {
        white-space: nowrap;
      }
      .navbar__nav {
        white-space: nowrap !important;
      }
      .navbar__actions {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        flex-shrink: 0 !important;
      }
      .auth-card-box {
        position: relative;
      }
      .auth-card-box > .krishi-lang-switcher {
        align-self: flex-end;
        margin-bottom: 14px;
        margin-right: 0;
      }

      /* Profile Dropdown Language Selection */
      .dash-profile-dropdown__lang-box {
        padding: 10px 14px 12px;
      }
      .dash-profile-dropdown__lang-header {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #718096;
        margin-bottom: 8px;
      }
      .dash-profile-dropdown__lang-header svg {
        color: #2e7d32;
      }
      .dash-profile-lang-chips {
        display: flex;
        align-items: center;
        gap: 4px;
        background: #f7fafc;
        padding: 3px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      .dash-profile-lang-chips .krishi-lang-btn {
        flex: 1;
        text-align: center;
        padding: 5px 4px;
        font-size: 11.5px;
        font-weight: 600;
        border: none;
        background: transparent;
        color: #4a5568;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .dash-profile-lang-chips .krishi-lang-btn:hover {
        background: rgba(46, 125, 50, 0.08);
        color: #2e7d32;
      }
      .dash-profile-lang-chips .krishi-lang-btn.active {
        background: #2e7d32;
        color: #ffffff;
        box-shadow: 0 1px 3px rgba(46, 125, 50, 0.3);
      }

      /* Mobile Nav Language */
      .dash-mobile-lang-box {
        padding: 12px 16px;
        border-top: 1px solid #e2e8f0;
        margin-top: 8px;
      }
      .dash-mobile-lang-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: #718096;
        margin-bottom: 8px;
      }

      /* Language Switcher Pill (Landing page) */
      .krishi-lang-switcher {
        display: inline-flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid rgba(46, 125, 50, 0.25);
        border-radius: 20px;
        padding: 2px 4px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        margin-right: 8px;
        vertical-align: middle;
        user-select: none;
        backdrop-filter: blur(6px);
        flex-shrink: 0;
      }
      .krishi-lang-btn {
        background: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        padding: 4px 9px;
        font-size: 11.5px;
        font-weight: 600;
        color: #4a5568;
        border-radius: 14px;
        transition: all 0.2s ease;
        line-height: 1.2;
        white-space: nowrap;
      }
      .krishi-lang-btn:hover {
        color: #2e7d32;
        background: rgba(46, 125, 50, 0.08);
      }
      .krishi-lang-btn.active {
        background: #2e7d32;
        color: #ffffff;
        box-shadow: 0 2px 4px rgba(46, 125, 50, 0.25);
      }
      @media (max-width: 768px) {
        .krishi-lang-switcher {
          margin-right: 4px;
          padding: 1px 2px;
        }
        .krishi-lang-btn {
          padding: 3px 6px;
          font-size: 10.5px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Mount the language selector into profile dropdown (farmer) or landing navbar
   */
  function mountSelector() {
    // 1. Auth pages: never mount visible switcher; krishi_lang is used automatically
    if (
      document.querySelector('.auth-card-box') ||
      document.querySelector('.auth-page') ||
      (window.location && window.location.pathname && window.location.pathname.includes('login')) ||
      (window.location && window.location.pathname && window.location.pathname.includes('register'))
    ) {
      return;
    }

    injectStyles();

    // 2. Farmer pages: mount in profile dropdown (and mobile nav)
    const profileDropdown = document.getElementById('dash-profile-dropdown');
    if (profileDropdown) {
      if (!document.getElementById('krishi-profile-lang-box')) {
        const langBox = document.createElement('div');
        langBox.id = 'krishi-profile-lang-box';
        langBox.className = 'dash-profile-dropdown__lang-box';
        langBox.innerHTML = `
          <div class="dash-profile-dropdown__sep" style="margin: 0 -14px 10px -14px;"></div>
          <div class="dash-profile-dropdown__lang-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span data-i18n="common.language">Language / भाषा</span>
          </div>
          <div class="dash-profile-lang-chips" role="group" aria-label="Language selection">
            <button type="button" class="krishi-lang-btn${currentLang === 'en' ? ' active' : ''}" data-lang="en">English</button>
            <button type="button" class="krishi-lang-btn${currentLang === 'hi' ? ' active' : ''}" data-lang="hi">हिंदी</button>
            <button type="button" class="krishi-lang-btn${currentLang === 'mr' ? ' active' : ''}" data-lang="mr">मराठी</button>
          </div>
        `;

        const logoutItem = profileDropdown.querySelector('.dash-profile-dropdown__item--danger');
        if (logoutItem) {
          profileDropdown.insertBefore(langBox, logoutItem);
        } else {
          profileDropdown.appendChild(langBox);
        }

        langBox.querySelectorAll('.krishi-lang-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            changeLanguage(btn.getAttribute('data-lang'), 'profile');
          });
        });
      }

      // Mobile slide nav
      const mobileNav = document.getElementById('dash-mobile-nav');
      if (mobileNav && !document.getElementById('krishi-mobile-lang-box')) {
        const mLinks = mobileNav.querySelector('.dash-mobile-nav__links') || mobileNav;
        const mBox = document.createElement('div');
        mBox.id = 'krishi-mobile-lang-box';
        mBox.className = 'dash-mobile-lang-box';
        mBox.innerHTML = `
          <div class="dash-mobile-lang-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span data-i18n="common.language">Language / भाषा</span>
          </div>
          <div class="dash-profile-lang-chips" role="group" aria-label="Language selection">
            <button type="button" class="krishi-lang-btn${currentLang === 'en' ? ' active' : ''}" data-lang="en">English</button>
            <button type="button" class="krishi-lang-btn${currentLang === 'hi' ? ' active' : ''}" data-lang="hi">हिंदी</button>
            <button type="button" class="krishi-lang-btn${currentLang === 'mr' ? ' active' : ''}" data-lang="mr">मराठी</button>
          </div>
        `;
        mLinks.appendChild(mBox);
        mBox.querySelectorAll('.krishi-lang-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage(btn.getAttribute('data-lang'), 'mobile-nav');
          });
        });
      }

      updateSelectorUI();
      return;
    }

    // 3. Landing page: Mount in landing container or navbar actions
    const landingTarget = document.querySelector('#krishi-lang-switcher-landing') ||
      document.querySelector('.navbar__actions');
    if (landingTarget && !document.getElementById('krishi-lang-switcher')) {
      const switcher = document.createElement('div');
      switcher.id = 'krishi-lang-switcher';
      switcher.className = 'krishi-lang-switcher';
      switcher.setAttribute('role', 'group');
      switcher.setAttribute('aria-label', 'Select Language');

      const langs = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिंदी' },
        { code: 'mr', label: 'मराठी' }
      ];

      langs.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'krishi-lang-btn' + (item.code === currentLang ? ' active' : '');
        btn.setAttribute('data-lang', item.code);
        btn.textContent = item.label;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          changeLanguage(item.code, 'landing');
        });
        switcher.appendChild(btn);
      });

      landingTarget.appendChild(switcher);
      updateSelectorUI();
    }
  }

  /**
   * Update active class on all selector buttons across page
   */
  function updateSelectorUI() {
    const buttons = document.querySelectorAll('.krishi-lang-btn[data-lang]');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-lang') === currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Switch active language with recursion protection
   */
  function changeLanguage(lang, source) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    if (isSyncing) return;
    if (lang === currentLang && !source) return;

    isSyncing = true;
    currentLang = lang;
    document.documentElement.lang = currentLang;

    try {
      localStorage.setItem(STORAGE_KEY, lang);
      localStorage.setItem(STORAGE_KEY + '_updated_at', Date.now().toString());
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }

    updateSelectorUI();
    translatePage();
    translateDropdowns();

    // Bridge with Krishi Sahayak Voice & Chatbot if not initiated by chatbot
    if (source !== 'chatbot') {
      if (window.LanguageDetector) {
        window.LanguageDetector.currentLanguage = lang;
      }
      if (window.KrishiSahayakVoice && typeof window.KrishiSahayakVoice.setLanguage === 'function') {
        window.KrishiSahayakVoice.setLanguage(lang);
      }
      const chatbotSelect = document.getElementById('ks-voice-lang-select');
      if (chatbotSelect && chatbotSelect.value !== lang) {
        chatbotSelect.value = lang;
      }
    }

    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang, source: source || 'website' } }));
    isSyncing = false;
  }

  function handleChatbotLanguageChange(lang) {
    if (isSyncing) return;
    changeLanguage(lang, 'chatbot');
  }

  // Listen for chatbot-initiated language changes
  window.addEventListener('chatbotLanguageChanged', function (e) {
    if (e && e.detail && e.detail.lang) {
      handleChatbotLanguageChange(e.detail.lang);
    }
  });

  // Public API
  window.KrishiI18n = {
    t: t,
    changeLanguage: changeLanguage,
    getLanguage: function () { return currentLang; },
    translatePage: translatePage,
    translateElement: translateElement,
    translateDropdowns: translateDropdowns,
    mountSelector: mountSelector,
    getCropName: getCropName,
    handleChatbotLanguageChange: handleChatbotLanguageChange
  };

  // Initialization on DOM ready
  function init() {
    document.documentElement.lang = currentLang;
    mountSelector();
    translatePage();
    translateDropdowns();

    // Bridge with Krishi Sahayak immediately on load
    if (window.LanguageDetector) {
      window.LanguageDetector.currentLanguage = currentLang;
    }
    if (window.KrishiSahayakVoice && typeof window.KrishiSahayakVoice.setLanguage === 'function') {
      window.KrishiSahayakVoice.setLanguage(currentLang);
    }

    // Listen for dynamically loaded content or modals
    if (typeof MutationObserver !== 'undefined' && document.body) {
      const observer = new MutationObserver((mutations) => {
        let shouldTranslate = false;
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length > 0) {
            for (const node of m.addedNodes) {
              if (node.nodeType === 1 /* ELEMENT_NODE */) {
                if (node.id === 'krishi-lang-switcher' || (node.classList && node.classList.contains('krishi-lang-switcher'))) {
                  continue;
                }
                if (node.hasAttribute && (node.hasAttribute('data-i18n') || (node.querySelector && node.querySelector('[data-i18n]')))) {
                  shouldTranslate = true;
                  break;
                }
              }
            }
          }
          if (shouldTranslate) break;
        }
        if (shouldTranslate) {
          translatePage();
          translateDropdowns();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
