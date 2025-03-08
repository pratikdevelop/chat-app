
const express = require("express");
const { createServer } = require("http"); // Use Node's http for Socket.IO
const { Server } = require("socket.io"); // Correct Socket.IO import
const path = require("path");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require('./models/db')
const app = express();
const httpServer = createServer(app); // Create HTTP server for Socket.IO
const portNumber = process.env.PORT || 8000;

// Socket.IO setup with proper CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Adjust to your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "../public"))); // Serve static files
app.use(express.urlencoded({ extended: false }));

// User model and online users tracking
const usersModel = require("./models/users");
let onlineUsers = []; // Array to track online users

const addUser = async (userId, socketId) => {
  const loggedUser = await usersModel.findById(userId);
  if (loggedUser) {
    loggedUser.status = "online";
    await loggedUser.save();
    if (!onlineUsers.some((user) => user.userId === userId)) {
      onlineUsers.push({ userId, socketId });
    }
    io.emit("userStatus", { userId, status: "online" }); // Broadcast status update
  }
};

const removeUser = async (socketId) => {
  const user = onlineUsers.find((user) => user.socketId === socketId);
  if (user) {
    const loggedUser = await usersModel.findById(user.userId);
    if (loggedUser) {
      loggedUser.status = "offline";
      await loggedUser.save();
      io.emit("userStatus", { userId: user.userId, status: "offline" });
    }
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socketId);
  }
};

const getUser = (receiverId) => {
  return onlineUsers.find((user) => user.userId === receiverId);
};

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", onlineUsers); // Send updated online users list
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", { senderId, message });
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", onlineUsers); // Update online users list
  });
});

// Route setup
require("./router/router")(app);

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
httpServer.listen(portNumber, () => {
  console.log(`Server running on http://localhost:${portNumber}`);
});