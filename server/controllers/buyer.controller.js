const BuyerProfile = require('../models/BuyerProfile');

const VALID_BUYER_TYPES = ['individual', 'business', 'trader', 'processor', 'retailer', 'fpo'];
const VALID_QUANTITY_UNITS = ['kg', 'quintal', 'ton'];
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

/**
 * Server-side input validation for BuyerProfile
 */
const validateBuyerProfileInput = (data, isUpdate = false) => {
  const errors = [];

  // Required fields on creation
  if (!isUpdate) {
    if (!data.companyName || !String(data.companyName).trim()) {
      errors.push('Company name is required.');
    }
    if (!data.state || !String(data.state).trim()) {
      errors.push('State is required.');
    }
    if (!data.district || !String(data.district).trim()) {
      errors.push('District is required.');
    }
    if (data.pincode === undefined || data.pincode === null || !String(data.pincode).trim()) {
      errors.push('Pincode is required.');
    }
  }

  // Non-empty validations on update if provided
  if (data.companyName !== undefined && !String(data.companyName).trim()) {
    errors.push('Company name cannot be empty.');
  }

  if (data.state !== undefined && !String(data.state).trim()) {
    errors.push('State cannot be empty.');
  }

  if (data.district !== undefined && !String(data.district).trim()) {
    errors.push('District cannot be empty.');
  }

  // Pincode format validation (6-digit Indian postal code)
  if (data.pincode !== undefined && data.pincode !== null && data.pincode !== '') {
    const pin = String(data.pincode).trim();
    if (!PINCODE_REGEX.test(pin)) {
      errors.push('Pincode must be a valid 6-digit Indian postal code.');
    }
  }

  // Enum validations
  if (data.buyerType && !VALID_BUYER_TYPES.includes(data.buyerType)) {
    errors.push(`Invalid buyerType. Allowed values: ${VALID_BUYER_TYPES.join(', ')}.`);
  }

  if (data.preferredQuantityUnit && !VALID_QUANTITY_UNITS.includes(data.preferredQuantityUnit)) {
    errors.push(`Invalid preferredQuantityUnit. Allowed values: ${VALID_QUANTITY_UNITS.join(', ')}.`);
  }

  // Interested crops array validation
  if (data.interestedCrops !== undefined && !Array.isArray(data.interestedCrops)) {
    errors.push('Interested crops must be an array of crop names.');
  }

  return errors;
};

/**
 * @desc    Create Buyer Profile
 * @route   POST /api/buyer/profile
 * @access  Private (Buyer role only)
 */
const createBuyerProfile = async (req, res) => {
  try {
    // 1. Prevent duplicate BuyerProfile
    const existingProfile = await BuyerProfile.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Buyer profile already exists for this account.'
      });
    }

    // 2. Validate input fields
    const validationErrors = validateBuyerProfileInput(req.body, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(' ')
      });
    }

    const {
      companyName,
      buyerType,
      gstNumber,
      businessAddress,
      state,
      district,
      taluka,
      village,
      pincode,
      interestedCrops,
      preferredQuantityUnit
    } = req.body;

    // 3. Construct safe BuyerProfile data (User ID strictly from req.user._id)
    const profile = await BuyerProfile.create({
      user: req.user._id,
      companyName: String(companyName).trim(),
      buyerType: buyerType || 'individual',
      gstNumber: gstNumber ? String(gstNumber).trim() : '',
      businessAddress: businessAddress ? String(businessAddress).trim() : '',
      state: String(state).trim(),
      district: String(district).trim(),
      taluka: taluka ? String(taluka).trim() : '',
      village: village ? String(village).trim() : '',
      pincode: String(pincode).trim(),
      interestedCrops: Array.isArray(interestedCrops)
        ? interestedCrops
            .map((c) => String(c).trim())
            .filter((c) => c.length > 0)
        : [],
      preferredQuantityUnit: preferredQuantityUnit || 'quintal'
    });

    return res.status(201).json({
      success: true,
      message: 'Buyer profile created successfully',
      profile
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(' ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating buyer profile'
    });
  }
};

/**
 * @desc    Get Current Authenticated Buyer's Profile
 * @route   GET /api/buyer/profile
 * @access  Private (Buyer role only)
 */
const getBuyerProfile = async (req, res) => {
  try {
    const profile = await BuyerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving buyer profile'
    });
  }
};

/**
 * @desc    Update Current Authenticated Buyer's Profile
 * @route   PUT /api/buyer/profile
 * @access  Private (Buyer role only)
 */
const updateBuyerProfile = async (req, res) => {
  try {
    const profile = await BuyerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found'
      });
    }

    // Validate update inputs
    const validationErrors = validateBuyerProfileInput(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(' ')
      });
    }

    const {
      companyName,
      buyerType,
      gstNumber,
      businessAddress,
      state,
      district,
      taluka,
      village,
      pincode,
      interestedCrops,
      preferredQuantityUnit
    } = req.body;

    // Apply allowed updates only (never allow updating user, email, role, password, timestamps)
    if (companyName !== undefined) profile.companyName = String(companyName).trim();
    if (buyerType !== undefined) profile.buyerType = buyerType;
    if (gstNumber !== undefined) profile.gstNumber = String(gstNumber).trim();
    if (businessAddress !== undefined) profile.businessAddress = String(businessAddress).trim();
    if (state !== undefined) profile.state = String(state).trim();
    if (district !== undefined) profile.district = String(district).trim();
    if (taluka !== undefined) profile.taluka = String(taluka).trim();
    if (village !== undefined) profile.village = String(village).trim();
    if (pincode !== undefined) profile.pincode = String(pincode).trim();
    if (preferredQuantityUnit !== undefined) profile.preferredQuantityUnit = preferredQuantityUnit;

    if (interestedCrops !== undefined) {
      profile.interestedCrops = Array.isArray(interestedCrops)
        ? interestedCrops
            .map((c) => String(c).trim())
            .filter((c) => c.length > 0)
        : [];
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Buyer profile updated successfully',
      profile
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(' ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while updating buyer profile'
    });
  }
};

module.exports = {
  createBuyerProfile,
  getBuyerProfile,
  updateBuyerProfile,
  // backward-compatible aliases
  createProfile: createBuyerProfile,
  getProfile: getBuyerProfile,
  updateProfile: updateBuyerProfile
};
