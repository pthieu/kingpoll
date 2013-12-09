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
    }, function () {
        $(this).find('label').css({'color': "#888"});
    });

    $('#newuser').submit(function(e){
        e.preventDefault();
        var posting = $.post("/signup", {
                            'u_email': $('#tbEmail').val(),
                            'u_id': $('#tbUsername').val(),
                            'u_password': $('#tbCheckPassword').val(),
                            'u_name': $('#tbName').val(),
                            'u_sex': $('input[name=gender]:checked').val(),
                            'u_team': themecolor
        }).success(function (data, status) {
            console.log(data);
            // window.location.href = data;
        });
    });
});