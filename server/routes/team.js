import express from "express";
import { postCreateTeam } from "../controllers/team";

const teamsRouter = express.Router();

teamsRouter.route("/").post(postCreateTeam);

export { teamsRouter };
