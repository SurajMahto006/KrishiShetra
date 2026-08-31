const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const buyerController = require('../controllers/buyer.controller');

// All buyer routes require authenticated user with 'buyer' role
router.use(protect);
router.use(authorize('buyer'));

router
  .route('/profile')
  .post(buyerController.createBuyerProfile)
  .get(buyerController.getBuyerProfile)
  .put(buyerController.updateBuyerProfile);

module.exports = router;
