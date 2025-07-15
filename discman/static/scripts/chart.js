async function draw() {
    // Data
    const dataset = await d3.json(weatherDataLocation);

    const xAccessor = (d) => d.currently.humidity;
    const yAccessor = (d) => d.currently.apparentTemperature;

    // Dimensions
    let dimensions = {
        width: 500,
        height: 500,
        margin: {
            top: 75,
            bottom: 75,
            left: 100,
            right: 75,
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
        .attr('fill', 'none')
        .attr('stroke', 'rgba(var(--priAd), 1)')
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
        .style('transform', `translateY(${dimensions.ctrHeight * 1.05}px)`)
        .classed('axis', true)
        ;
    
    const yAxisGroup = ctr
        .append('g')
        .call(yAxis)
        .style('transform', `translateX(${dimensions.ctrWidth * -0.05}px)`)
        .classed('axis', true)
        ;
        
    xAxisGroup
        .append('text')
        .attr('x', dimensions.ctrWidth / 2)
        .attr('y', dimensions.margin.bottom - 33)
        .attr('fill', 'rgba(var(--priAd), 1)')
        .html('Humidity')
        ;
        
    yAxisGroup
        .append('text')
        .attr('x', -dimensions.ctrHeight / 2)
        .attr('y', -dimensions.margin.left + 50)
        .attr('fill', 'rgba(var(--priAd), 1)')
        .html('Temperature, &deg;F')
        .style('transform', 'rotate(270deg)')
        .style('text-anchor', 'middle')
        ;
}


draw();
