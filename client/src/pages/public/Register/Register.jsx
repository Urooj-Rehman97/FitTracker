
import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  FaDumbbell,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from "react-icons/fa";

import "./Register.css";

import { registerUser } from "../../../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setMessage("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    if (!formData.terms) {
      newErrors.terms =
        "You must accept the terms and conditions.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setErrors({});

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (!response.success) {
        throw new Error(
          response.message || "Registration failed."
        );
      }

      setMessage(
        "Account created successfully! Redirecting to login..."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (error) {
      const errorMessage =
        error.message || "Registration failed. Please try again.";

      if (
        errorMessage.toLowerCase().includes("email") ||
        errorMessage.toLowerCase().includes("already")
      ) {
        setErrors({
          email: errorMessage,
        });
      } else {
        setMessage("");
        setErrors({
          form: errorMessage,
        });
      }
    } finally {
      setLoading(false);
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

        {/* Card */}
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>

            <p>
              Start your fitness journey with FitTrack.
            </p>
          </div>

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          {errors.form && (
            <div className="error-text">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="auth-form-group">
              <label htmlFor="name">
                Full Name
              </label>

              <div
                className={`auth-input ${
                  errors.name ? "input-error" : ""
                }`}
              >
                <FaUser />

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {errors.name && (
                <small className="error-text">
                  {errors.name}
                </small>
              )}
            </div>

            {/* Email */}
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
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {errors.email && (
                <small className="error-text">
                  {errors.email}
                </small>
              )}
            </div>

            {/* Password */}
            <div className="auth-form-group">
              <label htmlFor="password">
                Password
              </label>

              <div
                className={`auth-input ${
                  errors.password ? "input-error" : ""
                }`}
              >
                <FaLock />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label="Toggle password visibility"
                  disabled={loading}
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
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label="Toggle password visibility"
                  disabled={loading}
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

            {/* Terms */}
            <label className="remember-me">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                disabled={loading}
              />

              <span>
                I agree to the Terms & Conditions
              </span>
            </label>

            {errors.terms && (
              <small className="error-text terms-error">
                {errors.terms}
              </small>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}

              {!loading && <FaArrowRight />}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <p className="auth-bottom-text">
            Already have an account?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>
        </div>

        <p className="auth-footer-text">
          © 2026 FitTrack. Stay healthy. Stay strong.
        </p>
      </div>
    </div>
  );
}

export default Register;

