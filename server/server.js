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
let currentRound = {};
let roundsLeft = 3;

app.use(express.static(clientPath));

io.on('connection', (socket) => {

  // User initialization
  console.log('user connected: ', socket.id);

  players[socket.id] = {
    socket,
    deck: [],
    score: 0
  };
  currentRound[socket.id] = false;
  console.log(Object.keys(players));
  socket.emit('newMessage', generateMessage('ADMIN', `Welcome to Sushi Go! (${socket.id})`));
  io.emit('userChange', {sockets: Object.keys(players)});
  socket.broadcast.emit('newMessage', generateMessage('ADMIN', `New user (${socket.id}) has joined the room`));

  // Start game
  socket.on('startGame', () => {
    roundsLeft = 3;
    initDeckAndHands();
    showPlayerHands();
    io.emit('gameStarted');
  });

  // Game in progress
  socket.on('createMessage', (message) => {
    socket.emit('newMessage', generateMessage('YOU CHOSE', message.text));
    var choice = parseInt(message.text, 10);
    if (choice >= players[socket.id].deck.length) {
      socket.emit('newMessage', generateMessage('ADMIN', 'Invalid choice. Choose again'));
    }
    else {
      socket.emit('newMessage', generateMessage('YOU CHOSE', players[socket.id].deck[choice].name + ' ' + players[socket.id].deck[choice].type));
      players[socket.id].score += players[socket.id].deck[choice].points;
      players[socket.id].deck.splice(choice, 1);
      currentRound[socket.id] = true;
      
      console.log(currentRound);
      console.log(currentRoundDone());
      if (!currentRoundDone()) {
        socket.emit('newMessage', generateMessage('ADMIN', 'Waiting for players...'));
      }
    }

    if (currentRoundDone()) {
      roundsLeft--;

      io.emit('newMessage', generateMessage('ADMIN', `ROUND ${3 - roundsLeft} OVER`));

      for (var id in players) {
        io.emit('newMessage', generateMessage(id, players[id].score));
      }

      if (roundsLeft == 0) {
        io.emit('newMessage', generateMessage('ADMIN', 'GAME OVER'));
        io.emit('gameEnded');
      }
      else {
        // Switch decks
        rotateHands();
        io.emit('newMessage', generateMessage('ADMIN', `ROUND ${3 - roundsLeft + 1} BEGINS`));
        showPlayerHands();
        resetCurrentRound();
      }
    }
  });

  // User disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    delete currentRound[socket.id];
    io.emit('userChange', {sockets: Object.keys(players)});
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

  var hands = [];
  for (var id in players) {
    hands.push(players[id].deck);
  }
  deck.deal(3, hands);
  for (var id in players) {
    console.log(id, ' deck: ', players[id].deck);
  }
}

function showPlayerHands() {
  for (var id in players) {
    players[id].socket.emit('newMessage', generateMessage('YOUR CARDS', JSON.stringify(players[id].deck)));
  }
}

function rotateHands() {
  var hands = [];
  var k = 0;
  var playerIds = Object.keys(players);
  var numPlayers = playerIds.length;

  console.log('BEFORE');
  for (var id in players) {
    console.log(id, ' deck ', players[id].deck);
  }

  playerIds.forEach((id, i) => {
    if (i == numPlayers - 1) {
      hands.unshift(players[id].deck);
    }
    else {
      hands.push(players[id].deck);
    }
  });

  for (var id in players) {
    players[id].deck = hands[k++];
  }

  console.log(hands);
  console.log('AFTER');
  for (var id in players) {
    console.log(id, ' deck ', players[id].deck);
  }

}

function currentRoundDone() {
  for (var id in currentRound) {
    if (!currentRound[id]) {
      return false;
    }
  }
  return true;
}

function resetCurrentRound() {
  for (var id in currentRound) {
    currentRound[id] = false;
  }
}
