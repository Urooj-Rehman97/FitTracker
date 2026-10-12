import Nutrition from "../models/Nutrition.mjs";
import User from "../models/User.mjs";

// Get all nutrition records
export const getAllNutrition = async (req, res) => {
  try {
    const { search = "", mealType = "" } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        {
          foodName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          notes: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (mealType.trim()) {
      query.mealType = mealType.trim();
    }

    const nutrition = await Nutrition.find(query)
      .populate("user", "name email profilePhoto")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: nutrition.length,
      nutrition,
    });
  } catch (error) {
    console.error("Get all nutrition error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching nutrition records",
    });
  }
};

// Get single nutrition record
export const getNutritionById = async (req, res) => {
  try {
    const nutrition = await Nutrition.findById(req.params.id).populate(
      "user",
      "name email profilePhoto"
    );

    if (!nutrition) {
      return res.status(404).json({
        success: false,
        message: "Nutrition record not found",
      });
    }

    return res.status(200).json({
      success: true,
      nutrition,
    });
  } catch (error) {
    console.error("Get nutrition error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching nutrition record",
    });
  }
};

// Update nutrition record
export const updateNutrition = async (req, res) => {
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

    const nutrition = await Nutrition.findById(req.params.id);

    if (!nutrition) {
      return res.status(404).json({
        success: false,
        message: "Nutrition record not found",
      });
    }

    if (date !== undefined) nutrition.date = date;
    if (mealType !== undefined) nutrition.mealType = mealType;
    if (foodName !== undefined) nutrition.foodName = foodName.trim();
    if (quantity !== undefined) nutrition.quantity = quantity;
    if (calories !== undefined) nutrition.calories = calories;
    if (protein !== undefined) nutrition.protein = protein;
    if (carbs !== undefined) nutrition.carbs = carbs;
    if (fats !== undefined) nutrition.fats = fats;
    if (notes !== undefined) nutrition.notes = notes.trim();

    await nutrition.save();

    const updatedNutrition = await Nutrition.findById(
      nutrition._id
    ).populate("user", "name email profilePhoto");

    return res.status(200).json({
      success: true,
      message: "Nutrition record updated successfully",
      nutrition: updatedNutrition,
    });
  } catch (error) {
    console.error("Update nutrition error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating nutrition record",
    });
  }
};

// Delete nutrition record
export const deleteNutrition = async (req, res) => {
  try {
    const nutrition = await Nutrition.findByIdAndDelete(req.params.id);

    if (!nutrition) {
      return res.status(404).json({
        success: false,
        message: "Nutrition record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Nutrition record deleted successfully",
    });
  } catch (error) {
    console.error("Delete nutrition error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting nutrition record",
    });
  }
};

// Nutrition statistics
export const getNutritionStats = async (req, res) => {
  try {
    const totals = await Nutrition.aggregate([
      {
        $group: {
          _id: null,
          totalCalories: {
            $sum: "$calories",
          },
          totalProtein: {
            $sum: "$protein",
          },
          totalCarbs: {
            $sum: "$carbs",
          },
          totalFats: {
            $sum: "$fats",
          },
          totalRecords: {
            $sum: 1,
          },
        },
      },
    ]);

    const mealTypeStats = await Nutrition.aggregate([
      {
        $group: {
          _id: "$mealType",
          count: {
            $sum: 1,
          },
          calories: {
            $sum: "$calories",
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const userStats = await Nutrition.aggregate([
      {
        $group: {
          _id: "$user",
          records: {
            $sum: 1,
          },
          calories: {
            $sum: "$calories",
          },
        },
      },
      {
        $sort: {
          records: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          records: 1,
          calories: 1,
          name: "$user.name",
          email: "$user.email",
        },
      },
    ]);

    return res.status(200).json({
      success: true,

      totals: totals[0] || {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        totalRecords: 0,
      },

      mealTypes: mealTypeStats,

      topUsers: userStats,
    });
  } catch (error) {
    console.error("Get nutrition stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching nutrition statistics",
    });
  }
};