const crypto = require('crypto');
const mongoose = require('mongoose');
const ProduceLot = require('../models/ProduceLot');
const FarmerProfile = require('../models/FarmerProfile');
const { evaluateAgmarkGrade, getCropCategory } = require('../utils/gradingEngine');

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
      cropCategory,
      variety,
      quantity,
      quantityUnit,
      harvestDate,
      qualityGrade,
      qualityNotes,
      qualityParameters,
      assaying,
      aiQualityScan,
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

    // Calculate or standardize Agmark quality parameters
    let computedGrade = qualityGrade || 'A';
    let formattedParams = qualityParameters || {};
    const normCrop = String(cropName).trim();
    const inferredCategory = cropCategory || getCropCategory(normCrop);

    if (qualityParameters && Object.keys(qualityParameters).length > 0) {
      const evalResult = evaluateAgmarkGrade(normCrop, qualityParameters);
      if (!qualityGrade || !['A', 'B', 'C'].includes(qualityGrade)) {
        computedGrade = evalResult.grade;
      }
      formattedParams = {
        ...qualityParameters,
        standard: evalResult.standard,
        gradeCalculationRationale: evalResult.rationales.join(' | ')
      };
    }

    // Assaying & Lab Certification digital stamp
    let assayObj = {
      isAssayed: false,
      verificationStatus: 'uninspected',
      assayerName: '',
      assayerOrganization: '',
      assayerRole: '',
      certificateNumber: '',
      certifiedAt: null,
      digitalSignature: { signedBy: '', signatureHash: '', timestamp: null, certId: '' },
      certificateDocument: { fileName: '', fileUrl: '', fileType: '' },
      labRemarks: ''
    };

    if (assaying && (assaying.isAssayed || assaying.certificateNumber)) {
      const certNum = assaying.certificateNumber || `AGM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const signer = assaying.assayerName || req.user.name || 'Accredited Assayer';
      const sigHash = assaying.digitalSignature?.signatureHash ||
        crypto.createHash('sha256').update(`${lotId}-${certNum}-${signer}-${Date.now()}`).digest('hex');

      assayObj = {
        isAssayed: true,
        verificationStatus: assaying.verificationStatus || 'verified',
        assayerName: signer,
        assayerOrganization: assaying.assayerOrganization || 'NABL / Agmark Quality Testing Lab',
        assayerRole: assaying.assayerRole || (req.user.role === 'fpo' ? 'FPO Quality In-charge' : 'Certified Quality Assayer'),
        certificateNumber: certNum,
        certifiedAt: assaying.certifiedAt ? new Date(assaying.certifiedAt) : new Date(),
        digitalSignature: {
          signedBy: signer,
          signatureHash: sigHash,
          timestamp: new Date(),
          certId: `CERT-${certNum}`
        },
        certificateDocument: assaying.certificateDocument || {
          fileName: `Certificate_${certNum}.pdf`,
          fileUrl: '',
          fileType: 'application/pdf'
        },
        labRemarks: assaying.labRemarks || 'Certified under Agmark / e-NAM physical quality standards.'
      };
    }

    // 4. Create ProduceLot document
    const lot = await ProduceLot.create({
      farmer: farmerProfile._id,
      createdBy: req.user._id,
      lotId,
      cropName: normCrop,
      cropCategory: inferredCategory,
      variety: String(variety).trim(),
      quantity: Number(quantity),
      quantityUnit: quantityUnit || 'quintal',
      harvestDate: new Date(harvestDate),
      qualityGrade: computedGrade,
      qualityNotes: qualityNotes ? String(qualityNotes).trim() : '',
      qualityParameters: formattedParams,
      assaying: assayObj,
      aiQualityScan: aiQualityScan || {},
      storageType: storageType || 'farm',
      storageLocation: storageLocation ? String(storageLocation).trim() : '',
      askingPrice: Number(askingPrice),
      priceUnit: priceUnit || 'quintal',
      state: state ? String(state).trim() : (farmerProfile.state || ''),
      district: district ? String(district).trim() : (farmerProfile.district || ''),
      taluka: taluka ? String(taluka).trim() : (farmerProfile.taluka || ''),
      village: village ? String(village).trim() : (farmerProfile.village || ''),
      pincode: pincode ? String(pincode).trim() : (farmerProfile.pincode || ''),
      photos: Array.isArray(photos) ? photos : [],
      status: (status === 'active' || status === 'draft') ? status : 'draft'
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
      cropCategory,
      variety,
      quantity,
      quantityUnit,
      harvestDate,
      qualityGrade,
      qualityNotes,
      qualityParameters,
      assaying,
      aiQualityScan,
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
    if (cropCategory !== undefined) lot.cropCategory = cropCategory;
    if (variety !== undefined) lot.variety = String(variety).trim();
    if (quantity !== undefined) lot.quantity = Number(quantity);
    if (quantityUnit !== undefined) lot.quantityUnit = quantityUnit;
    if (harvestDate !== undefined) lot.harvestDate = new Date(harvestDate);
    if (qualityGrade !== undefined) lot.qualityGrade = qualityGrade;
    if (qualityNotes !== undefined) lot.qualityNotes = String(qualityNotes).trim();
    if (qualityParameters !== undefined && typeof qualityParameters === 'object') {
      const evalResult = evaluateAgmarkGrade(lot.cropName, qualityParameters);
      lot.qualityParameters = {
        ...lot.qualityParameters?.toObject?.() || {},
        ...qualityParameters,
        standard: evalResult.standard,
        gradeCalculationRationale: evalResult.rationales.join(' | ')
      };
      if (!qualityGrade) {
        lot.qualityGrade = evalResult.grade;
      }
    }
    if (assaying !== undefined && typeof assaying === 'object') {
      lot.assaying = {
        ...lot.assaying?.toObject?.() || {},
        ...assaying
      };
    }
    if (aiQualityScan !== undefined && typeof aiQualityScan === 'object') {
      lot.aiQualityScan = aiQualityScan;
    }
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
 * @desc    Assay verification & Lab certificate upload with cryptographic digital signature
 * @route   POST /api/lots/:lotId/assay
 * @access  Private (Farmer, FPO, Assayer, Admin)
 */
const verifyAssay = async (req, res) => {
  try {
    const { lotId } = req.params;
    let lot = await ProduceLot.findOne({
      $or: [
        { lotId: lotId },
        ...(mongoose.Types.ObjectId.isValid(lotId) ? [{ _id: lotId }] : [])
      ]
    });

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Produce lot not found'
      });
    }

    // Role check: lot creator, FPO, Assayer, or Admin can verify/certify
    const isOwner = lot.createdBy.toString() === req.user._id.toString();
    const canCertify = isOwner || ['fpo', 'assayer', 'admin'].includes(req.user.role);

    if (!canCertify) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only certified Assayers, FPOs, or the Lot owner can record lab assaying.'
      });
    }

    const {
      certificateNumber,
      assayerName,
      assayerOrganization,
      assayerRole,
      labRemarks,
      certificateDocument,
      qualityParameters
    } = req.body;

    const certNum = certificateNumber || `AGM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const signer = assayerName || req.user.name || 'Accredited Quality Assayer';
    const org = assayerOrganization || 'NABL / Agmark Central Testing Lab';
    const role = assayerRole || (req.user.role === 'fpo' ? 'FPO Quality In-charge' : 'Third-Party Assayer');

    // Update quality parameters if tested during assay
    if (qualityParameters && Object.keys(qualityParameters).length > 0) {
      const evalResult = evaluateAgmarkGrade(lot.cropName, qualityParameters);
      lot.qualityParameters = {
        ...lot.qualityParameters?.toObject?.() || {},
        ...qualityParameters,
        standard: evalResult.standard,
        gradeCalculationRationale: evalResult.rationales.join(' | ')
      };
      lot.qualityGrade = evalResult.grade;
    }

    // Generate cryptographic SHA-256 Digital Signature Stamp
    const signaturePayload = {
      lotId: lot.lotId,
      certificateNumber: certNum,
      assayerName: signer,
      organization: org,
      testedParameters: lot.qualityParameters,
      gradeAwarded: lot.qualityGrade,
      timestamp: new Date().toISOString()
    };
    const signatureHash = crypto.createHash('sha256').update(JSON.stringify(signaturePayload)).digest('hex');

    lot.assaying = {
      isAssayed: true,
      verificationStatus: 'verified',
      assayerName: signer,
      assayerOrganization: org,
      assayerRole: role,
      certificateNumber: certNum,
      certifiedAt: new Date(),
      digitalSignature: {
        signedBy: signer,
        signatureHash: signatureHash,
        timestamp: new Date(),
        certId: `CERT-${certNum}`
      },
      certificateDocument: certificateDocument || {
        fileName: `Agmark_Lab_Cert_${certNum}.pdf`,
        fileUrl: '',
        fileType: 'application/pdf'
      },
      labRemarks: labRemarks || 'Tested in accordance with Agmark & e-NAM physical/chemical standards. Digital signature verified.'
    };

    await lot.save();

    return res.status(200).json({
      success: true,
      message: 'Lot assay certification completed successfully with digital signature.',
      lot
    });
  } catch (error) {
    console.error('Error verifying assay:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying lot assay'
    });
  }
};

