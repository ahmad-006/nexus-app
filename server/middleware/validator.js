import { body, check } from "express-validator";
import { User } from "../models/User.js";
import { AppError } from "../util/appError.js";

export const authValidation = {
  email: body("email")
    .notEmpty()
    .trim()
    .isLength({ min: 5 })
    .withMessage("An email must have minimum of 5 characters")
    .normalizeEmail()
    .isEmail()
    .withMessage("Please Enter a valid email"),
  name: body("name")
    .notEmpty()
    .trim()
    .isLength({ min: 5 })
    .withMessage("A name must have minimum of 5 characters"),
  password: body("password")
    .notEmpty()
    .trim()
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.",
    ),
  oldPassword: body("oldPassword")
    .notEmpty()
    .trim()
    .withMessage("Current password is required"),
  newPassword: body("newPassword")
    .notEmpty()
    .trim()
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.",
    ),
  confirmPassword: body("confirmPassword").custom((value, { req }) => {
    if (value !== (req.body.newPassword || req.body.password))
      throw new Error("Passwords do not match");
    return true;
  }),
  token: check("token")
    .notEmpty()
    .trim()
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
    .notEmpty()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  updateTitle: body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  
  description: body("description")
    .notEmpty()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be atleast 10 characters long"),
  updateDescription: body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be atleast 10 characters long"),
  
  priority: body("priority")
    .toUpperCase()
    .notEmpty()
    .isIn(["LOW", "MEDIUM", "HIGH"])
    .withMessage("Invalid Priority"),
  updatePriority: body("priority")
    .optional()
    .toUpperCase()
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
  get optionalAssignee() {
    return ticketValidationBase.assigneeId().optional({ values: "falsy" });
  },
  get createAssignee() {
    return ticketValidationBase.assigneeId().notEmpty();
  },
  position: body("position")
    .notEmpty()
    .withMessage("Position is required")
    .isNumeric()
    .withMessage("Position must be a valid number"),
};

export const teamValidation = {
  name: body("name")
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage("Workspace name must be between 2 and 60 characters"),
  userId: check("userId").notEmpty().isMongoId().withMessage("Invalid User"),
  teamId: check("teamId").notEmpty().isMongoId().withMessage("Invalid Team"),
  memberIdentifier: body().custom((value, { req }) => {
    const { email, userId } = req.body;
    if (!email && !userId) {
      throw new Error("Email or User ID is required");
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new Error("Please provide a valid email address");
    }
    if (userId && !/^[0-9a-fA-F]{24}$/.test(userId)) {
      throw new Error("Invalid User ID format");
    }
    return true;
  }),
};

export const userValidation = {
  name: check("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be between 2 and 60 characters"),
  userId: check("userId").notEmpty().isMongoId().withMessage("Invalid User"),
};
