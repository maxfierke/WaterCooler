/**
 * GroupController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var util = require('underscore'),
    slugify = require('slug'),
    async = require('async');

module.exports = {

    index: function (req, res) {
        Group.find({ or: [{ users: req.session.user.id }, { admins: req.session.user.id }] })
        .sort("name ASC")
        .done(function (err, groups) {
            if (err) return res.send(500, { error: "DB Error" });
            return res.json({ groups: groups }, 200);
        });
    },

    create: function (req, res) {
        var name = req.param('name');
        var description = req.param('description');
        var type = req.param('type');
        var admins = req.param('admins');
        var users = req.param('users');
        if (type !== 'ADMIN' && type !== 'NORMAL') {
            res.send({ error: 'Bad Request' }, 400);
        } else {
            Group.findOneByName(name).done(function(err, group) {
                if (err) {
                    console.log(err);
                    res.send(500, { error: "DB Error" });
                } else if (group) {
                    res.send(400, { error: "Group name already taken" });
                } else {
                    Group.create({
                        name: name,
                        slug: slugify(name).toLowerCase(),
                        description: description,
                        type: type,
                        admins: admins,
                        users: users
                    }).done(function(error, group) {
                        if (error) {
                            console.log(error);
                            res.send(500, { error: "DB Error" });
                        } else {
                            res.send(group.toJSON());
                        }
                    });
                }
            });
        }
    },

    manage: function (req, res) {
        Group.find().sort("name ASC").done(function (err, groups) {
            res.view({ groups: groups });
        });
    },

    user_add: function (req, res) {
        var username = req.param('username');
        Group.findOneBySlug(req.params.slug).done(function (err, group) {
            if (err) {
                console.log(err);
                res.send(500, { error: "DB Error" });
            }
            console.log(group);
            User.findOneByUsername(username).done(function (err, user) {
                if (err) {
                    console.log(err);
                    res.send(500, { error: "DB Error" });
                }
                group.users.push(user.id);
                Group.update(group.id, { users: group.users }, function (err, group) {
                    if (err) {
                        console.log(err);
                        res.send(500, { error: "DB Error" });
                    }
                    res.json(user.toJSON(), 200);
                });
            });
        });
    },

    user_delete: function (req, res) {
        Group.findOneBySlug(req.params.slug).done(function (err, group) {
            if (err) {
                console.log(err);
                res.send(500, { error: "DB Error" });
            }
            group.users = util.without(group.users, req.params.id);
            Group.update(group.id, { users: group.users }, function (err, group) {
                if (err) {
                    console.log(err);
                    res.send(500, { error: "DB Error" });
                }
                res.json({ success: "User removed!" }, 200);
            });
        });
    },

    view: function (req, res) {
        Group.findOneBySlug(req.params.slug).then(function (group) {
            async.map(group.admins, function (admin, cb) {
                User.findOne(admin).then(function (user) {
                    cb(null, user.toJSON());
                });
            }, function (err, results) {
                if (err) {
                    console.log(err);
                    res.send(500, { error: "DB Error" });
                }
                group.admins = results;
                async.map(group.users, function (user, cb) {
                    User.findOne(user).then(function (user) {
                        cb(null, user.toJSON());
                    });
                }, function (err, results) {
                    if (err) {
                        console.log(err);
                        res.send(500, { error: "DB Error" });
                    }
                    group.users = results;
                    if (req.wantsJSON) {
                        res.json({ group: group.toJSON() }, 200);
                    } else {
                        res.view({ title: group.name, group: group });
                    }
                });
            });
        });
    }

};
