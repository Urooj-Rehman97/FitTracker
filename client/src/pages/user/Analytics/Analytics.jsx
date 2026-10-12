
import { useEffect, useMemo, useState } from "react";
import {
  FaChartLine,
  FaDumbbell,
  FaFire,
  FaUtensils,
  FaWeight,
  FaBullseye,
  FaArrowDown,
  FaCalendarAlt,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./Analytics.css";

function Analytics() {
  const [period, setPeriod] = useState("7");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);

  /*
   * ---------------------------------------------------------
   * LOAD ANALYTICS FROM BACKEND
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await authRequest(
          `/analytics?period=${period}`
        );

        console.log(
          "ANALYTICS API RESPONSE:",
          response
        );

        if (response.success) {
          // Backend response structure:
          // {
          //   success: true,
          //   analytics: { ... }
          // }
          setAnalytics(response.analytics);
        } else {
          setError(
            response.message ||
              "Unable to load analytics"
          );
        }
      } catch (error) {
        console.error(
          "Load analytics error:",
          error
        );

        setError(
          error.message ||
            "Unable to load analytics"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [period]);

  /*
   * ---------------------------------------------------------
   * BACKEND DATA
   * ---------------------------------------------------------
   */

  const data = analytics?.summary || {
    workoutDays: 0,
    totalWorkouts: 0,
    caloriesBurned: 0,
    averageWorkout: 0,
    caloriesConsumed: 0,
    averageCalories: 0,
    currentWeight: 0,
    weightChange: 0,
    startingWeight: 0,
  };

  const weeklyWorkoutData =
    analytics?.weeklyWorkoutData || [];

  const nutritionData =
    analytics?.nutritionData || [];

  const weightData =
    analytics?.weightData || [];

  const macroData =
    analytics?.macroData || [];

  const exerciseData =
    analytics?.exerciseData || [];

  /*
   * ---------------------------------------------------------
   * CHART CALCULATIONS
   * ---------------------------------------------------------
   */

  const maxWorkout =
    weeklyWorkoutData.length > 0
      ? Math.max(
          ...weeklyWorkoutData.map(
            (item) => Number(item.workouts) || 0
          )
        )
      : 0;

  const maxCalories =
    nutritionData.length > 0
      ? Math.max(
          ...nutritionData.map(
            (item) => Number(item.calories) || 0
          )
        )
      : 0;

  /*
   * ---------------------------------------------------------
   * WEIGHT STATS
   * ---------------------------------------------------------
   */

  const weightStats = useMemo(() => {
    if (!weightData.length) {
      return {
        first: Number(data.startingWeight || 0),
        latest: Number(data.currentWeight || 0),
        difference: Number(
          data.weightChange || 0
        ).toFixed(1),
      };
    }

    const first = Number(
      weightData[0]?.weight || 0
    );

    const latest = Number(
      weightData[weightData.length - 1]?.weight || 0
    );

    return {
      first,
      latest,
      difference: (latest - first).toFixed(1),
    };
  }, [
    weightData,
    data.startingWeight,
    data.currentWeight,
    data.weightChange,
  ]);

  /*
   * ---------------------------------------------------------
   * LOADING STATE
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-loading-spinner"></div>

          <h3>Loading analytics...</h3>

          <p>
            Fetching your latest fitness data.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * ERROR STATE
   * ---------------------------------------------------------
   */

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <FaChartLine />

          <h3>Unable to load analytics</h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}

      <div className="analytics-header">
        <div>
          <span className="analytics-eyebrow">
            <FaChartLine />
            Performance analytics
          </span>

          <h1>Analytics</h1>

          <p>
            Understand your workouts, nutrition and fitness progress.
          </p>
        </div>

        <div className="analytics-period">
          <FaCalendarAlt />

          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value)
            }
          >
            <option value="7">
              Last 7 days
            </option>

            <option value="30">
              Last 30 days
            </option>

            <option value="90">
              Last 90 days
            </option>
          </select>
        </div>
      </div>

      {/* Stats */}

      <div className="analytics-stats">
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon workout">
            <FaDumbbell />
          </div>

          <div>
            <span>Workout Days</span>

            <strong>
              {data.workoutDays}
            </strong>

            <small>
              {data.totalWorkouts} total workouts
            </small>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon calories">
            <FaFire />
          </div>

          <div>
            <span>Calories Burned</span>

            <strong>
              {Number(
                data.caloriesBurned || 0
              ).toLocaleString()}
            </strong>

            <small>
              {data.averageWorkout} min avg. workout
            </small>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon nutrition">
            <FaUtensils />
          </div>

          <div>
            <span>Calories Consumed</span>

            <strong>
              {Number(
                data.caloriesConsumed || 0
              ).toLocaleString()}
            </strong>

            <small>
              {Number(
                data.averageCalories || 0
              ).toLocaleString()}{" "}
              daily average
            </small>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon progress">
            <FaWeight />
          </div>

          <div>
            <span>Current Weight</span>

            <strong>
              {data.currentWeight || 0} kg
            </strong>

            <small className="positive">
              <FaArrowDown />

              {Math.abs(
                Number(data.weightChange || 0)
              )}{" "}
              kg change
            </small>
          </div>
        </div>
      </div>

      {/* Workout Activity */}

      <div className="analytics-grid">
        <section className="analytics-card workout-chart-card">
          <div className="analytics-card-header">
            <div>
              <h2>Workout Activity</h2>

              <p>
                Your workout frequency during the week.
              </p>
            </div>

            <div className="analytics-card-icon">
              <FaDumbbell />
            </div>
          </div>

          <div className="workout-chart">
            {weeklyWorkoutData.map((item) => {
              const height =
                maxWorkout > 0
                  ? (Number(item.workouts || 0) /
                      maxWorkout) *
                    100
                  : 0;

              return (
                <div
                  className="workout-chart-column"
                  key={item.day}
                >
                  <div className="workout-chart-value">
                    {item.workouts}
                  </div>

                  <div className="workout-chart-bar-wrapper">
                    <div
                      className="workout-chart-bar"
                      style={{
                        height: `${height}%`,
                      }}
                    ></div>
                  </div>

                  <span>{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="chart-summary">
            <div>
              <span>Total workouts</span>

              <strong>
                {data.totalWorkouts}
              </strong>
            </div>

            <div>
              <span>Workout days</span>

              <strong>
                {data.workoutDays}
              </strong>
            </div>
          </div>
        </section>

        {/* Nutrition */}

        <section className="analytics-card nutrition-chart-card">
          <div className="analytics-card-header">
            <div>
              <h2>Calorie Intake</h2>

              <p>
                Daily calorie consumption trend.
              </p>
            </div>

            <div className="analytics-card-icon nutrition">
              <FaUtensils />
            </div>
          </div>

          <div className="nutrition-chart">
            {nutritionData.map((item) => {
              const height =
                maxCalories > 0
                  ? (Number(item.calories || 0) /
                      maxCalories) *
                    100
                  : 0;

              return (
                <div
                  className="nutrition-chart-column"
                  key={item.day}
                >
                  <div className="nutrition-chart-value">
                    {item.calories}
                  </div>

                  <div className="nutrition-chart-bar-wrapper">
                    <div
                      className="nutrition-chart-bar"
                      style={{
                        height: `${height}%`,
                      }}
                    ></div>
                  </div>

                  <span>{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="nutrition-target">
            <div>
              <span>Daily target</span>

              <strong>
                2,000 kcal
              </strong>
            </div>

            <div>
              <span>Average</span>

              <strong>
                {Number(
                  data.averageCalories || 0
                ).toLocaleString()}{" "}
                kcal
              </strong>
            </div>
          </div>
        </section>
      </div>

      {/* Weight Progress */}

      <section className="analytics-card weight-card">
        <div className="analytics-card-header">
          <div>
            <h2>Weight Progress</h2>

            <p>
              Track your body-weight trend over time.
            </p>
          </div>

          <div className="analytics-card-icon progress">
            <FaWeight />
          </div>
        </div>

        {weightData.length > 0 ? (
          <div className="weight-chart">
            <div className="weight-chart-y-axis">
              <span>84</span>
              <span>82</span>
              <span>80</span>
              <span>78</span>
              <span>76</span>
            </div>

            <div className="weight-chart-area">
              <div className="weight-grid-lines">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="weight-line">
                {weightData.map(
                  (item, index) => {
                    const minWeight = 76;
                    const maxWeight = 84;

                    const currentWeight =
                      Number(
                        item.weight || 0
                      );

                    const bottom =
                      ((currentWeight -
                        minWeight) /
                        (maxWeight -
                          minWeight)) *
                      100;

                    const left =
                      weightData.length === 1
                        ? 50
                        : (index /
                            (weightData.length -
                              1)) *
                          100;

                    return (
                      <div
                        className="weight-point-wrapper"
                        key={`${item.label}-${index}`}
                        style={{
                          left: `${left}%`,
                        }}
                      >
                        <div
                          className="weight-point"
                          style={{
                            bottom: `${Math.max(
                              0,
                              Math.min(
                                100,
                                bottom
                              )
                            )}%`,
                          }}
                        >
                          <span>
                            {currentWeight}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="weight-labels">
                {weightData.map(
                  (item, index) => (
                    <span
                      key={`${item.label}-${index}`}
                    >
                      {item.label}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="analytics-no-data">
            <FaWeight />

            <h3>No weight data yet</h3>

            <p>
              Add progress records to see your weight trend.
            </p>
          </div>
        )}

        <div className="weight-summary">
          <div>
            <span>Starting weight</span>

            <strong>
              {weightStats.first} kg
            </strong>
          </div>

          <div>
            <span>Current weight</span>

            <strong>
              {weightStats.latest} kg
            </strong>
          </div>

          <div className="weight-loss">
            <span>Total change</span>

            <strong>
              {Number(
                weightStats.difference
              ) < 0 && <FaArrowDown />}

              {Math.abs(
                Number(
                  weightStats.difference
                )
              )}{" "}
              kg
            </strong>
          </div>
        </div>
      </section>

      {/* Bottom Analytics */}

      <div className="analytics-grid">
        {/* Macros */}

        <section className="analytics-card macros-card">
          <div className="analytics-card-header">
            <div>
              <h2>Macronutrients</h2>

              <p>
                Your average macro distribution.
              </p>
            </div>

            <div className="analytics-card-icon nutrition">
              <FaUtensils />
            </div>
          </div>

          {macroData.length > 0 ? (
            <div className="macro-list">
              {macroData.map((macro) => {
                const percentage = Number(
                  macro.percentage || 0
                );

                return (
                  <div
                    className="macro-row"
                    key={macro.name}
                  >
                    <div className="macro-row-header">
                      <span>
                        {macro.name}
                      </span>

                      <strong>
                        {percentage}%
                      </strong>
                    </div>

                    <div className="macro-progress">
                      <div
                        className={`macro-progress-fill ${macro.name.toLowerCase()}`}
                        style={{
                          width: `${Math.min(
                            100,
                            percentage
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <small>
                      Target: {macro.target}
                      {macro.unit || ""}
                    </small>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="analytics-no-data small">
              <FaUtensils />

              <h3>No nutrition data yet</h3>

              <p>
                Add meals to see your macro distribution.
              </p>
            </div>
          )}
        </section>

        {/* Exercise History */}

        <section className="analytics-card exercise-card">
          <div className="analytics-card-header">
            <div>
              <h2>Exercise History</h2>

              <p>
                Your most performed exercises.
              </p>
            </div>

            <div className="analytics-card-icon workout">
              <FaDumbbell />
            </div>
          </div>

          {exerciseData.length > 0 ? (
            <div className="exercise-list">
              {exerciseData.map(
                (exercise) => (
                  <div
                    className="exercise-row"
                    key={exercise.name}
                  >
                    <div className="exercise-info">
                      <strong>
                        {exercise.name}
                      </strong>

                      <span>
                        {exercise.sessions} sessions
                      </span>
                    </div>

                    <div className="exercise-progress">
                      <div className="exercise-progress-bar">
                        <div
                          style={{
                            width: `${Math.min(
                              100,
                              Number(
                                exercise.progress ||
                                  0
                              ) * 5
                            )}%`,
                          }}
                        ></div>
                      </div>

                      <span>
                        +
                        {
                          exercise.progress
                        }
                        %
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="analytics-no-data small">
              <FaDumbbell />

              <h3>
                No exercise history yet
              </h3>

              <p>
                Add workouts with exercises to see your history.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Goal Performance */}

      <section className="analytics-goal-card">
        <div className="analytics-goal-icon">
          <FaBullseye />
        </div>

        <div className="analytics-goal-content">
          <span>Goal Performance</span>

          <h3>
            {analytics?.goalPerformance
              ?.totalGoals > 0
              ? "You're making steady progress!"
              : "Start setting your fitness goals!"}
          </h3>

          <p>
            {analytics?.goalPerformance
              ?.totalGoals > 0
              ? `You have completed ${analytics.goalPerformance.completedGoals} out of ${analytics.goalPerformance.totalGoals} goals. Keep tracking your progress!`
              : "Create your first goal to start tracking your fitness journey."}
          </p>
        </div>

        <div className="analytics-goal-stat">
          <strong>
            {analytics?.goalPerformance
              ?.percentage || 0}
            %
          </strong>

          <span>Overall progress</span>
        </div>
      </section>
    </div>
  );
}

export default Analytics;
