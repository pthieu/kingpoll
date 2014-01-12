var socket = io.connect();

//load var
var data;

//vote var
var votetime;
var u_email;
var u_id;
var geo_loc;

//flags

//map prefs
var rgn_color = {};
var rgn_fill = "#dddddd";
var rgn_stroke = "#ffffff";



//vote time bar chart config
var chartMargin = {top:30, right:30, bottom:30, left:30};
var chartW = $('#pieTotal').width()  - chartMargin.left - chartMargin.right;
var chartH = $('#pieTotal').height() - chartMargin.top/2 - chartMargin.bottom/2;
var barWidth = 20;
var barOffset = 6;
var dur = 1000; //transition duration
var chart_solocolor = colors_hex[randColor(colors_hex)];

//results pie chart config
var pieW = $('#pieTotal').width();
var pieH = $('#pieTotal').height();
var innerRadius = $('#pieTotal').width()/3;
var outerRadius = $('#pieTotal').width()/2 - chartMargin.right/4;

socket.on('results', function (results) {
    calcResultPerc(results['yes_cnt'], results['no_cnt']);
});

$.getJSON("http://ip-api.com/json/", function(data) {
    geo_loc = data;
    socket.emit('iploc', data);
});

$(document).ready(function(){
    // var pollid = ((/http.*\d+\//).exec(window.location.href))[0].replace(/^.*\/\/.*?\//, '').replace('/', '');
    //use this for now until we get to real dns
    var pollid = (window.location.href).split('/')[4];
    socket.emit('getPoll', pollid);
    $('.tbDescription').hover(function () {
        $(this).css({'border-color': "#"+chart_solocolor});
    }, function () {
        $(this).css({'border-color': "#ddd"});
    });

    u_id = getLocalVar('u_id');
    u_email = getLocalVar('u_email');
    // socket.emit('getID');

    var disqus_identifier = pollid;

//set up empty graphs
//PIE CHART - VOTE TOTALS
    var results_pie = d3.layout.pie()
                       .sort(null);
    var pie_arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius);

    var svg_pie = d3.select("#pieTotal")
                    .attr("width", pieW)
                    .attr("height", pieH)
                    .append("g")
                    .attr("transform", "translate(" + pieW / 2 + "," + pieH / 2 + ")")
                    .attr("class","piechart")

    var pie_path = svg_pie.selectAll("path").data(results_pie([1,0,0,0,0,0,0]))
                    .enter().append("path")
                    .attr("d", pie_arc)
                    .each(function(d) { this._current = d; }) // store the initial values
                    .attr("class", "vote_arc")
                    .attr("value", function(d,i) {
                            return (i-1);
                    });
    var svg_pie_bg = svg_pie.append("circle")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", innerRadius-10)
                    .attr("fill", "none");
    var svg_pie_msg = svg_pie.append("text") // later svg is "higher"
                    .attr("class", "piechart_msg")
        svg_pie_msg.append("tspan")
                    .attr("x", 0)
                    .attr("y", -3)
                    .attr("id",'pie_msg_title')
                    .text("Votes");
        svg_pie_msg.append("tspan")
                    .attr("x", 0)
                    .attr("y", 22)
                    .attr("id",'pie_msg_val')
                    .text("0");

    var pie_votes = [1,0,0,0,0,0,0];
    var pie_colors = ["#ddd"];
    $(svg_pie).bind("monitor", worker);
    $(svg_pie).trigger("monitor");

    function worker(event) {
        pie_path = pie_path.data(results_pie(pie_votes))
                   .attr("fill", function(d,i) {return pie_colors[i]});
            pie_path.transition().duration(500).attrTween("d", arcTween//(
        );
        setTimeout(function(){$(svg_pie).trigger("monitor")}, 500);
    }
    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function arcTween(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return pie_arc(i(t));
      };
    }

