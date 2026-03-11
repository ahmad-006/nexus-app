import express from "express";
import {
  postForgetPassword,
  postLogin,
  postResetPassword,
  postSignUp,
} from "../controllers/authController.js";
import { authValidation } from "../middleware/validator.js";
import { validate } from "../middleware/validate.js";

const authRouter = express.Router();

authRouter.post("/login", [authValidation.email], validate, postLogin);
authRouter.post(
  "/signup",
  [
    authValidation.email,
    authValidation.name,
    authValidation.password,
    authValidation.confirmPassword,
  ],
  validate,
  postSignUp,
);
authRouter.post(
  "/forget-password",
  [authValidation.email],
  validate,
  postForgetPassword,
);
authRouter.post(
  "/reset-password/:token",
  [authValidation.password, authValidation.confirmPassword],
  validate,
  postResetPassword,
);

export { authRouter };
