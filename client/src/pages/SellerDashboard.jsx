import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Button, Badge, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

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
    <Container className="mt-4 pb-3">
      <h3>Incoming Orders (Buy)</h3>

      {orders.length === 0 && <p>No incoming orders.</p>}

      {orders.map((order) => (
        <Card key={order._id} className="mb-3 p-3">
          <Row>
            <Col md={2}>
              {order.product?.image ? (
                <img
                  src={`http://localhost:5000${order.product.image}`}
                  alt={order.product?.title || "Product"}
                  style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "5px" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "5px" }}>
                  <span className="text-muted" style={{ fontSize: "0.8rem" }}>No Image</span>
                </div>
              )}
            </Col>
            <Col md={6}>
              <h5>{order.product?.title || "Product Deleted"}</h5>
              {order.product && <p>Price: ₹{order.product.price}</p>}
              <p>Buyer: {order.buyer?.name || "Unknown User"}</p>
              <p>
                Status:{" "}
                <Badge
                  bg={
                    order.status === "Pending"
                      ? "warning"
                      : order.status === "Confirmed"
                        ? "primary"
                        : order.status === "Completed"
                          ? "success"
                          : order.status === "Rejected"
                            ? "danger"
                            : "secondary"
                  }
                >
                  {order.status}
                </Badge>
              </p>
            </Col>

            <Col md={4} className="d-flex flex-column justify-content-center">
              <Button
                variant="outline-info"
                className="mb-2"
                onClick={() => handleChat(order.buyer._id, order.product._id)}
              >
                💬 Chat with Buyer
              </Button>

              {order.status === "Pending" && (
                <>
                  <Button
                    variant="success"
                    className="mb-2"
                    onClick={() => updateStatus(order._id, "Confirmed")}
                  >
                    Accept
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => updateStatus(order._id, "Rejected")}
                  >
                    Reject
                  </Button>
                </>
              )}

              {order.status === "Confirmed" && (
                <>
                  <Button
                    variant="success"
                    className="mb-2"
                    onClick={() => updateStatus(order._id, "Completed")}
                  >
                    Mark Completed
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => updateStatus(order._id, "Cancelled")}
                  >
                    Cancel
                  </Button>
                </>
              )}

              {order.status === "Completed" && (
                <Badge bg="success">Product Sold</Badge>
              )}
            </Col>
          </Row>
        </Card>
      ))}

      <h3 className="mt-5">Incoming Rental Requests</h3>

      {rentalRequests.length === 0 && <p>No rental requests yet.</p>}

      {rentalRequests.map((req) => (
        <Card key={req._id} className="mb-3 p-3 border-warning">
          <Row>
            <Col md={2}>
              {req.product?.image ? (
                <img
                  src={`http://localhost:5000${req.product.image}`}
                  alt={req.product?.title || "Product"}
                  style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "5px" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "5px" }}>
                  <span className="text-muted" style={{ fontSize: "0.8rem" }}>No Image</span>
                </div>
              )}
            </Col>
            <Col md={6}>
              <h5>{req.product?.title || "Product Deleted"}</h5>
              <p className="mb-1">Renter: {req.renter?.name || "Unknown Renter"} ({req.renter?.email || "N/A"})</p>
              <p className="mb-1">Dates: {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}</p>
              <p className="mb-1">Total Rent: ₹{req.totalAmount} (incl. ₹{req.deposit || 0} deposit)</p>
              {req.lateFee > 0 && <p className="mb-1 text-danger fw-bold">Late Fee: ₹{req.lateFee}</p>}
              <p className="mt-2">
                Status:{" "}
                <Badge
                  bg={
                    req.status === "Requested"
                      ? "warning"
                      : req.status === "Approved"
                        ? "primary"
                        : req.status === "Active"
                          ? "success"
                          : req.status === "Returned"
                            ? "secondary"
                            : req.status === "Overdue"
                              ? "danger"
                              : "dark"
                  }
                >
                  {req.status}
                </Badge>
              </p>
            </Col>

            <Col md={4} className="d-flex flex-column justify-content-center">
              <Button
                variant="outline-info"
                className="mb-2"
                onClick={() => handleChat(req.renter._id, req.product._id)}
              >
                💬 Chat with Renter
              </Button>

              {req.status === "Requested" && (
                <>
                  <Button
                    variant="success"
                    className="mb-2"
                    onClick={() => handleRentalStatus(req._id, "Approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleRentalStatus(req._id, "Rejected")}
                  >
                    Reject
                  </Button>
                </>
              )}

              {req.status === "Approved" && (
                <Button
                  variant="info"
                  onClick={() => handleRentalStatus(req._id, "Active")}
                >
                  Mark as Given (Active)
                </Button>
              )}

              {(req.status === "Active" || req.status === "Overdue") && (
                <Button
                  variant="primary"
                  onClick={() => handleRentalStatus(req._id, "Returned")}
                >
                  Confirm Return
                </Button>
              )}
            </Col>
          </Row>
        </Card>
      ))}
    </Container>
  );
};

export default SellerDashboard;