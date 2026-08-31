const mongoose = require('mongoose');
const ProduceLot = require('../models/ProduceLot');
const SavedLot = require('../models/SavedLot');

const ALLOWED_SORTS = {
  price_asc: { askingPrice: 1, _id: 1 },
  price_desc: { askingPrice: -1, _id: 1 },
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 }
};

const ALLOWED_QUALITY_GRADES = ['A', 'B', 'C'];
const ALLOWED_QUANTITY_UNITS = ['kg', 'quintal', 'ton'];

/**
 * Format a lot document for buyer marketplace response
 * Strips internal ObjectIds, createdBy, User credentials, sensitive details
 */
const formatBuyerMarketLot = (lot) => {
  const lotObj = lot.toObject ? lot.toObject() : lot;

  return {
    lotId: lotObj.lotId,
    cropName: lotObj.cropName,
    variety: lotObj.variety,
    quantity: lotObj.quantity,
    quantityUnit: lotObj.quantityUnit,
    qualityGrade: lotObj.qualityGrade,
    qualityNotes: lotObj.qualityNotes || '',
    storageType: lotObj.storageType,
    storageLocation: lotObj.storageLocation || '',
    askingPrice: lotObj.askingPrice,
    priceUnit: lotObj.priceUnit,
    state: lotObj.state || '',
    district: lotObj.district || '',
    taluka: lotObj.taluka || '',
    village: lotObj.village || '',
    pincode: lotObj.pincode || '',
    photos: lotObj.photos || [],
    status: lotObj.status,
    farmerName: (lotObj.farmer && lotObj.farmer.farmName) ? lotObj.farmer.farmName : 'Verified Farmer',
    createdAt: lotObj.createdAt
  };
};

/**
 * Format a saved lot item for saved-lots list
 */
const formatSavedLotItem = (lot) => {
  const lotObj = lot.toObject ? lot.toObject() : lot;

  return {
    lotId: lotObj.lotId,
    cropName: lotObj.cropName,
    variety: lotObj.variety,
    quantity: lotObj.quantity,
    quantityUnit: lotObj.quantityUnit,
    askingPrice: lotObj.askingPrice,
    priceUnit: lotObj.priceUnit,
    qualityGrade: lotObj.qualityGrade,
    state: lotObj.state || '',
    district: lotObj.district || '',
    farmerName: (lotObj.farmer && lotObj.farmer.farmName) ? lotObj.farmer.farmName : 'Verified Farmer',
    status: lotObj.status,
    createdAt: lotObj.createdAt
  };
};

/**
 * @desc    Discover active produce lots in the marketplace for authenticated buyers
 * @route   GET /api/buyer/market/lots
 * @access  Private (Buyer role only)
 */
const getBuyerMarketLots = async (req, res) => {
  try {
    const {
      search,
      cropName,
      state,
      district,
      taluka,
      minPrice,
      maxPrice,
      qualityGrade,
      quantityUnit,
      sort,
      page,
      limit
    } = req.query;

    // 1. Validation for Pagination & Limits
    let pageNum = 1;
    if (page !== undefined) {
      pageNum = parseInt(page, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid page parameter. Page must be a positive integer.'
        });
      }
    }

    let limitNum = 12;
    if (limit !== undefined) {
      limitNum = parseInt(limit, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        return res.status(400).json({
          success: false,
          message: 'Invalid limit parameter. Limit must be an integer between 1 and 50.'
        });
      }
    }

    // 2. Validation for Sort
    let sortKey = 'newest';
    if (sort !== undefined) {
      if (!ALLOWED_SORTS[sort]) {
        return res.status(400).json({
          success: false,
          message: `Invalid sort parameter. Allowed values: ${Object.keys(ALLOWED_SORTS).join(', ')}.`
        });
      }
      sortKey = sort;
    }

    // 3. Validation for Quality Grade
    if (qualityGrade !== undefined && !ALLOWED_QUALITY_GRADES.includes(qualityGrade)) {
      return res.status(400).json({
        success: false,
        message: `Invalid qualityGrade parameter. Allowed values: ${ALLOWED_QUALITY_GRADES.join(', ')}.`
      });
    }

    // 4. Validation for Quantity Unit
    if (quantityUnit !== undefined && !ALLOWED_QUANTITY_UNITS.includes(quantityUnit)) {
      return res.status(400).json({
        success: false,
        message: `Invalid quantityUnit parameter. Allowed values: ${ALLOWED_QUANTITY_UNITS.join(', ')}.`
      });
    }

    // 5. Validation for Price Range
    let minPriceNum;
    if (minPrice !== undefined && minPrice !== '') {
      minPriceNum = parseFloat(minPrice);
      if (isNaN(minPriceNum) || minPriceNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid minPrice parameter. Price must be a non-negative number.'
        });
      }
    }

    let maxPriceNum;
    if (maxPrice !== undefined && maxPrice !== '') {
      maxPriceNum = parseFloat(maxPrice);
      if (isNaN(maxPriceNum) || maxPriceNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid maxPrice parameter. Price must be a non-negative number.'
        });
      }
    }

    if (minPriceNum !== undefined && maxPriceNum !== undefined && minPriceNum > maxPriceNum) {
      return res.status(400).json({
        success: false,
        message: 'minPrice cannot be greater than maxPrice.'
      });
    }

    // 6. Build MongoDB Query Filter (Always active lots ONLY)
    const filter = {
      status: 'active'
    };

    // Generic Search across cropName, variety, district, state
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { cropName: searchRegex },
        { variety: searchRegex },
        { district: searchRegex },
        { state: searchRegex }
      ];
    }

    // Specific Filters
    if (cropName && cropName.trim()) {
      filter.cropName = new RegExp(`^${cropName.trim()}$`, 'i');
    }

    if (state && state.trim()) {
      filter.state = new RegExp(state.trim(), 'i');
    }

    if (district && district.trim()) {
      filter.district = new RegExp(district.trim(), 'i');
    }

    if (taluka && taluka.trim()) {
      filter.taluka = new RegExp(taluka.trim(), 'i');
    }

    if (qualityGrade) {
      filter.qualityGrade = qualityGrade;
    }

    if (quantityUnit) {
      filter.quantityUnit = quantityUnit;
    }

    if (minPriceNum !== undefined || maxPriceNum !== undefined) {
      filter.askingPrice = {};
      if (minPriceNum !== undefined) filter.askingPrice.$gte = minPriceNum;
      if (maxPriceNum !== undefined) filter.askingPrice.$lte = maxPriceNum;
    }

    // 7. Execute Database Query
    const skip = (pageNum - 1) * limitNum;
    const total = await ProduceLot.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const rawLots = await ProduceLot.find(filter)
      .populate({
        path: 'farmer',
        select: 'farmName'
      })
      .sort(ALLOWED_SORTS[sortKey])
      .skip(skip)
      .limit(limitNum);

    const formattedLots = rawLots.map(formatBuyerMarketLot);

    return res.status(200).json({
      success: true,
      count: formattedLots.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      },
      lots: formattedLots
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving buyer marketplace lots'
    });
  }
};

