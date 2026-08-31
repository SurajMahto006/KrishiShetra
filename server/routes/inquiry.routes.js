const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const inquiryController = require('../controllers/inquiry.controller');

// All inquiry endpoints require JWT authentication
router.use(protect);

// Buyer-only routes
router.post('/', authorize('buyer'), inquiryController.createInquiry);
router.get('/my', authorize('buyer'), inquiryController.getMyInquiries);

// Farmer-only routes
router.get('/farmer', authorize('farmer'), inquiryController.getFarmerInquiries);
router.put('/:id', authorize('farmer'), inquiryController.updateInquiryStatus);

// Shared participant routes (buyer or farmer of the inquiry)
router.get('/:id', inquiryController.getSingleInquiry);
router.put('/:id/offer', inquiryController.counterOffer);

module.exports = router;
