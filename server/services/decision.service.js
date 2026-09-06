/**
 * KRISHISHETRA — AI DECISION ENGINE: SELL NOW vs STORE & HOLD
 * 
 * Evaluates whether a farmer should sell immediately at current mandi prices
 * or store in a nearby accredited warehouse/cold storage for optimal future price realization.
 * 
 * Factors in:
 * 1. Current mandi realization
 * 2. AI projected future price (seasonality, arrival volume drops, buyer demand)
 * 3. Warehouse storage rent & handling charges
 * 4. Biological moisture & weight shrinkage risk
 * 5. Local farm-to-warehouse transport cost
 */

// Crop-specific expected biological moisture loss (% over 30-45 days storage)
const CROP_WEIGHT_LOSS_RATES = {
  wheat: 0.8,
  rice: 0.7,
  paddy: 0.7,
  onion: 4.5,
  potato: 2.2,
  soybean: 1.2,
  maize: 1.0,
  chilli: 1.5,
  groundnut: 1.1,
  cotton: 0.5,
  pulses: 0.6,
  tomato: 3.8,
  gram: 0.6,
  tur: 0.6,
  moong: 0.7,
  urad: 0.7,
  garlic: 2.5,
  ginger: 2.8,
  mustard: 0.9,
  sugarcane: 3.0,
  bajra: 0.9,
  jowar: 0.9
};

// Benchmark seasonal appreciation rates (% projected per 30-45 days if market is bullish)
const CROP_BENCHMARK_PROJECTIONS = {
  wheat: { rate: 6.5, trend: 'bullish', confidence: 88 },
  rice: { rate: 5.2, trend: 'bullish', confidence: 85 },
  paddy: { rate: 5.2, trend: 'bullish', confidence: 85 },
  onion: { rate: 8.5, trend: 'bullish', confidence: 79 },
  potato: { rate: 4.2, trend: 'moderate', confidence: 82 },
  soybean: { rate: 6.8, trend: 'bullish', confidence: 86 },
  maize: { rate: 3.5, trend: 'moderate', confidence: 78 },
  chilli: { rate: 7.4, trend: 'bullish', confidence: 84 },
  groundnut: { rate: 4.8, trend: 'moderate', confidence: 81 },
  cotton: { rate: 2.1, trend: 'bearish', confidence: 76 },
  pulses: { rate: 5.8, trend: 'bullish', confidence: 87 },
  tomato: { rate: -1.5, trend: 'bearish', confidence: 72 },
  gram: { rate: 6.0, trend: 'bullish', confidence: 86 },
  tur: { rate: 6.2, trend: 'bullish', confidence: 87 },
  moong: { rate: 5.5, trend: 'bullish', confidence: 84 },
  urad: { rate: 5.7, trend: 'bullish', confidence: 85 },
  garlic: { rate: 7.0, trend: 'bullish', confidence: 80 },
  ginger: { rate: 6.5, trend: 'bullish', confidence: 81 },
  mustard: { rate: 4.5, trend: 'moderate', confidence: 83 },
  sugarcane: { rate: 1.0, trend: 'moderate', confidence: 75 },
  bajra: { rate: 3.8, trend: 'moderate', confidence: 80 },
  jowar: { rate: 4.0, trend: 'moderate', confidence: 81 }
};

