const mongoose = require('mongoose');
const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const { createNotification } = require('../services/notification.service');
const { logActivity } = require('../services/activity.service');

const DEMO_ORDER_ID = 'KS-ORD-DEMO-001';
const DEMO_DISPUTE_ID = 'KS-DSP-DEMO-001';

// Seed demo dispute scenario state (Farmer + Buyer authorized, FPO/Admin mediation)
let demoDisputeState = {
  _id: '660000000000000000000999',
  disputeId: DEMO_DISPUTE_ID,
  orderId: DEMO_ORDER_ID,
  cropName: 'Tomato',
  quantity: 50,
  quantityUnit: 'Qtl',
  orderAmount: 125000,
  reason: 'Quality Mismatch',
  description: 'Received produce does not match the agreed quality specification.',
  status: 'Under Review',
  raisedByRole: 'buyer',
  raisedBy: {
    _id: '660000000000000000000002',
    name: 'ABC Foods Pvt Ltd (Rajesh Patil)',
    role: 'buyer',
    email: 'procurement@abcfoods.in',
    phone: '+91 98230 45678'
  },
  counterparty: {
    _id: '660000000000000000000001',
    name: 'Nashik Farmer Producer Co (FPO)',
    role: 'farmer',
    email: 'farmer@krishishetra.in',
    phone: '+91 98765 43210'
  },
  paymentProtection: {
    isProtected: true,
    protectedAmount: 125000,
    statusText: 'Protected During Dispute'
  },
  timeline: [
    {
      status: 'Raised',
      title: 'Dispute Raised',
      note: 'Buyer opened dispute for Quality Mismatch. Payment protected.',
      actorRole: 'buyer',
      timestamp: new Date(Date.now() - 36 * 3600 * 1000)
    },
    {
      status: 'Evidence Submitted',
      title: 'Evidence Submitted',
      note: '2 inspection photos and quality lab report attached.',
      actorRole: 'buyer',
      timestamp: new Date(Date.now() - 34 * 3600 * 1000)
    },
    {
      status: 'Under Review',
      title: 'Under Review',
      note: 'Assigned to FPO / Admin mediation panel.',
      actorRole: 'fpo',
      timestamp: new Date(Date.now() - 12 * 3600 * 1000)
    }
  ],
  evidence: [
    {
      name: 'Batch_Inspection_Report.pdf',
      fileUrl: '',
      previewUrl: '',
      note: 'APMC quality grading certificate documenting grade divergence',
      uploadedAt: new Date(Date.now() - 34 * 3600 * 1000)
    },
    {
      name: 'Tomato_Delivery_Sample.jpg',
      fileUrl: '',
      previewUrl: 'assets/images/hero-farm.jpg',
      note: 'Photographic evidence taken at unloading dock',
      uploadedAt: new Date(Date.now() - 34 * 3600 * 1000)
    }
  ],
  resolution: {
    type: 'None',
    refundAmount: 0,
    comment: ''
  },
  createdAt: new Date(Date.now() - 36 * 3600 * 1000),
  updatedAt: new Date(Date.now() - 12 * 3600 * 1000)
};

/**
 * Generate sequential Dispute ID (KS-DISP-YYYY-XXXXXX)
 */
