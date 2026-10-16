/**
 * KRISHISHETRA — DETERMINISTIC PROFIT CALCULATOR
 * 
 * Calculates gross revenue, all expenses, total cost, net profit,
 * profit per quintal, and break-even price.
 * 
 * ALL calculations are deterministic and reproducible.
 * Every calculation returns a full breakdown with human-readable formulas.
 * 
 * The ML model predicts price. This engine calculates everything else.
 */

'use strict';

const { calculateExpense, isPriceDependentExpense, formatINR } = require('./expense.calculator');
const { calculateDistance } = require('./distance.service');
const { calculateTransport } = require('./transport.calculator');

/**
 * Calculate complete profit analysis for a single mandi.
 * 
 * @param {object} params
 * @param {number} params.expectedPrice - Expected selling price ₹/quintal
 * @param {number} params.quantity - Quantity in quintals
 * @param {object} params.farmLocation - { latitude, longitude }
 * @param {object} params.mandiLocation - { latitude, longitude }
 * @param {object} params.expenseConfig - Mandi's expense configuration
 * @param {object} [params.farmerOverrides] - Farmer-entered expense overrides
 * @param {string} [params.vehicleType] - Vehicle type
 * @param {number} [params.vehicleCapacity] - Vehicle capacity override
 * @returns {object} Full profit breakdown
 */
function calculateMandiProfit(params) {
  const {
    expectedPrice,
    quantity,
    farmLocation,
    mandiLocation,
    expenseConfig = {},
    farmerOverrides = {},
    vehicleType = 'truck',
    vehicleCapacity
  } = params;

  // 1. Gross Revenue
  const grossRevenue = expectedPrice * quantity;
  const grossRevenueBreakdown = {
    formula: `${quantity} qtl × ${formatINR(expectedPrice)}/qtl`,
    value: Math.round(grossRevenue * 100) / 100
  };

  // 2. Distance
  const distanceResult = calculateDistance(
    farmLocation.latitude, farmLocation.longitude,
    mandiLocation.latitude, mandiLocation.longitude
  );

  // 3. Transport
  const transportResult = calculateTransport({
    quantity,
    distance: distanceResult.distanceKm,
    vehicleType,
    vehicleCapacity,
    transportRate: farmerOverrides.transportRate,
    defaultRate: expenseConfig.transportRate != null ? expenseConfig.transportRate : 60,
    defaultRateType: expenseConfig.transportRateType || 'per_km_per_trip'
  });

  // Build calculation context
  const context = {
    quantity,
    distance: distanceResult.distanceKm,
    trips: transportResult.trips,
    grossRevenue,
    workers: expenseConfig.defaultLabourWorkers || 4,
    days: expenseConfig.defaultLabourDays || 1
  };

  // 4. Labour
  let labour;
  if (farmerOverrides.labourCost != null) {
    labour = { value: farmerOverrides.labourCost, formula: `${formatINR(farmerOverrides.labourCost)} (farmer-entered)`, type: 'fixed' };
  } else {
    labour = calculateExpense(
      expenseConfig.labourRateType || 'fixed',
      expenseConfig.labourRate != null ? expenseConfig.labourRate : 4000,
      context,
      'default'
    );
  }

  // 5. Loading
  let loading;
  if (farmerOverrides.loadingCost != null) {
    loading = { value: farmerOverrides.loadingCost, formula: `${formatINR(farmerOverrides.loadingCost)} (farmer-entered)`, type: 'fixed' };
  } else {
    loading = calculateExpense(
      expenseConfig.loadingRateType || 'per_quintal',
      expenseConfig.loadingRate != null ? expenseConfig.loadingRate : 20,
      context,
      'default'
    );
  }

  // 6. Unloading
  let unloading;
  if (farmerOverrides.unloadingCost != null) {
    unloading = { value: farmerOverrides.unloadingCost, formula: `${formatINR(farmerOverrides.unloadingCost)} (farmer-entered)`, type: 'fixed' };
  } else {
    unloading = calculateExpense(
      expenseConfig.unloadingRateType || 'per_quintal',
      expenseConfig.unloadingRate != null ? expenseConfig.unloadingRate : 15,
      context,
      'default'
    );
  }

  // 7. Commission
  const commissionType = expenseConfig.commissionType || 'percentage';
  const commissionRate = expenseConfig.commissionRate != null ? expenseConfig.commissionRate : 0.02;
  const commission = calculateExpense(commissionType, commissionRate, context);

  // 8. Mandi charge (always fixed)
  const mandiCharge = calculateExpense('fixed', expenseConfig.fixedMandiCharge || 0, context);

  // 9. Packaging
  const packaging = {
    value: farmerOverrides.packagingCost || 0,
    formula: `${formatINR(farmerOverrides.packagingCost || 0)}${farmerOverrides.packagingCost ? ' (farmer-entered)' : ''}`,
    type: 'fixed'
  };

  // 10. Other expenses
  const otherExpenses = {
    value: farmerOverrides.otherExpenses || 0,
    formula: `${formatINR(farmerOverrides.otherExpenses || 0)}${farmerOverrides.otherExpenses ? ' (farmer-entered)' : ''}`,
    type: 'fixed'
  };

  // 11. Total Cost
  const totalCost = Math.round((
    transportResult.cost.value +
    labour.value +
    loading.value +
    unloading.value +
    commission.value +
    mandiCharge.value +
    packaging.value +
    otherExpenses.value
  ) * 100) / 100;

  // 12. Net Profit
  const netProfit = Math.round((grossRevenue - totalCost) * 100) / 100;

  // 13. Profit Per Quintal
  const profitPerQuintal = quantity > 0 ? Math.round((netProfit / quantity) * 100) / 100 : 0;

  return {
    grossRevenue: grossRevenueBreakdown,
    distance: distanceResult,
    transport: {
      trips: transportResult.trips,
      vehicleType: transportResult.vehicleType,
      vehicleCapacity: transportResult.vehicleCapacity,
      vehicleLabel: transportResult.vehicleLabel,
      cost: transportResult.cost
    },
    breakdown: {
      grossRevenue: grossRevenueBreakdown,
      transport: transportResult.cost,
      labour,
      loading,
      unloading,
      commission,
      mandiCharge,
      packaging,
      otherExpenses
    },
    totalCost,
    netProfit,
    profitPerQuintal
  };
}

