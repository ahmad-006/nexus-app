import express from "express";
import {
  deleteMember,
  patchPromoteToAdmin,
  postAddMember,
  postCreateTeam,
} from "../controllers/teamController.js";
import { isAdmin } from "../middleware/role-check.js";
import { teamValidation } from "../middleware/validator.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../controllers/authController.js";

const teamsRouter = express.Router();

// Apply protect to all team routes
teamsRouter.use(protect);

teamsRouter
  .route("/")
  .post([teamValidation.name], validate, postCreateTeam);

teamsRouter
  .route("/:teamId/members/:userId")
  .patch(
    isAdmin,
    [teamValidation.userId, teamValidation.teamId],
    validate,
    patchPromoteToAdmin,
  )
  .delete(isAdmin, [teamValidation.userId, teamValidation.teamId], validate, deleteMember);

teamsRouter
  .route("/:teamId/members")
  .post(
    isAdmin,
    [teamValidation.userId, teamValidation.teamId],
    validate,
    postAddMember,
  );

export { teamsRouter };
