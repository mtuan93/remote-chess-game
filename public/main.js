(function() {
    var socket, serverGame;
    var username, playerColor, currentTurnPlayer;
    var game, board;
    var usersOnline = [];
    var myGames = [];
    socket = io();

    socket.on('login', function(msg) {
        usersOnline = msg.users;
        updateUserList();

        myGames = msg.games;

    });

    socket.on('joinlobby', function(msg) {
        addUser(msg);
    });

    socket.on('leavelobby', function(msg) {
        removeUser(msg);
    });

    socket.on('gameadd', function(msg) {

    });

    socket.on('gameremove', function(msg) {

    });

    socket.on('joingame', function(msg) {
        console.log("joined as game id: " + msg.game.id);
        playerColor = msg.color;
        initGame(msg.game);
        $('#page-lobby').hide();
        $('#page-game').show();
    });

    socket.on('move', function(msg) {
        if (serverGame && msg.gameId === serverGame.id) {
            game.move(msg.move);
            board.position(game.fen());
        }
    });


    socket.on('logout', function(msg) {
        removeUser(msg.username);
    });

    $('#login').on('click', function() {
        username = $('#username').val();

        if (username.length > 0) {
            $('#userLabel').text('You are checked in as: ' + username);
            socket.emit('login', username);
            $('#page-login').hide();
            $('#page-lobby').show();
        }
    });

    $('#game-undo').on('click', function(e) {
        // socket.emit('login', username);
        // $('#page-game').hide();
        // $('#page-lobby').show();

        // Prevents the default action to be triggered. 
        e.preventDefault();

        // Triggering bPopup when click event is fired
        $('#popup-element').bPopup();
    });

    $('#game-resign').on('click', function() {
        socket.emit('resign', {
            userId: username,
            gameId: serverGame.id
        });
        $('#page-game').hide();
        $('#page-lobby').show();
    });

    var addUser = function(userId) {
        usersOnline.push(userId);
        updateUserList();
    };

    var removeUser = function(userId) {
        for (var i = 0; i < usersOnline.length; i++) {
            if (usersOnline[i] === userId) {
                usersOnline.splice(i, 1);
            }
        }
        updateUserList();
    };

    var updateUserList = function() {
        if (usersOnline.length > 0) {
            document.getElementById('userList').innerHTML = '';
            usersOnline.forEach(function(user) {
                $('#userList').append($('<a href="#" class="row list-group-item">')
                    .text(user)
                    .on('click', function() {
                        socket.emit('invite', user);
                    }));
            });
        }
    };

    var initGame = function(serverGameState) {
        serverGame = serverGameState;

        var cfg = {
            draggable: true,
            showNotation: false,
            orientation: playerColor,
            position: serverGame.board ? serverGame.board : 'start',
            onDragStart: onDragStart,
            onDrop: onDrop,
            onMouseoutSquare: onMouseoutSquare,
            onMouseoverSquare: onMouseoverSquare,
            onSnapEnd: onSnapEnd
        };

        game = serverGame.board ? new Chess(serverGame.board) : new Chess();
        board = new ChessBoard('game-board', cfg);
    };

    var onMouseoverSquare = function(square, piece) {
        // get list of possible moves for this square
        var moves = game.moves({
            square: square,
            verbose: true
        });

        // exit if there are no moves available for this square
        if (moves.length === 0) return;

        // highlight the square they moused over
        greySquare(square);

        // highlight the possible squares for this piece
        for (var i = 0; i < moves.length; i++) {
            greySquare(moves[i].to);
        }
    };

    var greySquare = function(square) {
        var squareEl = $('#game-board .square-' + square);

        var background = '#a9a9a9';
        if (squareEl.hasClass('black-3c85d') === true) {
            background = '#696969';
        }

        squareEl.css('background', background);
    };

    var onMouseoutSquare = function(square, piece) {
        removeGreySquares();
    };

    var removeGreySquares = function() {
        $('#game-board .square-55d63').css('background', '');
    };

    var onDragStart = function(source, piece, position, orientation) {
        if (game.game_over() === true ||
            (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
            (game.turn() !== playerColor[0])) {
            return false;
        }
    };

    var onDrop = function(source, target) {
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        if (move === null) {
            return 'snapback';
        } else {
            socket.emit('move', {
                move: move,
                gameId: serverGame.id,
                board: game.fen()
            });
        }

    };
    var onSnapEnd = function() {
        board.position(game.fen());
    };

})();
