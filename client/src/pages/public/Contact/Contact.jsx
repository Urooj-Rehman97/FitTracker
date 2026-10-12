import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Spinner, Alert } from "react-bootstrap";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import {
  getPublicPageContent,
  createContactMessage,
} from "../../../services/api";

import "./Contact.css";

const defaultContactData = {
  heroTag: "GET IN TOUCH",
  heroTitle: "We're Here To Help You.",
  heroText:
    "Have a question, suggestion or need assistance? Our support team is ready to help you with your FitTrack journey.",
  heroImage:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85",

  heroPoints: [
    "Fast response from our support team",
    "Help with your FitTrack account",
    "Guidance whenever you need it",
  ],

  email: "support@fittrack.com",
  phone: "+92 300 1234567",
  location: "Karachi, Pakistan",
  workingHours: "Mon - Sat, 9:00 AM - 6:00 PM",

  sectionTag: "CONTACT INFORMATION",
  sectionTitle: "Let's Start a Conversation.",
  sectionText:
    "Whether you need help with your account, have feedback about FitTrack, or simply want to ask a question, feel free to reach out.",

  formTag: "SEND US A MESSAGE",
  formTitle: "How Can We Help?",
  formText:
    "Fill out the form below and our team will get back to you as soon as possible.",

  successMessage:
    "Your message has been sent successfully. Our support team will get back to you soon.",

  ctaTag: "NEED QUICK ANSWERS?",
  ctaTitle: "Check Our Support.",
  ctaText:
    "Find helpful information and solutions to common questions about FitTrack.",
  ctaButton: "Contact Support",
};

const subjectOptions = [
  "Account Support",
  "Workout Tracking",
  "Nutrition Tracking",
  "Technical Issue",
  "Feedback",
  "Other",
];

function normalizeTitle(title, fallback) {
  const value =
    typeof title === "string" && title.trim()
      ? title.trim()
      : fallback;

  if (value.includes("|")) {
    return value
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);
  }

  if (value.includes("\n")) {
    return value
      .split("\n")
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return [value];
}

