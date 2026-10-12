import User from "../models/User.mjs";
import Workout from "../models/Workout.mjs";
import Nutrition from "../models/Nutrition.mjs";
import Goal from "../models/Goal.mjs";
import Progress from "../models/Progress.mjs";
import Notification from "../models/Notification.mjs";

const getPeriodConfig = (period) => {
  switch (period) {
    case "Weekly":
      return {
        days: 7,
        group: "day",
        label: "Last 7 days",
      };

    case "Yearly":
      return {
        days: 365,
        group: "month",
        label: "Last 12 months",
      };

    case "Monthly":
    default:
      return {
        days: 30,
        group: "day",
        label: "Last 30 days",
      };
  }
};

const getStartDate = (days, extraDays = 0) => {
  const date = new Date();

  date.setDate(
    date.getDate() - days - extraDays
  );

  date.setHours(0, 0, 0, 0);

  return date;
};

const getPreviousPeriodStart = (days) => {
  const date = new Date();

  date.setDate(
    date.getDate() - days * 2
  );

  date.setHours(0, 0, 0, 0);

  return date;
};

const getPreviousPeriodEnd = (days) => {
  const date = new Date();

  date.setDate(
    date.getDate() - days
  );

  date.setHours(0, 0, 0, 0);

  return date;
};

const calculatePercentageChange = (
  current,
  previous
) => {
  const currentValue = Number(
    current || 0
  );

  const previousValue = Number(
    previous || 0
  );

  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return Number(
    (
      ((currentValue - previousValue) /
        previousValue) *
      100
    ).toFixed(1)
  );
};

const formatDateLabel = (
  date,
  group
) => {
  const value = new Date(date);

  if (group === "month") {
    return value.toLocaleDateString(
      "en-US",
      {
        month: "short",
      }
    );
  }

  return value.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
};

