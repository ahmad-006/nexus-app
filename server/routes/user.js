import express from "express";
import { postUser, getUser, getTeams } from "../controllers/user.js";

const userRouter = express.Router();

userRouter.post("/", postUser);
userRouter.get("/", getUser);
userRouter.get("/teams", getTeams);

export { userRouter };
