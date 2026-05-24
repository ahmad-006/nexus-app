import { Team } from "../models/Team.js";
import { Ticket } from "../models/Ticket.js";
import { User } from "../models/User.js";
import { Comment } from "../models/Comment.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";
import { APIFeatures } from "../util/apiFeatures.js";
import { sendEmail } from "../util/nodemailer.js";
import { Types } from "mongoose";
import { socketManager } from "../util/socket.js";
import { logActivity } from "./activityController.js";
import { imagekit, upload } from "../util/imagekit.js";

// MULTER MIDDLEWARE FOR MULTI-FILE UPLOAD
export const uploadTicketFiles = upload.array("files", 5); // Allow up to 5 files

/**
 * @desc    Fetch all the tickets belonging to a specific team
 * @route   GET /api/tickets/team/:teamId
 * @access  Private (Member)
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

/**
 * @desc    Fetch a single ticket by ID
 * @route   GET /api/tickets/:ticketId
 * @access  Public
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

/**
 * @desc    create a ticket in the specific team
 * @route   POST /api/tickets/team/:teamId
 * @access  Private (Member or Admin)
 */
const postTicket = catchAsync(async (req, res, next) => {
  const { title, description, priority, dueDate } = req.body;
  const { teamId } = req.params;
  const { id: userId } = req.user;

  if (!teamId || !userId) {
    return next(new AppError("teamId and userId are required", 400));
  }

  const lastTicket = await Ticket.findOne({ teamId, status: "TODO" }).sort("-position");
  const position = lastTicket ? lastTicket.position + 1024 : 1024;

  const ticket = new Ticket({
    title,
    description,
    priority: priority.toUpperCase(),
    teamId: teamId,
    assigneeId: null,
    reporterId: userId,
    dueDate,
    position,
  });
  const savedTicket = await ticket.save();

  //LOGGING ACTIVITY IN THE ACTIVITY LOG
  logActivity({
    userId,
    action: "TICKET_CREATED",
    resourceType: "Ticket",
    resourceId: savedTicket._id,
    teamId,
    details: {
      title,
      description,
      priority,
      dueDate,
    },
  });

  // --- REAL-TIME EMISSION ---
  const io = socketManager.getIO();
  io.to(`team_${teamId}`).emit("ticket_created", {
    ticket: savedTicket,
    createdBy: req.user.name,
  });

  res.status(201).json({
    status: "success",
    data: {
      ticket: savedTicket,
    },
  });
});

/**
 * @desc    Update a specific ticket by ID
 * @route   PATCH /api/tickets/:ticketId
 * @access  Private (Admin or Reporter)
 */
const patchTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { title, description, priority, dueDate } = req.body;
  const updatedData = {};

  //finding the ticket and storing it in oldTicket
  const oldTicket = await Ticket.findById(ticketId);
  if (!oldTicket) return next(new AppError("Ticket not found", 404));

  //adding changed fields in updated data to update
  if (title) updatedData.title = title;
  if (description) updatedData.description = description;
  if (priority) updatedData.priority = priority;
  if (dueDate) updatedData.dueDate = dueDate;

  //throwing update if no field is changed
  if (Object.keys(updatedData).length === 0) {
    return next(new AppError("Nothing to update", 400));
  }

  //updating the ticket
  const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, updatedData, {
    runValidators: true,
    new: true,
  });

  // --- SPECIFIC LOGGING LOGIC ---
  // 1. Log Priority Change separately if it occurred
  if (priority && oldTicket.priority !== updatedTicket.priority) {
    logActivity({
      userId: req.user.id,
      action: "TICKET_PRIORITY_UPDATED",
      resourceType: "Ticket",
      resourceId: updatedTicket._id,
      teamId: oldTicket.teamId,
      details: {
        oldPriority: oldTicket.priority,
        newPriority: updatedTicket.priority,
      },
    });
  }

  // 2. Log Title, Description or Due Date changes under a general update
  if (title || description || dueDate) {
    logActivity({
      userId: req.user.id,
      action: "TICKET_UPDATED",
      resourceType: "Ticket",
      resourceId: updatedTicket._id,
      teamId: oldTicket.teamId,
      details: {
        titleChanged: !!title && oldTicket.title !== updatedTicket.title,
        descriptionChanged:
          !!description && oldTicket.description !== updatedTicket.description,
        dueDateChanged: !!dueDate && oldTicket.dueDate !== updatedTicket.dueDate,
      },
    });
  }

  //sending the response
  res.status(200).json({
    status: "success",
    data: {
      ticket: updatedTicket,
    },
  });
});

