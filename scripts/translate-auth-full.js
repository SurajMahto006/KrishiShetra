const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Helper replacement function
function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  replacements.forEach(([search, replace]) => {
    content = content.replace(search, replace);
  });
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. UPDATE LOGIN.HTML JAVASCRIPT HANDLERS
const loginPath = path.join(rootDir, 'login.html');
let loginHtml = fs.readFileSync(loginPath, 'utf8');

// Replace showLoginTab, showRegisterTab, etc. with i18n calls
loginHtml = loginHtml.replace(
  `        document.getElementById('auth-title').textContent = 'Welcome back';
        document.getElementById('auth-subtitle').textContent = 'Enter your credentials to access your account';`,
  `        const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f;
        document.getElementById('auth-title').textContent = t('auth.welcomeBack', 'Welcome back');
        document.getElementById('auth-subtitle').textContent = t('auth.loginSubtitle', 'Enter your credentials to access your account');`
);

loginHtml = loginHtml.replace(
  `        document.getElementById('auth-title').textContent = 'Create Account';
        document.getElementById('auth-subtitle').textContent = 'Join KrishiShetra and discover better market rates';`,
  `        const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f;
        document.getElementById('auth-title').textContent = t('auth.createAccount', 'Create Account');
        document.getElementById('auth-subtitle').textContent = t('auth.registerSubtitle', 'Join KrishiShetra and discover better market rates');`
);

loginHtml = loginHtml.replace(
  `        document.getElementById('auth-title').textContent = 'Reset Password';
        document.getElementById('auth-subtitle').textContent = 'Enter your registered email to receive a recovery OTP';`,
  `        const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f;
        document.getElementById('auth-title').textContent = t('auth.resetPassword', 'Reset Password');
        document.getElementById('auth-subtitle').textContent = t('auth.sendResetOtp', 'Enter your registered email to receive a recovery OTP');`
);

loginHtml = loginHtml.replace(
  `        document.getElementById('auth-title').textContent = 'Set New Password';
        document.getElementById('auth-subtitle').textContent = 'Create a new secure password for your account';`,
  `        const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f;
        document.getElementById('auth-title').textContent = t('auth.newPassword', 'Set New Password');
        document.getElementById('auth-subtitle').textContent = t('auth.newPasswordPlaceholder', 'Create a new secure password for your account');`
);

loginHtml = loginHtml.replace(
  `        document.getElementById('auth-title').textContent = forReset ? 'Reset Password' : 'Verify Email';
        document.getElementById('auth-subtitle').textContent = forReset ? 'Enter the recovery OTP sent to your inbox' : 'Enter the 6-digit OTP sent to your email inbox';`,
  `        const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f;
        document.getElementById('auth-title').textContent = forReset ? t('auth.resetPassword', 'Reset Password') : t('auth.enterOtp', 'Verify Email');
        document.getElementById('auth-subtitle').textContent = forReset ? t('auth.enterOtp', 'Enter recovery OTP') : t('auth.otpSentTo', 'Enter 6-digit OTP sent to your email');`
);

// Replace validation & errors
loginHtml = loginHtml.replace(
  `showAlert(loginAlert, 'Please enter both email and password.');`,
  `const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f; showAlert(loginAlert, t('validation.requiredField', 'Please enter both email and password.'));`
);

loginHtml = loginHtml.replace(
  `btnLogin.innerHTML = 'Signing in… <span class="auth-btn-arrow">⏳</span>';`,
  `const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f; btnLogin.innerHTML = \`\${t('common.loading', 'Signing in…')} <span class="auth-btn-arrow">⏳</span>\`;`
);

loginHtml = loginHtml.replace(
  `btnLogin.innerHTML = 'Login Successful! ✓';`,
  `const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f; btnLogin.innerHTML = \`\${t('auth.loginSuccess', 'Login Successful!')} ✓\`;`
);

loginHtml = loginHtml.replace(
  `showAlert(loginAlert, 'Unable to connect to KrishiShetra server. Please check your network connection or try again.');`,
  `const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f; showAlert(loginAlert, t('errors.networkError', 'Unable to connect to KrishiShetra server. Check your network.'));`
);

loginHtml = loginHtml.replace(
  `showAlert(registerAlert, 'Please fill in all required fields.');`,
  `const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f; showAlert(registerAlert, t('validation.requiredField', 'Please fill in all required fields.'));`
);

loginHtml = loginHtml.replace(
  `showAlert(registerAlert, 'Password must be at least 6 characters long.');`,
  `const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f; showAlert(registerAlert, t('validation.passwordMinLength', 'Password must be at least 6 characters long.'));`
);

loginHtml = loginHtml.replace(
  `btnRegister.innerHTML = 'Sending OTP… <span class="auth-btn-arrow">⏳</span>';`,
  `const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f; btnRegister.innerHTML = \`\${t('common.loading', 'Sending OTP…')} <span class="auth-btn-arrow">⏳</span>\`;`
);

loginHtml = loginHtml.replace(
  `showAlert(otpAlert, 'Please enter all 6 digits.');`,
  `const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f; showAlert(otpAlert, t('validation.invalidOtp', 'Please enter all 6 digits.'));`
);

loginHtml = loginHtml.replace(
  `showAlert(resetPassAlert, 'Password must be at least 6 characters long.');`,
  `const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f; showAlert(resetPassAlert, t('validation.passwordMinLength', 'Password must be at least 6 characters long.'));`
);

loginHtml = loginHtml.replace(
  `showAlert(resetPassAlert, 'Password reset successfully! Redirecting to login…', 'success');`,
  `const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : f; showAlert(resetPassAlert, t('auth.passwordResetSuccess', 'Password reset successfully! Redirecting to login…'), 'success');`
);

