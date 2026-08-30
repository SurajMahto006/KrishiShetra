const mongoose = require('mongoose');
const Offer = require('../models/Offer');
const ProduceLot = require('../models/ProduceLot');
const BuyerProfile = require('../models/BuyerProfile');
const FarmerProfile = require('../models/FarmerProfile');

const VALID_UNITS = ['kg', 'quintal', 'ton'];
const VALID_STATUSES = ['pending', 'accepted', 'rejected', 'cancelled'];

/**
 * Format an offer document cleanly for the Buyer
 */
const formatOfferForBuyer = (offer) => {
  const lot = offer.lot || {};
  return {
    offerId: offer._id,
    lotId: lot.lotId || '',
    cropName: lot.cropName || '',
    variety: lot.variety || '',
    offeredPrice: offer.offeredPrice,
    priceUnit: offer.priceUnit,
    quantity: offer.quantity,
    quantityUnit: offer.quantityUnit,
    message: offer.message || '',
    status: offer.status,
    createdAt: offer.createdAt,
    respondedAt: offer.respondedAt || null
  };
};

/**
 * Format an offer document cleanly for the Farmer
 */
const formatOfferForFarmer = (offer) => {
  const lot = offer.lot || {};
  const buyer = offer.buyer || {};
  return {
    offerId: offer._id,
    lotId: lot.lotId || '',
    cropName: lot.cropName || '',
    variety: lot.variety || '',
    offeredPrice: offer.offeredPrice,
    priceUnit: offer.priceUnit,
    quantity: offer.quantity,
    quantityUnit: offer.quantityUnit,
    message: offer.message || '',
    buyerBusinessName: buyer.businessName || 'Verified Buyer',
    buyerContactPerson: buyer.contactPerson || '',
    status: offer.status,
    createdAt: offer.createdAt,
    respondedAt: offer.respondedAt || null
  };
};

/**
 * @desc    Create a new offer on an active Produce Lot
 * @route   POST /api/offers
 * @access  Private (Buyer role only)
 */
const createOffer = async (req, res) => {
  try {
    // 1. Verify authenticated buyer has a completed BuyerProfile
    const buyerProfile = await BuyerProfile.findOne({ user: req.user._id });
    if (!buyerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Buyer profile required before submitting offers. Please complete your profile at /api/buyer/profile first.'
      });
    }

    const { lotId, offeredPrice, priceUnit, quantity, quantityUnit, message } = req.body;

    // 2. Validate input fields
    if (!lotId || !String(lotId).trim()) {
      return res.status(400).json({
        success: false,
        message: 'lotId is required.'
      });
    }

    const priceNum = Number(offeredPrice);
    if (offeredPrice === undefined || isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Offered price must be a positive number greater than zero.'
      });
    }

    const qtyNum = Number(quantity);
    if (quantity === undefined || isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number greater than zero.'
      });
    }

    if (priceUnit && !VALID_UNITS.includes(priceUnit)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priceUnit. Allowed: ${VALID_UNITS.join(', ')}.`
      });
    }

    if (quantityUnit && !VALID_UNITS.includes(quantityUnit)) {
      return res.status(400).json({
        success: false,
        message: `Invalid quantityUnit. Allowed: ${VALID_UNITS.join(', ')}.`
      });
    }

    // 3. Find the Produce Lot by lotId string or Mongo _id
    const lotQuery = {};
    if (mongoose.Types.ObjectId.isValid(lotId)) {
      lotQuery.$or = [{ lotId }, { _id: lotId }];
    } else {
      lotQuery.lotId = String(lotId).trim();
    }

    const lot = await ProduceLot.findOne(lotQuery);
    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Produce lot not found.'
      });
    }

    // 4. Confirm lot status is active
    if (lot.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Offers can only be placed on active produce lots. Current lot status: ${lot.status}.`
      });
    }

    // 5. Quantity limit validation: Offer quantity cannot exceed available lot quantity
    if (qtyNum > lot.quantity) {
      return res.status(400).json({
        success: false,
        message: `Offer quantity (${qtyNum} ${quantityUnit || lot.quantityUnit}) cannot exceed available lot quantity (${lot.quantity} ${lot.quantityUnit}).`
      });
    }

    // 6. Unit match validation
    const finalPriceUnit = priceUnit || lot.priceUnit;
    const finalQuantityUnit = quantityUnit || lot.quantityUnit;

    if (finalPriceUnit !== lot.priceUnit) {
      return res.status(400).json({
        success: false,
        message: `Price unit must match lot's price unit: ${lot.priceUnit}.`
      });
    }

    if (finalQuantityUnit !== lot.quantityUnit) {
      return res.status(400).json({
        success: false,
        message: `Quantity unit must match lot's quantity unit: ${lot.quantityUnit}.`
      });
    }

    // 7. Prevent Duplicate Active/Pending Offers for the same lot by this buyer
    const existingPendingOffer = await Offer.findOne({
      lot: lot._id,
      buyer: buyerProfile._id,
      status: 'pending'
    });

    if (existingPendingOffer) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending offer for this lot.'
      });
    }

    // 8. Create Offer document
    const offer = await Offer.create({
      lot: lot._id,
      buyer: buyerProfile._id,
      farmer: lot.farmer,
      offeredPrice: priceNum,
      priceUnit: finalPriceUnit,
      quantity: qtyNum,
      quantityUnit: finalQuantityUnit,
      message: message ? String(message).trim() : '',
      status: 'pending'
    });

    await offer.populate('lot');

    return res.status(201).json({
      success: true,
      message: 'Offer submitted successfully',
      offer: formatOfferForBuyer(offer)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while creating offer'
    });
  }
};