//BARCHART
    var bardata = [{name:'Average', value: 0}, {name:'You', value: 0}];

    var chart = d3.select('#barVoteTime').append('svg')
        .attr('class', 'barchart')
        .attr("height", chartH + chartMargin.top + chartMargin.bottom)
        .append('g')
        .attr("transform", "translate(" + chartMargin.left*1.5 + "," + chartMargin.top/3 + ")");

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, chartW]);
    var y = d3.scale.linear()
        .range([chartH, 0]);
    x.domain(bardata.map(function(d){return d.name;}));
    y.domain([0, d3.max(bardata, function(d){return d.value;})]);

    var bar = chart.selectAll('g')
        .data(bardata)
        .enter().append('g')
        .attr("y", function(d) { return y(d.value); });
    bar.append("rect")
        .attr("x", function(d) { return x(d.name)+barOffset/2; })
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return chartH - y(d.value); })
        .attr("width", x.rangeBand()-barOffset); //rangeband chooses width of bar based on # of bars

    bar.append("text") //not label at bottom, value in bar
        .attr("class", "s_votetime")
        .attr("x", function(d) {return x(d.name);}) //starting point left of bar
        .attr("y", function(d) { return y(d.value); }) //starts at top of bar
        .attr("dx", function(d) {return x.rangeBand()/2;}) //moves to middle of bar
        .attr("dy", function(d) { return (chartH - y(d.value))/2; }) //moves to middle of bar
        .text(function(d) { return d.value+"s";})

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

    chart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,'+chartH+')')
        .call(xAxis);
    chart.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0,0)')
        .call(yAxis);

//VIEWERS
    var svg_viewers = d3.select("#activeViewers")
                    .attr("class", "stats")
                    .attr("width", pieW)
                    .attr("height", pieH)
                    .append("text")
                    .attr("transform", "translate(" + pieW / 2 + "," + pieH / 2 + ")")
        svg_viewers.append("tspan")
                    .attr("x", 0)
                    .attr("y", -10)
                    .text("Viewers");
        svg_viewers.append("tspan")
                    .attr("x", 0)
                    .attr("y", 30)
                    .attr("id","tspanActiveViewers")
                    .text("1");

