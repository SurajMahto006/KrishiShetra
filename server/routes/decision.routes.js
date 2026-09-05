const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storage.controller');

// POST /api/decision/sell-vs-store
router.post('/sell-vs-store', storageController.calculateSellVsStore);

module.exports = router;
