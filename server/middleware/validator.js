import { body, check } from "express-validator";
import { User } from "../models/user";

export const userValidation = {
  email: body("email")
    .trim()
    .isLength({ min: 5 })
    .withMessage("An email must have minimum of 5 characters")
    .normalizeEmail()
    .isEmail()
    .withMessage("Please Enter a valid email")
    .custom(async (value) => {
      const user = await User.exists({ email: value });
      if (!user) throw new Error("User not found");
    }),
  name: body("name")
    .trim()
    .isLength({ min: 5 })
    .withMessage("A name must have minimum of 5 characters"),
  password: body("password")
    .trim()
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.",
    ),
  confirmPassword: body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match");
    return true;
  }),
  token: check("token")
    .isHexadecimal()
    .isLength({ min: 64, max: 64 })
    .withMessage("invalid Token"),
};

const ticketValidationBase = {
  status: () =>
    body("status")
      .isIn(["TODO", "IN_PROGRESS", "DONE"])
      .withMessage("Invalid status"),
  assigneeId: () =>
    body("assigneeId").isMongoId().withMessage("Invalid Assignee"),
};

export const ticketValidation = {
  title: body("title")
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  description: body("description")
    .isLength({ min: 10 })
    .withMessage("Title must be atleast 10 characters long"),
  priority: body("priority")
    .isIn(["LOW", "MEDIUM", "HIGH"])
    .withMessage("Invalid Priority"),
  reporterId: check("reporterId").isMongoId().withMessage("Invalid Reporter"),
  teamId: check("teamId").isMongoId().withMessage("Invalid Team"),
  get optionalStatus() {
    return ticketValidationBase.status().optional({ values: "falsy" });
  },
  get createStatus() {
    return ticketValidationBase.status().notEmpty();
  },
  optionalAssignee() {
    return ticketValidationBase.assigneeId().optional({ values: "falsy" });
  },
  createAssignee() {
    return ticketValidationBase.assigneeId().notEmpty();
  },
};

export const teamValidation = {
  name: body("name")
    .trim()
    .isLength({ min: 5 })
    .withMessage("A name must have minimum of 5 characters"),
  owenerId: check("ownerId").isMongoId().withMessage("Invalid Owner"),
  userId: check("userId").isMongoId().withMessage("Invalid User"),
  teamId: check("id").isMongoId().withMessage("Invalid Team"),
};
