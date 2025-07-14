async function draw() {
    // Data
    const dataset = await d3.json(weatherDataLocation)

    // Dimensions
    let dimensions = {
        width: 500,
        height: 500,
    };

    // Draw Image
    d3
        .select('#chart')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)
    ;
}

draw();
