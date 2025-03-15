// server.js
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes')
const friendRoutes = require('./routes/friendRoutes')
const bodyParser = require('body-parser');
const cors = require('cors');  
const http = require('http');
const socketIo = require('socket.io');
const messageRoutes = require('./routes/messageRoutes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors("*"));

app.use(bodyParser.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/profile',profileRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendRoutes);

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('sendCommunityMessage', (messageData) => {
    io.emit('newCommunityMessage', messageData); 
  });

  socket.on('sendPrivateMessage', (messageData, recipientId) => {
    socket.to(recipientId).emit('newPrivateMessage', messageData); 
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
