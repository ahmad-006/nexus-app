import { Team } from "../models/Team.js";
import { User } from "../models/User.js";
import { Ticket } from "../models/Ticket.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";
import { sendEmail } from "../util/nodemailer.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";

/**
 * @desc    Create a new team
 * @route   POST /api/teams
 * @access  Private (user)
 */
export const postCreateTeam = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const { id: ownerId } = req.user;

  if (!name) return next(new AppError("Name is required", 400));

  const team = new Team({
    name,
    ownerId,
    members: [{ role: "admin", userId: ownerId }],
  });
  await team.save();

  req.user.teams.push({ teamId: team._id, role: "admin" });
  await req.user.save();

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

  //SIgning a jwt token for invitation
  const token = jwt.sign({ teamId, userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  //SEND INVITATION EMAIL TO USER
  await sendEmail({
    name: user.name.split(" ")[0],
    email: user.email,
    token,
    type: "teamInvite",
    adminName: req.user.name,
  });

  return res.status(200).json({
    status: "success",
    message: "Invitation email sent",
  });
});

/**
 * @desc    Accept an invitation to join a team
 * @route   PATCH /api/teams/accept-invite/:token
 * @access  Public
 */

export const patchAcceptInvite = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const { teamId, userId } = decoded;

  // Ensure the logged-in user is the one invited
  if (req.user.id !== userId) {
    return next(
      new AppError("You are not authorized to accept this invitation", 403),
    );
  }

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError("Team not found", 404));

  // Check if already a member
  const isAlreadyMember = team.members.some(
    (member) => member.userId.toString() === userId.toString(),
  );
  if (isAlreadyMember) {
    return res
      .status(200)
      .json({ status: "success", message: "Already a member" });
  }

  team.members.push({ userId, role: "member" });
  await team.save();

  user.teams.push({ teamId, role: "member" });
  await user.save();

  await sendEmail({
    name: user.name.split(" ")[0],
    email: user.email,
    type: "teamJoined",
    ticketTitle: team.name, // Using ticketTitle as team name placeholder
  });

  return res.status(200).json({
    status: "success",
    message: "Team joined successfully",
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

  const removedUser = await User.findById(userId);
  if (removedUser) {
    await sendEmail({
      name: removedUser.name.split(" ")[0],
      email: removedUser.email,
      type: "teamRemoved",
      ticketTitle: team.name,
    });
  }

  return res.status(200).json({
    status: "success",
    data: {
      updatedTeam,
    },
  });
});

/**
 * @desc    Delete an entire team and all its tickets
 * @route   DELETE /api/teams/:teamId
 * @access  Private (Owner Only)
 */
export const deleteTeam = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;

  if (!teamId) return next(new AppError("Team ID is required", 400));
  const team = await Team.findById(teamId);
  if (!team) return next(new AppError("Team not found", 404));
  const { ownerId } = team;
  if (ownerId.toString() !== req.user.id) {
    return next(new AppError("You are not the owner of this team", 403));
  }

  await User.updateMany(
    { "teams.teamId": teamId },
    { $pull: { teams: { teamId } } },
  );
  await Ticket.deleteMany({ teamId });
  await Team.findByIdAndDelete(teamId);

  return res.status(204).json({ status: "success", data: null });
});

/**
 * @desc    Get a specific team by ID with populated members
 * @route   GET /api/teams/:teamId
 * @access  Private (Member)
 */
export const getTeam = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId).populate(
    "members.userId",
    "name email image",
  );

  if (!team) return next(new AppError("Team not found", 404));

  return res.status(200).json({
    status: "success",
    data: {
      team,
    },
  });
});

