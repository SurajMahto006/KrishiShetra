const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const parts = content.split(/(\b(?:en|hi|mr):\s*\{\s*translation:\s*\{)/);
  console.log('Language sections found in', path.basename(filePath), ':', parts.length);

  for (let i = 1; i < parts.length; i += 2) {
    const langHeader = parts[i];
    let langCode = 'en';
    if (langHeader.startsWith('hi:')) langCode = 'hi';
    else if (langHeader.startsWith('mr:')) langCode = 'mr';

    let sec = parts[i + 1];

    const mktLabel = langCode === 'hi' ? 'मंडी भाव एवं विश्लेषण' : (langCode === 'mr' ? 'बाजार भाव व विश्लेषण' : 'Market Intelligence');
    const fpoLabel = langCode === 'hi' ? 'एफपीओ के लिए' : (langCode === 'mr' ? 'एफपीओ साठी' : 'For FPOs');
    const transLabel = langCode === 'hi' ? 'ट्रांसपोर्टर्स के लिए' : (langCode === 'mr' ? 'ट्रान्सपोर्टर्स साठी' : 'For Transporters');

    if (!sec.includes('"mandiPrices":')) {
      sec = sec.replace(/"market":\s*\{/, `"market": {\n    "mandiPrices": "${mktLabel}",`);
    }
    if (!sec.includes('"fpoDashboard":')) {
      sec = sec.replace(/"fpo":\s*\{/, `"fpo": {\n    "fpoDashboard": "${fpoLabel}",`);
    }
    if (!sec.includes('"transporterDashboard":')) {
      sec = sec.replace(/"transporter":\s*\{/, `"transporter": {\n    "transporterDashboard": "${transLabel}",`);
    }

    parts[i + 1] = sec;
  }

  content = parts.join('');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated', filePath);
}

patchFile(path.join(__dirname, '..', 'js', 'i18n.js'));
patchFile(path.join(__dirname, '..', 'src', 'i18n.js'));
