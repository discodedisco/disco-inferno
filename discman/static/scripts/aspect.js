const aspectManager = (function () {
    let aspectTypes = {};
    let aspectGroup;
    let cx, cy;
    let planetOrbValues = {};
    let isVisible = false;

    function initialize(svg, centerX, centerY) {
        cx = centerX;
        cy = centerY;

        if (window.wheelConfig === undefined) {
            window.wheelConfig = {};
        }
        window.wheelConfig.r = svg.node().parentNode.getBoundingClientRect().width / 2 - 30;

        svg.select('.aspects-group').remove();

        // Create aspect group
        // const firstChild = svg.node().firstChild;
        aspectGroup = svg
            .insert('g', ':first-child')
            .attr('class', 'aspects-group')
            .style('visibility', isVisible ? 'visible' : 'hidden')
            ;

        if (window.planetData && typeof window.planetData === 'object') {
            planetOrbValues = window.planetData;
        }

        // console.log('initializing aspect manager….');

        // Convert python aspect_options
        if (window.wheelData && window.wheelData.aspectDetails && Array.isArray(window.wheelData.aspectDetails)) {
            console.log("Aspect data received:", window.wheelData.aspectDetails);
            window.wheelData.aspectDetails.forEach(aspect => {
                aspectTypes[aspect.name.toLowerCase()] = {
                    angle: aspect.angle,
                    orb: aspect.defaultOrb,
                    color: aspect.color || getDefaultColor(aspect.name), // No default colors yet
                    symbol: aspect.symbol || ''
                };
            });

            // console.log('aspect types initialized:', aspectTypes);
        } else {
            console.warn('no aspect data found (using defaults)');
            aspectTypes = {
            conjunction: { angle: 0, orb: 8, color: 'rgba(var(--priTi), 1)', symbol: '☌' },
            opposition: { angle: 180, orb: 8, color: 'rgba(var(--secTi), 1)', symbol: '☍' },
            trine: { angle: 120, orb: 8, color: 'rgba(var(--terTi), 1)', symbol: '△' },
            square: { angle: 90, orb: 7, color: 'rgba(var(--quaTi), 1)', symbol: '□' },
            sextile: { angle: 60, orb: 6, color: 'rgba(var(--quiTi), 1)', symbol: '⚹' }
        };
        }
    
        // Invoke toggle listener
        setupToggleListener();
    
        // If aspects were already visible, redraw them on window resize
        if (isVisible) {
            calculateAndDrawAspects();
        }
    }

    // Invoke toggle listener
    function setupToggleListener() {
        const toggleCheckbox = document.getElementById('aspect-toggle-checkbox');
        if (toggleCheckbox) {
            toggleCheckbox.checked = isVisible;

            toggleCheckbox.addEventListener('change', function (e) {
                isVisible = e.target.checked;

                if (isVisible) {
                    calculateAndDrawAspects();
                    aspectGroup.style('visibility', 'visible');
                } else {
                    aspectGroup.style('visibility', 'hidden');
                }
            });
        }

    }

    function calculateAndDrawAspects() {
        // console.log('Calculating aspects….')
        clearAspects();

        const bodies = getAllBodies();
        // console.log(`Found ${bodies.length} celestial bodies:`, bodies)

        // Check each pair of bodies for aspects
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const body1 = bodies[i];
                const body2 = bodies[j];

                // Calculate angular distance between bodies
                let angleDiff = Math.abs(body1.degree - body2.degree);
                if (angleDiff > 180) angleDiff = 360 - angleDiff;

                // console.log(`Checking ${body1.name} (${body1.degree}°) to ${body2.name} (${body2.degree}°): diff = ${angleDiff}°`);

                // check if angle matches any aspect type
                for (const [aspectName, aspectDetails] of Object.entries(aspectTypes)) {
                    // Calculate allowed [Ott's] orb
                    const allowedOrb = (body1.orbOtt + body2.orbOtt) / 2;

                    const orbDiff = Math.abs(angleDiff - aspectDetails.angle);
                    // console.log(` Aspect ${aspectName} (${aspectDetails.angle}°): diff = ${orbDiff}°, allowed orb = ${allowedOrb}°`);

                    // Check if the angle difference is w.in orb tolerance
                    if (orbDiff <= allowedOrb) {
                        // console.log(` ✓ Found aspect: ${body1.name} ${aspectName} ${body2.name}`);
                        drawAspect(body1, body2, aspectDetails);
                        break;
                    }
                }
            }
        }
    }
    
    function getStrokeDashArray(angle) {
        // Ea. line style according to aspect intensity level
        switch (angle) {
            case 0: return null;
            case 180: return null;
            case 120: return '5,3';
            case 90: return '5,3';
            case 72: return '1,3';
            case 30: return '8,3,1,3';
            case 60: return '1,3';
            case 144: return '1,3';
            case 45: return '8,3,1,3';
            case 150: return '8,3,1,3';
            default: return null;
        }
    }
    
    function drawAspect(body1, body2, aspectDetails) {
        // Add null check for wheelConfig
        const wheelConfig = window.wheelConfig || {};
        // const innerRadius = wheelConfig.innerRadius || 120;
        let innerRadius;
        if (window.wheelConfig && window.wheelConfig.r) {
            innerRadius = window.wheelConfig.r - 5;
        } else {
            const chartSize = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
            const r = chartSize / 2 - 30;
            innerRadius = r - 5;
        }

        // console.log(`Drawing aspect: ${body1.name}–${body2.name}, radius=${innerRadius}`);

        // Rotation adjustment
        const offset = window.wheelData.houses.asc - 180;
        const angle1 = (-body1.degree + offset) * Math.PI / 180;
        const angle2 = (-body2.degree + offset) * Math.PI / 180;

        // Calculate polar endpoint coordinates
        const x1 = cx + innerRadius * Math.cos(angle1);
        const y1 = cy + innerRadius * Math.sin(angle1);
        const x2 = cx + innerRadius * Math.cos(angle2);
        const y2 = cy + innerRadius * Math.sin(angle2);

        // console.log(` Line from (${x1.toFixed(1)},${y1.toFixed(1)}) to (${x2.toFixed(1)},${y2.toFixed(1)})`);

        // Draw aspect line
        aspectGroup
            .append('line')
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', aspectDetails.color)
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', getStrokeDashArray(aspectDetails.angle))
            .attr('class', 'aspect-line')
            ;
    }

    function getAllBodies() {
        // Incl. Asc. & M.C.
        const bodies = [];

        // Add null check
        if (!window.wheelData) {
            console.error('wheelData unavailable');
            return bodies;
        }

        // Add planets
        if (window.wheelData.planets) {
            for (const [name, data] of Object.entries(window.wheelData.planets)) {
                bodies.push({
                    name: name,
                    degree: data.deg,
                    orbOtt: data.orbOtt || getDefaultOrb(name)
                });
            }
        }

        // Add Asc. & M.C.
        if (window.wheelData.houses && window.wheelData.houses.asc !== undefined) {
            bodies.push({
                name: 'Ascendant',
                degree: window.wheelData.houses.asc,
                orbOtt: 10 // Default orb for angles
            });
        }
        
        if (window.wheelData.houses && window.wheelData.houses.mc !== undefined) {
            bodies.push({
                name: 'Midheaven',
                degree: window.wheelData.houses.mc,
                orbOtt: 10 // Default orb for angles
            });
        }
        
        return bodies;
    }

    function getDefaultColor(aspectName) {
        // Fallback colors if unspecified in constellation.py
        switch (aspectName.toLowerCase()) {
            case 'conjunction': return 'rgba(255, 255, 0, 0.5)';  // Yellow
            case 'opposition': return 'rgba(255, 0, 0, 0.5)';     // Red
            case 'trine': return 'rgba(0, 255, 0, 0.5)';         // Green
            case 'square': return 'rgba(255, 0, 255, 0.5)';      // Magenta
            case 'sextile': return 'rgba(0, 0, 255, 0.5)';       // Blue
            default: return 'rgba(128, 128, 128, 0.5)';
        }
    }

    function getDefaultOrb(planetName) {
        if (planetOrbValues &&
            planetOrbValues[planetName] &&
            typeof planetOrbValues[planetName].orbOtt !== 'undefined') {
            return planetOrbValues[planetName].orbOtt;
        }
        // Default fallback
        return 4;
    }
    
    function clearAspects() {
        if (aspectGroup) {
            aspectGroup.selectAll('*').remove();
        }
    }
    
    return {
        initialize: initialize,
        calculateAndDrawAspects: calculateAndDrawAspects,
        clearAspects: clearAspects
    };
})();