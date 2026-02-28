import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "./Navbar.css";

const NavigationBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar expand="lg" sticky="top" className="custom-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-text">
          Campus Market
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto nav-links">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>

            {user && user.role === "admin" && (
              <Nav.Link as={Link} to="/admin">
                Admin Dashboard
              </Nav.Link>
            )}

           {user && user.role === "student" && (
           <>
              <Nav.Link as={Link} to="/student">
                  My Dashboard
              </Nav.Link>

              <Nav.Link as={Link} to="/buyer-dashboard">
                  My Purchases
              </Nav.Link>

              <Nav.Link as={Link} to="/seller-dashboard">
                  Incoming Orders
              </Nav.Link>

              <Nav.Link as={Link} to="/chat">
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
                <Nav.Link as={Link} to="/login" className="login-link">
                  Login
                </Nav.Link>
                <Button
                  as={Link}
                  to="/register"
                  className="register-btn"
                  size="sm"
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