/**
 * KRISHISHETRA — BASELINE PRICE PREDICTION MODEL
 * 
 * Provides a reliable, non-fabricated baseline forecast using
 * the 7-day moving average of recent modal prices.
 * 
 * Used as:
 * 1. The fallback whenever ML model is unavailable or training data is insufficient
 * 2. The benchmark against which ML model performance is evaluated
 */

'use strict';

/**
 * Calculate baseline expected price from historical records.
 * 
 * @param {Array} priceRecords - Recent historical price records
 * @param {number} days - Number of recent days to average (default 7)
 * @returns {{ predictedPrice: number, predictionMin: number|null, predictionMax: number|null, dataSource: string, dataSourceLabel: string, daysUsed: number }}
 */
function predictBaseline(priceRecords, days = 7) {
  if (!priceRecords || priceRecords.length === 0) {
    return {
      predictedPrice: 0,
      predictionMin: null,
      predictionMax: null,
      dataSource: 'none',
      dataSourceLabel: 'No price data available',
      daysUsed: 0
    };
  }

  // Sort ascending by date
  const sorted = [...priceRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
  const recentSlice = sorted.slice(-days);

  const sum = recentSlice.reduce((acc, r) => acc + r.modalPrice, 0);
  const avg = Math.round(sum / recentSlice.length);

  // Min and Max observed in the recent window for range estimation
  const minObserved = Math.min(...recentSlice.map(r => r.minPrice || r.modalPrice));
  const maxObserved = Math.max(...recentSlice.map(r => r.maxPrice || r.modalPrice));

  return {
    predictedPrice: avg,
    predictionMin: minObserved,
    predictionMax: maxObserved,
    dataSource: 'baseline_7d_avg',
    dataSourceLabel: `Recent ${recentSlice.length}-Day Average (Baseline Estimate)`,
    daysUsed: recentSlice.length
  };
}

module.exports = {
  predictBaseline
};
