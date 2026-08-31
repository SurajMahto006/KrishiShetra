const mongoose = require('mongoose');
const TransportProfile = require('../models/TransportProfile');
const TransportRequest = require('../models/TransportRequest');
const Order = require('../models/Order');
const ProduceLot = require('../models/ProduceLot');

const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

const VALID_VEHICLE_TYPES = [
  'mini_truck',
  'pickup',
  'truck',
  'tractor',
  'tempo',
  'other'
];

/**
 * Generate sequential unique Request ID (KS-TRN-YYYY-XXXXXX)
 */
const generateRequestId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `KS-TRN-${currentYear}-`;

  const latest = await TransportRequest.findOne({
    requestId: new RegExp(`^${prefix}`)
  }).sort({ requestId: -1, createdAt: -1 });

  let nextSeq = 1;
  if (latest && latest.requestId) {
    const parts = latest.requestId.split('-');
    if (parts.length === 4) {
      const parsed = parseInt(parts[3], 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }
  }

  return `${prefix}${String(nextSeq).padStart(6, '0')}`;
};

/**
 * Format transport request for safe client responses
 */
const formatTransportRequestItem = (reqDoc) => {
  const order = reqDoc.order || {};
  const lot = reqDoc.lot || {};
  const farmer = reqDoc.farmer || {};
  const buyer = reqDoc.buyer || {};
  const transporter = reqDoc.transporter || {};

  return {
    requestId: reqDoc.requestId,
    orderId: order.orderId || (reqDoc.order ? reqDoc.order.orderId : ''),
    cropName: lot.cropName || order.cropName || '',
    cargoQuantity: reqDoc.cargoQuantity,
    cargoUnit: reqDoc.cargoUnit,
    vehicleType: reqDoc.vehicleType,
    transportFee: reqDoc.transportFee,
    status: reqDoc.status,
    pickupAddress: reqDoc.pickupAddress || {},
    deliveryAddress: reqDoc.deliveryAddress || {},
    farmerName: farmer.name || 'Verified Farmer',
    buyerName: buyer.name || 'Verified Buyer',
    transporterName: transporter.name || null,
    notes: reqDoc.notes || '',
    requestedAt: reqDoc.requestedAt,
    acceptedAt: reqDoc.acceptedAt || null,
    pickedUpAt: reqDoc.pickedUpAt || null,
    deliveredAt: reqDoc.deliveredAt || null,
    createdAt: reqDoc.createdAt,
    updatedAt: reqDoc.updatedAt
  };
};

/**
 * @desc    Create Transport Profile for authenticated Transporter
 * @route   POST /api/transport/profile
 * @access  Private (Transporter role only)
 */
