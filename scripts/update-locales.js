const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const enPath = path.join(localesDir, 'en.json');
const hiPath = path.join(localesDir, 'hi.json');
const mrPath = path.join(localesDir, 'mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

// 1. marketplace
en.marketplace = {
  title: "Market Overview",
  subtitle: "Live prices from nearby APMC markets",
  searchPlaceholder: "Search crop or mandi (e.g. Rice, Pune, Tomato)...",
  allCrops: "All Crops",
  allMandis: "All Mandis",
  allDemandLevels: "All Demand Levels",
  viewDetails: "View Details",
  highDemand: "HIGH DEMAND",
  mediumDemand: "MEDIUM",
  lowDemand: "LOW DEMAND",
  noMarketsFound: "No markets found",
  noCropsMatch: "No crops match your search",
  loadingMarketPrices: "Loading market prices..."
};

hi.marketplace = {
  title: "मंडी अवलोकन",
  subtitle: "नज़दीकी APMC मंडियों से लाइव भाव",
  searchPlaceholder: "फसल या मंडी खोजें (जैसे चावल, पुणे, टमाटर)...",
  allCrops: "सभी फसलें",
  allMandis: "सभी मंडियां",
  allDemandLevels: "सभी मांग स्तर",
  viewDetails: "विवरण देखें",
  highDemand: "उच्च मांग",
  mediumDemand: "मध्यम",
  lowDemand: "कम मांग",
  noMarketsFound: "कोई मंडी नहीं मिली",
  noCropsMatch: "आपकी खोज से कोई फसल नहीं मिली",
  loadingMarketPrices: "मंडी के भाव लोड हो रहे हैं..."
};

mr.marketplace = {
  title: "बाजारपेठ अवलोकन",
  subtitle: "जवळच्या APMC बाजारांमधील थेट भाव",
  searchPlaceholder: "पीक किंवा बाजार शोधा (उदा. तांदूळ, पुणे, टोमॅटो)...",
  allCrops: "सर्व पिके",
  allMandis: "सर्व मंड्या",
  allDemandLevels: "सर्व मागणी स्तर",
  viewDetails: "तपशील पहा",
  highDemand: "जास्त मागणी",
  mediumDemand: "मध्यम",
  lowDemand: "कमी मागणी",
  noMarketsFound: "कोणतीही मंडी सापडली नाही",
  noCropsMatch: "तुमच्या शोधाशी कोणतेही पीक जुळले नाही",
  loadingMarketPrices: "बाजारातील भाव लोड होत आहेत..."
};

// 2. crops
en.crops = {
  rice: "Rice",
  wheat: "Wheat",
  maize: "Maize",
  soybean: "Soybean",
  onion: "Onion",
  tomato: "Tomato",
  potato: "Potato",
  cotton: "Cotton",
  sugarcane: "Sugarcane",
  pulses: "Pulses",
  chilli: "Chilli",
  groundnut: "Groundnut",
  mango: "Mango",
  banana: "Banana",
  grapes: "Grapes",
  pomegranate: "Pomegranate",
  turmeric: "Turmeric",
  ginger: "Ginger",
  garlic: "Garlic"
};

hi.crops = {
  rice: "चावल",
  wheat: "गेहूं",
  maize: "मक्का",
  soybean: "सोयाबीन",
  onion: "प्याज़",
  tomato: "टमाटर",
  potato: "आलू",
  cotton: "कपास",
  sugarcane: "गन्ना",
  pulses: "दालें",
  chilli: "मिर्च",
  groundnut: "मूंगफली",
  mango: "आम",
  banana: "केला",
  grapes: "अंगूर",
  pomegranate: "अनार",
  turmeric: "हल्दी",
  ginger: "अदरक",
  garlic: "लहसुन"
};

mr.crops = {
  rice: "तांदूळ",
  wheat: "गहू",
  maize: "मका",
  soybean: "सोयाबीन",
  onion: "कांदा",
  tomato: "टोमॅटो",
  potato: "बटाटा",
  cotton: "कापूस",
  sugarcane: "ऊस",
  pulses: "डाळी",
  chilli: "मिरची",
  groundnut: "भुईमूग",
  mango: "आंबा",
  banana: "केळी",
  grapes: "द्राक्षे",
  pomegranate: "डाळिंब",
  turmeric: "हळद",
  ginger: "आले",
  garlic: "लसूण"
};

// 3. demand
en.demand = {
  high: "HIGH DEMAND",
  medium: "MEDIUM",
  low: "LOW DEMAND"
};

hi.demand = {
  high: "उच्च मांग",
  medium: "मध्यम",
  low: "कम मांग"
};

mr.demand = {
  high: "जास्त मागणी",
  medium: "मध्यम",
  low: "कमी मागणी"
};

// 4. market additional keys
en.market.marketDetails = "Market Details";
en.market.liveMarketData = "Live Market Data";
en.market.fromLastWeek = "from last week";
en.market.sellToBuyer = "Sell to Buyer";
en.market.farmerListings = "farmer listings";

hi.market.marketDetails = "मंडी विवरण";
hi.market.liveMarketData = "लाइव मंडी डेटा";
hi.market.fromLastWeek = "पिछले सप्ताह से";
hi.market.sellToBuyer = "खरीदार को बेचें";
hi.market.farmerListings = "किसान लिस्टिंग";

mr.market.marketDetails = "बाजारपेठ तपशील";
mr.market.liveMarketData = "थेट बाजारपेठ डेटा";
mr.market.fromLastWeek = "मागील आठवड्यापासून";
mr.market.sellToBuyer = "खरेदीदाराला विका";
mr.market.farmerListings = "शेतकरी याद्या";

// 5. farmer additional keys
en.farmer.purchasing = "Purchasing:";
en.farmer.min = "Min";

hi.farmer.purchasing = "खरीद रहे हैं:";
hi.farmer.min = "न्यूनतम";

mr.farmer.purchasing = "खरेदी करत आहेत:";
mr.farmer.min = "किमान";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
fs.writeFileSync(mrPath, JSON.stringify(mr, null, 2), 'utf8');

console.log('Updated en.json, hi.json, and mr.json successfully with marketplace, crops, demand, market, and farmer extensions!');
