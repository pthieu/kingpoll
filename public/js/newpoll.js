var socket = io.connect();

var _fp = new Fingerprint();
var fingerprint = _fp.get();

localStorage.setItem('fp', fingerprint);

$(document).ready(function() {
    // create #options based on max num
    var nchoice_max = $('.nchoice label').length;
    var nchoice_pick;
    var c_random = 0;
    //check max choices, insert questionbox and color options
    var add = "<div class='form-group'><table><tbody>";
    for (i = 0; i <= nchoice_max; i++) {
        add += ("<tr><td><input type='text' id='c" + (i + 1) + "' name='textchoice' maxlength='40' class='tb form-control right-align' required/></td><td>");
        for (j = 0; j < colors_hex.length; j++) {
            var cc_id = "c" + (i + 1) + "_color" + j;
            var cc_class = colors_name[j];
            add += ("<input type='radio' id='" + cc_id + "' class='colorchoice' name='c" + (i + 1) + "_color' data-previewbtn='c" + (i + 1) + "' value='" + colors_hex[j] + "'\\>" + "<label for='" + cc_id + "' class='colorchoice-label " + cc_class + "'></label>");
        }
        add += "</td></tr>";
    }
    $('#textchoice').append(add + "</tbody></table>");
    $('#textchoice').append("<label class='radio col-md-offset-7 col-sm-offset-8 col-xs-offset-8' id='rngclr'>Random Color!</label>");
    $('#rngclr').mousedown(function() {
        c_random++;
        rngcolors();
    });

    var tmp = colors_hex[randColor(colors_hex)];
    $('input[name="template_choice"] + label').css({
        'background-color': "#" + tmp,
        'border-color': "#" + tmp
    });
    tmp = colors_hex[randColor(colors_hex)];
    $('#rngclr').css({
        'background-color': "#" + tmp,
        'border-color': "#" + tmp
    });
    tmp = colors_hex[randColor(colors_hex)];
    $('#submit').css({
        'background-color': "#" + tmp,
        'border-color': "#" + tmp
    });
    var tmp_nc = colors_hex[randColor(colors_hex)];
    $('input[name="nchoice"] + label').css({
        'background-color': "#" + tmp_nc,
        'border-color': "#" + tmp_nc
    });
    //random colors for check boxes
    $('.radio-cb-label').each(function() {
        $(this).css({
            'border-color': '#' + colors_hex[randColor(colors_hex)]
        });
    });
    //click on nchoice, hide/show questionbox & color options
    $('input[name="nchoice"]').click(function() {
        if ($(this).prop('disabled') === false) {
            nchoice_pick = parseInt($(this).data('text'));
            $('#textchoice tr:gt(' + (nchoice_pick - 1) + ')').fadeOut(100);
            $('#textchoice tr:lt(' + nchoice_pick + ')').fadeIn(100);
            $('#rngclr').css("visibility", "visible");
            $('input[name="textchoice"]:visible').attr('required', true);
            setTimeout(function() {
                $('input[name="textchoice"]:hidden').removeAttr('required');
            }, 300);
            rngcolors();
        }
    });
    //adds the preview buttons
    //this removes all preview buttons, then adds then again
    $('input[name="nchoice"]').click(function() {
        $('#preview div:not(.embed-wrap) *').remove();
        for (i = 0; i < nchoice_pick; i++) {
            $('#preview .radio').append('<input id="preview_c' + (i + 1) + '" type="radio" name="preview_btn" /><label for="preview_c' + (i + 1) + '" class="grey"><div><div>' + $('#c' + (i + 1)).val() + '</div></div></label>');
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
        $('#textchoice input[type="text"]').attr('disabled', "true");
        // $('#textchoice input[type="text"]').attr('readonly',"readonly");
        $('#textchoice input[type="radio"]').attr('disabled', "true");
        preview_colors();
        // $('#question').val('');
        //disable other nchoices
        $('input[name="nchoice"]').attr('disabled', 'disabled');
        //uncheck simple q's
        $('input[name="cb"]').each(function() {
            $(this).prop('checked', false);
        });
        //grey out other options
        $('.nchoice-label:gt(0)').css({
            'background-color': '#ddd'
        });
    });
    $('#template2').click(function() {
        $('#yesno').fadeOut('fast');
        $('#simple').fadeIn('fast');
        $('#custom').fadeOut('fast');
        $('#textchoice input[type="text"]').removeAttr('disabled');
        $('#textchoice input[type="radio"]').removeAttr('disabled');
        $('input[name="nchoice"]').removeAttr('disabled');
        //bring option color back
        $('.nchoice-label:gt(0)').css({
            'background-color': '#' + tmp_nc
        });
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
        $('.nchoice-label:gt(0)').css({
            'background-color': '#' + tmp_nc
        });
    });
    $('#template1').click();
    $('#template3').click();
    //autochange button text when typing
    $('#textchoice input[type="text"]').on('input', function() {
        $('label[for="preview_' + $(this).attr('id') + '"] div div').text($(this).val());
        if ($(this).is(":visible") && !($(this).val())) {
            console.log($(this));
            this.setCustomValidity("Please fill this in or choose a lesser number");
        } else {
            this.setCustomValidity("");
        }
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
    var scraper_timeout;
    var linkref = [];
    var linkchanged_flag = {
        url: false,
        count: 0
    };
    var linkhtmlref = "";
    $('#tbDescription').on('input', function() {
        //slideup/down desc. position of val important for smooth animation
        if ($(this).val().length <= 0) {
            $('#prvw_tbDescription').slideUp('fast');
            $('.linkdesclist').html('')
            linkhtmlref = "";
        } else {
            $('#prvw_tbDescription').slideDown('fast');
        }
        var _d = dual.linkify($(this).val());
        var _desctext = _d.text;
        var _desclinktext = "";
        var _scrapedtext = "";
        _desclinktext += "<div class='linkdesclist'><em>Link descriptions:</em><ol class='link-list'>";
        for (var i in _d.linkarr) {
            if (linkref[i] !== _d.linkarr[i]) {
                linkref[i] = _d.linkarr[i];
                linkchanged_flag.url = true;
            }
            _desclinktext += "<li class='linkpreview' data-value='" + i + "'>Loading link snippet...</li>"
        }
        linkhtmlref = $('.linkdesclist').html();
        if (linkchanged_flag.url || linkchanged_flag.count !== _d.linkarr.length) {
            for (var i in _d.linkarr) {
                dual.scraper(_d.linkarr[i], i, function(results, _i) {
                    $('.linkpreview[data-value="' + _i + '"]').html(results);
                    linkhtmlref = $('.linkdesclist').html();
                });
            }
            linkchanged_flag.url = false;
            _desclinktext += "</ol></div>";
            linkchanged_flag.count = _d.linkarr.length;
        } else {
            _desclinktext = "";
        }
        linkhtmlref = (_d.linkarr.length >= 1) ? linkhtmlref : "";
        $('#prvw_tbDescription').html(_desctext + ((_desclinktext) ? _desclinktext :
            ((_d.linkarr) ? ("<div class='linkdesclist'>" + linkhtmlref + "</div>") : "")
        ));
        _desclinktext = "";
    });


    // grab which simple choice selected
    $('.radio-cb').click(function() {
        $('#preview_question').text($('.radio-cb:checked + label').text());
    });

    $('textarea, input').on('change keydown keypress keyup', function() {
        $(this).next().find('span').text("Left: " + ($(this).attr('maxlength') - $(this).val().length));
    });

    var embedref = "";
    var embedtimeout;
    var embedinput
    $('#embed-link').on('input', function() {
        embedinput = $('#embed-link').val().split(' ')[0];
        var _embed = dual.embedify(embedinput);
        if (_embed && embedref !== embedinput) {
            clearTimeout(embedtimeout);
            embedtimeout = setTimeout(function() {
                $('.embed').html(_embed);
            }, 1111);
            embedref = embedinput;
            $('.embed-href').html((dual.linkify(embedinput, 1)).text);
        } else if (!_embed) {
            $('.embed-href').html('');
            $('.embed').html('');
            embedinput = '';
        }
    });

    //submit
    $('#newpoll').submit(function(e) {
        e.preventDefault();
        //get local storage/cookie
        post_uid = localStorage.getItem('u_id');
        post_email = localStorage.getItem('u_email');
        fingerprint = _fp.get();
        // Get some values from elements on the page:
        var form = $(this);
        var post_email, // grab this from button press
            post_template,
            post_nchoice,
            post_question,
            post_text,
            post_color,
            post_description,
            post_url;

        var upl_attr = $(this).data('upl');

        if (upl_attr)
            post_url = '/new/' + upl_attr;
        else
            post_url = '/new';

        var dataURL = $('#c')[0].toDataURL();

        //make anon checkbox
        post_template = form.find("input[name='template_choice']:checked").val();
        post_nchoice = form.find("input[name='nchoice']:checked").val();
        post_question = $("#custom_question").val();
        post_description = $("#tbDescription").val();
        var post_textchoice = [];
        for (i = 0; i < post_nchoice; i++) {
            post_text = form.find("input[id='c" + (i + 1) + "']").val();
            post_color = form.find("input[name='c" + (i + 1) + "_color']:checked").val();
            post_textchoice.push({
                'c_text': post_text,
                'c_hex': post_color
            });
        }
        $('#submit').text('Please Wait...');
        $('#submit').attr('disabled', 'disabled');
        $('#submit').css('background-color', '#888888');

        var posting = $.ajax({
            url: post_url,
            type: 'POST',
            data: {
                'template_choice': post_template,
                'u_id': post_uid,
                'u_email': post_email,
                'u_fp': fingerprint,
                'c_n': post_nchoice,
                'textchoice': post_textchoice,
                'c_random': c_random,
                'p_q': post_question,
                'p_embed': embedinput,
                'p_desc': post_description,
                'p_image': dataURL.split(',')[1]
            },
            dataType: "html"
        }).done(function(data) {
            window.location.href = data;
        }).fail(function(data) {
            switch (data.responseText) {
                case 'c_n length does not match':
                    alert('Please fill all visible textboxes with text and choose a color!');
                    break;
            }
        });
    });
});

function preview_colors() { //cN
    $('.colorchoice:checked').each(function() {
        //get selected class color
        var c = $('label[for="' + $(this).attr('id') + '"]').attr('class').split(' ')[1];
        var label = $('label[for="' + $('#preview_' + $(this).data('previewbtn')).attr('id') + '"]');
        label.removeClass();
        label.addClass(c);
    })
    return;
}

function rngcolors() {
    var l = colors_name.length;
    var rng = [];
    var nchoice = $('input[name="nchoice"]:checked + label').text();
    for (i = 0; i < l; i++) {
        rng[i] = i;
    }
    shuffle(rng);
    for (i = 0; i < nchoice; i++) {
        $('#c' + (i + 1) + '_color' + rng[i]).click();
        $('#c' + (i + 1) + '_color' + rng[i]).click();
    }
}

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

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

//THIS IS ALSO IN PUBLIC/LANDING_SPLASH.JS!! IF YOU CHANGE THIS YOU HAVE TO CHANGE IT THERE TOO. MAKE THIS MORE MODULAR PLZ
//grab canvas and canvas context
var canvas = document.getElementById('c'),
    c = canvas.getContext('2d');
//grab inputs
var quote = document.getElementById('custom_question');
var speaker = "kingpoll.com";

//canvas setup
// var fontFamily = "Segoe UI",
var fontFamily = "Segoe UI, Helvetica",
    fontSize = "36px",
    fontColour = "#ab3792",
    maxlines = 9 + 1,
    padding_side = 50,
    width = +(canvas.width = 700), // fb uses 94:49 ratio. wtfff?
    height = +(canvas.height = 364);
// height = +(canvas.height = (parseInt(fontSize)*maxlines)+20);

//global vars
// var colors = ['#339933'];
var colors = ['#b80000', //dark-red
    '#e74c3c', //red
    '#e67e22', //orange
    '#d1b41f', //yellow
    '#339933', //dark-green
    '#2ecc51', //green
    '#009999', //teal
    '#3498db', //pale-blue
    '#0099ff', //blue
    '#6666ff', //blue-purple
    '#cf7ccf', //pink
    '#9b59b6', //purple
    '#34495e', //black
    'grey'
]; //grey
var bg_color = colors[Math.floor(Math.random() * colors.length)];
fontColour = (bg_color == "black") ? "#fffffe" : "#fffffe";

//set gradients
var grad = c.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.8);
grad.addColorStop(0, bg_color);
grad.addColorStop(1, '#000000');


//function to split string into proper string sections for canvas fit
function fragmentText(text, maxWidth) {
    var words = text.split(' ');
    for (var i = 0; i < (words.length - 1); i++) {
        words[i] = words[i] + " ";
    }
    var lines = [],
        line = "";
    if (c.measureText(text).width < maxWidth) {
        return [text];
    }
    while (words.length > 0) {
        while (c.measureText(words[0]).width >= maxWidth) {
            var tmp = words[0];
            words[0] = tmp.slice(0, -1);
            if (words.length > 1) {
                words[1] = tmp.slice(-1) + words[1];
            } else {
                words.push(tmp.slice(-1));
            }
        }
        if (c.measureText(line + words[0]).width < maxWidth) {
            //quotes are the spacer at end of line
            line += words.shift() + "";
        } else {
            lines.push(line);
            line = "";
        }
        if (words.length === 0) {
            lines.push(line);
        }
    }
    return lines;
}

//draw function occurs every keystroke
function draw() {
    c.clearRect(0, 0, width, height);
    c.fillStyle = grad;
    c.fillRect(0, 0, width, height);
    c.font = "bold " + fontSize + " " + fontFamily;
    c.textAlign = "center";
    c.fillStyle = fontColour;
    var lines = fragmentText(quote.value, width - parseInt(fontSize, 0) - padding_side);
    var v_offset = maxlines - lines.length;
    var v_offset_div = 2;
    lines.forEach(function(line, i) {
        if ((i === 0) && (i === (lines.length - 1))) {
            c.fillText("\"" + line + "\"", width / 2, ((i + v_offset / v_offset_div + 1) * parseInt(fontSize, 0)) - 10);
        } else if (i === 0) {
            c.fillText("\"" + line, width / 2, ((i + v_offset / v_offset_div + 1) * parseInt(fontSize, 0)) - 10);
        } else if (i === (lines.length - 1)) {
            c.fillText(line + "\"", width / 2, ((i + v_offset / v_offset_div + 1) * parseInt(fontSize, 0)) - 10);
        } else {
            c.fillText(line, width / 2, ((i + v_offset / v_offset_div + 1) * parseInt(fontSize, 0)) - 10);
        }
    });
    c.textAlign = "right";
    c.font = "bold " + (parseInt(fontSize) - 16) + "px" + " " + fontFamily;
    //c.fillText('kingpoll.com/p/abcdefgxyz123', width-5, height-10);
    //if(speaker.value){
    c.fillText("- " + speaker, width - 25, height - 20);
    //}
    c.imageSmoothingEnabled = true;
}

//action items
quote.onkeyup = function(e) { // keyup because we need to know what the entered text is.
    draw();
};