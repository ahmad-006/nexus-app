import crypto from "crypto";

import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../util/nodemailer.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";

export const postLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Invalid credentials", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Invalid credentials", 401));
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return next(new AppError("Invalid credentials", 401));
  }

  return res.status(200).json({ message: "User logged In sucessfully", user });
});

export const postSignUp = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError("User already exists", 400));

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
});

export const postForgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString("hex");
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res
      .status(200)
      .json({ message: "If user exists an email will be sent" });
  }

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
});

export const postResetPassword = catchAsync(async (req, res, next) => {
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

  if (!user) return next(new AppError("Token is invalid or has expired", 400));

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();

  return res.status(200).json({ message: "Password reset successful" });
});
