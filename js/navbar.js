/**
 * KRISHISHETRA — SHARED NAVBAR & NAVIGATION CONTROLLER
 * Active route auto-detection, mobile nav drawer, profile dropdown, header modals & search bar.
 */

document.addEventListener('DOMContentLoaded', () => {
  initActiveRouteHighlight();
  initMobileNavDrawer();
  initProfileDropdown();
  initGlobalSearch();
  initHeaderModalButtons();
});

/**
 * 1. Auto-detect active page and highlight navigation links
 */
function initActiveRouteHighlight() {
  const currentPath = window.location.pathname.toLowerCase();
  
  // Mapping of pages to navigation IDs
  const routeMap = [
    { page: 'dashboard.html', navId: 'nav-dashboard', mobileId: 'mnav-dashboard', bottomId: 'bnav-home' },
    { page: 'lots.html', navId: 'nav-lots', mobileId: 'mnav-lots', bottomId: 'bnav-lots' },
    { page: 'market.html', navId: 'nav-market', mobileId: 'mnav-market', bottomId: 'bnav-market' },
    { page: 'ai-forecast.html', navId: 'nav-forecast', mobileId: 'mnav-forecast', bottomId: 'bnav-forecast' },
    { page: 'buyers.html', navId: 'nav-buyers', mobileId: 'mnav-buyers', bottomId: 'bnav-buyers' },
    { page: 'orders.html', navId: 'nav-orders', mobileId: 'mnav-orders', bottomId: 'bnav-orders' }
  ];

  // Determine current active page key
  let activeRoute = routeMap.find(r => currentPath.endsWith(r.page));
  if (!activeRoute && (currentPath.endsWith('/') || currentPath.endsWith('/dashboard'))) {
    activeRoute = routeMap[0]; // Default to dashboard
  }

  if (!activeRoute) return;

  // Clear existing active states
  document.querySelectorAll('.dash-header__link').forEach(el => el.classList.remove('dash-header__link--active'));
  document.querySelectorAll('.dash-mobile-nav__link').forEach(el => el.classList.remove('dash-mobile-nav__link--active'));
  document.querySelectorAll('.dash-bottom-nav__item').forEach(el => el.classList.remove('dash-bottom-nav__item--active'));

  // Highlight active items
  const activeDesktop = document.getElementById(activeRoute.navId);
  if (activeDesktop) activeDesktop.classList.add('dash-header__link--active');

  const activeMobile = document.getElementById(activeRoute.mobileId);
  if (activeMobile) activeMobile.classList.add('dash-mobile-nav__link--active');

  const activeBottom = document.getElementById(activeRoute.bottomId);
  if (activeBottom) activeBottom.classList.add('dash-bottom-nav__item--active');
}

/**
 * 2. Mobile navigation drawer toggle
 */
function initMobileNavDrawer() {
  const toggleBtn = document.getElementById('dash-nav-toggle');
  const mobileNav = document.getElementById('dash-mobile-nav');

  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBtn.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!mobileNav.contains(e.target) && !toggleBtn.contains(e.target)) {
        toggleBtn.classList.remove('open');
        mobileNav.classList.remove('open');
      }
    });
  }
}

/**
 * 3. Profile dropdown menu toggle & item actions
 */
function initProfileDropdown() {
  const btnProfile = document.getElementById('btn-profile');
  const wrap = document.getElementById('dash-profile-wrap');

  if (btnProfile && wrap) {
    if (btnProfile.dataset.initialized) return;
    btnProfile.dataset.initialized = 'true';

    btnProfile.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      wrap.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        wrap.classList.remove('open');
      }
    });

    // Wire up dropdown items
    const menuProfile = document.getElementById('menu-profile');
    if (menuProfile) {
      menuProfile.addEventListener('click', (e) => {
        e.preventDefault();
        wrap.classList.remove('open');
        openModalById('profile-modal-overlay');
      });
    }

    const menuAlerts = document.getElementById('menu-alerts');
    if (menuAlerts) {
      menuAlerts.addEventListener('click', (e) => {
        e.preventDefault();
        wrap.classList.remove('open');
        openModalById('alert-modal-overlay');
      });
    }

    const menuHelp = document.getElementById('menu-help');
    if (menuHelp) {
      menuHelp.addEventListener('click', (e) => {
        e.preventDefault();
        wrap.classList.remove('open');
        openModalById('help-modal-overlay');
      });
    }

    const menuLogout = wrap.querySelector('.dash-profile-dropdown__item--danger');
    if (menuLogout) {
      menuLogout.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.Auth) {
          window.Auth.logout();
        } else {
          localStorage.removeItem('krishi_is_logged_in');
          window.location.href = 'login.html';
        }
      });
    }
  }
}

/**
 * 4. Header quick action modal openers (Notifications, Language, Helpline)
 */
function initHeaderModalButtons() {
  const notifBtn = document.getElementById('btn-notifications');
  if (notifBtn) {
    notifBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModalById('notifications-modal-overlay');
    });
  }

  const langBtn = document.getElementById('btn-language');
  if (langBtn) {
    langBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModalById('language-modal-overlay');
    });
  }

  const helpBtn = document.getElementById('btn-help');
  if (helpBtn) {
    helpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModalById('help-modal-overlay');
    });
  }

  // Universal close button and backdrop click handler for dash-modals
  document.querySelectorAll('.dash-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });

    const closeBtn = overlay.querySelector('.dash-modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
      });
    }
  });
}

function openModalById(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * 5. Global Search shortcut (Ctrl + K) & input handler
 */
function initGlobalSearch() {
  const searchInput = document.getElementById('dash-search-input');
  if (!searchInput) return;

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
  });
}
