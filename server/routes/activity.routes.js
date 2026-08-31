const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const activityController = require('../controllers/activity.controller');

// All activity routes require JWT authentication
router.use(protect);

router.get('/', activityController.getMyActivity);

module.exports = router;
