import { Team } from "../models/Team.js";
import { User } from "../models/User.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";

// Create a new team and make the owner an admin and member by default
export const postCreateTeam = catchAsync(async (req, res, next) => {
  const { name, ownerId } = req.body;

  const team = new Team({
    name,
    ownerId,
    admins: [ownerId],
    members: [ownerId],
  });
  await team.save();

  return res.status(200).json({
    message: "Team created Successfully",
    response: { team },
  });
});

// Promote a member to admin and sync the role in both Team and User models
export const patchPromoteToAdmin = catchAsync(async (req, res, next) => {
  const { id: teamId } = req.params;
  const { userId } = req.body;

  if (!userId || !teamId)
    return next(new AppError("userId and teamId required", 400));

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError("Team Not Found", 404));

  // Check if user is actually in the team before promoting
  const isMember = team.members.some(
    (id) => id.toString() === userId.toString(),
  );
  if (!isMember) return next(new AppError("User is not of this team", 400));

  const isAlreadyAdmin = team.admins.some(
    (id) => id.toString() === userId.toString(),
  );
  if (isAlreadyAdmin) return next(new AppError("User is already admin", 400));

  // Add user to admin list in the Team model
  const response = await Team.findByIdAndUpdate(
    teamId,
    {
      $addToSet: { admins: userId },
    },
    { new: true },
  );

  // Update the user's role for this specific team in the User model
  await User.updateOne(
    { _id: userId, "teams.teamId": teamId },
    { $set: { "teams.$.role": "admin" } },
  );

  return res.status(200).json({
    message: "Updated role successfully ",
    Team: response,
  });
});

// Add a new user to the team and update the user's teams list
export const postAddMember = catchAsync(async (req, res, next) => {
  const { id: teamId } = req.params;
  const { userId } = req.body;

  if (!userId || !teamId)
    return next(new AppError("User and team ID is required", 400));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError("Team not found", 404));

  const isAlreadyMember = team.members.some(
    (id) => id.toString() === userId.toString(),
  );
  if (isAlreadyMember)
    return next(new AppError("User is already a member of this team", 400));

  // Push the user to the team's member array
  const response = await Team.findByIdAndUpdate(
    teamId,
    {
      $addToSet: { members: userId },
    },
    { new: true },
  );

  // Update the user's document to include this team
  user.teams.push({ teamId, role: "member" });
  await user.save();

  return res.status(200).json({
    message: "Member added successfully",
    response,
  });
});
