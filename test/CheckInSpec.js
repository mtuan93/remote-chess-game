var should = require('should');
var io = require('socket.io-client'),
    server = require('../app');

var socketURL = 'http://localhost:3000';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

var user1 = {
    userId: 1,
    games: {}
};

describe("Chess Server", function() {
    /* Test 1 - A Single User */
    it('Should broadcast new user once they connect', function(done) {
        var client = io.connect(socketURL, options);

        client.on('connect', function(data) {
            client.emit('login', user1);
        });

        client.on('login', function(userId) {
            userId.should.be.type('string');
            userId.should.equal(user1.name + " has joined.");
            /* If this client doesn't disconnect it will interfere 
      with the next test */
            client.disconnect();
            done();
        });
    });
});