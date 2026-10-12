import Progress from "../models/Progress.mjs";
import mongoose from "mongoose";

// Get all progress records
export const getAllProgress = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const progress = await Progress.find({})
      .populate("user", "name email profilePhoto")
      .sort({ date: -1 });

    let filteredProgress = progress;

    if (search.trim()) {
      const searchText = search.trim().toLowerCase();

      filteredProgress = progress.filter((item) => {
        const userName = item.user?.name?.toLowerCase() || "";
        const userEmail = item.user?.email?.toLowerCase() || "";
        const notes = item.notes?.toLowerCase() || "";

        return (
          userName.includes(searchText) ||
          userEmail.includes(searchText) ||
          notes.includes(searchText)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: filteredProgress.length,
      progress: filteredProgress,
    });
  } catch (error) {
    console.error("Get all progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching progress records",
    });
  }
};

// Get single progress record
export const getProgressById = async (req, res) => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress record ID",
      });
    }

    const progress = await Progress.findById(req.params.id).populate(
      "user",
      "name email profilePhoto"
    );

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
      message: "Server error while fetching progress record",
    });
  }
};

// Update progress record
export const updateProgress = async (req, res) => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress record ID",
      });
    }

    const {
      date,
      weight,
      chest,
      waist,
      arms,
      strength,
      notes,
    } = req.body;

    const progress = await Progress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found",
      });
    }

    if (date !== undefined) {
      progress.date = date;
    }

    if (weight !== undefined) {
      progress.weight = weight;
    }

    if (chest !== undefined) {
      progress.chest = chest;
    }

    if (waist !== undefined) {
      progress.waist = waist;
    }

    if (arms !== undefined) {
      progress.arms = arms;
    }

    if (strength !== undefined) {
      progress.strength = strength;
    }

    if (notes !== undefined) {
      progress.notes = notes.trim();
    }

    await progress.save();

    const updatedProgress = await Progress.findById(
      progress._id
    ).populate("user", "name email profilePhoto");

    return res.status(200).json({
      success: true,
      message: "Progress record updated successfully",
      progress: updatedProgress,
    });
  } catch (error) {
    console.error("Update progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating progress record",
    });
  }
};

// Delete progress record
export const deleteProgress = async (req, res) => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress record ID",
      });
    }

    const progress = await Progress.findByIdAndDelete(req.params.id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Progress record deleted successfully",
    });
  } catch (error) {
    console.error("Delete progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting progress record",
    });
  }
};

// Progress statistics
export const getProgressStats = async (req, res) => {
  try {
    const totalRecords = await Progress.countDocuments();

    const stats = await Progress.aggregate([
      {
        $group: {
          _id: null,

          averageWeight: {
            $avg: "$weight",
          },

          averageChest: {
            $avg: "$chest",
          },

          averageWaist: {
            $avg: "$waist",
          },

          averageArms: {
            $avg: "$arms",
          },

          averageStrength: {
            $avg: "$strength",
          },

          lowestWeight: {
            $min: "$weight",
          },

          highestWeight: {
            $max: "$weight",
          },
        },
      },
    ]);

    const latestRecords = await Progress.find({})
      .populate("user", "name email profilePhoto")
      .sort({ date: -1 })
      .limit(10);

    const data = stats[0] || {};

    return res.status(200).json({
      success: true,

      stats: {
        totalRecords,

        averageWeight: Number(
          (data.averageWeight || 0).toFixed(2)
        ),

        averageChest: Number(
          (data.averageChest || 0).toFixed(2)
        ),

        averageWaist: Number(
          (data.averageWaist || 0).toFixed(2)
        ),

        averageArms: Number(
          (data.averageArms || 0).toFixed(2)
        ),

        averageStrength: Number(
          (data.averageStrength || 0).toFixed(2)
        ),

        lowestWeight: data.lowestWeight || 0,

        highestWeight: data.highestWeight || 0,

        latestRecords,
      },
    });
  } catch (error) {
    console.error("Get progress stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching progress statistics",
    });
  }
};