var socket = io.connect();

$(document).ready(function(){
    $('.header').each(function() {
        $(this).css({'border-color': '#'+colors_hex[randColor(colors_hex)]});
    });
    // var usertimer = setInterval(function(){
    //     $('#u_count').text(parseInt($('#u_count').text()) + (Math.random() < 0.5 ? (parseInt($('#u_count').text()) <= 0 ? 1 : -1) : 1)*Math.round(Math.random()*5));
    // }, 1000);
    // var polltimer = setInterval(function(){
    //     $('#p_count').text(parseInt($('#p_count').text()) + Math.floor(Math.random()*5));
    // }, 1000);
    // var feedtimer = setInterval(function(){
    //     $('#polls').prepend("<span>feed"+Math.floor(Math.random()*10)+"<span>c1 c2</span></span>");
    //     $('#feed span:nth-child(11)').remove();
    // }, 5000);
});