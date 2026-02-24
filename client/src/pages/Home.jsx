import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState('');
    const [type, setType] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [category, type]);

    const fetchProducts = async () => {
        try {
            let url = 'http://localhost:5000/api/products?';
            if (category) url += `category=${category}&`;
            if (type) url += `type=${type}`;

            const res = await axios.get(url);
            setProducts(res.data);
        } catch (error) {
            console.error("Error fetching products", error);
        }
    };

    const handleMessageSeller = async (sellerId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user._id === sellerId) {
            alert("You cannot message yourself.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/chat', { userId: sellerId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/chat');
        } catch (error) {
            console.error("Error creating/fetching chat", error);
        }
    };

    return (
  <Container className="mt-5">
    {/* 🔥 Header Section */}
    <div className="text-center mb-5 marketplace-header">
      <h1 className="fw-bold">Campus Marketplace</h1>
      <p className="text-muted">
        Buy, sell or rent items easily within your campus.
      </p>
    </div>

    {/* 🔎 Filter Section */}
    <Card className="filter-card mb-4">
      <Row>
        <Col md={6}>
          <Form.Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-3"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Furniture">Furniture</option>
            <option value="Other">Other</option>
          </Form.Select>
        </Col>

        <Col md={6}>
          <Form.Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-3"
          >
            <option value="">All Types</option>
            <option value="Buy">Buy</option>
            <option value="Rent">Rent</option>
          </Form.Select>
        </Col>
      </Row>
    </Card>

    {/* 🛒 Products Grid */}
    <Row>
      {products.length === 0 ? (
        <Col>
          <div className="text-center text-muted py-5">
            <h5>No products found</h5>
            <p>Try adjusting filters or check back later.</p>
          </div>
        </Col>
      ) : (
        products.map((product) => (
          <Col key={product._id} md={4} className="mb-4">
            <Card className="h-100 product-card">
              {product.image && (
                <Card.Img
                  variant="top"
                  src={`http://localhost:5000${product.image}`}
                  className="product-image"
                />
              )}

              <Card.Body className="d-flex flex-column">
                <Card.Title className="product-title">
                  {product.title}
                </Card.Title>

                <Card.Text className="product-description flex-grow-1">
                  {product.description.substring(0, 90)}...
                </Card.Text>

                <div className="mb-2">
                  <Badge bg="light" text="dark" className="custom-badge me-2">
                    {product.category}
                  </Badge>
                  <Badge
                    bg={
                      product.transactionType === "Buy"
                        ? "success"
                        : "warning"
                    }
                    className="custom-badge"
                  >
                    {product.transactionType}
                  </Badge>
                </div>

                <h4 className="product-price mb-3">
                  ₹{product.price}
                </h4>

                <Button
                  className="w-100 custom-btn"
                  onClick={() =>
                    handleMessageSeller(product.seller._id)
                  }
                >
                  Message Seller
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))
      )}
    </Row>
  </Container>
);
};

export default Home;
