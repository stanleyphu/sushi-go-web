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
    // let button = jQuery("<button type='button' class='btn btn-secondary'></button>");
    // button.text(i);
    // button.addClass(`choice-${i}`);
    // jQuery(".btn-group").append(button);

    let button = $("<button type='button' class='list-group-item list-group-item-action'></button>");
    button.text(`${card.name} ${card.type} (${card.points})`);
    // button.addClass(`choice-${i}`);
    button.attr('id', `${i}`);
    jQuery(".list-group").append(button);
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

  $('#messages').empty();
  socket.emit('startGame');
});

jQuery('.list-group').on('click', function(e) {
  e.preventDefault();

  console.log($(e.target).attr("id"));
  let choice = parseInt($(e.target).attr("id"), 10);
  socket.emit('playerSelection', { choice });
  $('.list-group').empty();
});
