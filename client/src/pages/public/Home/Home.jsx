import { useEffect, useState } from "react";

import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Spinner,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";

import {
  FaArrowRight,
  FaPlay,
  FaDumbbell,
  FaAppleAlt,
  FaChartLine,
  FaBullseye,
  FaCheckCircle,
  FaFire,
  FaHeartbeat,
  FaRunning,
} from "react-icons/fa";

import { getPublicPageContent } from "../../../services/api";

import "./Home.css";

const defaultHomeData = {
  heroTag: "YOUR FITNESS JOURNEY STARTS HERE",

  heroTitle: "Train Smart. Live Strong.",

  heroText:
    "Your all-in-one fitness companion to track workouts, nutrition, progress and goals. Everything you need to become a healthier and stronger version of yourself.",

  heroButton: "Start Your Journey",

  heroImage:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85",

  stats: [
    {
      icon: "workout",
      value: "50K+",
      label: "Workouts Tracked",
    },
    {
      icon: "heart",
      value: "10K+",
      label: "Active Members",
    },
    {
      icon: "goal",
      value: "95%",
      label: "Goal Completion",
    },
  ],

  features: [
    {
      icon: "workout",
      title: "Workout Tracking",
      text:
        "Create and manage workout routines while tracking sets, reps, weights and exercises.",
    },
    {
      icon: "nutrition",
      title: "Nutrition Tracking",
      text:
        "Track daily meals, calories and macronutrients to maintain a balanced nutrition plan.",
    },
    {
      icon: "analytics",
      title: "Progress Analytics",
      text:
        "Visualize your fitness journey with smart charts and detailed progress analytics.",
    },
  ],

  steps: [
    {
      number: "01",
      icon: "goal",
      title: "Set Your Goals",
      text:
        "Define your fitness goals and create a personalized path toward achieving them.",
    },
    {
      number: "02",
      icon: "workout",
      title: "Track Your Activity",
      text:
        "Log workouts, nutrition and daily activities to keep everything organized.",
    },
    {
      number: "03",
      icon: "analytics",
      title: "Track Your Progress",
      text:
        "Analyze your results and stay motivated as you move closer to your goals.",
    },
  ],

  analytics: {
    tag: "SMART ANALYTICS",
    titleLineOne: "See Your Progress.",
    titleLineTwo: "Stay Motivated.",
    description:
      "Turn your fitness data into meaningful insights. Monitor workouts, body weight and nutrition through easy-to-understand visual analytics.",
    points: [
      "Workout performance tracking",
      "Weight and body measurement progress",
      "Daily calorie and macro insights",
      "Long-term fitness trends",
    ],
    button: "Explore Analytics",
  },

  categories: [
    {
      className: "strength-category",
      icon: "workout",
      title: "Strength",
      text:
        "Build muscle and increase your strength.",
      image:
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=85",
    },
    {
      className: "cardio-category",
      icon: "running",
      title: "Cardio",
      text:
        "Improve endurance and cardiovascular health.",
      image:
        "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=85",
    },
    {
      className: "nutrition-category",
      icon: "nutrition",
      title: "Nutrition",
      text:
        "Fuel your body with better nutrition.",
      image:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=85",
    },
  ],

  ctaTitle:
    "Your Strongest Self Starts Today.",

  ctaText:
    "Stop guessing. Start tracking. Take control of your fitness journey.",

  ctaButton: "Create Free Account",

  weeklyProgress: "+24.8%",

  workoutDuration: "45 min",

  trustText: "10,000+ people",

  trustSubtext:
    "are already tracking their fitness",
};

function getIcon(icon) {
  const icons = {
    workout: <FaDumbbell />,
    nutrition: <FaAppleAlt />,
    analytics: <FaChartLine />,
    goal: <FaBullseye />,
    heart: <FaHeartbeat />,
    running: <FaRunning />,
  };

  return icons[icon] || <FaDumbbell />;
}

