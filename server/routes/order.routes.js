const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const orderController = require('../controllers/order.controller');

// All order routes require authentication
router.use(protect);

// Order creation (Buyer or Farmer participating in inquiry)
router.post('/', orderController.createOrder);

// Role-specific list endpoints
router.get('/my', authorize('buyer'), orderController.getMyOrders);
router.get('/farmer', authorize('farmer'), orderController.getFarmerOrders);

// Single order details
router.get('/:orderId', orderController.getSingleOrder);

// Status updates
router.put('/:orderId/status', authorize('farmer'), orderController.updateOrderStatus);
router.put('/:orderId/payment-status', orderController.updatePaymentStatus);
router.put('/:orderId/delivery-status', authorize('farmer', 'transporter'), orderController.updateDeliveryStatus);
router.put('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;
