/**
 * MainController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

    index: function (req, res) {
        if (req.session.authenticated) {
            res.redirect('/dashboard');
        } else {
            res.view({ title: 'Welcome' });
        }
    },

    signup: function (req, res) {
        var firstName = req.param("firstName");
        var lastName = req.param("lastName");
        var username = req.param("username");
        var password = req.param("password");
        var email = req.param("email");

        User.findOneByUsername(username).done(function(err, usr){
            if (err) {
                console.log(err);
                res.send(500, { error: "DB Error" });
            } else if (usr) {
                console.log(usr);
                res.send(400, { error: "Username already Taken" });
            } else {
                User.create({
                    username: username,
                    password: password,
                    email: email,
                    firstName: firstName,
                    lastName: lastName
                }).done(function(error, user) {
                    if (error) {
                        console.log(error);
                        res.send(500, { error: "DB Error" });
                    } else {
                        req.session.user = user;
                        res.send(user);
                    }
                });
            }
        });
    },

    login: function (req, res) {
        var username = req.param("username");
        var password = req.param("password");

        User.findOneByUsername(username).done(function(err, usr) {
            if (err) {
                console.log(err);
                res.send(500, { error: "DB Error" });
            } else {
                console.log(usr);
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
        Room.find().done(function (err, rooms) {
            if (err) return res.send(err,500);
            rooms.forEach(function (room, index, array) {
                if (sails.io.sockets.manager.rooms['/' + room.slug]) {
                    room.clientcount = sails.io.sockets.manager.rooms['/' + room.slug].length;
                } else {
                    room.clientcount = 0;
                }
            });
            res.view({ title: 'Dashboard', rooms: rooms });
        });
    }

};
