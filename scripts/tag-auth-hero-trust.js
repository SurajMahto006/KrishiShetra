const fs = require('fs');
const path = require('path');

['login.html', 'register.html'].forEach(filename => {
  const filePath = path.join(__dirname, '..', filename);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    '<span id="badge-farmers">50,000+ Active Farmers</span>',
    '<span id="badge-farmers" data-i18n="auth.activeFarmers">50,000+ Active Farmers</span>'
  );
  content = content.replace(
    '<span id="badge-mandis">120+ APMC Mandis</span>',
    '<span id="badge-mandis" data-i18n="auth.apmcMandis">120+ APMC Mandis</span>'
  );
  content = content.replace(
    '<span id="badge-verified">100% Verified Buyers</span>',
    '<span id="badge-verified" data-i18n="auth.verifiedBuyers">100% Verified Buyers</span>'
  );
  content = content.replace(
    '<span id="trust-secure">Secure</span>',
    '<span id="trust-secure" data-i18n="auth.secure">Secure</span>'
  );
  content = content.replace(
    '<span id="trust-simple">Simple</span>',
    '<span id="trust-simple" data-i18n="auth.simple">Simple</span>'
  );
  content = content.replace(
    '<span id="trust-transparent">Transparent</span>',
    '<span id="trust-transparent" data-i18n="auth.transparent">Transparent</span>'
  );
  content = content.replace(
    '<span id="text-privacy">Your data is secure and protected under AgriStack guidelines.</span>',
    '<span id="text-privacy" data-i18n="auth.privacyNotice">Your data is secure and protected under AgriStack guidelines.</span>'
  );
  content = content.replace(
    '<span>Developer Testing</span>',
    '<span data-i18n="auth.devTesting">Developer Testing</span>'
  );
  content = content.replace(
    '<span class="auth-dev-testing__badge">Local Dev Only</span>',
    '<span class="auth-dev-testing__badge" data-i18n="auth.localDevOnly">Local Dev Only</span>'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated data-i18n tags in ${filename}`);
});
