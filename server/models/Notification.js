import mongoose, { Schema, Types } from 'mongoose';

const notificationSchema = new Schema(
  {
    recipientId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['TEAM_INVITE', 'TICKET_ASSIGNED', 'TICKET_STATUS_CHANGED', 'COMMENT_MENTION'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    resourceId: {
      type: Types.ObjectId,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for lightning-fast retrieval of unread notifications for a specific user
notificationSchema.index({ recipientId: 1, isRead: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
