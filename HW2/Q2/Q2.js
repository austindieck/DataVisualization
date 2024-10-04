
d3.dsv(",", "board_games.csv", function(d) {
    return {
      source: d.source,
      target: d.target,
      value: +d.value
    }
  }).then(function(data) {
  
    var links = data;
    var currentColor;
  
    var nodes = {};
  
    // compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
        link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
        nodes[link.source.name].degree = (nodes[link.source.name].degree || 0) + 1;
        nodes[link.target.name].degree = (nodes[link.target.name].degree || 0) + 1;
    });
  
    var width = 1200,
        height = 700;
  
    var force = d3.forceSimulation()
        .nodes(d3.values(nodes))
        .force("link", d3.forceLink(links).distance(100))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody().strength(-250))
        .alphaTarget(1)
        .on("tick", tick);
  
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // add username to svg
    svg.append("text")
        .attr("id", "credit")  
        .attr("x", width - 100)  
        .attr("y", 30)  
        .attr("text-anchor", "end")  
        .style("font-size", "14px")  
        .style("font-weight", "bold")  
        .text("adieck3"); 
  
    // add the links
    var path = svg.append("g")
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("stroke", function(d) {
            return d.value === 0 ? "gray" : "green";  
        })
        .attr("stroke-width", function(d) {
            return d.value === 0 ? 4 : 2; 
        })
        .attr("stroke-dasharray", function(d) {
            return d.value === 0 ? "none" : "5,5";  
        })
        .attr("fill", "None");
  
    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
  
    // Define a linear scale for the node radius based on degree
    var radiusScale = d3.scaleLinear()
        .domain([d3.min(d3.values(nodes), function(d) { return d.degree; }), d3.max(d3.values(nodes), function(d) { return d.degree; })])
        .range([5, 20]);  // Scale radii between 5 and 20 pixels
    
    // Define a color scale based on node degree using a 3-color gradient
    var colorScale = d3.scaleLinear()
        .domain([d3.min(d3.values(nodes), function(d) { return d.degree; }), 
                d3.max(d3.values(nodes), function(d) { return d.degree; })])
        .range(["#b3e2cd", "#fdcdac", "#cbd5e8"]);

    // add the nodes
    node.append("circle")
        .attr("id", function(d){
           return (d.name.replace(/\s+/g,'').toLowerCase());
        })
        .attr("r", function(d){
            return radiusScale(d.degree);
        })
        .style("fill", function(d){
            d.originalColor = colorScale(d.degree);
            return d.originalColor;
        });
  
    // add the node labels
    node.append("text")
        .attr("dx", 10)
        .attr("dy", ".35em")
        .attr("font-weight", "bold")
        .text(function(d) { return d.name;});

    // add double click release
    node.on("dblclick", function(d) {
        d.fx = null;  // Release the node from fixed x position
        d.fy = null;  // Release the node from fixed y position
        d3.select(this).select("circle").style("fill", d.originalColor);
    });

    // add the curvy lines
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });
  
        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; 
        });
    };
  
    function dragstarted(d) {
        if (!d3.event.active) force.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        
    };
  
    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    };
  
    function dragended(d) {
        if (!d3.event.active) force.alphaTarget(0);
        d3.select(this).select("circle").style("fill", "red");
    };
    
  }).catch(function(error) {
    console.log(error);
  });