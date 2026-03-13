import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";
import { Ticket } from "../models/Ticket.js";

/**
 * @desc    Verify if the user is a member of the current team context
 *          Can find teamId via req.params.teamId OR req.params.ticketId (Smart Context)
 */
const isMember = catchAsync(async (req, res, next) => {
  let { teamId } = req.params;
  const { ticketId } = req.params;
  const { teams } = req.user;

  // 1) If teamId is missing but ticketId exists, find the ticket to get teamId
  if (!teamId && ticketId) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return next(new AppError("Ticket not found", 404));
    teamId = ticket.teamId.toString();
  }

  // 2) If still no teamId, return error
  if (!teamId) {
    return next(new AppError("Team context is required for this action", 400));
  }

  // 3) Find the team in the user's teams array (In-Memory!)
  const userTeam = teams.find(
    (team) => team.teamId.toString() === teamId.toString(),
  );

  if (!userTeam) {
    return next(
      new AppError("Access Denied! You are not a member of this team.", 403),
    );
  }

  // 4) Attach the role to the request for the next middleware (e.g., restrictTo)
  req.teamRole = userTeam.role;
  next();
});

/**
 * @desc    Authorization factory to restrict access based on team roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.teamRole) {
      return next(
        new AppError(
          "Authorization context missing. isMember must be called first.",
          500,
        ),
      );
    }

    if (!roles.includes(req.teamRole)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

/**
 * @desc    Allow access if the user is the reporter OR an admin of the ticket's team
 */
const isAdminOrReporter = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) return next(new AppError("Ticket not found", 404));

  const isReporter = ticket.reporterId.toString() === req.user._id.toString();
  const teamId = ticket.teamId.toString();

  const userTeam = req.user.teams.find(
    (team) => team.teamId.toString() === teamId && team.role === "admin",
  );

  if (!isReporter && !userTeam) {
    return next(
      new AppError(
        "Access Denied! Only the reporter or team admins can edit this ticket.",
        403,
      ),
    );
  }

  next();
});

export { isMember, restrictTo, isAdminOrReporter };
