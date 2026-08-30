const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

// Public Marketplace Endpoints (No authentication required)
router.get('/lots', marketController.getMarketLots);
router.get('/lots/:lotId', marketController.getSinglePublicLot);

module.exports = router;
