import { Team } from "../models/teams";

export const postCreateTeam = async (req, res) => {
  try {
    const { teamName, ownerId } = req.body;

    const team = new Team(teamName, ownerId, [ownerId], [ownerId]);
    const response = await team.create();
    if (!response) throw new error();
    return res.status(200).json({
      message: "Team created Successfully",
      response: { teamId: response.insertedId },
    });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create the team",
      error: error.message,
    });
  }
};
