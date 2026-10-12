import { useEffect, useMemo, useState } from "react";
import {
  FaChartLine,
  FaUsers,
  FaWeight,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaRulerHorizontal,
  FaDumbbell,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./AdminProgress.css";

function AdminProgress() {
  const [progressData, setProgressData] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    averageWeight: 0,
    averageChest: 0,
    averageWaist: 0,
    averageArms: 0,
    averageStrength: 0,
    lowestWeight: 0,
    highestWeight: 0,
  });

  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedProgress, setSelectedProgress] = useState(null);

  const [editForm, setEditForm] = useState({
    date: "",
    weight: "",
    chest: "",
    waist: "",
    arms: "",
    strength: "",
    notes: "",
  });

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      const query = params.toString();

      const response = await authRequest(
        `/admin/progress${query ? `?${query}` : ""}`,
      );

      if (response.success) {
        setProgressData(response.progress || []);
      } else {
        setError(response.message || "Failed to load progress records");
      }
    } catch (error) {
      console.error("Load admin progress error:", error);

      setError(error.message || "Failed to load progress records");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authRequest("/admin/progress/stats");

      if (response.success) {
        setStats(
          response.stats || {
            totalRecords: 0,
            averageWeight: 0,
            averageChest: 0,
            averageWaist: 0,
            averageArms: 0,
            averageStrength: 0,
            lowestWeight: 0,
            highestWeight: 0,
          },
        );
      }
    } catch (error) {
      console.error("Load progress stats error:", error);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [search]);

  useEffect(() => {
    loadStats();
  }, []);

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatDateForInput = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().split("T")[0];
  };

  const getUserName = (item) => {
    return item.user?.name || "Unknown User";
  };

  const getUserEmail = (item) => {
    return item.user?.email || "No email";
  };

  const getUserInitial = (item) => {
    return getUserName(item).charAt(0).toUpperCase();
  };

  const getProgressType = (item) => {
    if (item.weight !== null && item.weight !== undefined) {
      return "Weight";
    }

    if (item.chest !== null && item.chest !== undefined) {
      return "Chest";
    }

    if (item.waist !== null && item.waist !== undefined) {
      return "Waist";
    }

    if (item.arms !== null && item.arms !== undefined) {
      return "Arms";
    }

    if (item.strength !== null && item.strength !== undefined) {
      return "Strength";
    }

    return "General";
  };

  const getProgressTypeIcon = (item) => {
    const progressType = getProgressType(item);

    if (progressType === "Weight") {
      return <FaWeight />;
    }

    if (
      progressType === "Chest" ||
      progressType === "Waist" ||
      progressType === "Arms"
    ) {
      return <FaRulerHorizontal />;
    }

    if (progressType === "Strength") {
      return <FaDumbbell />;
    }

    return <FaChartLine />;
  };

  const getProgressStatus = (item) => {
    const hasMeasurement =
      item.weight !== null ||
      item.chest !== null ||
      item.waist !== null ||
      item.arms !== null ||
      item.strength !== null;

    return hasMeasurement ? "Updated" : "Recorded";
  };

  const filteredProgress = useMemo(() => {
    return progressData.filter((item) => {
      const progressType = getProgressType(item);

      return type === "All" || progressType === type;
    });
  }, [progressData, type]);

  const uniqueUsers = useMemo(() => {
    return new Set(progressData.map((item) => item.user?._id).filter(Boolean))
      .size;
  }, [progressData]);

  const recentUpdates = useMemo(() => {
    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return progressData.filter((item) => {
      if (!item.date) {
        return false;
      }

      return new Date(item.date) >= thirtyDaysAgo;
    }).length;
  }, [progressData]);

  const viewProgress = async (item) => {
    try {
      setActionLoading(true);

      const response = await authRequest(`/admin/progress/${item._id}`);

      if (response.success) {
        setSelectedProgress(response.progress);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error("View progress error:", error);

      window.alert(error.message || "Failed to load progress record");
    } finally {
      setActionLoading(false);
    }
  };

  const editProgress = async (item) => {
    try {
      setActionLoading(true);

      const response = await authRequest(`/admin/progress/${item._id}`);

      if (response.success) {
        const progress = response.progress;

        setSelectedProgress(progress);

        setEditForm({
          date: formatDateForInput(progress.date),
          weight:
            progress.weight !== null && progress.weight !== undefined
              ? progress.weight
              : "",
          chest:
            progress.chest !== null && progress.chest !== undefined
              ? progress.chest
              : "",
          waist:
            progress.waist !== null && progress.waist !== undefined
              ? progress.waist
              : "",
          arms:
            progress.arms !== null && progress.arms !== undefined
              ? progress.arms
              : "",
          strength:
            progress.strength !== null && progress.strength !== undefined
              ? progress.strength
              : "",
          notes: progress.notes || "",
        });

        setShowEditModal(true);
      }
    } catch (error) {
      console.error("Edit progress error:", error);

      window.alert(error.message || "Failed to load progress record");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveEditedProgress = async (e) => {
    e.preventDefault();

    if (!selectedProgress?._id) {
      return;
    }

    try {
      setActionLoading(true);

      const payload = {
        date: editForm.date,
        weight: editForm.weight === "" ? null : Number(editForm.weight),
        chest: editForm.chest === "" ? null : Number(editForm.chest),
        waist: editForm.waist === "" ? null : Number(editForm.waist),
        arms: editForm.arms === "" ? null : Number(editForm.arms),
        strength: editForm.strength === "" ? null : Number(editForm.strength),
        notes: editForm.notes,
      };

      const response = await authRequest(
        `/admin/progress/${selectedProgress._id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );

      if (response.success) {
        window.alert("Progress record updated successfully.");

        setShowEditModal(false);
        setSelectedProgress(null);

        await loadProgress();
        await loadStats();
      }
    } catch (error) {
      console.error("Save edited progress error:", error);

      window.alert(error.message || "Failed to update progress record");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this progress record?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await authRequest(`/admin/progress/${id}`, {
        method: "DELETE",
      });

      if (response.success) {
        setProgressData((current) => current.filter((item) => item._id !== id));

        await loadStats();

        window.alert("Progress record deleted successfully.");
      }
    } catch (error) {
      console.error("Delete progress error:", error);

      window.alert(error.message || "Failed to delete progress record");
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setType("All");
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedProgress(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedProgress(null);

    setEditForm({
      date: "",
      weight: "",
      chest: "",
      waist: "",
      arms: "",
      strength: "",
      notes: "",
    });
  };

  return (
    <div className="admin-progress">
      <div className="admin-progress-header">
        <div>
          <h1>Progress Management</h1>
          <p>Monitor and manage user fitness progress records.</p>
        </div>
      </div>

      <div className="progress-stats-grid">
        <div className="progress-stat-card">
          <div className="progress-stat-icon">
            <FaChartLine />
          </div>

          <div>
            <span>Total Records</span>
            <h3>{stats.totalRecords || 0}</h3>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon">
            <FaUsers />
          </div>

          <div>
            <span>Active Users</span>
            <h3>{uniqueUsers}</h3>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon">
            <FaWeight />
          </div>

          <div>
            <span>Average Weight</span>
            <h3>{stats.averageWeight ? `${stats.averageWeight} kg` : "—"}</h3>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon">
            <FaChartLine />
          </div>

          <div>
            <span>Recent Updates</span>
            <h3>{recentUpdates}</h3>
          </div>
        </div>
      </div>

      <div className="progress-filter-card">
        <div className="progress-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Search user, email or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="All">All Types</option>
          <option value="Weight">Weight</option>
          <option value="Chest">Chest</option>
          <option value="Waist">Waist</option>
          <option value="Arms">Arms</option>
          <option value="Strength">Strength</option>
          <option value="General">General</option>
        </select>

        <button className="progress-clear-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      <div className="progress-table-card">
        <div className="progress-table-header">
          <div>
            <h2>User Progress Records</h2>

            <span>{filteredProgress.length} records found</span>
          </div>
        </div>

        {loading ? (
          <div className="progress-loading">Loading progress records...</div>
        ) : error ? (
          <div className="progress-error">{error}</div>
        ) : (
          <div className="progress-table-wrapper">
            <table className="progress-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Weight</th>
                  <th>Chest</th>
                  <th>Waist</th>
                  <th>Arms</th>
                  <th>Strength</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProgress.length > 0 ? (
                  filteredProgress.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="progress-user">
                          <div className="progress-avatar">
                            {item.user?.profilePhoto ? (
                              <img
                                src={item.user.profilePhoto}
                                alt={getUserName(item)}
                              />
                            ) : (
                              getUserInitial(item)
                            )}
                          </div>

                          <div>
                            <strong>{getUserName(item)}</strong>

                            <small>{getUserEmail(item)}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="progress-type">
                          {getProgressTypeIcon(item)}
                          {getProgressType(item)}
                        </span>
                      </td>

                      <td>
                        {item.weight !== null && item.weight !== undefined
                          ? `${item.weight} kg`
                          : "—"}
                      </td>

                      <td>
                        {item.chest !== null && item.chest !== undefined
                          ? `${item.chest} cm`
                          : "—"}
                      </td>

                      <td>
                        {item.waist !== null && item.waist !== undefined
                          ? `${item.waist} cm`
                          : "—"}
                      </td>

                      <td>
                        {item.arms !== null && item.arms !== undefined
                          ? `${item.arms} cm`
                          : "—"}
                      </td>

                      <td>
                        {item.strength !== null && item.strength !== undefined
                          ? item.strength
                          : "—"}
                      </td>

                      <td>{formatDate(item.date)}</td>

                      <td>
                        <span
                          className={`progress-status ${getProgressStatus(item)
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {getProgressStatus(item)}
                        </span>
                      </td>

                      <td>
                        <div className="progress-actions">
                          <button
                            type="button"
                            className="progress-action view"
                            title="View"
                            disabled={actionLoading}
                            onClick={() => viewProgress(item)}
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className="progress-action edit"
                            title="Edit"
                            disabled={actionLoading}
                            onClick={() => editProgress(item)}
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            className="progress-action delete"
                            title="Delete"
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
                    <td colSpan="10" className="no-progress">
                      No progress records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showViewModal && selectedProgress && (
        <div className="progress-modal-overlay" onClick={closeViewModal}>
          <div className="progress-modal" onClick={(e) => e.stopPropagation()}>
            <div className="progress-modal-header">
              <div>
                <span className="progress-modal-eyebrow">Progress Details</span>

                <h2>View Progress Record</h2>
              </div>

              <button
                type="button"
                className="progress-modal-close"
                onClick={closeViewModal}
              >
                <FaTimes />
              </button>
            </div>

            <div className="progress-view-user">
              <div className="progress-view-avatar">
                {selectedProgress.user?.profilePhoto ? (
                  <img
                    src={selectedProgress.user.profilePhoto}
                    alt={getUserName(selectedProgress)}
                  />
                ) : (
                  getUserInitial(selectedProgress)
                )}
              </div>

              <div>
                <strong>{getUserName(selectedProgress)}</strong>

                <span>{getUserEmail(selectedProgress)}</span>
              </div>
            </div>

            <div className="progress-detail-grid">
              <div>
                <span>Date</span>
                <strong>{formatDate(selectedProgress.date)}</strong>
              </div>

              <div>
                <span>Weight</span>
                <strong>
                  {selectedProgress.weight ?? "—"}{" "}
                  {selectedProgress.weight !== null &&
                  selectedProgress.weight !== undefined
                    ? "kg"
                    : ""}
                </strong>
              </div>

              <div>
                <span>Chest</span>
                <strong>
                  {selectedProgress.chest ?? "—"}{" "}
                  {selectedProgress.chest !== null &&
                  selectedProgress.chest !== undefined
                    ? "cm"
                    : ""}
                </strong>
              </div>

              <div>
                <span>Waist</span>
                <strong>
                  {selectedProgress.waist ?? "—"}{" "}
                  {selectedProgress.waist !== null &&
                  selectedProgress.waist !== undefined
                    ? "cm"
                    : ""}
                </strong>
              </div>

              <div>
                <span>Arms</span>
                <strong>
                  {selectedProgress.arms ?? "—"}{" "}
                  {selectedProgress.arms !== null &&
                  selectedProgress.arms !== undefined
                    ? "cm"
                    : ""}
                </strong>
              </div>

              <div>
                <span>Strength</span>
                <strong>{selectedProgress.strength ?? "—"}</strong>
              </div>
            </div>

            <div className="progress-notes-box">
              <span>Notes</span>

              <p>{selectedProgress.notes || "No notes added."}</p>
            </div>

            <div className="progress-modal-footer">
              <button
                type="button"
                className="progress-modal-cancel"
                onClick={closeViewModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedProgress && (
        <div className="progress-modal-overlay">
          <div className="progress-modal progress-edit-modal">
            <div className="progress-modal-header">
              <div>
                <span className="progress-modal-eyebrow">
                  Progress Management
                </span>

                <h2>Edit Progress Record</h2>
              </div>

              <button
                type="button"
                className="progress-modal-close"
                onClick={closeEditModal}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={saveEditedProgress}>
              <div className="progress-form-grid">
                <div className="progress-form-group">
                  <label>Date</label>

                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="progress-form-group">
                  <label>Weight (kg)</label>

                  <input
                    type="number"
                    name="weight"
                    min="0"
                    step="0.1"
                    placeholder="Enter weight"
                    value={editForm.weight}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="progress-form-group">
                  <label>Chest (cm)</label>

                  <input
                    type="number"
                    name="chest"
                    min="0"
                    step="0.1"
                    placeholder="Enter chest"
                    value={editForm.chest}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="progress-form-group">
                  <label>Waist (cm)</label>

                  <input
                    type="number"
                    name="waist"
                    min="0"
                    step="0.1"
                    placeholder="Enter waist"
                    value={editForm.waist}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="progress-form-group">
                  <label>Arms (cm)</label>

                  <input
                    type="number"
                    name="arms"
                    min="0"
                    step="0.1"
                    placeholder="Enter arms"
                    value={editForm.arms}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="progress-form-group">
                  <label>Strength</label>

                  <input
                    type="number"
                    name="strength"
                    min="0"
                    step="0.1"
                    placeholder="Enter strength"
                    value={editForm.strength}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="progress-form-group full-width">
                  <label>Notes</label>

                  <textarea
                    name="notes"
                    rows="4"
                    placeholder="Enter progress notes..."
                    value={editForm.notes}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="progress-modal-footer">
                <button
                  type="button"
                  className="progress-modal-cancel"
                  onClick={closeEditModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="progress-modal-save"
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

export default AdminProgress;
