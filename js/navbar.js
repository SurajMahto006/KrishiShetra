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
      { page: 'orders.html', id: 'nav-orders', icon: 'clipboard-list', label: 'Orders' }
    ],
    buyer: [
      { page: 'buyer.html', id: 'nav-dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
      { page: 'market.html', id: 'nav-market', icon: 'store', label: 'Marketplace' },
      { page: 'buyer-inquiries.html', id: 'nav-inquiries', icon: 'message-square', label: 'My Inquiries' },
      { page: 'orders.html', id: 'nav-orders', icon: 'clipboard-list', label: 'Orders' }
    ],
    transporter: [
      { page: 'transporter/dashboard.html', id: 'nav-dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
      { page: 'transporter/available-loads.html', id: 'nav-loads', icon: 'package-search', label: 'Available Deliveries' },
      { page: 'transporter/active-trips.html', id: 'nav-trips', icon: 'truck', label: 'Active Trips' }
    ],
    fpo: [
      { page: 'fpo-dashboard.html', id: 'nav-dashboard', icon: 'layout-dashboard', label: 'Dashboard' }
    ],
    admin: [
      { page: 'admin/dashboard.html', id: 'nav-dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
      { page: 'admin/users.html', id: 'nav-users', icon: 'users', label: 'Users' },
      { page: 'admin/farmers.html', id: 'nav-farmers', icon: 'user-check', label: 'Farmers' },
      { page: 'admin/reports.html', id: 'nav-reports', icon: 'bar-chart-2', label: 'Reports' }
    ]
  };

  const menuItems = navMenusByRole[currentRole] || navMenusByRole.farmer;

  // Render desktop nav if container is present
  navContainer.innerHTML = menuItems.map(item => `
    <a href="${prefix}${item.page}" class="dash-header__link" id="${item.id}">
      <i data-lucide="${item.icon}" class="dash-header__link-icon"></i> ${item.label}
    </a>
  `).join('');

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

  document.querySelectorAll('.dash-header__link').forEach(link => {
    const href = link.getAttribute('href').toLowerCase();
    if (href && (currentPath.endsWith(href) || currentPath.endsWith(href.replace('../', '')))) {
      link.classList.add('dash-header__link--active');
    } else if (href.includes('dashboard') && (currentPath.endsWith('/') || currentPath.endsWith('index.html'))) {
      link.classList.add('dash-header__link--active');
    } else {
      link.classList.remove('dash-header__link--active');
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

  if (nameElem) nameElem.textContent = displayName.split(' ')[0];
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
