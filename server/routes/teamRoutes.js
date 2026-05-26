import express from "express";
import {
  deleteMember,
  patchAcceptInvite,
  patchPromoteToAdmin,
  postAddMember,
  postCreateTeam,
  deleteTeam,
  getTeam,
  getMyInvites,
} from "../controllers/teamController.js";
import { isMember, restrictTo } from "../middleware/role-check.js";
import { teamValidation } from "../middleware/validator.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../controllers/authController.js";

const teamsRouter = express.Router();

// 1) GLOBAL PROTECTION
teamsRouter.use(protect);

// 2) STATIC ROUTES
teamsRouter.route("/invites/me").get(getMyInvites);
teamsRouter.route("/accept-invite/members/:token").patch(patchAcceptInvite);

// 3) BASE ROUTES
teamsRouter.route("/").post([teamValidation.name], validate, postCreateTeam);

// 4) DYNAMIC TEAM ROUTES (Member restricted)

teamsRouter.route("/:teamId").get(isMember, getTeam).delete(deleteTeam);

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
