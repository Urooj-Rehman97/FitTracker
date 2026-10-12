import { useEffect, useMemo, useState } from "react";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaUserPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newThisMonth: 0,
    previousMonthUsers: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  const [showUserModal, setShowUserModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    profilePhoto: "",
    isActive: true,
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (statusFilter !== "All") {
        params.append("status", statusFilter.toLowerCase());
      }

      const endpoint = params.toString()
        ? `/admin/users?${params.toString()}`
        : "/admin/users";

      const response = await authRequest(endpoint);

      if (response.success) {
        setUsers(response.users || []);
      } else {
        setError(response.message || "Unable to load users.");
      }
    } catch (err) {
      console.error("Load admin users error:", err);
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authRequest("/admin/users/stats");

      if (response.success && response.stats) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error("Load user stats error:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  useEffect(() => {
    loadStats();
  }, []);

  const totalPages = Math.max(1, Math.ceil(users.length / usersPerPage));

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;

    return users.slice(startIndex, startIndex + usersPerPage);
  }, [users, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const newThisMonth = stats.newThisMonth || 0;
  const previousMonthUsers = stats.previousMonthUsers || 0;

  const monthlyChange = useMemo(() => {
    if (previousMonthUsers === 0) {
      return newThisMonth > 0 ? 100 : 0;
    }

    return Math.round(
      ((newThisMonth - previousMonthUsers) / previousMonthUsers) * 100,
    );
  }, [newThisMonth, previousMonthUsers]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      gender: "",
      profilePhoto: "",
      isActive: true,
    });

    setEditingUser(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowUserModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      gender: user.gender || "",
      profilePhoto: user.profilePhoto || "",
      isActive: user.isActive !== false,
    });

    setShowUserModal(true);
  };

  const closeUserModal = () => {
    if (actionLoading) return;

    setShowUserModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);
      setError("");

      if (!formData.name.trim()) {
        setError("Name is required.");
        setActionLoading(false);
        return;
      }

      if (!formData.email.trim()) {
        setError("Email is required.");
        setActionLoading(false);
        return;
      }

      if (!editingUser && !formData.password.trim()) {
        setError("Password is required for a new user.");
        setActionLoading(false);
        return;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        profilePhoto: formData.profilePhoto.trim(),
        isActive: formData.isActive,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const endpoint = editingUser
        ? `/admin/users/${editingUser._id}`
        : "/admin/users";

      const method = editingUser ? "PUT" : "POST";

      const response = await authRequest(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (!response.success) {
        throw new Error(
          response.message ||
            `Unable to ${editingUser ? "update" : "create"} user.`,
        );
      }

      setShowUserModal(false);
      resetForm();

      await Promise.all([loadUsers(), loadStats()]);
    } catch (err) {
      console.error("Save admin user error:", err);
      setError(err.message || "Unable to save user.");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await authRequest(`/admin/users/${user._id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      });

      if (response.success) {
        setUsers((currentUsers) =>
          currentUsers.map((currentUser) =>
            currentUser._id === user._id
              ? {
                  ...currentUser,
                  isActive: response.user?.isActive ?? !user.isActive,
                }
              : currentUser,
          ),
        );

        await loadStats();
      } else {
        setError(response.message || "Unable to update user status.");
      }
    } catch (err) {
      console.error("Update user status error:", err);
      setError(err.message || "Unable to update user status.");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        user.name || "this user"
      }? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await authRequest(`/admin/users/${user._id}`, {
        method: "DELETE",
      });

      if (response.success) {
        setUsers((currentUsers) =>
          currentUsers.filter((currentUser) => currentUser._id !== user._id),
        );

        await loadStats();
      } else {
        setError(response.message || "Unable to delete user.");
      }
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err.message || "Unable to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  const viewUser = async (user) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await authRequest(`/admin/users/${user._id}`);

      if (response.success && response.user) {
        setSelectedUser(response.user);
        setShowViewModal(true);
      } else {
        setError(response.message || "Unable to view user.");
      }
    } catch (err) {
      console.error("View user error:", err);
      setError(err.message || "Unable to view user.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatJoinedDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const getFitnessLevel = (user) => {
    return user.fitnessLevel || user.level || "—";
  };

  return (
    <div className="admin-users-page">
      <div className="users-page-header">
        <div>
          <span className="page-breadcrumb">Admin / Management</span>

          <h1>User Management</h1>

          <p>Manage registered users, account status and fitness activity.</p>
        </div>

        <button
          className="add-user-btn"
          type="button"
          onClick={openAddModal}
          disabled={actionLoading}
        >
          <FaUserPlus />
          Add User
        </button>
      </div>

      {error && (
        <div className="admin-users-error">
          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            <FaTimes />
          </button>
        </div>
      )}

      <div className="users-stat-grid">
        <div className="user-stat-card">
          <div className="user-stat-icon">
            <FaUsers />
          </div>

          <div>
            <span>Total Users</span>
            <h3>{stats.totalUsers}</h3>
            <small>Registered accounts</small>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon active-icon">
            <FaUserCheck />
          </div>

          <div>
            <span>Active Users</span>
            <h3>{stats.activeUsers}</h3>
            <small>Currently active</small>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon inactive-icon">
            <FaUserTimes />
          </div>

          <div>
            <span>Inactive Users</span>
            <h3>{stats.inactiveUsers}</h3>
            <small>Inactive accounts</small>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon new-icon">
            <FaUserPlus />
          </div>

          <div>
            <span>New This Month</span>
            <h3>{newThisMonth}</h3>

            <small>
              <strong>
                {monthlyChange >= 0 ? "+" : ""}
                {monthlyChange}%
              </strong>{" "}
              from last month
            </small>
          </div>
        </div>
      </div>

      <div className="users-table-card">
        <div className="users-toolbar">
          <div>
            <h2>All Users</h2>

            <p>
              {loading ? "Loading users..." : `${users.length} users found`}
            </p>
          </div>

          <div className="users-filters">
            <div className="users-search">
              <FaSearch />

              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="All">All Status</option>

              <option value="Active">Active</option>

              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Joined</th>
                <th>Fitness Level</th>
                <th>Workouts</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="no-users">
                    Loading users...
                  </td>
                </tr>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => {
                  const status = user.isActive ? "Active" : "Inactive";

                  const fitnessLevel = getFitnessLevel(user);

                  return (
                    <tr key={user._id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.profilePhoto ? (
                              <img src={user.profilePhoto} alt={user.name} />
                            ) : (
                              getInitials(user.name)
                            )}
                          </div>

                          <div>
                            <strong>{user.name || "Unnamed User"}</strong>

                            <span>{user.email || "No email"}</span>
                          </div>
                        </div>
                      </td>

                      <td>{formatJoinedDate(user.createdAt)}</td>

                      <td>
                        <span
                          className={`fitness-level ${
                            fitnessLevel !== "—"
                              ? fitnessLevel.toLowerCase().replace(/\s+/g, "-")
                              : ""
                          }`}
                        >
                          {fitnessLevel}
                        </span>
                      </td>

                      <td>
                        <strong className="workout-count">
                          {user.workouts ?? user.workoutCount ?? "—"}
                        </strong>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`status-badge ${
                            status === "Active"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                          onClick={() => toggleStatus(user)}
                          disabled={actionLoading}
                        >
                          <span></span>
                          {status}
                        </button>
                      </td>

                      <td>
                        <div className="user-actions">
                          <button
                            type="button"
                            className="action-btn view-btn"
                            title="View User"
                            onClick={() => viewUser(user)}
                            disabled={actionLoading}
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="action-btn edit-btn"
                            title="Edit User"
                            onClick={() => openEditModal(user)}
                            disabled={actionLoading}
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            className="action-btn delete-btn"
                            title="Delete User"
                            onClick={() => deleteUser(user)}
                            disabled={actionLoading}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="no-users">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="users-pagination">
          <span>
            Showing{" "}
            <strong>
              {users.length === 0 ? 0 : (currentPage - 1) * usersPerPage + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(currentPage * usersPerPage, users.length)}
            </strong>{" "}
            of <strong>{users.length}</strong> users
          </span>

          <div className="pagination-buttons">
            <button
              type="button"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <FaChevronLeft />
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  className={currentPage === page ? "pagination-active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={currentPage === totalPages || loading}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
            >
              Next
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {showUserModal && (
        <div className="admin-user-modal-overlay" onClick={closeUserModal}>
          <div
            className="admin-user-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-user-modal-header">
              <div>
                <h2>{editingUser ? "Edit User" : "Add New User"}</h2>

                <p>
                  {editingUser
                    ? "Update user account information."
                    : "Create a new FitTrack user account."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeUserModal}
                disabled={actionLoading}
              >
                <FaTimes />
              </button>
            </div>

            <form className="admin-user-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password {!editingUser && "*"}</label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    required={!editingUser}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="03XX XXXXXXX"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Profile Photo URL</label>

                  <input
                    type="text"
                    name="profilePhoto"
                    value={formData.profilePhoto}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <label className="admin-user-active-check">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />

                <span>Account is active</span>
              </label>

              <div className="admin-user-modal-actions">
                <button
                  type="button"
                  className="cancel-user-btn"
                  onClick={closeUserModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-user-btn"
                  disabled={actionLoading}
                >
                  <FaSave />

                  {actionLoading
                    ? "Saving..."
                    : editingUser
                      ? "Update User"
                      : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedUser && (
        <div
          className="admin-user-modal-overlay"
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="admin-user-view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-user-modal-header">
              <div>
                <h2>User Details</h2>
                <p>Complete account information</p>
              </div>

              <button type="button" onClick={() => setShowViewModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="admin-user-view-content">
              <div className="admin-user-large-avatar">
                {selectedUser.profilePhoto ? (
                  <img
                    src={selectedUser.profilePhoto}
                    alt={selectedUser.name}
                  />
                ) : (
                  getInitials(selectedUser.name)
                )}
              </div>

              <h3>{selectedUser.name || "Unnamed User"}</h3>

              <span className="admin-user-view-email">
                {selectedUser.email}
              </span>

              <div className="admin-user-detail-grid">
                <div>
                  <span>Phone</span>
                  <strong>{selectedUser.phone || "Not provided"}</strong>
                </div>

                <div>
                  <span>Gender</span>
                  <strong>{selectedUser.gender || "Not provided"}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </strong>
                </div>

                <div>
                  <span>Joined</span>
                  <strong>{formatJoinedDate(selectedUser.createdAt)}</strong>
                </div>

                <div>
                  <span>Fitness Level</span>
                  <strong>{getFitnessLevel(selectedUser)}</strong>
                </div>

                <div>
                  <span>Role</span>
                  <strong>{selectedUser.role || "user"}</strong>
                </div>
              </div>
            </div>

            <div className="admin-user-modal-actions">
              <button
                type="button"
                className="cancel-user-btn"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>

              <button
                type="button"
                className="save-user-btn"
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedUser);
                }}
              >
                <FaEdit />
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
