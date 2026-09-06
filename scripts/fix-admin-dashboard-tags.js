const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// 1. Update locales
['en.json', 'hi.json', 'mr.json'].forEach(f => {
  const p = path.join(rootDir, 'src', 'locales', f);
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  d.common.dashboard = f === 'hi.json' ? 'डैशबोर्ड' : (f === 'mr.json' ? 'डॅशबोर्ड' : 'Dashboard');
  d.common.saveChanges = f === 'hi.json' ? 'परिवर्तन सहेजें' : (f === 'mr.json' ? 'बदल जतन करा' : 'Save Changes');
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
});

// 2. Update admin/dashboard.html
const dashPath = path.join(rootDir, 'admin', 'dashboard.html');
let dashHtml = fs.readFileSync(dashPath, 'utf8');

dashHtml = dashHtml.replace('<h2 class="glass-card-title">Registration Trends</h2>', '<h2 class="glass-card-title" data-i18n="admin.registrationTrends">Registration Trends</h2>');
dashHtml = dashHtml.replace('<p class="glass-card-subtitle">Monthly user & farmer registrations</p>', '<p class="glass-card-subtitle" data-i18n="admin.monthlyUserFarmerReg">Monthly user & farmer registrations</p>');
dashHtml = dashHtml.replace('<h2 class="glass-card-title">User Distribution</h2>', '<h2 class="glass-card-title" data-i18n="admin.userDistribution">User Distribution</h2>');
dashHtml = dashHtml.replace('<p class="glass-card-subtitle">Platform role breakdown</p>', '<p class="glass-card-subtitle" data-i18n="admin.platformRoleBreakdown">Platform role breakdown</p>');
dashHtml = dashHtml.replace('<h2 class="glass-card-title">Recent Activity</h2>', '<h2 class="glass-card-title" data-i18n="admin.recentActivity">Recent Activity</h2>');
dashHtml = dashHtml.replace('<p class="glass-card-subtitle">Latest platform events</p>', '<p class="glass-card-subtitle" data-i18n="admin.latestPlatformEvents">Latest platform events</p>');
dashHtml = dashHtml.replace('<h2 class="glass-card-title">Quick Actions</h2>', '<h2 class="glass-card-title" data-i18n="admin.quickActions">Quick Actions</h2>');
dashHtml = dashHtml.replace('<p class="glass-card-subtitle">Common admin tasks</p>', '<p class="glass-card-subtitle" data-i18n="admin.commonAdminTasks">Common admin tasks</p>');
dashHtml = dashHtml.replace('<h2 class="glass-card-title">Platform Health</h2>', '<h2 class="glass-card-title" data-i18n="admin.platformHealth">Platform Health</h2>');
dashHtml = dashHtml.replace('<p class="glass-card-subtitle">Key performance indicators</p>', '<p class="glass-card-subtitle" data-i18n="admin.kpis">Key performance indicators</p>');

fs.writeFileSync(dashPath, dashHtml, 'utf8');
console.log('Successfully updated admin/dashboard.html and locale files.');