//CLICK
    $('#click').click(function () {
        alert('fuck you farran');
    });

    socket.on('setID', function (ID) {
        console.log(ID);
    });
    socket.on('setEmail', function (email) {
        console.log(email);
    });
    socket.on('voteNoEmail', function () {
        console.log('No email specified');
        //queue popup
    });

    socket.on('pollID', function (poll) {
        if (poll){
            socket.emit('getViewers');
            if(u_email){
                socket.emit('getVoteTime', {u_email: u_email, p_id: pollid});
            }
            data = poll;
            $('#choices .radio').html('');
            // we use an array instead of a key/value pair because we want the buttons that
            // are added later to actually sync up with the colors in the array objects
            // not sure if the for(i in obj) will progress in an orderly way
            var choice_colors=[]; //holds button text and color
            pie_votes = [];
            pie_colors = [];
            if(data.p_total <= 0){
                pie_votes.push(1);
                pie_colors.push("#ddd");
            }
            else{
                pie_votes.push(0);
                pie_colors.push("#ddd");
            }

            for(var i=0; i<data.c_n;i++){
                choice_colors[i] = {'c_text':data.c_text[i], 'color':data.c_hex[i], 'votes':0};
                //sets new values on pie arcs
                pie_votes.push(data.c_total[i]);
                pie_colors.push("#"+data.c_hex[i]);
            }
            if(data.p_desc != null){
                $('#tbDescription').css('visibility', 'visible');
            }
            $('.tbDescription').html(data.p_desc);
            $('#question').html(data.p_q);

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
//PIE CHANGES
            $("#pie_msg_val").text(data.p_total);
            $(".vote_arc").hover(function () {
                if ($(this).attr('value') >= 0){
                    svg_pie_bg.attr("fill", ("#"+choice_colors[$(this).attr('value')].color));
                    $(".piechart text").css("fill","#fff");
                    $('#pie_msg_title').text(Math.floor(data.c_total[$(this).attr('value')]/data.p_total*10000)/100+"%");
                    $('#pie_msg_val').text(data.c_total[$(this).attr('value')]);
                }
            }, function (){
                if ($(this).attr('value') >= 0) {
                    svg_pie_bg.attr("fill", "none");
                    $('.piechart text').css("fill",$('body').css('color'));
                    $('#pie_msg_title').text('Votes');
                    $('#pie_msg_val').text(data.p_total);
                }
            });

//BARCHART CHANGES
            var voteTimeData2 = [{name:'Average', value: data.s_tavg}, {name:'You', value: 0}];
            drawVoteTime(chart, voteTimeData2, y, yAxis);
            socket.on('setVoteTime', function (s_vtime) {
                voteTimeData = [{name:'Average', value: data.s_tavg}, {name:'You', value: s_vtime}];
                drawVoteTime(chart, voteTimeData, y, yAxis);
            });
            $('.barchart rect').css('fill','#'+chart_solocolor);
            $('.barchart .s_votetime').css('text-shadow','-1px -1px #'+chart_solocolor
                                                       + ', 1px -1px #'+chart_solocolor
                                                       + ', -1px 1px #'+chart_solocolor
                                                       + ', 1px 1px #'+chart_solocolor);

//VIEWERS COUNT CHANGES
            $('#activeViewers text tspan').css("fill", "#"+chart_solocolor);
            socket.on('setViewers', function (d) {
                $('#tspanActiveViewers').text((d === null) ? 1 : d);
            });
            setInterval(function(){socket.emit('getViewers')}, 5000);

            getMap($('#map'), rgn_color); //write map
            //$(".jvectormap-region[data-code='US-WA']").attr("fill","#cc0000");
            //$(".jvectormap-region[data-code='US-WA']").attr("fill-opacity", 0);
            //var tmp = 'US-AR';
            //$(".jvectormap-region[data-code='"+tmp+"']").css({'opacity':0});
            // $('#map').bind('onRegionOut.jvectormap', function(event, code){
            //     $(".jvectormap-region[data-code='US-WA']").attr("fill","#cc0000");
            // });

            //create buttons
            for(i in choice_colors){
                $('#choices .radio').append('<input id="c'+ i +'"class="btnChoice" type="radio" name="vote" value="'+ i +'" /><label for="c'+i+'" style="background-color:#'+choice_colors[i].color+'"><div><div>'+choice_colors[i].c_text+'</div></div></label>');
            }
            //graphs done drawing, grab time
            votetime = $.now();
            $('input[name="vote"]').click(function(){
                //get time once
                if (votetime>1383809658764){
                    votetime = $.now()-votetime; //get votetime once
                    voteTimeData = [{name:'Average', value: data.s_tavg}, {name:'You', value: votetime/1000}];
                    drawVoteTime(chart, voteTimeData, y, yAxis);
                }

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
                        'v_text'    :data.c_text[$(this).val()],
                        's_vtime'   :votetime
                    });
                }
                else{
                    getSignUpBox(lblVote);
                }
            });
        }
        else{
            $('#question').html("Poll not found <span style='font-weight:bold'>:c</span>");
            console.log('poll not found');
        }
    });
});

function drawVoteTime(chart, data, y_scale, yAxis){
    y_scale.domain([0, d3.max(data, function(d){return d.value;})]);

    chart.selectAll('.y.axis')
        .transition()
        .duration(dur)
        .call(yAxis);
    chart.selectAll("rect")
        .data(data)
        .transition()
        .duration(dur)
        .attr("y", function(d) { return y_scale(d.value); })
        .attr("height", function(d) { return chartH - y_scale(d.value); });
    chart.selectAll("text")
        .data(data)
        .transition()
        .duration(dur)
        .attr("y", function(d) { return y_scale(d.value); }) //starts at top of bar        
        .attr("dy", function(d) { return (chartH - y_scale(d.value))/2; }) //moves to middle of bar
        .text(function(d) { return d.value+"s";});
}

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
    results.push([0,100,'ddd',0]); //skeleton donut
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