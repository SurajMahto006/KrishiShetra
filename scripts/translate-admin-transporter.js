const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function updateAdminAndTransporterPages() {
  const adminFiles = fs.readdirSync(path.join(rootDir, 'admin')).filter(f => f.endsWith('.html'));
  adminFiles.forEach(file => {
    const p = path.join(rootDir, 'admin', file);
    let html = fs.readFileSync(p, 'utf8');

    html = html.replace(/<i data-lucide="layout-dashboard"[^>]*><\/i>\s*Dashboard/g, '<i data-lucide="layout-dashboard" style="width:16px;height:16px;"></i> <span data-i18n="navigation.dashboard">Dashboard</span>');
    html = html.replace(/<i data-lucide="users"[^>]*><\/i>\s*Users/g, '<i data-lucide="users" style="width:16px;height:16px;"></i> <span data-i18n="navigation.users">Users</span>');
    html = html.replace(/<i data-lucide="user-check"[^>]*><\/i>\s*Farmers/g, '<i data-lucide="user-check" style="width:16px;height:16px;"></i> <span data-i18n="navigation.farmers">Farmers</span>');
    html = html.replace(/<i data-lucide="warehouse"[^>]*><\/i>\s*Storage Hub/g, '<i data-lucide="warehouse" style="width:16px;height:16px;"></i> <span data-i18n="navigation.storage">Storage Hub</span>');
    html = html.replace(/<i data-lucide="bar-chart-2"[^>]*><\/i>\s*Reports/g, '<i data-lucide="bar-chart-2" style="width:16px;height:16px;"></i> <span data-i18n="navigation.reports">Reports</span>');
    html = html.replace(/<i data-lucide="settings"[^>]*><\/i>\s*Settings/g, '<i data-lucide="settings" style="width:16px;height:16px;"></i> <span data-i18n="navigation.settings">Settings</span>');

    fs.writeFileSync(p, html, 'utf8');
    console.log('[UPDATED ADMIN]', file);
  });

  const transFiles = fs.readdirSync(path.join(rootDir, 'transporter')).filter(f => f.endsWith('.html'));
  transFiles.forEach(file => {
    const p = path.join(rootDir, 'transporter', file);
    let html = fs.readFileSync(p, 'utf8');

    html = html.replace(/<i data-lucide="layout-dashboard"[^>]*><\/i>\s*Dashboard/g, '<i data-lucide="layout-dashboard" style="width:16px;height:16px;"></i> <span data-i18n="navigation.dashboard">Dashboard</span>');
    html = html.replace(/<i data-lucide="package-search"[^>]*><\/i>\s*Available Loads/g, '<i data-lucide="package-search" style="width:16px;height:16px;"></i> <span data-i18n="navigation.availableLoads">Available Loads</span>');
    html = html.replace(/<i data-lucide="truck"[^>]*><\/i>\s*Active Trips/g, '<i data-lucide="truck" style="width:16px;height:16px;"></i> <span data-i18n="navigation.activeTrips">Active Trips</span>');
    html = html.replace(/<i data-lucide="shield-check"[^>]*><\/i>\s*Fleet/g, '<i data-lucide="shield-check" style="width:16px;height:16px;"></i> <span data-i18n="navigation.fleet">Fleet</span>');
    html = html.replace(/<i data-lucide="users"[^>]*><\/i>\s*Drivers/g, '<i data-lucide="users" style="width:16px;height:16px;"></i> <span data-i18n="navigation.drivers">Drivers</span>');
    html = html.replace(/<i data-lucide="wallet"[^>]*><\/i>\s*Earnings/g, '<i data-lucide="wallet" style="width:16px;height:16px;"></i> <span data-i18n="navigation.earnings">Earnings</span>');
    html = html.replace(/<i data-lucide="user-check"[^>]*><\/i>\s*Profile/g, '<i data-lucide="user-check" style="width:16px;height:16px;"></i> <span data-i18n="common.profile">Profile</span>');

    fs.writeFileSync(p, html, 'utf8');
    console.log('[UPDATED TRANSPORTER]', file);
  });
}

updateAdminAndTransporterPages();
console.log('Admin & Transporter layout elements translated successfully!');
