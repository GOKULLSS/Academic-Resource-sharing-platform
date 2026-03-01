import { useState, useEffect, useContext, useRef } from 'react';
import { Container, Row, Col, ListGroup, Card } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ChatInterface from '../components/ChatInterface';
import io from "socket.io-client";

const Chat = () => {
    const { user } = useContext(AuthContext);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const ENDPOINT = "http://localhost:5000";
    const socketRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        fetchChats();

        // If navigated with a specific chat in state, auto-select it
        if (location.state?.chat) {
            setSelectedChat(location.state.chat);
        }
    }, [location.state]);

    useEffect(() => {
        socketRef.current = io(ENDPOINT);

        socketRef.current.emit("setup", user);

        socketRef.current.on("online users", (users) => {
            setOnlineUsers(users);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [user]);

    const fetchChats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/chat', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChats(res.data);
        } catch (error) {
            console.error("Failed to fetch chats", error);
        }
    };

    const getChatName = (loggedUser, users) => {
        return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
    };

    return (
        <Container className="mt-4" style={{ height: '80vh' }}>
            <Row className="h-100">
                <Col xs={4} className="h-100">
                    <Card className="h-100">
                        <Card.Header>My Chats</Card.Header>
                        <ListGroup variant="flush" style={{ overflowY: 'auto' }}>
                            {chats.map((chat) => (
                                <ListGroup.Item
                                    key={chat._id}
                                    action
                                    active={selectedChat?._id === chat._id}
                                    onClick={() => setSelectedChat(chat)}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="d-block fw-bold">{getChatName(user, chat.participants)}</span>
                                            {chat.product && <small className="text-muted">Item: {chat.product.title}</small>}
                                        </div>

                                        {onlineUsers.some(
                                            id =>
                                                id.toString() ===
                                                chat.participants.find(p => p._id !== user._id)._id.toString()
                                        ) ? (
                                            <span className="badge bg-success">Online</span>
                                        ) : (
                                            <span className="badge bg-secondary">Offline</span>
                                        )}
                                    </div>
                                </ListGroup.Item>
                            ))}
                            {chats.length === 0 && (
                                <ListGroup.Item>No active chats.</ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
                <Col xs={8} className="h-100">
                    <Card className="h-100">
                        {selectedChat ? (
                            <ChatInterface
                                selectedChat={selectedChat}
                                onlineUsers={onlineUsers}
                                socket={socketRef.current}
                            />
                        ) : (
                            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                Select a user to start chatting
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Chat;
