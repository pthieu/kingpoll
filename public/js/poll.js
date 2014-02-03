var socket = io.connect();

//load var
var pushstate = {
    current: 0,
    latest: 0
};
var data;
var lastpoll;
var pollid;
var disqus_identifier;
var map = {};
var mapdata = {
        'US':{},
        'CA': {}
    };
var mapname; 

//vote var
var votetime;
var u_email;
var u_id;
var geo_loc;
var voted;

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
var dur = 500; //transition duration
var chart_solocolor = colors_hex[randColor(colors_hex)];
var s_vtime = 0;

//results pie chart config
var last_votes = []
var pie_votes = [];
var pie_colors = [];
var pieW = $('#pieTotal').width();
var pieH = $('#pieTotal').height();
var innerRadius = $('#pieTotal').width()/3;
var outerRadius = $('#pieTotal').width()/2 - chartMargin.right/4;

socket.on('results', function (results) {
    calcResultPerc(results['yes_cnt'], results['no_cnt']);
});

$.getJSON("http://ip-api.com/json/", function(_geodata) {
    geo_loc = _geodata;
    socket.emit('iploc', _geodata);
});

$(document).ready(function(){
    // var pollid = ((/http.*\d+\//).exec(window.location.href))[0].replace(/^.*\/\/.*?\//, '').replace('/', '');
    //use this for now until we get to real dns
    pollid = (window.location.href).split('/')[4];
    lastpoll = pollid;
    socket.emit('getPoll', pollid);
    disqus_identifier = pollid;

    $('.tbDescription').hover(function () {
        $(this).css({'border-color': "#"+chart_solocolor});
    }, function () {
        $(this).css({'border-color': "#ddd"});
    });

    u_id = getLocalVar('u_id');
    u_email = getLocalVar('u_email');
    // socket.emit('getID');

//set up empty graphs
//PIE CHART - VOTE TOTALS
    donut = function module(_sel, r1, r2, w, h, color, _callback, _cbparam) {
        _sel.each(function (_data) {
            var pie = d3.layout.pie()
                .sort(null);

            var arc = d3.svg.arc()
                .innerRadius(r1)
                .outerRadius(r2);

            var svg = d3.select(this).select("#pieTotal > g");
            if (svg.empty()) {
                svg = d3.select(this).select("#pieTotal")
                    .attr("id", "pieTotal")
                    .attr("class","stats pie")
                    .attr("width", w)
                    .attr("height", h)
                    .append("g")
                    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
                    .attr("class","piechart");

                var svg_pie_bg = svg.append("circle")
                            .attr("cx", 0)
                            .attr("cy", 0)
                            .attr("r", innerRadius-10)
                            .attr("fill", "none")
                            .attr("id", "pieTotalBG");
                var svg_pie_msg = svg.append("text") // later svg is "higher"
                            .attr("class", "piechart_msg")
                svg_pie_msg.append("tspan")
                            .attr("x", 0)
                            .attr("y", -3)
                            .attr("id",'pie_msg_title')
                            .text("Total Votes:");
                svg_pie_msg.append("tspan")
                            .attr("x", 0)
                            .attr("y", 22)
                            .attr("id",'pie_msg_val')
                            .text("0");
            }
            var path = svg.selectAll("path")
                .data(pie);
            path.enter().append("path")
                .attr("fill", function (d, i) {
                return color[i];
            })
                .attr("d", arc)
                .each(function (d) {
                this._current = d;
            })
            .attr("class", "vote_arc")
            .attr("value", function(d,i) {
                    return (i-1);
            });;

            path.transition()
                .duration(dur)
                .attrTween("d", arcTween)
                .each('end', function () {
                    if(_callback){
                       setTimeout(function () {
                         _callback(_cbparam)
                       }, 100);
                    }
                });

            path.exit().remove();

            function arcTween(a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function (t) {
                    return arc(i(t));
                };
            }
        });
    };
    var tmpdata = [1];
    var pieTotal = d3.select("#results").datum(tmpdata);
    donut(pieTotal, innerRadius, outerRadius, pieW, pieH, ['#ddd']);

    function pieTotal_update(_data, _callback, _cbparam) {
        pieTotal.datum(_data.val).transition();
        donut(pieTotal, innerRadius, outerRadius, pieW, pieH, pie_colors, _callback, _cbparam);
    }

    function populatepie(_data, _hex) {
        var vlength = Math.min(_data.length, _hex.length);
        pie_votes = [0];
        pie_colors = ['#ddd'];
        //initialize with [1,0,0...]
        pie_votes = [1];
        for(var i=0; i<vlength;i++){
            //sets new values on pie arcs
            pie_votes.push(0);
            pie_colors.push("#"+_hex[i]);
        }
        pieTotal_update({val:pie_votes, hex:pie_colors});
        //animate pieTotal valuse
        pie_votes = [0];
        for(var i=0; i<vlength;i++){
            //sets new values on pie arcs
            // pie_votes.push(Math.floor(Math.random()*10));
            pie_votes.push(_data[i]);
        }
        pieTotal_update({val:pie_votes, hex:pie_colors});
    };

    function clearpie() {
        var empty_lastvotes = [1];
        for(var i=0; i<last_votes.length; i++){
            empty_lastvotes.push(0);
        }
        pieTotal_update({val:empty_lastvotes, hex:[rgn_fill]},
            pieTotal_update, {val:[1], hex:[rgn_fill]});
    };

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
        .text(function(d) {return d.value+"s";});

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

//MAP CREATION
            for(var i in mapdata){
                map[i] = getMap($('#map'+i), i, rgn_color); //write map
                map[i].series.regions[0].setValues(rgn_color);
                rgn_color[i] = {};
            }
            $('#mapUS').css({'z-index': '1'});
            $('input[name="mapChoice"]').click(function () {
                switch($(this).val()){
                    case 'World':
                        break;
                    case 'US':
                        $('.map:not(#map'+$(this).val()+')').css({'z-index': '0'});
                        $('#map'+$(this).val()).css({'z-index': '1'});
                        break;
                    case 'CA':
                        $('.map:not(#map'+$(this).val()+')').css({'z-index': '0'});
                        $('#map'+$(this).val()).css({'z-index': '1'});
                        map.CA.setFocus(1.4, 0, 90);
                        break;
                }
            });
            $(window).resize(function() {
                map.CA.setFocus(1.4, 0, 90);
            });

//CLICK
    $('#click').click(function () {
        populatepie(data.c_total, data.c_hex);
    });
    $('#clearpoll').click(clearpie);
    $('#changepoll').click(function () {
        pollid = Math.random();
        $(this).text(pollid);
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
            //set up data !IMPORTANT
            data = poll;
            data.s_vtime = data.s_vtime/1000;
            data.s_tavg = data.s_tavg/1000;
            lastpoll = (pollid) ? pollid : data.p_id;
            last_votes = data.c_total;
            pollid = data.p_id;
            disqus_identifier = pollid;

            // (lastpoll != pollid) ? (function(){
            //     (pushstate.current == pushstate.latest) ? (function(){
            //         pushstate.latest++;
            //         history.pushState(pushstate.latest, data.p_q, pollid);
            //     })() : null;
            //     window.onpopstate = function (e) {
            //         pushstate.current += 1;
            //         socket.emit('getPoll', (window.location.href).split('/')[4]);
            //     };
            // })() : null;
            (lastpoll != pollid) ? history.replaceState({}, data.p_q, pollid) : null;

            // we use an array instead of a key/value pair because we want the buttons that
            // are added later to actually sync up with the colors in the array objects
            // not sure if the for(i in obj) will progress in an orderly way
            var choice_colors=[]; //holds button text and color
            for(var i=0; i<data.c_n;i++){
                choice_colors[i] = {'c_text':data.c_text[i], 'color':data.c_hex[i], 'votes':0};
            }
            if(data.p_desc){
                $('#tbDescription').show();
            }
            $('.tbDescription').html(data.p_desc);
            $('#question').html(data.p_q);

//PIE CHANGES
            //if same poll, update stats
            if(pollid == lastpoll && data.p_total > 0){
                populatepie(data.c_total, data.c_hex);
            }
            //if different poll, clear and recreate arcs
            else if (pollid != lastpoll && data.p_total > 0){
                clearpie();
                setTimeout(function () {
                    populatepie(data.c_total, data.c_hex);
                }, dur*1.5);
            }
            else if (data.p_total <= 0){
                clearpie();
            }
            $("#pie_msg_val").text(data.p_total);
            setInterval(function () {
                $(".vote_arc").hover(function () {
                    if ($(this).attr('value') >= 0){
                        $('#pieTotalBG').attr("fill", ("#"+data.c_hex[$(this).attr('value')]));
                        $(".piechart text").css("fill","#fff");
                        $('#pie_msg_title').text(Math.floor(data.c_total[$(this).attr('value')]/data.p_total*10000)/100+"%");
                        $('#pie_msg_val').text(data.c_total[$(this).attr('value')]);
                    }
                }, function (){
                    if ($(this).attr('value') >= 0) {
                        $('#pieTotalBG').attr("fill", "none");
                        $('.piechart text').css("fill",$('body').css('color'));
                        $('#pie_msg_title').text('Total Votes');
                        $('#pie_msg_val').text(data.p_total);
                    }
                });
            }, dur);

//BARCHART CHANGES
            if(u_email && !(voted)){
                socket.emit('getVoted', {u_email: u_email, p_id: pollid});
            }
            voteTimeData = [{name:'Average', value: Math.round(data.s_tavg*1000)/1000}, {name:'You', value: s_vtime}];
            drawVoteTime(chart, voteTimeData, y, yAxis);
            socket.on('setVoteTime', function (time) {
                s_vtime = (time) ? time/1000 : 0;
                voteTimeData = [{name:'Average', value: Math.round(data.s_tavg*1000)/1000}, {name:'You', value: s_vtime}];
                drawVoteTime(chart, voteTimeData, y, yAxis);
            });
            $('.barchart rect').css('fill','#'+chart_solocolor);
            $('.barchart .s_votetime').css('text-shadow','-1px -1px #'+chart_solocolor
                                                       + ', 1px -1px #'+chart_solocolor
                                                       + ', -1px 1px #'+chart_solocolor
                                                       + ', 1px 1px #'+chart_solocolor);

//VIEWERS COUNT CHANGES
            socket.emit('getViewers', pollid);
            $('#activeViewers text tspan').css("fill", "#"+chart_solocolor);
            socket.on('setViewers', function (d) {
                $('#tspanActiveViewers').text((d === null) ? 1 : d);
            });
            setInterval(function(){socket.emit('getViewers', pollid)}, 5000);
//MAP CHANGES
            for(var i in data.data){
                if(i == 'hiding'){continue;}
                mapdata[i] = data.data[i];
            }
            $('.radio-label').css({'border-color': "#"+chart_solocolor});
            switch(geo_loc.countryCode){
                case 'CA':
                    $('#radioCA').click();
                    break;
                case 'US':
                    $('#radioUS').click();
                    break;
            }
            for(var i in mapdata){
                for(var j in mapdata[i]){
                    if(i == 'hiding'){continue;}
                    if(mapdata[i][j].length < 1){
                        continue;
                    }
                    rgn_color[i][j] = calcRgnColor(data.c_n, choice_colors, mapdata[i][j]);
                    for(var k=0;k<data.c_n;k++){
                        //increment each color's total votes for calculations later
                        choice_colors[k].votes += mapdata[i][j][k];
                    }
                }
            }
            for(var i in mapdata){
                if(i == 'hiding'){continue;}
                map[i].series.regions[0].setValues(rgn_color[i]);
            }

            // $('#click').click(function () {
            //     for (i in rgn_color){
            //         var tmp = [];
            //         for(var j=0; j<data.c_n;j++){
            //             tmp.push(Math.floor(Math.random()*10));
            //         }
            //         rgn_color[i] = calcRgnColor(data.c_n, choice_colors, tmp);
            //     }
            //     map.series.regions[0].setValues(rgn_color);
            // });
            //$(".jvectormap-region[data-code='US-WA']").attr("fill","#cc0000");
            //$(".jvectormap-region[data-code='US-WA']").attr("fill-opacity", 0);
            //var tmp = 'US-AR';
            //$(".jvectormap-region[data-code='"+tmp+"']").css({'opacity':0});
            // $('#map').bind('onRegionOut.jvectormap', function(event, code){
            //     $(".jvectormap-region[data-code='US-WA']").attr("fill","#cc0000");
            // });

//BUTTON CHANGES
            //create buttons
            if(!voted){
                $('#choices .radio').html('');
                for(i in choice_colors){
                    $('#choices .radio').append('<input id="c'+ i +'"class="btnChoice" type="radio" name="vote" value="'+ i +'" /><label for="c'+i+'" style="background-color:#'+choice_colors[i].color+'"><div><div>'+choice_colors[i].c_text+'</div></div></label>');
                }
            }
            socket.on('setVoted', function (d) {
                setTimeout(function () {
                    if(d != null){
                        $('label[for="c'+d+'"]').click();
                        $('input[name="vote"]').attr({'disabled': 'true'});
                        voted = true;
                    }
                }, 100);
            });
            //graphs done drawing, grab time
            votetime = $.now();
            $('input[name="vote"]').click(function(){
                //get time once
                if (votetime>1383809658764){
                    votetime = (s_vtime) ? s_vtime*1000 :($.now()-votetime); //get votetime once
                    if(!s_vtime){
                        voteTimeData = [{name:'Average', value: Math.round(dual.averager(votetime, data.s_tavg*1000, data.p_total))/1000}, {name:'You', value: votetime/1000}];
                        drawVoteTime(chart, voteTimeData, y, yAxis);
                        s_vtime = votetime/1000;
                    };
                }

                if((u_email) && !voted){
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
                    voted = true;
                }
                else if(!(u_email)){
                    getSignUpBox($('label[for="' + $(this).attr('id') + '"]'));
                }
            });
        }
        else{
            $('#question').html("Poll not found <span style='font-weight:bold'>:c</span>");
            console.log('poll not found');
        }
//DISQUS
        // poll?setTimeout(loaddisqus, 1500):$('#messages>span').text("No poll, no comments :c");
    });
});

