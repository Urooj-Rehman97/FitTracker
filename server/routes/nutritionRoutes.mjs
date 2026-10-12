import express from "express";

import {
  createNutrition,
  getNutrition,
  getNutritionById,
  updateNutrition,
  deleteNutrition,
} from "../controllers/nutritionController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.use(protect);

router.post("/", createNutrition);
router.get("/", getNutrition);
router.get("/:id", getNutritionById);
router.put("/:id", updateNutrition);
router.delete("/:id", deleteNutrition);

export default router;