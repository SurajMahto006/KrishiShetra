const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const offerController = require('../controllers/offer.controller');

// All offer routes require authentication
router.use(protect);

// Buyer endpoints
router.post('/', authorize('buyer'), offerController.createOffer);
router.get('/my', authorize('buyer'), offerController.getMyOffers);
router.put('/:offerId/cancel', authorize('buyer'), offerController.cancelOffer);

// Farmer endpoints
router.get('/received', authorize('farmer'), offerController.getReceivedOffers);
router.put('/:offerId/accept', authorize('farmer'), offerController.acceptOffer);
router.put('/:offerId/reject', authorize('farmer'), offerController.rejectOffer);

module.exports = router;
