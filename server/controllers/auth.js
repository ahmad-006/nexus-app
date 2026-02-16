import crypto from "crypto";

import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../util/nodemailer.js";

export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "failed Login", error: "Invalid credentials" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", error: "Invalid credentials" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res
        .status(400)
        .json({ message: "failed Login", error: "Invalid credentials" });

    return res
      .status(200)
      .json({ message: "User logged In sucessfully", user });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "failed Login", error: error.message });
  }
};

export const postSignUp = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  try {
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "SignUp failed", error: "Invalid credentials" });

    const user = await User.findOne({ email });
    if (user)
      return res
        .status(409)
        .json({ message: "SignUp failed", error: "User already exists" });

    if (password !== confirmPassword) throw new Error("Passwords do not match");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    await sendEmail({
      name: newUser.name.split(" ")[0],
      email: newUser.email,
      token: null,
      type: "signup",
    });
    return res
      .status(201)
      .json({ message: "User created successfully", newUser });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "SignUp failed", error: error.message });
  }
};

export const postForgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res
        .status(200)
        .json({ message: "If user exists an email will be sent" });

    user.resetToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetTokenExpiration = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      name: user.name.split(" ")[0],
      email: user.email,
      token,
      type: "reset",
    });

    return res
      .status(200)
      .json({ message: "If user exists an email will be sent" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
export const postResetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token.trim())
      .digest("hex");
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiration: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: "no user found" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
