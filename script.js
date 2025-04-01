// Constants
const RADIUS = 8000; // 5 miles in meters
const DEFAULT_LOCATION = { lat: 40.7128, lng: -74.0060 }; // New York City

// Global variables
let map;
let userMarker;
let infoWindow;
let coffeeShops = [];

// Initialize the map
window.initializeMap = function() {
    // Show loading indicator
    document.getElementById('loading').style.display = 'block';

    // Initialize map with default location
    map = new google.maps.Map(document.getElementById('map'), {
        center: DEFAULT_LOCATION,
        zoom: 13,
        mapId: '8e0a97af9386fef'
    });

    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('User location:', userLocation);
                
                // Center map on user location
                map.setCenter(userLocation);
                
                // Add user marker
                addUserMarker(userLocation);
                
                // Search for coffee shops
                searchCoffeeShops(userLocation);
            },
            error => {
                console.error('Geolocation error:', error);
                showError('Unable to get your location. Using default location.');
                
                // Use default location
                addUserMarker(DEFAULT_LOCATION);
                searchCoffeeShops(DEFAULT_LOCATION);
            }
        );
    } else {
        showError('Geolocation is not supported by your browser.');
        addUserMarker(DEFAULT_LOCATION);
        searchCoffeeShops(DEFAULT_LOCATION);
    }
};

// Add user marker to map
function addUserMarker(location) {
    userMarker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: location,
        content: createUserMarkerContent()
    });
}

// Create user marker content
function createUserMarkerContent() {
    const div = document.createElement('div');
    div.className = 'user-marker';
    return div;
}

// Search for coffee shops
async function searchCoffeeShops(location) {
    console.log('Starting coffee shop search...');
    
    const request = {
        location: location,
        radius: RADIUS,
        type: 'cafe',
        keyword: 'coffee cafe espresso'
    };

    console.log('Search request:', request);

    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${RADIUS}&type=cafe&keyword=coffee cafe espresso&key=AIzaSyBQ-EJ3QVD06l_bsCxNAZHLTKCkEonm4Cg`);
        const data = await response.json();

        if (data.status === 'OK') {
            // Filter results to ensure they are coffee shops
            const coffeeShops = data.results.filter(place => {
                const name = place.name.toLowerCase();
                const types = place.types || [];
                
                // First check if it's a coffee shop by business type
                const isCoffeeShopType = types.includes('cafe') || 
                                       types.includes('restaurant') ||
                                       types.includes('food');
                
                // Then check if it has coffee-related terms in the name
                const hasCoffeeTerms = name.includes('coffee') ||
                                     name.includes('café') ||
                                     name.includes('cafe') ||
                                     name.includes('espresso') ||
                                     name.includes('latte') ||
                                     name.includes('roaster') ||
                                     name.includes('roastery');
                
                // Check for major coffee chains
                const isCoffeeChain = name.includes('starbucks') ||
                                    name.includes('dunkin') ||
                                    name.includes('peets') ||
                                    name.includes('gregorys') ||
                                    name.includes('joe coffee') ||
                                    name.includes('la colombe') ||
                                    name.includes('blue bottle');
                
                // Only include if it's both a coffee shop type AND has coffee terms or is a known chain
                return isCoffeeShopType && (hasCoffeeTerms || isCoffeeChain);
            });

            console.log('Found coffee shops:', coffeeShops.length);
            window.coffeeShops = coffeeShops;
            addCoffeeShopMarkers();
        } else {
            console.error('Places search failed:', data.status);
            showError('Error finding coffee shops. Please try again later.');
        }
    } catch (error) {
        console.error('Error searching for coffee shops:', error);
        showError('Error finding coffee shops. Please try again later.');
    }
    
    // Hide loading indicator
    document.getElementById('loading').style.display = 'none';
}

// Add coffee shop markers to map
function addCoffeeShopMarkers() {
    coffeeShops.forEach(place => {
        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
            },
            content: createCoffeeShopMarkerContent()
        });

        // Add click listener
        marker.element.addEventListener('click', () => {
            showInfoWindow(place, marker);
        });
    });
}

// Create coffee shop marker content
function createCoffeeShopMarkerContent() {
    const div = document.createElement('div');
    div.className = 'coffee-shop-marker';
    return div;
}

// Show info window for a coffee shop
function showInfoWindow(place, marker) {
    // Close existing info window
    if (infoWindow) {
        infoWindow.close();
    }

    // Create info window content
    const content = `
        <div style="padding: 10px;">
            <h3 style="margin: 0 0 10px 0;">${place.name}</h3>
            ${place.vicinity ? `<p style="margin: 0 0 10px 0;">${place.vicinity}</p>` : ''}
            ${place.rating ? `<p style="margin: 0 0 10px 0;">Rating: ${place.rating} ⭐</p>` : ''}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat},${place.geometry.location.lng}" 
               target="_blank" 
               style="display: inline-block; padding: 8px 16px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px;">
                Get Directions
            </a>
        </div>
    `;

    // Create and open new info window
    infoWindow = new google.maps.InfoWindow({
        content: content
    });

    infoWindow.open(map, marker);
    map.setCenter(marker.position);
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
} 