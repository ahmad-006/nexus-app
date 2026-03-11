import { Team } from "../models/Team.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";

const isMember = catchAsync(async (req, res, next) => {
  const { teamid, userid } = req.headers;
  if (!teamid || !userid)
    return next(new AppError("teamid and userid required", 400));
  const isMember = await Team.findOne({ _id: teamid, members: userid });
  if (!isMember)
    return next(new AppError("Access Denied! Not a team member", 403));
  next();
});

const isAdmin = catchAsync(async (req, res, next) => {
  const { teamid, userid } = req.headers;
  if (!teamid || !userid)
    return next(new AppError("teamid and userid required", 400));
  const isAdmin = await Team.findOne({ _id: teamid, admins: userid });
  if (!isAdmin) {
    return next(new AppError("Access Denied! Not an Admin", 403));
  }
  next();
});

export { isAdmin, isMember };
