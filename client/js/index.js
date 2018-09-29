var socket = io();

socket.on('connect', function () {
  console.log('Connected to server');
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('changeUsername', function(username) {
  $('#username').text(username.name);
});

socket.on('newActivity', function(message) {
  var li = jQuery('<li></li>');
  li.text(`${message.from}: ${message.text}`);

  $('#activity').append(li);

  var actDiv = document.getElementById('activities-container');
  actDiv.scrollTop = actDiv.scrollHeight;
});

socket.on('newMessage', function(message) {
  var li = jQuery('<li></li>');
  li.text(`${message.from}: ${message.text}`);

  $('#messages').append(li);

  var msgDiv = document.getElementById('messages-container');
  msgDiv.scrollTop = msgDiv.scrollHeight;
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
    let button = $("<button type='button' class='list-group-item list-group-item-action'></button>");
    button.text(`${card.name} ${card.type} (${card.points})`);
    // button.addClass(`choice-${i}`);
    button.attr('id', `${i}`);
    jQuery(".list-group").append(button);
  });
});

socket.on('gameStarted', () => {
  jQuery('#start-button').attr('disabled', true);
  $('#activity').empty();
});

socket.on('gameEnded', () => {
  jQuery('#start-button').attr('disabled', false);
});

jQuery('#start-button').on('click', function(e) {
  e.preventDefault();

  socket.emit('startGame');
});

jQuery('.list-group').on('click', function(e) {
  e.preventDefault();

  console.log($(e.target).attr("id"));
  let choice = parseInt($(e.target).attr("id"), 10);
  socket.emit('playerSelection', { choice });
  $('.list-group').empty();
});

$('#message-form').on('submit', function(e) {
  e.preventDefault();
  console.log('submit');

  socket.emit('createMessage', {
    text: $('[name=message]').val()
  }, () => {
    $('[name=message]').val('').focus();
  });
});
