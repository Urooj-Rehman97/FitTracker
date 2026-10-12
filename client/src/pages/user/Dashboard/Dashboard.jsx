import { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  ProgressBar,
  Button,
} from "react-bootstrap";

import {
  FaFire,
  FaDumbbell,
  FaClock,
  FaWeight,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaRunning,
  FaCheckCircle,
  FaUtensils,
  FaTint,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import {
  authRequest,
  getCurrentUser,
} from "../../../services/api";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [progressRecords, setProgressRecords] = useState([]);
  const [goals, setGoals] = useState([]);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD DASHBOARD FROM BACKEND
  // =========================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // =====================================================
      // GET CURRENT AUTHENTICATION TOKEN
      // =====================================================
      // Login normally stores the token in sessionStorage.
      // Remember Me may also store it in localStorage.
      // Always prefer the current session token.
      const token =
        sessionStorage.getItem(
          "fittrackToken"
        ) ||
        localStorage.getItem(
          "fittrackToken"
        );

      // If token does not exist, go to login
      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      // Get dashboard data and current logged-in user
      // at the same time
      const [
        response,
        currentUserResponse,
      ] = await Promise.all([
        authRequest("/dashboard"),
        getCurrentUser(token),
      ]);

      console.log(
        "DASHBOARD RESPONSE:",
        response
      );

      console.log(
        "CURRENT USER RESPONSE:",
        currentUserResponse
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to load dashboard"
        );
      }

      if (!currentUserResponse?.success) {
        throw new Error(
          currentUserResponse?.message ||
            "Failed to load current user"
        );
      }

      setDashboardData(response);

      // =====================================================
      // CURRENT USER DATA
      // =====================================================

      const currentUser =
        currentUserResponse.user;

      setUser({
        name:
          currentUser?.name || "User",

        photo:
          currentUser?.profilePhoto || "",
      });

      // Keep latest user data synchronized
      // in sessionStorage.
      sessionStorage.setItem(
        "fittrackUser",
        JSON.stringify(currentUser)
      );

      // Keep localStorage synchronized only
      // when Remember Me data already exists there.
      if (
        localStorage.getItem(
          "fittrackToken"
        )
      ) {
        localStorage.setItem(
          "fittrackUser",
          JSON.stringify(currentUser)
        );
      }

      // =====================================================
      // BACKEND DATA
      // =====================================================

      setWorkouts(
        Array.isArray(
          response.recentWorkouts
        )
          ? response.recentWorkouts
          : []
      );

      setProgressRecords(
        Array.isArray(
          response.recentProgress
        )
          ? response.recentProgress
          : []
      );

      setGoals(
        Array.isArray(response.goals)
          ? response.goals
          : []
      );
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

      setUser(null);

      setError(
        error?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================================================
  // REFRESH WHEN DATA CHANGES
  // =========================================================

  useEffect(() => {
    const handleDataUpdate = () => {
      loadDashboard();
    };

    const handleFocus = () => {
      loadDashboard();
    };

    window.addEventListener(
      "fittrackWorkoutsUpdated",
      handleDataUpdate
    );

    window.addEventListener(
      "fittrackNutritionUpdated",
      handleDataUpdate
    );

    window.addEventListener(
      "fittrackProgressUpdated",
      handleDataUpdate
    );

    window.addEventListener(
      "fittrackGoalsUpdated",
      handleDataUpdate
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "fittrackWorkoutsUpdated",
        handleDataUpdate
      );

      window.removeEventListener(
        "fittrackNutritionUpdated",
        handleDataUpdate
      );

      window.removeEventListener(
        "fittrackProgressUpdated",
        handleDataUpdate
      );

      window.removeEventListener(
        "fittrackGoalsUpdated",
        handleDataUpdate
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const getWorkoutDate = (workout) => {
    return (
      workout?.date ||
      workout?.createdAt ||
      workout?.createdDate ||
      ""
    );
  };

  const getProgressDate = (record) => {
    return (
      record?.date ||
      record?.createdAt ||
      record?.createdDate ||
      ""
    );
  };

  const isValidDate = (date) => {
    if (!date) {
      return false;
    }

    const parsedDate = new Date(date);

    return !Number.isNaN(
      parsedDate.getTime()
    );
  };

  // =========================================================
  // WORKOUT SUMMARY
  // =========================================================

  const workoutSummary =
    dashboardData?.workoutSummary || {};

  const monthlyWorkoutCount =
    Number(
      workoutSummary.monthlyWorkoutCount
    ) || 0;

  const activeHours =
    Number(
      workoutSummary.activeHours
    ) || 0;

  const activeHoursPercentage =
    Math.min(
      (activeHours / 8) * 100,
      100
    );

  // =========================================================
  // LAST WORKOUT
  // =========================================================

  const lastWorkout = useMemo(() => {
    if (!workouts.length) {
      return null;
    }

    const sorted = [...workouts].sort(
      (a, b) => {
        const dateA = new Date(
          getWorkoutDate(a)
        ).getTime();

        const dateB = new Date(
          getWorkoutDate(b)
        ).getTime();

        return dateB - dateA;
      }
    );

    return sorted[0];
  }, [workouts]);

  const getLastWorkoutText = () => {
    if (!lastWorkout) {
      return "No workout";
    }

    const date =
      getWorkoutDate(lastWorkout);

    if (!isValidDate(date)) {
      return "Recently";
    }

    const workoutDate =
      new Date(date);

    const today = new Date();

    if (
      workoutDate.toDateString() ===
      today.toDateString()
    ) {
      return "Today";
    }

    const yesterday =
      new Date(today);

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    if (
      workoutDate.toDateString() ===
      yesterday.toDateString()
    ) {
      return "Yesterday";
    }

    return workoutDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  // =========================================================
  // RECENT WORKOUTS
  // =========================================================

  const recentWorkouts = useMemo(() => {
    return [...workouts]
      .sort((a, b) => {
        const dateA = new Date(
          getWorkoutDate(a)
        ).getTime();

        const dateB = new Date(
          getWorkoutDate(b)
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 3);
  }, [workouts]);

  // =========================================================
  // WEEKLY ACTIVITY
  // =========================================================

  const weeklyActivity = useMemo(() => {
    const backendActivity =
      dashboardData?.weeklyActivity;

    if (
      Array.isArray(backendActivity) &&
      backendActivity.length > 0
    ) {
      return backendActivity;
    }

    return [
      {
        day: "Mon",
        value: 0,
        minutes: 0,
      },
      {
        day: "Tue",
        value: 0,
        minutes: 0,
      },
      {
        day: "Wed",
        value: 0,
        minutes: 0,
      },
      {
        day: "Thu",
        value: 0,
        minutes: 0,
      },
      {
        day: "Fri",
        value: 0,
        minutes: 0,
      },
      {
        day: "Sat",
        value: 0,
        minutes: 0,
      },
      {
        day: "Sun",
        value: 0,
        minutes: 0,
      },
    ];
  }, [dashboardData]);

  // =========================================================
  // CURRENT WEIGHT
  // =========================================================

  const latestProgress = useMemo(() => {
    if (!progressRecords.length) {
      return null;
    }

    const sorted = [
      ...progressRecords,
    ].sort((a, b) => {
      const dateA = new Date(
        getProgressDate(a)
      ).getTime();

      const dateB = new Date(
        getProgressDate(b)
      ).getTime();

      return dateB - dateA;
    });

    return sorted[0];
  }, [progressRecords]);

  const currentWeight =
    Number(
      dashboardData?.progressSummary
        ?.currentWeight
    ) ||
    Number(latestProgress?.weight) ||
    0;

  // =========================================================
  // WEIGHT GOAL
  // =========================================================

  const weightGoal = useMemo(() => {
    const weightGoals =
      goals.filter(
        (goal) =>
          goal?.category === "Weight"
      );

    if (!weightGoals.length) {
      return 68;
    }

    const activeGoal =
      weightGoals.find(
        (goal) =>
          !goal?.completed
      ) || weightGoals[0];

    return (
      Number(activeGoal?.target) ||
      68
    );
  }, [goals]);

  // =========================================================
  // WEIGHT PROGRESS
  // =========================================================

  const weightProgress = useMemo(() => {
    if (
      !currentWeight ||
      !weightGoal
    ) {
      return 0;
    }

    const difference =
      Math.abs(
        currentWeight -
          weightGoal
      );

    const percentage =
      Math.max(
        0,
        100 - difference * 10
      );

    return Math.min(
      percentage,
      100
    );
  }, [
    currentWeight,
    weightGoal,
  ]);

  // =========================================================
  // GOALS
  // =========================================================

  const completedGoals =
    goals.filter(
      (goal) =>
        goal?.completed ||
        Number(
          goal?.progress
        ) >= 100
    );

  const totalGoals =
    goals.length;

  const completedGoalCount =
    completedGoals.length;

  // =========================================================
  // USER NAME
  // =========================================================

  const userName =
    user?.name || "User";

  // =========================================================
  // FORMAT WORKOUT DATE
  // =========================================================

  const formatWorkoutDate = (
    workout
  ) => {
    const date =
      getWorkoutDate(workout);

    if (!isValidDate(date)) {
      return "Recently";
    }

    const workoutDate =
      new Date(date);

    const today =
      new Date();

    if (
      workoutDate.toDateString() ===
      today.toDateString()
    ) {
      return `Today, ${workoutDate.toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      )}`;
    }

    const yesterday =
      new Date(today);

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    if (
      workoutDate.toDateString() ===
      yesterday.toDateString()
    ) {
      return `Yesterday, ${workoutDate.toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      )}`;
    }

    return workoutDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  // =========================================================
  // WORKOUT ICON
  // =========================================================

  const getWorkoutIcon = (
    category
  ) => {
    if (
      category?.toLowerCase() ===
      "cardio"
    ) {
      return <FaRunning />;
    }

    return <FaDumbbell />;
  };

  // =========================================================
  // TODAY NUTRITION
  // =========================================================

  const todayNutrition =
    dashboardData?.todayNutrition || {};

  const todayCalories =
    Number(
      todayNutrition.calories
    ) || 0;

  const todayProtein =
    Number(
      todayNutrition.protein
    ) || 0;

  const todayCarbs =
    Number(
      todayNutrition.carbs
    ) || 0;

  const todayFats =
    Number(
      todayNutrition.fats
    ) || 0;

  const dailyCaloriesGoal =
    2000;

  const caloriesPercentage =
    Math.min(
      (todayCalories /
        dailyCaloriesGoal) *
        100,
      100
    );

  const proteinPercentage =
    Math.min(
      (todayProtein / 120) *
        100,
      100
    );

  const carbsPercentage =
    Math.min(
      (todayCarbs / 240) *
        100,
      100
    );

  const fatsPercentage =
    Math.min(
      (todayFats / 90) *
        100,
      100
    );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && !dashboardData) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              WELCOME BACK
            </span>

            <h1>
              Loading your dashboard...
            </h1>

            <p>
              Please wait while we fetch
              your latest fitness data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !dashboardData) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              DASHBOARD
            </span>

            <h1>
              Unable to load dashboard
            </h1>

            <p>
              {error}
            </p>

            <Button
              className="add-workout-btn"
              onClick={loadDashboard}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="dashboard-page">

      {/* ================= HEADER ================= */}

      <div className="dashboard-header">

        <div>

          <span className="dashboard-eyebrow">
            WELCOME BACK
          </span>

          <h1>
            {userName}
          </h1>

          <p>
            Here's an overview of your
            fitness journey today.
          </p>

        </div>

        <Button
          className="add-workout-btn"
          onClick={() =>
            navigate(
              "/dashboard/workouts"
            )
          }
        >
          <FaPlus />
          Add Workout
        </Button>

      </div>

      {/* ================= STATS ================= */}

      <Row className="dashboard-stats">

        {/* Calories */}

        <Col
          xl={3}
          md={6}
          className="mb-4"
        >

          <Card className="stat-card">

            <Card.Body>

              <div className="stat-top">

                <div className="stat-icon calories-icon">
                  <FaFire />
                </div>

                <span className="stat-change positive">
                  <FaArrowUp />
                  Today
                </span>

              </div>

              <div className="stat-value">
                {todayCalories.toLocaleString()}
              </div>

              <div className="stat-label">
                Calories Consumed
              </div>

              <div className="stat-footer">
                <span>
                  Daily goal
                </span>

                <strong>
                  {dailyCaloriesGoal.toLocaleString()} kcal
                </strong>
              </div>

              <ProgressBar
                now={
                  caloriesPercentage
                }
                className="stat-progress"
              />

            </Card.Body>

          </Card>

        </Col>

        {/* Workouts */}

        <Col
          xl={3}
          md={6}
          className="mb-4"
        >

          <Card className="stat-card">

            <Card.Body>

              <div className="stat-top">

                <div className="stat-icon workout-icon">
                  <FaDumbbell />
                </div>

                <span className="stat-change positive">
                  <FaArrowUp />
                  This month
                </span>

              </div>

              <div className="stat-value">
                {monthlyWorkoutCount}
              </div>

              <div className="stat-label">
                Workouts This Month
              </div>

              <div className="stat-footer">

                <span>
                  Last workout
                </span>

                <strong>
                  {getLastWorkoutText()}
                </strong>

              </div>

              <ProgressBar
                now={Math.min(
                  (monthlyWorkoutCount /
                    15) *
                    100,
                  100
                )}
                className="stat-progress"
              />

            </Card.Body>

          </Card>

        </Col>

        {/* Active Hours */}

        <Col
          xl={3}
          md={6}
          className="mb-4"
        >

          <Card className="stat-card">

            <Card.Body>

              <div className="stat-top">

                <div className="stat-icon hours-icon">
                  <FaClock />
                </div>

                <span className="stat-change positive">
                  <FaArrowUp />
                  This week
                </span>

              </div>

              <div className="stat-value">

                {activeHours.toFixed(1)}

                <small>
                  {" "}
                  hrs
                </small>

              </div>

              <div className="stat-label">
                Active Hours
              </div>

              <div className="stat-footer">

                <span>
                  Weekly target
                </span>

                <strong>
                  8 hrs
                </strong>

              </div>

              <ProgressBar
                now={
                  activeHoursPercentage
                }
                className="stat-progress"
              />

            </Card.Body>

          </Card>

        </Col>

        {/* Weight */}

        <Col
          xl={3}
          md={6}
          className="mb-4"
        >

          <Card className="stat-card">

            <Card.Body>

              <div className="stat-top">

                <div className="stat-icon weight-icon">
                  <FaWeight />
                </div>

                <span
                  className={
                    Number(
                      dashboardData
                        ?.progressSummary
                        ?.weightChange
                    ) <= 0
                      ? "stat-change negative"
                      : "stat-change positive"
                  }
                >

                  {Number(
                    dashboardData
                      ?.progressSummary
                      ?.weightChange
                  ) <= 0 ? (
                    <FaArrowDown />
                  ) : (
                    <FaArrowUp />
                  )}

                  {Math.abs(
                    Number(
                      dashboardData
                        ?.progressSummary
                        ?.weightChange
                    ) || 0
                  ).toFixed(1)}
                  kg

                </span>

              </div>

              <div className="stat-value">

                {currentWeight ||
                  "--"}

                <small>
                  {" "}
                  kg
                </small>

              </div>

              <div className="stat-label">
                Current Weight
              </div>

              <div className="stat-footer">

                <span>
                  Goal weight
                </span>

                <strong>
                  {weightGoal} kg
                </strong>

              </div>

              <ProgressBar
                now={
                  weightProgress
                }
                className="stat-progress"
              />

            </Card.Body>

          </Card>

        </Col>

      </Row>

      {/* ================= CHARTS ================= */}

      <Row>

        {/* Weekly Activity */}

        <Col
          xl={8}
          className="mb-4"
        >

          <Card className="dashboard-card activity-card">

            <Card.Body>

              <div className="card-heading">

                <div>

                  <h3>
                    Weekly Activity
                  </h3>

                  <p>
                    Your workout activity over
                    the last 7 days
                  </p>

                </div>

                <select className="chart-select">

                  <option>
                    This Week
                  </option>

                  <option>
                    Last Week
                  </option>

                  <option>
                    This Month
                  </option>

                </select>

              </div>

              <div className="activity-chart">

                {weeklyActivity.map(
                  (item) => (

                    <div
                      className="activity-column"
                      key={item.day}
                    >

                      <div className="activity-bar-wrapper">

                        <div
                          className="activity-bar"
                          style={{
                            height: `${Math.max(
                              item.value,
                              item.minutes >
                                0
                                ? 5
                                : 0
                            )}%`,
                          }}
                        />

                      </div>

                      <span>
                        {item.day}
                      </span>

                    </div>

                  )
                )}

              </div>

            </Card.Body>

          </Card>

        </Col>

        {/* Today's Goals */}

        <Col
          xl={4}
          className="mb-4"
        >

          <Card className="dashboard-card goals-card">

            <Card.Body>

              <div className="card-heading">

                <div>

                  <h3>
                    Today's Goals
                  </h3>

                  <p>
                    Keep pushing forward
                  </p>

                </div>

                <span className="goal-count">

                  {completedGoalCount}/
                  {totalGoals || 0}

                </span>

              </div>

              <div className="goal-list">

                {goals.length > 0 ? (

                  goals
                    .slice(0, 4)
                    .map((goal) => {

                      const completed =
                        goal?.completed ||
                        Number(
                          goal?.progress
                        ) >= 100;

                      return (
                        <div
                          className={`goal-item ${
                            completed
                              ? "completed"
                              : ""
                          }`}
                          key={
                            goal.id ||
                            goal._id ||
                            goal.title
                          }
                        >

                          <div
                            className={`goal-check ${
                              completed
                                ? ""
                                : "empty"
                            }`}
                          >
                            <FaCheckCircle />
                          </div>

                          <div>

                            <strong>
                              {goal.title ||
                                "Fitness Goal"}
                            </strong>

                            <span>

                              {completed
                                ? "Goal completed"
                                : `${Number(
                                    goal.current
                                  ) || 0} / ${
                                    Number(
                                      goal.target
                                    ) || 0
                                  } ${
                                    goal.unit ||
                                    ""
                                  }`}

                            </span>

                          </div>

                        </div>
                      );
                    })

                ) : (

                  <div className="goal-item">

                    <div className="goal-check empty">
                      <FaCheckCircle />
                    </div>

                    <div>

                      <strong>
                        No goals yet
                      </strong>

                      <span>
                        Create your first fitness
                        goal.
                      </span>

                    </div>

                  </div>

                )}

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>

      {/* ================= BOTTOM SECTION ================= */}

      <Row>

        {/* Recent Workouts */}

        <Col
          xl={7}
          className="mb-4"
        >

          <Card className="dashboard-card">

            <Card.Body>

              <div className="card-heading">

                <div>

                  <h3>
                    Recent Workouts
                  </h3>

                  <p>
                    Your latest training sessions
                  </p>

                </div>

                <Button
                  className="view-all-btn"
                  onClick={() =>
                    navigate(
                      "/dashboard/workouts"
                    )
                  }
                >
                  View All
                </Button>

              </div>

              <div className="workout-list">

                {recentWorkouts.length >
                0 ? (

                  recentWorkouts.map(
                    (workout) => (

                      <div
                        className="workout-item"
                        key={
                          workout._id ||
                          workout.id ||
                          workout.createdAt ||
                          workout.name
                        }
                      >

                        <div className="workout-icon-box">

                          {getWorkoutIcon(
                            workout.category
                          )}

                        </div>

                        <div className="workout-info">

                          <strong>
                            {workout.name ||
                              "Workout"}
                          </strong>

                          <span>

                            {workout.category ||
                              "Fitness"}{" "}
                            •{" "}
                            {formatWorkoutDate(
                              workout
                            )}

                          </span>

                        </div>

                        <div className="workout-duration">

                          <strong>

                            {Number(
                              workout.duration
                            ) || 0}{" "}
                            min

                          </strong>

                          <span>

                            {Number(
                              workout.caloriesBurned ??
                                workout.calories
                            ) || 0}{" "}
                            kcal

                          </span>

                        </div>

                      </div>

                    )
                  )

                ) : (

                  <div className="workout-item">

                    <div className="workout-icon-box">
                      <FaDumbbell />
                    </div>

                    <div className="workout-info">

                      <strong>
                        No workouts yet
                      </strong>

                      <span>
                        Add your first workout
                        to get started.
                      </span>

                    </div>

                    <div className="workout-duration">

                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            "/dashboard/workouts"
                          )
                        }
                      >
                        Add
                      </Button>

                    </div>

                  </div>

                )}

              </div>

            </Card.Body>

          </Card>

        </Col>

        {/* Nutrition */}

        <Col
          xl={5}
          className="mb-4"
        >

          <Card className="dashboard-card nutrition-card">

            <Card.Body>

              <div className="card-heading">

                <div>

                  <h3>
                    Nutrition Today
                  </h3>

                  <p>
                    Your daily nutrition overview
                  </p>

                </div>

                <div className="nutrition-main-icon">
                  <FaUtensils />
                </div>

              </div>

              <div className="nutrition-calories">

                <div>

                  <strong>
                    {todayCalories.toLocaleString()}
                  </strong>

                  <span>
                    / {dailyCaloriesGoal.toLocaleString()} kcal
                  </span>

                </div>

                <span>
                  {Math.round(
                    caloriesPercentage
                  )}
                  %
                </span>

              </div>

              <ProgressBar
                now={
                  caloriesPercentage
                }
                className="nutrition-progress"
              />

              <div className="macro-list">

                <div className="macro-item">

                  <div className="macro-label">

                    <span>
                      Protein
                    </span>

                    <strong>
                      {todayProtein.toFixed(0)}g
                    </strong>

                  </div>

                  <ProgressBar
                    now={
                      proteinPercentage
                    }
                  />

                </div>

                <div className="macro-item">

                  <div className="macro-label">

                    <span>
                      Carbs
                    </span>

                    <strong>
                      {todayCarbs.toFixed(0)}g
                    </strong>

                  </div>

                  <ProgressBar
                    now={
                      carbsPercentage
                    }
                  />

                </div>

                <div className="macro-item">

                  <div className="macro-label">

                    <span>
                      Fat
                    </span>

                    <strong>
                      {todayFats.toFixed(0)}g
                    </strong>

                  </div>

                  <ProgressBar
                    now={
                      fatsPercentage
                    }
                  />

                </div>

              </div>

              <div className="water-box">

                <div className="water-icon">
                  <FaTint />
                </div>

                <div>

                  <strong>
                    Water Intake
                  </strong>

                  <span>
                    Track your daily water
                    intake
                  </span>

                </div>

                <Button
                  onClick={() =>
                    navigate(
                      "/dashboard/nutrition"
                    )
                  }
                >
                  +
                </Button>

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>

    </div>
  );
}

export default Dashboard;