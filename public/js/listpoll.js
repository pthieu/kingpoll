var socket = io.connect();
var count = 0;
var loadcount = 0;

$(document).ready(function(){
    var temp3 = ($(window).height() - 286) / 35;
    loadcount = Math.ceil(temp3) + 5;
    loadpoll(loadcount, count, true);
});

$('#poll-filter').keyup(function() {
    filter(this); 
});

function filter(element) {

    //filter for the list poll view
    //this will hide all the li items that don't match the user's input
    var value = $(element).val().toLowerCase();
    $("#view-poll-list > tr").each(function () {
        if ($(this).text().toLowerCase().indexOf(value) > -1) {
            $(this).show();
        } else {
            $(this).hide();
        }

    });
}

$(window).scroll(function(){
    if  ($(window).scrollTop() === $(document).height() - $(window).height()){

        count = count + 1;

        loadpoll(20, count, false);
    }
}); 

function loadpoll(limit, count, scroll) {
    var init;
    socket.emit('getlistpoll', limit, count*loadcount, scroll);

    if (scroll) { 
        init = 'listpoll';
    } else {
        init = 'initlistpoll';
    }

    socket.on(init, function (poll) {
        if (poll.length != 0){

            $('#searching').hide();

            var source = $("#list-poll-item").html();
            var pollItemTemplate = Handlebars.compile(source);

            poll.forEach(function(entry) {
                //use template from view-poll-list and populate the view with 
                //all the polls returned
                $('#view-poll-list').append(pollItemTemplate(entry));
            });
        } else {
            $('#searching').text("Sorry, No Polls Found!!");
        }
    });
}