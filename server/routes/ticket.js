import express from "express";
import {
  getTickets,
  postTicket,
  patchTicket,
  deleteTicket,
  getTicket,
} from "../controllers/ticket.js";

const router = express.Router();

router.route("/").get(getTickets).post(postTicket);
router.route("/:id").get(getTicket).patch(patchTicket).delete(deleteTicket);

export default router;
