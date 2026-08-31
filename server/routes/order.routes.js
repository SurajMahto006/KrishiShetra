const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const orderController = require('../controllers/order.controller');

// All order endpoints require authentication
router.use(protect);

// Order creation (Buyer only)
router.post('/', authorize('buyer'), orderController.createOrder);

// Role-specific list endpoints
router.get('/my', authorize('buyer'), orderController.getMyOrders);
router.get('/farmer', authorize('farmer'), orderController.getFarmerOrders);

// Single order details
router.get('/:orderId', orderController.getSingleOrder);

// Status updates and cancellation
router.put('/:orderId/status', authorize('farmer'), orderController.updateOrderStatus);
router.put('/:orderId/cancel', authorize('buyer'), orderController.cancelOrder);
router.put('/:orderId/payment-status', orderController.updatePaymentStatus);

module.exports = router;
