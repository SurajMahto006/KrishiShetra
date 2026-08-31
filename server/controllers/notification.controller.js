const mongoose = require('mongoose');
const Notification = require('../models/Notification');

/**
 * Format notification for clean response
 */
const formatNotification = (n) => ({
  id: n._id,
  type: n.type,
  title: n.title,
  message: n.message,
  relatedEntity: n.relatedEntity || {},
  isRead: n.isRead,
  readAt: n.readAt || null,
  createdAt: n.createdAt,
  updatedAt: n.updatedAt
});

/**
 * @desc    Get notifications for authenticated user
 * @route   GET /api/notifications
 * @access  Private
 */
const getMyNotifications = async (req, res) => {
  try {
    const { page, limit, unreadOnly } = req.query;

    let pageNum = 1;
    if (page !== undefined) {
      pageNum = parseInt(page, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid page parameter'
        });
      }
    }

    let limitNum = 20;
    if (limit !== undefined) {
      limitNum = parseInt(limit, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        return res.status(400).json({
          success: false,
          message: 'Invalid limit parameter (1-50 allowed)'
        });
      }
    }

    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true' || unreadOnly === true) {
      filter.isRead = false;
    }

    const skip = (pageNum - 1) * limitNum;
    const total = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const rawNotifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formatted = rawNotifications.map(formatNotification);

    return res.status(200).json({
      success: true,
      notifications: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving notifications'
    });
  }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    return res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving unread count'
    });
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Ownership check: must belong to authenticated user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this notification'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while marking notification as read'
    });
  }
};

/**
 * @desc    Mark all unread notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount || 0
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while marking all notifications as read'
    });
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Ownership check
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this notification'
      });
    }

    await notification.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting notification'
    });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
