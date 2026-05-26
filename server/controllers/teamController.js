import { Team } from "../models/Team.js";
import { User } from "../models/User.js";
import { Ticket } from "../models/Ticket.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";
import { sendEmail } from "../util/nodemailer.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import { logActivity } from "./activityController.js";
import { TeamInvite } from '../models/TeamInvite.js';
import { socketManager } from '../util/socket.js';

/**
 * @desc    Create a new team
 * @route   POST /api/teams
 * @access  Private (user)
 */
export const postCreateTeam = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const { id: ownerId } = req.user;

  if (!name) return next(new AppError('Name is required', 400));

  const team = new Team({
    name,
    ownerId,
    members: [{ role: 'admin', userId: ownerId }],
  });
  await team.save();

  logActivity({
    userId: ownerId,
    action: 'TEAM_CREATED',
    resourceType: 'Team',
    resourceId: team._id,
    teamId: team._id,
    details: { teamName: name },
  });

  return res.status(200).json({
    status: 'success',
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
    return next(new AppError('userId and teamId required', 400));

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('Team Not Found', 404));

  // Check if user is actually in the team before promoting
  const isMember = team.members.some(
    (member) => member.userId.toString() === userId.toString(),
  );
  if (!isMember) return next(new AppError('User is not of this team', 400));

  const isAlreadyAdmin = team.members.some(
    (member) =>
      member.userId.toString() === userId.toString() && member.role === 'admin',
  );
  if (isAlreadyAdmin) return next(new AppError('User is already admin', 400));

  // Add user to admin list in the Team model
  const updatedMembers = team.members.map((member) => {
    if (member.userId.toString() === userId.toString()) {
      return { ...member, role: 'admin' };
    }
    return member;
  });

  const updatedTeam = await Team.findByIdAndUpdate(
    teamId,
    { members: updatedMembers },
    { new: true },
  );

  logActivity({
    userId: req.user.id,
    action: 'MEMBER_PROMOTED',
    resourceType: 'Team',
    resourceId: teamId,
    teamId,
    details: { promotedUserId: userId },
  });

  return res.status(200).json({
    status: 'success',
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
    return next(new AppError('User and team ID is required', 400));

  const user = await User.findById(userId);
  if (!user) return next(new AppError('User not found', 404));

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('Team not found', 404));

  const isAlreadyMember = team.members.some(
    (member) => member.userId.toString() === userId.toString(),
  );
  if (isAlreadyMember)
    return next(new AppError('User is already a member of this team', 400));

  const isInvitePending = await TeamInvite.findOne({
    teamId,
    inviteeId: userId,
    status: 'PENDING',
    expiresAt: { $gt: Date.now() }, // Only block if the invite hasn't expired yet
  });
  if (isInvitePending) {
    return next(new AppError('User has a pending invitation', 400));
  }

  //creating Invite if not exists
  const invite = await TeamInvite.create({
    teamId,
    inviterId: req.user.id,
    inviteeId: userId,
    status: 'PENDING',
  });

  // Sending real time notification
  const io = socketManager.getIO();
  io.to(`user_${userId}`).emit('new_invitation', {
    inviteId: invite._id,
    teamName: team.name,
    inviterName: req.user.name,
  });

  //SIgning a jwt token for invitation
  const token = jwt.sign(
    { teamId, userId, inviterId: req.user.id },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );

  //SEND INVITATION EMAIL TO USER
  await sendEmail({
    name: user.name.split(' ')[0],
    email: user.email,
    token,
    type: 'teamInvite',
    adminName: req.user.name,
  });

  return res.status(200).json({
    status: 'success',
    message: 'Invitation email sent',
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
  const { teamId, userId, inviterId } = decoded;

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError("Team not found", 404));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  // Check if already a member
  const isAlreadyMember = team.members.some(
    (member) => member.userId.toString() === userId.toString(),
  );
  if (isAlreadyMember) {
    return res
      .status(200)
      .json({ status: "success", message: "Already a member" });
  }

  const invite = await TeamInvite.findOneAndUpdate(
    { teamId, inviteeId: userId, status: 'PENDING' },
    { status: 'ACCEPTED' },
    { new: true },
  );

  if (!invite) {
    return next(new AppError('Invitation expired or does not exist', 400));
  }

  team.members.push({ userId, role: 'member' });
  await team.save();

  logActivity({
    userId: inviterId,
    action: "MEMBER_ADDED",
    resourceType: "Team",
    resourceId: teamId,
    teamId,
    details: { addedMember: userId, role: "member" },
  });

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
 * @desc    Get all pending team invitations for logged-in user
 * @route   GET /api/teams/invites/me
 * @access  Private
 */
export const getMyInvites = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;

  //getting all the invites and then populating the teamId to get teamName.
  const invites = await TeamInvite.find({
    inviteeId: userId,
    status: 'PENDING',
  }).populate('teamId', 'name');

  return res.status(200).json({
    status: 'success',
    data: {
      invites,
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

  const removedUser = await User.findById(userId);
  if (removedUser) {
    await sendEmail({
      name: removedUser.name.split(" ")[0],
      email: removedUser.email,
      type: "teamRemoved",
      ticketTitle: team.name,
    });
  }

  //LOGGING ACTIVITY
  logActivity({
    userId: req.user.id,
    action: "MEMBER_REMOVED",
    resourceType: "Team",
    resourceId: teamId,
    teamId,
    details: {
      removedUserId: userId,
    },
  });

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
