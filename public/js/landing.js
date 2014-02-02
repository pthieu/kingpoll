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
            $('#polls-wrap').append('<tr class="poll" poll-id='+poll[i].p_id+'><td>'+poll[i].p_q+'</td>     \
                <td>'+poll[i].p_total+'</td>    \
                <td>'+poll[i].s_tavg/1000+'s</td>    \
                <td><a href="/p/'+poll[i].p_id+'">Go!</a></td>      \
                </tr>');
            var tmpdesc = (poll[i].p_desc) ? poll[i].p_desc : "Description not available."
            var th_colspan = $('thead tr td').length;
            $('#polls-wrap').append('<td colspan="'+th_colspan+'" style="display:none"><div class="polldesc" style="display: none" poll-id='+poll[i].p_id+'>'+tmpdesc+'</div></td>');
        }
        $('.poll *:not(a)').click(function () {
            $('.polldesc[poll-id='+$(this).parent().attr('poll-id')+']').parent().slideToggle(100);
            $('.polldesc[poll-id='+$(this).parent().attr('poll-id')+']').slideToggle(100);
        });
    });

    $('.card').each(function () {
        // $(this).css({'color':'#'+colors_hex[randColor(colors_hex)]});
        $(this).css({'color':'#666'});
    });

});

function loadpoll(limit, count, scroll) {
    var init;
    socket.emit('getlistpoll', limit, count*loadcount, scroll);
}