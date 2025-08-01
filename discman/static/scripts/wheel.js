// const planets = {'Sun': 339.35306034182435, 'Moon': 17.540743571783214, 'Mercury': 324.17873587696073, 'Venus': 297.70346712723125, 'Mars': 291.5611222524487, 'Jupiter': 90.82747167382269, 'Saturn': 292.0445876717063, 'Uranus': 278.74902484669695, 'Neptune': 283.97077819645455, 'Pluto': 227.76350311547512};
// const houses = {'cusps': [236.11325409849132, 270.466117232383, 304.8189803662746, 339.17184350016623, 4.818980366274616, 30.466117232383, 56.113254098491325, 90.466117232383, 124.81898036627462, 159.17184350016626, 184.81898036627462, 210.46611723238297], 'asc': 236.11325409849132, 'mc': 159.17184350016626};

const container = document.getElementById('wheel-canvas');
const size = Math.min(container.offsetWidth, window.innerHeight * 0.7);
const width = size;
const height = size;
const r = size / 2 - 30;
const cx = width / 2;
const cy = height / 2;

const planets = window.wheelData.planets;
const houses = window.wheelData.houses;
const signs = window.wheelData.signs;
const element_counts = window.wheelData.element_counts;

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

let totalElements = 0;

// Draw element analyzer ring
function drawElementRing(elementRatio) {
    console.log("element data:", elementRatio);

    const elementColors = {
        'Fire': 'rgba(var(--priAg), 1)',
        'Earth': 'rgba(var(--terPd), 1)',
        'Air': 'rgba(var(--priCu),1)',
        'Water': 'rgba(var(--terNi), 1)',
        'Space': 'rgba(var(--priAu), 1)',
        'Time': 'rgba(var(--terPt), 1)',
    };

    // Calculate percentages
    totalElements = Object.values(elementRatio).reduce((a, b) => a + b, 0);
    if (totalElements === 0) {
        console.error("No element data found!");
        return;
    }

    // Create pie-gen
    const pie = d3
        .pie()
        .value(d => d.value)
        .sort(null)
        ;
    
    // Conver pie data
    const pieData = pie(Object.entries(elementRatio).map(([key, value]) => ({ key, value })));

    // Element ring params
    const elementInner = r * 0.5;
    const elementOuter = r * 0.6;
    
    // Create arc-gen
    const elementArc = d3
        .arc()
        .innerRadius(elementInner)
        .outerRadius(elementOuter)
        ;
    
    // Create element ring group
    const elementGroup = svg
        .append('g')
        .attr('class', 'element-ring')
        .attr('transform', `translate(${cx},${cy})`)
        ;
    
    // Draw arcs
    elementGroup
        .append('g')
        .attr('class', 'element-arc-group')
        .selectAll('.element-arc')
        .data(pieData)
        .join('path')
        .attr('class', 'element-arc')
        .attr('d', elementArc)
        .attr('fill', d => elementColors[d.data.key])
        .attr('stroke', 'rgba(var(--priOr), 1)')
        .attr('stroke-width', 1)
        // .append('title')
        // .text(d => `${d.data.key}: ${d.data.value} (${Math.round(d.data.value / totalElements * 100)}%)`)
        ;
    
    elementGroup
        .append('g')
        .attr('class', 'element-label-group')
        .selectAll('.element-icon')
        .data(pieData)
        .join('text')
        .attr('class', 'element-icon')
        .attr('x', d => {
            // Calculate position at middle of arc segment
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
            const radius = (elementInner + elementOuter) / 2;
            return radius * Math.sin(midAngle);
        })
        .attr('y', d => {
            // Calculate position at middle of arc segment
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
            const radius = (elementInner + elementOuter) / 2;
            return -radius * Math.cos(midAngle);
        })
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', 'rgba(var(--priAd), 1)')
        .style('text-shadow', '0 0 0.25rem rgba(0, 0, 0, 1), 0 0 0.5rem rgba(255, 255, 255, 0.5')
        .attr('font-size', '0.75rem')
        .attr('font-family', 'FontAwesome')
        .text(d => {
            const icons = {
                'Fire': '\uf06d',
                'Earth': '\uf6fc',
                'Air': '\uf72e',
                'Water': '\uf043',
                'Space': '\uf753',
                'Time': '\uf017',
            };
            return icons[d.data.key];
        })
        .style('cursor', 'default')
        ;
}

drawElementRing(element_counts);

const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'element-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'rgba(0, 0, 0, 0.75)')
    .style('color', 'rgba(var(--priYl), 1)')
    .style('padding', '0.5rem')
    .style('border-radius', '0.25rem')
    .style('font-size', '0.75rem')
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    ;

svg
    .select('.element-arc-group')
    .selectAll('.element-arc')
    .on('mouseover', function (e, d) {
        const percent = Math.round(d.data.value / totalElements * 100);
        tooltip
            .html(`${d.data.key}: ${d.data.value} (${percent}%)`)
            .style('visibility', 'visible')
            ;
    })
    .on('mousemove', function (e) {
        tooltip
            .style('top', (e.pageY - 10) + 'px')
            .style('left', (e.pageX + 10) + 'px')
            ;
    })
    .on('mouseout', function () {
        tooltip.style('visibility', 'hidden');
    })
    // Mobile support
    .on('touchstart', function (e, d) {
        e.preventDefault();
        const percent = Math.round(d.data.value / totalElements * 100);
        tooltip
            .html(`${d.data.key}: ${d.data.value} (${percent}%)`)
            .style('visibility', 'visible')
            .style('top', (e.touches[0].pageY - 30) + 'px')
            .style('left', (e.touches[0].pageX + 10) + 'px')
            ;
        // Auto-hide after delay
        setTimeout(() => {
            tooltip.style('visibility', 'hidden');
        }, 2000);
    })
    ;

svg
    .select('.element-label-group')
    .selectAll('.element-icon')
    .on('mouseover', function (e, d) {
        const percent = Math.round(d.data.value / totalElements * 100);
        tooltip
            .html(`${d.data.key}: ${d.data.value} (${percent}%)`)
            .style('visibility', 'visible')
            ;
    })
    .on('mousemove', function (e) {
        tooltip
            .style('top', (e.pageY - 10) + 'px')
            .style('left', (e.pageX + 10) + 'px')
            ;
    })
    .on('mouseout', function () {
        tooltip.style('visibility', 'hidden');
    })
    .on('touchstart', function (e, d) {
        e.preventDefault();
        const percent = Math.round(d.data.value / totalElements * 100);
        tooltip
            .html(`${d.data.key}: ${d.data.value} (${percent}%)`)
            .style('visibility', 'visible')
            .style('top', (e.touches[0].pageY - 30) + 'px')
            .style('left', (e.touches[0].pageX + 10) + 'px')
            ;
        
        setTimeout(() => {
            tooltip.style('visibility', 'hidden');
        }, 2000);
    })
    ;
