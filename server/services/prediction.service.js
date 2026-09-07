/**
 * KRISHISHETRA — PREDICTION SERVICE
 * 
 * Orchestrates price forecasting for mandis using a multi-tiered hierarchy:
 * Tier 1: Trained Random Forest Regressor (if model & history available)
 * Tier 2: 7-Day Moving Average Baseline (if recent prices available)
 * Tier 3: Most recent modal price (last known baseline)
 * 
 * Never fabricates numbers. Clearly labels the source of every price forecast.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { RandomForestRegression } = require('ml-random-forest');
const MandiPrice = require('../models/MandiPrice');
const { extractSingleInferenceFeatures } = require('../ml/feature_engineering');
const { predictBaseline } = require('../ml/baseline_model');

const MODELS_DIR = path.join(__dirname, '../ml/models');
const loadedModelsCache = new Map();

/**
 * Load Random Forest model from cache or disk
 */
function getCachedModel(crop) {
  const normalizedCrop = crop.toLowerCase();
  if (loadedModelsCache.has(normalizedCrop)) {
    return loadedModelsCache.get(normalizedCrop);
  }

  const modelPath = path.join(MODELS_DIR, `rf_${normalizedCrop}_v1.0.json`);
  if (!fs.existsSync(modelPath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(modelPath, 'utf8');
    const parsed = JSON.parse(raw);
    const rf = RandomForestRegression.load(parsed.model);

    const modelEntry = {
      model: rf,
      metadata: parsed.metadata
    };

    loadedModelsCache.set(normalizedCrop, modelEntry);
    return modelEntry;
  } catch (err) {
    console.error(`[PredictionService] Error loading model for ${crop}:`, err.message);
    return null;
  }
}

/**
 * Predict expected price for a given mandi and crop on a target date.
 * 
 * @param {string|ObjectId} mandiId - Mandi ObjectId
 * @param {string} crop - Normalized crop name
 * @param {Date|string} targetDate - Expected selling date
 * @returns {Promise<object>} Prediction result with expectedPrice, range, dataSource, and label
 */
async function predictMandiPrice(mandiId, crop, targetDate = new Date()) {
  const normalizedCrop = crop.toLowerCase().trim();

  // Fetch recent history for this mandi & crop (up to 35 latest records)
  const recentHistory = await MandiPrice.find({
    mandi: mandiId,
    crop: normalizedCrop
  })
    .sort({ date: 1 })
    .limit(35)
    .lean();

  if (!recentHistory || recentHistory.length === 0) {
    return {
      predictedPrice: 0,
      predictionMin: null,
      predictionMax: null,
      dataSource: 'none',
      dataSourceLabel: 'No price history available',
      isDemo: false
    };
  }

  const isDemo = recentHistory.some(r => r.isDemo);

  // ── Tier 1: Try ML Model (Random Forest) ──
  const modelEntry = getCachedModel(normalizedCrop);
  if (modelEntry && recentHistory.length >= 7) {
    try {
      const features = extractSingleInferenceFeatures(recentHistory, targetDate);
      if (features) {
        const prediction = modelEntry.model.predict([features])[0];
        const predictedPrice = Math.round(prediction);

        // Estimate prediction range using recent volatility / spread
        const recentModalPrices = recentHistory.slice(-7).map(r => r.modalPrice);
        const stdDev = Math.sqrt(
          recentModalPrices.reduce((sq, n) => sq + (n - predictedPrice) ** 2, 0) / recentModalPrices.length
        );
        const margin = Math.max(50, Math.round(stdDev * 1.2));

        return {
          predictedPrice,
          predictionMin: Math.max(100, predictedPrice - margin),
          predictionMax: predictedPrice + margin,
          dataSource: 'ml_prediction',
          dataSourceLabel: `ML Forecast (Random Forest ${modelEntry.metadata.version || 'v1.0'})`,
          modelVersion: modelEntry.metadata.version || 'rf-v1.0',
          isDemo
        };
      }
    } catch (err) {
      console.warn(`[PredictionService] ML inference failed for ${crop}, falling back to baseline:`, err.message);
    }
  }

  // ── Tier 2: 7-Day Moving Average Baseline ──
  if (recentHistory.length >= 3) {
    const baseline = predictBaseline(recentHistory, 7);
    return {
      predictedPrice: baseline.predictedPrice,
      predictionMin: baseline.predictionMin,
      predictionMax: baseline.predictionMax,
      dataSource: baseline.dataSource,
      dataSourceLabel: baseline.dataSourceLabel,
      modelVersion: 'baseline-7d',
      isDemo
    };
  }

  // ── Tier 3: Last Known Modal Price ──
  const lastRecord = recentHistory[recentHistory.length - 1];
  return {
    predictedPrice: lastRecord.modalPrice,
    predictionMin: lastRecord.minPrice || lastRecord.modalPrice,
    predictionMax: lastRecord.maxPrice || lastRecord.modalPrice,
    dataSource: 'recent_modal',
    dataSourceLabel: 'Last Known Modal Price (Estimate)',
    modelVersion: 'last-modal',
    isDemo
  };
}

/**
 * Predict prices for multiple mandis in batch
 * 
 * @param {Array<string|ObjectId>} mandiIds - List of Mandi IDs
 * @param {string} crop - Crop name
 * @param {Date|string} targetDate - Target date
 * @returns {Promise<Object<string, object>>} Map of mandiId -> price result
 */
async function batchPredictMandiPrices(mandiIds, crop, targetDate = new Date()) {
  const priceMap = {};
  for (const id of mandiIds) {
    const key = id.toString ? id.toString() : id;
    priceMap[key] = await predictMandiPrice(id, crop, targetDate);
  }
  return priceMap;
}

module.exports = {
  predictMandiPrice,
  batchPredictMandiPrices
};
