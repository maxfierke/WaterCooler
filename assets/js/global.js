var emptyList = '<li><h4 class="lead text-muted">No results found</h4></li>';

// If rooms list exists, let's populate it.
if ($('.rooms-list').length > 0) {
    $.getJSON('/rooms', function (data) {
        var items = [];
        $.each(data.rooms, function(index, room) {
            items.push('<li><a href="/room/'+room.slug+'">'+room.name+'</a></li>');
        });
        if (items.length > 0) {
            $('.rooms-list').html(items);
        } else {
            $('.rooms-list').html(emptyList);
        }
    }).fail(function (err) {
        $('.rooms-list').html(emptyList);
    });
}

// If groups list exists, let's populate it.
if ($('.groups-list').length > 0) {
    $.getJSON('/groups', function (data) {
        var items = [];
        $.each(data.groups, function(index, group) {
            items.push('<li><a href="/group/'+group.slug+'">'+group.name+'</a></li>');
        });
        if (items.length > 0) {
            $('.groups-list').html(items);
        } else {
            $('.groups-list').html(emptyList);
        }
    }).fail(function (err) {
        $('.groups-list').html(emptyList);
    });
}

// Highlight the current nav item
$('.nav-stacked a[href="'+window.location.pathname+'"]').parent('li').addClass('active');
