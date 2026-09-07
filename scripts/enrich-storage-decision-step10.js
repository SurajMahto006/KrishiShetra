const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'src', 'locales', 'en.json');
const hiPath = path.join(__dirname, '..', 'src', 'locales', 'hi.json');
const mrPath = path.join(__dirname, '..', 'src', 'locales', 'mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

const step10StorageDecision = {
  // Discovery, Map, List & Comparison
  nearbyStorage: { en: 'Nearby Storage & Warehouses', hi: 'नजदीकी भंडारण एवं गोदाम', mr: 'जवळची साठवणूक व गोदामे' },
  storageMap: { en: 'Storage Map & Facility Locator', hi: 'भंडारण मानचित्र एवं सुविधा लोकेटर', mr: 'साठवणूक नकाशा व केंद्र शोधक' },
  storageList: { en: 'Storage Facility Listings', hi: 'भंडारण सुविधा सूची', mr: 'साठवणूक केंद्र यादी' },
  storageComparison: { en: 'Storage Facility Comparison', hi: 'भंडारण सुविधा तुलना', mr: 'साठवणूक केंद्र तुलना' },
  compareStorageOptions: { en: 'Compare Storage Options', hi: 'भंडारण विकल्पों की तुलना करें', mr: 'साठवणूक पर्यायांची तुलना करा' },
  verifiedStorage: { en: 'Verified Accredited Storage', hi: 'सत्यापित मान्यताप्राप्त भंडारण', mr: 'सत्यापित मान्यताप्राप्त साठवणूक' },
  verifiedFacility: { en: 'Verified Facility', hi: 'सत्यापित सुविधा', mr: 'सत्यापित केंद्र' },
  distance: { en: 'Distance', hi: 'दूरी', mr: 'अंतर' },
  distanceKm: { en: 'Distance (km)', hi: 'दूरी (किमी)', mr: 'अंतर (किमी)' },
  distanceRadius: { en: 'Distance Radius', hi: 'दूरी का दायरा', mr: 'अंतराची मर्यादा' },
  estimatedCost: { en: 'Estimated Total Cost', hi: 'अनुमानित कुल लागत', mr: 'अपेक्षित एकूण खर्च' },
  requestStorage: { en: 'Request Storage Space', hi: 'भंडारण स्थान का अनुरोध करें', mr: 'साठवणूक जागेची मागणी करा' },

  // SELL NOW VS STORE & SELL LATER INTERFACE
  sellNowVsStoreLater: { en: 'Sell Now vs. Store & Sell Later', hi: 'अभी बेचें बनाम बाद में बेचें (भंडारण)', mr: 'आता विका किंवा नंतर साठवून विका' },
  sellNow: { en: 'Sell Now', hi: 'अभी बेचें', mr: 'आता विका' },
  storeAndSellLater: { en: 'Store & Sell Later', hi: 'भंडारण करें और बाद में बेचें', mr: 'साठवा आणि नंतर विका' },
  currentPrice: { en: 'Current Price', hi: 'वर्तमान मूल्य', mr: 'सध्याचा भाव' },
  projectedPrice: { en: 'Projected Future Price', hi: 'अनुमानित भविष्य मूल्य', mr: 'अपेक्षित भावी भाव' },
  storageCost: { en: 'Storage Rent Cost', hi: 'भंडारण किराया लागत', mr: 'साठवणूक भाडे खर्च' },
  handlingCost: { en: 'Handling & Loading Cost', hi: 'हैंडलिंग एवं लोडिंग लागत', mr: 'हमाली व लोडिंग खर्च' },
  transportCost: { en: 'Transport Cost to Storage', hi: 'भंडारण तक परिवहन लागत', mr: 'गोदामापर्यंत वाहतूक खर्च' },
  logisticsCost: { en: 'Logistics / Freight Cost', hi: 'लॉजिस्टिक्स / भाड़ा लागत', mr: 'वाहतूक / मालभाडे खर्च' },
  estimatedWeightLoss: { en: 'Estimated Moisture / Weight Loss', hi: 'अनुमानित नमी / वजन में कमी', mr: 'अपेक्षित आर्द्रता / वजनातील घट' },
  expectedGain: { en: 'Expected Gross Gain', hi: 'अपेक्षित सकल लाभ', mr: 'अपेक्षित एकूण नफा' },
  projectedGrossGain: { en: 'Projected Gross Gain', hi: 'अनुमानित सकल लाभ', mr: 'अपेक्षित एकूण वाढ' },
  netBenefit: { en: 'Net Financial Benefit', hi: 'शुद्ध वित्तीय लाभ', mr: 'निव्वळ आर्थिक फायदा' },
  recommendation: { en: 'AI Recommendation', hi: 'एआई अनुशंसा', mr: 'एआय शिफारस' },
  reason: { en: 'Decision Reasoning & Market Logic', hi: 'निर्णय का कारण एवं बाजार तर्क', mr: 'निर्णयाचे कारण व बाजार तर्क' },
  decisionReason: { en: 'AI Analysis & Verdict Reason', hi: 'एआई विश्लेषण एवं निर्णय कारण', mr: 'एआय विश्लेषण व शिफारसीचे कारण' },
  aiExplanation: { en: 'AI Economic Explanation', hi: 'एआई आर्थिक व्याख्या', mr: 'एआय आर्थिक स्पष्टीकरण' },
  confidenceScore: { en: 'Confidence Score', hi: 'विश्वसनीयता स्कोर', mr: 'विश्वासार्हता गुणांक' },
  bullishTrend: { en: 'Bullish Price Outlook', hi: 'तेजी का रुख (बढ़त संभव)', mr: 'वाढीचा कल (भाव वाढण्याची शक्यता)' },
  bearishTrend: { en: 'Bearish / Stable Price Outlook', hi: 'मंदी / स्थिर रुख', mr: 'मंदी / स्थिर कल' },
  immediatePayout: { en: '0% (Immediate payout)', hi: '0% (तत्काल भुगतान)', mr: '0% (तात्काळ पैसे)' },
  holdingCostsHigher: {
    en: 'Holding costs would exceed expected future price appreciation.',
    hi: 'होल्डिंग लागत भविष्य में होने वाली संभावित मूल्य वृद्धि से अधिक होगी।',
    mr: 'साठवणूक खर्च भविष्यातील संभाव्य दरवाढीपेक्षा जास्त असेल.'
  },
  holdingProfitable: {
    en: 'Storing is profitable after covering all storage, handling, and moisture loss costs.',
    hi: 'सभी भंडारण, हैंडलिंग और नमी नुकसान के बाद फसल रोकना लाभदायक है।',
    mr: 'सर्व साठवणूक, हमाली आणि घट खर्च वजा जाता माल साठवणे फायदेशीर आहे.'
  }
};

function mergeCategory(dict, category, additions, lang) {
  if (!dict[category]) dict[category] = {};
  for (const [k, v] of Object.entries(additions)) {
    dict[category][k] = v[lang];
  }
}

['en', 'hi', 'mr'].forEach(lang => {
  const target = lang === 'en' ? en : lang === 'hi' ? hi : mr;
  mergeCategory(target, 'storage', step10StorageDecision, lang);
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
fs.writeFileSync(mrPath, JSON.stringify(mr, null, 2), 'utf8');

console.log('Successfully enriched en.json, hi.json, mr.json with Step 10 Farmer Storage Decision System translations!');