const createProfile = async (req, res) => {
  try {
    const {
      driverName,
      phone,
      vehicleType,
      vehicleNumber,
      vehicleCapacity,
      capacityUnit,
      operatingState,
      operatingDistrict
    } = req.body;

    // 1. Validation
    if (!driverName || !String(driverName).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Driver name is required'
      });
    }

    if (!phone || !PHONE_REGEX.test(String(phone).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit Indian mobile number is required'
      });
    }

    if (!vehicleType || !VALID_VEHICLE_TYPES.includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid vehicleType. Allowed: [${VALID_VEHICLE_TYPES.join(', ')}]`
      });
    }

    if (!vehicleNumber || !String(vehicleNumber).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number is required'
      });
    }

    const capacityNum = Number(vehicleCapacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle capacity must be a positive number'
      });
    }

    // 2. Prevent duplicate profile
    const existing = await TransportProfile.findOne({ user: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Transport profile already exists for this account'
      });
    }

    // 3. Create profile
    const profile = await TransportProfile.create({
      user: req.user._id,
      driverName: String(driverName).trim(),
      phone: String(phone).trim(),
      vehicleType,
      vehicleNumber: String(vehicleNumber).trim().toUpperCase(),
      vehicleCapacity: capacityNum,
      capacityUnit: capacityUnit || 'ton',
      operatingState: operatingState ? String(operatingState).trim() : '',
      operatingDistrict: operatingDistrict ? String(operatingDistrict).trim() : '',
      isAvailable: true,
      verificationStatus: 'verified'
    });

    return res.status(201).json({
      success: true,
      message: 'Transport profile created successfully',
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
      message: 'Server error while creating transport profile'
    });
  }
};

/**
 * @desc    Get Transport Profile for authenticated Transporter
 * @route   GET /api/transport/profile
 * @access  Private (Transporter role only)
 */
const getProfile = async (req, res) => {
  try {
    const profile = await TransportProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Transport profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving transport profile'
    });
  }
};

/**
 * @desc    Update Availability status for authenticated Transporter
 * @route   PUT /api/transport/availability
 * @access  Private (Transporter role only)
 */
const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAvailable must be a boolean (true or false)'
      });
    }

    const profile = await TransportProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Transport profile not found'
      });
    }

    profile.isAvailable = isAvailable;
    await profile.save();

    return res.status(200).json({
      success: true,
      message: `Availability updated to ${isAvailable}`,
      isAvailable: profile.isAvailable
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating availability'
    });
  }
};

/**
 * @desc    Create a Transport Request for a confirmed Order
 * @route   POST /api/transport/requests
 * @access  Private (Buyer or Farmer)
 */
const createTransportRequest = async (req, res) => {
  try {
    const { orderId, pickupAddress, deliveryAddress, vehicleType, notes, transportFee } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // 1. Resolve order
    let orderQuery = {};
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      orderQuery.$or = [{ orderId }, { _id: orderId }];
    } else {
      orderQuery.orderId = orderId;
    }

    const order = await Order.findOne(orderQuery);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // 2. Ownership verification
    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isFarmer = order.farmer.toString() === req.user._id.toString();

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create a transport request for this order'
      });
    }

    // 3. Order status check
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot create transport request for a cancelled order'
      });
    }

    // 4. Duplicate check
    const existingReq = await TransportRequest.findOne({
      order: order._id,
      status: { $ne: 'cancelled' }
    });

    if (existingReq) {
      return res.status(409).json({
        success: false,
        message: 'A transport request already exists for this order'
      });
    }

    // 5. Addresses cleanup & validation
    const cleanPickup = pickupAddress && typeof pickupAddress === 'object' ? { ...pickupAddress } : {};
    const cleanDelivery = deliveryAddress && typeof deliveryAddress === 'object'
      ? { ...deliveryAddress }
      : (order.deliveryAddress ? order.deliveryAddress.toObject() : {});

    if (cleanPickup.phone && !PHONE_REGEX.test(String(cleanPickup.phone).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup phone number'
      });
    }

    if (cleanDelivery.phone && !PHONE_REGEX.test(String(cleanDelivery.phone).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery phone number'
      });
    }

    if (cleanPickup.pincode && !PINCODE_REGEX.test(String(cleanPickup.pincode).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup pincode'
      });
    }

    if (cleanDelivery.pincode && !PINCODE_REGEX.test(String(cleanDelivery.pincode).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery pincode'
      });
    }

    // 6. Generate request ID
    const requestId = await generateRequestId();

    // 7. Create Transport Request
    const transportReq = await TransportRequest.create({
      requestId,
      order: order._id,
      lot: order.lot,
      buyer: order.buyer,
      farmer: order.farmer,
      pickupAddress: cleanPickup,
      deliveryAddress: cleanDelivery,
      cargoQuantity: order.quantity,
      cargoUnit: order.quantityUnit,
      vehicleType: vehicleType && VALID_VEHICLE_TYPES.includes(vehicleType) ? vehicleType : 'truck',
      transportFee: transportFee !== undefined && !isNaN(Number(transportFee)) ? Number(transportFee) : 0,
      status: 'requested',
      notes: notes ? String(notes).trim() : ''
    });

    return res.status(201).json({
      success: true,
      message: 'Transport request created successfully',
      request: formatTransportRequestItem(transportReq)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A transport request already exists for this order'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while creating transport request'
    });
  }
};

/**
 * @desc    Get Available Transport Jobs for Transporters
 * @route   GET /api/transport/requests/available
 * @access  Private (Transporter role only)
 */
const getAvailableRequests = async (req, res) => {
  try {
    const { page, limit, district, vehicleType } = req.query;

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
          message: 'Invalid limit parameter'
        });
      }
    }

    const filter = {
      status: { $in: ['requested', 'pickup_ready'] },
      transporter: null
    };

    if (district && String(district).trim()) {
      const distRegex = new RegExp(String(district).trim(), 'i');
      filter.$or = [
        { 'pickupAddress.district': distRegex },
        { 'deliveryAddress.district': distRegex }
      ];
    }

    if (vehicleType && VALID_VEHICLE_TYPES.includes(vehicleType)) {
      filter.vehicleType = vehicleType;
    }

    const skip = (pageNum - 1) * limitNum;
    const total = await TransportRequest.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const requests = await TransportRequest.find(filter)
      .populate('order', 'orderId cropName variety totalAmount')
      .populate('lot', 'cropName variety photos')
      .populate('farmer', 'name')
      .populate('buyer', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formatted = requests.map(formatTransportRequestItem);

    return res.status(200).json({
      success: true,
      count: formatted.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      },
      requests: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving available transport requests'
    });
  }
};

/**
 * @desc    Accept a transport job (Atomic assignment)
 * @route   PUT /api/transport/requests/:requestId/accept
 * @access  Private (Transporter role only)
 */
const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    // 1. Verify transporter profile
    const profile = await TransportProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Transport profile not found. Please complete profile first.'
      });
    }

    if (profile.verificationStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Unverified or rejected transporter cannot accept jobs'
      });
    }

    if (!profile.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Transporter is currently marked as unavailable'
      });
    }

    // 2. Atomic find & update to prevent race conditions
    let query = {
      status: { $in: ['requested', 'pickup_ready'] },
      transporter: null
    };

    if (mongoose.Types.ObjectId.isValid(requestId)) {
      query._id = requestId;
    } else {
      query.requestId = requestId;
    }

    const updated = await TransportRequest.findOneAndUpdate(
      query,
      {
        $set: {
          transporter: req.user._id,
          status: 'accepted',
          acceptedAt: new Date()
        }
      },
      { new: true }
    )
      .populate('order', 'orderId cropName')
      .populate('farmer', 'name')
      .populate('buyer', 'name');

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Transport request is either already accepted, cancelled, or not found'
      });
    }

    // 3. Mark transporter unavailable
    profile.isAvailable = false;
    await profile.save();

    // 4. Update Order delivery status
    await Order.findByIdAndUpdate(updated.order, { deliveryStatus: 'ready_for_pickup' });

    return res.status(200).json({
      success: true,
      message: 'Transport job accepted successfully',
      request: formatTransportRequestItem(updated)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while accepting transport job'
    });
  }
};

/**
 * @desc    Get Transport Jobs assigned to the authenticated Transporter
 * @route   GET /api/transport/requests/my
 * @access  Private (Transporter role only)
 */
const getMyJobs = async (req, res) => {
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
          message: 'Invalid limit parameter'
        });
      }
    }

    const filter = { transporter: req.user._id };
    if (status && String(status).trim()) {
      filter.status = String(status).trim();
    }

    const skip = (pageNum - 1) * limitNum;
    const total = await TransportRequest.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const requests = await TransportRequest.find(filter)
      .populate('order', 'orderId cropName variety totalAmount')
      .populate('farmer', 'name')
      .populate('buyer', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formatted = requests.map(formatTransportRequestItem);

    return res.status(200).json({
      success: true,
      count: formatted.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      },
      requests: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving transporter jobs'
    });
  }
};

/**
 * @desc    Get Transport Requests for authenticated Farmer
 * @route   GET /api/transport/requests/farmer
 * @access  Private (Farmer role only)
 */
const getFarmerRequests = async (req, res) => {
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
          message: 'Invalid limit parameter'
        });
      }
    }

    const filter = { farmer: req.user._id };
    if (status && String(status).trim()) {
      filter.status = String(status).trim();
    }

    const skip = (pageNum - 1) * limitNum;
    const total = await TransportRequest.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const requests = await TransportRequest.find(filter)
      .populate('order', 'orderId cropName variety totalAmount')
      .populate('buyer', 'name')
      .populate('transporter', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formatted = requests.map(formatTransportRequestItem);

    return res.status(200).json({
      success: true,
      count: formatted.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      },
      requests: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving farmer transport requests'
    });
  }
};

/**
 * @desc    Get Transport Requests for authenticated Buyer
 * @route   GET /api/transport/requests/buyer
 * @access  Private (Buyer role only)
 */
const getBuyerRequests = async (req, res) => {
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
          message: 'Invalid limit parameter'
        });
      }
    }

    const filter = { buyer: req.user._id };
    if (status && String(status).trim()) {
      filter.status = String(status).trim();
    }

    const skip = (pageNum - 1) * limitNum;
    const total = await TransportRequest.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const requests = await TransportRequest.find(filter)
      .populate('order', 'orderId cropName variety totalAmount')
      .populate('farmer', 'name')
      .populate('transporter', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formatted = requests.map(formatTransportRequestItem);

    return res.status(200).json({
      success: true,
      count: formatted.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      },
      requests: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving buyer transport requests'
    });
  }
};

/**
 * @desc    Get Single Transport Request details
 * @route   GET /api/transport/requests/:requestId
 * @access  Private (Buyer, Farmer, or assigned Transporter)
 */
const getSingleRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(requestId)) {
      query.$or = [{ requestId }, { _id: requestId }];
    } else {
      query.requestId = requestId;
    }

    const request = await TransportRequest.findOne(query)
      .populate('order', 'orderId cropName variety totalAmount status deliveryStatus')
      .populate('lot', 'cropName variety photos storageLocation')
      .populate('farmer', 'name phone')
      .populate('buyer', 'name phone')
      .populate('transporter', 'name phone');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Transport request not found'
      });
    }

    // Ownership check: must be buyer, farmer, or assigned transporter
    const isBuyer = request.buyer && request.buyer._id.toString() === req.user._id.toString();
    const isFarmer = request.farmer && request.farmer._id.toString() === req.user._id.toString();
    const isTransporter = request.transporter && request.transporter._id.toString() === req.user._id.toString();

    if (!isBuyer && !isFarmer && !isTransporter) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this transport request'
      });
    }

    return res.status(200).json({
      success: true,
      request: formatTransportRequestItem(request)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving transport request'
    });
  }
};

/**
 * @desc    Update Transport progress status
 * @route   PUT /api/transport/requests/:requestId/status
 * @access  Private (Assigned Transporter only)
 */
const updateTransportStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status: newStatus } = req.body;

    if (!newStatus || !String(newStatus).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    let query = {};
    if (mongoose.Types.ObjectId.isValid(requestId)) {
      query.$or = [{ requestId }, { _id: requestId }];
    } else {
      query.requestId = requestId;
    }

    const request = await TransportRequest.findOne(query);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Transport request not found'
      });
    }

    // Check that user is the assigned transporter
    if (!request.transporter || request.transporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned transporter can update progress status'
      });
    }

    const validTransitions = {
      accepted: ['pickup_ready'],
      pickup_ready: ['picked_up'],
      picked_up: ['in_transit'],
      in_transit: ['delivered'],
      delivered: [],
      cancelled: []
    };

    const currentStatus = request.status;
    const allowed = validTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed: [${allowed.join(', ')}]`
      });
    }

    request.status = newStatus;
    if (newStatus === 'picked_up') {
      request.pickedUpAt = new Date();
      await Order.findByIdAndUpdate(request.order, { deliveryStatus: 'picked_up', status: 'ready_for_pickup' });
    } else if (newStatus === 'in_transit') {
      await Order.findByIdAndUpdate(request.order, { deliveryStatus: 'in_transit', status: 'in_transit' });
    } else if (newStatus === 'delivered') {
      request.deliveredAt = new Date();
      await Order.findByIdAndUpdate(request.order, { deliveryStatus: 'delivered', status: 'delivered' });
      // Free transporter availability
      await TransportProfile.findOneAndUpdate({ user: req.user._id }, { isAvailable: true });
    } else if (newStatus === 'pickup_ready') {
      await Order.findByIdAndUpdate(request.order, { deliveryStatus: 'ready_for_pickup' });
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: `Transport status updated to ${newStatus}`,
      request: formatTransportRequestItem(request)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating transport status'
    });
  }
};

