// Define the dimensions and margins for the line chart
const margin = { top: 60, right: 150, bottom: 40, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Define the dimensions and margins for the bar chart
const barChartMargin = { top: 30, right: 40, bottom: 40, left: 120 },
    barChartWidth = 960 - barChartMargin.left - barChartMargin.right,
    barChartHeight = 300 - barChartMargin.top - barChartMargin.bottom;

// Append SVG element for the line chart
const svg = d3.select("body")
    .append("svg")
    .attr("id", "line_chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

// Append group container for the line chart elements
const lineChartContainer = svg.append("g")
    .attr("id", "container")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Append title for the line chart
lineChartContainer.append("text")
    .attr("id", "line_chart_title")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Board games by Rating 2015-2019");

// Append GT username below the title
lineChartContainer.append("text")
    .attr("id", "credit")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2 + 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .text("adieck3");  // Replace with your GT username

// Append group for the lines
const linesGroup = lineChartContainer.append("g").attr("id", "lines");

// Append group for the circles
const circlesGroup = lineChartContainer.append("g").attr("id", "circles");

// Append the x-axis group
const xAxisGroup = lineChartContainer.append("g")
    .attr("id", "x-axis-lines")
    .attr("transform", `translate(0, ${height})`);

// Append the y-axis group
const yAxisGroup = lineChartContainer.append("g").attr("id", "y-axis-lines");

// Append a div for the bar chart title
const barChartTitleDiv = d3.select("body")
    .append("div")
    .attr("id", "bar_chart_title")
    .style("text-align", "center")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("");  // Initially empty, updated dynamically on hover

// Append an SVG element for the bar chart
const barChartSvg = d3.select("body")
    .append("svg")
    .attr("id", "bar_chart")
    .attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
    .attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom)
    .style("display", "none");  // Initially hidden

// Append group container for the bar chart elements
const barChartContainer = barChartSvg.append("g")
    .attr("id", "container_2")
    .attr("transform", `translate(${barChartMargin.left},${barChartMargin.top})`);

// Append the x-axis for the bar chart
const xAxisBarGroup = barChartContainer.append("g")
    .attr("id", "x-axis-bars")
    .attr("transform", `translate(0, ${barChartHeight})`);

// Append the y-axis for the bar chart
const yAxisBarGroup = barChartContainer.append("g").attr("id", "y-axis-bars");

// Append the x-axis label for the bar chart
xAxisBarGroup.append("text")
    .attr("id", "bar_x_axis_label")
    .attr("x", barChartWidth / 2)
    .attr("y", barChartMargin.bottom - 10)
    .style("text-anchor", "middle")
    .attr("fill", "black")
    .text("Number of Users");

// Append the y-axis label for the bar chart
yAxisBarGroup.append("text")
    .attr("id", "bar_y_axis_label")
    .attr("transform", "rotate(-90)")
    .attr("x", -barChartHeight / 2)
    .attr("y", -barChartMargin.left + 20)
    .style("text-anchor", "middle")
    .attr("fill", "black")
    .text("Games");

// Load the data from CSV and plot the line chart
d3.csv("average-rating.csv").then(function (data) {
    const processedData = processData(data);

    const xScale = d3.scaleLinear()
        .domain([0, 9])  // Adjusted the range to 0-9 to match the test
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d3.max(d.values, v => v.count))])
        .range([height, 0]);

    const xAxis = d3.axisBottom(xScale).ticks(10);  // Ensure x-axis has the correct number of ticks
    const yAxis = d3.axisLeft(yScale);

    // Add the x-axis
    xAxisGroup.call(xAxis);

    // Add the y-axis
    yAxisGroup.call(yAxis);

    // X-axis label for line chart
    xAxisGroup.append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 5)
        .style("text-anchor", "middle")
        .attr("fill", "black")
        .text("Rating");

    // Y-axis label for line chart
    yAxisGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10)
        .style("text-anchor", "middle")
        .attr("fill", "black")
        .text("Number of Games");

    const line = d3.line()
        .x(d => xScale(d.rating))
        .y(d => yScale(d.count));

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Plot the lines and circles for each year
    processedData.forEach(function (yearData, i) {
        linesGroup.append("path")
            .datum(yearData.values)
            .attr("fill", "none")
            .attr("stroke", color(yearData.key))
            .attr("stroke-width", 1.5)
            .attr("d", line);

        // Add circles for each data point
        circlesGroup.selectAll(`circle.line-${yearData.key}`)
            .data(yearData.values)
            .enter()
            .append("circle")
            .attr("class", `line-${yearData.key}`)
            .attr("cx", d => xScale(d.rating))
            .attr("cy", d => yScale(d.count))
            .attr("r", 3)
            .attr("fill", color(yearData.key))
            .attr("data-year", yearData.key)
            .attr("data-rating", d => d.rating)
            .on("mouseover", function (event, d) {
                const year = +d3.select(this).attr("data-year");
                const rating = +d3.select(this).attr("data-rating");
                d3.select(this).attr("r", 6);  // Enlarge circle on hover
                updateBarChart(year, rating, data); // Update bar chart on hover
                barChartSvg.style("display", "block");  // Show bar chart
            })
            .on("mouseout", function (event, d) {
                d3.select(this).attr("r", 3);  // Return circle to original size
                barChartSvg.style("display", "none");  // Hide bar chart
            });
    });

    // Add the legend to the chart
    addLegend(svg, processedData.map(d => d.key), color);

}).catch(function (error) {
    console.error("Error loading or processing data: ", error);
});