/**
 * @desc    Get single active produce lot details for authenticated buyer
 * @route   GET /api/buyer/market/lots/:lotId
 * @access  Private (Buyer role only)
 */
const getBuyerLotDetails = async (req, res) => {
  try {
    const { lotId } = req.params;

    const query = { status: 'active' };
    if (mongoose.Types.ObjectId.isValid(lotId)) {
      query.$or = [{ lotId }, { _id: lotId }];
    } else {
      query.lotId = lotId;
    }

    const lot = await ProduceLot.findOne(query).populate({
      path: 'farmer',
      select: 'farmName'
    });

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Active produce lot not found'
      });
    }

    return res.status(200).json({
      success: true,
      lot: formatBuyerMarketLot(lot)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving produce lot details'
    });
  }
};

/**
 * @desc    Save/Favorite a produce lot for authenticated buyer
 * @route   POST /api/buyer/saved-lots/:lotId
 * @access  Private (Buyer role only)
 */
const saveLot = async (req, res) => {
  try {
    const { lotId } = req.params;

    // 1. Find active produce lot
    const query = { status: 'active' };
    if (mongoose.Types.ObjectId.isValid(lotId)) {
      query.$or = [{ lotId }, { _id: lotId }];
    } else {
      query.lotId = lotId;
    }

    const lot = await ProduceLot.findOne(query);
    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Active produce lot not found'
      });
    }

    // 2. Check if already saved
    const existingSaved = await SavedLot.findOne({
      buyer: req.user._id,
      lot: lot._id
    });

    if (existingSaved) {
      return res.status(409).json({
        success: false,
        message: 'Lot is already saved'
      });
    }

    // 3. Create SavedLot record
    try {
      await SavedLot.create({
        buyer: req.user._id,
        lot: lot._id
      });

      return res.status(201).json({
        success: true,
        message: 'Lot saved successfully'
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Lot is already saved'
        });
      }
      throw err;
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while saving produce lot'
    });
  }
};

/**
 * @desc    Remove a produce lot from saved lots for authenticated buyer
 * @route   DELETE /api/buyer/saved-lots/:lotId
 * @access  Private (Buyer role only)
 */
const removeSavedLot = async (req, res) => {
  try {
    const { lotId } = req.params;

    // Find the produce lot first
    let lotQuery = {};
    if (mongoose.Types.ObjectId.isValid(lotId)) {
      lotQuery.$or = [{ lotId }, { _id: lotId }];
    } else {
      lotQuery.lotId = lotId;
    }

    const lot = await ProduceLot.findOne(lotQuery);

    let savedRecord = null;
    if (lot) {
      savedRecord = await SavedLot.findOneAndDelete({
        buyer: req.user._id,
        lot: lot._id
      });
    }

    if (!savedRecord && mongoose.Types.ObjectId.isValid(lotId)) {
      savedRecord = await SavedLot.findOneAndDelete({
        buyer: req.user._id,
        lot: lotId
      });
    }

    if (!savedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Saved lot not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lot removed from saved lots'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while removing saved lot'
    });
  }
};

/**
 * @desc    Get all saved produce lots for authenticated buyer
 * @route   GET /api/buyer/saved-lots
 * @access  Private (Buyer role only)
 */
const getSavedLots = async (req, res) => {
  try {
    const savedLots = await SavedLot.find({ buyer: req.user._id })
      .populate({
        path: 'lot',
        populate: {
          path: 'farmer',
          select: 'farmName'
        }
      })
      .sort({ createdAt: -1 });

    const formattedLots = savedLots
      .filter((item) => item.lot && item.lot.status === 'active')
      .map((item) => formatSavedLotItem(item.lot));

    return res.status(200).json({
      success: true,
      count: formattedLots.length,
      lots: formattedLots
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving saved lots'
    });
  }
};

module.exports = {
  getBuyerMarketLots,
  getBuyerLotDetails,
  saveLot,
  removeSavedLot,
  getSavedLots
};
