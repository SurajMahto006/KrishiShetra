const BuyerProfile = require('../models/BuyerProfile');

const VALID_BUSINESS_TYPES = [
  'individual',
  'retailer',
  'wholesaler',
  'processor',
  'exporter',
  'fpo',
  'company',
  'other'
];

const VALID_QUANTITY_UNITS = ['kg', 'quintal', 'ton'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

/**
 * Server-side input validation for BuyerProfile
 */
const validateBuyerProfileInput = (data, isUpdate = false) => {
  const errors = [];

  // Required on create
  if (!isUpdate) {
    if (!data.businessName || !String(data.businessName).trim()) {
      errors.push('Business name is required.');
    }
    if (!data.contactPerson || !String(data.contactPerson).trim()) {
      errors.push('Contact person name is required.');
    }
  }

  // Business name non-empty if updated
  if (data.businessName !== undefined && !String(data.businessName).trim()) {
    errors.push('Business name cannot be empty.');
  }

  // Contact person non-empty if updated
  if (data.contactPerson !== undefined && !String(data.contactPerson).trim()) {
    errors.push('Contact person cannot be empty.');
  }

  // Business type validation
  if (data.businessType && !VALID_BUSINESS_TYPES.includes(data.businessType)) {
    errors.push(`Invalid businessType. Allowed values: ${VALID_BUSINESS_TYPES.join(', ')}.`);
  }

  // Business email validation
  if (data.businessEmail !== undefined && data.businessEmail !== null && data.businessEmail !== '') {
    const email = String(data.businessEmail).trim();
    if (!EMAIL_REGEX.test(email)) {
      errors.push('Please provide a valid business email address.');
    }
  }

  // Business phone validation (10-digit Indian phone)
  if (data.businessPhone !== undefined && data.businessPhone !== null && data.businessPhone !== '') {
    const phone = String(data.businessPhone).trim();
    if (!PHONE_REGEX.test(phone)) {
      errors.push('Please provide a valid 10-digit Indian mobile number starting with 6-9.');
    }
  }

  // Pincode validation (6-digit Indian PIN code)
  if (data.pincode !== undefined && data.pincode !== null && data.pincode !== '') {
    const pin = String(data.pincode).trim();
    if (!PINCODE_REGEX.test(pin)) {
      errors.push('Pincode must be a valid 6-digit Indian postal code.');
    }
  }

  // Requirements array validation
  if (data.requirements !== undefined && !Array.isArray(data.requirements)) {
    errors.push('Requirements must be an array of procurement requirement items.');
  } else if (Array.isArray(data.requirements)) {
    for (let i = 0; i < data.requirements.length; i++) {
      const item = data.requirements[i];
      if (!item.cropName || !String(item.cropName).trim()) {
        errors.push(`Requirement #${i + 1} must include a cropName.`);
      }
      if (item.quantity !== undefined && item.quantity !== null && item.quantity !== '') {
        const qty = Number(item.quantity);
        if (isNaN(qty) || qty <= 0) {
          errors.push(`Requirement #${i + 1} quantity must be a positive number greater than zero.`);
        }
      }
      if (item.quantityUnit && !VALID_QUANTITY_UNITS.includes(item.quantityUnit)) {
        errors.push(`Requirement #${i + 1} invalid quantityUnit. Allowed: ${VALID_QUANTITY_UNITS.join(', ')}.`);
      }
    }
  }

  return errors;
};

/**
 * @desc    Create Buyer Profile
 * @route   POST /api/buyer/profile
 * @access  Private (Buyer role only)
 */
const createProfile = async (req, res) => {
  try {
    // 1. Check if profile already exists for this authenticated buyer
    const existingProfile = await BuyerProfile.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(409).json({
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
      businessName,
      businessType,
      contactPerson,
      businessEmail,
      businessPhone,
      state,
      district,
      taluka,
      village,
      pincode,
      addressLine,
      requirements
    } = req.body;

    // 3. Construct safe BuyerProfile data
    // Security: user is derived strictly from JWT; verificationStatus always defaults to 'pending'
    const profile = await BuyerProfile.create({
      user: req.user._id,
      businessName: String(businessName).trim(),
      businessType: businessType || 'wholesaler',
      contactPerson: String(contactPerson).trim(),
      businessEmail: businessEmail ? String(businessEmail).trim().toLowerCase() : (req.user.email || ''),
      businessPhone: businessPhone ? String(businessPhone).trim() : (req.user.phone || ''),
      state: state ? String(state).trim() : '',
      district: district ? String(district).trim() : '',
      taluka: taluka ? String(taluka).trim() : '',
      village: village ? String(village).trim() : '',
      pincode: pincode ? String(pincode).trim() : '',
      addressLine: addressLine ? String(addressLine).trim() : '',
      requirements: Array.isArray(requirements)
        ? requirements.map(r => ({
            cropName: String(r.cropName).trim(),
            variety: r.variety ? String(r.variety).trim() : '',
            quantity: r.quantity !== undefined && r.quantity !== '' ? Number(r.quantity) : undefined,
            quantityUnit: r.quantityUnit || 'quintal'
          })).filter(r => r.cropName.length > 0)
        : [],
      verificationStatus: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Buyer profile created successfully',
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
      message: 'Server error while creating buyer profile'
    });
  }
};

/**
 * @desc    Get Current Authenticated Buyer's Profile
 * @route   GET /api/buyer/profile
 * @access  Private (Buyer role only)
 */
const getProfile = async (req, res) => {
  try {
    const profile = await BuyerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found. Please create your profile first.'
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
const updateProfile = async (req, res) => {
  try {
    const profile = await BuyerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found. Please create your profile first.'
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
      businessName,
      businessType,
      contactPerson,
      businessEmail,
      businessPhone,
      state,
      district,
      taluka,
      village,
      pincode,
      addressLine,
      requirements
    } = req.body;

    // Apply allowed updates only (user and verificationStatus remain strictly protected)
    if (businessName !== undefined) profile.businessName = String(businessName).trim();
    if (businessType !== undefined) profile.businessType = businessType;
    if (contactPerson !== undefined) profile.contactPerson = String(contactPerson).trim();
    if (businessEmail !== undefined) profile.businessEmail = String(businessEmail).trim().toLowerCase();
    if (businessPhone !== undefined) profile.businessPhone = String(businessPhone).trim();
    if (state !== undefined) profile.state = String(state).trim();
    if (district !== undefined) profile.district = String(district).trim();
    if (taluka !== undefined) profile.taluka = String(taluka).trim();
    if (village !== undefined) profile.village = String(village).trim();
    if (pincode !== undefined) profile.pincode = String(pincode).trim();
    if (addressLine !== undefined) profile.addressLine = String(addressLine).trim();

    if (Array.isArray(requirements)) {
      profile.requirements = requirements
        .map(r => ({
          cropName: String(r.cropName).trim(),
          variety: r.variety ? String(r.variety).trim() : '',
          quantity: r.quantity !== undefined && r.quantity !== '' ? Number(r.quantity) : undefined,
          quantityUnit: r.quantityUnit || 'quintal'
        }))
        .filter(r => r.cropName.length > 0);
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Buyer profile updated successfully',
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
      message: 'Server error while updating buyer profile'
    });
  }
};

module.exports = {
  createProfile,
  getProfile,
  updateProfile
};
