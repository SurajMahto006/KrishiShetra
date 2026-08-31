const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const ProduceLot = require('../models/ProduceLot');
const FarmerProfile = require('../models/FarmerProfile');
const { createNotification } = require('../services/notification.service');
const { logActivity } = require('../services/activity.service');

/**
 * Cleanly format an inquiry object for list views
 */
const formatInquiryListItem = (inquiry) => {
  const lot = inquiry.lot || {};
  const farmerProfile = lot.farmer || {};
  const buyer = inquiry.buyer || {};
  const farmerUser = inquiry.farmer || {};

  return {
    inquiryId: inquiry._id,
    lotId: lot.lotId || '',
    crop: lot.cropName || '',
    variety: lot.variety || '',
    lotQuantity: lot.quantity || 0,
    quantityUnit: lot.quantityUnit || 'quintal',
    askingPrice: lot.askingPrice || 0,
    priceUnit: lot.priceUnit || 'quintal',
    offeredPrice: inquiry.offeredPrice,
    quantityRequired: inquiry.quantityRequired,
    message: inquiry.message || '',
    farmerName: farmerProfile.farmName || farmerUser.name || 'Verified Farmer',
    buyerName: buyer.name || 'Verified Buyer',
    status: inquiry.status,
    totalOffers: inquiry.offers ? inquiry.offers.length : 0,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt
  };
};

/**
 * Format a single complete inquiry with all negotiation history
 */
const formatInquiryDetail = (inquiry) => {
  const lot = inquiry.lot || {};
  const farmerProfile = lot.farmer || {};
  const buyer = inquiry.buyer || {};
  const farmerUser = inquiry.farmer || {};

  return {
    inquiryId: inquiry._id,
    lot: {
      lotId: lot.lotId || '',
      cropName: lot.cropName || '',
      variety: lot.variety || '',
      quantity: lot.quantity || 0,
      quantityUnit: lot.quantityUnit || 'quintal',
      qualityGrade: lot.qualityGrade || '',
      askingPrice: lot.askingPrice || 0,
      priceUnit: lot.priceUnit || 'quintal',
      state: lot.state || '',
      district: lot.district || '',
      photos: lot.photos || [],
      status: lot.status || ''
    },
    buyer: {
      name: buyer.name || 'Verified Buyer'
    },
    farmer: {
      farmName: farmerProfile.farmName || 'Verified Farm',
      farmerName: farmerUser.name || 'Verified Farmer'
    },
    offeredPrice: inquiry.offeredPrice,
    quantityRequired: inquiry.quantityRequired,
    message: inquiry.message || '',
    status: inquiry.status,
    offers: (inquiry.offers || []).map((o) => ({
      offerId: o._id,
      sender: o.sender ? (o.sender.name || 'User') : 'User',
      senderRole: o.sender ? o.sender.role : '',
      senderId: o.sender ? (o.sender._id || o.sender) : null,
      offeredPrice: o.offeredPrice,
      quantityRequired: o.quantityRequired,
      message: o.message || '',
      createdAt: o.createdAt
    })),
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt
  };
};

/**
 * @desc    Create a new purchase inquiry on an active Produce Lot
 * @route   POST /api/inquiries
 * @access  Private (Buyer role only)
 */
const createInquiry = async (req, res) => {
  try {
    const { lotId, offeredPrice, quantityRequired, message } = req.body;

    // 1. Validate required inputs
    if (!lotId || !String(lotId).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Lot identifier (lotId) is required'
      });
    }

    const price = Number(offeredPrice);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Offered price must be a positive number greater than zero'
      });
    }

    const qty = Number(quantityRequired);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity required must be a positive number greater than zero'
      });
    }

    // 2. Find active produce lot
    let lotQuery = { status: 'active' };
    if (mongoose.Types.ObjectId.isValid(lotId)) {
      lotQuery.$or = [{ lotId }, { _id: lotId }];
    } else {
      lotQuery.lotId = lotId;
    }

    const lot = await ProduceLot.findOne(lotQuery);
    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Produce lot not found or is not currently active'
      });
    }

    // 3. Prevent buyer from inquiring about their own lot
    if (lot.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot inquire about your own lot'
      });
    }

    // 4. Quantity cannot exceed lot's available quantity
    if (qty > lot.quantity) {
      return res.status(400).json({
        success: false,
        message: `Quantity requested (${qty}) exceeds available lot quantity (${lot.quantity})`
      });
    }

    // 5. Prevent duplicate active inquiries for the same buyer and lot
    const existingInquiry = await Inquiry.findOne({
      lot: lot._id,
      buyer: req.user._id,
      status: { $in: ['pending', 'negotiating'] }
    });

    if (existingInquiry) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active inquiry for this lot'
      });
    }

    // 6. Create Inquiry document with initial offer in offers[]
    const inquiry = await Inquiry.create({
      lot: lot._id,
      buyer: req.user._id,
      farmer: lot.createdBy,
      offeredPrice: price,
      quantityRequired: qty,
      message: message ? String(message).trim() : '',
      status: 'pending',
      offers: [
        {
          sender: req.user._id,
          offeredPrice: price,
          quantityRequired: qty,
          message: message ? String(message).trim() : '',
          createdAt: new Date()
        }
      ]
    });

    // Notify farmer & log activity
    createNotification({
      recipient: lot.createdBy,
      type: 'inquiry_received',
      title: 'New Buyer Inquiry',
      message: 'A buyer has submitted an inquiry for your produce lot.',
      relatedEntity: { entityType: 'Inquiry', entityId: inquiry._id }
    });

    logActivity({
      user: req.user._id,
      action: 'inquiry_created',
      entityType: 'Inquiry',
      entityId: inquiry._id,
      description: `Submitted purchase inquiry for produce lot ${lot.lotId}`,
      metadata: { lotId: lot.lotId, offeredPrice: price, quantityRequired: qty },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Inquiry created successfully',
      inquiry: {
        inquiryId: inquiry._id,
        lotId: lot.lotId,
        offeredPrice: inquiry.offeredPrice,
        quantityRequired: inquiry.quantityRequired,
        message: inquiry.message,
        status: inquiry.status,
        createdAt: inquiry.createdAt
      }
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
      message: 'Server error while creating inquiry'
    });
  }
};

