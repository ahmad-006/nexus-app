import { Notification } from '../models/Notification.js';
import { catchAsync } from '../util/catchAsync.js';
import { AppError } from '../util/appError.js';

export const getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ recipientId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('senderId', 'name avatar');

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: { notifications },
  });
});

export const markAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipientId: req.user.id }, // Security check: Ensure it belongs to the logged in user
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found or unauthorized', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { notification },
  });
});

export const markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { recipientId: req.user.id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
  });
});
