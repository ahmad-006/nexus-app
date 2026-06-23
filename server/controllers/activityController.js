import Activity from "../models/Activity.js";
import { catchAsync } from "../util/catchAsync.js";
import { socketManager } from "../util/socket.js";

export const logActivity = async (data) => {
  try {
    const activity = await Activity.create(data);

    // Broadcast real-time activity to connected ticket room
    if (data.resourceType === "Ticket" && data.resourceId) {
      try {
        const populated = await Activity.findById(activity._id)
          .populate("userId", "name image email");

        if (populated) {
          const io = socketManager.getIO();
          io.to(`ticket_${data.resourceId}`).emit("receive_activity", populated);
        }
      } catch (socketError) {
        // Safe failover if socketManager is uninitialized in standalone scripts
      }
    }

    return activity;
  } catch (error) {
    console.log(error);
  }
};

/**
 * @desc    Get all activities for a specific team
 * @route   GET /api/activities/:teamId
 * @access  Private (Admin Only)
 */
export const getActivities = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;

  const activities = await Activity.find({ teamId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("userId", "name image")
    .populate("teamId", "name");

  return res.status(200).json({
    status: "success",
    results: activities.length,
    data: {
      activities,
    },
  });
});

/**
 * @desc    Get all audit activities for a specific ticket
 * @route   GET /api/tickets/:ticketId/activities
 * @access  Private (Member)
 */
export const getTicketActivities = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;

  const activities = await Activity.find({ resourceId: ticketId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("userId", "name image email");

  return res.status(200).json({
    status: "success",
    results: activities.length,
    data: {
      activities,
    },
  });
});

