var express = require('express');
var app = express();
var port = 3700;
var sanitize = require('validator').sanitize;

var clients = {};
var rooms = ['lobby', 'test'];

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);

app.get('/room/:room', function(req, res) {
    console.log('Requested Room: '+req.params.room);
    console.log ('Index of Room: '+rooms.indexOf(req.params.room));
    if (rooms.indexOf(req.params.room) != -1) {
        res.render('room');
    } else {
        res.status(404);
        res.end();
    }
});

app.get('/', function(req, res) {
    res.end();
});

app.use(express.static(__dirname + '/public'));
var io = require('socket.io').listen(app.listen(port));

io.set('log level', 2);

// get array of clients in a room
function getClientsInRoom(socketId, room) {
    // get array of socket ids in this room
    var socketIds = io.sockets.manager.rooms['/' + room];
    var roomClients = [];

    if (socketIds && socketIds.length > 0) {
        socketsCount = socketIds.lenght;
        // push every client to the result array
        for (var i = 0, len = socketIds.length; i < len; i++) {
            // check if the socket is not the requesting
            // socket
            if (socketIds[i] != socketId) {
                roomClients.push(clients[socketIds[i]]);
            }
        }
    }

    return roomClients;
}

// get the amount of clients in aroom
function countClientsInRoom(room) {
    // 'io.sockets.manager.rooms' is an object that holds
    // the active room names as a key and an array of
    // all subscribed client socket ids
    if (io.sockets.manager.rooms['/' + room]) {
        return io.sockets.manager.rooms['/' + room].length;
    }
    return 0;
}

// updating all other clients when a client goes
// online or offline.
function updatePresence(room, socket, state) {
    // socket.io may add a trailing '/' to the
    // room name so we are clearing it
    room = room.replace('/','');

    // by using 'socket.broadcast' we can send/emit
    // a message/event to all other clients except
    // the sender himself
    socket.in(room).emit('presence', { client: clients[socket.id], state: state, room: room });
    socket.broadcast.to(room).emit('presence', { client: clients[socket.id], state: state, room: room });
}

// unique id generator
function generateId() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function unsubscribe(socket, data) {
    // update all other clients about the offline
    // presence
    updatePresence(data.room, socket, 'offline');

    // remove the client from socket.io room
    socket.leave(data.room);
}

io.sockets.on('connection', function(socket) {

    // after connection, the client sends us the
    // username through the connect event
    socket.on('connect', function(data) {
        console.log('%j', data);
        //generate clientId
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        data.clientId = S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
        console.log('%j', data);

        // save the client to the hash object for
        // quick access, we can save this data on
        // the socket with 'socket.set(key, value)'
        // but the only way to pull it back will be
        // async
        clients[socket.id] = data;

        // now the client objtec is ready, update
        // the client
        socket.emit('ready', { clientId: data.clientId });

        // auto subscribe the client to the 'lobby'
        //subscribe(socket, { room: 'lobby' });

        // sends a list of all active rooms in the
        // server
        socket.emit('roomslist', { rooms: Object.keys(io.sockets.manager.rooms) });
    });

    // when a client sends a message, she emits
    // this event, then the server forwards the
    // message to other clients in the same room
    socket.on('send', function(data) {
        data.username = sanitize(data.username).xss();
        data.message = sanitize(data.message).xss();
        data.timestamp = new Date().toUTCString();
        console.log('%j', data);
        socket.in(data.room).emit('message', data);
        socket.broadcast.to(data.room).emit('message', data);
    });

    // client subscription to a room
    socket.on('subscribe', function(data) {
        console.log('%j', data);
        // subscribe the client to the room
        socket.join(data.room);

        // update all other clients about the online
        // presence
        updatePresence(data.room, socket, 'online');

        // send to the client a list of all subscribed clients
        // in this room
        socket.emit('roomclients', { room: data.room, clients: getClientsInRoom(socket.id, data.room) });

        socket.emit('message', { message: 'Welcome to WaterCooler', timestamp: new Date().toUTCString() });
    });

    // client unsubscription from a room
    socket.on('unsubscribe', function(data) {
        console.log('%j', data);
        unsubscribe(socket, data);
    });

    // when a client calls the 'socket.close()'
    // function or closes the browser, this event
    // is built in socket.io so we actually dont
    // need to fire it manually
    socket.on('disconnect', function() {
        // get a list of rooms for the client
        var rooms = io.sockets.manager.roomClients[socket.id];

        // unsubscribe from the rooms
        for (var room in rooms) {
            if (room && rooms[room]) {
                unsubscribe(socket, { room: room.replace('/','') });
            }
        }

        // client was unsubscribed from the rooms,
        // now we can selete him from the hash object
        delete clients[socket.id];
    });
});

console.log('[WaterCooler] Server now listening on 0.0.0.0:'+port);
