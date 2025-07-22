const planets = {"Sun":339.14,"Moon":14.50,"Mercury":323.83,"Venus":297.58,"Mars":291.41,"Jupiter":90.83,"Saturn":292.03,"Uranus":278.74,"Neptune":283.97,"Pluto":227.76};
const houses = {"cusps":[176.44,202.35,232.59,265.92,299.38,329.97,356.44,22.35,52.59,85.92,119.38,149.97],"asc":176.44,"mc":85.92};

const width = 400, height = 400, r = 175, cx = width / 2, cy = height / 2;

// Create svg
const svg = d3
    .select('#wheel-canvas')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    ;

// Draw outer circle
svg
    .append('circle')
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', r)
    .attr('fill', 'none')
    .attr('stroke', 'rgba(var(--priYl), 1)')
    .attr('stroke-width', 2.5)
    ;

// Draw house cusps
houses.cusps.forEach((deg, i) => {
    const angle = -deg * Math.PI / 180;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    svg
        .append('line')
        .attr('x1', cx)
        .attr('y1', cy)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', 'rgba(var(--priAd), 1)')
        .attr('stroke-width', 2)
        ;
    svg
        .append('text')
        .attr('x', cx + (r + 20) * Math.cos(angle))
        .attr('y', cy + (r + 20) * Math.sin(angle))
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .text(i + 1)
        ;
});

// Draw planets
Object.entries(planets).forEach(([name, deg]) => {
    const angle = -deg * Math.PI / 180;
    const x = cx + (r) * Math.cos(angle);
    const y = cy + (r) * Math.sin(angle);
    svg
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 8)
        .attr('fill', 'rgba(var(--priYl), 1)')
        ;
    svg
        .append('text')
        .attr('x', x)
        .attr('y', y - 12)
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .text(name)
        ;
});

// Draw ASC & MC
[['ASC', houses.asc], ['MC', houses.mc]].forEach(([label, deg]) => {
    const angle = -deg * Math.PI / 180;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    svg
        .append('text')
        .attr('x', x)
        .attr('y', y - 10)
        .attr('class', 'label')
        .attr('fill', 'rgba(var(--sexTi), 1)')
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .text(label)
        ;
});
