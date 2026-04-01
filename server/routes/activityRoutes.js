import express from "express";
import { getActivities } from "../controllers/activityController.js";
import { protect } from "../controllers/authController.js";
import { isMember, restrictTo } from "../middleware/role-check.js";

const activityRouter = express.Router();

activityRouter.use(protect);

// Smart context requires teamId in the params for the isMember middleware
activityRouter.get("/:teamId", isMember, restrictTo("admin"), getActivities);

export { activityRouter };
