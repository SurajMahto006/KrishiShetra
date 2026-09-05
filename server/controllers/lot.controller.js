const mongoose = require('mongoose');
const ProduceLot = require('../models/ProduceLot');
const FarmerProfile = require('../models/FarmerProfile');

const VALID_ENUMS = {
  quantityUnit: ['kg', 'quintal', 'ton'],
  priceUnit: ['kg', 'quintal', 'ton'],
  qualityGrade: ['A', 'B', 'C'],
  storageType: ['farm', 'warehouse', 'cold_storage', 'other'],
  status: ['draft', 'active', 'sold', 'cancelled']
};

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

/**
 * Generate human-readable unique sequential Lot ID (KS-YYYY-XXXXXX)
 */
const generateLotId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `KS-${currentYear}-`;

  const latestLot = await ProduceLot.findOne({
    lotId: new RegExp(`^${prefix}`)
  }).sort({ lotId: -1, createdAt: -1 });

  let nextSequence = 1;
  if (latestLot && latestLot.lotId) {
    const parts = latestLot.lotId.split('-');
    if (parts.length === 3) {
      const parsedNum = parseInt(parts[2], 10);
      if (!isNaN(parsedNum)) {
        nextSequence = parsedNum + 1;
      }
    }
  }

  return `${prefix}${String(nextSequence).padStart(6, '0')}`;
};

/**
 * Server-side input validation for ProduceLot
 */
const validateLotInput = (data, isUpdate = false) => {
  const errors = [];

  // Required on create
  if (!isUpdate) {
    if (!data.cropName || !String(data.cropName).trim()) {
      errors.push('Crop name is required.');
    }
    if (!data.variety || !String(data.variety).trim()) {
      errors.push('Crop variety is required.');
    }
    if (data.quantity === undefined || data.quantity === null || data.quantity === '') {
      errors.push('Quantity is required.');
    }
    if (data.askingPrice === undefined || data.askingPrice === null || data.askingPrice === '') {
      errors.push('Asking price is required.');
    }
    if (!data.harvestDate) {
      errors.push('Harvest date is required.');
    }
  }

  // Quantity check
  if (data.quantity !== undefined && data.quantity !== null && data.quantity !== '') {
    const qty = Number(data.quantity);
    if (isNaN(qty) || qty <= 0) {
      errors.push('Quantity must be a positive number greater than zero.');
    }
  }

  // Asking price check
  if (data.askingPrice !== undefined && data.askingPrice !== null && data.askingPrice !== '') {
    const price = Number(data.askingPrice);
    if (isNaN(price) || price <= 0) {
      errors.push('Asking price must be a positive number greater than zero.');
    }
  }

  // Quantity unit check
  if (data.quantityUnit && !VALID_ENUMS.quantityUnit.includes(data.quantityUnit)) {
    errors.push(`Invalid quantityUnit. Allowed: ${VALID_ENUMS.quantityUnit.join(', ')}.`);
  }

  // Price unit check
  if (data.priceUnit && !VALID_ENUMS.priceUnit.includes(data.priceUnit)) {
    errors.push(`Invalid priceUnit. Allowed: ${VALID_ENUMS.priceUnit.join(', ')}.`);
  }

  // Quality grade check
  if (data.qualityGrade && !VALID_ENUMS.qualityGrade.includes(data.qualityGrade)) {
    errors.push(`Invalid qualityGrade. Allowed: ${VALID_ENUMS.qualityGrade.join(', ')}.`);
  }

  // Storage type check
  if (data.storageType && !VALID_ENUMS.storageType.includes(data.storageType)) {
    errors.push(`Invalid storageType. Allowed: ${VALID_ENUMS.storageType.join(', ')}.`);
  }

  // Status check
  if (data.status && !VALID_ENUMS.status.includes(data.status)) {
    errors.push(`Invalid status. Allowed: ${VALID_ENUMS.status.join(', ')}.`);
  }

  // Harvest date validity & future check (cannot be more than 30 days in future)
  if (data.harvestDate) {
    const hDate = new Date(data.harvestDate);
    if (isNaN(hDate.getTime())) {
      errors.push('Harvest date must be a valid date.');
    } else {
      const maxFutureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      if (hDate > maxFutureDate) {
        errors.push('Harvest date cannot be more than 30 days in the future.');
      }
    }
  }

  // Pincode validation
  if (data.pincode !== undefined && data.pincode !== null && data.pincode !== '') {
    const pin = String(data.pincode).trim();
    if (!PINCODE_REGEX.test(pin)) {
      errors.push('Pincode must be a valid 6-digit Indian postal code.');
    }
  }

  return errors;
};

