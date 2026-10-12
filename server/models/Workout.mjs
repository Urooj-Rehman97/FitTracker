import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    workoutName: {
      type: String,
      required: [true, "Workout name is required"],
      trim: true,
      maxlength: [100, "Workout name cannot exceed 100 characters"],
    },

    category: {
      type: String,
      required: [true, "Workout category is required"],
      trim: true,
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    caloriesBurned: {
      type: Number,
      default: 0,
      min: 0,
    },

    exercises: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        sets: {
          type: Number,
          default: 0,
          min: 0,
        },

        reps: {
          type: Number,
          default: 0,
          min: 0,
        },

        weight: {
          type: Number,
          default: 0,
          min: 0,
        },

        notes: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;