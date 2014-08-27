var socket = io.connect();
var _fp = new Fingerprint();

$(function() {
  // $('input[type=password]').on('change keydown keypress keyup', function() {
  //   if ($('#tbPassword').val() !== $('#tbCheckPassword').val()) {
  //     $('#tbPassword, #tbCheckedPassword').each(function() {
  //       this.setCustomValidity("Passwords do not match!");
  //     });
  //   } else {
  //     $('#tbPassword, #tbCheckedPassword').each(function() {
  //       this.setCustomValidity("");
  //     });
  //   }
  // });
  

  $('#signup').submit(function(e) {
    e.preventDefault();
    // var post_fp = _fp.get();
    var post_email = $('#tbEmail').val();
    window.location.href = '/signup?email='+post_email;
    // var post_uid = $('#tbUsername').val();
    // var post_password = $('#tbCheckPassword').val();

    // var post_arrIMG = makeShare(post_uid);

    // var posting = $.ajax({
    //   url: '/signup',
    //   type: 'POST',
    //   data: {
    //     'u_email': post_email,
    //     'u_id': post_uid,
    //     'u_fp': post_fp,
    //     'u_password': post_password,
    //     'u_name': null,
    //     'u_sex': null,
    //     'u_birth': null,
    //     'u_team': null,
    //     'arrIMG' = post_arrIMG;
    //   },
    //   dataType: "html"
    // }).done(function(data) {
    //   dual.setLocalVar('u_email', '');
    //   window.location.href = data;
    // }).fail(function(data) {
    //   switch (data.responseText) {
    //     case 'c_n length does not match':
    //       alert('Please fill all visible textboxes with text and choose a color!');
    //       break;
    //   }
    // });
  });
});