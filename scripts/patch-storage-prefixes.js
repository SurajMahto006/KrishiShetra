const fs = require('fs');

let html = fs.readFileSync('storage.html', 'utf8');
const keys = [
  'heroTitle', 'heroBadge', 'heroSubtitle', 'btnCalc', 'btnPledge',
  'filterType', 'filterCrop', 'filterRadius', 'svsTitle', 'svsSubtitle',
  'svsBadge', 'lblCrop', 'lblQty', 'lblCurPrice', 'lblDuration',
  'btnEvaluate', 'optSell', 'lblRealization', 'optStore', 'lblStorageRent',
  'lblHandling', 'lblWeightLoss', 'lblNetGain', 'modalBookingTitle', 'modalPledgeTitle'
];

keys.forEach(k => {
  html = html.split('data-i18n="' + k + '"').join('data-i18n="storage.' + k + '"');
});

fs.writeFileSync('storage.html', html, 'utf8');
console.log('Fixed storage keys');
