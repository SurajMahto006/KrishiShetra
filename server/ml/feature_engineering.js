/**
 * KRISHISHETRA — ML FEATURE ENGINEERING
 * 
 * Extracts time-series and market features from historical MandiPrice data.
 * Supports time-aware chronological sorting to prevent future-data leakage.
 */

'use strict';

/**
 * Determine agricultural season from date month
 * 1: Kharif (Jun - Oct)
 * 2: Rabi (Nov - Mar)
 * 3: Zaid (Apr - May)
 */
function getSeason(month) {
  if (month >= 6 && month <= 10) return 1; // Kharif
  if (month >= 11 || month <= 3) return 2;  // Rabi
  return 3;                                // Zaid (Apr - May)
}

/**
 * Extract feature vectors and targets from chronological price records.
 * Records must be pre-sorted in ascending chronological order.
 * 
 * @param {Array} priceRecords - Sorted array of MandiPrice documents/objects
 * @param {number} forecastHorizonDays - How many days into future to predict (default 1)
 * @returns {{ X: Array<Array<number>>, y: Array<number>, metadata: Array<object>, featureNames: Array<string> }}
 */
function extractFeatures(priceRecords, forecastHorizonDays = 1) {
  const featureNames = [
    'currentModalPrice',
    'prevDayPrice',
    'avg3d',
    'avg7d',
    'avg30d',
    'arrivalQty',
    'avgArrival7d',
    'month',
    'season',
    'dayOfWeek'
  ];

  if (!priceRecords || priceRecords.length < 8) {
    return { X: [], y: [], metadata: [], featureNames };
  }

  // Ensure records are chronologically sorted (ascending)
  const sorted = [...priceRecords].sort((a, b) => new Date(a.date) - new Date(b.date));

  const X = [];
  const y = [];
  const metadata = [];

  // We need at least 7 days of history prior to the current index
  for (let i = 7; i < sorted.length - forecastHorizonDays; i++) {
    const current = sorted[i];
    const target = sorted[i + forecastHorizonDays];
    const prev = sorted[i - 1];

    const currentDate = new Date(current.date);
    const month = currentDate.getMonth() + 1;
    const dayOfWeek = currentDate.getDay();
    const season = getSeason(month);

    // 3-day average
    const last3 = sorted.slice(i - 2, i + 1);
    const avg3d = last3.reduce((sum, r) => sum + r.modalPrice, 0) / last3.length;

    // 7-day average
    const last7 = sorted.slice(i - 6, i + 1);
    const avg7d = last7.reduce((sum, r) => sum + r.modalPrice, 0) / last7.length;
    const avgArrival7d = last7.reduce((sum, r) => sum + (r.arrivalQuantity || 0), 0) / last7.length;

    // 30-day average (or available slice up to 30)
    const start30 = Math.max(0, i - 29);
    const last30 = sorted.slice(start30, i + 1);
    const avg30d = last30.reduce((sum, r) => sum + r.modalPrice, 0) / last30.length;

    const featureVector = [
      current.modalPrice,
      prev.modalPrice,
      Math.round(avg3d * 100) / 100,
      Math.round(avg7d * 100) / 100,
      Math.round(avg30d * 100) / 100,
      current.arrivalQuantity || 0,
      Math.round(avgArrival7d * 100) / 100,
      month,
      season,
      dayOfWeek
    ];

    X.push(featureVector);
    y.push(target.modalPrice);
    metadata.push({
      mandiId: current.mandi,
      crop: current.crop,
      referenceDate: current.date,
      targetDate: target.date,
      currentPrice: current.modalPrice,
      actualFuturePrice: target.modalPrice
    });
  }

  return { X, y, metadata, featureNames };
}

/**
 * Extract single feature vector from recent price history for inference.
 * 
 * @param {Array} recentRecords - Recent sorted history (at least 7 days)
 * @param {Date} targetDate - Date we want to forecast for
 * @returns {Array<number>|null}
 */
function extractSingleInferenceFeatures(recentRecords, targetDate = new Date()) {
  if (!recentRecords || recentRecords.length < 3) return null;

  const sorted = [...recentRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
  const current = sorted[sorted.length - 1];
  const prev = sorted.length > 1 ? sorted[sorted.length - 2] : current;

  const dateObj = targetDate ? new Date(targetDate) : new Date();
  const month = dateObj.getMonth() + 1;
  const dayOfWeek = dateObj.getDay();
  const season = getSeason(month);

  const last3 = sorted.slice(-3);
  const avg3d = last3.reduce((sum, r) => sum + r.modalPrice, 0) / last3.length;

  const last7 = sorted.slice(-7);
  const avg7d = last7.reduce((sum, r) => sum + r.modalPrice, 0) / last7.length;
  const avgArrival7d = last7.reduce((sum, r) => sum + (r.arrivalQuantity || 0), 0) / last7.length;

  const last30 = sorted.slice(-30);
  const avg30d = last30.reduce((sum, r) => sum + r.modalPrice, 0) / last30.length;

  return [
    current.modalPrice,
    prev.modalPrice,
    Math.round(avg3d * 100) / 100,
    Math.round(avg7d * 100) / 100,
    Math.round(avg30d * 100) / 100,
    current.arrivalQuantity || 0,
    Math.round(avgArrival7d * 100) / 100,
    month,
    season,
    dayOfWeek
  ];
}

module.exports = {
  extractFeatures,
  extractSingleInferenceFeatures,
  getSeason
};
