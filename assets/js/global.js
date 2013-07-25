// If rooms list exists, let's populate it.
if($('.rooms-list').length > 0) {
    $.getJSON('/rooms', function (data) {
        var items = [];
        $.each(data.rooms, function(index, room) {
            items.push('<li><a href="/room/'+room.slug+'">'+room.name+'</a></li>');
        });
        $('.rooms-list').html(items);
    });
}

// Highlight the current nav item
$('.nav a[href="'+window.location.pathname+'"]').parent('li').addClass('active');
