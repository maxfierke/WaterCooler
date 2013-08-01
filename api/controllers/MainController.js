/**
 * MainController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var util = require('underscore'),
    async = require('async');

module.exports = {

    index: function (req, res) {
        if (req.session.authenticated) {
            res.redirect('/dashboard');
        } else {
            res.view({ title: 'Welcome' });
        }
    },

    login: function (req, res) {
        var username = req.param("username");
        var password = req.param("password");

        User.findOneByUsername(username).done(function(err, usr) {
            if (err) {
                console.log(err);
                res.send(500, { error: "DB Error" });
            } else {
                if (usr) {
                    if (usr.verifyPassword(password)) {
                        req.session.authenticated = true;
                        req.session.user = usr.toJSON();
                        res.send(usr.toJSON());
                    } else {
                        res.send(400, { error: "Wrong Password" });
                    }
                } else {
                    res.send(404, { error: "User not Found" });
                }
            }
        });
    },

    logout: function (req, res) {
        req.session = null;
        res.clearCookie(sails.config.session.key, { path: '/' });
        res.redirect('/');
    },

    dashboard: function (req, res) {
        Group.find({ users: req.session.user.id }).then(function (groups) {
            var groupids = util.pluck(groups, 'id');
            Room.find().done(function (err, rooms) {
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
                        return res.view({ title: 'Dashboard', rooms: hydratedRooms });
                    });
                });
            });
        }).fail(function (err) {
            return res.view({ title: 'Dashboard', rooms: [] });
        }).done();
    }

};
