var socket = io.connect();
var _fp = new Fingerprint();
var u_email = window.location.search.replace('?email=','');

$(document).ready(function() {

  // var mult = 0.00;
  $("input.f").on("focusout", function(){
    var me = $(this);
    if(me.val() !== ""){
    me.addClass("set");
    } else {
    me.removeClass("set");
    }
  });

  //multiplier increment
  // $(".addmult>.field>.mult").on("change keyup mouseup", function(){
  //     var mult = 0;
  //     if($('input[name="name"]').val()) {
  //         mult += 5;
  //     }
  //     if($('input[name="gender"]:checked').val()) {
  //         mult += 5;
  //     }
  //     if($('input[name="birth"]').val()) {
  //         mult += 5;
  //     }
  //     $('#mult').html("Multiplier:<br/>"+"+"+mult+"%");
  // });
  // $('input[name="gender"]');

  var themecolor = colors_hex[randColor(colors_hex)];
  $('#submit').css({'background-color': "#"+themecolor,'border-color': "#"+themecolor});
  // $('.field').hover(function () {
  //   $(this).find('label').css({'color': "#"+themecolor});
  //   $(this).find('input, label').css({'color': "#"+themecolor});
  // }, function () {
  //   $(this).find('label').css({'color': "#888888"});
  //   $(this).find('input, label').css({'color': "#888888"});
  // });

  $('input[type=password]').on('change keydown keypress keyup', function() {
    if($('#tbPassword').val() !== $('#tbCheckPassword').val()){
      $('#tbPassword, #tbCheckedPassword').each(function() {
        this.setCustomValidity("Passwords do not match!");
      });
    }
    else{
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
      dateFormat: "M dd, yy",
      yearRange: "-100:+0",
      changeMonth: true,
      changeYear: true,
      dialog: [50, 50]
    });
  });

  //if directed here with search param
  if(!!u_email) var tmp = $('#tbEmail').val(u_email).mouseover().addClass('set').mouseleave();

  $('#tbEmail').on('focusout', function () {
    socket.emit('checkSignupEmail', $('#tbEmail').val());
  });
  $('#tbUsername').on('focusout', function () {
    socket.emit('checkSignupUID', $('#tbUsername').val());
  });
  socket.on('checkSignup_RES', function (res) {
    var lblEmail = $('label[for="tbEmail"]');
    var lblUID = $('label[for="tbUsername"]');
    switch(res){
      case 'emailexists':
        lblEmail.text('Email - Email already exists!').css('color', 'red');
        break;
      case 'uidexists':
        lblUID.text('Username - Username already exists!').css('color', 'red');
        break;
      case 'emailok':
        lblEmail.text('Email').css('color', '#888888');
        break;
      case 'uidok':
        lblUID.text('Username').css('color', '#888888');
        break;
      default:
        lblEmail.text('Email').css('color', '#888888');
        lblUID.text('Username').css('color', '#888888');
        break;
    }
  });

  $('#newuser').submit(function(e){
    e.preventDefault();

    var post_fp = _fp.get();
    var post_email = $('#tbEmail').val();
    var post_uid = $('#tbUsername').val();
    var post_password = $('#tbCheckPassword').val();
    var post_name = $('#tbName').val();
    var post_sex = $('input[name=gender]:checked').val();
    var post_bday = $('#tbBirth').val();
    var post_team = themecolor;

    var post_arrIMG = makeShare(post_uid);

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
        'u_fp': post_fp,
        'u_email': post_email,
        'u_password': post_password,
        'u_name': post_name,
        'u_sex': post_sex,
        'u_birth': post_bday,
        'u_team': post_team,
        'arrIMG': post_arrIMG
    },
      dataType: "html"
    }).done(function (data) {
      dual.setLocalVar('u_email', '');
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