const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const clientPath = path.join(__dirname, '../client');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var players = {};

app.use(express.static(clientPath));

io.on('connection', (socket) => {
  console.log('user connected: ', socket.id);

  players[socket.id] = {
    socket
  };
  console.log('(joined) players: ', players);

  socket.on('disconnect', () => {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    console.log('(left) players: ', players);
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
