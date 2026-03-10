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
import { ticketValidation } from "../middleware/validator.js";
import { validate } from "../middleware/validate.js";

const ticketRouter = express.Router();
const ticketUpdateRules = [
  ticketValidation.title,
  ticketValidation.description,
  ticketValidation.priority,
  ticketValidation.teamId,
  ticketValidation.optionalAssignee,
  ticketValidation.optionalStatus,
];

/*
ROUTES
*/

ticketRouter
  .route("/")
  .get(getTickets)
  .post(ticketUpdateRules, validate, postTicket);
ticketRouter
  .route("/:id")
  .get(getTicket)
  .patch(
    isAdmin,
    [
      ticketValidation.title,
      ticketValidation.description,
      ticketValidation.priority,
      ticketValidation.teamId,
      ticketValidation.optionalAssignee,
      ticketValidation.optionalStatus,
    ],
    validate,
    patchTicket,
  )
  .delete(isAdmin, deleteTicket);
ticketRouter
  .route("/:id/status")
  .patch(
    isMember,
    [ticketValidation.createStatus],
    validate,
    patchTicketStatus,
  );
ticketRouter
  .route("/:id/assign")
  .patch(isAdmin, [ticketValidation.createAssignee], validate, assignToUser);

export { ticketRouter };
