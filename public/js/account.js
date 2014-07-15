var socket = io.connect();

var innerRadius = 70;
var outerRadius = 100;
var pieW = 200;
var pieH = 200;
var dur = 300;

var donuts;
var pie_colors = ['#ddd','#e74c3c','#e67e22','#e1c42f','#2ecc51','#3498db','#9b59b6','#34495e'];
var tmp = {val:[0,2,6,8], hex:['#aaa','#f00']};


//DOM READY
$(function () {
  var test_donut = pie.init(".attr-wrap");
  test_donut.create(innerRadius, outerRadius, pieW, pieH, ['#ddd']);
  test_donut.update({val:[0,2,4]});
  setTimeout(function () {
    test_donut.update({val:[0,4,4]});
  },2000);
});

pie = (function (){
  function Donut(_sel){
    this.obj = _sel;
  }

  Donut.prototype.update = function(_data){
    this.obj.datum(_data.val).transition();
    this.create(innerRadius, outerRadius, pieW, pieH, pie_colors);
  };

  Donut.prototype.create = function(r1, r2, w, h, color){
    this.obj.each(function (_data) {
      var pie_instance = d3.layout.pie()
      .sort(null);

      var arc = d3.svg.arc()
      .innerRadius(r1)
      .outerRadius(r2);

      //first select the svg g arc
      var svg = d3.select(this).select(".attr-polls > g");
      //if svg tag is empty, we're going to append a g
      if (svg.empty()) {
        svg = d3.select(this).select(".attr-polls")
        // .attr("id", "pieTotal")
        // .attr("class","attr-polls")
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
    init: function(_sel){
      return new Donut(d3.select(_sel).datum([1]));
    }
  }
  return donut;
}());

//get user info (filtered)
function getUserInfo(){}
//get KP standard at tribute polls
function getAttrPolls(){}
//get all polls about user that are user generated
function getUPL(){}
//get list of polls user created
function getPolls(){}