/* key.js */

var width = 1050,
    height = 30,
    formatPercent = d3.format(".0%"),
    formatNumber = d3.format(".0f");

var threshold = d3.scale.threshold()
    .domain([.85, .86, .87, .88, .89, .90, .91, .92, .93, .94, .95, .96, .97, .98, .99, 1])

.range([
        'rgb(17, 67, 96)',
        'rgb(32, 78, 104)',
        'rgb(47, 90, 112)',
        'rgb(62, 101, 120)',
        'rgb(78, 112, 128)',
        'rgb(93, 124, 136)',
        'rgb(108, 135, 144)',
        'rgb(123, 146, 152)',
        'rgb(138, 158, 160)',
        'rgb(154, 169, 168)',
        'rgb(169, 180, 176)',
        'rgb(184, 192, 184)',
        'rgb(199, 203, 192)',
        'rgb(214, 214, 200)',
        'rgb(230, 226, 208)',
        ]);


// A position encoding for the key only.
var x = d3.scale.linear()
    .domain([.9, 1])
    .range([0, 300]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(13)
    .tickValues(threshold.domain())
    .tickFormat(function (d) {
        return d === 5 ? formatPercent(d) : formatNumber(100 * d);
    });

//positioning affects the slider
var svg2 = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//positioning affects the key
var g = svg2.append("g")
    .attr("class", "key")
    .attr("transform", "translate(" + (width - 240) / 2 + "," + height / 2 + ")");

g.selectAll("rect")
    .data(threshold.range().map(function (color) {
        var d = threshold.invertExtent(color);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
    }))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function (d) {
        return x(d[0]);
    })
    .attr("width", function (d) {
        return x(d[1]) - x(d[0]);
    })
    .style("fill", function (d) {
        return threshold(d[0]);
    });

g.call(xAxis).append("text")
    .attr("class", "caption")
    .attr("y", -6)
    .attr("x", -15)
    .text("Population Vaccinated on Average(%)");