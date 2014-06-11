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
                                        console.log(randPollID);
                                        if(randPollID){
                                            var temp2 = (window.location.href).split('/');
                                            window.location.href = "/p/" + temp;
                                        }
                                        else{
                                            window.location.href = "/new"
                                        }
                                    });
                                }

// var checkResize = function () {
//         if($(window).width() < '750'){
//             // $('#dash').css({'height': '6rem'});
//             $('.mid').hide();
//             // $('.mid').css({'z-index', '2'});
//         }
//         else{
//             // $('#dash').css({'height': '3rem'});
//             $('.mid').show();
//             // $('.mid').css({'z-index', '2'});
//         }
// }

$(document).ready(function () {
    $('#randompoll').click(function () {
        voted = false;
    });

    socket.emit('getAuth');

    socket.on('authStatus', function (status, user) {
        var authorized = status;

        if(status) {
            document.getElementById('welcome-text').innerHTML="Welcome, " + user.id + "<b class=\"caret\">";
            document.getElementById('authorized').style.display='block';
        } else {
            document.getElementById('sign-in-list').style.display='block';
        }
    });
});