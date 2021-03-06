var socket = io.connect();

//UI/UX
var solocolor = colors_soft[randColor(colors_soft)];
var sigfig = 2 * 10;

//Data settings
var count = 0;
var loadcount = 0;
var load_npolls = 20;
var sorttype = "newest";

$(document).ready(function() {
  // $('.hero').css({
  //   'background-color': '#' + solocolor
  // });
  // $('.banner-wrap *, .banner-wrap .banner:before, .banner-wrap .banner:after').css({
  //   'border-color': '#' + solocolor,
  //   'color': '#' + solocolor
  // });
  socket.emit('joinlanding');

  // var temp3 = ($(window).height() - 286) / 35;
  // loadcount = Math.ceil(temp3) + 5;
  loadpoll(load_npolls, 0, sorttype);

  socket.emit('getViewers');
  socket.emit('getUsers');
  socket.emit('getVotes');
  socket.emit('getPolls');
  var getstats_timer = setInterval(function() {
    socket.emit('getViewers');
    socket.emit('getUsers');
    socket.emit('getVotes');
    socket.emit('getPolls');
  }, 5000);

  socket.on('setViewers', function(d) {
    $('#nViewers').text(d);
  });
  socket.on('setUsers', function(d) {
    $('#nAccounts').text(d);
  });
  socket.on('setVotes', function(d) {
    $('#nVotes').text(d);
  });
  socket.on('setPolls', function(d) {
    $('#nPolls').text(d);
  });

  socket.emit('getHotPicks');
  socket.on('setHotPicks', function(d) {
    $('.hotpicks').html('');
    var colorbg = ['green', 'red', 'blue', 'purple'];
    for (var i = 0; i < d.length; i++) {
      $('.hotpicks').append([
        '<div class="hotpick ' + colorbg[i] + '">',
          '<a onclick="function(e){e.preventDefault();}" href="/p/'+d[i].p_id+'">',
            '<div class="contentwrap">',
              '<div class="logobg">',
              '</div>',
              '<div class="content">',
                '<h2>', d[i].p_total, '</h2>',
                '<h4>', d[i].p_q, '</h4>',
                // '<h4 class="p_desc">', d[i].p_desc, '</h4>',
              '</div>',
            '</div>',
          '</a>',
        '</div>'
        ].join(''));
    }
  });

  socket.on('listpoll', function(poll) {
    for (var i in poll) {
      $('#polls-wrap').append('<tr class="poll" poll-id=' + poll[i].p_id + '><td class="extras"></td><td>' + poll[i].p_q + '</td>     \
        <td>' + poll[i].p_total + '</td>    \
        <td>' + ((poll[i].s_ttotal) ? Math.round(poll[i].s_ttotal / poll[i].p_total / sigfig) * sigfig / 1000 : 0) + 's</td>    \
        <td><a href="/p/' + poll[i].p_id + '" class="btn btn-default btn-xs">Vote!</a></td>      \
        </tr>');
      var tmpdesc = (poll[i].p_desc) ? poll[i].p_desc : "User did not provide a description.";
      var th_colspan = $('thead tr td').length;
      var _embeddata = poll[i].p_embed;
      $('#polls-wrap').append('<td class="desc-wrap" colspan="' + (th_colspan + 1) + '"><div class="polldesc newpolldesc col-xs-10 col-xs-offset-1" style="display: none" poll-id=' + poll[i].p_id + " " + ((_embeddata) ? ("embed-data=\"" + _embeddata + "\"") : "") + '>' + tmpdesc + '</div></td>');
    }
    $('.polldesc.newpolldesc').each(function() {
      $(this).html("<div>" + dual.linkify($(this).html()).text + "</div>");
      $(this).removeClass('newpolldesc');
    });
    $('.poll *:not(a)').unbind("click"); //unbind click so it doesn't stack animation
    $('.poll *:not(a)').click(function() {
      $('.polldesc[poll-id=' + $(this).parent().attr('poll-id') + ']').slideToggle(100, "", function() {
        if ($(this).is(':visible') && $(this).attr('data-loaded') !== 'true') {
          if ($(this).attr("embed-data")) {
            $(this).append("<div class='embed-wrap'><div class='embed'>" + dual.embedify($(this).attr("embed-data")) + "</div></div>");
          }
          $(this).attr('data-loaded', 'true');
        }
      });
    });
    // $('#polls-wrap .btn').css({'color':'#'+solocolor});
  });

  $('.card').each(function() {
    // $(this).css({'color':'#'+colors_hex[randColor(colors_hex)]});
    $(this).css({
      'color': '#666'
    });
  });

  $(window).scroll(function() {
    if ($(window).scrollTop() === $(document).height() - $(window).height()) {
      var skip = $('.poll').length; //skip how many
      loadpoll(load_npolls, skip, sorttype);
    }
  });

  $(document).on('change', '.sel-list', function() {
    var sort = $(this).val();
    $('#polls-wrap').html('');
    switch (sort) {
      case "newest":
        sorttype = "newest"
        break;
      case "mostvotes":
        sorttype = "mostvotes"
        break;
    }
    loadpoll(load_npolls, 0, sorttype);
  });
});

function loadpoll(n, skip, sort) {
  var init;
  // socket.emit('getlistpoll', limit, count*loadcount, scroll);
  socket.emit('getlistpoll', n, skip, sort);
}
