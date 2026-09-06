const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function replaceInFile(relPath, replacements) {
  const filePath = path.join(rootDir, relPath);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  replacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      count++;
    }
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[UPDATED] ${relPath} (${count} replacements applied)`);
}

// ── ADMIN FILES LOCALIZATION ──

// admin/dashboard.html
replaceInFile('admin/dashboard.html', [
  {
    from: `onclick="showToast('3 new notifications')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.notificationsToast', {count:3}) : '3 new notifications'))"`
  },
  {
    from: `onclick="showToast('Exporting chart data...')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.exportingChartData') : 'Exporting chart data...'))"`
  },
  {
    from: `onclick="showToast('Loading full activity log...')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.loadingFullActivityLog') : 'Loading full activity log...'))"`
  },
  {
    from: `onclick="showToast('Generating reports...')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.generatingReports') : 'Generating reports...'))"`
  },
  {
    from: `onclick="showToast('Refreshing data...')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.refreshingData') : 'Refreshing data...'))"`
  },
  {
    from: `<h1 class="welcome-hero-greeting">Good Evening, <em>Admin</em> 👋</h1>`,
    to: `<h1 class="welcome-hero-greeting"><span data-i18n="common.goodEvening">Good Evening,</span> <em>Admin</em> 👋</h1>`
  },
  {
    from: `<p class="welcome-hero-subtitle">Here's what's happening on the KrishiShetra platform today. You have 18 items requiring your attention.</p>`,
    to: `<p class="welcome-hero-subtitle" data-i18n="admin.platformOverviewSubtitle">Here's what's happening on the KrishiShetra platform today.</p>`
  },
  {
    from: `<h3 class="section-title">Registration Trends</h3>`,
    to: `<h3 class="section-title" data-i18n="admin.registrationTrends">Registration Trends</h3>`
  },
  {
    from: `<p class="section-subtitle">Monthly user & farmer registrations</p>`,
    to: `<p class="section-subtitle" data-i18n="admin.monthlyUserFarmerReg">Monthly user & farmer registrations</p>`
  },
  {
    from: `<h3 class="section-title">User Distribution</h3>`,
    to: `<h3 class="section-title" data-i18n="admin.userDistribution">User Distribution</h3>`
  },
  {
    from: `<p class="section-subtitle">Platform role breakdown</p>`,
    to: `<p class="section-subtitle" data-i18n="admin.platformRoleBreakdown">Platform role breakdown</p>`
  },
  {
    from: `<h3 class="section-title">Recent Activity</h3>`,
    to: `<h3 class="section-title" data-i18n="admin.recentActivity">Recent Activity</h3>`
  },
  {
    from: `<p class="section-subtitle">Latest platform events</p>`,
    to: `<p class="section-subtitle" data-i18n="admin.latestPlatformEvents">Latest platform events</p>`
  },
  {
    from: `<h3 class="section-title">Quick Actions</h3>`,
    to: `<h3 class="section-title" data-i18n="admin.quickActions">Quick Actions</h3>`
  },
  {
    from: `<p class="section-subtitle">Common admin tasks</p>`,
    to: `<p class="section-subtitle" data-i18n="admin.commonAdminTasks">Common admin tasks</p>`
  },
  {
    from: `<span class="quick-action-label">Add Farmer</span>`,
    to: `<span class="quick-action-label" data-i18n="admin.addFarmer">Add Farmer</span>`
  },
  {
    from: `<span class="quick-action-label">Verify KYC</span>`,
    to: `<span class="quick-action-label" data-i18n="admin.verifyKyc">Verify KYC</span>`
  },
  {
    from: `<span class="quick-action-label">Export Report</span>`,
    to: `<span class="quick-action-label" data-i18n="admin.exportReport">Export Report</span>`
  },
  {
    from: `<h3 class="section-title">System Alerts</h3>`,
    to: `<h3 class="section-title" data-i18n="admin.systemAlerts">System Alerts</h3>`
  },
  {
    from: `<h3 class="section-title">Platform Health</h3>`,
    to: `<h3 class="section-title" data-i18n="admin.platformHealth">Platform Health</h3>`
  },
  {
    from: `<p class="section-subtitle">Key performance indicators</p>`,
    to: `<p class="section-subtitle" data-i18n="admin.kpis">Key performance indicators</p>`
  }
]);

// admin/farmers.html
replaceInFile('admin/farmers.html', [
  {
    from: `onclick="showToast('3 new notifications')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.notificationsToast', {count:3}) : '3 new notifications'))"`
  },
  {
    from: `onclick="showToast('Exporting farmer data...')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.exportingData', 'Exporting farmer data...') : 'Exporting farmer data...'))"`
  },
  {
    from: `onclick="showToast('Add farmer modal would open here')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.addFarmer') : 'Add Farmer'))"`
  },
  {
    from: `onclick="showToast('Opening KYC review queue...')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.openingKycQueue') : 'Opening KYC review queue...'))"`
  }
]);

// admin/reports.html
replaceInFile('admin/reports.html', [
  {
    from: `onclick="showToast('3 new notifications')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.notificationsToast', {count:3}) : '3 new notifications'))"`
  },
  {
    from: `onchange="showToast('Updating report range...')"`,
    to: `onchange="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.updatingReportRange') : 'Updating report range...'))"`
  },
  {
    from: `onclick="showToast('Generating full report PDF...')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.generatingFullReportPdf') : 'Generating full report PDF...'))"`
  },
  {
    from: `onclick="showToast('Exporting GMV data...')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.exportingGmvData') : 'Exporting GMV data...'))"`
  },
  {
    from: `onclick="showToast('Exporting price data...')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.exportingPriceData') : 'Exporting price data...'))"`
  },
  {
    from: `onclick="showToast('Refreshing metrics...')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.refreshingMetrics') : 'Refreshing metrics...'))"`
  }
]);

// admin/settings.html
replaceInFile('admin/settings.html', [
  {
    from: `onclick="showToast('3 new notifications')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.notificationsToast', {count:3}) : '3 new notifications'))"`
  },
  {
    from: `onclick="showToast('Downloading audit log...')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.downloadingAuditLog') : 'Downloading audit log...'))"`
  },
  {
    from: `onclick="showToast('Are you sure? This cannot be undone.', 'error')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('common.confirmAction') : 'Are you sure? This cannot be undone.'), 'error')"`
  },
  {
    from: `onclick="showToast('This action requires Super Admin confirmation.', 'error')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('admin.superAdminConfirmToast') : 'This action requires Super Admin confirmation.'), 'error')"`
  },
  {
    from: `showToast('Settings saved successfully!', 'success');`,
    to: `showToast((typeof i18next !== 'undefined' ? i18next.t('admin.settingsSavedSuccess') : 'Settings saved successfully!'), 'success');`
  }
]);

// admin/index.html
replaceInFile('admin/index.html', [
  {
    from: `showToast('Login successful! Redirecting to dashboard...', 'success');`,
    to: `showToast((typeof i18next !== 'undefined' ? i18next.t('admin.loginSuccessRedirecting') : 'Login successful! Redirecting to dashboard...'), 'success');`
  }
]);

// ── TRANSPORTER FILES LOCALIZATION ──

replaceInFile('transporter/active-trips.html', [
  {
    from: `onclick="showToast('🛰️ Fleet GPS Telemetry synchronized with MoRTH AIS-140 servers.')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('transporter.fleetGpsSynced') : 'Fleet GPS Telemetry synchronized with MoRTH AIS-140 servers.'))"`
  }
]);

replaceInFile('transporter/available-loads.html', [
  {
    from: `onclick="showToast('Refreshed 18 available loads.')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('transporter.refreshedLoads') : 'Refreshed available loads.'))"`
  }
]);

replaceInFile('transporter/dashboard.html', [
  {
    from: `onclick="showToast('3 new high-value loads posted in Nashik corridor!')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('transporter.newHighValueLoads') : 'New high-value loads posted in your corridor!'))"`
  },
  {
    from: `onclick="showToast('FASTag Auto-Recharge enabled via HDFC Corporate.')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('transporter.fastagAutoTopupOn') : 'FASTag Auto-Recharge enabled via HDFC Corporate.'))"`
  }
]);

replaceInFile('transporter/profile.html', [
  {
    from: `onclick="showToast('Profile updated successfully!')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('transporter.profileUpdatedSuccess') : 'Profile updated successfully!'))"`
  },
  {
    from: `onclick="showToast('New corridor route added!')"`,
    to: `onclick="showToast((typeof i18next !== 'undefined' ? i18next.t('transporter.corridorRouteAdded') : 'New corridor route added!'))"`
  }
]);

// transporter/js/transporter.js
replaceInFile('transporter/js/transporter.js', [
  {
    from: `alert('Please enter valid 4-digit OTP provided by the destination mandi receiver.');`,
    to: `alert(typeof i18next !== 'undefined' ? i18next.t('transporter.enterValidOtp') : 'Please enter valid 4-digit OTP provided by destination mandi receiver.');`
  },
  {
    from: `showToast('Document verified with Ministry of Road Transport & Highways database!', 'success');`,
    to: `showToast(typeof i18next !== 'undefined' ? i18next.t('transporter.docVerifiedMorth') : 'Document verified with Ministry of Road Transport & Highways database!', 'success');`
  }
]);

console.log('Admin and Transporter files updated successfully with i18n support.');
