import Workout from "../models/Workout.mjs";
import Nutrition from "../models/Nutrition.mjs";
import Progress from "../models/Progress.mjs";
import Goal from "../models/Goal.mjs";

export const getAnalytics = async (req, res) => {
  try {
    const allowedPeriods = [7, 30, 90];

    const requestedPeriod = Number(req.query.period) || 7;

    const period = allowedPeriods.includes(requestedPeriod)
      ? requestedPeriod
      : 7;

    const now = new Date();

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (period - 1));
    startDate.setHours(0, 0, 0, 0);

    const userId = req.user.id;

    const [
      workouts,
      nutrition,
      progressRecords,
      goals,
    ] = await Promise.all([
      Workout.find({
        user: userId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ date: 1 }),

      Nutrition.find({
        user: userId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ date: 1 }),

      Progress.find({
        user: userId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ date: 1 }),

      Goal.find({
        user: userId,
      }).sort({ createdAt: 1 }),
    ]);

    /* =========================
       WORKOUT SUMMARY
    ========================= */

    const workoutDaysSet = new Set();

    let totalWorkoutDuration = 0;
    let caloriesBurned = 0;

    workouts.forEach((workout) => {
      const dateKey = new Date(workout.date)
        .toISOString()
        .split("T")[0];

      workoutDaysSet.add(dateKey);

      totalWorkoutDuration += Number(workout.duration) || 0;
      caloriesBurned += Number(workout.caloriesBurned) || 0;
    });

    const workoutDays = workoutDaysSet.size;

    const totalWorkouts = workouts.length;

    const averageWorkout =
      totalWorkouts > 0
        ? Math.round(totalWorkoutDuration / totalWorkouts)
        : 0;

    /* =========================
       NUTRITION SUMMARY
    ========================= */

    let caloriesConsumed = 0;

    const nutritionDaysSet = new Set();

    nutrition.forEach((item) => {
      const dateKey = new Date(item.date)
        .toISOString()
        .split("T")[0];

      nutritionDaysSet.add(dateKey);

      caloriesConsumed += Number(item.calories) || 0;
    });

    const nutritionDays = nutritionDaysSet.size;

    const averageCalories =
      nutritionDays > 0
        ? Math.round(caloriesConsumed / nutritionDays)
        : 0;

    /* =========================
       WEIGHT SUMMARY
    ========================= */

    let currentWeight = 0;
    let startingWeight = 0;

    if (progressRecords.length > 0) {
      const validWeightRecords = progressRecords.filter(
        (item) => Number(item.weight) > 0
      );

      if (validWeightRecords.length > 0) {
        startingWeight =
          Number(validWeightRecords[0].weight) || 0;

        currentWeight =
          Number(
            validWeightRecords[
              validWeightRecords.length - 1
            ].weight
          ) || 0;
      }
    }

    if (!currentWeight) {
      const latestOverallProgress = await Progress.findOne({
        user: userId,
        date: {
          $lt: startDate,
        },
        weight: {
          $gt: 0,
        },
      }).sort({ date: -1 });

      if (latestOverallProgress) {
        currentWeight =
          Number(latestOverallProgress.weight) || 0;

        if (!startingWeight) {
          startingWeight = currentWeight;
        }
      }
    }

    const weightChange = Number(
      (currentWeight - startingWeight).toFixed(1)
    );

    /* =========================
       WEEKLY WORKOUT DATA
    ========================= */

    const weeklyWorkoutData = [];

    for (let i = 0; i < 7; i++) {
      const bucketStart = new Date(startDate);
      const bucketEnd = new Date(startDate);

      if (period === 7) {
        bucketStart.setDate(startDate.getDate() + i);
        bucketEnd.setDate(startDate.getDate() + i);
      } else {
        const bucketSize = period / 7;

        bucketStart.setDate(
          startDate.getDate() + Math.floor(i * bucketSize)
        );

        bucketEnd.setDate(
          startDate.getDate() +
            Math.floor((i + 1) * bucketSize) -
            1
        );
      }

      bucketStart.setHours(0, 0, 0, 0);
      bucketEnd.setHours(23, 59, 59, 999);

      const bucketWorkouts = workouts.filter((workout) => {
        const workoutDate = new Date(workout.date);

        return (
          workoutDate >= bucketStart &&
          workoutDate <= bucketEnd
        );
      });

      weeklyWorkoutData.push({
        day:
          period === 7
            ? bucketStart.toLocaleDateString("en-US", {
                weekday: "short",
              })
            : `W${i + 1}`,
        workouts: bucketWorkouts.length,
      });
    }

    /* =========================
       NUTRITION DATA
    ========================= */

    const nutritionData = [];

    for (let i = 0; i < 7; i++) {
      const bucketStart = new Date(startDate);
      const bucketEnd = new Date(startDate);

      if (period === 7) {
        bucketStart.setDate(startDate.getDate() + i);
        bucketEnd.setDate(startDate.getDate() + i);
      } else {
        const bucketSize = period / 7;

        bucketStart.setDate(
          startDate.getDate() + Math.floor(i * bucketSize)
        );

        bucketEnd.setDate(
          startDate.getDate() +
            Math.floor((i + 1) * bucketSize) -
            1
        );
      }

      bucketStart.setHours(0, 0, 0, 0);
      bucketEnd.setHours(23, 59, 59, 999);

      const bucketNutrition = nutrition.filter((item) => {
        const nutritionDate = new Date(item.date);

        return (
          nutritionDate >= bucketStart &&
          nutritionDate <= bucketEnd
        );
      });

      const calories = bucketNutrition.reduce(
        (total, item) =>
          total + (Number(item.calories) || 0),
        0
      );

      nutritionData.push({
        day:
          period === 7
            ? bucketStart.toLocaleDateString("en-US", {
                weekday: "short",
              })
            : `W${i + 1}`,
        calories: Math.round(calories),
      });
    }

    /* =========================
       WEIGHT DATA
    ========================= */

    const weightData = progressRecords
      .filter((item) => Number(item.weight) > 0)
      .map((item) => ({
        date: new Date(item.date).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        ),
        weight: Number(item.weight),
      }));

    /* =========================
       MACRO DATA
    ========================= */

    let protein = 0;
    let carbs = 0;
    let fats = 0;

    nutrition.forEach((item) => {
      protein += Number(item.protein) || 0;
      carbs += Number(item.carbs) || 0;
      fats += Number(item.fats) || 0;
    });

    const proteinCalories = protein * 4;
    const carbsCalories = carbs * 4;
    const fatsCalories = fats * 9;

    const totalMacroCalories =
      proteinCalories +
      carbsCalories +
      fatsCalories;

    const macroData = [
      {
        name: "Protein",
        value: Math.round(protein),
        percentage:
          totalMacroCalories > 0
            ? Math.round(
                (proteinCalories / totalMacroCalories) * 100
              )
            : 0,
        target: 35,
      },
      {
        name: "Carbs",
        value: Math.round(carbs),
        percentage:
          totalMacroCalories > 0
            ? Math.round(
                (carbsCalories / totalMacroCalories) * 100
              )
            : 0,
        target: 45,
      },
      {
        name: "Fats",
        value: Math.round(fats),
        percentage:
          totalMacroCalories > 0
            ? Math.round(
                (fatsCalories / totalMacroCalories) * 100
              )
            : 0,
        target: 25,
      },
    ];

    /* =========================
       EXERCISE DATA
    ========================= */

    const exerciseMap = new Map();

    workouts.forEach((workout) => {
      if (!Array.isArray(workout.exercises)) {
        return;
      }

      workout.exercises.forEach((exercise) => {
        const name = exercise.name?.trim();

        if (!name) {
          return;
        }

        if (!exerciseMap.has(name)) {
          exerciseMap.set(name, {
            name,
            sessions: 0,
            weights: [],
          });
        }

        const existing = exerciseMap.get(name);

        existing.sessions += 1;

        const weight = Number(exercise.weight);

        if (weight > 0) {
          existing.weights.push(weight);
        }
      });
    });

    const exerciseData = Array.from(
      exerciseMap.values()
    )
      .map((exercise) => {
        let progress = 0;

        if (exercise.weights.length >= 2) {
          const firstWeight = exercise.weights[0];
          const lastWeight =
            exercise.weights[
              exercise.weights.length - 1
            ];

          if (firstWeight > 0) {
            progress = Math.round(
              ((lastWeight - firstWeight) /
                firstWeight) *
                100
            );
          }
        }

        return {
          name: exercise.name,
          sessions: exercise.sessions,
          progress,
        };
      })
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);

    /* =========================
       GOAL PERFORMANCE
    ========================= */

    const totalGoals = goals.length;

    const completedGoals = goals.filter(
      (goal) => goal.completed === true
    ).length;

    const goalPercentage =
      totalGoals > 0
        ? Math.round(
            (completedGoals / totalGoals) * 100
          )
        : 0;

    /* =========================
       RESPONSE
    ========================= */

    return res.status(200).json({
      success: true,

      analytics: {
        period,

        summary: {
          workoutDays,
          totalWorkouts,
          caloriesBurned: Math.round(caloriesBurned),
          averageWorkout,
          caloriesConsumed: Math.round(caloriesConsumed),
          averageCalories,
          currentWeight,
          weightChange,
          startingWeight,
        },

        weeklyWorkoutData,

        nutritionData,

        weightData,

        macroData,

        exerciseData,

        goalPerformance: {
          totalGoals,
          completedGoals,
          percentage: goalPercentage,
        },
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching analytics",
    });
  }
};