const generateDisputeId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `KS-DISP-${currentYear}-`;

  const latestDispute = await Dispute.findOne({
    disputeId: new RegExp(`^${prefix}`)
  }).sort({ disputeId: -1, createdAt: -1 });

  let nextSequence = 1;
  if (latestDispute && latestDispute.disputeId) {
    const parts = latestDispute.disputeId.split('-');
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
 * @desc    Create a new dispute for an order
 * @route   POST /api/disputes
 * @access  Private (Buyer / Farmer involved in the order)
 */
exports.createDispute = async (req, res) => {
  try {
    const { orderId, reason, description, evidence } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Dispute reason is required'
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Dispute description is required'
      });
    }

    // Find order by MongoDB ObjectId or orderId string
    let orderQuery = {};
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      orderQuery = { $or: [{ _id: orderId }, { orderId }] };
    } else {
      orderQuery = { orderId };
    }

    const order = await Order.findOne(orderQuery);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Server-side authorization: Authenticated user must be either buyer or farmer
    const userIdStr = req.user._id.toString();
    const buyerIdStr = order.buyer.toString();
    const farmerIdStr = order.farmer.toString();

    const isBuyer = userIdStr === buyerIdStr;
    const isFarmer = userIdStr === farmerIdStr;

    if (!isBuyer && !isFarmer && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to raise a dispute for this order'
      });
    }

    // Check if an active dispute already exists for this order
    const existingActiveDispute = await Dispute.findOne({
      order: order._id,
      status: { $in: ['Raised', 'Under Review', 'Mediation', 'Resolution Proposed'] }
    });

    if (existingActiveDispute) {
      return res.status(409).json({
        success: false,
        message: 'An active dispute already exists for this order',
        disputeId: existingActiveDispute.disputeId
      });
    }

    // Determine counterparty
    const counterpartyId = isBuyer ? order.farmer : order.buyer;
    const raisedByRole = req.user.role;

    // Generate unique dispute ID
    const disputeId = await generateDisputeId();

    // Prepare evidence array safely (client preview metadata without storing heavy binary)
    const formattedEvidence = [];
    if (Array.isArray(evidence)) {
      evidence.forEach((item) => {
        if (item && (item.name || item.previewUrl || item.fileUrl)) {
          formattedEvidence.push({
            name: item.name || 'Evidence Attachment',
            fileUrl: item.fileUrl || '',
            previewUrl: item.previewUrl || '',
            note: item.note || '',
            uploadedAt: new Date()
          });
        }
      });
    }

    // Build timeline
    const timeline = [
      {
        status: 'Raised',
        title: 'Dispute Raised',
        note: `Dispute opened for reason: ${reason}`,
        actor: req.user._id,
        actorRole: req.user.role,
        timestamp: new Date()
      }
    ];

    if (formattedEvidence.length > 0) {
      timeline.push({
        status: 'Evidence Submitted',
        title: 'Evidence Submitted',
        note: `${formattedEvidence.length} document/image evidence attached.`,
        actor: req.user._id,
        actorRole: req.user.role,
        timestamp: new Date()
      });
    }

    const dispute = await Dispute.create({
      disputeId,
      order: order._id,
      orderId: order.orderId,
      raisedBy: req.user._id,
      raisedByRole,
      counterparty: counterpartyId,
      cropName: order.cropName || '',
      quantity: order.quantity || 0,
      quantityUnit: order.quantityUnit || 'kg',
      orderAmount: order.totalAmount || 0,
      reason,
      description: description.trim(),
      evidence: formattedEvidence,
      status: 'Raised',
      paymentProtection: {
        isProtected: true,
        protectedAmount: order.totalAmount || 0,
        statusText: 'Protected During Dispute'
      },
      timeline
    });

    // Send notifications safely
    createNotification({
      recipient: counterpartyId,
      type: 'order_disputed',
      title: 'Dispute Raised on Order',
      message: `A dispute has been raised on Order #${order.orderId} for reason: ${reason}. Payment is protected.`,
      relatedEntity: { entityType: 'Dispute', entityId: dispute._id }
    });

    logActivity({
      user: req.user._id,
      action: 'dispute_raised',
      entityType: 'Dispute',
      entityId: dispute._id,
      description: `Raised dispute ${disputeId} on order ${order.orderId}`,
      metadata: { disputeId, orderId: order.orderId, reason },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Dispute raised successfully. Payment protection active.',
      dispute
    });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating dispute',
      error: error.message
    });
  }
};

/**
 * @desc    Get all disputes (filtered by role server-side)
 * @route   GET /api/disputes
 * @access  Private
 */
