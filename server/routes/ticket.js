import express from "express";
import {
  getTickets,
  postTicket,
  patchTicket,
  deleteTicket,
  getTicket,
  patchTicketStatus,
} from "../controllers/ticket.js";
import { isAdmin, isMember } from "../middleware/role-check.js";

const Router = express.Router();

Router.route("/").get(getTickets).post(postTicket);
Router.route("/:id").get(getTicket).patch(patchTicket).delete(deleteTicket);
Router.route("/:id/status").patch(isMember, patchTicketStatus);

export default Router;
