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

                // Initialize map
                map = new google.maps.Map(document.getElementById('map'), {
                    center: userLocation,
                    zoom: 13,
                    mapId: MAP_ID
                });
                console.log('Map initialized successfully');

                // Add user marker using Advanced Marker
                userMarker = new google.maps.marker.AdvancedMarkerElement({
                    position: userLocation,
                    map: map,
                    title: 'Your Location',
                    content: createUserMarkerContent()
                });
                console.log('User marker created');

                // Search for coffee shops
                searchCoffeeShops(map, userLocation);
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Error getting your location. Please enable location services.');
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
};

// Create user marker content
function createUserMarkerContent() {
    const div = document.createElement('div');
    div.className = 'user-marker';
    div.style.width = '16px';
    div.style.height = '16px';
    div.style.backgroundColor = '#4285F4';
    div.style.border = '2px solid white';
    div.style.borderRadius = '50%';
    return div;
}

// Search for coffee shops using Google Places API
async function searchCoffeeShops(map, location) {
    console.log('Starting coffee shop search...');
    
    // Define search types
    const searchTypes = ['cafe', 'restaurant'];
    let allResults = [];
    
    try {
        // Create a PlacesService instance
        const service = new google.maps.places.PlacesService(map);

        // Function to perform a single search
        const performSearch = (type) => {
            return new Promise((resolve, reject) => {
                const request = {
                    location: location,
                    radius: RADIUS,
                    type: type,
                    keyword: 'coffee cafe espresso'
                };

                console.log(`Searching for ${type}:`, request);

                service.nearbySearch(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        resolve(results);
                    } else {
                        reject(status);
                    }
                });
            });
        };

        // Perform searches for each type
        for (const type of searchTypes) {
            try {
                const results = await performSearch(type);
                allResults = allResults.concat(results);
            } catch (error) {
                console.error(`Error searching for ${type}:`, error);
            }
        }

        // Remove duplicates based on place_id
        const uniqueResults = allResults.filter((place, index, self) =>
            index === self.findIndex((p) => p.place_id === place.place_id)
        );

        console.log('Found unique places:', uniqueResults.length);
        
        // Filter and add markers for coffee shops
        uniqueResults.forEach(place => {
            console.log('Checking place:', place.name);
            console.log('Place types:', place.types);
            
            // Check if it's a coffee shop based on name and types
            const name = place.name.toLowerCase();
            const isCoffeeShop = 
                // Include places with coffee-related terms in name
                name.includes('coffee') ||
                name.includes('café') ||
                name.includes('cafe') ||
                name.includes('espresso') ||
                name.includes('latte') ||
                name.includes('roaster') ||
                name.includes('roastery') ||
                name.includes('blue bottle') ||
                name.includes('starbucks') ||
                name.includes('dunkin') ||
                name.includes('peets') ||
                name.includes('gregorys') ||
                name.includes('joe coffee') ||
                name.includes('la colombe') ||
                // Include places with 'cafe' type
                place.types.includes('cafe') ||
                // Include restaurants that mention coffee in their name
                (place.types.includes('restaurant') && (
                    name.includes('coffee') ||
                    name.includes('café') ||
                    name.includes('cafe')
                ));
            
            if (isCoffeeShop) {
                console.log('Adding coffee shop:', place.name);
                addCoffeeShopMarker(map, place);
            } else {
                console.log('Skipping non-coffee shop:', place.name, 'Reason: Does not match coffee shop criteria');
            }
        });
    } catch (error) {
        console.error('Error during places search:', error);
        alert('Error searching for coffee shops. Please try again later.');
    }
}

// Add a marker for a coffee shop
function addCoffeeShopMarker(map, place) {
    console.log('Creating marker for:', place.name);
    console.log('Place location:', place.geometry.location);
    
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
                ${place.opening_hours ? `<p style="margin: 0;">${place.opening_hours.isOpen() ? '🟢 Open' : '🔴 Closed'}</p>` : ''}
            </div>
        `
    });

    // Add click event listener
    marker.element.addEventListener('click', () => {
        infoWindow.open(map, marker);
        map.setCenter(marker.position);
    });

    // Close info window when clicking on the map
    map.addListener('click', () => {
        infoWindow.close();
    });

    coffeeShops.push(marker);
    console.log('Marker added for:', place.name);
    return marker;
}

// Create coffee shop marker content
function createCoffeeShopMarkerContent() {
    const div = document.createElement('div');
    div.className = 'coffee-shop-marker';
    div.style.width = '12px';
    div.style.height = '12px';
    div.style.backgroundColor = '#34A853';
    div.style.border = '2px solid white';
    div.style.borderRadius = '50%';
    return div;
} 