var WaterCooler = {
    room: window.location.pathname.split('/').slice(-1)[0],
    handler: {
        messageReceived: function(message, domMessageContainer) {
            console.log('Message Received: ', message);
            if (message) {
                var html = WaterCooler.util.parseMessageToHTML(message);
                $(domMessageContainer).append(html);
                $(domMessageContainer).scrollTop($(domMessageContainer)[0].scrollHeight);
            } else {
                console.log("There is a problem: ", message);
            }
        },
        clientAdd: function (client, announce, isMe) {
            if (isMe) {
                $('ul#user-list').append('<li data-clientId="'+client.id+'"><img src="https://secure.gravatar.com/avatar/'+client.gravatar_hash+'?s=32" />'+(client.firstName && client.lastName ? client.firstName + ' ' + client.lastName : client.username)+' <span class="label label-info">Me</span></li>');
            } else {
                $('ul#user-list').append('<li data-clientId="'+client.id+'"><img src="https://secure.gravatar.com/avatar/'+client.gravatar_hash+'?s=32" />'+(client.firstName && client.lastName ? client.firstName + ' ' + client.lastName : client.username)+'</li>');

                if (announce) {
                    $('#content').append('<strong class="text-info">'+(client.firstName && client.lastName ? client.firstName + ' ' + client.lastName : client.username)+' has connected.</strong><br />');
                    $('#content').scrollTop($('#content')[0].scrollHeight);
                }
            }
        },
        clientRemove: function (client, announce) {
            $('ul#user-list li[data-clientId="' + client.id + '"]').remove();

            // if announce is true, show a message about this room
            if (announce) {
                $('#content').append('<strong class="text-info">'+(client.firstName && client.lastName ? client.firstName + ' ' + client.lastName : client.username)+' has left the room.</strong><br />');
                $('#content').scrollTop($('#content')[0].scrollHeight);
            }
        },
        clientList: function (data) {
            for (var i = 0; i < data.users.length; i++) {
                isMe = (data.users[i].id === activeUser.id ? true : false);
                WaterCooler.handler.clientAdd(data.users[i], false, isMe);
            }
        }
    },
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
                    html = '<div class="media" id="youtube-'+ytvid+'">';
                    html += '<a class="pull-left" href="https://youtube.com/watch?v='+ytvid+'">';
                    html += '<img class="media-object" src="https://i1.ytimg.com/vi/'+ytvid+'/default.jpg" />';
                    html += '</a>';
                    html += '<div class="media-body">';
                    html += '<h4 class="media-heading"><a href="https://youtube.com/watch?v='+ytvid+'">Title of the Video</a></h4>';
                    html += '<div class="media">Description</div>';
                    html += '</div>';
                    html += '</div>';
                    $.ajax({
                        url: 'https://www.googleapis.com/youtube/v3/videos?id=' + ytvid + '&key='+WaterCooler.config.integrations.youtube.apikey+'&part=snippet',
                        dataType: 'jsonp',
                        success: function(data) {
                            var video = data.items[0].snippet;
                            var ytDivChildren = $('#youtube-'+ytvid).children();
                            ytDivChildren.find('h4 > a').text(video.title);
                            ytDivChildren.find('.media').text(video.description);
                        }
                    });
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

            function parseImgLinks(message) {
                var imgRegEx = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png))(?:\?([^#]*))?(?:#(.*))?/;
                var html = '';
                if (imageUrlMatch = message.match(imgRegEx)) {
                    html += '<img src="'+imageUrlMatch[0]+'" />';
                }
                return html;
            }

            var html = '<div class="message"><div class="message-header span2">';

            //var vimeoUrl = message.match(/^http:\/\/(www\.)?vimeo\.com\/(clip\:)?(\d+).*$/);
            html += parseTimestamp(data.createdAt);
            html += '<b>'+(data.user.firstName && data.user.lastName ? data.user.firstName + ' ' + data.user.lastName : data.user.username)+'</b></div><div class="message-content span10 well well-small">';
            html += data.message.linkify() + '<br />';
            html += parseYouTubeLink(data.message);
            html += parseVimeoLink(data.message);
            html += parseImgLinks(data.message);
            html += '</div>';
            return html;
        }
    }
};

// Load WaterCooler config
$.ajax({
  async: false,
  dataType: 'json',
  url: '/config.json',
  success: function(data) {
    WaterCooler.config = data;
  }
});

