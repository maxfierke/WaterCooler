/**
 * ServiceController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */

var request = require('request');

module.exports = {

    youtube_details: function (req, res) {
        var youtubeId = req.params.id;
        var r = request('https://www.googleapis.com/youtube/v3/videos?id='+youtubeId+'&key='+sails.config.watercooler.integrations.youtube.apikey+'&part=snippet')
        req.pipe(r).pipe(res);
    },

    vimeo_details: function (req, res) {
        var vimeoId = req.params.id;
        var r = request('http://vimeo.com/api/v2/video/'+vimeoId+'.json');
        req.pipe(r).pipe(res);
    }
};