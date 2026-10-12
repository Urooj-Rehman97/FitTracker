import Workout from "../models/Workout.mjs";
import Nutrition from "../models/Nutrition.mjs";
import Progress from "../models/Progress.mjs";
import Goal from "../models/Goal.mjs";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // =========================================================
    // DATE RANGE
    // =========================================================

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();

    const diffToMonday =
      day === 0 ? 6 : day - 1;

    startOfWeek.setDate(
      startOfWeek.getDate() - diffToMonday
    );
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // =========================================================
    // FETCH DATA
    // =========================================================

    const [
      recentWorkouts,
      recentNutrition,
      recentProgress,
      goals,
      totalWorkouts,
      totalNutritionLogs,
      totalProgressEntries,
    ] = await Promise.all([
      Workout.find({ user: userId })
        .sort({ date: -1 })
        .limit(5),

      Nutrition.find({ user: userId })
        .sort({ date: -1 })
        .limit(10),

      Progress.find({ user: userId })
        .sort({ date: -1 })
        .limit(10),

      Goal.find({ user: userId })
        .sort({ createdAt: -1 }),

      Workout.countDocuments({
        user: userId,
      }),

      Nutrition.countDocuments({
        user: userId,
      }),

      Progress.countDocuments({
        user: userId,
      }),
    ]);

    // =========================================================
    // GOALS
    // =========================================================

    const totalGoals = goals.length;

    const completedGoals = goals.filter(
      (goal) =>
        Number(goal.current) >=
        Number(goal.target)
    ).length;

    const activeGoals =
      totalGoals - completedGoals;

    const goalProgress = goals.map(
      (goal) => {
        let percentage = 0;

        if (
          Number(goal.target) > 0
        ) {
          percentage = Math.round(
            (Number(goal.current) /
              Number(goal.target)) *
              100
          );
        }

        percentage = Math.max(
          0,
          Math.min(100, percentage)
        );

        return {
          id: goal._id,
          title: goal.title,
          category: goal.category,
          target: goal.target,
          current: goal.current,
          unit: goal.unit,
          deadline: goal.deadline,
          description: goal.description,
          completed:
            Number(goal.current) >=
            Number(goal.target),
          progress: percentage,
        };
      }
    );

    // =========================================================
    // MONTHLY WORKOUT COUNT
    // =========================================================

    const monthlyWorkoutCount =
      await Workout.countDocuments({
        user: userId,
        date: {
          $gte: startOfMonth,
          $lte: endOfToday,
        },
      });

    // =========================================================
    // WEEKLY WORKOUTS
    // =========================================================

    const weeklyWorkouts =
      await Workout.find({
        user: userId,
        date: {
          $gte: startOfWeek,
          $lte: endOfToday,
        },
      }).select(
        "date duration caloriesBurned"
      );

    // =========================================================
    // ACTIVE HOURS
    // =========================================================

    const totalWeeklyMinutes =
      weeklyWorkouts.reduce(
        (total, workout) =>
          total +
          (Number(workout.duration) || 0),
        0
      );

    const activeHours =
      totalWeeklyMinutes / 60;

    // =========================================================
    // WEEKLY ACTIVITY
    // =========================================================

    const days = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];

    const weeklyActivity =
      days.map((dayName, index) => {
        const targetDate =
          new Date(startOfWeek);

        targetDate.setDate(
          startOfWeek.getDate() + index
        );

        const dayStart =
          new Date(targetDate);

        dayStart.setHours(0, 0, 0, 0);

        const dayEnd =
          new Date(targetDate);

        dayEnd.setHours(
          23,
          59,
          59,
          999
        );

        const dayWorkouts =
          weeklyWorkouts.filter(
            (workout) => {
              const workoutDate =
                new Date(workout.date);

              return (
                workoutDate >= dayStart &&
                workoutDate <= dayEnd
              );
            }
          );

        const minutes =
          dayWorkouts.reduce(
            (total, workout) =>
              total +
              (Number(
                workout.duration
              ) || 0),
            0
          );

        return {
          day: dayName,
          minutes,
          value: Math.min(
            (minutes / 60) * 100,
            100
          ),
        };
      });

    // =========================================================
    // WORKOUT SUMMARY
    // =========================================================

    const workoutSummaryResult =
      await Workout.aggregate([
        {
          $match: {
            user: recentWorkouts.length
              ? recentWorkouts[0].user
              : userId,
          },
        },
        {
          $group: {
            _id: null,

            totalDuration: {
              $sum: {
                $ifNull: [
                  "$duration",
                  0,
                ],
              },
            },

            totalCalories: {
              $sum: {
                $ifNull: [
                  "$caloriesBurned",
                  0,
                ],
              },
            },
          },
        },
      ]);

    const workoutSummaryData =
      workoutSummaryResult[0] || {
        totalDuration: 0,
        totalCalories: 0,
      };

    // =========================================================
    // TODAY'S NUTRITION
    // =========================================================

    const todayNutritionResult =
      await Nutrition.aggregate([
        {
          $match: {
            user: userId,

            date: {
              $gte: startOfToday,
              $lte: endOfToday,
            },
          },
        },
        {
          $group: {
            _id: null,

            calories: {
              $sum: {
                $ifNull: [
                  "$calories",
                  0,
                ],
              },
            },

            protein: {
              $sum: {
                $ifNull: [
                  "$protein",
                  0,
                ],
              },
            },

            carbs: {
              $sum: {
                $ifNull: [
                  "$carbs",
                  0,
                ],
              },
            },

            fats: {
              $sum: {
                $ifNull: [
                  "$fats",
                  0,
                ],
              },
            },
          },
        },
      ]);

    const todayNutrition =
      todayNutritionResult[0] || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      };

    // =========================================================
    // TOTAL NUTRITION
    // =========================================================

    const nutritionSummaryResult =
      await Nutrition.aggregate([
        {
          $match: {
            user: userId,
          },
        },
        {
          $group: {
            _id: null,

            totalCalories: {
              $sum: {
                $ifNull: [
                  "$calories",
                  0,
                ],
              },
            },

            totalProtein: {
              $sum: {
                $ifNull: [
                  "$protein",
                  0,
                ],
              },
            },

            totalCarbs: {
              $sum: {
                $ifNull: [
                  "$carbs",
                  0,
                ],
              },
            },

            totalFats: {
              $sum: {
                $ifNull: [
                  "$fats",
                  0,
                ],
              },
            },
          },
        },
      ]);

    const nutritionSummary =
      nutritionSummaryResult[0] || {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
      };

    // =========================================================
    // PROGRESS
    // =========================================================

    const latestProgress =
      recentProgress.length > 0
        ? recentProgress[0]
        : null;

    const previousProgress =
      recentProgress.length > 1
        ? recentProgress[1]
        : null;

    let weightChange = 0;

    if (
      latestProgress?.weight !==
        undefined &&
      previousProgress?.weight !==
        undefined
    ) {
      weightChange =
        Number(
          latestProgress.weight
        ) -
        Number(
          previousProgress.weight
        );
    }

    // =========================================================
    // RESPONSE
    // =========================================================

    return res.status(200).json({
      success: true,

      summary: {
        totalWorkouts,
        totalNutritionLogs,
        totalProgressEntries,
        totalGoals,
        completedGoals,
        activeGoals,
      },

      workoutSummary: {
        totalDuration:
          workoutSummaryData.totalDuration ||
          0,

        totalCalories:
          workoutSummaryData.totalCalories ||
          0,

        monthlyWorkoutCount,

        activeHours: Number(
          activeHours.toFixed(1)
        ),
      },

      weeklyActivity,

      nutritionSummary: {
        totalCalories:
          nutritionSummary.totalCalories ||
          0,

        totalProtein:
          nutritionSummary.totalProtein ||
          0,

        totalCarbs:
          nutritionSummary.totalCarbs ||
          0,

        totalFats:
          nutritionSummary.totalFats ||
          0,
      },

      todayNutrition: {
        calories:
          todayNutrition.calories || 0,

        protein:
          todayNutrition.protein || 0,

        carbs:
          todayNutrition.carbs || 0,

        fats:
          todayNutrition.fats || 0,
      },

      progressSummary: {
        currentWeight:
          latestProgress?.weight || 0,

        previousWeight:
          previousProgress?.weight || 0,

        weightChange,

        latestEntry:
          latestProgress,
      },

      recentWorkouts,

      recentNutrition,

      recentProgress,

      goals: goalProgress,
    });
  } catch (error) {
    console.error(
      "Dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching dashboard",
    });
  }
};

export default {
  getDashboard,
};