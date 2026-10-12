import { useEffect, useState } from "react";
import {
  FaChartLine,
  FaWeight,
  FaRuler,
  FaDumbbell,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaTrophy,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";
import "./Progress.css";

function Progress() {
  const [progressData, setProgressData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
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

      const response = await authRequest("/progress");

      console.log("PROGRESS DATA RESPONSE:", response);

      if (response.success) {
        setProgressData(response.progress || []);
      } else {
        setError(response.message || "Unable to load progress data.");
      }
    } catch (error) {
      console.error("Load progress error:", error);
      setError(error.message || "Unable to load progress data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingId(null);

    setFormData({
      date: new Date().toISOString().split("T")[0],
      weight: "",
      chest: "",
      waist: "",
      arms: "",
      strength: "",
      notes: "",
    });

    setError("");
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);

    setFormData({
      date: item.date
        ? new Date(item.date).toISOString().split("T")[0]
        : "",
      weight: item.weight ?? "",
      chest: item.chest ?? "",
      waist: item.waist ?? "",
      arms: item.arms ?? "",
      strength: item.strength ?? "",
      notes: item.notes || "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || formData.weight === "") {
      alert("Please enter at least the date and weight.");
      return;
    }

    const progressPayload = {
      date: formData.date,
      weight: Number(formData.weight),
      chest:
        formData.chest === "" ? null : Number(formData.chest),
      waist:
        formData.waist === "" ? null : Number(formData.waist),
      arms:
        formData.arms === "" ? null : Number(formData.arms),
      strength:
        formData.strength === ""
          ? null
          : Number(formData.strength),
      notes: formData.notes.trim(),
    };

    try {
      setSaving(true);
      setError("");

      console.log(
        "PROGRESS DATA BEING SENT:",
        progressPayload
      );

      let response;

      if (editingId) {
        response = await authRequest(
          `/progress/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(progressPayload),
          }
        );

        console.log("PROGRESS UPDATE RESPONSE:", response);
      } else {
        response = await authRequest("/progress", {
          method: "POST",
          body: JSON.stringify(progressPayload),
        });

        console.log("PROGRESS CREATE RESPONSE:", response);
      }

      if (!response.success) {
        throw new Error(
          response.message || "Unable to save progress."
        );
      }

      await loadProgress();

      window.dispatchEvent(
        new CustomEvent("fittrackProgressUpdated")
      );

      closeModal();
    } catch (error) {
      console.error("Save progress error:", error);
      setError(error.message || "Unable to save progress.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this progress record?")) {
      return;
    }

    try {
      setError("");

      const response = await authRequest(
        `/progress/${id}`,
        {
          method: "DELETE",
        }
      );

      console.log("PROGRESS DELETE RESPONSE:", response);

      if (!response.success) {
        throw new Error(
          response.message || "Unable to delete progress."
        );
      }

      setProgressData((prev) =>
        prev.filter((item) => item._id !== id)
      );

      window.dispatchEvent(
        new CustomEvent("fittrackProgressUpdated")
      );
    } catch (error) {
      console.error("Delete progress error:", error);
      setError(error.message || "Unable to delete progress.");
    }
  };

  const filteredProgress = progressData.filter((item) =>
    `${item.date || ""} ${item.notes || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const sortedData = [...progressData].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const latest = sortedData[0] || {};
  const previous = sortedData[1] || {};

  const weightChange =
    latest.weight != null && previous.weight != null
      ? Number(latest.weight) - Number(previous.weight)
      : 0;

  const totalRecords = progressData.length;

  const averageStrength =
    totalRecords > 0
      ? Math.round(
          progressData.reduce(
            (sum, item) =>
              sum + Number(item.strength || 0),
            0
          ) / totalRecords
        )
      : 0;

  const strongestRecord =
    progressData.length > 0
      ? Math.max(
          ...progressData.map((item) =>
            Number(item.strength || 0)
          )
        )
      : 0;

  return (
    <div className="progress-page">
      {/* Header */}
      <div className="progress-page-header">
        <div>
          <span className="progress-eyebrow">
            FITNESS TRACKING
          </span>

          <h1>Progress</h1>

          <p>
            Track your body measurements, weight and fitness
            performance.
          </p>
        </div>

        <button
          type="button"
          className="progress-add-button"
          onClick={openAddModal}
        >
          <FaPlus />
          Add Progress
        </button>
      </div>

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
      <div className="progress-stats">
        <div className="progress-stat-card">
          <div className="progress-stat-icon">
            <FaWeight />
          </div>

          <div>
            <span>Current Weight</span>

            <strong>
              {latest.weight || 0} kg
            </strong>

            <small
              className={
                weightChange < 0
                  ? "positive"
                  : weightChange > 0
                  ? "negative"
                  : ""
              }
            >
              {weightChange === 0
                ? "No recent change"
                : `${
                    weightChange > 0 ? "+" : ""
                  }${weightChange.toFixed(1)} kg`}
            </small>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon">
            <FaRuler />
          </div>

          <div>
            <span>Waist</span>

            <strong>
              {latest.waist || 0} cm
            </strong>

            <small>
              Latest measurement
            </small>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon">
            <FaDumbbell />
          </div>

          <div>
            <span>Avg. Strength</span>

            <strong>
              {averageStrength}
            </strong>

            <small>
              Performance score
            </small>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon">
            <FaTrophy />
          </div>

          <div>
            <span>Best Strength</span>

            <strong>
              {strongestRecord}
            </strong>

            <small>
              Personal best
            </small>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview-card">
        <div className="progress-card-heading">
          <div>
            <h2>Progress Overview</h2>

            <p>
              Your latest fitness measurements and
              performance.
            </p>
          </div>

          <FaChartLine />
        </div>

        <div className="progress-overview-grid">
          <div className="progress-overview-item">
            <span>Weight</span>

            <strong>
              {latest.weight || 0} kg
            </strong>

            <div className="progress-mini-bar">
              <span
                style={{
                  width: `${Math.min(
                    Number(latest.weight || 0),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="progress-overview-item">
            <span>Chest</span>

            <strong>
              {latest.chest || 0} cm
            </strong>

            <div className="progress-mini-bar">
              <span
                style={{
                  width: `${Math.min(
                    Number(latest.chest || 0),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="progress-overview-item">
            <span>Waist</span>

            <strong>
              {latest.waist || 0} cm
            </strong>

            <div className="progress-mini-bar">
              <span
                style={{
                  width: `${Math.min(
                    Number(latest.waist || 0),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="progress-overview-item">
            <span>Strength</span>

            <strong>
              {latest.strength || 0}
            </strong>

            <div className="progress-mini-bar">
              <span
                style={{
                  width: `${Math.min(
                    Number(latest.strength || 0),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="progress-history-card">
        <div className="progress-history-header">
          <div>
            <h2>Progress History</h2>

            <p>
              Keep track of your measurements over time.
            </p>
          </div>

          <div className="progress-search">
            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>

        {loading ? (
          <div className="progress-empty">
            <FaChartLine />

            <h3>Loading progress...</h3>

            <p>
              Fetching your progress records.
            </p>
          </div>
        ) : filteredProgress.length === 0 ? (
          <div className="progress-empty">
            <FaChartLine />

            <h3>No progress records found</h3>

            <p>
              Add your first progress record to start
              tracking.
            </p>
          </div>
        ) : (
          <div className="progress-table-wrapper">
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Chest</th>
                  <th>Waist</th>
                  <th>Arms</th>
                  <th>Strength</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProgress.map((item) => (
                  <tr key={item._id}>
                    <td>
                      {new Date(
                        item.date
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      <strong>
                        {item.weight} kg
                      </strong>
                    </td>

                    <td>
                      {item.chest != null
                        ? `${item.chest} cm`
                        : "-"}
                    </td>

                    <td>
                      {item.waist != null
                        ? `${item.waist} cm`
                        : "-"}
                    </td>

                    <td>
                      {item.arms != null
                        ? `${item.arms} cm`
                        : "-"}
                    </td>

                    <td>
                      <span className="strength-badge">
                        {item.strength || 0}
                      </span>
                    </td>

                    <td className="progress-notes">
                      {item.notes || "No notes"}
                    </td>

                    <td>
                      <div className="progress-actions">
                        <button
                          type="button"
                          className="progress-edit"
                          onClick={() =>
                            openEditModal(item)
                          }
                          title="Edit"
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          className="progress-delete"
                          onClick={() =>
                            handleDelete(item._id)
                          }
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="progress-modal-overlay">
          <div className="progress-modal">
            <div className="progress-modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit Progress"
                    : "Add Progress"}
                </h2>

                <p>
                  Record your latest fitness
                  measurements.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            <form
              className="progress-form"
              onSubmit={handleSubmit}
            >
              <div className="progress-form-grid">
                <label>
                  Date

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Weight (kg)

                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 78"
                    required
                  />
                </label>

                <label>
                  Chest (cm)

                  <input
                    type="number"
                    step="0.1"
                    name="chest"
                    value={formData.chest}
                    onChange={handleChange}
                    placeholder="e.g. 98"
                  />
                </label>

                <label>
                  Waist (cm)

                  <input
                    type="number"
                    step="0.1"
                    name="waist"
                    value={formData.waist}
                    onChange={handleChange}
                    placeholder="e.g. 86"
                  />
                </label>

                <label>
                  Arms (cm)

                  <input
                    type="number"
                    step="0.1"
                    name="arms"
                    value={formData.arms}
                    onChange={handleChange}
                    placeholder="e.g. 34"
                  />
                </label>

                <label>
                  Strength Score

                  <input
                    type="number"
                    name="strength"
                    min="0"
                    max="100"
                    value={formData.strength}
                    onChange={handleChange}
                    placeholder="0 - 100"
                  />
                </label>
              </div>

              <label>
                Notes

                <textarea
                  name="notes"
                  rows="4"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add notes about your progress..."
                />
              </label>

              <div className="progress-form-actions">
                <button
                  type="button"
                  className="progress-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="progress-submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Progress"
                    : "Save Progress"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Progress;