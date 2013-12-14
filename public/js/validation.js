$(document).ready(function() {
    var code = (window.location.href).split('/')[4];
    var tmp = colors_hex[randColor(colors_hex)];
    $('.btnSolo').css({'background-color': "#"+tmp,'border-color': "#"+tmp});
});