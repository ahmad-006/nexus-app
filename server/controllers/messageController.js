import { Message } from "../models/Message.js";
import { catchAsync } from "../util/catchAsync.js";

/**
 * @desc    Get all private messages between two users
 * @route   GET /api/messages/:otherUserId
 * @access  Private
 */
export const getMessagesByUsers = catchAsync(async (req, res) => {
  const { otherUserId } = req.params;
  const { id: userId } = req.user;

  // Find messages where (Me -> Them) OR (Them -> Me)
  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId },
    ],
  }).sort({ createdAt: 1 });

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      messages,
    },
  });
});
