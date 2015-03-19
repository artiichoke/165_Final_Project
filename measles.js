/* measles.js */
/* Map heavily modeled after Mike Bostock's code from Chapter 12 (05_choropleth.js) */

// CREATE MAP

//Width and height
var w = 1000;
var h = 550;
//Define map projection
var projection = d3.geo.albersUsa()
    .translate([w / 2, h / 2])
    .scale([1100]);

//Define path generator
var path = d3.geo.path()
    .projection(projection);

//var step = 0;
//var current_year = 2008;
//var filename = ("data" + current_year + ".csv").toString();

//Colors taken from colorbrewer.js, included in the D3 download
//Define quantize scale to sort data values into buckets of color
var color = d3.scale.quantize()
.range([
        'rgb(155, 178, 184)',
        'rgb(123, 146, 152)',
        'rgb(78, 112, 128)',
        'rgb(73, 99, 125)',
        'rgb(68, 86, 123)',
        'rgb(64, 73, 121)',
        'rgb(59, 60, 119)',
        'rgb(54, 48, 117)',
        'rgb(50, 35, 115)',
        'rgb(30, 15, 85)',
        'rgb(11, 5, 31)'
       ]);

//Create SVG element
var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

/* display(current_year);

d3.select("#slider").on('change', function(d) {       
       var incrementation = parseInt(this.value);
       current_year = (2008 + incrementation);
       d3.select("#year").text(""+current_year);
       svg.selectAll("path").remove();
       svg.selectAll(".dot").remove();
       return display(current_year);
});
*/

//Load in vaccination rates data
function display(Year) {    
    d3.csv("data" + Year + ".csv", function (data) {
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

    //Code copied from Mike Bostock's Chater 12 choropleth.js
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
        })
            //code modified from Mike Bostock's Chaper 12 example scripts
            .on("mouseover", function(d) {
            
                var mmr_average = 100 - Math.round((d.properties.value) * 100) / 100;
                var state = d.properties.name;
                    //Update the tooltip position and value
                    d3.select("#tooltip")
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px")						
                        .select("#value")
                        .html('<b>State:</b> ' + state + '<br/><b>Vaccination average:</b> ' + mmr_average + '%');

                    //Show the tooltip
                    d3.select("#tooltip").classed("hidden", false);
               })
               .on("mouseout", function() {
                    //Hide the tooltip
                    d3.select("#tooltip").classed("hidden", true);
               });            
                
        //Load in cities data
        d3.csv("measles_outbreaks_" + Year + ".csv", function(data) {
            console.log(Year);
              data.forEach(function(d) {
               d.city = d.city.toString();
               d.state = d.state.toString();
               d.lat = +d.lat;
               d.lon = +d.lon;
               d.year = +d.year;
               d.month = d.month.toString();
               d.cases = +d.cases;
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
                    return Math.sqrt(parseInt(Math.log(d.cases+1)*50));
               })
               .style("fill", "red")
            
            // Code modified from Mike Bostock's Chapter 12 example scripts
              .on("mouseover", function(d) {
                    // Update the tooltip position and value
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
}