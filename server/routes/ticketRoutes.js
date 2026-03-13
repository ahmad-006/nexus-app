import express from "express";
import {
  getTickets,
  postTicket,
  patchTicket,
  deleteTicket,
  getTicket,
  patchTicketStatus,
  assignToUser,
} from "../controllers/ticketController.js";
import { isAdmin, isMember } from "../middleware/role-check.js";
import { ticketValidation } from "../middleware/validator.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../controllers/authController.js";

const ticketRouter = express.Router();
const ticketUpdateValidation = [
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

/*
  ?By TEAMID:
  Creating a ticket
  Getting all the tickets
*/

ticketRouter
  .route("/team/:teamId")
  .get(protect, getTickets)
  .post(ticketUpdateValidation, validate, postTicket);

/*
  ?By ID:
  Getting a ticket 
  Updating a ticket
  deleting a ticket 
*/

ticketRouter
  .route("/:ticketId")
  .get(getTicket)
  .patch(isAdmin, ticketUpdateValidation, validate, patchTicket)
  .delete(isAdmin, deleteTicket);

//Updating the ticket status
ticketRouter
  .route("/:ticketId/status")
  .patch(
    isMember,
    [ticketValidation.createStatus],
    validate,
    patchTicketStatus,
  );

//Assigning a ticket
ticketRouter
  .route("/:ticketId/assign")
  .patch(isAdmin, [ticketValidation.createAssignee], validate, assignToUser);

export { ticketRouter };
