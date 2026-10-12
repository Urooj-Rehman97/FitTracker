import express from "express";

import {
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  getGoalStats,
} from "../controllers/adminGoalController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";
import { adminOnly } from "../middleware/adminMiddleware.mjs";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin protection
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(adminOnly);

/*
|--------------------------------------------------------------------------
| Goal statistics
|--------------------------------------------------------------------------
*/

router.get(
  "/stats",
  getGoalStats
);

/*
|--------------------------------------------------------------------------
| Get all goals
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getAllGoals
);

/*
|--------------------------------------------------------------------------
| Get single goal
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getGoalById
);

/*
|--------------------------------------------------------------------------
| Update goal
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  updateGoal
);

/*
|--------------------------------------------------------------------------
| Delete goal
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  deleteGoal
);

export default router;