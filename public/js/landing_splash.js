var socket = io.connect();
var _fp = new Fingerprint();

$(function () {
	$('#signup').submit(function(e){
        e.preventDefault();

        var post_fp = _fp.get();
        var post_email = $('#tbEmail').val();
        var post_uid = $('#tbUsername').val();
        var post_password = $('#tbCheckPassword').val();

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
                'u_password': post_password,
                'u_name': null,
                'u_sex': null,
                'u_birth': null,
                'u_team': null
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
})