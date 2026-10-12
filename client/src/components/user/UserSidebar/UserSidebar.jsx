import { NavLink, Link, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import {
  FaDumbbell,
  FaThLarge,
  FaRunning,
  FaUtensils,
  FaBullseye,
  FaUser,
  FaCog,
  FaBell,
  FaQuestionCircle,
  FaSignOutAlt,
  FaChartLine,
} from "react-icons/fa";

import { getCurrentUser, logoutUser } from "../../../services/api";

import "./UserSidebar.css";

function UserSidebar() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "User",
    photo: "",
    role: "FitTrack Member",
  });

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const token = sessionStorage.getItem("fittrackToken");

        if (!token) {
          navigate("/login", {
            replace: true,
          });
          return;
        }

        const response = await getCurrentUser(token);

        console.log("SIDEBAR CURRENT USER:", response);

        if (response?.success && response?.user) {
          const currentUser = response.user;

          const userData = {
            name: currentUser.name || "User",

            photo: currentUser.profilePhoto || "",

            role:
              currentUser.role === "admin"
                ? "Administrator"
                : "FitTrack Member",
          };

          setUser(userData);

          sessionStorage.setItem("fittrackUser", JSON.stringify(currentUser));
        }
      } catch (error) {
        console.error("Sidebar user loading error:", error);

        try {
          const savedUser = JSON.parse(
            sessionStorage.getItem("fittrackUser") || "null",
          );

          if (savedUser) {
            setUser({
              name: savedUser.name || "User",

              photo: savedUser.profilePhoto || "",

              role:
                savedUser.role === "admin"
                  ? "Administrator"
                  : "FitTrack Member",
            });
          }
        } catch (storageError) {
          console.error("Sidebar sessionStorage error:", storageError);
        }
      }
    };

    loadCurrentUser();
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();

    localStorage.removeItem("fittrackProfile");

    navigate("/login", {
      replace: true,
    });
  };

  const getInitial = () => {
    return user.name?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <aside className="user-sidebar">
      <div className="user-sidebar-logo">
        <Link to="/dashboard">
          <span className="user-logo-icon">
            <FaDumbbell />
          </span>

          <span className="user-logo-text">
            Fit<span>Track</span>
          </span>
        </Link>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-title">MAIN MENU</span>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FaThLarge />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/dashboard/workouts"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FaRunning />
            <span>Workouts</span>
          </NavLink>

          <NavLink
            to="/dashboard/nutrition"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FaUtensils />
            <span>Nutrition</span>
          </NavLink>

          <NavLink
            to="/dashboard/progress"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FaChartLine />
            <span>Progress</span>
          </NavLink>

          <NavLink
            to="/dashboard/analytics"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FaChartLine />
            <span>Analytics</span>
          </NavLink>

          <NavLink
            to="/dashboard/goals"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FaBullseye />
            <span>Goals</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-section account-section">
        <span className="sidebar-title">ACCOUNT</span>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FaUser />
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FaCog />
            <span>Settings</span>
          </NavLink>

          <NavLink
            to="/dashboard/notifications"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FaBell />
            <span>Notifications</span>
          </NavLink>

          <NavLink
            to="/dashboard/support"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FaQuestionCircle />
            <span>Support</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user.photo ? (
              <img src={user.photo} alt={user.name} />
            ) : (
              getInitial()
            )}
          </div>

          <div className="sidebar-user-info">
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>
        </div>

        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default UserSidebar;
