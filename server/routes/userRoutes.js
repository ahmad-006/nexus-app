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
import { protect } from "../controllers/authController.js";

const userRouter = express.Router();

// Apply protect to all user routes
userRouter.use(protect);

userRouter
  .route("/me")
  .get(getUser)
  .patch(
    [userValidation.name],
    validate,
    patchUserProfile,
  )
  .delete(deleteUser);

userRouter.post("/me/image", uploadImage, postImage);
userRouter.get("/me/teams", getTeams);
userRouter.get("/me/tickets", getTickets);
userRouter.get("/:userId", getUserById);

export { userRouter };
