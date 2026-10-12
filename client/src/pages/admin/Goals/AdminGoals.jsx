import { useEffect, useMemo, useState } from "react";
import {
  FaBullseye,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaSearch,
  FaTrash,
  FaUsers,
  FaEye,
  FaTimes,
  FaSave,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./AdminGoals.css";

const initialForm = {
  title: "",
  category: "Weight",
  startValue: "",
  current: "",
  target: "",
  unit: "kg",
  deadline: "",
  description: "",
};

const categories = [
  "Weight",
  "Strength",
  "Cardio",
  "Nutrition",
  "Body Measurement",
  "Other",
];

const units = ["kg", "lbs", "cm", "reps", "min", "km", "cal", "%"];

function AdminGoals() {
  const [goals, setGoals] = useState([]);

  const [stats, setStats] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    usersWithGoals: 0,
    averageProgress: 0,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalType, setModalType] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [form, setForm] = useState(initialForm);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (category !== "All") {
        params.append("category", category);
      }

      if (status !== "All") {
        params.append(
          "status",
          status === "Completed" ? "completed" : "active",
        );
      }

      const query = params.toString();

      const endpoint = query ? `/admin/goals?${query}` : "/admin/goals";

      const response = await authRequest(endpoint);

      if (response.success) {
        setGoals(response.goals || []);
      } else {
        setError(response.message || "Unable to load goals.");
      }
    } catch (err) {
      console.error("Load admin goals error:", err);
      setError(err.message || "Unable to load goals.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authRequest("/admin/goals/stats");

      if (response.success && response.stats) {
        setStats({
          totalGoals: response.stats.totalGoals || 0,
          activeGoals: response.stats.activeGoals || 0,
          completedGoals: response.stats.completedGoals || 0,
          usersWithGoals: response.stats.usersWithGoals || 0,
          averageProgress: response.stats.averageProgress || 0,
        });
      }
    } catch (err) {
      console.error("Load goal stats error:", err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGoals();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, status]);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [success]);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatDateInput = (date) => {
    if (!date) return "";

    const value = String(date);

    if (value.length >= 10) {
      return value.slice(0, 10);
    }

    return "";
  };

  const getUserName = (goal) => {
    if (goal?.user?.name) {
      return goal.user.name;
    }

    if (typeof goal?.user === "string") {
      return goal.user;
    }

    return "Unknown User";
  };

  const getUserEmail = (goal) => {
    if (goal?.user?.email) {
      return goal.user.email;
    }

    return "No email available";
  };

  const formatNumber = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "—";
    }

    return Number.isInteger(number) ? String(number) : number.toFixed(1);
  };

  const getValue = (value, unit) => {
    if (value === undefined || value === null || value === "") {
      return "—";
    }

    return `${formatNumber(value)}${unit ? ` ${unit}` : ""}`;
  };

  const calculateFallbackProgress = (goal) => {
    const start = Number(goal?.startValue);
    const current = Number(goal?.current);
    const target = Number(goal?.target);

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(current) ||
      !Number.isFinite(target)
    ) {
      return 0;
    }

    if (start === target) {
      return current === target ? 100 : 0;
    }

    if (start > target) {
      if (current <= target) {
        return 100;
      }

      const total = start - target;
      const achieved = Math.max(0, start - current);

      return Math.min(100, Math.max(0, Math.round((achieved / total) * 100)));
    }

    if (current >= target) {
      return 100;
    }

    const total = target - start;
    const achieved = Math.max(0, current - start);

    return Math.min(100, Math.max(0, Math.round((achieved / total) * 100)));
  };

  const getProgress = (goal) => {
    const backendProgress = Number(goal?.progress);

    if (Number.isFinite(backendProgress)) {
      return Math.min(100, Math.max(0, Math.round(backendProgress)));
    }

    return calculateFallbackProgress(goal);
  };

  const getStatus = (goal) => {
    if (goal?.status === "Completed" || goal?.status === "Active") {
      return goal.status;
    }

    return getProgress(goal) >= 100 ? "Completed" : "Active";
  };

  const getRemaining = (goal) => {
    if (goal?.remaining !== undefined && goal?.remaining !== null) {
      return Number(goal.remaining);
    }

    const start = Number(goal?.startValue);
    const current = Number(goal?.current);
    const target = Number(goal?.target);

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(current) ||
      !Number.isFinite(target)
    ) {
      return null;
    }

    if (start > target) {
      return Math.max(0, current - target);
    }

    if (start < target) {
      return Math.max(0, target - current);
    }

    return Math.abs(target - current);
  };

  const openEditModal = (goal) => {
    setError("");
    setSuccess("");
    setSelectedGoal(goal);

    setForm({
      title: goal?.title || "",
      category: goal?.category || "Weight",
      startValue: goal?.startValue ?? "",
      current: goal?.current ?? "",
      target: goal?.target ?? "",
      unit: goal?.unit || "kg",
      deadline: formatDateInput(goal?.deadline),
      description: goal?.description || "",
    });

    setModalType("edit");
  };

  const handleView = async (goal) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await authRequest(`/admin/goals/${goal._id}`);

      if (response.success && response.goal) {
        setSelectedGoal(response.goal);
        setModalType("view");
      } else {
        setError(response.message || "Unable to load goal.");
      }
    } catch (err) {
      console.error("View goal error:", err);
      setError(err.message || "Unable to view goal.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedGoal || modalType !== "edit") {
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a goal title.");
      return;
    }

    if (form.startValue === "" || form.current === "" || form.target === "") {
      setError("Start value, current value and target are required.");
      return;
    }

    const start = Number(form.startValue);
    const current = Number(form.current);
    const target = Number(form.target);

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(current) ||
      !Number.isFinite(target)
    ) {
      setError("Start value, current value and target must be valid numbers.");
      return;
    }

    if (start < 0 || current < 0 || target < 0) {
      setError("Goal values cannot be negative.");
      return;
    }

    try {
      setActionLoading(true);

      const payload = {
        title: form.title.trim(),
        category: form.category,
        startValue: start,
        current,
        target,
        unit: form.unit,
        deadline: form.deadline || null,
        description: form.description.trim(),
      };

      const response = await authRequest(`/admin/goals/${selectedGoal._id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response.success) {
        setError(response.message || "Unable to update goal.");
        return;
      }

      setSuccess("Goal updated successfully.");

      setModalType(null);
      setSelectedGoal(null);
      setForm(initialForm);

      await Promise.all([loadGoals(), loadStats()]);
    } catch (err) {
      console.error("Update admin goal error:", err);

      setError(err.message || "Unable to update goal.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (goal) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${goal.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await authRequest(`/admin/goals/${goal._id}`, {
        method: "DELETE",
      });

      if (!response.success) {
        setError(response.message || "Unable to delete goal.");
        return;
      }

      setSuccess("Goal deleted successfully.");

      await Promise.all([loadGoals(), loadStats()]);
    } catch (err) {
      console.error("Delete admin goal error:", err);

      setError(err.message || "Unable to delete goal.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    if (actionLoading) {
      return;
    }

    setModalType(null);
    setSelectedGoal(null);
    setForm(initialForm);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setStatus("All");
  };

  const visibleGoalsCount = useMemo(() => goals.length, [goals]);

  return (
    <div className="admin-goals">
      <div className="admin-page-header">
        <div>
          <div className="admin-goals-eyebrow">FITTRACK ADMIN</div>

          <h1>Goals Management</h1>

          <p>
            Monitor user goals, manage progress, and keep fitness targets
            accurate.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-goal-message error">
          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {success && (
        <div className="admin-goal-message success">
          <span>{success}</span>

          <button type="button" onClick={() => setSuccess("")}>
            <FaTimes />
          </button>
        </div>
      )}

      <div className="admin-goals-stats">
        <div className="goal-stat-card">
          <div className="goal-stat-icon">
            <FaBullseye />
          </div>

          <div>
            <span>Total Goals</span>
            <h3>{stats.totalGoals.toLocaleString()}</h3>
          </div>
        </div>

        <div className="goal-stat-card">
          <div className="goal-stat-icon">
            <FaClock />
          </div>

          <div>
            <span>Active Goals</span>
            <h3>{stats.activeGoals.toLocaleString()}</h3>
          </div>
        </div>

        <div className="goal-stat-card">
          <div className="goal-stat-icon">
            <FaCheckCircle />
          </div>

          <div>
            <span>Completed Goals</span>
            <h3>{stats.completedGoals.toLocaleString()}</h3>
          </div>
        </div>

        <div className="goal-stat-card">
          <div className="goal-stat-icon">
            <FaUsers />
          </div>

          <div>
            <span>Users With Goals</span>
            <h3>{stats.usersWithGoals.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="admin-goals-overview">
        <div>
          <span>Average Goal Progress</span>

          <strong>{stats.averageProgress}%</strong>
        </div>

        <div className="overview-progress">
          <div
            className="overview-progress-bar"
            style={{
              width: `${Math.min(100, Math.max(0, stats.averageProgress))}%`,
            }}
          />
        </div>
      </div>

      <div className="admin-goals-filter-card">
        <div className="goal-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Search goal, user or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All Categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Status</option>

          <option value="Active">Active</option>

          <option value="Completed">Completed</option>
        </select>

        <button type="button" className="goal-clear-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      <div className="admin-goals-table-card">
        <div className="table-card-header">
          <div>
            <h2>All Goals</h2>

            <span>
              {loading
                ? "Loading goals..."
                : `${visibleGoalsCount} goals found`}
            </span>
          </div>
        </div>

        <div className="admin-goals-table-wrapper">
          <table className="admin-goals-table">
            <thead>
              <tr>
                <th>Goal</th>
                <th>User</th>
                <th>Category</th>
                <th>Current</th>
                <th>Target</th>
                <th>Progress</th>
                <th>Remaining</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="no-goals">
                    <div className="table-loading">Loading goals...</div>
                  </td>
                </tr>
              ) : goals.length > 0 ? (
                goals.map((item) => {
                  const progress = getProgress(item);

                  const goalStatus = getStatus(item);

                  const remaining = getRemaining(item);

                  return (
                    <tr key={item._id}>
                      <td>
                        <div className="goal-name">
                          <div className="goal-avatar">
                            <FaBullseye />
                          </div>

                          <div>
                            <strong>{item.title || "Untitled Goal"}</strong>

                            <small>Goal #{String(item._id).slice(-6)}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="goal-user">
                          <strong>{getUserName(item)}</strong>

                          <small>{getUserEmail(item)}</small>
                        </div>
                      </td>

                      <td>
                        <span className="goal-category">
                          {item.category || "Other"}
                        </span>
                      </td>

                      <td>
                        <strong className="goal-current-value">
                          {getValue(item.current, item.unit)}
                        </strong>
                      </td>

                      <td>
                        <strong className="goal-target-value">
                          {getValue(item.target, item.unit)}
                        </strong>
                      </td>

                      <td>
                        <div className="goal-progress">
                          <div className="goal-progress-top">
                            <span>{progress}%</span>
                          </div>

                          <div className="goal-progress-track">
                            <div
                              className={`goal-progress-bar ${
                                goalStatus === "Completed" ? "completed" : ""
                              }`}
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>

                          <small>
                            {getValue(item.current, item.unit)} /{" "}
                            {getValue(item.target, item.unit)}
                          </small>
                        </div>
                      </td>

                      <td>
                        <div className="goal-remaining">
                          {goalStatus === "Completed" ? (
                            <span className="remaining-complete">
                              <FaCheckCircle />
                              Complete
                            </span>
                          ) : (
                            <strong>
                              {remaining !== null
                                ? getValue(remaining, item.unit)
                                : "—"}
                            </strong>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="goal-deadline">
                          {formatDate(item.deadline)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`goal-status ${goalStatus
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {goalStatus}
                        </span>
                      </td>

                      <td>
                        <div className="goal-actions">
                          <button
                            type="button"
                            className="goal-action view"
                            title="View Goal"
                            onClick={() => handleView(item)}
                            disabled={actionLoading}
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="goal-action edit"
                            title="Edit Goal"
                            onClick={() => openEditModal(item)}
                            disabled={actionLoading}
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            className="goal-action delete"
                            title="Delete Goal"
                            onClick={() => handleDelete(item)}
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
                  <td colSpan="10" className="no-goals">
                    No goals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalType === "edit" && selectedGoal && (
        <div
          className="admin-goal-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="admin-goal-modal">
            <div className="admin-goal-modal-header">
              <div>
                <span className="modal-eyebrow">EDIT GOAL</span>

                <h2>Edit Fitness Goal</h2>

                <p>Update the user's goal information and progress.</p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
                disabled={actionLoading}
              >
                <FaTimes />
              </button>
            </div>

            <form className="admin-goal-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* User - Read Only */}
                <div className="form-group full">
                  <label>User</label>

                  <input
                    type="text"
                    value={`${getUserName(selectedGoal)} — ${getUserEmail(
                      selectedGoal,
                    )}`}
                    disabled
                    readOnly
                  />

                  <small>
                    The goal owner cannot be changed by an administrator.
                  </small>
                </div>

                <div className="form-group full">
                  <label>Goal Title</label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Lose 10 kg"
                    maxLength="100"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    required
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Unit</label>

                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleFormChange}
                    required
                  >
                    {units.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Starting Value</label>

                  <input
                    type="number"
                    name="startValue"
                    value={form.startValue}
                    onChange={handleFormChange}
                    min="0"
                    step="any"
                    required
                  />

                  <small>
                    Original value. Admin may correct this if the stored goal
                    data is inaccurate.
                  </small>
                </div>

                <div className="form-group">
                  <label>Current Value</label>

                  <input
                    type="number"
                    name="current"
                    value={form.current}
                    onChange={handleFormChange}
                    min="0"
                    step="any"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Target Value</label>

                  <input
                    type="number"
                    name="target"
                    value={form.target}
                    onChange={handleFormChange}
                    min="0"
                    step="any"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Deadline</label>

                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group full">
                  <label>Description</label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows="4"
                    placeholder="Add a short description..."
                    maxLength="500"
                  />
                </div>
              </div>

              {form.startValue !== "" && form.target !== "" && (
                <div className="goal-form-preview">
                  <div className="preview-icon">
                    {Number(form.startValue) > Number(form.target) ? (
                      <FaArrowDown />
                    ) : (
                      <FaArrowUp />
                    )}
                  </div>

                  <div>
                    <strong>
                      {Number(form.startValue) > Number(form.target)
                        ? "Decrease Goal"
                        : "Increase Goal"}
                    </strong>

                    <span>
                      Progress is calculated from the starting value toward the
                      target.
                    </span>
                  </div>
                </div>
              )}

              <div className="admin-goal-modal-footer">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closeModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={actionLoading}
                >
                  <FaSave />

                  {actionLoading ? "Saving..." : "Update Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === "view" && selectedGoal && (
        <div
          className="admin-goal-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="admin-goal-modal view-modal">
            <div className="admin-goal-modal-header">
              <div>
                <span className="modal-eyebrow">GOAL DETAILS</span>

                <h2>{selectedGoal.title}</h2>

                <p>Complete progress and goal information.</p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
              >
                <FaTimes />
              </button>
            </div>

            <div className="goal-detail-content">
              <div className="goal-detail-user">
                <div className="detail-avatar">
                  {selectedGoal.user?.profilePhoto ? (
                    <img
                      src={selectedGoal.user.profilePhoto}
                      alt={getUserName(selectedGoal)}
                    />
                  ) : (
                    getUserName(selectedGoal).charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <strong>{getUserName(selectedGoal)}</strong>

                  <span>{getUserEmail(selectedGoal)}</span>
                </div>
              </div>

              <div className="detail-status-row">
                <span
                  className={`goal-status ${getStatus(selectedGoal)
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {getStatus(selectedGoal)}
                </span>

                <span className="goal-category">{selectedGoal.category}</span>
              </div>

              <div className="detail-progress-card">
                <div className="detail-progress-header">
                  <div>
                    <span>Overall Progress</span>

                    <strong>{getProgress(selectedGoal)}%</strong>
                  </div>

                  <span>
                    {getValue(selectedGoal.current, selectedGoal.unit)} /{" "}
                    {getValue(selectedGoal.target, selectedGoal.unit)}
                  </span>
                </div>

                <div className="detail-progress-track">
                  <div
                    className="detail-progress-bar"
                    style={{
                      width: `${getProgress(selectedGoal)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="goal-detail-grid">
                <div className="detail-item">
                  <span>Starting Value</span>

                  <strong>
                    {getValue(selectedGoal.startValue, selectedGoal.unit)}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Current Value</span>

                  <strong>
                    {getValue(selectedGoal.current, selectedGoal.unit)}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Target Value</span>

                  <strong>
                    {getValue(selectedGoal.target, selectedGoal.unit)}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Remaining</span>

                  <strong>
                    {getStatus(selectedGoal) === "Completed"
                      ? "Complete"
                      : getValue(getRemaining(selectedGoal), selectedGoal.unit)}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Deadline</span>

                  <strong>{formatDate(selectedGoal.deadline)}</strong>
                </div>

                <div className="detail-item">
                  <span>Direction</span>

                  <strong>
                    {selectedGoal.direction === "decrease"
                      ? "Decrease"
                      : selectedGoal.direction === "increase"
                        ? "Increase"
                        : "Maintain"}
                  </strong>
                </div>
              </div>

              <div className="goal-detail-description">
                <span>Description</span>

                <p>{selectedGoal.description || "No description provided."}</p>
              </div>
            </div>

            <div className="admin-goal-modal-footer">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={closeModal}
              >
                Close
              </button>

              <button
                type="button"
                className="modal-save-btn"
                onClick={() => openEditModal(selectedGoal)}
              >
                <FaEdit />
                Edit Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGoals;
