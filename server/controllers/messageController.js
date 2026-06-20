import mongoose from "mongoose";
import { Message } from "../models/Message.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";
import { socketManager } from "../util/socket.js";

/**
 * @desc    Get all group messages for a specific team (excludes 1-on-1 private messages)
 * @route   GET /api/messages/:teamId/group
 * @access  Private
 */
export const getMessagesByTeam = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;

  // Strict tenant and isolation filter: only messages with no receiverId belong to team group
  const messages = await Message.find({
    teamId,
    $or: [{ receiverId: null }, { receiverId: { $exists: false } }],
  })
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
 * @desc    Get all private messages between two users in a team
 * @route   GET /api/messages/:teamId/:otherUserId
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
  })
    .populate("senderId", "name image email")
    .populate("receiverId", "name image email")
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
 * @desc    Get unread message counts per sender in a team
 * @route   GET /api/messages/:teamId/unread
 * @access  Private
 */
export const getUnreadCounts = catchAsync(async (req, res) => {
  const { teamId } = req.params;
  const userId = req.user.id;

  const unreadMessages = await Message.aggregate([
    {
      $match: {
        teamId: new mongoose.Types.ObjectId(teamId),
        receiverId: new mongoose.Types.ObjectId(userId),
        isRead: false,
      },
    },
    {
      $group: {
        _id: "$senderId",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = {};
  unreadMessages.forEach((item) => {
    counts[item._id.toString()] = item.count;
  });

  res.status(200).json({
    status: "success",
    data: {
      counts,
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

  await Message.updateMany(
    { senderId, receiverId, isRead: false },
    { $set: { isRead: true } },
  );

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
 * @desc    Update a message (Edit)
 * @route   PATCH /api/messages/:messageId
 * @access  Private (Sender only)
 */
export const updateMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;
  const { message: newMessage } = req.body;
  const userId = req.user.id;

  if (!newMessage)
    return next(new AppError("Message content is required", 400));

  const updatedMessage = await Message.findOneAndUpdate(
    { _id: messageId, senderId: userId },
    { message: newMessage, isEdited: true },
    { new: true, runValidators: true },
  ).populate("senderId", "name image email");

  if (!updatedMessage) {
    return next(
      new AppError(
        "Message not found or you are not authorized to edit it",
        404,
      ),
    );
  }

  const io = socketManager.getIO();
  if (io) {
    if (updatedMessage.receiverId) {
      io.to(`user_${updatedMessage.receiverId}`)
        .to(`user_${userId}`)
        .emit("message_updated", {
          _id: updatedMessage._id,
          message: updatedMessage.message,
          isEdited: true,
          teamId: updatedMessage.teamId,
          receiverId: updatedMessage.receiverId,
          senderId: updatedMessage.senderId,
        });
    } else {
      io.to(`team_${updatedMessage.teamId}`).emit("message_updated", {
        _id: updatedMessage._id,
        message: updatedMessage.message,
        isEdited: true,
        teamId: updatedMessage.teamId,
        senderId: updatedMessage.senderId,
      });
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      message: updatedMessage,
    },
  });
});

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:messageId
 * @access  Private (Sender only)
 */
export const deleteMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  const message = await Message.findOneAndDelete({
    _id: messageId,
    senderId: userId,
  });

  if (!message) {
    return next(
      new AppError(
        "Message not found or you are not authorized to delete it",
        404,
      ),
    );
  }

  const io = socketManager.getIO();
  if (io) {
    if (message.receiverId) {
      io.to(`user_${message.receiverId}`)
        .to(`user_${userId}`)
        .emit("message_deleted", {
          _id: messageId,
          teamId: message.teamId,
          receiverId: message.receiverId,
          senderId: message.senderId,
        });
    } else {
      io.to(`team_${message.teamId}`).emit("message_deleted", {
        _id: messageId,
        teamId: message.teamId,
      });
    }
  }

  res.status(200).json({
    status: "success",
    message: "Message deleted successfully",
  });
});

