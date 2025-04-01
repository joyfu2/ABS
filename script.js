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
                    zoom: 13,
                    mapId: MAP_ID
                });

                // Add user marker with Advanced Marker
                userMarker = new google.maps.marker.AdvancedMarkerElement({
                    position: userLocation,
                    map: map,
                    title: 'Your Location',
                    content: createUserMarkerContent()
                });

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
function searchCoffeeShops(location) {
    console.log('Starting coffee shop search...');
    
    // Create a search request
    const request = {
        location: location,
        radius: RADIUS,
        type: 'cafe'
    };

    console.log('Search request:', request);

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
                if (place.name.toLowerCase().includes('coffee') || 
                    place.types.includes('cafe')) {
                    console.log('Adding coffee shop:', place.name);
                    addCoffeeShopMarker(place);
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
}

// Add a marker for a coffee shop
function addCoffeeShopMarker(place) {
    console.log('Creating marker for:', place.name);
    
    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: place.geometry.location,
        map: map,
        title: place.name,
        content: createCoffeeShopMarkerContent()
    });

    // Add click listener to show info window
    marker.addEventListener('gmp-click', () => {
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 8px;">
                    <h3 style="margin: 0 0 8px 0;">${place.name}</h3>
                    <p style="margin: 0;">${place.vicinity}</p>
                </div>
            `
        });
        infoWindow.open(map, marker);
    });

    coffeeShops.push(marker);
    console.log('Marker added for:', place.name);
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