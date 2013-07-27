/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

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

    index: function (req, res) {
        User.find().done(function (err, users) {
            if (req.wantsJSON) {
                res.json({ users: users }, 200);
            } else {
                res.view({ title: 'Users', users: users });
            }
        });
    }

};