/**
 * Helper to find lot by lotId string or Mongo _id belonging to authenticated user
 */
const findLotForUser = async (lotIdentifier, userId) => {
  const query = { createdBy: userId };

  if (mongoose.Types.ObjectId.isValid(lotIdentifier)) {
    query.$or = [{ lotId: lotIdentifier }, { _id: lotIdentifier }];
  } else {
    query.lotId = lotIdentifier;
  }

  return await ProduceLot.findOne(query);
};

/**
 * @desc    Create a new Produce Lot
 * @route   POST /api/lots
 * @access  Private (Farmer role only)
 */
const createLot = async (req, res) => {
  try {
    // 1. Verify that the authenticated user has a completed FarmerProfile
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    if (!farmerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Farmer profile required before creating produce lots. Please complete your profile at /api/farmer/profile first.'
      });
    }

    // 2. Validate input fields
    const validationErrors = validateLotInput(req.body, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(' ')
      });
    }

    // 3. Generate sequential unique Lot ID
    const lotId = await generateLotId();

    const {
      cropName,
      variety,
      quantity,
      quantityUnit,
      harvestDate,
      qualityGrade,
      qualityNotes,
      storageType,
      storageLocation,
      storageRequired,
      preferredStorageType,
      storageFacility,
      storageDurationDays,
      currentStorageStatus,
      estimatedStorageCost,
      sellNowOrHoldDecision,
      askingPrice,
      priceUnit,
      state,
      district,
      taluka,
      village,
      pincode,
      photos,
      status
    } = req.body;

    // 4. Create ProduceLot document
    const lot = await ProduceLot.create({
      farmer: farmerProfile._id,
      createdBy: req.user._id,
      lotId,
      cropName: String(cropName).trim(),
      variety: String(variety).trim(),
      quantity: Number(quantity),
      quantityUnit: quantityUnit || 'quintal',
      harvestDate: new Date(harvestDate),
      qualityGrade: qualityGrade || 'A',
      qualityNotes: qualityNotes ? String(qualityNotes).trim() : '',
      storageType: storageType || 'farm',
      storageLocation: storageLocation ? String(storageLocation).trim() : '',
      storageRequired: Boolean(storageRequired),
      preferredStorageType: preferredStorageType || storageType || 'farm',
      storageFacility: storageFacility || null,
      storageDurationDays: Number(storageDurationDays) || 0,
      currentStorageStatus: currentStorageStatus || 'on_farm',
      estimatedStorageCost: Number(estimatedStorageCost) || 0,
      sellNowOrHoldDecision: sellNowOrHoldDecision || {},
      askingPrice: Number(askingPrice),
      priceUnit: priceUnit || 'quintal',
      state: state ? String(state).trim() : (farmerProfile.state || ''),
      district: district ? String(district).trim() : (farmerProfile.district || ''),
      taluka: taluka ? String(taluka).trim() : (farmerProfile.taluka || ''),
      village: village ? String(village).trim() : (farmerProfile.village || ''),
      pincode: pincode ? String(pincode).trim() : (farmerProfile.pincode || ''),
      photos: Array.isArray(photos) ? photos : [],
      status: (status === 'active' || status === 'draft') ? status : 'active'
    });

    return res.status(201).json({
      success: true,
      message: 'Produce lot created successfully',
      lot
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(' ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating produce lot'
    });
  }
};

/**
 * @desc    Get all Produce Lots for the authenticated farmer
 * @route   GET /api/lots/my
 * @access  Private (Farmer role only)
 */
const getMyLots = async (req, res) => {
  try {
    const query = { createdBy: req.user._id };

    // Optional status filter
    if (req.query.status && VALID_ENUMS.status.includes(req.query.status)) {
      query.status = req.query.status;
    }

    // Optional cropName filter
    if (req.query.cropName) {
      query.cropName = new RegExp(req.query.cropName.trim(), 'i');
    }

    const lots = await ProduceLot.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: lots.length,
      lots
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving produce lots'
    });
  }
};

/**
 * @desc    Get a single Produce Lot by ID
 * @route   GET /api/lots/:lotId
 * @access  Private (Farmer role only)
 */
const getSingleLot = async (req, res) => {
  try {
    const lot = await findLotForUser(req.params.lotId, req.user._id);

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Produce lot not found or access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      lot
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving produce lot'
    });
  }
};

/**
 * @desc    Update a Produce Lot
 * @route   PUT /api/lots/:lotId
 * @access  Private (Farmer role only)
 */