function normalizeHomeContent(content = {}) {
  return {
    ...defaultHomeData,
    ...content,

    heroTag:
      content.heroTag ||
      defaultHomeData.heroTag,

    heroTitle:
      content.heroTitle ||
      defaultHomeData.heroTitle,

    heroText:
      content.heroText ||
      defaultHomeData.heroText,

    heroButton:
      content.heroButton ||
      defaultHomeData.heroButton,

    heroImage:
      content.heroImage ||
      defaultHomeData.heroImage,

    stats:
      Array.isArray(content.stats) &&
      content.stats.length > 0
        ? content.stats
        : defaultHomeData.stats,

    features:
      Array.isArray(content.features) &&
      content.features.length > 0
        ? content.features
        : defaultHomeData.features,

    steps:
      Array.isArray(content.steps) &&
      content.steps.length > 0
        ? content.steps
        : defaultHomeData.steps,

    analytics:
      content.analytics &&
      typeof content.analytics === "object" &&
      !Array.isArray(content.analytics)
        ? {
            ...defaultHomeData.analytics,
            ...content.analytics,
            points:
              Array.isArray(
                content.analytics.points
              ) &&
              content.analytics.points.length > 0
                ? content.analytics.points
                : defaultHomeData.analytics.points,
          }
        : defaultHomeData.analytics,

    categories:
      Array.isArray(content.categories) &&
      content.categories.length > 0
        ? content.categories
        : defaultHomeData.categories,

    ctaTitle:
      content.ctaTitle ||
      defaultHomeData.ctaTitle,

    ctaText:
      content.ctaText ||
      defaultHomeData.ctaText,

    ctaButton:
      content.ctaButton ||
      defaultHomeData.ctaButton,

    weeklyProgress:
      content.weeklyProgress ||
      defaultHomeData.weeklyProgress,

    workoutDuration:
      content.workoutDuration ||
      defaultHomeData.workoutDuration,

    trustText:
      content.trustText ||
      defaultHomeData.trustText,

    trustSubtext:
      content.trustSubtext ||
      defaultHomeData.trustSubtext,
  };
}

