const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const transportController = require('../controllers/transport.controller');

// All transport routes require JWT authentication
router.use(protect);

// 1. Transporter Profile APIs
router.post('/profile', authorize('transporter'), transportController.createProfile);
router.get('/profile', authorize('transporter'), transportController.getProfile);
router.put('/availability', authorize('transporter'), transportController.updateAvailability);

// 2. Transport Request Creation (Buyer or Farmer)
router.post('/requests', authorize('buyer', 'farmer'), transportController.createTransportRequest);

// 3. Transport Request Feeds
router.get('/requests/available', authorize('transporter'), transportController.getAvailableRequests);
router.get('/requests/my', authorize('transporter'), transportController.getMyJobs);
router.get('/requests/farmer', authorize('farmer'), transportController.getFarmerRequests);
router.get('/requests/buyer', authorize('buyer'), transportController.getBuyerRequests);

// 4. Request Operations (Accept, Update Status, Details, Cancel)
router.get('/requests/:requestId', transportController.getSingleRequest);
router.put('/requests/:requestId/accept', authorize('transporter'), transportController.acceptRequest);
router.put('/requests/:requestId/status', authorize('transporter'), transportController.updateTransportStatus);
router.put('/requests/:requestId/cancel', transportController.cancelTransportRequest);

module.exports = router;
