$(window).on('resize', function () {
    //vpw = $(window).width();
    vph = $(window).height();
    $('#content').css({'height': (vph-50) + 'px'});
});

$(window).resize();

if (WaterCooler.config) {
    var writeback = [];
    var clientId = null, username = null, clients = {};
    var socket = io.connect('//'+WaterCooler.config.app.host+':'+WaterCooler.config.app.port);
    var field = document.getElementById("field");
    var sendBtn = document.getElementById("send");
    var content = document.getElementById("content");
    var name = document.getElementById("name");

    socket.on('connect', function () {
        if ($(content).text() != '') {
            $(content).append('<strong class="text-success">Connection Success!</strong><br />');
        }
        socket.emit('connect', { username: 'Anonymous' });
        socket.emit('subscribe', { room: WaterCooler.room });
    });

    socket.on('ready', function (data) {
        $(field).focus();
        clientId = data.clientId;
    });

    socket.on('roomclients', function(data) {
        for (var i = 0; i < data.clients.length; i++) {
            isMe = (data.clients[i].clientId === clientId ? true : false);
            addClient(data.clients[i], false, isMe);
        }
    });

    socket.on('message', function (data) {
        if (data.message) {
            var html = WaterCooler.util.parseMessageToHTML(data);
            $(content).append(html);
            $(content).scrollTop($(content)[0].scrollHeight);
        } else {
            console.log("There is a problem:", data);
        }
    });

    socket.on('disconnect', function () {
        $(content).append('<strong class="text-error">Connection Lost! I\'ll try to reconnect...</strong><br />');
        $(content).scrollTop($(content)[0].scrollHeight);
    });

    // with this event the server tells us when a client
    // is connected or disconnected to the current room
    socket.on('presence', function(data) {
        isMe = (data.clientId === clientId ? true : false);
        if (data.state == 'online'){
            addClient(data.client, true, isMe);
        } else if(data.state == 'offline'){
            removeClient(data.client, true);
        }
    });

    // add a client to the clients list
    function addClient(client, announce, isMe) {
        if (isMe) {
            $('ul#user-list').append('<li data-clientId="'+client.clientId+'">'+client.username+' <span class="badge badge-info>Me</span></li>');
        } else {
            $('ul#user-list').append('<li data-clientId="'+client.clientId+'">'+client.username+'</li>');

            if (announce) {
                $(content).append('<strong class="text-info">'+client.username+' has connected.</strong><br />');
            }
        }
    }

    // remove a client from the clients list
    function removeClient(client, announce) {
        $('ul#user-list li[data-clientId="' + client.clientId + '"]').remove();

        // if announce is true, show a message about this room
        if (announce) {
            $(content).append('<strong class="text-info">'+client.username+' has left the room.</strong><br />');
        }
    }

    $(sendBtn).on('click', function() {
        var name = document.getElementById("name");
        var field = document.getElementById("field");
        if(name.value === "") {
            alert("Please type your name!");
        } else if (field.value !== "") {
            var text = field.value;
            writeback.push(text);
            socket.emit('send', { message: text, username: name.value, room: WaterCooler.room });
            socket.emit('connect', { username: name.value });
            field.value = '';
        }
    });

    $("#field").keyup(function(e) {
        if(e.keyCode == 13) {
            $(sendBtn).click();
        } else if(e.keyCode == 38) {
            // Get previous writebacks
        }
    });
}
