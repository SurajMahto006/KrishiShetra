const path = require('path');
const i18next = require('../src/i18n.js');

console.log('=== STEP 5: VERIFYING AUTHENTICATION TRANSLATIONS ACROSS LANGUAGES ===\n');

const authKeys = [
  'auth.welcomeBack',
  'auth.loginSubtitle',
  'auth.emailAddress',
  'auth.password',
  'auth.forgotPassword',
  'auth.createAccount',
  'auth.dontHaveAccount',
  'auth.alreadyHaveAccount',
  'auth.logIn',
  'auth.registerTitle',
  'auth.registerSubtitle',
  'auth.fullName',
  'auth.mobileNumber',
  'auth.iAmA',
  'auth.farmer',
  'auth.fpo',
  'auth.buyer',
  'auth.transporter',
  'auth.termsAgreement',
  'auth.enterOtp',
  'auth.otpSentTo',
  'auth.resendOtpIn',
  'auth.resendCode',
  'auth.verifyAndContinue',
  'auth.sendResetOtp',
  'auth.newPassword',
  'auth.resetPassword',
  'auth.loginSuccess',
  'auth.registrationSuccess',
  'auth.otpVerified',
  'auth.passwordResetSuccess'
];

const validationKeys = [
  'validation.requiredField',
  'validation.invalidEmail',
  'validation.invalidPhone',
  'validation.passwordMinLength',
  'validation.passwordsDoNotMatch',
  'validation.invalidOtp',
  'validation.selectRole'
];

const errorKeys = [
  'errors.serverError',
  'errors.networkError',
  'errors.unauthorized',
  'errors.sessionExpired',
  'errors.unableToConnect',
  'errors.actionFailed'
];

const successKeys = [
  'success.profileUpdated',
  'success.passwordChanged'
];

const languages = ['en', 'hi', 'mr'];

languages.forEach(lang => {
  i18next.changeLanguage(lang);
  console.log(`========================================`);
  console.log(`Testing Language: [${lang.toUpperCase()}]`);
  console.log(`========================================`);

  console.log('--- Authentication Forms & Actions ---');
  authKeys.slice(0, 10).forEach(k => console.log(`  ${k.padEnd(25)}: ${i18next.t(k)}`));

  console.log('\n--- Role Selection ---');
  ['auth.farmer', 'auth.fpo', 'auth.buyer', 'auth.transporter'].forEach(k => {
    console.log(`  ${k.padEnd(25)}: ${i18next.t(k)}`);
  });

  console.log('\n--- OTP & Password Reset ---');
  ['auth.enterOtp', 'auth.resendCode', 'auth.verifyAndContinue', 'auth.sendResetOtp', 'auth.resetPassword'].forEach(k => {
    console.log(`  ${k.padEnd(25)}: ${i18next.t(k)}`);
  });

  console.log('\n--- Validation Messages ---');
  validationKeys.forEach(k => console.log(`  ${k.padEnd(30)}: ${i18next.t(k)}`));

  console.log('\n--- Error & Success Feedback ---');
  errorKeys.forEach(k => console.log(`  ${k.padEnd(30)}: ${i18next.t(k)}`));
  successKeys.forEach(k => console.log(`  ${k.padEnd(30)}: ${i18next.t(k)}`));

  console.log('\n');
});

// Parity check across all auth, validation, errors, success keys
let allResolved = true;
languages.forEach(lang => {
  i18next.changeLanguage(lang);
  [...authKeys, ...validationKeys, ...errorKeys, ...successKeys].forEach(k => {
    const val = i18next.t(k);
    if (!val || val === k) {
      console.error(`[FAIL] Unresolved key in ${lang}: ${k}`);
      allResolved = false;
    }
  });
});

if (allResolved) {
  console.log('=== ALL STEP 5 AUTHENTICATION TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
} else {
  console.error('=== STEP 5 VALIDATION DETECTED MISSING KEYS ===');
  process.exit(1);
}
