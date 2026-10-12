import express from "express";

import {
  createProgress,
  getProgress,
  getProgressById,
  updateProgress,
  deleteProgress,
} from "../controllers/progressController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.use(protect);

router.post("/", createProgress);
router.get("/", getProgress);
router.get("/:id", getProgressById);
router.put("/:id", updateProgress);
router.delete("/:id", deleteProgress);

export default router;