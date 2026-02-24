import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, ListGroup, Card } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ChatInterface from '../components/ChatInterface';
import { useRef } from "react";
import io from "socket.io-client";

const Chat = () => {
    const { user } = useContext(AuthContext);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const ENDPOINT = "http://localhost:5000";
    const socketRef = useRef(null);

    useEffect(() => {
        fetchChats();
    }, []);

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
                <Col md={4} className="h-100">
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
                                   <span>{getChatName(user, chat.participants)}</span>

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
                <Col md={8} className="h-100">
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
