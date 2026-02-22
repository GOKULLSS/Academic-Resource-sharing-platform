import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Badge, Alert } from 'react-bootstrap';

const AdminDashboard = () => {
    const [pendingProducts, setPendingProducts] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const fetchPendingProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/products/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch pending products");
        }
    };

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/products/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Product approved successfully.' });
            fetchPendingProducts(); // Refresh list
        } catch (error) {
            setMessage({ type: 'danger', text: 'Error approving product' });
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this pending product?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Product deleted/rejected.' });
            fetchPendingProducts(); // Refresh list
        } catch (error) {
            setMessage({ type: 'danger', text: 'Error rejecting product' });
        }
    };

    return (
        <Container className="mt-4">
            <h2>Admin Dashboard (Verification Gate)</h2>
            <p>Review and verify all pending product uploads before they appear on the public marketplace.</p>

            {message.text && <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>{message.text}</Alert>}

            {pendingProducts.length === 0 ? (
                <Alert variant="info">No pending products at the moment.</Alert>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Seller</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingProducts.map((product) => (
                            <tr key={product._id}>
                                <td>
                                    {product.image ? (
                                        <img src={`http://localhost:5000${product.image}`} alt={product.title} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                    ) : 'No Image'}
                                </td>
                                <td>{product.title}</td>
                                <td><Badge bg="secondary">{product.category}</Badge> {product.transactionType}</td>
                                <td>${product.price}</td>
                                <td>{product.seller?.name || 'Unknown'}</td>
                                <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <Button variant="success" size="sm" className="me-2" onClick={() => handleApprove(product._id)}>
                                        Approve
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleReject(product._id)}>
                                        Reject/Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default AdminDashboard;
