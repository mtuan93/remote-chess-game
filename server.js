var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000;
var lobbyUsers = {};
var users = {};
var activeGames = {};
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
io.on('connection', function(socket) {
    console.log('new connection ' + socket);

    socket.on('validate-username', function(username) {
      if(username in lobbyUsers) {
        socket.emit('valid-username', false);
      } else {
        socket.emit('valid-username', true);
      }
    });

    socket.on('login', function(userId) {
        console.log(userId + ' joining lobby');
        socket.userId = userId;

        if (!users[userId]) {
            console.log('creating new user');
            users[userId] = {
                userId: socket.userId,
                games: {}
            };
        } else {
            console.log('user found!');
            Object.keys(users[userId].games).forEach(function(gameId) {
                console.log('gameid - ' + gameId);
            });
        }
        console.log('lobby ' + Object.keys(lobbyUsers));
        socket.emit('login', {
            users: Object.keys(lobbyUsers),
            games: Object.keys(users[userId].games)
        });
        lobbyUsers[userId] = socket;

        socket.broadcast.emit('joinlobby', socket.userId);
    });
    socket.on('invite', function(opponentId) {
        console.log('got an invite from: ' + socket.userId + ' --> ' + opponentId);
        socket.broadcast.emit('leavelobby', socket.userId);
        socket.broadcast.emit('leavelobby', opponentId);
        var game = {
            id: Math.floor((Math.random() * 100) + 1),
            board: null,
            users: {
                white: socket.userId,
                black: opponentId
            }
        };
        socket.gameId = game.id;
        activeGames[game.id] = game;
        users[game.users.white].games[game.id] = game.id;
        users[game.users.black].games[game.id] = game.id;
        console.log('starting game: ' + game.id);
        lobbyUsers[game.users.white].emit('joingame', {
            game: game,
            color: 'white',
            otherUser: game.users.black
        });
        lobbyUsers[game.users.black].emit('joingame', {
            game: game,
            color: 'black',
            otherUser: game.users.white
        });
        delete lobbyUsers[game.users.white];
        delete lobbyUsers[game.users.black];
        socket.broadcast.emit('gameadd', {
            gameId: game.id,
            gameState: game
        });
    });
    socket.on('resumegame', function(gameId) {
        console.log('ready to resume game: ' + gameId);
        socket.gameId = gameId;
        var game = activeGames[gameId];
        users[game.users.white].games[game.id] = game.id;
        users[game.users.black].games[game.id] = game.id;
        console.log('resuming game: ' + game.id);
        if (lobbyUsers[game.users.white]) {
            lobbyUsers[game.users.white].emit('joingame', {
                game: game,
                color: 'white',
                otherUser: game.users.black
            });
            delete lobbyUsers[game.users.white];
        }
        if (lobbyUsers[game.users.black]) {
            lobbyUsers[game.users.black].emit('joingame', {
                game: game,
                color: 'black',
                otherUser: game.users.white
            });
            delete lobbyUsers[game.users.black];
        }
    });
    socket.on('move', function(msg) {
        socket.broadcast.emit('move', msg);
        activeGames[msg.gameId].board = msg.board;
        console.log(msg);
    });
    socket.on('resign', function(userInfo) {
        console.log(userInfo.userId + " resign");
        delete users[userInfo.userId];
        delete users[userInfo.otherUser];
        delete lobbyUsers[userInfo.userId];
        delete lobbyUsers[userInfo.otherUser];
        socket.broadcast.emit('resign', {
            opponentId: userInfo.userId,
            userId: userInfo.otherUser,
            gameId: userInfo.gameId
        });
    });
    socket.on('disconnect', function(msg) {
        if (socket && socket.userId && socket.gameId) {
            console.log(socket.userId + ' disconnected');
            console.log(socket.gameId + ' disconnected');
        }
        delete lobbyUsers[socket.userId];
        socket.broadcast.emit('logout', {
            userId: socket.userId,
            gameId: socket.gameId
        });
    });
    socket.on('dashboardlogin', function() {
        console.log('dashboard joined');
        socket.emit('dashboardlogin', {
            games: activeGames
        });
    });
});
http.listen(port, function() {
    console.log('listening on *: ' + port);
});
