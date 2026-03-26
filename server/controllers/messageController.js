import { Message } from "../models/Message.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";
import { socketManager } from "../util/socket.js";

/**
 * @desc    Get all messages for a specific team
 * @route   GET /api/messages/team/:teamId
 * @access  Private
 */
export const getMessagesByTeam = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;

  const messages = await Message.find({ teamId })
    .populate("senderId", "name image email")
    .sort({ createdAt: 1 });

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      messages,
    },
  });
});

/**
 * @desc    Get all private messages between two users
 * @route   GET /api/messages/:otherUserId
 * @access  Private
 */
export const getMessagesByUsers = catchAsync(async (req, res) => {
  const { otherUserId, teamId } = req.params;
  const { id: userId } = req.user;

  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId },
    ],
    teamId,
  }).sort({ createdAt: 1 });

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      messages,
    },
  });
});

/**
 * @desc    Mark all messages from a specific sender as read
 * @route   PATCH /api/messages/read-all/:senderId
 * @access  Private
 */
export const readAllMessages = catchAsync(async (req, res) => {
  const { senderId } = req.params;
  const { id: receiverId } = req.user;

  // 1. ALL Messages are read at once
  await Message.updateMany(
    { senderId, receiverId, isRead: false },
    { $set: { isRead: true } },
  );

  // 2. Real-time Notification (Tell the sender their messages were seen)
  const io = socketManager.getIO();
  if (io) {
    io.to(`user_${senderId}`).emit("messages_read", {
      readerId: receiverId,
      senderId: senderId,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Messages marked as read",
  });
});

/**
 * @desc    Update a private message (Edit)
 * @route   PATCH /api/messages/:messageId
 * @access  Private (Sender only)
 */
export const updateMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;
  const { message: newMessage } = req.body;
  const userId = req.user.id;

  if (!newMessage)
    return next(new AppError("Message content is required", 400));

  // 1. Find and Verify Ownership (Senior Move: One query)
  const updatedMessage = await Message.findOneAndUpdate(
    { _id: messageId, senderId: userId },
    { message: newMessage, isEdited: true },
    { new: true, runValidators: true },
  );

  if (!updatedMessage) {
    return next(
      new AppError(
        "Message not found or you are not authorized to edit it",
        404,
      ),
    );
  }

  // 2. Real-time Notification (Update the receiver's UI instantly)
  const io = socketManager.getIO();
  if (io) {
    io.to(`user_${updatedMessage.receiverId}`).emit("message_updated", {
      _id: updatedMessage._id,
      message: updatedMessage.message,
      isEdited: true,
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      message: updatedMessage,
    },
  });
});
