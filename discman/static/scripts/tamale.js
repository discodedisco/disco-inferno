async function draw(el, scale) {
  // Data
  const dataset = await d3.json(heatDataLocation);
  dataset.sort((a, b) => a - b);

  // Dimensions
  let dimensions = {
    width: 481,
    height: 121,
  };

  const box = 24;

  // Draw Image
  const svg = d3
    .select(el)
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)
    ;
  
  // Scales
  let colorScale;

  // function getCSSVarRGB(varName) {
  //   // Returns "r,g,b"
  //   return getComputedStyle(document.documentElement)
  //     .getPropertyValue(varName)
  //     .trim()
  //     ;
  // }

  if (scale === 'linear') {
    colorScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset))
      .range(['white', 'red'])
      ;
  } else if (scale === 'quantize') {
    colorScale = d3
      .scaleQuantize()
      .domain(d3.extent(dataset))
      .range(['white', 'pink', 'red'])
      ;
    console.log('Quantize: ', colorScale.thresholds())
  } else if (scale === 'quantile') {
    colorScale = d3
      .scaleQuantile()
      .domain(dataset)
      .range(['white', 'pink', 'red'])
      ;
    console.log('Quantile: ', colorScale.quantiles())
  } else if (scale === 'threshold') {
    colorScale = d3
      .scaleThreshold()
      .domain([45200, 135600])
      .range(d3.schemeReds[3])
      ;
  }

  // const colorStart = `rgba(${getCSSVarRGB('--terGn')}, 1)`;
  // const colorMiddle = `rgba(${getCSSVarRGB('--secGn')}, 1)`
  // const colorEnd = `rgba(${getCSSVarRGB('--priGn')}, 1)`;

  // colorScale = d3
  //   .scaleLinear()
  //   .domain(d3.extent(dataset))
  //   .range([colorStart, colorEnd])
  //   ;
  
  // Rectangles
  svg
    .append('g')
    .attr('transform', 'translate(2, 2)')
    .attr('stroke', 'rgba(var(--priYl), 1)')
    // .attr('fill', 'rgba(var(--secRd), 1)')
    .selectAll('rect')
    .data(dataset)
    .join('rect')
    .attr('width', box - 3)
    .attr('height', box - 3)
    .attr('x', (d, i) => box * (i % 20))
    .attr('y', (d, i) => box * (i / 20 | 0))
    .attr('fill', d => colorScale(d))
    ;
}


// Force update cached script
function fetchAndUpdate() {
  draw('#heatmap-1', 'linear').then(data => {
    draw(data);
    // join(data);
    });
  draw('#heatmap-2', 'quantize').then(data => {
    draw(data);
    // join(data);
    });
  draw('#heatmap-3', 'quantile').then(data => {
    draw(data);
    // join(data);
    });
  draw('#heatmap-4', 'threshold').then(data => {
    draw(data);
    // join(data);
    });
}

// Init load
fetchAndUpdate();