import { useEffect, useMemo, useState } from "react";
import {
  FaChartBar,
  FaUsers,
  FaDumbbell,
  FaUtensils,
  FaBullseye,
  FaDownload,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaSyncAlt,
  FaPrint,
} from "react-icons/fa";
import { authRequest } from "../../../services/api";
import "./AdminReports.css";

function AdminReports() {
  const [period, setPeriod] = useState("Monthly");
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authRequest(
        `/admin/reports?period=${encodeURIComponent(period)}`,
      );

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load report");
      }

      setReport(response.report || null);
    } catch (err) {
      console.error("Admin report error:", err);

      setError(err?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [period]);

  const overview = report?.overview || {};

  const activity = report?.activity || [];

  const workoutCategories = report?.workoutCategories || [];

  const nutrition = report?.nutrition || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  };

  const goalPerformance = report?.goalPerformance || [];

  const maxActivity = useMemo(() => {
    if (!activity.length) {
      return 1;
    }

    return Math.max(
      ...activity.flatMap((item) => [
        Number(item.users || 0),
        Number(item.workouts || 0),
      ]),
      1,
    );
  }, [activity]);

  const totalCategoryWorkouts = useMemo(() => {
    return workoutCategories.reduce(
      (total, item) => total + Number(item.count || 0),
      0,
    );
  }, [workoutCategories]);

  const categoryColors = [
    "#198754",
    "#4aa875",
    "#75bf98",
    "#9ed3b6",
    "#c5e5d2",
    "#dff1e7",
    "#edf8f2",
  ];

  const categoryGradient = useMemo(() => {
    if (!workoutCategories.length) {
      return "#e9f7ef 0 100%";
    }

    let current = 0;

    const segments = workoutCategories.map((item, index) => {
      const value = Math.max(Number(item.value || 0), 0);

      const start = current;
      const end = Math.min(current + value, 100);

      current = end;

      return `${categoryColors[index % categoryColors.length]} ${start}% ${end}%`;
    });

    if (current < 100) {
      segments.push(`#edf8f2 ${current}% 100%`);
    }

    return segments.join(", ");
  }, [workoutCategories]);

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString();
  };

  const formatDecimal = (value) => {
    return Number(value || 0).toFixed(1);
  };

  const changeClass = (value) => {
    return Number(value || 0) >= 0 ? "positive" : "negative";
  };

  const ChangeIndicator = ({ value }) => {
    const numericValue = Number(value || 0);

    return (
      <small className={changeClass(numericValue)}>
        {numericValue >= 0 ? <FaArrowUp /> : <FaArrowDown />}
        {Math.abs(numericValue).toFixed(1)}% vs previous period
      </small>
    );
  };

  const handleExportCSV = () => {
    if (!report) {
      return;
    }

    setExporting(true);

    try {
      const rows = [
        ["FitTrack Admin Report", "", ""],

        ["Period", report.periodLabel || report.period || "", ""],

        ["Metric", "Value", "Change"],

        ["Total Users", overview.totalUsers || 0, ""],

        ["Active Users", overview.activeUsers || 0, ""],

        ["Inactive Users", overview.inactiveUsers || 0, ""],

        ["New Users", overview.periodUsers || 0, overview.userChange || 0],

        ["Workouts", overview.periodWorkouts || 0, overview.workoutChange || 0],

        [
          "Nutrition Logs",
          overview.periodNutrition || 0,
          overview.nutritionChange || 0,
        ],

        ["Progress Entries", overview.periodProgress || 0, ""],

        [
          "Completed Goals",
          overview.periodCompletedGoals || 0,
          overview.goalChange || 0,
        ],

        ["Total Goals", overview.totalGoals || 0, ""],

        ["Active Goals", overview.activeGoals || 0, ""],

        ["Goal Completion Rate", `${overview.goalCompletionRate || 0}%`, ""],

        ["Total Notifications", overview.totalNotifications || 0, ""],

        ["Unread Notifications", overview.unreadNotifications || 0, ""],

        [],

        ["Workout Category", "Count", "Percentage"],

        ...workoutCategories.map((item) => [
          item.name || "Other",
          item.count || 0,
          `${item.value || 0}%`,
        ]),

        [],

        ["Nutrition", "Value", "Unit"],

        ["Calories", nutrition.calories || 0, "kcal"],

        ["Protein", nutrition.protein || 0, "g"],

        ["Carbohydrates", nutrition.carbs || 0, "g"],

        ["Fats", nutrition.fats || 0, "g"],

        [],

        ["Goal Category", "Total", "Completed", "Completion Rate"],

        ...goalPerformance.map((item) => [
          item.name || "Other",
          item.count || 0,
          item.completed || 0,
          `${item.completionRate || 0}%`,
        ]),

        [],

        ["Progress Metric", "Average", ""],

        ["Average Weight", formatDecimal(report?.progress?.averageWeight), ""],

        ["Average Chest", formatDecimal(report?.progress?.averageChest), ""],

        ["Average Waist", formatDecimal(report?.progress?.averageWaist), ""],

        ["Average Arms", formatDecimal(report?.progress?.averageArms), ""],

        [
          "Average Strength",
          formatDecimal(report?.progress?.averageStrength),
          "",
        ],
      ];

      const csv = rows
        .map((row) =>
          row
            .map((cell) => {
              const value = String(cell ?? "").replace(/"/g, '""');

              return `"${value}"`;
            })
            .join(","),
        )
        .join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `fittrack-report-${period.toLowerCase()}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export error:", err);
    } finally {
      setExporting(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="admin-reports">
        <div className="report-loading">
          <FaSyncAlt className="spin" />

          <h3>Loading report...</h3>

          <p>Fetching the latest FitTrack analytics.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-reports">
        <div className="report-error">
          <h3>Unable to load report</h3>

          <p>{error}</p>

          <button type="button" onClick={loadReport}>
            <FaSyncAlt />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-reports">
      <div className="admin-page-header">
        <div>
          <h1>Reports & Analytics</h1>

          <p>Analyze real FitTrack users, workouts, nutrition and goals.</p>
        </div>

        <div className="report-actions">
          <button
            type="button"
            className="report-print-btn"
            onClick={handlePrintPDF}
          >
            <FaPrint />
            Save PDF
          </button>

          <button
            type="button"
            className="report-export-btn"
            onClick={handleExportCSV}
            disabled={exporting}
          >
            <FaDownload />

            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      <div className="reports-toolbar">
        <div className="report-period">
          <FaCalendarAlt />

          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="Weekly">Weekly</option>

            <option value="Monthly">Monthly</option>

            <option value="Yearly">Yearly</option>
          </select>
        </div>

        <div className="report-toolbar-right">
          <span className="report-updated">{report?.periodLabel || ""}</span>

          <button
            type="button"
            className="report-refresh-btn"
            onClick={loadReport}
            title="Refresh report"
          >
            <FaSyncAlt />
          </button>
        </div>
      </div>

      <div className="report-stats">
        <div className="report-stat-card">
          <div className="report-stat-icon">
            <FaUsers />
          </div>

          <div>
            <span>Total Users</span>

            <h3>{formatNumber(overview.totalUsers)}</h3>

            <small className="neutral">
              {formatNumber(overview.activeUsers)} active users
            </small>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon">
            <FaDumbbell />
          </div>

          <div>
            <span>Workouts</span>

            <h3>{formatNumber(overview.periodWorkouts)}</h3>

            <ChangeIndicator value={overview.workoutChange} />
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon">
            <FaUtensils />
          </div>

          <div>
            <span>Nutrition Logs</span>

            <h3>{formatNumber(overview.periodNutrition)}</h3>

            <ChangeIndicator value={overview.nutritionChange} />
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon">
            <FaBullseye />
          </div>

          <div>
            <span>Goals Completed</span>

            <h3>{formatNumber(overview.periodCompletedGoals)}</h3>

            <ChangeIndicator value={overview.goalChange} />
          </div>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card activity-card">
          <div className="report-card-header">
            <div>
              <h2>Platform Activity</h2>

              <p>Users and workouts for {report?.periodLabel?.toLowerCase()}</p>
            </div>
          </div>

          {activity.length === 0 ? (
            <div className="report-empty">
              No activity data available for this period.
            </div>
          ) : (
            <>
              <div className="activity-chart">
                <div className="chart-y-axis">
                  <span>{Math.round(maxActivity).toLocaleString()}</span>

                  <span>{Math.round(maxActivity * 0.8).toLocaleString()}</span>

                  <span>{Math.round(maxActivity * 0.6).toLocaleString()}</span>

                  <span>{Math.round(maxActivity * 0.4).toLocaleString()}</span>

                  <span>{Math.round(maxActivity * 0.2).toLocaleString()}</span>

                  <span>0</span>
                </div>

                <div className="chart-area">
                  <div className="chart-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="chart-bars">
                    {activity.map((item) => (
                      <div
                        className="chart-column"
                        key={item.key}
                        title={`${item.label} — Users: ${item.users || 0}, Workouts: ${item.workouts || 0}`}
                      >
                        <div className="bar-group">
                          <div
                            className="chart-bar users-bar"
                            style={{
                              height: `${
                                (Number(item.users || 0) / maxActivity) * 100
                              }%`,
                            }}
                          />

                          <div
                            className="chart-bar workout-bar"
                            style={{
                              height: `${
                                (Number(item.workouts || 0) / maxActivity) * 100
                              }%`,
                            }}
                          />
                        </div>

                        <span className="chart-label">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="chart-legend">
                <span>
                  <i className="legend-users" />
                  Users
                </span>

                <span>
                  <i className="legend-workouts" />
                  Workouts
                </span>
              </div>
            </>
          )}
        </div>

        <div className="report-card category-card">
          <div className="report-card-header">
            <div>
              <h2>Workout Categories</h2>

              <p>Workout distribution</p>
            </div>
          </div>

          {workoutCategories.length === 0 ? (
            <div className="report-empty">
              No workout category data available.
            </div>
          ) : (
            <div className="category-content">
              <div
                className="category-donut"
                style={{
                  background: `conic-gradient(${categoryGradient})`,
                }}
              >
                <div className="donut-center">
                  <strong>{formatNumber(totalCategoryWorkouts)}</strong>

                  <span>Total</span>
                </div>
              </div>

              <div className="category-list">
                {workoutCategories.map((item, index) => (
                  <div className="category-item" key={item.name}>
                    <div className="category-name">
                      <span
                        className="category-dot"
                        style={{
                          background:
                            categoryColors[index % categoryColors.length],
                        }}
                      />

                      {item.name}
                    </div>

                    <strong>{item.value || 0}%</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="reports-bottom-grid">
        <div className="report-card">
          <div className="report-card-header">
            <div>
              <h2>Nutrition Overview</h2>

              <p>
                Nutrition logged during {report?.periodLabel?.toLowerCase()}
              </p>
            </div>
          </div>

          <div className="nutrition-report">
            <div className="nutrition-item">
              <div>
                <span>Calories Logged</span>

                <strong>{formatNumber(nutrition.calories)} kcal</strong>
              </div>

              <div className="nutrition-progress">
                <span
                  style={{
                    width: `${nutrition.calories > 0 ? 100 : 0}%`,
                  }}
                />
              </div>

              <small>Total logged calories</small>
            </div>

            <div className="nutrition-item">
              <div>
                <span>Protein</span>

                <strong>{formatNumber(nutrition.protein)} g</strong>
              </div>

              <div className="nutrition-progress">
                <span
                  style={{
                    width: `${nutrition.protein > 0 ? 100 : 0}%`,
                  }}
                />
              </div>

              <small>Total logged protein</small>
            </div>

            <div className="nutrition-item">
              <div>
                <span>Carbohydrates</span>

                <strong>{formatNumber(nutrition.carbs)} g</strong>
              </div>

              <div className="nutrition-progress">
                <span
                  style={{
                    width: `${nutrition.carbs > 0 ? 100 : 0}%`,
                  }}
                />
              </div>

              <small>Total logged carbohydrates</small>
            </div>

            <div className="nutrition-item">
              <div>
                <span>Fats</span>

                <strong>{formatNumber(nutrition.fats)} g</strong>
              </div>

              <div className="nutrition-progress">
                <span
                  style={{
                    width: `${nutrition.fats > 0 ? 100 : 0}%`,
                  }}
                />
              </div>

              <small>Total logged fats</small>
            </div>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-header">
            <div>
              <h2>Goal Performance</h2>

              <p>User goal completion</p>
            </div>
          </div>

          {goalPerformance.length === 0 ? (
            <div className="report-empty">No goal data available.</div>
          ) : (
            <div className="goal-report">
              {goalPerformance.map((item) => (
                <div className="goal-report-row" key={item.name}>
                  <div>
                    <strong>{item.name}</strong>

                    <span>{formatNumber(item.count)} goals</span>
                  </div>

                  <div className="goal-report-value">
                    {item.completionRate || 0}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="report-card report-extra-card">
        <div className="report-card-header">
          <div>
            <h2>Progress & System Overview</h2>

            <p>Additional platform metrics for the selected period.</p>
          </div>
        </div>

        <div className="report-mini-grid">
          <div className="report-mini-item">
            <span>Progress Entries</span>

            <strong>{formatNumber(overview.periodProgress)}</strong>
          </div>

          <div className="report-mini-item">
            <span>Total Goals</span>

            <strong>{formatNumber(overview.totalGoals)}</strong>
          </div>

          <div className="report-mini-item">
            <span>Active Goals</span>

            <strong>{formatNumber(overview.activeGoals)}</strong>
          </div>

          <div className="report-mini-item">
            <span>Total Notifications</span>

            <strong>{formatNumber(overview.totalNotifications)}</strong>
          </div>

          <div className="report-mini-item">
            <span>Unread Notifications</span>

            <strong>{formatNumber(overview.unreadNotifications)}</strong>
          </div>

          <div className="report-mini-item">
            <span>Goal Completion</span>

            <strong>{overview.goalCompletionRate || 0}%</strong>
          </div>
        </div>
      </div>

      <div className="report-summary">
        <div>
          <FaChartBar />

          <div>
            <strong>Platform Report Summary</strong>

            <p>
              {formatNumber(overview.periodWorkouts)} workouts,{" "}
              {formatNumber(overview.periodNutrition)} nutrition logs and{" "}
              {formatNumber(overview.periodUsers)} new users during{" "}
              {report?.periodLabel?.toLowerCase()}.
            </p>
          </div>
        </div>

        <span className="summary-badge">
          {overview.goalCompletionRate || 0}% Goals Completed
        </span>
      </div>
    </div>
  );
}

export default AdminReports;
