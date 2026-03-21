import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ChatInterface from '../components/ChatInterface';
import io from "socket.io-client";
import "./ChatPage.css";

const ChatPage = () => {
    const { user } = useContext(AuthContext);
    const { chatId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const ENDPOINT = "https://academic-resource-sharing-platform.onrender.com";

    // Reconstruct the chat object from location state, or if missing we'd normally fetch it.
    // Assuming location state contains chat because we navigated from /chat list.
    const chat = location.state?.chat;

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

    if (!chat) {
        // Fallback: If accessed directly via URL without state, redirect to Chat List or fetch chat details
        return <Navigate to="/chat" replace />;
    }

    return (
        <Container className="mt-4" style={{ height: '80vh' }}>
            <Row className="h-100 justify-content-center">
                <Col xs={12} md={10} lg={8} className="h-100">
                    <Card className="glass-card4 h-100 d-flex flex-column">
                        <div className="p-2 border-bottom d-flex align-items-center" style={{ backgroundColor: 'rgb(21 54 127)' }}>
                            <Button
                                variant="outline-light"
                                size="sm"
                                onClick={() => navigate('/chat')}
                                className="me-3"
                            >
                                <i className="bi bi-arrow-left"></i> ⬅ Back
                            </Button>
                            <h5 className="mb-0 text-white">Chat</h5>
                        </div>
                        <div className="flex-grow-1 overflow-hidden" style={{ minHeight: 0 }}>
                            <ChatInterface
                                selectedChat={chat}
                                onlineUsers={onlineUsers}
                                socket={socket}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ChatPage;
