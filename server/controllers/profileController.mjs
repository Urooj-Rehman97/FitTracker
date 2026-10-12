import User from "../models/User.mjs";

// ================= GET PROFILE =================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto:
          user.profilePhoto || "",
        dateOfBirth:
          user.dateOfBirth,
        gender:
          user.gender,
        phone:
          user.phone,
        height:
          user.height,
        bio:
          user.bio,
      },
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching profile",
    });
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      profilePhoto,
      dateOfBirth,
      gender,
      phone,
      height,
      bio,
    } = req.body;

    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ================= NAME =================
    if (name !== undefined) {
      const cleanName =
        name.trim();

      if (cleanName.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Name must be at least 2 characters",
        });
      }

      user.name = cleanName;
    }

    // ================= EMAIL =================
    if (email !== undefined) {
      const cleanEmail =
        email.toLowerCase().trim();

      const existingUser =
        await User.findOne({
          email: cleanEmail,
          _id: {
            $ne: req.user.id,
          },
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "Email is already registered",
        });
      }

      user.email = cleanEmail;
    }

    // ================= PROFILE PHOTO =================
    // Only update when frontend explicitly
    // sends profilePhoto.
    if (
      profilePhoto !== undefined
    ) {
      if (
        profilePhoto !== "" &&
        typeof profilePhoto !==
          "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid profile photo",
        });
      }

      // Extra server-side safety check.
      // Approximately 1.5MB Base64 maximum.
      if (
        profilePhoto &&
        profilePhoto.length >
          2_000_000
      ) {
        return res.status(413).json({
          success: false,
          message:
            "Profile photo is too large. Please choose a smaller image.",
        });
      }

      user.profilePhoto =
        profilePhoto;
    }

    // ================= DATE OF BIRTH =================
    if (
      dateOfBirth !== undefined
    ) {
      user.dateOfBirth =
        dateOfBirth || null;
    }

    // ================= GENDER =================
    if (gender !== undefined) {
      user.gender = gender;
    }

    // ================= PHONE =================
    if (phone !== undefined) {
      user.phone =
        phone.trim();
    }

    // ================= HEIGHT =================
    if (height !== undefined) {
      if (
        height === "" ||
        height === null
      ) {
        user.height = null;
      } else {
        const numericHeight =
          Number(height);

        if (
          Number.isNaN(
            numericHeight
          ) ||
          numericHeight <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Height must be a valid positive number",
          });
        }

        user.height =
          numericHeight;
      }
    }

    // ================= BIO =================
    if (bio !== undefined) {
      user.bio =
        bio.trim();
    }

    // ================= SAVE =================
    await user.save();

    // ================= RESPONSE =================
    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto:
          user.profilePhoto || "",
        dateOfBirth:
          user.dateOfBirth,
        gender:
          user.gender,
        phone:
          user.phone,
        height:
          user.height,
        bio:
          user.bio,
      },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating profile",
    });
  }
};

export default {
  getProfile,
  updateProfile,
};