import { Routes, Route } from "react-router-dom";

// Public Pages
import Home from "../pages/public/Home/Home";
import About from "../pages/public/About/About";
import Features from "../pages/public/Features/Features";
import Contact from "../pages/public/Contact/Contact";
import Login from "../pages/public/Login/Login";
import Register from "../pages/public/Register/Register";
import ForgotPassword from "../pages/public/ForgotPassword/ForgotPassword";
import NotFound from "../pages/public/NotFound/NotFound";

// User Panel
import UserLayout from "../components/layout/UserLayout/UserLayout";
import Dashboard from "../pages/user/Dashboard/Dashboard";
import Workouts from "../pages/user/Workouts/Workouts";
import Nutrition from "../pages/user/Nutrition/Nutrition";
import Progress from "../pages/user/Progress/Progress";
import Goals from "../pages/user/Goals/Goals";
import Analytics from "../pages/user/Analytics/Analytics";
import Profile from "../pages/user/Profile/Profile";
import Settings from "../pages/user/Settings/Settings";
import Notifications from "../pages/user/Notifications/Notifications";
import Support from "../pages/user/Support/Support";

// Admin Panel
import AdminLayout from "../components/admin/AdminLayout/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard/AdminDashboard";
import AdminUsers from "../pages/admin/Users/AdminUsers";
import AdminWorkouts from "../pages/admin/Workouts/AdminWorkouts";
import AdminNutrition from "../pages/admin/Nutrition/AdminNutrition";
import AdminGoals from "../pages/admin/Goals/AdminGoals";
import AdminProgress from "../pages/admin/Progress/AdminProgress";
import AdminNotifications from "../pages/admin/Notifications/AdminNotifications";
import AdminReports from "../pages/admin/Reports/AdminReports";
import AdminSettings from "../pages/admin/Settings/AdminSettings";
import AdminAnalytics from "../pages/admin/Analytics/AdminAnalytics";
import AdminSupport from "../pages/admin/Support/AdminSupport";
import AdminContent from "../pages/admin/Content/AdminContent";
import AdminContactMessages from "../pages/admin/ContactMessages/AdminContactMessages";

// Route Protection
import ProtectedRoute from "../components/common/ProtectedRoute/ProtectedRoute";
import AdminProtectedRoute from "../components/common/AdminProtectedRoute/AdminProtectedRoute";

// Layout
import PublicLayout from "../components/layout/PublicLayout/PublicLayout";

function AppRoutes() {
  return (
    <Routes>
      {/* =========================
          PUBLIC WEBSITE
      ========================== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* =========================
          USER PANEL
      ========================== */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<UserLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="progress" element={<Progress />} />
          <Route path="goals" element={<Goals />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="support" element={<Support />} />
        </Route>
      </Route>

      {/* =========================
          ADMIN PANEL
      ========================== */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />

          <Route path="users" element={<AdminUsers />} />
          <Route path="workouts" element={<AdminWorkouts />} />
          <Route path="nutrition" element={<AdminNutrition />} />
          <Route path="goals" element={<AdminGoals />} />
          <Route path="progress" element={<AdminProgress />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="content" element={<AdminContent />} />
          <Route
            path="contact-messages"
            element={<AdminContactMessages />}
          />
        </Route>
      </Route>

      {/* =========================
          404 PAGE
      ========================== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;