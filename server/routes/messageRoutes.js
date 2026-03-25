import express from "express";
import { protect } from "../controllers/authController.js";
import {
  getMessagesByUsers,
  readAllMessages,
  updateMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.use(protect);

messageRouter.get("/:otherUserId", getMessagesByUsers);
messageRouter.patch("/read-all/:senderId", readAllMessages);
messageRouter.patch("/:messageId", updateMessage);

export { messageRouter };
