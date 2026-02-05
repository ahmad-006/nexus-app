import express from "express";
import {
  patchPromoteToAdmin,
  postAddMember,
  postCreateTeam,
} from "../controllers/team.js";
import { isAdmin } from "../middleware/role-check.js";

const teamsRouter = express.Router();

teamsRouter.route("/").post(postCreateTeam);
teamsRouter.route("/:id/role").patch(isAdmin, patchPromoteToAdmin);
teamsRouter.route("/:id/member").post(isAdmin, postAddMember);
export { teamsRouter };
