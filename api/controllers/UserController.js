/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

    create: function (req, res) {
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
                        res.send(user.toJSON());
                    }
                });
            }
        });
    },

    view: function (req, res) {
        User.findOneByUsername(req.params.username).done(function (err, user) {
            if (err) return res.send(err,500);
            if (req.wantsJSON) {
                res.json({ user: user.toJSON() }, 200);
            } else {
                res.view({ title: user.username, user: user });
            }
        });
    },

    account: function (req, res) {
        User.findOne(req.session.user.id).done(function (err, user) {
            if (err) return res.send(err,500);
            if (req.wantsJSON) {
                res.json({ user: user.toJSON() }, 200);
            } else {
                res.view({ title: user.username, user: user.toJSON() });
            }
        });
    },

    manage: function (req, res) {
        User.find().done(function (err, users) {
            res.view({ title: 'Manage Users', users: users });
        });
    }

};
