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