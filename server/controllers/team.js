import { Team } from "../models/teams.js";
import { User } from "../models/user.js";

// Create a new team and make the owner an admin and member by default
export const postCreateTeam = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create the team",
      error: error.message,
    });
  }
};

// Promote a member to admin and sync the role in both Team and User models
export const patchPromoteToAdmin = async (req, res) => {
  try {
    const { id: teamId } = req.params;
    const { userId } = req.body;

    if (!userId || !teamId) throw new Error("userId and teamId required");

    const team = await Team.findById(teamId);
    if (!team) throw new Error("Team Not Found");

    // Check if user is actually in the team before promoting
    const isMember = team.members.some(
      (id) => id.toString() === userId.toString(),
    );
    if (!isMember) throw new Error("User is not of this team");

    const isAlreadyAdmin = team.admins.some(
      (id) => id.toString() === userId.toString(),
    );
    if (isAlreadyAdmin) throw new Error("User is already admin");

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
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update role", error: error.message });
  }
};

// Add a new user to the team and update the user's teams list
export const postAddMember = async (req, res) => {
  try {
    const { id: teamId } = req.params;
    const { userId } = req.body;

    if (!userId || !teamId) throw new Error("User and team ID is required");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const team = await Team.findById(teamId);
    if (!team) throw new Error("Team not found");

    const isAlreadyMember = team.members.some(
      (id) => id.toString() === userId.toString(),
    );
    if (isAlreadyMember)
      throw new Error("User is already a member of this team");

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
  } catch (error) {
    return res.status(400).json({
      message: "failed adding the user to team",
      error: error.message,
    });
  }
};
