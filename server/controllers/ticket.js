import { Team } from "../models/teams";
import { Ticket } from "../models/ticket";

// GET /api/tickets
const getTickets = async (req, res) => {
  try {
    const teamId = req.headers["teamid"];
    const tickets = await Ticket.find({ teamId });
    res.status(200).json({
      message: "All tickets retrieved successfully",
      count: tickets.length,
      tickets,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// GET /api/tickets/:id
const getTicket = async (req, res) => {
  const { id } = req.params;

  try {
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.status(200).json({
      message: "Ticket retrieved successfully",
      ticket,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve ticket", error: err.message });
  }
};

// POST /api/tickets
const postTicket = async (req, res) => {
  const { title, description, priority } = req.body;
  const { _id: reporterId } = req.user;
  const teamId = req.headers["teamid"];

  try {
    const ticket = new Ticket({
      title,
      description,
      priority: priority.toLowerCase(),
      teamId,
      assigneeId: null,
      reporterId,
    });
    const savedTicket = await ticket.save();

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: savedTicket,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create ticket", error: err.message });
  }
};

// PATCH /api/tickets/:id
const patchTicket = async (req, res) => {
  const { id } = req.params;
  const { title, description, priority } = req.body;
  const updatedData = {};

  try {
    const oldData = await Ticket.findById(id);
    if (!oldData) return res.status(404).json({ message: "Ticket not found" });

    if (title) updatedData.title = title;
    if (description) updatedData.description = description;
    if (priority) updatedData.priority = priority;

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const response = await Ticket.findByIdAndUpdate(id, updatedData, {
      runValidators: true,
      new: true,
    });

    res.status(200).json({
      message: "Ticket updated successfully",
      ticket: response,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update ticket", error: err.message });
  }
};

//Patch /api/tickets/:id/status
export const patchTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;
    const updatedData = {};
    const oldData = await Ticket.findById(id);
    if (!oldData) return res.status(404).json({ message: "Ticket not found" });
    if (!oldData.status) {
      if (newStatus !== "TODO")
        throw new Error("Cannot set status other than TODO for the first time");
      else oldData.status = "notSet";
    }
    if (oldData.status === newStatus) throw new Error("Nothing to update...");

    if (!newStatus)
      return res.status(400).json({ message: "Status is required." });

    const allowedTransitions = {
      notSet: ["TODO"],
      TODO: ["IN_PROGRESS"],
      IN_PROGRESS: ["TODO", "DONE"],
      DONE: ["IN_PROGRESS", "TODO"],
    };

    if (!allowedTransitions[oldData.status].includes(newStatus)) {
      return res.status(400).json({
        message: `Invalid transition from ${oldData.status} to ${newStatus}`,
      });
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
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Failed to update ticket", error: err.message });
  }
};

//Patch /api/tickets/:id/assign
export const assignToUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;

    const ticket = await Ticket.findById(id);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (!assigneeId) {
      await Ticket.updateById(id, { assigneeId: null });
      return res.status(200).json({ message: "Ticket unassigned" });
    }

    const team = await Team.findById(ticket.teamId);
    const isMember = team.members.some(
      (mId) => mId.toString() === assigneeId.toString(),
    );

    if (!isMember) {
      throw new Error("User is not of this Team");
    }
    await Ticket.updateById(id, { assigneeId });
    return res.status(200).json({ message: "Ticket Assigned successfully" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Ticket Assigning failed", error: error.message });
  }
};

// DELETE /api/tickets/:id
const deleteTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Ticket.findByIdAndDelete(id);
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete ticket", error: err.message });
  }
};

export { getTicket, getTickets, postTicket, patchTicket, deleteTicket };
