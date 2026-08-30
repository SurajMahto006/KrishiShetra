const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const lotController = require('../controllers/lot.controller');

// All lot endpoints require authenticated user with 'farmer' role
router.use(protect);
router.use(authorize('farmer'));

router.post('/', lotController.createLot);
router.get('/my', lotController.getMyLots);
router.get('/:lotId', lotController.getSingleLot);
router.put('/:lotId', lotController.updateLot);
router.delete('/:lotId', lotController.deleteLot);

module.exports = router;