/**
 * @desc    AI Image-based produce defect estimation (Computer Vision simulation)
 * @route   POST /api/lots/ai-estimate
 * @access  Private
 */
const aiQualityScanEstimate = async (req, res) => {
  try {
    const { cropName, sampleKey } = req.body;
    const normCrop = String(cropName || 'Wheat').trim();
    const category = getCropCategory(normCrop);

    let estimatedParams = {};
    let detectedDefects = [];
    let confidence = 96.8;

    if (category === 'cereals_grains') {
      if (sampleKey === 'defective') {
        estimatedParams = {
          moistureContent: 14.8,
          foreignMatter: 2.4,
          brokenGrains: 5.8,
          damagedGrains: 3.6
        };
        detectedDefects = [
          { defectType: 'Broken Grain Kernel', count: 14, severity: 'Moderate', percentage: 5.8 },
          { defectType: 'Foreign Chaff / Husk', count: 6, severity: 'Low', percentage: 2.4 },
          { defectType: 'Discolored / Weeviled Kernel', count: 8, severity: 'High', percentage: 3.6 }
        ];
        confidence = 94.6;
      } else {
        estimatedParams = {
          moistureContent: 11.2,
          foreignMatter: 0.7,
          brokenGrains: 1.6,
          damagedGrains: 0.9
        };
        detectedDefects = [
          { defectType: 'Foreign Matter', count: 1, severity: 'Negligible', percentage: 0.7 },
          { defectType: 'Broken Grain Kernel', count: 2, severity: 'Low', percentage: 1.6 }
        ];
        confidence = 97.9;
      }
    } else {
      if (sampleKey === 'defective') {
        estimatedParams = {
          blemishPercentage: 8.2,
          uniformity: 71,
          ripenessIndex: 68
        };
        detectedDefects = [
          { defectType: 'Surface Skin Blemish / Scarring', count: 11, severity: 'Moderate', percentage: 8.2 },
          { defectType: 'Size / Shape Variance', count: 5, severity: 'Low', percentage: 29.0 }
        ];
        confidence = 93.9;
      } else {
        estimatedParams = {
          blemishPercentage: 1.9,
          uniformity: 93,
          ripenessIndex: 90
        };
        detectedDefects = [
          { defectType: 'Minor Skin Freckle', count: 2, severity: 'Negligible', percentage: 1.9 }
        ];
        confidence = 98.4;
      }
    }

    const evalResult = evaluateAgmarkGrade(normCrop, estimatedParams);

    return res.status(200).json({
      success: true,
      cropName: normCrop,
      category,
      confidenceScore: confidence,
      qualityParameters: estimatedParams,
      detectedDefects,
      suggestedGrade: evalResult.grade,
      gradeLabel: evalResult.gradeLabel,
      standard: evalResult.standard,
      analysisSummary: `AI detected ${detectedDefects.length} defect classes with ${confidence}% neural confidence. Agmark rating: ${evalResult.gradeLabel}.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while performing AI quality scan'
    });
  }
};

module.exports = {
  createLot,
  getMyLots,
  getSingleLot,
  updateLot,
  deleteLot,
  verifyAssay,
  aiQualityScanEstimate
};

