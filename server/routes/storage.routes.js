const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const storageController = require('../controllers/storage.controller');

// Optional auth helper: populates req.user if valid token provided, but doesn't block unauthenticated requests
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
    } catch (e) {
      // ignore invalid token for optional routes
    }
  }
  next();
};

// --- PUBLIC / DISCOVERY ROUTES ---
router.get('/nearby', storageController.getNearbyStorage);
router.get('/search', storageController.searchStorage);
router.get('/options-for-crop', storageController.getStorageOptionsForCrop);
router.get('/compare', storageController.getStorageOptionsForCrop);
router.get('/:id', storageController.getStorageById);

// --- STORAGE BOOKING & REQUESTS ---
router.post('/requests', optionalAuth, storageController.createStorageRequest);
router.post('/request', optionalAuth, storageController.createStorageRequest);
router.get('/requests/my', optionalAuth, storageController.getMyStorageRequests);
router.get('/requests', optionalAuth, storageController.getMyStorageRequests);
router.get('/requests/:id', optionalAuth, storageController.getStorageRequestById);
router.patch('/requests/:id/status', optionalAuth, storageController.updateStorageRequestStatus);
router.patch('/requests/:id', optionalAuth, storageController.updateStorageRequestStatus);

// --- PLEDGE FINANCING (e-NWR) ---
router.post('/pledge-financing/request', optionalAuth, storageController.createPledgeFinancingRequest);
router.post('/pledge-financing', optionalAuth, storageController.createPledgeFinancingRequest);
router.get('/pledge-financing/my', optionalAuth, storageController.getMyPledgeFinancingRequests);
router.get('/pledge-financing', optionalAuth, storageController.getMyPledgeFinancingRequests);

// --- ADMIN ROUTES ---
router.get('/admin/all', optionalAuth, storageController.adminGetAllFacilities);
router.post('/facilities', optionalAuth, storageController.adminCreateFacility);
router.put('/facilities/:id', optionalAuth, storageController.adminUpdateFacility);

module.exports = router;