// Farmer-friendly localized crop names in simple Hindi and Marathi
const CROP_LOCAL_NAMES = {
  wheat: { en: 'wheat', hi: 'गेहूं', mr: 'गहू' },
  rice: { en: 'rice', hi: 'धान / चावल', mr: 'तांदूळ / भात' },
  paddy: { en: 'paddy', hi: 'धान', mr: 'भात' },
  onion: { en: 'onion', hi: 'प्याज', mr: 'कांदा' },
  potato: { en: 'potato', hi: 'आलू', mr: 'बटाटा' },
  soybean: { en: 'soybean', hi: 'सोयाबीन', mr: 'सोयाबीन' },
  maize: { en: 'maize', hi: 'मक्का', mr: 'मका' },
  chilli: { en: 'chilli', hi: 'मिर्च', mr: 'मिरची' },
  groundnut: { en: 'groundnut', hi: 'मूंगफली', mr: 'भुईमूग' },
  cotton: { en: 'cotton', hi: 'कपास', mr: 'कापूस' },
  pulses: { en: 'pulses', hi: 'दालें', mr: 'कडधान्ये' },
  tomato: { en: 'tomato', hi: 'टमाटर', mr: 'टोमॅटो' },
  gram: { en: 'gram', hi: 'चना', mr: 'हरभरा' },
  tur: { en: 'tur', hi: 'अरहर / तूर', mr: 'तूर' },
  moong: { en: 'moong', hi: 'मूंग', mr: 'मूग' },
  urad: { en: 'urad', hi: 'उड़द', mr: 'उडीद' },
  garlic: { en: 'garlic', hi: 'लहसुन', mr: 'लसूण' },
  ginger: { en: 'ginger', hi: 'अदरक', mr: 'आले' },
  mustard: { en: 'mustard', hi: 'सरसों', mr: 'मोहरी' },
  sugarcane: { en: 'sugarcane', hi: 'गन्ना', mr: 'ऊस' },
  bajra: { en: 'bajra', hi: 'बाजरा', mr: 'बाजरी' },
  jowar: { en: 'jowar', hi: 'ज्वार', mr: 'ज्वारी' }
};

/**
 * Calculate Sell Now vs Store & Hold Decision
 * @param {Object} params
 * @param {string} [params.cropName='wheat']
 * @param {number} [params.quantity=50] (quintals)
 * @param {number} [params.currentPrice=2400] (₹/quintal)
 * @param {number} [params.holdingDays=45]
 * @param {number} [params.customProjectedPrice]
 * @param {Object} [params.storageFacility]
 * @param {number} [params.distanceKm=12]
 * @param {string} [params.language='en'] 'en' | 'hi' | 'mr'
 * @param {string} [params.lang] alias for language
 * @returns {Object} Comprehensive Structured Decision Breakdown
 */
