var socket = io.connect();

//UI/UX
var solocolor = colors_hex[randColor(colors_hex)];
var sigfig = 2*10;

//Data settings
var count = 0;
var loadcount = 0;
var load_npolls = 20;

$(document).ready(function(){
    socket.emit('joinlanding');

    // var temp3 = ($(window).height() - 286) / 35;
    // loadcount = Math.ceil(temp3) + 5;
    loadpoll(load_npolls, 0, true);
        
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
                <td>'+((poll[i].s_ttotal)?Math.round(poll[i].s_ttotal/poll[i].p_total/sigfig)*sigfig/1000:0)+'s</td>    \
                <td><a href="/p/'+poll[i].p_id+'" class="btn btn-default btn-xs">Go!</a></td>      \
                </tr>');
            var tmpdesc = (poll[i].p_desc) ? poll[i].p_desc : "User did not provide a description.";
            var th_colspan = $('thead tr td').length;
            var _embeddata = poll[i].p_embed;
            $('#polls-wrap').append('<td class="desc-wrap" colspan="'+(th_colspan+1)+'"><div class="polldesc col-xs-10 col-xs-offset-1" style="display: none" poll-id='+poll[i].p_id+" "+((_embeddata)?("embed-data=\""+_embeddata+"\""):"")+'>'+tmpdesc+'</div></td>');
        }
        $('.polldesc').each(function () {
            $(this).html("<div>"+dual.linkify($(this).html()).text+"</div>")
        });
        $('.poll *:not(a)').unbind( "click" ); //unbind click so it doesn't stack animation
        $('.poll *:not(a)').click(function () {
            $('.polldesc[poll-id='+$(this).parent().attr('poll-id')+']').slideToggle(100,"",function () {
                if ($(this).is(':visible') && $(this).attr('data-loaded') !== 'true'){
                    if($(this).attr("embed-data")){
                        $(this).append("<div class='embed-wrap'><div class='embed'>"+dual.embedify($(this).attr("embed-data"))+"</div></div>");
                    }
                    $(this).attr('data-loaded','true');
                }
            });
        });
        // $('#polls-wrap .btn').css({'color':'#'+solocolor});
    });

    $('.card').each(function () {
        // $(this).css({'color':'#'+colors_hex[randColor(colors_hex)]});
        $(this).css({'color':'#666'});
    });

    $('#notes h4').click(function () {
        $(this).parent().find('span').slideToggle(100);
    })

    $(window).scroll(function(){
        if  ($(window).scrollTop() === $(document).height() - $(window).height()){
            var n = $('.poll').length;
            socket.emit('getlistpoll', load_npolls, n);
        }
    }); 
});

function loadpoll(n, skip, scroll) {
    var init;
    // socket.emit('getlistpoll', limit, count*loadcount, scroll);
    socket.emit('getlistpoll', n, skip);
}