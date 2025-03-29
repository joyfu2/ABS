let map;
let userMarker;
let coffeeShops = [];
const RADIUS = 8047; // 5 miles in meters

// Initialize the map
window.initializeMap = async function() {
    // Get user's location
    if (navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Create map centered on user's location
            map = new google.maps.Map(document.getElementById('map'), {
                center: userLocation,
                zoom: 13
            });

            // Add user marker using AdvancedMarkerElement
            const userMarkerView = new google.maps.marker.PinView({
                background: '#4285F4',
                borderColor: '#ffffff',
                glyph: '',
                scale: 1.2
            });

            userMarker = new google.maps.marker.AdvancedMarkerElement({
                map,
                position: userLocation,
                title: 'Your Location',
                content: userMarkerView.element
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
        const service = new google.maps.places.PlacesService(map);
        
        const request = {
            location: location,
            query: 'coffee shop',
            type: ['cafe']
        };

        return new Promise((resolve, reject) => {
            service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    console.log('Found coffee shops:', results.length);
                    results.forEach(place => {
                        if (place.name.toLowerCase().includes('coffee') || 
                            place.types.includes('cafe') || 
                            (place.vicinity && place.vicinity.toLowerCase().includes('coffee'))) {
                            getPlaceDetails(place.place_id);
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

// Get detailed information about each coffee shop
function getPlaceDetails(placeId) {
    try {
        const service = new google.maps.places.PlacesService(map);
        
        service.getDetails({
            placeId: placeId,
            fields: ['name', 'rating', 'price_level', 'website', 'geometry', 'opening_hours', 'formatted_address']
        }, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Calculate estimated pickup time (random for demo)
                const estimatedTime = Math.floor(Math.random() * 15) + 5;
                
                // Calculate price level (1-3)
                const priceLevel = place.price_level || 1;
                const priceSigns = '$'.repeat(priceLevel);
                
                // Create marker using AdvancedMarkerElement
                const markerView = new google.maps.marker.PinView({
                    background: '#FF5722',
                    borderColor: '#ffffff',
                    glyph: '',
                    scale: 1.2
                });

                const marker = new google.maps.marker.AdvancedMarkerElement({
                    map,
                    position: place.geometry.location,
                    title: place.name,
                    content: markerView.element
                });

                // Create info window content
                const content = `
                    <div class="marker-content">
                        <h3>${place.name}</h3>
                        <div class="time">${estimatedTime} min pickup</div>
                        <div class="price">${priceSigns}</div>
                        <div class="address">${place.formatted_address}</div>
                        ${place.website ? `<a href="${place.website}" class="order-link" target="_blank">Order Ahead</a>` : ''}
                    </div>
                `;

                const infoWindow = new google.maps.InfoWindow({
                    content: content
                });

                // Add click listener to marker
                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });

                coffeeShops.push({
                    marker: marker,
                    infoWindow: infoWindow,
                    place: place
                });
            } else {
                console.error('Place details failed:', status);
            }
        });
    } catch (error) {
        console.error('Error in getPlaceDetails:', error);
    }
}

// Initialize map when the page loads
window.onload = initMap; 