import { Team } from "../models/Team.js";
import { User } from "../models/User.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";
import { Ticket } from "../models/Ticket.js";
import { imagekit, upload } from "../util/imagekit.js";

export const uploadImage = upload.single("image");

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");
  return res.status(200).json({ status: "success", data: { user } });
});

/**
 * @desc    Get all teams for the current user
 * @route   GET /api/users/me/teams
 * @access  Private
 */
export const getTeams = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Find teams where the user is listed in the members array
  const teams = await Team.find({ "members.userId": userId });
  if (teams.length === 0) return next(new AppError("No teams found", 404));

  return res.status(200).json({ status: "success", data: { teams } });
});

/**
 * @desc    Get a user by ID
 * @route   GET /api/users/:userId
 * @access  Private
 */
export const getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) return next(new AppError("userId is required", 400));

  const user = await User.findById(userId).select("-password");
  if (!user) return next(new AppError("User not found", 404));

  return res.status(200).json({ status: "success", data: { user } });
});

/**
 * @desc    Update current user profile info (name/image)
 * @route   PATCH /api/users/me
 * @access  Private
 */
export const patchUserProfile = catchAsync(async (req, res) => {
  const { name, image } = req.body;
  const userId = req.user.id;

  const user = await User.findByIdAndUpdate(
    userId,
    { name, image },
    { new: true, runValidators: true },
  ).select("-password");

  return res.status(200).json({ status: "success", data: { user } });
});

/**
 * @desc    Delete current user account and clean up memberships/tickets
 * @route   DELETE /api/users/me
 * @access  Private
 */
export const deleteUser = catchAsync(async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  await Team.updateMany(
    { "members.userId": req.user.id },
    { $pull: { members: { userId: req.user.id } } },
  );
  await Ticket.updateMany(
    { $or: [{ reporterId: req.user.id }, { assigneeId: req.user.id }] },
    { $set: { assigneeId: null } },
  );

  return res.status(204).json({ status: "success", data: null });
});

/**
 * @desc    Get all tickets assigned to or reported by current user in a specific team
 * @route   GET /api/users/me/tickets
 * @access  Private
 */
export const getTickets = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { teamId } = req.query;
  if (!teamId) return next(new AppError("teamId is required", 400));

  const tickets = await Ticket.find({
    $or: [{ reporterId: userId }, { assigneeId: userId }],
    teamId,
  });

  return res
    .status(200)
    .json({ status: "success", results: tickets.length, data: { tickets } });
});

/**
 * @desc    Upload and update profile image for current user via ImageKit
 * @route   POST /api/users/me/image
 * @access  Private
 */
export const postImage = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  if (!req.file) return next(new AppError("No file uploaded", 400));

  const uploadResponse = await imagekit.upload({
    file: req.file.buffer,
    fileName: `user-${userId}-${Date.now()}`,
    folder: "/nexus-users",
  });

  await User.findByIdAndUpdate(
    userId,
    {
      image: uploadResponse.url,
    },
    { new: true },
  );

  return res
    .status(200)
    .json({ status: "success", data: { imageUrl: uploadResponse.url } });
});