/**
 * @desc    Get all inquiries sent by the authenticated Buyer
 * @route   GET /api/inquiries/my
 * @access  Private (Buyer role only)
 */
const getMyInquiries = async (req, res) => {
  try {
    const { page, limit, status } = req.query;

    let pageNum = 1;
    if (page !== undefined) {
      pageNum = parseInt(page, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid page parameter'
        });
      }
    }

    let limitNum = 20;
    if (limit !== undefined) {
      limitNum = parseInt(limit, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        return res.status(400).json({
          success: false,
          message: 'Invalid limit parameter (1-50 allowed)'
        });
      }
    }

    const filter = { buyer: req.user._id };
    if (status && typeof status === 'string' && status.trim()) {
      filter.status = status.trim();
    }

    const skip = (pageNum - 1) * limitNum;
    const total = await Inquiry.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const rawInquiries = await Inquiry.find(filter)
      .populate({
        path: 'lot',
        select: 'lotId cropName variety quantity quantityUnit askingPrice priceUnit farmer',
        populate: {
          path: 'farmer',
          select: 'farmName'
        }
      })
      .populate({
        path: 'farmer',
        select: 'name'
      })
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formattedInquiries = rawInquiries.map(formatInquiryListItem);

    return res.status(200).json({
      success: true,
      count: formattedInquiries.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      },
      inquiries: formattedInquiries
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving buyer inquiries'
    });
  }
};

/**
 * @desc    Get all inquiries received by the authenticated Farmer
 * @route   GET /api/inquiries/farmer
 * @access  Private (Farmer role only)
 */
const getFarmerInquiries = async (req, res) => {
  try {
    const { page, limit, status } = req.query;

    let pageNum = 1;
    if (page !== undefined) {
      pageNum = parseInt(page, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid page parameter'
        });
      }
    }

    let limitNum = 20;
    if (limit !== undefined) {
      limitNum = parseInt(limit, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        return res.status(400).json({
          success: false,
          message: 'Invalid limit parameter (1-50 allowed)'
        });
      }
    }

    const filter = { farmer: req.user._id };
    if (status && typeof status === 'string' && status.trim()) {
      filter.status = status.trim();
    }

    const skip = (pageNum - 1) * limitNum;
    const total = await Inquiry.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const rawInquiries = await Inquiry.find(filter)
      .populate({
        path: 'lot',
        select: 'lotId cropName variety quantity quantityUnit askingPrice priceUnit farmer',
        populate: {
          path: 'farmer',
          select: 'farmName'
        }
      })
      .populate({
        path: 'buyer',
        select: 'name'
      })
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formattedInquiries = rawInquiries.map(formatInquiryListItem);

    return res.status(200).json({
      success: true,
      count: formattedInquiries.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      },
      inquiries: formattedInquiries
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving farmer inquiries'
    });
  }
};

/**
 * @desc    Get single inquiry details with offer history
 * @route   GET /api/inquiries/:id
 * @access  Private (Inquiry participants only)
 */
const getSingleInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    const inquiry = await Inquiry.findById(id)
      .populate({
        path: 'lot',
        select: 'lotId cropName variety quantity quantityUnit qualityGrade askingPrice priceUnit state district photos status farmer',
        populate: {
          path: 'farmer',
          select: 'farmName'
        }
      })
      .populate({
        path: 'buyer',
        select: 'name'
      })
      .populate({
        path: 'farmer',
        select: 'name'
      })
      .populate({
        path: 'offers.sender',
        select: 'name role'
      });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Ownership check: only buyer or farmer of this inquiry can access
    const isBuyer = inquiry.buyer && inquiry.buyer._id.toString() === req.user._id.toString();
    const isFarmer = inquiry.farmer && inquiry.farmer._id.toString() === req.user._id.toString();

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this inquiry'
      });
    }

    return res.status(200).json({
      success: true,
      inquiry: formatInquiryDetail(inquiry)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving inquiry details'
    });
  }
};

