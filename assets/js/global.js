var emptyList = '<li><h4 class="lead text-muted">No results found</h4></li>';

var $roomsList = $('.rooms-list');
var $groupsList = $('.groups-list');
var $rooms = $('#rooms');

// If rooms list exists, let's populate it.
if ($roomsList.length > 0) {
    $.getJSON('/rooms', function (data) {
        var items = [];
        if (data.rooms.length > 0) $rooms.html('');
        data.rooms.forEach(function (room, i, all) {
            items.push('<li><a href="/room/'+room.slug+'">'+room.name+'</a></li>');
            if ($rooms.length > 0) {
                var html = '<div class="well"><span class="pull-right"><i class="glyphicon glyphicon-user"></i> '+room.clientcount+
                           ' users connected</span><h4><a href="/room/'+room.slug+'">'+room.name+'</a></h4><p class="col-lg-10">'+
                           room.description+'</p><a href="/room/'+room.slug+'" class="btn btn-success btn-large pull-right">Jump in!</a>'+
                           '<div class="clearfix"></div><hr /><div class="pull-left"><i class="glyphicon glyphicon-calendar"></i> '+
                           '<span class="label label-info">Created '+moment(room.createdAt).fromNow()+'</span></div><ul class="list-inline pull-right">';
                if (room.groups && room.groups.length > 0) {
                    room.groups.forEach(function (group, j, allgroups) {
                        html += '<li><span class="label label-success">'+group.name+'</span></li>';
                    });
                    html += '<i class="glyphicon glyphicon-user"></i></li>';
                } else {
                    html += '<li>Public <i class="glyphicon glyphicon-globe"></i></li>';
                }
                html += '</ul><div class="clearfix"></div></div>';
                $rooms.append(html);
            }
            if (items.length > 0) {
                $roomsList.html(items);
            } else {
                $roomsList.html(emptyList);
            }
        });
    }).fail(function (err) {
        $roomsList.html(emptyList);
        $rooms.html('<div class="well"><h1 class="text-center text-muted text-light">Failed to load rooms!</h1></div>');
    });
}

// If groups list exists, let's populate it.
if ($groupsList.length > 0) {
    $.getJSON('/groups', function (data) {
        var items = [];
        $.each(data.groups, function(index, group) {
            items.push('<li><a href="/group/'+group.slug+'">'+group.name+'</a></li>');
        });
        if (items.length > 0) {
            $groupsList.html(items);
        } else {
            $groupsList.html(emptyList);
        }
    }).fail(function (err) {
        $groupsList.html(emptyList);
    });
}

// Highlight the current nav item
$('.nav-stacked a[href="'+window.location.pathname+'"]').parent('li').addClass('active');
