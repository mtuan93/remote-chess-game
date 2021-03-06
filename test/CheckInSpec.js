var should = require('should');
var io = require('socket.io-client'),
    server = require('../server.js');

var socketURL = 'http://localhost:3000/';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

var userName1 = 'name1';
var userName2 = 'name2';
var userName3 = 'name3';

describe("Player Login", function() {

  it('TEST: A player logging in should be notified if a username he/she used to'
    + ' log in is already taken.', function() {
      var u1 = "u1";
      var u2 = "u2";
      var client  = io.connect(socketURL, options);
      var client2 = io.connect(socketURL, options);

      client.on('connect', function(data) {
          client.emit('login', u1);
      });
      client2.on('connect', function(data) {
          client2.emit('validate-username', u1);
      });

      client2.on('valid-username', function(isValid) {
        isValid.should.not.be.true();
        client2.disconnect();
      });

      client2.on('connect', function(data) {
        client2.emit('validate-username', u2);
      });

      client2.on('valid-username', function(isValid) {
        isValid.should.be.true();
      });
      client.disconnect();
      client2.disconnect();
    });
});

describe("Ensure server knows about user disconnect", function() {
  it('TEST: Make sure that the server.js knows about a user exiting the window',
    function() {
      var client1 = io.connect(socketURL, options);
      client1.on('connect', function(data) {
        client1.emit('disconnect', true);
      });

      /// TODO: need to check to make sure client1 is disconnected
    });
});

describe("Display all logged in players that are not currently in-game", function() {
  it('TEST: Ensure that a user can see all other online players that are '
    + 'currently not in-game', function() {

      var client1 = io.connect(socketURL, options);
      var client2 = io.connect(socketURL, options);
      var client3 = io.connect(socketURL, options);
      client1.on('connect', function(data) {
        client1.emit('login', userName1);
      });
      client2.on('connect', function(data) {
        client2.emit('login', userName2);
      });
      client3.on('connect', function(data) {
        client3.emit('login', userName3);
      });

      /// TODO: need to make sure that client1 can only see client2 and client3
    });
});

describe("Add logged in user to 'Online Players' list", function() {
  it('TEST: Ensure that a user is added to the "Online Players" list once that '
    + 'user logs in', function() {

      var client1 = io.connect(socketURL, options);
      var client2 = io.connect(socketURL, options);
      client1.on('connect', function(data) {
        client1.emit('login', userName1);
      });
      client2.on('connect', function(data) {
        client2.emit('login', userName2);
      });

      /// TODO: need to make sure that client1 can see client2
    });
});

describe("Send and Receive Match Request", function() {
  it('TEST: Ensure that a user can send a join game request to another user and'
    + 'ensure that other user receives the request', function() {

      var client1 = io.connect(socketURL, options);
      var client2 = io.connect(socketURL, options);
      client1.on('connect', function(data) {
        client1.emit('login', userName1);
      });
      client2.on('connect', function(data) {
        client2.emit('login', userName2);
      });

      client1.on('login', function(gameData) {
        client1.emit('invite', u2);
      });

      client2.on('invite-receive', function(inviteInfo) {
        should.equal(inviteInfo.sender, u1);
      });
    });
});

describe("Enter the Chess Game Screen", function() {
  it('TEST: Ensure that once an opponent accepts a join game request, both '
    + 'users are taken to a chess game', function() {
      var client1 = io.connect(socketURL, options);
      var client2 = io.connect(socketURL, options);
      client1.on('connect', function(data) {
        client1.emit('login', userName1);
      });
      client2.on('connect', function(data) {
        client2.emit('login', userName2);
      });

      client1.on('login', function(gameData) {
        client1.emit('invite', u2);
      });

      client2.on('invite-receive', function(inviteInfo) {
        client2.emit('invite-accept', { userId: u2, sender: u1 });
      });

      // ensure that both users are added to a game with each other
      client1.on('joingame', function(gameInfo) {
        should.be.equal(gameInfo.otherUser, u2);
      });
      client2.on('joingame', function(gameInfo) {
        should.be.equal(gameInfo.otherUser, u1);
      });

    });
});


describe("Display What Side May Move", function() {
  it('TEST: Ensure that the system shows whose move it currently is', function() {
      var client1 = io.connect(socketURL, options);
      var client2 = io.connect(socketURL, options);
      client1.on('connect', function(data) {
        client1.emit('login', userName1);
      });
      client2.on('connect', function(data) {
        client2.emit('login', userName2);
      });

      client1.on('login', function(gameData) {
        client1.emit('invite', u2);
      });

      client2.on('invite-receive', function(inviteInfo) {
        client2.emit('invite-accept', { userId: u2, sender: u1 });
      });

      /// TODO: need to test that the game shows whose move it is

    });
});

describe("Display a Move Timer", function() {
  it('TEST: Ensure that a move timer is displayed to the users in a chess ' 
    + 'game', function(done) {

      /// TODO: test if a timer is being displayed to the users
      done();
  });
});


describe("Timer Reset", function() {
  it('TEST: Ensure that the timer is reset after each player moves', function(done) {

    /// TODO: test to make sure that the timer is reset
    done();
  });
});


describe("Timer Warning", function() {
  it('TEST: Ensure that the user knows how many time penalties are left', function(done) {
    /// TODO: test to make sure the client displays how many penalties are left
    done();
  });
});


describe("Automatic Forfeit", function() {
  it('TEST: Ensure that once a user allows the timer to run out three times '
    + 'that the user automatically forfeits', function(done) {
      /// TODO: make sure that a user automatically forfeits once they allow
      //  the timer to go down three times
      done();
  });
});


describe("Chess Checkin - ", function() {
    /* Test 1 - A Single User */
    it('TEST: should broadcast users when new user connects', function(done) {
        // Set up two waiting users
        var client2 = io.connect(socketURL, options);
        var client3 = io.connect(socketURL, options);
        client2.on('connect', function(data) {
            client2.emit('login', userName2);
        });
        client3.on('connect', function(data) {
            client3.emit('login', userName3);
        });
        // Set up the new user
        var client1 = io.connect(socketURL, options);
        client1.on('connect', function(data) {
            client1.emit('login', userName1);
        });

        client1.on('login', function(user) {
            console.log("Test to see if the new user object has two properties...");
            user.should.be.type('object');
            user.users.should.be.instanceof(Array);
            user.games.should.be.instanceof(Array);
            user.users.length.should.be.equal(2);
            client1.disconnected();
        });
        client2.on('joinlobby', function(newUserName) {
            console.log("Test to see if the new user joined the lobby...");
            newUserName.should.be.equal(userName3);
            /* If this client doesn't disconnect it will interfere 
      with the next test */
            client2.disconnect();
        });
        client3.on('joinlobby', function(newUserName) {
            console.log("Test to see if the new user joined the lobby...");
            newUserName.should.be.equal(userName2);
            /* If this client doesn't disconnect it will interfere 
      with the next test */
            client3.disconnect();
            done();
        });
    });
});
