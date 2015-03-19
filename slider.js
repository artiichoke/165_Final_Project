/* slider.js

var margin = {
        top: -150,
        right: 50,
        bottom: 0,
        left: 50
    },
    width = 960 - margin.left - margin.right,
    height = 200 - margin.bottom - margin.top;

// init x domain and range
var x = d3.scale.linear()
    .domain([2004, 2014])
    .range([0, width])
    .clamp(true); // forces values to be within range

// init brush
var brush = d3.svg.brush()
    .x(x)
    .extent([0, 0])
    .on("brush", brushed);

// init svg
var svg3 = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
   //affects map?
    .attr("height", 40)//height + margin.top + margin.bottom)    
    .append("g")
  //affects slider?
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg3.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height / 2 + ")")
    .call(d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function (d) {
            return d + "";
        })
        .tickSize(0)
        .tickPadding(12))
    .select(".domain")
    .select(function () {
        return this.parentNode.appendChild(this.cloneNode(true));
    })
    .attr("class", "halo");

var slider = svg3.append("g")
    .attr("class", "slider")
    .call(brush);

slider.selectAll(".extent,.resize")
    .remove();

slider.select(".background")
    .attr("height", height);

var handle = slider.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate(0," + height / 2 + ")")
    .attr("r", 9);

slider
    .call(brush.event)
    .transition() // gratuitous intro!
    .duration(750)
    .call(brush.extent([70, 70]))
    .call(brush.event);

function brushed() {
        var value = brush.extent()[0];

        if (d3.event.sourceEvent) { // not a programmatic event
            value = x.invert(d3.mouse(this)[0]);
            brush.extent([value, value]);
        }

        handle.attr("cx", x(value));
    }
*/

/* New slider.js */

var step = 0;
var current_year = 2008;
var filename = ("data" + current_year + ".csv").toString();

display(current_year);

d3.select("#slider").on('change', function(d) {       
       var incrementation = parseInt(this.value);
       current_year = (2008 + incrementation);
       d3.select("#year").text(""+current_year);
       svg.selectAll("path").remove();
       svg.selectAll(".dot").remove();
       return display(current_year);
});