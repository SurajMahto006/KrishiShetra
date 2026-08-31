const mongoose = require('mongoose');
const Order = require('../models/Order');
const Inquiry = require('../models/Inquiry');
const ProduceLot = require('../models/ProduceLot');

const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

/**
 * Generate unique sequential Order ID (KS-ORD-YYYY-XXXXXX)
 */
const generateOrderId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `KS-ORD-${currentYear}-`;

  const latestOrder = await Order.findOne({
    orderId: new RegExp(`^${prefix}`)
  }).sort({ orderId: -1, createdAt: -1 });

  let nextSequence = 1;
  if (latestOrder && latestOrder.orderId) {
    const parts = latestOrder.orderId.split('-');
    if (parts.length === 4) {
      const parsedNum = parseInt(parts[3], 10);
      if (!isNaN(parsedNum)) {
        nextSequence = parsedNum + 1;
      }
    }
  }

  return `${prefix}${String(nextSequence).padStart(6, '0')}`;
};

/**
 * Format order item for list responses
 */
const formatOrderListItem = (order) => {
  const lot = order.lot || {};
  const farmerProfile = lot.farmer || {};
  const farmerUser = order.farmer || {};
  const buyerUser = order.buyer || {};

  return {
    orderId: order.orderId,
    cropName: order.cropName,
    variety: order.variety,
    quantity: order.quantity,
    quantityUnit: order.quantityUnit,
    agreedPrice: order.agreedPrice,
    priceUnit: order.priceUnit,
    totalAmount: order.totalAmount,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    farmerName: farmerProfile.farmName || farmerUser.name || 'Verified Farmer',
    buyerName: buyerUser.name || 'Verified Buyer',
    deliveryAddress: order.deliveryAddress || {},
    notes: order.notes || '',
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
};

/**
 * Format complete order detail
 */
const formatOrderDetail = (order) => {
  const lot = order.lot || {};
  const farmerProfile = lot.farmer || {};
  const farmerUser = order.farmer || {};
  const buyerUser = order.buyer || {};

  return {
    orderId: order.orderId,
    inquiryId: order.inquiry ? (order.inquiry._id || order.inquiry) : null,
    cropName: order.cropName,
    variety: order.variety,
    quantity: order.quantity,
    quantityUnit: order.quantityUnit,
    agreedPrice: order.agreedPrice,
    priceUnit: order.priceUnit,
    totalAmount: order.totalAmount,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    deliveryAddress: order.deliveryAddress || {},
    notes: order.notes || '',
    farmer: {
      farmName: farmerProfile.farmName || 'Verified Farm',
      farmerName: farmerUser.name || 'Verified Farmer'
    },
    buyer: {
      buyerName: buyerUser.name || 'Verified Buyer'
    },
    cancelledBy: order.cancelledBy || null,
    cancellationReason: order.cancellationReason || '',
    cancelledAt: order.cancelledAt || null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
};

/**
 * @desc    Create a new Order from an accepted Inquiry
 * @route   POST /api/orders
 * @access  Private (Buyer role only)
 */
const createOrder = async (req, res) => {
  let session = null;
  let useTransaction = false;

  try {
    const { inquiryId, quantity, deliveryAddress, paymentMethod, notes } = req.body;

    // 1. Validate inquiryId
    if (!inquiryId || !mongoose.Types.ObjectId.isValid(inquiryId)) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // 2. Fetch Inquiry and check ownership + accepted status
    const inquiry = await Inquiry.findById(inquiryId).populate('lot');
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    if (inquiry.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create an order for this inquiry'
      });
    }

    if (inquiry.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Inquiry must be accepted before creating an order'
      });
    }

    // 3. Prevent duplicate order creation for the same inquiry
    const existingOrder = await Order.findOne({ inquiry: inquiryId });
    if (existingOrder || inquiry.order) {
      return res.status(409).json({
        success: false,
        message: 'An order already exists for this inquiry'
      });
    }

    // 4. Validate Produce Lot
    const lot = inquiry.lot || (await ProduceLot.findById(inquiry.lot));
    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Produce lot not found'
      });
    }

    if (lot.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Produce lot is currently ${lot.status}`
      });
    }

    const availableQty =
      lot.availableQuantity !== undefined && lot.availableQuantity !== null
        ? lot.availableQuantity
        : lot.quantity;

    // Determine order quantity (from request body if valid, else from accepted inquiry)
    let orderQty = inquiry.quantityRequired;
    if (quantity !== undefined && quantity !== null && quantity !== '') {
      const qNum = Number(quantity);
      if (isNaN(qNum) || qNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a positive number greater than zero'
        });
      }
      orderQty = qNum;
    }

    if (orderQty > availableQty) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${orderQty}) exceeds available lot quantity (${availableQty})`
      });
    }

    // 5. Validate Delivery Address if provided
    const cleanAddress = deliveryAddress && typeof deliveryAddress === 'object' ? { ...deliveryAddress } : {};
    if (cleanAddress.phone) {
      const phone = String(cleanAddress.phone).trim();
      if (!PHONE_REGEX.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid delivery phone number (must be a valid 10-digit Indian mobile number)'
        });
      }
    }

    if (cleanAddress.pincode) {
      const pin = String(cleanAddress.pincode).trim();
      if (!PINCODE_REGEX.test(pin)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid delivery pincode (must be a valid 6-digit Indian postal code)'
        });
      }
    }

    // 6. Server-side price and total calculation
    const agreedPrice = Number(inquiry.offeredPrice);
    const totalAmount = Number((agreedPrice * orderQty).toFixed(2));

    // 7. Payment method
    const validPaymentMethods = ['cod', 'online', 'offline'];
    const chosenPaymentMethod = paymentMethod && validPaymentMethods.includes(paymentMethod)
      ? paymentMethod
      : 'cod';

    // 8. Generate sequential Order ID
    const orderId = await generateOrderId();

    // 9. Session transaction handling
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    } catch (sessionErr) {
      session = null;
      useTransaction = false;
    }

    const sessionOpts = session && useTransaction ? { session } : {};

    // 10. Atomically decrement lot availability
    const updatedLot = await ProduceLot.findOneAndUpdate(
      {
        _id: lot._id,
        status: 'active',
        $or: [
          { availableQuantity: { $gte: orderQty } },
          { availableQuantity: { $exists: false }, quantity: { $gte: orderQty } }
        ]
      },
      {
        $inc: { availableQuantity: -orderQty }
      },
      { new: true, ...sessionOpts }
    );

    if (!updatedLot) {
      if (session && useTransaction) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available quantity or lot is no longer active'
      });
    }

    // If remaining available quantity is 0, mark as sold
    if (updatedLot.availableQuantity <= 0) {
      await ProduceLot.findByIdAndUpdate(lot._id, { status: 'sold' }, sessionOpts);
    }

    // 11. Create Order document
    const createdOrders = await Order.create(
      [
        {
          orderId,
          inquiry: inquiry._id,
          lot: lot._id,
          buyer: inquiry.buyer,
          farmer: inquiry.farmer,
          cropName: lot.cropName,
          variety: lot.variety,
          quantity: orderQty,
          quantityUnit: lot.quantityUnit,
          agreedPrice,
          priceUnit: lot.priceUnit,
          totalAmount,
          deliveryAddress: cleanAddress,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: chosenPaymentMethod,
          notes: notes ? String(notes).trim() : ''
        }
      ],
      sessionOpts
    );

    const order = createdOrders[0];

    // 12. Update Inquiry status to completed
    inquiry.order = order._id;
    inquiry.status = 'completed';
    await inquiry.save(sessionOpts);

    if (session && useTransaction) {
      await session.commitTransaction();
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        orderId: order.orderId,
        cropName: order.cropName,
        variety: order.variety,
        quantity: order.quantity,
        quantityUnit: order.quantityUnit,
        agreedPrice: order.agreedPrice,
        priceUnit: order.priceUnit,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod
      }
    });
  } catch (error) {
    if (session && useTransaction) {
      try {
        await session.abortTransaction();
      } catch (_) {}
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An order already exists for this inquiry'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

/**
 * @desc    Get all orders for authenticated Buyer
 * @route   GET /api/orders/my
 * @access  Private (Buyer role only)
 */
const getMyOrders = async (req, res) => {
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

    let limitNum = 10;
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
    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const rawOrders = await Order.find(filter)
      .populate({
        path: 'lot',
        select: 'lotId farmer',
        populate: {
          path: 'farmer',
          select: 'farmName'
        }
      })
      .populate({
        path: 'farmer',
        select: 'name'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formattedOrders = rawOrders.map(formatOrderListItem);

    return res.status(200).json({
      success: true,
      count: formattedOrders.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      },
      orders: formattedOrders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving buyer orders'
    });
  }
};

/**
 * @desc    Get all orders for authenticated Farmer
 * @route   GET /api/orders/farmer
 * @access  Private (Farmer role only)
 */
const getFarmerOrders = async (req, res) => {
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

    let limitNum = 10;
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
    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const rawOrders = await Order.find(filter)
      .populate({
        path: 'buyer',
        select: 'name'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formattedOrders = rawOrders.map(formatOrderListItem);

    return res.status(200).json({
      success: true,
      count: formattedOrders.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      },
      orders: formattedOrders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving farmer orders'
    });
  }
};

/**
 * @desc    Get single order details by Order ID
 * @route   GET /api/orders/:orderId
 * @access  Private (Order buyer or farmer only)
 */
const getSingleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      query.$or = [{ orderId }, { _id: orderId }];
    } else {
      query.orderId = orderId;
    }

    const order = await Order.findOne(query)
      .populate({
        path: 'lot',
        select: 'lotId cropName variety qualityGrade storageType storageLocation state district photos status farmer',
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
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Ownership check: must be either the order's buyer or farmer
    const isBuyer = order.buyer && order.buyer._id.toString() === req.user._id.toString();
    const isFarmer = order.farmer && order.farmer._id.toString() === req.user._id.toString();

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order'
      });
    }

    return res.status(200).json({
      success: true,
      order: formatOrderDetail(order)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving order details'
    });
  }
};

