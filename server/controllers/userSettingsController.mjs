import UserSettings from "../models/UserSettings.mjs";

// Get User Settings
export const getUserSettings = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({
      user: req.user.id,
    });

    // Create default settings automatically
    // if the user does not have settings yet.
    if (!settings) {
      settings = await UserSettings.create({
        user: req.user.id,
      });
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get user settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching settings",
    });
  }
};

// Update User Settings
export const updateUserSettings = async (req, res) => {
  try {
    const allowedFields = [
      "emailNotifications",
      "workoutReminders",
      "nutritionReminders",
      "weeklySummary",
      "progressUpdates",
      "darkMode",
      "profileVisibility",
    ];

    let settings = await UserSettings.findOne({
      user: req.user.id,
    });

    if (!settings) {
      settings = new UserSettings({
        user: req.user.id,
      });
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = Boolean(req.body[field]);
      }
    });

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update user settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating settings",
    });
  }
};

// Reset User Settings
export const resetUserSettings = async (req, res) => {
  try {
    const settings = await UserSettings.findOneAndUpdate(
      {
        user: req.user.id,
      },
      {
        user: req.user.id,
        emailNotifications: true,
        workoutReminders: true,
        nutritionReminders: true,
        weeklySummary: true,
        progressUpdates: true,
        darkMode: false,
        profileVisibility: true,
      },
      {
        new: true,
        upsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Settings restored to default",
      settings,
    });
  } catch (error) {
    console.error("Reset user settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resetting settings",
    });
  }
};