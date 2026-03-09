import express from "express";
import {
  postForgetPassword,
  postLogin,
  postResetPassword,
  postSignUp,
} from "../controllers/auth.js";
import { userValidation } from "../middleware/validator.js";
import { validate } from "../middleware/validate.js";

const authRouter = express.Router();

authRouter.post(
  "/login",
  [userValidation.email, userValidation.password],
  validate,
  postLogin,
);
authRouter.post(
  "/signup",
  [
    userValidation.email,
    userValidation.name,
    userValidation.password,
    userValidation.confirmPassword,
  ],
  validate,
  postSignUp,
);
authRouter.post(
  "/forget-password",
  [userValidation.email],
  validate,
  postForgetPassword,
);
authRouter.post(
  "/reset-password/:token",
  [userValidation.password, userValidation.confirmPassword],
  validate,
  postResetPassword,
);

export { authRouter };
