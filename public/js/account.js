var socket = io.connect();

var innerRadius = 70;
var outerRadius = 100;
var pieW = 200;
var pieH = 200;
var dur = 300;

var donuts;
var attrPolls = {};
var uid;

if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
}
else {
  alert('Please use the latest version of Google Chrome for best compatibility with KingPoll.');
}

//DOM READY
$(function() {
  // config
  var load_npolls = 6; // number of polls loaded per loadmore click
  uid = window.location.pathname;
  uid = uid.replace(/\/u\//, "");

  // socket.emit('getAttrPolls', uid, 0, load_npolls, 0, 'newest'); // attr polls
  socket.emit('getAttrPolls', uid, 1, load_npolls, 0, 'newest'); // upl polls
  socket.emit('getHighlightPolls', uid); // hightlights // hidden for now until we get functinoality in 

  $('.attr-wrap .loadmore').click(function() {
    socket.emit('getAttrPolls', uid, 0, load_npolls, $('.attr-wrap .pie-wrap').length, 'newest'); // attr polls
  });
  $('.upl-wrap .loadmore').click(function() {
    socket.emit('getAttrPolls', uid, 1, load_npolls, $('.upl-wrap .pie-wrap').length, 'newest'); // attr polls
  });

  setTabs();
  $('[data-index=attr-wrap]').click();

  var u_dp = document.getElementById('upload_dp');
  if (!!u_dp) u_dp.addEventListener('change', handleUploadDP);
  var save_udp = document.getElementById('save-udp-button');
  if (!!save_udp) save_udp.addEventListener('click', setUDP);

  socket.emit('getUDP', uid); //get displaypic
  socket.on('getUDP_OK', getUDP_OK);
  socket.emit('getBigFive', uid); //get displaypic
  socket.on('getBigFive_OK', getBigFive_OK);
});

pie = (function() {
  function Donut(_sel_wrap, _sel_svg, _pid, _ctotal, _ptotal) {
    this.wrap = _sel_wrap;
    this.obj = _sel_svg; //Donut Chart SVG object
    this.pid = _pid; //poll id
    this.colors = []; //colors
    this.ctext = []; //choice text
    this.ctotal = _ctotal; //total votes in each choice text
    this.total = _ptotal; //total votes together
    this.length; // length of choices
  }

  Donut.prototype.update = function(_ctotal) {
    var total = 0;
    //need to know if pie has values
    for (var i = 0; i < _ctotal.length; i++) {
      total += _ctotal[i];
    }
    _ctotal.unshift((total > 0) ? 0 : 1);
    //add data at the beginning for grey circle or no circle
    this.total = total;
    this.ctotal = _ctotal;
    this.obj.datum(_ctotal).transition();
    this.create(innerRadius, outerRadius, pieW, pieH, {
      'colors': this.colors,
      'text': this.text
    });
  };

  Donut.prototype.create = function(r1, r2, w, h, _choices) {
    this.colors = _choices.colors;
    this.ctext = _choices.ctext;
    this.length = _choices.colors.length - 1;

    var dis = this;
    this.obj.each(function(_data) {
      var pie_instance = d3.layout.pie()
        .sort(null);

      var arc = d3.svg.arc()
        .innerRadius(r1)
        .outerRadius(r2);

      //first select the svg g arc
      var svg = d3.select(this).select(".pie-poll > g");
      //if svg tag is empty, we're going to append a g
      if (svg.empty()) {
        svg = d3.select(this).select(".pie-poll")
        // .attr("id", "pieTotal")
        // .attr("class","pie-poll")
        .attr("width", w)
          .attr("height", h)
          .append("g")
          .attr("transform", "translate(" + w / 2 + "," + r2 + ")")
          .attr("class", "piechart");

        dis.createLegend(r1, r2);

        //create middle circle
        var svg_pie_bg = svg.append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", r1 - 10)
          .attr("fill", "none")
          .attr("class", "pieTotalBG");
        var svg_pie_msg = svg.append("text") // later svg is "higher"
          .attr("class", "piechart_msg")
        svg_pie_msg.append("tspan")
          .attr("x", 0)
          .attr("y", 1)
          .attr("class", 'pie_msg_title')
          .attr("text-anchor", "middle")
          .text("Total Votes:");
        svg_pie_msg.append("tspan")
          .attr("x", 0)
          .attr("y", 28)
          .attr("class", 'pie_msg_val')
          .attr("text-anchor", "middle")
          .text(dis.total);
      }

      //create arcs      
      var path = svg.selectAll("path")
        .data(pie_instance);
      path.enter().append("path")
        .attr("fill", function(d, i) {
          return dis.colors[i];
        })
        .attr("d", arc)
        .each(function(d) {
          this._current = d;
        })
        .attr("class", "vote_arc")
        .attr("value", function(d, i) {
          return (i);
        });;

      path.transition()
        .duration(dur)
        .attrTween("d", arcTween)
        .each('end', function() {});

      path.exit().remove();

      function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
          return arc(i(t));
        };
      }
    });
    //apply hover state after all arcs are created
    var piechart = $('[data-pid=' + dis.pid + ']');
    piechart.find('.vote_arc').off('hover'); //remove hover event handlers before so it doesn't lag
    piechart.find('.vote_arc').hover(function() {
      if ($(this).attr('value') > 0) {
        var g_wrap = $(this).parent();
        g_wrap.find('.pieTotalBG').attr("fill", $(this).attr('fill'));
        g_wrap.find("text").css("fill", "#fff");
        g_wrap.find('.pie_msg_title').text(Math.floor(dis.ctotal[$(this).attr('value')] / dis.total * 10000) / 100 + "%");
        g_wrap.find('.pie_msg_val').text(dis.ctotal[$(this).attr('value')]);
      }
    }, function() {
      var g_wrap = $(this).parent();
      if ($(this).attr('value') > 0) {
        g_wrap.find('.pieTotalBG').attr("fill", "none");
        g_wrap.find('text').css("fill", $('body').css('color'));
        g_wrap.find('.pie_msg_title').text('Total Votes');
        g_wrap.find('.pie_msg_val').text(dis.total);
      }
    });
  }

  Donut.prototype.createLegend = function(r1, r2) {
    var dis = this;
    var legend = '<div class="legend table">';
    for (var i = 0; i < dis.length; i++) {
      legend += '<div class="legend-element tr">' + '<div class="td"><div class="legend-color" style="background-color:' + dis.colors[i + 1] + '"></div></div>' + '<div class="td legend-text">' + dis.ctext[i];
      legend += '</div></div>';
    }
    legend += '</div>';
    $(dis.wrap + ' [data-pid=' + dis.pid + ']').append(legend);
  }

  //internal vars here
  var donut = {
    init: function(_sel, _pid, _ctotal, _ptotal, _ptitle) {
      //make data skeleton to create arcs on pie chart
      var tmp = [];
      for (var i = 0; i < _ctotal.length; i++) {
        tmp.push(0);
      }
      tmp.unshift(1);
      $(_sel).append('<div class="pie-wrap" data-pid="' + _pid + '"><div class="ptitle"><h4><a href="/p/' + _pid + '">' + _ptitle + '</a><h4></div><svg class="pie-poll"></svg></div>')
      return new Donut(_sel, d3.select('.pie-wrap[data-pid="' + _pid + '"]').datum(tmp), _pid, _ctotal, _ptotal);
    }
  }
  return donut;
}());

