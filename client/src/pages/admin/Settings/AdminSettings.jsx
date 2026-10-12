import { useEffect, useState } from "react";
import {
  FaCog,
  FaGlobe,
  FaShieldAlt,
  FaBell,
  FaDatabase,
  FaSave,
  FaUndo,
  FaLock,
  FaEnvelope,
  FaUserPlus,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./AdminSettings.css";

const DEFAULT_SETTINGS = {
  siteName: "FitTrack",
  supportEmail: "support@fittrack.com",
  timezone: "UTC",
  dateFormat: "DD/MM/YYYY",

  adminEmail: "admin@fittrack.com",
  twoFactor: true,
  sessionTimeout: "30",

  emailNotifications: true,
  newUserAlerts: true,
  workoutReports: true,
  systemAlerts: true,

  maintenanceMode: false,
  allowRegistration: true,
  automaticBackup: true,
};

const API_URL = "/api/admin/settings";

function AdminSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load settings");
        }

        setSettings({
          ...DEFAULT_SETTINGS,
          ...data.settings,
        });
      } catch (error) {
        setError(error.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save settings");
      }

      setSettings({
        ...DEFAULT_SETTINGS,
        ...data.settings,
      });

      setSuccess("Settings saved successfully!");
    } catch (error) {
      setError(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/reset`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to reset settings");
      }

      setSettings({
        ...DEFAULT_SETTINGS,
        ...data.settings,
      });

      setSuccess("Settings reset successfully!");
    } catch (error) {
      setError(error.message || "Failed to reset settings");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-settings-page">
        <div className="admin-settings-loading">
          <div className="admin-settings-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            <FaCog />
            SYSTEM
          </span>

          <h1>Settings</h1>

          <p>
            Manage your FitTrack platform configuration, security and
            notification preferences.
          </p>
        </div>

        <div className="admin-settings-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={handleReset}
            disabled={resetting || saving}
          >
            <FaUndo />
            {resetting ? "Resetting..." : "Reset"}
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={saving || resetting}
          >
            <FaSave />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {success && (
        <div className="admin-settings-message admin-settings-success">
          {success}
        </div>
      )}

      {error && (
        <div className="admin-settings-message admin-settings-error">
          {error}
        </div>
      )}

      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-section-icon">
            <FaGlobe />
          </div>

          <div>
            <h2>General Settings</h2>
            <p>Configure basic information and regional preferences.</p>
          </div>
        </div>

        <div className="settings-form-grid">
          <div className="settings-field">
            <label htmlFor="siteName">Site Name</label>
            <input
              id="siteName"
              name="siteName"
              type="text"
              value={settings.siteName}
              onChange={handleChange}
            />
          </div>

          <div className="settings-field">
            <label htmlFor="supportEmail">Support Email</label>

            <div className="settings-input-icon">
              <FaEnvelope />

              <input
                id="supportEmail"
                name="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="settings-field">
            <label htmlFor="timezone">Timezone</label>

            <select
              id="timezone"
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
            >
              <option value="UTC">UTC</option>
              <option value="GMT+1">GMT+1</option>
              <option value="GMT+5:30">GMT+5:30</option>
              <option value="GMT+8">GMT+8</option>
              <option value="GMT-5">GMT-5</option>
              <option value="GMT-8">GMT-8</option>
            </select>
          </div>

          <div className="settings-field">
            <label htmlFor="dateFormat">Date Format</label>

            <select
              id="dateFormat"
              name="dateFormat"
              value={settings.dateFormat}
              onChange={handleChange}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-section-icon">
            <FaShieldAlt />
          </div>

          <div>
            <h2>Security & Account</h2>
            <p>Manage administrator access and account security.</p>
          </div>
        </div>

        <div className="settings-form-grid">
          <div className="settings-field">
            <label htmlFor="adminEmail">Administrator Email</label>

            <div className="settings-input-icon">
              <FaEnvelope />

              <input
                id="adminEmail"
                name="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="settings-field">
            <label htmlFor="sessionTimeout">Session Timeout</label>

            <select
              id="sessionTimeout"
              name="sessionTimeout"
              value={settings.sessionTimeout}
              onChange={handleChange}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>

        <div className="security-password-row">
          <div>
            <div className="security-password-title">
              <FaLock />
              <strong>Administrator Password</strong>
            </div>

            <p>
              Change the password used to access the administrator panel.
            </p>
          </div>

          <button type="button" className="settings-outline-btn">
            Change Password
          </button>
        </div>

        <div className="settings-toggle-list">
          <div className="settings-toggle-item">
            <div className="toggle-content">
              <strong>Two-Factor Authentication</strong>

              <span>
                Require an additional verification step for administrator
                login.
              </span>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                name="twoFactor"
                checked={settings.twoFactor}
                onChange={handleChange}
              />

              <span className="slider"></span>
            </label>
          </div>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-section-icon">
            <FaBell />
          </div>

          <div>
            <h2>Notification Preferences</h2>

            <p>
              Choose which platform events administrators should receive.
            </p>
          </div>
        </div>

        <div className="settings-toggle-list">
          <div className="settings-toggle-item">
            <div className="toggle-icon">
              <FaEnvelope />
            </div>

            <div className="toggle-content">
              <strong>Email Notifications</strong>

              <span>
                Receive important platform updates by email.
              </span>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />

              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-toggle-item">
            <div className="toggle-icon">
              <FaUserPlus />
            </div>

            <div className="toggle-content">
              <strong>New User Alerts</strong>

              <span>
                Get notified whenever a new user registers.
              </span>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                name="newUserAlerts"
                checked={settings.newUserAlerts}
                onChange={handleChange}
              />

              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-toggle-item">
            <div className="toggle-icon">
              <FaChartLine />
            </div>

            <div className="toggle-content">
              <strong>Workout Reports</strong>

              <span>
                Receive periodic workout and activity reports.
              </span>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                name="workoutReports"
                checked={settings.workoutReports}
                onChange={handleChange}
              />

              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-toggle-item">
            <div className="toggle-icon">
              <FaExclamationTriangle />
            </div>

            <div className="toggle-content">
              <strong>System Alerts</strong>

              <span>
                Receive security, maintenance and system alerts.
              </span>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                name="systemAlerts"
                checked={settings.systemAlerts}
                onChange={handleChange}
              />

              <span className="slider"></span>
            </label>
          </div>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-section-icon">
            <FaDatabase />
          </div>

          <div>
            <h2>System Configuration</h2>

            <p>
              Control registration, backups and platform availability.
            </p>
          </div>
        </div>

        <div className="settings-toggle-list">
          <div className="settings-toggle-item">
            <div className="toggle-content">
              <strong>Maintenance Mode</strong>

              <span>
                Temporarily restrict access while system maintenance is being
                performed.
              </span>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
              />

              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-toggle-item">
            <div className="toggle-content">
              <strong>Allow New Registrations</strong>

              <span>
                Allow visitors to create new FitTrack accounts.
              </span>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                name="allowRegistration"
                checked={settings.allowRegistration}
                onChange={handleChange}
              />

              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-toggle-item">
            <div className="toggle-content">
              <strong>Automatic Backup</strong>

              <span>
                Automatically back up important application data.
              </span>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                name="automaticBackup"
                checked={settings.automaticBackup}
                onChange={handleChange}
              />

              <span className="slider"></span>
            </label>
          </div>
        </div>
      </section>

      <div className="settings-bottom-actions">
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={handleReset}
          disabled={resetting || saving}
        >
          <FaUndo />
          {resetting ? "Resetting..." : "Reset"}
        </button>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={handleSave}
          disabled={saving || resetting}
        >
          <FaSave />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default AdminSettings;