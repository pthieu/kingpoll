//Practically all this code comes from https://github.com/alangrafu/radar-chart-d3
//I only made some additions and aesthetic adjustments to make the chart look better 
//(of course, that is only my point of view)
//Such as a better placement of the titles at each line end, 
//adding numbers that reflect what each circular level stands for
//Not placing the last level and slight differences in color
//
//For a bit of extra information check the blog about it:
//http://nbremer.blogspot.nl/2013/09/making-d3-radar-chart-look-bit-better.html

var RadarChart = {
  draw: function(id, d, options) {
    var cfg = {
      radius: 5,
      w: 600,
      h: 600,
      factor: 1,
      factorLegend: .85,
      levels: 3,
      maxValue: 0,
      radians: 2 * Math.PI,
      opacityArea: 0.5,
      ToRight: 5,
      TranslateX: 80,
      TranslateY: 50,
      ExtraWidthX: 100,
      ExtraWidthY: 100,
      color: d3.scale.category10()
    };

    //check if options/config is passed in
    if ('undefined' !== typeof options) {
      for (var i in options) {
        if ('undefined' !== typeof options[i]) {
          cfg[i] = options[i];
        }
      }
    }
    cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i) {
      return d3.max(i.map(function(o) {
        return o.value;
      }))
    }));
    var allAxis = (d[0].map(function(i, j) {
      return i.axis; //returns the name of the corner label
    }));
    var total = allAxis.length; //this control number of points *2 will make chart a semi circle
    var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2); //controls radius of web. seems like it has to be editted somewhere lse too
    var Format = d3.format('%'); //format of chart numbers
    d3.select(id).select("svg").remove();

    var g = d3.select(id)
      .append("svg")
      .attr("width", cfg.w + cfg.ExtraWidthX)
      .attr("height", cfg.h + cfg.ExtraWidthY)
      .append("g")
      .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");;

    var tooltip;

    //Circular segments i.e. grey bg web lines
    for (var j = 0; j < cfg.levels - 1; j++) {
      var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
      g.selectAll(".levels")
        .data(allAxis)
        .enter()
        .append("svg:line")
        .attr("x1", function(d, i) {
          return levelFactor * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
        })
        .attr("y1", function(d, i) {
          return levelFactor * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
        })
        .attr("x2", function(d, i) {
          return levelFactor * (1 - cfg.factor * Math.sin((i + 1) * cfg.radians / total));
        })
        .attr("y2", function(d, i) {
          return levelFactor * (1 - cfg.factor * Math.cos((i + 1) * cfg.radians / total));
        })
        .attr("class", "line")
        .style("stroke", "grey")
        .style("stroke-opacity", "0.75")
        .style("stroke-width", "0.3px")
        .attr("transform", "translate(" + (cfg.w / 2 - levelFactor) + ", " + (cfg.h / 2 - levelFactor) + ")");
    }

    //chart axis configuration
    //Text indicating at what % each level is
    for (var j = 0; j < cfg.levels; j++) {
      var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
      g.selectAll(".levels")
        .data([1]) //dummy data
      .enter()
        .append("svg:text")
        .attr("x", function(d) {
          return levelFactor * (1 - cfg.factor * Math.sin(0)); //axis label x angle
        })
        .attr("y", function(d) {
          return levelFactor * (1 - cfg.factor * Math.cos(0)); //axis label y angle
        })
        .attr("class", "legend")
        .style("font-family", "sans-serif")
        .style("font-size", "10px")
        .attr("transform", "translate(" + (cfg.w / 2 - levelFactor + cfg.ToRight) + ", " + (cfg.h / 2 - levelFactor) + ")") //translate axis labels 
      .attr("fill", "red")
        .text(Format((j + 1) * cfg.maxValue / cfg.levels)); // label values. starts at first web, not center. maxValue/#webs
    }

    series = 0;
    
    var axis = g.selectAll(".axis")
      .data(allAxis)
      .enter()
      .append("g")
      .attr("class", "axis");

    //this is the line for each major corner
    axis.append("line")
      .attr("x1", cfg.w / 2)
      .attr("y1", cfg.h / 2)
      .attr("x2", function(d, i) {
        return cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
      })
      .attr("y2", function(d, i) {
        return cfg.h / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
      })
      .attr("class", "line")
      .style("stroke", "#517da2")
      .style("shape-rendering", "optimizeSpeed")
      .style("stroke-width", "1px");

    //this is config for labels of each corner
    axis.append("text")
      .attr("class", "legend corner")
      .text(function(d) {
        return d;
      })
      .style("font-family", "sans-serif")
      .style("font-size", "15px")
      .style("font-weight", "bold")
      .style("fill", "#517da2")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("transform", function(d, i) {
        return "translate(0, -20)"; //
      })
      .attr("x", function(d, i) {
        return cfg.w / 2 * (1 - cfg.factorLegend * Math.sin(i * cfg.radians / total)) - 60 * Math.sin(i * cfg.radians / total);
      })
      .attr("y", function(d, i) {
        return cfg.h / 1.95 * (1 - Math.cos(i * cfg.radians / total)) - 20 * Math.cos(i * cfg.radians / total);
      })
    
    //go through each data in the set, select the corners it's bound to, attach it as a data
    d.forEach(function(d) {
      g.selectAll(".axis .legend.corner")
        .data(d)
        .each(function (d,i) {
          d3.select(this).attr('data-desc', d.desc);
          d3.select(this).attr('data-corner', d.axis);
          d3.select(this).attr('data-pid', d.pid);
        })
    });

    d.forEach(function(y, x) {
      dataValues = [];
      g.selectAll(".nodes")
        .data(y, function(j, i) {
          dataValues.push([
        cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
        cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))]);
        });
      dataValues.push(dataValues[0]);
      g.selectAll(".area")
        .data([dataValues])
        .enter()
        .append("polygon")
        .attr("class", "radar-chart-serie" + series)
        .style("stroke-width", "2px")
        .style("stroke", cfg.color(series))
        .attr("points", function(d) {
          var str = "";
          for (var pti = 0; pti < d.length; pti++) {
            str = str + d[pti][0] + "," + d[pti][1] + " ";
          }
          return str;
        })
        .style("fill", function(j, i) {
          return cfg.color(series)
        })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function(d) {
          z = "polygon." + d3.select(this).attr("class");
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", 0.1);
          g.selectAll(z)
            .transition(200)
            .style("fill-opacity", .7);
        })
        .on('mouseout', function() {
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", cfg.opacityArea);
        });
      series++;
    });
    series = 0;

    //go through each node in the data put in
    //use each data to change node circles and tooltips
    d.forEach(function(y, x) {
      g.selectAll(".nodes")
        .data(y).enter()
        .append("svg:circle")
        .attr("class", "radar-chart-serie" + series)
        .attr('r', cfg.radius)
        .attr("alt", function(j) {
          return Math.max(j.value, 0)
        })
        .attr("cx", function(j, i) {
          dataValues.push([
        cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
        cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))]);
          return cfg.w / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total));
        })
        .attr("cy", function(j, i) {
          return cfg.h / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total));
        })
        .attr("data-id", function(j) {
          return j.axis
        })
        .style("fill", cfg.color(series)).style("fill-opacity", .9)
        .on('mouseover', function(d) {
          newX = parseFloat(d3.select(this).attr('cx')) - 10;
          newY = parseFloat(d3.select(this).attr('cy')) - 10;

          tooltip.attr('x', newX)
            .attr('y', newY)
            .text(Format(d.value))
            .style('opacity', 1)
            .style('font-size', '26px')
            .style('font-weight', 'bold')
            .style("shape-rendering", "optimizeSpeed")
            .style('fill', '#ffffff')
            .style('stroke', '#000000')
            .style('stroke-width', '1');

          z = "polygon." + d3.select(this).attr("class");
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", 0.1);
          g.selectAll(z)
            .transition(200)
            .style("fill-opacity", .7);
        })
        .on('mouseout', function() {
          tooltip
            .style('opacity', 0);
          g.selectAll("polygon")
            .style("fill-opacity", cfg.opacityArea);
        })
        .append("svg:title")
        .text(function(j) {
          return Math.max(j.value, 0)
        });

      series++;
    });
    //Tooltip
    tooltip = g.append('text')
      .style('opacity', 0)
      .style('font-family', 'sans-serif')
      .style('font-size', '13px');

    //BELOW IS AN EXAMPLE ON HOW TO ATTACH FOREIGN OBJECT
    // desctip = g.append("foreignObject")
    // .attr("width", '100%')
    // .attr("height", '100%')
    // desctip.append("xhtml:body")
    // .style('opacity', 0)
    // .style('font-family', 'sans-serif')
    // .style('font-size', '13px')

    //jquery for desctips
    $('.axis .legend.corner').each(function (i, e) {
      var jE = $(e);
      var offset = $(e).position();
      var desctip = [
        '<div class="desctip_wrap hidden" style="top:'+(offset.top+jE.height()*1.5)+'px; left:'+(offset.left-250+jE.width()/2)+'px;" data-corner="'+jE.attr('data-corner')+'">',
          '<span class="desctip">',
            jE.attr('data-desc'),
          '</span>',
        '</div>'
      ].join('')
      $('.account .attr-wrap').append(desctip);
      jE.hover(function (e) {
        var corner = $(this).attr('data-corner');
        var desctip = $('.desctip_wrap[data-corner="'+corner+'"]')
        if (e.type === "mouseenter"){
          desctip.removeClass('hidden');
        }
        else{
          desctip.addClass('hidden');
        }
      });
      jE.on('click', function (e) {
        window.location.href='/p/'+$(this).attr('data-pid');
      });
    });
  }
};

