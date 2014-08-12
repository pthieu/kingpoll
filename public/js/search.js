var socket = io.connect();

$(document).ready(function(){
    var searchKey = gup('spoll');
    socket.emit('searchpoll', searchKey);

    if (searchKey != "") {
        socket.on('listsearchpoll', function (poll) {
            if (poll.results.length != 0){

                $('#searching').hide();

                var pollitems = poll.results;
                var source = $("#list-poll-item").html();
                var pollItemTemplate = Handlebars.compile(source);

                pollitems.forEach(function(entry) {
                    //use template from view-poll-list and populate the view with 
                    //all the polls returned
                    $('#view-poll-list').append(pollItemTemplate(entry.obj));
                });
            } else {
                $('#searching').text("No polls found.");
            }
        });
    } else {
        $('#searching').text("Please enter a search value!");
    }
});

$('#search-filter').keyup(function() {
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

function gup (name) {
  name = RegExp ('[?&]' + name.replace (/([[\]])/, '\\$1') + '=([^&#]*)');
  return (window.location.href.match (name) || ['', ''])[1];
}

$(window).scroll(function(){
    if  ($(window).scrollTop() == $(document).height() - $(window).height()){
    }
}); 