function Home() {
  const navigate = useNavigate();

  const [homeData, setHomeData] =
    useState(defaultHomeData);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    const loadHomeContent = async () => {
      try {
        const response =
          await getPublicPageContent("home");

        console.log(
          "PUBLIC HOME CONTENT:",
          response
        );

        if (
          mounted &&
          response?.success &&
          response?.content
        ) {
          setHomeData(
            normalizeHomeContent(
              response.content
            )
          );
        }
      } catch (error) {
        console.error(
          "Load public home content error:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadHomeContent();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="home-loading">
        <Spinner animation="border" />
        <span>Loading FitTrack...</span>
      </div>
    );
  }

  return (
    <div className="home-page">

      <HeroSection
        data={homeData}
        onPrimary={() =>
          navigate("/register")
        }
        onSecondary={() =>
          navigate("/features")
        }
      />

      <StatsSection
        stats={homeData.stats}
      />

      <FeaturesSection
        features={homeData.features}
      />

      <HowItWorksSection
        steps={homeData.steps}
      />

      <AnalyticsSection
        data={homeData.analytics}
        onClick={() =>
          navigate("/login")
        }
      />

      <CategoriesSection
        categories={homeData.categories}
      />

      <CTASection
        data={{
          tag: "READY TO START?",
          title: homeData.ctaTitle,
          description: homeData.ctaText,
          button: homeData.ctaButton,
        }}
        onClick={() =>
          navigate("/register")
        }
      />

    </div>
  );
}

/* ================= HERO ================= */

function HeroSection({
  data,
  onPrimary,
  onSecondary,
}) {
  const title =
    data.heroTitle ||
    defaultHomeData.heroTitle;

  const titleParts = title.includes("|")
    ? title.split("|")
    : title.includes("\n")
    ? title.split("\n")
    : title.split(".");

  const firstLine =
    titleParts[0]?.trim() || "";

  const secondLine =
    titleParts
      .slice(1)
      .join(
        title.includes("|") ||
        title.includes("\n")
          ? " "
          : "."
      )
      .trim();

  return (
    <section className="hero-section">
      <Container>
        <Row className="align-items-center">

          <Col lg={6}>
            <div className="hero-content">

              <span className="hero-badge">
                <FaFire />
                {data.heroTag}
              </span>

              <h1>
                {firstLine}
                {secondLine && (
                  <>
                    .
                    <br />
                    <span>
                      {secondLine.replace(
                        /\.$/,
                        ""
                      )}
                      .
                    </span>
                  </>
                )}
              </h1>

              <p>
                {data.heroText}
              </p>

              <div className="hero-buttons">

                <Button
                  className="primary-btn"
                  onClick={onPrimary}
                >
                  {data.heroButton}
                  <FaArrowRight />
                </Button>

                <Button
                  className="watch-btn"
                  onClick={onSecondary}
                >
                  <FaPlay />
                  Explore Features
                </Button>

              </div>

              {/* <div className="hero-trust">

                <div className="avatar-group">
                  <span>JD</span>
                  <span>MK</span>
                  <span>AS</span>
                  <span>+</span>
                </div>

                <div>
                  <strong>
                    {data.trustText}
                  </strong>

                  <small>
                    {data.trustSubtext}
                  </small>
                </div>

              </div> */}

            </div>
          </Col>

          <Col lg={6}>
            <HeroVisual data={data} />
          </Col>

        </Row>
      </Container>
    </section>
  );
}

/* ================= HERO VISUAL ================= */

function HeroVisual({ data }) {
  return (
    <div className="hero-visual">

      <div className="hero-main-image">
        <img
          src={data.heroImage}
          alt="Fitness training"
        />
      </div>

      <div className="floating-card progress-card">

        <div className="floating-icon">
          <FaChartLine />
        </div>

        <div>
          <small>
            Weekly Progress
          </small>

          <strong>
            {data.weeklyProgress}
          </strong>
        </div>

      </div>

      <div className="floating-card workout-card">

        <div className="workout-icon">
          <FaHeartbeat />
        </div>

        <div>
          <small>
            Today's Workout
          </small>

          <strong>
            {data.workoutDuration}
          </strong>
        </div>

      </div>

      <div className="circle-decoration circle-one" />

      <div className="circle-decoration circle-two" />

    </div>
  );
}

/* ================= STATS ================= */

function StatsSection({ stats }) {
  return (
    <section className="stats-section">
      <Container>
        <Row className="g-0">

          {stats.map((stat, index) => (
            <Col
              md={4}
              key={index}
            >
              <div className="stat-item">

                {getIcon(stat.icon)}

                <div>
                  <h3>
                    {stat.value}
                  </h3>

                  <p>
                    {stat.label}
                  </p>
                </div>

              </div>
            </Col>
          ))}

        </Row>
      </Container>
    </section>
  );
}

/* ================= FEATURES ================= */

function FeaturesSection({
  features,
}) {
  const navigate = useNavigate();

  return (
    <section className="features-section section-padding">
      <Container>

        <SectionHeading
          tag="POWERFUL FEATURES"
          title={
            <>
              Everything You Need
              <br />
              <strong>
                To Stay Fit
              </strong>
            </>
          }
          description="One simple platform to manage every part of your fitness journey and make meaningful progress every day."
        />

        <Row className="g-4 mt-4">

          {features.map(
            (feature, index) => (
              <Col
                lg={4}
                md={6}
                key={index}
              >

                <Card className="feature-card">

                  <div className="feature-icon">
                    {getIcon(
                      feature.icon
                    )}
                  </div>

                  <Card.Body>

                    <h3>
                      {feature.title}
                    </h3>

                    <p>
                      {feature.text}
                    </p>

                    <button
                      type="button"
                      className="feature-link"
                      onClick={() =>
                        navigate(
                          "/features"
                        )
                      }
                    >
                      Learn More
                      <FaArrowRight />
                    </button>

                  </Card.Body>

                </Card>

              </Col>
            )
          )}

        </Row>

      </Container>
    </section>
  );
}

/* ================= SECTION HEADING ================= */

function SectionHeading({
  tag,
  title,
  description,
}) {
  return (
    <div className="section-heading text-center">

      <span>{tag}</span>

      <h2>{title}</h2>

      <p>{description}</p>

    </div>
  );
}

/* ================= HOW IT WORKS ================= */

function HowItWorksSection({
  steps,
}) {
  return (
    <section className="how-section section-padding">
      <Container>

        <Row className="align-items-center">

          <Col lg={5}>

            <div className="how-image">

              <img
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85"
                alt="Person exercising"
              />

              <div className="image-label">

                {/* <FaCheckCircle /> */}

                {/* <div>
                  <strong>
                    Stay Consistent
                  </strong>

                  <small>
                    Every day counts
                  </small>
                </div> */}

              </div>

            </div>

          </Col>

          <Col lg={7}>

            <div className="how-content">

              <span className="section-tag">
                HOW IT WORKS
              </span>

              <h2>
                Simple Steps.
                <br />
                <strong>
                  Real Results.
                </strong>
              </h2>

              <p className="how-description">
                FitTrack makes fitness
                management simple.
                Follow your progress,
                understand your habits
                and stay motivated
                without complicated tools.
              </p>

              <div className="steps-list">

                {steps.map(
                  (step, index) => (
                    <div
                      className="step-item"
                      key={index}
                    >

                      <div className="step-number">
                        {step.number}
                      </div>

                      <div className="step-icon">
                        {getIcon(
                          step.icon
                        )}
                      </div>

                      <div className="step-content">

                        <h4>
                          {step.title}
                        </h4>

                        <p>
                          {step.text}
                        </p>

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
  );
}

/* ================= ANALYTICS ================= */

function AnalyticsSection({
  data,
  onClick,
}) {
  return (
    <section className="analytics-section section-padding">
      <Container>

        <Row className="align-items-center">

          <Col lg={6}>

            <div className="analytics-content">

              <span className="section-tag">
                {data.tag}
              </span>

              <h2>
                {data.titleLineOne}
                <br />

                <strong>
                  {data.titleLineTwo}
                </strong>
              </h2>

              <p>
                {data.description}
              </p>

              <ul>

                {data.points?.map(
                  (point, index) => (
                    <li key={index}>
                      <FaCheckCircle />
                      {point}
                    </li>
                  )
                )}

              </ul>

              <Button
                className="primary-btn"
                onClick={onClick}
              >
                {data.button}
                <FaArrowRight />
              </Button>

            </div>

          </Col>

          <Col lg={6}>
            <DashboardPreview />
          </Col>

        </Row>

      </Container>
    </section>
  );
}

/* ================= DASHBOARD PREVIEW ================= */

function DashboardPreview() {
  const bars = [
    "42%",
    "58%",
    "48%",
    "72%",
    "63%",
    "82%",
    "92%",
  ];

  const days = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  return (
    <div className="dashboard-preview">

      <div className="preview-header">

        <div>
          <small>Overview</small>
          <h4>My Progress</h4>
        </div>

        <span>
          Last 7 Days
        </span>

      </div>

      <div className="chart-area">

        <div className="chart-labels">
          <span>80%</span>
          <span>60%</span>
          <span>40%</span>
          <span>20%</span>
          <span>0%</span>
        </div>

        <div className="chart-bars">

          {bars.map(
            (height, index) => (
              <div
                key={index}
                style={{
                  height,
                }}
              />
            )
          )}

        </div>

      </div>

      <div className="chart-days">

        {days.map((day) => (
          <span key={day}>
            {day}
          </span>
        ))}

      </div>

      <div className="preview-bottom">

        <div>
          <FaRunning />

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

      </div>

    </div>
  );
}

/* ================= CATEGORIES ================= */

function CategoriesSection({
  categories,
}) {
  return (
    <section className="categories-section section-padding">
      <Container>

        <SectionHeading
          tag="FITNESS FOR EVERYONE"
          title="Train Your Way"
          description="Whether you want to build strength, improve endurance or simply live a healthier lifestyle, FitTrack keeps you moving."
        />

        <Row className="g-4 mt-4">

          {categories.map(
            (category, index) => (
              <Col
                md={4}
                key={index}
              >

                <div
                  className={`category-card ${
                    category.className || ""
                  }`}
                  style={{
                    backgroundImage: `
                      linear-gradient(
                        to top,
                        rgba(12, 25, 18, 0.9),
                        rgba(12, 25, 18, 0.05)
                      ),
                      url("${category.image}")
                    `,
                  }}
                >

                  <div>

                    {getIcon(
                      category.icon
                    )}

                    <h3>
                      {category.title}
                    </h3>

                    <p>
                      {category.text}
                    </p>

                  </div>

                </div>

              </Col>
            )
          )}

        </Row>

      </Container>
    </section>
  );
}

/* ================= CTA ================= */

function CTASection({
  data,
  onClick,
}) {
  const titleParts =
    data.title.split(" ");

  return (
    <section className="cta-section">
      <Container>

        <div className="cta-box">

          <div className="cta-content">

            <span>
              {data.tag}
            </span>

            <h2>

              {titleParts
                .slice(0, -2)
                .join(" ")}

              <br />

              <strong>
                {titleParts
                  .slice(-2)
                  .join(" ")}
              </strong>

            </h2>

            <p>
              {data.description}
            </p>

            <Button
              className="cta-btn"
              onClick={onClick}
            >
              {data.button}
              <FaArrowRight />
            </Button>

          </div>

          <div className="cta-icon">
            <FaDumbbell />
          </div>

        </div>

      </Container>
    </section>
  );
}

export default Home;