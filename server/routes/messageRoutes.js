import express from "express";
import { protect } from "../controllers/authController.js";
import {
  getMessagesByUsers,
  readAllMessages,
  updateMessage,
  getMessagesByTeam,
} from "../controllers/messageController.js";
import { isMember } from "../middleware/role-check.js";

const messageRouter = express.Router();

messageRouter.use(protect);

messageRouter.get("/:teamId/group", isMember, getMessagesByTeam);
messageRouter.get("/:teamId/:otherUserId", isMember, getMessagesByUsers);
messageRouter.patch("/read-all/:senderId", readAllMessages);
messageRouter.patch("/:messageId", updateMessage);

export { messageRouter };
