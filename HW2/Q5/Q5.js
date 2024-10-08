// Define margin and dimensions for the SVG
const width = 800;
const height = 600;
const margin = { top: 10, right: 10, bottom: 10, left: 10 };

// Create SVG for the choropleth map
const svg = d3.select("#choropleth")
    .attr("width", width)
    .attr("height", height);

// Create a color scale for the map
const colorScale = d3.scaleQuantile()
    .range(["#f7fcf0", "#bae4b3", "#74c476", "#238b45"]);

// Create a tooltip using d3-tip
const tooltip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(d => `
        <strong>Country:</strong> <span>${d.properties.name}</span><br>
        <strong>Game:</strong> <span>${selectedGame}</span><br>
        <strong>Avg Rating:</strong> <span>${d.rating || 'N/A'}</span><br>
        <strong>Users:</strong> <span>${d.users || 'N/A'}</span>
    `);

svg.call(tooltip);

// Define projection and path
const projection = d3.geoNaturalEarth1()
    .scale(150)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Load data
Promise.all([
    d3.json('world_countries.json'),
    d3.csv('ratings-by-country.csv')
]).then(([world, gameData]) => {
    // Extract unique games from gameData
    const games = [...new Set(gameData.map(d => d.Game))].sort();

    // Append game options to the dropdown
    const dropdown = d3.select("#gameDropdown");
    dropdown.selectAll("option")
        .data(games)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Set default selected game
    let selectedGame = games[0];

    // Event listener for dropdown change
    dropdown.on("change", function () {
        selectedGame = this.value;
        updateMap(world, gameData, selectedGame);
    });

    // Create map and legend with default game
    updateMap(world, gameData, selectedGame);
});

// Function to create or update the map and legend
function updateMap(world, gameData, selectedGame) {
    // Filter gameData for the selected game
    const filteredData = gameData.filter(d => d.Game === selectedGame);

    // Create a map for the country data
    const dataMap = new Map();
    filteredData.forEach(d => {
        dataMap.set(d.Country, {
            rating: +d["Average Rating"],
            users: +d["Number of Users"]
        });
    });

    // Update the color scale domain based on the filtered data
    colorScale.domain(filteredData.map(d => +d["Average Rating"]));

    // Bind data to the map
    svg.selectAll("path")
        .data(topojson.feature(world, world.features).features)
        .join("path")
        .attr("d", path)
        .attr("fill", d => {
            const data = dataMap.get(d.properties.name);
            return data ? colorScale(data.rating) : "#ccc";
        })
        .on("mouseover", function (event, d) {
            const data = dataMap.get(d.properties.name) || {};
            tooltip.show({
                properties: d.properties,
                rating: data.rating || 'N/A',
                users: data.users || 'N/A'
            }, this);
            d3.select(this).attr("stroke", "#000");
        })
        .on("mouseout", function () {
            tooltip.hide();
            d3.select(this).attr("stroke", null);
        });

    // Create or update the legend
    const legend = d3.select("#legend");
    const quantiles = colorScale.quantiles();

    legend.selectAll("rect")
        .data(quantiles)
        .join("rect")
        .attr("fill", d => colorScale(d));

    legend.selectAll("text")
        .data(quantiles)
        .join("text")
        .text(d => d.toFixed(2));
}