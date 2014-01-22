// var socket = io.connect();   //don't really need this. 
                                //they're connecting on the main page already, 
                                //although might want to change it over to dashboard later.

function randomPoll() {
    var page = (window.location.href).split('/')[3];

    if (page === 'p' ) {
        $('#question').html("Getting poll, please wait...");
        $('#tbDescription').hide();
        socket.emit('getRandPoll', true);
    } else {
        socket.emit('getRandPoll', false);
    }

    socket.on('randPollID', function (randPollID) {
        var temp = randPollID;
        var temp2 = (window.location.href).split('/');
        window.location.href = "/p/" + temp;
    });
}

$(document).ready(function () {
    // $('.menu-btn').click(function () {
    //     $('#nav-wrap').slideToggle(50);
    // });
setTimeout(function () {
    $('#nav').slicknav({
        label: '',
        prependTo: '#nav-wrap',
        duration:100
    });
}, 500);  
});