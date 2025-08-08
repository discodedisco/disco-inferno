document.addEventListener('DOMContentLoaded', function () {
    if (!window.wheelData) {
        console.error('wheelData not yet loaded');
        return;
    }

    // Init
    createWheel();

    // Resize listener
    let resizeTimeout;
    window.addEventListener('resize', function () {
        if (typeof wheelTooltips !== 'undefined' && wheelTooltips.hideAll) {
            wheelTooltips.hideAll();
        } else {
            const tooltipElements = this.document.querySelectorAll('.tooltip');
            tooltipElements.forEach(t => t.style.display = 'none');
        }
        this.clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            // Remove existing svg
            d3
                .select('#wheel-canvas svg')
                .remove()
                ;
            // Recreate wheel
            createWheel();
        }, 250);
    })

    function createWheel() {
        const container = document.getElementById('wheel-canvas');

        // Viewport dimensions
        const headerHeight = document.querySelector('header').getBoundingClientRect().height || 0;
        const footerHeight = document.querySelector('footer').getBoundingClientRect().height || 0;

        const controlsContainer = document.querySelector('.wheel-controls');
        const controlsHeight = controlsContainer ? controlsContainer.getBoundingClientRect().height : 0;

        const buffer = 40;

        const availableHeight = window.innerHeight - headerHeight - footerHeight - controlsHeight - buffer;
        const mainContentWidth = document.querySelector('.main-content')?.clientWidth || 0
        const availableWidth = Math.min(document.querySelector('.main-content').clientWidth, window.innerWidth * 0.9);

        let size = Math.min(availableWidth, availableHeight);
        // let size = Math.min(container.offsetWidth, container.offsetHeight);
        if (size < 350) size = 350;
        
        container.style.width = size + 'px';
        container.style.height = size + 'px';

        const width = size;
        const height = size;
        const r = size / 2 - 30;
        const cx = width / 2;
        const cy = height / 2;

        const planets = window.wheelData.planets;
        const houses = window.wheelData.houses;
        const signs = window.wheelData.signs;
        const element_counts = window.wheelData.element_counts;

        const planetSymbols = window.wheelData.planetSymbols;

        const signInner = r + 5;
        const signOuter = r + 28;

        // const houseInner = r - 45;
        // const houseOuter = r - 15;

        const offset = houses.asc - 180;

        // Create tooltip manager
        wheelTooltips.initialize();

        // Create svg
        const svg = d3
            .select('#wheel-canvas')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            ;

        // Initialize aspect manager
        if (typeof aspectManager !== 'undefined') {
            aspectManager.initialize(svg, cx, cy);

            window.wheelData.calculatedAspects = aspectManager.calculateAspects();
        }

        // Groups
        const specialPointsGroup = svg
            .append('g')
            .attr('class', 'special-points')
            ;
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
            
            // Add 9 (270°) to align with traditional chart orientiation
            const signIndex = (i + 3) % 12;
            
            const signGroup = signsGroup
                .append('g')
                .attr('class', 'sign-group')
                .attr('data-sign', signs[signIndex])
                ;
            
            const signPath = signGroup
                .append('path')
                .attr('d', arc())
                .attr('fill', 'rgba(var(--priOr), 0.25)')
                .attr('stroke', 'rgba(var(--priOr), 1)')
                .attr('stroke-width', 3)
                .attr('transform', `translate(${cx},${cy})`)
                .attr('class', 'sign-path')
                .attr('cursor', 'default')
                .style('pointer-events', 'all')
                ;
            
            // Attach tooltip to .sign-path
            wheelTooltips.attachToSign(d3.select(signPath.node()), signs[signIndex]);

            // const signPathNode = signPath.node();
            
            // Sign label
            const mid = (-((signIndex * 30) + 15) + offset) * Math.PI / 180;
            const x = cx + (signInner + signOuter) / 2 * Math.cos(mid);
            const y = cy + (signInner + signOuter) / 2 * Math.sin(mid);

            const signCircle = signGroup
                .append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 10)
                .attr('fill', 'rgba(var(--terRd), 1)')
                .attr('cursor', 'default')
                .style('pointer-events', 'all')
                ;
            
            const signLabel = signGroup
                .append('text')
                .attr('x', x)
                .attr('y', y + 5)
                .attr('class', 'sign-symbol')
                .attr('text-anchor', 'middle')
                .attr('font-size', '1rem')
                .attr('fill', 'rgba(var(--priOr), 1)')
                .attr('cursor', 'default')
                // .text(signs[i])
                .html(window.wheelData.signSymbols[signs[signIndex]])
                ;
            
            // Attach tooltip to sign group
            wheelTooltips.attachToSign(signGroup, signs[signIndex]);
        }

        // House calculations
        houses.cusps.forEach((deg, i) => {
            // Draw from center to edge
            const angle = ((-deg + offset) % 360) * Math.PI / 180;
            const houseIndex = i;
            const nextDeg = houses.cusps[(i + 1) % 12];
            
            // Draw lines
            const innerRadius = r - 40;
            const outerRadius = r - 15;
            const innerX = cx + innerRadius * Math.cos(angle);
            const innerY = cy + innerRadius * Math.sin(angle);
            const outerX = cx + outerRadius * Math.cos(angle);
            const outerY = cy + outerRadius * Math.sin(angle);

            const houseCusp = housesGroup
                .append('line')
                .attr('x1', innerX)
                .attr('y1', innerY)
                .attr('x2', outerX)
                .attr('y2', outerY)
                .attr('stroke', 'rgba(var(--priOr), 1)')
                // .attr('stroke', 'none')
                .attr('stroke-width', 2)
                .attr('class', 'house-cusp')
                ;
            
            // Attach to .house-cusp
            wheelTooltips.attachToHouse(d3.select(houseCusp.node()), i + 1);
            
            // Inner ring
            housesGroup
                .append('circle')
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', innerRadius)
                .attr('fill', 'none')
                .attr('stroke', 'rgba(var(--priOr), 1')
                .attr('stroke-width', 1)
                ;
                
            // Outer ring
            housesGroup
                .append('circle')
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', outerRadius)
                .attr('fill', 'none')
                .attr('stroke', 'rgba(var(--priOr), 1')
                .attr('stroke-width', 1)
                ;

            // Draw house numbers    
            // Calculate house no. position
            let midDeg = (deg + nextDeg) / 2;
            // Handle cases where house crosses 0°
            if (Math.abs(deg - nextDeg) > 180) {
                midDeg = ((deg + nextDeg + 360) / 2) % 360;
            }
            const midAngle = ((-midDeg + offset) % 360) * Math.PI / 180;
            let numRadius = (innerRadius + outerRadius) / 2;

            // Calculate house width (deg)
            const houseWidth = Math.abs(nextDeg - deg);
            const adjustedWidth = houseWidth > 180 ? 360 - houseWidth : houseWidth;

            // // Not currently working
            // const houseCircle = housesGroup
            //     .append('circle')
            //     .attr('x', cx + numRadius * Math.cos(midAngle))
            //     .attr('y', cy + numRadius * Math.sin(midAngle))
            //     .attr('class', 'label')
            //     .attr('text-anchor', 'middle')
            //     .attr('dominant-baseline', 'central')
            //     .attr('r', 10)
            //     .attr('fill', 'rgba(var(--terRd), 1)')
            //     .attr('cursor', 'default')
            //     .style('pointer-events', 'all')
            //     ;
            
            const houseNumber = housesGroup
                .append('text')
                .attr('x', cx + numRadius * Math.cos(midAngle))
                .attr('y', cy + numRadius * Math.sin(midAngle))
                .attr('class', 'label')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('font-size', 12)
                .attr('fill', 'rgba(var(--priOr), 1)')
                .text(i + 1)
                .attr('class', 'house-number')
                ;
            
            // Attach to house-number
            // wheelTooltips.attachToHouse(d3.select(houseCircle.node()));
            wheelTooltips.attachToHouse(d3.select(houseNumber.node()), i + 1);

            // create invisible fill areas for tooltip interaction

            // get current & next cusp angles
            let startDeg = deg;
            let endDeg = nextDeg;

            if (Math.abs(endDeg - startDeg) > 180) {
                if (endDeg < startDeg) {
                    endDeg += 360;
                } else {
                    startDeg += 360;
                }
            }

            // convert to radians w. offset
            const startAngle = (-startDeg + offset + 90) * Math.PI / 180;
            const endAngle = (-endDeg + offset + 90) * Math.PI / 180;

            // create arc path covering house area
            const houseArc = d3
                .arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius)
                .startAngle(startAngle)
                .endAngle(endAngle)
                ;
            
            // add invisible interaction area
            const houseFill = housesGroup
                .append('path')
                .attr('d', houseArc())
                .attr('transform', `translate(${cx},${cy})`)
                .attr('class', 'house-fill')
                .attr('fill', 'transparent')
                .style('pointer-events', 'all')
                .style('cursor', 'default')
                ;
            
            // housesGroup
            //     .append('path')
            //     .attr('d', houseArc())
            //     .attr('transform', `translate(${cx},${cy})`)
            //     .attr('class', 'house-debug')
            //     .attr('fill', 'rgba(var(--priCy), 0.1)')
            //     .attr('stroke', 'red')
            //     .attr('stroke-width', 1)
            //     .attr('stroke-dasharray', '3,3')
            //     .attr('opacity', 0.5)
            //     ;
            
            // Attach tooltip to house fill area
            wheelTooltips.attachToHouse(d3.select(houseFill.node()), houseIndex + 1);
        });

        // Draw planets
        Object.entries(planets).forEach(([name, data]) => {
            const angle = (-data.deg + offset) * Math.PI / 180;
            const x = cx + (r - 5) * Math.cos(angle);
            const y = cy + (r - 5) * Math.sin(angle);
            
            const planetGroup = planetsGroup
                .append('g')
                .attr('class', 'planets-group')
                ;

            const planetCircle = planetGroup
                .append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 8)
                .attr('fill', 'rgba(var(--priYl), 1)')
                .attr('class', `planet-circle planet-${name.toLowerCase()}`)
                ;
            
            const planetSymbol = planetGroup
                .append('text')
                .attr('x', x)
                .attr('y', y + 5)
                .attr('class', 'label')
                .attr('text-anchor', 'middle')
                .attr('font-size', '0.75rem')
                .attr('class', `planet-circle-symbol planet-symbol-${name.toLowerCase()}`)
                .attr('cursor', 'default')
                // .attr('fill', 'rgba(var(--priTi), 1)')
                // .text(planetSymbols[name])
                .html(function () {
                    return window.wheelData.planetSymbols[name] || name.charAt(0);
                })
                ;
            
            // Attach tooltip to .planets-group (both circle & symbol)
            wheelTooltips.attachToPlanet(d3.select(planetCircle.node()), name, data.deg);
            wheelTooltips.attachToPlanet(d3.select(planetSymbol.node()), name, data.deg);
        });

        // Draw ASC & MC
        [['ASC', houses.asc], ['MC', houses.mc], ['DESC', (houses.asc + 180) % 360], ['IC', (houses.mc + 180) % 360]].forEach(([label, deg]) => {
            const angle = (-deg + offset) * Math.PI / 180;

            // Outside points
            const outerX = cx + (r + 40) * Math.cos(angle);
            const outerY = cy + (r + 40) * Math.sin(angle);
            const x = cx + (signOuter - 80) * Math.cos(angle);
            const y = cy + (signOuter - 80) * Math.sin(angle);

            // Inside points
            const border = r * 0.6;
            const innerX = cx + border * Math.cos(angle);
            const innerY = cy + border * Math.sin(angle);

            specialPointsGroup
                .append('line')
                .attr('x1', outerX)
                .attr('y1', outerY)
                .attr('x2', innerX)
                .attr('y2', innerY)
                .attr('class', 'crosshair-line')
                .attr('stroke', 'rgba(var(--priOr), 1)')
                .attr('stroke-width', '2')
                ;

            // specialPointsGroup
            //     .append('text')
            //     .attr('x', x)
            //     .attr('y', y)
            //     .attr('class', 'label')
            //     .attr('fill', 'rgba(var(--priAd), 1)')
            //     .attr("text-anchor", "middle")
            //     .attr("font-size", 14)
            //     .text(label)
            //     ;
        });

        let totalElements = 0;

        // Draw element analyzer ring
        function drawElementRing(elementRatio) {
            // console.log("element data:", elementRatio);

            const elementColors = {
                'Air': 'rgba(var(--priNi), 1)',
                'Space': 'rgba(var(--priPt), 1)',
                'Fire': 'rgba(var(--priPd), 1)',
                'Water': 'rgba(var(--priNi), 1)',
                'Time': 'rgba(var(--priPt), 1)',
                'Earth': 'rgba(var(--priPd), 1)',
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
                .startAngle(((-houses.asc + offset + 90) * Math.PI) / 180)
                ;
            
            // Convert pie data
            const elementOrder = ['Air', 'Space', 'Fire', 'Water', 'Time', 'Earth']
            const pieData = pie(
                elementOrder
                    .map(key => ({ key, value: elementRatio[key] }))
                    .filter(d => d.value !== undefined)
            );

            // Element ring params
            const elementInner = r * 0.5;
            const elementOuter = r * 0.7;
            
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
                .attr('stroke', 'rgba(var(--priTi), 1)')
                .attr('stroke-width', 3)
                // .append('title')
                // .text(d => `${d.data.key}: ${d.data.value} (${Math.round(d.data.value / totalElements * 100)}%)`)
                ;
            
            // Create icon group
            const elementIconGroup = elementGroup
                .append('g')
                .attr('class', 'element-label-group')
                ;
            
            elementIconGroup
                .selectAll('.element-icon-background')
                .data(pieData)
                .join('circle')
                .attr('class', 'element-icon-background')
                .attr('cx', d => {
                    const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    const radius = (elementInner + elementOuter) / 2;
                    return radius * Math.sin(midAngle);
                })
                .attr('cy', d => {
                    const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    const radius = (elementInner + elementOuter) / 2;
                    return -radius * Math.cos(midAngle);
                })
                .attr('r', '0.75rem')
                .attr('fill', 'rgba(var(--terRd), 1)')
                .attr('stroke', 'none')
                ;
            
            elementIconGroup
                .selectAll('.element-icon')
                .data(pieData)
                .join('text')
                .attr('class', 'element-icon')
                .attr('x', d => {
                    // Calculate position at middle of arc segment
                    const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    const radius = (elementInner + elementOuter) / 2;
                    return radius * Math.sin(midAngle);
                })
                .attr('y', d => {
                    // Calculate position at middle of arc segment
                    const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    const radius = (elementInner + elementOuter) / 2;
                    return -radius * Math.cos(midAngle);
                })
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('fill', 'rgba(var(--priAd), 1)')
                // .style('text-shadow', '0 0 0.25rem rgba(0, 0, 0, 1), 0 0 1rem rgba(255, 255, 255, 1)')
                .style('text-shadow', '0 0 0.25rem rgba(0, 0, 0, 1)')
                .attr('font-size', '1rem')
                .attr('font-family', 'FontAwesome')
                .text(d => {
                    const icons = {
                        'Air': '\uf72e',
                        'Space': '\uf753',
                        'Fire': '\uf06d',
                        'Water': '\uf043',
                        'Time': '\uf017',
                        'Earth': '\uf6fc',
                    };
                    return icons[d.data.key];
                })
                .style('cursor', 'default')
                ;
        }

        drawElementRing(element_counts);

        // const tooltip = d3
        //     .select('body')
        //     .append('div')
        //     .attr('class', 'element-tooltip')
        //     .style('position', 'absolute')
        //     .style('visibility', 'hidden')
        //     .style('background', 'rgba(0, 0, 0, 0.75)')
        //     .style('color', 'rgba(var(--priYl), 1)')
        //     .style('padding', '0.5rem')
        //     .style('border-radius', '0.25rem')
        //     .style('font-size', '0.75rem')
        //     .style('pointer-events', 'none')
        //     .style('z-index', '1000')
        //     ;

        svg
            .select('.element-arc-group')
            .selectAll('.element-arc')
            .each(function (d) {
                wheelTooltips.attachToElement(d3.select(this), d.data.key, d.data.value);
            })
            ;
        
        svg
            .select('.element-label-group')
            .selectAll('.element-icon')
            .each(function (d) {
                wheelTooltips.attachToElement(d3.select(this), d.data.key, d.data.value);
            })
            ;
    }

});
