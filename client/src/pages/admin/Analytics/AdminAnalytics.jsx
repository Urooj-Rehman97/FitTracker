import { useEffect, useState } from "react";
import {
  FaChartPie,
  FaUsers,
  FaDumbbell,
  FaBullseye,
  FaUtensils,
  FaChartLine,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./AdminAnalytics.css";

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await authRequest(`/admin/analytics?period=${period}`);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load analytics");
      }

      setAnalytics(response.analytics || null);
    } catch (err) {
      console.error("Admin analytics error:", err);

      setError(err?.message || "Unable to load analytics data.");
    } finally {
      setLoading(false);

      setTimeout(() => {
        setRefreshing(false);
      }, 400);
    }
  };

  useEffect(() => {
    loadAnalytics(false);
  }, [period]);

  const handleRefresh = () => {
    if (refreshing) {
      return;
    }

    loadAnalytics(true);
  };

  const summary = analytics?.summary || {};

  const formatNumber = (value) => {
    const number = Number(value || 0);

    return Number.isFinite(number) ? number.toLocaleString() : "0";
  };

  const formatDecimal = (value) => {
    const number = Number(value || 0);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return number.toLocaleString(undefined, {
      maximumFractionDigits: 1,
    });
  };

  const getPercentage = (value) => {
    const number = Number(value || 0);

    if (!Number.isFinite(number)) {
      return "0%";
    }

    return `${number.toFixed(1)}%`;
  };

  const getPeriodLabel = () => {
    if (period === "7") return "last 7 days";
    if (period === "90") return "last 90 days";

    return "last 30 days";
  };

  const getPeriodTitle = () => {
    if (period === "7") return "Last 7 Days";
    if (period === "90") return "Last 90 Days";

    return "Last 30 Days";
  };

  if (loading) {
    return (
      <div className="admin-analytics-page">
        <div className="admin-analytics-loading">
          <div className="admin-analytics-spinner"></div>

          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="admin-analytics-page">
        <div className="admin-analytics-header">
          <div>
            <span className="admin-analytics-eyebrow">ADMIN PANEL</span>

            <h1>Analytics</h1>

            <p>Monitor FitTrack activity and platform performance.</p>
          </div>

          <div className="admin-analytics-actions">
            <button
              type="button"
              className="admin-analytics-refresh"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh analytics"
            >
              <FaSyncAlt
                className={
                  refreshing
                    ? "admin-analytics-refresh-icon spinning"
                    : "admin-analytics-refresh-icon"
                }
              />
            </button>
          </div>
        </div>

        <div className="admin-analytics-error">
          <div className="admin-analytics-error-icon">
            <FaExclamationTriangle />
          </div>

          <div>
            <strong>Unable to load analytics</strong>

            <p>{error}</p>

            <button
              type="button"
              onClick={handleRefresh}
              className="admin-analytics-retry"
              disabled={refreshing}
            >
              <FaSyncAlt className={refreshing ? "spinning" : ""} />

              {refreshing ? "Retrying..." : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-analytics-page">
      {/* HEADER */}
      <div className="admin-analytics-header">
        <div>
          <span className="admin-analytics-eyebrow">ADMIN PANEL</span>

          <h1>Analytics</h1>

          <p>Monitor FitTrack activity and platform performance.</p>
        </div>

        <div className="admin-analytics-actions">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="admin-analytics-period"
            aria-label="Analytics period"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>

          <button
            type="button"
            className={`admin-analytics-refresh ${
              refreshing ? "is-refreshing" : ""
            }`}
            onClick={handleRefresh}
            disabled={refreshing}
            title={refreshing ? "Refreshing analytics..." : "Refresh analytics"}
          >
            <FaSyncAlt
              className={
                refreshing
                  ? "admin-analytics-refresh-icon spinning"
                  : "admin-analytics-refresh-icon"
              }
            />
          </button>
        </div>
      </div>

      {error && analytics && (
        <div className="admin-analytics-inline-error">
          <FaExclamationTriangle />

          <span>{error}</span>

          <button type="button" onClick={handleRefresh} disabled={refreshing}>
            Try Again
          </button>
        </div>
      )}

      <div className="admin-analytics-period-info">
        <div>
          <span>Analytics Period</span>
          <strong>{getPeriodTitle()}</strong>
        </div>

        <small>Activity metrics below are based on the selected period.</small>
      </div>

      <div className="admin-analytics-stats">
        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-icon users">
            <FaUsers />
          </div>

          <div className="admin-analytics-stat-content">
            <span>Total Users</span>

            <strong>{formatNumber(summary.totalUsers)}</strong>

            <small>{formatNumber(summary.activeUsers)} active</small>
          </div>
        </div>

        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-icon workouts">
            <FaDumbbell />
          </div>

          <div className="admin-analytics-stat-content">
            <span>Workouts</span>

            <strong>{formatNumber(summary.totalWorkouts)}</strong>

            <small>{getPeriodLabel()}</small>
          </div>
        </div>

        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-icon nutrition">
            <FaUtensils />
          </div>

          <div className="admin-analytics-stat-content">
            <span>Nutrition Logs</span>

            <strong>{formatNumber(summary.totalNutrition)}</strong>

            <small>{getPeriodLabel()}</small>
          </div>
        </div>

        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-icon goals">
            <FaBullseye />
          </div>

          <div className="admin-analytics-stat-content">
            <span>Total Goals</span>

            <strong>{formatNumber(summary.totalGoals)}</strong>

            <small>{formatNumber(summary.completedGoals)} completed</small>
          </div>
        </div>

        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-icon progress">
            <FaChartLine />
          </div>

          <div className="admin-analytics-stat-content">
            <span>Progress Entries</span>

            <strong>{formatNumber(summary.totalProgress)}</strong>

            <small>{getPeriodLabel()}</small>
          </div>
        </div>
      </div>

      <div className="admin-analytics-grid">
        <div className="admin-analytics-card">
          <div className="admin-analytics-card-header">
            <div className="admin-analytics-card-title">
              <span className="admin-analytics-card-icon users">
                <FaUsers />
              </span>

              <div>
                <h3>User Overview</h3>

                <p>Current FitTrack user activity</p>
              </div>
            </div>
          </div>

          <div className="admin-analytics-list">
            <div className="admin-analytics-list-item">
              <span>Total Users</span>

              <strong>{formatNumber(summary.totalUsers)}</strong>
            </div>

            <div className="admin-analytics-list-item">
              <span>Active Users</span>

              <strong className="positive">
                {formatNumber(summary.activeUsers)}
              </strong>
            </div>

            <div className="admin-analytics-list-item">
              <span>Inactive Users</span>

              <strong>{formatNumber(summary.inactiveUsers)}</strong>
            </div>

            <div className="admin-analytics-list-item">
              <span>New Users</span>

              <strong className="blue">{formatNumber(summary.newUsers)}</strong>
            </div>
          </div>
        </div>

        <div className="admin-analytics-card">
          <div className="admin-analytics-card-header">
            <div className="admin-analytics-card-title">
              <span className="admin-analytics-card-icon workouts">
                <FaDumbbell />
              </span>

              <div>
                <h3>Workout Activity</h3>

                <p>Workout activity during {getPeriodLabel()}</p>
              </div>
            </div>
          </div>

          <div className="admin-analytics-list">
            <div className="admin-analytics-list-item">
              <span>Total Workouts</span>

              <strong>{formatNumber(summary.totalWorkouts)}</strong>
            </div>

            <div className="admin-analytics-list-item">
              <span>Workout Minutes</span>

              <strong>{formatNumber(summary.workoutMinutes)}</strong>
            </div>

            <div className="admin-analytics-list-item">
              <span>Calories Burned</span>

              <strong>{formatNumber(summary.caloriesBurned)}</strong>
            </div>
          </div>

          <div className="admin-analytics-mini-summary">
            <FaDumbbell />

            <span>{formatNumber(summary.totalWorkouts)} workouts recorded</span>
          </div>
        </div>

        <div className="admin-analytics-card">
          <div className="admin-analytics-card-header">
            <div className="admin-analytics-card-title">
              <span className="admin-analytics-card-icon nutrition">
                <FaUtensils />
              </span>

              <div>
                <h3>Nutrition Activity</h3>

                <p>Nutrition data during {getPeriodLabel()}</p>
              </div>
            </div>
          </div>

          <div className="admin-analytics-list">
            <div className="admin-analytics-list-item">
              <span>Total Nutrition Logs</span>

              <strong>{formatNumber(summary.totalNutrition)}</strong>
            </div>

            <div className="admin-analytics-list-item">
              <span>Total Calories</span>

              <strong>{formatNumber(summary.caloriesConsumed)}</strong>
            </div>

            <div className="admin-analytics-list-item">
              <span>Protein</span>

              <strong>{formatDecimal(summary.protein)} g</strong>
            </div>

            <div className="admin-analytics-list-item">
              <span>Carbohydrates</span>

              <strong>{formatDecimal(summary.carbs)} g</strong>
            </div>

            <div className="admin-analytics-list-item">
              <span>Fats</span>

              <strong>{formatDecimal(summary.fats)} g</strong>
            </div>
          </div>
        </div>

        <div className="admin-analytics-card">
          <div className="admin-analytics-card-header">
            <div className="admin-analytics-card-title">
              <span className="admin-analytics-card-icon goals">
                <FaBullseye />
              </span>

              <div>
                <h3>Goal Performance</h3>

                <p>Current platform goal progress</p>
              </div>
            </div>
          </div>

          <div className="admin-analytics-list">
            <div className="admin-analytics-list-item">
              <span>Total Goals</span>

              <strong>{formatNumber(summary.totalGoals)}</strong>
            </div>

            <div className="admin-analytics-list-item">
              <span>Completed Goals</span>

              <strong className="positive">
                {formatNumber(summary.completedGoals)}
              </strong>
            </div>

            <div className="admin-analytics-list-item">
              <span>Active Goals</span>

              <strong className="blue">
                {formatNumber(summary.activeGoals)}
              </strong>
            </div>

            <div className="admin-analytics-list-item">
              <span>Completion Rate</span>

              <strong>{getPercentage(summary.goalCompletionRate)}</strong>
            </div>
          </div>

          <div className="admin-analytics-progress">
            <div className="admin-analytics-progress-top">
              <span>Goal completion</span>

              <strong>{getPercentage(summary.goalCompletionRate)}</strong>
            </div>

            <div className="admin-analytics-progress-track">
              <div
                className="admin-analytics-progress-fill"
                style={{
                  width: `${Math.min(
                    Math.max(Number(summary.goalCompletionRate || 0), 0),
                    100,
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-analytics-footer-card">
        <div className="admin-analytics-footer-icon">
          {Number(summary.goalCompletionRate || 0) >= 50 ? (
            <FaCheckCircle />
          ) : (
            <FaChartPie />
          )}
        </div>

        <div className="admin-analytics-footer-content">
          <h3>Analytics Summary</h3>

          <p>
            Showing FitTrack platform activity for the{" "}
            <strong>{getPeriodLabel()}</strong>.
          </p>
        </div>

        <div className="admin-analytics-footer-rate">
          <span>Goal Completion</span>

          <strong>{getPercentage(summary.goalCompletionRate)}</strong>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;
