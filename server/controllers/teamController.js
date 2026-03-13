import { Team } from "../models/Team.js";
import { User } from "../models/User.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";

/**
 * @desc    Create a new team
 * @route   POST /api/teams
 * @access  Private (user)
 */
export const postCreateTeam = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const { _id: ownerId } = req.user;

  if (!name) return next(new AppError("Name is required", 400));

  const team = new Team({
    name,
    ownerId,
    members: [{ role: "admin", userId: ownerId }],
  });
  await team.save();

  return res.status(200).json({
    status: "success",
    data: {
      team,
    },
  });
});

/**
 * @desc    Promote a member to admin
 * @route   PATCH /api/teams/:teamId/members/:userId
 * @access  Private (admin)
 */
export const patchPromoteToAdmin = catchAsync(async (req, res, next) => {
  const { teamId, userId } = req.params;

  if (!userId || !teamId)
    return next(new AppError("userId and teamId required", 400));

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError("Team Not Found", 404));

  // Check if user is actually in the team before promoting
  const isMember = team.members.some(
    (member) => member.userId.toString() === userId.toString(),
  );
  if (!isMember) return next(new AppError("User is not of this team", 400));

  const isAlreadyAdmin = team.members.some(
    (member) =>
      member.userId.toString() === userId.toString() && member.role === "admin",
  );
  if (isAlreadyAdmin) return next(new AppError("User is already admin", 400));

  // Add user to admin list in the Team model
  const updatedMembers = team.members.map((member) => {
    if (member.userId.toString() === userId.toString()) {
      return { ...member, role: "admin" };
    }
    return member;
  });

  const updatedTeam = await Team.findByIdAndUpdate(
    teamId,
    { members: updatedMembers },
    { new: true },
  );

  // Update the user's role for this specific team in the User model
  await User.updateOne(
    { _id: userId, "teams.teamId": teamId },
    { $set: { "teams.$.role": "admin" } },
  );

  return res.status(200).json({
    status: "success",
    data: {
      updatedTeam,
    },
  });
});

/**
 * @desc    Add a new member to a team
 * @route   POST /api/teams/:teamId/members
 * @access  Private (admin)
 */
export const postAddMember = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;
  const { userId } = req.body;

  if (!userId || !teamId)
    return next(new AppError("User and team ID is required", 400));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError("Team not found", 404));

  const isAlreadyMember = team.members.some(
    (member) => member.userId.toString() === userId.toString(),
  );
  if (isAlreadyMember)
    return next(new AppError("User is already a member of this team", 400));

  // Push the user to the team's member array
  const updatedTeam = await Team.findByIdAndUpdate(
    teamId,
    {
      $addToSet: { members: { userId, role: "member" } },
    },
    { new: true },
  );

  // Update the user's document to include this team
  user.teams.push({ teamId, role: "member" });
  await user.save();

  return res.status(200).json({
    status: "success",
    data: {
      updatedTeam,
    },
  });
});

/**
 * @desc    Remove a member from a team
 * @route   DELETE /api/teams/:teamId/members/:userId
 * @access  Private (admin)
 */
export const deleteMember = catchAsync(async (req, res, next) => {
  const { teamId, userId } = req.params;

  if (!teamId || !userId) {
    return next(new AppError("Team ID and User ID are required", 400));
  }

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError("Team not found", 404));

  // Check if the user is a member of the team
  const isMember = team.members.some(
    (member) => member.userId.toString() === userId.toString(),
  );
  if (!isMember)
    return next(new AppError("User is not a member of this team", 400));

  const updatedMember = team.members.filter(
    (member) => member.userId.toString() !== userId.toString(),
  );

  const updatedTeam = await Team.findByIdAndUpdate(
    teamId,
    { members: updatedMember },
    { new: true },
  );

  await User.updateOne(
    { _id: userId, "teams.teamId": teamId },
    { $pull: { teams: { teamId } } },
  );

  return res.status(200).json({
    status: "success",
    data: {
      updatedTeam,
    },
  });
});
