$(document).ready(function() {
    $("input.f").on("focusout", function(){
      var me = $(this);
      if(me.val() !== ""){
        me.addClass("set");
      } else {
        me.removeClass("set");
      }
    });
});