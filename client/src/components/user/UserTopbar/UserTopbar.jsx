import { useNavigate } from "react-router-dom";

import { FaBell, FaSearch, FaChevronDown } from "react-icons/fa";

import "./UserTopbar.css";

function UserTopbar() {
  const navigate = useNavigate();

  const getUserData = () => {
    try {
      const savedUser = JSON.parse(
        sessionStorage.getItem("fittrackUser") || "null",
      );

      if (!savedUser) {
        return {
          name: "User",
          photo: "",
          role: "Fitness Enthusiast",
        };
      }

      const userId = savedUser.id || savedUser._id || savedUser.email;

      const profileKey = userId ? `fittrackProfile_${userId}` : null;

      const savedProfile = profileKey
        ? JSON.parse(localStorage.getItem(profileKey) || "null")
        : null;

      return {
        name: savedProfile?.name || savedUser?.name || "User",

        photo:
          savedProfile?.profilePhoto ||
          savedProfile?.photo ||
          savedUser?.profilePhoto ||
          "",

        role:
          savedUser?.role === "admin" ? "Administrator" : "Fitness Enthusiast",
      };
    } catch (error) {
      console.error("Load user topbar data error:", error);

      return {
        name: "User",
        photo: "",
        role: "Fitness Enthusiast",
      };
    }
  };

  const user = getUserData();

  const getInitial = () => {
    return user.name?.charAt(0)?.toUpperCase() || "U";
  };

  const handleNotifications = () => {
    navigate("/dashboard/notifications");
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();

    if (value.includes("workout")) {
      navigate("/dashboard/workouts");
    }

    if (value.includes("nutrition") || value.includes("meal")) {
      navigate("/dashboard/nutrition");
    }

    if (value.includes("progress")) {
      navigate("/dashboard/progress");
    }

    if (value.includes("goal")) {
      navigate("/dashboard/goals");
    }
  };

  return (
    <header className="user-topbar">
      <div className="topbar-search">
        <FaSearch />

        <input
          type="text"
          placeholder="Search workouts, meals..."
          onChange={handleSearch}
        />
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="notification-btn"
          onClick={handleNotifications}
          aria-label="Notifications"
        >
          <FaBell />

          <span className="notification-dot"></span>
        </button>

        <div
          className="topbar-profile"
          onClick={() => navigate("/dashboard/profile")}
          style={{ cursor: "pointer" }}
        >
          <div className="topbar-avatar">
            {user.photo ? (
              <img src={user.photo} alt={user.name} />
            ) : (
              getInitial()
            )}
          </div>

          <div className="topbar-user">
            <strong>{user.name}</strong>

            <span>{user.role}</span>
          </div>

          <FaChevronDown className="profile-arrow" />
        </div>
      </div>
    </header>
  );
}

export default UserTopbar;
