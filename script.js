let map;
let userMarker;

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

            // Create map centered on user's location
            map = new google.maps.Map(document.getElementById('map'), {
                center: userLocation,
                zoom: 13
            });

            // Add user marker
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
        } catch (error) {
            console.error('Error getting location:', error);
            alert('Error getting your location. Please enable location services.');
        }
    } else {
        alert('Geolocation is not supported by your browser');
    }
}; 