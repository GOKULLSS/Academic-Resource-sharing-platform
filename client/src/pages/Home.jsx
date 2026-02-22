import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

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
        <Container className="mt-4">
            <h1 className="mb-4">Campus Marketplace</h1>
            <Row className="mb-4">
                <Col md={4}>
                    <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Books">Books</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Other">Other</option>
                    </Form.Select>
                </Col>
                <Col md={4}>
                    <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="Buy">Buy</option>
                        <option value="Rent">Rent</option>
                    </Form.Select>
                </Col>
            </Row>

            <Row>
                {products.length === 0 ? (
                    <Col><p>No products found.</p></Col>
                ) : (
                    products.map((product) => (
                        <Col key={product._id} md={4} className="mb-4">
                            <Card className="h-100 shadow-sm">
                                {product.image && (
                                    <Card.Img
                                        variant="top"
                                        src={`http://localhost:5000${product.image}`}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                )}
                                <Card.Body>
                                    <Card.Title>{product.title}</Card.Title>
                                    <Card.Text>{product.description.substring(0, 100)}...</Card.Text>
                                    <h5 className="text-primary">${product.price}</h5>
                                    <div className="mb-2">
                                        <Badge bg="info" className="me-2">{product.category}</Badge>
                                        <Badge bg={product.transactionType === 'Buy' ? 'success' : 'warning'}>
                                            {product.transactionType}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="outline-primary"
                                        className="w-100"
                                        onClick={() => handleMessageSeller(product.seller._id)}
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
