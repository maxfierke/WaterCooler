var WaterCooler = {
    util: {
        parseMessageToHTML: function (data) {

            function parseTimestamp(timestamp) {
                ts = new Date(Date.parse(timestamp));
                var hours = ts.getHours();
                var meridian;
                var minutes = ts.getMinutes();
                if (minutes < 10) minutes = "0" + minutes;
                if (hours > 11) meridian = "PM";
                else meridian = "AM";
                hours = hours % 12;
                if (hours === 0) hours = 12;
                fTs = hours + ':' + minutes + ' ' + meridian;
                return '<small class="date muted">' + fTs + '</small>';
            }

            function parseYouTubeLink(message) {
                var html = '';
                if (ytUrl = message.match(/watch\?v=([a-zA-Z0-9\-_]+)/)) {
                    var ytvid = ytUrl[0].split('=')[1];
                    html = '<div class="media">';
                    html += '<a class="pull-left" href="https://youtube.com/watch?v='+ytvid+'">';
                    html += '<img class="media-object" src="https://i1.ytimg.com/vi/'+ytvid+'/default.jpg" />';
                    html += '</a>';
                    html += '<div class="media-body">';
                    html += '<h4 class="media-heading"><a href="https://youtube.com/watch?v='+ytvid+'">Title of the Video</a></h4>';
                    html += '<div class="media">Description</div>';
                    html += '</div>';
                    html += '</div>';
                }
                return html;
            }

            function parseVimeoLink(message) {
                var html = '';
                var vmoRegEx = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;

                if (vmoIdMatches = message.match(vmoRegEx)) {
                    var vmoId = vmoIdMatches[3];
                    html = '<div class="media" id="vimeo-'+vmoId+'">';
                    html += '<a class="pull-left" href="">';
                    html += '<img class="media-object" src="" />';
                    html += '</a>';
                    html += '<div class="media-body">';
                    html += '<h4 class="media-heading"><a href=""></a></h4>';
                    html += '<div class="media"></div>';
                    html += '</div>';
                    html += '</div>';
                    $.ajax({
                        url: 'http://vimeo.com/api/v2/video/' + vmoId + '.json',
                        dataType: 'jsonp',
                        success: function(data) {
                            var video = data[0];
                            processVideo = function(video) {
                                var vmoDivChildren = $('#vimeo-'+vmoId).children();
                                vmoDivChildren.first('a').prop('href', video.url)
                                vmoDivChildren.find('.media-object').prop('src', video.thumbnail_small);
                                vmoDivChildren.find('h4 > a').prop('href', video.url).text(video.title);
                                vmoDivChildren.find('.media').text(video.description);
                            }
                            setTimeout(function () { processVideo(video); video = null; }, 100);
                        }
                    });
                }
                return html;
            }

            var html = '';

            //var vimeoUrl = message.match(/^http:\/\/(www\.)?vimeo\.com\/(clip\:)?(\d+).*$/);
            html += parseTimestamp(data.timestamp);
            html += '<b>' + (data.username ? data.username : 'Server') + ': </b>';
            html += data.message.linkify() + '<br />';
            html += parseYouTubeLink(data.message);
            html += parseVimeoLink(data.message);
            return html;
        }
    }
};
