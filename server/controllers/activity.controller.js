const ActivityLog = require('../models/ActivityLog');

/**
 * Format activity log item for clean responses
 */
const formatActivity = (a) => ({
  id: a._id,
  action: a.action,
  entityType: a.entityType || '',
  entityId: a.entityId || null,
  description: a.description || '',
  metadata: a.metadata || {},
  createdAt: a.createdAt
});

/**
 * @desc    Get activity logs for authenticated user
 * @route   GET /api/activity
 * @access  Private
 */
const getMyActivity = async (req, res) => {
  try {
    const { page, limit } = req.query;

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

    const filter = { user: req.user._id };

    const skip = (pageNum - 1) * limitNum;
    const total = await ActivityLog.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formatted = logs.map(formatActivity);

    return res.status(200).json({
      success: true,
      activities: formatted,
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
      message: 'Server error while retrieving activity logs'
    });
  }
};

module.exports = {
  getMyActivity
};
