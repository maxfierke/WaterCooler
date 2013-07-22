/**
 * MessageController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var sanitize = require('validator').sanitize;

module.exports = {

    room_message_create: function (req, res) {
        var message = req.param('message');
        var roomSlug = req.params.slug;
        Room.findOneBySlug(roomSlug).done(function (err, room) {
            if (err) return res.send(err,400);
            message = sanitize(message).xss();
            Message.create({
                user: req.session.user.id,
                message: message,
                room: room.id
            }).done(function(err, message) {
                if (err) return res.send(err,500);
                message.user = req.session.user;
                res.broadcast('', message);
                res.json(message, 200);
            });
        });
    }

};