// Function to update bar chart on hover
function updateBarChart(year, rating, data) {
    const filteredData = data.filter(d => +d.year === year && Math.floor(+d.average_rating) === rating)
        .sort((a, b) => b.users_rated - a.users_rated)
        .slice(0, 5);

    if (filteredData.length === 0) {
        barChartSvg.style("display", "none");
        return;
    }

    const xBarScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d.users_rated)])
        .range([0, barChartWidth]);

    const yBarScale = d3.scaleBand()
        .range([barChartHeight, 0])
        .padding(0.1)
        .domain(filteredData.map(d => d.name.slice(0, 10)));  // Show the first 10 characters of the game name

    const bars = barChartContainer.selectAll(".bar")
        .data(filteredData, d => d.name);

    // Remove old bars
    bars.exit().remove();

    // Update existing bars
    bars.attr("x", 0)
        .attr("y", d => yBarScale(d.name.slice(0, 10)))
        .attr("width", d => xBarScale(d.users_rated))
        .attr("height", yBarScale.bandwidth())
        .attr("fill", "steelblue");

    // Enter new bars
    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => yBarScale(d.name.slice(0, 10)))
        .attr("width", d => xBarScale(d.users_rated))
        .attr("height", yBarScale.bandwidth())
        .attr("fill", "steelblue");

    // Add gridlines to bar chart
    barChartContainer.selectAll(".grid").remove();
    barChartContainer.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${barChartHeight})`)
        .call(d3.axisBottom(xBarScale)
            .ticks(5)
            .tickSize(-barChartHeight)
            .tickFormat(""));

    // Update the axes with correct positioning
    xAxisBarGroup.transition().call(d3.axisBottom(xBarScale));
    yAxisBarGroup.transition().call(d3.axisLeft(yBarScale));

    // Update bar chart title
    barChartTitleDiv.text(`Top 5 Most Rated Games of ${year} with Rating ${rating}`);
}

// Add a legend function
function addLegend(svg, years, color) {
    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${width + 40}, 50)`);

    years.forEach(function (year, i) {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", color(year));

        legend.append("text")
            .attr("x", 25)
            .attr("y", i * 20 + 13)
            .attr("fill", "black")
            .text(year);
    });
}

// Process data function
function processData(data) {
    const filteredData = data.filter(d => +d.year >= 2015 && +d.year <= 2019)
        .map(d => ({
            year: +d.year,
            rating: Math.floor(+d.average_rating),
            count: +d.users_rated
        }));

    const nestedData = d3.nest()
        .key(d => d.year)
        .key(d => d.rating)
        .rollup(v => v.length)
        .entries(filteredData);

    const years = [2015, 2016, 2017, 2018, 2019];
    const ratings = d3.range(0, 10);  // Ensure x-axis domain matches 0-9

    const completeData = years.map(year => {
        const yearData = ratings.map(rating => {
            const ratingData = nestedData.find(y => +y.key === year)?.values.find(v => +v.key === rating);
            return { rating: rating, count: ratingData ? ratingData.value : 0 };
        });
        return { key: year, values: yearData };
    });

    return completeData;
}