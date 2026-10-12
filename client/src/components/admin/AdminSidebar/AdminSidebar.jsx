import { NavLink, useNavigate, Link } from "react-router-dom";

import {
  FaDumbbell,
  FaThLarge,
  FaUsers,
  FaRunning,
  FaUtensils,
  FaBullseye,
  FaChartLine,
  FaBell,
  FaFileAlt,
  FaCog,
  FaGlobe,
  FaSignOutAlt,
  FaChartPie,
  FaLifeRing,
  FaEnvelope,
} from "react-icons/fa";

import { logoutUser } from "../../../services/api";

import "./AdminSidebar.css";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <Link to="/admin">
          <span className="admin-logo-icon">
            <FaDumbbell />
          </span>

          <span className="admin-logo-text">
            Fit<span>Track</span>
          </span>
        </Link>
      </div>

      <div className="admin-sidebar-content">
        <div className="admin-sidebar-section">
          <span className="admin-sidebar-title">OVERVIEW</span>

          <nav className="admin-sidebar-nav">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaThLarge />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaChartPie />
              <span>Analytics</span>
            </NavLink>
          </nav>
        </div>

        <div className="admin-sidebar-section">
          <span className="admin-sidebar-title">MANAGEMENT</span>

          <nav className="admin-sidebar-nav">
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaUsers />
              <span>Users</span>
            </NavLink>

            <NavLink
              to="/admin/workouts"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaRunning />
              <span>Workouts</span>
            </NavLink>

            <NavLink
              to="/admin/nutrition"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaUtensils />
              <span>Nutrition</span>
            </NavLink>

            <NavLink
              to="/admin/goals"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaBullseye />
              <span>Goals</span>
            </NavLink>

            <NavLink
              to="/admin/progress"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaChartLine />
              <span>Progress</span>
            </NavLink>
          </nav>
        </div>

        <div className="admin-sidebar-section">
          <span className="admin-sidebar-title">SYSTEM</span>

          <nav className="admin-sidebar-nav">
            <NavLink
              to="/admin/notifications"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaBell />
              <span>Notifications</span>
            </NavLink>

            <NavLink
              to="/admin/support"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaLifeRing />
              <span>Support</span>
            </NavLink>

            <NavLink
              to="/admin/reports"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaFileAlt />
              <span>Reports</span>
            </NavLink>

            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaCog />
              <span>Settings</span>
            </NavLink>

            <NavLink
              to="/admin/content"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaGlobe />
              <span>Website Content</span>
            </NavLink>

            <NavLink
              to="/admin/contact-messages"
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaEnvelope />
              <span>Contact Messages</span>
            </NavLink>
          </nav>
        </div>
      </div>

      <div className="admin-sidebar-bottom">
        <div className="admin-profile">
          <div className="admin-avatar">A</div>

          <div className="admin-profile-info">
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>
        </div>

        <button type="button" className="admin-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
