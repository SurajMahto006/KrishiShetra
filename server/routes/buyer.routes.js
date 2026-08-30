const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const buyerController = require('../controllers/buyer.controller');

// All buyer endpoints require authenticated user with 'buyer' role
router.use(protect);
router.use(authorize('buyer'));

router
  .route('/profile')
  .post(buyerController.createProfile)
  .get(buyerController.getProfile)
  .put(buyerController.updateProfile);

module.exports = router;
