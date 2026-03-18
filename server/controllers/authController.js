import crypto from "crypto";

import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../util/nodemailer.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";
import { promisify } from "util";

//creating a util function to sign the token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: "Lax",
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

//? ROUTE - /api/auth/signup
export const postSignUp = catchAsync(async (req, res, next) => {
  //creating new user from the information provided in the req.body
  const newUser = await User.create(req.body);

  //sending welcome email to user
  await sendEmail({
    name: newUser.name.split(" ")[0],
    email: newUser.email,
    type: "signup",
  });

  //sending response
  createSendToken(newUser, 201, res);
});

//? ROUTE - /api/auth/login
export const postLogin = catchAsync(async (req, res, next) => {
  //getting data from request body
  const { email, password } = req.body;

  //checking if either email or password is missing in body
  if (!email || !password) {
    return next(new AppError("Invalid credentials", 400));
  }

  //getting user from DB
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Invalid credentials", 401));
  }

  //comparing passwords via bcrypt's compare method
  const isValidPassword = await user.isCorrectPassword(password, user.password);
  if (!isValidPassword) {
    return next(new AppError("Invalid credentials", 401));
  }

  //sending Response
  createSendToken(user, 200, res);
});

//?ROUTE - /api/auth/forget-password
export const postForgetPassword = catchAsync(async (req, res, next) => {
  //getting email from body
  const { email } = req.body;

  //checking if email is missing
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  //getting user from DB
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({
      status: "success",
      message: "If user exists an email will be sent",
    });
  }

  //generating a random 32 bytes token from crypto module
  const token = crypto.randomBytes(32).toString("hex");

  //setting resetToken and 10min validation time for user inDB
  user.resetToken = crypto.createHash("sha256").update(token).digest("hex");
  user.resetTokenExpiration = Date.now() + 10 * 60 * 1000;
  await user.save();

  //sending reset token to user via Email
  await sendEmail({
    name: user.name.split(" ")[0],
    email: user.email,
    token,
    type: "reset",
  });

  //sending response
  return res.status(200).json({
    status: "success",
    message: "If user exists an email will be sent",
  });
});

//?ROUTE - /api/auth/reset-password/:token
export const postResetPassword = catchAsync(async (req, res, next) => {
  //getting password and confirmPassword from body
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  //checking if password or confirmPassword is missing
  if (!password || !confirmPassword) {
    return next(new AppError("Password is required", 400));
  }

  //checking if token is valid
  const hashedToken = crypto
    .createHash("sha256")
    .update(token.trim())
    .digest("hex");

  //finding with provided token and if it is in valid time
  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiration: { $gt: new Date() },
  });

  // sending response if no user is found
  if (!user) return next(new AppError("Token is invalid or has expired", 400));

  //checking if passwords match
  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  // Set new password (model hook will hash it and set passwordChangedAt)
  user.password = password;
  //deleting reset token and expiration from DB
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();

  //sending response
  createSendToken(user, 200, res);
});

//?ROUTE - /api/auth/update-password
export const postUpdatePassword = catchAsync(async (req, res, next) => {
  //getting oldPassword, newPassword and confirmPassword from body
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmPassword)
    return next(new AppError("All fields are required", 400));

  if (newPassword !== confirmPassword)
    return next(new AppError("Passwords do not match", 400));

  const user = await User.findById(req.user.id).select("+password");

  const isCorrectPassword = await user.isCorrectPassword(
    oldPassword,
    user.password,
  );

  if (!isCorrectPassword)
    return next(new AppError("Incorrect Old Password", 400));

  // Update password (model hook will hash it and set passwordChangedAt)
  user.password = newPassword;
  await user.save();

  createSendToken(user, 200, res);
});

export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) extracting and verifying token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("Invalid token . Please login Again!", 401));
  }

  // 2) decoding the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check whether the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("User no longer exists", 401));
  }
  req.user = currentUser;
  // 4) Checking If user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again.", 401),
    );
  }

  //ACCESS TO PROTECTED ROUTE
  next();
});
