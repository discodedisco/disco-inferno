const input = document.getElementById('birth_location');
const latField = document.getElementById('birth-lat');
const lonField = document.getElementById('birth-lon');
let suggestions = [];
let debounceTimer;

// Create dropdown for suggestions
const suggestionDiv = document.createElement('div');
suggestionDiv.setAttribute('class', 'location-suggestions');
suggestionDiv.style.display = 'none';
input.parentNode.insertBefore(suggestionDiv, input.nextSibling);

// Add loading indicator
function showLoading() {
    suggestionDiv.innerHTML = '<div class="suggestion-loading">Searching locations….</div>';
    suggestionDiv.style.display = 'block';
}

// Debounced input handler
input.addEventListener('input', function () {
    // Clear existing timeout, if any
    clearTimeout(debounceTimer);

    // Hide suggestions if input is too short
    if (this.value.length < 3) {
        suggestionDiv.style.display = 'none';
        return;
    }

    // Show loading indicator immediately
    showLoading();

    const searchValue = this.value;

    // Set new timeout for actual search
    debounceTimer = setTimeout(async function () {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchValue)}&limit=5`);
            suggestions = await response.json();
        
            // Display suggestions
            suggestionDiv.innerHTML = '';
            if (suggestions.length > 0) {
                suggestionDiv.style.display = 'block';
                suggestions.forEach(place => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.textContent = place.display_name;
                    div.addEventListener('click', () => {
                        input.value = place.display_name;
                        latField.value = place.lat;
                        lonField.value = place.lon;
                        suggestionDiv.style.display = 'none';
                    });
                    suggestionDiv.appendChild(div);
                });
            } else {
                suggestionDiv.innerHTML = '<div class="suggestion-none">No locations found</div>';
            }
        } catch (error) {
            console.error('Error fetching location suggestions: ', error);
            suggestionDiv.innerHTML = '<div class="suggestion-error">Error searching for locations</div>';
        }
    }, 500);
});

// Close suggestions when clicking outside
document.addEventListener('click', function (e) {
    if (e.target !== input && e.target !== suggestionDiv && !suggestionDiv.contains(e.target)) {
        suggestionDiv.style.display = 'none';
    }
});

// Show suggestions when focusing if value meets min len req
input.addEventListener('focus', function () {
    if (this.value.length >= 3 && suggestions.length > 0) {
        suggestionDiv.style.display = 'block';
    }
});

// Form validation
document.querySelector('form').addEventListener('submit', function(event) {
    const lat = latField.value;
    const lon = lonField.value;

    // Check coords present
    if (!lat || !lon) {
        event.preventDefault();
        alert('Please select a suggested location or find the closest city thereto');
        input.focus();
        return;
    }

    // Check latitude range valid
    const latNum = parseFloat(lat);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        event.preventDefault();
        alert('Invalid latitude: degrees must be between -90 and 90');
        return;
    }

    // Check longitude range valid
    const lonNum = parseFloat(lon);
    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
        event.preventDefault();
        alert('Invalid longitude: degrees must be between -180 and 180');
        return;
    }
});
