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

        User.findOneByUsername(username).done(function(err, user) {
            if (err) {
                console.log(err);
                res.send(500, { error: "DB Error" });
            } else {
                if (user) {
                    if (user.verifyPassword(password)) {
                        Group.findOne({ type: "ADMIN", or: [{ admins: user.id }, { users: user.id }] }).done(function (err, group) {
                            if (err) return res.send(500, { error: "DB Error" });
                            if (group) {
                                req.session.isAdmin = true;
                            }  else {
                                req.session.isAdmin = false;
                            }
                            req.session.authenticated = true;
                            req.session.user = user.toJSON();
                            res.send(user.toJSON());
                        });
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
        return res.view({ title: 'Dashboard' });
    }

};
