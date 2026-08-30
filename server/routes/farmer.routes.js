const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const farmerController = require('../controllers/farmer.controller');

// All farmer profile endpoints require authenticated Farmer role
router.use(protect);
router.use(authorize('farmer'));

router
  .route('/profile')
  .post(farmerController.createProfile)
  .get(farmerController.getProfile)
  .put(farmerController.updateProfile);

module.exports = router;
