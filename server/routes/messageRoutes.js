import express from "express";
import { protect } from "../controllers/authController.js";
import { getMessagesByUsers } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.use(protect);

messageRouter.get("/:otherUserId", getMessagesByUsers);

export { messageRouter };
