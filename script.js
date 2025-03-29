let map;
let userMarker;
let coffeeShops = [];
const RADIUS = 5000; // 5km radius

// Initialize the map
window.initializeMap = async function() {
    if (navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

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

            // Add user marker with Advanced Marker
            userMarker = new google.maps.marker.AdvancedMarkerElement({
                position: userLocation,
                map: map,
                title: 'Your Location',
                content: createUserMarkerContent()
            });

            // Search for coffee shops
            await searchCoffeeShops(userLocation);
        } catch (error) {
            console.error('Error getting location:', error);
            alert('Error getting your location. Please enable location services.');
        }
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
    try {
        console.log('Starting coffee shop search...');
        
        // Create a search request
        const request = {
            location: location,
            radius: RADIUS,
            type: ['cafe']
        };

        console.log('Search request:', request);

        // Perform the search using the new Place API
        const places = await google.maps.places.Place.search(request);
        console.log('Search status:', places.status);
        
        if (places.status === google.maps.places.PlacesServiceStatus.OK) {
            console.log('Found places:', places.results.length);
            
            // Filter and add markers for coffee shops
            places.results.forEach(place => {
                console.log('Checking place:', place.name);
                if (place.name.toLowerCase().includes('coffee') || 
                    place.types.includes('cafe')) {
                    console.log('Adding coffee shop:', place.name);
                    addCoffeeShopMarker(place);
                }
            });
        } else {
            console.error('Places search failed:', places.status);
            let errorMessage = 'Error searching for coffee shops. ';
            
            switch(places.status) {
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
    } catch (error) {
        console.error('Error in searchCoffeeShops:', error);
        alert('Error searching for coffee shops. Please try again later.');
    }
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
    marker.addListener('click', () => {
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