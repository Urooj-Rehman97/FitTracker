import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    workoutReminders: {
      type: Boolean,
      default: true,
    },

    nutritionReminders: {
      type: Boolean,
      default: true,
    },

    weeklySummary: {
      type: Boolean,
      default: true,
    },

    progressUpdates: {
      type: Boolean,
      default: true,
    },

    darkMode: {
      type: Boolean,
      default: false,
    },

    profileVisibility: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserSettings = mongoose.model(
  "UserSettings",
  userSettingsSchema
);

export default UserSettings;