exports.getDisputes = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    let filter = {};

    // Authorization filter: Admin & FPO see all; others only see their own
    if (userRole === 'admin' || userRole === 'fpo') {
      // Admin/FPO can view all
    } else {
      filter.$or = [{ raisedBy: userId }, { counterparty: userId }];
    }

    // Optional query parameter filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.orderId) {
      filter.orderId = req.query.orderId;
    }
    if (req.query.reason) {
      filter.reason = req.query.reason;
    }

    let disputes = [];
    try {
      disputes = await Dispute.find(filter)
        .populate('raisedBy', 'name email role phone')
        .populate('counterparty', 'name email role phone')
        .populate('resolution.resolvedBy', 'name role')
        .sort({ createdAt: -1 });
    } catch (dbErr) {
      console.warn('DB query in getDisputes notice:', dbErr.message);
    }

    // Server-side authorization check for demo dispute KS-DSP-DEMO-001:
    // Authorized roles: buyer (as raisedBy), farmer (as counterparty), admin & fpo (as mediators)
    const isAuthorizedForDemo = ['buyer', 'farmer', 'admin', 'fpo'].includes(userRole);
    const alreadyHasDemo = disputes.some(d => d.disputeId === DEMO_DISPUTE_ID || d.orderId === DEMO_ORDER_ID);

    if (isAuthorizedForDemo && !alreadyHasDemo) {
      const matchesStatus = !req.query.status || req.query.status.toLowerCase() === demoDisputeState.status.toLowerCase();
      const matchesOrder = !req.query.orderId || req.query.orderId === demoDisputeState.orderId;
      const matchesReason = !req.query.reason || req.query.reason.toLowerCase() === demoDisputeState.reason.toLowerCase();

      if (matchesStatus && matchesOrder && matchesReason) {
        disputes.unshift(demoDisputeState);
      }
    }

    return res.status(200).json({
      success: true,
      count: disputes.length,
      disputes
    });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching disputes',
      error: error.message
    });
  }
};

/**
 * @desc    Get dispute by ID
 * @route   GET /api/disputes/:id
 * @access  Private
 */
exports.getDisputeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    // Handle demo dispute
    if (id === DEMO_DISPUTE_ID || id === DEMO_ORDER_ID || id === '660000000000000000000999') {
      // Server-side authorization: buyer, farmer, fpo, admin
      if (!['buyer', 'farmer', 'fpo', 'admin'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not authorized to view this dispute.'
        });
      }
      return res.status(200).json({
        success: true,
        dispute: demoDisputeState
      });
    }

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { disputeId: id }] };
    } else {
      query = { disputeId: id };
    }

    const dispute = await Dispute.findOne(query)
      .populate('order')
      .populate('raisedBy', 'name email role phone')
      .populate('counterparty', 'name email role phone')
      .populate('resolution.resolvedBy', 'name role')
      .populate('timeline.actor', 'name role');

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Server-side authorization check
    const userIdStr = req.user._id.toString();
    const raisedByStr = dispute.raisedBy ? dispute.raisedBy._id.toString() : '';
    const counterpartyStr = dispute.counterparty ? dispute.counterparty._id.toString() : '';

    if (
      userRole !== 'admin' &&
      userRole !== 'fpo' &&
      userIdStr !== raisedByStr &&
      userIdStr !== counterpartyStr
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to view this dispute.'
      });
    }

    return res.status(200).json({
      success: true,
      dispute
    });
  } catch (error) {
    console.error('Error fetching dispute by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching dispute',
      error: error.message
    });
  }
};

/**
 * @desc    Update dispute status (e.g., move to Under Review or Mediation)
 * @route   PATCH /api/disputes/:id/status
 * @access  Private (FPO / Admin)
 */
