import express from "express";
import {
  getTickets,
  postTicket,
  patchTicket,
  deleteTicket,
  getTicket,
  patchTicketStatus,
  assignToUser,
} from "../controllers/ticket.js";
import { isAdmin, isMember } from "../middleware/role-check.js";

const ticketRouter = express.Router();

ticketRouter.route("/").get(getTickets).post(postTicket);
ticketRouter.route("/:id")
  .get(getTicket)
  .patch(isAdmin, patchTicket)
  .delete(isAdmin, deleteTicket);
ticketRouter.route("/:id/status").patch(isMember, patchTicketStatus);
ticketRouter.route("/:id/assign").patch(isAdmin, assignToUser);

export { ticketRouter };
