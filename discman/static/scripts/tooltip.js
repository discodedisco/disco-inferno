// Tooltip module
const wheelTooltips = (function() {
    let tooltip;
    let totalElements = 0;

    // const signs = window.wheelData.signs;
    // const houses = window.wheelData.houses;
    // const planets = window.wheelData.planets;
    // const houseCusps = window.wheelData.houses.cusps;
    // const signIndex = indexOf(signName);
    // degree = degree % 360;
    // const signIndexCusp = Math.floor(degree / 30);
    // const startDegree = signIndex * 30;
    // const endDegree = startDegree + 30;

    function initialize() {
        // Create tooltip el
        tooltip = d3
            .select('body')
            .append('div')
            .attr('class', 'chart-tooltip')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background', 'rgba(0, 0, 0, 0.75)')
            .style('color', 'rgba(var(--priYl), 1)')
            .style('padding', '0.75rem')
            .style('border-radius', '0.25rem')
            .style('font-size', '0.75rem')
            .style('pointer-events', 'none')
            .style('max-width', '250px')
            .style('z-index', '1000')
            ;
        
        // Calculate totalElements
        if (window.wheelData && window.wheelData.element_counts) {
            totalElements = Object
                .values(window.wheelData.element_counts)
                .reduce((sum, count) => sum + count, 0)
                ;
        }
    }

    // Getter
    function getTooltip() {
        return tooltip;
    }

    // Helper functions
    function getSignFromDegree(degree) {
        const signs = window.wheelData.signs;
        degree = degree % 360;
        const signIndex = Math.floor(degree / 30);
        return signs[signIndex];
    }

    // Event handlers
    function show(content, e) {
        tooltip
            .html(content)
            .style('visibility', 'visible')
            .style('top', (e.pageY - 10) + 'px')
            .style('left', (e.pageX + 10) + 'px');
    }

    function hide() {
        tooltip.style('visibility', 'hidden');
    }

    // ONLY ONE return statement at the very end
    return {
        initialize: initialize,
        getTooltip: getTooltip,
        
        // Add attachToSign function
        attachToSign: function(element, signName) {
            if (!element || !signName) return;
            
            element.on('mouseover', function(e) {
                const content = `<strong>${signName}</strong>`;
                show(content, e);
            })
            .on('mousemove', function(e) {
                const content = `<strong>${signName}</strong>`;
                show(content, e);
            })
            .on('mouseout', hide);
        },
        
        // Add attachToPlanet function
        attachToPlanet: function(element, planetName, degree) {
            if (!element || !planetName) return;
            
            element.on('mouseover', function(e) {
                const content = `<strong>${planetName}</strong>`;
                show(content, e);
            })
            .on('mousemove', function(e) {
                const content = `<strong>${planetName}</strong>`;
                show(content, e);
            })
            .on('mouseout', hide);
        },

        // Add attachToHouse function
        attachToHouse: function(element, houseName, degree) {
            if (!element || !houseName) return;
            
            element.on('mouseover', function(e) {
                const content = `<strong>${houseName}</strong>`;
                show(content, e);
            })
            .on('mousemove', function(e) {
                const content = `<strong>${houseName}</strong>`;
                show(content, e);
            })
            .on('mouseout', hide);
        },
        
        // Add attachToElement function
        attachToElement: function(element, elementName, value) {
            if (!element || !elementName) return;
            
            const percent = value ? Math.round((value / totalElements) * 100) : 0;
            const content = `${elementName}: ${value} (${percent}%)`;
            
            element
                .on('mouseover', function(e) {
                    show(content, e);
                })
                .on('mousemove', function(e) {
                    show(content, e);
                })
                .on('mouseout', hide);
        }
    };
})();