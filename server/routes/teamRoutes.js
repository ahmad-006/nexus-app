import express from "express";
import {
  deleteMember,
  patchPromoteToAdmin,
  postAddMember,
  postCreateTeam,
} from "../controllers/teamController.js";
import { isMember, restrictTo } from "../middleware/role-check.js";
import { teamValidation } from "../middleware/validator.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../controllers/authController.js";

const teamsRouter = express.Router();

// Apply protect to all team routes
teamsRouter.use(protect);

teamsRouter.route("/").post([teamValidation.name], validate, postCreateTeam);

teamsRouter
  .route("/:teamId/members/:userId")
  .patch(
    isMember,
    restrictTo("admin"),
    [teamValidation.userId, teamValidation.teamId],
    validate,
    patchPromoteToAdmin,
  )
  .delete(
    isMember,
    restrictTo("admin"),
    [teamValidation.userId, teamValidation.teamId],
    validate,
    deleteMember,
  );

teamsRouter
  .route("/:teamId/members")
  .post(
    isMember,
    restrictTo("admin"),
    [teamValidation.userId, teamValidation.teamId],
    validate,
    postAddMember,
  );

export { teamsRouter };