//get user info (filtered)
function getUserInfo() {}
//get KP standard at tribute polls
function getAttrPolls(_uid, _type) {
  socket.emit('getAttrPolls', _uid, _type);
}
socket.on('setUDP_OK', function() {});
//trigger poll update

socket.on('setAttrPolls', function(_poll, _type) {

  if (!_poll) {
    switch (_type) {
      case 0:
        var type = '.attr-wrap'
        break;
      case 1:
        var type = '.upl-wrap'
        break;
    }

    $(type + ' .loadmore').unbind().click(function() {
      window.location.href = '/new/' + uid;
    });
    $(type + ' .loadmore').text(['No polls found! Click to make a poll about ', uid, '!'].join(''));

    return;
  } // if no poll found i.e. either run out of polls or user never had any

  var type_wrap;
  switch (_type) {
    case 0:
      type_wrap = '.attr-wrap .attr';
      break;
    case 1:
      type_wrap = '.upl-wrap .upl'
      break;
  }
  //add initial grey ddd and also add # for hex colors
  var choices = {
    'colors': _poll.c_hex,
    'ctext': _poll.c_text
  };
  choices.colors.unshift('ddd');
  for (var i = 0; i < choices.colors.length; i++) {
    choices.colors[i] = "#" + choices.colors[i];
  }
  attrPolls[_poll.p_id] = pie.init(type_wrap, _poll.p_id, _poll.c_total, _poll.p_total, _poll.p_q);
  attrPolls[_poll.p_id].create(innerRadius, outerRadius, pieW, pieH, choices);
  attrPolls[_poll.p_id].update(_poll.c_total);
});
//Set the highlighted polls on the profile page
socket.on('setHighLightPolls', function(_poll) {
  $('.highlight-wrap .highlight .no_hl_msg').hide();
  var type_wrap = '.highlight-wrap .highlight';
  //add initial grey ddd and also add # for hex colors
  var choices = {
    'colors': _poll.c_hex,
    'ctext': _poll.c_text
  };
  choices.colors.unshift('ddd');
  for (var i = 0; i < choices.colors.length; i++) {
    choices.colors[i] = "#" + choices.colors[i];
  }
  attrPolls[_poll.p_id] = pie.init(type_wrap, _poll.p_id, _poll.c_total, _poll.p_total, _poll.p_q);
  attrPolls[_poll.p_id].create(innerRadius, outerRadius, pieW, pieH, choices);
  attrPolls[_poll.p_id].update(_poll.c_total);
});
socket.on('updateAttrPolls', function(_d) {});
//get all polls about user that are user generated
function getUPL() {}
//get list of polls user created
function getPolls() {}