/**
 * @desc    Fetch all the tickets belonging to a specific team
 * @route   PATCH /api/tickets/team/:ticketId/status
 * @access  Private (Member)
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

  //LOGGING ACTIVITY
  logActivity({
    userId: req.user.id,
    action: "TICKET_STATUS_UPDATED",
    resourceType: "Ticket",
    resourceId: updateTicket._id,
    teamId: oldTicket.teamId,
    details: {
      oldStatus: currentStatus,
      newStatus,
    },
  });

  // LOG SYSTEM HISTORY
  await Comment.create({
    ticketId,
    authorId: req.user.id,
    type: "system",
    text: `changed status from ${currentStatus} to ${newStatus}`,
  });

  // SEND EMAIL NOTIFICATION (Non-blocking)
  const reporter = await User.findById(oldTicket.reporterId);
  if (reporter) {
    sendEmail({
      name: reporter.name.split(" ")[0],
      email: reporter.email,
      type: "statusUpdate",
      ticketTitle: oldTicket.title,
      status: newStatus,
    }).catch((err) =>
      console.error("Status Update Email Failed:", err.message),
    );
  }

  // --- REAL-TIME EMISSION ---
  const io = socketManager.getIO();
  io.to(`team_${oldTicket.teamId.toString()}`).emit("ticket_status_updated", {
    ticketId: updateTicket._id,
    newStatus: updateTicket.status,
    updatedBy: req.user.name,
    title: updateTicket.title,
  });

  //sending response
  return res.status(200).json({
    status: "success",
    data: {
      ticket: updateTicket,
    },
  });
});

/**
 * @desc    Assigning the ticket to user
 * @route   PATCH /api/tickets/:ticketId/assign
 * @access  Private (Admin)
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

    //LOGGING SYSTEM ACTIVITY
    logActivity({
      userId: req.user.id,
      action: "TICKET_UNASSIGNED",
      resourceType: "Ticket",
      resourceId: updatedTicket._id,
      teamId: ticket.teamId,
      details: {
        assigneeId: null,
      },
    });

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

  //LOGGING SYSTEM EVENT
  logActivity({
    userId: req.user.id,
    action: "TICKET_ASSIGNED",
    resourceType: "Ticket",
    resourceId: response._id,
    teamId: ticket.teamId,
    details: {
      oldAssigneeId: ticket.assigneeId || null,
      newAssigneeId: assigneeId,
    },
  });

  // LOG SYSTEM HISTORY
  const assigneeName = assigneeId
    ? (await User.findById(assigneeId))?.name || "Unknown User"
    : "None";

  await Comment.create({
    ticketId,
    authorId: req.user.id,
    type: "system",
    text: `assigned this ticket to: ${assigneeName}`,
  });

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

  // --- REAL-TIME EMISSION ---
  const io = socketManager.getIO();
  io.to(`team_${ticket.teamId.toString()}`).emit("ticket_assigned", {
    ticketId: response._id,
    assigneeId,
    assigneeName,
    title: ticket.title,
  });

  return res
    .status(200)
    .json({ status: "success", data: { ticket: response } });
});

/**
 * @desc    Deleting a ticket by Id
 * @route   DELETE /api/tickets/:ticketId
 * @access  Private (Admin)
 */
const deleteTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;

  // We need to find the ticket first to get the teamId for the socket emission
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return next(new AppError("Ticket not found", 404));

  const teamId = ticket.teamId.toString();

  //deleting the ticket
  await Ticket.findByIdAndDelete(ticketId);

  //LOGGING ACTIVITY
  logActivity({
    userId: req.user.id,
    action: "TICKET_DELETED",
    resourceType: "Ticket",
    resourceId: ticketId,
    teamId,
    details: {
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
    },
  });

  // --- REAL-TIME EMISSION ---
  const io = socketManager.getIO();
  io.to(`team_${teamId}`).emit("ticket_deleted", {
    ticketId,
  });

  //sending the response
  res.status(204).json({ status: "success", data: null });
});

/**
 * @desc    Fetch all the stats of tickets belonging to a specific team
 * @route   GET /api/tickets/team/:teamId/stats
 * @access  Private (Member)
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

/**
 * @desc    Upload multiple attachments to a specific ticket via ImageKit
 * @route   POST /api/tickets/:ticketId/attachments
 * @access  Private (Member)
 */
export const postTicketAttachments = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;

  if (!req.files || req.files.length === 0) {
    return next(new AppError("No files uploaded", 400));
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return next(new AppError("Ticket not found", 404));

  const uploadPromises = req.files.map((file) => {
    return imagekit.upload({
      file: file.buffer,
      fileName: `ticket-${ticketId}-${Date.now()}-${file.originalname}`,
      folder: "/nexus-tickets",
    });
  });

  const uploadResults = await Promise.all(uploadPromises);

  const newAttachments = uploadResults.map((result) => ({
    url: result.url,
    name: result.name,
    fileId: result.fileId,
  }));

  const updatedTicket = await Ticket.findByIdAndUpdate(
    ticketId,
    { $push: { attachments: { $each: newAttachments } } },
    { new: true },
  );

  // LOG ACTIVITY
  logActivity({
    userId: req.user.id,
    action: "TICKET_ATTACHMENTS_ADDED",
    resourceType: "Ticket",
    resourceId: ticketId,
    teamId: ticket.teamId,
    details: { count: newAttachments.length },
  });

  return res.status(200).json({
    status: "success",
    data: {
      attachments: updatedTicket.attachments,
    },
  });
});


const patchReorderTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { status, position } = req.body;

  if (!position) {
    return next(new AppError('Position is required', 400));
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(
    ticketId,
    {
      position,
      status,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedTicket) {
    return next(new AppError('Ticket not found', 404));
  }

  const io = socketManager.getIO();
  io.to(`team_${updatedTicket.teamId.toString()}`).emit('ticket_reordered', {
    ticketId: updatedTicket._id,
    newStatus: updatedTicket.status,
    newPosition: updatedTicket.position,
  });

  return res.status(200).json({
    status: 'success',
    data: {
      ticket: updatedTicket,
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
  patchReorderTicket,
};
