// set up margins
var margin = {top: 10, right: 50, bottom: 10, left: 50},
    width = 960 - margin.left - margin.right,
    height = 200 - margin.bottom - margin.top;

// init x domain and range
var x = d3.scale.linear()
    .domain([2004, 2014])
    .range([0, width])
    .clamp(true);   // forces values to be within range

// init brush
var brush = d3.svg.brush()
    .x(x)
    .extent([0, 0])
    .on("brush", brushed);

// init svg
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height / 2 + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(function(d) { return d + ""; })
      .tickSize(0)
      .tickPadding(12))
    .select(".domain")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "halo");

// Slider Stuff
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

// Key for map        
var width = 960,
    height = 50,
    formatPercent = d3.format(".0%"),
    formatNumber = d3.format(".0f");

var threshold = d3.scale.threshold()
    .domain([.11, .22, .33, .50])
    .range(["#6e7c5a", "#a0b28f", "#d8b8b3", "#b45554", "#760000"]);

// A position encoding for the key only.
var x = d3.scale.linear()
    .domain([0, 1])
    .range([0, 240]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(13)
    .tickValues(threshold.domain())
    .tickFormat(function(d) { return d === .5 ? formatPercent(d) : formatNumber(100 * d); });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(" + (width - 240) / 2 + "," + height / 2 + ")");

g.selectAll("rect")
    .data(threshold.range().map(function(color) {
      var d = threshold.invertExtent(color);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .style("fill", function(d) { return threshold(d[0]); });

g.call(xAxis).append("text")
    .attr("class", "caption")
    .attr("y", -6)
    .text("");
    
    //Map Stuff        
    //Width and height
    var w = 1000;
    var h = 465;
    //Define map projection
    var projection = d3.geo.albersUsa()
    .translate([w/2, h/2]);
    //.scale([500]);

    //Define path generator
    var path = d3.geo.path()
    .projection(projection);
							 
    //Define quantize scale to sort data values into buckets of color
    var color = d3.scale.quantize()
    //.range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);

    .range(['rgb(165,0,38)','rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,144)','rgb(224,243,248)','rgb(171,217,233)','rgb(116,173,209)','rgb(69,117,180)','rgb(49,54,149)']);            
								//Colors taken from colorbrewer.js, included in the D3 download

    //Create SVG element
	var svg = d3.select("body")
	.append("svg")
	.attr("width", w)
    .attr("height", h);

	//Load in vaccination rates data
	d3.csv("vaccination_rates_by_state_reformatted.csv", function(data) {

        //Set input domain for color scale
        color.domain([
            d3.min(data, function(d) { return d.MMR_rates; }), 
            d3.max(data, function(d) { return d.MMR_rates; })
        ]);

        //Load in GeoJSON data
        d3.json("us-states.json", function(json) {
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
                .style("fill", function(d) {
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
            });			
        });