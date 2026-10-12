import { useEffect, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaDumbbell,
  FaTimes,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";
import "./Workouts.css";

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const emptyForm = {
    name: "",
    category: "Strength",
    date: "",
    duration: "",
    exercises: "",
    sets: "",
    reps: "",
    weight: "",
    notes: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // =========================================================
  // LOAD WORKOUTS
  // =========================================================

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authRequest("/workouts");

      console.log("WORKOUTS RESPONSE:", response);

      const backendWorkouts = Array.isArray(response?.workouts)
        ? response.workouts
        : [];

      setWorkouts(backendWorkouts);
    } catch (error) {
      console.error("LOAD WORKOUTS ERROR:", error);

      setError(
        error.message || "Unable to load workouts."
      );

      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================================
  // SAVE / UPDATE WORKOUT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.date || !formData.category) {
      setError(
        "Date, workout name and category are required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Backend expects exercises as an array
      const exercises = formData.exercises.trim()
        ? [
            {
              name: formData.exercises.trim(),
              sets: Number(formData.sets) || 0,
              reps: Number(formData.reps) || 0,
              weight: Number(formData.weight) || 0,
              notes: formData.notes.trim(),
            },
          ]
        : [];

      // IMPORTANT:
      // Backend expects workoutName, NOT name
      const workoutData = {
        workoutName: formData.name.trim(),
        category: formData.category.trim(),
        date: formData.date,
        duration: Number(formData.duration) || 0,
        caloriesBurned: 0,
        exercises,
        notes: formData.notes.trim(),
      };

      console.log(
        "WORKOUT DATA BEING SENT:",
        workoutData
      );

      let response;

      // ================= UPDATE =================

      if (editingId) {
        response = await authRequest(
          `/workouts/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(workoutData),
          }
        );

        console.log(
          "WORKOUT UPDATE RESPONSE:",
          response
        );
      }

      // ================= CREATE =================

      else {
        response = await authRequest(
          "/workouts",
          {
            method: "POST",
            body: JSON.stringify(workoutData),
          }
        );

        console.log(
          "WORKOUT CREATE RESPONSE:",
          response
        );
      }

      await loadWorkouts();

      // Dashboard update signal
      window.dispatchEvent(
        new Event("fittrackWorkoutsUpdated")
      );

      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error(
        "SAVE WORKOUT ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to save workout."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (workout) => {
    const firstExercise =
      Array.isArray(workout.exercises) &&
      workout.exercises.length > 0
        ? workout.exercises[0]
        : {};

    setFormData({
      name: workout.workoutName || "",

      category:
        workout.category || "Strength",

      date: workout.date
        ? workout.date.substring(0, 10)
        : "",

      duration:
        workout.duration ?? "",

      exercises:
        firstExercise.name || "",

      sets:
        firstExercise.sets ?? "",

      reps:
        firstExercise.reps ?? "",

      weight:
        firstExercise.weight ?? "",

      notes:
        workout.notes ||
        firstExercise.notes ||
        "",
    });

    setEditingId(
      workout._id || workout.id
    );

    setShowForm(true);
    setError("");
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workout?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await authRequest(
        `/workouts/${id}`,
        {
          method: "DELETE",
        }
      );

      await loadWorkouts();

      // Dashboard update signal
      window.dispatchEvent(
        new Event("fittrackWorkoutsUpdated")
      );
    } catch (error) {
      console.error(
        "DELETE WORKOUT ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to delete workout."
      );
    }
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredWorkouts = workouts.filter(
    (workout) => {
      const workoutName =
        workout?.workoutName || "";

      const matchesSearch =
        workoutName
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =
        category === "All" ||
        workout?.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  // =========================================================
  // STATS
  // =========================================================

  const totalWorkouts =
    workouts.length;

  const strengthWorkouts =
    workouts.filter(
      (item) =>
        item?.category === "Strength"
    ).length;

  const cardioWorkouts =
    workouts.filter(
      (item) =>
        item?.category === "Cardio"
    ).length;

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const openAddForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  return (
    <div className="workouts-page">

      {/* ================= HEADER ================= */}

      <div className="workouts-header">

        <div>
          <h1>Workouts</h1>

          <p>
            Track and manage your fitness workouts.
          </p>
        </div>

        <button
          type="button"
          className="add-workout-button"
          onClick={openAddForm}
        >
          <FaPlus />
          Add Workout
        </button>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "#fff1f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* ================= STATS ================= */}

      <div className="workout-stats">

        <div className="workout-stat-card">

          <div className="workout-stat-icon">
            <FaDumbbell />
          </div>

          <div>
            <span>
              Total Workouts
            </span>

            <strong>
              {totalWorkouts}
            </strong>
          </div>

        </div>

        <div className="workout-stat-card">

          <div className="workout-stat-icon">
            <FaDumbbell />
          </div>

          <div>
            <span>
              Strength
            </span>

            <strong>
              {strengthWorkouts}
            </strong>
          </div>

        </div>

        <div className="workout-stat-card">

          <div className="workout-stat-icon">
            <FaDumbbell />
          </div>

          <div>
            <span>
              Cardio
            </span>

            <strong>
              {cardioWorkouts}
            </strong>
          </div>

        </div>

      </div>

      {/* ================= SEARCH & FILTER ================= */}

      <div className="workout-toolbar">

        <div className="workout-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search workouts..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="workout-filter"
        >
          <option value="All">
            All Categories
          </option>

          <option value="Strength">
            Strength
          </option>

          <option value="Cardio">
            Cardio
          </option>

          <option value="Flexibility">
            Flexibility
          </option>

          <option value="HIIT">
            HIIT
          </option>

          <option value="Sports">
            Sports
          </option>

        </select>

      </div>

      {/* ================= ADD / EDIT FORM ================= */}

      {showForm && (
        <div className="workout-form-card">

          <div className="workout-form-header">

            <div>

              <h3>
                {editingId
                  ? "Edit Workout"
                  : "Add New Workout"}
              </h3>

              <p>
                Enter your workout details below.
              </p>

            </div>

            <button
              type="button"
              className="close-workout-form"
              onClick={handleCancel}
              disabled={saving}
            >
              <FaTimes />
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="workout-form-grid">

              <div className="workout-field">

                <label>
                  Workout Name *
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Chest & Triceps"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="workout-field">

                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >

                  <option value="Strength">
                    Strength
                  </option>

                  <option value="Cardio">
                    Cardio
                  </option>

                  <option value="Flexibility">
                    Flexibility
                  </option>

                  <option value="HIIT">
                    HIIT
                  </option>

                  <option value="Sports">
                    Sports
                  </option>

                </select>

              </div>

              <div className="workout-field">

                <label>
                  Date *
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="workout-field">

                <label>
                  Duration (minutes)
                </label>

                <input
                  type="number"
                  min="0"
                  name="duration"
                  placeholder="60"
                  value={formData.duration}
                  onChange={handleChange}
                />

              </div>

              <div className="workout-field">

                <label>
                  Exercise Name
                </label>

                <input
                  type="text"
                  name="exercises"
                  placeholder="e.g. Bench Press"
                  value={formData.exercises}
                  onChange={handleChange}
                />

              </div>

              <div className="workout-field">

                <label>
                  Sets
                </label>

                <input
                  type="number"
                  min="0"
                  name="sets"
                  placeholder="4"
                  value={formData.sets}
                  onChange={handleChange}
                />

              </div>

              <div className="workout-field">

                <label>
                  Reps
                </label>

                <input
                  type="number"
                  min="0"
                  name="reps"
                  placeholder="10"
                  value={formData.reps}
                  onChange={handleChange}
                />

              </div>

              <div className="workout-field">

                <label>
                  Weight (kg)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.5"
                  name="weight"
                  placeholder="50"
                  value={formData.weight}
                  onChange={handleChange}
                />

              </div>

              <div className="workout-field workout-notes-field">

                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  rows="3"
                  placeholder="Add workout notes..."
                  value={formData.notes}
                  onChange={handleChange}
                />

              </div>

            </div>

            <div className="workout-form-actions">

              <button
                type="button"
                className="workout-cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="workout-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Workout"
                  : "Save Workout"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* ================= WORKOUT HISTORY ================= */}

      <div className="workouts-card">

        <div className="workouts-card-header">

          <div>

            <h3>
              Workout History
            </h3>

            <p>
              Your recently recorded workouts.
            </p>

          </div>

          <span className="workout-count">
            {filteredWorkouts.length} Records
          </span>

        </div>

        {/* ================= LOADING ================= */}

        {loading ? (

          <div className="no-workouts">

            <div className="no-workouts-icon">
              <FaDumbbell />
            </div>

            <h4>
              Loading workouts...
            </h4>

            <p>
              Fetching your workouts from the server.
            </p>

          </div>

        ) : filteredWorkouts.length === 0 ? (

          <div className="no-workouts">

            <div className="no-workouts-icon">
              <FaDumbbell />
            </div>

            <h4>
              No workouts found
            </h4>

            <p>
              Start tracking your fitness by adding your
              first workout.
            </p>

            <button
              type="button"
              onClick={openAddForm}
            >
              <FaPlus />
              Add Workout
            </button>

          </div>

        ) : (

          <div className="workouts-table-wrapper">

            <table className="workouts-table">

              <thead>

                <tr>
                  <th>Workout</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Exercise</th>
                  <th>Sets × Reps</th>
                  <th>Weight</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredWorkouts.map(
                  (workout) => {

                    const workoutId =
                      workout._id ||
                      workout.id;

                    const firstExercise =
                      Array.isArray(workout.exercises) &&
                      workout.exercises.length > 0
                        ? workout.exercises[0]
                        : {};

                    return (
                      <tr
                        key={
                          workoutId ||
                          workout.createdAt
                        }
                      >

                        <td>
                          <strong>
                            {workout.workoutName ||
                              "Workout"}
                          </strong>
                        </td>

                        <td>

                          <span
                            className={`workout-category ${
                              (
                                workout.category ||
                                "Strength"
                              )
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  "-"
                                )
                            }`}
                          >
                            {workout.category ||
                              "Strength"}
                          </span>

                        </td>

                        <td>
                          {workout.date
                            ? new Date(
                                workout.date
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          {firstExercise.name ||
                            "-"}
                        </td>

                        <td>
                          {firstExercise.sets &&
                          firstExercise.reps
                            ? `${firstExercise.sets} × ${firstExercise.reps}`
                            : "-"}
                        </td>

                        <td>
                          {firstExercise.weight
                            ? `${firstExercise.weight} kg`
                            : "-"}
                        </td>

                        <td>
                          {workout.duration
                            ? `${workout.duration} min`
                            : "-"}
                        </td>

                        <td>

                          <div className="workout-actions">

                            <button
                              type="button"
                              className="workout-edit"
                              onClick={() =>
                                handleEdit(
                                  workout
                                )
                              }
                              title="Edit"
                            >
                              <FaEdit />
                            </button>

                            <button
                              type="button"
                              className="workout-delete"
                              onClick={() =>
                                handleDelete(
                                  workoutId
                                )
                              }
                              title="Delete"
                            >
                              <FaTrash />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Workouts;

