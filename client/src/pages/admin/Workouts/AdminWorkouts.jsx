import { useEffect, useState } from "react";
import {
  FaDumbbell,
  FaCheckCircle,
  FaClock,
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

import "./AdminWorkouts.css";

function AdminWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    completedWorkouts: 0,
    inProgressWorkouts: 0,
    activeUsers: 0,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const [editForm, setEditForm] = useState({
    workoutName: "",
    category: "Strength",
    date: "",
    duration: "",
    caloriesBurned: "",
    notes: "",
  });

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (category) {
        params.append("category", category);
      }

      const query = params.toString();

      const response = await authRequest(
        `/admin/workouts${query ? `?${query}` : ""}`,
      );

      if (response.success) {
        setWorkouts(response.workouts || []);
      } else {
        setError(response.message || "Failed to load workouts");
      }
    } catch (error) {
      console.error("Load admin workouts error:", error);
      setError(error.message || "Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authRequest("/admin/workouts/stats");

      if (response.success) {
        setStats(
          response.stats || {
            totalWorkouts: 0,
            completedWorkouts: 0,
            inProgressWorkouts: 0,
            activeUsers: 0,
          },
        );
      }
    } catch (error) {
      console.error("Load workout stats error:", error);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [search, category]);

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

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatDuration = (duration) => {
    if (!duration) {
      return "—";
    }

    return `${duration} min`;
  };

  const getUserName = (workout) => {
    if (workout?.user?.name) {
      return workout.user.name;
    }

    if (workout?.user?.email) {
      return workout.user.email;
    }

    return "Unknown User";
  };

  const getDifficulty = (workout) => {
    if (workout?.difficulty) {
      return workout.difficulty;
    }

    return "—";
  };

  const getStatus = (workout) => {
    if (workout?.status) {
      return workout.status;
    }

    return "Completed";
  };

  const filteredWorkouts = workouts.filter((workout) => {
    const workoutDifficulty = getDifficulty(workout);
    const workoutStatus = getStatus(workout);

    const matchesDifficulty = !difficulty || workoutDifficulty === difficulty;

    const matchesStatus = !status || workoutStatus === status;

    return matchesDifficulty && matchesStatus;
  });

  const completedCount = filteredWorkouts.filter(
    (workout) => getStatus(workout) === "Completed",
  ).length;

  const inProgressCount = filteredWorkouts.filter(
    (workout) => getStatus(workout) === "In Progress",
  ).length;

  const viewWorkout = async (workout) => {
    try {
      setActionLoading(true);

      const response = await authRequest(`/admin/workouts/${workout._id}`);

      if (!response.success) {
        window.alert(response.message || "Failed to load workout details.");
        return;
      }

      const data = response.workout;

      const exercisesText =
        data.exercises && data.exercises.length > 0
          ? data.exercises
              .map((exercise, index) => {
                return `${index + 1}. ${exercise.name || "Exercise"} | Sets: ${
                  exercise.sets ?? "—"
                } | Reps: ${exercise.reps ?? "—"} | Weight: ${
                  exercise.weight ?? "—"
                }`;
              })
              .join("\n")
          : "No exercises added.";

      window.alert(
        `Workout Details\n\n` +
          `Workout: ${data.workoutName || "—"}\n` +
          `User: ${getUserName(data)}\n` +
          `Category: ${data.category || "—"}\n` +
          `Date: ${formatDate(data.date)}\n` +
          `Duration: ${formatDuration(data.duration)}\n` +
          `Calories Burned: ${data.caloriesBurned ?? 0}\n\n` +
          `Exercises:\n${exercisesText}\n\n` +
          `Notes: ${data.notes || "No notes."}`,
      );
    } catch (error) {
      console.error("View workout error:", error);

      window.alert(error.message || "Failed to load workout details.");
    } finally {
      setActionLoading(false);
    }
  };

  const editWorkout = async (workout) => {
    try {
      setActionLoading(true);

      const response = await authRequest(`/admin/workouts/${workout._id}`);

      if (!response.success) {
        window.alert(response.message || "Failed to load workout.");
        return;
      }

      const data = response.workout;

      setSelectedWorkout(data);

      setEditForm({
        workoutName: data.workoutName || "",
        category: data.category || "Strength",
        date: formatDateForInput(data.date),
        duration: data.duration ?? "",
        caloriesBurned: data.caloriesBurned ?? "",
        notes: data.notes || "",
      });

      setShowEditModal(true);
    } catch (error) {
      console.error("Edit workout load error:", error);

      window.alert(error.message || "Failed to load workout.");
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

  const saveEditedWorkout = async (event) => {
    event.preventDefault();

    if (!selectedWorkout?._id) {
      return;
    }

    if (!editForm.workoutName.trim()) {
      window.alert("Workout name is required.");
      return;
    }

    if (!editForm.category) {
      window.alert("Workout category is required.");
      return;
    }

    try {
      setActionLoading(true);

      const response = await authRequest(
        `/admin/workouts/${selectedWorkout._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            workoutName: editForm.workoutName.trim(),
            category: editForm.category,
            date: editForm.date || null,
            duration: Number(editForm.duration) || 0,
            caloriesBurned: Number(editForm.caloriesBurned) || 0,
            notes: editForm.notes.trim(),
          }),
        },
      );

      if (!response.success) {
        window.alert(response.message || "Failed to update workout.");
        return;
      }

      window.alert("Workout updated successfully.");

      closeEditModal();

      await loadWorkouts();
      await loadStats();
    } catch (error) {
      console.error("Save workout error:", error);

      window.alert(error.message || "Failed to update workout.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedWorkout(null);

    setEditForm({
      workoutName: "",
      category: "Strength",
      date: "",
      duration: "",
      caloriesBurned: "",
      notes: "",
    });
  };

  const deleteWorkout = async (workout) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${workout.workoutName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await authRequest(`/admin/workouts/${workout._id}`, {
        method: "DELETE",
      });

      if (!response.success) {
        window.alert(response.message || "Failed to delete workout.");
        return;
      }

      setWorkouts((previous) =>
        previous.filter((item) => item._id !== workout._id),
      );

      await loadStats();

      window.alert("Workout deleted successfully.");
    } catch (error) {
      console.error("Delete workout error:", error);

      window.alert(error.message || "Failed to delete workout.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-workouts-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">FITNESS MANAGEMENT</span>

          <h1>Workouts</h1>

          <p>Monitor and manage workouts created by FitTrack users.</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FaDumbbell />
          </div>

          <div>
            <span>Total Workouts</span>
            <strong>{stats.totalWorkouts ?? workouts.length}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FaCheckCircle />
          </div>

          <div>
            <span>Completed</span>
            <strong>{stats.completedWorkouts ?? completedCount}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FaClock />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{stats.inProgressWorkouts ?? inProgressCount}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FaUsers />
          </div>

          <div>
            <span>Active Users</span>
            <strong>{stats.activeUsers ?? 0}</strong>
          </div>
        </div>
      </div>

      <div className="admin-workouts-filters">
        <div className="admin-workout-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Search workouts or users..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="admin-workout-filter">
          <FaFilter />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Strength">Strength</option>
            <option value="Cardio">Cardio</option>
            <option value="HIIT">HIIT</option>
            <option value="Flexibility">Flexibility</option>
            <option value="Core">Core</option>
          </select>
        </div>

        <div className="admin-workout-filter">
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="admin-workout-filter">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>
      </div>

      {error && <div className="admin-error-message">{error}</div>}

      <div className="admin-workouts-card">
        <div className="admin-workouts-card-header">
          <div>
            <h2>Workout Records</h2>

            <p>
              {filteredWorkouts.length} workout
              {filteredWorkouts.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="admin-workouts-loading">Loading workouts...</div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="admin-workouts-empty">
            <FaDumbbell />

            <h3>No workouts found</h3>

            <p>No workout records match the selected filters.</p>
          </div>
        ) : (
          <div className="admin-workouts-table-wrapper">
            <table className="admin-workouts-table">
              <thead>
                <tr>
                  <th>Workout</th>
                  <th>User</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Duration</th>
                  <th>Exercises</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredWorkouts.map((workout) => (
                  <tr key={workout._id}>
                    <td>
                      <div className="admin-workout-name-cell">
                        <div className="admin-workout-icon">
                          <FaDumbbell />
                        </div>

                        <div>
                          <strong>
                            {workout.workoutName || "Untitled Workout"}
                          </strong>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="admin-workout-user">
                        {getUserName(workout)}
                      </span>
                    </td>

                    <td>
                      <span className="admin-workout-category">
                        {workout.category || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="admin-workout-difficulty">
                        {getDifficulty(workout)}
                      </span>
                    </td>

                    <td>{formatDuration(workout.duration)}</td>

                    <td>{workout.exercises?.length || 0}</td>

                    <td>{formatDate(workout.date)}</td>

                    <td>
                      <span
                        className={`admin-workout-status ${getStatus(workout)
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {getStatus(workout)}
                      </span>
                    </td>

                    <td>
                      <div className="admin-workout-actions">
                        <button
                          type="button"
                          className="admin-action-btn view"
                          title="View Workout"
                          onClick={() => viewWorkout(workout)}
                          disabled={actionLoading}
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="admin-action-btn edit"
                          title="Edit Workout"
                          onClick={() => editWorkout(workout)}
                          disabled={actionLoading}
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          className="admin-action-btn delete"
                          title="Delete Workout"
                          onClick={() => deleteWorkout(workout)}
                          disabled={actionLoading}
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

      {showEditModal && (
        <div className="admin-workout-modal-overlay" onClick={closeEditModal}>
          <div
            className="admin-workout-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-workout-modal-header">
              <div>
                <span className="modal-eyebrow">WORKOUT MANAGEMENT</span>

                <h2>Edit Workout</h2>

                <p>Update the workout information below.</p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeEditModal}
                disabled={actionLoading}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={saveEditedWorkout}>
              <div className="admin-workout-form-grid">
                <div className="admin-workout-form-group full-width">
                  <label htmlFor="workoutName">Workout Name</label>

                  <input
                    id="workoutName"
                    name="workoutName"
                    type="text"
                    value={editForm.workoutName}
                    onChange={handleEditChange}
                    placeholder="Enter workout name"
                    required
                  />
                </div>

                <div className="admin-workout-form-group">
                  <label htmlFor="category">Category</label>

                  <select
                    id="category"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="Strength">Strength</option>

                    <option value="Cardio">Cardio</option>

                    <option value="HIIT">HIIT</option>

                    <option value="Flexibility">Flexibility</option>

                    <option value="Core">Core</option>
                  </select>
                </div>

                <div className="admin-workout-form-group">
                  <label htmlFor="date">Workout Date</label>

                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="admin-workout-form-group">
                  <label htmlFor="duration">Duration (Minutes)</label>

                  <input
                    id="duration"
                    name="duration"
                    type="number"
                    min="0"
                    value={editForm.duration}
                    onChange={handleEditChange}
                    placeholder="60"
                  />
                </div>

                <div className="admin-workout-form-group">
                  <label htmlFor="caloriesBurned">Calories Burned</label>

                  <input
                    id="caloriesBurned"
                    name="caloriesBurned"
                    type="number"
                    min="0"
                    value={editForm.caloriesBurned}
                    onChange={handleEditChange}
                    placeholder="350"
                  />
                </div>

                <div className="admin-workout-form-group full-width">
                  <label htmlFor="notes">Notes</label>

                  <textarea
                    id="notes"
                    name="notes"
                    rows="4"
                    value={editForm.notes}
                    onChange={handleEditChange}
                    placeholder="Add workout notes..."
                  ></textarea>
                </div>
              </div>

              <div className="admin-workout-modal-footer">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closeEditModal}
                  disabled={actionLoading}
                >
                  <FaTimes />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-save-btn"
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

export default AdminWorkouts;
