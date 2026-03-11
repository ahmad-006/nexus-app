import express from "express";
import {
  getUser,
  getTeams,
  patchUserProfile,
  deleteUser,
  getUserById,
  getTickets,
  uploadImage,
  postImage,
} from "../controllers/userController.js";
import { validate } from "../middleware/validate.js";
import { userValidation } from "../middleware/validator.js";

const userRouter = express.Router();

userRouter
  .route("/me")
  .get(getUser)
  .patch(
    [userValidation.name, userValidation.userId],
    validate,
    patchUserProfile,
  )
  .delete(deleteUser);
userRouter.post("/me/image", uploadImage, postImage);
userRouter.get("/me/teams", [userValidation.userId], validate, getTeams);
userRouter.get("/me/tickets", [userValidation.userId], validate, getTickets);
userRouter.get("/:userId", [userValidation.userId], validate, getUserById);

export { userRouter };
