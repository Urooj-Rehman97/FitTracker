import { useEffect, useMemo, useState } from "react";

import {
  FaUsers,
  FaUserCheck,
  FaDumbbell,
  FaUtensils,
  FaArrowUp,
  FaArrowDown,
  FaEllipsisH,
  FaUserPlus,
  FaRunning,
  FaBullseye,
  FaChartLine,
  FaBell,
  FaClock,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./AdminDashboard.css";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await authRequest("/admin/dashboard");

        if (response?.success) {
          setDashboard(response.dashboard);
        } else {
          setError(response?.message || "Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Admin dashboard error:", err);

        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statsData = dashboard?.stats || {};

  const stats = [
    {
      title: "Total Users",
      value: statsData.totalUsers ?? 0,
      change: "+12.5%",
      trend: "up",
      icon: <FaUsers />,
    },
    {
      title: "Active Users",
      value: statsData.activeUsers ?? 0,
      change: "+8.2%",
      trend: "up",
      icon: <FaUserCheck />,
    },
    {
      title: "Total Workouts",
      value: statsData.totalWorkouts ?? 0,
      change: "+15.8%",
      trend: "up",
      icon: <FaDumbbell />,
    },
    {
      title: "Nutrition Logs",
      value: statsData.totalNutritionLogs ?? 0,
      change: "-3.4%",
      trend: "down",
      icon: <FaUtensils />,
    },
  ];

  const recentUsers = dashboard?.recentUsers || [];

  const activities = [
    {
      icon: <FaUserPlus />,
      title: "New user registered",
      description: "A new member joined FitTrack",
      time: "Recently",
    },
    {
      icon: <FaRunning />,
      title: "Workout activity",
      description: "A workout was completed",
      time: "Recently",
    },
    {
      icon: <FaUtensils />,
      title: "Nutrition activity",
      description: "A nutrition log was added",
      time: "Recently",
    },
    {
      icon: <FaBullseye />,
      title: "Goal activity",
      description: "A fitness goal was updated",
      time: "Recently",
    },
    {
      icon: <FaUserPlus />,
      title: "User activity",
      description: "Platform activity detected",
      time: "Recently",
    },
  ];

  const growthData = dashboard?.growthData || [];

  const chartMax = useMemo(() => {
    const values = growthData.map((item) => Number(item.value) || 0);

    const maxValue = Math.max(...values, 0);

    if (maxValue <= 5) {
      return 5;
    }

    return Math.ceil(maxValue / 5) * 5;
  }, [growthData]);

  const chartLabels = useMemo(() => {
    const max = chartMax;

    return [
      max,
      Math.round(max * 0.75),
      Math.round(max * 0.5),
      Math.round(max * 0.25),
      0,
    ];
  }, [chartMax]);

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString();
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getBarHeight = (value) => {
    const numericValue = Number(value) || 0;

    if (numericValue <= 0) {
      return 0;
    }

    const percentage = (numericValue / chartMax) * 100;

    return Math.max(percentage, 4);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <h2>Dashboard Overview</h2>

          <p>
            Welcome back, Admin. Here's what's happening with FitTrack today.
          </p>
        </div>

        <div className="dashboard-date">
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      {error && <div className="admin-dashboard-error">{error}</div>}

      <div className="admin-stat-grid">
        {stats.map((stat, index) => (
          <div className="admin-stat-card" key={index}>
            <div className="admin-stat-top">
              <div className="admin-stat-icon">{stat.icon}</div>

              <button className="stat-menu" type="button">
                <FaEllipsisH />
              </button>
            </div>

            <div className="admin-stat-info">
              <span>{stat.title}</span>

              <h3>{loading ? "..." : formatNumber(stat.value)}</h3>
            </div>

            <div
              className={`stat-change ${
                stat.trend === "up" ? "positive" : "negative"
              }`}
            >
              {stat.trend === "up" ? <FaArrowUp /> : <FaArrowDown />}

              <span>{stat.change}</span>

              <small>vs last month</small>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-card growth-card">
          <div className="admin-card-header">
            <div>
              <h3>User Growth</h3>
              <p>New registered users</p>
            </div>

            <select className="growth-select" defaultValue="9">
              <option value="9">Last 9 months</option>

              <option value="6" disabled>
                Last 6 months
              </option>

              <option value="12" disabled>
                Last 12 months
              </option>
            </select>
          </div>

          <div className="growth-summary">
            <strong>
              {loading ? "..." : formatNumber(statsData.totalUsers)}
            </strong>

            <span>Total users</span>
          </div>

          <div className="growth-chart">
            <div className="chart-y-axis">
              {chartLabels.map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>

            <div className="chart-area">
              <div className="chart-grid-lines">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="chart-bars">
                {loading ? (
                  <div className="chart-loading">Loading chart...</div>
                ) : growthData.length === 0 ? (
                  <div className="chart-empty">
                    No user growth data available
                  </div>
                ) : (
                  growthData.map((item, index) => {
                    const numericValue = Number(item.value) || 0;

                    return (
                      <div
                        className="chart-bar-wrapper"
                        key={`${item.month}-${index}`}
                      >
                        <div
                          className="chart-bar"
                          style={{
                            height: `${getBarHeight(numericValue)}%`,
                          }}
                          title={`${item.month}: ${numericValue} new users`}
                        >
                          <span>{numericValue}</span>
                        </div>

                        <small>{item.month}</small>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card quick-actions-card">
          <div className="admin-card-header">
            <div>
              <h3>Quick Actions</h3>
              <p>Manage your platform</p>
            </div>
          </div>

          <div className="quick-actions">
            <a href="/admin/users">
              <div className="quick-action-icon users">
                <FaUsers />
              </div>

              <div>
                <strong>Manage Users</strong>

                <span>View and manage users</span>
              </div>
            </a>

            <a href="/admin/workouts">
              <div className="quick-action-icon workouts">
                <FaDumbbell />
              </div>

              <div>
                <strong>Manage Workouts</strong>

                <span>Review workout records</span>
              </div>
            </a>

            <a href="/admin/reports">
              <div className="quick-action-icon reports">
                <FaChartLine />
              </div>

              <div>
                <strong>View Reports</strong>

                <span>Analyze platform data</span>
              </div>
            </a>

            <a href="/admin/notifications">
              <div className="quick-action-icon notifications">
                <FaBell />
              </div>

              <div>
                <strong>Notifications</strong>

                <span>Send platform updates</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="admin-bottom-grid">
        <div className="admin-card recent-users-card">
          <div className="admin-card-header">
            <div>
              <h3>Recent Users</h3>
              <p>Latest registered members</p>
            </div>

            <a href="/admin/users">View All</a>
          </div>

          <div className="recent-users-table">
            <div className="table-header">
              <span>User</span>
              <span>Joined</span>
              <span>Status</span>
            </div>

            {loading ? (
              <div className="dashboard-table-message">Loading users...</div>
            ) : recentUsers.length === 0 ? (
              <div className="dashboard-table-message">No users found.</div>
            ) : (
              recentUsers.map((user, index) => (
                <div className="recent-user-row" key={user.id || index}>
                  <div className="user-table-info">
                    <div className="table-avatar">{user.avatar || "U"}</div>

                    <div>
                      <strong>{user.name || "Unknown User"}</strong>

                      <span>{user.email || "-"}</span>
                    </div>
                  </div>

                  <span className="user-date">{formatDate(user.date)}</span>

                  <span
                    className={`user-status ${
                      user.status === "Active" ? "active" : "inactive"
                    }`}
                  >
                    {user.status || "Inactive"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-card activity-card">
          <div className="admin-card-header">
            <div>
              <h3>Recent Activity</h3>
              <p>Latest platform activity</p>
            </div>

            <a href="/admin/reports">View All</a>
          </div>

          <div className="activity-list">
            {activities.map((activity, index) => (
              <div className="activity-item" key={index}>
                <div className="activity-icon">{activity.icon}</div>

                <div className="activity-info">
                  <strong>{activity.title}</strong>

                  <span>{activity.description}</span>

                  <small>
                    <FaClock />
                    {activity.time}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
