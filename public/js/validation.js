var socket = io.connect();

$(document).ready(function() {
    var code = (window.location.href).split('/')[4];
    var tmp = colors_hex[randColor(colors_hex)];
    $('.btnSolo').css({'background-color': "#"+tmp,'border-color': "#"+tmp});

    var g_id = dual.getURLParameter('g');
    var u_id = dual.getURLParameter('u');
    var v_id = dual.getURLParameter('v');
    console.log(g_id);
    console.log(u_id);
    console.log(v_id);

    socket.emit('getValidationList',{g_id:g_id, u_id:u_id, u_id:u_id});
});