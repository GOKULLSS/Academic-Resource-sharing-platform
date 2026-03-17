import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Button, Badge, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./SellerDashboard.css";

const SellerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [rentalRequests, setRentalRequests] = useState([]);
  const navigate = useNavigate();

  const handleChat = async (userId, productId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/chat",
        { userId, productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/chat", { state: { chat: res.data } });
    } catch (error) {
      console.error("Failed to start chat", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/orders/seller",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch seller orders", error);
    }
  };

  const fetchRentalRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/rentals/owner-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRentalRequests(data);
    } catch (error) {
      console.error("Failed to fetch rental requests", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRentalRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order", error);
    }
  };

  const handleRentalStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/rentals/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRentalRequests();
    } catch (error) {
      console.error("Failed to update rental status", error);
    }
  };

  return (
    <Container className="mt-4">

      {/* HEADER */}
      <Card className="glass-card mb-4">
        <Card.Body>
          <h3>Seller Dashboard</h3>
          <p>Manage your orders and rental requests efficiently.</p>
        </Card.Body>
      </Card>

      {/* ORDERS */}
      <Card className="glass-card1 mb-4">
        <Card.Body>
          <h4>Incoming Orders (Buy)</h4>

          {orders.length === 0 && <p>No incoming orders.</p>}

          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <Row className="align-items-center">

                <Col md={2}>
                  {order.product?.image ? (
                    <img
                      src={
                        order.product.image.startsWith("http")
                          ? order.product.image
                          : `http://localhost:5000${order.product.image}`
                      }
                      className="product-img-large"
                      alt=""
                    />
                  ) : (
                    <div className="no-img">No Image</div>
                  )}
                </Col>

                <Col md={6}>
                  <h5>{order.product?.title || "Product Deleted"}</h5>
                  <p>₹{order.product?.price}</p>
                  <p>Buyer: {order.buyer?.name}</p>

                  <span className={`status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </Col>

                <Col md={4} className="d-flex flex-column gap-2">

                  <Button
                    className="btn-chat"
                    onClick={() =>
                      handleChat(order.buyer._id, order.product._id)
                    }
                  >
                    💬 Chat
                  </Button>

                  {order.status === "Pending" && (
                    <>
                      <Button
                        className="btn-success-custom"
                        onClick={() => updateStatus(order._id, "Confirmed")}
                      >
                        Accept
                      </Button>

                      <Button
                        className="btn-danger-custom"
                        onClick={() => updateStatus(order._id, "Rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {order.status === "Confirmed" && (
                    <>
                      <Button
                        className="btn-success-custom"
                        onClick={() => updateStatus(order._id, "Completed")}
                      >
                        Complete
                      </Button>

                      <Button
                        className="btn-secondary-custom"
                        onClick={() => updateStatus(order._id, "Cancelled")}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </Col>

              </Row>
            </div>
          ))}
        </Card.Body>
      </Card>

      {/* RENTALS */}
      <Card className="glass-card1 mb-4">
        <Card.Body>
          <h4>Rental Requests</h4>

          {rentalRequests.length === 0 && <p>No rental requests yet.</p>}

          {rentalRequests.map((req) => (
            <div key={req._id} className="order-card warning-border">
              <Row className="align-items-center">

                <Col md={2}>
                  {req.product?.image ? (
                    <img
                      src={
                        req.product.image.startsWith("http")
                          ? req.product.image
                          : `http://localhost:5000${req.product.image}`
                      }
                      className="product-img-large"
                      alt=""
                    />
                  ) : (
                    <div className="no-img">No Image</div>
                  )}
                </Col>

                <Col md={6}>
                  <h5>{req.product?.title}</h5>
                  <p>{req.renter?.name}</p>
                  <p>
                    {new Date(req.startDate).toLocaleDateString()} →{" "}
                    {new Date(req.endDate).toLocaleDateString()}
                  </p>

                  <span className={`status ${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </Col>

                <Col md={4} className="d-flex flex-column gap-2">

                  <Button
                    className="btn-chat"
                    onClick={() =>
                      handleChat(req.renter._id, req.product._id)
                    }
                  >
                    💬 Chat
                  </Button>

                  {req.status === "Requested" && (
                    <>
                      <Button
                        className="btn-success-custom"
                        onClick={() =>
                          handleRentalStatus(req._id, "Approved")
                        }
                      >
                        Approve
                      </Button>

                      <Button
                        className="btn-danger-custom"
                        onClick={() =>
                          handleRentalStatus(req._id, "Rejected")
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {req.status === "Approved" && (
                    <Button
                      className="btn-info-custom"
                      onClick={() =>
                        handleRentalStatus(req._id, "Active")
                      }
                    >
                      Mark Active
                    </Button>
                  )}

                  {(req.status === "Active" || req.status === "Overdue") && (
                    <Button
                      className="btn-primary-custom"
                      onClick={() =>
                        handleRentalStatus(req._id, "Returned")
                      }
                    >
                      Confirm Return
                    </Button>
                  )}
                </Col>

              </Row>
            </div>
          ))}
        </Card.Body>
      </Card>

    </Container>
  );
};

export default SellerDashboard;