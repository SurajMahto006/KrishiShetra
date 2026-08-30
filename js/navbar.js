/**
 * KRISHISHETRA — SHARED NAVBAR & NAVIGATION CONTROLLER
 * Active route auto-detection, mobile nav drawer, profile dropdown, search bar.
 */

document.addEventListener('DOMContentLoaded', () => {
  initActiveRouteHighlight();
  initMobileNavDrawer();
  initProfileDropdown();
  initGlobalSearch();
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
 * 3. Profile dropdown menu toggle
 */
function initProfileDropdown() {
  const btnProfile = document.getElementById('btn-profile');
  const dropdown = document.getElementById('dash-profile-dropdown');
  const wrap = document.getElementById('dash-profile-wrap');

  if (btnProfile && dropdown && wrap) {
    btnProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      wrap.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove('open');
      }
    });
  }
}

/**
 * 4. Global Search shortcut (Ctrl + K) & input handler
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
