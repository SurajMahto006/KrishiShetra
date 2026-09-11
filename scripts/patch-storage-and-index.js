const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// 1. Patch storage.html
const storagePath = path.join(rootDir, 'storage.html');
let storageContent = fs.readFileSync(storagePath, 'utf8');

const storageMap = {
  'data-i18n="filterType"': 'data-i18n="storage.storageType"',
  'data-i18n="filterCrop"': 'data-i18n="storage.cropSuitability"',
  'data-i18n="svsTitle"': 'data-i18n="storage.sellVsStoreEngineTitle"',
  'data-i18n="svsSubtitle"': 'data-i18n="storage.sellVsStoreEngineSubtitle"',
  'data-i18n="svsBadge"': 'data-i18n="storage.aiRecommendation"',
  'data-i18n="lblCrop"': 'data-i18n="storage.cropCommodity"',
  'data-i18n="lblQty"': 'data-i18n="storage.quantityQuintals"',
  'data-i18n="lblCurPrice"': 'data-i18n="storage.currentMandiPrice"',
  'data-i18n="lblDuration"': 'data-i18n="storage.storageDuration"',
  'data-i18n="btnEvaluate"': 'data-i18n="storage.evaluateOutcome"',
  'data-i18n="optSell"': 'data-i18n="storage.sellNowOption"',
  'data-i18n="lblRealization"': 'data-i18n="storage.netRealization"',
  'data-i18n="optStore"': 'data-i18n="storage.storeAndHoldOption"',
  'data-i18n="lblStorageRent"': 'data-i18n="storage.storageRent"',
  'data-i18n="lblHandling"': 'data-i18n="storage.inOutHandling"',
  'data-i18n="lblWeightLoss"': 'data-i18n="storage.weightLossMoisture"',
  'data-i18n="lblNetGain"': 'data-i18n="storage.netFinancialGain"',
  'data-i18n="modalBookingTitle"': 'data-i18n="storage.bookStorageSpace"',
  'data-i18n="modalPledgeTitle"': 'data-i18n="storage.pledgeFinancingTitle"'
};

for (const [k, v] of Object.entries(storageMap)) {
  storageContent = storageContent.replace(new RegExp(k, 'g'), v);
}
fs.writeFileSync(storagePath, storageContent, 'utf8');
console.log('Patched storage.html successfully.');

// 2. Add keys into js/i18n.js and src/i18n.js
function patchI18nFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add into en translation
  // market.mandiPrices
  if (!content.includes('mandiPrices:')) {
    content = content.replace(
      /market:\s*\{/,
      "market: {\n        mandiPrices: 'Market Intelligence',"
    );
  }
  // fpo.fpoDashboard
  if (!content.includes('fpoDashboard:')) {
    content = content.replace(
      /fpo:\s*\{/,
      "fpo: {\n        fpoDashboard: 'For FPOs',"
    );
  }
  // transporter.transporterDashboard
  if (!content.includes('transporterDashboard:')) {
    content = content.replace(
      /transporter:\s*\{/,
      "transporter: {\n        transporterDashboard: 'For Transporters',"
    );
  }

  // Add into hi translation
  const hiMarketMarker = /hi:\s*\{[\s\S]*?market:\s*\{/;
  if (hiMarketMarker.test(content)) {
    content = content.replace(
      /(hi:\s*\{[\s\S]*?market:\s*\{)/,
      "$1\n        mandiPrices: 'मंडी भाव एवं विश्लेषण',"
    );
  }
  if (/(hi:\s*\{[\s\S]*?fpo:\s*\{)/.test(content)) {
    content = content.replace(
      /(hi:\s*\{[\s\S]*?fpo:\s*\{)/,
      "$1\n        fpoDashboard: 'एफपीओ के लिए',"
    );
  }
  if (/(hi:\s*\{[\s\S]*?transporter:\s*\{)/.test(content)) {
    content = content.replace(
      /(hi:\s*\{[\s\S]*?transporter:\s*\{)/,
      "$1\n        transporterDashboard: 'ट्रांसपोर्टर्स के लिए',"
    );
  }

  // Add into mr translation
  if (/(mr:\s*\{[\s\S]*?market:\s*\{)/.test(content)) {
    content = content.replace(
      /(mr:\s*\{[\s\S]*?market:\s*\{)/,
      "$1\n        mandiPrices: 'बाजार भाव व विश्लेषण',"
    );
  }
  if (/(mr:\s*\{[\s\S]*?fpo:\s*\{)/.test(content)) {
    content = content.replace(
      /(mr:\s*\{[\s\S]*?fpo:\s*\{)/,
      "$1\n        fpoDashboard: 'एफपीओ साठी',"
    );
  }
  if (/(mr:\s*\{[\s\S]*?transporter:\s*\{)/.test(content)) {
    content = content.replace(
      /(mr:\s*\{[\s\S]*?transporter:\s*\{)/,
      "$1\n        transporterDashboard: 'ट्रान्सपोर्टर्स साठी',"
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${filePath} successfully.`);
}

patchI18nFile(path.join(rootDir, 'js', 'i18n.js'));
patchI18nFile(path.join(rootDir, 'src', 'i18n.js'));
