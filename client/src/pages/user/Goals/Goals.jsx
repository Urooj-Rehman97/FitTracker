import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaBullseye,
  FaTimes,
  FaCalendarAlt,
  FaTrophy,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./Goals.css";

function Goals() {
  const emptyForm = {
    title: "",
    category: "Weight",
    target: "",
    current: "",
    unit: "kg",
    deadline: "",
    description: "",
  };

  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ================= LOAD GOALS =================

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authRequest("/goals");

      console.log("GOALS DATA RESPONSE:", response);

      setGoals(
        Array.isArray(response.goals)
          ? response.goals
          : []
      );
    } catch (error) {
      console.error("Failed to load goals:", error);

      setError(
        error.message || "Failed to load goals."
      );

      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();

    const handleGoalsUpdated = () => {
      loadGoals();
    };

    window.addEventListener(
      "fittrackGoalsUpdated",
      handleGoalsUpdated
    );

    return () => {
      window.removeEventListener(
        "fittrackGoalsUpdated",
        handleGoalsUpdated
      );
    };
  }, []);

  // ================= FORM =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= PROGRESS =================

  const calculateProgress = (
    startValue,
    currentValue,
    targetValue
  ) => {
    const start = Number(startValue);
    const current = Number(currentValue);
    const target = Number(targetValue);

    if (
      Number.isNaN(start) ||
      Number.isNaN(current) ||
      Number.isNaN(target)
    ) {
      return 0;
    }

    // Invalid target
    if (start === target) {
      return current === target ? 100 : 0;
    }

    // ================= DECREASING GOAL =================
    // Example:
    // Start = 78
    // Target = 70
    //
    // Current 78 = 0%
    // Current 76 = 25%
    // Current 74 = 50%
    // Current 72 = 75%
    // Current 70 = 100%

    if (target < start) {
      const totalDistance = start - target;
      const completedDistance = start - current;

      const progress =
        (completedDistance / totalDistance) * 100;

      return Math.min(
        100,
        Math.max(0, progress)
      );
    }

    // ================= INCREASING GOAL =================
    // Example:
    // Start = 50
    // Target = 100
    //
    // Current 50 = 0%
    // Current 75 = 50%
    // Current 100 = 100%

    if (target > start) {
      const totalDistance = target - start;
      const completedDistance = current - start;

      const progress =
        (completedDistance / totalDistance) * 100;

      return Math.min(
        100,
        Math.max(0, progress)
      );
    }

    return 0;
  };

  const getGoalProgress = (goal) => {
    /*
      startValue backend mein permanently saved hai.

      Old goals mein agar startValue nahi hai,
      to hum current ko fallback kar rahe hain.
      Aise old goals ko recreate karna hoga
      taake proper starting value save ho.
    */

    const startValue =
      goal.startValue !== undefined &&
      goal.startValue !== null
        ? goal.startValue
        : goal.current;

    return calculateProgress(
      startValue,
      goal.current,
      goal.target
    );
  };

  // ================= SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      formData.target === "" ||
      formData.current === "" ||
      !formData.deadline
    ) {
      setError(
        "Please fill all required goal fields."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      const numericTarget = Number(
        formData.target
      );

      const numericCurrent = Number(
        formData.current
      );

      if (
        Number.isNaN(numericTarget) ||
        Number.isNaN(numericCurrent)
      ) {
        setError(
          "Target and current values must be valid numbers."
        );

        return;
      }

      const goalData = {
        title: formData.title.trim(),
        category: formData.category,

        /*
          On CREATE:
          current value becomes the starting value.

          On UPDATE:
          startValue is NOT sent because backend
          must preserve the original start value.
        */
        target: numericTarget,
        current: numericCurrent,

        unit: formData.unit,
        deadline: formData.deadline,
        description: formData.description.trim(),
      };

      if (!editingId) {
        goalData.startValue = numericCurrent;
      }

      console.log(
        "GOAL DATA BEING SENT:",
        goalData
      );

      let response;

      // ================= UPDATE =================

      if (editingId) {
        response = await authRequest(
          `/goals/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(goalData),
          }
        );

        console.log(
          "GOAL UPDATE RESPONSE:",
          response
        );

        if (response.goal) {
          setGoals((prev) =>
            prev.map((goal) =>
              goal._id === editingId
                ? response.goal
                : goal
            )
          );
        }
      }

      // ================= CREATE =================

      else {
        response = await authRequest(
          "/goals",
          {
            method: "POST",
            body: JSON.stringify(goalData),
          }
        );

        console.log(
          "GOAL CREATE RESPONSE:",
          response
        );

        if (response.goal) {
          setGoals((prev) => [
            response.goal,
            ...prev,
          ]);
        }
      }

      window.dispatchEvent(
        new Event("fittrackGoalsUpdated")
      );

      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error(
        "Failed to save goal:",
        error
      );

      setError(
        error.message ||
          "Failed to save goal."
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= EDIT =================

  const handleEdit = (goal) => {
    setFormData({
      title: goal.title || "",

      category:
        goal.category || "Weight",

      target:
        goal.target !== undefined
          ? String(goal.target)
          : "",

      current:
        goal.current !== undefined
          ? String(goal.current)
          : "",

      unit: goal.unit || "kg",

      deadline: goal.deadline
        ? goal.deadline.split("T")[0]
        : "",

      description:
        goal.description || "",
    });

    setEditingId(goal._id);
    setShowForm(true);
    setError("");
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this goal?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response =
        await authRequest(
          `/goals/${id}`,
          {
            method: "DELETE",
          }
        );

      console.log(
        "GOAL DELETE RESPONSE:",
        response
      );

      setGoals((prev) =>
        prev.filter(
          (goal) => goal._id !== id
        )
      );

      window.dispatchEvent(
        new Event("fittrackGoalsUpdated")
      );
    } catch (error) {
      console.error(
        "Failed to delete goal:",
        error
      );

      setError(
        error.message ||
          "Failed to delete goal."
      );
    }
  };

  // ================= CANCEL =================

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  // ================= FILTER =================

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesSearch = (
        goal.title || ""
      )
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

      const matchesCategory =
        categoryFilter === "All" ||
        goal.category ===
          categoryFilter;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    goals,
    search,
    categoryFilter,
  ]);

  // ================= STATS =================

  const totalGoals = goals.length;

  const completedGoals =
    goals.filter(
      (goal) =>
        getGoalProgress(goal) >= 100
    ).length;

  const activeGoals =
    totalGoals - completedGoals;

  const averageProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce(
            (total, goal) =>
              total +
              getGoalProgress(goal),
            0
          ) / goals.length
        )
      : 0;

  // ================= PROGRESS CLASS =================

  const getProgressClass = (
    progress
  ) => {
    if (progress >= 100) {
      return "completed";
    }

    if (progress >= 70) {
      return "high";
    }

    if (progress >= 40) {
      return "medium";
    }

    return "low";
  };

  // ================= DEADLINE =================

  const getDeadlineStatus = (
    deadline,
    progress
  ) => {
    if (progress >= 100) {
      return "Completed";
    }

    if (!deadline) {
      return "No deadline";
    }

    const today = new Date();
    const deadlineDate =
      new Date(deadline);

    today.setHours(0, 0, 0, 0);

    deadlineDate.setHours(
      0,
      0,
      0,
      0
    );

    const difference =
      deadlineDate.getTime() -
      today.getTime();

    const daysLeft = Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) {
      return "Overdue";
    }

    if (daysLeft === 0) {
      return "Due Today";
    }

    return `${daysLeft} days left`;
  };

  // ================= DATE =================

  const formatDate = (date) => {
    if (!date) {
      return "Not provided";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  return (
    <div className="goals-page">

      {/* ================= HEADER ================= */}

      <div className="goals-header">

        <div>
          <h1>Goals</h1>

          <p>
            Set fitness goals and
            track your progress.
          </p>
        </div>

        <button
          type="button"
          className="add-goal-button"
          onClick={() => {
            setFormData(emptyForm);
            setEditingId(null);
            setError("");
            setShowForm(true);
          }}
        >
          <FaPlus />
          Add Goal
        </button>

      </div>

      {/* ================= ERROR ================= */}

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

      {/* ================= STATS ================= */}

      <div className="goals-stats">

        <div className="goal-stat-card">

          <div className="goal-stat-icon">
            <FaBullseye />
          </div>

          <div>
            <span>Total Goals</span>

            <strong>
              {totalGoals}
            </strong>
          </div>

        </div>

        <div className="goal-stat-card">

          <div className="goal-stat-icon">
            <FaTrophy />
          </div>

          <div>
            <span>Completed</span>

            <strong>
              {completedGoals}
            </strong>
          </div>

        </div>

        <div className="goal-stat-card">

          <div className="goal-stat-icon">
            <FaBullseye />
          </div>

          <div>
            <span>Active Goals</span>

            <strong>
              {activeGoals}
            </strong>
          </div>

        </div>

        <div className="goal-stat-card">

          <div className="goal-stat-icon">
            <FaTrophy />
          </div>

          <div>
            <span>Average Progress</span>

            <strong>
              {averageProgress}%
            </strong>
          </div>

        </div>

      </div>

      {/* ================= TOOLBAR ================= */}

      <div className="goals-toolbar">

        <div className="goals-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search goals..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        <select
          className="goals-filter"
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(
              e.target.value
            )
          }
        >
          <option value="All">
            All Categories
          </option>

          <option value="Weight">
            Weight
          </option>

          <option value="Strength">
            Strength
          </option>

          <option value="Cardio">
            Cardio
          </option>

          <option value="Nutrition">
            Nutrition
          </option>

          <option value="Body Measurement">
            Body Measurement
          </option>

          <option value="Other">
            Other
          </option>
        </select>

      </div>

      {/* ================= FORM ================= */}

      {showForm && (
        <div className="goal-form-card">

          <div className="goal-form-header">

            <div>

              <h3>
                {editingId
                  ? "Edit Goal"
                  : "Create New Goal"}
              </h3>

              <p>
                Define your target and
                track your progress.
              </p>

            </div>

            <button
              type="button"
              className="close-goal-form"
              onClick={handleCancel}
              disabled={saving}
            >
              <FaTimes />
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="goal-form-grid">

              <div className="goal-field">

                <label>
                  Goal Title *
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Lose 8 kg"
                  value={
                    formData.title
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              <div className="goal-field">

                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="Weight">
                    Weight
                  </option>

                  <option value="Strength">
                    Strength
                  </option>

                  <option value="Cardio">
                    Cardio
                  </option>

                  <option value="Nutrition">
                    Nutrition
                  </option>

                  <option value="Body Measurement">
                    Body Measurement
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>

              <div className="goal-field">

                <label>
                  Target Value *
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  name="target"
                  placeholder="e.g. 70"
                  value={
                    formData.target
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              <div className="goal-field">

                <label>
                  Current Progress *
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  name="current"
                  placeholder="e.g. 78"
                  value={
                    formData.current
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              <div className="goal-field">

                <label>
                  Unit
                </label>

                <select
                  name="unit"
                  value={
                    formData.unit
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="kg">
                    kg
                  </option>

                  <option value="lbs">
                    lbs
                  </option>

                  <option value="cm">
                    cm
                  </option>

                  <option value="reps">
                    reps
                  </option>

                  <option value="min">
                    minutes
                  </option>

                  <option value="km">
                    km
                  </option>

                  <option value="cal">
                    kcal
                  </option>

                  <option value="%">
                    %
                  </option>
                </select>

              </div>

              <div className="goal-field">

                <label>
                  Deadline *
                </label>

                <input
                  type="date"
                  name="deadline"
                  value={
                    formData.deadline
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              <div className="goal-field goal-description-field">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  rows="3"
                  placeholder="Add some details about this goal..."
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

            <div className="goal-form-actions">

              <button
                type="button"
                className="goal-cancel-button"
                onClick={
                  handleCancel
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="goal-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Goal"
                  : "Create Goal"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* ================= GOALS ================= */}

      <div className="goals-card">

        <div className="goals-card-header">

          <div>

            <h3>
              My Goals
            </h3>

            <p>
              Track your current
              fitness targets.
            </p>

          </div>

          <span className="goal-count">
            {filteredGoals.length}{" "}
            {filteredGoals.length === 1
              ? "Goal"
              : "Goals"}
          </span>

        </div>

        {/* ================= LOADING ================= */}

        {loading ? (

          <div className="no-goals">

            <div className="no-goals-icon">
              <FaBullseye />
            </div>

            <h4>
              Loading goals...
            </h4>

            <p>
              Please wait while we
              load your goals.
            </p>

          </div>

        ) : filteredGoals.length === 0 ? (

          <div className="no-goals">

            <div className="no-goals-icon">
              <FaBullseye />
            </div>

            <h4>
              No goals found
            </h4>

            <p>
              Create your first
              fitness goal and start
              tracking your progress.
            </p>

            <button
              type="button"
              onClick={() => {
                setFormData(emptyForm);
                setEditingId(null);
                setError("");
                setShowForm(true);
              }}
            >
              <FaPlus />
              Create Goal
            </button>

          </div>

        ) : (

          <div className="goals-list">

            {filteredGoals.map(
              (goal) => {

                const progress =
                  getGoalProgress(goal);

                const progressValue =
                  Number(
                    progress.toFixed(0)
                  );

                const deadlineStatus =
                  getDeadlineStatus(
                    goal.deadline,
                    progressValue
                  );

                return (
                  <div
                    className="goal-item"
                    key={goal._id}
                  >

                    <div className="goal-item-top">

                      <div className="goal-main-info">

                        <div className="goal-icon">
                          <FaBullseye />
                        </div>

                        <div>

                          <h4>
                            {goal.title}
                          </h4>

                          <span className="goal-category">
                            {
                              goal.category
                            }
                          </span>

                        </div>

                      </div>

                      <div className="goal-actions">

                        <button
                          type="button"
                          className="goal-edit"
                          onClick={() =>
                            handleEdit(
                              goal
                            )
                          }
                          title="Edit Goal"
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          className="goal-delete"
                          onClick={() =>
                            handleDelete(
                              goal._id
                            )
                          }
                          title="Delete Goal"
                        >
                          <FaTrash />
                        </button>

                      </div>

                    </div>

                    <div className="goal-values">

                      <div>

                        <span>
                          Current
                        </span>

                        <strong>
                          {
                            goal.current
                          }{" "}
                          {
                            goal.unit
                          }
                        </strong>

                      </div>

                      <div>

                        <span>
                          Target
                        </span>

                        <strong>
                          {
                            goal.target
                          }{" "}
                          {
                            goal.unit
                          }
                        </strong>

                      </div>

                      <div>

                        <span>
                          Deadline
                        </span>

                        <strong>
                          <FaCalendarAlt />

                          {
                            formatDate(
                              goal.deadline
                            )
                          }
                        </strong>

                      </div>

                    </div>

                    <div className="goal-progress-section">

                      <div className="goal-progress-header">

                        <span>
                          Progress
                        </span>

                        <strong>
                          {
                            progressValue
                          }%
                        </strong>

                      </div>

                      <div className="goal-progress-bar">

                        <div
                          className={`goal-progress-fill ${getProgressClass(
                            progressValue
                          )}`}
                          style={{
                            width: `${progressValue}%`,
                          }}
                        />

                      </div>

                      <div className="goal-progress-footer">

                        <span>
                          {
                            goal.description ||
                            "Keep working towards your goal!"
                          }
                        </span>

                        <span
                          className={`deadline-status ${
                            progressValue >=
                            100
                              ? "completed"
                              : deadlineStatus ===
                                "Overdue"
                              ? "overdue"
                              : ""
                          }`}
                        >
                          {
                            progressValue >=
                            100
                              ? "Completed"
                              : deadlineStatus
                          }
                        </span>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Goals;