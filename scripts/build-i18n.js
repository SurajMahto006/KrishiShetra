const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(localesDir, 'hi.json'), 'utf8'));
const mr = JSON.parse(fs.readFileSync(path.join(localesDir, 'mr.json'), 'utf8'));

const i18nTemplate = `/**
 * KRISHISHETRA — GLOBAL i18n CONFIGURATION & UNIVERSAL LANGUAGE SELECTOR
 * Central Internationalization Module
 * 
 * Supported Languages:
 *  - English: 'en' (Default Fallback) -> "English"
 *  - Hindi:   'hi'                     -> "हिंदी"
 *  - Marathi: 'mr'                     -> "मराठी"
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.i18next = root.i18next || factory();
    root.I18n = root.i18next;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'krishi_lang';
  const FALLBACK_LANG = 'en';
  const SUPPORTED_LANGS = ['en', 'hi', 'mr'];

  const LANG_LABELS = {
    en: { name: 'English', native: 'English', flag: '🌐' },
    hi: { name: 'हिंदी', native: 'Hindi', flag: '🌐' },
    mr: { name: 'मराठी', native: 'Marathi', flag: '🌐' }
  };

  // Bundled locale resources for all 20 categories
  const resources = {
    en: {
      translation: ${JSON.stringify(en, null, 2)}
    },
    hi: {
      translation: ${JSON.stringify(hi, null, 2)}
    },
    mr: {
      translation: ${JSON.stringify(mr, null, 2)}
    }
  };

  /**
   * Helper to retrieve saved language or browser default
   */
  function getSavedLanguage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('i18nextLng');
        if (saved && SUPPORTED_LANGS.includes(saved.toLowerCase())) {
          return saved.toLowerCase();
        }
      }
    } catch (e) {
      console.warn('[i18n] Could not read localStorage:', e);
    }
    return FALLBACK_LANG;
  }

  /**
   * Global i18n Engine Instance
   */
  const i18nInstance = {
    language: FALLBACK_LANG,
    languages: SUPPORTED_LANGS,
    fallbackLng: FALLBACK_LANG,
    store: { data: resources },
    isInitialized: false,

    /**
     * Initialize i18n system
     */
    init: function (options = {}) {
      const initialLang = options.lng || getSavedLanguage();
      this.language = SUPPORTED_LANGS.includes(initialLang) ? initialLang : FALLBACK_LANG;
      this.fallbackLng = options.fallbackLng || FALLBACK_LANG;

      if (options.resources) {
        Object.keys(options.resources).forEach(lang => {
          if (!this.store.data[lang]) this.store.data[lang] = {};
          this.store.data[lang].translation = {
            ...(this.store.data[lang].translation || {}),
            ...(options.resources[lang].translation || options.resources[lang])
          };
        });
      }

      this.isInitialized = true;
      this.persistLanguage(this.language);

      // In browser environment, initialize selector and translate DOM
      if (typeof document !== 'undefined') {
        const onDomReady = () => {
          this.injectStyles();
          this.mountSelector();
          this.translatePage();
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', onDomReady);
        } else {
          onDomReady();
        }
      }

      return this;
    },

    /**
     * Helper to interpolate variables inside a string template
     * Replaces {{variable}} or {{ variable }} with params[variable]
     */
    interpolate: function (str, params = {}) {
      if (!str || typeof str !== 'string' || !params || typeof params !== 'object') {
        return str || '';
      }
      return str.replace(/\\{\\{\\s*([a-zA-Z0-9_]+)\\s*\\}\\}/g, (match, paramKey) => {
        if (paramKey in params && params[paramKey] !== undefined && params[paramKey] !== null) {
          return String(params[paramKey]);
        }
        return match;
      });
    },

    /**
     * Translate key into current active language with optional variable interpolation
     * Usage:
     *   i18next.t('common.home') -> 'Home'
     *   i18next.t('notifications.offerReceived', { buyerName: 'Kisan Traders' })
     *   i18next.t('notifications.offerReceived', 'Fallback text', { buyerName: 'Kisan Traders' })
     */
    t: function (key, fallbackOrParams = '', maybeParams = null) {
      if (!key || typeof key !== 'string') {
        return typeof fallbackOrParams === 'string' ? fallbackOrParams : '';
      }

      let fallback = '';
      let params = {};

      if (fallbackOrParams && typeof fallbackOrParams === 'object' && !Array.isArray(fallbackOrParams)) {
        params = fallbackOrParams;
        fallback = '';
      } else {
        fallback = typeof fallbackOrParams === 'string' ? fallbackOrParams : '';
        if (maybeParams && typeof maybeParams === 'object' && !Array.isArray(maybeParams)) {
          params = maybeParams;
        }
      }

      const keys = key.split('.');
      const currentRes = this.store.data[this.language]?.translation;
      const fallbackRes = this.store.data[this.fallbackLng]?.translation;

      // 1. Try active language
      let value = currentRes;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }

      if (value !== undefined && typeof value === 'string') {
        return this.interpolate(value, params);
      }

      // 2. Try fallback language
      let fallbackValue = fallbackRes;
      for (const k of keys) {
        if (fallbackValue && typeof fallbackValue === 'object' && k in fallbackValue) {
          fallbackValue = fallbackValue[k];
        } else {
          fallbackValue = undefined;
          break;
        }
      }

      if (fallbackValue !== undefined && typeof fallbackValue === 'string') {
        return this.interpolate(fallbackValue, params);
      }

      const defaultResult = fallback || key;
      return this.interpolate(defaultResult, params);
    },

    /**
     * Change active language, persist to localStorage, and re-translate DOM immediately
     * Without page reload, preserving routes, and preserving authentication state.
     */
    changeLanguage: function (lng, callbackOrOptions, maybeOptions) {
      let callback = null;
      let options = {};

      if (typeof callbackOrOptions === 'function') {
        callback = callbackOrOptions;
        if (maybeOptions && typeof maybeOptions === 'object') options = maybeOptions;
      } else if (callbackOrOptions && typeof callbackOrOptions === 'object') {
        options = callbackOrOptions;
      } else if (maybeOptions && typeof maybeOptions === 'object') {
        options = maybeOptions;
      }

      const normalized = (lng || '').toLowerCase().trim();
      if (!SUPPORTED_LANGS.includes(normalized)) {
        console.warn(\`[i18n] Unsupported language: '\${lng}'. Supported: \${SUPPORTED_LANGS.join(', ')}\`);
        if (typeof callback === 'function') callback(new Error('Unsupported language'), this.t);
        return Promise.reject(new Error('Unsupported language'));
      }

      this.language = normalized;
      const isExplicit = !options.isServerSync;
      this.persistLanguage(normalized, isExplicit);

      // If user is authenticated and this was an explicit UI change, sync to server
      if (isExplicit && typeof window !== 'undefined' && window.Auth && typeof window.Auth.syncLanguagePreference === 'function' && window.Auth.isLoggedIn()) {
        try {
          window.Auth.syncLanguagePreference(normalized);
        } catch (e) {
          console.warn('[i18n] Failed to sync language to server:', e);
        }
      }

      // Update UI components
      this.updateSelectorUI();
      this.translatePage();

      // Trigger role navigation refresh if available
      if (typeof window !== 'undefined') {
        if (typeof window.initRoleAwareNav === 'function') {
          try { window.initRoleAwareNav(); } catch (e) {}
        }
        if (typeof CustomEvent === 'function') {
          const event = new CustomEvent('languageChanged', { detail: { language: normalized } });
          if (typeof window.dispatchEvent === 'function') window.dispatchEvent(event);
          if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') document.dispatchEvent(event);
        }
      }

      if (typeof callback === 'function') {
        callback(null, this.t.bind(this));
      }

      return Promise.resolve(this.t.bind(this));
    },

    /**
     * Persist selected language to localStorage and document attributes
     */
    persistLanguage: function (lang, isExplicit = false) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, lang);
          localStorage.setItem('i18nextLng', lang);
          if (isExplicit) {
            localStorage.setItem('krishi_lang_updated_at', Date.now().toString());
          }
        }
        if (typeof document !== 'undefined' && document.documentElement) {
          document.documentElement.lang = lang;
          document.documentElement.setAttribute('data-lang', lang);
        }
      } catch (e) {
        console.warn('[i18n] Failed to persist language to localStorage:', e);
      }
    },

    /**
     * Get currently active language
     */
    getLanguage: function () {
      return this.language;
    },

    /**
     * Scan DOM for [data-i18n] attributes and translate contents automatically
     */
    translatePage: function (rootElement = typeof document !== 'undefined' ? document : null) {
      if (!rootElement) return;

      // Translate text contents
      const elements = rootElement.querySelectorAll('[data-i18n]');
      elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
          const translation = this.t(key);
          if (translation && translation !== key) {
            el.textContent = translation;
          }
        }
      });

      // Translate placeholders
      const placeholderElements = rootElement.querySelectorAll('[data-i18n-placeholder]');
      placeholderElements.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key) {
          const translation = this.t(key);
          if (translation && translation !== key) {
            el.setAttribute('placeholder', translation);
          }
        }
      });

      // Translate titles / tooltips
      const titleElements = rootElement.querySelectorAll('[data-i18n-title]');
      titleElements.forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (key) {
          const translation = this.t(key);
          if (translation && translation !== key) {
            el.setAttribute('title', translation);
          }
        }
      });

      // Re-initialize Lucide icons if dynamically translated nodes contain icons
      if (typeof window !== 'undefined' && window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    },

    /**
     * Mount global language selector into existing header/navbar
     */
    mountSelector: function () {
      if (typeof document === 'undefined') return;

      // Avoid duplicate mounts
      if (document.getElementById('ks-global-lang-selector')) {
        this.updateSelectorUI();
        return;
      }

      // Find appropriate container in existing navbar/header
      const targetContainer = 
        document.getElementById('ks-lang-mount') ||
        document.querySelector('.dash-header__actions') ||
        document.querySelector('.navbar__actions') ||
        document.querySelector('.admin-header-actions') ||
        document.querySelector('.trans-header-actions') ||
        document.querySelector('.buyer-header-actions') ||
        document.querySelector('.header-actions') ||
        document.querySelector('#dash-header .dash-header__inner') ||
        document.querySelector('.admin-header-inner') ||
        document.querySelector('.trans-header-inner') ||
        document.querySelector('.navbar__inner') ||
        document.querySelector('.auth-header') ||
        document.body;

      if (!targetContainer) return;

      const current = LANG_LABELS[this.language] || LANG_LABELS.en;

      const wrap = document.createElement('div');
      wrap.className = 'ks-lang-selector-wrap';
      wrap.id = 'ks-global-lang-selector';
      wrap.innerHTML = \`
        <button type="button" class="ks-lang-btn" id="ks-global-lang-btn" aria-haspopup="listbox" aria-expanded="false" title="Change Language / भाषा बदलें / भाषा बदला">
          <span class="ks-lang-globe">🌐</span>
          <span class="ks-lang-label" id="ks-active-lang-text">\${current.name}</span>
          <svg class="ks-lang-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="ks-lang-dropdown" id="ks-global-lang-dropdown" role="listbox">
          <button type="button" class="ks-lang-option \${this.language === 'en' ? 'active' : ''}" data-lang="en" role="option" aria-selected="\${this.language === 'en'}">
            <span class="ks-lang-opt-text">English</span>
            <span class="ks-lang-opt-check">✓</span>
          </button>
          <button type="button" class="ks-lang-option \${this.language === 'hi' ? 'active' : ''}" data-lang="hi" role="option" aria-selected="\${this.language === 'hi'}">
            <span class="ks-lang-opt-text">हिंदी <small class="ks-lang-opt-sub">(Hindi)</small></span>
            <span class="ks-lang-opt-check">✓</span>
          </button>
          <button type="button" class="ks-lang-option \${this.language === 'mr' ? 'active' : ''}" data-lang="mr" role="option" aria-selected="\${this.language === 'mr'}">
            <span class="ks-lang-opt-text">मराठी <small class="ks-lang-opt-sub">(Marathi)</small></span>
            <span class="ks-lang-opt-check">✓</span>
          </button>
        </div>
      \`;

      // Insert cleanly into header
      if (targetContainer.classList.contains('dash-header__actions') || 
          targetContainer.classList.contains('admin-header-actions') || 
          targetContainer.classList.contains('trans-header-actions') || 
          targetContainer.classList.contains('header-actions')) {
        // Prepend before profile or notification buttons
        targetContainer.insertBefore(wrap, targetContainer.firstChild);
      } else if (targetContainer.classList.contains('navbar__actions')) {
        targetContainer.insertBefore(wrap, targetContainer.firstChild);
      } else {
        targetContainer.appendChild(wrap);
      }

      this.bindSelectorEvents(wrap);
    },

    /**
     * Bind interaction events to the language selector
     */
    bindSelectorEvents: function (wrap) {
      const btn = wrap.querySelector('#ks-global-lang-btn');
      const dropdown = wrap.querySelector('#ks-global-lang-dropdown');
      const options = wrap.querySelectorAll('.ks-lang-option');

      if (!btn || !dropdown) return;

      // Toggle dropdown
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = wrap.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
      });

      // Handle language option selection
      options.forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const targetLang = opt.getAttribute('data-lang');
          if (targetLang) {
            this.changeLanguage(targetLang);
          }
          wrap.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        });
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!wrap.contains(e.target)) {
          wrap.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && wrap.classList.contains('open')) {
          wrap.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          btn.focus();
        }
      });
    },

    /**
     * Update selector UI labels and active highlights
     */
    updateSelectorUI: function () {
      if (typeof document === 'undefined') return;

      const current = LANG_LABELS[this.language] || LANG_LABELS.en;
      const labelElem = document.getElementById('ks-active-lang-text');
      if (labelElem) {
        labelElem.textContent = current.name;
      }

      const options = document.querySelectorAll('.ks-lang-option');
      options.forEach(opt => {
        const lang = opt.getAttribute('data-lang');
        const isActive = (lang === this.language);
        opt.classList.toggle('active', isActive);
        opt.setAttribute('aria-selected', String(isActive));
      });
    },

    /**
     * Inject self-contained styles for global language selector
     */
    injectStyles: function () {
      if (typeof document === 'undefined' || document.getElementById('ks-lang-selector-styles')) return;

      const style = document.createElement('style');
      style.id = 'ks-lang-selector-styles';
      style.textContent = \`
        .ks-lang-selector-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          z-index: 1050;
          font-family: var(--font-body, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
          margin: 0 4px;
        }

        .ks-lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          user-select: none;
          backdrop-filter: blur(8px);
          outline: none;
          font-family: inherit;
        }

        .ks-lang-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.35);
          transform: translateY(-1px);
        }

        .ks-lang-btn:focus-visible {
          box-shadow: 0 0 0 3px rgba(143, 203, 155, 0.4);
        }

        .ks-lang-globe {
          font-size: 13px;
          line-height: 1;
          display: inline-flex;
        }

        .ks-lang-label {
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .ks-lang-chevron {
          transition: transform 0.2s ease;
          opacity: 0.85;
          margin-left: 1px;
        }

        .ks-lang-selector-wrap.open .ks-lang-chevron {
          transform: rotate(180deg);
        }

        .ks-lang-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: #FFFFFF;
          border: 1px solid #E2E0D5;
          border-radius: 12px;
          box-shadow: 0 14px 36px rgba(18, 55, 42, 0.18), 0 4px 10px rgba(0,0,0,0.04);
          padding: 6px;
          min-width: 146px;
          display: none;
          flex-direction: column;
          gap: 3px;
          z-index: 100000;
          animation: ksDropdownFade 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ks-lang-selector-wrap.open .ks-lang-dropdown {
          display: flex;
        }

        @keyframes ksDropdownFade {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ks-lang-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: transparent;
          border-radius: 8px;
          color: #17221D;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
          font-family: inherit;
        }

        .ks-lang-option:hover {
          background: #EAF6ED;
          color: #12372A;
        }

        .ks-lang-option.active {
          background: #EAF6ED;
          color: #12372A;
          font-weight: 700;
        }

        .ks-lang-opt-text {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .ks-lang-opt-sub {
          font-size: 11px;
          color: #6F7F75;
          font-weight: 400;
        }

        .ks-lang-opt-check {
          color: #2E7246;
          font-weight: 800;
          font-size: 13px;
          opacity: 0;
          transition: opacity 0.15s ease;
          margin-left: 8px;
        }

        .ks-lang-option.active .ks-lang-opt-check {
          opacity: 1;
        }

        /* Light navbar theme adapter */
        .navbar--transparent:not(.navbar--scrolled) .ks-lang-btn {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .ks-lang-btn {
            padding: 4px 8px;
            font-size: 11.5px;
          }
          .ks-lang-dropdown {
            right: -10px;
          }
        }
      \`;
      document.head.appendChild(style);
    }
  };

  // Auto-initialize on import/load
  i18nInstance.init();

  return i18nInstance;
});
`;

const srcI18nPath = path.join(__dirname, '..', 'src', 'i18n.js');
const jsI18nPath = path.join(__dirname, '..', 'js', 'i18n.js');

fs.writeFileSync(srcI18nPath, i18nTemplate, 'utf8');
fs.writeFileSync(jsI18nPath, i18nTemplate, 'utf8');

console.log('Successfully built i18n modules with Global Language Selector & Full 414-Key Dictionaries!');
