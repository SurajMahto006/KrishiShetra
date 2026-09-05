const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const lotController = require('../controllers/lot.controller');

// Base authentication required for all lot operations
router.use(protect);

// AI Image Defect Estimation (Accessible to any authenticated user)
router.post('/ai-estimate', lotController.aiQualityScanEstimate);

// Assaying & Lab Certificate Upload (Accessible to Farmers, FPOs, Assayers, Admins)
router.post('/:lotId/assay', authorize('farmer', 'fpo', 'assayer', 'admin'), lotController.verifyAssay);

// Farmer-specific lot management
router.post('/', authorize('farmer'), lotController.createLot);
router.get('/my', authorize('farmer'), lotController.getMyLots);
router.get('/:lotId', lotController.getSingleLot);
router.put('/:lotId', authorize('farmer'), lotController.updateLot);
router.delete('/:lotId', authorize('farmer'), lotController.deleteLot);

module.exports = router;

