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

jQuery('#message-form').on('submit', function (e) {
  e.preventDefault();

  socket.emit('createMessage', {
    from: 'User',
    text: jQuery('[name=message]').val()
  }, function () {
    jQuery('[name=message]').val('');
  });
});