/**
 * Calculate nearby buyer profit (minimal costs — no transport, no mandi charges, no commission).
 * 
 * @param {object} params
 * @param {number} params.buyerPrice - Buyer's offered price ₹/quintal
 * @param {number} params.quantity - Quantity in quintals
 * @param {object} [params.farmerOverrides] - Farmer-entered overrides
 * @returns {object} Nearby buyer profit breakdown
 */
function calculateNearbyBuyerProfit(params) {
  const { buyerPrice, quantity, farmerOverrides = {} } = params;

  const grossRevenue = buyerPrice * quantity;
  const grossRevenueBreakdown = {
    formula: `${quantity} qtl × ${formatINR(buyerPrice)}/qtl`,
    value: Math.round(grossRevenue * 100) / 100
  };

  // Nearby buyer: only loading cost (buyer comes to pick up or farmer loads at farmgate)
  const loadingCost = farmerOverrides.loadingCost != null
    ? farmerOverrides.loadingCost
    : 20 * quantity; // default ₹20/qtl

  const loading = {
    value: loadingCost,
    formula: farmerOverrides.loadingCost != null
      ? `${formatINR(loadingCost)} (farmer-entered)`
      : `${formatINR(20)}/qtl × ${quantity} qtl (default)`,
    type: farmerOverrides.loadingCost != null ? 'fixed' : 'per_quintal'
  };

  const totalCost = loading.value;
  const netProfit = Math.round((grossRevenue - totalCost) * 100) / 100;
  const profitPerQuintal = quantity > 0 ? Math.round((netProfit / quantity) * 100) / 100 : 0;

  return {
    grossRevenue: grossRevenueBreakdown,
    breakdown: {
      grossRevenue: grossRevenueBreakdown,
      transport: { value: 0, formula: '₹0 (buyer picks up / no transport)', type: 'fixed' },
      labour: { value: 0, formula: '₹0 (no labour needed)', type: 'fixed' },
      loading,
      unloading: { value: 0, formula: '₹0 (no unloading at mandi)', type: 'fixed' },
      commission: { value: 0, formula: '₹0 (no commission)', type: 'fixed' },
      mandiCharge: { value: 0, formula: '₹0 (no mandi charge)', type: 'fixed' },
      packaging: { value: farmerOverrides.packagingCost || 0, formula: `${formatINR(farmerOverrides.packagingCost || 0)}`, type: 'fixed' },
      otherExpenses: { value: 0, formula: '₹0', type: 'fixed' }
    },
    totalCost,
    netProfit,
    profitPerQuintal
  };
}

