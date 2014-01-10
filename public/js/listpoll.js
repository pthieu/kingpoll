var socket = io.connect();

$(document).ready(function(){
    socket.emit('getlistpoll');

    socket.on('listpoll', function (poll) {
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