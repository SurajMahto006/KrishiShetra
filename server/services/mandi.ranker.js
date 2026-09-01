/**
 * KRISHISHETRA — MANDI RANKER & RECOMMENDATION ENGINE
 * 
 * Analyzes every mandi, calculates net profit for each,
 * compares against nearby buyer, ranks by MAX(Expected Net Profit),
 * and produces GO TO MANDI or STAY WITH NEARBY BUYER decision.
 * 
 * ML predicts price. Formula engine calculates costs. This module ranks and decides.
 */

'use strict';

const { calculateMandiProfit, calculateNearbyBuyerProfit, calculateBreakEven } = require('./profit.calculator');
const { formatINR } = require('./expense.calculator');

/**
 * Analyze all mandis and produce a ranked recommendation.
 * 
 * @param {object} params
 * @param {Array} params.mandis - Array of mandi objects with expenseConfig, lat/lng
 * @param {object} params.prices - Map of mandiId → { predictedPrice, predictionMin, predictionMax, dataSource, dataSourceLabel }
 * @param {number} params.quantity - Quantity in quintals
 * @param {object} params.farmLocation - { latitude, longitude }
 * @param {number|null} params.nearbyBuyerPrice - Nearby buyer price ₹/qtl (null if not provided)
 * @param {object} params.farmerOverrides - Farmer-entered expense overrides
 * @param {string} params.vehicleType - Vehicle type
 * @param {number|null} params.vehicleCapacity - Vehicle capacity override
 * @returns {object} Full analysis result
 */