function Contact() {
  const [contactData, setContactData] = useState(defaultContactData);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadContactContent = async () => {
      try {
        const response = await getPublicPageContent("contact");

        if (
          mounted &&
          response?.success &&
          response?.content
        ) {
          setContactData({
            ...defaultContactData,
            ...response.content,
            heroPoints:
              Array.isArray(response.content.heroPoints) &&
              response.content.heroPoints.length
                ? response.content.heroPoints
                : defaultContactData.heroPoints,
          });
        }
      } catch (error) {
        console.error("Load public contact content error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadContactContent();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject;
    const message = formData.message.trim();

    if (!name || !email || !subject || !message) {
      setErrorMessage(
        "Please fill in all fields before sending your message."
      );
      return;
    }

    if (name.length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (message.length < 10) {
      setErrorMessage(
        "Please enter a message of at least 10 characters."
      );
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSubmitted(false);

      await createContactMessage({
        name,
        email,
        subject,
        message,
      });

      setSubmitted(true);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact form submission error:", error);

      setErrorMessage(
        error?.message ||
          "Unable to send your message right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="contact-loading">
        <Spinner animation="border" />
        <span>Loading FitTrack...</span>
      </div>
    );
  }

  const heroTitle = normalizeTitle(
    contactData.heroTitle,
    defaultContactData.heroTitle
  );

  const sectionTitle = normalizeTitle(
    contactData.sectionTitle,
    defaultContactData.sectionTitle
  );

  const formTitle = normalizeTitle(
    contactData.formTitle,
    defaultContactData.formTitle
  );

  const ctaTitle = normalizeTitle(
    contactData.ctaTitle,
    defaultContactData.ctaTitle
  );

  return (
    <div className="contact-page">
      {/* ================= HERO ================= */}

      <section className="contact-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className="contact-hero-content">
                <span>{contactData.heroTag}</span>

                <h1>
                  {heroTitle.map((line, index) => (
                    <span key={`${line}-${index}`}>
                      {index === heroTitle.length - 1 ? (
                        <strong>{line}</strong>
                      ) : (
                        line
                      )}

                      {index < heroTitle.length - 1 && <br />}
                    </span>
                  ))}
                </h1>

                <p>{contactData.heroText}</p>

                <div className="contact-hero-points">
                  {(
                    contactData.heroPoints ||
                    defaultContactData.heroPoints
                  ).map((point, index) => (
                    <div key={`${point}-${index}`}>
                      <FaCheckCircle />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            <Col lg={6}>
              <div className="contact-hero-visual">
                <div className="contact-circle contact-circle-one" />
                <div className="contact-circle contact-circle-two" />

                <img
                  src={
                    contactData.heroImage ||
                    defaultContactData.heroImage
                  }
                  alt="Fitness training at FitTrack"
                />

                <div className="contact-floating-card">
                  <div className="contact-floating-icon">
                    <FaEnvelope />
                  </div>

                  <div>
                    <small>Need Help?</small>
                    <strong>We're Listening</strong>
                    <span>{contactData.email}</span>
                  </div>
                </div>

                <div className="contact-response-card">
                  <div className="response-dot" />

                  <div>
                    <strong>Quick Response</strong>
                    <span>Usually within 24 hours</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= CONTACT SECTION ================= */}

      <section className="contact-main" id="contact-form">
        <Container>
          <Row className="g-5">
            <Col lg={5}>
              <div className="contact-info">
                <span className="contact-section-tag">
                  {contactData.sectionTag}
                </span>

                <h2>
                  {sectionTitle.map((line, index) => (
                    <span key={`${line}-${index}`}>
                      {index === sectionTitle.length - 1 ? (
                        <strong>{line}</strong>
                      ) : (
                        line
                      )}

                      {index < sectionTitle.length - 1 && <br />}
                    </span>
                  ))}
                </h2>

                <p>{contactData.sectionText}</p>

                <div className="contact-details">
                  <ContactDetail
                    icon={<FaEnvelope />}
                    title="Email Us"
                    value={contactData.email}
                  />

                  <ContactDetail
                    icon={<FaPhoneAlt />}
                    title="Call Us"
                    value={contactData.phone}
                  />

                  <ContactDetail
                    icon={<FaMapMarkerAlt />}
                    title="Our Location"
                    value={contactData.location}
                  />

                  <ContactDetail
                    icon={<FaClock />}
                    title="Working Hours"
                    value={contactData.workingHours}
                  />
                </div>

                <div className="contact-support-box">
                  <FaCheckCircle />

                  <div>
                    <strong>Quick Support</strong>
                    <p>
                      We usually respond within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </Col>

            {/* ================= FORM ================= */}

            <Col lg={7}>
              <div className="contact-form-box">
                <div className="contact-form-heading">
                  <span>{contactData.formTag}</span>

                  <h2>
                    {formTitle.map((line, index) => (
                      <span key={`${line}-${index}`}>
                        {index === formTitle.length - 1 ? (
                          <strong>{line}</strong>
                        ) : (
                          line
                        )}

                        {index < formTitle.length - 1 && <br />}
                      </span>
                    ))}
                  </h2>

                  <p>{contactData.formText}</p>
                </div>

                {submitted && (
                  <Alert
                    variant="success"
                    className="mb-4"
                    onClose={() => setSubmitted(false)}
                    dismissible
                  >
                    <strong>Message sent!</strong>{" "}
                    {contactData.successMessage}
                  </Alert>
                )}

                {errorMessage && (
                  <Alert
                    variant="danger"
                    className="mb-4"
                    onClose={() => setErrorMessage("")}
                    dismissible
                  >
                    {errorMessage}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="contactName">
                        <Form.Label>Full Name</Form.Label>

                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          required
                          disabled={submitting}
                          maxLength={100}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="contactEmail">
                        <Form.Label>Email Address</Form.Label>

                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                          disabled={submitting}
                          maxLength={150}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group controlId="contactSubject">
                        <Form.Label>Subject</Form.Label>

                        <Form.Select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          disabled={submitting}
                        >
                          <option value="" disabled>
                            Select a subject
                          </option>

                          {subjectOptions.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group controlId="contactMessage">
                        <Form.Label>Message</Form.Label>

                        <Form.Control
                          as="textarea"
                          rows={6}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Write your message..."
                          required
                          disabled={submitting}
                          maxLength={2000}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <button
                        type="submit"
                        className="contact-submit-btn"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              aria-hidden="true"
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <FaArrowRight />
                          </>
                        )}
                      </button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= SUPPORT CTA ================= */}

      <section className="contact-bottom">
        <Container>
          <div className="contact-bottom-box">
            <div>
              <span>{contactData.ctaTag}</span>

              <h2>
                {ctaTitle.map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {index === ctaTitle.length - 1 ? (
                      <strong>{line}</strong>
                    ) : (
                      line
                    )}

                    {index < ctaTitle.length - 1 && <br />}
                  </span>
                ))}
              </h2>

              <p>{contactData.ctaText}</p>
            </div>

            <Link
              to="/contact#contact-form"
              className="contact-bottom-btn"
            >
              {contactData.ctaButton}
              <FaArrowRight />
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}

function ContactDetail({ icon, title, value }) {
  return (
    <div className="contact-detail">
      <div className="contact-detail-icon">{icon}</div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default Contact;