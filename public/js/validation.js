var socket = io.connect();
var tmp = colors_hex[randColor(colors_hex)];

$(document).ready(function() {
    var code = (window.location.href).split('/')[4];
    $('.btnSolo').css({'background-color': "#"+tmp,'border-color': "#"+tmp});

    var g_id = dual.getURLParameter('g');
    var u_id = dual.getURLParameter('u');
    var v_id = dual.getURLParameter('v');
    console.log(g_id);
    console.log(u_id);
    console.log(v_id);

    socket.emit('getValidationList',{'g_id':g_id, 'u_id':u_id, 'u_id':u_id});
    socket.on('setVoteGroup', function (_data) {
    	var v_date = $.now();
    	$('.validation-list').append(
    		'<tr>'+
    		'<td class="right-align"><a href="/p/'+_data.poll.p_id+'" target="_blank">'+_data.poll.p_q+'</a></td>'+
    		'<td>'+_data.vote.v_text+'</td>'+
    		'<td class="cb" data-valgroup="'+_data.vote.v_valid+'"><input type="radio" id="'+_data.poll.p_id+'-verify" class="radio-cb" name="'+_data.poll.p_id+'" checked/>'+
            '<label for="'+_data.poll.p_id+'-verify" class="radio-cb-label"></label></td>"'+
            '<td class="cb" data-valgroup="'+_data.vote.v_valid+'"><input type="radio" id="'+_data.poll.p_id+'-delete" class="radio-cb" name="'+_data.poll.p_id+'"/>'+
            '<label for="'+_data.poll.p_id+'-delete" class="radio-cb-label"></label></td>"'+
    		'<td>'+v_date+'</td>'+
    		'</tr>'
		);
		$('.radio-cb-label').css({'color': "#"+tmp,'border-color': "#"+tmp});
    });
});