exports.updateDisputeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const allowedStatuses = [
      'Raised',
      'Under Review',
      'Mediation',
      'Resolution Proposed'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition. Allowed: ${allowedStatuses.join(', ')}`
      });
    }

    if (id === DEMO_DISPUTE_ID || id === DEMO_ORDER_ID || id === '660000000000000000000999') {
      demoDisputeState.status = status;
      demoDisputeState.timeline.push({
        status,
        title: `Status: ${status}`,
        note: note || `Dispute moved to ${status} by mediator`,
        actorRole: req.user.role,
        timestamp: new Date()
      });
      return res.status(200).json({
        success: true,
        message: `Dispute updated to ${status}`,
        dispute: demoDisputeState
      });
    }
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { disputeId: id }] };
    } else {
      query = { disputeId: id };
    }

    const dispute = await Dispute.findOne(query);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Check if already closed
    if (dispute.status === 'Resolved' || dispute.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a resolved or rejected dispute'
      });
    }

    dispute.status = status;
    dispute.timeline.push({
      status,
      title: `Status: ${status}`,
      note: note || `Dispute moved to ${status} by ${req.user.name || req.user.role}`,
      actor: req.user._id,
      actorRole: req.user.role,
      timestamp: new Date()
    });

    await dispute.save();

    return res.status(200).json({
      success: true,
      message: `Dispute updated to ${status}`,
      dispute
    });
  } catch (error) {
    console.error('Error updating dispute status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating dispute status',
      error: error.message
    });
  }
};

/**
 * @desc    Resolve dispute with decision
 * @route   POST /api/disputes/:id/resolve
 * @access  Private (Strictly FPO or Admin)
 */
exports.resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionType, refundAmount, comment } = req.body;

    const validResolutions = [
      'Mutual Settlement',
      'Partial Refund',
      'Return Batch',
      'Re-inspection',
      'Reject Dispute'
    ];

    if (!resolutionType || !validResolutions.includes(resolutionType)) {
      return res.status(400).json({
        success: false,
        message: `Valid resolutionType is required. Options: ${validResolutions.join(', ')}`
      });
    }

    if (id === DEMO_DISPUTE_ID || id === DEMO_ORDER_ID || id === '660000000000000000000999') {
      const isRejection = resolutionType === 'Reject Dispute';
      const finalStatus = isRejection ? 'Rejected' : 'Resolved';

      demoDisputeState.status = finalStatus;
      demoDisputeState.paymentProtection = {
        isProtected: false,
        protectedAmount: isRejection ? 0 : Number(refundAmount) || 0,
        statusText: isRejection
          ? 'Claim Rejected · Protection Released'
          : `Settled · ${resolutionType}`
      };
      demoDisputeState.resolution = {
        type: resolutionType,
        refundAmount: Number(refundAmount) || 0,
        comment: comment ? comment.trim() : '',
        resolvedBy: {
          name: req.user.name || 'Authorized FPO Mediator',
          role: req.user.role
        },
        resolvedAt: new Date()
      };
      demoDisputeState.timeline.push({
        status: finalStatus,
        title: `Resolved: ${resolutionType}`,
        note: comment ? comment.trim() : `Case concluded with outcome: ${resolutionType}`,
        actorRole: req.user.role,
        timestamp: new Date()
      });

      return res.status(200).json({
        success: true,
        message: `Dispute successfully marked as ${finalStatus}`,
        dispute: demoDisputeState
      });
    }

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { disputeId: id }] };
    } else {
      query = { disputeId: id };
    }

    const dispute = await Dispute.findOne(query);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    if (dispute.status === 'Resolved' || dispute.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'This dispute has already been concluded'
      });
    }

    const isRejection = resolutionType === 'Reject Dispute';
    const finalStatus = isRejection ? 'Rejected' : 'Resolved';

    dispute.status = finalStatus;

    // Simulated payment protection update
    dispute.paymentProtection = {
      isProtected: false,
      protectedAmount: isRejection ? 0 : Number(refundAmount) || 0,
      statusText: isRejection
        ? 'Claim Rejected · Protection Released'
        : `Settled · ${resolutionType}`
    };

    dispute.resolution = {
      type: resolutionType,
      refundAmount: Number(refundAmount) || 0,
      comment: comment ? comment.trim() : '',
      resolvedBy: req.user._id,
      resolvedAt: new Date()
    };

    dispute.timeline.push({
      status: finalStatus,
      title: `Resolved: ${resolutionType}`,
      note: comment
        ? comment.trim()
        : `Case closed with outcome: ${resolutionType}`,
      actor: req.user._id,
      actorRole: req.user.role,
      timestamp: new Date()
    });

    await dispute.save();

    // Notify parties safely
    const parties = [dispute.raisedBy, dispute.counterparty];
    parties.forEach((recipientId) => {
      if (recipientId) {
        createNotification({
          recipient: recipientId,
          type: 'dispute_resolved',
          title: `Dispute ${finalStatus}: ${dispute.disputeId}`,
          message: `The dispute on Order #${dispute.orderId} was concluded with outcome: ${resolutionType}.`,
          relatedEntity: { entityType: 'Dispute', entityId: dispute._id }
        });
      }
    });

    logActivity({
      user: req.user._id,
      action: 'dispute_resolved',
      entityType: 'Dispute',
      entityId: dispute._id,
      description: `Resolved dispute ${dispute.disputeId} with ${resolutionType}`,
      metadata: { disputeId: dispute.disputeId, resolutionType, refundAmount },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: `Dispute successfully marked as ${finalStatus}`,
      dispute
    });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while resolving dispute',
      error: error.message
    });
  }
};
