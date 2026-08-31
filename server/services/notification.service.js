const Notification = require('../models/Notification');

/**
 * Reusable helper to create a single notification safely
 * Never causes calling business logic to fail if notification fails
 */
const createNotification = async ({
  recipient,
  type,
  title,
  message,
  relatedEntity = {}
}) => {
  try {
    if (!recipient || !type || !title || !message) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      type,
      title: String(title).trim().slice(0, 150),
      message: String(message).trim().slice(0, 500),
      relatedEntity: {
        entityType: relatedEntity.entityType || undefined,
        entityId: relatedEntity.entityId || undefined
      }
    });

    return notification;
  } catch (error) {
    // Log safely without leaking sensitive information
    console.error('Notification creation failed:', error.message);
    return null;
  }
};

/**
 * Helper to create multiple notifications in bulk safely
 */
const createBulkNotifications = async (notifications = []) => {
  try {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return [];
    }

    const docs = notifications
      .filter((n) => n && n.recipient && n.type && n.title && n.message)
      .map((n) => ({
        recipient: n.recipient,
        type: n.type,
        title: String(n.title).trim().slice(0, 150),
        message: String(n.message).trim().slice(0, 500),
        relatedEntity: n.relatedEntity || {}
      }));

    if (docs.length === 0) return [];

    return await Notification.insertMany(docs, { ordered: false });
  } catch (error) {
    console.error('Bulk notification creation failed:', error.message);
    return [];
  }
};

module.exports = {
  createNotification,
  createBulkNotifications
};
