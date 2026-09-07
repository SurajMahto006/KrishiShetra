const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Helper to replace pattern if present
function updateFile(relPath, transforms) {
  const filePath = path.join(rootDir, relPath);
  if (!fs.existsSync(filePath)) {
    console.warn('[SKIP] File not found:', relPath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  transforms.forEach(({ from, to }) => {
    if (typeof from === 'string') {
      if (content.includes(from)) {
        content = content.replace(from, to);
        count++;
      }
    } else if (from instanceof RegExp) {
      if (from.test(content)) {
        content = content.replace(from, to);
        count++;
      }
    }
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[UPDATED] ${relPath} (${count} layout strings translated)`);
}

console.log('--- TRANSLATING GLOBAL LAYOUT IN ALL HTML PAGES ---');

// 1. DASHBOARD.HTML
updateFile('dashboard.html', [
  {
    from: 'placeholder="Search crops, markets, buyers..."',
    to: 'placeholder="Search crops, markets, buyers..." data-i18n-placeholder="common.search"'
  },
  {
    from: '<a href="#" class="dash-profile-dropdown__item" id="menu-profile"><i data-lucide="user"></i> My Profile & Farm</a>',
    to: '<a href="#" class="dash-profile-dropdown__item" id="menu-profile"><i data-lucide="user"></i> <span data-i18n="farmer.farmProfile">My Profile & Farm</span></a>'
  },
  {
    from: '<a href="lots.html" class="dash-profile-dropdown__item" id="menu-lots"><i data-lucide="package"></i> Manage My Lots</a>',
    to: '<a href="lots.html" class="dash-profile-dropdown__item" id="menu-lots"><i data-lucide="package"></i> <span data-i18n="farmer.myProduceLots">Manage My Lots</span></a>'
  },
  {
    from: '<a href="#" class="dash-profile-dropdown__item" id="menu-alerts"><i data-lucide="bell-ring"></i> Price Alerts</a>',
    to: '<a href="#" class="dash-profile-dropdown__item" id="menu-alerts"><i data-lucide="bell-ring"></i> <span data-i18n="notifications.notificationsTitle">Price Alerts</span></a>'
  },
  {
    from: '<a href="#" class="dash-profile-dropdown__item" id="menu-help"><i data-lucide="phone-call"></i> Kisan Helpline</a>',
    to: '<a href="#" class="dash-profile-dropdown__item" id="menu-help"><i data-lucide="phone-call"></i> <span data-i18n="navigation.help">Kisan Helpline</span></a>'
  },
  {
    from: '<a href="index.html" class="dash-profile-dropdown__item dash-profile-dropdown__item--danger"><i data-lucide="log-out"></i> Logout</a>',
    to: '<a href="index.html" class="dash-profile-dropdown__item dash-profile-dropdown__item--danger"><i data-lucide="log-out"></i> <span data-i18n="common.logout">Logout</span></a>'
  },
  {
    from: '<div class="footer__tagline">Know the Price. Choose the Market. Sell Better.</div>',
    to: '<div class="footer__tagline" data-i18n="farmer.dashboardSubtitle">Know the Price. Choose the Market. Sell Better.</div>'
  },
  {
    from: '<a href="#" class="footer__link" onclick="openHelpModal()">Kisan Support</a>',
    to: '<a href="#" class="footer__link" onclick="openHelpModal()" data-i18n="navigation.help">Kisan Support</a>'
  },
  {
    from: '<a href="buyers.html" class="footer__link">For Buyers</a>',
    to: '<a href="buyers.html" class="footer__link" data-i18n="navigation.buyers">For Buyers</a>'
  },
  {
    from: '<a href="index.html" class="footer__link">About KrishiShetra</a>',
    to: '<a href="index.html" class="footer__link" data-i18n="common.about">About KrishiShetra</a>'
  },
  {
    from: '<div class="footer__copyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>',
    to: '<div class="footer__copyright" data-i18n="common.footerCopyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>'
  },
  {
    from: '<a href="dashboard.html" class="dash-bottom-nav__item dash-bottom-nav__item--active" id="bnav-home"><i data-lucide="home"></i><span>Home</span></a>',
    to: '<a href="dashboard.html" class="dash-bottom-nav__item dash-bottom-nav__item--active" id="bnav-home"><i data-lucide="home"></i><span data-i18n="common.home">Home</span></a>'
  },
  {
    from: '<a href="lots.html" class="dash-bottom-nav__item" id="bnav-lots"><i data-lucide="package"></i><span>My Lots</span></a>',
    to: '<a href="lots.html" class="dash-bottom-nav__item" id="bnav-lots"><i data-lucide="package"></i><span data-i18n="navigation.myLots">My Lots</span></a>'
  },
  {
    from: '<a href="storage.html" class="dash-bottom-nav__item" id="bnav-storage"><i data-lucide="warehouse"></i><span>Storage</span></a>',
    to: '<a href="storage.html" class="dash-bottom-nav__item" id="bnav-storage"><i data-lucide="warehouse"></i><span data-i18n="navigation.storage">Storage</span></a>'
  },
  {
    from: '<a href="market.html" class="dash-bottom-nav__item" id="bnav-market"><i data-lucide="bar-chart-3"></i><span>Market</span></a>',
    to: '<a href="market.html" class="dash-bottom-nav__item" id="bnav-market"><i data-lucide="bar-chart-3"></i><span data-i18n="navigation.marketplace">Market</span></a>'
  },
  {
    from: '<a href="ai-forecast.html" class="dash-bottom-nav__item" id="bnav-forecast"><i data-lucide="brain"></i><span>Forecast</span></a>',
    to: '<a href="ai-forecast.html" class="dash-bottom-nav__item" id="bnav-forecast"><i data-lucide="brain"></i><span data-i18n="navigation.aiForecast">Forecast</span></a>'
  },
  {
    from: '<a href="orders.html" class="dash-bottom-nav__item" id="bnav-orders"><i data-lucide="clipboard-list"></i><span>Orders</span></a>',
    to: '<a href="orders.html" class="dash-bottom-nav__item" id="bnav-orders"><i data-lucide="clipboard-list"></i><span data-i18n="navigation.orders">Orders</span></a>'
  }
]);

// 2. LOTS.HTML
updateFile('lots.html', [
  {
    from: '<a href="dashboard.html" style="color: var(--ks-gold, #C9973B); text-decoration: none;">Dashboard</a> /',
    to: '<a href="dashboard.html" style="color: var(--ks-gold, #C9973B); text-decoration: none;" data-i18n="navigation.dashboard">Dashboard</a> /'
  },
  {
    from: '<strong>My Lots</strong>',
    to: '<strong data-i18n="navigation.myLots">My Lots</strong>'
  },
  {
    from: 'placeholder="Search crops, markets, buyers..."',
    to: 'placeholder="Search crops, markets, buyers..." data-i18n-placeholder="common.search"'
  },
  {
    from: '<div class="footer__copyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>',
    to: '<div class="footer__copyright" data-i18n="common.footerCopyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>'
  },
  {
    from: '<a href="dashboard.html" class="dash-bottom-nav__item" id="bnav-home"><i\n        data-lucide="home"></i><span>Home</span></a>',
    to: '<a href="dashboard.html" class="dash-bottom-nav__item" id="bnav-home"><i data-lucide="home"></i><span data-i18n="common.home">Home</span></a>'
  },
  {
    from: '<a href="lots.html" class="dash-bottom-nav__item dash-bottom-nav__item--active" id="bnav-lots"><i\n        data-lucide="package"></i><span>My Lots</span></a>',
    to: '<a href="lots.html" class="dash-bottom-nav__item dash-bottom-nav__item--active" id="bnav-lots"><i data-lucide="package"></i><span data-i18n="navigation.myLots">My Lots</span></a>'
  }
]);

// 3. STORAGE.HTML
updateFile('storage.html', [
  {
    from: '<a href="dashboard.html" style="color: var(--ks-gold, #C9973B); text-decoration: none;">Dashboard</a> /',
    to: '<a href="dashboard.html" style="color: var(--ks-gold, #C9973B); text-decoration: none;" data-i18n="navigation.dashboard">Dashboard</a> /'
  },
  {
    from: '<strong>Storage Options</strong>',
    to: '<strong data-i18n="navigation.storage">Storage Options</strong>'
  },
  {
    from: 'placeholder="Search crops, markets, buyers..."',
    to: 'placeholder="Search crops, markets, buyers..." data-i18n-placeholder="common.search"'
  },
  {
    from: '<div class="footer__copyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>',
    to: '<div class="footer__copyright" data-i18n="common.footerCopyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>'
  }
]);

// 4. MARKET.HTML
updateFile('market.html', [
  {
    from: '<a href="dashboard.html" id="breadcrumb-dash-link" style="color: var(--ks-gold, #C9973B); text-decoration: none;">Dashboard</a> /',
    to: '<a href="dashboard.html" id="breadcrumb-dash-link" style="color: var(--ks-gold, #C9973B); text-decoration: none;" data-i18n="navigation.dashboard">Dashboard</a> /'
  },
  {
    from: '<strong>Marketplace</strong>',
    to: '<strong data-i18n="navigation.marketplace">Marketplace</strong>'
  },
  {
    from: 'placeholder="Search crops, markets, buyers..."',
    to: 'placeholder="Search crops, markets, buyers..." data-i18n-placeholder="common.search"'
  },
  {
    from: '<div class="footer__copyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>',
    to: '<div class="footer__copyright" data-i18n="common.footerCopyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>'
  }
]);

// 5. ORDERS.HTML
updateFile('orders.html', [
  {
    from: '<a href="dashboard.html" style="color: var(--ks-gold, #C9973B); text-decoration: none;">Dashboard</a> /',
    to: '<a href="dashboard.html" style="color: var(--ks-gold, #C9973B); text-decoration: none;" data-i18n="navigation.dashboard">Dashboard</a> /'
  },
  {
    from: '<strong>Orders</strong>',
    to: '<strong data-i18n="navigation.orders">Orders</strong>'
  },
  {
    from: 'placeholder="Search crops, markets, buyers..."',
    to: 'placeholder="Search crops, markets, buyers..." data-i18n-placeholder="common.search"'
  },
  {
    from: '<div class="footer__copyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>',
    to: '<div class="footer__copyright" data-i18n="common.footerCopyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>'
  }
]);

// 6. BUYERS.HTML & BUYER-INQUIRIES.HTML
updateFile('buyers.html', [
  {
    from: 'placeholder="Search crops, markets, buyers..."',
    to: 'placeholder="Search crops, markets, buyers..." data-i18n-placeholder="common.search"'
  },
  {
    from: '<div class="footer__copyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>',
    to: '<div class="footer__copyright" data-i18n="common.footerCopyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>'
  }
]);

updateFile('buyer-inquiries.html', [
  {
    from: '<a href="dashboard.html" style="color: var(--ks-gold, #C9973B); text-decoration: none;">Dashboard</a> /',
    to: '<a href="dashboard.html" style="color: var(--ks-gold, #C9973B); text-decoration: none;" data-i18n="navigation.dashboard">Dashboard</a> /'
  },
  {
    from: '<strong>Buyer Inquiries</strong>',
    to: '<strong data-i18n="navigation.buyers">Buyer Inquiries</strong>'
  },
  {
    from: 'placeholder="Search crops, markets, buyers..."',
    to: 'placeholder="Search crops, markets, buyers..." data-i18n-placeholder="common.search"'
  }
]);

// 7. AI-FORECAST.HTML & MANDI-COMPARE.HTML
updateFile('ai-forecast.html', [
  {
    from: '<a href="dashboard.html" style="color: var(--ks-gold, #C9973B); text-decoration: none;">Dashboard</a> /',
    to: '<a href="dashboard.html" style="color: var(--ks-gold, #C9973B); text-decoration: none;" data-i18n="navigation.dashboard">Dashboard</a> /'
  },
  {
    from: '<strong>AI Forecast</strong>',
    to: '<strong data-i18n="navigation.aiForecast">AI Forecast</strong>'
  },
  {
    from: 'placeholder="Search crops, markets, buyers..."',
    to: 'placeholder="Search crops, markets, buyers..." data-i18n-placeholder="common.search"'
  },
  {
    from: '<div class="footer__copyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>',
    to: '<div class="footer__copyright" data-i18n="common.footerCopyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>'
  }
]);

updateFile('mandi-compare.html', [
  {
    from: '<a href="dashboard.html"><i data-lucide="home"></i> Dashboard</a>',
    to: '<a href="dashboard.html" data-i18n="navigation.dashboard"><i data-lucide="home"></i> Dashboard</a>'
  },
  {
    from: '<span class="active">Price Compare</span>',
    to: '<span class="active" data-i18n="navigation.compare">Price Compare</span>'
  },
  {
    from: 'placeholder="Search crops, markets, buyers..."',
    to: 'placeholder="Search crops, markets, buyers..." data-i18n-placeholder="common.search"'
  },
  {
    from: '<div class="footer__copyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>',
    to: '<div class="footer__copyright" data-i18n="common.footerCopyright">© 2026 KrishiShetra AgriTech Platform. Built for Indian Farmers & FPOs.</div>'
  }
]);

// 8. BUYER.HTML
updateFile('buyer.html', [
  {
    from: 'placeholder="Search crops, mandis, lots..."',
    to: 'placeholder="Search crops, mandis, lots..." data-i18n-placeholder="common.search"'
  }
]);

// 9. INDEX.HTML (Landing Page Global Navbar & CTA)
updateFile('index.html', [
  {
    from: '<a href="#solution" class="navbar__link">Product</a>',
    to: '<a href="#solution" class="navbar__link" data-i18n="navigation.dashboard">Product</a>'
  },
  {
    from: '<a href="#scroll-transition" class="navbar__link">How It Works</a>',
    to: '<a href="#scroll-transition" class="navbar__link" data-i18n="common.learnMore">How It Works</a>'
  },
  {
    from: '<a href="#intelligence" class="navbar__link">Market Intelligence</a>',
    to: '<a href="#intelligence" class="navbar__link" data-i18n="market.mandiPrices">Market Intelligence</a>'
  },
  {
    from: '<a href="buyer.html" class="navbar__link">For Buyers</a>',
    to: '<a href="buyer.html" class="navbar__link" data-i18n="buyer.browseProduce">For Buyers</a>'
  },
  {
    from: '<a href="fpo-dashboard.html" class="navbar__link">For FPOs</a>',
    to: '<a href="fpo-dashboard.html" class="navbar__link" data-i18n="fpo.fpoDashboard">For FPOs</a>'
  },
  {
    from: '<a href="transporter/dashboard.html" class="navbar__link">For Transporters</a>',
    to: '<a href="transporter/dashboard.html" class="navbar__link" data-i18n="transporter.transporterDashboard">For Transporters</a>'
  },
  {
    from: '<a href="login.html" class="navbar__cta" id="btn-login-nav">Login</a>',
    to: '<a href="login.html" class="navbar__cta" id="btn-login-nav" data-i18n="common.login">Login</a>'
  }
]);

// 10. FPO-DASHBOARD.HTML
updateFile('fpo-dashboard.html', [
  {
    from: '<span>Log Out</span>',
    to: '<span data-i18n="common.logout">Log Out</span>'
  }
]);

// 11. TRANSPORTER DASHBOARD & PAGES
const transPages = [
  'transporter/dashboard.html',
  'transporter/active-trips.html',
  'transporter/available-loads.html',
  'transporter/drivers.html',
  'transporter/earnings.html',
  'transporter/fleet.html',
  'transporter/profile.html',
  'transporter/onboarding.html'
];

transPages.forEach(p => {
  updateFile(p, [
    {
      from: 'Logout / Sign Out',
      to: 'Logout'
    },
    {
      from: '<span>Logout</span>',
      to: '<span data-i18n="common.logout">Logout</span>'
    },
    {
      from: 'Logout</a>',
      to: '<span data-i18n="common.logout">Logout</span></a>'
    }
  ]);
});

// 12. ADMIN DASHBOARD & PAGES
const adminPages = [
  'admin/dashboard.html',
  'admin/farmers.html',
  'admin/reports.html',
  'admin/settings.html',
  'admin/storage.html',
  'admin/users.html'
];

adminPages.forEach(p => {
  updateFile(p, [
    {
      from: 'Logout</a>',
      to: '<span data-i18n="common.logout">Logout</span></a>'
    }
  ]);
});

console.log('\n=== GLOBAL LAYOUT TRANSLATION INJECTION COMPLETE! ===');