/**
 * @desc    Get all offers submitted by current authenticated Buyer
 * @route   GET /api/offers/my
 * @access  Private (Buyer role only)
 */
const getMyOffers = async (req, res) => {
  try {
    const buyerProfile = await BuyerProfile.findOne({ user: req.user._id });
    if (!buyerProfile) {
      return res.status(200).json({
        success: true,
        count: 0,
        pagination: { page: 1, limit: 12, total: 0, pages: 1 },
        offers: []
      });
    }

    const { status, page, limit } = req.query;

    let pageNum = 1;
    if (page !== undefined) {
      pageNum = parseInt(page, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid page parameter.'
        });
      }
    }

    let limitNum = 12;
    if (limit !== undefined) {
      limitNum = parseInt(limit, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        return res.status(400).json({
          success: false,
          message: 'Invalid limit parameter. Allowed: 1 to 50.'
        });
      }
    }

    const query = { buyer: buyerProfile._id };
    if (status && VALID_STATUSES.includes(status)) {
      query.status = status;
    }

    const skip = (pageNum - 1) * limitNum;
    const total = await Offer.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const rawOffers = await Offer.find(query)
      .populate('lot')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formattedOffers = rawOffers.map(formatOfferForBuyer);

    return res.status(200).json({
      success: true,
      count: formattedOffers.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      },
      offers: formattedOffers
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving buyer offers'
    });
  }
};

/**
 * @desc    Get all offers received by current authenticated Farmer for their lots
 * @route   GET /api/offers/received
 * @access  Private (Farmer role only)
 */
