var socket = io.connect();

var solocolor;

$(function() {
  solocolor = colors_hex[randColor(colors_hex)];
  $('#submit').css({
    'background-color': "#" + solocolor,
    'border-color': "#" + solocolor
  }).data('color', '#' + solocolor);

  $('#submit').hover(function(e) {
    var tmpcolor = $(this).data('color');
    $(this).css("background-color", (e.type === "mouseenter") ? "#ffffff" : tmpcolor);
    $(this).css("color", (e.type === "mouseenter") ? tmpcolor : "#ffffff");
  });

  $('#contact_form').submit(function(data) {
    e.preventDefault();

    var posting = $.ajax({
      url: '/contact',
      type: 'POST',
      data: $("#contact_form").serialize(),
      dataType: "html"
    }).done(function(data) {
      window.location.href = data;
    }).fail(function(data) {
      window.location.href = '/home';
    });
  });
});
