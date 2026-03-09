import express from "express";
import {
  patchPromoteToAdmin,
  postAddMember,
  postCreateTeam,
} from "../controllers/team.js";
import { isAdmin } from "../middleware/role-check.js";
import { teamValidation } from "../middleware/validator.js";
import { validate } from "../middleware/validate.js";

const teamsRouter = express.Router();

teamsRouter
  .route("/")
  .post(
    isAdmin,
    [teamValidation.name, teamValidation.owenerId],
    validate,
    postCreateTeam,
  );
teamsRouter
  .route("/:id/role")
  .patch(
    isAdmin,
    [teamValidation.userId, teamValidation.teamId],
    validate,
    patchPromoteToAdmin,
  );
teamsRouter
  .route("/:id/member")
  .post(
    isAdmin,
    [teamValidation.userId, teamValidation.teamId],
    validate,
    postAddMember,
  );
export { teamsRouter };
