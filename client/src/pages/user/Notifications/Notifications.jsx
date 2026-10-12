import { useEffect, useState } from "react";
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTrash,
  FaDumbbell,
  FaBullseye,
  FaUtensils,
  FaChartLine,
  FaInfoCircle,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // ==============================
  // Load Notifications
  // ==============================
  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authRequest("/notifications");

      console.log("NOTIFICATIONS DATA RESPONSE:", response);

      if (response.success) {
        setNotifications(
          Array.isArray(response.notifications)
            ? response.notifications
            : []
        );
      } else {
        setError(
          response.message || "Unable to load notifications."
        );
      }
    } catch (error) {
      console.error("Load notifications error:", error);

      setError(
        error.message || "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // ==============================
  // Mark Single Notification Read
  // ==============================
  const markAsRead = async (id) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await authRequest(
        `/notifications/${id}/read`,
        {
          method: "PUT",
        }
      );

      console.log(
        "NOTIFICATION MARK READ RESPONSE:",
        response
      );

      if (response.success) {
        setNotifications((previous) =>
          previous.map((item) =>
            item._id === id
              ? {
                  ...item,
                  isRead: true,
                }
              : item
          )
        );

        window.dispatchEvent(
          new CustomEvent("fittrackNotificationsUpdated")
        );
      } else {
        setError(
          response.message ||
            "Unable to mark notification as read."
        );
      }
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );

      setError(
        error.message ||
          "Unable to mark notification as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================
  // Mark All Read
  // ==============================
  const markAllRead = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response = await authRequest(
        "/notifications/read-all",
        {
          method: "PUT",
        }
      );

      console.log(
        "MARK ALL NOTIFICATIONS READ RESPONSE:",
        response
      );

      if (response.success) {
        setNotifications((previous) =>
          previous.map((item) => ({
            ...item,
            isRead: true,
          }))
        );

        window.dispatchEvent(
          new CustomEvent("fittrackNotificationsUpdated")
        );
      } else {
        setError(
          response.message ||
            "Unable to mark all notifications as read."
        );
      }
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );

      setError(
        error.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================
  // Delete Single Notification
  // ==============================
  const deleteNotification = async (id) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await authRequest(
        `/notifications/${id}`,
        {
          method: "DELETE",
        }
      );

      console.log(
        "NOTIFICATION DELETE RESPONSE:",
        response
      );

      if (response.success) {
        setNotifications((previous) =>
          previous.filter((item) => item._id !== id)
        );

        window.dispatchEvent(
          new CustomEvent("fittrackNotificationsUpdated")
        );
      } else {
        setError(
          response.message ||
            "Unable to delete notification."
        );
      }
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      setError(
        error.message ||
          "Unable to delete notification."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================
  // Clear All Notifications
  // ==============================
  const clearAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all notifications?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await authRequest(
        "/notifications/clear-all",
        {
          method: "DELETE",
        }
      );

      console.log(
        "CLEAR ALL NOTIFICATIONS RESPONSE:",
        response
      );

      if (response.success) {
        setNotifications([]);

        window.dispatchEvent(
          new CustomEvent("fittrackNotificationsUpdated")
        );
      } else {
        setError(
          response.message ||
            "Unable to clear notifications."
        );
      }
    } catch (error) {
      console.error(
        "Clear all notifications error:",
        error
      );

      setError(
        error.message ||
          "Unable to clear notifications."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================
  // Helpers
  // ==============================
  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const readCount = notifications.filter(
    (item) => item.isRead
  ).length;

  const filteredNotifications =
    filter === "Unread"
      ? notifications.filter((item) => !item.isRead)
      : notifications;

  const getIcon = (type) => {
    if (type === "workout") return <FaDumbbell />;
    if (type === "goal") return <FaBullseye />;
    if (type === "nutrition") return <FaUtensils />;
    if (type === "progress") return <FaChartLine />;

    return <FaInfoCircle />;
  };

  const formatNotificationTime = (date) => {
    if (!date) {
      return "Recently";
    }

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "Recently";
    }

    return notificationDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // ==============================
  // Render
  // ==============================
  return (
    <div className="notifications-page">

      {/* Header */}
      <div className="notifications-header">
        <div>
          <span className="notifications-eyebrow">
            ACCOUNT UPDATES
          </span>

          <h1>Notifications</h1>

          <p>
            Stay updated with your workouts, goals and fitness activity.
          </p>
        </div>

        <div className="notifications-header-actions">

          {unreadCount > 0 && (
            <button
              type="button"
              className="mark-all-button"
              onClick={markAllRead}
              disabled={actionLoading}
            >
              <FaCheckDouble />
              {actionLoading
                ? "Updating..."
                : "Mark All Read"}
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              className="clear-all-button"
              onClick={clearAll}
              disabled={actionLoading}
            >
              <FaTrash />
              {actionLoading
                ? "Clearing..."
                : "Clear All"}
            </button>
          )}

        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#fff1f2",
            color: "#be123c",
            border: "1px solid #fecdd3",
          }}
        >
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="notification-stats">

        <div className="notification-stat">
          <div className="notification-stat-icon">
            <FaBell />
          </div>

          <div>
            <span>Total Notifications</span>
            <strong>{notifications.length}</strong>
          </div>
        </div>

        <div className="notification-stat">
          <div className="notification-stat-icon">
            <FaCheck />
          </div>

          <div>
            <span>Read</span>
            <strong>{readCount}</strong>
          </div>
        </div>

        <div className="notification-stat">
          <div className="notification-stat-icon">
            <FaBell />
          </div>

          <div>
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="notifications-filter-bar">

        <button
          type="button"
          className={filter === "All" ? "active" : ""}
          onClick={() => setFilter("All")}
        >
          All
        </button>

        <button
          type="button"
          className={filter === "Unread" ? "active" : ""}
          onClick={() => setFilter("Unread")}
        >
          Unread

          {unreadCount > 0 && (
            <span>{unreadCount}</span>
          )}
        </button>

      </div>

      {/* Notification List */}
      <div className="notifications-list">

        {loading ? (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">
              <FaBell />
            </div>

            <h3>Loading notifications...</h3>

            <p>
              Please wait while we load your notifications.
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">
              <FaBell />
            </div>

            <h3>No notifications</h3>

            <p>
              You're all caught up. New notifications will appear here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item._id}
              className={`notification-item ${
                item.isRead ? "read" : "unread"
              }`}
            >

              <div
                className={`notification-icon ${item.type}`}
              >
                {getIcon(item.type)}
              </div>

              <div className="notification-content">

                <div className="notification-title-row">
                  <h3>{item.title}</h3>

                  {!item.isRead && (
                    <span className="unread-dot"></span>
                  )}
                </div>

                <p>{item.message}</p>

                <small>
                  {formatNotificationTime(item.createdAt)}
                </small>

              </div>

              <div className="notification-actions">

                {!item.isRead && (
                  <button
                    type="button"
                    onClick={() =>
                      markAsRead(item._id)
                    }
                    title="Mark as read"
                    disabled={actionLoading}
                  >
                    <FaCheck />
                  </button>
                )}

                <button
                  type="button"
                  className="notification-delete"
                  onClick={() =>
                    deleteNotification(item._id)
                  }
                  title="Delete"
                  disabled={actionLoading}
                >
                  <FaTrash />
                </button>

              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default Notifications;