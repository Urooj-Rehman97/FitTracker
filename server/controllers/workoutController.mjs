import Workout from "../models/Workout.mjs";
import { createUserNotification } from "../utils/notificationHelper.mjs";

// Add Workout
export const createWorkout = async (req, res) => {
  try {
    const {
      date,
      workoutName,
      category,
      duration,
      caloriesBurned,
      exercises,
      notes,
    } = req.body;

    if (!date || !workoutName || !category) {
      return res.status(400).json({
        success: false,
        message: "Date, workout name and category are required",
      });
    }

    const workout = await Workout.create({
      user: req.user.id,
      date,
      workoutName: workoutName.trim(),
      category: category.trim(),
      duration: duration || 0,
      caloriesBurned: caloriesBurned || 0,
      exercises: exercises || [],
      notes: notes || "",
    });

    // Automatic notification
    await createUserNotification({
      userId: req.user.id,
      title: "Workout Added",
      message: `Your ${workout.workoutName} workout has been added successfully.`,
      type: "workout",
      link: "/dashboard/workouts",
    });

    return res.status(201).json({
      success: true,
      message: "Workout created successfully",
      workout,
    });
  } catch (error) {
    console.error("Create workout error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating workout",
    });
  }
};

// Get My Workouts
export const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({
      user: req.user.id,
    }).sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: workouts.length,
      workouts,
    });
  } catch (error) {
    console.error("Get workouts error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching workouts",
    });
  }
};

// Get Single Workout
export const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    return res.status(200).json({
      success: true,
      workout,
    });
  } catch (error) {
    console.error("Get workout error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching workout",
    });
  }
};

// Update Workout
export const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    const allowedFields = [
      "date",
      "workoutName",
      "category",
      "duration",
      "caloriesBurned",
      "exercises",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        workout[field] = req.body[field];
      }
    });

    await workout.save();

    return res.status(200).json({
      success: true,
      message: "Workout updated successfully",
      workout,
    });
  } catch (error) {
    console.error("Update workout error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating workout",
    });
  }
};

// Delete Workout
export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workout deleted successfully",
    });
  } catch (error) {
    console.error("Delete workout error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting workout",
    });
  }
};