import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "./Navbar.css";


const NavigationBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();


  const [expanded, setExpanded] = useState(false);

  const handleNavClick = () => setExpanded(false);

  const handleLogout = () => {
    logout();
    setExpanded(false);
    navigate("/login");
  };

  return (
    <Navbar expand="lg" sticky="top" className="custom-navbar" expanded={expanded}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-logo">
          <img src="/logo.jpg" alt="OnCampusMart" className="logo-img" />
          <span className="brand-text">
            <span className="brand-blue">OnCampus</span>
            <span className="brand-orange">Mart</span>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />

        <Navbar.Collapse
          id="basic-navbar-nav"
          className={`custom-collapse ${expanded ? "open" : ""}`}
        >
          <Nav className="me-auto nav-links">
            <Nav.Link as={Link} to="/" onClick={handleNavClick}>
              Home
            </Nav.Link>

            {user && user.role === "admin" && (
              <Nav.Link as={Link} to="/admin" onClick={handleNavClick}>
                Admin Dashboard
              </Nav.Link>
            )}

            {user && user.role === "student" && (
              <>
                <Nav.Link as={Link} to="/student" onClick={handleNavClick}>
                  My Dashboard
                </Nav.Link>

                <Nav.Link as={Link} to="/buyer-dashboard" onClick={handleNavClick}>
                  My Purchases
                </Nav.Link>

                <Nav.Link as={Link} to="/seller-dashboard" onClick={handleNavClick}>
                  Incoming Orders
                </Nav.Link>

                <Nav.Link as={Link} to="/chat" onClick={handleNavClick}>
                  Messages
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="align-items-center">
            {user ? (
              <>
                <span className="user-info me-3">
                  {user.name}
                </span>
                <Button
                  className="logout-btn"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="login-link" onClick={handleNavClick}>
                  Login
                </Nav.Link>
                <Button
                  as={Link}
                  to="/register"
                  className="register-btn"
                  size="sm"
                  onClick={handleNavClick}
                >
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;