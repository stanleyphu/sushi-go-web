const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const clientPath = path.join(__dirname, '../client');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(clientPath));

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