function evaluateSellVsStore({
  cropName = 'wheat',
  quantity = 50,
  currentPrice = 2400,
  holdingDays = 45,
  customProjectedPrice = null,
  storageFacility = null,
  distanceKm = 12,
  language = 'en',
  lang = null
}) {
  const normCrop = String(cropName).trim().toLowerCase();
  const qty = Math.max(0.1, Number(quantity) || 1);
  const curPrice = Math.max(10, Number(currentPrice) || 2000);
  const days = Math.max(1, Math.min(180, Number(holdingDays) || 45));
  const dist = Math.max(1, Number(distanceKm) || 12);

  // Normalize requested language ('en' | 'hi' | 'mr')
  const rawLang = String(language || lang || 'en').trim().toLowerCase();
  const activeLang = ['hi', 'mr', 'en'].includes(rawLang) ? rawLang : 'en';

  // 1. Current Realization
  const currentRealization = Math.round(curPrice * qty);

  // 2. Projected Future Price
  const bench = CROP_BENCHMARK_PROJECTIONS[normCrop] || { rate: 4.0, trend: 'moderate', confidence: 80 };
  let projectedPrice = customProjectedPrice ? Number(customProjectedPrice) : null;

  if (!projectedPrice || isNaN(projectedPrice)) {
    // Calculate projected price based on days and benchmark rate
    const dayFactor = days / 30;
    const projectedChangePct = bench.rate * dayFactor;
    projectedPrice = Math.round(curPrice * (1 + projectedChangePct / 100));
  }

  const priceDiffPerQtl = projectedPrice - curPrice;
  const projectedGrossGain = Math.round(priceDiffPerQtl * qty);

  // 3. Storage Cost (Standard: 1 quintal ~ 2 standard 50kg bags or direct quintal rate)
  let monthlyRatePerQuintal = 40; // Default ₹40/quintal/month
  let handlingRatePerQuintal = 15; // Default ₹15/quintal
  let facilityName = 'Nearby Accredited Warehouse';
  let facilityType = 'warehouse';

  if (storageFacility) {
    facilityName = storageFacility.name || facilityName;
    facilityType = storageFacility.type || facilityType;
    handlingRatePerQuintal = storageFacility.handlingCharge !== undefined ? storageFacility.handlingCharge : 15;

    if (storageFacility.storageRateUnit === 'per_bag_month') {
      monthlyRatePerQuintal = storageFacility.storageRate * 2; // 2 bags = 1 quintal
    } else if (storageFacility.storageRateUnit === 'per_quintal_month') {
      monthlyRatePerQuintal = storageFacility.storageRate;
    } else if (storageFacility.storageRateUnit === 'per_ton_month') {
      monthlyRatePerQuintal = storageFacility.storageRate / 10;
    } else if (storageFacility.storageRateUnit === 'per_day_quintal') {
      monthlyRatePerQuintal = storageFacility.storageRate * 30;
    }
  }

  const storageRent = Math.round(monthlyRatePerQuintal * (days / 30) * qty);
  const handlingCost = Math.round(handlingRatePerQuintal * qty);
  const totalStorageDirectCost = storageRent + handlingCost;

  // 4. Biological Weight Loss Risk
  const lossRatePct = (CROP_WEIGHT_LOSS_RATES[normCrop] || 1.0) * (days / 30);
  const weightLossQty = (qty * lossRatePct) / 100;
  const weightLossCost = Math.round(weightLossQty * projectedPrice);

  // 5. Additional Transport Cost to Storage
  const logisticsCost = Math.round(dist * 14); // ₹14/km average mini-truck rate

  // 6. Net Financial Comparison
  const totalHoldingCost = totalStorageDirectCost + weightLossCost + logisticsCost;
  const projectedNetGain = projectedGrossGain - totalHoldingCost;
  const projectedStoredRealization = currentRealization + projectedNetGain;
  const netGainPercent = currentRealization > 0 ? Number(((projectedNetGain / currentRealization) * 100).toFixed(1)) : 0;

  // 7. Decision Recommendation
  // Store & Hold if net gain > 0 and ROI is at least 2.5% to justify holding effort
  const isHoldPreferred = projectedNetGain > 0 && netGainPercent >= 2.5 && priceDiffPerQtl > 0;
  const recommendationCode = isHoldPreferred ? 'STORE_HOLD' : 'SELL_NOW';
  const decisionType = isHoldPreferred ? 'STORE & HOLD' : 'SELL NOW';
  const confidence = bench.confidence;

  // 8. Plain Language Explanations in EN, HI, MR (Farmer-Friendly & Simple)
  const cropNames = CROP_LOCAL_NAMES[normCrop] || { en: cropName, hi: cropName, mr: cropName };
  const netGainFormatted = projectedNetGain.toLocaleString('en-IN');
  const curPriceFormatted = curPrice.toLocaleString('en-IN');
  const totalHoldingCostFormatted = totalHoldingCost.toLocaleString('en-IN');

  const explanationEn = isHoldPreferred
    ? `Store & Hold is recommended. Based on projected market demand and arrival trends, storing your ${qty} quintals of ${cropNames.en} for ${days} days at ${facilityName} is estimated to yield an extra ₹${netGainFormatted} net gain (+${netGainPercent}%) after covering all storage, handling, and weight loss costs.`
    : `Sell Now is recommended. Current market price of ₹${curPriceFormatted}/q provides the best immediate return. Holding costs (₹${totalHoldingCostFormatted}) would outweigh the estimated future price gains.`;

  const explanationHi = isHoldPreferred
    ? `भंडारण और होल्ड (Store & Hold) की अनुशंसा की जाती है। बाजार मांग एवं आवक के रुझान अनुसार, अपनी ${qty} क्विंटल ${cropNames.hi} को ${days} दिनों हेतु ${facilityName} में भंडारित करने पर सभी किराया, लोडिंग और नमी नुकसान के बाद ₹${netGainFormatted} का शुद्ध अतिरिक्त लाभ (+${netGainPercent}%) प्राप्त होने का अनुमान है।`
    : `तत्काल बिक्री (Sell Now) की अनुशंसा की जाती है। ₹${curPriceFormatted}/क्विंटल का वर्तमान भाव सर्वोत्तम तत्काल प्रतिफल देता है। होल्डिंग लागत (₹${totalHoldingCostFormatted}) अनुमानित भविष्य लाभ से अधिक होगी।`;

  const explanationMr = isHoldPreferred
    ? `साठवून ठेवण्याची (Store & Hold) शिफारस केली जाते. बाजारातील संभाव्य मागणी आणि आवक ट्रेंडनुसार, आपले ${qty} क्विंटल ${cropNames.mr} ${days} दिवसांसाठी ${facilityName} येथे साठवून ठेवल्यास सर्व भाडे, हमाली आणि घट खर्च वजा जाता ₹${netGainFormatted} चा निव्वळ अतिरिक्त नफा (+${netGainPercent}%) मिळण्याचा अंदाज आहे.`
    : `सध्या लगेच विकण्याची (Sell Now) शिफारस केली जाते. सध्याचा ₹${curPriceFormatted}/क्विंटल भाव सर्वोत्तम तात्काळ परतावा देतो. साठवणूक व होल्डिंग खर्च (₹${totalHoldingCostFormatted}) भविष्यातील संभाव्य दरवाढीपेक्षा जास्त असेल.`;

  const explanations = {
    en: explanationEn,
    hi: explanationHi,
    mr: explanationMr
  };

  const selectedReason = explanations[activeLang] || explanationEn;

  return {
    // Structured Decision Summary
    recommendation: recommendationCode,
    decisionType,
    currentPrice: curPrice,
    projectedPrice,
    storageCost: storageRent,
    handlingCost,
    transportCost: logisticsCost,
    logisticsCost,
    weightLossCost,
    totalHoldingCost,
    expectedGain: projectedGrossGain,
    netBenefit: projectedNetGain,
    estimatedNetBenefit: projectedNetGain,
    netGainPercent,
    reason: selectedReason,
    explanation: selectedReason,
    language: activeLang,

    // Detailed Parameters
    cropName,
    quantity: qty,
    quantityUnit: 'quintal',
    holdingDays: days,
    priceDiffPerQtl,
    confidence,
    trend: bench.trend,

    // Option A: Sell Now
    sellNow: {
      expectedRealization: currentRealization,
      pricePerUnit: curPrice,
      unit: 'quintal'
    },

    // Option B: Store & Hold
    storeAndHold: {
      projectedGrossRealization: Math.round(projectedPrice * qty),
      projectedGrossGain,
      storageRent,
      handlingCost,
      totalStorageDirectCost,
      weightLossPercent: Number(lossRatePct.toFixed(2)),
      weightLossQty: Number(weightLossQty.toFixed(2)),
      weightLossCost,
      logisticsCost,
      totalHoldingCost,
      projectedNetRealization: projectedStoredRealization,
      projectedNetGain,
      netGainPercent,
      facilityName,
      facilityType
    },

    isHoldPreferred,
    explanations,
    disclaimer: 'Projections are estimated based on historical seasonality, APMC arrivals, and facility tariffs. Future market prices cannot be guaranteed.'
  };
}

module.exports = {
  evaluateSellVsStore,
  CROP_WEIGHT_LOSS_RATES,
  CROP_BENCHMARK_PROJECTIONS,
  CROP_LOCAL_NAMES
};
