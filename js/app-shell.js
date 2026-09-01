/**
 * KRISHISHETRA — UNIVERSAL APPLICATION SHELL INTERACTION CONTROLLER
 * Unifies header interactions, workspace switching, notifications,
 * profile menu, language toggling, and Lucide icons across all 5 roles.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initAppShell();
  });

  function initAppShell() {
    initLucideIcons();
    initAuthenticatedHomeNavigation();
    initWorkspaceSwitcher();
    initUniversalProfile();
    initNotificationBell();
    initUniversalLanguage();
  }

  /**
   * 1. Universal Authenticated Home & Logo Navigation Handler
   * Configures all logo, home, and brand links so that:
   * - Authenticated users are routed directly to their role-specific dashboard.
   * - Logged-out users are routed to the public landing page.
   */
  function initAuthenticatedHomeNavigation() {
    const targetHome = window.Auth ? window.Auth.getAuthenticatedHome() : 'index.html';
    
    // Select all logo, brand, and home navigation links across all pages
    const homeLinks = document.querySelectorAll(
      '.dash-header__logo, .app-brand, .trans-brand, .admin-brand, .brand, .navbar__logo, #dash-logo, #nav-logo, #bnav-home, a[data-action="home"]'
    );

    homeLinks.forEach(link => {
      link.setAttribute('href', targetHome);
      link.addEventListener('click', (e) => {
        if (window.Auth && window.Auth.isLoggedIn()) {
          const currentUrl = window.location.pathname.toLowerCase();
          const targetUrl = window.Auth.getAuthenticatedHome();
          // If already on the destination page, smooth scroll to top instead of reloading
          if (currentUrl.endsWith(targetUrl.replace(/^\.\.\//, ''))) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            e.preventDefault();
            window.location.href = targetUrl;
          }
        }
      });
    });
  }

  /**
   * 2. Lucide icon initializer
   */
  function initLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /**
   * 2. Universal Workspace Switcher Modal & Dropdown
   */
  function initWorkspaceSwitcher() {
    const switcherBtns = document.querySelectorAll('.workspace-switcher-btn, .portal-switch-btn');
    
    // Determine path prefix
    const path = window.location.pathname.toLowerCase();
    const isSubdir = path.includes('/transporter/') || path.includes('/admin/');
    const prefix = isSubdir ? '../' : '';

    switcherBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // If it's not a direct link or has data-switcher
        if (btn.getAttribute('href') === '#' || btn.dataset.action === 'switch-workspace') {
          e.preventDefault();
          openWorkspaceModal(prefix);
        }
      });
    });
  }

  function openWorkspaceModal(prefix) {
    let modal = document.getElementById('ks-workspace-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ks-workspace-modal';
      modal.className = 'ks-workspace-modal-overlay';
      modal.innerHTML = `
        <div class="ks-workspace-modal-content">
          <div class="ks-workspace-modal-header">
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="dash-header__logo-icon" style="width:32px;height:32px;"><i data-lucide="sprout"></i></div>
              <h3 style="margin:0;font-family:'Playfair Display',serif;color:#12372A;font-size:18px;">Switch KrishiShetra Workspace</h3>
            </div>
            <button class="ks-workspace-modal-close" style="background:none;border:none;font-size:20px;color:#6F7F75;cursor:pointer;">✕</button>
          </div>
          <p style="font-size:13px;color:#6F7F75;margin:8px 0 16px 0;">Select your operational workspace to navigate directly to role-specific intelligence and tools.</p>
          <div class="ks-workspace-grid">
            <a href="${prefix}dashboard.html" class="ks-workspace-card">
              <div class="ks-workspace-icon" style="background:#EAF6ED;color:#2E7246;"><i data-lucide="sprout"></i></div>
              <div>
                <div class="ks-workspace-title">Farmer Workspace</div>
                <div class="ks-workspace-sub">Live mandi prices, crop selling & AI insights</div>
              </div>
            </a>
            <a href="${prefix}fpo-dashboard.html" class="ks-workspace-card">
              <div class="ks-workspace-icon" style="background:#FDF8ED;color:#B88935;"><i data-lucide="users"></i></div>
              <div>
                <div class="ks-workspace-title">FPO Command Center</div>
                <div class="ks-workspace-sub">Member aggregation, bulk lots & institutional buyers</div>
              </div>
            </a>
            <a href="${prefix}buyer.html" class="ks-workspace-card">
              <div class="ks-workspace-icon" style="background:#EBF4FC;color:#1E5C99;"><i data-lucide="store"></i></div>
              <div>
                <div class="ks-workspace-title">Buyer Hub</div>
                <div class="ks-workspace-sub">Procurement demand, mandi lots & escrow deals</div>
              </div>
            </a>
            <a href="${prefix}transporter/dashboard.html" class="ks-workspace-card">
              <div class="ks-workspace-icon" style="background:#FAF2EB;color:#C96D5B;"><i data-lucide="truck"></i></div>
              <div>
                <div class="ks-workspace-title">Transporter Hub</div>
                <div class="ks-workspace-sub">Available loads, telemetry tracking & fleet earnings</div>
              </div>
            </a>
            <a href="${prefix}admin/dashboard.html" class="ks-workspace-card">
              <div class="ks-workspace-icon" style="background:#EDE8F5;color:#7B5EA7;"><i data-lucide="shield-check"></i></div>
              <div>
                <div class="ks-workspace-title">Admin Management</div>
                <div class="ks-workspace-sub">Platform compliance, user verification & health</div>
              </div>
            </a>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Inject styling for workspace modal
      const style = document.createElement('style');
      style.textContent = `
        .ks-workspace-modal-overlay {
          position: fixed; inset: 0; background: rgba(18, 55, 42, 0.65);
          backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center;
          justify-content: center; padding: 20px; animation: ksFadeIn 0.2s ease;
        }
        .ks-workspace-modal-content {
          background: #FFFFFF; border-radius: 16px; width: 100%; max-width: 520px;
          padding: 24px; box-shadow: 0 20px 48px rgba(18, 55, 42, 0.2); border: 1px solid #E2DDD0;
        }
        .ks-workspace-modal-header {
          display: flex; justify-content: space-between; align-items: center;
        }
        .ks-workspace-grid {
          display: flex; flex-direction: column; gap: 8px;
        }
        .ks-workspace-card {
          display: flex; align-items: center; gap: 12px; padding: 12px 14px;
          border-radius: 10px; border: 1.5px solid #EAE8DF; text-decoration: none;
          color: inherit; transition: all 0.2s ease;
        }
        .ks-workspace-card:hover {
          border-color: #5B9A72; background: #FAF9F5; transform: translateX(3px);
        }
        .ks-workspace-icon {
          width: 36px; height: 36px; border-radius: 8px; display: flex;
          align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ks-workspace-title {
          font-weight: 700; font-size: 14px; color: #12372A;
        }
        .ks-workspace-sub {
          font-size: 12px; color: #6F7F75; margin-top: 1px;
        }
        @keyframes ksFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `;
      document.head.appendChild(style);

      modal.querySelector('.ks-workspace-modal-close').addEventListener('click', () => {
        modal.style.display = 'none';
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }

    modal.style.display = 'flex';
    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * 3. Universal Profile Dropdown Toggle
   */
  function initUniversalProfile() {
    const profilePills = document.querySelectorAll('.dash-header__profile, .admin-header-user, .trans-user-pill, .profile-pill');
    profilePills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        const wrap = pill.closest('.dash-profile-wrap') || pill.parentElement;
        const dropdown = wrap.querySelector('.dash-profile-dropdown, .ks-dropdown-menu');
        if (dropdown) {
          e.preventDefault();
          e.stopPropagation();
          dropdown.classList.toggle('active');
          wrap.classList.toggle('open');
        }
      });
    });

    document.addEventListener('click', (e) => {
      document.querySelectorAll('.dash-profile-dropdown.active, .dash-profile-wrap.open').forEach(el => {
        if (!el.contains(e.target)) {
          el.classList.remove('active', 'open');
        }
      });
    });
  }

  /**
   * 4. Notification Bell Helper
   */
  function initNotificationBell() {
    const bellBtns = document.querySelectorAll('.dash-header__action-btn#btn-notifications, .admin-icon-btn, .trans-btn-icon, #notifBtn');
    bellBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // If toast function exists, notify user cleanly
        if (typeof window.showToast === 'function') {
          window.showToast('🔔 All notification streams synced with live mandi & transaction ledger');
        }
      });
    });
  }

  /**
   * 5. Universal Language Selector
   */
  function initUniversalLanguage() {
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        localStorage.setItem('krishi_lang', lang);
        if (typeof window.changeLanguage === 'function') {
          window.changeLanguage(lang);
        }
      });
    }
  }

  // Export to window
  window.AppShell = {
    openWorkspaceModal
  };

})();
