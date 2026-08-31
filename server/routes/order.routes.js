const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const orderController = require('../controllers/order.controller');

// All order endpoints require JWT authentication
router.use(protect);

// Buyer order routes
router.post('/', authorize('buyer'), orderController.createOrderFromInquiry);
router.get('/my', authorize('buyer'), orderController.getMyOrders);

// Farmer order routes
router.get('/farmer', authorize('farmer'), orderController.getFarmerOrders);

// Operational order updates
router.get('/:orderId', orderController.getSingleOrder);
router.put('/:orderId/status', authorize('farmer'), orderController.updateOrderStatus);
router.put('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;
