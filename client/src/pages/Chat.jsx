import { useState, useEffect, useContext, useRef } from 'react';
import { Container, Row, Col, ListGroup, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import io from "socket.io-client";
import "./Chat.css";

const Chat = () => {
    const { user } = useContext(AuthContext);
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const ENDPOINT = "https://academic-resource-sharing-platform.onrender.com";
    const navigate = useNavigate();

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        if (!user) return;

        const newSocket = io(ENDPOINT);
        setSocket(newSocket);

        newSocket.emit("setup", user);

        newSocket.on("online users", (users) => {
            setOnlineUsers(users);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    const fetchChats = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('https://academic-resource-sharing-platform.onrender.com/api/chat', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChats(res.data);
        } catch (error) {
            console.error("Failed to fetch chats", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getChatName = (loggedUser, users) => {
        if (!loggedUser || !users) return "Unknown Chat";
        const otherUser = users.find(u => u && u._id !== loggedUser._id);
        return otherUser ? otherUser.name : "Deleted User";
    };

    return (
        <Container className="mt-4" style={{ height: '80vh' }}>
            <Row className="h-100 justify-content-center">

                {/* Central Chat List */}
                <Col xs={12} md={8} lg={6} className="h-100">
                    <Card className="glass-card">
                        <Card.Header className="glass-card-header">My Chats</Card.Header>

                        <ListGroup variant="flush" className="chat-list">
                            {isLoading ? (
                                <LoadingSpinner message="Loading chats..." minHeight="20vh" />
                            ) : (
                                <>
                                    {chats.map((chat) => (
                                        <ListGroup.Item
                                            key={chat._id}
                                            action
                                            onClick={() => navigate(`/chat/${chat._id}`, { state: { chat } })}
                                            className="chat-item"
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="d-block fw-bold text-white">{getChatName(user, chat.participants)}</span>
                                                    {chat.product && <small>Item: {chat.product.title}</small>}
                                                </div>

                                                {onlineUsers.some(
                                                    (id) => {
                                                        const otherParticipant = chat.participants.find((p) => p && p._id !== user._id);
                                                        return otherParticipant && id.toString() === otherParticipant._id.toString();
                                                    }
                                                ) ? (
                                                    <span className="badge chat-badge online">Online</span>
                                                ) : (
                                                    <span className="badge chat-badge offline">Offline</span>
                                                )}
                                            </div>
                                        </ListGroup.Item>
                                    ))}

                                    {chats.length === 0 && (
                                        <ListGroup.Item className="no-chats">No active chats.</ListGroup.Item>
                                    )}
                                </>
                            )}
                        </ListGroup>
                    </Card>
                </Col>

            </Row>
        </Container>
    );
};

export default Chat;