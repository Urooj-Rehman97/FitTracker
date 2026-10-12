import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "FitTrack",
      trim: true,
    },

    supportEmail: {
      type: String,
      default: "support@fittrack.com",
      trim: true,
    },

    timezone: {
      type: String,
      default: "UTC",
      trim: true,
    },

    dateFormat: {
      type: String,
      default: "DD/MM/YYYY",
      trim: true,
    },

    adminEmail: {
      type: String,
      default: "admin@fittrack.com",
      trim: true,
    },

    twoFactor: {
      type: Boolean,
      default: true,
    },

    sessionTimeout: {
      type: String,
      default: "30",
      trim: true,
    },

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    newUserAlerts: {
      type: Boolean,
      default: true,
    },

    workoutReports: {
      type: Boolean,
      default: true,
    },

    systemAlerts: {
      type: Boolean,
      default: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    allowRegistration: {
      type: Boolean,
      default: true,
    },

    automaticBackup: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const AdminSettings = mongoose.model(
  "AdminSettings",
  adminSettingsSchema
);

export default AdminSettings;