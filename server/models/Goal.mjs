import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
      maxlength: [100, "Goal title cannot exceed 100 characters"],
    },

    category: {
      type: String,
      required: [true, "Goal category is required"],
      enum: [
        "Weight",
        "Strength",
        "Cardio",
        "Nutrition",
        "Body Measurement",
        "Other",
      ],
    },

    // Original starting value when the goal was created.
    startValue: {
      type: Number,
      required: [true, "Starting value is required"],
      min: 0,
    },

    target: {
      type: Number,
      required: [true, "Target is required"],
      min: 0,
    },

    current: {
      type: Number,
      required: [true, "Current value is required"],
      min: 0,
    },

    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: [
        "kg",
        "lbs",
        "cm",
        "reps",
        "min",
        "km",
        "cal",
        "%",
      ],
    },

    deadline: {
      type: Date,
      default: null,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Keep completed status consistent
|--------------------------------------------------------------------------
|
| Decreasing goal:
| 80 -> 70
| Current 70 or below = completed
|
| Increasing goal:
| 60 -> 70
| Current 70 or above = completed
|
*/

goalSchema.pre("save", function () {
  const start = Number(this.startValue);
  const current = Number(this.current);
  const target = Number(this.target);

  if (
    Number.isFinite(start) &&
    Number.isFinite(current) &&
    Number.isFinite(target)
  ) {
    if (start === target) {
      this.completed = current === target;
    } else if (start > target) {
      this.completed = current <= target;
    } else {
      this.completed = current >= target;
    }
  }
});

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;