async function draw() {
    // Data
    const dataset = await d3.json(weatherDataLocation);

    
    // Dimensions
    let dimensions = {
        width: 350,
        height: 350,
        margins: 25
    };
    
    dimensions.ctrWidth = dimensions.width - dimensions.margins * 2;
    dimensions.ctrHeight = dimensions.height - dimensions.margins * 2;
    
    // Draw Image
    const svg = d3
        .select('#chart')
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        ;
    
    const ctr = svg
        .append('g') // <g>
        .attr(
            "transform",
            `translate(${dimensions.margins}, ${dimensions.margins})`
        )
        ;
    
    
    // console.log({ original: dataset, new: newDataset})
    
    const labelsGroup = ctr
        .append('g')
        .classed('bar-labels', true)
        ;
    
    const xAxisGroup = ctr
        .append('g')
        .style('transform', `translateY(${dimensions.ctrHeight}px)`)
        .style('stroke', 'rgba(var(--terRd), 1)')
        ;
    
    const meanLine = ctr
        .append('line')
        .classed('mean-line', true)
        ;
    
    function histogram(metric) {
        const xAccessor = d => d.currently[metric];
        const yAccessor = d => d.length;
        
        // Scales
        const xScale = d3
            .scaleLinear()
            .domain(d3.extent(dataset, xAccessor))
            .range([0, dimensions.ctrWidth])
            .nice()
            ;
        
        const bin = d3
            .bin()
            .domain(xScale.domain())
            .value(xAccessor)
            .thresholds(10)
            ;
        
        const newDataset = bin(dataset);
        const padding = 1;
        
        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(newDataset, yAccessor)])
            .range([dimensions.ctrHeight, 0])
            .nice()
            ;
        
        const exitTransition = d3
            .transition()
            .duration(500)
            ;
        const updateTransition = exitTransition
            .transition()
            .duration(500)
            ;
        
        // Draw Bars
        ctr
            .selectAll('rect')
            .data(newDataset)
            .join(
                (enter) => enter
                    .append('rect')
                    .attr('width', d => d3.max([0, xScale(d.x1) - xScale(d.x0) - padding]))
                    .attr('height', 0)
                    .attr('x', d => xScale(d.x0))
                    .attr('y', dimensions.ctrHeight)
                    .attr('fill', 'rgba(var(--priMe), 1)'),
                (update) => update,
                (exit) => exit
                    .attr('fill', 'rgba(var(--terRd), 0.25)')
                    .transition(exitTransition)
                    .duration(500)
                    .attr('y', dimensions.ctrHeight)
                    .attr('height', 0)
                    .remove()
            )
            .transition(updateTransition)
            .attr('width', d => d3.max([0, xScale(d.x1) - xScale(d.x0) - padding]))
            .attr('height', d => dimensions.ctrHeight - yScale(yAccessor(d)))
            .attr('x', d => xScale(d.x0))
            .attr('y', d => yScale(yAccessor(d)))
            .attr('fill', 'rgba(var(--terRd), 1)')
            ;
    
        labelsGroup
            .selectAll('text')
            .data(newDataset)
            .join(
                (enter) => enter
                    .append('text')
                    .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
                    .attr('y', dimensions.ctrHeight)
                    .text(yAccessor),
                (update) => update,
                (exit) => exit
                    .transition(exitTransition)
                    .attr('y', dimensions.ctrHeight)
                    .remove()
            )
            .transition(updateTransition)
            .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
            .attr('y', d => yScale(yAccessor(d)) - 10)
            .text(yAccessor)
            ;
        
        const mean = d3.mean(dataset, xAccessor);

        meanLine
            .raise()
            .transition(updateTransition)
            .attr('x1', xScale(mean))
            .attr('y1', 0)
            .attr('x2', xScale(mean))
            .attr('y2', dimensions.ctrHeight)
            ;
        
        // Draw Axis
        const xAxis = d3.axisBottom(xScale);
        
        xAxisGroup
            .transition()
            .call(xAxis)
            ;
    }
    
    d3
        .select('#metric')
        .on('change', function (e) {
            e.preventDefault();
            
            histogram(this.value);
        })
        ;
    
    histogram('humidity');
}

draw();