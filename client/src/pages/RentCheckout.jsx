import { useLocation, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Container, Card, Button, Form, Row, Col, Alert, Badge, Modal } from "react-bootstrap";
import AuthContext from "../context/AuthContext";

const RentCheckout = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [deliveryMethod, setDeliveryMethod] = useState("Pickup from owner");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const product = state?.product;

    useEffect(() => {
        if (!product) {
            navigate("/");
        }
    }, [product, navigate]);

    if (!product) {
        return <Container className="mt-4"><h3>Redirecting...</h3></Container>;
    }

    // Default values for missing product data fields
    const ownerName = product.seller?.name || "Campus User";
    const itemCondition = "Good";
    const pickupLocation = "Campus Main Gate";
    const minRentalPeriod = 1;
    const lateFeePerDay = Math.round((product.price || 0) * 1.5);

    // Calculate Days
    let totalDays = 0;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const diffTime = end - start;
            totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
    }

    const subtotal = totalDays > 0 ? (totalDays * (product.price || 0)) : 0;
    const deposit = product.deposit || 0;
    const totalAmount = subtotal + deposit;

    const todayDateStr = new Date().toISOString().split("T")[0];

    const handleOpenModal = () => {
        if (totalDays < minRentalPeriod) {
            setError(`Minimum rental period is ${minRentalPeriod} day(s).`);
            return;
        }
        if (new Date(endDate) <= new Date(startDate)) {
            setError("End date must be after start date.");
            return;
        }
        if (user && user._id === product.seller) {
            setError("You cannot rent your own product.");
            return;
        }
        setError("");
        setShowModal(true);
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setError("");
        try {
            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:5000/api/rentals",
                {
                    productId: product._id,
                    startDate,
                    endDate,
                    totalDays,
                    deliveryMethod
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setShowModal(false);
            setSuccessMessage("Your rental request has been sent to the owner. Status: Waiting for approval.");
            
            setTimeout(() => {
                navigate("/buyer-dashboard");
            }, 3000);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Error requesting rental");
            setIsSubmitting(false);
            setShowModal(false);
        }
    };

    return (
        <Container className="mt-4 mb-5" style={{ maxWidth: '800px' }}>
            <h2 className="mb-4 text-center fw-bold">Rent Request</h2>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            {/* 1. Product Details Section */}
            <Card className="shadow-sm mb-4 border-0">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={4} className="text-center mb-3 mb-md-0">
                            {product.image ? (
                                <img 
                                    src={`http://localhost:5000${product.image}`} 
                                    alt={product.title} 
                                    style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                                />
                            ) : (
                                <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '150px', borderRadius: '8px' }}>
                                    <span className="text-muted">No Image Available</span>
                                </div>
                            )}
                        </Col>
                        <Col md={8}>
                            <h4 className="fw-bold mb-2">{product.title}</h4>
                            <div className="mb-2">
                                <Badge bg="secondary" className="me-2">{product.category}</Badge>
                                <Badge bg="warning" text="dark">For Rent</Badge>
                            </div>
                            <Row className="text-muted mt-3 g-2">
                                <Col xs={6}><strong>Owner:</strong> {ownerName}</Col>
                                <Col xs={6}><strong>Condition:</strong> {itemCondition}</Col>
                                <Col xs={12}><strong>Pickup Location:</strong> {pickupLocation}</Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Row className="g-4">
                <Col md={7}>
                    {/* Date Selection */}
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <h5 className="mb-3 text-primary border-bottom pb-2">Rental Period</h5>
                            <Form>
                                <Row className="mb-3">
                                    <Col sm={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Start Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={startDate}
                                                min={todayDateStr}
                                                onChange={(e) => {
                                                    setStartDate(e.target.value);
                                                    if (endDate && e.target.value >= endDate) {
                                                        setEndDate("");
                                                    }
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">End Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={endDate}
                                                min={startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] : todayDateStr}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                disabled={!startDate}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Delivery / Pickup Method */}
                                <Form.Group className="mb-3 mt-4">
                                    <Form.Label className="fw-semibold">Delivery / Pickup Method</Form.Label>
                                    <Form.Select 
                                        value={deliveryMethod}
                                        onChange={(e) => setDeliveryMethod(e.target.value)}
                                    >
                                        <option value="Pickup from owner">Pickup from owner</option>
                                        <option value="Meet on campus">Meet on campus</option>
                                        <option value="Delivery (optional)">Delivery (optional)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={5}>
                    {/* Improved Pricing Display & Summary */}
                    <Card className="shadow-sm border-0 bg-light h-100">
                        <Card.Body>
                            <h5 className="mb-3 text-primary border-bottom pb-2">Cost Summary</h5>
                            
                            <div className="mb-3 text-muted small">
                                <Row className="mb-1"><Col>Price per day:</Col><Col className="text-end">₹{product.price || 0}</Col></Row>
                                <Row className="mb-1"><Col>Security Deposit:</Col><Col className="text-end">₹{deposit}</Col></Row>
                                <Row className="mb-1"><Col>Min. Period:</Col><Col className="text-end">{minRentalPeriod} Day(s)</Col></Row>
                                <Row className="mb-1"><Col>Late Fee:</Col><Col className="text-end">₹{lateFeePerDay}/day</Col></Row>
                            </div>

                            {totalDays > 0 ? (
                                <div className="mt-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Rental Duration:</span>
                                        <span className="fw-semibold">{totalDays} Days</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Subtotal:</span>
                                        <span>₹{subtotal}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2 text-success">
                                        <span>Deposit (Refundable):</span>
                                        <span>₹{deposit}</span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="d-flex justify-content-between fw-bold fs-5 text-primary">
                                        <span>Total Payable:</span>
                                        <span>₹{totalAmount}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted mt-3 mb-0 text-center font-italic align-middle h-50 d-flex align-items-center justify-content-center">
                                    Select valid dates to view total cost.
                                </p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Rental Terms Section */}
            <Card className="mt-4 shadow-sm border-0 border-start border-4 border-warning bg-light">
                <Card.Body>
                    <h6 className="fw-bold mb-2">Rental Terms & Conditions</h6>
                    <ul className="text-muted small mb-3">
                        <li>The item must be returned in its original condition on or before the end date.</li>
                        <li>The security deposit (₹{deposit}) will be fully refunded if there is no damage or loss.</li>
                        <li>Late returns will incur an extra charge of ₹{lateFeePerDay} per day.</li>
                    </ul>
                    <Form.Group>
                        <Form.Check 
                            type="checkbox"
                            id="terms-checkbox"
                            label="I agree to the rental terms and conditions."
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="fw-semibold text-dark"
                        />
                    </Form.Group>
                </Card.Body>
            </Card>

            <Button
                className="mt-4 w-100 py-3 fw-bold fs-5 shadow"
                variant="warning"
                disabled={totalDays < minRentalPeriod || !agreedToTerms || isSubmitting}
                onClick={handleOpenModal}
            >
                Send Rent Request
            </Button>

            {/* Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Confirm Rent Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>You are about to send a rent request for the following item:</p>
                    <div className="bg-light p-3 rounded mb-3">
                        <Row className="mb-2">
                            <Col xs={5} className="text-muted">Item Name:</Col>
                            <Col xs={7} className="fw-semibold">{product.title}</Col>
                        </Row>
                        <Row className="mb-2">
                            <Col xs={5} className="text-muted">Rental Dates:</Col>
                            <Col xs={7} className="fw-semibold">{startDate} to {endDate}</Col>
                        </Row>
                        <Row className="mb-2">
                            <Col xs={5} className="text-muted">Total Payable:</Col>
                            <Col xs={7} className="fw-bold text-primary">₹{totalAmount}</Col>
                        </Row>
                    </div>
                    <p className="text-muted small mb-0">The owner will review your request. Once approved, you can coordinate pickup and payment.</p>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="warning" onClick={handleConfirm} disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Confirm Request"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default RentCheckout;
