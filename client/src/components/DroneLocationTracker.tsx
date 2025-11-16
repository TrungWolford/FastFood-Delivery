import React, { useEffect, useState, useRef } from 'react';
import { Navigation, Activity, Clock } from 'lucide-react';
import { locationService } from '../services/locationService';
import type { LocationResponse } from '../types/location';

interface DroneLocationTrackerProps {
  droneId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

/**
 * Drone Location Tracker Component
 * 
 * Real-time tracking của drone location sử dụng Redis-cached data.
 * 
 * Features:
 * - Hiển thị vị trí hiện tại của drone trên bản đồ
 * - Auto-refresh location từ Redis cache
 * - Tính toán khoảng cách đã di chuyển
 * - Hiển thị timestamp và thời gian update
 * - Tích hợp với OpenStreetMap/Leaflet
 * 
 * Backend Flow:
 * - GET /api/locations/drone/{droneId}
 * - Check Redis first (fast) → Fallback to MongoDB
 * - TTL: 10 minutes
 */
const DroneLocationTracker: React.FC<DroneLocationTrackerProps> = ({
  droneId,
  autoRefresh = true,
  refreshInterval = 5000, // 5 seconds
}) => {
  const [location, setLocation] = useState<LocationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const previousLocationRef = useRef<LocationResponse | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Fetch drone location
  const fetchLocation = async () => {
    try {
      const response = await locationService.getDroneLocation(droneId);
      
      if (response.success && response.data) {
        const newLocation = response.data;
        setLocation(newLocation);
        setLastUpdate(new Date());
        setError(null);

        // Calculate distance if previous location exists
        if (previousLocationRef.current) {
          const distance = locationService.calculateDistance(
            previousLocationRef.current.latitude,
            previousLocationRef.current.longitude,
            newLocation.latitude,
            newLocation.longitude
          );
          setTotalDistance(prev => prev + distance);
        }

        previousLocationRef.current = newLocation;

        // Update map marker
        updateMapMarker(newLocation.latitude, newLocation.longitude);
      } else {
        setError(response.message || 'Không tìm thấy vị trí drone');
      }
    } catch (err) {
      setError('Lỗi khi tải vị trí drone');
      console.error('Error fetching drone location:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || leafletMapRef.current) return;

      // Load Leaflet dynamically
      if (!(window as any).L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        await new Promise((resolve) => {
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      const L = (window as any).L;
      
      // Create map
      leafletMapRef.current = L.map(mapRef.current).setView([10.762622, 106.660172], 13);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(leafletMapRef.current);

      // Create custom drone icon
      const droneIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Add marker
      if (location) {
        markerRef.current = L.marker([location.latitude, location.longitude], { icon: droneIcon })
          .addTo(leafletMapRef.current)
          .bindPopup(`Drone ID: ${droneId}`);
      }
    };

    initMap();
  }, []);

  // Update map marker when location changes
  const updateMapMarker = (lat: number, lng: number) => {
    if (!leafletMapRef.current || !markerRef.current) return;
    
    // Update marker position
    markerRef.current.setLatLng([lat, lng]);
    
    // Pan map to new position (smooth)
    leafletMapRef.current.panTo([lat, lng]);

    // Update popup
    markerRef.current.setPopupContent(
      `<b>Drone ID:</b> ${droneId}<br/>` +
      `<b>Lat:</b> ${lat.toFixed(6)}<br/>` +
      `<b>Lng:</b> ${lng.toFixed(6)}`
    );
  };

  // Auto-refresh location
  useEffect(() => {
    fetchLocation();

    if (autoRefresh) {
      const interval = setInterval(fetchLocation, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [droneId, autoRefresh, refreshInterval]);

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Calculate time since last update
  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return 'Chưa có dữ liệu';
    const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `${seconds} giây trước`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} phút trước`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Theo dõi Drone #{droneId.slice(-6)}
        </h2>
        {autoRefresh && (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {getTimeSinceUpdate()}
          </span>
        )}
      </div>

      {/* Location Stats */}
      {location && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-xs text-gray-600">Latitude</div>
            <div className="font-semibold text-blue-600">{location.latitude.toFixed(6)}</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-xs text-gray-600">Longitude</div>
            <div className="font-semibold text-green-600">{location.longitude.toFixed(6)}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-xs text-gray-600">Quãng đường</div>
            <div className="font-semibold text-purple-600">{totalDistance.toFixed(2)} km</div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="mb-4">
        <div 
          ref={mapRef} 
          className="w-full h-[400px] rounded-lg border border-gray-200"
        />
      </div>

      {/* Status */}
      {loading && (
        <div className="flex items-center justify-center py-4 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
          Đang tải vị trí...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700">
          {error}
        </div>
      )}

      {location && (
        <div className="text-sm text-gray-600 border-t pt-4">
          <div className="flex items-center justify-between">
            <span>Cập nhật lúc: {formatTimestamp(location.timestamp)}</span>
            <button
              onClick={fetchLocation}
              className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
            >
              <Navigation className="w-4 h-4" />
              Làm mới
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            💡 Vị trí được cache trong Redis với TTL 10 phút
          </div>
        </div>
      )}
    </div>
  );
};

export default DroneLocationTracker;
