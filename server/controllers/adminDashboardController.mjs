import User from "../models/User.mjs";
import Workout from "../models/Workout.mjs";
import Nutrition from "../models/Nutrition.mjs";
import Goal from "../models/Goal.mjs";

export const getAdminDashboard = async (req, res) => {
  try {
    // =========================================================
    // DATE RANGE
    // =========================================================

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // =========================================================
    // FETCH PLATFORM DATA
    // =========================================================

    const [
      totalUsers,
      activeUsers,
      totalWorkouts,
      totalNutritionLogs,
      totalGoals,
      completedGoals,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments({
        role: "user",
      }),

      User.countDocuments({
        role: "user",
        isActive: true,
      }),

      Workout.countDocuments(),

      Nutrition.countDocuments(),

      Goal.countDocuments(),

      Goal.countDocuments({
        completed: true,
      }),

      User.find({
        role: "user",
      })
        .select("name email isActive createdAt profilePhoto")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // =========================================================
    // MONTHLY COUNTS
    // =========================================================

    const [
      newUsersThisMonth,
      workoutsThisMonth,
      nutritionThisMonth,
    ] = await Promise.all([
      User.countDocuments({
        role: "user",
        createdAt: {
          $gte: startOfMonth,
        },
      }),

      Workout.countDocuments({
        date: {
          $gte: startOfMonth,
        },
      }),

      Nutrition.countDocuments({
        date: {
          $gte: startOfMonth,
        },
      }),
    ]);

    // =========================================================
    // USER GROWTH
    // Last 9 months
    // =========================================================

    const growthStart = new Date(now);
    growthStart.setMonth(growthStart.getMonth() - 8);
    growthStart.setDate(1);
    growthStart.setHours(0, 0, 0, 0);

    const userGrowth = await User.aggregate([
      {
        $match: {
          role: "user",
          createdAt: {
            $gte: growthStart,
          },
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // =========================================================
    // FORMAT GROWTH DATA
    // =========================================================

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const growthData = [];

    for (let i = 8; i >= 0; i--) {
      const date = new Date(now);

      date.setMonth(
        date.getMonth() - i
      );

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const found = userGrowth.find(
        (item) =>
          item._id.year === year &&
          item._id.month === month
      );

      growthData.push({
        month: monthNames[month - 1],
        value: found ? found.count : 0,
      });
    }

    // =========================================================
    // GOAL COMPLETION
    // =========================================================

    const goalCompletionRate =
      totalGoals > 0
        ? Number(
            (
              (completedGoals / totalGoals) *
              100
            ).toFixed(1)
          )
        : 0;

    // =========================================================
    // FORMAT RECENT USERS
    // =========================================================

    const formattedRecentUsers =
      recentUsers.map((user) => ({
        id: user._id,

        name: user.name,

        email: user.email,

        date: user.createdAt,

        status: user.isActive
          ? "Active"
          : "Inactive",

        avatar:
          user.name?.charAt(0)?.toUpperCase() ||
          "U",

        profilePhoto:
          user.profilePhoto || "",
      }));

    // =========================================================
    // RESPONSE
    // =========================================================

    return res.status(200).json({
      success: true,

      dashboard: {
        stats: {
          totalUsers,
          activeUsers,
          totalWorkouts,
          totalNutritionLogs,

          newUsersThisMonth,
          workoutsThisMonth,
          nutritionThisMonth,

          goalCompletionRate,
        },

        growthData,

        recentUsers:
          formattedRecentUsers,
      },
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load admin dashboard",
    });
  }
};

export default {
  getAdminDashboard,
};