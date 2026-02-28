import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Button, Badge, Row, Col } from "react-bootstrap";

const SellerDashboard = () => {
  const [orders, setOrders] = useState([]);

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

  useEffect(() => {
    fetchOrders();
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

  return (
    <Container className="mt-4">
      <h3>Incoming Orders</h3>

      {orders.length === 0 && <p>No incoming orders.</p>}

      {orders.map((order) => (
        <Card key={order._id} className="mb-3 p-3">
          <Row>
            <Col md={8}>
              <h5>{order.product.title}</h5>
              <p>Price: ₹{order.product.price}</p>
              <p>Buyer: {order.buyer.name}</p>
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
    </Container>
  );
};

export default SellerDashboard;