import PublicContent from "../models/PublicContent.mjs";

// ==================================================
// DEFAULT PUBLIC WEBSITE CONTENT
// ==================================================

const defaultContent = {
  home: {
    heroTag: "YOUR FITNESS JOURNEY STARTS HERE",
    heroTitle: "Train Smart. Live Strong.",
    heroTitleSecond: "",
    heroText:
      "Your all-in-one fitness companion for workouts, nutrition, progress and goals.",
    heroButton: "Start Your Journey",
    heroSecondaryButton: "Explore Features",
    heroImage:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85",

    stats: [
      {
        value: "50K+",
        label: "Workouts Tracked",
        icon: "workout",
      },
      {
        value: "10K+",
        label: "Active Members",
        icon: "heart",
      },
      {
        value: "95%",
        label: "Goal Success",
        icon: "goal",
      },
    ],

    featuresSection: {
      tag: "POWERFUL FEATURES",
      title: "Everything You Need To Stay On Track.",
      text:
        "FitTrack brings your workouts, nutrition and progress together in one simple platform.",
    },

    features: [
      {
        title: "Workout Tracking",
        text:
          "Plan, record and review your workouts with ease.",
        icon: "dumbbell",
      },
      {
        title: "Nutrition Tracking",
        text:
          "Keep track of meals, calories and nutrition throughout your day.",
        icon: "utensils",
      },
      {
        title: "Progress Analytics",
        text:
          "Understand your progress through meaningful fitness insights.",
        icon: "chart",
      },
    ],

    howItWorks: {
      tag: "HOW IT WORKS",
      title: "A Simpler Way To Reach Your Goals.",
      text:
        "Create your plan, track your activity and use your progress insights to stay consistent.",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=85",
      imageLabel: "Your fitness journey",

      steps: [
        {
          number: "01",
          title: "Set Your Goals",
          text:
            "Choose realistic goals and define what you want to achieve.",
        },
        {
          number: "02",
          title: "Track Your Progress",
          text:
            "Record workouts, nutrition and daily activity.",
        },
        {
          number: "03",
          title: "Stay Consistent",
          text:
            "Use insights and reminders to keep moving forward.",
        },
      ],
    },

    analytics: {
      tag: "SMART ANALYTICS",
      title: "See Your Progress Clearly.",
      description:
        "Turn your fitness data into useful insights that help you understand your habits and improve consistently.",
      points: [
        "Track weekly workout performance",
        "Monitor calories and nutrition",
        "Understand progress trends",
        "Stay focused on your goals",
      ],
      button: "View Features",
    },

    dashboardPreview: {
      greeting: "Good Evening",
      overviewTitle: "Today's Overview",
      weeklyGoal: "Weekly Goal",
      weeklyGoalValue:
        "4 of 5 workouts completed",
      workoutsLabel: "Workouts",
      workoutsValue: "24",
      caloriesLabel: "Calories",
      caloriesValue: "14.8K",
      progressLabel: "Progress",
      progressValue: "+18%",
      currentGoalLabel: "Current Goal",
      currentGoalTitle: "Build Strength",
      currentGoalProgress: 68,
      todayWorkoutLabel: "Today's Workout",
      todayWorkoutTitle: "Chest & Triceps",
      todayWorkoutMeta:
        "8 Exercises • 45 min",
      progressOverviewTitle:
        "Progress Overview",
      weeklyPerformanceLabel:
        "Weekly Performance",
      weeklyPerformanceValue:
        "+18.4%",
      weightLabel: "Weight",
      weightValue: "72.4 kg",
      caloriesTodayLabel:
        "Calories",
      caloriesTodayValue:
        "2,180",
      workoutsTodayLabel:
        "Workouts",
      workoutsTodayValue:
        "5",
    },

    categoriesSection: {
      tag: "FITNESS FOR EVERY GOAL",
      title: "Train Your Way.",
      text:
        "Choose the activities that match your goals and build a routine that works for you.",
    },

    categories: [
      {
        title: "Strength",
        text:
          "Build muscle and increase your strength.",
        image:
          "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=85",
        icon: "strength",
      },
      {
        title: "Cardio",
        text:
          "Improve endurance and cardiovascular health.",
        image:
          "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=900&q=85",
        icon: "cardio",
      },
      {
        title: "Nutrition",
        text:
          "Fuel your body with better nutrition.",
        image:
          "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=85",
        icon: "nutrition",
      },
    ],

    ctaTag: "START TODAY",
    ctaTitle:
      "Your Strongest Self Starts Today.",
    ctaText:
      "Stop guessing. Start tracking. Take control of your fitness journey with FitTrack.",
    ctaButton: "Get Started",

    weeklyProgress: "+24.8%",
    workoutDuration: "45 min",
    trustText: "10,000+ people",
    trustSubtext:
      "are already tracking their fitness",
  },

  about: {
    heroTag: "ABOUT FITTRACK",
    heroTitle:
      "Fitness Is Not Just a Goal. It's a Lifestyle.",
    heroText:
      "FitTrack helps you understand your habits, track your progress and stay consistent with your fitness journey.",
    heroImage:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=85",
    heroButton: "Start Your Journey",

    experienceNumber: "10K+",
    experienceText: "Active Members",

    storyTag: "OUR STORY",
    storyTitle:
      "Built to Make Fitness Simpler.",
    storyText:
      "FitTrack was created to make fitness tracking simple, practical and motivating. Instead of keeping your workouts, nutrition and progress in different places, FitTrack brings everything together.",
    storySecondText:
      "Our goal is to remove unnecessary complexity so you can focus on building healthy habits and making meaningful progress.",
    storyImage:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85",

    storyBadgeTitle: "Stay Healthy",
    storyBadgeText: "Stay Consistent",

    storyPoints: [
      "Track workouts and daily activity",
      "Understand your fitness progress",
      "Build sustainable habits",
    ],

    missionTag: "OUR MISSION",
    missionTitle: "Our Mission",
    missionText:
      "Our mission is to help people build sustainable fitness habits through better tracking, meaningful insights and consistent progress.",

    valuesTag: "WHAT WE BELIEVE",
    valuesTitle:
      "Built Around Better Habits.",
    valuesText:
      "Every part of FitTrack is designed to make your fitness journey clearer, simpler and more consistent.",

    values: [
      {
        title: "Purpose",
        text:
          "Every workout and every healthy choice should move you closer to your goals.",
        icon: "target",
      },
      {
        title: "Progress",
        text:
          "Small improvements become meaningful results when you stay consistent.",
        icon: "chart",
      },
      {
        title: "Community",
        text:
          "Fitness becomes easier when you have the right support around you.",
        icon: "users",
      },
    ],

    stats: [
      {
        value: "10K+",
        label: "Active Members",
        icon: "users",
      },
      {
        value: "50K+",
        label: "Workouts Tracked",
        icon: "dumbbell",
      },
      {
        value: "95%",
        label: "Goal Success",
        icon: "chart",
      },
      {
        value: "24/7",
        label: "Support",
        icon: "support",
      },
    ],

    ctaTag: "YOUR JOURNEY STARTS HERE",
    ctaTitle:
      "Ready To Start Your Journey?",
    ctaText:
      "Create your FitTrack account and start building better habits today.",
    ctaButton: "Get Started",
  },

  features: {
    heroTag: "POWERFUL FEATURES",
    heroTitle:
      "Everything You Need To Reach Your Goals.",
    heroText:
      "From workout tracking to nutrition and progress analytics, FitTrack gives you everything you need in one place.",
    heroButton: "Start Your Journey",
    heroImage:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85",

    mainSection: {
      tag: "CORE FEATURES",
      title: "Everything In One Place.",
      text:
        "Manage the most important parts of your fitness journey from one simple dashboard.",
    },

    mainFeatures: [
      {
        title: "Workout Tracking",
        text:
          "Plan, record and review your workouts with ease.",
        icon: "dumbbell",
      },
      {
        title: "Nutrition Tracking",
        text:
          "Keep track of meals, calories and nutrition throughout your day.",
        icon: "utensils",
      },
      {
        title: "Progress Analytics",
        text:
          "Understand your progress through meaningful fitness insights.",
        icon: "chart",
      },
    ],

    workoutSection: {
      tag: "WORKOUT TRACKING",
      title: "Train With Purpose.",
      text:
        "Record every workout, monitor your activity and keep your training organized.",
      image:
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=85",
      points: [
        "Create and track workouts",
        "Monitor exercises and duration",
        "Review workout history",
        "Stay consistent with your routine",
      ],
      button: "Start Tracking",
    },

    analyticsSection: {
      tag: "PROGRESS ANALYTICS",
      title:
        "Understand Your Progress.",
      text:
        "Turn your fitness activity into clear insights so you can see what is working and where you can improve.",
      benefits: [
        "Weekly progress insights",
        "Workout performance tracking",
        "Goal completion monitoring",
        "Useful fitness trends",
      ],
    },

    dashboard: {
      greeting: "Good Evening",
      overviewTitle: "Today's Overview",
      weeklyGoal: "Weekly Goal",
      weeklyGoalValue:
        "4 of 5 workouts completed",
      workoutsLabel: "Workouts",
      workoutsValue: "24",
      caloriesLabel: "Calories",
      caloriesValue: "14.8K",
      progressLabel: "Progress",
      progressValue: "+18%",
      currentGoalLabel: "Current Goal",
      currentGoalTitle: "Build Strength",
      currentGoalProgress: 68,
      todayWorkoutLabel: "Today's Workout",
      todayWorkoutTitle:
        "Chest & Triceps",
      todayWorkoutMeta:
        "8 Exercises • 45 min",
      progressOverviewTitle:
        "Progress Overview",
      weeklyPerformanceLabel:
        "Weekly Performance",
      weeklyPerformanceValue:
        "+18.4%",
      weightLabel: "Weight",
      weightValue: "72.4 kg",
      caloriesTodayLabel:
        "Calories",
      caloriesTodayValue:
        "2,180",
      workoutsTodayLabel:
        "Workouts",
      workoutsTodayValue:
        "5",
    },

    additionalSection: {
      tag: "MORE FEATURES",
      title:
        "Built For Your Complete Fitness Journey.",
      text:
        "Everything you need to stay organized, informed and consistent.",
    },

    additionalFeatures: [
      {
        title: "Goals & Targets",
        text:
          "Set measurable goals and stay focused on what matters.",
        icon: "target",
      },
      {
        title: "Reminders & Alerts",
        text:
          "Stay consistent with useful reminders and notifications.",
        icon: "bell",
      },
      {
        title: "Reports & Export",
        text:
          "Review your fitness information through clear reports.",
        icon: "file",
      },
      {
        title: "Search & Filters",
        text:
          "Find workouts, nutrition records and information quickly.",
        icon: "search",
      },
      {
        title: "Mobile Responsive",
        text:
          "Access your fitness dashboard across different screen sizes.",
        icon: "mobile",
      },
      {
        title: "Secure Data",
        text:
          "Your fitness information is protected through authenticated access.",
        icon: "lock",
      },
    ],

    ctaTag: "READY TO GET STARTED?",
    ctaTitle:
      "Everything You Need. One Platform.",
    ctaText:
      "Start using FitTrack today and take control of your fitness journey.",
    ctaButton: "Get Started",
  },

  contact: {
    heroTag: "GET IN TOUCH",
    heroTitle:
      "We're Here To Help You.",
    heroText:
      "Have a question, suggestion or need assistance? Our support team is ready to help you with your FitTrack journey.",
    heroImage:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85",

    heroButton: "Contact Support",

    emailLabel: "Email Us",
    email: "support@fittrack.com",

    phoneLabel: "Call Us",
    phone: "+92 300 1234567",

    locationLabel: "Our Location",
    location: "Karachi, Pakistan",

    workingHoursLabel: "Working Hours",
    workingHours:
      "Mon - Sat, 9:00 AM - 6:00 PM",

    sectionTag: "QUICK SUPPORT",
    sectionTitle:
      "Let's Start a Conversation.",
    sectionText:
      "Whether you need help with your account, have feedback about FitTrack, or simply want to ask a question, feel free to reach out.",

    formTag: "SEND A MESSAGE",
    formTitle: "How Can We Help?",
    formText:
      "Fill out the form below and our team will get back to you as soon as possible.",

    nameLabel: "Full Name",
    namePlaceholder:
      "Enter your full name",

    emailFieldLabel:
      "Email Address",
    emailPlaceholder:
      "Enter your email address",

    subjectLabel: "Subject",
    subjectPlaceholder:
      "What can we help you with?",

    messageLabel: "Message",
    messagePlaceholder:
      "Write your message here...",

    subjectOptions: [
      "General Question",
      "Account Support",
      "Workout Support",
      "Nutrition Support",
      "Technical Issue",
      "Feedback",
      "Other",
    ],

    submitButton: "Send Message",

    successMessage:
      "Your message has been sent successfully. Our team will get back to you soon.",

    ctaTag: "NEED MORE HELP?",
    ctaTitle: "Check Our Support.",
    ctaText:
      "Find helpful information and solutions to common questions about FitTrack.",
    ctaButton: "Get Support",
  },
};

