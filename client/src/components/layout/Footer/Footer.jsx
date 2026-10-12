import { Container, Row, Col } from "react-bootstrap";

import {
  FaDumbbell,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import "./Footer.css";

function Footer() {
  return (
    <footer className="main-footer">
      <Container>
        <Row className="gy-5">
          <Col lg={5} md={12}>
            <div className="footer-brand">
              <div className="footer-logo">
                <FaDumbbell />
              </div>

              <h3>
                Fit<span>Track</span>
              </h3>
            </div>

            <p className="footer-description">
              Your complete fitness companion for tracking workouts, nutrition
              and progress. Train smarter, stay consistent and become the
              strongest version of yourself.
            </p>

            <div className="footer-socials">
              <a href="#facebook" aria-label="Facebook">
                <FaFacebookF />
              </a>

              <a href="#instagram" aria-label="Instagram">
                <FaInstagram />
              </a>

              <a href="#twitter" aria-label="Twitter">
                <FaTwitter />
              </a>

              <a href="#youtube" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </Col>

          <Col sm={6} lg={2}>
            <h5>Company</h5>

            <Link to="/about">About Us</Link>

            <Link to="/features">Features</Link>

            <Link to="/contact">Contact</Link>
          </Col>

          <Col sm={6} lg={2}>
            <h5>Account</h5>

            <Link to="/login">Login</Link>

            <Link to="/register">Get Started</Link>

            <Link to="/forgot-password">Forgot Password</Link>
          </Col>

          <Col sm={6} lg={3}>
            <h5>Support</h5>

            <Link to="/contact">Contact Support</Link>

            <Link to="/features">Features</Link>

            <Link to="/about">About FitTrack</Link>
          </Col>
        </Row>

        <div className="footer-bottom">
          <p>© 2026 FitTrack. All rights reserved.</p>

          <div className="footer-bottom-links">
            <Link to="/about">About</Link>

            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
