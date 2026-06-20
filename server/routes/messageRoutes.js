import express from "express";
import { protect } from "../controllers/authController.js";
import {
  getMessagesByUsers,
  readAllMessages,
  updateMessage,
  deleteMessage,
  getMessagesByTeam,
  getUnreadCounts,
} from "../controllers/messageController.js";
import { isMember } from "../middleware/role-check.js";

const messageRouter = express.Router();

messageRouter.use(protect);

messageRouter.get("/:teamId/group", isMember, getMessagesByTeam);
messageRouter.get("/:teamId/unread", isMember, getUnreadCounts);
messageRouter.get("/:teamId/:otherUserId", isMember, getMessagesByUsers);
messageRouter.patch("/read-all/:senderId", readAllMessages);
messageRouter.patch("/:messageId", updateMessage);
messageRouter.delete("/:messageId", deleteMessage);

export { messageRouter };
