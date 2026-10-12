import { Link } from "react-router-dom";
import {
  FaDumbbell,
  FaHome,
  FaArrowLeft,
  FaSearch,
} from "react-icons/fa";

import "./NotFound.css";

function NotFound() {
  return (
    <div className="not-found-page">

      <div className="not-found-content">

        <div className="not-found-logo">
          <span>
            <FaDumbbell />
          </span>

          <strong>
            Fit<span>Track</span>
          </strong>
        </div>

        <div className="not-found-number">
          404
        </div>

        <div className="not-found-icon">
          <FaSearch />
        </div>

        <h1>Page Not Found</h1>

        <p>
          Sorry, we couldn't find the page you're looking for.
          It may have been moved, deleted, or the URL may be incorrect.
        </p>

        <div className="not-found-actions">

          <Link
            to="/"
            className="not-found-home"
          >
            <FaHome />
            Go Home
          </Link>

          <button
            type="button"
            className="not-found-back"
            onClick={() => window.history.back()}
          >
            <FaArrowLeft />
            Go Back
          </button>

        </div>

      </div>

    </div>
  );
}

export default NotFound;