/**
 * @desc    Cancel a Transport Request
 * @route   PUT /api/transport/requests/:requestId/cancel
 * @access  Private (Buyer, Farmer, or assigned Transporter)
 */
const cancelTransportRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(requestId)) {
      query.$or = [{ requestId }, { _id: requestId }];
    } else {
      query.requestId = requestId;
    }

    const request = await TransportRequest.findOne(query);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Transport request not found'
      });
    }

    // Ownership check
    const isBuyer = request.buyer && request.buyer.toString() === req.user._id.toString();
    const isFarmer = request.farmer && request.farmer.toString() === req.user._id.toString();
    const isTransporter = request.transporter && request.transporter.toString() === req.user._id.toString();

    if (!isBuyer && !isFarmer && !isTransporter) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this transport request'
      });
    }

    if (request.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Delivered transport requests cannot be cancelled'
      });
    }

    if (request.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Transport request is already cancelled'
      });
    }

    request.status = 'cancelled';
    await request.save();

    // If transporter was assigned, free up availability
    if (request.transporter) {
      await TransportProfile.findOneAndUpdate({ user: request.transporter }, { isAvailable: true });
    }

    return res.status(200).json({
      success: true,
      message: 'Transport request cancelled successfully',
      request: formatTransportRequestItem(request)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while cancelling transport request'
    });
  }
};

module.exports = {
  createProfile,
  getProfile,
  updateAvailability,
  createTransportRequest,
  getAvailableRequests,
  acceptRequest,
  getMyJobs,
  getFarmerRequests,
  getBuyerRequests,
  getSingleRequest,
  updateTransportStatus,
  cancelTransportRequest
};
