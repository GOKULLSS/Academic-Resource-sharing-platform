import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';
import './Login.css'; // Reusing Login CSS for simple styling

const VerifyOtp = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const { verifyOtp, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get email from router state or fallback
    const email = location.state?.email || '';

    useEffect(() => {
        if (user) {
            navigate('/');
        }
        if (!email) {
            // If they land here directly without an email, redirect to register
            navigate('/register');
        }
    }, [user, navigate, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await verifyOtp(email, otp);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify OTP');
        }
    };

    return (
        <div className="login-page">
            <Container>
                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <Card className="login-card p-4">
                            <Card.Body>
                                <h2 className="text-center mb-4 fw-bold">Verify OTP</h2>
                                <p className="text-center textcolor">
                                    Please enter the 6-digit OTP sent to <strong>{email}</strong>
                                </p>

                                {error && <Alert variant="danger">{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="textcolor">6-Digit OTP</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. 123456"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={6}
                                            required
                                        />
                                    </Form.Group>

                                    <Button variant="success" type="submit" className="w-100">
                                        Verify & Login
                                    </Button>
                                </Form>
                                <div className="mt-3 text-center">
                                    <Link to="/register" className="fw-bold text-decoration-none">
                                        Back to Register
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default VerifyOtp;
