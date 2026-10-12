import express from "express";

import {
  createContactMessage,
  getContactMessages,
  getContactMessage,
  updateContactMessage,
  deleteContactMessage,
} from "../controllers/contactController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";
import { adminOnly } from "../middleware/adminMiddleware.mjs";

const router = express.Router();

// Public
router.post("/", createContactMessage);

// Admin
router.get("/", protect, adminOnly, getContactMessages);
router.get("/:id", protect, adminOnly, getContactMessage);
router.put("/:id", protect, adminOnly, updateContactMessage);
router.delete("/:id", protect, adminOnly, deleteContactMessage);

export default router;