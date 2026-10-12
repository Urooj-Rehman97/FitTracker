import Notification from "../models/Notification.mjs";
import User from "../models/User.mjs";
import mongoose from "mongoose";

// Get all notifications
export const getAllNotifications = async (req, res) => {
  try {
    const {
      search = "",
      type = "",
      status = "",
    } = req.query;

    let query = {};

    // Filter by notification type
    if (type && type !== "all") {
      query.type = type;
    }

    // Filter by read/unread status
    if (status === "read") {
      query.isRead = true;
    }

    if (status === "unread") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate("user", "name email profilePhoto")
      .sort({ createdAt: -1 });

    let filteredNotifications = notifications;

    // Search by user name, email, title or message
    if (search.trim()) {
      const searchText = search.trim().toLowerCase();

      filteredNotifications = notifications.filter((notification) => {
        const userName =
          notification.user?.name?.toLowerCase() || "";

        const userEmail =
          notification.user?.email?.toLowerCase() || "";

        const title =
          notification.title?.toLowerCase() || "";

        const message =
          notification.message?.toLowerCase() || "";

        return (
          userName.includes(searchText) ||
          userEmail.includes(searchText) ||
          title.includes(searchText) ||
          message.includes(searchText)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: filteredNotifications.length,
      notifications: filteredNotifications,
    });
  } catch (error) {
    console.error("Get all admin notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching notifications",
    });
  }
};

// Get single notification
export const getNotificationById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findById(
      req.params.id
    ).populate("user", "name email profilePhoto");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Get notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching notification",
    });
  }
};

// Create notification for one user
export const createNotification = async (req, res) => {
  try {
    const {
      userId,
      title,
      message,
      type = "system",
      link = "",
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification title is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification message is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const notification = await Notification.create({
      user: userId,
      title: title.trim(),
      message: message.trim(),
      type,
      link: link.trim(),
      isRead: false,
    });

    const populatedNotification =
      await Notification.findById(notification._id).populate(
        "user",
        "name email profilePhoto"
      );

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification: populatedNotification,
    });
  } catch (error) {
    console.error("Create notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating notification",
    });
  }
};

// Broadcast notification to all active users
export const broadcastNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type = "system",
      link = "",
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification title is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification message is required",
      });
    }

    const users = await User.find({
      role: "user",
      isActive: true,
    }).select("_id");

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active users found",
      });
    }

    const notifications = users.map((user) => ({
      user: user._id,
      title: title.trim(),
      message: message.trim(),
      type,
      link: link.trim(),
      isRead: false,
    }));

    const createdNotifications =
      await Notification.insertMany(notifications);

    return res.status(201).json({
      success: true,
      message: "Notification broadcast successfully",
      count: createdNotifications.length,
    });
  } catch (error) {
    console.error("Broadcast notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while broadcasting notification",
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findById(
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    const updatedNotification =
      await Notification.findById(notification._id).populate(
        "user",
        "name email profilePhoto"
      );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating notification",
    });
  }
};

// Update notification
export const updateNotification = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const {
      title,
      message,
      type,
      link,
      isRead,
    } = req.body;

    const notification = await Notification.findById(
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (title !== undefined) {
      notification.title = title.trim();
    }

    if (message !== undefined) {
      notification.message = message.trim();
    }

    if (type !== undefined) {
      notification.type = type;
    }

    if (link !== undefined) {
      notification.link = link.trim();
    }

    if (isRead !== undefined) {
      notification.isRead = Boolean(isRead);
    }

    await notification.save();

    const updatedNotification =
      await Notification.findById(notification._id).populate(
        "user",
        "name email profilePhoto"
      );

    return res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Update notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating notification",
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification =
      await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting notification",
    });
  }
};

// Delete all notifications
export const deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({});

    return res.status(200).json({
      success: true,
      message: "All notifications deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete all notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting notifications",
    });
  }
};

// Notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const total = await Notification.countDocuments();

    const read = await Notification.countDocuments({
      isRead: true,
    });

    const unread = await Notification.countDocuments({
      isRead: false,
    });

    const typeStats = await Notification.aggregate([
      {
        $group: {
          _id: "$type",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        read,
        unread,
        typeStats,
      },
    });
  } catch (error) {
    console.error("Get notification stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching notification statistics",
    });
  }
};