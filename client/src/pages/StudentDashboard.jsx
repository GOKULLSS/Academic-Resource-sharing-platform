import { useState, useContext, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Table,
} from "react-bootstrap";
import AuthContext from "../context/AuthContext";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [transactionType, setTransactionType] = useState("Buy");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [myProducts, setMyProducts] = useState([]);
  const [deposit, setDeposit] = useState("");

  useEffect(() => {
    fetchMyProducts();
  }, []);
  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/products/my",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMyProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchMyProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("transactionType", transactionType);
    if (transactionType === "Rent" && deposit) {
      formData.append("deposit", deposit);
    }
    if (image) {
      formData.append("image", image);
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage({
        type: "success",
        text: "Product uploaded successfully! It is pending admin approval.",
      });
      setTitle("");
      setDescription("");
      setPrice("");
      setDeposit("");
      setImage(null);
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Error uploading product",
      });
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <h3>Your Dashboard Info</h3>
              <p>
                Welcome, {user?.name}. Your uploaded products will enter a
                pending state until an admin verifies them.
              </p>
              <Alert variant="info">
                Remember, the Verification Gate ensures only high quality items
                are displayed in the Campus Marketplace.
              </Alert>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12}>
          <Card className="mt-4">
            <Card.Body>
              <h3>My Products</h3>

              {myProducts.length === 0 ? (
                <p>No products uploaded yet.</p>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProducts.map((product) => (
                      <tr key={product._id}>
                        <td>
                          {product.image ? (
                            <img
                              src={`http://localhost:5000${product.image}`}
                              alt={product.title}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            "No Image"
                          )}
                        </td>
                        <td>{product.title}</td>
                        <td>${product.price}</td>
                        <td>
                          {product.status === "pending" && (
                            <span className="badge bg-warning text-dark">
                              Pending Approval
                            </span>
                          )}
                          {product.status === "live" && (
                            <span className="badge bg-success">Live</span>
                          )}
                          {product.status === "sold" && (
                            <span className="badge bg-danger">
                              Sold Out
                            </span>
                          )}
                          {product.status === "Rented" && (
                            <span className="badge bg-info text-dark">
                              Under Rent
                            </span>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(product._id)}
                            className="me-2"
                          >
                            Delete
                          </Button>

                          <Button
                            variant="warning"
                            size="sm"
                            disabled={product.status === "live" ? false : false}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={12}>
          <Card className="mt-4 mb-4">
            <Card.Body>
              <h3>Upload New Product</h3>
              {message.text && (
                <Alert variant={message.type}>{message.text}</Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="Electronics">Electronics</option>
                        <option value="Books">Books</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Transaction Type</Form.Label>
                      <Form.Select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                      >
                        <option value="Buy">Buy (Sell permanently)</option>
                        <option value="Rent">Rent (Temporary)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  {transactionType === "Rent" && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Security Deposit ($)</Form.Label>
                        <Form.Control
                          type="number"
                          value={deposit}
                          onChange={(e) => setDeposit(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  )}
                  <Col md={transactionType === "Rent" ? 12 : 6} className={transactionType === "Rent" ? "mt-3" : ""}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Image</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit">
                  Submit Product
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentDashboard;
