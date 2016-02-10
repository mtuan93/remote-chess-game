var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var port = 8080;
var io = require('socket.io')(http);


app.get('/', function(req, res) {
 res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(port, function() {
    console.log('Listening on port: ' + port);
});