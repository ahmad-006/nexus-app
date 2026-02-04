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

const Router = express.Router();

Router.route("/").get(getTickets).post(postTicket);
Router.route("/:id")
  .get(getTicket)
  .patch(patchTicket)
  .delete(isAdmin, deleteTicket);
Router.route("/:id/status").patch(isMember, patchTicketStatus);
Router.route("/:id/assign").patch(isAdmin, assignToUser);

export default Router;
