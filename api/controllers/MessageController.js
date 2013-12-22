/**
 * MessageController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var sanitize = require('sanitizer').sanitize;

module.exports = {

    create: function (req, res) {
        var message = req.param('message');
        var roomSlug = req.params.slug;
        Room.findOneBySlug(roomSlug, function (err, room) {
            if (err) return res.send(err,400);
            message = sanitize(message);
            Message.create({
                user: req.session.user.id,
                message: message,
                room: room.id
            }, function(err, message) {
                if (err) return res.send(err,500);
                message.user = req.session.user;
                if (req.isSocket) {
                    Message.publishCreate(message.toJSON(), req.socket);
                }
                return res.json({ type: 'message', data: message }, 200);
            });
        });
    }

};
