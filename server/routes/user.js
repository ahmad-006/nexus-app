import express from "express";
import {
  getUser,
  getTeams,
  patchUserProfile,
  deleteUser,
  getTickets,
  getUserById,
} from "../controllers/user.js";
import { validate } from "../middleware/validate.js";
import { userValidation } from "../middleware/validator.js";

const userRouter = express.Router();

userRouter
  .route("/me")
  .get(getUser)
  .patch(
    [userValidation.name],
    validate,
    patchUserProfile,
  )
  .delete(deleteUser);

userRouter.get("/me/teams", [userValidation.email], validate, getTeams);
userRouter.get("/me/ticket", [userValidation.email], validate, getTickets);
userRouter.get("/:userId", [userValidation.email], validate, getUserById);

export { userRouter };