/**
 * @desc    Update Inquiry status (Accept/Reject/Negotiate/Complete)
 * @route   PUT /api/inquiries/:id
 * @access  Private (Farmer role only)
 */
const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    if (!newStatus || !String(newStatus).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Ownership check: Only farmer who owns the inquiry's lot can manage status
    if (inquiry.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this inquiry status'
      });
    }

    // Valid state transitions
    const validTransitions = {
      pending: ['negotiating', 'accepted', 'rejected'],
      negotiating: ['accepted', 'rejected'],
      accepted: ['completed'],
      rejected: [],
      completed: []
    };

    const currentStatus = inquiry.status;
    const allowed = validTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed: [${allowed.join(', ')}]`
      });
    }

    inquiry.status = newStatus;
    await inquiry.save();

    // Trigger notification to buyer if accepted or rejected
    if (newStatus === 'accepted') {
      createNotification({
        recipient: inquiry.buyer,
        type: 'inquiry_accepted',
        title: 'Inquiry Accepted',
        message: 'Your inquiry has been accepted.',
        relatedEntity: { entityType: 'Inquiry', entityId: inquiry._id }
      });
    } else if (newStatus === 'rejected') {
      createNotification({
        recipient: inquiry.buyer,
        type: 'inquiry_rejected',
        title: 'Inquiry Rejected',
        message: 'Your inquiry has been rejected.',
        relatedEntity: { entityType: 'Inquiry', entityId: inquiry._id }
      });
    }

    logActivity({
      user: req.user._id,
      action: `inquiry_${newStatus}`,
      entityType: 'Inquiry',
      entityId: inquiry._id,
      description: `Inquiry status changed to ${newStatus}`,
      metadata: { newStatus },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: `Inquiry status updated to ${newStatus}`,
      inquiry: {
        inquiryId: inquiry._id,
        status: inquiry.status,
        updatedAt: inquiry.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating inquiry status'
    });
  }
};

/**
 * @desc    Submit a counter-offer during inquiry negotiation
 * @route   PUT /api/inquiries/:id/offer
 * @access  Private (Buyer or Farmer participant)
 */
const counterOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { offeredPrice, quantityRequired, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    const price = Number(offeredPrice);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Offered price must be a positive number greater than zero'
      });
    }

    const qty = Number(quantityRequired);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity required must be a positive number greater than zero'
      });
    }

    const inquiry = await Inquiry.findById(id).populate('lot');
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Ownership check: must be either the inquiry buyer or inquiry farmer
    const isBuyer = inquiry.buyer.toString() === req.user._id.toString();
    const isFarmer = inquiry.farmer.toString() === req.user._id.toString();

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to negotiate on this inquiry'
      });
    }

    // Inquiries that are rejected or completed cannot receive new counter-offers
    if (['rejected', 'completed'].includes(inquiry.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot submit counter-offers on an inquiry with status '${inquiry.status}'`
      });
    }

    // Quantity cannot exceed lot's available quantity
    if (inquiry.lot && qty > inquiry.lot.quantity) {
      return res.status(400).json({
        success: false,
        message: `Quantity requested (${qty}) exceeds available lot quantity (${inquiry.lot.quantity})`
      });
    }

    // Update inquiry negotiation state
    inquiry.offeredPrice = price;
    inquiry.quantityRequired = qty;
    if (message !== undefined) {
      inquiry.message = String(message).trim();
    }
    inquiry.status = 'negotiating';

    inquiry.offers.push({
      sender: req.user._id,
      offeredPrice: price,
      quantityRequired: qty,
      message: message ? String(message).trim() : '',
      createdAt: new Date()
    });

    await inquiry.save();

    // Notify the other party
    const counterParty = isBuyer ? inquiry.farmer : inquiry.buyer;
    createNotification({
      recipient: counterParty,
      type: 'counter_offer',
      title: 'Counter Offer Received',
      message: 'New counter-offer received.',
      relatedEntity: { entityType: 'Inquiry', entityId: inquiry._id }
    });

    logActivity({
      user: req.user._id,
      action: 'counter_offer_submitted',
      entityType: 'Inquiry',
      entityId: inquiry._id,
      description: `Submitted counter-offer: ₹${price} for ${qty}`,
      metadata: { offeredPrice: price, quantityRequired: qty },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: 'Counter offer submitted successfully',
      inquiry: {
        inquiryId: inquiry._id,
        offeredPrice: inquiry.offeredPrice,
        quantityRequired: inquiry.quantityRequired,
        message: inquiry.message,
        status: inquiry.status,
        offersCount: inquiry.offers.length,
        updatedAt: inquiry.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting counter offer'
    });
  }
};

module.exports = {
  createInquiry,
  getMyInquiries,
  getFarmerInquiries,
  getSingleInquiry,
  updateInquiryStatus,
  counterOffer
};
