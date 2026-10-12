import express from "express";

import {
  createTicket,
  getMyTickets,
  getMyTicket,
  deleteMyTicket,
} from "../controllers/supportController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.use(protect);

router.post("/", createTicket);
router.get("/", getMyTickets);
router.get("/:id", getMyTicket);
router.delete("/:id", deleteMyTicket);

export default router;