import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaDumbbell,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from "react-icons/fa";

import "./Login.css";

import { loginUser } from "../../../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==================================================
  // HANDLE INPUT CHANGE
  // ==================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setMessage("");
  };

  // ==================================================
  // VALIDATION
  // ==================================================

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email =
        "Email address is required.";
    } else if (
      !/^\S+@\S+\.\S+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password =
        "Password is required.";
    } else if (
      formData.password.length < 6
    ) {
      newErrors.password =
        "Password must be at least 6 characters.";
    }

    return newErrors;
  };

  // ==================================================
  // LOGIN
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setErrors({});

    const validationErrors = validate();

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log(
        "LOGIN RESPONSE:",
        response
      );

      // ==================================================
      // CHECK LOGIN RESPONSE
      // ==================================================

      if (
        !response ||
        !response.success
      ) {
        throw new Error(
          response?.message ||
            "Login failed."
        );
      }

      const { token, user } = response;

      if (!token) {
        throw new Error(
          "Login response is missing authentication token."
        );
      }

      if (!user) {
        throw new Error(
          "Login response is missing user information."
        );
      }

      // ==================================================
      // CLEAR OLD AUTH DATA
      // ==================================================

      sessionStorage.removeItem(
        "fittrackToken"
      );

      sessionStorage.removeItem(
        "fittrackUser"
      );

      localStorage.removeItem(
        "fittrackToken"
      );

      localStorage.removeItem(
        "fittrackUser"
      );

      localStorage.removeItem(
        "fittrackProfile"
      );

      // ==================================================
      // SAVE AUTH DATA
      // ==================================================

      sessionStorage.setItem(
        "fittrackToken",
        token
      );

      sessionStorage.setItem(
        "fittrackUser",
        JSON.stringify(user)
      );

      // ==================================================
      // REMEMBER ME
      // ==================================================

      if (formData.remember) {
        localStorage.setItem(
          "fittrackToken",
          token
        );

        localStorage.setItem(
          "fittrackUser",
          JSON.stringify(user)
        );
      }

      // ==================================================
      // VERIFY STORAGE BEFORE REDIRECT
      // ==================================================

      console.log(
        "SAVED TOKEN:",
        sessionStorage.getItem(
          "fittrackToken"
        )
      );

      console.log(
        "SAVED USER:",
        sessionStorage.getItem(
          "fittrackUser"
        )
      );

      console.log(
        "LOGGED-IN USER:",
        user
      );

      setMessage(
        "Login successful! Redirecting..."
      );

      // ==================================================
      // REDIRECT
      // ==================================================

      const redirectPath =
        user.role === "admin"
          ? "/admin"
          : "/dashboard";

      console.log(
        "REDIRECTING TO:",
        redirectPath
      );

      /*
       * Use a full browser redirect here.
       * This guarantees that the newly saved authentication
       * data is available when the protected route loads.
       */

      window.location.replace(
        redirectPath
      );
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      const errorMessage =
        error?.message ||
        "Invalid email or password.";

      setErrors({
        email: errorMessage,
        password: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // UI
  // ==================================================

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
            <h1>Welcome Back!</h1>

            <p>
              Sign in to continue your fitness journey.
            </p>
          </div>

          {/* Success Message */}

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}

            <div className="auth-form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div
                className={`auth-input ${
                  errors.email
                    ? "input-error"
                    : ""
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
                  autoComplete="email"
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

              <div className="auth-label-row">

                <label htmlFor="password">
                  Password
                </label>

                <Link to="/forgot-password">
                  Forgot Password?
                </Link>

              </div>

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
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
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

            {/* Remember Me */}

            <label className="remember-me">

              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                disabled={loading}
              />

              <span>
                Remember me
              </span>

            </label>

            {/* Submit */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Signing In..."
                : "Sign In"}

              {!loading && (
                <FaArrowRight />
              )}
            </button>

          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <p className="auth-bottom-text">
            Don't have an account?{" "}

            <Link to="/register">
              Create an account
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

export default Login;