function analyzeAllMandis(params) {
  const {
    mandis,
    prices,
    quantity,
    farmLocation,
    nearbyBuyerPrice,
    farmerOverrides = {},
    vehicleType = 'truck',
    vehicleCapacity
  } = params;

  const results = [];
  let hasDemo = false;

  // 1. Analyze each mandi
  for (const mandi of mandis) {
    const mandiId = mandi._id ? mandi._id.toString() : mandi.id;
    const priceData = prices[mandiId];

    // Skip mandis without price data
    if (!priceData || !priceData.predictedPrice || priceData.predictedPrice <= 0) {
      continue;
    }

    if (mandi.isDemo) hasDemo = true;

    const profitResult = calculateMandiProfit({
      expectedPrice: priceData.predictedPrice,
      quantity,
      farmLocation,
      mandiLocation: { latitude: mandi.latitude, longitude: mandi.longitude },
      expenseConfig: mandi.expenseConfig || {},
      farmerOverrides,
      vehicleType,
      vehicleCapacity
    });

    // Scenario analysis (worst/expected/best) if prediction range available
    let scenarioAnalysis = null;
    if (priceData.predictionMin && priceData.predictionMax) {
      const worstCase = calculateMandiProfit({
        expectedPrice: priceData.predictionMin,
        quantity,
        farmLocation,
        mandiLocation: { latitude: mandi.latitude, longitude: mandi.longitude },
        expenseConfig: mandi.expenseConfig || {},
        farmerOverrides,
        vehicleType,
        vehicleCapacity
      });

      const bestCase = calculateMandiProfit({
        expectedPrice: priceData.predictionMax,
        quantity,
        farmLocation,
        mandiLocation: { latitude: mandi.latitude, longitude: mandi.longitude },
        expenseConfig: mandi.expenseConfig || {},
        farmerOverrides,
        vehicleType,
        vehicleCapacity
      });

      scenarioAnalysis = {
        worstCase: { price: priceData.predictionMin, netProfit: worstCase.netProfit, profitPerQuintal: worstCase.profitPerQuintal },
        expectedCase: { price: priceData.predictedPrice, netProfit: profitResult.netProfit, profitPerQuintal: profitResult.profitPerQuintal },
        bestCase: { price: priceData.predictionMax, netProfit: bestCase.netProfit, profitPerQuintal: bestCase.profitPerQuintal }
      };
    }

    results.push({
      mandiId,
      name: mandi.name,
      district: mandi.district,
      state: mandi.state,
      isNearbyBuyer: false,
      expectedPrice: priceData.predictedPrice,
      priceSource: priceData.dataSource,
      priceSourceLabel: priceData.dataSourceLabel,
      predictionRange: (priceData.predictionMin && priceData.predictionMax)
        ? { min: priceData.predictionMin, max: priceData.predictionMax }
        : null,
      distance: profitResult.distance,
      trips: profitResult.transport.trips,
      vehicleType: profitResult.transport.vehicleType,
      vehicleCapacity: profitResult.transport.vehicleCapacity,
      vehicleLabel: profitResult.transport.vehicleLabel,
      breakdown: profitResult.breakdown,
      totalCost: profitResult.totalCost,
      netProfit: profitResult.netProfit,
      profitPerQuintal: profitResult.profitPerQuintal,
      scenarioAnalysis,
      isDemo: mandi.isDemo || false
    });
  }

  // 2. Calculate nearby buyer profit (if provided)
  let nearbyBuyerResult = null;
  if (nearbyBuyerPrice != null && nearbyBuyerPrice > 0) {
    const buyerProfit = calculateNearbyBuyerProfit({
      buyerPrice: nearbyBuyerPrice,
      quantity,
      farmerOverrides
    });

    nearbyBuyerResult = {
      mandiId: null,
      name: 'Nearby Buyer',
      district: '',
      state: '',
      isNearbyBuyer: true,
      expectedPrice: nearbyBuyerPrice,
      priceSource: 'farmer_entered',
      priceSourceLabel: 'Farmer-Entered Price',
      predictionRange: null,
      distance: { distanceKm: 0, distanceType: 'none', label: 'At Farm' },
      trips: 0,
      vehicleType: 'none',
      vehicleCapacity: 0,
      vehicleLabel: 'No transport needed',
      breakdown: buyerProfit.breakdown,
      totalCost: buyerProfit.totalCost,
      netProfit: buyerProfit.netProfit,
      profitPerQuintal: buyerProfit.profitPerQuintal,
      scenarioAnalysis: null,
      isDemo: false
    };
  }

  // 3. Sort mandis by net profit DESC
  results.sort((a, b) => b.netProfit - a.netProfit);

  // 4. Determine recommendation: GO TO MANDI or STAY WITH NEARBY BUYER
  const bestMandi = results.length > 0 ? results[0] : null;
  let decision, decisionLabel, recommended, additionalProfit, breakEvenResult;

  if (!bestMandi && !nearbyBuyerResult) {
    return {
      success: false,
      message: 'No mandis with price data available for analysis.'
    };
  }

  if (nearbyBuyerResult && bestMandi) {
    if (nearbyBuyerResult.netProfit >= bestMandi.netProfit) {
      // STAY WITH NEARBY BUYER
      decision = 'STAY_WITH_BUYER';
      decisionLabel = '🏠 STAY WITH NEARBY BUYER — Mandi travel not worth it';
      recommended = nearbyBuyerResult;
      additionalProfit = nearbyBuyerResult.netProfit - bestMandi.netProfit;
    } else {
      // GO TO MANDI
      decision = 'GO_TO_MANDI';
      decisionLabel = `🚛 GO TO MANDI: ${bestMandi.name} — Expected ${formatINR(bestMandi.netProfit - nearbyBuyerResult.netProfit)} MORE profit`;
      recommended = bestMandi;
      additionalProfit = bestMandi.netProfit - nearbyBuyerResult.netProfit;

      // Calculate break-even price for recommended mandi vs nearby buyer
      const commissionType = (bestMandi.breakdown.commission && bestMandi.breakdown.commission.type) || 'percentage';
      // Find the mandi's commission rate from the original mandi object
      const originalMandi = mandis.find(m => (m._id ? m._id.toString() : m.id) === bestMandi.mandiId);
      const commissionRate = originalMandi && originalMandi.expenseConfig
        ? (originalMandi.expenseConfig.commissionRate != null ? originalMandi.expenseConfig.commissionRate : 0.02)
        : 0.02;

      breakEvenResult = calculateBreakEven({
        comparisonProfit: nearbyBuyerResult.netProfit,
        breakdown: bestMandi.breakdown,
        quantity,
        commissionType,
        commissionRate
      });
    }
  } else if (bestMandi) {
    // No nearby buyer provided — recommend best mandi
    decision = 'GO_TO_MANDI';
    decisionLabel = `🚛 RECOMMENDED: ${bestMandi.name}`;
    recommended = bestMandi;
    additionalProfit = null;
  } else {
    // Only nearby buyer
    decision = 'STAY_WITH_BUYER';
    decisionLabel = '🏠 SELL TO NEARBY BUYER';
    recommended = nearbyBuyerResult;
    additionalProfit = null;
  }

  // 5. Rank all options (including nearby buyer)
  const comparison = [...results];
  if (nearbyBuyerResult) {
    comparison.push(nearbyBuyerResult);
    comparison.sort((a, b) => b.netProfit - a.netProfit);
  }

  // Add rank numbers
  comparison.forEach((item, idx) => {
    item.rank = idx + 1;
    item.isRecommended = (recommended === item);
  });

  // 6. Generate structured explanation
  const explanation = generateExplanation({
    decision,
    recommended,
    bestMandi,
    nearbyBuyer: nearbyBuyerResult,
    additionalProfit,
    breakEvenResult,
    quantity
  });

  // 7. Break-even explanation
  let breakEvenExplanation = null;
  if (breakEvenResult && nearbyBuyerResult) {
    breakEvenExplanation = `${bestMandi.name} needs to offer at least ${formatINR(breakEvenResult.breakEvenPrice)}/qtl to be more profitable than the nearby buyer.`;
  }

  return {
    success: true,
    decision,
    decisionLabel,
    recommended,
    nearbyBuyer: nearbyBuyerResult,
    additionalProfit,
    breakEvenPrice: breakEvenResult ? breakEvenResult.breakEvenPrice : null,
    breakEvenFormula: breakEvenResult ? breakEvenResult.formula : null,
    breakEvenExplanation,
    scenarioAnalysis: recommended.scenarioAnalysis || null,
    comparison,
    explanation,
    isDemo: hasDemo,
    dataDisclaimer: hasDemo
      ? 'Price data is sample/demo data for demonstration purposes. Not live market data.'
      : null
  };
}

