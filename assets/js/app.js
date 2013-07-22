/**
 * app.js
 *
 * This file contains some conventional defaults for working with Socket.io + Sails.
 * It is designed to get you up and running fast, but is by no means anything special.
 *
 * Feel free to change none, some, or ALL of this file to fit your needs!
 */

$(window).on('resize', function () {
    //vpw = $(window).width();
    vph = $(window).height();
    $('#content').css({'height': (vph-90) + 'px'});
});

$(window).resize();

var field = document.getElementById("field");
var sendBtn = document.getElementById("send");
var content = document.getElementById("content");

$(field).focus();

if(WaterCooler) {
    (function (io) {

        // as soon as this file is loaded, connect automatically,
        var socket = io.connect();
        if (typeof console !== 'undefined') {
            log('Connecting to WaterCooler server...');
        }

        socket.on('connect', function socketConnected() {
            log('Socket connected');
            if ($(content).text() != '') {
                $(content).append('<strong class="text-success">Connection Success!</strong><br />');
            }
            socket.get('/room/'+WaterCooler.room, function (room) {
                $(content).append('<strong class="text-info">Welcome to '+room.name+'!</strong><br />');
                $(content).append('<p class="text-info">'+room.description+'</p>');
            });
            socket.get('/room/'+WaterCooler.room+'/subscribers', WaterCooler.handler.clientList);
        });

        socket.on('message', function(response) {
            WaterCooler.handler.messageReceived(response.data, content);
        });

        socket.on('presence', function(data) {
            isMe = (data.user.id === activeUser.id ? true : false);
            if (data.state == 'online'){
                WaterCooler.handler.clientAdd(data.user, true, isMe);
            } else if(data.state == 'offline'){
                WaterCooler.handler.clientRemove(data.user, true);
            }
        });

        socket.on('disconnect', function socketDisconnected() {
            $(content).append('<strong class="text-error">Connection Lost! I\'ll try to reconnect...</strong><br />');
            $(content).scrollTop(content.scrollHeight);
        });



        // Expose connected `socket` instance globally so that it's easy
        // to experiment with from the browser console while prototyping.
        window.socket = socket;

        // Simple log function to keep the example simple
        function log() {
            if (typeof console !== 'undefined') {
                console.log.apply(console, arguments);
            }
        }

        $(sendBtn).on('click', function sendMessage(e) {
            e.preventDefault();
            var field = document.getElementById("field");
            if (field.value !== "") {
                socket.post('/room/'+WaterCooler.room+'/message/create', { message: field.value }, function (response) {
                    WaterCooler.handler.messageReceived(response, content);
                    field.value = '';
                });
            }
        });

        $("#field").keyup(function(e) {
            if(e.keyCode == 13) {
                $(sendBtn).click();
            } else if(e.keyCode == 38) {
                // Get previous writebacks
            }
        });

        $("#control-form").submit(function (e) {
            e.preventDefault();
            $(sendBtn).click();
        });

    })(window.io);
}
