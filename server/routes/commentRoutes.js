import express from "express";
import { protect } from "../controllers/authController.js";
import {
  getComments,
  postComment,
  deleteComment,
  patchComment,
  getReplies,
} from "../controllers/commentController.js";
import { isMember } from "../middleware/role-check.js";

const commentRouter = express.Router({ mergeParams: true });

//EVERY ROUTES REQUIRES USER TO BE LOGGED IN.....
commentRouter.use(protect);

commentRouter
  .route("/")
  //POST /api/tickets/:ticketId/comments
  .post(isMember, postComment)
  //GET /api/tickets/:ticketId/comments
  .get(isMember, getComments);

commentRouter
  .route("/:commentId")
  //PATCH /api/comments/:commentId/
  .patch(patchComment)
  //DELETE /api/comments/:commentId
  .delete(deleteComment);

commentRouter
  .route("/:commentId/replies")
  //GET /api/comments/:commentId/replies
  .get(getReplies);

export { commentRouter };
