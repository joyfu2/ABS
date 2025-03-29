# Coffee Shop Finder

A web application that shows nearby coffee shops on an interactive map, including estimated pickup times and price levels.

## Features

- Shows your current location on the map
- Displays all coffee shops within a 5-mile radius
- Shows estimated pickup times for each coffee shop
- Displays price levels using dollar signs ($, $$, $$$)
- Click on any coffee shop to view details and order ahead

## Setup

1. Clone this repository
2. Get a Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/)
3. Enable the following APIs in your Google Cloud Console:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Replace `YOUR_API_KEY` in `index.html` with your actual Google Maps API key
5. Open `index.html` in a web browser

## Usage

1. Allow location access when prompted
2. The map will center on your current location
3. Coffee shops will be marked with pins on the map
4. Click on any pin to see:
   - Shop name
   - Estimated pickup time
   - Price level
   - Link to order ahead (if available)

## Note

This application requires:
- A modern web browser with geolocation support
- An active internet connection
- A valid Google Maps API key
- Location services enabled on your device 