// $(function () {
//   var w = 500,
//     h = 500;

//   var colorscale = d3.scale.category10();

//   //Legend titles
//   var LegendOptions = ['Your Statistics'];

//   //Data
//   var d = [
//     [{
//       axis: "Openness to experience",
//       value: 0.59
//     }, {
//       axis: "Conscientiousness",
//       value: 0.56
//     }, {
//       axis: "Extraversion",
//       value: 0.42
//     }, {
//       axis: "Agreeableness",
//       value: 0.34
//     }, {
//       axis: "Neuroticism",
//       value: 0.48
//     }]
/*[{
      axis: "Email",
      value: 0.48
    }, {
      axis: "Social Networks",
      value: 0.41
    }, {
      axis: "Internet Banking",
      value: 0.27
    }]*/
// ];

//Options for the Radar chart, other than default
// var mycfg = {
//   w: w,
//   h: h,
//   maxValue: 1,
//   levels: 5,
//   ExtraWidthX: 200
// }

//Call function to draw the Radar chart
//Will expect that data is in %'s
// RadarChart.draw("#radarchart", d, mycfg);

////////////////////////////////////////////
/////////// Initiate legend ////////////////
////////////////////////////////////////////

// var svg = d3.select('#body')
//   .selectAll('svg')
//   .append('svg')
//   .attr("width", w + 300)
//   .attr("height", h)

