const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('js/translations.js', 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const T = sandbox.window.KrishiTranslations;

// New key additions
const additions = {
  en: {
    crops: {
      rice: 'Rice',
      wheat: 'Wheat',
      maize: 'Maize',
      soybean: 'Soybean',
      soyabean: 'Soybean',
      pulses: 'Pulses',
      onion: 'Onion',
      tomato: 'Tomato',
      potato: 'Potato',
      chilli: 'Chilli',
      chili: 'Chilli',
      groundnut: 'Groundnut',
      cotton: 'Cotton',
      sugarcane: 'Sugarcane',
      mango: 'Mango',
      banana: 'Banana',
      grapes: 'Grapes',
      turmeric: 'Turmeric',
      ginger: 'Ginger',
      garlic: 'Garlic',
      mustard: 'Mustard',
      bajra: 'Bajra',
      jowar: 'Jowar'
    },
    farmer: {
      analyzingNearbyMarkets: 'Analyzing nearby markets for your location...',
      loadingMandisMap: 'Loading Indian Mandis Map...',
      orChooseCity: 'or choose city',
      storageHubAdvisor: 'Storage Hub & Advisor',
      marketDetails: 'Market Details',
      highDemand: 'High Demand',
      mediumDemand: 'Medium Demand',
      lowDemand: 'Low Demand'
    },
    cropLotModal: {
      createLotHeading: 'Create New Crop Lot',
      cropCategory: 'Crop',
      quantityAvailable: 'Quantity (Quintals)',
      expectedPricePerUnit: 'Expected Price (₹/q)',
      gradeSelection: 'Quality / Grade',
      originDistrict: 'Farm Location / Mandi',
      moistureQualityNotes: 'Description / Moisture / Variety'
    },
    cropLot: {
      editProduceLot: 'Edit Lot',
      pauseProduceLot: 'Pause Lot',
      deleteProduceLot: 'Delete Lot'
    },
    buyer: {
      negotiateRate: 'Negotiate Price'
    },
    market: {
      harvestDate: 'Harvest Date',
      whatFarmersAreSelling: 'What Farmers Are Selling',
      whatFarmersAreSellingSub: 'Popular crops with high buyer inquiries today',
      viewMyListings: 'View My Listings',
      compareMandiPrices: 'Compare Mandi Prices',
      compareMandiPricesSub: 'Select a crop to view prices across different mandis',
      selectedCrop: 'Selected Crop',
      stateRegion: 'State / Region',
      marketMandi: 'Market Mandi',
      historicalModalPrice: 'Historical Modal Price Trend',
      current: 'Current',
      highest: 'Highest',
      lowest: 'Lowest',
      average: 'Average',
      marketInsights: 'Market Insights',
      actionableIntelligence: 'Actionable intelligence for better selling decisions',
      currentMandiPrice: 'Current Mandi Price',
      aiSellingForecast: 'AI Selling Forecast',
      nearbyMandiComparison: 'Nearby Mandi Price Comparison',
      topVerifiedBuyers: 'Top Verified Corporate Buyers',
      createPriceAlert: 'Create Price Alert',
      targetPrice: 'Target Price (₹/q)',
      notifyVia: 'Notify Via',
      marketDetails: 'Market Details',
      highDemand: 'High Demand',
      mediumDemand: 'Medium Demand',
      lowDemand: 'Low Demand'
    },
    mandiCompare: {
      compareTitle: 'Mandi Price Comparison',
      liveIntelligence: 'Live APMC Intelligence & Net Realization Calculator',
      refreshPrices: 'Refresh Prices',
      yourListedLots: 'Your Listed Lots',
      bestNetRealization: 'Best Net Realization',
      lowestTransportCost: 'Lowest Transport Cost',
      closestMandi: 'Closest Mandi',
      bestOverallOption: 'Best Overall Option',
      multiMandiMatrix: 'Multi-Mandi Realization Matrix',
      visualAnalysisTitle: 'Visual Realization & Distance Analysis',
      marketConditionsWeather: 'Market Conditions & Road Transit',
      individualProfiles: 'Individual Mandi Profiles'
    },
    storage: {
      nearbyWarehousesTab: 'Nearby Warehouses & Godowns',
      sellVsStoreTab: 'Sell Now vs. Store & Hold',
      myStorageBookingsTab: 'My Storage & e-NWR Loans'
    },
    ai: {
      forecastEngineTitle: 'AI Market Price Forecast Engine',
      selectCrop: 'Select Crop',
      selectMandi: 'Select Market Mandi',
      forecastHorizon: 'Forecast Horizon',
      sevenDays: '7 Days',
      fourteenDays: '14 Days',
      thirtyDays: '30 Days',
      generateForecast: 'Generate Forecast',
      currentPrice: 'Current Price',
      expectedPrice: 'Expected Price',
      projectedChange: 'Projected Change',
      confidence: 'Model Confidence',
      sellNowVsStoreAnalysis: 'Sell Now vs. Store & Hold AI Analysis',
      sellNowVsStoreSubtitle: 'Evaluate whether waiting and storing yields higher net realization',
      recommendationStoreHold: 'AI Recommendation: Store & Hold',
      optionASellNow: 'OPTION A — SELL NOW',
      optionBStore: 'OPTION B — STORE & HOLD',
      exploreStorageOptions: 'Explore Storage Options',
      customCalculator: 'Custom Sell vs Store Calculator'
    }
  },
  hi: {
    crops: {
      rice: 'चावल',
      wheat: 'गेहूँ',
      maize: 'मक्का',
      soybean: 'सोयाबीन',
      soyabean: 'सोयाबीन',
      pulses: 'दलहन',
      onion: 'प्याज़',
      tomato: 'टमाटर',
      potato: 'आलू',
      chilli: 'मिर्च',
      chili: 'मिर्च',
      groundnut: 'मूंगफली',
      cotton: 'कपास',
      sugarcane: 'गन्ना',
      mango: 'आम',
      banana: 'केला',
      grapes: 'अंगूर',
      turmeric: 'हल्दी',
      ginger: 'अदरक',
      garlic: 'लहसुन',
      mustard: 'सरसों',
      bajra: 'बाजरा',
      jowar: 'ज्वार'
    },
    farmer: {
      analyzingNearbyMarkets: 'आपके स्थान के लिए नजदीकी बाजारों का विश्लेषण किया जा रहा है...',
      loadingMandisMap: 'भारतीय मंडी मानचित्र लोड हो रहा है...',
      orChooseCity: 'या शहर चुनें',
      storageHubAdvisor: 'भंडारण केंद्र और सलाहकार',
      marketDetails: 'बाजार विवरण',
      highDemand: 'उच्च मांग',
      mediumDemand: 'मध्यम मांग',
      lowDemand: 'कम मांग'
    },
    cropLotModal: {
      createLotHeading: 'नया फसल लॉट बनाएं',
      cropCategory: 'फसल',
      quantityAvailable: 'मात्रा (क्विंटल)',
      expectedPricePerUnit: 'अपेक्षित मूल्य (₹/क्विंटल)',
      gradeSelection: 'गुणवत्ता / ग्रेड',
      originDistrict: 'खेत का स्थान / मंडी',
      moistureQualityNotes: 'विवरण / नमी / किस्म'
    },
    cropLot: {
      editProduceLot: 'लॉट संपादित करें',
      pauseProduceLot: 'लॉट रोकें',
      deleteProduceLot: 'लॉट हटाएं'
    },
    buyer: {
      negotiateRate: 'मूल्य पर बातचीत करें'
    },
    market: {
      harvestDate: 'कटाई की तिथि',
      whatFarmersAreSelling: 'किसान क्या बेच रहे हैं',
      whatFarmersAreSellingSub: 'आज खरीदारों की अधिक मांग वाली लोकप्रिय फसलें',
      viewMyListings: 'मेरी लिस्टिंग देखें',
      compareMandiPrices: 'मंडी भावों की तुलना करें',
      compareMandiPricesSub: 'विभिन्न मंडियों के भाव देखने के लिए फसल चुनें',
      selectedCrop: 'चयनित फसल',
      stateRegion: 'राज्य / क्षेत्र',
      marketMandi: 'बाजार मंडी',
      historicalModalPrice: 'ऐतिहासिक मॉडल मूल्य रुझान',
      current: 'वर्तमान',
      highest: 'उच्चतम',
      lowest: 'न्यूनतम',
      average: 'औसत',
      marketInsights: 'बाजार अंतर्दृष्टि',
      actionableIntelligence: 'बेहतर बिक्री निर्णयों के लिए उपयोगी जानकारी',
      currentMandiPrice: 'वर्तमान मंडी भाव',
      aiSellingForecast: 'एआई बिक्री पूर्वानुमान',
      nearbyMandiComparison: 'नजदीकी मंडी भाव तुलना',
      topVerifiedBuyers: 'शीर्ष सत्यापित कॉर्पोरेट खरीदार',
      createPriceAlert: 'मूल्य अलर्ट बनाएं',
      targetPrice: 'लक्षित मूल्य (₹/क्विंटल)',
      notifyVia: 'अधिसूचना माध्यम',
      marketDetails: 'बाजार विवरण',
      highDemand: 'उच्च मांग',
      mediumDemand: 'मध्यम मांग',
      lowDemand: 'कम मांग'
    },
    mandiCompare: {
      compareTitle: 'मंडी भाव तुलना',
      liveIntelligence: 'लाइव एपीएमसी जानकारी और शुद्ध प्राप्ति कैलकुलेटर',
      refreshPrices: 'भाव रीफ्रेश करें',
      yourListedLots: 'आपके सूचीबद्ध लॉट',
      bestNetRealization: 'सर्वोत्तम शुद्ध प्राप्ति',
      lowestTransportCost: 'न्यूनतम परिवहन लागत',
      closestMandi: 'निकटतम मंडी',
      bestOverallOption: 'सर्वश्रेष्ठ समग्र विकल्प',
      multiMandiMatrix: 'मल्टी-मंडी प्राप्ति मैट्रिक्स',
      visualAnalysisTitle: 'प्राप्ति और दूरी का दृश्य विश्लेषण',
      marketConditionsWeather: 'बाजार की स्थिति और सड़क पारगमन',
      individualProfiles: 'व्यक्तिगत मंडी प्रोफाइल'
    },
    storage: {
      nearbyWarehousesTab: 'नजदीकी गोदाम और वेयरहाउस',
      sellVsStoreTab: 'अभी बेचें बनाम भंडारित करें',
      myStorageBookingsTab: 'मेरा भंडारण और ई-एनडब्ल्यूआर ऋण'
    },
    ai: {
      forecastEngineTitle: 'एआई बाजार मूल्य पूर्वानुमान इंजन',
      selectCrop: 'फसल चुनें',
      selectMandi: 'मंडी चुनें',
      forecastHorizon: 'पूर्वानुमान अवधि',
      sevenDays: '7 दिन',
      fourteenDays: '14 दिन',
      thirtyDays: '30 दिन',
      generateForecast: 'पूर्वानुमान प्राप्त करें',
      currentPrice: 'वर्तमान भाव',
      expectedPrice: 'अपेक्षित भाव',
      projectedChange: 'अनुमानित बदलाव',
      confidence: 'मॉडल विश्वसनीयता',
      sellNowVsStoreAnalysis: 'अभी बेचें बनाम भंडारित करें एआई विश्लेषण',
      sellNowVsStoreSubtitle: 'मूल्यांकन करें कि क्या भंडारण करने से अधिक शुद्ध लाभ होगा',
      recommendationStoreHold: 'एआई सिफारिश: भंडारित करें',
      optionASellNow: 'विकल्प क — अभी बेचें',
      optionBStore: 'विकल्प ख — भंडारित करें',
      exploreStorageOptions: 'भंडारण विकल्प देखें',
      customCalculator: 'कस्टम सेल बनाम स्टोर कैलकुलेटर'
    }
  },
  mr: {
    crops: {
      rice: 'तांदूळ',
      wheat: 'गहू',
      maize: 'मका',
      soybean: 'सोयाबीन',
      soyabean: 'सोयाबीन',
      pulses: 'कडधान्ये',
      onion: 'कांदा',
      tomato: 'टोमॅटो',
      potato: 'बटाटा',
      chilli: 'मिरची',
      chili: 'मिरची',
      groundnut: 'भुईमूग',
      cotton: 'कापूस',
      sugarcane: 'ऊस',
      mango: 'आंबा',
      banana: 'केळी',
      grapes: 'द्राक्षे',
      turmeric: 'हळद',
      ginger: 'आले',
      garlic: 'लसूण',
      mustard: 'मोहरी',
      bajra: 'बाजरी',
      jowar: 'ज्वारी'
    },
    farmer: {
      analyzingNearbyMarkets: 'तुमच्या स्थानासाठी जवळच्या बाजारांचे विश्लेषण केले जात आहे...',
      loadingMandisMap: 'भारतीय मंडी नकाशा लोड होत आहे...',
      orChooseCity: 'किंवा शहर निवडा',
      storageHubAdvisor: 'साठवणूक केंद्र व सल्लागार',
      marketDetails: 'बाजार तपशील',
      highDemand: 'जास्त मागणी',
      mediumDemand: 'मध्यम मागणी',
      lowDemand: 'कमी मागणी'
    },
    cropLotModal: {
      createLotHeading: 'नवीन शेतमाल लॉट तयार करा',
      cropCategory: 'पीक',
      quantityAvailable: 'प्रमाण (क्विंटल)',
      expectedPricePerUnit: 'अपेक्षित भाव (₹/क्विंटल)',
      gradeSelection: 'गुणवत्ता / प्रत',
      originDistrict: 'शेताचे ठिकाण / मंडी',
      moistureQualityNotes: 'तपशील / आर्द्रता / वाण'
    },
    cropLot: {
      editProduceLot: 'लॉट संपादित करा',
      pauseProduceLot: 'लॉट थांबवा',
      deleteProduceLot: 'लॉट हटवा'
    },
    buyer: {
      negotiateRate: 'भावावर चर्चा करा'
    },
    market: {
      harvestDate: 'कापणीची तारीख',
      whatFarmersAreSelling: 'शेतकरी काय विकत आहेत',
      whatFarmersAreSellingSub: 'आज खरेदीदारांची जास्त मागणी असलेली लोकप्रिय पिके',
      viewMyListings: 'माझी यादी पहा',
      compareMandiPrices: 'मंडी बाजारभावाची तुलना करा',
      compareMandiPricesSub: 'वेगवेगळ्या मंड्यांमधील भाव पाहण्यासाठी पीक निवडा',
      selectedCrop: 'निवडलेले पीक',
      stateRegion: 'राज्य / विभाग',
      marketMandi: 'बाजार समिती / मंडी',
      historicalModalPrice: 'ऐतिहासिक सरासरी बाजारभाव कल',
      current: 'सध्याचा',
      highest: 'उच्चांकी',
      lowest: 'किमान',
      average: 'सरासरी',
      marketInsights: 'बाजार अंदाज',
      actionableIntelligence: 'चांगल्या विक्री निर्णयासाठी उपयुक्त माहिती',
      currentMandiPrice: 'सध्याचा बाजारभाव',
      aiSellingForecast: 'एआय विक्री अंदाज',
      nearbyMandiComparison: 'जवळच्या मंड्यांमधील बाजारभाव तुलना',
      topVerifiedBuyers: 'अव्वल प्रमाणित कॉर्पोरेट खरेदीदार',
      createPriceAlert: 'बाजारभाव अलर्ट तयार करा',
      targetPrice: 'लक्ष्य भाव (₹/क्विंटल)',
      notifyVia: 'सूचना माध्यम',
      marketDetails: 'बाजार तपशील',
      highDemand: 'जास्त मागणी',
      mediumDemand: 'मध्यम मागणी',
      lowDemand: 'कमी मागणी'
    },
    mandiCompare: {
      compareTitle: 'मंडी बाजारभाव तुलना',
      liveIntelligence: 'थेट एपीएमसी माहिती आणि निव्वळ परतावा कॅल्क्युलेटर',
      refreshPrices: 'बाजारभाव ताजे करा',
      yourListedLots: 'तुमचे नोंदवलेले लॉट',
      bestNetRealization: 'सर्वोत्तम निव्वळ परतावा',
      lowestTransportCost: 'किमान वाहतूक खर्च',
      closestMandi: 'सर्वात जवळची मंडी',
      bestOverallOption: 'एकूण सर्वोत्तम पर्याय',
      multiMandiMatrix: 'विविध मंडी परतावा तक्ता',
      visualAnalysisTitle: 'परतावा व अंतर दृश्य विश्लेषण',
      marketConditionsWeather: 'बाजार परिस्थिती व रस्ते वाहतूक',
      individualProfiles: 'प्रत्येक मंडीची माहिती'
    },
    storage: {
      nearbyWarehousesTab: 'जवळची गोदामे व वेअरहाऊस',
      sellVsStoreTab: 'आत्ता विका की साठवून ठेवा',
      myStorageBookingsTab: 'माझी साठवणूक व ई-एनडब्ल्यूआर कर्ज'
    },
    ai: {
      forecastEngineTitle: 'एआय बाजारभाव अंदाज प्रणाली',
      selectCrop: 'पीक निवडा',
      selectMandi: 'मंडी निवडा',
      forecastHorizon: 'अंदाज कालावधी',
      sevenDays: '7 दिवस',
      fourteenDays: '14 दिवस',
      thirtyDays: '30 दिवस',
      generateForecast: 'अंदाज मिळवा',
      currentPrice: 'सध्याचा भाव',
      expectedPrice: 'अपेक्षित भाव',
      projectedChange: 'अपेक्षित बदल',
      confidence: 'मॉडेल अचूकता',
      sellNowVsStoreAnalysis: 'आत्ता विका की साठवून ठेवा एआय विश्लेषण',
      sellNowVsStoreSubtitle: 'साठवून ठेवल्याने जास्त निव्वळ नफा मिळतो का ते तपासा',
      recommendationStoreHold: 'एआय सल्ला: साठवून ठेवा',
      optionASellNow: 'पर्याय अ — आत्ता विका',
      optionBStore: 'पर्याय ब — साठवून ठेवा',
      exploreStorageOptions: 'साठवणुकीचे पर्याय पहा',
      customCalculator: 'कस्टम सेल वि. स्टोअर कॅल्क्युलेटर'
    }
  }
};

['en', 'hi', 'mr'].forEach(lang => {
  const langObj = T[lang] || {};
  const addObj = additions[lang];
  Object.keys(addObj).forEach(ns => {
    langObj[ns] = langObj[ns] || {};
    Object.assign(langObj[ns], addObj[ns]);
  });
  T[lang] = langObj;
});

const output = `/**
 * KRISHISHETRA — Farmer Multilingual Translations
 * Lightweight translation bundle for farmer-facing pages only.
 * Languages: English (en), Hindi (hi), Marathi (mr)
 */
(function (window) {
  'use strict';

  window.KrishiTranslations = ${JSON.stringify(T, null, 2)};

})(window);
`;

fs.writeFileSync('js/translations.js', output, 'utf8');
console.log('Successfully enriched js/translations.js with all farmer keys & crops in EN, HI, MR!');
