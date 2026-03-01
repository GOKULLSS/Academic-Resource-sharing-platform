const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const orderRoutes = require("./routes/orderRoutes");
const rentalRoutes = require("./routes/rentalRoutes");

// Route files
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");


let onlineUsers = [];

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Make uploads folder publicly accessible
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/rentals", rentalRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running on port ${PORT}`));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173", // Vite default port
  },
});
app.set("io", io);
io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);

    socket.userId = userData._id;

    // Add user if not already online
    if (!onlineUsers.includes(userData._id)) {
      onlineUsers.push(userData._id);
    }

    io.emit("online users", onlineUsers);

    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.participants) return console.log("chat.participants not defined");

    socket.in(chat._id).emit("message recieved", newMessageRecieved);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    onlineUsers = onlineUsers.filter(
      (userId) => userId !== socket.userId
    );

    io.emit("online users", onlineUsers);
  });
});
