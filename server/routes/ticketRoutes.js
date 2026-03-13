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
import {
  isMember,
  restrictTo,
  isAdminOrReporter,
} from "../middleware/role-check.js";
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
  .get(protect, isMember, getTickets)
  .post(protect, isMember, ticketUpdateValidation, validate, postTicket);

/*
  ?By ID:
  Getting a ticket 
  Updating a ticket
  deleting a ticket 
*/

ticketRouter
  .route("/:ticketId")
  .get(protect, getTicket) // Any logged in user can see a ticket if they have the ID
  .patch(protect, isAdminOrReporter, ticketUpdateValidation, validate, patchTicket)
  .delete(protect, isAdminOrReporter, deleteTicket);

//Updating the ticket status
ticketRouter
  .route("/:ticketId/status")
  .patch(
    protect,
    isMember, // This needs a team context, we might need a custom check here if teamId isn't in URL
    [ticketValidation.createStatus],
    validate,
    patchTicketStatus,
  );

//Assigning a ticket
ticketRouter
  .route("/:ticketId/assign")
  .patch(
    protect,
    isMember,
    restrictTo("admin"),
    [ticketValidation.createAssignee],
    validate,
    assignToUser,
  );

export { ticketRouter };
