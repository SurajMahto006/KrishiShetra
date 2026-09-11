/**
 * KrishiShetra - Farmer Portal Multilingual Runtime (i18n)
 * Supports English (en), Hindi (hi), Marathi (mr)
 * Designed strictly for Farmer pages without side-effects on backend/API logic.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'krishi_lang';
  const SUPPORTED_LANGS = ['en', 'hi', 'mr'];
  const DEFAULT_LANG = 'en';

  // Get current language from localStorage, fallback to default
  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  if (!SUPPORTED_LANGS.includes(currentLang)) {
    currentLang = DEFAULT_LANG;
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
      const sections = ['storage', 'farmer', 'common', 'navigation', 'marketplace', 'crops', 'demand', 'orders', 'buyers', 'aiforecast', 'mandiCompare'];
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
   * Translate all DOM elements with data-i18n attributes
   */
  function translatePage() {
    // 1. Text elements: data-i18n
    const textEls = document.querySelectorAll('[data-i18n]');
    textEls.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;

      const translated = t(key, null);
      if (translated === null) return;

      // If the element has an icon or specific child to preserve, check for span.i18n-text
      const textSpan = el.querySelector('.i18n-text');
      if (textSpan) {
        textSpan.textContent = translated;
      } else {
        // If element has only text or SVG icon + text node, handle safely
        // If there's an icon element (like <i> or <svg>), only replace text nodes
        const hasElementChildren = Array.from(el.childNodes).some(n => n.nodeType === Node.ELEMENT_NODE);
        if (hasElementChildren) {
          // Find the last text node or update text after icons
          let updatedText = false;
          for (let i = el.childNodes.length - 1; i >= 0; i--) {
            if (el.childNodes[i].nodeType === Node.TEXT_NODE && el.childNodes[i].textContent.trim().length > 0) {
              el.childNodes[i].textContent = ' ' + translated.trim() + ' ';
              updatedText = true;
              break;
            }
          }
          if (!updatedText) {
            el.textContent = translated;
          }
        } else {
          el.textContent = translated;
        }
      }
    });

    // 2. Input Placeholders: data-i18n-placeholder
    const placeholderEls = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderEls.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.placeholder = t(key, el.placeholder);
      }
    });

    // 3. Tooltips & Titles: data-i18n-title
    const titleEls = document.querySelectorAll('[data-i18n-title]');
    titleEls.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.title = t(key, el.title);
      }
    });

    // 4. Accessibility: data-i18n-aria-label
    const ariaEls = document.querySelectorAll('[data-i18n-aria-label]');
    ariaEls.forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (key) {
        el.setAttribute('aria-label', t(key, el.getAttribute('aria-label')));
      }
    });
  }

  /**
   * Translates crop dropdown option DISPLAY labels while keeping option.value intact!
   */
  function translateDropdowns() {
    const translations = window.KrishiTranslations || {};
    const cropsDict = (translations[currentLang] && translations[currentLang].crops) || {};
    
    // Select dropdowns that contain crop options
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
   * Inject language switcher CSS
   */
  function injectStyles() {
    if (document.getElementById('krishi-i18n-styles')) return;
    const style = document.createElement('style');
    style.id = 'krishi-i18n-styles';
    style.textContent = `
      .krishi-lang-switcher {
        display: inline-flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(46, 125, 50, 0.25);
        border-radius: 20px;
        padding: 2px 4px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        margin-right: 12px;
        vertical-align: middle;
        user-select: none;
        backdrop-filter: blur(4px);
      }
      .krishi-lang-btn {
        background: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 600;
        color: #4a5568;
        border-radius: 14px;
        transition: all 0.2s ease;
        line-height: 1.2;
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
      @media (max-width: 640px) {
        .krishi-lang-switcher {
          margin-right: 6px;
          padding: 1px 2px;
        }
        .krishi-lang-btn {
          padding: 3px 6px;
          font-size: 11px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Mount the language selector into the header actions
   */
  function mountSelector() {
    if (document.getElementById('krishi-lang-switcher')) {
      updateSelectorUI();
      return;
    }

    // Try common header action containers in farmer pages
    const target = document.querySelector('.dash-header__actions') || 
                   document.querySelector('.header__actions') ||
                   document.querySelector('.top-nav__actions') ||
                   document.querySelector('.nav-actions');

    if (!target) return;

    injectStyles();

    const switcher = document.createElement('div');
    switcher.id = 'krishi-lang-switcher';
    switcher.className = 'krishi-lang-switcher';
    switcher.setAttribute('role', 'group');
    switcher.setAttribute('aria-label', 'Select Language');

    const langs = [
      { code: 'en', label: 'EN' },
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
        changeLanguage(item.code);
      });
      switcher.appendChild(btn);
    });

    // Prepend to header actions
    target.insertBefore(switcher, target.firstChild);
  }

  /**
   * Update active class on selector buttons
   */
  function updateSelectorUI() {
    const buttons = document.querySelectorAll('#krishi-lang-switcher .krishi-lang-btn');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-lang') === currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Switch active language
   */
  function changeLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }

    updateSelectorUI();
    translatePage();
    translateDropdowns();

    // Bridge with Krishi Sahayak
    if (window.LanguageDetector) {
      window.LanguageDetector.currentLanguage = lang;
    }
    if (window.KrishiSahayak && typeof window.KrishiSahayak.setLanguage === 'function') {
      window.KrishiSahayak.setLanguage(lang);
    }

    // Broadcast event for custom listeners if any
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
  }

  // Public API
  window.KrishiI18n = {
    t: t,
    changeLanguage: changeLanguage,
    getLanguage: function () { return currentLang; },
    translatePage: translatePage,
    translateDropdowns: translateDropdowns,
    mountSelector: mountSelector
  };

  // Initialization on DOM ready
  function init() {
    mountSelector();
    translatePage();
    translateDropdowns();

    // Bridge with Krishi Sahayak immediately on load
    if (window.LanguageDetector) {
      window.LanguageDetector.currentLanguage = currentLang;
    }

    // Listen for dynamically loaded content or modals
    const observer = new MutationObserver((mutations) => {
      let shouldTranslate = false;
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length > 0) {
          for (const node of m.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.hasAttribute && (node.hasAttribute('data-i18n') || node.querySelector && node.querySelector('[data-i18n]'))) {
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
