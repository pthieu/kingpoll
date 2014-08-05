var socket = io.connect();

var innerRadius = 70;
var outerRadius = 100;
var pieW = 200;
var pieH = 200;
var dur = 300;

var donuts;
var attrPolls = {};

//DOM READY
$(function () {
  var uid = window.location.pathname;
  uid = uid.replace(/\/u\//, "");
  
  socket.emit('getAttrPolls', uid, 0);
  socket.emit('getAttrPolls', uid, 1);
  socket.emit('getHighlightPolls', uid);

  //test click creates attr polls for current user
  $('.test').on('click', function () {
    //create kingpoll_attr polls
    socket.emit('createAttrPolls', uid, 0);
  });
  $('.test2').on('click', function () {
    //create kingpoll_attr polls
    socket.emit('createAttrPolls', uid, 1);
  });
  setTabs();
  $('[data-index=highlight-wrap]').click();
});

pie = (function (){
  function Donut(_sel_wrap, _sel_svg, _pid, _ctotal, _ptotal){
    this.wrap = _sel_wrap;
    this.obj = _sel_svg; //Donut Chart SVG object
    this.pid = _pid; //poll id
    this.colors = []; //colors
    this.ctext = []; //choice text
    this.ctotal = _ctotal; //total votes in each choice text
    this.total = _ptotal; //total votes together
    this.length; // length of choices
  }

  Donut.prototype.update = function(_ctotal){
    var total = 0;
    //need to know if pie has values
    for(var i=0; i<_ctotal.length; i++){
      total += _ctotal[i];
    }
    _ctotal.unshift((total>0)?0:1);
    //add data at the beginning for grey circle or no circle
    this.total = total;
    this.ctotal = _ctotal;
    this.obj.datum(_ctotal).transition();
    this.create(innerRadius, outerRadius, pieW, pieH, {'colors':this.colors, 'text':this.text});
  };

  Donut.prototype.create = function(r1, r2, w, h, _choices){
    this.colors = _choices.colors;
    this.ctext = _choices.ctext;
    this.length = _choices.colors.length-1;

    var dis = this;
    this.obj.each(function (_data) {
      var pie_instance = d3.layout.pie()
      .sort(null);

      var arc = d3.svg.arc()
      .innerRadius(r1)
      .outerRadius(r2);

      //first select the svg g arc
      var svg = d3.select(this).select(".attr-poll > g");
      //if svg tag is empty, we're going to append a g
      if (svg.empty()) {
        svg = d3.select(this).select(".attr-poll")
        // .attr("id", "pieTotal")
        // .attr("class","attr-poll")
        .attr("width", w)
        .attr("height", h)
        .append("g")
        .attr("transform", "translate(" + w / 2 + "," + r2 + ")")
        .attr("class","piechart");

        dis.createLegend(r1,r2);

//create middle circle
        var svg_pie_bg = svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", r1-10)
        .attr("fill", "none")
        .attr("class", "pieTotalBG");
        var svg_pie_msg = svg.append("text") // later svg is "higher"
                    .attr("class", "piechart_msg")
        svg_pie_msg.append("tspan")
                    .attr("x", 0)
                    .attr("y", 1)
                    .attr("class",'pie_msg_title')
                    .attr("text-anchor", "middle")
                    .text("Total Votes:");
        svg_pie_msg.append("tspan")
                    .attr("x", 0)
                    .attr("y", 28)
                    .attr("class",'pie_msg_val')
                    .attr("text-anchor", "middle")
                    .text(dis.total);
      }

//create arcs      
      var path = svg.selectAll("path")
      .data(pie_instance);
      path.enter().append("path")
      .attr("fill", function (d, i) {
        return dis.colors[i];
      })
      .attr("d", arc)
      .each(function (d) {
        this._current = d;
      })
      .attr("class", "vote_arc")
      .attr("value", function(d,i) {
        return (i);
      });;

      path.transition()
      .duration(dur)
      .attrTween("d", arcTween)
      .each('end', function () {
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
//apply hover state after all arcs are created
    var piechart = $('[data-pid='+dis.pid+']');
    piechart.find('.vote_arc').off('hover'); //remove hover event handlers before so it doesn't lag
    piechart.find('.vote_arc').hover(function () {
      if ($(this).attr('value') > 0){
        var g_wrap = $(this).parent();
          g_wrap.find('.pieTotalBG').attr("fill", $(this).attr('fill'));
          g_wrap.find("text").css("fill","#fff");
          g_wrap.find('.pie_msg_title').text(Math.floor(dis.ctotal[$(this).attr('value')]/dis.total*10000)/100+"%");
          g_wrap.find('.pie_msg_val').text(dis.ctotal[$(this).attr('value')]);
      }
    }, function (){
      var g_wrap = $(this).parent();
      if ($(this).attr('value') > 0) {
          g_wrap.find('.pieTotalBG').attr("fill", "none");
          g_wrap.find('text').css("fill", $('body').css('color'));
          g_wrap.find('.pie_msg_title').text('Total Votes');
          g_wrap.find('.pie_msg_val').text(dis.total);
      }
    });
  }

  Donut.prototype.createLegend = function(r1, r2){
    var dis = this;
    var legend = '<div class="legend table">';
    for(var i=0; i<dis.length;i++){
      legend += '<div class="legend-element tr">'
             + '<div class="td"><div class="legend-color" style="background-color:'+dis.colors[i+1]+'"></div></div>'
             + '<div class="td legend-text">'+dis.ctext[i];
      legend += '</div></div>';
    }
    legend += '</div>';
    $('[data-pid='+dis.pid+']').append(legend);
  }
  
  //internal vars here
  var donut = {
    init: function(_sel, _pid, _ctotal, _ptotal, _ptitle){
      //make data skeleton to create arcs on pie chart
      var tmp = [];
      for(var i=0; i<_ctotal.length; i++){
        tmp.push(0);
      }
      tmp.unshift(1);
      $(_sel).append('<div class="pie-wrap" data-pid="'+_pid+'"><div class="ptitle"><a href="/p/'+_pid+'">'+_ptitle+'</a></div><svg class="attr-poll"></svg></div>')
      return new Donut(_sel, d3.select('.pie-wrap[data-pid="'+_pid+'"]').datum(tmp), _pid, _ctotal, _ptotal);
    }
  }
  return donut;
}());

//get user info (filtered)
function getUserInfo(){}
//get KP standard at tribute polls
function getAttrPolls(_uid, _type){
  socket.emit('getAttrPolls', _uid, _type);
}
//trigger poll update
socket.on('setAttrPolls', function (_poll, _type) {
  var type_wrap;
  switch(_type){
    case 0:
      type_wrap = '.attr-wrap';
      break;
    case 1:
      type_wrap = '.upl-wrap'
      break;
  }
  //add initial grey ddd and also add # for hex colors
  var choices = {'colors':_poll.c_hex, 'ctext': _poll.c_text};
  choices.colors.unshift('ddd');
  for(var i=0; i<choices.colors.length; i++){
    choices.colors[i] = "#"+choices.colors[i];
  }
  attrPolls[_poll.p_id] = pie.init(type_wrap, _poll.p_id, _poll.c_total, _poll.p_total, _poll.p_q);
  attrPolls[_poll.p_id].create(innerRadius, outerRadius, pieW, pieH, choices);
  attrPolls[_poll.p_id].update(_poll.c_total);
});
//Set the highlighted polls on the profile page
socket.on('setHighLightPolls', function (_poll) {
  var type_wrap = '.highlight-wrap';
  //add initial grey ddd and also add # for hex colors
  var choices = {'colors':_poll.c_hex, 'ctext': _poll.c_text};
  choices.colors.unshift('ddd');
  for(var i=0; i<choices.colors.length; i++){
    choices.colors[i] = "#"+choices.colors[i];
  }
  attrPolls[_poll.p_id] = pie.init(type_wrap, _poll.p_id, _poll.c_total, _poll.p_total, _poll.p_q);
  attrPolls[_poll.p_id].create(innerRadius, outerRadius, pieW, pieH, choices);
  attrPolls[_poll.p_id].update(_poll.c_total);
});
socket.on('updateAttrPolls', function (_d) {
});
//get all polls about user that are user generated
function getUPL(){}
//get list of polls user created
function getPolls(){}

function setTabs(){
  $(".tab-button").each(function(){
    $(this).on('click', function(){
      var tabClicked = $(this).attr('data-index');
      if (!$(this).hasClass('active')){
        $(".tab-button").removeClass("active");
        $(this).addClass('active');
        $(".tab-content").slideUp('fast');
        $("."+tabClicked).slideToggle('fast');
      }
      else{
        $("."+tabClicked).slideToggle('fast');
        $(this).removeClass('active');
      }
    });
  });
}