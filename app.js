var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var port = 8080;
var io = require('socket.io')(http);


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
var numUsers = 0;
io.on('connection', function(socket) {
    var addedUser = false;
    console.log('a user connected');
    socket.on('add user', function(username) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        console.log('useradded ' + username);
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });
});

http.listen(port, function() {
    console.log('Listening on port: ' + port);
});
