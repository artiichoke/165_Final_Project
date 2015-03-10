/* Map heavily modeled after Mike Bostock's code from Chapter 5 (05_choropleth.js) */

// Key for map        
var width = 960,
    height = 30,
    formatPercent = d3.format(".0%"),
    formatNumber = d3.format(".0f");

var threshold = d3.scale.threshold()
    
 .domain([0, .10, .20, .30, .40, .50, .60, .70, .80, .90, 1])    .range(['rgb(255,247,251)','rgb(236,231,242)','rgb(208,209,230)','rgb(166,189,219)','rgb(116,169,207)','rgb(54,144,192)','rgb(5,112,176)','rgb(4,90,141)','rgb(2,56,88)']);
//.range(['rgb(165,0,38)', 'rgb(165,0,40)', 'rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,144)', 'rgb(224,243,248)', 'rgb(171,217,233)', 'rgb(116,173,209)', 'rgb(69,117,180)', 'rgb(49,54,149)']);

// A position encoding for the key only.
var x = d3.scale.linear()
    .domain([0, 1])
    .range([0, 240]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(13)
    .tickValues(threshold.domain())
    .tickFormat(function (d) {
        return d === 5 ? formatPercent(d) : formatNumber(100 * d);
    });

//positioning affects the slider
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//positioning affects the key
var g = svg.append("g")
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
    .text("Vaccinations Key");


// Slider Stuff
// set up margins
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
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
   //affects map?
    .attr("height", 40)//height + margin.top + margin.bottom)    
    .append("g")
  //affects slider?
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
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

var slider = svg.append("g")
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

    //Map Stuff        
    //Width and height
var w = 1000;
var h = 550;//465;
//Define map projection
var projection = d3.geo.albersUsa()
    .translate([w / 2, h / 2])
    .scale([1100]);

//Define path generator
var path = d3.geo.path()
    .projection(projection);

//Define quantize scale to sort data values into buckets of color
var color = d3.scale.quantize().range(['rgb(255,247,251)','rgb(236,231,242)','rgb(208,209,230)','rgb(166,189,219)','rgb(116,169,207)','rgb(54,144,192)','rgb(5,112,176)','rgb(4,90,141)','rgb(2,56,88)']);

//Colors taken from colorbrewer.js, included in the D3 download

//Create SVG element
var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

//Load in vaccination rates data
d3.csv("vaccination_rates_by_state_reformatted.csv", function (data) {

    data.forEach(function(d) {
               d.MMR_rates = 100 - (+d.MMR_rates);                                    
            });
    
    //Set input domain for color scale
    color.domain([
            d3.min(data, function (d) {
            return (d.MMR_rates);
        }),
            d3.max(data, function (d) {
            return (d.MMR_rates);
        })
        ]);

    //Load in GeoJSON data
    d3.json("us-states.json", function (json) {
        //Merge the ag. data and GeoJSON
        //Loop through once for each ag. data value
        for (var i = 0; i < data.length; i++) {
            //Grab state name
            var dataState = data[i].State;
            //Grab data value, and convert from string to float
            var dataValue = parseFloat(data[i].MMR_rates);

            //Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.name;

                if (dataState == jsonState) {
                    //Copy the data value into the JSON
                    json.features[j].properties.value = dataValue;

                    //Stop looking through the JSON
                    break;
                }
            }
        }

        //Bind data and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function (d) {
                //Get data value
                var value = d.properties.value;

                if (value) {
                    //If value exists…
                    return color(value);
                } else {
                    //If value is undefined…
                    return "#ccc";
                }

            });

        //Load in cities data
        d3.csv("measles_outbreaks_test.csv", function(data) {
              data.forEach(function(d) {
               d.city = d.city.toString();
               d.state = d.state.toString();
               d.lat = +d.lat;
               d.lon = +d.lon;
               d.year = +d.year;
               d.month = d.month.toString();
               d.cases = +d.cases
               d.reason = d.reason.toString();
               d.citation = d.citation.toString();
                  
                  //city,state,lat,lon,year,month,cases,reason,citation
            });
            
            svg.selectAll(".dot")
               .data(data)
               .enter()
               .append("circle")
               .attr("class", "dot")
               .attr("cx", function(d) {
                   console.log(d.city, d.state, d.lat, d.lon, d.year, d.month, d.cases, d.reason, d.citation);
                   return projection([d.lon, d.lat])[0];
                   // return projection(+d.lon);
               })
               .attr("cy", function(d) {
                   return projection([d.lon, d.lat])[1];
                    // return projection(+d.lat);
               })
               .attr("r", function(d) {
                    return Math.sqrt(parseInt(d.cases*5 ));
               })
               .style("fill", "red")
              .on("mouseover", function(d) {
                    //Update the tooltip position and value
                    d3.select("#tooltip")
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px")						
                        .select("#value")
                        .html('<b>City:</b> ' + d.city + '<br/><b>State:</b> ' + d.state + '<br/><b>Cases reported:</b> ' + d.cases + 
                              '<br/><b>Cause of outbreak:</b> ' + d.reason);

                    //Show the tooltip
                    d3.select("#tooltip").classed("hidden", false);
               })
               .on("mouseout", function() {
                    //Hide the tooltip
                    d3.select("#tooltip").classed("hidden", true);
               });

        });
    });

});