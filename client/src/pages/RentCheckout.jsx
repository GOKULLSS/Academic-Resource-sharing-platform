import { useLocation, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import { Container, Card, Button, Form, Row, Col, Alert } from "react-bootstrap";
import AuthContext from "../context/AuthContext";

const RentCheckout = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [error, setError] = useState("");

    const product = state?.product;

    if (!product) {
        return <Container className="mt-4"><h3>Product not found</h3></Container>;
    }

    // Calculate Days
    let totalDays = 0;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const rentPerDay = product.price || 0;
    const deposit = product.deposit || 0;
    const totalAmount = totalDays > 0 ? (totalDays * rentPerDay) + deposit : 0;

    const handleConfirm = async () => {
        if (totalDays <= 0) {
            setError("Please select a valid date range. End date must be after start date.");
            return;
        }

        if (user && user._id === product.seller) {
            setError("You cannot rent your own product.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:5000/api/rentals",
                {
                    productId: product._id,
                    startDate,
                    endDate,
                    totalDays
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate("/buyer-dashboard");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Error requesting rental");
        }
    };

    return (
        <Container className="mt-4">
            <Card className="p-4">
                <h3>Rent Request</h3>
                {error && <Alert variant="danger">{error}</Alert>}

                <Row className="mb-4 mt-3">
                    <Col md={6}>
                        <p className="mb-1 text-muted">Item</p>
                        <h5>{product.title}</h5>
                    </Col>
                    <Col md={6}>
                        <p className="mb-1 text-muted">Rent Pricing</p>
                        <p className="mb-0">₹{rentPerDay} / day</p>
                        <p className="mb-0">Deposit: ₹{deposit} (Refundable)</p>
                    </Col>
                </Row>

                <Form>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={startDate}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>End Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={endDate}
                                    min={startDate || new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>

                {totalDays > 0 ? (
                    <Card className="mt-3 bg-light border-0">
                        <Card.Body>
                            <h6>Summary</h6>
                            <div className="d-flex justify-content-between">
                                <span>Duration:</span>
                                <span>{totalDays} Days</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Rent Total:</span>
                                <span>₹{totalDays * rentPerDay}</span>
                            </div>
                            <div className="d-flex justify-content-between text-success">
                                <span>Deposit (Refundable):</span>
                                <span>₹{deposit}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold">
                                <span>Total Payable:</span>
                                <span>₹{totalAmount}</span>
                            </div>
                        </Card.Body>
                    </Card>
                ) : (
                    <p className="text-muted mt-3">Select valid dates to see summary.</p>
                )}

                <Button
                    className="mt-4 w-100"
                    variant="warning"
                    disabled={totalDays <= 0}
                    onClick={handleConfirm}
                >
                    Confirm Rent Request
                </Button>
            </Card>
        </Container>
    );
};

export default RentCheckout;
