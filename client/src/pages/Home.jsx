import { useState, useEffect, useContext, useRef } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');

  const categoryRef = useRef(null);

  const handleWheel = (e) => {
    if (categoryRef.current) {
      e.preventDefault();
      categoryRef.current.scrollLeft += e.deltaY;
    }
  };

  const categories = [
    { name: 'Electronics', icon: '📱' },
    { name: 'Books', icon: '📚' },
    { name: 'Hostel Needs', icon: '🛏️' },
    { name: 'Question Bank', icon: '📝' },
    { name: 'Stationary', icon: '✏️' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Other', icon: '📦' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [category, type, searchQuery]);

  const fetchProducts = async () => {
    try {
      let url = 'http://localhost:5000/api/products?';
      if (category) url += `category=${category}&`;
      if (type) url += `type=${type}&`;
      if (searchQuery) url += `search=${searchQuery}&`;

      const res = await axios.get(url);
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const handleMessageSeller = async (sellerId, productId) => {
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
      const res = await axios.post('http://localhost:5000/api/chat', { userId: sellerId, productId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/chat', { state: { chat: res.data } });
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

      {/* 🌟 Category Bar */}
      <div className="category-bar-wrapper mb-4">
        <div
          className="category-bar"
          ref={categoryRef}
          onWheel={(e) => {
            if (e.deltaY !== 0) {
              categoryRef.current.scrollLeft += e.deltaY;
            }
          }}
        >
          <div
            className={`category-item ${category === '' ? 'active' : ''}`}
            onClick={() => setCategory('')}
          >
            <div className="category-icon">🌐</div>
            <span className="category-name">All</span>
          </div>
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`category-item ${category === cat.name ? 'active' : ''}`}
              onClick={() => setCategory(cat.name)}
            >
              <div className="category-icon">{cat.icon}</div>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 🔎 Search and Filter Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <Form.Control
          type="text"
          placeholder="Search product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-3 shadow-sm flex-grow-1"
          style={{ maxWidth: '400px' }}
        />
        <Form.Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-3 w-auto filter-select shadow-sm"
          style={{ minWidth: '150px' }}
        >
          <option value="">All Types</option>
          <option value="Buy">Buy</option>
          <option value="Rent">Rent</option>
        </Form.Select>
      </div>

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
                      className="custom-badge me-2"
                    >
                      {product.transactionType}
                    </Badge>
                    {user && (product.seller?._id === user._id || product.seller === user._id) && (
                      <Badge bg="info" className="custom-badge">
                        ✨ Your Product
                      </Badge>
                    )}
                  </div>

                  <h4 className="product-price mb-3">
                    ₹{product.price}
                  </h4>

                  <Button
                    className="w-100 custom-btn mb-2"
                    variant={product.transactionType === "Rent" ? "warning" : "primary"}
                    disabled={user && (product.seller?._id === user._id || product.seller === user._id)}
                    style={(user && (product.seller?._id === user._id || product.seller === user._id)) ? { backgroundColor: 'transparent', borderColor: 'transparent', color: 'gray', opacity: 0.6 } : {}}
                    onClick={() => {
                      if (user && (product.seller?._id === user._id || product.seller === user._id)) {
                        alert("You cannot buy or rent your own product.");
                        return;
                      }
                      navigate(product.transactionType === "Rent" ? "/rent-checkout" : "/checkout", { state: { product } })
                    }}
                  >
                    {product.transactionType === "Rent" ? "Take on Rent" : "Buy Now"}
                  </Button>
                  <Button
                    className="w-100 custom-btn"
                    variant="outline-info"
                    disabled={user && (product.seller?._id === user._id || product.seller === user._id)}
                    style={(user && (product.seller?._id === user._id || product.seller === user._id)) ? { backgroundColor: 'transparent', borderColor: 'transparent', color: 'gray', opacity: 0.6 } : {}}
                    onClick={() => handleMessageSeller(product.seller?._id || product.seller, product._id)}
                  >
                    💬 Chat
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
