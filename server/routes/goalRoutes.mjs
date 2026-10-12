import express from "express";

import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
} from "../controllers/goalController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.use(protect);

router.post("/", createGoal);

router.get("/", getGoals);

router.get("/:id", getGoalById);

router.put("/:id", updateGoal);

router.delete("/:id", deleteGoal);

export default router;