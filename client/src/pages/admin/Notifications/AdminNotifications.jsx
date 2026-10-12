import { useEffect, useMemo, useState } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaUsers,
  FaSearch,
  FaEye,
  FaTrash,
  FaPlus,
  FaCheck,
  FaTimes,
  FaSave,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./AdminNotifications.css";

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    read: 0,
    unread: 0,
    typeStats: [],
  });

  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedNotification, setSelectedNotification] = useState(null);

  const [createForm, setCreateForm] = useState({
    audience: "all",
    userId: "",
    title: "",
    message: "",
    type: "system",
    link: "",
  });

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (type !== "All") {
        params.append("type", type);
      }

      if (status !== "All") {
        params.append("status", status === "Read" ? "read" : "unread");
      }

      const query = params.toString();

      const response = await authRequest(
        `/admin/notifications${query ? `?${query}` : ""}`,
      );

      if (response.success) {
        setNotifications(
          Array.isArray(response.notifications) ? response.notifications : [],
        );
      } else {
        setError(response.message || "Failed to load notifications.");
      }
    } catch (error) {
      console.error("Load admin notifications error:", error);

      setError(error.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authRequest("/admin/notifications/stats");

      if (response.success) {
        setStats(
          response.stats || {
            total: 0,
            read: 0,
            unread: 0,
            typeStats: [],
          },
        );
      }
    } catch (error) {
      console.error("Load notification stats error:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await authRequest("/admin/users");

      if (response.success) {
        setUsers(Array.isArray(response.users) ? response.users : []);
      }
    } catch (error) {
      console.error("Load notification users error:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [search, type, status]);

  useEffect(() => {
    loadStats();
    loadUsers();
  }, []);

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (notificationType) => {
    const labels = {
      workout: "Workout",
      goal: "Goal",
      nutrition: "Nutrition",
      progress: "Progress",
      system: "System",
    };

    return labels[notificationType] || notificationType || "System";
  };

  const getTypeIcon = (notificationType) => {
    if (notificationType === "goal") {
      return <FaCheckCircle />;
    }

    if (notificationType === "system") {
      return <FaExclamationTriangle />;
    }

    if (notificationType === "progress") {
      return <FaInfoCircle />;
    }

    return <FaBell />;
  };

  const getAudienceName = (notification) => {
    return (
      notification?.user?.name || notification?.user?.email || "Unknown User"
    );
  };

  const getAudienceLabel = (notification) => {
    return getAudienceName(notification);
  };

  const resetCreateForm = () => {
    setCreateForm({
      audience: "all",
      userId: "",
      title: "",
      message: "",
      type: "system",
      link: "",
    });
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;

    setCreateForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setError("");
    resetCreateForm();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (actionLoading) {
      return;
    }

    setShowCreateModal(false);
    resetCreateForm();
  };
  const handleCreateNotification = async (e) => {
    e.preventDefault();

    if (!createForm.title.trim()) {
      window.alert("Notification title is required.");
      return;
    }

    if (!createForm.message.trim()) {
      window.alert("Notification message is required.");
      return;
    }

    if (createForm.audience === "user" && !createForm.userId) {
      window.alert("Please select a user.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      let response;

      if (createForm.audience === "all") {
        response = await authRequest("/admin/notifications/broadcast", {
          method: "POST",
          body: JSON.stringify({
            title: createForm.title.trim(),
            message: createForm.message.trim(),
            type: createForm.type,
            link: createForm.link.trim(),
          }),
        });
      } else {
        response = await authRequest("/admin/notifications", {
          method: "POST",
          body: JSON.stringify({
            userId: createForm.userId,
            title: createForm.title.trim(),
            message: createForm.message.trim(),
            type: createForm.type,
            link: createForm.link.trim(),
          }),
        });
      }

      if (!response.success) {
        throw new Error(response.message || "Failed to create notification.");
      }

      window.alert(response.message || "Notification created successfully.");

      setShowCreateModal(false);
      resetCreateForm();

      await Promise.all([loadNotifications(), loadStats()]);
    } catch (error) {
      console.error("Create notification error:", error);

      window.alert(error.message || "Failed to create notification.");
    } finally {
      setActionLoading(false);
    }
  };

  const viewNotification = async (notification) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await authRequest(
        `/admin/notifications/${notification._id}`,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to load notification.");
      }

      setSelectedNotification(response.notification);

      setShowViewModal(true);
    } catch (error) {
      console.error("View notification error:", error);

      window.alert(error.message || "Failed to load notification.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedNotification(null);
  };

  const markAsRead = async (notification) => {
    if (notification.isRead) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await authRequest(
        `/admin/notifications/${notification._id}/read`,
        {
          method: "PUT",
        },
      );

      if (!response.success) {
        throw new Error(
          response.message || "Failed to mark notification as read.",
        );
      }

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                isRead: true,
              }
            : item,
        ),
      );

      if (selectedNotification?._id === notification._id) {
        setSelectedNotification((current) =>
          current
            ? {
                ...current,
                isRead: true,
              }
            : current,
        );
      }

      await loadStats();
    } catch (error) {
      console.error("Mark notification read error:", error);

      window.alert(error.message || "Failed to mark notification as read.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await authRequest(`/admin/notifications/${id}`, {
        method: "DELETE",
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to delete notification.");
      }

      setNotifications((current) => current.filter((item) => item._id !== id));

      if (selectedNotification?._id === id) {
        closeViewModal();
      }

      await loadStats();

      window.alert("Notification deleted successfully.");
    } catch (error) {
      console.error("Delete notification error:", error);

      window.alert(error.message || "Failed to delete notification.");
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setType("All");
    setStatus("All");
  };

  const audienceCount = useMemo(() => {
    return new Set(notifications.map((item) => item.user?._id).filter(Boolean))
      .size;
  }, [notifications]);

  return (
    <div className="admin-notifications">
      <div className="admin-page-header">
        <div>
          <h1>Notifications</h1>

          <p>Create, manage and monitor notifications for FitTrack users.</p>
        </div>

        <button
          type="button"
          className="admin-primary-btn"
          onClick={openCreateModal}
        >
          <FaPlus />
          Create Notification
        </button>
      </div>

      {error && <div className="notification-error">{error}</div>}

      {/* Stats */}

      <div className="admin-notification-stats">
        <div className="notification-stat-card">
          <div className="notification-stat-icon">
            <FaBell />
          </div>

          <div>
            <span>Total Notifications</span>
            <h3>{stats.total || 0}</h3>
          </div>
        </div>

        <div className="notification-stat-card">
          <div className="notification-stat-icon">
            <FaCheckCircle />
          </div>

          <div>
            <span>Read</span>
            <h3>{stats.read || 0}</h3>
          </div>
        </div>

        <div className="notification-stat-card">
          <div className="notification-stat-icon">
            <FaInfoCircle />
          </div>

          <div>
            <span>Unread</span>
            <h3>{stats.unread || 0}</h3>
          </div>
        </div>

        <div className="notification-stat-card">
          <div className="notification-stat-icon">
            <FaUsers />
          </div>

          <div>
            <span>Audiences</span>
            <h3>{audienceCount}</h3>
          </div>
        </div>
      </div>

      <div className="admin-notification-filter-card">
        <div className="notification-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="All">All Types</option>
          <option value="workout">Workout</option>
          <option value="goal">Goal</option>
          <option value="nutrition">Nutrition</option>
          <option value="progress">Progress</option>
          <option value="system">System</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Read">Read</option>
          <option value="Unread">Unread</option>
        </select>

        <button
          type="button"
          className="notification-clear-btn"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      <div className="admin-notification-table-card">
        <div className="table-card-header">
          <div>
            <h2>Notification History</h2>

            <span>{notifications.length} notifications found</span>
          </div>
        </div>

        {loading ? (
          <div className="notification-loading">Loading notifications...</div>
        ) : error ? (
          <div className="notification-error">{error}</div>
        ) : (
          <div className="admin-notification-table-wrapper">
            <table className="admin-notification-table">
              <thead>
                <tr>
                  <th>Notification</th>
                  <th>Type</th>
                  <th>Audience</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="notification-info">
                          <div className="notification-avatar">
                            {getTypeIcon(item.type)}
                          </div>

                          <div>
                            <strong>{item.title}</strong>

                            <small>{item.message}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`notification-type ${item.type}`}>
                          {getTypeLabel(item.type)}
                        </span>
                      </td>

                      <td>
                        <div className="notification-audience">
                          <FaUsers />

                          {getAudienceLabel(item)}
                        </div>
                      </td>

                      <td>
                        <div className="notification-date">
                          <strong>{formatDate(item.createdAt)}</strong>

                          <small>{formatTime(item.createdAt)}</small>
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`notification-status ${
                            item.isRead ? "read" : "unread"
                          }`}
                          onClick={() => markAsRead(item)}
                          disabled={actionLoading || item.isRead}
                        >
                          <FaCheck />

                          {item.isRead ? "Read" : "Unread"}
                        </button>
                      </td>

                      <td>
                        <div className="notification-actions">
                          <button
                            type="button"
                            className="notification-action view"
                            title="View notification"
                            disabled={actionLoading}
                            onClick={() => viewNotification(item)}
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="notification-action delete"
                            title="Delete notification"
                            disabled={actionLoading}
                            onClick={() => handleDelete(item._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-notifications">
                      No notifications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="notification-modal-overlay">
          <div className="notification-modal">
            <div className="notification-modal-header">
              <div>
                <span className="notification-modal-eyebrow">
                  Notification Management
                </span>

                <h2>Create Notification</h2>
              </div>

              <button
                type="button"
                className="notification-modal-close"
                onClick={closeCreateModal}
                disabled={actionLoading}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateNotification}>
              <div className="notification-form-grid">
                <div className="notification-form-group full-width">
                  <label>Audience</label>

                  <div className="notification-audience-options">
                    <label className="notification-radio">
                      <input
                        type="radio"
                        name="audience"
                        value="all"
                        checked={createForm.audience === "all"}
                        onChange={handleCreateChange}
                      />

                      <span>All Active Users</span>
                    </label>

                    <label className="notification-radio">
                      <input
                        type="radio"
                        name="audience"
                        value="user"
                        checked={createForm.audience === "user"}
                        onChange={handleCreateChange}
                      />

                      <span>Specific User</span>
                    </label>
                  </div>
                </div>

                {createForm.audience === "user" && (
                  <div className="notification-form-group full-width">
                    <label>Select User</label>

                    <select
                      name="userId"
                      value={createForm.userId}
                      onChange={handleCreateChange}
                      required
                    >
                      <option value="">Select a user</option>

                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} - {user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="notification-form-group">
                  <label>Notification Type</label>

                  <select
                    name="type"
                    value={createForm.type}
                    onChange={handleCreateChange}
                  >
                    <option value="system">System</option>

                    <option value="workout">Workout</option>

                    <option value="goal">Goal</option>

                    <option value="nutrition">Nutrition</option>

                    <option value="progress">Progress</option>
                  </select>
                </div>

                <div className="notification-form-group">
                  <label>Link</label>

                  <input
                    type="text"
                    name="link"
                    placeholder="/dashboard"
                    value={createForm.link}
                    onChange={handleCreateChange}
                  />
                </div>

                <div className="notification-form-group full-width">
                  <label>Title</label>

                  <input
                    type="text"
                    name="title"
                    placeholder="Enter notification title"
                    value={createForm.title}
                    onChange={handleCreateChange}
                    maxLength="150"
                    required
                  />
                </div>

                <div className="notification-form-group full-width">
                  <label>Message</label>

                  <textarea
                    name="message"
                    rows="5"
                    placeholder="Enter notification message"
                    value={createForm.message}
                    onChange={handleCreateChange}
                    maxLength="500"
                    required
                  />
                </div>
              </div>

              <div className="notification-modal-footer">
                <button
                  type="button"
                  className="notification-modal-cancel"
                  onClick={closeCreateModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="notification-modal-save"
                  disabled={actionLoading}
                >
                  <FaSave />

                  {actionLoading ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedNotification && (
        <div className="notification-modal-overlay" onClick={closeViewModal}>
          <div
            className="notification-modal view-notification-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notification-modal-header">
              <div>
                <span className="notification-modal-eyebrow">
                  Notification Details
                </span>

                <h2>{selectedNotification.title}</h2>
              </div>

              <button
                type="button"
                className="notification-modal-close"
                onClick={closeViewModal}
              >
                <FaTimes />
              </button>
            </div>

            <div className="notification-view-content">
              <div className="notification-view-icon">
                {getTypeIcon(selectedNotification.type)}
              </div>

              <div className="notification-view-meta">
                <span>
                  Type:{" "}
                  <strong>{getTypeLabel(selectedNotification.type)}</strong>
                </span>

                <span>
                  Status:{" "}
                  <strong>
                    {selectedNotification.isRead ? "Read" : "Unread"}
                  </strong>
                </span>

                <span>
                  User: <strong>{getAudienceName(selectedNotification)}</strong>
                </span>
              </div>

              <div className="notification-view-message">
                <span>Message</span>

                <p>{selectedNotification.message}</p>
              </div>

              {selectedNotification.link && (
                <div className="notification-view-message">
                  <span>Link</span>

                  <p>{selectedNotification.link}</p>
                </div>
              )}

              <div className="notification-view-date">
                Created {formatDate(selectedNotification.createdAt)} at{" "}
                {formatTime(selectedNotification.createdAt)}
              </div>
            </div>

            <div className="notification-modal-footer">
              <button
                type="button"
                className="notification-modal-cancel"
                onClick={closeViewModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotifications;
