/**
 * KRISHISHETRA — ML TRAINING & EVALUATION PIPELINE
 * 
 * Implements:
 * 1. Time-aware chronological train/val/test split (no future-data leakage)
 * 2. Random Forest Regressor training per crop
 * 3. Benchmark evaluation vs 7-day Baseline Model (MAE, RMSE, R²)
 * 4. Model persistence to JSON in server/ml/models/
 */

'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { RandomForestRegression } = require('ml-random-forest');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const MandiPrice = require('../models/MandiPrice');
const { extractFeatures } = require('./feature_engineering');
const { predictBaseline } = require('./baseline_model');

const MODELS_DIR = path.join(__dirname, 'models');
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

/**
 * Calculate evaluation metrics (MAE, RMSE, R²)
 */
function calculateMetrics(yTrue, yPred) {
  const n = yTrue.length;
  if (n === 0) return { mae: 0, rmse: 0, r2: 0 };

  let sumAbsErr = 0;
  let sumSqErr = 0;
  const meanTrue = yTrue.reduce((sum, val) => sum + val, 0) / n;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    const err = yTrue[i] - yPred[i];
    sumAbsErr += Math.abs(err);
    sumSqErr += err * err;
    ssTot += (yTrue[i] - meanTrue) ** 2;
  }

  const mae = Math.round((sumAbsErr / n) * 100) / 100;
  const rmse = Math.round(Math.sqrt(sumSqErr / n) * 100) / 100;
  const r2 = ssTot !== 0 ? Math.round((1 - (sumSqErr / ssTot)) * 1000) / 1000 : 0;

  return { mae, rmse, r2 };
}

/**
 * Train and evaluate Random Forest model for a specific crop across all mandis
 */
async function trainModelForCrop(cropName) {
  console.log(`\n========================================`);
  console.log(`🌾 Training ML Model for Crop: ${cropName.toUpperCase()}`);
  console.log(`========================================`);

  // Fetch all historical records for this crop, ordered chronologically
  const records = await MandiPrice.find({ crop: cropName.toLowerCase() })
    .sort({ date: 1 })
    .lean();

  if (!records || records.length < 20) {
    console.log(`[ML] Insufficient records (${records ? records.length : 0}) for crop "${cropName}". Minimum 20 required.`);
    return null;
  }

  console.log(`[ML] Loaded ${records.length} historical records for ${cropName}.`);

  // Extract features
  const { X, y, metadata, featureNames } = extractFeatures(records, 1);

  if (X.length < 15) {
    console.log(`[ML] Insufficient feature vectors (${X.length}). Skipping training.`);
    return null;
  }

  // Time-aware chronological split (70% train, 15% validation, 15% test)
  const trainSize = Math.floor(X.length * 0.70);
  const valSize = Math.floor(X.length * 0.15);

  const X_train = X.slice(0, trainSize);
  const y_train = y.slice(0, trainSize);

  const X_val = X.slice(trainSize, trainSize + valSize);
  const y_val = y.slice(trainSize, trainSize + valSize);

  const X_test = X.slice(trainSize + valSize);
  const y_test = y.slice(trainSize + valSize);
  const meta_test = metadata.slice(trainSize + valSize);

  console.log(`[ML] Chronological Split:`);
  console.log(`     Train Set: ${X_train.length} samples (Oldest)`);
  console.log(`     Validation Set: ${X_val.length} samples`);
  console.log(`     Test Set: ${X_test.length} samples (Latest)`);

  // 1. Train Random Forest Regressor
  const rfOptions = {
    seed: 42,
    maxFeatures: 0.8,
    nEstimators: 30,
    treeOptions: {
      maxDepth: 10,
      minNumSamples: 2
    }
  };

  const rf = new RandomForestRegression(rfOptions);
  rf.train(X_train, y_train);

  // Predict on test set
  const y_pred_rf = rf.predict(X_test);

  // 2. Baseline Model on test set (7-day moving average of previous points)
  const y_pred_baseline = meta_test.map(m => m.currentPrice);

  // Calculate metrics
  const rfMetrics = calculateMetrics(y_test, y_pred_rf);
  const baselineMetrics = calculateMetrics(y_test, y_pred_baseline);

  console.log(`\n📊 Performance Comparison on Held-Out Test Set:`);
  console.log(`-----------------------------------------------------`);
  console.log(`Model               | MAE (₹/qtl) | RMSE (₹/qtl) | R² Score`);
  console.log(`-----------------------------------------------------`);
  console.log(`Baseline (Recent)   | ₹${baselineMetrics.mae.toString().padEnd(10)} | ₹${baselineMetrics.rmse.toString().padEnd(11)} | ${baselineMetrics.r2}`);
  console.log(`Random Forest Reg.  | ₹${rfMetrics.mae.toString().padEnd(10)} | ₹${rfMetrics.rmse.toString().padEnd(11)} | ${rfMetrics.r2}`);
  console.log(`-----------------------------------------------------`);

  // Model metadata
  const modelMetadata = {
    crop: cropName.toLowerCase(),
    version: 'rf-v1.0',
    trainedAt: new Date().toISOString(),
    featureNames,
    trainSampleCount: X_train.length,
    testSampleCount: X_test.length,
    metrics: {
      randomForest: rfMetrics,
      baseline: baselineMetrics
    },
    rfOptions,
    isSampleTrained: records.some(r => r.isDemo)
  };

  // Export model to JSON
  const modelFilePath = path.join(MODELS_DIR, `rf_${cropName.toLowerCase()}_v1.0.json`);
  const serialized = {
    metadata: modelMetadata,
    model: rf.toJSON()
  };

  fs.writeFileSync(modelFilePath, JSON.stringify(serialized, null, 2));
  console.log(`✅ Model saved to: ${modelFilePath}`);

  return modelMetadata;
}

/**
 * Train models for all distinct crops in the database
 */
async function trainAllModels() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB for ML training');
    }

    const crops = await MandiPrice.distinct('crop');
    console.log(`Found crops in database: ${crops.join(', ')}`);

    const summary = [];
    for (const crop of crops) {
      const res = await trainModelForCrop(crop);
      if (res) summary.push(res);
    }

    console.log(`\n🎉 Training complete! ${summary.length} models generated.`);
    return summary;
  } catch (err) {
    console.error('Error during ML training:', err);
    throw err;
  }
}

// Run directly from command line
if (require.main === module) {
  trainAllModels().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}

module.exports = {
  trainAllModels,
  trainModelForCrop,
  calculateMetrics
};
