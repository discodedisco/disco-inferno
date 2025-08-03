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

    function getHouseFromDegree(degree) {
        const houses = window.wheelData.houses;
        // Find containing house
        for (let i = 0; i < 12; i++) {
            const thisHouse = houses.cusps[i];
            const nextHouse = houses.cusps[(i + 1) % 12];

            // Handle house crossing 0°
            if (nextHouse < thisHouse) {
                if (degree >= thisHouse || degree < nextHouse) {
                    return i + 1;
                }
            } else {
                if (degree >= thisHouse && degree < nextHouse) {
                    return i + 1;
                }
            }
        }
        return 1;
    }

    function getPlanetsInSign(sign) {
        const result = [];
        const planets = window.wheelData.planets;

        for (const [name, data] of Object.entries(planets)) {
            if (getSignFromDegree(data.deg) === sign) {
                result.push({
                    name: name,
                    degree: data.deg % 30
                });
            }
        }
        return result;
    }

    function getPlanetsInHouse(houseNum) {
        const result = [];
        const planets = window.wheelData.planets;

        for (const [name, data] of Object.entries(planets)) {
            if (getHouseFromDegree(data.deg) === houseNum) {
                result.push({
                    name: name,
                    degree: data.deg
                });
            }
        }
        return result;
    }

    function getHouseCuspsInSign(sign) {
        const result = [];
        const houses = window.wheelData.houses;

        houses.cusps.forEach((deg, i) => {
            if (getSignFromDegree(deg) === sign) {
                result.push({
                    house: i + 1,
                    degree: deg % 30
                });
            }
        });
        return result;
    }

    function getPlanetsForElement(element) {
        const result = [];
        const planets = window.wheelData.planets;

        for (const [name, data] of Object.entries(planets)) {
            const sign = getSignFromDegree(data.deg);
            if (getElementForSign(sign) === element) {
                result.push({
                    planet: name,
                    sign: sign,
                    house: getHouseFromDegree(data.deg)
                });
            }
        }
        return result;
    }

    function getPlanetDignities(sign) {
        if (!window.wheelData || !window.wheelData.signDetails) return {};

        const signData = window.wheelData.signDetails.find(s => s.name === sign);
        if (!signData) return [];

        return {
            domicile: signData.domicileOf !== 'n/a' ? signData.domicileOf : null,
            exalted: signData.exaltedOf !== 'n/a' ? signData.exaltedOf : null,
            domicile: signData.domicileOf !== 'n/a' ? signData.domicileOf : null,
            exile: signData.exileOf !== 'n/a' ? signData.exileOf : null,
            fallen: signData.fallenOf !== 'n/a' ? signData.fallenOf : null,
            element: signData.element.split(' ')[0]
        };
    }

    function getSignInfo(signName) {
        if (!signName || !window.wheelData) return null;

        const dignities = getPlanetDignities(signName);
        const planets = getPlanetsInSign(signName);
        const houseCusps = getHouseCuspsInSign(signName);

        // Find sign details from constellation.py
        const signDetails = window.wheelData.signDetails?.find(s => s.name === signName);
        const symbol = window.wheelData.signSymbols?.[signName] || '';

        return {
            name: signName,
            symbol: symbol,
            element: dignities.element,
            dignities: dignities,
            planets: planets,
            houseCusps: houseCusps,
            meaning: signDetails?.meaning || ''
        };
    }

    function getHouseInfo(houseNum) {
        if (!houseNum || !window.wheelData) return null;

        const houses = window.wheelData.houses;
        const cusp = houses.cusps[houseNum - 1];
        const sign = getSignFromDegree(cusp);
        const signDegree = cusp % 30;
        const planets = getPlanetsInHouse(houseNum);
        const dignities = getPlanetDignities(sign);

        // Find house details from constellation.py
        const houseIndex = houseNum - 1;
        const houseDetails = window.wheelData.houseDetails?.[houseIndex];

        return {
            number: houseNum,
            name: houseDetails?.name || `House ${houseNum}`,
            cusp: cusp,
            sign: sign,
            signDegree: signDegree,
            ruler: dignities.ruler,
            planets: planets,
            meaning: houseDetails?.meaning || ''
        };
    }

    function getPlanetInfo(planetName, degree) {
        if (!planetName || !window.wheelData) return null;

        const sign = getSignFromDegree(degree);
        const house = getHouseFromDegree(degree);
        const dignities = getPlanetDignities(sign);
        const signDegree = degree % 30;

        // Find planet details from constellation.py
        const planetDetails = window.wheelData.planetDetails?.find(p => p.name === planetName);

        // Find what signs planet has dignities
        const dignifiedSigns = [];
        if (window.wheelData.signDetails) {
            window.wheelData.signDetails.forEach(sign => {
                if (sign.domicileOf === planetName) {
                    dignifiedSigns.push(sign.name);
                }
                if (sign.exaltedOf === planetName) {
                    dignifiedSigns.push(sign.name);
                }
                if (sign.exiledOf === planetName) {
                    dignifiedSigns.push(sign.name);
                }
                if (sign.fallenOf === planetName) {
                    dignifiedSigns.push(sign.name);
                }
            });
        }

        // Find dignified houses in current chart
        const dignifiedHouses = [];
        if (dignifiedSigns.length > 0 && window.wheelData.houses) {
            window.wheelData.houses.cusps.forEach((cusp, i) => {
                const cuspSign = getSignFromDegree(cusp);
                if (dignifiedSigns.includes(cuspSign)) {
                    dignifiedHouses.push(i + 1);
                }
            });
        }

        return {
            name: planetName,
            symbol: planetDetails?.symbol || '',
            degree: degree,
            signDegree: signDegree,
            sign: sign,
            house: house,
            element: dignities.element,
            dignifiedSigns: dignifiedSigns,
            dignifiedHouses: dignifiedHouses,
            meaning: planetDetails?.meaning || ''
        };
    }

    function getElementInfo(elementName) {
        if (!elementName || !window.wheelData) return null;

        const value = window.wheelData.element_counts?.[elementName] || 0;
        const percent = totalElements > 0 ? Math.round((value / totalElements) * 100) : 0;
        const planets = getPlanetsForElement(elementName);

        return {
            name: elementName,
            count: value,
            percent: percent,
            planets: planets
        };
    }

    // Format degrees nicely
    function formatDegree(deg) {
        const d = Math.floor(deg);
        const m = Math.floor((deg - d) * 60);
        return `${d}° ${m}'`;
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
            
            element.on('mouseover', function (e) {
                const info = getSignInfo(signName);
                if (!info) return;

                let content = `<strong>${info.symbol} ${info.name}</strong> (${info.element})<br>`;

                // Add dignities
                const dignities = [];
                if (info.dignities.domicile) dignities.push(`• Domicile of <strong>${info.dignities.domicile}</strong><br>`);
                if (info.dignities.exalted) dignities.push(`• Exalted of <strong>${info.dignities.exalted}</strong><br>`);
                if (info.dignities.exile) dignities.push(`• Exile of <strong>${info.dignities.exile}</strong><br>`);
                if (info.dignities.fallen) dignities.push(`• Fallen of <strong>${info.dignities.fallen}</strong><br>`);

                if (dignities.length > 0) {
                    content += `<br><u>Dignities:</u><br>${dignities.join('')}<br>`
                }

                // Add house cusps
                if (info.houseCusps.length > 0) {
                    content += `<br><u>House Cusps:</u><br>`;
                    info.houseCusps.forEach(cusp => {
                        content += `House ${cusp.house}: ${formatDegree(cusp.degree)}<br>`;
                    });
                }

                // Add planets
                if (info.planets.length > 0) {
                    content += `<br><u>Planets:</u><br>`;
                    info.planets.forEach(planet => {
                        content += `${planet.name}: <strong>${formatDegree(planet.degree)}</strong><br>`;
                    });
                }

                show(content, e);
            })
            .on('mousemove', function(e) {
                const info = getSignInfo(signName);
                if (!info) return;

                let content = `<strong>${info.symbol} ${info.name}</strong> (${info.element})<br>`;

                // Add dignities
                const dignities = [];
                if (info.dignities.domicile) dignities.push(`• Domicile of <strong>${info.dignities.domicile}</strong><br>`);
                if (info.dignities.exalted) dignities.push(`• Exalted of <strong>${info.dignities.exalted}</strong><br>`);
                if (info.dignities.exile) dignities.push(`• Exile of <strong>${info.dignities.exile}</strong><br>`);
                if (info.dignities.fallen) dignities.push(`• Fallen of <strong>${info.dignities.fallen}</strong><br>`);

                if (dignities.length > 0) {
                    content += `<br><u>Dignities:</u><br>${dignities.join('')}<br>`
                }

                // Add house cusps
                if (info.houseCusps.length > 0) {
                    content += `<br><u>House Cusps:</u><br>`;
                    info.houseCusps.forEach(cusp => {
                        content += `House ${cusp.house}: ${formatDegree(cusp.degree)}<br>`;
                    });
                }

                // Add planets
                if (info.planets.length > 0) {
                    content += `<br><u>Planets:</u><br>`;
                    info.planets.forEach(planet => {
                        content += `${planet.name}: <strong>${formatDegree(planet.degree)}</strong><br>`;
                    });
                }

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