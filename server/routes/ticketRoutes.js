import express from "express";
import {
  getTickets,
  postTicket,
  patchTicket,
  deleteTicket,
  getTicket,
  patchTicketStatus,
  assignToUser,
  getStats,
} from "../controllers/ticketController.js";
import {
  isMember,
  restrictTo,
  isAdminOrReporter,
} from "../middleware/role-check.js";
import { ticketValidation } from "../middleware/validator.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../controllers/authController.js";
import { commentRouter } from "./commentRoutes.js";

const ticketRouter = express.Router();

// Mounting comment router for nested routes: /api/tickets/:ticketId/comments
ticketRouter.use("/:ticketId/comments", commentRouter);

const ticketUpdateValidation = [
  ticketValidation.title,
  ticketValidation.description,
  ticketValidation.priority,
  ticketValidation.optionalAssignee,
  ticketValidation.optionalStatus,
];

/*
ROUTES
*/

/*
Getting all the tickets
Creating a ticket
*/

ticketRouter
  .route("/team/:teamId")
  .get(protect, isMember, getTickets)
  .post(protect, isMember, ticketUpdateValidation, validate, postTicket);

// Get ticket stats for a specific team
ticketRouter.route("/team/:teamId/stats").get(protect, isMember, getStats);

/*
  Getting a ticket 
  Updating a ticket
  deleting a ticket 
*/

ticketRouter
  .route("/:ticketId")
  .get(protect, getTicket) // Any logged in user can see a ticket if they have the ID
  .patch(
    protect,
    isAdminOrReporter,
    ticketUpdateValidation,
    validate,
    patchTicket,
  )
  .delete(protect, isAdminOrReporter, deleteTicket);

//Updating the ticket status
ticketRouter.route("/:ticketId/status").patch(
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