export const getAdminReport = async (
  req,
  res
) => {
  try {
    const requestedPeriod =
      req.query.period || "Monthly";

    const allowedPeriods = [
      "Weekly",
      "Monthly",
      "Yearly",
    ];

    const period =
      allowedPeriods.includes(
        requestedPeriod
      )
        ? requestedPeriod
        : "Monthly";

    const {
      days,
      group,
      label,
    } = getPeriodConfig(period);

    const startDate =
      getStartDate(days);

    const previousStartDate =
      getPreviousPeriodStart(days);

    const previousEndDate =
      getPreviousPeriodEnd(days);

    /*
     * ---------------------------------------------------------
     * OVERVIEW
     * ---------------------------------------------------------
     */

    const [
      totalUsers,
      activeUsers,
      totalWorkouts,
      totalNutrition,
      totalGoals,
      completedGoals,
      totalProgress,
      totalNotifications,
      unreadNotifications,

      periodUsers,
      periodWorkouts,
      periodNutrition,
      periodProgress,
      periodCompletedGoals,

      previousWorkouts,
      previousNutrition,
      previousUsers,
      previousCompletedGoals,
    ] = await Promise.all([
      User.countDocuments({
        role: "user",
      }),

      User.countDocuments({
        role: "user",
        isActive: true,
      }),

      Workout.countDocuments({
        date: {
          $gte: startDate,
        },
      }),

      Nutrition.countDocuments({
        date: {
          $gte: startDate,
        },
      }),

      Goal.countDocuments(),

      Goal.countDocuments({
        completed: true,
      }),

      Progress.countDocuments({
        date: {
          $gte: startDate,
        },
      }),

      Notification.countDocuments(),

      Notification.countDocuments({
        isRead: false,
      }),

      User.countDocuments({
        role: "user",
        createdAt: {
          $gte: startDate,
        },
      }),

      Workout.countDocuments({
        date: {
          $gte: startDate,
        },
      }),

      Nutrition.countDocuments({
        date: {
          $gte: startDate,
        },
      }),

      Progress.countDocuments({
        date: {
          $gte: startDate,
        },
      }),

      Goal.countDocuments({
        completed: true,
        updatedAt: {
          $gte: startDate,
        },
      }),

      Workout.countDocuments({
        date: {
          $gte: previousStartDate,
          $lt: previousEndDate,
        },
      }),

      Nutrition.countDocuments({
        date: {
          $gte: previousStartDate,
          $lt: previousEndDate,
        },
      }),

      User.countDocuments({
        role: "user",
        createdAt: {
          $gte: previousStartDate,
          $lt: previousEndDate,
        },
      }),

      Goal.countDocuments({
        completed: true,
        updatedAt: {
          $gte: previousStartDate,
          $lt: previousEndDate,
        },
      }),
    ]);

    /*
     * ---------------------------------------------------------
     * WORKOUT CATEGORIES
     * ---------------------------------------------------------
     */

    const workoutStats =
      await Workout.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
            },
          },
        },

        {
          $group: {
            _id: "$category",

            count: {
              $sum: 1,
            },

            caloriesBurned: {
              $sum: "$caloriesBurned",
            },

            totalMinutes: {
              $sum: "$duration",
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]);

    const totalCategoryWorkouts =
      workoutStats.reduce(
        (total, item) =>
          total + Number(item.count || 0),
        0
      );

    const workoutCategories =
      workoutStats.map((item) => ({
        name:
          item._id || "Other",

        value:
          totalCategoryWorkouts > 0
            ? Number(
                (
                  (item.count /
                    totalCategoryWorkouts) *
                  100
                ).toFixed(1)
              )
            : 0,

        count: item.count || 0,

        caloriesBurned:
          item.caloriesBurned || 0,

        totalMinutes:
          item.totalMinutes || 0,
      }));

    /*
     * ---------------------------------------------------------
     * NUTRITION
     * ---------------------------------------------------------
     */

    const nutritionTotalsResult =
      await Nutrition.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
            },
          },
        },

        {
          $group: {
            _id: null,

            calories: {
              $sum: "$calories",
            },

            protein: {
              $sum: "$protein",
            },

            carbs: {
              $sum: "$carbs",
            },

            fats: {
              $sum: "$fats",
            },
          },
        },
      ]);

    const nutritionTotals =
      nutritionTotalsResult[0] || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      };

    /*
     * ---------------------------------------------------------
     * GOAL PERFORMANCE
     * ---------------------------------------------------------
     */

    const goalStats =
      await Goal.aggregate([
        {
          $group: {
            _id: "$category",

            count: {
              $sum: 1,
            },

            completed: {
              $sum: {
                $cond: [
                  "$completed",
                  1,
                  0,
                ],
              },
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]);

    const goalPerformance =
      goalStats.map((item) => ({
        name:
          item._id || "Other",

        count: item.count || 0,

        completed:
          item.completed || 0,

        completionRate:
          item.count > 0
            ? Number(
                (
                  (item.completed /
                    item.count) *
                  100
                ).toFixed(1)
              )
            : 0,
      }));

    /*
     * ---------------------------------------------------------
     * PROGRESS
     * ---------------------------------------------------------
     */

    const progressStats =
      await Progress.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
            },
          },
        },

        {
          $group: {
            _id: null,

            averageWeight: {
              $avg: "$weight",
            },

            averageChest: {
              $avg: "$chest",
            },

            averageWaist: {
              $avg: "$waist",
            },

            averageArms: {
              $avg: "$arms",
            },

            averageStrength: {
              $avg: "$strength",
            },
          },
        },
      ]);

    /*
     * ---------------------------------------------------------
     * NOTIFICATIONS
     * ---------------------------------------------------------
     */

    const notificationStats =
      await Notification.aggregate([
        {
          $group: {
            _id: "$type",

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

    /*
     * ---------------------------------------------------------
     * ACTIVITY TREND
     * ---------------------------------------------------------
     */

    const dateFormat =
      group === "month"
        ? "%Y-%m"
        : "%Y-%m-%d";

    const [
      activityUsers,
      activityWorkouts,
      activityNutrition,
    ] = await Promise.all([
      User.aggregate([
        {
          $match: {
            role: "user",

            createdAt: {
              $gte: startDate,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: "$createdAt",
              },
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      Workout.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: "$date",
              },
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      Nutrition.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: "$date",
              },
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]),
    ]);

    const activityMap = new Map();

    activityUsers.forEach(
      (item) => {
        activityMap.set(item._id, {
          key: item._id,
          users: item.count || 0,
          workouts: 0,
          nutrition: 0,
        });
      }
    );

    activityWorkouts.forEach(
      (item) => {
        if (!activityMap.has(item._id)) {
          activityMap.set(item._id, {
            key: item._id,
            users: 0,
            workouts: 0,
            nutrition: 0,
          });
        }

        activityMap.get(
          item._id
        ).workouts = item.count || 0;
      }
    );

    activityNutrition.forEach(
      (item) => {
        if (!activityMap.has(item._id)) {
          activityMap.set(item._id, {
            key: item._id,
            users: 0,
            workouts: 0,
            nutrition: 0,
          });
        }

        activityMap.get(
          item._id
        ).nutrition = item.count || 0;
      }
    );

    const activity =
      Array.from(
        activityMap.values()
      )
        .sort((a, b) =>
          a.key.localeCompare(b.key)
        )
        .map((item) => ({
          ...item,

          label: formatDateLabel(
            item.key,
            group
          ),
        }));

    /*
     * ---------------------------------------------------------
     * RECENT ACTIVITY
     * ---------------------------------------------------------
     */

    const [
      recentUsers,
      recentWorkouts,
      recentNutrition,
      recentProgress,
      recentGoals,
    ] = await Promise.all([
      User.find({
        role: "user",
      })
        .select(
          "name email profilePhoto isActive createdAt lastLogin"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5),

      Workout.find()
        .populate(
          "user",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5),

      Nutrition.find()
        .populate(
          "user",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5),

      Progress.find()
        .populate(
          "user",
          "name email"
        )
        .sort({
          date: -1,
        })
        .limit(5),

      Goal.find()
        .populate(
          "user",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5),
    ]);

    /*
     * ---------------------------------------------------------
     * FINAL CALCULATIONS
     * ---------------------------------------------------------
     */

    const goalCompletionRate =
      totalGoals > 0
        ? Number(
            (
              (completedGoals /
                totalGoals) *
              100
            ).toFixed(1)
          )
        : 0;

    /*
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      report: {
        period,
        periodLabel: label,

        overview: {
          totalUsers,

          activeUsers,

          inactiveUsers:
            totalUsers - activeUsers,

          periodUsers,

          totalWorkouts,

          totalNutrition,

          totalGoals,

          completedGoals,

          activeGoals:
            totalGoals - completedGoals,

          goalCompletionRate,

          totalProgress,

          totalNotifications,

          unreadNotifications,

          periodWorkouts,

          periodNutrition,

          periodProgress,

          periodCompletedGoals,

          workoutChange:
            calculatePercentageChange(
              periodWorkouts,
              previousWorkouts
            ),

          nutritionChange:
            calculatePercentageChange(
              periodNutrition,
              previousNutrition
            ),

          userChange:
            calculatePercentageChange(
              periodUsers,
              previousUsers
            ),

          goalChange:
            calculatePercentageChange(
              periodCompletedGoals,
              previousCompletedGoals
            ),
        },

        workoutCategories,

        nutrition: {
          calories:
            nutritionTotals.calories ||
            0,

          protein:
            nutritionTotals.protein ||
            0,

          carbs:
            nutritionTotals.carbs ||
            0,

          fats:
            nutritionTotals.fats ||
            0,
        },

        goalPerformance,

        progress:
          progressStats[0] || {
            averageWeight: 0,
            averageChest: 0,
            averageWaist: 0,
            averageArms: 0,
            averageStrength: 0,
          },

        notificationStats,

        activity,

        recentActivity: {
          users: recentUsers,
          workouts: recentWorkouts,
          nutrition: recentNutrition,
          progress: recentProgress,
          goals: recentGoals,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get admin report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate admin report",
      error: error.message,
    });
  }
};