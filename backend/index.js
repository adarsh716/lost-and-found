const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const friendRoutes = require("./routes/friendRoutes");
const messageRoutes = require("./routes/messageRoutes");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const fileUpload = require("express-fileupload");
const { cloudinaryConnect } = require("./config/cloudinary");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000", 
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 10 * 1024 * 1024 }, 
    abortOnLimit: true,
    createParentPath: true
  })
);

app.use((req, res, next) => {
  req.io = io;
  next();
});


connectDB();
cloudinaryConnect();

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

const connectedUsers = new Map(); 
const userSockets = new Map(); 


io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("joinCommunityChat", (data) => {
    try {
      const { userId, username } = data;
   
      connectedUsers.set(userId, socket.id);
      userSockets.set(socket.id, { userId, username });
      
      socket.join("community_chat");
      
      console.log(`User ${username} (${userId}) joined community chat`);
     
      socket.to("community_chat").emit("userJoined", {
        userId,
        username,
        message: `${username} joined the chat`
      });

      const onlineUsersCount = connectedUsers.size;
      io.to("community_chat").emit("onlineUsersCount", onlineUsersCount);
      
    } catch (error) {
      console.error("Error in joinCommunityChat:", error);
      socket.emit("error", { message: "Failed to join community chat" });
    }
  });

  socket.on("sendCommunityMessage", (messageData) => {
    try {
      console.log("Broadcasting community message:", messageData._id);

      socket.to("community_chat").emit("newCommunityMessage", messageData);
      
    } catch (error) {
      console.error("Error broadcasting community message:", error);
      socket.emit("error", { message: "Failed to broadcast message" });
    }
  });

  socket.on("sendPrivateMessage", (data) => {
    try {
      const { messageData, recipientId } = data;
      const recipientSocketId = connectedUsers.get(recipientId);
      
      if (recipientSocketId) {

        io.to(recipientSocketId).emit("newPrivateMessage", messageData);
        console.log(`Private message sent to user ${recipientId}`);
        
        socket.emit("messageDelivered", { 
          messageId: messageData._id,
          recipientId 
        });
      } else {
        socket.emit("messageNotDelivered", { 
          messageId: messageData._id,
          recipientId,
          reason: "User is offline"
        });
        console.log(`Private message not delivered - user ${recipientId} is offline`);
      }
      
    } catch (error) {
      console.error("Error sending private message:", error);
      socket.emit("error", { message: "Failed to send private message" });
    }
  });

  socket.on("typing", (data) => {
    try {
      const { userId, username } = data;
      socket.to("community_chat").emit("userTyping", {
        userId,
        username,
        isTyping: true
      });
    } catch (error) {
      console.error("Error handling typing:", error);
    }
  });

  socket.on("stopTyping", (data) => {
    try {
      const { userId, username } = data;
      socket.to("community_chat").emit("userTyping", {
        userId,
        username,
        isTyping: false
      });
    } catch (error) {
      console.error("Error handling stop typing:", error);
    }
  });

  socket.on("privateTyping", (data) => {
    try {
      const { recipientId, userId, username } = data;
      const recipientSocketId = connectedUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("privateUserTyping", {
          userId,
          username,
          isTyping: true
        });
      }
    } catch (error) {
      console.error("Error handling private typing:", error);
    }
  });

  socket.on("stopPrivateTyping", (data) => {
    try {
      const { recipientId, userId, username } = data;
      const recipientSocketId = connectedUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("privateUserTyping", {
          userId,
          username,
          isTyping: false
        });
      }
    } catch (error) {
      console.error("Error handling stop private typing:", error);
    }
  });


  socket.on("disconnect", (reason) => {
    try {
      const userData = userSockets.get(socket.id);
      
      if (userData) {
        const { userId, username } = userData;
  
        connectedUsers.delete(userId);
        userSockets.delete(socket.id);

        socket.to("community_chat").emit("userLeft", {
          userId,
          username,
          message: `${username} left the chat`
        });

        const onlineUsersCount = connectedUsers.size;
        io.to("community_chat").emit("onlineUsersCount", onlineUsersCount);
        
        console.log(`User ${username} (${userId}) disconnected: ${reason}`);
      } else {
        console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
      }
      
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("reconnect", () => {
    console.log("User reconnected:", socket.id);
  });
});

app.use((error, req, res, next) => {
  console.error("Server Error:", error);
  res.status(500).json({ 
    message: "Internal server error", 
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong' 
  });
});


app.use("*", (req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl 
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Socket.IO server ready for connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };