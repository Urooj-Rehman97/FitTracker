import Progress from "../models/Progress.mjs";
import { createUserNotification } from "../utils/notificationHelper.mjs";

// Create Progress
export const createProgress = async (req, res) => {
  try {
    const {
      date,
      weight,
      chest,
      waist,
      arms,
      strength,
      notes,
    } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const progress = await Progress.create({
      user: req.user.id,
      date,
      weight: weight ?? null,
      chest: chest ?? null,
      waist: waist ?? null,
      arms: arms ?? null,
      strength: strength ?? null,
      notes: notes || "",
    });

    // Automatic notification
    await createUserNotification({
      userId: req.user.id,
      title: "Progress Updated",
      message: "Your latest fitness progress has been recorded successfully.",
      type: "progress",
      link: "/dashboard/progress",
    });

    return res.status(201).json({
      success: true,
      message: "Progress added successfully",
      progress,
    });
  } catch (error) {
    console.error("Create progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while adding progress",
    });
  }
};

// Get My Progress
export const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find({
      user: req.user.id,
    }).sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: progress.length,
      progress,
    });
  } catch (error) {
    console.error("Get progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching progress",
    });
  }
};

// Get Single Progress
export const getProgressById = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found",
      });
    }

    return res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Get progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching progress",
    });
  }
};

// Update Progress
export const updateProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found",
      });
    }

    const allowedFields = [
      "date",
      "weight",
      "chest",
      "waist",
      "arms",
      "strength",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        progress[field] = req.body[field];
      }
    });

    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      progress,
    });
  } catch (error) {
    console.error("Update progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating progress",
    });
  }
};

// Delete Progress
export const deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Progress deleted successfully",
    });
  } catch (error) {
    console.error("Delete progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting progress",
    });
  }
};