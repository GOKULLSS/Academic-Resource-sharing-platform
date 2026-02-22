import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, ListGroup, Card } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ChatInterface from '../components/ChatInterface';

const Chat = () => {
    const { user } = useContext(AuthContext);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    useEffect(() => {
        fetchChats();
    }, []);

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
                                    {getChatName(user, chat.participants)}
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
                            <ChatInterface selectedChat={selectedChat} />
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