function setTabs() {
  $(".tab-button").each(function() {
    $(this).on('click', function() {
      var tabClicked = $(this).attr('data-index');
      if (!$(this).hasClass('active')) {
        $(".tab-button").removeClass("active");
        $(this).addClass('active');
        $(".tab-content").slideUp('fast');
        $("." + tabClicked).slideToggle('fast');
      }
      else {
        $("." + tabClicked).slideToggle('fast');
        $(this).removeClass('active');
      }
    });
  });
}

function handleUploadDP(e) {
  e.stopPropagation();
  e.preventDefault();

  var files = e.target.files;
  if (!(files[0].type) || !files[0].type.match(/image/)) {
    return;
  }
  //start a new read stream per file
  var reader = new FileReader();
  var file = {};

  file['name'] = files[0].name;
  file['type'] = files[0].type;
  file['src'] = window.URL.createObjectURL(files[0]);
  reader.onloadend = (function(f) {
    //we return an object because we want variable file to be in the scope of the function (as variable f)
    return function(e) {
      var img = new Image();
      img.src = e.target.result;
      //check if image <=160x160
      if (!checkImgSize(img)) {
        console.log('height and width must be no larger than 160 each');
        return;
      }
      $('.account #u_dp').attr('src', img.src);
      $('.account #save-udp-button').removeClass('hidden');
    };
  })(file); // this is using the file variable we defined earlier

  //this is async
  reader.readAsDataURL(files[0]);
  // files.push(file);
}

function setUDP() {
  var src = $('.account #u_dp').attr('src');
  var img = new Image();
  img.src = src;

  //check size ok again
  if (!checkImgSize(img)) return false;

  socket.emit('setUDP', uid, img.src); // attr polls
  $('.account #save-udp-button').addClass('hidden');
}

function getUDP_OK(_udp) {
  if (!!_udp) {
    $('.account #u_dp').attr('src', _udp);
  }
}

function checkImgSize(img) {
  return (img.width <= 160 || img.height <= 160) ? true : false;
}

function getBigFive_OK(d) {
  var w = 500;
  var h = 500;

  var colorscale = d3.scale.category10();

  //Data
  var tmpdata = [
    [{
      axis: "Openness to experience",
      desc: "Inventive/curious(100%) vs. consistent/cautious(0%) - Appreciation for art, emotion, adventure, unusual ideas, curiosity, and variety of experience. Openness reflects the degree of intellectual curiosity, creativity and a preference for novelty and variety a person has. It is also described as the extent to which a person is imaginative or independent, and depicts a personal preference for a variety of activities over a strict routine. Some disagreement remains about how to interpret the openness factor, which is sometimes called \"intellect\" rather than openness to experience.",
      value: 0.59
    }, {
      axis: "Conscientiousness",
      desc: "Efficient/organized(100%) vs. easy-going/careless(0%) - A tendency to be organized and dependable, show self-discipline, act dutifully, aim for achievement, and prefer planned rather than spontaneous behavior.",
      value: 0.56
    }, {
      axis: "Extraversion",
      desc: "Outgoing/energetic (100%) vs. solitary/reserved(0%) - Energy, positive emotions, surgency, assertiveness, sociability and the tendency to seek stimulation in the company of others, and talkativeness.",
      value: 0.42
    }, {
      axis: "Agreeableness",
      desc: "Friendly/compassionate(100%) vs. analytical/detached(0%) - A tendency to be compassionate and cooperative rather than suspicious and antagonistic towards others. It is also a measure of one's trusting and helpful nature, and whether a person is generally well tempered or not.",
      value: 0.34
    }, {
      axis: "Neuroticism",
      desc: "Sensitive/nervous(0%) vs. secure/confident(100%) - The tendency to experience unpleasant emotions easily, such as anger, anxiety, depression, and vulnerability. Neuroticism also refers to the degree of emotional stability and impulse control and is sometimes referred to by its low pole, \"emotional stability\".",
      value: 0.48
    }]
  ];

  //Options for the Radar chart, other than default
  var mycfg = {
    w: w,
    h: h,
    maxValue: 1,
    levels: 5,
    ExtraWidthX: 210,
    ExtraWidthY: 50,
    TranslateX: 105,
    TranslateY: 50,
    factor:0.95
  }

  //Call function to draw the Radar chart
  //Will expect that data is in %'s
  RadarChart.draw(".attr-wrap", d, mycfg);
}
