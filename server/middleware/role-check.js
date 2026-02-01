import { Team } from "../models/teams";

const isMember = async (req, res, next) => {
  const { teamid, userid } = req.headers;
  if (!teamid || !userid)
    return res.status(400).json({ error: "teamid and userid required" });
  const isMember = await Team.isMember(teamid, userid);
  if (!isMember)
    return res.status(403).json({ error: "Access Denied! Not a team member" });
  next();
};

const isAdmin = async (req, res, next) => {
  const { teamid, userid } = req.headers;
  if (!teamid || !userid)
    return res.status(400).json({ error: "teamid and userid required" });
  const isAdmin = await Team.isAdmin(teamid, userid);
  if (!isAdmin) {
    return res.status(403).json({ error: "Access Denied! Not an Admin" });
  }
  next();
};

export { isAdmin, isMember };
