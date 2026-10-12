import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "FitTrack",
      trim: true,
    },
    siteEmail: {
      type: String,
      default: "support@fittrack.com",
      trim: true,
      lowercase: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowRegistration: {
      type: Boolean,
      default: true,
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
    profileVisibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;