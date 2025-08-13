// window.addEventListener('DOMContentLoaded', function () {
//     this.setTimeout(function () {
//         console.log('DIRECT TEST:');
//         const testAspects = aspectManager.calculateAspects();
//         console.log('Raw aspects:', testAspects);

//         if (testAspects && testAspects.length) {
//             const testPlanet = testAspects[0].body1;
//             console.log(`Testing aspects for ${testPlanet}`);
//             testAspects.filter(a => a.body1 === testPlanet || a.body2 === testPlanet);
//         }
//     }, 1000);
// });

// Tooltip module
const wheelTooltips = (function () {
    let tooltip;
    let totalElements = 0;
    let totalDistinctions = 0;

    function initialize() {
        // Remove existing
        d3.selectAll('.chart-tooltip').remove();
        
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

        // Calculate totalDistinctions
        if (window.wheelData && window.wheelData.distinction_counts) {
            window.totalDistinctions = Object
                .values(window.wheelData.distinction_counts)
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
        if (!window.wheelData || !window.wheelData.signs) return '';

        degree = (parseFloat(degree) + 360) % 360;

        const signIndex = Math.floor(degree / 30);

        // return signs[signIndex];
        return window.wheelData.signs[signIndex] || '';
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
            const planetDegree = data.deg;
            const planetSign = getSignFromDegree(data.deg);

            if (planetSign && planetSign.toLowerCase() === sign.toLowerCase()) {
                result.push({
                    name: name,
                    symbol: window.wheelData.planetSymbols[name] || name.charAt(0),
                    degree: planetDegree % 30
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
            ruler: dignities.domicileIn,
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

        // Find in which signs planet has dignities
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

    function getElementsForPlanet(planetName, degree) {
        const sign = getSignFromDegree(degree);
        const signDetails = window.wheelData.signDetails.find(s => s.name === sign);
        const elements = [];

        // Classical Element
        if (signDetails) {
            elements.push(signDetails.element.split(' ')[0]);
        }

        // Space & Time—please improve this logic
        const ascSign = getSignFromDegree(window.wheelData.houses.asc);
        const descSign = getSignFromDegree(window.wheelData.houses.asc + 180) % 360;
        const mcSign = getSignFromDegree(window.wheelData.houses.mc);
        const icSign = getSignFromDegree(window.wheelData.houses.mc + 180) % 360;

        if (sign === ascSign || sign === descSign) elements.push('Space');
        if (sign === mcSign || sign === icSign) elements.push('Time');

        // Remove duplications
        return [...new Set(elements)];
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

    function getAspectsForPlanet(planetName) {
        if (!window.wheelData || !window.wheelData.aspectDetails && !window.wheelData.calculatedAspects) return [];

        const bodies = aspectManager.getAllBodies();
        const aspects = window.wheelData.calculatedAspects || aspectManager.calculateAspects();

        const planetAspects = aspects
            .filter(a => a.body1 === planetName || a.body2 === planetName)
            .map(a => {
                // find body 2
                const aspectedName = a.body1 === planetName ? a.body2 : a.body1;
                const aspectedBody = bodies.find(b => b.name === aspectedName);

                const aspectTypeLower = a.aspectType.toLowerCase();

                // Find default orb
                const aspectDetail = window.wheelData.aspectDetails.find(ad => ad.name.toLowerCase() === aspectTypeLower);

                const defaultOrb = aspectDetail ? aspectDetail.orb : 0;

                return {
                    aspectType: a.aspectType,
                    aspectSymbol: a.aspectSymbol || a.aspectType,
                    orb: a.orb,
                    aspected: aspectedName,
                    aspectedSymbol: window.wheelData.planetSymbols?.[aspectedName] || aspectedBody?.name?.charAt(0) || aspectedName,
                    aspectedDegree: aspectedBody?.degree,
                    defaultOrb: defaultOrb,
                };
            })
            ;
        
        // sort by default orb (descending) and then by actual orb (ascending)
        planetAspects.sort((a, b) => {
            // default descending
            if (b.defaultOrb !== a.defaultOrb) {
                return b.defaultOrb - a.defaultOrb;
            }
            // actual ascending
            return a.orb - b.orb;
        });

        return planetAspects;
    }

    /**
     * Get element mods for planet from aspects
     * @param {string} planetName planet needing mods
     * @return {Object|null} element mods for planet, or null
     */
    function getElementModsForPlanet(planetName) {
        if (typeof aspectMod === 'undefined' || !aspectMod.calculateMods) {
            return null;
        }

        const mods = aspectMod.calculateMods();
        return mods[planetName] || null;
    }

    function getDistinctionForPlanet() {
        // Reset distinction counts
        // const distinctionCounts = {
        //     'Self': 0,
        //     'Worth': 0,
        //     'Education': 0,
        //     'Home': 0,
        //     'Creativity': 0,
        //     'Service': 0,
        //     'Cooperation': 0,
        //     'Regeneration': 0,
        //     'Enterprise': 0,
        //     'Career': 0,
        //     'Rewards': 0,
        //     'Reprisals': 0
        // };

        // Get all planets
        const houseDistinctions = {};
        const groupMap = {};
        const constellationDetails = window.wheelData.constellationDetails;

        if (constellationDetails) {
            constellationDetails.forEach(constellation => {
                // Parse house number
                let houseNum = null;
                if (constellation.natalHouse) {
                    const match = constellation.natalHouse.match(/house-(\d+)/);
                    if (match) houseNum = parseInt(match[1]);
                }
                // Assign group distinction if this is a governing sign
                if (
                    houseNum &&
                    constellation.govSign === constellation.name &&
                    constellation.distinction
                ) {
                    groupMap[houseNum] = constellation.distinction;
                    if (!houseDistinctions[houseNum]) houseDistinctions[houseNum] = [undefined, undefined, undefined];
                }
                // Assign sub-distinction if decan is present
                if (
                    houseNum &&
                    constellation.decan &&
                    constellation.distinction
                ) {
                    const decanIndex = constellation.decan - 1; // decan should be 1,2,3
                    if (!houseDistinctions[houseNum]) houseDistinctions[houseNum] = [undefined, undefined, undefined];
                    houseDistinctions[houseNum][decanIndex] = constellation.distinction;
                }
            });
        } else {
            console.warn('Constellation data unavailable; using default mappings');
        }
        

        const distinctionCounts = {};
        const subDistinctionCounts = {};
        Object.values(groupMap).forEach(group => distinctionCounts[group] = 0);
        Object.values(houseDistinctions).flat().forEach(sub => subDistinctionCounts[sub] = 0);

        // Calculate for ea. planet
        const planets = window.wheelData.planets;
        const houses = window.wheelData.houses;

        if (!planets || !constellationDetails || !houses.cusps) {
            console.warn('Missing data needed for distinction tabulation');
            return distinctionCounts;
        }

        // For ea. planet
        Object.entries(planets).forEach(([planetName, data]) => {
            const degree = data.deg;
            const houseNum = wheelTooltips.getHouseFromDegree ? wheelTooltips.getHouseFromDegree(degree) : getHouseFromDegree(degree);
            // console.log(`Planet ${planetName} at ${degree}° is in house ${houseNum}`);

            if (!houseNum || !houseDistinctions[houseNum]) return;

            // Calculate thirds of ea. house
            const houseCusp = houses.cusps[houseNum - 1];
            const nextHouseCusp = houses.cusps[houseNum % 12];

            // Calculate house span in deg
            let houseSpan = nextHouseCusp - houseCusp;
            if (houseSpan < 0) houseSpan += 360;

            // Calculate pos in house (0–houseSpan)
            let posInHouse = (degree - houseCusp);
            if (posInHouse < 0) posInHouse += 360;

            // Determine third of house (0/1/2)
            const thirdOfHouse = Math.floor((posInHouse / houseSpan) * 3);

            // Get distinction for third
            const distinction = houseDistinctions[houseNum][thirdOfHouse];

            // Get group for house
            const group = groupMap[houseNum];
            const subDistinction = houseDistinctions[houseNum][thirdOfHouse];

            // console.log('houseDistinctions:', houseDistinctions);
            // console.log('groupMap:', groupMap);

            // +1 Distinction
            if (distinction) {
                console.debug(`Planet ${planetName} in House ${houseNum}, third ${thirdOfHouse + 1}, ${distinction} +1`);
            }

            if (group) {
                distinctionCounts[group] = (distinctionCounts[group] || 0) + 1;
            }
            if (subDistinction) subDistinctionCounts[subDistinction] = (subDistinctionCounts[subDistinction] || 0) + 1;
        });

        return distinctionCounts;
    }

    function getSubDistinctionFromDistinction(distinctName) {
        // get house num
        let houseNum = null;
        for (let i = 1; i <= 12; i++) {
            if (window.wheelData.constellationDetails.find(
                c => c.govSign === c.name && c.distinction === distinctName && c.natalHouse === `house-${i.toString().padStart(2, '0')}`
            )) {
                houseNum = i;
                break;
            }
        }

        if (!houseNum) return [];

        // Get sub-distinctions for house
   
        const houseDecans = window.wheelData.constellationDetails
            .filter(c => c.natalHouse === `house-${houseNum.toString().padStart(2, '0')}` && c.decan)
            .sort((a, b) => a.decan - b.decan)
            ;

        const subDistinctions = {};
        houseDecans.forEach(c => {
                subDistinctions[c.distinction] = 0;
            })
            ;
        
        // count planets in ea. house-third
        const planets = window.wheelData.planets;
        const houses = window.wheelData.houses;

        Object.entries(planets).forEach(([planetName, data]) => {
            const degree = data.deg;
            const planetHouseNum = getHouseFromDegree(degree);

            if (planetHouseNum === houseNum) {
                // Calculate which house-third planet is in
                const houseCusp = houses.cusps[houseNum - 1];
                const nextHouseCusp = houses.cusps[houseNum % 12];

                let houseSpan = nextHouseCusp - houseCusp;
                if (houseSpan < 0) houseSpan += 360;

                let posInHouse = degree - houseCusp;
                if (posInHouse < 0) posInHouse += 360;

                const thirdOfHouse = Math.floor((posInHouse / houseSpan) * 3);

                // Find sub-distinction of house-third
                const subDistinctionName = houseDecans[thirdOfHouse]?.distinction;
                // const subDistinctionName = window.wheelData.constellationDetails.find(c => c.natalHouse === `house-${houseNum.toString().padStart(2, '0')}` && c.decan === thirdOfHouse + 1)?.distinction;

                if (subDistinctionName) {
                    subDistinctions[subDistinctionName] = (subDistinctions[subDistinctionName] || 0) + 1;
                }
            }
        });

        // console.log('SubDistinctions for', distinctName, subDistinctions);

        return subDistinctions;
    }

    // Format degrees nicely
    function formatDegree(deg) {
        const d = Math.floor(deg);
        const m = Math.floor((deg - d) * 60);
        // Leading zeroes
        const dStr = d < 10 ? `0${d}` : `${d}`;
        const mStr = m < 10 ? `0${m}` : `${m}`;
        return `${dStr}° ${mStr}'`;
    }

    // Event handlers
    function show(content, e) {
        const padding = 10;
        const x = e.pageX;
        const y = e.pageY;
        
        // Set content first to calculate dimensions
        tooltip
            .html(content)
            .style('visibility', 'visible')
            .style('left', '-9999px')
            .style('top', '-9999px')
            ;
        
        // Get tooltip and viewport dimensions
        const tooltipWidth = tooltip.node().offsetWidth;
        const tooltipHeight = tooltip.node().offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate position with smart boundary handling
        let leftPos = x + padding;
        let topPos = y + padding;
        
        if (leftPos + tooltipWidth > viewportWidth - padding) {
            leftPos = Math.max(padding, x - tooltipWidth - padding)
        }

        if (topPos + tooltipHeight > viewportHeight - padding) {
            topPos = Math.max(padding, y - tooltipHeight - padding)
        }
        
        // Apply consistent positioning (left/top only)
        tooltip
            .style('left', leftPos + 'px')
            .style('top', topPos + 'px')
            ;
    }

    function hide() {
        if (tooltip) tooltip.style('visibility', 'hidden');
    }

    function cleanup() {
        if (tooltip) {
            tooltip.remove();
            tooltip = null;
        }
    }

    // ONLY ONE return statement at the very end
    return {
        initialize: initialize,
        getTooltip: getTooltip,
        
        // Add attachToSign function
        attachToSign: function (domElement, signName) {

            const info = getSignInfo(signName);
            if (!info) return;
            
            if (!domElement || !signName) return;

            let content = `<strong>${info.symbol} ${info.name}</strong> (${info.element})<br>`;

            // Add dignities
            // const dignities = [];
            // if (info.dignities.domicile) dignities.push(`• Domicile of <strong>${info.dignities.domicile}</strong><br>`);
            // if (info.dignities.exalted) dignities.push(`• Exalted of <strong>${info.dignities.exalted}</strong><br>`);
            // if (info.dignities.exile) dignities.push(`• Exile of <strong>${info.dignities.exile}</strong><br>`);
            // if (info.dignities.fallen) dignities.push(`• Fallen of <strong>${info.dignities.fallen}</strong><br>`);

            // if (dignities.length > 0) {
            //     content += `<br><u>Dignities:</u><br>${dignities.join('')}<br>`
            // }

            // Add house cusps
            if (info.houseCusps.length > 0) {
                content += `<br><u>House Cusps:</u><br>`;
                info.houseCusps.forEach(cusp => {
                    const houseNumStr = cusp.house < 10 ? `0${cusp.house}` : `${cusp.house}`;
                    content += `<strong>${houseNumStr}</strong> @ ${formatDegree(cusp.degree)}<br>`;
                });
            }

            // Add planets
            if (info.planets.length > 0) {
                content += `<br><u>Planets:</u><br>`;
                info.planets.forEach(planet => {
                    const signDignities = getPlanetDignities(signName);
                    let dignityLabel = '';
                    if (signDignities.domicile === planet.name) dignityLabel = ' (Domicile)'
                    if (signDignities.exalted === planet.name) dignityLabel = ' (Exalted)'
                    if (signDignities.exile === planet.name) dignityLabel = ' (Exile)'
                    if (signDignities.fallen === planet.name) dignityLabel = ' (Fallen)'

                    content += `<strong>${planet.symbol}</strong> @ ${formatDegree(planet.degree)}${dignityLabel}<br>`;
                });
            }
            
            domElement
                .on('mouseover', function (e) { show(content, e); })
                .on('mousemove', function(e) { show(content, e); })
                .on('mouseout', hide)
                ;            
        },
        
        // Add attachToPlanet function
        attachToPlanet: function(domElement, planetName, degree) {
            if (!domElement || !planetName || degree === undefined) return;
            const info = getPlanetInfo(planetName, degree);
            if (!info) return;

            const sign = getSignFromDegree(degree);
            const house = getHouseFromDegree(degree);
            const signDignities = getPlanetDignities(sign);
            const planetElements = getElementsForPlanet(planetName, degree);
            const signSymbol = window.wheelData.signSymbols[sign] || sign;

            let content = `<strong>${info.symbol} ${info.name}</strong><br>`;

            const houseStr = house < 10 ? `0${house}` : `${house}`;
            content += `in <strong>House ${houseStr}</strong> &<br> @ ${formatDegree(degree % 30)} <strong>${signSymbol}</strong><br>`;


            // Check if planet has dignity in current sign
            const dignityStatus = [];
            if (signDignities.domicile === planetName) {
                dignityStatus.push(`Domicile in <strong>${signSymbol}</strong><br>`);
            }
            if (signDignities.exalted === planetName) {
                dignityStatus.push(`Exalted <strong>in ${signSymbol}</strong><br>`);
            }
            if (signDignities.exile === planetName) {
                dignityStatus.push(`Exile <strong>in ${signSymbol}</strong><br>`);
            }
            if (signDignities.fallen === planetName) {
                dignityStatus.push(`Fallen <strong>in ${signSymbol}</strong><br>`);
            }
            if (dignityStatus.length > 0) {
                content += `<br><u>Dignified:</u><br>${dignityStatus.join('')}`;
            }

            // Show planetary aspects
            const aspects = getAspectsForPlanet(planetName);
            if (aspects.length > 0) {
                content += `<br><u>Aspects:</u><br>`;
                aspects.forEach(a => {
                    content += `<strong>${a.aspectSymbol}</strong> to <strong>${a.aspectedSymbol}</strong>`;
                    if (typeof a.orb === 'number') content += ` (orb: ${formatDegree(a.orb)})`;
                    content += `<br>`;
                });
            }

            // Show planet's element & chart totals
            content += `<br><u>Elements:</u><br>`;

            // Get aspect mods for planet
            const elementMods = getElementModsForPlanet(planetName);

            const totalElements = {};

            // Default elements
            planetElements.forEach(el => {
                totalElements[el] = 1;
            });

            if (elementMods) {
                Object.entries(elementMods).forEach(([element, value]) => {
                    if (value > 0) {
                        totalElements[element] = (totalElements[element] || 0) + value;
                    }
                });
            }

            // Display total elements
            Object.entries(totalElements).forEach(([element, count]) => {
                if (count > 0) {
                    content += `+${count} ${element}<br>`;
                }
                
                if (count < 0) {
                    content += `-${count} ${element}<br>`;
                }
            });

            // Add empty line if elements were shown
            if (Object.keys(totalElements).length > 0) {
                content += `<br>`;
            }

            domElement
                .on('mouseover', function (e) { show(content, e); })
                .on('mousemove', function(e) { show(content, e); })
                .on('mouseout', hide)
                ;
        },

        // Add attachToHouse function
        attachToHouse: function(domElement, houseNum, degree) {
            if (!domElement || !houseNum) return;

            const info = getHouseInfo(houseNum);
            if (!info) return;

            // House No. w. ordinal indicator
            function ordinal(n) {
                const s = ['th', 'st', 'nd', 'rd'],
                    v = n % 100;
                return n + '<sup>' + (s[(v - 20) % 10] || s[v] || s[0]) + '</sup>';
            }

            const houseNumStr = ordinal(info.number);
            const houseName = info.name;
            const signSymbol = window.wheelData.signSymbols[info.sign] || info.sign;
            const cuspDegree = formatDegree(info.signDegree);
            const rulerSymbol = window.wheelData.planetSymbols[info.ruler] || info.ruler || '';
            const meaning = info.meaning;

            let content = `<strong>${houseNumStr} House</strong><br>`;
            content += `${houseName}<br>`;
            content += `Cusp in <strong>${signSymbol}</strong> @ ${cuspDegree}<br>`;
            if (rulerSymbol) content += `Ruled by ${rulerSymbol}<br>`;
            content += `<br><u>Meanings:</u><br>`;
            const meaningPoints = meaning.split(',').map(item => item.trim());
            meaningPoints.forEach(point => {
                if (point) content += `${point}<br>`
            })

            // Planets in house
            if (info.planets && info.planets.length > 0) {
                content += `<br><u>Planets:</u><br>`;
                info.planets.forEach(planet => {
                    const planetSymbol = window.wheelData.planetSymbols[planet.name] || planet.name.charAt(0);
                    const planetSign = getSignFromDegree(planet.degree);
                    const planetSignSymbol = window.wheelData.signSymbols[planetSign] || planetSign;
                    content += `<strong>${planetSymbol}</strong> @ ${formatDegree(planet.degree % 30)} in <strong>${planetSignSymbol}</strong><br>`;
                });
            }
            
            domElement
                .on('mouseover', function (e) { show(content, e); })
                .on('mousemove', function(e) { show(content, e); })
                .on('mouseout', hide)
                ;
        },
        
        // Add attachToElement function
        attachToElement: function(domElement, elementName, value) {
            if (!domElement || !elementName) return;
            
            const percent = value ? Math.round((value / totalElements) * 100) : 0;
            let content = `<strong>${elementName} ${value}</strong> (${percent}%)`;
            
            domElement
                .on('mouseover', function(e) { show(content, e); })
                .on('mousemove', function(e) { show(content, e); })
                .on('mouseout', hide)
                ;
        },

        attachToDistinction: function (domElement, distinctName, value) {
            if (!domElement || !distinctName) return;

            const distinctionCounts = wheelTooltips.getDistinctionForPlanet();
            const totalDistinctions = Object.values(distinctionCounts).reduce((a, b) => a + b, 0);
            const percent = totalDistinctions > 0 ? Math.round((value / totalDistinctions) * 100) : 0;
            const subDistinctions = wheelTooltips.getSubDistinctionFromDistinction(distinctName);

            let content = `<strong>${distinctName} ${value}</strong> (${percent}%)`;

            const nonzeroSubs = Object
                .entries(subDistinctions)
                .filter(([name, count]) => count > 0)
                // .sort(([, countA], [, countB]) => countB - countA);
                ;
            
            if (nonzeroSubs.length > 0) {
                content += `<br><br><u>Distinctions:</u><br>`;
                nonzeroSubs.forEach(([name, count]) => {
                    content += `${name} +${count}<br>`;
                });
            }

            domElement
                .on('mouseover', function (e) { show(content, e); })
                .on('mousemove', function (e) { show(content, e); })
                .on('mouseout', hide)
                ;
        },

        hideAll: function () {
            d3.selectAll('.chart-tooltip').remove();
            tooltip = null;
        },

        cleanup: cleanup,
        getDistinctionForPlanet: getDistinctionForPlanet,
        getSubDistinctionFromDistinction: getSubDistinctionFromDistinction,
        getHouseFromDegree: getHouseFromDegree
    };
})();