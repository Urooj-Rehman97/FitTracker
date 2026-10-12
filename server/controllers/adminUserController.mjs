import User from "../models/User.mjs";

// =========================
// GET ALL USERS
// =========================

export const getAllUsers = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
    } = req.query;

    const query = {
      role: "user",
    };

    if (search.trim()) {
      query.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          email: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (status === "active") {
      query.isActive = true;
    }

    if (status === "inactive") {
      query.isActive = false;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load users",
    });
  }
};

// =========================
// GET SINGLE USER
// =========================

export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "user",
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load user",
    });
  }
};

// =========================
// CREATE USER
// =========================

export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      profilePhoto,
      isActive,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "user",
      phone: phone?.trim() || "",
      gender: gender || "",
      profilePhoto: profilePhoto?.trim() || "",
      isActive:
        typeof isActive === "boolean"
          ? isActive
          : true,
    });

    const safeUser = await User.findById(
      user._id
    ).select("-password");

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Create admin user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// =========================
// UPDATE USER
// =========================

export const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      profilePhoto,
      isActive,
    } = req.body;

    const user = await User.findOne({
      _id: req.params.id,
      role: "user",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const emailExists = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (emailExists) {
      return res.status(409).json({
        success: false,
        message:
          "Another account already uses this email",
      });
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.phone = phone?.trim() || "";
    user.gender = gender || "";
    user.profilePhoto =
      profilePhoto?.trim() || "";

    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }

    if (password?.trim()) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters",
        });
      }

      user.password = password;
    }

    await user.save();

    const safeUser = await User.findById(
      user._id
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Update admin user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// =========================
// UPDATE USER STATUS
// =========================

export const updateUserStatus = async (
  req,
  res
) => {
  try {
    const { isActive } = req.body;

    const user = await User.findOne({
      _id: req.params.id,
      role: "user",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = Boolean(isActive);

    await user.save();

    const safeUser = await User.findById(
      user._id
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "Update user status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

// =========================
// DELETE USER
// =========================

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      role: "user",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// =========================
// USER STATISTICS
// =========================

export const getUserStats = async (
  req,
  res
) => {
  try {
    const now = new Date();

    const startOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      newThisMonth,
      previousMonthUsers,
    ] = await Promise.all([
      User.countDocuments({
        role: "user",
      }),

      User.countDocuments({
        role: "user",
        isActive: true,
      }),

      User.countDocuments({
        role: "user",
        isActive: false,
      }),

      User.countDocuments({
        role: "user",
        createdAt: {
          $gte: startOfCurrentMonth,
        },
      }),

      User.countDocuments({
        role: "user",
        createdAt: {
          $gte: startOfPreviousMonth,
          $lt: startOfCurrentMonth,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newThisMonth,
        previousMonthUsers,
      },
    });
  } catch (error) {
    console.error(
      "Get user stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load user statistics",
    });
  }
};