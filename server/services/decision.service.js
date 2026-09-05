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
  onion: 4.5,
  potato: 2.2,
  soybean: 1.2,
  maize: 1.0,
  chilli: 1.5,
  groundnut: 1.1,
  cotton: 0.5,
  pulses: 0.6,
  tomato: 3.8
};

// Benchmark seasonal appreciation rates (% projected per 30-45 days if market is bullish)
const CROP_BENCHMARK_PROJECTIONS = {
  wheat: { rate: 6.5, trend: 'bullish', confidence: 88 },
  rice: { rate: 5.2, trend: 'bullish', confidence: 85 },
  onion: { rate: 8.5, trend: 'bullish', confidence: 79 },
  potato: { rate: 4.2, trend: 'moderate', confidence: 82 },
  soybean: { rate: 6.8, trend: 'bullish', confidence: 86 },
  maize: { rate: 3.5, trend: 'moderate', confidence: 78 },
  chilli: { rate: 7.4, trend: 'bullish', confidence: 84 },
  groundnut: { rate: 4.8, trend: 'moderate', confidence: 81 },
  cotton: { rate: 2.1, trend: 'bearish', confidence: 76 },
  pulses: { rate: 5.8, trend: 'bullish', confidence: 87 },
  tomato: { rate: -1.5, trend: 'bearish', confidence: 72 }
};

/**
 * Calculate Sell Now vs Store & Hold Decision
 * @param {Object} params
 * @param {string} params.cropName
 * @param {number} params.quantity (quintals)
 * @param {number} params.currentPrice (₹/quintal)
 * @param {number} [params.holdingDays=45]
 * @param {number} [params.customProjectedPrice]
 * @param {Object} [params.storageFacility]
 * @param {number} [params.distanceKm=12]
 * @returns {Object} Comprehensive Decision Breakdown
 */
function evaluateSellVsStore({
  cropName = 'wheat',
  quantity = 50,
  currentPrice = 2400,
  holdingDays = 45,
  customProjectedPrice = null,
  storageFacility = null,
  distanceKm = 12
}) {
  const normCrop = String(cropName).trim().toLowerCase();
  const qty = Math.max(0.1, Number(quantity) || 1);
  const curPrice = Math.max(10, Number(currentPrice) || 2000);
  const days = Math.max(1, Math.min(180, Number(holdingDays) || 45));
  const dist = Math.max(1, Number(distanceKm) || 12);

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
  let isAccredited = true;

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
  const recommendation = isHoldPreferred ? 'STORE & HOLD' : 'SELL NOW';
  const confidence = bench.confidence;

  // 8. Plain Language Explanation
  const explanation = isHoldPreferred
    ? `Store & Hold is recommended. Based on projected market demand and arrival trends, storing your ${qty} quintals of ${cropName} for ${days} days at ${facilityName} is estimated to yield an extra ₹${projectedNetGain.toLocaleString('en-IN')} net gain (+${netGainPercent}%) after covering all storage, handling, and weight loss costs.`
    : `Sell Now is recommended. Current market price of ₹${curPrice.toLocaleString('en-IN')}/q provides the best immediate return. Holding costs (₹${totalHoldingCost.toLocaleString('en-IN')}) would outweigh the estimated future price gains.`;

  return {
    cropName,
    quantity: qty,
    quantityUnit: 'quintal',
    holdingDays: days,
    currentPrice: curPrice,
    projectedPrice,
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

    // Final Output
    recommendation,
    isHoldPreferred,
    explanation,
    explanations: { en: explanation },
    disclaimer: 'Projections are estimated based on historical seasonality, APMC arrivals, and facility tariffs. Future market prices cannot be guaranteed.'
  };
}

module.exports = {
  evaluateSellVsStore,
  CROP_WEIGHT_LOSS_RATES,
  CROP_BENCHMARK_PROJECTIONS
};
