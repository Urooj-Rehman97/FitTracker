import Settings from "../models/Settings.mjs";

const DEFAULT_SETTINGS = {
  siteName: "FitTrack",
  supportEmail: "support@fittrack.com",
  timezone: "UTC",
  dateFormat: "DD/MM/YYYY",

  adminEmail: "admin@fittrack.com",
  twoFactor: true,
  sessionTimeout: "30",

  emailNotifications: true,
  newUserAlerts: true,
  workoutReports: true,
  systemAlerts: true,

  maintenanceMode: false,
  allowRegistration: true,
  automaticBackup: true,
};

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create(DEFAULT_SETTINGS);
  }

  return settings;
};

export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get settings",
      error: error.message,
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    const allowedFields = [
      "siteName",
      "supportEmail",
      "timezone",
      "dateFormat",

      "adminEmail",
      "twoFactor",
      "sessionTimeout",

      "emailNotifications",
      "newUserAlerts",
      "workoutReports",
      "systemAlerts",

      "maintenanceMode",
      "allowRegistration",
      "automaticBackup",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

export const resetSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (settings) {
      Object.assign(settings, DEFAULT_SETTINGS);

      await settings.save();
    } else {
      settings = await Settings.create(DEFAULT_SETTINGS);
    }

    return res.status(200).json({
      success: true,
      message: "Settings reset successfully",
      settings,
    });
  } catch (error) {
    console.error("Reset settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset settings",
      error: error.message,
    });
  }
};