const updateLot = async (req, res) => {
  try {
    const lot = await findLotForUser(req.params.lotId, req.user._id);

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Produce lot not found or access denied.'
      });
    }

    // Reject updating sold lots
    if (lot.status === 'sold') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a lot that has already been sold.'
      });
    }

    // Validate update payload
    const validationErrors = validateLotInput(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(' ')
      });
    }

    const {
      cropName,
      variety,
      quantity,
      quantityUnit,
      harvestDate,
      qualityGrade,
      qualityNotes,
      storageType,
      storageLocation,
      askingPrice,
      priceUnit,
      state,
      district,
      taluka,
      village,
      pincode,
      photos,
      status
    } = req.body;

    // Apply allowed updates only (lotId, farmer, createdBy remain immutable)
    if (cropName !== undefined) lot.cropName = String(cropName).trim();
    if (variety !== undefined) lot.variety = String(variety).trim();
    if (quantity !== undefined) lot.quantity = Number(quantity);
    if (quantityUnit !== undefined) lot.quantityUnit = quantityUnit;
    if (harvestDate !== undefined) lot.harvestDate = new Date(harvestDate);
    if (qualityGrade !== undefined) lot.qualityGrade = qualityGrade;
    if (qualityNotes !== undefined) lot.qualityNotes = String(qualityNotes).trim();
    if (storageType !== undefined) lot.storageType = storageType;
    if (storageLocation !== undefined) lot.storageLocation = String(storageLocation).trim();
    if (askingPrice !== undefined) lot.askingPrice = Number(askingPrice);
    if (priceUnit !== undefined) lot.priceUnit = priceUnit;
    if (state !== undefined) lot.state = String(state).trim();
    if (district !== undefined) lot.district = String(district).trim();
    if (taluka !== undefined) lot.taluka = String(taluka).trim();
    if (village !== undefined) lot.village = String(village).trim();
    if (pincode !== undefined) lot.pincode = String(pincode).trim();
    if (Array.isArray(photos)) lot.photos = photos;
    if (status !== undefined) lot.status = status;

    await lot.save();

    return res.status(200).json({
      success: true,
      message: 'Produce lot updated successfully',
      lot
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(' ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while updating produce lot'
    });
  }
};

/**
 * @desc    Cancel a Produce Lot (Soft cancellation)
 * @route   DELETE /api/lots/:lotId
 * @access  Private (Farmer role only)
 */
const deleteLot = async (req, res) => {
  try {
    const lot = await findLotForUser(req.params.lotId, req.user._id);

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Produce lot not found or access denied.'
      });
    }

    if (lot.status === 'sold') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel or delete a lot that has already been sold.'
      });
    }

    // Set status to cancelled
    lot.status = 'cancelled';
    await lot.save();

    return res.status(200).json({
      success: true,
      message: 'Produce lot status updated to cancelled',
      lot
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while cancelling produce lot'
    });
  }
};

/**
 * @desc    Get recommended storage options for a specific produce lot
 * @route   GET /api/lots/:lotId/storage-options
 * @access  Private (Farmer role only)
 */
const getLotStorageOptions = async (req, res) => {
  try {
    const lot = await findLotForUser(req.params.lotId, req.user._id);
    if (!lot) {
      return res.status(404).json({ success: false, message: 'Produce lot not found' });
    }

    const { getNearbyStorage } = require('./storage.controller');
    // Delegate to storage query filtering for lot's crop and state/district
    req.query.crop = lot.cropName.toLowerCase();
    req.query.state = lot.state || 'Maharashtra';
    return getNearbyStorage(req, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve storage options for lot' });
  }
};

/**
 * @desc    Get real-time AI Sell-vs-Store decision analysis for a specific produce lot
 * @route   GET /api/lots/:lotId/selling-decision
 * @access  Private (Farmer role only)
 */
const getLotSellingDecision = async (req, res) => {
  try {
    const lot = await findLotForUser(req.params.lotId, req.user._id);
    if (!lot) {
      return res.status(404).json({ success: false, message: 'Produce lot not found' });
    }

    const { evaluateSellVsStore } = require('../services/decision.service');
    const decision = evaluateSellVsStore({
      cropName: lot.cropName,
      quantity: lot.quantity,
      currentPrice: lot.askingPrice,
      holdingDays: lot.storageDurationDays || 45,
      distanceKm: 12
    });

    return res.status(200).json({
      success: true,
      lotId: lot.lotId,
      cropName: lot.cropName,
      quantity: lot.quantity,
      decision
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to calculate selling decision for lot' });
  }
};

module.exports = {
  createLot,
  getMyLots,
  getSingleLot,
  updateLot,
  deleteLot,
  getLotStorageOptions,
  getLotSellingDecision
};

