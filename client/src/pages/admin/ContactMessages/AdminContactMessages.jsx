import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import {
  FaCheck,
  FaEnvelope,
  FaEye,
  FaInbox,
  FaPaperPlane,
  FaReply,
  FaSearch,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

import {
  getContactMessages,
  getContactMessage,
  updateContactMessage,
  deleteContactMessage,
} from "../../../services/api";

import "./AdminContactMessages.css";

const STATUS_OPTIONS = ["all", "new", "read", "replied", "closed"];

const getStatusVariant = (status) => {
  switch (status) {
    case "new":
      return "danger";
    case "read":
      return "warning";
    case "replied":
      return "success";
    case "closed":
      return "secondary";
    default:
      return "primary";
  }
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [reply, setReply] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("new");

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getContactMessages();

      if (response?.success) {
        setMessages(response.messages || response.data || []);
      } else {
        setMessages([]);
        setError(response?.message || "Unable to load contact messages.");
      }
    } catch (err) {
      setError(err.message || "Unable to load contact messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  const filteredMessages = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesStatus =
        statusFilter === "all" || message.status === statusFilter;

      if (!keyword) return matchesStatus;

      const searchableText = [
        message.name,
        message.email,
        message.subject,
        message.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchableText.includes(keyword);
    });
  }, [messages, search, statusFilter]);

  const counts = useMemo(
    () => ({
      all: messages.length,
      new: messages.filter((item) => item.status === "new").length,
      read: messages.filter((item) => item.status === "read").length,
      replied: messages.filter((item) => item.status === "replied").length,
      closed: messages.filter((item) => item.status === "closed").length,
    }),
    [messages],
  );

  const openMessage = async (id) => {
    try {
      setDetailLoading(true);
      setError("");

      const response = await getContactMessage(id);

      if (response?.success) {
        const message = response.message || response.data;

        setSelectedMessage(message);
        setReply(message?.reply || "");
        setSelectedStatus(message?.status || "new");
        setShowModal(true);

        if (message?.status === "new") {
          await updateContactMessage(id, { status: "read" });

          setMessages((prev) =>
            prev.map((item) =>
              item._id === id ? { ...item, status: "read" } : item,
            ),
          );

          setSelectedMessage((prev) =>
            prev ? { ...prev, status: "read" } : prev,
          );

          setSelectedStatus("read");
        }
      } else {
        setError(response?.message || "Unable to open this message.");
      }
    } catch (err) {
      setError(err.message || "Unable to open this message.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMessage?._id) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await updateContactMessage(selectedMessage._id, {
        status: selectedStatus,
        reply,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to update message.");
      }

      const updatedMessage = response.message || response.data;

      setMessages((prev) =>
        prev.map((item) =>
          item._id === selectedMessage._id
            ? {
                ...item,
                ...(updatedMessage || {}),
                status: selectedStatus,
                reply,
              }
            : item,
        ),
      );

      setSelectedMessage((prev) =>
        prev
          ? {
              ...prev,
              ...(updatedMessage || {}),
              status: selectedStatus,
              reply,
            }
          : prev,
      );

      setSuccess("Message updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update message.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage?._id) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this message?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await deleteContactMessage(selectedMessage._id);

      if (!response?.success) {
        throw new Error(response?.message || "Unable to delete message.");
      }

      setMessages((prev) =>
        prev.filter((item) => item._id !== selectedMessage._id),
      );

      setShowModal(false);
      setSelectedMessage(null);
      setSuccess("Message deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete message.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    if (actionLoading) return;

    setShowModal(false);
    setSelectedMessage(null);
    setReply("");
    setSelectedStatus("new");
  };

  return (
    <div className="admin-contact-page">
      <div className="admin-contact-header">
        <div>
          <div className="admin-contact-eyebrow">
            <FaEnvelope />
            Communication
          </div>

          <h1>Contact Messages</h1>

          <p>
            Manage messages submitted through the FitTrack public contact form.
          </p>
        </div>

        <Button
          className="admin-contact-refresh-btn"
          onClick={loadMessages}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : "Refresh"}
        </Button>
      </div>

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError("")}
          className="admin-contact-alert"
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccess("")}
          className="admin-contact-alert"
        >
          {success}
        </Alert>
      )}

      <Row className="g-3 mb-4">
        <Col xl={3} md={6}>
          <Card className="admin-message-stat-card">
            <Card.Body>
              <div className="admin-message-stat-icon">
                <FaInbox />
              </div>
              <div>
                <span>Total Messages</span>
                <strong>{counts.all}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="admin-message-stat-card">
            <Card.Body>
              <div className="admin-message-stat-icon">
                <FaEnvelope />
              </div>
              <div>
                <span>New</span>
                <strong>{counts.new}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="admin-message-stat-card">
            <Card.Body>
              <div className="admin-message-stat-icon">
                <FaReply />
              </div>
              <div>
                <span>Replied</span>
                <strong>{counts.replied}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="admin-message-stat-card">
            <Card.Body>
              <div className="admin-message-stat-icon">
                <FaCheck />
              </div>
              <div>
                <span>Closed</span>
                <strong>{counts.closed}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="admin-contact-card">
        <Card.Body>
          <div className="admin-contact-toolbar">
            <div className="admin-contact-search">
              <FaSearch />
              <Form.Control
                type="text"
                placeholder="Search name, email, subject or message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Form.Select
              className="admin-contact-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "all"
                    ? "All Statuses"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </Form.Select>
          </div>

          {loading ? (
            <div className="admin-contact-loading">
              <Spinner />
              <p>Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="admin-contact-empty">
              <div className="admin-contact-empty-icon">
                <FaEnvelope />
              </div>
              <h4>No messages found</h4>
              <p>
                {messages.length === 0
                  ? "No contact messages have been submitted yet."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          ) : (
            <div className="admin-contact-table-wrapper">
              <table className="admin-contact-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMessages.map((message) => (
                    <tr key={message._id}>
                      <td>
                        <div className="message-sender">
                          <strong>{message.name}</strong>
                          <span>{message.email}</span>
                        </div>
                      </td>

                      <td>
                        <strong>{message.subject}</strong>
                      </td>

                      <td>
                        <div className="message-preview">{message.message}</div>
                      </td>

                      <td>
                        <Badge bg={getStatusVariant(message.status)}>
                          {message.status}
                        </Badge>
                      </td>

                      <td>{formatDate(message.createdAt)}</td>

                      <td className="text-end">
                        <Button
                          size="sm"
                          className="admin-view-message-btn"
                          onClick={() => openMessage(message._id)}
                          disabled={detailLoading}
                        >
                          <FaEye />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        size="lg"
        className="admin-contact-modal"
      >
        <Modal.Header>
          <Modal.Title>
            <FaEnvelope />
            Message Details
          </Modal.Title>

          <Button
            variant="link"
            className="admin-modal-close"
            onClick={closeModal}
            disabled={actionLoading}
          >
            <FaTimes />
          </Button>
        </Modal.Header>

        <Modal.Body>
          {detailLoading ? (
            <div className="admin-contact-loading">
              <Spinner />
              <p>Loading message...</p>
            </div>
          ) : selectedMessage ? (
            <>
              <div className="message-detail-header">
                <div>
                  <span>From</span>
                  <h5>{selectedMessage.name}</h5>
                  <a href={`mailto:${selectedMessage.email}`}>
                    {selectedMessage.email}
                  </a>
                </div>

                <Badge bg={getStatusVariant(selectedMessage.status)}>
                  {selectedMessage.status}
                </Badge>
              </div>

              <div className="message-detail-meta">
                <div>
                  <span>Subject</span>
                  <strong>{selectedMessage.subject}</strong>
                </div>

                <div>
                  <span>Received</span>
                  <strong>{formatDate(selectedMessage.createdAt)}</strong>
                </div>
              </div>

              <div className="message-detail-content">
                <span>Message</span>
                <p>{selectedMessage.message}</p>
              </div>

              <hr />

              <Row className="g-3">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>Message Status</Form.Label>

                    <Form.Select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      disabled={actionLoading}
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="closed">Closed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={7}>
                  <Form.Group>
                    <Form.Label>Reply</Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Write your reply here..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      disabled={actionLoading}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {selectedMessage.reply && (
                <div className="previous-reply-box">
                  <span>Previous Reply</span>
                  <p>{selectedMessage.reply}</p>
                </div>
              )}
            </>
          ) : null}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-danger"
            onClick={handleDelete}
            disabled={actionLoading || !selectedMessage}
          >
            <FaTrash />
            Delete
          </Button>

          <div className="admin-modal-actions">
            <Button
              variant="light"
              onClick={closeModal}
              disabled={actionLoading}
            >
              Cancel
            </Button>

            <Button
              className="admin-save-message-btn"
              onClick={handleUpdate}
              disabled={actionLoading || !selectedMessage}
            >
              {actionLoading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <FaPaperPlane />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminContactMessages;
