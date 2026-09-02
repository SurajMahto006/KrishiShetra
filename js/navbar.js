/**
 * KRISHISHETRA — ROLE-AWARE SHARED NAVBAR & NAVIGATION CONTROLLER
 * Dynamically builds navigation links based on user role,
 * auto-highlights active routes, populates user avatar & name,
 * and handles mobile drawer, notification modals, and logout.
 */

document.addEventListener('DOMContentLoaded', () => {
  initRoleAwareNav();
  initActiveRouteHighlight();
  initUserProfileHeader();
  initMobileNavDrawer();
  initProfileDropdown();
  initGlobalSearch();
  initHeaderModalButtons();
  initLiveNotificationBadge();
});

/**
 * 1. Role-aware Navigation Generator
 */
function initRoleAwareNav() {
  const navContainer = document.getElementById('dash-nav');
  const mobileNavContainer = document.getElementById('mnav-links') || document.querySelector('.dash-mobile-nav__links') || document.getElementById('dash-mobile-nav');
  
  if (!navContainer) return;

  const currentRole = window.Auth ? window.Auth.getRole() : 'farmer';
  const path = window.location.pathname.toLowerCase();
  const prefix = (path.includes('/transporter/') || path.includes('/admin/')) ? '../' : '';

  const navMenusByRole = {
    farmer: [
      { page: 'dashboard.html', id: 'nav-dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
      { page: 'lots.html', id: 'nav-lots', icon: 'package', label: 'My Lots' },
      { page: 'market.html', id: 'nav-market', icon: 'store', label: 'Marketplace' },
      { page: 'ai-forecast.html', id: 'nav-forecast', icon: 'brain', label: 'AI Forecast' },
      { page: 'orders.html', id: 'nav-orders', icon: 'clipboard-list', label: 'Orders' },
      { page: 'buyers.html', id: 'nav-buyers', icon: 'users', label: 'Buyer Inquiries' }
    ],
    buyer: [
      { page: 'buyer.html#/buyer/dashboard', id: 'nav-dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
      { page: 'buyer.html#/buyer/marketplace', id: 'nav-market', icon: 'store', label: 'Marketplace' },
      { page: 'buyer.html#/buyer/inquiries', id: 'nav-inquiries', icon: 'message-square', label: 'My Inquiries' },
      { page: 'buyer.html#/buyer/orders', id: 'nav-orders', icon: 'clipboard-list', label: 'Orders' },
      { page: 'buyer.html#/buyer/directory', id: 'nav-directory', icon: 'users', label: 'Farmers & FPOs' },
      { page: 'buyer.html#/buyer/payments', id: 'nav-payments', icon: 'wallet', label: 'Escrow & Payments' }
    ],
    transporter: [
      { page: 'transporter/dashboard.html', id: 'nav-dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
      { page: 'transporter/available-loads.html', id: 'nav-loads', icon: 'package-search', label: 'Available Loads' },
      { page: 'transporter/active-trips.html', id: 'nav-trips', icon: 'truck', label: 'Active Trips' },
      { page: 'transporter/fleet.html', id: 'nav-fleet', icon: 'shield-check', label: 'Fleet' },
      { page: 'transporter/drivers.html', id: 'nav-drivers', icon: 'users', label: 'Drivers' },
      { page: 'transporter/earnings.html', id: 'nav-earnings', icon: 'wallet', label: 'Earnings' },
      { page: 'transporter/profile.html', id: 'nav-profile', icon: 'user-check', label: 'Profile' }
    ],
    fpo: [
      { page: 'fpo-dashboard.html#dashboard', id: 'nav-dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
      { page: 'fpo-dashboard.html#farmers', id: 'nav-farmers', icon: 'users', label: 'Farmers' },
      { page: 'fpo-dashboard.html#lots', id: 'nav-lots', icon: 'package', label: 'Lots' },
      { page: 'fpo-dashboard.html#market', id: 'nav-market', icon: 'store', label: 'Market' },
      { page: 'fpo-dashboard.html#buyers', id: 'nav-buyers', icon: 'briefcase', label: 'Buyers' },
      { page: 'fpo-dashboard.html#orders', id: 'nav-orders', icon: 'clipboard-list', label: 'Orders' },
      { page: 'fpo-dashboard.html#analytics', id: 'nav-analytics', icon: 'bar-chart-3', label: 'Analytics' }
    ],
    admin: [
      { page: 'admin/dashboard.html', id: 'nav-dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
      { page: 'admin/users.html', id: 'nav-users', icon: 'users', label: 'Users' },
      { page: 'admin/farmers.html', id: 'nav-farmers', icon: 'user-check', label: 'Farmers' },
      { page: 'admin/reports.html', id: 'nav-reports', icon: 'bar-chart-2', label: 'Reports' },
      { page: 'admin/settings.html', id: 'nav-settings', icon: 'settings', label: 'Settings' }
    ]
  };

  const menuItems = navMenusByRole[currentRole] || navMenusByRole.farmer;

  // Render desktop nav if container is present
  navContainer.innerHTML = menuItems.map(item => `
    <a href="${prefix}${item.page}" class="dash-header__link" id="${item.id}">
      <i data-lucide="${item.icon}" class="dash-header__link-icon"></i> ${item.label}
    </a>
  `).join('');

  // Render mobile nav links if container is present
  if (mobileNavContainer) {
    mobileNavContainer.innerHTML = menuItems.map(item => `
      <a href="${prefix}${item.page}" class="dash-mobile-nav__link" id="m${item.id}">
        <i data-lucide="${item.icon}"></i> ${item.label}
      </a>
    `).join('');
  }

  // Ensure role badge beside logo
  const logoElem = document.getElementById('dash-logo') || document.querySelector('.dash-header__logo');
  if (logoElem) {
    let roleBadge = logoElem.querySelector('.dash-header__role-badge');
    if (!roleBadge) {
      roleBadge = document.createElement('span');
      roleBadge.className = 'dash-header__role-badge';
      logoElem.appendChild(roleBadge);
    }
    roleBadge.textContent = currentRole.toUpperCase();
  }

  // Re-initialize Lucide icons
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * 2. Auto-detect active page and highlight navigation links
 */
function initActiveRouteHighlight() {
  const currentPath = window.location.pathname.toLowerCase();
  const currentHash = window.location.hash.toLowerCase();

  document.querySelectorAll('.dash-header__link, .dash-mobile-nav__link').forEach(link => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (currentHash && href.includes(currentHash)) {
      link.classList.add('dash-header__link--active', 'dash-mobile-nav__link--active');
    } else if (!currentHash && href && (currentPath.endsWith(href) || currentPath.endsWith(href.replace('../', '')))) {
      link.classList.add('dash-header__link--active', 'dash-mobile-nav__link--active');
    } else if (!currentHash && href.includes('dashboard') && (currentPath.endsWith('/') || currentPath.endsWith('index.html'))) {
      link.classList.add('dash-header__link--active', 'dash-mobile-nav__link--active');
    } else {
      link.classList.remove('dash-header__link--active', 'dash-mobile-nav__link--active');
    }
  });
}

/**
 * 3. Populate user profile details in header & dropdown
 */
function initUserProfileHeader() {
  const user = window.Auth ? window.Auth.getUser() : null;
  const role = window.Auth ? window.Auth.getRole() : 'farmer';

  const nameElem = document.getElementById('header-user-name');
  const avatarElem = document.getElementById('header-avatar');
  const dropdownName = document.getElementById('dropdown-user-name');
  const dropdownPhone = document.getElementById('dropdown-user-phone');
  const dropdownAvatar = document.getElementById('dropdown-avatar');

  const displayName = (user && user.name) ? user.name : 'Krishi User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'KU';
  const subtitle = (user && user.email) ? user.email : (role.toUpperCase());

  let shortName = displayName.split(' ')[0] || 'User';
  if (shortName.length > 9) {
    shortName = shortName.slice(0, 8) + '…';
  }

  if (nameElem) {
    nameElem.textContent = shortName;
    nameElem.title = displayName;
  }
  if (avatarElem) avatarElem.textContent = initials;
  if (dropdownName) dropdownName.textContent = displayName;
  if (dropdownPhone) dropdownPhone.textContent = subtitle;
  if (dropdownAvatar) dropdownAvatar.textContent = initials;
}

/**
 * 4. Mobile navigation drawer toggle
 */
function initMobileNavDrawer() {
  const toggleBtn = document.getElementById('dash-nav-toggle');
  const mobileNav = document.getElementById('dash-mobile-nav');

  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = toggleBtn.classList.toggle('open');
      toggleBtn.classList.toggle('active', isOpen);
      mobileNav.classList.toggle('open', isOpen);
      mobileNav.classList.toggle('active', isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!mobileNav.contains(e.target) && !toggleBtn.contains(e.target)) {
        toggleBtn.classList.remove('open', 'active');
        mobileNav.classList.remove('open', 'active');
      }
    });
  }
}

/**
 * 5. Profile dropdown menu toggle & item actions
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
          localStorage.removeItem('krishi_token');
          localStorage.removeItem('krishi_is_logged_in');
          window.location.href = 'login.html';
        }
      });
    }
  }
}

/**
 * 6. Header quick action modal openers (Notifications, Language, Helpline)
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
 * 7. Live Unread Notifications Badge
 */
async function initLiveNotificationBadge() {
  const badge = document.getElementById('notifications-badge');
  if (!badge || !window.Auth || !window.Auth.isLoggedIn() || !window.api) return;

  try {
    const res = await window.api.notifications.getUnreadCount();
    if (res.success && typeof res.unreadCount === 'number') {
      if (res.unreadCount > 0) {
        badge.textContent = res.unreadCount > 99 ? '99+' : res.unreadCount;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (err) {
    // Non-blocking
  }
}

/**
 * 8. Global Search shortcut (Ctrl + K) & input handler
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
