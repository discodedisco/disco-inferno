// const planets = {'Sun': 339.35306034182435, 'Moon': 17.540743571783214, 'Mercury': 324.17873587696073, 'Venus': 297.70346712723125, 'Mars': 291.5611222524487, 'Jupiter': 90.82747167382269, 'Saturn': 292.0445876717063, 'Uranus': 278.74902484669695, 'Neptune': 283.97077819645455, 'Pluto': 227.76350311547512};
// const houses = {'cusps': [236.11325409849132, 270.466117232383, 304.8189803662746, 339.17184350016623, 4.818980366274616, 30.466117232383, 56.113254098491325, 90.466117232383, 124.81898036627462, 159.17184350016626, 184.81898036627462, 210.46611723238297], 'asc': 236.11325409849132, 'mc': 159.17184350016626};

const container = document.getElementById('wheel-canvas');
const size = Math.min(container.offsetWidth, window.innerHeight * 0.7);
const width = size;
const height = size;
const r = size / 2 - 30;
const cx = width / 2;
const cy = height / 2;

const planetSymbols = {
    Sun: "☉",
    Moon: "☽",
    Mercury: "☿",
    Venus: "♀",
    Mars: "♂",
    Jupiter: "♃",
    Saturn: "♄",
    Uranus: "♅",
    Neptune: "♆",
    Pluto: "♇"
};

// const width = 400, height = 400, r = 175, cx = width / 2, cy = height / 2;

const signInner = r + 10;
const signOuter = r + 30;

// function normalizeAngle(angle) {
//     return ((angle + 180) % 360) - 180;
// }
// const offset = normalizeAngle(houses.asc - 180);
const offset = houses.asc - 180;

// Create svg
const svg = d3
    .select('#wheel-canvas')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    ;

// Groups (not yet in use)
const signsGroup = svg
    .append('g')
    .attr('class', 'signs')
    ;
const housesGroup = svg
    .append('g')
    .attr('class', 'houses')
    ;
const planetsGroup = svg
    .append('g')
    .attr('class', 'planets')
    ;
const specialPointsGroup = svg
    .append('g')
    .attr('class', 'special-points')
    ;

// Draw sign arcs
for (let i = 0; i < 12; i++) {
    const start = (-i * 30 + offset) * Math.PI / 180;
    const end = (-(i + 1) * 30 + offset) * Math.PI / 180;

    const arc = d3
        .arc()
        .innerRadius(signInner)
        .outerRadius(signOuter)
        .startAngle(start)
        .endAngle(end)
        ;
    
    signsGroup
        .append('path')
        .attr('d', arc())
        .attr('fill', 'rgba(var(--priOr), 0.15)')
        .attr('stroke', 'rgba(var(--priOr), 1)')
        .attr('stroke-width', 1)
        .attr('transform', `translate(${cx},${cy})`)
        ;
    
    // Sign label
    const mid = (-((i * 30) + 15) + offset) * Math.PI / 180;
    const x = cx + (signInner + signOuter) / 2 * Math.cos(mid);
    const y = cy + (signInner + signOuter) / 2 * Math.sin(mid);
    signsGroup
        .append('text')
        .attr('x', x)
        .attr('y', y + 5)
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('font-size', 13)
        .attr('fill', 'rgba(var(--priOr), 1)')
        .text(signs[i])
        ;
}

// House calculations
houses.cusps.forEach((deg, i) => {
    // Draw from center to edge
    const angle = ((-deg + offset) % 360) * Math.PI / 180;
    
    // Draw lines
    const innerRadius = r - 20;
    const outerRadius = r;
    const innerX = cx + innerRadius * Math.cos(angle);
    const innerY = cy + innerRadius * Math.sin(angle);
    const outerX = cx + outerRadius * Math.cos(angle);
    const outerY = cy + outerRadius * Math.sin(angle);

    housesGroup
        .append('line')
        .attr('x1', innerX)
        .attr('y1', innerY)
        .attr('x2', outerX)
        .attr('y2', outerY)
        .attr('stroke', 'rgba(var(--priOr), 1)')
        // .attr('stroke', 'none')
        .attr('stroke-width', 2)
        ;
    
    // Inner ring
    housesGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', innerRadius)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(var(--priOr), 0.8')
        .attr('stroke-width', 2)
        ;
        
    // Outer ring
    housesGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(var(--priOr), 0.8')
        .attr('stroke-width', 2)
        ;

// Draw house numbers    
    // Calculate house no. position
    const nextDeg = houses.cusps[(i + 1) % 12];
    let midDeg = (deg + nextDeg) / 2;
    // Handle cases where house crosses 0°
    if (Math.abs(deg - nextDeg) > 180) {
        midDeg = ((deg + nextDeg + 360) / 2) % 360;
    }
    const midAngle = ((-midDeg + offset) % 360) * Math.PI / 180;
    
    housesGroup
        .append('text')
        .attr('x', cx + (r - 35) * Math.cos(midAngle))
        .attr('y', cy + (r - 35) * Math.sin(midAngle))
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', 'rgba(var(--priOr), 1)')
        .text(i + 1)
        ;
});

// Draw planets
Object.entries(planets).forEach(([name, deg]) => {
    const angle = (-deg + offset) * Math.PI / 180;
    const x = cx + (r - 10) * Math.cos(angle);
    const y = cy + (r - 10) * Math.sin(angle);
    planetsGroup
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 8)
        .attr('fill', 'rgba(var(--priYl), 1)')
        ;
    planetsGroup
        .append('text')
        .attr('x', x)
        .attr('y', y + 5)
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .text(planetSymbols[name])
        ;
});

// Draw ASC & MC
[['ASC', houses.asc], ['MC', houses.mc]].forEach(([label, deg]) => {
    const angle = (-deg + offset) * Math.PI / 180;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    specialPointsGroup
        .append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('class', 'label')
        .attr('fill', 'rgba(var(--priAd), 1)')
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .text(label)
        ;
});