const getReceivedOffers = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    if (!farmerProfile) {
      return res.status(200).json({
        success: true,
        count: 0,
        pagination: { page: 1, limit: 12, total: 0, pages: 1 },
        offers: []
      });
    }

    const { status, page, limit } = req.query;

    let pageNum = 1;
    if (page !== undefined) {
      pageNum = parseInt(page, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid page parameter.'
        });
      }
    }

    let limitNum = 12;
    if (limit !== undefined) {
      limitNum = parseInt(limit, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        return res.status(400).json({
          success: false,
          message: 'Invalid limit parameter. Allowed: 1 to 50.'
        });
      }
    }

    const query = { farmer: farmerProfile._id };
    if (status && VALID_STATUSES.includes(status)) {
      query.status = status;
    }

    const skip = (pageNum - 1) * limitNum;
    const total = await Offer.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const rawOffers = await Offer.find(query)
      .populate('lot')
      .populate('buyer')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formattedOffers = rawOffers.map(formatOfferForFarmer);

    return res.status(200).json({
      success: true,
      count: formattedOffers.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      },
      offers: formattedOffers
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving received offers'
    });
  }
};

/**
 * @desc    Accept an incoming offer (Farmer only)
 * @route   PUT /api/offers/:offerId/accept
 * @access  Private (Farmer role only)
 */
const acceptOffer = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    if (!farmerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: No farmer profile found for this account.'
      });
    }

    const { offerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found.'
      });
    }

    const offer = await Offer.findById(offerId).populate('lot').populate('buyer');
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found.'
      });
    }

    // Security Check: Offer must belong to the authenticated farmer's lot
    if (offer.farmer.toString() !== farmerProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only accept offers received for your own lots.'
      });
    }

    // Must be currently pending
    if (offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending offers can be accepted. Current status: ${offer.status}.`
      });
    }

    // Confirm associated lot is still active
    if (!offer.lot || offer.lot.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept offer because the associated produce lot is no longer active.'
      });
    }

    // Update status to accepted
    offer.status = 'accepted';
    offer.respondedAt = new Date();
    await offer.save();

    return res.status(200).json({
      success: true,
      message: 'Offer accepted successfully',
      offer: formatOfferForFarmer(offer)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while accepting offer'
    });
  }
};

/**
 * @desc    Reject an incoming offer (Farmer only)
 * @route   PUT /api/offers/:offerId/reject
 * @access  Private (Farmer role only)
 */
const rejectOffer = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    if (!farmerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: No farmer profile found for this account.'
      });
    }

    const { offerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found.'
      });
    }

    const offer = await Offer.findById(offerId).populate('lot').populate('buyer');
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found.'
      });
    }

    // Security Check: Offer must belong to the authenticated farmer's lot
    if (offer.farmer.toString() !== farmerProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only reject offers received for your own lots.'
      });
    }

    // Must be currently pending
    if (offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending offers can be rejected. Current status: ${offer.status}.`
      });
    }

    // Update status to rejected
    offer.status = 'rejected';
    offer.respondedAt = new Date();
    await offer.save();

    return res.status(200).json({
      success: true,
      message: 'Offer rejected',
      offer: formatOfferForFarmer(offer)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while rejecting offer'
    });
  }
};

/**
 * @desc    Cancel an offer (Buyer only)
 * @route   PUT /api/offers/:offerId/cancel
 * @access  Private (Buyer role only)
 */
const cancelOffer = async (req, res) => {
  try {
    const buyerProfile = await BuyerProfile.findOne({ user: req.user._id });
    if (!buyerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: No buyer profile found for this account.'
      });
    }

    const { offerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found.'
      });
    }

    const offer = await Offer.findById(offerId).populate('lot');
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found.'
      });
    }

    // Security Check: Offer must belong to the authenticated buyer
    if (offer.buyer.toString() !== buyerProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel your own offers.'
      });
    }

    // Only pending offers can be cancelled
    if (offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending offers can be cancelled. Current status: ${offer.status}.`
      });
    }

    // Update status to cancelled
    offer.status = 'cancelled';
    offer.respondedAt = new Date();
    await offer.save();

    return res.status(200).json({
      success: true,
      message: 'Offer cancelled successfully',
      offer: formatOfferForBuyer(offer)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while cancelling offer'
    });
  }
};

module.exports = {
  createOffer,
  getMyOffers,
  getReceivedOffers,
  acceptOffer,
  rejectOffer,
  cancelOffer
};
