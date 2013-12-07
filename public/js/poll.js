var socket = io.connect();

//load var
var data;

//vote var
var votetime;
var u_email;
var u_id;
var geo_loc;

//flags
var c_yes = c_no = false;

//map prefs
var rgn_color = {};
var rgn_fill = "#dddddd";
var rgn_stroke = "#ffffff";

//results pie chart config
var w = $('#results').width();
var h = $('#results').height();;                

socket.on('results', function (results) {
    calcResultPerc(results['yes_cnt'], results['no_cnt']);
});

$(document).ready(function(){
    // var pollid = ((/http.*\d+\//).exec(window.location.href))[0].replace(/^.*\/\/.*?\//, '').replace('/', '');
    //use this for now until we get to real dns
    var pollid = (window.location.href).split('/')[4];
    socket.emit('getpoll', pollid);
    var tmp = colors_hex[randColor(colors_hex)];
    $('.tbDescription').hover(function () {
        $(this).css({'border-color': "#"+tmp});
    }, function () {
        $(this).css({'border-color': "#ddd"});
    });

    u_id = getLocalVar('u_id');
    u_email = getLocalVar('u_email');
    // socket.emit('getID');
    socket.on('setID', function (ID) {
        console.log(ID);
    });
    socket.on('setEmail', function (email) {
        console.log(email);
    });
    socket.on('setVoted', function (voted) {
        console.log(voted);
    });
    socket.on('voteNoEmail', function () {
        console.log('No email specified');
        //queue popup
    });
    socket.on('pollID', function (poll) {
        if (poll){
            data = poll;
            $('#choices .radio').html('');
            // we use an array instead of a key/value pair because we want the buttons that
            // are added later to actually sync up with the colors in the array objects
            // not sure if the for(i in obj) will progress in an orderly way
            var choice_colors=[]; //holds button text and color
            for(i=0; i<data.c_n;i++){
                choice_colors[i] = {'c_text':data.c_text[i], 'color':data.c_hex[i], 'votes':0};
            }
            if(data.p_desc != null){
                $('#tbDescription').css('visibility', 'visible');
            }
            $('.tbDescription').html(data.p_desc);
            $('#question').html(data.p_q);
            //grabbuttons
            for(var i in choice_colors){
                // $('#choices').append("<button class='choice' style='background-color:#"+choice_colors[i].color+"'>"+choice_colors[i].c_text+"</button>")
                $('#choices .radio').append('<input id="c'+ i +'"class="btnChoice" type="radio" name="vote" value="'+ i +'" /><label for="c'+i+'" style="background-color:#'+choice_colors[i].color+'"><div><div>'+choice_colors[i].c_text+'</div></div></label>');
            }

            for(i in data.data.us){
                if(data.data.us[i].length < 1){
                    continue;
                }
                rgn_color[i] = calcRgnColor(data.c_n, choice_colors, data.data.us[i]);
                for(j=0;j<data.c_n;j++){
                    //increment each color's total votes for calculations later
                    choice_colors[j].votes += data.data.us[i][j];
                }
            }
            // converts radians to percentage
            var results_perc = d3.scale.linear().domain([0, 100]).range([0, 2 * Math.PI]);
            var pie_data = calcPie(choice_colors);
            
            var tmp = d3.selectAll("#results_chart *")
                        .remove();
            var results_pie = d3.select("#results_chart");
            var results_pie_arc = d3.svg.arc()
                    .innerRadius(50)
                    .outerRadius(100)
                    .startAngle(function(d){return results_perc(d[0]);})
                    .endAngle(function(d){return results_perc(d[1]);});

            results_pie.selectAll("path") //selects the single existing path (arc) above
                .data(pie_data) //binds data
                .enter() //if not enough path's, we are going to add more elements
                .append("path") //element is a path
                .attr("d", results_pie_arc) //path param "d", grab results from results_pie_arc
                .style("fill", function(d){return d[2];}) //for some reason, style property avaliable only after enter()
                .attr("transform", "translate("+"120"+","+h/2+")")
                .attr('id',function(d){return "pie_c"+d[3];});

            getMap($('#map'), rgn_color); //write map
            //$(".jvectormap-region[data-code='US-WA']").attr("fill","#cc0000");
            //$(".jvectormap-region[data-code='US-WA']").attr("fill-opacity", 0);
            //var tmp = 'US-AR';
            //$(".jvectormap-region[data-code='"+tmp+"']").css({'opacity':0});
            // $('#map').bind('onRegionOut.jvectormap', function(event, code){
            //     $(".jvectormap-region[data-code='US-WA']").attr("fill","#cc0000");
            // });

            $.getJSON("http://ip-api.com/json/", function(data) {
                geo_loc = data;
                socket.emit('iploc', data);
            });

            //graphs done drawing, grab time
            votetime = $.now();
            $('input[name="vote"]').click(function(){
                //get time once
                if (votetime>1383809658764){
                    votetime = $.now()-votetime; //get votetime once
                }
                var lblVote = $('label[for="'+$(this).attr('id')+'"] div div');
                lblVote.text(votetime/1000 + " s");

                if(u_email){
                    socket.emit('vote', {
                        'p_id'      :[data._id, data.p_id],
                        'u_id'      :u_id,
                        'u_email'   :u_email,
                        'u_loc'     :[geo_loc.country, geo_loc.countryCode, geo_loc.regionName, geo_loc.region, geo_loc.city],
                        'u_longlat' :[geo_loc.lon, geo_loc.lat],
                        'v_ip'      :geo_loc.query,
                        'v_choice'  :$(this).val(),
                        //vanon
                        'v_hex'     :data.c_hex[$(this).val()],
                        'v_text'    :data.c_text[$(this).val()]
                    });
                }
                else{
                    getSignUpBox(lblVote);
                }
            });
        }
        else{
            $('#choices .radio').html("Poll not found <span style='font-weight:bold'>:c</span>");
            console.log('poll not found');
        }
    });
});

