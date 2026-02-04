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

export { getTicket, getTickets };