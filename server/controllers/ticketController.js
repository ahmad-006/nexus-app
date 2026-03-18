import { Team } from "../models/Team.js";
import { Ticket } from "../models/Ticket.js";
import { User } from "../models/User.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";
import { APIFeatures } from "../util/apiFeatures.js";
import { sendEmail } from "../util/nodemailer.js";
import { Types } from "mongoose";

/*
@desc    Fetch all the tickets belonging to a specific team
@route   GET /api/tickets/team/:teamId
@access  Private (Member)  
*/
const getTickets = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;

  // 1) EXECUTE QUERY
  const features = new APIFeatures(Ticket.find({ teamId }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tickets = await features.query;

  // 2) SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

/*
@desc    Fetch a single ticket by ID
@route   GET /api/tickets/:ticketId
@access  Public 
*/

const getTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return next(new AppError("Ticket not found", 404));

  res.status(200).json({
    status: "success",
    data: {
      ticket,
    },
  });
});

/*
@desc    create a ticket in the specific team
@route   POST /api/tickets/team/:teamId
@access  Private (Member or Admin)  
*/

const postTicket = catchAsync(async (req, res, next) => {
  const { title, description, priority } = req.body;
  const { teamId } = req.params;
  const { id: userId } = req.user;

  if (!teamId || !userId) {
    return next(new AppError("teamId and userId are required", 400));
  }
  const ticket = new Ticket({
    title,
    description,
    priority: priority.toUpperCase(),
    teamId: teamId,
    assigneeId: null,
    reporterId: userId,
  });
  const savedTicket = await ticket.save();

  res.status(201).json({
    status: "success",
    data: {
      ticket: savedTicket,
    },
  });
});

/*
@desc    Update a specific ticket by ID
@route   PATCH /api/tickets/:ticketId
@access  Private (Admin or Reporter)
*/
const patchTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { title, description, priority } = req.body;
  const updatedData = {};

  //finding the ticket and storing it in oldTicket
  const oldTicket = await Ticket.findById(ticketId);
  if (!oldTicket) return next(new AppError("Ticket not found", 404));

  //adding changed fields in updated data to update
  if (title) updatedData.title = title;
  if (description) updatedData.description = description;
  if (priority) updatedData.priority = priority;

  //throwing update if no field is changed
  if (Object.keys(updatedData).length === 0) {
    return next(new AppError("Nothing to update", 400));
  }

  //updating the ticket
  const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, updatedData, {
    runValidators: true,
    new: true,
  });

  //sending the response
  res.status(200).json({
    status: "success",
    data: {
      ticket: updatedTicket,
    },
  });
});

/*
@desc    Fetch all the tickets belonging to a specific team
@route   PATCH /api/tickets/team/:ticketId/status
@access  Private (Member)  
*/

const patchTicketStatus = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { status: newStatus } = req.body;
  const updatedData = {};

  //If there is no ticket in the body
  if (!newStatus) return next(new AppError("Status is required.", 400));

  // fetching the ticket by id
  const oldTicket = await Ticket.findById(ticketId);
  if (!oldTicket) return next(new AppError("Ticket not found", 404));

  // throwing error if status is same as before
  if (oldTicket.status === newStatus)
    return next(new AppError("Nothing to update...", 400));

  // Logic to prevent jumping states (e.g. TODO to DONE)
  const allowedTransitions = {
    TODO: ["IN_PROGRESS"],
    IN_PROGRESS: ["TODO", "DONE"],
    DONE: ["IN_PROGRESS", "TODO"],
  };

  //setting current status to TODO if somehow it is undefined
  const currentStatus = oldTicket.status || "TODO";

  // If transition is not allowed (e.g, TODO to DONE)
  if (!allowedTransitions[currentStatus].includes(newStatus)) {
    return next(
      new AppError(
        `Invalid transition from ${currentStatus} to ${newStatus}`,
        400,
      ),
    );
  }

  //updating ticket
  updatedData.status = newStatus;
  const updateTicket = await Ticket.findByIdAndUpdate(ticketId, updatedData, {
    runValidators: true,
    new: true,
  });

  // SEND EMAIL NOTIFICATION (Non-blocking)
  // Fetch the reporter's email to notify them of the change
  const reporter = await User.findById(oldTicket.reporterId);
  if (reporter) {
    sendEmail({
      name: reporter.name.split(" ")[0],
      email: reporter.email,
      type: "statusUpdate",
      ticketTitle: oldTicket.title,
      status: newStatus,
    }).catch((err) => console.error("Status Update Email Failed:", err.message));
  }

  //sending response
  return res.status(200).json({
    status: "success",
    data: {
      ticket: updateTicket,
    },
  });
});

/*
@desc    Assigning the ticket to user
@route   PATCH /api/tickets/:ticketId/assign
@access  Private (Admin)  
*/
const assignToUser = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { assigneeId } = req.body;

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return next(new AppError("Ticket not found", 404));

  // UnAssign ticket if no assigneeId is provided
  if (!assigneeId) {
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { assigneeId: null },
      { new: true },
    );
    return res.status(200).json({
      status: "success",
      data: {
        ticket: updatedTicket,
      },
    });
  }

  // Check if the assigned user is actually a member of the team
  const team = await Team.findById(ticket.teamId);
  const isMember = team.members.some(
    (m) => m.userId.toString() === assigneeId.toString(),
  );

  //throwing error If user isn't member of the team
  if (!isMember) {
    return next(new AppError("User is not of this Team", 400));
  }

  const response = await Ticket.findByIdAndUpdate(
    ticketId,
    { assigneeId },
    { new: true },
  );

  // SEND EMAIL NOTIFICATION
  const assignee = await User.findById(assigneeId);
  if (assignee) {
    sendEmail({
      name: assignee.name.split(" ")[0],
      email: assignee.email,
      type: "assignment",
      ticketTitle: ticket.title,
      priority: ticket.priority,
      adminName: req.user.name,
    }).catch((err) => console.error("Assignment Email Failed:", err.message));
  }

  return res
    .status(200)
    .json({ status: "success", data: { ticket: response } });
});

/*
@desc    Deleting a ticket by Id
@route   DELETE /api/tickets/:ticketId
@access  Private (Admin)  
*/
const deleteTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  //deleting the ticket
  const result = await Ticket.findByIdAndDelete(ticketId);
  //throwing an error if there is no ticket
  if (!result) return next(new AppError("Ticket not found", 404));
  //sending the response
  res.status(204).json({ status: "success", data: null });
});

/*
@desc    Fetch all the stats of tickets belonging to a specific team
@route   GET /api/tickets/team/:teamId/stats
@access  Private (Member)  
*/

const getStats = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;
  const stats = await Ticket.aggregate([
    {
      $match: {
        teamId: new Types.ObjectId(teamId),
      },
    },
    {
      $facet: {
        totalTickets: [{ $count: "count" }],
        statusBreakdown: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              status: "$_id",
              count: 1,
            },
          },
        ],
        priorityBreakdown: [
          {
            $group: {
              _id: "$priority",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              priority: "$_id",
              count: 1,
            },
          },
        ],
      },
    },
  ]);

  const formattedStats = {
    totalTickets: stats[0].totalTickets[0]?.count || 0,
    statusBreakdown: stats[0].statusBreakdown || [],
    priorityBreakdown: stats[0].priorityBreakdown || [],
  };

  return res.status(200).json({
    status: "success",
    data: {
      stats: formattedStats,
    },
  });
});
export {
  getTicket,
  getTickets,
  postTicket,
  patchTicket,
  deleteTicket,
  getStats,
  assignToUser,
  patchTicketStatus,
};
