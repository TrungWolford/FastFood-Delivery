import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Truck } from 'lucide-react';
import { websocketService } from '../services/websocketService';
import type { LocationResponse } from '../types/location';

interface LocationPoint {
  latitude: number;
  longitude: number;
}

interface DeliveryMapViewerProps {
  startLocation: LocationPoint;
  endLocation: LocationPoint;
  droneLocation?: LocationPoint; // Current drone position (real-time)
  droneId?: string; // Drone ID for WebSocket subscription
  height?: string;
  enableRealtime?: boolean; // Enable WebSocket real-time updates
}

/**
 * DeliveryMapViewer - Display delivery route with markers
 * - Green marker: Start location (restaurant)
 * - Red marker: End location (customer)
 * - Blue marker: Current drone location (if available)
 * - Line connecting all points
 */
const DeliveryMapViewer: React.FC<DeliveryMapViewerProps> = ({ 
  startLocation,
  endLocation,
  droneLocation: initialDroneLocation,
  droneId,
  height = '400px',
  enableRealtime = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLineRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [droneLocation, setDroneLocation] = useState<LocationPoint | undefined>(initialDroneLocation);

  // Initialize map only once
  useEffect(() => {
    let mounted = true;

    const loadLeaflet = async () => {
      if (typeof window === 'undefined' || !mounted) return;
      if (isInitializingRef.current || mapInstanceRef.current) {
        console.log('⚠️ Map already initializing or initialized');
        return;
      }

      isInitializingRef.current = true;
      console.log('🗺️ Starting map initialization...');

      try {
        // Load CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Load JS
        if (!(window as any).L) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        // Wait for DOM and Leaflet to be ready
        await new Promise(resolve => setTimeout(resolve, 150));

        if (!mounted || !mapRef.current) {
          console.log('⚠️ Component unmounted or ref not ready');
          return;
        }

        initializeMap();
      } catch (error) {
        console.error('❌ Error loading Leaflet:', error);
        isInitializingRef.current = false;
      }
    };

    loadLeaflet();

    return () => {
      mounted = false;
      console.log('🧹 Cleaning up map...');
      
      // Cleanup markers
      markersRef.current.forEach(marker => {
        try {
          if (marker && marker.remove) {
            marker.remove();
          }
        } catch (e) {
          // Silent fail
        }
      });
      markersRef.current = [];
      
      // Cleanup route line
      if (routeLineRef.current) {
        try {
          if (routeLineRef.current.remove) {
            routeLineRef.current.remove();
          }
        } catch (e) {
          // Silent fail
        }
        routeLineRef.current = null;
      }
      
      // Cleanup map instance
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          // Silent fail
        }
        mapInstanceRef.current = null;
      }
      
      // Clear the container
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
        delete (mapRef.current as any)._leaflet_id;
      }
      
      isInitializingRef.current = false;
      setIsMapReady(false);
    };
  }, []);

  // WebSocket subscription for real-time drone location
  useEffect(() => {
    if (!enableRealtime || !droneId) {
      console.log('📡 Real-time updates disabled or no droneId provided');
      return;
    }

    console.log('📡 Enabling real-time updates for drone:', droneId);
    
    // Connect to WebSocket
    websocketService.connect()
      .then(() => {
        console.log('✅ WebSocket connected, subscribing to drone updates...');
        
        // Subscribe to drone location updates
        const unsubscribe = websocketService.subscribeToDroneLocation(
          droneId,
          (location: LocationResponse) => {
            console.log('📍 Received real-time location:', location);
            setDroneLocation({
              latitude: location.latitude,
              longitude: location.longitude
            });
          }
        );

        // Cleanup subscription on unmount
        return () => {
          console.log('📡 Cleaning up WebSocket subscription');
          unsubscribe();
        };
      })
      .catch((error) => {
        console.error('❌ Failed to connect to WebSocket:', error);
      });
  }, [enableRealtime, droneId]);

  // Update markers when locations change or map becomes ready
  useEffect(() => {
    if (isMapReady && mapInstanceRef.current && startLocation && endLocation) {
      updateMarkers();
    }
  }, [isMapReady, startLocation, endLocation, droneLocation]);

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) {
      console.log('⚠️ Map ref not ready or already initialized');
      return;
    }

    const L = (window as any).L;
    if (!L) {
      console.error('❌ Leaflet not loaded');
      return;
    }

    try {
      console.log('🗺️ Initializing map...');
      
      // Clear any existing leaflet ID
      delete (mapRef.current as any)._leaflet_id;
      mapRef.current.innerHTML = '';

      // Calculate center point between start and end
      const centerLat = (startLocation.latitude + endLocation.latitude) / 2;
      const centerLng = (startLocation.longitude + endLocation.longitude) / 2;

      // Create map
      const newMap = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: true
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(newMap);

      // Wait for map to be ready before setting state
      newMap.whenReady(() => {
        console.log('✅ Map ready');
        mapInstanceRef.current = newMap;
        setIsMapReady(true);
        isInitializingRef.current = false;
      });
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      isInitializingRef.current = false;
    }
  };

  const updateMarkers = () => {
    const mapInstance = mapInstanceRef.current;
    if (!mapInstance || !isMapReady) {
      console.log('⚠️ Map not ready for markers');
      return;
    }

    const L = (window as any).L;
    if (!L) return;

    try {
      console.log('🎯 Updating markers...');

      // Clear existing markers and route
      markersRef.current.forEach(marker => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });
      markersRef.current = [];
      
      if (routeLineRef.current && routeLineRef.current.remove) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }

      // Custom icons
      const startIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const endIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const droneIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const newMarkers = [];

      // Add start marker (restaurant)
      const startMarker = L.marker(
        [startLocation.latitude, startLocation.longitude], 
        { icon: startIcon }
      )
        .addTo(mapInstance)
        .bindPopup('<b>Điểm xuất phát</b><br/>Nhà hàng')
        .openPopup();
      newMarkers.push(startMarker);

      // Add end marker (customer)
      const endMarker = L.marker(
        [endLocation.latitude, endLocation.longitude], 
        { icon: endIcon }
      )
        .addTo(mapInstance)
        .bindPopup('<b>Điểm đến</b><br/>Khách hàng');
      newMarkers.push(endMarker);

      // Add drone marker if available
      if (droneLocation) {
        const droneMarker = L.marker(
          [droneLocation.latitude, droneLocation.longitude], 
          { icon: droneIcon }
        )
          .addTo(mapInstance)
          .bindPopup('<b>Vị trí Drone</b><br/>Đang giao hàng');
        newMarkers.push(droneMarker);
      }

      // Draw route line
      const routePoints = droneLocation 
        ? [
            [startLocation.latitude, startLocation.longitude],
            [droneLocation.latitude, droneLocation.longitude],
            [endLocation.latitude, endLocation.longitude]
          ]
        : [
            [startLocation.latitude, startLocation.longitude],
            [endLocation.latitude, endLocation.longitude]
          ];

      const polyline = L.polyline(routePoints, {
        color: droneLocation ? '#3b82f6' : '#6b7280',
        weight: 3,
        opacity: 0.7,
        dashArray: droneLocation ? '10, 5' : '0'
      }).addTo(mapInstance);

      routeLineRef.current = polyline;

      // Fit map to show all markers
      const bounds = L.latLngBounds(
        newMarkers.map((m: any) => m.getLatLng())
      );
      mapInstance.fitBounds(bounds, { padding: [50, 50] });

      markersRef.current = newMarkers;
      console.log('✅ Markers updated');
    } catch (error) {
      console.error('❌ Error updating markers:', error);
    }
  };

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }} 
        className="rounded-lg border border-gray-300 shadow-sm"
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 text-sm z-[1000]">
        <div className="font-semibold mb-2 text-gray-700">Chú thích:</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">Điểm xuất phát</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="text-gray-600">Điểm đến</span>
          </div>
          {droneLocation && (
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">Vị trí Drone</span>
            </div>
          )}
        </div>
      </div>

      {/* Coordinates Info */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="bg-green-50 p-2 rounded border border-green-200">
          <div className="font-medium text-green-700 mb-1">📍 Điểm xuất phát</div>
          <div>Lat: {startLocation.latitude.toFixed(6)}</div>
          <div>Lng: {startLocation.longitude.toFixed(6)}</div>
        </div>
        <div className="bg-red-50 p-2 rounded border border-red-200">
          <div className="font-medium text-red-700 mb-1">📍 Điểm đến</div>
          <div>Lat: {endLocation.latitude.toFixed(6)}</div>
          <div>Lng: {endLocation.longitude.toFixed(6)}</div>
        </div>
        {droneLocation && (
          <div className="bg-blue-50 p-2 rounded border border-blue-200 md:col-span-2">
            <div className="font-medium text-blue-700 mb-1">🚁 Vị trí Drone (Real-time)</div>
            <div className="grid grid-cols-2 gap-2">
              <div>Lat: {droneLocation.latitude.toFixed(6)}</div>
              <div>Lng: {droneLocation.longitude.toFixed(6)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryMapViewer;
