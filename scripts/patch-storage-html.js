const fs = require('fs');
const path = require('path');

const storageHtmlPath = path.join(__dirname, '..', 'storage.html');
let content = fs.readFileSync(storageHtmlPath, 'utf8');

const replacements = [
  { from: 'data-i18n="filterRadius"', to: 'data-i18n="storage.filterRadius"' },
  { from: 'data-i18n="svsTitle"', to: 'data-i18n="storage.sellVsStoreEngineTitle"' },
  { from: 'data-i18n="svsSubtitle"', to: 'data-i18n="storage.sellVsStoreEngineSubtitle"' },
  { from: 'data-i18n="svsBadge"', to: 'data-i18n="ai.aiRecommendationLive"' },
  { from: 'data-i18n="lblCrop"', to: 'data-i18n="storage.cropCommodity"' },
  { from: 'data-i18n="lblQty"', to: 'data-i18n="storage.quantityQuintals"' },
  { from: 'data-i18n="lblCurPrice"', to: 'data-i18n="storage.currentMandiPrice"' },
  { from: 'data-i18n="lblDuration"', to: 'data-i18n="storage.storageDuration"' },
  { from: 'data-i18n="btnEvaluate"', to: 'data-i18n="storage.evaluateOutcome"' },
  { from: 'data-i18n="optSell"', to: 'data-i18n="ai.optionASellNow"' },
  { from: 'data-i18n="lblRealization"', to: 'data-i18n="storage.netRealization"' },
  { from: 'data-i18n="optStore"', to: 'data-i18n="ai.optionBStore"' },
  { from: 'data-i18n="lblStorageRent"', to: 'data-i18n="storage.storageRent"' },
  { from: 'data-i18n="lblHandling"', to: 'data-i18n="storage.inOutHandling"' },
  { from: 'data-i18n="lblWeightLoss"', to: 'data-i18n="storage.weightLossMoisture"' },
  { from: 'data-i18n="lblNetGain"', to: 'data-i18n="storage.netFinancialGain"' },
  { from: 'data-i18n="modalBookingTitle"', to: 'data-i18n="storage.bookStorageSpace"' },
  { from: 'data-i18n="modalPledgeTitle"', to: 'data-i18n="storage.applyPledgeLoan"' },
];

replacements.forEach(r => {
  content = content.replaceAll(r.from, r.to);
});

fs.writeFileSync(storageHtmlPath, content, 'utf8');
console.log('storage.html tags patched successfully!');
