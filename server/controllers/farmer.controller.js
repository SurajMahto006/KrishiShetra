const FarmerProfile = require('../models/FarmerProfile');

const VALID_ENUMS = {
  farmerType: ['individual', 'farmer_group', 'fpo_member'],
  farmSizeUnit: ['acre', 'hectare', 'guntha'],
  ownershipType: ['owned', 'leased', 'shared'],
  irrigationType: ['rainfed', 'borewell', 'canal', 'drip', 'sprinkler', 'mixed'],
  farmingMethod: ['conventional', 'organic', 'natural', 'mixed']
};

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

/**
 * Validate input fields for FarmerProfile
 */
const validateFarmerProfileInput = (data, isUpdate = false) => {
  const errors = [];

  // farmSize validation (must be positive number if provided)
  if (data.farmSize !== undefined && data.farmSize !== null && data.farmSize !== '') {
    const size = Number(data.farmSize);
    if (isNaN(size) || size < 0) {
      errors.push('Farm size must be a positive number.');
    }
  }

  // pincode validation (6-digit Indian PIN code)
  if (data.pincode !== undefined && data.pincode !== null && data.pincode !== '') {
    const pin = String(data.pincode).trim();
    if (!PINCODE_REGEX.test(pin)) {
      errors.push('Pincode must be a valid 6-digit Indian postal code.');
    }
  }

  // Enum validations
  if (data.farmerType && !VALID_ENUMS.farmerType.includes(data.farmerType)) {
    errors.push(`Invalid farmerType. Allowed values: ${VALID_ENUMS.farmerType.join(', ')}.`);
  }

  if (data.farmSizeUnit && !VALID_ENUMS.farmSizeUnit.includes(data.farmSizeUnit)) {
    errors.push(`Invalid farmSizeUnit. Allowed values: ${VALID_ENUMS.farmSizeUnit.join(', ')}.`);
  }

  if (data.ownershipType && !VALID_ENUMS.ownershipType.includes(data.ownershipType)) {
    errors.push(`Invalid ownershipType. Allowed values: ${VALID_ENUMS.ownershipType.join(', ')}.`);
  }

  if (data.irrigationType && !VALID_ENUMS.irrigationType.includes(data.irrigationType)) {
    errors.push(`Invalid irrigationType. Allowed values: ${VALID_ENUMS.irrigationType.join(', ')}.`);
  }

  if (data.farmingMethod && !VALID_ENUMS.farmingMethod.includes(data.farmingMethod)) {
    errors.push(`Invalid farmingMethod. Allowed values: ${VALID_ENUMS.farmingMethod.join(', ')}.`);
  }

  // Crops array validation
  if (data.crops !== undefined && !Array.isArray(data.crops)) {
    errors.push('Crops must be an array of crop items.');
  }

  return errors;
};

/**
 * @desc    Create Farmer Profile
 * @route   POST /api/farmer/profile
 * @access  Private (Farmer role only)
 */
const createProfile = async (req, res) => {
  try {
    // 1. Check if profile already exists for this authenticated user
    const existingProfile = await FarmerProfile.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: 'Farmer profile already exists for this account.'
      });
    }

    // 2. Validate input fields
    const validationErrors = validateFarmerProfileInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(' ')
      });
    }

    // 3. Construct safe profile data (ignore any user/userId in req.body)
    const {
      farmName,
      farmerType,
      farmSize,
      farmSizeUnit,
      ownershipType,
      state,
      district,
      taluka,
      village,
      pincode,
      crops,
      irrigationType,
      farmingMethod
    } = req.body;

    const profileData = {
      user: req.user._id,
      farmName: farmName ? String(farmName).trim() : '',
      farmerType: farmerType || 'individual',
      farmSize: farmSize !== undefined && farmSize !== '' ? Number(farmSize) : 0,
      farmSizeUnit: farmSizeUnit || 'acre',
      ownershipType: ownershipType || 'owned',
      state: state ? String(state).trim() : '',
      district: district ? String(district).trim() : '',
      taluka: taluka ? String(taluka).trim() : '',
      village: village ? String(village).trim() : '',
      pincode: pincode ? String(pincode).trim() : '',
      crops: Array.isArray(crops)
        ? crops.map(c => ({
            name: c.name ? String(c.name).trim() : '',
            season: c.season ? String(c.season).trim() : ''
          })).filter(c => c.name.length > 0)
        : [],
      irrigationType: irrigationType || 'rainfed',
      farmingMethod: farmingMethod || 'conventional'
    };

    const profile = await FarmerProfile.create(profileData);

    return res.status(201).json({
      success: true,
      message: 'Farmer profile created successfully',
      profile
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
      message: 'Server error while creating farmer profile'
    });
  }
};

/**
 * @desc    Get Current Farmer Profile
 * @route   GET /api/farmer/profile
 * @access  Private (Farmer role only)
 */
const getProfile = async (req, res) => {
  try {
    const profile = await FarmerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found. Please create your profile first.'
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving farmer profile'
    });
  }
};

/**
 * @desc    Update Current Farmer Profile
 * @route   PUT /api/farmer/profile
 * @access  Private (Farmer role only)
 */
const updateProfile = async (req, res) => {
  try {
    const profile = await FarmerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found. Please create your profile first.'
      });
    }

    // Validate update inputs
    const validationErrors = validateFarmerProfileInput(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(' ')
      });
    }

    const {
      farmName,
      farmerType,
      farmSize,
      farmSizeUnit,
      ownershipType,
      state,
      district,
      taluka,
      village,
      pincode,
      crops,
      irrigationType,
      farmingMethod
    } = req.body;

    // Apply allowed updates only (never allow updating user reference)
    if (farmName !== undefined) profile.farmName = String(farmName).trim();
    if (farmerType !== undefined) profile.farmerType = farmerType;
    if (farmSize !== undefined) profile.farmSize = Number(farmSize);
    if (farmSizeUnit !== undefined) profile.farmSizeUnit = farmSizeUnit;
    if (ownershipType !== undefined) profile.ownershipType = ownershipType;
    if (state !== undefined) profile.state = String(state).trim();
    if (district !== undefined) profile.district = String(district).trim();
    if (taluka !== undefined) profile.taluka = String(taluka).trim();
    if (village !== undefined) profile.village = String(village).trim();
    if (pincode !== undefined) profile.pincode = String(pincode).trim();
    if (irrigationType !== undefined) profile.irrigationType = irrigationType;
    if (farmingMethod !== undefined) profile.farmingMethod = farmingMethod;

    if (Array.isArray(crops)) {
      profile.crops = crops
        .map(c => ({
          name: c.name ? String(c.name).trim() : '',
          season: c.season ? String(c.season).trim() : ''
        }))
        .filter(c => c.name.length > 0);
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Farmer profile updated successfully',
      profile
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
      message: 'Server error while updating farmer profile'
    });
  }
};

module.exports = {
  createProfile,
  getProfile,
  updateProfile
};
