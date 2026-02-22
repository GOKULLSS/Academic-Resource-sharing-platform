import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const NavigationBar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
            <Container>
                <Navbar.Brand as={Link} to="/">Campus Market</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        {user && user.role === 'admin' && (
                            <Nav.Link as={Link} to="/admin">Admin Dashboard</Nav.Link>
                        )}
                        {user && user.role === 'student' && (
                            <>
                                <Nav.Link as={Link} to="/student">My Dashboard</Nav.Link>
                                <Nav.Link as={Link} to="/chat">Messages</Nav.Link>
                            </>
                        )}
                    </Nav>
                    <Nav>
                        {user ? (
                            <>
                                <Navbar.Text className="me-3">
                                    Signed in as: {user.name} ({user.role})
                                </Navbar.Text>
                                <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;
