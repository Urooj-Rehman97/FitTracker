import { useEffect, useMemo, useState } from "react";
import {
  FaQuestionCircle,
  FaSearch,
  FaPlus,
  FaTicketAlt,
  FaClock,
  FaCheckCircle,
  FaTimes,
  FaTrash,
  FaEye,
  FaEnvelope,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./Support.css";

function Support() {
  const [tickets, setTickets] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "Technical",
    priority: "medium",
  });

  const faqs = [
    {
      question: "How do I create a workout?",
      answer:
        "Open the Workouts page from your dashboard and use the Add Workout button to create a new workout.",
    },
    {
      question: "How can I track my nutrition?",
      answer:
        "Go to the Nutrition page and add your meals with calories, protein, carbohydrates and fats.",
    },
    {
      question: "How do I create a fitness goal?",
      answer:
        "Open Goals from your dashboard, choose a goal category and enter your starting value, target and deadline.",
    },
    {
      question: "How can I update my profile?",
      answer:
        "Open Profile from the dashboard and update your personal information, height, bio and profile photo.",
    },
    {
      question: "How can I enable dark mode?",
      answer:
        "Open Settings and enable Dark Mode from the appearance settings.",
    },
  ];

  const [faqSearch, setFaqSearch] = useState("");

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authRequest("/support");

      if (!response.success) {
        throw new Error(
          response.message || "Failed to load support tickets"
        );
      }

      setTickets(response.tickets || []);
    } catch (err) {
      console.error("Load support tickets error:", err);

      setError(
        err.message || "Unable to load support tickets."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!formData.subject.trim()) {
        setError("Please enter a subject.");
        return;
      }

      if (!formData.message.trim()) {
        setError("Please describe your issue.");
        return;
      }

      const response = await authRequest("/support", {
        method: "POST",
        body: JSON.stringify({
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          category: formData.category,
          priority: formData.priority,
        }),
      });

      if (!response.success) {
        throw new Error(
          response.message || "Failed to create support ticket"
        );
      }

      setTickets((prev) => [
        response.ticket,
        ...prev,
      ]);

      setFormData({
        subject: "",
        message: "",
        category: "Technical",
        priority: "medium",
      });

      setShowCreateModal(false);

      setSuccess(
        "Your support ticket has been submitted successfully."
      );
    } catch (err) {
      console.error("Create ticket error:", err);

      setError(
        err.message || "Unable to create support ticket."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this support ticket?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await authRequest(
        `/support/${ticketId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.success) {
        throw new Error(
          response.message || "Failed to delete ticket"
        );
      }

      setTickets((prev) =>
        prev.filter((ticket) => ticket._id !== ticketId)
      );

      setSelectedTicket(null);

      setSuccess(
        "Support ticket deleted successfully."
      );
    } catch (err) {
      console.error("Delete ticket error:", err);

      setError(
        err.message || "Unable to delete support ticket."
      );
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        ticket.ticketId?.toLowerCase().includes(searchValue) ||
        ticket.subject?.toLowerCase().includes(searchValue) ||
        ticket.category?.toLowerCase().includes(searchValue);

      const matchesStatus =
        status === "all" ||
        ticket.status === status;

      const matchesPriority =
        priority === "all" ||
        ticket.priority === priority;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [tickets, search, status, priority]);

  const filteredFaqs = useMemo(() => {
    const value = faqSearch.trim().toLowerCase();

    if (!value) return faqs;

    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(value) ||
        faq.answer.toLowerCase().includes(value)
    );
  }, [faqSearch]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,

      open: tickets.filter(
        (ticket) => ticket.status === "open"
      ).length,

      inProgress: tickets.filter(
        (ticket) => ticket.status === "in-progress"
      ).length,

      resolved: tickets.filter(
        (ticket) =>
          ticket.status === "resolved" ||
          ticket.status === "closed"
      ).length,
    };
  }, [tickets]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const getStatusLabel = (value) => {
    if (value === "in-progress") return "In Progress";
    if (value === "resolved") return "Resolved";
    if (value === "closed") return "Closed";
    return "Open";
  };

  const getPriorityLabel = (value) => {
    if (!value) return "Medium";

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  };

  return (
    <div className="support-page">
      {/* HEADER */}
      <div className="support-header">
        <div>
          <span className="support-eyebrow">
            HELP CENTER
          </span>

          <h1>Support</h1>

          <p>
            Get help with your FitTrack account,
            workouts and fitness tracking.
          </p>
        </div>

        <button
          type="button"
          className="support-create-btn"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowCreateModal(true);
          }}
        >
          <FaPlus />
          New Ticket
        </button>
      </div>

      {/* ALERTS */}
      {success && (
        <div className="support-alert support-alert-success">
          <FaCheckCircle />
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {error && (
        <div className="support-alert support-alert-error">
          <FaExclamationTriangle />
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="support-stats">
        <div className="support-stat-card">
          <div className="support-stat-icon total">
            <FaTicketAlt />
          </div>

          <div>
            <span>Total Tickets</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="support-stat-card">
          <div className="support-stat-icon open">
            <FaClock />
          </div>

          <div>
            <span>Open</span>
            <strong>{stats.open}</strong>
          </div>
        </div>

        <div className="support-stat-card">
          <div className="support-stat-icon progress">
            <FaInfoCircle />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{stats.inProgress}</strong>
          </div>
        </div>

        <div className="support-stat-card">
          <div className="support-stat-icon resolved">
            <FaCheckCircle />
          </div>

          <div>
            <span>Resolved</span>
            <strong>{stats.resolved}</strong>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="support-section">
        <div className="support-section-header">
          <div>
            <span className="support-section-icon">
              <FaQuestionCircle />
            </span>

            <div>
              <h2>Frequently Asked Questions</h2>
              <p>
                Find quick answers to common questions.
              </p>
            </div>
          </div>
        </div>

        <div className="support-faq-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Search frequently asked questions..."
            value={faqSearch}
            onChange={(e) =>
              setFaqSearch(e.target.value)
            }
          />
        </div>

        <div className="support-faq-list">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <details
                className="support-faq-item"
                key={index}
              >
                <summary>
                  <span>{faq.question}</span>

                  <span className="support-faq-plus">
                    +
                  </span>
                </summary>

                <div className="support-faq-answer">
                  {faq.answer}
                </div>
              </details>
            ))
          ) : (
            <div className="support-empty">
              <FaQuestionCircle />
              <p>No FAQs found.</p>
            </div>
          )}
        </div>
      </section>

      {/* TICKETS */}
      <section className="support-section">
        <div className="support-section-header support-ticket-header">
          <div>
            <span className="support-section-icon">
              <FaTicketAlt />
            </span>

            <div>
              <h2>My Support Tickets</h2>

              <p>
                Track your support requests and responses.
              </p>
            </div>
          </div>
        </div>

        <div className="support-filters">
          <div className="support-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            <option value="all">All Status</option>

            <option value="open">Open</option>

            <option value="in-progress">
              In Progress
            </option>

            <option value="resolved">
              Resolved
            </option>

            <option value="closed">Closed</option>
          </select>

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
          >
            <option value="all">All Priority</option>

            <option value="low">Low</option>

            <option value="medium">Medium</option>

            <option value="high">High</option>

            <option value="urgent">Urgent</option>
          </select>
        </div>

        {loading ? (
          <div className="support-loading">
            <div className="support-spinner"></div>

            <p>Loading your support tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="support-empty support-ticket-empty">
            <FaTicketAlt />

            <h3>No support tickets found</h3>

            <p>
              You haven't created any tickets matching
              your current filters.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setPriority("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="support-ticket-list">
            {filteredTickets.map((ticket) => (
              <div
                className="support-ticket-card"
                key={ticket._id}
              >
                <div className="support-ticket-main">
                  <div className="support-ticket-icon">
                    <FaTicketAlt />
                  </div>

                  <div className="support-ticket-info">
                    <div className="support-ticket-top">
                      <span className="support-ticket-id">
                        {ticket.ticketId}
                      </span>

                      <span
                        className={`support-status ${ticket.status}`}
                      >
                        {getStatusLabel(
                          ticket.status
                        )}
                      </span>
                    </div>

                    <h3>{ticket.subject}</h3>

                    <p>
                      {ticket.description}
                    </p>

                    <div className="support-ticket-meta">
                      <span>
                        {ticket.category}
                      </span>

                      <span
                        className={`support-priority ${ticket.priority}`}
                      >
                        {getPriorityLabel(
                          ticket.priority
                        )}
                      </span>

                      <span>
                        {formatDate(
                          ticket.createdAt
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="support-ticket-actions">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTicket(ticket)
                    }
                    title="View ticket"
                  >
                    <FaEye />
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() =>
                      handleDeleteTicket(
                        ticket._id
                      )
                    }
                    title="Delete ticket"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CONTACT */}
      <div className="support-contact-card">
        <div className="support-contact-icon">
          <FaEnvelope />
        </div>

        <div>
          <h3>Still need help?</h3>

          <p>
            Create a support ticket and our team will
            review your request.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          Contact Support
        </button>
      </div>

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div
          className="support-modal-overlay"
          onClick={() =>
            !saving && setShowCreateModal(false)
          }
        >
          <div
            className="support-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="support-modal-header">
              <div>
                <span className="support-modal-icon">
                  <FaTicketAlt />
                </span>

                <div>
                  <h2>Create Support Ticket</h2>

                  <p>
                    Tell us how we can help you.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  !saving &&
                  setShowCreateModal(false)
                }
              >
                <FaTimes />
              </button>
            </div>

            <form
              className="support-form"
              onSubmit={handleCreateTicket}
            >
              <div className="support-form-group">
                <label htmlFor="support-subject">
                  Subject
                </label>

                <input
                  id="support-subject"
                  name="subject"
                  type="text"
                  placeholder="What do you need help with?"
                  value={formData.subject}
                  onChange={handleFormChange}
                  maxLength={150}
                  required
                />
              </div>

              <div className="support-form-row">
                <div className="support-form-group">
                  <label htmlFor="support-category">
                    Category
                  </label>

                  <select
                    id="support-category"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                  >
                    <option value="Technical">
                      Technical
                    </option>

                    <option value="Account">
                      Account
                    </option>

                    <option value="Workouts">
                      Workouts
                    </option>

                    <option value="Nutrition">
                      Nutrition
                    </option>

                    <option value="Payment">
                      Payment
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="support-form-group">
                  <label htmlFor="support-priority">
                    Priority
                  </label>

                  <select
                    id="support-priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                  >
                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>

                    <option value="urgent">
                      Urgent
                    </option>
                  </select>
                </div>
              </div>

              <div className="support-form-group">
                <label htmlFor="support-message">
                  Describe your issue
                </label>

                <textarea
                  id="support-message"
                  name="message"
                  placeholder="Please explain your issue in detail..."
                  value={formData.message}
                  onChange={handleFormChange}
                  rows="6"
                  maxLength={2000}
                  required
                />
              </div>

              <div className="support-modal-actions">
                <button
                  type="button"
                  className="support-cancel-btn"
                  onClick={() =>
                    !saving &&
                    setShowCreateModal(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="support-submit-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Submitting..."
                    : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TICKET MODAL */}
      {selectedTicket && (
        <div
          className="support-modal-overlay"
          onClick={() =>
            setSelectedTicket(null)
          }
        >
          <div
            className="support-modal support-view-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="support-modal-header">
              <div>
                <span className="support-modal-icon">
                  <FaTicketAlt />
                </span>

                <div>
                  <h2>
                    {selectedTicket.ticketId}
                  </h2>

                  <p>
                    {getStatusLabel(
                      selectedTicket.status
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTicket(null)
                }
              >
                <FaTimes />
              </button>
            </div>

            <div className="support-view-content">
              <div className="support-view-row">
                <span>Subject</span>

                <strong>
                  {selectedTicket.subject}
                </strong>
              </div>

              <div className="support-view-row">
                <span>Category</span>

                <strong>
                  {selectedTicket.category}
                </strong>
              </div>

              <div className="support-view-row">
                <span>Priority</span>

                <strong>
                  {getPriorityLabel(
                    selectedTicket.priority
                  )}
                </strong>
              </div>

              <div className="support-view-row">
                <span>Created</span>

                <strong>
                  {formatDate(
                    selectedTicket.createdAt
                  )}
                </strong>
              </div>

              <div className="support-view-message">
                <span>Your Message</span>

                <p>
                  {selectedTicket.description}
                </p>
              </div>

              {selectedTicket.adminResponse && (
                <div className="support-admin-response">
                  <div>
                    <FaCheckCircle />

                    <strong>
                      Admin Response
                    </strong>
                  </div>

                  <p>
                    {selectedTicket.adminResponse}
                  </p>
                </div>
              )}
            </div>

            <div className="support-modal-actions">
              <button
                type="button"
                className="support-cancel-btn"
                onClick={() =>
                  setSelectedTicket(null)
                }
              >
                Close
              </button>

              <button
                type="button"
                className="support-delete-btn"
                onClick={() =>
                  handleDeleteTicket(
                    selectedTicket._id
                  )
                }
              >
                <FaTrash />
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Support;