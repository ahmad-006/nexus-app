import { Ticket } from "../models/ticket";

// GET /api/tickets
const getTickets = async (req, res) => {
  try {
    const teamId = req.headers["teamid"];
    const tickets = await Ticket.fetchAll(teamId);
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
    const ticket = await Ticket.getById(id);
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
  const { _id } = req.user;

  try {
    const ticket = new Ticket(title, description, priority, _id);
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
  const { title, description, status: newStatus } = req.body;
  const updatedData = {};

  try {
    const oldData = await Ticket.getById(id);
    if (!oldData) return res.status(404).json({ message: "Ticket not found" });

    if (title) updatedData.title = title;
    if (description) updatedData.description = description;

    if (newStatus) {
      const allowedTransitions = {
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
    }

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    await Ticket.updateById(id, updatedData);

    res.status(200).json({
      message: "Ticket updated successfully",
      ticket: { ...oldData, ...updatedData },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update ticket", error: err.message });
  }
};

// DELETE /api/tickets/:id
const deleteTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Ticket.DeleteById(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete ticket", error: err.message });
  }
};

export { getTicket, getTickets, postTicket, patchTicket, deleteTicket };