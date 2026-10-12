import Nutrition from "../models/Nutrition.mjs";
import { createUserNotification } from "../utils/notificationHelper.mjs";

// Create Nutrition Log
export const createNutrition = async (req, res) => {
  try {
    const {
      date,
      mealType,
      foodName,
      quantity,
      calories,
      protein,
      carbs,
      fats,
      notes,
    } = req.body;

    if (!date || !mealType || !foodName) {
      return res.status(400).json({
        success: false,
        message: "Date, meal type and food name are required",
      });
    }

    const nutrition = await Nutrition.create({
      user: req.user.id,
      date,
      mealType,
      foodName: foodName.trim(),
      quantity: quantity || "",
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fats: fats || 0,
      notes: notes || "",
    });

    // Automatic notification
    await createUserNotification({
      userId: req.user.id,
      title: "Nutrition Logged",
      message: `${nutrition.foodName} has been added to your ${nutrition.mealType.toLowerCase()} meal.`,
      type: "nutrition",
      link: "/dashboard/nutrition",
    });

    return res.status(201).json({
      success: true,
      message: "Nutrition log created successfully",
      nutrition,
    });
  } catch (error) {
    console.error("Create nutrition error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating nutrition log",
    });
  }
};

// Get Nutrition Logs
export const getNutrition = async (req, res) => {
  try {
    const nutrition = await Nutrition.find({
      user: req.user.id,
    }).sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: nutrition.length,
      nutrition,
    });
  } catch (error) {
    console.error("Get nutrition error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching nutrition logs",
    });
  }
};

// Get Single Nutrition Log
export const getNutritionById = async (req, res) => {
  try {
    const nutrition = await Nutrition.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!nutrition) {
      return res.status(404).json({
        success: false,
        message: "Nutrition log not found",
      });
    }

    return res.status(200).json({
      success: true,
      nutrition,
    });
  } catch (error) {
    console.error("Get nutrition log error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching nutrition log",
    });
  }
};

// Update Nutrition Log
export const updateNutrition = async (req, res) => {
  try {
    const nutrition = await Nutrition.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!nutrition) {
      return res.status(404).json({
        success: false,
        message: "Nutrition log not found",
      });
    }

    const allowedFields = [
      "date",
      "mealType",
      "foodName",
      "quantity",
      "calories",
      "protein",
      "carbs",
      "fats",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        nutrition[field] = req.body[field];
      }
    });

    await nutrition.save();

    return res.status(200).json({
      success: true,
      message: "Nutrition log updated successfully",
      nutrition,
    });
  } catch (error) {
    console.error("Update nutrition error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating nutrition log",
    });
  }
};

// Delete Nutrition Log
export const deleteNutrition = async (req, res) => {
  try {
    const nutrition = await Nutrition.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!nutrition) {
      return res.status(404).json({
        success: false,
        message: "Nutrition log not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Nutrition log deleted successfully",
    });
  } catch (error) {
    console.error("Delete nutrition error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting nutrition log",
    });
  }
};