// ==================================================
// HELPER
// ==================================================

const normalizePage = (page) => {
  return String(page || "")
    .toLowerCase()
    .trim();
};

const isValidPage = (page) => {
  return Object.prototype.hasOwnProperty.call(
    defaultContent,
    page
  );
};

// ==================================================
// DEFAULT CONTENT
// ==================================================

export const getDefaultPublicContent = () => {
  return defaultContent;
};

// ==================================================
// PUBLIC PAGE
// GET /api/public/:page
// ==================================================

export const getPublicPage = async (
  req,
  res
) => {
  try {
    const page = normalizePage(
      req.params.page
    );

    if (!isValidPage(page)) {
      return res.status(404).json({
        success: false,
        message:
          "Public page content not found",
      });
    }

    const saved =
      await PublicContent.findOne({
        page,
      }).lean();

    return res.status(200).json({
      success: true,
      page,
      content:
        saved?.content ||
        defaultContent[page],
      isPublished:
        saved?.isPublished ?? true,
    });
  } catch (error) {
    console.error(
      "Get public content error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load public page content",
      error: error.message,
    });
  }
};

// ==================================================
// ADMIN - GET ALL CONTENT
// GET /api/admin/public-content
// ==================================================

export const getAdminPublicContent =
  async (req, res) => {
    try {
      const pages = [
        "home",
        "about",
        "features",
        "contact",
      ];

      const content = {};

      for (const page of pages) {
        const saved =
          await PublicContent.findOne({
            page,
          }).lean();

        content[page] = {
          content:
            saved?.content ||
            defaultContent[page],

          isPublished:
            saved?.isPublished ?? true,
        };
      }

      return res.status(200).json({
        success: true,
        content,
      });
    } catch (error) {
      console.error(
        "Get admin public content error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load website content",
        error: error.message,
      });
    }
  };

