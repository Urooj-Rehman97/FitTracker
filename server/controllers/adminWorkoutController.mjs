import Workout from "../models/Workout.mjs";
import User from "../models/User.mjs";

// Get all workouts
export const getAllWorkouts = async (req, res) => {
  try {
    const { search = "", category = "" } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        {
          workoutName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          category: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (category.trim()) {
      query.category = {
        $regex: category.trim(),
        $options: "i",
      };
    }

    const workouts = await Workout.find(query)
      .populate("user", "name email profilePhoto")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: workouts.length,
      workouts,
    });
  } catch (error) {
    console.error("Get all workouts error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching workouts",
    });
  }
};

// Get single workout
export const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id).populate(
      "user",
      "name email profilePhoto"
    );

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
    console.error("Get admin workout error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching workout",
    });
  }
};

// Update workout
export const updateWorkout = async (req, res) => {
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

    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    if (date !== undefined) workout.date = date;
    if (workoutName !== undefined) {
      workout.workoutName = workoutName.trim();
    }
    if (category !== undefined) {
      workout.category = category.trim();
    }
    if (duration !== undefined) workout.duration = duration;
    if (caloriesBurned !== undefined) {
      workout.caloriesBurned = caloriesBurned;
    }
    if (exercises !== undefined) workout.exercises = exercises;
    if (notes !== undefined) workout.notes = notes.trim();

    await workout.save();

    const updatedWorkout = await Workout.findById(
      workout._id
    ).populate("user", "name email profilePhoto");

    return res.status(200).json({
      success: true,
      message: "Workout updated successfully",
      workout: updatedWorkout,
    });
  } catch (error) {
    console.error("Update admin workout error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating workout",
    });
  }
};

// Delete workout
export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);

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
    console.error("Delete admin workout error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting workout",
    });
  }
};

// Workout statistics
export const getWorkoutStats = async (req, res) => {
  try {
    const [
      totalWorkouts,
      totalUsers,
      totalDuration,
      totalCalories,
    ] = await Promise.all([
      Workout.countDocuments(),

      User.countDocuments({
        role: "user",
      }),

      Workout.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$duration",
            },
          },
        },
      ]),

      Workout.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$caloriesBurned",
            },
          },
        },
      ]),
    ]);

    const categoryStats = await Workout.aggregate([
      {
        $group: {
          _id: "$category",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalWorkouts,
        totalUsers,
        totalDuration: totalDuration[0]?.total || 0,
        totalCalories: totalCalories[0]?.total || 0,
        categories: categoryStats,
      },
    });
  } catch (error) {
    console.error("Get workout stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching workout statistics",
    });
  }
};