function getLocalVar(item){
    if(typeof(Storage) !== "undefined"){
        return(localStorage.getItem(item));
    }
    else
    {
        return($.cookie(item));
    }
}

function getMap(map, rgn_color){
        map.find('div').remove();
        map2 = new jvm.WorldMap({
            map: 'us_lcc_en',
            container: map,
            zoomButtons: false,
            zoomOnScroll: false,
            regionsSelectable : false,
            backgroundColor: 'none',
            onRegionOver: function(e,code){
                e.preventDefault();
                var opacity = $(".jvectormap-region[data-code='"+code+"']").attr("fill-opacity", 0.3);
            },
            onRegionOut: function(e,code){
                e.preventDefault();
                var opacity = $(".jvectormap-region[data-code='"+code+"']").attr("fill-opacity", 1);
            },
            regionStyle:{
                initial:{
                    fill: rgn_fill, //global var
                    stroke: rgn_stroke, //global var
                    "stroke-width": 2
                },
                  hover: {
                    "fill-opacity": 0.6
                }
            },
            series: {
                regions: [{
                    attribute: 'fill'}]
            }
        });
        map2.series.regions[0].setValues(rgn_color);
}

function setEmail(u_email){
    localStorage.setItem('u_email', u_email);
}

function getSignUpBox(css){
    $('#signup_box').css({
        "visibility": "visible"
    });
    $('#signup_box').dialog({
        resizable: false,
        position: {my:'top', at:'center', of:css},
        width: 250,
        minHeight: 0,
        buttons:{
            "Close": function () {
                $(this).dialog('close');
            },
            "Vote!": function () {
                setEmail($('#tbEmail').val());
                $(this).dialog('close');
            }
        }
    });
}

function calcResultPerc (yes_cnt, no_cnt) {
    var total = yes_cnt+no_cnt;
    var yes_perc = Math.round((yes_cnt/total)*10000)/100;
    var no_perc = Math.round((no_cnt/total)*10000)/100;
    $('#results').html("yes:"+yes_perc+"%" + "<br/>no:"+no_perc+"%");
}

function calcRgnColor (num_choices, choices, data_region){
    // get total
    var total = 0; // total votes in region
    var maxnum = 0; // largest number in all of the choices
    var max_choice = null; // choice name
    var result = "#";
    var sat_ratio; //ratio of white balance
    var inv_color_ratio; // for the lower numbers of other choices
    var r,g,b; // set up colors
    var tie;

    //calculate total
    for(i in data_region){
        total += data_region[i];
    }

    // find largest number
    for (i in data_region){
        if (data_region[i] > maxnum){
            maxnum = data_region[i];
            max_choice = i;
            tie = false;
        }
        else if(data_region[i] == maxnum)
        {
            tie = true;
        }
    }
    //if all tie skip this part
    if(max_choice !== null){
        //get index of choice because choices[] is a normal array
        // var index = max_choice.match(/\d+/); // grab # in _cN
        //index -= 1; // starts at 0
        //split up colors of highest choice
        r = parseInt(choices[max_choice].color.substr(0,2),16);
        g = parseInt(choices[max_choice].color.substr(2,2),16);
        b = parseInt(choices[max_choice].color.substr(4,2),16);
    }
    //once maxnum found, get ratio
    sat_ratio = (num_choices*maxnum/total-1)/(num_choices-1);// % of color saturation we want
    inv_color_ratio = 1 - sat_ratio; //we invert since we need amount to lighten by (since 255 is white)

    //either tie between top two or more
    if (tie === true)
    {
        r = 200;
        g = 200;
        b = 200;
        result = desaturation(r,g,b,0);
    }
    else{
        result = desaturation(r,g,b,inv_color_ratio);
    }
    return result;//should be #hex format
}

function desaturation (r,g,b,sat_inv) {
    var r_sat, g_sat, b_sat;
    //calulate amount to DESATURATE by. if no change, i.e. sat_inv=0, color is same as before (full fill)
    //if sat=1, means we want to fully desaturate (255 i.e. white) so multiply difference and add it in
    r_sat = (Math.floor(r+(255-r)*sat_inv*0.7)).toString(16);
    g_sat = (Math.floor(g+(255-g)*sat_inv*0.7)).toString(16);
    b_sat = (Math.floor(b+(255-b)*sat_inv*0.7)).toString(16);

    //tostring is dumb, doesn't remember bitsize so we have to add extra byte if less than 16
    if(parseInt(r_sat,16)<16){
            r_sat = "0" + r_sat;
    }
    if(parseInt(g_sat,16)<16){
            g_sat = "0" + g_sat;
    }
    if(parseInt(b_sat,16)<16){
            b_sat = "0" + b_sat;
    }

    return ("#" + r_sat + g_sat + b_sat);
}

function calcPie(data){
    var total = 0;
    var results = [];
    //calculate total first
    for(i in data){
        total += data[i].votes;
    }
    //sort array
    data.sort(function(a,b) {
        return parseInt(b.votes) - parseInt(a.votes);
    });

    var pos = 0; //placeholder for first element
    //now calculate the angles for the pie chart
    for(i in data){
        //check of 0/0 error
        if (data[i].votes === 0){
            //can't divide by 0, so manually set to 0
            perc = 0;
        }
        else{
            var perc = data[i].votes/total*100;
        }
        results.push([pos,pos+perc,data[i].color,i]);
        pos = pos + perc;
    }

    return results;
}