import mongoose from "mongoose";

import Goal from "../models/Goal.mjs";

/*
|--------------------------------------------------------------------------
| Goal calculation helpers
|--------------------------------------------------------------------------
|
| Decrease:
| start 80 -> target 70
|
| Increase:
| start 60 -> target 70
|
*/

const calculateGoalData = (goal) => {
  const start = Number(goal.startValue);
  const current = Number(goal.current);
  const target = Number(goal.target);

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(current) ||
    !Number.isFinite(target)
  ) {
    return {
      progress: 0,
      status: "Active",
      remaining: null,
      direction: "unknown",
      totalChange: null,
      achievedChange: null,
    };
  }

  if (start === target) {
    const completed = current === target;

    return {
      progress: completed ? 100 : 0,
      status: completed ? "Completed" : "Active",
      remaining: Math.abs(target - current),
      direction: "maintain",
      totalChange: 0,
      achievedChange: 0,
    };
  }

  if (start > target) {
    const totalChange = start - target;

    const achievedChange = Math.max(
      0,
      start - current
    );

    const completed = current <= target;

    const progress = completed
      ? 100
      : Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (achievedChange / totalChange) * 100
            )
          )
        );

    const remaining = completed
      ? 0
      : Math.max(
          0,
          current - target
        );

    return {
      progress,
      status: completed ? "Completed" : "Active",
      remaining,
      direction: "decrease",
      totalChange,
      achievedChange: Math.min(
        totalChange,
        achievedChange
      ),
    };
  }

  const totalChange = target - start;

  const achievedChange = Math.max(
    0,
    current - start
  );

  const completed = current >= target;

  const progress = completed
    ? 100
    : Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (achievedChange / totalChange) * 100
          )
        )
      );

  const remaining = completed
    ? 0
    : Math.max(
        0,
        target - current
      );

  return {
    progress,
    status: completed ? "Completed" : "Active",
    remaining,
    direction: "increase",
    totalChange,
    achievedChange: Math.min(
      totalChange,
      achievedChange
    ),
  };
};

/*
|--------------------------------------------------------------------------
| Serialize goal
|--------------------------------------------------------------------------
*/

const serializeGoal = (goal) => {
  const data = calculateGoalData(goal);

  const goalObject =
    typeof goal.toObject === "function"
      ? goal.toObject()
      : goal;

  return {
    ...goalObject,
    progress: data.progress,
    status: data.status,
    remaining: data.remaining,
    direction: data.direction,
    totalChange: data.totalChange,
    achievedChange: data.achievedChange,
  };
};

/*
|--------------------------------------------------------------------------
| Validation helpers
|--------------------------------------------------------------------------
*/

const allowedCategories = [
  "Weight",
  "Strength",
  "Cardio",
  "Nutrition",
  "Body Measurement",
  "Other",
];

const allowedUnits = [
  "kg",
  "lbs",
  "cm",
  "reps",
  "min",
  "km",
  "cal",
  "%",
];

const validateGoalNumbers = ({
  startValue,
  target,
  current,
}) => {
  const start = Number(startValue);
  const targetValue = Number(target);
  const currentValue = Number(current);

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(targetValue) ||
    !Number.isFinite(currentValue)
  ) {
    return {
      valid: false,
      message:
        "Start value, target and current value must be valid numbers.",
    };
  }

  if (
    start < 0 ||
    targetValue < 0 ||
    currentValue < 0
  ) {
    return {
      valid: false,
      message:
        "Start value, target and current value cannot be negative.",
    };
  }

  return {
    valid: true,
    start,
    target: targetValue,
    current: currentValue,
  };
};

/*
|--------------------------------------------------------------------------
| Get All Goals
|--------------------------------------------------------------------------
*/

