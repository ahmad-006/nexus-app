import { Notification } from '../models/Notification.js';
import { socketManager } from './socket.js';

/**
 * Creates a persistent notification in the database and emits a real-time socket event.
 * @param {Object} params
 * @param {String} params.recipientId - ID of the user receiving the notification
 * @param {String} params.senderId - ID of the user triggering the notification
 * @param {String} params.type - The type of notification (e.g., 'TEAM_INVITE', 'TICKET_ASSIGNED')
 * @param {String} params.message - The notification message text
 * @param {String} params.resourceId - The ID of the related resource (Team ID, Ticket ID, etc.)
 */
export const createNotification = async ({ recipientId, senderId, type, message, resourceId }) => {
  try {
    // 1) Save to MongoDB (Persistent)
    const notification = await Notification.create({
      recipientId,
      senderId,
      type,
      message,
      resourceId,
    });

    // 2) Emit via Socket.io (Real-time)
    const io = socketManager.getIO();
    if (io) {
      io.to(`user_${recipientId}`).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // A notification failure should not crash the main API request (Non-blocking)
    return null;
  }
};
