import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Badge, Alert, Card } from 'react-bootstrap';
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const [pendingProducts, setPendingProducts] = useState([]);
    const [contactMessages, setContactMessages] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchPendingProducts();
        fetchContactMessages();
    }, []);

    const fetchContactMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('https://academic-resource-sharing-platform.onrender.com/api/contact', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContactMessages(res.data);
        } catch (error) {
            console.error("Failed to fetch contact messages");
        }
    };

    const fetchPendingProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('https://academic-resource-sharing-platform.onrender.com/api/products/pending', {
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
            await axios.put(`https://academic-resource-sharing-platform.onrender.com/api/products/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Product approved successfully.' });
            fetchPendingProducts();
        } catch (error) {
            setMessage({ type: 'danger', text: 'Error approving product' });
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this pending product?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://academic-resource-sharing-platform.onrender.com/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Product deleted/rejected.' });
            fetchPendingProducts();
        } catch (error) {
            setMessage({ type: 'danger', text: 'Error rejecting product' });
        }
    };

    return (
        <Container className="mt-4">

{/* HEADER CARD */}
<div className="dashboard-header">
    <h2>Admin Dashboard</h2>
    <p>Verify and manage product listings before they go live.</p>

    <div className="info-box">
        Admin verification ensures only quality items appear in marketplace.
    </div>
</div>

{/* ALERT */}
{message.text && (
    <Alert
        variant={message.type}
        onClose={() => setMessage({ type: '', text: '' })}
        dismissible
    >
        {message.text}
    </Alert>
)}

{/* PRODUCTS SECTION */}
<div className="products-card">

<h3 className="section-title">Pending Products</h3>

{pendingProducts.length === 0 ? (
    <p className="empty-text">No pending products</p>
) : (
    pendingProducts.map((product) => (

        <div key={product._id} className="product-row">

            {/* IMAGE */}
            <img
                src={
                    product.image?.startsWith('http')
                        ? product.image
                        : `https://academic-resource-sharing-platform.onrender.com${product.image}`
                }
                alt={product.title}
                className="product-img"
            />

            {/* TITLE */}
            <div className="product-title">{product.title}</div>

            {/* PRICE */}
            <div className="product-price">₹{product.price}</div>

            {/* STATUS */}
            <div className="status-badge pending">
                Pending
            </div>

            {/* ACTIONS */}
            <div className="action-buttons">

                <Button
                    size="sm"
                    className="approve-btn"
                    onClick={() => handleApprove(product._id)}
                >
                    Approve
                </Button>

                <Button
                    size="sm"
                    className="reject-btn"
                    onClick={() => handleReject(product._id)}
                >
                    Reject
                </Button>

            </div>

        </div>
    ))
)}

</div>

{/* CONTACT SECTION */}
<div className="products-card mt-4">

<h3 className="section-title">Contact Messages</h3>

{contactMessages.length === 0 ? (
    <p className="empty-text">No messages</p>
) : (
    contactMessages.map((msg) => (
        <div key={msg._id} className="message-row">
            <div>{msg.name}</div>
            <div>{msg.email}</div>
            <div>{msg.message}</div>
        </div>
    ))
)}

</div>

</Container>
    );
};

export default AdminDashboard;