$(document).ready(function() {
    var mult = 0.00;
    $("input.f").on("focusout", function(){
      var me = $(this);
      if(me.val() !== ""){
        me.addClass("set");
      } else {
        me.removeClass("set");
      }
    });
    //multiplier increment
    $(".addmult>.field>.mult").on("change keyup mouseup", function(){
        var mult = 0;
        if($('input[name="name"]').val()) {
            mult += 5;
        }
        if($('input[name="gender"]:checked').val()) {
            mult += 5;
        }
        if($('input[name="birth"]').val()) {
            mult += 5;
        }
        $('#mult').html("Multiplier:<br/>"+"+"+mult+"%");
    });
    $('input[name="gender"]');

    var themecolor = colors_hex[randColor(colors_hex)];
    $('#submit').css({'background-color': "#"+themecolor,'border-color': "#"+themecolor});
    $('.field').hover(function () {
        $(this).find('label').css({'color': "#"+themecolor});
        $(this).find('input, label').css({'color': "#"+themecolor});
    }, function () {
        $(this).find('label').css({'color': "#888"});
        $(this).find('input, label').css({'color': "#888"});
    });

    $('input[type=password]').on('change keydown keypress keyup', function() {
        if($('#tbPassword').val() !== $('#tbCheckPassword').val()){
            $('#tbPassword, #tbCheckedPassword').each(function() {
                this.setCustomValidity("Passwords do not match!");
            });
        }else{
            $('#tbPassword, #tbCheckedPassword').each(function() {
                this.setCustomValidity("");
            });
        }

    });

    $('#tbUsername').on('change keydown keypress keyup', function () {
        if(!($(this).val().match(/[^A-z0-9 _]/) || $(this).val().length < 1 || $(this).val().length > 20)){
            this.setCustomValidity("");
        }
        else{
            this.setCustomValidity("1-20 characters, no special characters, letters, numbers, and _ only!");
        }
    });

    $('#tbBirth').on('mousedown',function () {
        $(this).datepicker({
            dateFormat: "dd/mm/yy",
            yearRange: "-100:+0",
            changeMonth: true,
            changeYear: true,
            dialog: [50, 50]
        });
    });

    $('#newuser').submit(function(e){
        e.preventDefault();

        var post_email = $('#tbEmail').val();
        var post_uid = $('#tbUsername').val();
        var post_password = $('#tbCheckPassword').val();
        var post_name = $('#tbName').val();
        var post_sex = $('input[name=gender]:checked').val();
        var post_team = themecolor;

        /*var posting = $.post("/signup", {'req':{
                            'u_email': $('#tbEmail').val(),
                            'u_id': $('#tbUsername').val(),
                            'u_password': $('#tbCheckPassword').val()},
                            'add':{'u_name': $('#tbName').val(),
                            'u_sex': $('input[name=gender]:checked').val(),
                            'u_team': themecolor}}
            ).success(function (data, status) {
            console.log(data);
            window.location.href = data;
        });*/

        var posting = $.ajax({
        url: '/signup',
        type: 'POST',
        data:{
                'u_email': post_email,
                'u_id': post_uid,
                'u_email': post_email,
                'u_password': post_password,
                'u_name': post_name,
                'u_sex': post_sex,
                'u_team': post_team
        },
            dataType: "html"
        }).done(function (data) {
            window.location.href = data;
        }).fail(function (data) {
            switch(data.responseText){
                case 'c_n length does not match':
                    alert('Please fill all visible textboxes with text and choose a color!');
                    break;
            }
        });
    });
});