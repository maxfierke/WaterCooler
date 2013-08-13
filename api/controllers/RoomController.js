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

    room_hook_bitbucket: function (req, res) {
        if (req.ip === '131.103.20.165' || req.ip === '131.103.20.166') {
            var payload = JSON.parse(req.body);
            var slug = req.params.slug,
            pusher = payload.user,
            repo = {
                owner: payload.repository.owner,
                name: payload.repository.name,
                url: payload.canon_url+payload.repository.absolute_url
            },
            commit_count = payload.commits.length,
            sails.io.sockets['in'](slug).emit('bitbucket', { pusher: pusher, repo: repo, commit_count: commit_count });
            return res.json({ success: 'Posted to '+slug }, 200);
        } else {
            return res.send(403);
        }
    },

    room_hook_github: function (req, res) {
        if (req.ip.match(/^204\.232\.175\.(6[4-9]|[78][0-9]|9[0-4])$/) || req.ip.match(/^192\.30\.252\.([0-1][0-9]?[0-9]?|2[0-4][0-9]|25[0-4])$/)) {
            var payload = JSON.parse(req.param('payload'));
            var slug = req.params.slug,
            pusher = payload.pusher,
            repo = {
                owner: payload.repository.owner.name,
                name: payload.repository.name,
                url: payload.repository.url
            },
            commit_count = payload.commits.length,
            summary_url = payload.compare;
            sails.io.sockets['in'](slug).emit('github', { pusher: pusher, repo: repo, commit_count: commit_count, summary_url: summary_url });
            return res.json({ success: 'Posted to '+slug }, 200);
        } else {
            return res.send(403);
        }
    },

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
            var connectedUsers = sails.io.sockets.clients(slug);
            async.map(connectedUsers, function(user, cb) {
                return cb(err, user.handshake.session.user);
            }, function (err, results) {
                connectedUsers = util.sortBy(results, function(user) {
                    if (user.firstName && user.lastName) {
                        return user.firstName + " " + user.lastName;
                    } else {
                        return user.username;
                    }
                });
                return res.json({ users: connectedUsers }, 200);
            });
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
                Room.subscribe(room.id);
                req.socket.on('disconnect', function () {
                    req.socket.broadcast.to(room.slug).emit('presence', { state: 'offline', user: req.session.user });
                    req.socket.leave(room.slug);
                });
                req.socket.broadcast.to(room.slug).emit('presence', { state: 'online', user: req.session.user });
                Message.subscribe(req.socket, [{ room: room.id }]);
                res.json(room, 200);
            }
        });
    },

    index: function (req, res) {
        Group.find({ or: [{ users: req.session.user.id }, { admins: req.session.user.id }] }).then(function (groups) {
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

