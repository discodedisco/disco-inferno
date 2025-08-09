const aspectMod = (function () {
    let calculatedMods = null;

    /**
     * Gets element of sign
     * @param {string} sign zodiacal sign
     * @return {string} element of sign
     */
    function getElementForSign(sign) {
        if (!window.wheelData || !window.wheelData.signDetails) return '';

        const signData = window.wheelData.signDetails.find(s => s.name === sign);
        if (!signData) return '';

        return signData.element.split(' ')[0];
    }

    /**
     * gets element of special point
     * @param {string} pointName name of special point
     * @return {string} element corresponding to point's sign
     */
    function getElementForPoint(pointName) {
        if (!window.wheelData || !window.wheelData.houses) return '';

        let degree;
        if (pointName === 'Asc') {
            degree = window.wheelData.houses.asc;
        } else if (pointName === 'MC') {
            degree = window.wheelData.houses.mc;
        } else {
            return '';
        }

        // Get sign from degree
        const sign = getSignFromDegree(degree);

        // Get element from sign
        return getElementForSign(sign);
    }

    /**
     * Gets sign of planet
     * @param {string} planetName name of planet
     * @return {string} sign of planet
     */
    function getSignForPlanet(planetName) {
        if (!window.wheelData || !window.wheelData.planets) return '';

        const planet = window.wheelData.planets[planetName];
        if (!planet) return '';

        const degree = planet.deg;
        return getSignFromDegree(degree);
    }

    /**
     * Get sign from degree
     * @param {number} degree zodiacal degree
     * @return {string}
     */
    function getSignFromDegree(degree) {
        if (!window.wheelData || !window.wheelData.signs) return '';

        degree = (parseFloat(degree) + 360) % 360;
        const signIndex = Math.floor(degree / 30);
        return window.wheelData.signs[signIndex] || '';
    }

    /**
     * Init mod object for all planets
     * @return {Object} Map planet to element mod (empty object)
     */
    function initModsObject() {
        const mods = {};

        if (window.wheelData && window.wheelData.planets) {
            Object.keys(window.wheelData.planets).forEach(planet => {
                mods[planet] = {
                    Air: 0,
                    Space: 0,
                    Fire: 0,
                    Water: 0,
                    Time: 0,
                    Earth: 0,
                };
            });
        }

        mods['Asc'] = {
            Air: 0,
            Space: 0,
            Fire: 0,
            Water: 0,
            Time: 0,
            Earth: 0,
        }
        mods['MC'] = {
            Air: 0,
            Space: 0,
            Fire: 0,
            Water: 0,
            Time: 0,
            Earth: 0,
        }

        return mods;
    }

    /**
     * 
     * @returns Determine inner/outer planet
     * @param {string} body1 Planet 1
     * @param {string} body2 Planet 2
     * @return {Object} contains both innerPlanet & outerPlanet
     */
    function determinePlanetOrder(body1, body2) {
        let innerPlanet, outerPlanet;


        if (window.wheelData.planetOrder) {
            const index1 = window.wheelData.planetOrder.indexOf(body1);
            const index2 = window.wheelData.planetOrder.indexOf(body2);

            if (index1 !== -1 && index2 !== -1) {
                innerPlanet = index1 < index2 ? body1 : body2;
                outerPlanet = index1 < index2 ? body2 : body1;
            } else {
                innerPlanet = body1;
                outerPlanet = body2;
            }
        } else {
            // Fallback to original logic if planetOrder not available
            const isPos2Greater = (pos2 > pos1 && pos2 - pos1 < 180) || (pos2 < pos1 && pos1 - pos2 > 180);
            innerPlanet = isPos2Greater ? body1 : body2; // Fixed: was planet1/planet2
            outerPlanet = isPos2Greater ? body2 : body1; // Fixed: was planet2/planet1
        }

        return { innerPlanet, outerPlanet };
    }

    /**
     * Process aspects of ea. type w. specific mod logic
     * @param {string} aspectType type of aspect
     * @param {Function} modLogic choose function based on aspect type
     * @return {Object} element mods for ea. planet
     */
    function processAspectType(aspectType, modLogic) {
        const mods = initModsObject();

        // Get all aspects
        const aspects = aspectManager.calculateAspects();

        // filter aspect type
        const filteredAspects = aspects.filter(aspect => aspect.aspectType.toLowerCase() === aspectType.toLowerCase());

        // Process ea. planet
        filteredAspects.forEach(aspect => {
            const body1 = aspect.body1;
            const body2 = aspect.body2;

            // Get planet order
            const { innerPlanet, outerPlanet } = determinePlanetOrder(body1, body2);

            // Get signs & elements
            const innerSign = getSignForPlanet(innerPlanet);
            const outerSign = getSignForPlanet(outerPlanet);
            const innerElement = getElementForSign(innerSign);
            const outerElement = getElementForSign(outerSign);

            if (innerElement && outerElement) {
                // Apply aspect-specific mod logic
                modLogic(mods, innerPlanet, outerPlanet, innerElement, outerElement, innerSign, outerSign);
            }
        });
        
        return mods;
    }

    /**
     * calculate conjunct
     * @return {Object} Map planet to element mod
     */
    function calculateConjunctionMods() {
        return processAspectType('conjunction', (mods, innerPlanet, outerPlanet, innerElement, outerElement, innerSign, outerSign) => {
            // Apply outer planet element as bonus to inner planet
            mods[innerPlanet][outerElement] += 1;
            
            // Debug output
            console.log(`Conjunction: ${innerPlanet} (${innerSign}) and ${outerPlanet} (${outerSign}))`);
            console.log(`Modifier: ${innerPlanet} enjoys +1 ${outerElement} from ${outerPlanet}`);
        });
    }

     /**
     * calculate square
     * @return {Object} Map planet to element mod
     */
    function calculateSquareMods() {
        return processAspectType('square', (mods, innerPlanet, outerPlanet, innerElement, outerElement, innerSign, outerSign) => {
            // Apply penalty to outer planet sign element
            mods[outerPlanet][outerElement] -= 1;

            // Debug output
            console.log(`Square: ${innerPlanet} (${innerSign}) and ${outerPlanet} ${outerSign})`);
            console.log(`Modifier: ${outerPlanet} suffers -1 ${outerElement} from square w. ${innerPlanet}`);
        })
    }

    /**
     * calculate oppose
     * @return {Object} Map planet to element mod
     */
    function calculateOppositionMods() {
        return processAspectType('opposition', (mods, innerPlanet, outerPlanet, innerElement, outerElement, innerSign, outerSign) => {
            // Apply outer planet element as bonus to inner planet
            mods[innerPlanet][innerElement] += 1;
            mods[outerPlanet][outerElement] -= 1;
            
            // Debug output
            console.log(`Opposition: ${innerPlanet} (${innerSign}) and ${outerPlanet} (${outerSign}))`);
            console.log(`Modifier: ${innerPlanet} enjoys +1 ${innerElement} from ${outerPlanet}; but ${outerPlanet} suffers -1 ${outerElement} from ${innerPlanet}`);
        });
    }

    /**
     * Calculate all aspect mods
     * @param {boolean} forceRecalculate Force recalc even when cached
     * @return {Object} Map planet name to ea. element mod
     */
    function calculateAllMods(forceRecalculate = false) {
        if (calculatedMods && !forceRecalculate) {
            return calculatedMods;
        }

        // Init empty mods object
        const mods = initModsObject();
        
        // Calculate ea. aspect type
        const conjunctionMods = calculateConjunctionMods();
        const squareMods = calculateSquareMods();
        const oppositionMods = calculateOppositionMods();

        // Merge all mod types
        Object.keys(mods).forEach(planet => {
            Object.keys(mods[planet]).forEach(element => {
                // conjunction mods
                if (conjunctionMods[planet] && conjunctionMods[planet][element]) {
                    mods[planet][element] += conjunctionMods[planet][element];
                }
                // square mods
                if (squareMods[planet] && squareMods[planet][element]) {
                    mods[planet][element] += squareMods[planet][element];
                }
                // opposition mods
                if (oppositionMods[planet] && oppositionMods[planet][element]) {
                    mods[planet][element] += oppositionMods[planet][element];
                }
            });
        });

        calculatedMods = mods;
        return mods;
    }

    /**
     * Get total element count incl. aspect mods
     * @return {Object} Total count for ea. element
     */
    function getTotalElementCounts() {
        const mods = calculateAllMods();
        const baseCounts = { ...window.wheelData.element_counts };

        // Add base elements from special points
        if (window.wheelData && window.wheelData.houses) {
            // Add Ascendant element
            if (typeof window.wheelData.houses.asc !== 'undefined') {
                const ascSign = getSignFromDegree(window.wheelData.houses.asc);
                const ascElement = getElementForSign(ascSign);
                if (ascElement) {
                    baseCounts[ascElement] = (baseCounts[ascElement] || 0) + 1;
                }
            }
            
            // Add MC element
            if (typeof window.wheelData.houses.mc !== 'undefined') {
                const mcSign = getSignFromDegree(window.wheelData.houses.mc);
                const mcElement = getElementForSign(mcSign);
                if (mcElement) {
                    baseCounts[mcElement] = (baseCounts[mcElement] || 0) + 1;
                }
            }
        }

        // Apply mods from ea. planet
        Object.keys(mods).forEach(body => {
            let bodyElement;

            if (body === 'Asc' && window.wheelData && window.wheelData.houses) {
                const ascSign = getSignFromDegree(window.wheelData.houses.asc);
                bodyElement = getElementForSign(ascSign);
            } else if (body === 'MC' && window.wheelData && window.wheelData.houses) {
                const mcSign = getSignFromDegree(window.wheelData.houses.mc);
                bodyElement = getElementForSign(mcSign);
            } else {
                const bodySign = getSignForPlanet(body);
                bodyElement = getElementForSign(bodySign);
            }

            // Apply mods for ea. element
            Object.keys(mods[body]).forEach(element => {
                if (mods[body][element] !== 0) {
                    baseCounts[element] = (baseCounts[element] || 0) + mods[body][element];
                }
            });
        });

        return baseCounts;
    }

    /**
     * Apply aspect mods to element wheel
     */
    function applyToElementWheel() {
        const totalCounts = getTotalElementCounts();

        // Update visual
        console.log('Element counts w. aspected mods:', totalCounts);

        if (typeof elementWheel !== 'undefined' && elementWheel.update) {
            elementWheel.update(totalCounts);
        }

        return totalCounts;
    }

    // Public API
    return {
        calculateMods: calculateAllMods,
        getTotalElementCounts: getTotalElementCounts,
        applyToElementWheel: applyToElementWheel,
    };
})();

// Init when doc = ready
document.addEventListener('DOMContentLoaded', function () {
    // wait for wheel data availability
    setTimeout(function () {
        if (window.wheelData) {
            const mods = aspectMod.calculateMods();
            console.log('Aspect mods calculated:', mods);

            const totalCounts = aspectMod.getTotalElementCounts();
            console.log('Element counts w. mods:', totalCounts);
        }
    }, 0);
});