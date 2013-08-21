/**
 * MainController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var util = require('underscore'),
    async = require('async'),
    passport = require('passport');

module.exports = {

    index: function (req, res) {
        if (req.session.authenticated) {
            res.redirect('/dashboard');
        } else {
            res.view({ title: 'Welcome' });
        }
    },

    login: function (req, res) {
        passport.authenticate('local', function(err, user, info) {
            if ((err) || (!user)){
                res.send(400, {error: err});
            } else {
                req.logIn(user, function(err) {
                    if (err) res.send(err);
                    Group.findOne({ type: "ADMIN", or: [{ admins: user.id }, { users: user.id }] }).done(function (err, group) {
                        if (err) return res.send(500, { error: "DB Error" });
                        if (group) {
                            req.session.isAdmin = true;
                        }  else {
                            req.session.isAdmin = false;
                        }
                        req.session.authenticated = true;
                    });
                });
                //Set user session data
                User.findOne({id: user.id}, function(err, userInfo) {
                    if(err) res.send(500, { error: "DB Error" }); 
                    req.session.user = userInfo.toJSON();
                    res.send(userInfo.toJSON());
                });
            }
        })(req, res);
    },

    logout: function (req, res) {
        req.logout();
        req.session = null;
        res.clearCookie(sails.config.session.key, { path: '/' });
        res.redirect('/');
    },

    dashboard: function (req, res) {
        return res.view({ title: 'Dashboard' });
    }

};
