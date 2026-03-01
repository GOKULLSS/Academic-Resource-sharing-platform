import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Button, Badge, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const BuyerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [rentals, setRentals] = useState([]);
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
        "http://localhost:5000/api/orders/buyer",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch buyer orders", error);
    }
  };

  const fetchRentals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/rentals/my-rentals",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRentals(res.data);
    } catch (error) {
      console.error("Failed to fetch buyer rentals", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRentals();
  }, []);

  const updateOrderStatus = async (id, status) => {
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

  return (
    <Container className="mt-4">
      <h3>My Purchases</h3>

      {orders.length === 0 && <p>No purchases yet.</p>}

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
                onClick={() => handleChat(order.seller, order.product._id)}
              >
                💬 Chat with Seller
              </Button>

              {order.status === "Pending" && (
                <Button
                  variant="secondary"
                  onClick={() => updateOrderStatus(order._id, "Cancelled")}
                >
                  Cancel Order
                </Button>
              )}

              {order.status === "Confirmed" && (
                <Button
                  variant="success"
                  onClick={() => updateOrderStatus(order._id, "Completed")}
                >
                  Confirm Received
                </Button>
              )}
            </Col>
          </Row>
        </Card>
      ))}

      <h3 className="mt-5">My Rentals</h3>

      {rentals.length === 0 && <p>No rentals requested yet.</p>}

      {rentals.map((rental) => (
        <Card key={rental._id} className="mb-3 p-3 border-warning">
          <Row>
            <Col md={2}>
              {rental.product?.image ? (
                <img
                  src={`http://localhost:5000${rental.product.image}`}
                  alt={rental.product?.title || "Product"}
                  style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "5px" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "5px" }}>
                  <span className="text-muted" style={{ fontSize: "0.8rem" }}>No Image</span>
                </div>
              )}
            </Col>
            <Col md={6}>
              <h5>{rental.product?.title || "Unknown Product"}</h5>
              <p className="mb-1">Owner: {rental.owner?.name || "Unknown"}</p>
              <p className="mb-1">Dates: {new Date(rental.startDate).toLocaleDateString()} to {new Date(rental.endDate).toLocaleDateString()} ({rental.totalDays} Days)</p>
              <p className="mb-1">Total Rent: ₹{rental.totalAmount} (incl. ₹{rental.deposit} deposit)</p>
              {rental.lateFee > 0 && <p className="mb-1 text-danger fw-bold">Late Fee: ₹{rental.lateFee}</p>}
              <p className="mt-2">
                Status:{" "}
                <Badge
                  bg={
                    rental.status === "Requested"
                      ? "warning"
                      : rental.status === "Approved"
                        ? "primary"
                        : rental.status === "Active"
                          ? "success"
                          : rental.status === "Returned"
                            ? "secondary"
                            : rental.status === "Overdue"
                              ? "danger"
                              : "dark"
                  }
                >
                  {rental.status}
                </Badge>
              </p>
            </Col>
            <Col md={4} className="d-flex flex-column justify-content-center">
              <Button
                variant="outline-info"
                className="mb-2"
                onClick={() => handleChat(rental.owner._id, rental.product._id)}
              >
                💬 Chat with Owner
              </Button>

              {rental.status === "Approved" && (
                <Badge bg="info" className="p-2 mb-2">Item is ready for pickup</Badge>
              )}
              {rental.status === "Active" && (
                <Badge bg="success" className="p-2 mb-2">You have the item</Badge>
              )}
              {rental.status === "Overdue" && (
                <Badge bg="danger" className="p-2 mb-2">Please return ASAP!</Badge>
              )}
            </Col>
          </Row>
        </Card>
      ))}
    </Container>
  );
};

export default BuyerDashboard;