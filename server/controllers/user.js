import { Team } from "../models/teams.js";
import { User } from "../models/user.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";

// Search for a user by email and return their profile without the password
export const getUser = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  if (!email) return next(new AppError("Email is required", 400));

  const user = await User.findOne({ email }).select("-password");
  if (!user) return next(new AppError("User not found", 404));

  return res.status(200).json({ message: "User found", user });
});

// Get all teams that the current user is a part of
export const getTeams = catchAsync(async (req, res, next) => {
  const { userid } = req.headers;
  if (!userid) return next(new AppError("userid is required", 404));

  // Find teams where the user is listed in the members array
  const teams = await Team.find({ members: userid });
  if (teams.length === 0) return next(new AppError("No teams found", 404));

  return res
    .status(200)
    .json({ message: "Teams found successfully", teams: { teams } });
});

export const getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) return next(new AppError("userId is required", 400));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  return res.status(200).json({ message: "User found", user });
});

// Going to implement when JWT is implemented
export const patchUserProfile = async (req, res) => {};
export const deleteUser = async (req, res) => {};
export const getTickets = async (req, res) => {};
