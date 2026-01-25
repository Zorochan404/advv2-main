/**
 * Leaflet Map Component
 * Uses WebView to display OpenStreetMap with Leaflet
 * Free, open-source, no API key required
 */
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface LeafletMapProps {
    latitude: number | null;
    longitude: number | null;
    onLocationChange?: (latitude: number, longitude: number) => void;
    height?: number;
    draggable?: boolean;
}

export function LeafletMap({
    latitude,
    longitude,
    onLocationChange,
    height = 300,
    draggable = true,
}: LeafletMapProps) {
    const webViewRef = useRef<WebView>(null);

    // Default to India center if coordinates are not provided
    const mapLat = latitude ?? 20.5937;
    const mapLng = longitude ?? 78.9629;

    // HTML template for Leaflet map
    const leafletHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            height: 100%;
            width: 100%;
            overflow: hidden;
        }
        #map {
            height: 100%;
            width: 100%;
        }
        .leaflet-container {
            background: #f0f0f0;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Initialize map
        const map = L.map('map').setView([${mapLat}, ${mapLng}], 15);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);
        
        // Add marker
        let marker = L.marker([${mapLat}, ${mapLng}], {
            draggable: ${draggable ? 'true' : 'false'}
        }).addTo(map);
        
        // Handle marker drag end
        marker.on('dragend', function(e) {
            const position = marker.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'locationChange',
                latitude: position.lat,
                longitude: position.lng
            }));
        });
        
        // Handle map click
        map.on('click', function(e) {
            if (${draggable}) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                marker.setLatLng([lat, lng]);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'locationChange',
                    latitude: lat,
                    longitude: lng
                }));
            }
        });
        
        // Function to update marker position from React Native
        window.updateMarker = function(lat, lng) {
            marker.setLatLng([lat, lng]);
            map.setView([lat, lng], map.getZoom());
        };
        
        // Function to update map view
        window.updateMapView = function(lat, lng, zoom) {
            marker.setLatLng([lat, lng]);
            map.setView([lat, lng], zoom || map.getZoom());
        };
    </script>
</body>
</html>
  `;

    // Update marker position when coordinates change
    useEffect(() => {
        if (webViewRef.current && latitude !== null && longitude !== null) {
            const script = `window.updateMarker(${latitude}, ${longitude});`;
            webViewRef.current.injectJavaScript(script);
        }
    }, [latitude, longitude]);

    // Handle messages from WebView
    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'locationChange' && onLocationChange) {
                onLocationChange(data.latitude, data.longitude);
            }
        } catch (error) {
            console.error('Error parsing message from Leaflet map:', error);
        }
    };

    return (
        <View style={[styles.container, { height }]}>
            <WebView
                ref={webViewRef}
                source={{ html: leafletHTML }}
                style={styles.webview}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                scrollEnabled={false}
                bounces={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    webview: {
        backgroundColor: 'transparent',
    },
});