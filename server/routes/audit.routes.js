const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth.middleware');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');
const { verifyOrderOnChain, getConfig, queueAuditJob } = require('../services/evmAuditService');

/**
 * @desc    Diagnostic health of Sepolia audit service (Public check, NO private keys exposed)
 * @route   GET /api/audit/health
 * @access  Public
 */
router.get('/health', (req, res) => {
  const config = getConfig();
  res.status(200).json({
    success: true,
    service: 'KrishiShetra AI/ML Transaction Monitor & Sepolia Audit Ledger',
    targetNetwork: 'Ethereum Sepolia (Chain ID: 11155111)',
    isConfigured: config.isConfigured,
    rpcConfigured: Boolean(config.rpcUrl),
    contractConfigured: Boolean(config.contractAddress),
    contractAddress: config.contractAddress || 'UNCONFIGURED',
    signerConfigured: Boolean(config.privateKey)
  });
});

// All order-specific audit endpoints require authentication
router.use(protect);

/**
 * Helper to verify caller is farmer, buyer, or admin for the requested order
 * Strictly verifies against actual database records.
 */
async function verifyOrderAccess(orderId, userId, userRole) {
  let query = {};
  if (mongoose.Types.ObjectId.isValid(orderId)) {
    query.$or = [{ orderId }, { _id: orderId }];
  } else {
    query.orderId = orderId;
  }

  const order = await Order.findOne(query);
  if (!order) return { order: null, authorized: false };

  if (userRole === 'admin') return { order, authorized: true };

  const isBuyer = order.buyer && order.buyer.toString() === userId.toString();
  const isFarmer = order.farmer && order.farmer.toString() === userId.toString();

  return { order, authorized: Boolean(isBuyer || isFarmer) };
}

/**
 * @desc    Get explainable risk breakdown for an order
 * @route   GET /api/audit/order/:orderId/explain
 * @access  Private (Order Buyer, Farmer, or Admin)
 */
router.get('/order/:orderId/explain', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order, authorized } = await verifyOrderAccess(orderId, req.user._id, req.user.role);

    if (!order) {
      return res.status(404).json({
        success: false,
        code: 'ORDER_NOT_FOUND',
        message: `Order '${orderId}' was not found in the database`
      });
    }

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view the audit evaluation for this order'
      });
    }

    // Retrieve latest audit logs for this order
    let logs = await AuditLog.find({ orderId: order.orderId }).sort({ createdAt: -1 });

    if (!logs || logs.length === 0) {
      // Auto-initialize audit log for existing orders created before the audit hook was deployed
      const initialLog = await queueAuditJob(order, 'ORDER_CREATED');
      if (initialLog) {
        logs = [initialLog];
      } else {
        return res.status(200).json({
          success: true,
          orderId: order.orderId,
          status: 'INSUFFICIENT_DATA',
          message: 'No risk assessment generated yet for this order.',
          assessment: null
        });
      }
    }

    const latest = logs[0];

    // Return strictly non-sensitive audit explainability report
    return res.status(200).json({
      success: true,
      orderId: order.orderId,
      status: latest.outboxStatus,
      assessment: {
        engine: latest.riskAssessment.engine,
        score: latest.riskAssessment.score,
        level: latest.riskAssessment.level,
        riskHash: latest.riskAssessment.riskHash,
        assessedAt: latest.riskAssessment.assessedAt,
        factors: latest.riskAssessment.factors,
        canonicalPayloadHash: latest.canonicalPayloadHash,
        auditMetadata: {
          cropName: latest.canonicalPayload.cropName,
          quantity: latest.canonicalPayload.quantity,
          quantityUnit: latest.canonicalPayload.quantityUnit,
          totalAmount: latest.canonicalPayload.totalAmount,
          orderStatus: latest.canonicalPayload.status,
          paymentStatus: latest.canonicalPayload.paymentStatus
        }
      },
      reviewDecisions: latest.reviewDecisions || [],
      historyCount: logs.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving audit risk explanation'
    });
  }
});

/**
 * @desc    Verify tamper-evident audit trail on Ethereum Sepolia
 * @route   GET /api/audit/order/:orderId/verify
 * @access  Private (Order Buyer, Farmer, or Admin)
 */
router.get('/order/:orderId/verify', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order, authorized } = await verifyOrderAccess(orderId, req.user._id, req.user.role);

    if (!order) {
      return res.status(404).json({
        success: false,
        code: 'ORDER_NOT_FOUND',
        message: `Order '${orderId}' was not found in the database`
      });
    }

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to verify this order on the audit ledger'
      });
    }

    // Ensure audit record exists prior to verification
    const logCount = await AuditLog.countDocuments({ orderId: order.orderId });
    if (logCount === 0) {
      await queueAuditJob(order, 'ORDER_CREATED');
    }

    const report = await verifyOrderOnChain(order.orderId);

    return res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error verifying on-chain audit proof'
    });
  }
});

/**
 * @desc    Append manual audit review decision without altering baseline algorithm
 * @route   POST /api/audit/order/:orderId/review
 * @access  Private (Admin role only)
 */
router.post('/order/:orderId/review', authorize('admin'), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { decision, comment } = req.body;

    const validDecisions = ['VERIFIED_SAFE', 'REQUIRES_MONITORING', 'SUSPECT_FLAGGED', 'NOTE_ADDED'];
    if (!decision || !validDecisions.includes(decision)) {
      return res.status(400).json({
        success: false,
        message: `Invalid review decision. Allowed: [${validDecisions.join(', ')}]`
      });
    }

    const latestLog = await AuditLog.findOne({ orderId }).sort({ createdAt: -1 });
    if (!latestLog) {
      return res.status(404).json({
        success: false,
        message: 'No audit records found for this order to attach review'
      });
    }

    latestLog.reviewDecisions.push({
      reviewer: req.user._id,
      reviewerRole: req.user.role,
      decision,
      comment: comment ? String(comment).trim() : '',
      timestamp: new Date()
    });

    await latestLog.save();

    return res.status(200).json({
      success: true,
      message: 'Audit review decision recorded successfully',
      reviewDecisions: latestLog.reviewDecisions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error recording audit review'
    });
  }
});

module.exports = router;