// ==================================================
// ADMIN - UPDATE PAGE
// PUT /api/admin/public-content/:page
// ==================================================

export const updatePublicPage =
  async (req, res) => {
    try {
      const page = normalizePage(
        req.params.page
      );

      // ------------------------------------------
      // VALIDATE PAGE
      // ------------------------------------------

      if (!isValidPage(page)) {
        return res.status(404).json({
          success: false,
          message:
            "Invalid public page",
        });
      }

      // ------------------------------------------
      // GET BODY
      // ------------------------------------------

      const {
        content,
        isPublished = true,
      } = req.body || {};

      // ------------------------------------------
      // VALIDATE CONTENT
      // ------------------------------------------

      if (
        content === null ||
        typeof content !== "object" ||
        Array.isArray(content)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid content object is required",
        });
      }

      // ------------------------------------------
      // SAVE
      // ------------------------------------------

      const saved =
        await PublicContent.findOneAndUpdate(
          { page },
          {
            $set: {
              page,
              content,
              isPublished:
                Boolean(isPublished),
            },
          },
          {
            returnDocument: "after",
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );

      if (!saved) {
        return res.status(500).json({
          success: false,
          message:
            "Website content could not be saved",
        });
      }

      // ------------------------------------------
      // RESPONSE
      // ------------------------------------------

      return res.status(200).json({
        success: true,
        message:
          `${page} page content updated successfully`,
        page,
        content: saved.content,
        isPublished:
          saved.isPublished,
      });
    } catch (error) {
      console.error(
        "Update public content error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update website content",
        error: error.message,
      });
    }
  };

// ==================================================
// ADMIN - RESET PAGE
// PUT /api/admin/public-content/:page/reset
// ==================================================

export const resetPublicPage =
  async (req, res) => {
    try {
      const page = normalizePage(
        req.params.page
      );

      // ------------------------------------------
      // VALIDATE PAGE
      // ------------------------------------------

      if (!isValidPage(page)) {
        return res.status(404).json({
          success: false,
          message:
            "Invalid public page",
        });
      }

      // ------------------------------------------
      // RESTORE DEFAULT
      // ------------------------------------------

      const saved =
        await PublicContent.findOneAndUpdate(
          { page },
          {
            $set: {
              page,
              content:
                defaultContent[page],
              isPublished: true,
            },
          },
          {
            returnDocument: "after",
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );

      if (!saved) {
        return res.status(500).json({
          success: false,
          message:
            "Website content could not be reset",
        });
      }

      // ------------------------------------------
      // RESPONSE
      // ------------------------------------------

      return res.status(200).json({
        success: true,
        message:
          `${page} page restored successfully`,
        page,
        content: saved.content,
        isPublished:
          saved.isPublished,
      });
    } catch (error) {
      console.error(
        "Reset public content error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to reset website content",
        error: error.message,
      });
    }
  };