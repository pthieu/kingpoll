var socket = io.connect();

//UI/UX
var solocolor = colors_hex[randColor(colors_hex)];

//Data settings
var count = 0;
var loadcount = 0;

$(document).ready(function(){
    socket.emit('joinlanding');

    var temp3 = ($(window).height() - 286) / 35;
    loadcount = Math.ceil(temp3) + 5;
    loadpoll(loadcount, count, true);
        
    socket.emit('getViewers');
    socket.emit('getUsers');
    socket.emit('getVotes');
    socket.emit('getPolls');
    var getstats_timer = setInterval(function () {
        socket.emit('getViewers');
        socket.emit('getUsers');
        socket.emit('getVotes');
        socket.emit('getPolls');
    }, 5000);

    socket.on('setViewers', function (d) {
        $('#nViewers').text(d);
    });
    socket.on('setUsers', function (d) {
        $('#nAccounts').text(d);
    });
    socket.on('setVotes', function (d) {
        $('#nVotes').text(d);
    });
    socket.on('setPolls', function (d) {
        $('#nPolls').text(d);
    });

    socket.on('listpoll', function (poll) {
        for(var i in poll){
            $('#polls-wrap').append('<tr class="poll" poll-id='+poll[i].p_id+'><td class="extras"></td><td>'+poll[i].p_q+'</td>     \
                <td>'+poll[i].p_total+'</td>    \
                <td>'+Math.round(poll[i].s_tavg)/1000+'s</td>    \
                <td><a href="/p/'+poll[i].p_id+'" class="btn btn-default btn-xs">Go!</a></td>      \
                </tr>');
            var tmpdesc = (poll[i].p_desc) ? poll[i].p_desc : "Poll King did not provide a description.";
            var th_colspan = $('thead tr td').length;
            $('#polls-wrap').append('<td colspan="'+(th_colspan+1)+'" style="display:none"><div class="polldesc" style="display: none" poll-id='+poll[i].p_id+'>'+tmpdesc+'</div></td>');
        }
        $('.poll *:not(a)').click(function () {
            $('.polldesc[poll-id='+$(this).parent().attr('poll-id')+']').parent().slideToggle(100);
            $('.polldesc[poll-id='+$(this).parent().attr('poll-id')+']').slideToggle(100);
        });
        // $('#polls-wrap .btn').css({'color':'#'+solocolor});
        // $('#polls-wrap .btn').css();
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