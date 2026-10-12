import { useEffect, useMemo, useState } from "react";
import {
  FaTicketAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaEye,
  FaTrash,
  FaTimes,
  FaSave,
  FaUser,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./AdminSupport.css";

function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editData, setEditData] = useState({
    status: "open",
    priority: "medium",
    category: "Technical",
    adminResponse: "",
  });

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [search, status, priority, category]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (status !== "all") params.set("status", status);
      if (priority !== "all") params.set("priority", priority);
      if (category !== "all") params.set("category", category);

      const response = await authRequest(`/admin/support?${params.toString()}`);

      if (!response.success) {
        throw new Error(response.message || "Unable to load tickets");
      }

      setTickets(response.tickets || []);
    } catch (error) {
      console.error("Load admin support tickets error:", error);
      setError(error.message || "Unable to load support tickets.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authRequest("/admin/support/stats");

      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error("Load support stats error:", error);
    }
  };

  const openTicket = (ticket) => {
    setSelectedTicket(ticket);

    setEditData({
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      adminResponse: ticket.adminResponse || "",
    });
  };

  const closeModal = () => {
    if (!saving) {
      setSelectedTicket(null);
    }
  };

  const handleSave = async () => {
    if (!selectedTicket) return;

    try {
      setSaving(true);

      const response = await authRequest(
        `/admin/support/${selectedTicket._id}`,
        {
          method: "PUT",
          body: JSON.stringify(editData),
        },
      );

      if (!response.success) {
        throw new Error(response.message || "Unable to update ticket");
      }

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === selectedTicket._id ? response.ticket : ticket,
        ),
      );

      setSelectedTicket(response.ticket);

      await loadStats();
    } catch (error) {
      console.error("Update support ticket error:", error);
      setError(error.message || "Unable to update ticket.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ticketId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this support ticket?",
    );

    if (!confirmed) return;

    try {
      const response = await authRequest(`/admin/support/${ticketId}`, {
        method: "DELETE",
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to delete ticket");
      }

      setTickets((prev) => prev.filter((ticket) => ticket._id !== ticketId));

      setSelectedTicket(null);
      await loadStats();
    } catch (error) {
      console.error("Delete support ticket error:", error);
      setError(error.message || "Unable to delete ticket.");
    }
  };

  const getStatusLabel = (value) => {
    if (value === "in-progress") return "In Progress";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const getPriorityLabel = (value) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  const visibleTickets = useMemo(() => tickets, [tickets]);

  return (
    <div className="admin-support-page">
      <div className="admin-support-header">
        <div>
          <span className="admin-support-eyebrow">Support Management</span>

          <h1>Support Tickets</h1>

          <p>Review customer support requests and manage ticket responses.</p>
        </div>
      </div>

      <div className="admin-support-stats">
        <div className="admin-support-stat">
          <div className="admin-support-stat-icon total">
            <FaTicketAlt />
          </div>

          <div>
            <span>Total Tickets</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="admin-support-stat">
          <div className="admin-support-stat-icon open">
            <FaClock />
          </div>

          <div>
            <span>Open</span>
            <strong>{stats.open}</strong>
          </div>
        </div>

        <div className="admin-support-stat">
          <div className="admin-support-stat-icon progress">
            <FaClock />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{stats.inProgress}</strong>
          </div>
        </div>

        <div className="admin-support-stat">
          <div className="admin-support-stat-icon resolved">
            <FaCheckCircle />
          </div>

          <div>
            <span>Resolved</span>
            <strong>{stats.resolved}</strong>
          </div>
        </div>

        <div className="admin-support-stat">
          <div className="admin-support-stat-icon urgent">
            <FaExclamationTriangle />
          </div>

          <div>
            <span>Urgent</span>
            <strong>{stats.urgent}</strong>
          </div>
        </div>
      </div>

      <div className="admin-support-filter-card">
        <div className="admin-support-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Search ticket, user or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option>Technical</option>
          <option>Nutrition</option>
          <option>Workouts</option>
          <option>Progress</option>
          <option>Goals</option>
          <option>Account</option>
          <option>Other</option>
        </select>
      </div>

      <div className="admin-support-table-card">
        <div className="admin-support-table-header">
          <div>
            <h2>All Support Tickets</h2>
            <span>{visibleTickets.length} tickets found</span>
          </div>
        </div>

        {loading ? (
          <div className="admin-support-state">Loading support tickets...</div>
        ) : error ? (
          <div className="admin-support-state error">{error}</div>
        ) : visibleTickets.length === 0 ? (
          <div className="admin-support-state">No support tickets found.</div>
        ) : (
          <div className="admin-support-table-wrapper">
            <table className="admin-support-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>User</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleTickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <strong className="admin-ticket-id">
                        {ticket.ticketId}
                      </strong>
                    </td>

                    <td>
                      <div className="admin-ticket-user">
                        <div className="admin-ticket-avatar">
                          {ticket.user?.profilePhoto ? (
                            <img
                              src={ticket.user.profilePhoto}
                              alt={ticket.user.name}
                            />
                          ) : (
                            <FaUser />
                          )}
                        </div>

                        <div>
                          <strong>{ticket.user?.name || "Unknown User"}</strong>

                          <small>{ticket.user?.email || "—"}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong>{ticket.subject}</strong>
                    </td>

                    <td>{ticket.category}</td>

                    <td>
                      <span className={`admin-priority ${ticket.priority}`}>
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </td>

                    <td>
                      <span className={`admin-status ${ticket.status}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>

                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>

                    <td>
                      <div className="admin-ticket-actions">
                        <button
                          type="button"
                          onClick={() => openTicket(ticket)}
                          title="View ticket"
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleDelete(ticket._id)}
                          title="Delete ticket"
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

      {selectedTicket && (
        <div
          className="admin-support-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="admin-support-modal">
            <div className="admin-support-modal-header">
              <div>
                <span>Ticket Details</span>
                <h2>{selectedTicket.subject}</h2>
                <small>{selectedTicket.ticketId}</small>
              </div>

              <button type="button" onClick={closeModal} disabled={saving}>
                <FaTimes />
              </button>
            </div>

            <div className="admin-support-modal-body">
              <div className="admin-support-user-box">
                <FaUser />

                <div>
                  <strong>{selectedTicket.user?.name || "Unknown User"}</strong>

                  <span>{selectedTicket.user?.email || "—"}</span>
                </div>
              </div>

              <div className="admin-ticket-description">
                <label>Description</label>
                <p>{selectedTicket.description}</p>
              </div>

              <div className="admin-support-edit-grid">
                <div>
                  <label>Status</label>

                  <select
                    value={editData.status}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label>Priority</label>

                  <select
                    value={editData.priority}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label>Category</label>

                  <select
                    value={editData.category}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    <option>Technical</option>
                    <option>Nutrition</option>
                    <option>Workouts</option>
                    <option>Progress</option>
                    <option>Goals</option>
                    <option>Account</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="full">
                  <label>Admin Response</label>

                  <textarea
                    rows="6"
                    placeholder="Write a response to the user..."
                    value={editData.adminResponse}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        adminResponse: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="admin-support-modal-footer">
              <button
                type="button"
                className="admin-delete-btn"
                onClick={() => handleDelete(selectedTicket._id)}
                disabled={saving}
              >
                <FaTrash />
                Delete
              </button>

              <button
                type="button"
                className="admin-close-btn"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                <FaSave />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSupport;
