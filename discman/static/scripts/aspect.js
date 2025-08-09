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

        // Convert python aspect_options
        if (window.wheelData && window.wheelData.aspectDetails && Array.isArray(window.wheelData.aspectDetails)) {
            window.wheelData.aspectDetails.forEach(aspect => {
                aspectTypes[aspect.name.toLowerCase()] = {
                    angle: aspect.angle,
                    orb: aspect.defaultOrb,
                    color: aspect.color || getDefaultColor(aspect.name),
                    symbol: aspect.symbol && aspect.symbol.trim() !== '' ? aspect.symbol : null,
                };
            });
        } else {
            console.warn('no aspect data found (using defaults)');
            // aspectTypes = {
            // conjunction: { angle: 0, orb: 8, color: 'rgba(var(--priTi), 1)', symbol: '☌' },
            // opposition: { angle: 180, orb: 8, color: 'rgba(var(--secTi), 1)', symbol: '☍' },
            // trine: { angle: 120, orb: 8, color: 'rgba(var(--terTi), 1)', symbol: '△' },
            // square: { angle: 90, orb: 7, color: 'rgba(var(--quaTi), 1)', symbol: '□' },
            // sextile: { angle: 60, orb: 6, color: 'rgba(var(--quiTi), 1)', symbol: '⚹' }
            // };
        }
    
        // Invoke toggle listener
        setupToggleListener();
    
        // If aspects were already visible, redraw them on window resize
        if (isVisible) {
            calculateAndDrawAspects();
        }

        window.wheelData.calculatedAspects = calculateAspects();
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

    function calculateAspects() {
        const bodies = getAllBodies();
        const calculatedAspects = [];

        // Check ea. pair of bodies for aspects
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const body1 = bodies[i];
                const body2 = bodies[j];

                // Calculate angular distance between bodies
                let angleDiff = Math.abs((body1.degree - body2.degree + 360) % 360);
                if (angleDiff > 180) angleDiff = 360 - angleDiff;

                // Check if angle matches any aspect type
                for (const [aspectType, aspectDetails] of Object.entries(aspectTypes)) {
                    const allowedOrb = (body1.orbOtt + body2.orbOtt) / 2;
                    const orbDiff = Math.abs(angleDiff - aspectDetails.angle);

                    // Check angle diff w.in orb tolerance
                    if (orbDiff <= allowedOrb) {
                        calculatedAspects.push({
                            body1: body1.name,
                            body2: body2.name,
                            aspectType: aspectType,
                            aspectSymbol: (aspectDetails.symbol && aspectDetails.symbol.trim() !== '') ? aspectDetails.symbol : aspectType,
                            orb: orbDiff,
                        });
                        break;
                    }
                }
            }
        }
        return calculatedAspects;
    }

    function drawCalculatedAspects() {
        const aspects = calculateAspects();

        // Draw all aspects
        const bodies = getAllBodies();
        aspects.forEach(aspect => {
            const body1 = bodies.find(i => i.name === aspect.body1);
            const body2 = bodies.find(j => j.name === aspect.body2);
            const aspectDetails = aspectTypes[aspect.aspectType];

            drawAspect(body1, body2, aspectDetails);
        });

        return aspects;
    }

    function calculateAndDrawAspects() {
        clearAspects();
        const aspects = drawCalculatedAspects();
        return aspects;
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

        // Rotation adjustment
        const offset = window.wheelData.houses.asc - 180;
        const angle1 = (-body1.degree + offset) * Math.PI / 180;
        const angle2 = (-body2.degree + offset) * Math.PI / 180;

        // Calculate polar endpoint coordinates
        const x1 = cx + innerRadius * Math.cos(angle1);
        const y1 = cy + innerRadius * Math.sin(angle1);
        const x2 = cx + innerRadius * Math.cos(angle2);
        const y2 = cy + innerRadius * Math.sin(angle2);

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

    /**
     * Get orb value for planet
     * @param {string} planetName get planet name
     * @return {number} corresponding Ott's orb
     */
    function getDefaultOrb(planetName) {
        if (window.wheelData && window.wheelData.planetDetails) {
            const planetDetail = window.wheelData.planetDetails.find(p => p.name === planetName);
            if (planetDetail && typeof planetDetail.orbOtt !== 'undefined') {
                return planetDetail.orbOtt;
            }
        }

        if (window.wheelData && window.wheelData.planets && window.wheelData.planets[planetName] && window.wheelData.planets[planetName].orbOtt) {
            return window.wheelData.planets[planetName].orbOtt;
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
        clearAspects: clearAspects,
        getAllBodies: getAllBodies,
        calculateAspects: calculateAspects,
        drawCalculatedAspects: drawCalculatedAspects,
    };
})();