import express from "express";
import { postUser } from "../controllers/user";

const userRouter = express.Router();

userRouter.route("/").post(postUser);

export { userRouter };
