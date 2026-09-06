const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));

const needed = [
  'farmerProfile', 'manageMyLots', 'priceAlerts', 'kisanHelpline',
  'verifiedBuyers', 'buyerPortal', 'createLot', 'activeProcurement',
  'incomingOffers', 'heroTagline', 'kisanSupport', 'home', 'forecast',
  'negotiatePrice', 'buyerOffer', 'counterOffer', 'noteToBuyer',
  'fullName', 'saveSettings', 'callCenter'
];

needed.forEach(needle => {
  const matches = [];
  for (const [cat, obj] of Object.entries(en)) {
    if (typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        if (k.toLowerCase().includes(needle.toLowerCase()) || (typeof v === 'string' && v.toLowerCase().includes(needle.toLowerCase()))) {
          matches.push(`${cat}.${k} -> "${v}"`);
        }
      }
    }
  }
  console.log(`=== Query: "${needle}" ===`);
  console.log(matches.slice(0, 5).join('\n'));
});
