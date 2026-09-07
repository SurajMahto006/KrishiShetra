const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// 1. UPDATE LOGIN.HTML
function updateLoginHtml() {
  const loginPath = path.join(rootDir, 'login.html');
  let html = fs.readFileSync(loginPath, 'utf8');

  // Static tags in login.html
  html = html.replace('<h2 class="auth-header__title" id="auth-title">Welcome back</h2>', '<h2 class="auth-header__title" id="auth-title" data-i18n="auth.welcomeBack">Welcome back</h2>');
  html = html.replace('<p class="auth-header__subtitle" id="auth-subtitle">Enter your credentials to access your account</p>', '<p class="auth-header__subtitle" id="auth-subtitle" data-i18n="auth.loginSubtitle">Enter your credentials to access your account</p>');
  html = html.replace('<button type="button" class="auth-tab-btn active" id="tab-btn-login">Log In</button>', '<button type="button" class="auth-tab-btn active" id="tab-btn-login" data-i18n="auth.logIn">Log In</button>');
  html = html.replace('<button type="button" class="auth-tab-btn" id="tab-btn-register">Register</button>', '<button type="button" class="auth-tab-btn" id="tab-btn-register" data-i18n="auth.createAccount">Register</button>');

  html = html.replace('<label class="auth-input-label" for="login-email" id="label-login-email">EMAIL ADDRESS</label>', '<label class="auth-input-label" for="login-email" id="label-login-email" data-i18n="auth.emailAddress">EMAIL ADDRESS</label>');
  html = html.replace('placeholder="farmer@example.com"', 'placeholder="farmer@example.com" data-i18n-placeholder="auth.emailPlaceholder"');
  html = html.replace('<label class="auth-input-label" for="login-password" id="label-login-password">PASSWORD</label>', '<label class="auth-input-label" for="login-password" id="label-login-password" data-i18n="auth.password">PASSWORD</label>');
  html = html.replace('<button type="button" class="auth-forgot-link" id="link-to-forgot">Forgot Password?</button>', '<button type="button" class="auth-forgot-link" id="link-to-forgot" data-i18n="auth.forgotPassword">Forgot Password?</button>');
  html = html.replace('placeholder="Enter your password"', 'placeholder="Enter your password" data-i18n-placeholder="auth.passwordPlaceholder"');
  html = html.replace('<span id="btn-login-text">Log In</span>', '<span id="btn-login-text" data-i18n="auth.logIn">Log In</span>');
  html = html.replace('<span id="text-no-account">Don\'t have an account?</span>', '<span id="text-no-account" data-i18n="auth.dontHaveAccount">Don\'t have an account?</span>');
  html = html.replace('<button type="button" class="auth-switch-link" id="link-to-register">Create an account</button>', '<button type="button" class="auth-switch-link" id="link-to-register" data-i18n="auth.createAccount">Create an account</button>');

  // Roles & Registration form
  html = html.replace('<label class="auth-roles-label" id="label-role">I AM A...</label>', '<label class="auth-roles-label" id="label-role" data-i18n="auth.iAmA">I AM A...</label>');
  html = html.replace('<span class="auth-role-card__name" id="role-name-farmer">Farmer</span>', '<span class="auth-role-card__name" id="role-name-farmer" data-i18n="auth.farmer">Farmer</span>');
  html = html.replace('<span class="auth-role-card__name" id="role-name-fpo">FPO</span>', '<span class="auth-role-card__name" id="role-name-fpo" data-i18n="auth.fpo">FPO</span>');
  html = html.replace('<span class="auth-role-card__name" id="role-name-buyer">Buyer</span>', '<span class="auth-role-card__name" id="role-name-buyer" data-i18n="auth.buyer">Buyer</span>');
  html = html.replace('<span class="auth-role-card__name" id="role-name-transporter">Transporter</span>', '<span class="auth-role-card__name" id="role-name-transporter" data-i18n="auth.transporter">Transporter</span>');

  html = html.replace('<label class="auth-input-label" for="register-name" id="label-register-name">FULL NAME</label>', '<label class="auth-input-label" for="register-name" id="label-register-name" data-i18n="auth.fullName">FULL NAME</label>');
  html = html.replace('placeholder="e.g. Rajesh Patil"', 'placeholder="e.g. Rajesh Patil" data-i18n-placeholder="auth.fullNamePlaceholder"');
  html = html.replace('<label class="auth-input-label" for="register-email" id="label-register-email">EMAIL ADDRESS</label>', '<label class="auth-input-label" for="register-email" id="label-register-email" data-i18n="auth.emailAddress">EMAIL ADDRESS</label>');
  html = html.replace('<label class="auth-input-label" for="register-phone" id="label-phone">MOBILE NUMBER</label>', '<label class="auth-input-label" for="register-phone" id="label-phone" data-i18n="auth.mobileNumber">MOBILE NUMBER</label>');
  html = html.replace('placeholder="10-digit number"', 'placeholder="10-digit number" data-i18n-placeholder="auth.mobilePlaceholder"');
  html = html.replace('<label class="auth-input-label" for="register-password" id="label-register-password">PASSWORD</label>', '<label class="auth-input-label" for="register-password" id="label-register-password" data-i18n="auth.password">PASSWORD</label>');
  html = html.replace('placeholder="Minimum 6 characters"', 'placeholder="Minimum 6 characters" data-i18n-placeholder="auth.newPasswordPlaceholder"');
  html = html.replace('<span id="btn-register-text">Register & Send OTP</span>', '<span id="btn-register-text" data-i18n="auth.registerTitle">Register & Send OTP</span>');
  html = html.replace('<span id="text-have-account">Already have an account?</span>', '<span id="text-have-account" data-i18n="auth.alreadyHaveAccount">Already have an account?</span>');
  html = html.replace('<button type="button" class="auth-switch-link" id="link-to-login">Log In</button>', '<button type="button" class="auth-switch-link" id="link-to-login" data-i18n="auth.logIn">Log In</button>');

  // Forgot & Reset Passwords
  html = html.replace('<label class="auth-input-label" for="forgot-email" id="label-forgot-email">EMAIL ADDRESS</label>', '<label class="auth-input-label" for="forgot-email" id="label-forgot-email" data-i18n="auth.emailAddress">EMAIL ADDRESS</label>');
  html = html.replace('<span id="btn-forgot-text">Send Reset OTP</span>', '<span id="btn-forgot-text" data-i18n="auth.sendResetOtp">Send Reset OTP</span>');
  html = html.replace('<button type="button" class="auth-switch-link" id="link-forgot-to-login">← Back to Log In</button>', '<button type="button" class="auth-switch-link" id="link-forgot-to-login" data-i18n="common.back">← Back to Log In</button>');

  html = html.replace('<label class="auth-input-label" for="reset-new-password" id="label-reset-password">NEW PASSWORD</label>', '<label class="auth-input-label" for="reset-new-password" id="label-reset-password" data-i18n="auth.newPassword">NEW PASSWORD</label>');
  html = html.replace('<span id="btn-reset-text">Reset Password</span>', '<span id="btn-reset-text" data-i18n="auth.resetPassword">Reset Password</span>');
  html = html.replace('<button type="button" class="auth-switch-link" id="link-reset-to-login">← Back to Log In</button>', '<button type="button" class="auth-switch-link" id="link-reset-to-login" data-i18n="common.back">← Back to Log In</button>');

  // OTP Step
  html = html.replace('<label class="auth-input-label" id="label-otp">ENTER 6-DIGIT EMAIL OTP</label>', '<label class="auth-input-label" id="label-otp" data-i18n="auth.enterOtp">ENTER 6-DIGIT EMAIL OTP</label>');
  html = html.replace('<span id="otp-sent-text">Verification code sent to</span>', '<span id="otp-sent-text" data-i18n="auth.otpSentTo">Verification code sent to</span>');
  html = html.replace('<span id="btn-edit-text">Change</span>', '<span id="btn-edit-text" data-i18n="common.edit">Change</span>');
  html = html.replace('<button type="button" class="auth-otp-resend-btn" id="btn-resend-otp" disabled>Resend Code</button>', '<button type="button" class="auth-otp-resend-btn" id="btn-resend-otp" data-i18n="auth.resendCode" disabled>Resend Code</button>');
  html = html.replace('<span id="btn-verify-text">Verify & Continue</span>', '<span id="btn-verify-text" data-i18n="auth.verifyAndContinue">Verify & Continue</span>');
  html = html.replace('<button type="button" class="auth-switch-link" id="link-back-to-login">← Back to Log In</button>', '<button type="button" class="auth-switch-link" id="link-back-to-login" data-i18n="common.back">← Back to Log In</button>');

  fs.writeFileSync(loginPath, html, 'utf8');
  console.log('[UPDATED] login.html with i18n tags');
}

updateLoginHtml();