/**
 * Generate a structured explanation from calculated values only.
 * Every number comes from the calculation engine — never from an LLM.
 */
function generateExplanation(params) {
  const { decision, recommended, bestMandi, nearbyBuyer, additionalProfit, breakEvenResult, quantity } = params;

  if (decision === 'STAY_WITH_BUYER' && nearbyBuyer && bestMandi) {
    return `Selling to the nearby buyer at ${formatINR(nearbyBuyer.expectedPrice)}/qtl is recommended. ` +
      `The nearby buyer yields a net profit of ${formatINR(nearbyBuyer.netProfit)} (${formatINR(nearbyBuyer.profitPerQuintal)}/qtl). ` +
      `The best mandi option (${bestMandi.name}) at ${formatINR(bestMandi.expectedPrice)}/qtl would only yield ${formatINR(bestMandi.netProfit)} after accounting for ` +
      `transport (${formatINR(bestMandi.breakdown.transport.value)}), labour, loading/unloading, and mandi charges totalling ${formatINR(bestMandi.totalCost)}. ` +
      `The additional costs outweigh the price difference, making the nearby buyer ${formatINR(Math.abs(additionalProfit))} more profitable.`;
  }

  if (decision === 'GO_TO_MANDI' && bestMandi && nearbyBuyer) {
    return `${bestMandi.name} is recommended because its expected selling price of ${formatINR(bestMandi.expectedPrice)}/qtl ` +
      `generates a gross revenue of ${formatINR(bestMandi.breakdown.grossRevenue.value)}. ` +
      `Although transportation and handling costs are higher (total expenses: ${formatINR(bestMandi.totalCost)} vs ${formatINR(nearbyBuyer.totalCost)} for the nearby buyer), ` +
      `the additional revenue exceeds these costs, resulting in approximately ${formatINR(additionalProfit)} more expected profit. ` +
      `Net profit: ${formatINR(bestMandi.netProfit)} (${formatINR(bestMandi.profitPerQuintal)}/qtl).` +
      (breakEvenResult ? ` Break-even price: ${formatINR(breakEvenResult.breakEvenPrice)}/qtl.` : '');
  }

  if (decision === 'GO_TO_MANDI' && bestMandi && !nearbyBuyer) {
    return `${bestMandi.name} is recommended with an expected price of ${formatINR(bestMandi.expectedPrice)}/qtl. ` +
      `Expected gross revenue: ${formatINR(bestMandi.breakdown.grossRevenue.value)}. ` +
      `Total expenses: ${formatINR(bestMandi.totalCost)}. ` +
      `Expected net profit: ${formatINR(bestMandi.netProfit)} (${formatINR(bestMandi.profitPerQuintal)}/qtl).`;
  }

  return 'Unable to generate recommendation with available data.';
}

module.exports = {
  analyzeAllMandis
};
