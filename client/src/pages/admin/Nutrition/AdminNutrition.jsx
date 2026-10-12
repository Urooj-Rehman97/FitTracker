import { useEffect, useMemo, useState } from "react";
import {
  FaUtensils,
  FaFire,
  FaAppleAlt,
  FaUsers,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaFilter,
  FaTimes,
  FaSave,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./AdminNutrition.css";

function AdminNutrition() {
  const [logs, setLogs] = useState([]);

  const [stats, setStats] = useState({
    totalRecords: 0,
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  });

  const [search, setSearch] = useState("");
  const [mealType, setMealType] = useState("All");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const [editForm, setEditForm] = useState({
    date: "",
    mealType: "Breakfast",
    foodName: "",
    quantity: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    notes: "",
  });

  const loadNutrition = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (mealType !== "All") {
        params.append("mealType", mealType);
      }

      const endpoint = params.toString()
        ? `/admin/nutrition?${params.toString()}`
        : "/admin/nutrition";

      const response = await authRequest(endpoint);

      if (response.success) {
        setLogs(response.nutrition || []);
      } else {
        setError(response.message || "Unable to load nutrition logs.");
      }
    } catch (err) {
      console.error("Load admin nutrition error:", err);

      setError(err.message || "Unable to load nutrition logs.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authRequest("/admin/nutrition/stats");

      if (response.success && response.totals) {
        setStats({
          totalRecords: response.totals.totalRecords || 0,
          totalCalories: response.totals.totalCalories || 0,
          totalProtein: response.totals.totalProtein || 0,
          totalCarbs: response.totals.totalCarbs || 0,
          totalFats: response.totals.totalFats || 0,
        });
      }
    } catch (err) {
      console.error("Load nutrition stats error:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNutrition();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, mealType]);

  useEffect(() => {
    loadStats();
  }, []);

  const uniqueUsers = useMemo(() => {
    const userIds = new Set();

    logs.forEach((log) => {
      if (log.user?._id) {
        userIds.add(log.user._id);
      } else if (log.user) {
        userIds.add(
          typeof log.user === "string" ? log.user : JSON.stringify(log.user),
        );
      }
    });

    return userIds.size;
  }, [logs]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");

    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getUserName = (log) => {
    if (log.user?.name) {
      return log.user.name;
    }

    if (typeof log.user === "string") {
      return log.user;
    }

    return "Unknown User";
  };

  const getUserInitials = (name) => {
    if (!name) return "U";

    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const viewLog = async (log) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await authRequest(`/admin/nutrition/${log._id}`);

      if (response.success && response.nutrition) {
        const nutrition = response.nutrition;

        window.alert(
          `Nutrition Details\n\n` +
            `User: ${getUserName(nutrition)}\n` +
            `Meal: ${nutrition.foodName || "N/A"}\n` +
            `Meal Type: ${nutrition.mealType || "N/A"}\n` +
            `Quantity: ${nutrition.quantity ?? "N/A"}\n` +
            `Calories: ${nutrition.calories ?? 0} kcal\n` +
            `Protein: ${nutrition.protein ?? 0} g\n` +
            `Carbs: ${nutrition.carbs ?? 0} g\n` +
            `Fats: ${nutrition.fats ?? 0} g\n` +
            `Date: ${formatDate(nutrition.date)}\n` +
            `Notes: ${nutrition.notes || "No notes."}`,
        );
      } else {
        setError(response.message || "Unable to view nutrition record.");
      }
    } catch (err) {
      console.error("View nutrition error:", err);

      setError(err.message || "Unable to view nutrition record.");
    } finally {
      setActionLoading(false);
    }
  };

  const editLog = async (log) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await authRequest(`/admin/nutrition/${log._id}`);

      if (!response.success || !response.nutrition) {
        window.alert(response.message || "Unable to load nutrition record.");
        return;
      }

      const nutrition = response.nutrition;

      setSelectedLog(nutrition);

      setEditForm({
        date: formatDateForInput(nutrition.date),
        mealType: nutrition.mealType || "Breakfast",
        foodName: nutrition.foodName || "",
        quantity: nutrition.quantity ?? "",
        calories: nutrition.calories ?? "",
        protein: nutrition.protein ?? "",
        carbs: nutrition.carbs ?? "",
        fats: nutrition.fats ?? "",
        notes: nutrition.notes || "",
      });

      setShowEditModal(true);
    } catch (err) {
      console.error("Edit nutrition load error:", err);

      window.alert(err.message || "Unable to load nutrition record.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveEditedLog = async (event) => {
    event.preventDefault();

    if (!selectedLog?._id) {
      return;
    }

    if (!editForm.foodName.trim()) {
      window.alert("Food name is required.");
      return;
    }

    if (!editForm.mealType) {
      window.alert("Meal type is required.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await authRequest(
        `/admin/nutrition/${selectedLog._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            date: editForm.date || null,
            mealType: editForm.mealType,
            foodName: editForm.foodName.trim(),
            quantity: editForm.quantity.trim(),
            calories: Number(editForm.calories) || 0,
            protein: Number(editForm.protein) || 0,
            carbs: Number(editForm.carbs) || 0,
            fats: Number(editForm.fats) || 0,
            notes: editForm.notes.trim(),
          }),
        },
      );

      if (!response.success) {
        window.alert(response.message || "Unable to update nutrition record.");
        return;
      }

      window.alert("Nutrition record updated successfully.");

      closeEditModal();

      await loadNutrition();
      await loadStats();
    } catch (err) {
      console.error("Save nutrition error:", err);

      window.alert(err.message || "Unable to update nutrition record.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedLog(null);

    setEditForm({
      date: "",
      mealType: "Breakfast",
      foodName: "",
      quantity: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      notes: "",
    });
  };

  const deleteLog = async (log) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the nutrition log "${
        log.foodName || "this record"
      }"?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await authRequest(`/admin/nutrition/${log._id}`, {
        method: "DELETE",
      });

      if (response.success) {
        setLogs((currentLogs) =>
          currentLogs.filter((currentLog) => currentLog._id !== log._id),
        );

        await loadStats();
      } else {
        setError(response.message || "Unable to delete nutrition record.");
      }
    } catch (err) {
      console.error("Delete nutrition error:", err);

      setError(err.message || "Unable to delete nutrition record.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-nutrition-page">
      <div className="nutrition-page-header">
        <div>
          <span className="nutrition-breadcrumb">Admin / Management</span>

          <h1>Nutrition Management</h1>

          <p>Monitor and manage nutrition logs recorded by FitTrack users.</p>
        </div>
      </div>

      {error && <div className="nutrition-error">{error}</div>}

      <div className="nutrition-stat-grid">
        <div className="nutrition-stat-card">
          <div className="nutrition-stat-icon">
            <FaUtensils />
          </div>

          <div>
            <span>Total Food Logs</span>

            <h3>{stats.totalRecords}</h3>

            <small>Recorded meal entries</small>
          </div>
        </div>

        <div className="nutrition-stat-card">
          <div className="nutrition-stat-icon calories-icon">
            <FaFire />
          </div>

          <div>
            <span>Total Calories</span>

            <h3>{Number(stats.totalCalories).toLocaleString()}</h3>

            <small>Calories recorded</small>
          </div>
        </div>

        <div className="nutrition-stat-card">
          <div className="nutrition-stat-icon protein-icon">
            <FaAppleAlt />
          </div>

          <div>
            <span>Total Protein</span>

            <h3>{Number(stats.totalProtein).toLocaleString()} g</h3>

            <small>Across all logs</small>
          </div>
        </div>

        <div className="nutrition-stat-card">
          <div className="nutrition-stat-icon users-icon">
            <FaUsers />
          </div>

          <div>
            <span>Active Users</span>

            <h3>{uniqueUsers}</h3>

            <small>Users with nutrition logs</small>
          </div>
        </div>
      </div>

      <div className="nutrition-table-card">
        <div className="nutrition-toolbar">
          <div className="nutrition-toolbar-title">
            <div className="nutrition-title-icon">
              <FaFilter />
            </div>

            <div>
              <h2>Nutrition Logs</h2>

              <p>
                {loading
                  ? "Loading nutrition logs..."
                  : `Showing ${logs.length} nutrition logs`}
              </p>
            </div>
          </div>

          <div className="nutrition-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Search meal or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="nutrition-filter-row">
          <div className="nutrition-filter-item">
            <label>Meal Type</label>

            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="All">All Meals</option>

              <option value="Breakfast">Breakfast</option>

              <option value="Lunch">Lunch</option>

              <option value="Dinner">Dinner</option>

              <option value="Snack">Snack</option>
            </select>
          </div>

          <button
            type="button"
            className="clear-nutrition-filter"
            onClick={() => {
              setSearch("");
              setMealType("All");
            }}
          >
            Clear Filters
          </button>
        </div>

        <div className="nutrition-table-wrapper">
          <table className="nutrition-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Meal</th>
                <th>Meal Type</th>
                <th>Quantity</th>
                <th>Calories</th>
                <th>Protein</th>
                <th>Carbs</th>
                <th>Fats</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="no-nutrition">
                    Loading nutrition logs...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => {
                  const userName = getUserName(log);

                  return (
                    <tr key={log._id}>
                      <td>
                        <div className="nutrition-user">
                          <div className="nutrition-avatar">
                            {getUserInitials(userName)}
                          </div>

                          <strong>{userName}</strong>
                        </div>
                      </td>

                      <td>
                        <strong className="meal-name">
                          {log.foodName || "Unnamed Meal"}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`meal-type ${
                            log.mealType ? log.mealType.toLowerCase() : ""
                          }`}
                        >
                          {log.mealType || "—"}
                        </span>
                      </td>

                      <td>{log.quantity ?? "—"}</td>

                      <td>
                        <strong className="calorie-value">
                          {Number(log.calories || 0).toLocaleString()} kcal
                        </strong>
                      </td>

                      <td>
                        <span className="macro protein">
                          {Number(log.protein || 0)}g
                        </span>
                      </td>

                      <td>
                        <span className="macro carbs">
                          {Number(log.carbs || 0)}g
                        </span>
                      </td>

                      <td>
                        <span className="macro fats">
                          {Number(log.fats || 0)}g
                        </span>
                      </td>

                      <td>{formatDate(log.date)}</td>

                      <td>
                        <div className="nutrition-actions">
                          <button
                            type="button"
                            className="nutrition-action view"
                            title="View"
                            onClick={() => viewLog(log)}
                            disabled={actionLoading}
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="nutrition-action edit"
                            title="Edit"
                            onClick={() => editLog(log)}
                            disabled={actionLoading}
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            className="nutrition-action delete"
                            title="Delete"
                            onClick={() => deleteLog(log)}
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
                  <td colSpan="10" className="no-nutrition">
                    No nutrition logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="nutrition-table-footer">
          <span>
            Showing <strong>{logs.length}</strong> nutrition logs
          </span>

          <div className="nutrition-pagination">
            <button type="button" disabled>
              Previous
            </button>

            <button type="button" className="active-page">
              1
            </button>

            <button type="button" disabled>
              2
            </button>

            <button type="button" disabled>
              3
            </button>

            <button type="button" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="nutrition-modal-overlay" onClick={closeEditModal}>
          <div
            className="nutrition-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="nutrition-modal-header">
              <div>
                <span className="nutrition-modal-eyebrow">
                  NUTRITION MANAGEMENT
                </span>

                <h2>Edit Nutrition Log</h2>

                <p>Update the nutrition record below.</p>
              </div>

              <button
                type="button"
                className="nutrition-modal-close"
                onClick={closeEditModal}
                disabled={actionLoading}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={saveEditedLog}>
              <div className="nutrition-form-grid">
                <div className="nutrition-form-group">
                  <label htmlFor="nutrition-date">Date</label>

                  <input
                    id="nutrition-date"
                    name="date"
                    type="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="nutrition-form-group">
                  <label htmlFor="nutrition-mealType">Meal Type</label>

                  <select
                    id="nutrition-mealType"
                    name="mealType"
                    value={editForm.mealType}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="Breakfast">Breakfast</option>

                    <option value="Lunch">Lunch</option>

                    <option value="Dinner">Dinner</option>

                    <option value="Snack">Snack</option>
                  </select>
                </div>

                <div className="nutrition-form-group full-width">
                  <label htmlFor="nutrition-foodName">Food Name</label>

                  <input
                    id="nutrition-foodName"
                    name="foodName"
                    type="text"
                    value={editForm.foodName}
                    onChange={handleEditChange}
                    placeholder="e.g. Grilled Chicken"
                    required
                  />
                </div>

                <div className="nutrition-form-group">
                  <label htmlFor="nutrition-quantity">Quantity</label>

                  <input
                    id="nutrition-quantity"
                    name="quantity"
                    type="text"
                    value={editForm.quantity}
                    onChange={handleEditChange}
                    placeholder="e.g. 200g"
                  />
                </div>

                <div className="nutrition-form-group">
                  <label htmlFor="nutrition-calories">Calories</label>

                  <input
                    id="nutrition-calories"
                    name="calories"
                    type="number"
                    min="0"
                    value={editForm.calories}
                    onChange={handleEditChange}
                    placeholder="0"
                  />
                </div>

                <div className="nutrition-form-group">
                  <label htmlFor="nutrition-protein">Protein (g)</label>

                  <input
                    id="nutrition-protein"
                    name="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editForm.protein}
                    onChange={handleEditChange}
                    placeholder="0"
                  />
                </div>

                <div className="nutrition-form-group">
                  <label htmlFor="nutrition-carbs">Carbs (g)</label>

                  <input
                    id="nutrition-carbs"
                    name="carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editForm.carbs}
                    onChange={handleEditChange}
                    placeholder="0"
                  />
                </div>

                <div className="nutrition-form-group">
                  <label htmlFor="nutrition-fats">Fats (g)</label>

                  <input
                    id="nutrition-fats"
                    name="fats"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editForm.fats}
                    onChange={handleEditChange}
                    placeholder="0"
                  />
                </div>

                <div className="nutrition-form-group full-width">
                  <label htmlFor="nutrition-notes">Notes</label>

                  <textarea
                    id="nutrition-notes"
                    name="notes"
                    rows="4"
                    value={editForm.notes}
                    onChange={handleEditChange}
                    placeholder="Add nutrition notes..."
                  />
                </div>
              </div>

              <div className="nutrition-modal-footer">
                <button
                  type="button"
                  className="nutrition-modal-cancel"
                  onClick={closeEditModal}
                  disabled={actionLoading}
                >
                  <FaTimes />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="nutrition-modal-save"
                  disabled={actionLoading}
                >
                  <FaSave />

                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNutrition;
