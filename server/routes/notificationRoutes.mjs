import express from "express";

import {
  createNotification,
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.use(protect);

// Create notification
router.post("/", createNotification);

// Get all notifications
router.get("/", getNotifications);

// Mark all as read
router.put("/read-all", markAllNotificationsAsRead);

// Delete all
router.delete("/clear-all", deleteAllNotifications);

// Get single notification
router.get("/:id", getNotificationById);

// Mark single as read
router.put("/:id/read", markNotificationAsRead);

// Delete single notification
router.delete("/:id", deleteNotification);

export default router;