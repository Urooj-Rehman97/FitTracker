import express from "express";

import {
  getAllWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats,
} from "../controllers/adminWorkoutController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";
import { adminOnly } from "../middleware/adminMiddleware.mjs";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Workout statistics
router.get("/stats", getWorkoutStats);

// Get all workouts
router.get("/", getAllWorkouts);

// Get single workout
router.get("/:id", getWorkoutById);

// Update workout
router.put("/:id", updateWorkout);

// Delete workout
router.delete("/:id", deleteWorkout);

export default router;