/* measles.js: creates map element, draws measles outbreaks onto map */
/* Map heavily modeled after Mike Bostock's code from Chapter 5 (05_choropleth.js) */

var width = 1050,
    height = 30,
    formatPercent = d3.format(".0%"),
    formatNumber = d3.format(".0f");

var threshold = d3.scale.threshold()
    .domain([.85, .86, .87, .88, .89, .90, .91, .92, .93, .94, .95, .96, .97, .98, .99, 1])
	
.range(['rgb(149, 168, 254)',
        'rgb(142, 158, 250)',
        'rgb(136, 149, 246)',
        'rgb(130, 140, 242)',
        'rgb(123, 130, 238)',
        'rgb(117, 121, 234)',
        'rgb(111, 112, 230)',
        'rgb(105, 102, 226)',
        'rgb(98, 93, 223)',
        'rgb(92, 84, 219)',
        'rgb(86, 74, 215)',
        'rgb(80, 65, 211)',
        'rgb(73, 56, 207)',
        'rgb(57, 46, 203)',
        'rgb(51,37, 199)',
        'rgb(55, 28, 196)']);

// MAP      
// Width and height
var w = 1000;
var h = 525;
// Define map projection
var projection = d3.geo.albersUsa()
    .translate([w / 2, h / 2]);
//.scale([500]);

// Define path generator
var path = d3.geo.path()
    .projection(projection);

// Define quantize scale to sort data values into buckets of color
var color = d3.scale.quantize().range([
        'rgb(149, 168, 254)',
        'rgb(142, 158, 250)',
        'rgb(136, 149, 246)',
        'rgb(130, 140, 242)',
        'rgb(123, 130, 238)',
        'rgb(117, 121, 234)',
        'rgb(111, 112, 230)',
        'rgb(105, 102, 226)',
        'rgb(98, 93, 223)',
        'rgb(92, 84, 219)',
        'rgb(86, 74, 215)',
        'rgb(80, 65, 211)',
        'rgb(73, 56, 207)',
        'rgb(57, 46, 203)',
        'rgb(51,37, 199)',
        'rgb(55, 28, 196)']);


// Create SVG element
var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

// Load in vaccination rates data
d3.csv("vaccination_rates_by_state_reformatted.csv", function (data) {


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

        // Load in cities data
        d3.csv("us-cities.csv", function (data) {
            svg.selectAll(".dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", function (d) {
                    return projection([d.lon, d.lat])[0];
                })
                .attr("cy", function (d) {
                    return projection([d.lon, d.lat])[1];
                })
                .attr("r", function (d) {
                    return Math.sqrt(parseInt(d.population) * 0.00008);
                })
                .style("fill", "red")
                .on("mouseover", function (d) {
                    //Update the tooltip position and value
                    d3.select("#tooltip")
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px")
                        .select("#value")
                        .html('<b>City:</b> ' + d.place + '<br/><b>Cases reported:</b> #' +
                            '<br/><b>Cause of outbreak:</b> <value here>');

                    //Show the tooltip
                    d3.select("#tooltip").classed("hidden", false);
                })
                .on("mouseout", function () {
                    //Hide the tooltip
                    d3.select("#tooltip").classed("hidden", true);
                });
        });
    });

});