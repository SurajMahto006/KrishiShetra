const fs = require('fs');
const path = require('path');

const newAuthKeys = {
  en: {
    "activeFarmers": "50,000+ Active Farmers",
    "apmcMandis": "120+ APMC Mandis",
    "verifiedBuyers": "100% Verified Buyers",
    "secure": "Secure",
    "simple": "Simple",
    "transparent": "Transparent",
    "privacyNotice": "Your data is secure and protected under AgriStack guidelines.",
    "devTesting": "Developer Testing",
    "localDevOnly": "Local Dev Only"
  },
  hi: {
    "activeFarmers": "50,000+ सक्रिय किसान",
    "apmcMandis": "120+ एपीएमसी मंडियां",
    "verifiedBuyers": "100% सत्यापित खरीदार",
    "secure": "सुरक्षित",
    "simple": "सरल",
    "transparent": "पारदर्शी",
    "privacyNotice": "आपका डेटा सुरक्षित है और एग्रीस्टैक दिशानिर्देशों के तहत संरक्षित है।",
    "devTesting": "डेवलपर टेस्टिंग",
    "localDevOnly": "केवल लोकल टेस्ट"
  },
  mr: {
    "activeFarmers": "५०,०००+ सक्रिय शेतकरी",
    "apmcMandis": "१२०+ एपीएमसी बाजार समित्या",
    "verifiedBuyers": "१००% पडताळणी केलेले खरेदीदार",
    "secure": "सुरक्षित",
    "simple": "सोपे",
    "transparent": "पारदर्शक",
    "privacyNotice": "तुमचा डेटा सुरक्षित असून अ‍ॅग्रीस्टॅक नियमांनुसार संरक्षित आहे.",
    "devTesting": "डेव्हलपर टेस्टिंग",
    "localDevOnly": "केवळ लोकल चाचणी"
  }
};

['en', 'hi', 'mr'].forEach(lang => {
  const p = path.join(__dirname, '..', 'src', 'locales', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  data.auth = { ...data.auth, ...newAuthKeys[lang] };
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${lang}.json with new hero & trust auth keys`);
});