export const getAllGoals = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      status = "",
    } = req.query;

    const rawGoals = await Goal.find({})
      .populate(
        "user",
        "name email profilePhoto"
      )
      .sort({
        createdAt: -1,
      });

    let goals = rawGoals.map(
      serializeGoal
    );

    const searchText =
      search.trim().toLowerCase();

    if (searchText) {
      goals = goals.filter((goal) => {
        const title =
          goal.title?.toLowerCase() || "";

        const description =
          goal.description?.toLowerCase() || "";

        const userName =
          goal.user?.name?.toLowerCase() || "";

        const userEmail =
          goal.user?.email?.toLowerCase() || "";

        return (
          title.includes(searchText) ||
          description.includes(searchText) ||
          userName.includes(searchText) ||
          userEmail.includes(searchText)
        );
      });
    }

    if (category.trim()) {
      goals = goals.filter(
        (goal) =>
          goal.category === category.trim()
      );
    }

    if (status === "completed") {
      goals = goals.filter(
        (goal) =>
          goal.status === "Completed"
      );
    }

    if (status === "active") {
      goals = goals.filter(
        (goal) =>
          goal.status === "Active"
      );
    }

    return res.status(200).json({
      success: true,
      count: goals.length,
      goals,
    });
  } catch (error) {
    console.error(
      "Get all goals error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching goals.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Single Goal
|--------------------------------------------------------------------------
*/

export const getGoalById = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid goal ID.",
      });
    }

    const goal = await Goal.findById(
      req.params.id
    ).populate(
      "user",
      "name email profilePhoto"
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    return res.status(200).json({
      success: true,
      goal: serializeGoal(goal),
    });
  } catch (error) {
    console.error(
      "Get admin goal error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching goal.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Goal - Admin
|--------------------------------------------------------------------------
|
| Admin can edit goal data for correction/monitoring.
| User ownership cannot be changed here.
|
*/

export const updateGoal = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid goal ID.",
      });
    }

    const goal = await Goal.findById(
      req.params.id
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    const {
      title,
      category,
      startValue,
      target,
      current,
      unit,
      deadline,
      description,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Title
    |--------------------------------------------------------------------------
    */

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Goal title cannot be empty.",
        });
      }

      goal.title = String(
        title
      ).trim();
    }

    /*
    |--------------------------------------------------------------------------
    | Category
    |--------------------------------------------------------------------------
    */

    if (category !== undefined) {
      if (
        !allowedCategories.includes(
          category
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid goal category.",
        });
      }

      goal.category = category;
    }

    /*
    |--------------------------------------------------------------------------
    | Unit
    |--------------------------------------------------------------------------
    */

    if (unit !== undefined) {
      if (
        !allowedUnits.includes(unit)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid goal unit.",
        });
      }

      goal.unit = unit;
    }

    /*
    |--------------------------------------------------------------------------
    | Numeric values
    |--------------------------------------------------------------------------
    */

    const nextStart =
      startValue !== undefined
        ? Number(startValue)
        : Number(goal.startValue);

    const nextTarget =
      target !== undefined
        ? Number(target)
        : Number(goal.target);

    const nextCurrent =
      current !== undefined
        ? Number(current)
        : Number(goal.current);

    const numericValues =
      validateGoalNumbers({
        startValue: nextStart,
        target: nextTarget,
        current: nextCurrent,
      });

    if (!numericValues.valid) {
      return res.status(400).json({
        success: false,
        message:
          numericValues.message,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Admin can correct starting value.
    |--------------------------------------------------------------------------
    */

    goal.startValue =
      numericValues.start;

    goal.target =
      numericValues.target;

    goal.current =
      numericValues.current;

    /*
    |--------------------------------------------------------------------------
    | Deadline
    |--------------------------------------------------------------------------
    */

    if (deadline !== undefined) {
      if (!deadline) {
        goal.deadline = null;
      } else {
        const parsedDeadline =
          new Date(deadline);

        if (
          Number.isNaN(
            parsedDeadline.getTime()
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid deadline date.",
          });
        }

        goal.deadline =
          parsedDeadline;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Description
    |--------------------------------------------------------------------------
    */

    if (description !== undefined) {
      goal.description =
        String(description).trim();
    }

    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

    await goal.save();

    await goal.populate(
      "user",
      "name email profilePhoto"
    );

    return res.status(200).json({
      success: true,
      message:
        "Goal updated successfully.",
      goal: serializeGoal(goal),
    });
  } catch (error) {
    console.error(
      "Admin update goal error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating goal.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete Goal
|--------------------------------------------------------------------------
*/

export const deleteGoal = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid goal ID.",
      });
    }

    const goal =
      await Goal.findByIdAndDelete(
        req.params.id
      );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Goal deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin delete goal error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting goal.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Goal Statistics
|--------------------------------------------------------------------------
*/

export const getGoalStats = async (
  req,
  res
) => {
  try {
    const goals = await Goal.find({});

    let completedGoals = 0;
    let activeGoals = 0;
    let totalProgress = 0;

    const userIds = new Set();

    goals.forEach((goal) => {
      if (goal.user) {
        userIds.add(
          String(goal.user)
        );
      }

      const data =
        calculateGoalData(goal);

      if (
        data.status === "Completed"
      ) {
        completedGoals++;
      } else {
        activeGoals++;
      }

      totalProgress +=
        data.progress;
    });

    const totalGoals =
      goals.length;

    const averageProgress =
      totalGoals > 0
        ? Math.round(
            totalProgress /
              totalGoals
          )
        : 0;

    const categoryStats =
      await Goal.aggregate([
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

    const unitStats =
      await Goal.aggregate([
        {
          $group: {
            _id: "$unit",
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
        totalGoals,
        completedGoals,
        activeGoals,
        averageProgress,
        usersWithGoals:
          userIds.size,
        categories:
          categoryStats,
        units:
          unitStats,
      },
    });
  } catch (error) {
    console.error(
      "Get goal stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching goal statistics.",
    });
  }
};