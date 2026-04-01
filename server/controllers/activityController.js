import Activity from "../models/Activity.js";
import { catchAsync } from "../util/catchAsync.js";

export const logActivity = async (data) => {
  try {
    await Activity.create(data);
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
