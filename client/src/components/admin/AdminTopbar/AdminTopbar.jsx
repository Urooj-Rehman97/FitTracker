import { FaSearch, FaBell, FaChevronDown, FaMoon, FaSun, } from "react-icons/fa";

import "./AdminTopbar.css";

function AdminTopbar({
  darkMode = false,
  onDarkModeChange,
}) {
  const handleThemeToggle = () => {
    if (onDarkModeChange) {
      onDarkModeChange(!darkMode);
    }
  };

  return (
    <header className="admin-topbar">

      <div className="admin-topbar-left">

        <div className="admin-page-heading">
          <span>Admin Panel</span>
          <h1>Dashboard</h1>
        </div>

      </div>

      <div className="admin-topbar-right">

        <div className="admin-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search..."
          />

        </div>

        <button
          type="button"
          className="admin-theme-btn"
          onClick={handleThemeToggle}
          title={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          aria-label={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        <button
          type="button"
          className="admin-notification-btn"
        >
          <FaBell />

          <span className="notification-dot">
            3
          </span>
        </button>

        {/* Profile */}
        <div className="admin-topbar-profile">

          <div className="admin-topbar-avatar">
            A
          </div>

          <div className="admin-topbar-user">
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>

          <FaChevronDown className="admin-profile-arrow" />

        </div>

      </div>

    </header>
  );
}

export default AdminTopbar;