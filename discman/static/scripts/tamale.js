async function draw(el, scale) {
  // Data
  const dataset = await d3.json(heatDataLocation);
  dataset.sort((a, b) => a - b)

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

  function getCSSVarRGB(varName) {
    // Returns "r,g,b"
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }

  const colorStart = `rgb(${getCSSVarRGB('--quaAd')})`;
  const colorEnd = `rgb(${getCSSVarRGB('--quiAd')})`;

  colorScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset))
    .range([colorStart, colorEnd])
    ;
  
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

draw('#heatmap-1', 'linear');