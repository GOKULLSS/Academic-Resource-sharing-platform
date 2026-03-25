import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Form, Button, Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './Home.css';
import { FaInstagram, FaFacebook, FaLinkedin, FaGithub } from "react-icons/fa"; import { MdOutlineMessage } from "react-icons/md";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [collegeFilterType, setCollegeFilterType] = useState('My College');
  const [specificCollege, setSpecificCollege] = useState('');

  const categoryRef = useRef(null);

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
  }, [category, type, searchQuery, collegeFilterType, specificCollege, user]); // Include filter states

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let url = 'https://academic-resource-sharing-platform.onrender.com/api/products?';
      if (category) url += `category=${category}&`;
      if (type) url += `type=${type}&`;
      if (searchQuery) url += `search=${searchQuery}&`;
      
      let currentCollegeFilter = 'All Colleges';
      if (collegeFilterType === 'My College' && user?.college) {
          currentCollegeFilter = user.college;
      } else if (collegeFilterType === 'Specific College' && specificCollege) {
          currentCollegeFilter = specificCollege;
      }
      if (currentCollegeFilter !== 'All Colleges') {
          url += `college=${encodeURIComponent(currentCollegeFilter)}&`;
      }

      const res = await axios.get(url);
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setIsLoading(false);
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
      const res = await axios.post('https://academic-resource-sharing-platform.onrender.com/api/chat', { userId: sellerId, productId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/chat/${res.data._id}`, { state: { chat: res.data } });
    } catch (error) {
      console.error("Error creating/fetching chat", error);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://academic-resource-sharing-platform.onrender.com/api/contact', contactForm);

      const subject = encodeURIComponent("Contact Message from " + contactForm.name);
      const body = encodeURIComponent(contactForm.message);
      window.location.href = `mailto:oncampusmart@gmail.com?subject=${subject}&body=${body}`;

      alert('Message sent successfully! We will get back to you soon.');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Error submitting contact message", error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleScrollToProducts = () => {
    const productsSection = document.getElementById("products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className="home-container">
      {/* 🚀 Hero Section */}
      <section className="hero-section">

        <Container className="hero-content">
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className="hero-title">
                Buy, Sell & Rent <span className="highlight">Smarter</span> on Campus
              </h1>

              <p className="hero-subtitle">
                Discover affordable second-hand products
                from students around you. Safe, fast, and built for campus life.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Button className="btn-primary-custom" onClick={handleScrollToProducts}>
                  Browse Products
                </Button>
                <Button className="btn-outline-custom" onClick={() => navigate('/student')}>
                  Sell an Item
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image-wrapper">
                <img
                  src="/3dcart.jpg"
                  alt="Students smiling"
                  className="hero-illustration"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Container>
        {/* 📸 Image Carousel */}
        <div className="carousel-wrapper">
          <Carousel className="custom-carousel" fade >
            <Carousel.Item interval={2500}>
              <img
                className="d-block w-100"
                src="/connecting.jpg"
                alt="University Campus"
              />
              <Carousel.Caption>
                <h3>Connect with your Campus</h3>
                <p>Buy,Rent and sell directly with students in your university.</p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item interval={2500}>
              <img
                className="d-block w-100"
                src="/exchanging.jpg"
                alt="Study Materials"
              />
              <Carousel.Caption>
                <h3>Affordable Study Materials</h3>
                <p>Find second-hand books and notes at a fraction of the cost.</p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item interval={2500}>
              <img
                className="d-block w-100"
                src="/throwing.jpg"
                alt="Student Life"
              />
              <Carousel.Caption>
                <h3>Easy Renting</h3>
                <p>Rent your items effortlessly.</p>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </div>

        {/* 🌟 Category Bar */}
        <div id="products-section" className="section-title mt-5 pt-3">Explore OnCampusMart</div>

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
        <Row className="align-items-center mb-5 g-3 glass-search">
          <Col xs={12} md={4}>
            <Form.Control
              type="text"
              placeholder="Search products by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
            />
          </Col>
          <Col xs={12} md={4}>
            <Form.Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="glass-input"
            >
              <option value="">All Types (Buy & Rent)</option>
              <option value="Buy">For Sale Only</option>
              <option value="Rent">For Rent Only</option>
            </Form.Select>
          </Col>
          <Col xs={12} md={4}>
            <Form.Select
              value={collegeFilterType}
              onChange={(e) => setCollegeFilterType(e.target.value)}
              className="glass-input mb-2"
            >
              {user && <option value="My College">My College</option>}
              <option value="All Colleges">All Colleges</option>
              <option value="Specific College">Specific College</option>
            </Form.Select>
            {collegeFilterType === 'Specific College' && (
              <Form.Control
                type="text"
                placeholder="Enter exact college name..."
                value={specificCollege}
                onChange={(e) => setSpecificCollege(e.target.value)}
                className="glass-input mt-2"
              />
            )}
          </Col>
        </Row>

        {/* 🛒 Products Grid */}
        <Row>
          {isLoading ? (
            <LoadingSpinner message="Fetching products from campus..." />
          ) : products.length === 0 ? (
            <Col>
              <div className="text-center text-muted py-5 empty-state">
                <h4 className="fw-bold mb-3">No products found</h4>
                <p>Try adjusting your search filters or check back later.</p>
              </div>
            </Col>
          ) : (
            products.map((product) => (
              <Col key={product._id} lg={3} md={4} xs={6} className="mb-4">
                <Card className="h-100 product-card">
                  {product.image && (
                    <Card.Img
                      variant="top"
                      src={product.image.startsWith('http') ? product.image : `https://academic-resource-sharing-platform.onrender.com${product.image}`}
                      className="product-image"
                    />
                  )}

                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="product-title mb-2">
                      {product.title}
                    </Card.Title>

                    <Card.Text className="product-description flex-grow-1">
                      {product.description.substring(0, 80)}...
                    </Card.Text>

                    <div className="mb-3">
                      {collegeFilterType === 'All Colleges' && product.college && (
                        <Badge bg="secondary" className="custom-badge me-2 border">
                          🏫 {product.college}
                        </Badge>
                      )}
                      <Badge bg="light" text="dark" className="custom-badge me-2 border">
                        {product.category}
                      </Badge>
                      <Badge
                        bg={product.transactionType === "Buy" ? "success" : "warning"}
                        className="custom-badge me-2"
                      >
                        {product.transactionType}
                      </Badge>
                      {user && (product.seller?._id === user._id || product.seller === user._id) && (
                        <Badge bg="info" className="custom-badge mt-1">
                          Your Product
                        </Badge>
                      )}
                    </div>

                    <h4 className="product-price mb-3 w-100">
                      ₹{product.price}{product.transactionType === "Rent" && " / day"}
                    </h4>

                    <Button
                      className="w-100 custom-btn mb-2 text-white"
                      disabled={user && (product.seller?._id === user._id || product.seller === user._id)}
                      style={(user && (product.seller?._id === user._id || product.seller === user._id)) ? { backgroundColor: 'transparent', borderColor: 'transparent', color: 'gray', opacity: 0.6, boxShadow: 'none' } : {}}
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                          return;
                        }
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
                      className="w-70 custom-btn1 btn-outline-info bg-transparent"
                      disabled={user && (product.seller?._id === user._id || product.seller === user._id)}
                      style={(user && (product.seller?._id === user._id || product.seller === user._id)) ? { backgroundColor: 'transparent', borderColor: 'transparent', color: 'gray', opacity: 0.6, boxShadow: 'none' } : {}}
                      onClick={() => handleMessageSeller(product.seller?._id || product.seller, product._id)}
                    >
                      <MdOutlineMessage /> Message Seller
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>

      {/* 💡 How It Works Section */}
      <Container className="mt-5">
        <section className="how-it-works-section">
          <h2 className="section-title">How It Works</h2>
          <Row className="px-lg-5">
            <Col md={4} className="mb-4 mb-md-0">
              <div className="step-card">
                <div className="step-icon-wrapper">📦</div>
                <h4 className="step-title">1. Post an Item</h4>
                <p className="step-desc">Have something you no longer need? List it for sale or rent in seconds with a simple picture and description.</p>
              </div>
            </Col>
            <Col md={4} className="mb-4 mb-md-0">
              <div className="step-card">
                <div className="step-icon-wrapper">🤝</div>
                <h4 className="step-title">2. Connect with Students</h4>
                <p className="step-desc">Chat directly with buyers or sellers on campus. Arrange a safe meetup without leaving your university.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="step-card">
                <div className="step-icon-wrapper">🎉</div>
                <h4 className="step-title">3. Buy, Sell, or Rent</h4>
                <p className="step-desc">Complete the transaction easily. Save money, reduce waste, and help fellow students succeed.</p>
              </div>
            </Col>
          </Row>
        </section>
      </Container>

      {/* 📬 Contact Section */}
      <Container>
        <section className="contact-section">
          <Row className="px-lg-5 align-items-center">
            <Col lg={5} className="mb-5 mb-lg-0 text-center text-lg-start">
              <h2 className="fw-bold mb-4" style={{ fontSize: '2.5rem', color: 'white' }}>Get In Touch</h2>
              <p className="mb-5 text-light" style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                Have a question or need support with a transaction? We're here to help make your campus marketplace experience smooth.
              </p>
              <div className="contact-info-item justify-content-center justify-content-lg-start">
                <div className="contact-icon">📧</div>
                <div>
                  <h6 className="mb-0 fw-bold">Email Support</h6>
                  <span className="text-light" style={{ opacity: 0.8 }}>oncampusmart@gmail.com</span>
                </div>
              </div>
            </Col>
            <Col lg={7}>
              <div className="contact-card">
                <h4 className="fw-bold mb-4" style={{ color: 'white' }}>Send a Message</h4>
                <Form className="contact-form" onSubmit={handleContactSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="Your Name"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Control
                          type="email"
                          placeholder="Your Email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="How can we help you?"
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                  </Form.Group>
                  <Button type="submit" className="btn-primary-custom w-100 mt-2">
                    Submit Message
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </section>
      </Container>

      {/* 🏢 Footer Section */}
      <footer className="footer-section">
        <Container>
          <Row>
            <Col lg={4} className="mb-4 mb-lg-0">
              <div className="footer-logo">OnCampusMart</div>
              <p style={{ maxWidth: '300px', lineHeight: '1.6' }}>
                Your dedicated platform to securely buy, sell, and rent items within your university community.
              </p>
              <div className="social-icons">
                <a href="#" className="social-icon"><FaInstagram /></a>
                <a href="#" className="social-icon"><FaFacebook /></a>
                <a href="#" className="social-icon"><FaLinkedin /></a>
                <a href="#" className="social-icon"><FaGithub /></a>
              </div>
            </Col>
            <Col md={4} xs={6} className="mb-4">
              <h5 className="text-white mb-3 fw-bold">Quick Links</h5>
              <ul className="footer-links">
                <li><a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Home</a></li>
                <li><a href="#products-section">Categories</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/student'); }}>Sell Item</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/student'); }}>Dashboard</a></li>
              </ul>
            </Col>
            <Col md={4} xs={6} className="mb-4">
              <h5 className="text-white mb-3 fw-bold">Legal</h5>
              <ul className="footer-links">
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Safety Guidelines</a></li>
              </ul>
            </Col>
          </Row>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} CampusMarket. All rights reserved. Designed for students, by students.
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Home;