// Add languageChanged listener in login.html script
if (!loginHtml.includes('window.addEventListener(\'languageChanged\'')) {
  loginHtml = loginHtml.replace(
    `document.addEventListener('DOMContentLoaded', () => {`,
    `document.addEventListener('DOMContentLoaded', () => {
      window.addEventListener('languageChanged', () => {
        if (window.i18next && typeof window.i18next.translatePage === 'function') {
          window.i18next.translatePage();
        }
        if (tabBtnLogin && tabBtnLogin.classList.contains('active')) showLoginTab();
        else if (tabBtnRegister && tabBtnRegister.classList.contains('active')) showRegisterTab();
      });`
  );
}

fs.writeFileSync(loginPath, loginHtml, 'utf8');
console.log('[UPDATED] login.html with full dynamic i18n handlers');

// 2. UPDATE REGISTER.HTML
const registerPath = path.join(rootDir, 'register.html');
if (fs.existsSync(registerPath)) {
  let regHtml = fs.readFileSync(registerPath, 'utf8');

  regHtml = regHtml.replace('<h2 class="auth-header__title" id="auth-title">Create Account</h2>', '<h2 class="auth-header__title" id="auth-title" data-i18n="auth.registerTitle">Create Account</h2>');
  regHtml = regHtml.replace('<p class="auth-header__subtitle" id="auth-subtitle">Join KrishiShetra and discover better market rates</p>', '<p class="auth-header__subtitle" id="auth-subtitle" data-i18n="auth.registerSubtitle">Join KrishiShetra and discover better market rates</p>');
  regHtml = regHtml.replace('<a href="login.html" class="auth-tab-btn" id="tab-btn-login">Log In</a>', '<a href="login.html" class="auth-tab-btn" id="tab-btn-login" data-i18n="auth.logIn">Log In</a>');
  regHtml = regHtml.replace('<button type="button" class="auth-tab-btn active" id="tab-btn-register">Register</button>', '<button type="button" class="auth-tab-btn active" id="tab-btn-register" data-i18n="auth.createAccount">Register</button>');

  regHtml = regHtml.replace('<label class="auth-roles-label" id="label-role">I AM A...</label>', '<label class="auth-roles-label" id="label-role" data-i18n="auth.iAmA">I AM A...</label>');
  regHtml = regHtml.replace('<span class="auth-role-card__name" id="role-name-farmer">Farmer</span>', '<span class="auth-role-card__name" id="role-name-farmer" data-i18n="auth.farmer">Farmer</span>');
  regHtml = regHtml.replace('<span class="auth-role-card__name" id="role-name-fpo">FPO</span>', '<span class="auth-role-card__name" id="role-name-fpo" data-i18n="auth.fpo">FPO</span>');
  regHtml = regHtml.replace('<span class="auth-role-card__name" id="role-name-buyer">Buyer</span>', '<span class="auth-role-card__name" id="role-name-buyer" data-i18n="auth.buyer">Buyer</span>');
  regHtml = regHtml.replace('<span class="auth-role-card__name" id="role-name-transporter">Transporter</span>', '<span class="auth-role-card__name" id="role-name-transporter" data-i18n="auth.transporter">Transporter</span>');

  regHtml = regHtml.replace('<label class="auth-input-label" for="register-name" id="label-register-name">FULL NAME</label>', '<label class="auth-input-label" for="register-name" id="label-register-name" data-i18n="auth.fullName">FULL NAME</label>');
  regHtml = regHtml.replace('placeholder="e.g. Rajesh Patil"', 'placeholder="e.g. Rajesh Patil" data-i18n-placeholder="auth.fullNamePlaceholder"');
  regHtml = regHtml.replace('<label class="auth-input-label" for="register-email" id="label-register-email">EMAIL ADDRESS</label>', '<label class="auth-input-label" for="register-email" id="label-register-email" data-i18n="auth.emailAddress">EMAIL ADDRESS</label>');
  regHtml = regHtml.replace('placeholder="farmer@example.com"', 'placeholder="farmer@example.com" data-i18n-placeholder="auth.emailPlaceholder"');
  regHtml = regHtml.replace('<label class="auth-input-label" for="register-phone" id="label-phone">MOBILE NUMBER</label>', '<label class="auth-input-label" for="register-phone" id="label-phone" data-i18n="auth.mobileNumber">MOBILE NUMBER</label>');
  regHtml = regHtml.replace('placeholder="10-digit number"', 'placeholder="10-digit number" data-i18n-placeholder="auth.mobilePlaceholder"');
  regHtml = regHtml.replace('<label class="auth-input-label" for="register-password" id="label-register-password">PASSWORD</label>', '<label class="auth-input-label" for="register-password" id="label-register-password" data-i18n="auth.password">PASSWORD</label>');
  regHtml = regHtml.replace('placeholder="Minimum 6 characters"', 'placeholder="Minimum 6 characters" data-i18n-placeholder="auth.newPasswordPlaceholder"');
  regHtml = regHtml.replace('<span id="btn-register-text">Register & Send OTP</span>', '<span id="btn-register-text" data-i18n="auth.registerTitle">Register & Send OTP</span>');
  regHtml = regHtml.replace('<span id="text-have-account">Already have an account?</span>', '<span id="text-have-account" data-i18n="auth.alreadyHaveAccount">Already have an account?</span>');
  regHtml = regHtml.replace('<a href="login.html" class="auth-switch-link" id="link-to-login">Log In</a>', '<a href="login.html" class="auth-switch-link" id="link-to-login" data-i18n="auth.logIn">Log In</a>');

  fs.writeFileSync(registerPath, regHtml, 'utf8');
  console.log('[UPDATED] register.html with i18n tags');
}

console.log('=== AUTHENTICATION UI TRANSLATION COMPLETE! ===');
