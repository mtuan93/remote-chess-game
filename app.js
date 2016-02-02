var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var port = 8080;

app.get('/', function(req, res) {
 res.sendFile(__dirname + '/public/index.html');
});

http.listen(port, function() {
    console.log('Listening on port: ' + port);
});