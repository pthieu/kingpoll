var socket = io.connect();
var tmp = colors_hex[randColor(colors_hex)];
var date;

$(document).ready(function() {
    var code = (window.location.href).split('/')[4];
    $('.btnSolo').css({'background-color': "#"+tmp,'border-color': "#"+tmp});

    var g_id = dual.getURLParameter('g');
    var u_id = dual.getURLParameter('u');
    var v_id = dual.getURLParameter('v');

    socket.emit('getValidationList',{'g_id':g_id, 'u_id':u_id, 'u_id':u_id});
    socket.on('setVoteGroup', function (_data) {
    	var v_date = new Date(_data.vote.v_date);
    	$('.validation-list').append(
    		'<tr>'+
    		'<td class="right-align"><a href="/p/'+_data.poll.p_id+'" target="_blank">'+_data.poll.p_q+'</a></td>'+
    		'<td>'+_data.vote.v_text+'</td>'+
    		'<td class="cb" data-valgroup="'+_data.vote.v_valid+'"><input type="radio" id="'+_data.poll.p_id+'-verify" class="radio-cb" name="'+_data.vote._id+'" value="verify" checked/>'+
            '<label for="'+_data.poll.p_id+'-verify" class="radio-cb-label"></label></td>"'+
            '<td class="cb" data-valgroup="'+_data.vote.v_valid+'"><input type="radio" id="'+_data.poll.p_id+'-delete" class="radio-cb" name="'+_data.vote._id+'" value="delete" />'+
            '<label for="'+_data.poll.p_id+'-delete" class="radio-cb-label"></label></td>"'+
    		'<td>'+v_date+'</td>'+
    		'</tr>'
		);
		if(_data.vote.v_date){date=_data.vote.v_date}
		$('.radio-cb-label').css({'color': "#"+tmp,'border-color': "#"+tmp});
    });

    $.fn.chainer = function(cb) {
        return this.queue(function(next) {
            // do a bunch of stuff with the text var
            cb();
            next();
        });
    }
    $('.submit').submit(function(e) {
        e.preventDefault();
        var postdata = {};
        $({})
            .chainer(function () {
                $('.cb input:checked').each(function () {
                    postdata[$(this).attr('name')] = $(this).val();
                });
            })
            .chainer(function () {
                var POST = $.ajax({
                    url: '/validateVote',
                    type: 'POST',
                    data: postdata,
                    dataType: "html"
                }).done(function (data) {
                    window.location.href = data;
                }).fail(function (data) {
                    switch(data.responseText){
                        case '':
                            break;
                    }
                });
            })
    });
});