import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import UserSidebar from "../../user/UserSidebar/UserSidebar";
import UserTopbar from "../../user/UserTopbar/UserTopbar";

import { authRequest } from "../../../services/api";

import "./UserLayout.css";

function UserLayout() {
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const response = await authRequest("/user-settings");

        console.log("GLOBAL USER SETTINGS RESPONSE:", response);

        if (response.success && response.settings) {
          const darkMode = Boolean(response.settings.darkMode);

          document.body.classList.toggle("fittrack-dark-mode", darkMode);

          localStorage.setItem(
            "fittrackSettings",
            JSON.stringify(response.settings),
          );
        }
      } catch (error) {
        console.error("Load global user settings error:", error);

        try {
          const savedSettings = JSON.parse(
            localStorage.getItem("fittrackSettings") || "null",
          );

          if (savedSettings && typeof savedSettings === "object") {
            document.body.classList.toggle(
              "fittrack-dark-mode",
              Boolean(savedSettings.darkMode),
            );
          }
        } catch (storageError) {
          console.error("Load saved settings error:", storageError);
        }
      }
    };

    loadUserSettings();
  }, []);

  return (
    <div className="user-layout">
      <UserSidebar />

      <div className="user-main">
        <UserTopbar />

        <main className="user-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;
