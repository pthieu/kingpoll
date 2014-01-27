var socket = io.connect();

//UI/UX
var chart_solocolor = colors_hex[randColor(colors_hex)];

//Data settings
var count = 0;
var loadcount = 0;

$(document).ready(function(){
    socket.emit('joinlanding');

    var temp3 = ($(window).height() - 286) / 35;
    loadcount = Math.ceil(temp3) + 5;
    loadpoll(loadcount, count, true);

    socket.on('listpoll', function (poll) {
        for(var i in poll){
            $('#polls-wrap').append('<div class="poll" poll-id='+poll[i].p_id+'><span>'+poll[i].p_q+'</span><span>'+poll[i].p_total+'</span></div>');
            var tmpdesc = (poll[i].p_desc) ? poll[i].p_desc : "Description not available."
            $('#polls-wrap').append('<div class="polldesc" style="display: none" poll-id='+poll[i].p_id+'><span>'+tmpdesc+'</span></div>');
        }
        $('.poll').click(function () {
            $('.polldesc[poll-id='+$(this).attr('poll-id')+']').slideToggle(100);
        });
    });

    $('.card').each(function () {
        $(this).css({'background-color':'#'+colors_hex[randColor(colors_hex)]});
    });

});

function loadpoll(limit, count, scroll) {
    var init;
    socket.emit('getlistpoll', limit, count*loadcount, scroll);
}