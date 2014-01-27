// var socket = io.connect();   //dashboard loads last so might anything that happens
                                //in the page can break if it occurs before dash load
                                //connect in individual pages for now, figure out dash
                                //loading time later

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

var checkResize = function () {
        if($(window).width() < '750'){
            // $('#dash').css({'height': '6rem'});
            $('.mid').hide();
            // $('.mid').css({'z-index', '2'});
        }
        else{
            // $('#dash').css({'height': '3rem'});
            $('.mid').show();
            // $('.mid').css({'z-index', '2'});
        }
}

$(document).ready(function () {

});