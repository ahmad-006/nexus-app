import { Team } from "../models/Team.js";
import { Ticket } from "../models/Ticket.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";

// Fetch all tickets that belong to a specific team
const getTickets = catchAsync(async (req, res, next) => {
  const teamId = req.headers["teamid"];
  const tickets = await Ticket.find({ teamId });
  res.status(200).json({
    message: "All tickets retrieved successfully",
    count: tickets.length,
    tickets,
  });
});

// Get details for a specific ticket by its ID
const getTicket = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const ticket = await Ticket.findById(id);
  if (!ticket) return next(new AppError("Ticket not found", 404));

  res.status(200).json({
    message: "Ticket retrieved successfully",
    ticket,
  });
});

// Create a new ticket and set the reporter to the current user
const postTicket = catchAsync(async (req, res, next) => {
  const { title, description, priority } = req.body;
  const { teamid, userid } = req.headers;

  if (!teamid || !userid) {
    return next(new AppError("teamid and userid headers are required", 400));
  }
  const ticket = new Ticket({
    title,
    description,
    priority: priority.toUpperCase(),
    teamId: teamid,
    assigneeId: null,
    reporterId: userid,
  });
  const savedTicket = await ticket.save();

  res.status(201).json({
    message: "Ticket created successfully",
    ticket: savedTicket,
  });
});

// Update ticket info like title, description or priority
const patchTicket = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, priority } = req.body;
  const updatedData = {};

  const oldData = await Ticket.findById(id);
  if (!oldData) return next(new AppError("Ticket not found", 404));

  if (title) updatedData.title = title;
  if (description) updatedData.description = description;
  if (priority) updatedData.priority = priority;

  if (Object.keys(updatedData).length === 0) {
    return next(new AppError("Nothing to update", 400));
  }

  const response = await Ticket.findByIdAndUpdate(id, updatedData, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    message: "Ticket updated successfully",
    ticket: response,
  });
});

// Handle status changes based on the allowed workflow transitions
export const patchTicketStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status: newStatus } = req.body;
  const updatedData = {};
  const oldData = await Ticket.findById(id);

  if (!oldData) return next(new AppError("Ticket not found", 404));

  // Handle the first time status is being set
  if (!oldData.status) {
    if (newStatus !== "TODO")
      return next(
        new AppError(
          "Cannot set status other than TODO for the first time",
          400,
        ),
      );
    else oldData.status = "notSet";
  }
  if (oldData.status === newStatus)
    return next(new AppError("Nothing to update...", 400));

  if (!newStatus) return next(new AppError("Status is required.", 400));

  // Logic to prevent jumping states (e.g. TODO to DONE)
  const allowedTransitions = {
    notSet: ["TODO"],
    TODO: ["IN_PROGRESS"],
    IN_PROGRESS: ["TODO", "DONE"],
    DONE: ["IN_PROGRESS", "TODO"],
  };

  if (!allowedTransitions[oldData.status].includes(newStatus)) {
    return next(
      new AppError(
        `Invalid transition from ${oldData.status} to ${newStatus}`,
        400,
      ),
    );
  }

  updatedData.status = newStatus;
  const response = await Ticket.findByIdAndUpdate(id, updatedData, {
    runValidators: true,
    new: true,
  });

  return res.status(200).json({
    message: "Ticket updated successfully",
    ticket: response,
  });
});

// Assign a ticket to a user and check if they belong to the team
export const assignToUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { assigneeId } = req.body;

  const ticket = await Ticket.findById(id);
  if (!ticket) return next(new AppError("Ticket not found", 404));

  // Unassign ticket if no assigneeId is provided
  if (!assigneeId) {
    const response = await Ticket.findByIdAndUpdate(
      id,
      { assigneeId: null },
      { new: true },
    );
    return res
      .status(200)
      .json({ message: "Ticket unassigned", ticket: response });
  }

  // Check if the user is actually a member of the team
  const team = await Team.findById(ticket.teamId);
  const isMember = team.members.some(
    (mId) => mId.toString() === assigneeId.toString(),
  );

  if (!isMember) {
    return next(new AppError("User is not of this Team", 400));
  }

  const response = await Ticket.findByIdAndUpdate(
    id,
    { assigneeId },
    { new: true },
  );
  return res
    .status(200)
    .json({ message: "Ticket Assigned successfully", ticket: response });
});

// Remove a ticket from the database
const deleteTicket = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await Ticket.findByIdAndDelete(id);
  if (!result) return next(new AppError("Ticket not found", 404));
  res.status(200).json({ message: "Ticket deleted successfully" });
});

export { getTicket, getTickets, postTicket, patchTicket, deleteTicket };
