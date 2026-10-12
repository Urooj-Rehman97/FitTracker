import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
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

    weight: {
      type: Number,
      min: 0,
      default: null,
    },

    chest: {
      type: Number,
      min: 0,
      default: null,
    },

    waist: {
      type: Number,
      min: 0,
      default: null,
    },

    arms: {
      type: Number,
      min: 0,
      default: null,
    },

    strength: {
      type: Number,
      min: 0,
      default: null,
    },

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

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;