import { Team } from "../models/teams.js";
import { User } from "../models/user.js";

// Handle user signup and initial data creation
export const postUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new Error("A user must have a name, email and password");
    }

    const user = await new User({ name, email, password });
    await user.save();

    return res
      .status(201)
      .json({ message: "user created successfully", response: { user } });
  } catch (error) {
    return res.status(400).json({
      message: "user creation failed",
      error: error.message,
    });
  }
};

// Search for a user by email and return their profile without the password
export const getUser = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) throw new Error("Email is required");

    const user = await User.findOne({ email }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "User found", user });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};

// Get all teams that the current user is a part of
export const getTeams = async (req, res) => {
  let status = null;
  try {
    const { userid } = req.headers;
    if (!userid) {
      status = 404;
      throw new Error("userid is required");
    }

    // Find teams where the user is listed in the members array
    const teams = await Team.find({ members: userid });
    if (teams.length === 0) throw new Error("No teams found");

    return res
      .status(200)
      .json({ message: "Teams found successfully", teams: { teams } });
  } catch (error) {
    return res.status(status || 400).json({
      message: "Failed to fetch teams",
      error: error.message,
    });
  }
};
