import express from "express";
import {
  getUser,
  getTeams,
  patchUserProfile,
  deleteUser,
  getTickets,
  getUser,
} from "../controllers/user.js";

const userRouter = express.Router();

userRouter.route("/me").get(getUser).patch(patchUserProfile).delete(deleteUser);
userRouter.get("/me/teams", getTeams);
userRouter.get("/me/ticket", getTickets);
userRouter.get("/:userId", getUser);

export { userRouter };
