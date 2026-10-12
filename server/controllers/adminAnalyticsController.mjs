import User from "../models/User.mjs";
import Workout from "../models/Workout.mjs";
import Nutrition from "../models/Nutrition.mjs";
import Progress from "../models/Progress.mjs";
import Goal from "../models/Goal.mjs";

export const getAdminAnalytics = async (req, res) => {
  try {
    const requestedPeriod = Number(req.query.period);

    const allowedPeriods = [7, 30, 90];
    const period = allowedPeriods.includes(requestedPeriod)
      ? requestedPeriod
      : 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    startDate.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsers,
      totalWorkouts,
      totalNutrition,
      totalProgress,
      totalGoals,
      completedGoals,
      activeGoals,
      workoutStats,
      nutritionStats,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),

      User.countDocuments({
        role: "user",
        isActive: true,
      }),

      User.countDocuments({
        role: "user",
        isActive: false,
      }),

      User.countDocuments({
        role: "user",
        createdAt: { $gte: startDate },
      }),

      Workout.countDocuments({
        date: { $gte: startDate },
      }),

      Nutrition.countDocuments({
        date: { $gte: startDate },
      }),

      Progress.countDocuments({
        date: { $gte: startDate },
      }),

      Goal.countDocuments(),

      Goal.countDocuments({
        completed: true,
      }),

      Goal.countDocuments({
        completed: false,
      }),

      Workout.aggregate([
        {
          $match: {
            date: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            totalMinutes: { $sum: "$duration" },
            caloriesBurned: { $sum: "$caloriesBurned" },
          },
        },
      ]),

      Nutrition.aggregate([
        {
          $match: {
            date: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            calories: { $sum: "$calories" },
            protein: { $sum: "$protein" },
            carbs: { $sum: "$carbs" },
            fats: { $sum: "$fats" },
          },
        },
      ]),
    ]);

    const workoutAggregate = workoutStats[0] || {
      totalMinutes: 0,
      caloriesBurned: 0,
    };

    const nutritionAggregate = nutritionStats[0] || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    };

    const goalCompletionRate =
      totalGoals > 0
        ? Number(((completedGoals / totalGoals) * 100).toFixed(1))
        : 0;

    return res.status(200).json({
      success: true,

      analytics: {
        period,

        summary: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          newUsers,

          totalWorkouts,
          totalNutrition,
          totalProgress,

          totalGoals,
          completedGoals,
          activeGoals,
          goalCompletionRate,

          workoutMinutes: workoutAggregate.totalMinutes || 0,
          caloriesBurned: workoutAggregate.caloriesBurned || 0,

          caloriesConsumed: nutritionAggregate.calories || 0,
          protein: nutritionAggregate.protein || 0,
          carbs: nutritionAggregate.carbs || 0,
          fats: nutritionAggregate.fats || 0,
        },
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin analytics",
      error: error.message,
    });
  }
};