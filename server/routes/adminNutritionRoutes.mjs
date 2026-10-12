import express from "express";

import {
  getAllNutrition,
  getNutritionById,
  updateNutrition,
  deleteNutrition,
  getNutritionStats,
} from "../controllers/adminNutritionController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";
import { adminOnly } from "../middleware/adminMiddleware.mjs";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Nutrition statistics
router.get("/stats", getNutritionStats);

// Get all nutrition records
router.get("/", getAllNutrition);

// Get single nutrition record
router.get("/:id", getNutritionById);

// Update nutrition record
router.put("/:id", updateNutrition);

// Delete nutrition record
router.delete("/:id", deleteNutrition);

export default router;