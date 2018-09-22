const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const Shuffle = require('shuffle');

const { generateMessage } = require('./utils/message');
const clientPath = path.join(__dirname, '../client');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var players = {};
let connectedSockets = [];

app.use(express.static(clientPath));

io.on('connection', (socket) => {

  connectedSockets.push(socket.id);

  // User initialization
  console.log('user connected: ', socket.id);

  players[socket.id] = {
    socket,
    deck: []
  };
  socket.emit('newMessage', generateMessage('ADMIN', `Welcome to Sushi Go! (${socket.id})`));
  io.emit('userChange', {sockets: connectedSockets});
  socket.broadcast.emit('newMessage', generateMessage('ADMIN', `New user (${socket.id}) has joined the room`));

  socket.on('startGame', () => {
    initDeckAndHands();
  });

  // User disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    connectedSockets.splice(connectedSockets.indexOf(socket.id), 1);
    io.emit('userChange', {sockets: connectedSockets});
    socket.broadcast.emit('newMessage', generateMessage('ADMIN', `User (${socket.id}) has left the room`));
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

function initDeckAndHands() {
  var squidNigiri = { type: 'nigiri', name: 'squid', points: 3 };
  var salmonNigiri = { type: 'nigiri', name: 'salmon', points: 2 };
  var eggNigiri = { type: 'nigiri', name: 'egg', points: 1 };

  var cards = [];
  for (var i = 0; i < 20; i++) {
    if (i < 5)
      cards.push(squidNigiri);
    else if (i < 15)
      cards.push(salmonNigiri);
    else
      cards.push(eggNigiri);
  }

  let deck = Shuffle.shuffle({ deck: cards });
  console.log(deck);

  var hands = [];
  for (var id in players) {
    hands.push(players[id].deck);
  }
  deck.deal(3, hands);
  for (var id in players) {
    console.log(id, ' deck: ', players[id].deck);
  }
}
