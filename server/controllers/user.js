import { Team } from "../models/teams.js";
import { User } from "../models/user.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";
import { Ticket } from "../models/ticket.js";
import { storage as cloudinaryStorage } from "../util/cloudinary.js";
import multer from "multer";

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images", 400), false);
  }
};

const upload = multer({
  storage: cloudinaryStorage,
  fileFilter: multerFilter,
});

export const uploadImage = upload.single("image");

// Search for a user by email and return their profile without the password
export const getUser = catchAsync(async (req, res, next) => {
  const { userid } = req.headers;

  const user = await User.findById(userid).select("-password");
  return res.status(200).json({ status: "success", user });
});

// Get all teams that the current user is a part of
export const getTeams = catchAsync(async (req, res, next) => {
  const { userid } = req.headers;
  if (!userid) return next(new AppError("userid is required", 404));

  // Find teams where the user is listed in the members array
  const teams = await Team.find({ members: userid });
  if (teams.length === 0) return next(new AppError("No teams found", 404));

  return res.status(200).json({ status: "success", teams: { teams } });
});

export const getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) return next(new AppError("userId is required", 400));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  return res.status(200).json({ message: "User found", user });
});

// Going to implement when JWT is implemented
export const patchUserProfile = catchAsync(async (req, res) => {
  const { name, image } = req.body;
  const { userid } = req.headers;

  const user = await User.findByIdAndUpdate(
    userid,
    { name, image },
    { new: true, runValidators: true },
  );

  return res.status(200).json({ status: "success", user });
});
export const deleteUser = async (req, res) => {
  const { userid } = req.headers;
  await User.findByIdAndDelete(userid);
  return res
    .status(204)
    .json({ status: "success", message: "User deleted successfully" });
};
export const getTickets = async (req, res) => {
  const { userid, teamid } = req.headers;
  const tickets = await Ticket.find({
    $or: [{ reporterId: userid }, { assigneeId: userid }],
    teamId: teamid,
  });

  return res.status(200).json({ status: "success", tickets });
};

export const postImage = catchAsync(async (req, res, next) => {
  const { userid } = req.headers;
  if (!req.file) return next(new AppError("No file uploaded", 400));

  const user = await User.findByIdAndUpdate(
    userid,
    {
      image: req.file.path,
    },
    { new: true },
  );

  return res.status(200).json({ status: "success", user });
});
