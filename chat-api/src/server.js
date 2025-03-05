const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const  envPath =  path.join(__dirname, "../.env")
console.log('env', envPath);
require("dotenv").config({ path: envPath });
var app = express();
const portNumber = process.env.PORT || 8000
const cors = require("cors");
const socketio = require("socket.io")(
  8900,
  {
    cors: {
      origin:"http://localhost:8900/",
      credentials: true,
    },
  },
  { transports: ["websocket"] }
);

app.use(cors());
app.use(express.json());
app.use("../public", express.static("public"));
const user = require("./models/users");

app.use(
  "/api",
  createProxyMiddleware({ target:"http://localhost:8000/" , changeOrigin: true })
);
express.urlencoded({ extended: false });

let users = [];
const addUser = async (userId, socketId) => {
  const loggedUser = await user.findById(userId);
  loggedUser.status = "online";
  await loggedUser.save();
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};
const getUser = (recieverId) => {
  const user = users.find((user) => user.userId === recieverId);
  return user;
};
socketio.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    socketio.emit("getUser", userId);
  });
  socket.on("sendMessage", ({ senderId, recieverId, message }) => {
    const user = getUser(recieverId);
    if (user !== undefined) {
      socketio.to(user.socketId).emit("getMessage", { senderId, message });
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    socketio.emit("getUsers", users);
  });
});

require("./router/web")(app);
app.listen(portNumber, () => {
  console.log(`port listing on http://localhost:${portNumber}`);
});
