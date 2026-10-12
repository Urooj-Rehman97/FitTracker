import { useEffect, useState } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
} from "react-bootstrap";

import {
  FaBullseye,
  FaHeartbeat,
  FaUsers,
  FaChartLine,
  FaDumbbell,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import {
  getPublicPageContent,
} from "../../../services/api";

import "./About.css";

const defaultAboutData = {
  heroTag: "ABOUT FITTRACK",

  heroTitle:
    "Fitness Is Not Just a Goal. It's a Lifestyle.",

  heroText:
    "FitTrack is a modern fitness management platform designed to make your fitness journey simple, measurable and consistent.",

  heroImage:
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=85",

  heroButton: "Start Your Journey",

  experienceNumber: "10K+",
  experienceText: "Active Members",

  storyTag: "OUR STORY",

  storyTitle:
    "Built to Make Fitness Simpler.",

  storyText:
    "We believe that achieving your fitness goals shouldn't feel complicated. People often struggle to maintain consistency because their workouts, nutrition and progress are scattered across different tools.",

  storySecondText:
    "FitTrack brings everything together in one place. From planning workouts to tracking nutrition and understanding your progress, our platform helps you stay organized and focused.",

  storyImage:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85",

  storyBadgeTitle: "Stay Healthy",
  storyBadgeText: "Stay Consistent",

  storyPoints: [
    "Simple fitness tracking",
    "Data-driven progress",
    "Designed for consistency",
  ],

  missionTag: "OUR MISSION",

  missionTitle:
    "Helping You Become Your Strongest Self.",

  missionText:
    "Our mission is to empower people with simple technology that turns everyday fitness activities into meaningful long-term progress.",

  valuesTag: "WHAT WE BELIEVE",
  valuesTitle: "Our Core Values",
  valuesText:
    "Everything we build is guided by these principles.",

  values: [
    {
      icon: "purpose",
      title: "Purpose",
      text:
        "Every workout and every healthy choice should move you closer to a meaningful goal.",
    },
    {
      icon: "progress",
      title: "Progress",
      text:
        "Small improvements become powerful results when you can measure and understand them.",
    },
    {
      icon: "community",
      title: "Community",
      text:
        "Fitness becomes more enjoyable when people motivate, support and inspire each other.",
    },
  ],

  stats: [
    {
      icon: "users",
      value: "10K+",
      label: "Active Members",
    },
    {
      icon: "workout",
      value: "50K+",
      label: "Workouts Logged",
    },
    {
      icon: "progress",
      value: "95%",
      label: "Goal Completion",
    },
    {
      icon: "heart",
      value: "24/7",
      label: "Fitness Tracking",
    },
  ],

  ctaTag: "YOUR FITNESS JOURNEY",

  ctaTitle:
    "Ready to Take Control?",

  ctaText:
    "Start tracking your workouts, nutrition and progress today.",

  ctaButton: "Get Started",
};

const valueIcons = {
  purpose: <FaBullseye />,
  progress: <FaChartLine />,
  community: <FaUsers />,
};

const statIcons = {
  users: <FaUsers />,
  workout: <FaDumbbell />,
  progress: <FaChartLine />,
  heart: <FaHeartbeat />,
};

function normalizeTitle(title, fallback) {
  const value =
    typeof title === "string" &&
    title.trim()
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

function About() {
  const [aboutData, setAboutData] =
    useState(defaultAboutData);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    const loadAboutContent = async () => {
      try {
        const response =
          await getPublicPageContent("about");

        console.log(
          "PUBLIC ABOUT CONTENT:",
          response
        );

        if (
          mounted &&
          response?.success &&
          response?.content
        ) {
          const content =
            response.content;

          setAboutData({
            ...defaultAboutData,
            ...content,

            values:
              Array.isArray(content.values) &&
              content.values.length > 0
                ? content.values
                : defaultAboutData.values,

            stats:
              Array.isArray(content.stats) &&
              content.stats.length > 0
                ? content.stats
                : defaultAboutData.stats,

            storyPoints:
              Array.isArray(content.storyPoints) &&
              content.storyPoints.length > 0
                ? content.storyPoints
                : defaultAboutData.storyPoints,
          });
        }
      } catch (error) {
        console.error(
          "Load public about content error:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAboutContent();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="home-loading">
        <Spinner animation="border" />

        <span>
          Loading FitTrack...
        </span>
      </div>
    );
  }

  const heroTitle =
    normalizeTitle(
      aboutData.heroTitle,
      defaultAboutData.heroTitle
    );

  const storyTitle =
    normalizeTitle(
      aboutData.storyTitle,
      defaultAboutData.storyTitle
    );

  const missionTitle =
    normalizeTitle(
      aboutData.missionTitle,
      defaultAboutData.missionTitle
    );

  const valuesTitle =
    normalizeTitle(
      aboutData.valuesTitle,
      defaultAboutData.valuesTitle
    );

  const ctaTitle =
    normalizeTitle(
      aboutData.ctaTitle,
      defaultAboutData.ctaTitle
    );

  return (
    <div className="about-page">

      {/* ================= HERO ================= */}

      <section className="about-hero">
        <Container>
          <Row className="align-items-center">

            <Col lg={6}>
              <div className="about-hero-content">

                <span className="about-tag">
                  {aboutData.heroTag}
                </span>

                <h1>
                  {heroTitle.map(
                    (line, index) => (
                      <span
                        key={`${line}-${index}`}
                      >
                        {index ===
                        heroTitle.length - 1 ? (
                          <strong>
                            {line}
                          </strong>
                        ) : (
                          line
                        )}

                        {index <
                          heroTitle.length - 1 && (
                          <br />
                        )}
                      </span>
                    )
                  )}
                </h1>

                <p>
                  {aboutData.heroText}
                </p>

                <div className="about-hero-actions">
                  <Link
                    to="/register"
                    className="about-primary-btn"
                  >
                    {aboutData.heroButton}

                    <FaArrowRight />
                  </Link>
                </div>

              </div>
            </Col>

            <Col lg={6}>
              <div className="about-hero-image">

                <img
                  src={
                    aboutData.heroImage ||
                    defaultAboutData.heroImage
                  }
                  alt="Fitness training"
                />

                <div className="about-experience-card">

                  <FaDumbbell />

                  <div>
                    <strong>
                      {
                        aboutData.experienceNumber
                      }
                    </strong>

                    <span>
                      {
                        aboutData.experienceText
                      }
                    </span>
                  </div>

                </div>

              </div>
            </Col>

          </Row>
        </Container>
      </section>

      {/* ================= STORY ================= */}

      <section className="about-story section-padding">
        <Container>
          <Row className="align-items-center">

            <Col lg={6}>
              <div className="story-image-wrapper">

                <img
                  src={
                    aboutData.storyImage ||
                    defaultAboutData.storyImage
                  }
                  alt="People working out"
                />

                <div className="story-badge">

                  <FaHeartbeat />

                  <div>
                    <strong>
                      {aboutData.storyBadgeTitle}
                    </strong>

                    <span>
                      {aboutData.storyBadgeText}
                    </span>
                  </div>

                </div>

              </div>
            </Col>

            <Col lg={6}>
              <div className="story-content">

                <span className="about-section-tag">
                  {aboutData.storyTag}
                </span>

                <h2>
                  {storyTitle.map(
                    (line, index) => (
                      <span
                        key={`${line}-${index}`}
                      >
                        {index ===
                        storyTitle.length - 1 ? (
                          <strong>
                            {line}
                          </strong>
                        ) : (
                          line
                        )}

                        {index <
                          storyTitle.length - 1 && (
                          <br />
                        )}
                      </span>
                    )
                  )}
                </h2>

                <p>
                  {aboutData.storyText}
                </p>

                <p>
                  {aboutData.storySecondText}
                </p>

                <div className="story-points">

                  {aboutData.storyPoints.map(
                    (point, index) => (
                      <div key={index}>
                        <FaCheckCircle />

                        <span>
                          {point}
                        </span>
                      </div>
                    )
                  )}

                </div>

              </div>
            </Col>

          </Row>
        </Container>
      </section>

      {/* ================= MISSION ================= */}

      <section className="mission-section">
        <Container>

          <div className="mission-content">

            <span className="about-section-tag">
              {aboutData.missionTag}
            </span>

            <h2>
              {missionTitle.map(
                (line, index) => (
                  <span
                    key={`${line}-${index}`}
                  >
                    {index ===
                    missionTitle.length - 1 ? (
                      <strong>
                        {line}
                      </strong>
                    ) : (
                      line
                    )}

                    {index <
                      missionTitle.length - 1 && (
                      <br />
                    )}
                  </span>
                )
              )}
            </h2>

            <p>
              {aboutData.missionText}
            </p>

          </div>

        </Container>
      </section>

      {/* ================= VALUES ================= */}

      <section className="values-section section-padding">
        <Container>

          <div className="section-heading">

            <span className="about-section-tag">
              {aboutData.valuesTag}
            </span>

            <h2>
              {valuesTitle.map(
                (line, index) => (
                  <span
                    key={`${line}-${index}`}
                  >
                    {index ===
                    valuesTitle.length - 1 ? (
                      <strong>
                        {line}
                      </strong>
                    ) : (
                      line
                    )}

                    {index <
                      valuesTitle.length - 1 && (
                      <br />
                    )}
                  </span>
                )
              )}
            </h2>

            <p>
              {aboutData.valuesText}
            </p>

          </div>

          <Row className="g-4 mt-4">

            {aboutData.values.map(
              (value, index) => (
                <Col
                  lg={4}
                  md={6}
                  key={index}
                >
                  <ValueCard
                    icon={
                      valueIcons[
                        value.icon
                      ] || <FaBullseye />
                    }
                    title={value.title}
                    text={value.text}
                  />
                </Col>
              )
            )}

          </Row>

        </Container>
      </section>

      {/* ================= NUMBERS ================= */}

      <section className="about-stats">
        <Container>

          <Row>

            {aboutData.stats.map(
              (stat, index) => (
                <Col
                  md={3}
                  sm={6}
                  key={index}
                >
                  <div className="about-stat">

                    {statIcons[
                      stat.icon
                    ] || <FaChartLine />}

                    <h3>
                      {stat.value}
                    </h3>

                    <p>
                      {stat.label}
                    </p>

                  </div>
                </Col>
              )
            )}

          </Row>

        </Container>
      </section>

      {/* ================= CTA ================= */}

      <section className="about-cta">
        <Container>

          <div className="about-cta-box">

            <div className="about-cta-content">

              <span>
                {aboutData.ctaTag}
              </span>

              <h2>
                {ctaTitle.map(
                  (line, index) => (
                    <span
                      key={`${line}-${index}`}
                    >
                      {index ===
                      ctaTitle.length - 1 ? (
                        <strong>
                          {line}
                        </strong>
                      ) : (
                        line
                      )}

                      {index <
                        ctaTitle.length - 1 && (
                        <br />
                      )}
                    </span>
                  )
                )}
              </h2>

              <p>
                {aboutData.ctaText}
              </p>

            </div>

            <Link
              to="/register"
              className="about-cta-btn"
            >
              {aboutData.ctaButton}

              <FaArrowRight />
            </Link>

          </div>

        </Container>
      </section>

    </div>
  );
}

/* ================= VALUE CARD ================= */

function ValueCard({
  icon,
  title,
  text,
}) {
  return (
    <Card className="value-card">

      <div className="value-icon">
        {icon}
      </div>

      <Card.Body>

        <h3>
          {title}
        </h3>

        <p>
          {text}
        </p>

      </Card.Body>

    </Card>
  );
}

export default About;