import express from "express";

import {
  getAllNotifications,
  getNotificationById,
  createNotification,
  broadcastNotification,
  markNotificationAsRead,
  updateNotification,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats,
} from "../controllers/adminNotificationController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";
import { adminOnly } from "../middleware/adminMiddleware.mjs";

const router = express.Router();

// All admin notification routes require authentication
router.use(protect);
router.use(adminOnly);

// Statistics
router.get("/stats", getNotificationStats);

// Create notification for one user
router.post("/", createNotification);

// Broadcast notification to all active users
router.post("/broadcast", broadcastNotification);

// Get all notifications
router.get("/", getAllNotifications);

// Delete all notifications
router.delete("/clear-all", deleteAllNotifications);

// Get single notification
router.get("/:id", getNotificationById);

// Mark notification as read
router.put("/:id/read", markNotificationAsRead);

// Update notification
router.put("/:id", updateNotification);

// Delete notification
router.delete("/:id", deleteNotification);

export default router;