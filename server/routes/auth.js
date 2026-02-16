import express from "express";
import {
  postForgetPassword,
  postLogin,
  postResetPassword,
  postSignUp,
} from "../controllers/auth.js";

const authRouter = express.Router();

authRouter.post("/login", postLogin);
authRouter.post("/signup", postSignUp);
authRouter.post("/forget-password", postForgetPassword);
authRouter.post("/reset-password/:token", postResetPassword);

export { authRouter };
