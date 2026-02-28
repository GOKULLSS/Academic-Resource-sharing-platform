import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Container, Card, Button, Form } from "react-bootstrap";

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("Meet on campus");

  const handleConfirm = async () => {
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
  };

  return (
    <Container className="mt-4">
      <Card className="p-4">
        <h3>Checkout</h3>
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