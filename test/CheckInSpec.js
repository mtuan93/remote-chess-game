var should = require('should');
var io = require('socket.io-client'),
    server = require('../app');

var socketURL = 'http://localhost:3000/';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

var userName = "Tuan";

describe("Chess Server", function() {
    /* Test 1 - A Single User */
    it('Should broadcast new user once they connect', function(done) {
        var client = io.connect(socketURL, options);

        client.on('connect', function(data) {
            client.emit('login', userName);
        });

        client.on('login', function(user) {
            user.should.be.type('object');
            user.users.should.be.instanceof(Array);
            user.games.should.be.instanceof(Array);
            /* If this client doesn't disconnect it will interfere 
      with the next test */
            client.disconnect();
            done();
        });
    });
});