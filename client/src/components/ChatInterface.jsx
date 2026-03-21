import { useState, useEffect, useContext, useRef } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";


const ChatInterface = ({ selectedChat, onlineUsers, socket }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);


  const isOtherUserOnline = () => {


    if (!selectedChat || !selectedChat.participants || !user) return false;

    const otherUser = selectedChat.participants.find(
      (p) => p._id !== user._id
    );

    if (!otherUser) return false;

    return onlineUsers.some(
      (id) => id.toString() === otherUser._id.toString()
    );
  };

  useEffect(() => {
    if (!socket) return;

    const messageHandler = (newMessageRecieved) => {
      if (selectedChat && selectedChat._id === newMessageRecieved.chat._id) {
        setMessages((prev) => [...prev, newMessageRecieved]);
      }
    };

    socket.on("message recieved", messageHandler);

    return () => {
      socket.off("message recieved", messageHandler);
    };
  }, [selectedChat, socket]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat && socket) {
      socket.emit("join chat", selectedChat._id);
    }
  }, [selectedChat, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    setIsLoadingMessages(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://academic-resource-sharing-platform.onrender.com/api/chat/${selectedChat._id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      e.preventDefault();
      sendBtnClick();
    }
  };

  const sendBtnClick = async () => {
    if (!newMessage) return;

    try {
      const token = localStorage.getItem("token");
      const content = newMessage;
      setNewMessage("");

      const res = await axios.post(
        "https://academic-resource-sharing-platform.onrender.com/api/chat/messages",
        { content, chatId: selectedChat._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      socket.emit("new message", res.data);

      setMessages((prev) => [...prev, res.data]);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const getOtherUserName = () => {
    return selectedChat.participants[0]._id === user._id
      ? selectedChat.participants[1].name
      : selectedChat.participants[0].name;
  };

  return (
    <div className="d-flex flex-column h-100">
      <div className="p-3 border-bottom bg-light">
        <div className="d-flex align-items-center">
          <strong>{getOtherUserName()}</strong>
          {selectedChat?.product && (
            <span className="ms-2 text-muted" style={{ fontSize: '0.9em' }}>
              ({selectedChat.product.title})
            </span>
          )}
          <span
            className={`ms-2 badge ${isOtherUserOnline() ? "bg-success" : "bg-secondary"
              }`}
          >
            {isOtherUserOnline() ? "Online" : "Offline"}
          </span>
        </div>
      </div>
      <div
        className="flex-grow-1 p-3"
        style={{ overflowY: "auto", backgroundColor: "#f8f9fa" }}
      >
        {isLoadingMessages ? (
          <LoadingSpinner message="Loading messages..." minHeight="10vh" />
        ) : (
          messages.map((m, i) => (
            <div
              key={m._id}
              className={`d-flex mb-2 ${m.sender._id === user._id ? "justify-content-end" : "justify-content-start"}`}
            >
              <div
                className={`p-2 rounded shadow-sm ${m.sender._id === user._id ? "bg-primary text-white" : "bg-white text-dark"}`}
                style={{ maxWidth: "75%" }}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-top bg-white">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={sendMessage}
          />
          <Button variant="primary" onClick={sendBtnClick}>
            Send
          </Button>
        </InputGroup>
      </div>
    </div>
  );
};

export default ChatInterface;
