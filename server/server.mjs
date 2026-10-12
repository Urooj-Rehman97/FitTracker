import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.mjs";

// Main routes
import authRoutes from "./routes/authRoutes.mjs";
import workoutRoutes from "./routes/workoutRoutes.mjs";
import nutritionRoutes from "./routes/nutritionRoutes.mjs";
import progressRoutes from "./routes/progressRoutes.mjs";
import goalRoutes from "./routes/goalRoutes.mjs";
import profileRoutes from "./routes/profileRoutes.mjs";
import notificationRoutes from "./routes/notificationRoutes.mjs";
import dashboardRoutes from "./routes/dashboardRoutes.mjs";
import analyticsRoutes from "./routes/analyticsRoutes.mjs";
import userSettingsRoutes from "./routes/userSettingsRoutes.mjs";
import supportRoutes from "./routes/supportRoutes.mjs";
import contactRoutes from "./routes/contactRoutes.mjs";

// Admin routes
import adminUserRoutes from "./routes/adminUserRoutes.mjs";
import adminWorkoutRoutes from "./routes/adminWorkoutRoutes.mjs";
import adminNutritionRoutes from "./routes/adminNutritionRoutes.mjs";
import adminGoalRoutes from "./routes/adminGoalRoutes.mjs";
import adminProgressRoutes from "./routes/adminProgressRoutes.mjs";
import adminNotificationRoutes from "./routes/adminNotificationRoutes.mjs";
import adminReportRoutes from "./routes/adminReportRoutes.mjs";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.mjs";
import adminSupportRoutes from "./routes/adminSupportRoutes.mjs";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.mjs";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.mjs";

// Public website content
import publicContentRoutes from "./routes/publicContentRoutes.mjs";
import adminPublicContentRoutes from "./routes/adminPublicContentRoutes.mjs";

dotenv.config();

const app = express();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

// ===============================
// REQUEST BODY LIMITS
// ===============================
// Increased from Express default limit
// to support compressed profile images.
app.use(
  express.json({
    limit: "3mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "3mb",
  })
);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FitTrack API is running",
  });
});

// ===============================
// MAIN API ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/user-settings", userSettingsRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/contact", contactRoutes);

// ===============================
// ADMIN API ROUTES
// ===============================

app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/workouts", adminWorkoutRoutes);
app.use("/api/admin/nutrition", adminNutritionRoutes);
app.use("/api/admin/goals", adminGoalRoutes);
app.use("/api/admin/progress", adminProgressRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/support", adminSupportRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

// ===============================
// PUBLIC WEBSITE CONTENT
// ===============================

app.use("/api/public", publicContentRoutes);

// ===============================
// ADMIN WEBSITE CONTENT
// ===============================

app.use(
  "/api/admin/public-content",
  adminPublicContentRoutes
);

// ===============================
// START SERVER
// ===============================

const PORT =
  process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `FitTrack server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();