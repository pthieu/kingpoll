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

  setTabs();
});

pie = (function (){
  function Donut(_sel, _pid){
    this.obj = _sel;
    this.pid = _pid;
    this.colors = [];
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
    this.create(innerRadius, outerRadius, pieW, pieH, this.colors);
  };

  Donut.prototype.create = function(r1, r2, w, h, _colors){
    this.colors = _colors;

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
  var tmp = _poll.c_hex;
  tmp.unshift('ddd');
  for(var i=0; i<tmp.length; i++){
    tmp[i] = "#"+tmp[i];
  }
  attrPolls[_poll.p_id] = pie.init(".attr-wrap", _poll.p_id, _poll.c_total);
  attrPolls[_poll.p_id].create(innerRadius, outerRadius, pieW, pieH, tmp);
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
      $(".tab-button").removeClass("active");
      $(this).addClass('active');
      $(".tab-content").slideUp();
      $("."+tabClicked).slideToggle();
    });
  });
}