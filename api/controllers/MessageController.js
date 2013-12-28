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
        var externalReference = {};
        Room.findOneBySlug(roomSlug, function (err, room) {
            if (err) return res.send(err,400);
            message = sanitize(message);
            var youtubeMatch = message.match(/watch\?v=([a-zA-Z0-9\-_]+)/);
            var vimeoMatch = message.match(/https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
            var imgMatch = message.match(/(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png))(?:\?([^#]*))?(?:#(.*))?/);
            if (youtubeMatch) {
                // Grab YouTube ID
                externalReference['youtube'] = youtubeMatch[0].split('=')[1];
            } else if (vimeoMatch) {
                externalReference['vimeo'] = vimeoMatch[3];
            } else if (imgMatch) {
                externalReference['image'] = imgMatch[0];
            }
            Message.create({
                user: req.session.user.id,
                message: message,
                room: room.id,
                ext_ref: externalReference
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
