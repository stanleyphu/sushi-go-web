var socket = io();

socket.on('connect', function () {
  console.log('Connected to server');
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('newMessage', function(message) {
  var li = jQuery('<li></li>');
  li.text(`${message.from}: ${message.text}`);

  jQuery('#messages').append(li);
});

socket.on('userChange', function(sckt) {
  jQuery('#users').empty();

  sckt.sockets.forEach((socket) => {
    var li = jQuery('<li></li>');
    li.text(`${socket}`);

    jQuery('#users').append(li);
  });
});

socket.on('playerCards', function(player) { 
  player.deck.forEach((card, i) => {
    let button = jQuery("<button type='button' class='btn btn-secondary'></button>");
    button.text(i);
    button.addClass(`choice-${i}`);
    jQuery(".btn-group").append(button);
  });
});

socket.on('gameStarted', () => {
  jQuery('#start-button').attr('disabled', true);
});

socket.on('gameEnded', () => {
  jQuery('#start-button').attr('disabled', false);
});

jQuery('#start-button').on('click', function(e) {
  e.preventDefault();

  socket.emit('startGame');
});

jQuery('.btn-group').on('click', function(e) {
  e.preventDefault();

  let choice = parseInt($(e.target).text(), 10);
  socket.emit('playerSelection', { choice });
  $('.btn-group').empty();
});
