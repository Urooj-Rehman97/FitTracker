import express from "express";

import {
  getAdminTickets,
  getAdminTicketStats,
  updateAdminTicket,
  deleteAdminTicket,
} from "../controllers/adminSupportController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";
import { adminOnly } from "../middleware/adminMiddleware.mjs";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getAdminTickets);
router.get("/stats", getAdminTicketStats);
router.put("/:id", updateAdminTicket);
router.delete("/:id", deleteAdminTicket);

export default router;