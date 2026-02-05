import express from "express";
import { getTeams, postUser } from "../controllers/user.js";
import { isAdmin } from "../middleware/role-check.js";

const userRouter = express.Router();

userRouter.route("/").post(postUser);
userRouter.route("/search").get(isAdmin, getUser);
userRouter.route("/teams").get(getTeams);

export { userRouter };
