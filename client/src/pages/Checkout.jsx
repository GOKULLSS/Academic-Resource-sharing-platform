import { useLocation, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Modal } from "react-bootstrap";
import AuthContext from "../context/AuthContext";

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [pickup, setPickup] = useState("Meet on campus");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // If accessed directly without product state, redirect to home
  if (!state || !state.product) {
    return (
      <Container className="mt-5 text-center">
        <h4>No product selected for checkout.</h4>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </Container>
    );
  }

  const product = state.product;

  const handleConfirmClick = () => {
    if (user && user._id === (product.seller?._id || product.seller)) {
      setError("You cannot buy your own product.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Terms and Conditions to proceed.");
      return;
    }
    setError("");
    setShowModal(true);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "https://academic-resource-sharing-platform.onrender.com/api/orders",
        {
          productId: product._id,
          pickupPreference: pickup,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Order placed successfully! Redirecting...");
      setTimeout(() => {
        setShowModal(false);
        navigate("/buyer-dashboard");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating order.");
      setIsProcessing(false);
      setShowModal(false);
    }
  };

  return (
    <Container className="mt-5 mb-5 py-4" style={{ maxWidth: '900px' }}>
      <h2 className="mb-4 fw-bold">Secure Checkout</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="g-4">
        {/* Left Column - Product info, Delivery, Buyer Info */}
        <Col md={7}>

          {/* 1. Buyer Information */}
          <Card className="mb-4 shadow-sm border-0 rounded-3">
            <Card.Header className="bg-white border-bottom-0 pt-3 pb-0">
              <h5 className="mb-0 fw-bold">Buyer Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <strong style={{ minWidth: '60px' }}>Name:</strong> <span className="text-dark">{user?.name || "Guest"}</span>
              </div>
              <div className="d-flex align-items-center">
                <strong style={{ minWidth: '60px' }}>Email:</strong> <span className="text-muted">{user?.email || "Not specified"}</span>
              </div>
            </Card.Body>
          </Card>

          {/* 2. Product Summary Card */}
          <Card className="mb-4 shadow-sm border-0 rounded-3">
            <Card.Header className="bg-white border-bottom-0 pt-3 pb-0">
              <h5 className="mb-0 fw-bold">Item Details</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column flex-sm-row gap-3">
                {product.image ? (
                  <img
                    src={product.image.startsWith('http') ? product.image : `https://academic-resource-sharing-platform.onrender.com${product.image}`}
                    alt={product.title}
                    style={{ width: "120px", height: "120px", objectFit: "contain", borderRadius: "8px" }}
                  />
                ) : (
                  <div
                    style={{ width: "120px", height: "120px", backgroundColor: "#f8f9fa", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <span className="text-muted">No Image</span>
                  </div>
                )}
                <div className="d-flex flex-column justify-content-center">
                  <h5 className="fw-bold mb-1">{product.title}</h5>
                  <div className="mb-2">
                    <Badge bg="secondary" className="me-2 rounded-pill px-3 py-2">{product.category}</Badge>
                    {product.condition && <Badge bg="info" className="rounded-pill px-3 py-2 text-dark">Condition: {product.condition}</Badge>}
                  </div>
                  <p className="text-muted mb-1" style={{ fontSize: "0.9rem" }}>
                    Seller: <strong className="text-dark">{product.seller?.name || "Campus Seller"}</strong>
                  </p>
                  <h5 className="text-primary mt-2 mb-0 fw-bold">₹{product.price}</h5>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* 3. Delivery Method */}
          <Card className="mb-4 shadow-sm border-0 rounded-3">
            <Card.Header className="bg-white border-bottom-0 pt-3 pb-0">
              <h5 className="mb-0 fw-bold">Delivery Method</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <div className="p-3 border rounded mb-2 bg-light">
                  <Form.Check
                    type="radio"
                    id="delivery-campus"
                    name="deliveryMethod"
                    label={<><strong className="ms-1">Meet on campus</strong><br /><span className="text-muted small ms-1">Meet at a common location inside the campus.</span></>}
                    value="Meet on campus"
                    checked={pickup === "Meet on campus"}
                    onChange={(e) => setPickup(e.target.value)}
                  />
                </div>
                <div className="p-3 border rounded mb-2">
                  <Form.Check
                    type="radio"
                    id="delivery-pickup"
                    name="deliveryMethod"
                    label={<><strong className="ms-1">Pickup from seller</strong><br /><span className="text-muted small ms-1">Go to the seller's location to collect the item.</span></>}
                    value="Pickup from seller"
                    checked={pickup === "Pickup from seller"}
                    onChange={(e) => setPickup(e.target.value)}
                  />
                </div>
                <div className="p-3 border rounded">
                  <Form.Check
                    type="radio"
                    id="delivery-hostel"
                    name="deliveryMethod"
                    label={<><strong className="ms-1">Hostel Delivery (if available)</strong><br /><span className="text-muted small ms-1">Request the seller to deliver it to your hostel.</span></>}
                    value="Hostel delivery"
                    checked={pickup === "Hostel delivery"}
                    onChange={(e) => setPickup(e.target.value)}
                  />
                </div>
              </Form>
              <div className="mt-3 text-muted small p-2 bg-light rounded d-flex align-items-center">
                Coordinate the exact location and time via chat after placing the order.
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Order Summary & Actions */}
        <Col md={5}>
          <Card className="shadow-sm border-0 rounded-3 sticky-top" style={{ top: "80px" }}>
            <Card.Header className="bg-white border-bottom-0 pt-3 pb-0">
              <h5 className="mb-0 fw-bold">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3 text-muted">
                <span>Item Price</span>
                <span>₹{product.price}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 text-muted">
                <span>Platform Fee</span>
                <span>₹0</span>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-3 text-muted">
                <span>Delivery</span>
                <span>Free</span>
              </div>
              <div className="d-flex justify-content-between mb-4 mt-2">
                <strong className="fs-5">Total Amount</strong>
                <strong className="fs-5 text-primary fw-bold">₹{product.price}</strong>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-4 p-3 bg-light rounded text-muted border" style={{ fontSize: "0.85rem" }}>
                <h6 className="fw-bold text-dark mb-2">Terms & Conditions</h6>
                <ul className="pl-3 mb-0" style={{ paddingLeft: "1.2rem" }}>
                  <li className="mb-1">All sales are final once handed over.</li>
                  <li className="mb-1">Verify the item condition at the time of meetup.</li>
                  <li>Payment must be settled between buyer and seller directly.</li>
                </ul>
              </div>

              <Form.Group className="mb-4" controlId="termsCheckbox">
                <Form.Check
                  type="checkbox"
                  label={<span className={error && !agreed ? "text-danger fw-bold" : "text-dark"}>I agree to the Terms and Conditions</span>}
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (e.target.checked) setError("");
                  }}
                  className="ps-4"
                />
              </Form.Group>

              <Button
                variant="primary"
                size="lg"
                className="w-100 py-3 fw-bold shadow-sm rounded-pill"
                onClick={handleConfirmClick}
              >
                Place Order • ₹{product.price}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => !isProcessing && setShowModal(false)} centered backdrop="static">
        <Modal.Header closeButton={!isProcessing} className="border-bottom-0 px-4 pt-4">
          <Modal.Title className="fw-bold fs-4">Confirm Your Order</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4 px-5">
          <div className="mb-4">
            <h1 className="text-primary fw-bold" style={{ fontSize: "3rem" }}>₹{product.price}</h1>
            <p className="text-muted text-uppercase mb-0" style={{ letterSpacing: "1px", fontSize: "0.85rem" }}>Total Amount to Pay</p>
          </div>
          <div className="bg-light p-3 rounded-3 text-start mb-2">
            <p className="mb-2 text-dark">
              <strong>Item:</strong> {product.title}
            </p>
            <p className="mb-0 text-dark">
              <strong>Delivery Method:</strong> {pickup}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 px-4 pb-4">
          <Button variant="light" className="px-4 py-2 rounded-pill fw-bold" onClick={() => setShowModal(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button variant="primary" className="px-5 py-2 rounded-pill fw-bold shadow-sm" onClick={handlePlaceOrder} disabled={isProcessing}>
            {isProcessing ? 'Processing Order...' : 'Confirm Order'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default Checkout;