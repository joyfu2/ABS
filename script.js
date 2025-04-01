let map;
let userMarker;
let coffeeShops = [];
const RADIUS = 5000; // 5km radius
const MAP_ID = '8e0a97af9386fef'; // Your Map ID

// Initialize the map
window.initializeMap = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                console.log('User location:', userLocation);

                // Create map centered on user's location
                map = new google.maps.Map(document.getElementById('map'), {
                    center: userLocation,
                    zoom: 13
                });

                console.log('Map initialized successfully');

                // Add user marker with Advanced Marker
                userMarker = new google.maps.marker.AdvancedMarkerElement({
                    position: userLocation,
                    map: map,
                    title: 'Your Location',
                    content: createUserMarkerContent()
                });

                console.log('User marker created');

                // Search for coffee shops
                searchCoffeeShops(userLocation);
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Error getting your location. Please enable location services.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
};

// Create user marker content
function createUserMarkerContent() {
    const div = document.createElement('div');
    div.style.width = '20px';
    div.style.height = '20px';
    div.style.borderRadius = '50%';
    div.style.backgroundColor = '#4285F4';
    div.style.border = '2px solid white';
    return div;
}

// Search for coffee shops using Google Places API
async function searchCoffeeShops(location) {
    console.log('Starting coffee shop search...');
    
    // Create a search request
    const request = {
        location: location,
        radius: RADIUS,
        type: 'cafe',
        keyword: 'coffee'
    };

    console.log('Search request:', request);

    try {
        // Create a PlacesService instance
        const service = new google.maps.places.PlacesService(map);

        // Perform the search
        service.nearbySearch(request, (results, status) => {
            console.log('Search status:', status);
            
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log('Found places:', results.length);
                
                // Filter and add markers for coffee shops
                results.forEach(place => {
                    console.log('Checking place:', place.name);
                    console.log('Place types:', place.types);
                    
                    // Check if it's a coffee shop based on name and types
                    const name = place.name.toLowerCase();
                    const isCoffeeShop = 
                        (name.includes('coffee') && place.types.includes('cafe')) ||
                        (name.includes('café') && place.types.includes('cafe')) ||
                        (name.includes('cafe') && place.types.includes('cafe')) ||
                        (name.includes('espresso') && place.types.includes('cafe')) ||
                        (name.includes('latte') && place.types.includes('cafe'));
                    
                    if (isCoffeeShop) {
                        console.log('Adding coffee shop:', place.name);
                        addCoffeeShopMarker(place);
                    } else {
                        console.log('Skipping non-coffee shop:', place.name, 'Reason: Does not match coffee shop criteria');
                    }
                });
            } else {
                console.error('Places search failed:', status);
                let errorMessage = 'Error searching for coffee shops. ';
                
                switch(status) {
                    case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
                        errorMessage += 'Too many requests. Please try again later.';
                        break;
                    case google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
                        errorMessage += 'Request denied. Please check your API key and billing status.';
                        break;
                    case google.maps.places.PlacesServiceStatus.INVALID_REQUEST:
                        errorMessage += 'Invalid request. Please try again.';
                        break;
                    default:
                        errorMessage += 'Please try again later.';
                }
                
                console.error(errorMessage);
                alert(errorMessage);
            }
        });
    } catch (error) {
        console.error('Error during places search:', error);
        alert('Error searching for coffee shops. Please try again later.');
    }
}

// Add a marker for a coffee shop
function addCoffeeShopMarker(place) {
    console.log('Creating marker for:', place.name);
    console.log('Place location:', place.geometry.location);
    
    try {
        const marker = new google.maps.marker.AdvancedMarkerElement({
            position: place.geometry.location,
            map: map,
            title: place.name,
            content: createCoffeeShopMarkerContent()
        });

        console.log('Marker created successfully');

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 8px;">
                    <h3 style="margin: 0 0 8px 0;">${place.name}</h3>
                    <p style="margin: 0 0 4px 0;">${place.vicinity}</p>
                    ${place.rating ? `<p style="margin: 0 0 4px 0;">Rating: ${place.rating} ⭐</p>` : ''}
                    ${place.opening_hours ? `<p style="margin: 0 0 4px 0;">${place.opening_hours.isOpen() ? 'Open now' : 'Closed'}</p>` : ''}
                </div>
            `
        });

        // Add click listener to show info window
        marker.addEventListener('gmp-click', () => {
            infoWindow.open(map, marker);
        });

        // Close info window when clicking elsewhere on the map
        map.addListener('click', () => {
            infoWindow.close();
        });

        coffeeShops.push(marker);
        console.log('Marker added for:', place.name);
    } catch (error) {
        console.error('Error creating marker:', error);
    }
}

// Create coffee shop marker content
function createCoffeeShopMarkerContent() {
    const div = document.createElement('div');
    div.style.width = '16px';
    div.style.height = '16px';
    div.style.borderRadius = '50%';
    div.style.backgroundColor = '#34A853';
    div.style.border = '2px solid white';
    return div;
} 