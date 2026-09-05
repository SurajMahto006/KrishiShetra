const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const disputeController = require('../controllers/dispute.controller');

// All dispute endpoints require authentication
router.use(protect);

// Create dispute (Buyer or Farmer, validated server-side against order)
router.post('/', disputeController.createDispute);

// Get disputes (filtered server-side: Admin/FPO see all, users see their own)
router.get('/', disputeController.getDisputes);

// Single dispute details
router.get('/:id', disputeController.getDisputeById);

// Update dispute status (FPO and Admin mediation workflow)
router.patch('/:id/status', authorize('admin', 'fpo'), disputeController.updateDisputeStatus);

// Conclude & resolve dispute with formal decision (FPO and Admin only)
router.post('/:id/resolve', authorize('admin', 'fpo'), disputeController.resolveDispute);

module.exports = router;
