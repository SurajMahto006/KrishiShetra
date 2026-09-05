/**
 * KRISHISHETRA — CONFIGURABLE EXPENSE CALCULATOR
 * 
 * Handles all expense types: fixed, per_quintal, per_trip, per_km,
 * per_km_per_trip, percentage (of revenue), per_worker_day.
 * 
 * Every calculation returns both the numeric value and a human-readable
 * formula string for explainable output.
 */

'use strict';

/**
 * Format a number as Indian currency string (e.g. 3,14,460)
 */
function formatINR(num) {
  if (num === 0) return '₹0';
  const isNeg = num < 0;
  const abs = Math.abs(Math.round(num * 100) / 100);
  const parts = abs.toString().split('.');
  let intPart = parts[0];
  const decPart = parts[1] ? '.' + parts[1] : '';

  // Indian grouping: last 3 digits, then groups of 2
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const groups = [];
    for (let i = remaining.length; i > 0; i -= 2) {
      groups.unshift(remaining.slice(Math.max(0, i - 2), i));
    }
    intPart = groups.join(',') + ',' + last3;
  }

  return (isNeg ? '-₹' : '₹') + intPart + decPart;
}

/**
 * Calculate a single expense based on its type and rate.
 * 
 * @param {string} type - One of: 'fixed', 'per_quintal', 'per_trip', 'per_km',
 *                        'per_km_per_trip', 'percentage', 'per_worker_day'
 * @param {number} rate - The rate value
 * @param {object} context - Calculation context
 * @param {number} context.quantity - Quantity in quintals
 * @param {number} context.distance - Distance in km
 * @param {number} context.trips - Number of trips
 * @param {number} context.grossRevenue - Gross revenue in ₹
 * @param {number} context.workers - Number of workers
 * @param {number} context.days - Number of labour days
 * @param {string} [label] - Human-readable label for the expense
 * @returns {{ value: number, formula: string, type: string }}
 */
function calculateExpense(type, rate, context, label) {
  const ctx = {
    quantity: context.quantity || 0,
    distance: context.distance || 0,
    trips: context.trips || 1,
    grossRevenue: context.grossRevenue || 0,
    workers: context.workers || 4,
    days: context.days || 1
  };

  let value = 0;
  let formula = '';

  switch (type) {
    case 'fixed':
      value = rate;
      formula = `${formatINR(rate)} (fixed)`;
      break;

    case 'per_quintal':
      value = rate * ctx.quantity;
      formula = `${formatINR(rate)}/qtl × ${ctx.quantity} qtl`;
      break;

    case 'per_trip':
      value = rate * ctx.trips;
      formula = `${formatINR(rate)}/trip × ${ctx.trips} trips`;
      break;

    case 'per_km':
      value = rate * ctx.distance;
      formula = `${formatINR(rate)}/km × ${Math.round(ctx.distance)} km`;
      break;

    case 'per_km_per_trip':
      value = rate * ctx.distance * ctx.trips;
      formula = `${Math.round(ctx.distance)} km × ${formatINR(rate)}/km × ${ctx.trips} trip${ctx.trips > 1 ? 's' : ''}`;
      break;

    case 'percentage':
      value = ctx.grossRevenue * rate;
      formula = `${formatINR(ctx.grossRevenue)} × ${(rate * 100).toFixed(1)}%`;
      break;

    case 'per_worker_day':
      value = rate * ctx.workers * ctx.days;
      formula = `${formatINR(rate)} × ${ctx.workers} workers × ${ctx.days} day${ctx.days > 1 ? 's' : ''}`;
      break;

    default:
      // Treat unknown types as fixed
      value = rate;
      formula = `${formatINR(rate)} (fixed)`;
      break;
  }

  // Round to 2 decimal places
  value = Math.round(value * 100) / 100;

  if (label) {
    formula = `${formula} (${label})`;
  }

  return { value, formula, type };
}

/**
 * Determine if an expense type depends on gross revenue (price-dependent).
 * Used for break-even calculation separation.
 */
function isPriceDependentExpense(type) {
  return type === 'percentage';
}

module.exports = {
  calculateExpense,
  isPriceDependentExpense,
  formatINR
};
