async function draw() {
    // Data
    const dataset = await d3.json(weatherDataLocation);

    const xAccessor = (d) => d.currently.humidity;
    const yAccessor = (d) => d.currently.apparentTemperature;

    // Dimensions
    let dimensions = {
        width: 450,
        height: 450,
        margin: {
            top: 25,
            bottom: 50,
            left: 75,
            right: 25,
        },
    };

    dimensions.ctrWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.ctrHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    // Draw Image
    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)
        ;
    
    const ctr = svg
        .append('g')
        .attr(
            'transform',
            `translate(${dimensions.margin.left}, ${dimensions.margin.top})`
        )
        ;
    
    const tooltip = d3.select('#tooltip');
    
    // Scales
    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(dataset, xAccessor))
        .rangeRound([0, dimensions.ctrWidth])
        .clamp(true)
        ;
    
    const yScale = d3
        .scaleLinear()
        .domain(d3.extent(dataset, yAccessor))
        .rangeRound([dimensions.ctrHeight, 0])
        .nice()
        .clamp(true)
        ;
    
    // Draw Circles
    ctr
        .selectAll('circle')
        .data(dataset)
        .join('circle')
        .attr('cx', d => xScale(xAccessor(d)))
        .attr('cy', d => yScale(yAccessor(d)))
        .attr('r', 5)
        .attr('fill', 'rgba(var(--terRd), 1)')
        .attr('stroke', 'rgba(var(--terRd), 1)')
        .attr('stroke-width', 2.5)
        .attr('data-temp', yAccessor)
        ;
    
    // Axes
    const xAxis = d3
        .axisBottom(xScale)
        .ticks(5)
        .tickFormat((d) => d * 100 + '%')
        // .tickValues([0.4, 0.5, 0.8])
        ;
    const yAxis = d3
        .axisLeft(yScale)
        .ticks(8)
        ;

    const xAxisGroup = ctr
        .append('g')
        .call(xAxis)
        // .attr('stroke', 'rgba(var(--priAd), 1)')
        .style('transform', `translateY(${dimensions.ctrHeight * 1.01}px)`)
        .classed('axis', true)
        ;
    
    const yAxisGroup = ctr
        .append('g')
        .call(yAxis)
        .style('transform', `translateX(${dimensions.ctrWidth * -0.001}px)`)
        .classed('axis', true)
        ;
        
    xAxisGroup
        .append('text')
        .attr('x', dimensions.ctrWidth / 2)
        .attr('y', dimensions.margin.bottom - 5)
        .attr('fill', 'rgba(var(--terRd), 1)')
        .html('Humidity')
        ;
        
    yAxisGroup
        .append('text')
        .attr('x', -dimensions.ctrHeight / 2)
        .attr('y', -dimensions.margin.left + 12)
        .attr('fill', 'rgba(var(--terRd), 1)')
        .html('Temperature, &deg;F')
        .style('transform', 'rotate(270deg)')
        .style('text-anchor', 'middle')
        ;

    const delaunay = d3.Delaunay.from(
        dataset,
        (d) => xScale(xAccessor(d)),
        (d) => yScale(yAccessor(d))
    );

    const voronoi = delaunay.voronoi();
    voronoi.xmax = dimensions.ctrWidth;
    voronoi.ymax = dimensions.ctrHeight;
    console.log(voronoi);

    ctr
        .append('g')
        .selectAll('path')
        .data(dataset)
        .join('path')
        // .attr('stroke', 'rgba(var(--priYl), 1)')
        .attr('fill', 'transparent')
        .attr('d', (d, i) => voronoi.renderCell(i))
        .on('mouseenter', function (event, datum) {
            ctr
                .append('circle')
                .classed('dot-hovered', true)
                .attr('stroke', 'rgba(var(--priRd), 1)')
                .attr('fill', 'none')
                .attr('r', 8)
                .attr('cx', d => xScale(xAccessor(datum)))
                .attr('cy', d => yScale(yAccessor(datum)))
                .style('pointer-events', 'none')
                ;
            
            tooltip
                .style('display', 'block')
                .style('top', yScale(yAccessor(datum)) - 25 + 'px')
                .style('left', xScale(xAccessor(datum)) + 'px')
                ;
            
            const formatter = d3.format('.2f');
            const dateFormatter = d3.timeFormat('%B %-d, %Y');
            
            tooltip
                .select('.metric-humidity span')
                .text(formatter(xAccessor(datum)))
                ;
            
            tooltip
                .select('.metric-temp span')
                .text(formatter(yAccessor(datum)))
                ;
            
            tooltip
                .select('.metric-date')
                .text(dateFormatter(datum.currently.time * 1000))
                ;
            })
        .on('mouseleave', function (event) {
            ctr
                .select('.dot-hovered')
                .remove()
                ;
            
            tooltip.style('display', 'none')
            })
        ;
}

draw();
