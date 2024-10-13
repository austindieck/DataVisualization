var width = window.innerWidth * 0.95;
var height = window.innerHeight * 0.95;

Promise.all([
    d3.csv('aggregated_nodes.csv'),  // Nodes data
    d3.csv('aggregated_edges.csv')   // Edges (links) data
]).then(function(data) {
    var nodesData = data[0];
    var edgesData = data[1];

    var nodes = {};
    nodesData.forEach(function(d) {
        nodes[d.station_name] = {
            name: d.station_name,
            total_count: +d.total_count
        };
    });

    var links = edgesData.map(function(d) {
        if (nodes[d.start_station_name] && nodes[d.end_station_name]) {
            return {
                source: nodes[d.start_station_name],
                target: nodes[d.end_station_name],
                trip_count: +d.trip_count
            };
        }
        return null;
    }).filter(d => d !== null);

    // Adjust the force simulation to shrink the graph
    var force = d3.forceSimulation()
        .nodes(d3.values(nodes))
        .force("link", d3.forceLink(links).distance(50))  // Decrease link distance to bring nodes closer
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force("charge", d3.forceManyBody().strength(-5))  // Reduce the repulsion force to make the graph smaller
        .alphaTarget(1)
        .on("tick", tick);

    var svg = d3.select("#graph").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    var link = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("stroke", "gray")
        .attr("stroke-width", function(d) {
            return Math.sqrt(d.trip_count);  // Scale line thickness based on trip_count
        });

    // Inverted radius scale: smaller total_count gets larger radius
    var radiusScale = d3.scaleLinear()
        .domain([d3.min(d3.values(nodes), function(d) { return d.total_count; }), d3.max(d3.values(nodes), function(d) { return d.total_count; })])
        .range([5, 30]);  // Now smaller total_count is larger

    var colorScale = d3.scaleLinear()
        .domain([d3.min(d3.values(nodes), function(d) { return d.total_count; }), 
                 d3.max(d3.values(nodes), function(d) { return d.total_count; })])
        .range(["#b3e2cd", "#fdcdac", "#cbd5e8"]);

    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("circle")
        .attr("r", function(d) {
            return radiusScale(d.total_count);  // Use the inverted radius scale
        })
        .style("fill", function(d) {
            d.originalColor = colorScale(d.total_count)
            return d.originalColor;
        });


    // Add text element with visibility set to hidden by default
    var text = node.append("text")
        .attr("dx", 10)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; })
        .style("visibility", "hidden");  // Initially hidden

    // Show text on hover
    node.on("mouseover", function(d) {
        d3.select(this).select("text").style("visibility", "visible");
    })
    .on("mouseout", function(d) {
        // Only hide the text if the node is not pinned (not fixed)
        if (!d.fx && !d.fy) {
            d3.select(this).select("text").style("visibility", "hidden");
        }
    });

    // add double click release
    node.on("dblclick", function(d) {
        d.fx = null;  // Release the node from fixed x position
        d.fy = null;  // Release the node from fixed y position
        d3.select(this).select("circle").style("fill", d.originalColor);
        d3.select(this).select("text").style("visibility", "hidden");
    });

    // Ticking function for force simulation
    function tick() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
    }

    function dragstarted(d) {
        if (!d3.event.active) force.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(this).select("text").style("visibility", "visible");
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) force.alphaTarget(0);
        d3.select(this).select("circle").style("fill", "red");
    }
});
