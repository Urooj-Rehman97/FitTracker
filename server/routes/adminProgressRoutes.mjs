import express from "express";

import {
  getAllProgress,
  getProgressById,
  updateProgress,
  deleteProgress,
  getProgressStats,
} from "../controllers/adminProgressController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";
import { adminOnly } from "../middleware/adminMiddleware.mjs";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Progress statistics
router.get("/stats", getProgressStats);

// Get all progress records
router.get("/", getAllProgress);

// Get single progress record
router.get("/:id", getProgressById);

// Update progress
router.put("/:id", updateProgress);

// Delete progress
router.delete("/:id", deleteProgress);

export default router;