// //Create the title for the legend
// var text = svg.append("text")
//   .attr("class", "title")
//   .attr('transform', 'translate(90,0)')
//   .attr("x", w - 70)
//   .attr("y", 10)
//   .attr("font-size", "12px")
//   .attr("font-family", "sans-serif")
//   .attr("fill", "#404040")
//   .text("Big Five personality traits as seen by your peers");

// //Initiate Legend 
// var legend = svg.append("g")
//   .attr("class", "legend")
//   .attr("height", 100)
//   .attr("width", 200)
//   .attr('transform', 'translate(90,20)');
// //Create colour squares
// legend.selectAll('rect')
//   .data(LegendOptions)
//   .enter()
//   .append("rect")
//   .attr("x", w - 65)
//   .attr("y", function (d, i) {
//   return i * 20;
// })
//   .attr("width", 10)
//   .attr("height", 10)
//   .style("fill", function (d, i) {
//   return colorscale(i);
// });
// //Create text next to squares
// legend.selectAll('text')
//   .data(LegendOptions)
//   .enter()
//   .append("text")
//   .attr("x", w - 52)
//   .attr("y", function (d, i) {
//   return i * 20 + 9;
// })
//   .attr("font-size", "11px")
//   .attr("fill", "#737373")
//   .text(function (d) {
//   return d;
// });
// });
