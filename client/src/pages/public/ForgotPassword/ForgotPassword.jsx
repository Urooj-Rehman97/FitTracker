import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaDumbbell,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaArrowLeft,
  FaKey,
} from "react-icons/fa";

import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // =========================
  // STEP 1 - Verify Email
  // =========================
  const handleEmailSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const users =
      JSON.parse(localStorage.getItem("fittrackUsers")) || [];

    const userExists = users.some(
      (user) =>
        user.email.toLowerCase() ===
        email.trim().toLowerCase()
    );

    if (!userExists) {
      setErrors({
        email: "No account found with this email address.",
      });
      return;
    }

    // Generate 6-digit OTP
    const newOtp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    setGeneratedOtp(newOtp);

    // Demo purpose only
    console.log("FitTrack Reset OTP:", newOtp);

    setErrors({});
    setMessage(
      `Verification code generated. Demo OTP: ${newOtp}`
    );

    setTimeout(() => {
      setMessage("");
      setStep(2);
    }, 1000);
  };

  // =========================
  // STEP 2 - Verify OTP
  // =========================
  const handleOtpSubmit = (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setErrors({
        otp: "Verification code is required.",
      });
      return;
    }

    if (otp !== generatedOtp) {
      setErrors({
        otp: "Invalid verification code.",
      });
      return;
    }

    setErrors({});
    setMessage("Code verified successfully.");

    setTimeout(() => {
      setMessage("");
      setStep(3);
    }, 700);
  };

  // =========================
  // STEP 3 - Reset Password
  // =========================
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!password) {
      newErrors.password = "New password is required.";
    } else if (password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const users =
      JSON.parse(localStorage.getItem("fittrackUsers")) || [];

    const updatedUsers = users.map((user) => {
      if (
        user.email.toLowerCase() ===
        email.trim().toLowerCase()
      ) {
        return {
          ...user,
          password: password,
        };
      }

      return user;
    });

    localStorage.setItem(
      "fittrackUsers",
      JSON.stringify(updatedUsers)
    );

    // Remove any logged-in session
    localStorage.removeItem("fittrackUser");

    setErrors({});
    setMessage(
      "Password reset successfully! Redirecting to login..."
    );

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1200);
  };

  // =========================
  // Back
  // =========================
  const handleBack = () => {
    setErrors({});
    setMessage("");

    if (step === 2) {
      setStep(1);
      setOtp("");
    } else if (step === 3) {
      setStep(2);
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <FaDumbbell />
          </div>

          <span>
            Fit<span>Track</span>
          </span>
        </div>

        <div className="auth-card">

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <>
              <div className="auth-header">
                <h1>Forgot Password?</h1>

                <p>
                  Enter your registered email address to
                  receive a verification code.
                </p>
              </div>

              {message && (
                <div className="auth-success">
                  {message}
                </div>
              )}

              <form onSubmit={handleEmailSubmit}>
                <div className="auth-form-group">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <div
                    className={`auth-input ${
                      errors.email ? "input-error" : ""
                    }`}
                  >
                    <FaEnvelope />

                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({});
                        setMessage("");
                      }}
                    />
                  </div>

                  {errors.email && (
                    <small className="error-text">
                      {errors.email}
                    </small>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                >
                  Send Verification Code
                  <FaArrowRight />
                </button>
              </form>

              <div className="auth-divider">
                <span>OR</span>
              </div>

              <p className="auth-bottom-text">
                Remember your password?{" "}
                <Link to="/login">
                  Sign in
                </Link>
              </p>
            </>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <>
              <div className="auth-header">
                <h1>Verify Code</h1>

                <p>
                  Enter the 6-digit verification code.
                </p>
              </div>

              {message && (
                <div className="auth-success">
                  {message}
                </div>
              )}

              <form onSubmit={handleOtpSubmit}>
                <div className="auth-form-group">
                  <label htmlFor="otp">
                    Verification Code
                  </label>

                  <div
                    className={`auth-input ${
                      errors.otp ? "input-error" : ""
                    }`}
                  >
                    <FaKey />

                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => {
                        const value =
                          e.target.value.replace(/\D/g, "");

                        setOtp(value);

                        setErrors((prev) => ({
                          ...prev,
                          otp: "",
                        }));

                        setMessage("");
                      }}
                    />
                  </div>

                  {errors.otp && (
                    <small className="error-text">
                      {errors.otp}
                    </small>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                >
                  Verify Code
                  <FaArrowRight />
                </button>
              </form>

              <button
                type="button"
                className="back-login-button"
                onClick={handleBack}
              >
                <FaArrowLeft />
                Back
              </button>
            </>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <>
              <div className="auth-header">
                <h1>Create New Password</h1>

                <p>
                  Your email has been verified. Create a
                  new password below.
                </p>
              </div>

              {message && (
                <div className="auth-success">
                  {message}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>

                {/* New Password */}
                <div className="auth-form-group">
                  <label htmlFor="password">
                    New Password
                  </label>

                  <div
                    className={`auth-input ${
                      errors.password
                        ? "input-error"
                        : ""
                    }`}
                  >
                    <FaLock />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);

                        setErrors((prev) => ({
                          ...prev,
                          password: "",
                        }));

                        setMessage("");
                      }}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <small className="error-text">
                      {errors.password}
                    </small>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="auth-form-group">
                  <label htmlFor="confirmPassword">
                    Confirm Password
                  </label>

                  <div
                    className={`auth-input ${
                      errors.confirmPassword
                        ? "input-error"
                        : ""
                    }`}
                  >
                    <FaLock />

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(
                          e.target.value
                        );

                        setErrors((prev) => ({
                          ...prev,
                          confirmPassword: "",
                        }));

                        setMessage("");
                      }}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <small className="error-text">
                      {errors.confirmPassword}
                    </small>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                >
                  Reset Password
                  <FaArrowRight />
                </button>
              </form>

              <button
                type="button"
                className="back-login-button"
                onClick={handleBack}
              >
                <FaArrowLeft />
                Back
              </button>
            </>
          )}

        </div>

        <p className="auth-footer-text">
          © 2026 FitTrack. Stay healthy. Stay strong.
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;