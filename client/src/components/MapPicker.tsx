import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  height?: string;
}

const MapPicker: React.FC<MapPickerProps> = ({ 
  onLocationSelect, 
  initialLat = 10.762622, 
  initialLng = 106.660172,
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Dynamically load Leaflet CSS and JS
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

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
        await new Promise((resolve) => {
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      initializeMap();
    };

    loadLeaflet();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || map) return;

    const L = (window as any).L;
    if (!L) return;

    // Create map
    const newMap = L.map(mapRef.current).setView([initialLat, initialLng], 13);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(newMap);

    // Custom marker icon
    const customIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Add initial marker if location exists
    let newMarker: any = null;
    if (initialLat && initialLng) {
      newMarker = L.marker([initialLat, initialLng], { icon: customIcon, draggable: true })
        .addTo(newMap)
        .bindPopup('Vị trí đã chọn')
        .openPopup();

      newMarker.on('dragend', function(event: any) {
        const position = event.target.getLatLng();
        setSelectedLocation({ lat: position.lat, lng: position.lng });
        onLocationSelect(position.lat, position.lng);
      });
    }

    // Click to add/move marker
    newMap.on('click', function(e: any) {
      const { lat, lng } = e.latlng;
      
      if (newMarker) {
        newMarker.setLatLng([lat, lng]);
      } else {
        newMarker = L.marker([lat, lng], { icon: customIcon, draggable: true })
          .addTo(newMap)
          .bindPopup('Vị trí đã chọn')
          .openPopup();

        newMarker.on('dragend', function(event: any) {
          const position = event.target.getLatLng();
          setSelectedLocation({ lat: position.lat, lng: position.lng });
          onLocationSelect(position.lat, position.lng);
        });
      }

      setSelectedLocation({ lat, lng });
      onLocationSelect(lat, lng);
      setMarker(newMarker);
    });

    setMap(newMap);
    setMarker(newMarker);
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      // Use Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (map) {
          map.setView([latitude, longitude], 15);

          const L = (window as any).L;
          const customIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });

          if (marker) {
            marker.setLatLng([latitude, longitude]);
          } else {
            const newMarker = L.marker([latitude, longitude], { icon: customIcon, draggable: true })
              .addTo(map)
              .bindPopup('Vị trí đã chọn')
              .openPopup();

            newMarker.on('dragend', function(event: any) {
              const position = event.target.getLatLng();
              setSelectedLocation({ lat: position.lat, lng: position.lng });
              onLocationSelect(position.lat, position.lng);
            });

            setMarker(newMarker);
          }

          setSelectedLocation({ lat: latitude, lng: longitude });
          onLocationSelect(latitude, longitude);
        }
      } else {
        alert('Không tìm thấy địa chỉ. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Có lỗi xảy ra khi tìm kiếm địa chỉ.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (map) {
            map.setView([latitude, longitude], 15);

            const L = (window as any).L;
            const customIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });

            if (marker) {
              marker.setLatLng([latitude, longitude]);
            } else {
              const newMarker = L.marker([latitude, longitude], { icon: customIcon, draggable: true })
                .addTo(map)
                .bindPopup('Vị trí hiện tại')
                .openPopup();

              newMarker.on('dragend', function(event: any) {
                const position = event.target.getLatLng();
                setSelectedLocation({ lat: position.lat, lng: position.lng });
                onLocationSelect(position.lat, position.lng);
              });

              setMarker(newMarker);
            }

            setSelectedLocation({ lat: latitude, lng: longitude });
            onLocationSelect(latitude, longitude);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập.');
        }
      );
    } else {
      alert('Trình duyệt không hỗ trợ định vị.');
    }
  };

  const clearSelection = () => {
    if (marker && map) {
      map.removeLayer(marker);
      setMarker(null);
      setSelectedLocation(null);
      onLocationSelect(0, 0);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            placeholder="Tìm kiếm địa chỉ (VD: 268 Lý Thường Kiệt, Quận 10, TP.HCM)"
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          onClick={searchLocation}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:bg-gray-300"
        >
          {isLoading ? 'Đang tìm...' : 'Tìm kiếm'}
        </button>
        <button
          onClick={getCurrentLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          title="Vị trí hiện tại"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Map Container */}
      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
        <div ref={mapRef} style={{ height, width: '100%' }} />
        
        {/* Clear button */}
        {selectedLocation && (
          <button
            onClick={clearSelection}
            className="absolute top-2 right-2 bg-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition z-[1000] flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Xóa
          </button>
        )}
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-900">Vị trí đã chọn:</p>
            <p className="text-sm text-green-700 mt-1">
              <span className="font-medium">Latitude:</span> {selectedLocation.lat.toFixed(6)}
            </p>
            <p className="text-sm text-green-700">
              <span className="font-medium">Longitude:</span> {selectedLocation.lng.toFixed(6)}
            </p>
            <p className="text-xs text-green-600 mt-2 italic">
              💡 Bạn có thể kéo marker hoặc click vào bản đồ để thay đổi vị trí
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 font-medium mb-2">Hướng dẫn:</p>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Click vào bản đồ để đánh dấu vị trí nhà hàng</li>
          <li>Kéo marker (pin đỏ) để điều chỉnh vị trí chính xác</li>
          <li>Sử dụng ô tìm kiếm để tìm địa chỉ nhanh chóng</li>
          <li>Nhấn nút <Navigation className="w-3 h-3 inline" /> để sử dụng vị trí hiện tại</li>
        </ul>
      </div>
    </div>
  );
};

export default MapPicker;
