import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import {
  FaDumbbell,
  FaAppleAlt,
  FaChartLine,
  FaBell,
  FaFilePdf,
  FaSearch,
  FaBullseye,
  FaUserCircle,
  FaMobileAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaFire,
  FaWeight,
  FaRunning,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import { getPublicPageContent } from "../../../services/api";
import "./Features.css";

const defaultMainFeatures = [
  {
    icon: "workout",
    title: "Workout Tracking",
    text:
      "Create, organize and track your workout routines with detailed exercise information.",
    points: [
      "Create workout routines",
      "Track sets, reps and weights",
      "Categorize exercises",
      "Add personal notes",
    ],
  },
  {
    icon: "nutrition",
    title: "Nutrition Tracking",
    text:
      "Keep your nutrition organized by logging meals, calories and macronutrients.",
    points: [
      "Daily food logging",
      "Track calories",
      "Monitor macros",
      "Breakfast, lunch & dinner",
    ],
  },
  {
    icon: "analytics",
    title: "Progress Analytics",
    text:
      "Understand your fitness journey through clear charts and meaningful statistics.",
    points: [
      "Weight tracking",
      "Body measurements",
      "Performance history",
      "Progress visualization",
    ],
  },
];

const defaultAdditionalFeatures = [
  {
    icon: "goal",
    title: "Goals & Targets",
    text:
      "Set fitness goals and monitor your progress toward achieving them.",
  },
  {
    icon: "reminder",
    title: "Reminders & Alerts",
    text:
      "Never miss your workout, meal schedule or important fitness goals.",
  },
  {
    icon: "report",
    title: "Reports & Export",
    text:
      "Generate fitness reports and export your data in useful formats.",
  },
  {
    icon: "search",
    title: "Search & Filters",
    text:
      "Quickly find workouts, nutrition records and other fitness data.",
  },
  {
    icon: "mobile",
    title: "Mobile Responsive",
    text:
      "Access your fitness information comfortably across phones and tablets.",
  },
  {
    icon: "secure",
    title: "Secure Data",
    text:
      "Your fitness information is protected with secure authentication and access control.",
  },
];

const defaultFeaturesData = {
  heroTag: "POWERFUL FEATURES",
  heroTitle: "Everything You Need To Reach Your Goals.",
  heroText:
    "FitTrack brings workouts, nutrition, progress, analytics and fitness planning together in one simple platform.",
  heroButton: "Get Started",
  heroSecondaryButton: "Explore Features",

  mainFeaturesTag: "CORE FEATURES",
  mainFeaturesTitle: "Everything In One Place.",
  mainFeaturesText:
    "Manage the most important parts of your fitness journey without switching between multiple applications.",

  workoutTag: "WORKOUT MANAGEMENT",
  workoutTitle: "Make Every Workout Count.",
  workoutText:
    "Keep your training organized and monitor your performance over time. Record every important detail of your workouts and build a history you can learn from.",
  workoutImage:
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=85",
  workoutPoints: [
    "Track exercises, sets and repetitions",
    "Record weights and workout notes",
    "Organize workouts by categories",
    "Review your exercise history",
  ],
  workoutButton: "Start Tracking",

  analyticsTag: "SMART ANALYTICS",
  analyticsTitle: "Turn Your Data Into Progress.",
  analyticsText:
    "Fitness data becomes useful when you can understand it. FitTrack transforms your records into simple visual insights so you always know where you stand.",
  analyticsBenefits: [
    {
      number: "01",
      title: "Track Trends",
      text: "See how your performance changes over time.",
    },
    {
      number: "02",
      title: "Measure Results",
      text: "Compare your current performance with your history.",
    },
    {
      number: "03",
      title: "Stay Motivated",
      text: "Visual progress makes your achievements easier to see.",
    },
  ],

  additionalTag: "MORE FEATURES",
  additionalTitle: "Built For Your Complete Journey.",
  additionalText:
    "Everything else you need to make fitness management easier, more organized and more effective.",

  ctaTag: "READY TO GET STARTED?",
  ctaTitle: "Your Fitness. One Powerful Platform.",
  ctaText:
    "Start tracking your journey today and make every workout count.",
  ctaButton: "Create Free Account",
};

const iconMap = {
  workout: <FaDumbbell />,
  nutrition: <FaAppleAlt />,
  analytics: <FaChartLine />,
  goal: <FaBullseye />,
  reminder: <FaBell />,
  report: <FaFilePdf />,
  search: <FaSearch />,
  mobile: <FaMobileAlt />,
  secure: <FaShieldAlt />,
};

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

function Features() {
  const [featuresData, setFeaturesData] =
    useState(defaultFeaturesData);

  const [mainFeatures, setMainFeatures] = useState(
    defaultMainFeatures
  );

  const [additionalFeatures, setAdditionalFeatures] =
    useState(defaultAdditionalFeatures);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadFeaturesContent = async () => {
      try {
        const response =
          await getPublicPageContent("features");

        if (
          mounted &&
          response?.success &&
          response?.content
        ) {
          const content = response.content;

          setFeaturesData({
            ...defaultFeaturesData,
            ...content,
          });

          setMainFeatures(
            Array.isArray(content.mainFeatures) &&
              content.mainFeatures.length > 0
              ? content.mainFeatures
              : defaultMainFeatures
          );

          setAdditionalFeatures(
            Array.isArray(content.additionalFeatures) &&
              content.additionalFeatures.length > 0
              ? content.additionalFeatures
              : defaultAdditionalFeatures
          );
        }
      } catch (error) {
        console.error(
          "Load public features content error:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadFeaturesContent();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="features-loading">
        <Spinner animation="border" />
        <span>Loading FitTrack...</span>
      </div>
    );
  }

  const heroTitle = normalizeTitle(
    featuresData.heroTitle,
    defaultFeaturesData.heroTitle
  );

  const mainTitle = normalizeTitle(
    featuresData.mainFeaturesTitle,
    defaultFeaturesData.mainFeaturesTitle
  );

  const workoutTitle = normalizeTitle(
    featuresData.workoutTitle,
    defaultFeaturesData.workoutTitle
  );

  const analyticsTitle = normalizeTitle(
    featuresData.analyticsTitle,
    defaultFeaturesData.analyticsTitle
  );

  const additionalTitle = normalizeTitle(
    featuresData.additionalTitle,
    defaultFeaturesData.additionalTitle
  );

  const analyticsBenefits =
    Array.isArray(featuresData.analyticsBenefits) &&
    featuresData.analyticsBenefits.length
      ? featuresData.analyticsBenefits
      : defaultFeaturesData.analyticsBenefits;

  const workoutPoints =
    Array.isArray(featuresData.workoutPoints) &&
    featuresData.workoutPoints.length
      ? featuresData.workoutPoints
      : defaultFeaturesData.workoutPoints;

  return (
    <div className="features-page">
      {/* ================= HERO ================= */}

      <section className="features-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className="features-hero-content">
                <span className="features-tag">
                  {featuresData.heroTag}
                </span>

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

                <p>{featuresData.heroText}</p>

                <div className="features-hero-buttons">
                  <Link
                    to="/register"
                    className="features-primary-btn"
                  >
                    {featuresData.heroButton}
                    <FaArrowRight />
                  </Link>

                  <a
                    href="#main-features"
                    className="features-outline-btn"
                  >
                    {featuresData.heroSecondaryButton}
                  </a>
                </div>
              </div>
            </Col>

            <Col lg={6}>
              <FeatureDashboard />
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= MAIN FEATURES ================= */}

      <section
        className="main-features-section section-padding"
        id="main-features"
      >
        <Container>
          <SectionHeading
            tag={featuresData.mainFeaturesTag}
            title={
              <>
                {mainTitle.map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {index === mainTitle.length - 1 ? (
                      <strong>{line}</strong>
                    ) : (
                      line
                    )}

                    {index < mainTitle.length - 1 && <br />}
                  </span>
                ))}
              </>
            }
            description={featuresData.mainFeaturesText}
          />

          <Row className="g-4 mt-4">
            {mainFeatures.map((feature, index) => (
              <Col lg={4} md={6} key={index}>
                <Card className="main-feature-card">
                  <div className="main-feature-icon">
                    {iconMap[feature.icon] || (
                      <FaDumbbell />
                    )}
                  </div>

                  <Card.Body>
                    <h3>{feature.title}</h3>

                    <p className="feature-card-description">
                      {feature.text}
                    </p>

                    {Array.isArray(feature.points) &&
                      feature.points.length > 0 && (
                        <ul>
                          {feature.points.map(
                            (point, pointIndex) => (
                              <li key={pointIndex}>
                                <FaCheckCircle />
                                <span>{point}</span>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ================= WORKOUT ================= */}

      <section className="feature-highlight section-padding">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className="highlight-image">
                <img
                  src={
                    featuresData.workoutImage ||
                    defaultFeaturesData.workoutImage
                  }
                  alt="Workout training"
                  loading="lazy"
                />

                <div className="workout-floating-card">
                  <div className="floating-card-icon">
                    <FaDumbbell />
                  </div>

                  <div>
                    <small>Today's Workout</small>
                    <strong>Chest & Triceps</strong>
                    <span>8 Exercises • 45 min</span>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={6}>
              <div className="highlight-content">
                <span className="features-section-tag">
                  {featuresData.workoutTag}
                </span>

                <h2>
                  {workoutTitle.map((line, index) => (
                    <span key={`${line}-${index}`}>
                      {index === workoutTitle.length - 1 ? (
                        <strong>{line}</strong>
                      ) : (
                        line
                      )}

                      {index < workoutTitle.length - 1 && (
                        <br />
                      )}
                    </span>
                  ))}
                </h2>

                <p>{featuresData.workoutText}</p>

                <div className="highlight-points">
                  {workoutPoints.map((point, index) => (
                    <div key={index}>
                      <FaCheckCircle />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/login"
                  className="feature-text-btn"
                >
                  {featuresData.workoutButton}
                  <FaArrowRight />
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= ANALYTICS ================= */}

      <section className="analytics-feature section-padding">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="order-lg-2">
              <div className="analytics-visual">
                <div className="analytics-header">
                  <div>
                    <small>Progress Overview</small>
                    <h4>Weekly Performance</h4>
                  </div>

                  <span>+18.4%</span>
                </div>

                <div className="analytics-chart">
                  <div className="chart-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="analytics-bars">
                    <div style={{ height: "40%" }} />
                    <div style={{ height: "55%" }} />
                    <div style={{ height: "47%" }} />
                    <div style={{ height: "68%" }} />
                    <div style={{ height: "61%" }} />
                    <div style={{ height: "78%" }} />
                    <div style={{ height: "91%" }} />
                  </div>
                </div>

                <div className="analytics-days">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                <div className="analytics-mini-stats">
                  <div>
                    <FaWeight />

                    <span>
                      <small>Weight</small>
                      <strong>72.4 kg</strong>
                    </span>
                  </div>

                  <div>
                    <FaFire />

                    <span>
                      <small>Calories</small>
                      <strong>2,180</strong>
                    </span>
                  </div>

                  <div>
                    <FaRunning />

                    <span>
                      <small>Workouts</small>
                      <strong>5</strong>
                    </span>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={6} className="order-lg-1">
              <div className="highlight-content analytics-copy">
                <span className="features-section-tag">
                  {featuresData.analyticsTag}
                </span>

                <h2>
                  {analyticsTitle.map((line, index) => (
                    <span key={`${line}-${index}`}>
                      {index === analyticsTitle.length - 1 ? (
                        <strong>{line}</strong>
                      ) : (
                        line
                      )}

                      {index < analyticsTitle.length - 1 && (
                        <br />
                      )}
                    </span>
                  ))}
                </h2>

                <p>{featuresData.analyticsText}</p>

                <div className="analytics-benefits">
                  {analyticsBenefits.map(
                    (benefit, index) => (
                      <div key={index}>
                        <span>
                          {benefit.number}
                        </span>

                        <div>
                          <h4>{benefit.title}</h4>
                          <p>{benefit.text}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= ADDITIONAL FEATURES ================= */}

      <section className="additional-features section-padding">
        <Container>
          <SectionHeading
            tag={featuresData.additionalTag}
            title={
              <>
                {additionalTitle.map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {index === additionalTitle.length - 1 ? (
                      <strong>{line}</strong>
                    ) : (
                      line
                    )}

                    {index < additionalTitle.length - 1 && (
                      <br />
                    )}
                  </span>
                ))}
              </>
            }
            description={featuresData.additionalText}
          />

          <Row className="g-4 mt-4">
            {additionalFeatures.map(
              (feature, index) => (
                <Col lg={4} md={6} key={index}>
                  <div className="additional-feature-card">
                    <div className="additional-icon">
                      {iconMap[feature.icon] || (
                        <FaCheckCircle />
                      )}
                    </div>

                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.text}</p>
                    </div>
                  </div>
                </Col>
              )
            )}
          </Row>
        </Container>
      </section>

      {/* ================= CTA ================= */}

      <section className="features-cta">
        <Container>
          <div className="features-cta-box">
            <div>
              <span>{featuresData.ctaTag}</span>

              <h2>{featuresData.ctaTitle}</h2>

              <p>{featuresData.ctaText}</p>
            </div>

            <Link
              to="/register"
              className="features-cta-btn"
            >
              {featuresData.ctaButton}
              <FaArrowRight />
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}

function SectionHeading({
  tag,
  title,
  description,
}) {
  return (
    <div className="features-section-heading">
      <span>{tag}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function FeatureDashboard() {
  return (
    <div className="feature-dashboard">
      <div className="dashboard-top">
        <div>
          <small>Good Evening 👋</small>
          <h3>Today's Overview</h3>
        </div>

        <div className="dashboard-profile">
          <FaUserCircle />
        </div>
      </div>

      <div className="dashboard-progress">
        <div className="progress-info">
          <span>Weekly Goal</span>
          <strong>78%</strong>
        </div>

        <div className="progress-track">
          <div />
        </div>

        <small>4 of 5 workouts completed</small>
      </div>

      <div className="dashboard-cards">
        <div>
          <FaDumbbell />

          <span>
            <small>Workouts</small>
            <strong>24</strong>
          </span>
        </div>

        <div>
          <FaFire />

          <span>
            <small>Calories</small>
            <strong>14.8K</strong>
          </span>
        </div>

        <div>
          <FaChartLine />

          <span>
            <small>Progress</small>
            <strong>+18%</strong>
          </span>
        </div>
      </div>

      <div className="dashboard-goal">
        <div className="goal-icon">
          <FaBullseye />
        </div>

        <div>
          <small>Current Goal</small>
          <strong>Build Strength</strong>
        </div>

        <span>68%</span>
      </div>
    </div>
  );
}

export default Features;