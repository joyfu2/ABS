let map;
let userMarker;
let coffeeShops = [];
const RADIUS = 3219; // 2 miles in meters

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

            // Add user marker with a simple custom icon
            userMarker = new google.maps.Marker({
                position: userLocation,
                map: map,
                title: 'Your Location',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#4285F4',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                }
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

// Search for coffee shops using Google Places API
async function searchCoffeeShops(location) {
    try {
        console.log('Starting coffee shop search...');
        const service = new google.maps.places.PlacesService(map);
        
        const request = {
            location: location,
            radius: RADIUS,
            type: ['cafe'],
            keyword: 'coffee'
        };

        console.log('Search request:', request);

        return new Promise((resolve, reject) => {
            service.nearbySearch(request, (results, status) => {
                console.log('Search status:', status);
                console.log('Search results:', results);

                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    console.log('Found coffee shops:', results.length);
                    results.forEach(place => {
                        console.log('Processing place:', place.name);
                        if (place.name.toLowerCase().includes('coffee') || 
                            place.types.includes('cafe') || 
                            (place.vicinity && place.vicinity.toLowerCase().includes('coffee'))) {
                            console.log('Found coffee shop:', place.name);
                            addCoffeeShopMarker(place);
                        }
                    });
                    resolve(results);
                } else {
                    console.error('Places search failed:', status);
                    let errorMessage = 'Error searching for coffee shops. Please try again later.';
                    if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                        errorMessage = 'Too many requests. Please try again later.';
                    } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                        errorMessage = 'Request denied. Please check your API key and billing status.';
                    } else if (status === google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
                        errorMessage = 'Invalid request. Please try again.';
                    }
                    alert(errorMessage);
                    reject(new Error(status));
                }
            });
        });
    } catch (error) {
        console.error('Error in searchCoffeeShops:', error);
        alert('Error searching for coffee shops. Please try again later.');
    }
}

// Add a marker for a coffee shop
function addCoffeeShopMarker(place) {
    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#34A853',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
        }
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
} 