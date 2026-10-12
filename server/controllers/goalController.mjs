import Goal from "../models/Goal.mjs";
import {
  createUserNotification,
} from "../utils/notificationHelper.mjs";

/*
|--------------------------------------------------------------------------
| Goal calculation
|--------------------------------------------------------------------------
*/

const calculateGoalData = (
  goal
) => {
  const start =
    Number(goal.startValue);

  const current =
    Number(goal.current);

  const target =
    Number(goal.target);

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(current) ||
    !Number.isFinite(target)
  ) {
    return {
      progress: 0,
      completed: Boolean(
        goal.completed
      ),
      status: goal.completed
        ? "Completed"
        : "Active",
      remaining: null,
      direction: "unknown",
      totalChange: null,
      achievedChange: null,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Same value
  |--------------------------------------------------------------------------
  */

  if (start === target) {
    const completed =
      current === target;

    return {
      progress: completed
        ? 100
        : 0,

      completed,

      status: completed
        ? "Completed"
        : "Active",

      remaining:
        Math.abs(
          target - current
        ),

      direction:
        "maintain",

      totalChange: 0,

      achievedChange: 0,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Decrease goal
  |--------------------------------------------------------------------------
  */

  if (start > target) {
    const totalChange =
      start - target;

    const achievedChange =
      Math.max(
        0,
        start - current
      );

    const completed =
      current <= target;

    const progress =
      completed
        ? 100
        : Math.min(
            100,
            Math.max(
              0,
              Math.round(
                (achievedChange /
                  totalChange) *
                  100
              )
            )
          );

    const remaining =
      completed
        ? 0
        : Math.max(
            0,
            current - target
          );

    return {
      progress,
      completed,
      status: completed
        ? "Completed"
        : "Active",
      remaining,
      direction:
        "decrease",
      totalChange,
      achievedChange:
        Math.min(
          totalChange,
          achievedChange
        ),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Increase goal
  |--------------------------------------------------------------------------
  */

  const totalChange =
    target - start;

  const achievedChange =
    Math.max(
      0,
      current - start
    );

  const completed =
    current >= target;

  const progress =
    completed
      ? 100
      : Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (achievedChange /
                totalChange) *
                100
            )
          )
        );

  const remaining =
    completed
      ? 0
      : Math.max(
          0,
          target - current
        );

  return {
    progress,
    completed,
    status: completed
      ? "Completed"
      : "Active",
    remaining,
    direction:
      "increase",
    totalChange,
    achievedChange:
      Math.min(
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

const serializeGoal = (
  goal
) => {
  const data =
    calculateGoalData(goal);

  const object =
    typeof goal.toObject ===
    "function"
      ? goal.toObject()
      : goal;

  return {
    ...object,
    progress:
      data.progress,
    completed:
      data.completed,
    status:
      data.status,
    remaining:
      data.remaining,
    direction:
      data.direction,
    totalChange:
      data.totalChange,
    achievedChange:
      data.achievedChange,
  };
};

/*
|--------------------------------------------------------------------------
| Create Goal
|--------------------------------------------------------------------------
*/

export const createGoal = async (
  req,
  res
) => {
  try {
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

    if (
      !title ||
      !category ||
      startValue ===
        undefined ||
      target ===
        undefined ||
      current ===
        undefined ||
      !unit
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, category, start value, target, current and unit are required.",
      });
    }

    const numericStart =
      Number(startValue);

    const numericTarget =
      Number(target);

    const numericCurrent =
      Number(current);

    if (
      !Number.isFinite(
        numericStart
      ) ||
      !Number.isFinite(
        numericTarget
      ) ||
      !Number.isFinite(
        numericCurrent
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Start value, target and current must be valid numbers.",
      });
    }

    if (
      numericStart < 0 ||
      numericTarget < 0 ||
      numericCurrent < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Goal values cannot be negative.",
      });
    }

    const goal =
      await Goal.create({
        user: req.user.id,

        title:
          title.trim(),

        category,

        startValue:
          numericStart,

        target:
          numericTarget,

        current:
          numericCurrent,

        unit,

        deadline:
          deadline || null,

        description:
          description
            ? description.trim()
            : "",
      });

    const goalData =
      serializeGoal(goal);

    /*
    |--------------------------------------------------------------------------
    | Automatic notification
    |--------------------------------------------------------------------------
    */

    await createUserNotification({
      userId:
        req.user.id,

      title:
        "Goal Created",

      message: `Your "${goal.title}" goal has been created successfully.`,

      type:
        "goal",

      link:
        "/dashboard/goals",
    });

    return res.status(201).json({
      success: true,
      message:
        "Goal created successfully.",
      goal:
        goalData,
    });
  } catch (error) {
    console.error(
      "Create goal error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating goal.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get My Goals
|--------------------------------------------------------------------------
*/

export const getGoals = async (
  req,
  res
) => {
  try {
    const goals =
      await Goal.find({
        user: req.user.id,
      }).sort({
        deadline: 1,
        createdAt: -1,
      });

    const serializedGoals =
      goals.map(
        serializeGoal
      );

    return res.status(200).json({
      success: true,
      count:
        serializedGoals.length,
      goals:
        serializedGoals,
    });
  } catch (error) {
    console.error(
      "Get goals error:",
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
    const goal =
      await Goal.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message:
          "Goal not found.",
      });
    }

    return res.status(200).json({
      success: true,
      goal:
        serializeGoal(goal),
    });
  } catch (error) {
    console.error(
      "Get goal error:",
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
| Update Goal
|--------------------------------------------------------------------------
*/

export const updateGoal = async (
  req,
  res
) => {
  try {
    const goal =
      await Goal.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message:
          "Goal not found.",
      });
    }

    const wasCompleted =
      calculateGoalData(
        goal
      ).completed;

    const allowedFields = [
      "title",
      "category",
      "target",
      "current",
      "unit",
      "deadline",
      "description",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          goal[field] =
            req.body[field];
        }
      }
    );

    /*
    |--------------------------------------------------------------------------
    | startValue intentionally remains unchanged
    |--------------------------------------------------------------------------
    */

    const startValue =
      Number(
        goal.startValue
      );

    const currentValue =
      Number(
        goal.current
      );

    const targetValue =
      Number(
        goal.target
      );

    if (
      !Number.isFinite(
        startValue
      ) ||
      !Number.isFinite(
        currentValue
      ) ||
      !Number.isFinite(
        targetValue
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Goal values must be valid numbers.",
      });
    }

    if (
      startValue < 0 ||
      currentValue < 0 ||
      targetValue < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Goal values cannot be negative.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

    await goal.save();

    const newGoalData =
      serializeGoal(
        goal
      );

    /*
    |--------------------------------------------------------------------------
    | Completed notification
    |--------------------------------------------------------------------------
    */

    if (
      !wasCompleted &&
      newGoalData.completed
    ) {
      await createUserNotification({
        userId:
          req.user.id,

        title:
          "Goal Completed",

        message: `Congratulations! You completed your "${goal.title}" goal.`,

        type:
          "goal",

        link:
          "/dashboard/goals",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Goal updated successfully.",
      goal:
        newGoalData,
    });
  } catch (error) {
    console.error(
      "Update goal error:",
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
    const goal =
      await Goal.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message:
          "Goal not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Goal deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete goal error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting goal.",
    });
  }
};