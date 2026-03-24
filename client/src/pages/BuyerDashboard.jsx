import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Button, Badge, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import "./BuyerDashboard.css";
import { MdOutlineMessage } from "react-icons/md";
const BuyerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingRentals, setIsLoadingRentals] = useState(true);
  const navigate = useNavigate();

  const handleChat = async (userId, productId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/chat",
        { userId, productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/chat/${res.data._id}`, { state: { chat: res.data } });
    } catch (error) {
      console.error("Failed to start chat", error);
    }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/orders/buyer",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch buyer orders", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchRentals = async () => {
    setIsLoadingRentals(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/rentals/my-rentals",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRentals(res.data);
    } catch (error) {
      console.error("Failed to fetch buyer rentals", error);
    } finally {
      setIsLoadingRentals(false);
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
    <div className="page">
      <Container className="mt-4">

        {/* PURCHASES */}
        <h3 className="section-title">My Purchases</h3>

        {isLoadingOrders ? (
          <LoadingSpinner message="Loading your purchases..." minHeight="10vh" />
        ) : orders.length === 0 ? (
          <p>No purchases yet.</p>
        ) : (
          orders.map((order) => (
            <Card key={order._id} className="glass-card2 mb-3">
              <Card.Body>
                <Row className="align-items-center">

                  <Col md={2}>
                    {order.product?.image ? (
                      <img
                        src={
                          order.product.image.startsWith("http")
                            ? order.product.image
                            : `http://localhost:5000${order.product.image}`
                        }
                        className="product-img"
                        alt=""
                      />
                    ) : (
                      <div className="no-img">No Image</div>
                    )}
                  </Col>

                  <Col md={6}>
                    <h5>{order.product?.title || "Product Deleted"}</h5>
                    <p>₹{order.product?.price}</p>

                    <span className={`status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </Col>

                  <Col md={4} className="d-flex flex-column gap-2">

                    <Button
                      className="c-btn"
                      onClick={() =>
                        handleChat(order.seller, order.product._id)
                      }
                    >
                      <MdOutlineMessage /> Chat with Seller
                    </Button>

                    {order.status === "Pending" && (
                      <Button
                        className="c-btn"
                        onClick={() =>
                          updateOrderStatus(order._id, "Cancelled")
                        }
                      >
                        Cancel Order
                      </Button>
                    )}

                    {order.status === "Confirmed" && (
                      <Button
                        className="c-btn success-btn"
                        onClick={() =>
                          updateOrderStatus(order._id, "Completed")
                        }
                      >
                        Confirm Received
                      </Button>
                    )}
                  </Col>

                </Row>
              </Card.Body>
            </Card>
          ))
        )}

        {/* RENTALS */}
        <h3 className="section-title mt-5">My Rentals</h3>

        {isLoadingRentals ? (
          <LoadingSpinner message="Loading your rentals..." minHeight="10vh" />
        ) : rentals.length === 0 ? (
          <p>No rentals yet.</p>
        ) : (
          rentals.map((rental) => (
            <Card key={rental._id} className="glass-card2 mb-3">
              <Card.Body>
                <Row className="align-items-center">

                  <Col md={2}>
                    {rental.product?.image ? (
                      <img
                        src={
                          rental.product.image.startsWith("http")
                            ? rental.product.image
                            : `http://localhost:5000${rental.product.image}`
                        }
                        className="product-img"
                        alt=""
                      />
                    ) : (
                      <div className="no-img">No Image</div>
                    )}
                  </Col>

                  <Col md={6}>
                    <h5>{rental.product?.title}</h5>
                    <p>Owner: {rental.owner?.name}</p>
                    <p>
                      {new Date(rental.startDate).toLocaleDateString()} →{" "}
                      {new Date(rental.endDate).toLocaleDateString()}
                    </p>

                    {rental.lateFee > 0 && (
                      <p className="text-danger fw-bold m-0 mb-2">
                        Late Fee Deducted: ₹{rental.lateFee}
                      </p>
                    )}

                    <span className={`status ${rental.status.toLowerCase()}`}>
                      {rental.status}
                    </span>
                  </Col>

                  <Col md={4} className="d-flex flex-column gap-2">

                    <Button
                      className="c-btn"
                      onClick={() =>
                        handleChat(rental.owner._id, rental.product._id)
                      }
                    >
                      <MdOutlineMessage /> Chat with Owner
                    </Button>

                    {rental.status === "Approved" && (
                      <div className="info-box">Ready for pickup</div>
                    )}

                    {rental.status === "Active" && (
                      <div className="success-box">You have the item</div>
                    )}

                    {rental.status === "Overdue" && (
                      <div className="danger-box">Return ASAP</div>
                    )}

                  </Col>

                </Row>
              </Card.Body>
            </Card>
          ))
        )}

      </Container>
    </div>
  );
};

export default BuyerDashboard;