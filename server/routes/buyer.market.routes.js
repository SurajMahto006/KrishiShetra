const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const buyerMarketController = require('../controllers/buyer.market.controller');

// 1. Marketplace router: /api/buyer/market/lots...
const marketRouter = express.Router();
marketRouter.use(protect);
marketRouter.use(authorize('buyer'));

marketRouter.get('/lots', buyerMarketController.getBuyerMarketLots);
marketRouter.get('/lots/:lotId', buyerMarketController.getBuyerLotDetails);

// 2. Saved lots router: /api/buyer/saved-lots...
const savedLotsRouter = express.Router();
savedLotsRouter.use(protect);
savedLotsRouter.use(authorize('buyer'));

savedLotsRouter.get('/', buyerMarketController.getSavedLots);
savedLotsRouter.post('/:lotId', buyerMarketController.saveLot);
savedLotsRouter.delete('/:lotId', buyerMarketController.removeSavedLot);

module.exports = {
  marketRouter,
  savedLotsRouter
};
