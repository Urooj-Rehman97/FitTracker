import { useEffect, useState } from "react";

import {
  FaCog,
  FaBell,
  FaChartLine,
  FaShieldAlt,
  FaSave,
  FaUndo,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./Settings.css";

const defaultSettings = {
  emailNotifications: true,
  workoutReminders: true,
  nutritionReminders: true,
  weeklySummary: true,
  progressUpdates: true,
  darkMode: false,
  profileVisibility: true,
};

function Settings() {
  const [settings, setSettings] = useState(defaultSettings);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ================= APPLY DARK MODE =================

  const applyDarkMode = (enabled) => {
    document.body.classList.toggle(
      "fittrack-dark-mode",
      Boolean(enabled)
    );
  };

  // ================= LOAD SETTINGS =================

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await authRequest("/user-settings");

        console.log("USER SETTINGS RESPONSE:", response);

        if (response.success && response.settings) {
          const loadedSettings = {
            ...defaultSettings,
            ...response.settings,
          };

          setSettings(loadedSettings);

          localStorage.setItem(
            "fittrackSettings",
            JSON.stringify(loadedSettings)
          );

          applyDarkMode(loadedSettings.darkMode);
        } else {
          setSettings(defaultSettings);

          localStorage.setItem(
            "fittrackSettings",
            JSON.stringify(defaultSettings)
          );

          applyDarkMode(false);
        }
      } catch (error) {
        console.error(
          "Load user settings error:",
          error
        );

        try {
          const savedSettings = JSON.parse(
            localStorage.getItem(
              "fittrackSettings"
            ) || "null"
          );

          if (
            savedSettings &&
            typeof savedSettings === "object"
          ) {
            const fallbackSettings = {
              ...defaultSettings,
              ...savedSettings,
            };

            setSettings(fallbackSettings);

            applyDarkMode(
              fallbackSettings.darkMode
            );
          } else {
            setSettings(defaultSettings);
            applyDarkMode(false);
          }
        } catch (storageError) {
          console.error(
            "Settings localStorage fallback error:",
            storageError
          );

          setSettings(defaultSettings);
          applyDarkMode(false);
        }

        setMessage(
          error.message ||
            "Unable to load settings."
        );

        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // ================= KEEP DARK MODE SYNCED =================

  useEffect(() => {
    applyDarkMode(settings.darkMode);
  }, [settings.darkMode]);

  // ================= TOGGLE =================

  const handleToggle = (name) => {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));

    setMessage("");
  };

  // ================= SAVE =================

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const response = await authRequest(
        "/user-settings",
        {
          method: "PUT",
          body: JSON.stringify({
            emailNotifications:
              settings.emailNotifications,

            workoutReminders:
              settings.workoutReminders,

            nutritionReminders:
              settings.nutritionReminders,

            weeklySummary:
              settings.weeklySummary,

            progressUpdates:
              settings.progressUpdates,

            darkMode:
              settings.darkMode,

            profileVisibility:
              settings.profileVisibility,
          }),
        }
      );

      console.log(
        "SAVE USER SETTINGS RESPONSE:",
        response
      );

      if (!response.success) {
        setMessage(
          response.message ||
            "Unable to save settings."
        );

        setMessageType("error");
        return;
      }

      const savedSettings = {
        ...defaultSettings,
        ...response.settings,
      };

      setSettings(savedSettings);

      localStorage.setItem(
        "fittrackSettings",
        JSON.stringify(savedSettings)
      );

      applyDarkMode(savedSettings.darkMode);

      setMessage(
        "Settings saved successfully!"
      );

      setMessageType("success");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error(
        "Save user settings error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to save settings."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  // ================= RESET =================

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to restore all settings to their default values?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await authRequest(
        "/user-settings/reset",
        {
          method: "PUT",
        }
      );

      console.log(
        "RESET USER SETTINGS RESPONSE:",
        response
      );

      if (!response.success) {
        setMessage(
          response.message ||
            "Unable to reset settings."
        );

        setMessageType("error");
        return;
      }

      const resetSettings = {
        ...defaultSettings,
        ...response.settings,
      };

      setSettings(resetSettings);

      localStorage.setItem(
        "fittrackSettings",
        JSON.stringify(resetSettings)
      );

      applyDarkMode(false);

      setMessage(
        "Settings restored to default."
      );

      setMessageType("success");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error(
        "Reset user settings error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to reset settings."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">

      {/* ================= HEADER ================= */}

      <div className="settings-page-header">
        <div>
          <span className="settings-eyebrow">
            <FaCog />
            PREFERENCES
          </span>

          <h1>Settings</h1>

          <p>
            Manage your FitTrack preferences and
            account settings.
          </p>
        </div>
      </div>

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="settings-success">
          Loading your settings...
        </div>
      )}

      {/* ================= MESSAGE ================= */}

      {message && (
        <div
          className={
            messageType === "error"
              ? "settings-error"
              : "settings-success"
          }
        >
          {message}
        </div>
      )}

      {/* ================= GENERAL SETTINGS ================= */}

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-section-icon">
            <FaCog />
          </div>

          <div>
            <h3>General Settings</h3>

            <p>
              Customize your basic application
              preferences.
            </p>
          </div>
        </div>

        {/* Dark Mode */}

        <div className="settings-option">
          <div className="settings-option-info">
            <strong>Dark Mode</strong>

            <span>
              Use a darker appearance throughout
              FitTrack.
            </span>
          </div>

          <button
            type="button"
            aria-label="Toggle dark mode"
            aria-pressed={settings.darkMode}
            className={`settings-switch ${
              settings.darkMode ? "active" : ""
            }`}
            onClick={() =>
              handleToggle("darkMode")
            }
            disabled={loading || saving}
          >
            <span></span>
          </button>
        </div>

        {/* Profile Visibility */}

        <div className="settings-option">
          <div className="settings-option-info">
            <strong>Profile Visibility</strong>

            <span>
              Allow your fitness profile to be
              visible.
            </span>
          </div>

          <button
            type="button"
            aria-label="Toggle profile visibility"
            aria-pressed={
              settings.profileVisibility
            }
            className={`settings-switch ${
              settings.profileVisibility
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleToggle(
                "profileVisibility"
              )
            }
            disabled={loading || saving}
          >
            <span></span>
          </button>
        </div>
      </div>

      {/* ================= NOTIFICATIONS ================= */}

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-section-icon">
            <FaBell />
          </div>

          <div>
            <h3>Notifications</h3>

            <p>
              Choose which notifications you want
              to receive.
            </p>
          </div>
        </div>

        {/* Email Notifications */}

        <div className="settings-option">
          <div className="settings-option-info">
            <strong>
              Email Notifications
            </strong>

            <span>
              Receive important FitTrack updates
              by email.
            </span>
          </div>

          <button
            type="button"
            aria-label="Toggle email notifications"
            aria-pressed={
              settings.emailNotifications
            }
            className={`settings-switch ${
              settings.emailNotifications
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleToggle(
                "emailNotifications"
              )
            }
            disabled={loading || saving}
          >
            <span></span>
          </button>
        </div>

        {/* Workout Reminders */}

        <div className="settings-option">
          <div className="settings-option-info">
            <strong>
              Workout Reminders
            </strong>

            <span>
              Get reminders about your scheduled
              workouts.
            </span>
          </div>

          <button
            type="button"
            aria-label="Toggle workout reminders"
            aria-pressed={
              settings.workoutReminders
            }
            className={`settings-switch ${
              settings.workoutReminders
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleToggle(
                "workoutReminders"
              )
            }
            disabled={loading || saving}
          >
            <span></span>
          </button>
        </div>

        {/* Nutrition Reminders */}

        <div className="settings-option">
          <div className="settings-option-info">
            <strong>
              Nutrition Reminders
            </strong>

            <span>
              Get reminders to maintain your
              daily nutrition log.
            </span>
          </div>

          <button
            type="button"
            aria-label="Toggle nutrition reminders"
            aria-pressed={
              settings.nutritionReminders
            }
            className={`settings-switch ${
              settings.nutritionReminders
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleToggle(
                "nutritionReminders"
              )
            }
            disabled={loading || saving}
          >
            <span></span>
          </button>
        </div>

        {/* Weekly Summary */}

        <div className="settings-option">
          <div className="settings-option-info">
            <strong>
              Weekly Summary
            </strong>

            <span>
              Receive a weekly summary of your
              fitness activity.
            </span>
          </div>

          <button
            type="button"
            aria-label="Toggle weekly summary"
            aria-pressed={
              settings.weeklySummary
            }
            className={`settings-switch ${
              settings.weeklySummary
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleToggle(
                "weeklySummary"
              )
            }
            disabled={loading || saving}
          >
            <span></span>
          </button>
        </div>
      </div>

      {/* ================= PROGRESS ================= */}

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-section-icon">
            <FaChartLine />
          </div>

          <div>
            <h3>Progress Updates</h3>

            <p>
              Control how FitTrack keeps you
              informed about your progress.
            </p>
          </div>
        </div>

        <div className="settings-option">
          <div className="settings-option-info">
            <strong>
              Progress Notifications
            </strong>

            <span>
              Receive updates when you reach
              fitness milestones.
            </span>
          </div>

          <button
            type="button"
            aria-label="Toggle progress notifications"
            aria-pressed={
              settings.progressUpdates
            }
            className={`settings-switch ${
              settings.progressUpdates
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleToggle(
                "progressUpdates"
              )
            }
            disabled={loading || saving}
          >
            <span></span>
          </button>
        </div>
      </div>

      {/* ================= PRIVACY ================= */}

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-section-icon">
            <FaShieldAlt />
          </div>

          <div>
            <h3>Privacy & Security</h3>

            <p>
              Your personal fitness information
              is protected.
            </p>
          </div>
        </div>

        <div className="privacy-info">
          <FaShieldAlt />

          <div>
            <strong>
              Your data is private
            </strong>

            <p>
              FitTrack keeps your profile and
              fitness information associated
              with your account.
            </p>
          </div>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}

      <div className="settings-actions">
        <button
          type="button"
          className="settings-reset-button"
          onClick={handleReset}
          disabled={loading || saving}
        >
          <FaUndo />
          Reset
        </button>

        <button
          type="button"
          className="settings-save-button"
          onClick={handleSave}
          disabled={loading || saving}
        >
          <FaSave />

          {saving
            ? "Saving..."
            : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

export default Settings;