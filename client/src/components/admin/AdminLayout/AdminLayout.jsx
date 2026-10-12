import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../AdminSidebar/AdminSidebar";
import AdminTopbar from "../AdminTopbar/AdminTopbar";

import "./AdminLayout.css";

function AdminLayout() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("fittrackAdminDarkMode") === "true";
  });

  useEffect(() => {
    const applyTheme = (enabled) => {
      setDarkMode(enabled);

      document.body.classList.toggle(
        "fittrack-admin-dark-mode",
        enabled
      );
    };

    
    applyTheme(
      localStorage.getItem("fittrackAdminDarkMode") === "true"
    );

   
    const handleThemeChange = (event) => {
      applyTheme(Boolean(event.detail?.darkMode));
    };

    window.addEventListener(
      "fittrack-admin-theme-change",
      handleThemeChange
    );

    return () => {
      window.removeEventListener(
        "fittrack-admin-theme-change",
        handleThemeChange
      );
    };
  }, []);

  const handleDarkModeChange = (enabled) => {
    localStorage.setItem(
      "fittrackAdminDarkMode",
      String(enabled)
    );

    document.body.classList.toggle(
      "fittrack-admin-dark-mode",
      enabled
    );

    setDarkMode(enabled);

    window.dispatchEvent(
      new CustomEvent("fittrack-admin-theme-change", {
        detail: {
          darkMode: enabled,
        },
      })
    );
  };

  return (
    <div
      className={`admin-layout ${
        darkMode ? "admin-dark-layout" : ""
      }`}
    >
      <AdminSidebar />

      <div className="admin-main">
        <AdminTopbar
          darkMode={darkMode}
          onDarkModeChange={handleDarkModeChange}
        />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;