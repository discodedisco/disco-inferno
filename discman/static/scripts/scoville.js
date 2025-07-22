async function draw() {
    // Data
    const dataset = await d3.json(orbDataLocation);

    const sizeAccessor = (d) => d.size;
    const nameAccessor = (d) => d.name;

    // Dimensions
    let dimensions = {
        width: 200,
        height: 500,
        margin: 50
    };

    // Draw Image
    const svg = d3
        .select('#chart')
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

    const universeScale = d3
        .scaleLog()
        .domain(d3.extent(dataset, sizeAccessor))
        .range([
            dimensions.height - dimensions.margin, dimensions.margin
        ])
        ;
    
    const circlesGroup = svg
        .append('g')
        .style('font-size', '1.1rem')
        .style('dominant-baseline', 'middle')
        ;
    
    circlesGroup
        .selectAll('circle')
        .data(dataset)
        .join('circle')
        .attr('cx', dimensions.margin)
        .attr('cy', d => universeScale(sizeAccessor(d)))
        .attr('r', 6)
        ;
    
    circlesGroup
        .selectAll('text')
        .data(dataset)
        .join('text')
        .attr('x', dimensions.margin + 15)
        .attr('y', d => universeScale(sizeAccessor(d)))
        .text(nameAccessor)
        ;
    
    const axis = d3.axisLeft(universeScale);

    svg
        .append('g')
        .attr('transform', `translate(${dimensions.margin}, 0)`)
        .style('stroke', 'rgba(var(--priYl), 1)')
        .call(axis)
        ;
}

draw();