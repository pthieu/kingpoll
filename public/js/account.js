var socket = io.connect();

var innerRadius = 70;
var outerRadius = 100;
var pieW = 200;
var pieH = 200;
var dur = 300;

var donuts;
var pie_colors = ['#ddd','#e74c3c','#e67e22','#e1c42f','#2ecc51','#3498db','#9b59b6','#34495e'];
var tmp = {val:[0,2,6,8], hex:['#aaa','#f00']};

var attrPolls = {};

//DOM READY
$(function () {
  var uid = window.location.pathname;
  uid = uid.replace(/\/u\//, "");
  
  socket.emit('getAttrPolls', uid);

  //test click creates attr polls for current user
  $('.test').on('click', function () {
    socket.emit('createAttrPolls', uid);
  });
});

pie = (function (){
  function Donut(_sel, _pid){
    this.obj = _sel;
    this.pid = _pid;
    this.colors = [];
    this.ctext = [];
    this.length;
  }

  Donut.prototype.update = function(_ctotal){
    var total = 0;
    //need to know if pie has values
    for(var i=0; i<_ctotal.length; i++){
      total += _ctotal[i];
    }
    _ctotal.unshift((total>0)?0:1);
    //add data at the beginning for grey circle or no circle
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
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
        .attr("class","upl_piechart");

        dis.createLegend(r1);

        // var svg_pie_bg = svg.append("circle")
        // .attr("cx", 0)
        // .attr("cy", 0)
        // .attr("r", innerRadius-10)
        // .attr("fill", "none")
        // .attr("id", "pieTotalBG");
        // var svg_pie_msg = svg.append("text") // later svg is "higher"
        //             .attr("class", "piechart_msg")
        // svg_pie_msg.append("tspan")
        //             .attr("x", 0)
        //             .attr("y", -3)
        //             .attr("id",'pie_msg_title')
        //             .text("Total Votes:");
        // svg_pie_msg.append("tspan")
        //             .attr("x", 0)
        //             .attr("y", 22)
        //             .attr("id",'pie_msg_val')
        //             .text("0");
      }
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
        return (i-1);
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
  }

  Donut.prototype.createLegend = function(r){
    var dis = this;
    this.obj.each(function (_data) {
      var svg = d3.select(this).select(".attr-poll > g")

      var legend_xy = r*Math.sin(Math.PI/4); //quadrant
      var legend_wh = r*2*Math.sin(Math.PI/4); //full h/w we can work with
      var rect_h = legend_wh/dis.length;
      var rect_w = 10;
      var margin = 5;
      var text_ybump = 0;

      switch(dis.length){
        case 2:
          var font_size = 30;
          break;
        case 3:
          var font_size = 24;
          break;
        case 4:
          var font_size = 20;
          break;
        case 5:
          var font_size = 18;
          text_ybump = 1;
          break;
        case 6:
          var font_size = 14;
          text_ybump = 2;
          break;
      }

      for(var i=0; i<dis.length;i++){
        svg.append('rect')
           .attr('x', (-legend_xy))
           .attr('y', (-legend_xy+rect_h*i+margin/2))
           .attr('width', rect_w)
           .attr('height', rect_h-margin)
           .attr('fill', dis.colors[i+1])
        svg.append('text')
           .attr('class', "legend_text")
           .attr('x', (-legend_xy+rect_w*2)) // just right of color bar
           .attr('y', (-legend_xy+rect_h*(i)+rect_h/2-margin/2+text_ybump)) // at the top of color bar
           .attr("text-anchor", "start") //horizontal align to left of text
           .attr('alignment-baseline', 'central') // vertical align to middle of text
           .style("font-size", font_size+"px")
           .text(dis.ctext[i]+' - 100%')
      }
    });
  }
  
  //internal vars here
  var donut = {
    init: function(_sel, _uid, _ctotal){
      //make data skeleton to create arcs on pie chart
      var tmp = [];
      for(var i=0; i<_ctotal.length; i++){
        tmp.push(0);
      }
      tmp.unshift(1);
      $(_sel).append('<div class="pie-wrap" data-pid="'+_uid+'"><svg class="attr-poll"></svg></div>')
      return new Donut(d3.select('.pie-wrap[data-pid="'+_uid+'"]').datum(tmp), _uid);
    }
  }
  return donut;
}());

//get user info (filtered)
function getUserInfo(){}
//get KP standard at tribute polls
function getAttrPolls(_uid){
  socket.emit('getAttrPolls', _uid);
}
//trigger poll update
socket.on('setAttrPolls', function (_poll) {
  //add initial grey ddd and also add # for hex colors
  var choices = {'colors':_poll.c_hex, 'ctext': _poll.c_text};
  choices.colors.unshift('ddd');
  for(var i=0; i<choices.colors.length; i++){
    choices.colors[i] = "#"+choices.colors[i];
  }
  attrPolls[_poll.p_id] = pie.init(".attr-wrap", _poll.p_id, _poll.c_total);
  attrPolls[_poll.p_id].create(innerRadius, outerRadius, pieW, pieH, choices);
  attrPolls[_poll.p_id].update(_poll.c_total);
});
socket.on('updateAttrPolls', function (_d) {
});
//get all polls about user that are user generated
function getUPL(){}
//get list of polls user created
function getPolls(){}