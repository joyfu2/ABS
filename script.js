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
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(20, 20)
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