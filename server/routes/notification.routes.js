const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notification.controller');

// All notification routes require JWT authentication
router.use(protect);

router.get('/', notificationController.getMyNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
