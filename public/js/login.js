$(document).ready(function() {
  $("input.f").on("focusout", function(){
    var me = $(this);
    if(me.val() !== ""){
      me.addClass("set");
    } else {
      me.removeClass("set");
    }
  });

  var themecolor = colors_hex[randColor(colors_hex)];
  $('#submit').css({'background-color': "#"+themecolor,'border-color': "#"+themecolor});
  $('.field').hover(function () {
    $(this).find('label').css({'color': "#"+themecolor});
    $(this).find('input, label').css({'color': "#"+themecolor});
  }, function () {
    $(this).find('label').css({'color': "#888"});
    $(this).find('input, label').css({'color': "#888"});
  });
});