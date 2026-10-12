import {
  Container,
  Nav,
  Navbar as BootstrapNavbar,
  Button,
} from "react-bootstrap";

import { FaDumbbell } from "react-icons/fa";
import { NavLink, Link } from "react-router-dom";

import "./Navbar.css";

function Navbar() {
  return (
    <BootstrapNavbar expand="lg" className="main-navbar" sticky="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="brand-logo">
          <span className="brand-icon">
            <FaDumbbell />
          </span>

          <span className="brand-text">
            Fit<span>Track</span>
          </span>
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle
          aria-controls="main-navbar-nav"
          className="navbar-toggle"
        />

        <BootstrapNavbar.Collapse id="main-navbar-nav">
          <Nav className="mx-auto navbar-links">
            <NavLink
              as={NavLink}
              to="/"
              end
              className={({ isActive }) =>
                `nav-link-custom ${isActive ? "nav-active" : ""}`
              }
            >
              Home
            </NavLink>

            <NavLink
              as={NavLink}
              to="/about"
              className={({ isActive }) =>
                `nav-link-custom ${isActive ? "nav-active" : ""}`
              }
            >
              About
            </NavLink>

            <NavLink
              as={NavLink}
              to="/features"
              className={({ isActive }) =>
                `nav-link-custom ${isActive ? "nav-active" : ""}`
              }
            >
              Features
            </NavLink>

            <NavLink
              as={NavLink}
              to="/contact"
              className={({ isActive }) =>
                `nav-link-custom ${isActive ? "nav-active" : ""}`
              }
            >
              Contact
            </NavLink>
          </Nav>

          <div className="navbar-actions">
            <Link to="/login" className="login-link">
              Login
            </Link>

            <Button as={Link} to="/register" className="register-btn">
              Get Started
            </Button>
          </div>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
