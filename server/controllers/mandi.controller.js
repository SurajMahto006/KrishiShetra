/**
 * KRISHISHETRA — MANDI PROFITABILITY & RECOMMENDATION CONTROLLER
 * 
 * Handles HTTP requests for:
 * 1. POST /api/mandi/analyze — Analyzes all mandis, calculates deterministic profit,
 *                             evaluates nearby buyer, ranks by MAX(Net Profit)
 * 2. GET  /api/mandi/list — Lists all mandis with coordinates & expense configurations
 * 3. GET  /api/mandi/crops — Lists all available crops
 * 4. GET  /api/mandi/prices/:mandiId — Retrieves recent historical price series
 */

'use strict';

const Mandi = require('../models/Mandi');
const MandiPrice = require('../models/MandiPrice');
const { batchPredictMandiPrices } = require('../services/prediction.service');
const { analyzeAllMandis } = require('../services/mandi.ranker');
const { logActivity } = require('../services/activity.service');

/**
 * @desc    Analyze mandi profitability & produce selling decision
 * @route   POST /api/mandi/analyze
 * @access  Public / Protected (Farmers)
 */
const analyzeProfitability = async (req, res) => {
  try {
    const {
      crop,
      quantity,
      farmLocation,
      sellingDate,
      nearbyBuyerPrice,
      vehicleType,
      vehicleCapacity,
      transportRate,
      labourCost,
      loadingCost,
      unloadingCost,
      packagingCost,
      otherExpenses
    } = req.body;

    // ── Input Validations ──
    if (!crop || typeof crop !== 'string' || !crop.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Valid crop name is required'
      });
    }

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number greater than 0'
      });
    }

    if (
      !farmLocation ||
      farmLocation.latitude == null ||
      farmLocation.longitude == null ||
      isNaN(parseFloat(farmLocation.latitude)) ||
      isNaN(parseFloat(farmLocation.longitude)) ||
      Math.abs(parseFloat(farmLocation.latitude)) > 90 ||
      Math.abs(parseFloat(farmLocation.longitude)) > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid farm location with latitude (-90 to 90) and longitude (-180 to 180) is required'
      });
    }

    const normalizedCrop = crop.toLowerCase().trim();
    const parsedLat = parseFloat(farmLocation.latitude);
    const parsedLon = parseFloat(farmLocation.longitude);
    const parsedNearbyPrice = nearbyBuyerPrice != null && nearbyBuyerPrice !== '' ? parseFloat(nearbyBuyerPrice) : null;

    if (parsedNearbyPrice !== null && (isNaN(parsedNearbyPrice) || parsedNearbyPrice < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Nearby buyer price cannot be negative'
      });
    }

    const parsedCapacity = vehicleCapacity ? parseFloat(vehicleCapacity) : null;
    if (parsedCapacity !== null && (isNaN(parsedCapacity) || parsedCapacity <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle capacity must be greater than 0'
      });
    }

    // Cost overrides validation (prevent negative expenses)
    const costOverrides = {
      transportRate: transportRate != null && transportRate !== '' ? Math.max(0, parseFloat(transportRate)) : null,
      labourCost: labourCost != null && labourCost !== '' ? Math.max(0, parseFloat(labourCost)) : null,
      loadingCost: loadingCost != null && loadingCost !== '' ? Math.max(0, parseFloat(loadingCost)) : null,
      unloadingCost: unloadingCost != null && unloadingCost !== '' ? Math.max(0, parseFloat(unloadingCost)) : null,
      packagingCost: packagingCost != null && packagingCost !== '' ? Math.max(0, parseFloat(packagingCost)) : null,
      otherExpenses: otherExpenses != null && otherExpenses !== '' ? Math.max(0, parseFloat(otherExpenses)) : null
    };

    // ── Fetch Candidate Mandis ──
    const mandis = await Mandi.find().lean();
    if (!mandis || mandis.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registered mandis found in the database. Please seed mandi data.'
      });
    }

    // ── Get ML / Baseline Expected Prices for Each Mandi ──
    const mandiIds = mandis.map(m => m._id);
    const targetSellingDate = sellingDate ? new Date(sellingDate) : new Date();
    const prices = await batchPredictMandiPrices(mandiIds, normalizedCrop, targetSellingDate);

    // ── Run Deterministic Profit Engine & Ranking ──
    const result = analyzeAllMandis({
      mandis,
      prices,
      quantity: parsedQty,
      farmLocation: { latitude: parsedLat, longitude: parsedLon },
      nearbyBuyerPrice: parsedNearbyPrice,
      farmerOverrides: costOverrides,
      vehicleType: vehicleType || 'truck',
      vehicleCapacity: parsedCapacity
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Optional: Log activity if user is authenticated
    if (req.user && req.user._id) {
      await logActivity({
        user: req.user._id,
        action: 'MANDI_PROFIT_ANALYSIS',
        entityType: 'MandiAnalysis',
        description: `Analyzed ${normalizedCrop} (${parsedQty} qtl) across ${mandis.length} mandis. Decision: ${result.decision}`,
        metadata: {
          crop: normalizedCrop,
          quantity: parsedQty,
          decision: result.decision,
          recommendedName: result.recommended ? result.recommended.name : null,
          netProfit: result.recommended ? result.recommended.netProfit : null
        }
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('[MandiController] Analysis Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during mandi profitability analysis',
      error: error.message
    });
  }
};

/**
 * @desc    Get all available mandis
 * @route   GET /api/mandi/list
 * @access  Public
 */
const getMandiList = async (req, res) => {
  try {
    const mandis = await Mandi.find().sort({ state: 1, district: 1, name: 1 });
    return res.status(200).json({
      success: true,
      count: mandis.length,
      data: mandis
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve mandis',
      error: error.message
    });
  }
};

/**
 * @desc    Get list of supported crops
 * @route   GET /api/mandi/crops
 * @access  Public
 */
const getAvailableCrops = async (req, res) => {
  try {
    const rawCrops = await MandiPrice.distinct('crop');
    
    // Enrich with localized labels and icons
    const cropMetadata = {
      onion: { name: 'Onion', localName: 'कांदा (Onion)', icon: '🧅', defaultAsking: 3200 },
      tomato: { name: 'Tomato', localName: 'टोमॅटो (Tomato)', icon: '🍅', defaultAsking: 2400 },
      soybean: { name: 'Soybean', localName: 'सोयाबीन (Soybean)', icon: '🌱', defaultAsking: 4600 },
      wheat: { name: 'Wheat', localName: 'गहू (Wheat)', icon: '🌾', defaultAsking: 2650 },
      potato: { name: 'Potato', localName: 'बटाटा (Potato)', icon: '🥔', defaultAsking: 1850 }
    };

    const formatted = rawCrops.map(cropKey => {
      const meta = cropMetadata[cropKey] || {
        name: cropKey.charAt(0).toUpperCase() + cropKey.slice(1),
        localName: cropKey,
        icon: '🌾',
        defaultAsking: 3000
      };
      return {
        key: cropKey,
        ...meta
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve available crops',
      error: error.message
    });
  }
};

/**
 * @desc    Get historical price series for a specific mandi
 * @route   GET /api/mandi/prices/:mandiId
 * @access  Public
 */
const getMandiPriceHistory = async (req, res) => {
  try {
    const { mandiId } = req.params;
    const { crop, limit = 30 } = req.query;

    const query = { mandi: mandiId };
    if (crop) {
      query.crop = crop.toLowerCase().trim();
    }

    const prices = await MandiPrice.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit, 10))
      .lean();

    return res.status(200).json({
      success: true,
      count: prices.length,
      data: prices.reverse() // Chronological order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve price history',
      error: error.message
    });
  }
};

module.exports = {
  analyzeProfitability,
  getMandiList,
  getAvailableCrops,
  getMandiPriceHistory
};
