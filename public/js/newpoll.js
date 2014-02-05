var socket = io.connect();

$(document).ready(function() {
    // create #options based on max num
    var nchoice_max = $('.nchoice label').length;
    var nchoice_pick;
    var c_random = 0;
    //check max choices, insert questionbox and color options
    for(i=0; i<=nchoice_max; i++){
        var add;
        add = ("<div><input type='text' id='c" + (i+1) + "' name='textchoice' maxlength='40'/>");
        for(j=0; j<colors_hex.length; j++){
            var cc_id = "c" + (i+1) + "_color" + j;
            var cc_class = colors_name[j];
            add+=("<input type='radio' id='" + cc_id + "' class='colorchoice' name='c" + (i+1) + "_color' data-previewbtn='c" +(i+1)+ "' value='" +colors_hex[j]+ "'\\>" + "<label for='"+cc_id+"' class='colorchoice-label "+cc_class+"'></label>");
        }
        $('#textchoice').append(add+"</div>");
    }
    $('#textchoice').append("<label class='radio' id='rngclr'>Random!</label>");
    $('#rngclr').mousedown(function() {
        c_random++;
        rngcolors();
    });

    var tmp = colors_hex[randColor(colors_hex)];
    $('input[name="template_choice"] + label').css({'background-color': "#"+tmp,'border-color': "#"+tmp});
    tmp = colors_hex[randColor(colors_hex)];
    $('#rngclr').css({'background-color': "#"+tmp,'border-color': "#"+tmp});
    tmp = colors_hex[randColor(colors_hex)];
    $('#submit').css({'background-color': "#"+tmp,'border-color': "#"+tmp});
    var tmp_nc = colors_hex[randColor(colors_hex)];
    $('input[name="nchoice"] + label').css({'background-color': "#"+tmp_nc,'border-color': "#"+tmp_nc});
    //random colors for check boxes
    $('.radio-cb-label').each(function(){
        $(this).css({'border-color':'#'+colors_hex[randColor(colors_hex)]});
    });
    //click on nchoice, hide/show questionbox & color options
    $('input[name="nchoice"]').click(function(){
        if($(this).prop('disabled') === false){
            nchoice_pick = parseInt($(this).data('text'));
            $('#textchoice div:gt('+(nchoice_pick-1)+')').fadeOut('fast');
            $('#textchoice div:lt('+nchoice_pick+')').fadeIn('fast');
            $('#rngclr').css("visibility","visible");
            // $('input[name="textchoice"]:visible').attr('required', true);
            // setTimeout(function () {
            //     $('input[name="textchoice"]:hidden').removeAttr('required');
            // }, 300);
            rngcolors();
        }
    });
    //adds the preview buttons
    //this removes all preview buttons, then adds then again
    $('input[name="nchoice"]').click(function() {
            $('#preview div *').remove();
            for (i=0; i<nchoice_pick; i++){
            $('#preview .radio').append('<input id="preview_c'+ (i+1) +'" type="radio" name="preview_btn" /><label for="preview_c'+ (i+1) +'" class="grey"><div><div>'+$('#c'+(i+1)).val()+'</div></div></label>');
        }
        preview_colors();
    });
    $('input[name=template_choice]').click(function() {
        // $('#custom_question').val('');
        // $('#preview_question').text('');
    });
    //yes/no option, change text box
    $('#template1').click(function() {
        $('#yesno').fadeIn('fast');
        $('#simple').fadeOut('fast');
        $('#custom').fadeIn('fast');
        //set values first or text boxes won't 
        $('#c1').val('Yes');
        $('#c2').val('No');
        //click this first, because everytime it clicks, it recreates 
        //the buttons and greys out everything
        $('#nchoice2, label[for="nchoice2"]').click();
        //select yes/no for color
        $('#c1_color3').click();
        $('#c2_color0').click();
        $('#textchoice input[type="text"]').attr('disabled',"true");
        // $('#textchoice input[type="text"]').attr('readonly',"readonly");
        $('#textchoice input[type="radio"]').attr('disabled',"true");
        preview_colors();
        // $('#question').val('');
        //disable other nchoices
        $('input[name="nchoice"]').attr('disabled','disabled');
        //uncheck simple q's
        $('input[name="cb"]').each(function() {
            $(this).prop('checked', false);
        });
        //grey out other options
        $('.nchoice-label:gt(0)').css({'background-color': '#ddd'});
    });
    $('#template2').click(function() {
        $('#yesno').fadeOut('fast');
        $('#simple').fadeIn('fast');
        $('#custom').fadeOut('fast');
        $('#textchoice input[type="text"]').removeAttr('disabled');
        $('#textchoice input[type="radio"]').removeAttr('disabled');
        $('input[name="nchoice"]').removeAttr('disabled');
        //bring option color back
        $('.nchoice-label:gt(0)').css({'background-color': '#'+tmp_nc});
    });
    $('#template3').click(function() {
        $('#yesno').fadeOut('fast');
        $('#simple').fadeOut('fast');
        $('#custom').fadeIn('fast');
        $('#textchoice input[type="text"]').removeAttr('disabled');
        $('#textchoice input[type="radio"]').removeAttr('disabled');
        $('input[name="nchoice"]').removeAttr('disabled');
        //uncheck simple q's
        $('input[name="cb"]').each(function() {
            $(this).prop('checked', false);
        });
        //bring option color back
        $('.nchoice-label:gt(0)').css({'background-color': '#'+tmp_nc});
    });
    $('#template1').click();
    $('#template3').click();
    //autochange button text when typing
    $('#textchoice input[type="text"]').on('input', function() {
        $('label[for="preview_'+$(this).attr('id')+'"] div div').text($(this).val());
    });
    //change button color
    $('.colorchoice').click(function() {
        preview_colors();
    });
    //change preview text
    $('#custom_question').on('input', function() {
        $('#preview_question').text($(this).val());
    });
    $('#prvw_tbDescription').hide();
    $('#tbDescription').on('input', function() {
        //slideup/down desc. position of val important for smooth animation
        if($(this).val().length <= 0){
            $('#prvw_tbDescription').slideUp('fast');
        }
        else{
            $('#prvw_tbDescription').slideDown('fast');
        }
        $('#prvw_tbDescription').html(dual.linkify($(this).val()));
    });
    // grab which simple choice selected
    $('.radio-cb').click(function() {
        $('#preview_question').text($('.radio-cb:checked + label').text());
    });

    $('textarea, input').on('change keydown keypress keyup',function() {
        $(this).next().find('span').text("Left: "+($(this).attr('maxlength')-$(this).val().length));
    });

    //submit
    $('#newpoll').submit(function(e) {
        e.preventDefault();
        //get local storage/cookie
        post_uid = localStorage.getItem('u_id');
        post_email = localStorage.getItem('u_email');
            // Get some values from elements on the page:
            var form = $(this);
            var post_email, // grab this from button press
                post_template,
                post_nchoice,
                post_question,
                post_text,
                post_color,
                post_description;
            //make anon checkbox
            post_template = form.find("input[name='template_choice']:checked").val();
            post_nchoice = form.find("input[name='nchoice']:checked").val();
            post_question = $("#custom_question").val();
            post_description = $("#tbDescription").val();
            var post_textchoice = [];
            for (i=0; i<post_nchoice; i++){
                post_text = form.find("input[id='c"+(i+1)+"']").val();
                post_color = form.find("input[name='c"+(i+1)+"_color']:checked").val();
                post_textchoice.push({'c_text':post_text, 'c_hex':post_color});
            }
            var posting = $.ajax({
                url: '/new',
                type: 'POST',
                data:{
                        'template_choice': post_template,
                        'u_id': post_uid,
                        'u_email': post_email,
                        'c_n': post_nchoice,
                        'textchoice': post_textchoice,
                        'c_random': c_random,
                        'p_q': post_question,
                        'p_desc': post_description
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

function preview_colors(){ //cN
    $('.colorchoice:checked').each(function() {
        //get selected class color
        var c = $('label[for="'+$(this).attr('id')+'"]').attr('class').split(' ')[1];
        var label = $('label[for="'+$('#preview_'+$(this).data('previewbtn')).attr('id')+'"]');
        label.removeClass();
        label.addClass(c);
    })
    return;
}
function rngcolors(){
    var l = colors_name.length;
    var rng = [];
    var nchoice = $('input[name="nchoice"]:checked + label').text();
    for(i=0; i<l; i++){
        rng[i] = i;
    }
    shuffle(rng);
    for(i=0; i<nchoice; i++){
        $('#c'+(i+1)+'_color'+rng[i]).click();
        $('#c'+(i+1)+'_color'+rng[i]).click();
    }
}

function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
