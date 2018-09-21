const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const { generateMessage } = require('./utils/message');
const clientPath = path.join(__dirname, '../client');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var players = {};

app.use(express.static(clientPath));

io.on('connection', (socket) => {

  // User initialization
  console.log('user connected: ', socket.id);

  players[socket.id] = {
    socket
  };
  socket.emit('newMessage', generateMessage('ADMIN', `Welcome to Sushi Go! (${socket.id})`));
  socket.broadcast.emit('newMessage', generateMessage('ADMIN', `New user (${socket.id}) has joined the room`));

  socket.on('disconnect', () => {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    socket.broadcast.emit('newMessage', generateMessage('ADMIN', `User (${socket.id}) has left the room`));
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