/**
 * Calculate break-even selling price at a mandi vs comparison option.
 * 
 * Handles both percentage-based and fixed commission correctly.
 * 
 * For percentage commission:
 *   breakEvenPrice = (comparisonProfit + fixedCosts) / (quantity × (1 - commissionRate))
 * 
 * For fixed/per-quintal commission:
 *   breakEvenPrice = (comparisonProfit + totalNonPriceCosts) / quantity
 * 
 * @param {object} params
 * @param {number} params.comparisonProfit - Net profit of comparison option
 * @param {object} params.breakdown - Cost breakdown of the mandi
 * @param {number} params.quantity - Quantity in quintals
 * @param {string} params.commissionType - 'percentage', 'fixed', or 'per_quintal'
 * @param {number} params.commissionRate - Commission rate
 * @returns {{ breakEvenPrice: number, formula: string }}
 */
function calculateBreakEven(params) {
  const {
    comparisonProfit,
    breakdown,
    quantity,
    commissionType = 'percentage',
    commissionRate = 0.02
  } = params;

  if (quantity <= 0) {
    return { breakEvenPrice: 0, formula: 'Cannot calculate (quantity is 0)' };
  }

  // Sum all non-revenue-dependent costs (fixed costs)
  const fixedCosts =
    breakdown.transport.value +
    breakdown.labour.value +
    breakdown.loading.value +
    breakdown.unloading.value +
    breakdown.mandiCharge.value +
    breakdown.packaging.value +
    breakdown.otherExpenses.value;

  let breakEvenPrice;
  let formula;

  if (commissionType === 'percentage' && commissionRate > 0 && commissionRate < 1) {
    // Commission depends on revenue, so we solve algebraically
    // breakEvenPrice × quantity × (1 - commissionRate) - fixedCosts = comparisonProfit
    // breakEvenPrice = (comparisonProfit + fixedCosts) / (quantity × (1 - commissionRate))
    const denominator = quantity * (1 - commissionRate);
    breakEvenPrice = (comparisonProfit + fixedCosts) / denominator;
    formula = `(${formatINR(comparisonProfit)} + ${formatINR(fixedCosts)}) / (${quantity} × (1 − ${(commissionRate * 100).toFixed(1)}%))`;
  } else {
    // Commission is fixed — include it in total non-price costs
    const totalNonPriceCosts = fixedCosts + breakdown.commission.value;
    breakEvenPrice = (comparisonProfit + totalNonPriceCosts) / quantity;
    formula = `(${formatINR(comparisonProfit)} + ${formatINR(totalNonPriceCosts)}) / ${quantity}`;
  }

  breakEvenPrice = Math.round(breakEvenPrice * 100) / 100;

  return { breakEvenPrice, formula };
}

module.exports = {
  calculateMandiProfit,
  calculateNearbyBuyerProfit,
  calculateBreakEven
};
