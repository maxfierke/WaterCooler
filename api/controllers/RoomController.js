/**
 * RoomController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var util = require('underscore');

module.exports = {

    room_subscribers: function (req, res) {
        var slug = req.params.slug;
        Room.findOneBySlug(slug).done(function (err, room) {
            if (err) return res.send(err, 404);
            var subs = sails.io.sockets.clients();
            var connectedUsers = { users: [] };
            subs.forEach(function(element, index, array) {
                connectedUsers.users[index] = element.handshake.session.user;
            });
            connectedUsers.users = util.sortBy(connectedUsers.users, function(user) {
                if (user.firstName && user.lastName) {
                    return user.firstName + " " + user.lastName;
                } else {
                    return user.username;
                }
            });
            res.json(connectedUsers, 200);
        });
    },

    room_messages: function (req, res) {
        var slug = req.params.slug;
        Room.findOneBySlug(slug).done(function (err, room) {
            if (err) return res.send(err, 404);
            Message.find()
            .where({ room: room.id })
            .exec(function (err, msgs) {
                res.json(msgs, 200);
            });
        });
    },

    room: function (req, res) {
        var slug = req.params.slug;
        Room.findOneBySlug(slug).done(function (err, room) {
            if (err) return res.send(err, 404);
            Room.subscribe(req.socket, [{ id: room.id }]);
            Message.subscribe(req.socket, [{ room: room.id }]);
            User.findOne({ id: req.session.user.id }).done(function (err, user) {
                if (err) return res.send(err, 500);
                res.view({ title: room.name, room: room, user: JSON.stringify(user.toJSON()) });
            })
        });
    }

};