function drawVoteTime(chart, data, y_scale, yAxis){
    y_scale.domain([0, d3.max(data, function(d){ return ((d.value>100) ? 100 : (d.value)); })]);

    chart.selectAll('.y.axis')
        .transition()
        .duration(dur)
        .call(yAxis);
    chart.selectAll("rect")
        .data(data)
        .transition()
        .duration(dur)
        .attr("y", function(d) { return y_scale((d.value>100) ? 100 : (d.value) ); })
        .attr("height", function(d) { return chartH - y_scale((d.value>100) ? 100 : (d.value)); });
    chart.selectAll("text")
        .data(data)
        .transition()
        .duration(dur)
        .attr("y", function(d) { return y_scale((d.value>100) ? 100 : (d.value)); }) //starts at top of bar        
        .attr("dy", function(d) { return (chartH - y_scale((d.value>100) ? 100 : (d.value)))/2; }) //moves to middle of bar
        .text(function(d) {
            // if(d.value >= 100){ return ">100"+"s";}
            return ((d.value>100)?(">100"+"s"):(d.value+"s"));
        });
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

function getMap(map, _name, rgn_color){
        map = new jvm.WorldMap({
            map: _name,
            container: map,
            zoomButtons: false,
            zoomOnScroll: false,
            regionsSelectable: false,
            backgroundColor: 'none',
            onRegionOver: function(e,code){
                e.preventDefault();
                var opacity = $(".jvectormap-region[data-code='"+code+"']").attr("fill-opacity", 0.3);
            },
            onRegionOut: function(e,code){
                e.preventDefault();
                var opacity = $(".jvectormap-region[data-code='"+code+"']").attr("fill-opacity", 1);
            },
            onRegionLabelShow: function(e, label, code){
                //we only support canada and US for now
                var country = $('[data-code="'+code+'"]').attr('data-country');
                if (country === "CA" || country === "US"){
                    var map = $('#map'+country).vectorMap('get', 'mapObject');
                    var region_name = map.getRegionName(code);
                    var region_results = data.data[country][code];
                    var region_total = 0;
                    var region_c_n = "";
                    $.each(region_results, function(i, d) {
                        region_total += d;
                    });
                    $.each(region_results, function(i, d) {
                        region_c_n += "<tr><td>"+data.c_text[i]+":</td><td>"+d+"</td><td>("+Math.round(d/((region_total==0)?1:region_total)*100*100)/100+"%)</td><td class=\"legend-color\" style=\"background-color:#"+data.c_hex[i]+";\"></td></tr>";
                    });
                    label.html('<div class="map_label"><div style="border-bottom: 1px solid; margin-bottom:0.2rem">'
                        +'<span class="h5"><b>'+region_name+'</b></span><br/>'
                        +'<span class="h6"><b>Total Votes: '+region_total+'</b></span></div>'
                        +'<div><table style="margin:auto" class="align-right">'+region_c_n+'</table></div>'
                        +'</div>');
                }
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
        $('#map'+_name+' .jvectormap-region').attr('data-country', _name);
        return map;
}

function setEmail(_email){
    localStorage.setItem('u_email', _email);
    u_email = _email;
}

function getSignUpBox(sel){
    $('#signup_box').css({
        "visibility": "visible"
    });
    $('#signup_box').dialog({
        resizable: false,
        position: {my:'top', at:'center', of:sel},
        width: 250,
        minHeight: 0,
        buttons:{
            "Close": function () {
                $(this).dialog('close');
            },
            "Vote": {
                id:'signupVote',
                text: 'Vote!',
                click: function (d) {
                    if($('#tbEmail').val()){
                        setEmail($('#tbEmail').val());
                        $('#'+sel.attr('for')).click();
                        $(this).dialog('close');
                    }
                }
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
    //to increase the amount of "paleness", increase multiplier after sat_inv
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