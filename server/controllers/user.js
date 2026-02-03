import { User } from "../models/user";

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
    return res.status(201).json({
      message: "user creation failed",
      error: error.message,
    });
  }
};
