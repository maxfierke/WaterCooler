/**
 * RoomController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var util = require('underscore'),
    slugify = require('slug'),
    async = require('async');

module.exports = {

    room_groups: function (req, res) {
        var slug = req.params.slug;
        Room.findOneBySlug(slug).done(function (err, room) {
            if (err) return res.send(err, 404);
            async.map(room.groups, function (group, cb) {
                Group.findOne(group).done(function (err, dbgroup) {
                    return cb(err, dbgroup);
                });
            }, function (err, hydratedGroups) {
                return res.json({ groups: hydratedGroups }, 200);
            });
        });
    },

    room_subscribers: function (req, res) {
        var slug = req.params.slug;
        Room.findOneBySlug(slug).done(function (err, room) {
            if (err) return res.send(err, 404);
            var subs = sails.io.sockets.clients(slug);
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
        var limit = req.param('limit');
        var user = req.param('user');
        Room.findOneBySlug(slug).done(function (err, room) {
            if (err) return res.send(err, 404);
            Message.find()
            .where({ room: room.id })
            .where((user ? { user: user } : {}))
            .sort({ createdAt: -1, $natural: -1 })
            .limit((limit ? limit : 10))
            .exec(function (err, msgs) {
                async.each(msgs, function(msg, cb) {
                    User.findOne({ id: msg.user}).done(function (err, dbuser) {
                        if (err) {
                            msg.user = { id: user, name: 'Deleted User' };
                            return cb(err);
                        } else {
                            msg.user = dbuser;
                            return cb(err);
                        }
                    });
                }, function (err) {
                    if (err) return res.send(err, 500);
                    return res.json({ messages: msgs.reverse() }, 200);
                });
            });
        });
    },

    room: function (req, res) {
        var slug = req.params.slug;
        Room.findOneBySlug(slug).done(function (err, room) {
            if (err) return res.send(err, 404);
            if (!req.isSocket) {
                User.findOne({ id: req.session.user.id }).done(function (err, user) {
                    if (err) return res.send(err, 500);
                    res.view({ title: room.name, room: room, user: JSON.stringify(user.toJSON()) });
                });
            } else {
                req.listen(room.slug);
                req.socket.on('disconnect', function () {
                    req.socket.broadcast.to(room.slug).emit('presence', { state: 'offline', user: req.session.user });
                    req.socket.leave(room.slug);
                });
                req.socket.broadcast.to(room.slug).emit('presence', { state: 'online', user: req.session.user });
                res.json(room, 200);
            }
        });
    },

    index: function (req, res) {
        Group.find({ users: req.session.user.id }).then(function (groups) {
            var groupids = util.pluck(groups, 'id');
            Room.find()
            .sort("name ASC")
            .done(function (err, rooms) {
                if (err) return res.send(500, { error: "DB Error" });
                async.filter(rooms, function (room, cb) {
                    return cb(room.groups.length == 0 || util.intersection(groupids, room.groups).length > 0);
                }, function (results) {
                    async.map(results, function (room, cb) {
                        if (sails.io.sockets.manager.rooms['/' + room.slug]) {
                            room.clientcount = sails.io.sockets.manager.rooms['/' + room.slug].length;
                        } else {
                            room.clientcount = 0;
                        }
                        async.map(room.groups, function (group, cb2) {
                            Group.findOne(group).done(function (err, dbgroup) {
                                return cb2(err, dbgroup);
                            });
                        }, function (err, hydratedGroups) {
                            room.groups = hydratedGroups;
                            return cb(err, room);
                        });
                    }, function (err, hydratedRooms) {
                        if (err) return res.send(500, { error: "DB Error" });
                        return res.json({ rooms: hydratedRooms }, 200);
                    });
                });
            });
        }).fail(function (err) {
            return res.json({ rooms: [] }, 200);
        }).done();
    },

    create: function (req, res) {
        var name = req.param('name');
        var description = req.param('description');
        var groups = req.param('groups');
        var users = req.param('users');
        Room.findOneByName(name).done(function(err, room){
            if (err) {
                console.log(err);
                res.send(500, { error: "DB Error" });
            } else if (room) {
                res.send(400, { error: "Room name already Taken" });
            } else {
                Room.create({
                    name: name,
                    slug: slugify(name).toLowerCase(),
                    description: description,
                    groups: groups,
                    users: users
                }).done(function(error, room) {
                    if (error) {
                        res.send(500, { error: "DB Error" });
                    } else {
                        res.send(room);
                    }
                });
            }
        });
    },

    manage: function (req, res) {
        Room.find()
        .sort("name ASC")
        .done(function (err, rooms) {
            if (err) return res.send(err, 500);
            rooms.forEach(function (room, index, array) {
                if (sails.io.sockets.manager.rooms['/' + room.slug]) {
                    room.clientcount = sails.io.sockets.manager.rooms['/' + room.slug].length;
                } else {
                    room.clientcount = 0;
                }
            });
            if (req.wantsJSON) {
                res.json({ rooms: rooms }, 200);
            } else {
                res.view({ title: 'Rooms', rooms: rooms });
            }
        });
    }

};

