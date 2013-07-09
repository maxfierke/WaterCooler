var express = require('express');
var app = express();
var port = 3700;
var sanitize = require('validator').sanitize;
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);

app.get('/', function(req, res) {
    res.render('page');
});

app.use(express.static(__dirname + '/public'));
var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'Welcome to WaterCooler', timestamp: new Date().toUTCString() });
    socket.on('send', function (data) {
        data.username = sanitize(data.username).xss();
        data.message = sanitize(data.message).xss();
        data.timestamp = new Date().toUTCString();
        io.sockets.emit('message', data);
    });
});

console.log('[WaterCooler] Server now listening on 0.0.0.0:'+port);
