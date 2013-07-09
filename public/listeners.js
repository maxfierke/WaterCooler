$(window).on('resize', function () {
    //vpw = $(window).width();
    vph = $(window).height();
    $('#content').css({'height': (vph-90) + 'px'});
});

$(window).resize();

var writeback = [];
var socket = io.connect('http://localhost:3700');
var field = document.getElementById("field");
var sendBtn = document.getElementById("send");
var content = document.getElementById("content");
var name = document.getElementById("name");

socket.on('connect', function () {
    if ($(content).text() != '') {
        $(content).append('<strong class="text-success">Connection Success!</strong><br />');
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

$(sendBtn).on('click', function() {
    var name = document.getElementById("name");
    var field = document.getElementById("field");
    if(name.value === "") {
        alert("Please type your name!");
    } else if (field.value !== "") {
        var text = field.value;
        writeback.push(text);
        socket.emit('send', { message: text, username: name.value });
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
