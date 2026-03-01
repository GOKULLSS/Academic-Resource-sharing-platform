import { useLocation, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import { Container, Card, Button, Form, Alert } from "react-bootstrap";
import AuthContext from "../context/AuthContext";

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [pickup, setPickup] = useState("Meet on campus");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (user && user._id === state.product.seller) {
      setError("You cannot buy your own product.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/orders",
        {
          productId: state.product._id,
          pickupPreference: pickup,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/buyer-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Error creating order.");
    }
  };

  return (
    <Container className="mt-4">
      <Card className="p-4">
        <h3>Checkout</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <p><strong>{state.product.title}</strong></p>
        <p>₹{state.product.price}</p>

        <Form.Select
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
        >
          <option>Meet on campus</option>
          <option>Hostel pickup</option>
        </Form.Select>

        <Button className="mt-3" onClick={handleConfirm}>
          Confirm Order
        </Button>
      </Card>
    </Container>
  );
};

export default Checkout;