/**
 * KRISHISHETRA — MANDI PROFITABILITY & DECISION ROUTES
 */

'use strict';

const express = require('express');
const router = express.Router();
const mandiController = require('../controllers/mandi.controller');

// Main analysis endpoint
router.post('/analyze', mandiController.analyzeProfitability);

// Reference data endpoints
router.get('/list', mandiController.getMandiList);
router.get('/crops', mandiController.getAvailableCrops);
router.get('/prices/:mandiId', mandiController.getMandiPriceHistory);

module.exports = router;