/**
 * @desc    Update Order status by Farmer
 * @route   PUT /api/orders/:orderId/status
 * @access  Private (Farmer role only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status: newStatus } = req.body;

    if (!newStatus || !String(newStatus).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    let query = {};
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      query.$or = [{ orderId }, { _id: orderId }];
    } else {
      query.orderId = orderId;
    }

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Farmer ownership check
    if (order.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this order status'
      });
    }

    // Allowed status transitions for farmer
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['ready_for_pickup', 'cancelled'],
      ready_for_pickup: ['in_transit'],
      in_transit: ['delivered'],
      delivered: [],
      cancelled: []
    };

    const currentStatus = order.status;
    const allowed = validTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed: [${allowed.join(', ')}]`
      });
    }

    order.status = newStatus;
    if (newStatus === 'cancelled') {
      order.cancelledBy = req.user._id;
      order.cancelledAt = new Date();
      // Restore quantity to lot
      await ProduceLot.findByIdAndUpdate(order.lot, {
        $inc: { availableQuantity: order.quantity },
        $set: { status: 'active' }
      });
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      order: {
        orderId: order.orderId,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};

/**
 * @desc    Cancel order by Buyer and restore reserved inventory
 * @route   PUT /api/orders/:orderId/cancel
 * @access  Private (Buyer role only)
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      query.$or = [{ orderId }, { _id: orderId }];
    } else {
      query.orderId = orderId;
    }

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Buyer ownership check
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this order'
      });
    }

    // Cannot cancel delivered or already cancelled orders
    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Delivered orders cannot be cancelled'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    order.status = 'cancelled';
    order.cancelledBy = req.user._id;
    order.cancelledAt = new Date();
    await order.save();

    // Restore reserved quantity to ProduceLot and mark active if was sold
    await ProduceLot.findByIdAndUpdate(order.lot, {
      $inc: { availableQuantity: order.quantity },
      $set: { status: 'active' }
    });

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        cancelledAt: order.cancelledAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
};

/**
 * @desc    Update payment status
 * @route   PUT /api/orders/:orderId/payment-status
 * @access  Private (Farmer or Admin)
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const allowedPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!paymentStatus || !allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Allowed: [${allowedPaymentStatuses.join(', ')}]`
      });
    }

    let query = {};
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      query.$or = [{ orderId }, { _id: orderId }];
    } else {
      query.orderId = orderId;
    }

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Farmer or Admin or Buyer check
    const isFarmer = order.farmer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isBuyer = order.buyer.toString() === req.user._id.toString();

    if (!isFarmer && !isAdmin && !isBuyer) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update payment status for this order'
      });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      order: {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating payment status'
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getFarmerOrders,
  getSingleOrder,
  updateOrderStatus,
  cancelOrder,
  updatePaymentStatus
};
