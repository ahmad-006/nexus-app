import { Team } from "../models/teams";

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
