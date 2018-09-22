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

jQuery('#start-button').on('click', function(e) {
  e.preventDefault();

  socket.emit('startGame');
});
