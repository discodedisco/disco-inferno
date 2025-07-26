const input = document.getElementById('birth_location');
const latField = document.getElementById('birth_lat');
const lonField = document.getElementById('birth_lon');
let suggestions = [];

// Create dropdown for suggestions
const suggestionDiv = document.createElement('div');
suggestionDiv.setAttribute('class', 'location-suggestions');
suggestionDiv.style.display = 'none';
input.parentNode.insertBefore(suggestionDiv, input.nextSibling);

input.addEventListener('input', async function () {
    if (this.value.length < 3) return;

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.value)}&limit=5`);
        suggestions = await response.json();

        // Display suggestions
        suggestionDiv.innerHTML = '';
        if (suggestions.length > 0) {
            suggestionDiv.style.display = 'block';
            suggestions.forEach(place => {
                const div = document.createElement('div');
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
            suggestionDiv.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching location suggestions: ', error);
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
