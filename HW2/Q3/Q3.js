// Load the CSV file
d3.csv("boardgame_ratings.csv").then(function(data) {
    // Parse the date and convert the rating counts to numbers
    data.forEach(function(d) {
        d.date = d3.timeParse("%Y-%m-%d")(d.date);
        d['Catan'] = +d['Catan=count'];
        d['Dominion'] = +d['Dominion=count'];
        d['Codenames'] = +d['Codenames=count'];
        d['Terraforming Mars'] = +d['Terraforming Mars=count'];
        d['Gloomhaven'] = +d['Gloomhaven=count'];
        d['Magic: The Gathering'] = +d['Magic: The Gathering=count'];
        d['Dixit'] = +d['Dixit=count'];
        d['Monopoly'] = +d['Monopoly=count'];
        d['Catan_rank'] = +d['Catan=rank'];
        d['Codenames_rank'] = +d['Codenames=rank'];
        d['Terraforming Mars_rank'] = +d['Terraforming Mars=rank'];
        d['Gloomhaven_rank'] = +d['Gloomhaven=rank'];
    });


    createLineChart(data);
    createLineChart2(data)
});

// Function to create the line chart
function createLineChart(data) {
    var margin = {top: 50, right: 100, bottom: 50, left: 80},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Create the SVG container for the chart
    var svg = d3.select("#chart-container")
        .append("svg")
        .attr("id", "svg-a")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Add title
    svg.append("text")
        .attr("id", "title-a")
        .attr("x", (width / 2))
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Number of Ratings 2016-2020");

    // Group for the plot elements
    var plot = svg.append("g")
        .attr("id", "plot-a")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create the x and y scales
    var xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
            return Math.max(d['Catan'], d['Dominion'], d['Codenames'], d['Terraforming Mars'], d['Gloomhaven'], d['Magic: The Gathering'], d['Dixit'], d['Monopoly']);
        })])
        .range([height, 0]);

    // Define the line generator
    var line = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.value); })
        .curve(d3.curveMonotoneX);

    // Group for the lines
    var linesGroup = plot.append("g").attr("id", "lines-a");

    // Use d3.schemeCategory10 for colors
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var games = ['Catan', 'Dominion', 'Codenames', 'Terraforming Mars', 'Gloomhaven', 'Magic: The Gathering', 'Dixit', 'Monopoly'];

    // Draw the lines for each game
    games.forEach(function(game) {
        var gameData = data.map(function(d) {
            return {date: d.date, value: d[game]};
        });

        // Append the line for the game
        linesGroup.append("path")
            .datum(gameData)
            .attr("fill", "none")
            .attr("stroke", color(game))
            .attr("stroke-width", 1.5)
            .attr("d", line);

        // Add labels for each game line
        linesGroup.append("text")
            .datum(gameData[gameData.length - 1])
            .attr("transform", function(d) { return "translate(" + xScale(d.date) + "," + yScale(d.value) + ")"; })
            .attr("x", 5)
            .attr("dy", ".35em")
            .style("fill", color(game))
            .text(game);
    });

    // Add the x-axis
    var xAxisGroup = plot.append("g")
        .attr("id", "x-axis-a")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(d3.timeMonth.every(3)).tickFormat(d3.timeFormat("%b %y")));

    // Add the y-axis
    var yAxisGroup = plot.append("g")
        .attr("id", "y-axis-a")
        .call(d3.axisLeft(yScale));

    // X-axis label
    xAxisGroup.append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Month");

    // Y-axis label
    yAxisGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .text("Num of Ratings");
}


// Function to create the line chart
function createLineChart2(data) {
    var margin = {top: 50, right: 100, bottom: 50, left: 80},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Create the SVG container for the chart
    var svg = d3.select("#chart-container")
        .append("svg")
        .attr("id", "svg-b")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Add title
    svg.append("text")
        .attr("id", "title-b")
        .attr("x", (width / 2))
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Number of Ratings 2016-2020 with Rankings");

    // Group for the plot elements
    var plot = svg.append("g")
        .attr("id", "plot-b")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create the x and y scales
    var xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
            return Math.max(d['Catan'], d['Dominion'], d['Codenames'], d['Terraforming Mars'], d['Gloomhaven'], d['Magic: The Gathering'], d['Dixit'], d['Monopoly']);
        })])
        .range([height, 0]);

    // Define the line generator
    var line = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.value); })
        .curve(d3.curveMonotoneX);


    // Add the x-axis
    var xAxisGroup = plot.append("g")
        .attr("id", "x-axis-b")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(d3.timeMonth.every(3)).tickFormat(d3.timeFormat("%b %y")));

    // Add the y-axis
    var yAxisGroup = plot.append("g")
        .attr("id", "y-axis-b")
        .call(d3.axisLeft(yScale));

    // Group for the lines
    var linesGroup = plot.append("g").attr("id", "lines-a");

    //Group for the symbols
    var symbolsGroup = plot.append("g").attr("id", "symbols-b");

    // Use d3.schemeCategory10 for colors
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var games = ['Catan', 'Dominion', 'Codenames', 'Terraforming Mars', 'Gloomhaven', 'Magic: The Gathering', 'Dixit', 'Monopoly'];
    
    var filteredGames = ['Catan', 'Codenames', 'Terraforming Mars', 'Gloomhaven'];

    // Draw the lines for each game
    games.forEach(function(game) {
        var gameData = data.map(function(d) {
            return {date: d.date, value: d[game], rank: d[game + '_rank']};
        });

        // Append the line for the game
        linesGroup.append("path")
            .datum(gameData)
            .attr("fill", "none")
            .attr("stroke", color(game))
            .attr("stroke-width", 1.5)
            .attr("d", line);

        // Add labels for each game line
        linesGroup.append("text")
            .datum(gameData[gameData.length - 1])
            .attr("transform", function(d) { return "translate(" + xScale(d.date) + "," + yScale(d.value) + ")"; })
            .attr("x", 5)
            .attr("dy", ".35em")
            .style("fill", color(game))
            .text(game);

        gameData.forEach(function(d){
            var month = d.date.getMonth();
            if ((month === 0 || month === 3 || month === 6 || month === 9) && d.rank !== undefined && !isNaN(d.rank))  {
                symbolsGroup.append("circle")
                    .attr("class", game)
                    .attr("r", 10)
                    .attr("fill", color(game))
                    .attr("cx", xScale(d.date))
                    .attr("cy", yScale(d.value));

                symbolsGroup.append("text")
                    .attr("class", game)
                    .attr("fill", "white")
                    .attr("font-size", 12)
                    .attr("x", xScale(d.date))
                    .attr("y", yScale(d.value))
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.35em")
                    .text(d.rank);

            }
        });
    });

    // X-axis label
    xAxisGroup.append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Month");

    // Y-axis label
    yAxisGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .text("Num of Ratings");
}