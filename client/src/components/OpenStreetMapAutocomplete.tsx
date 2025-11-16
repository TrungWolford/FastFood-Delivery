import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, Check, X } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

export interface NominatimSuggestion {
  place_id: number;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    quarter?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: string[];
}

export interface SelectedAddress {
  fullAddress: string;
  streetAddress: string; // Số nhà + tên đường
  ward: string;
  city: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

interface OpenStreetMapAutocompleteProps {
  value: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string, selectedAddress?: SelectedAddress) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  countryCode?: string; // Mặc định 'vn' cho Vietnam
}

const OpenStreetMapAutocomplete: React.FC<OpenStreetMapAutocompleteProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Nhập địa chỉ đầy đủ (VD: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM)',
  required = false,
  countryCode = 'vn',
}) => {
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasUserSelected, setHasUserSelected] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse address từ Nominatim result
  const parseAddress = (suggestion: NominatimSuggestion): SelectedAddress => {
    const addr = suggestion.address;
    
    // 1. Lấy số nhà + tên đường
    const streetParts: string[] = [];
    if (addr.house_number) streetParts.push(addr.house_number);
    if (addr.road) streetParts.push(addr.road);
    const streetAddress = streetParts.join(' ') || addr.suburb || addr.quarter || addr.neighbourhood || '';

    // 2. Lấy ward (phường/xã)
    // Ưu tiên: suburb > quarter > neighbourhood
    const ward = addr.suburb || addr.quarter || addr.neighbourhood || addr.village || '';

    // 3. Lấy city (thành phố/tỉnh)
    // Ưu tiên: city > town > county > state
    const city = addr.city || addr.town || addr.county || addr.state || '';

    // 4. Full address cho display
    const fullAddress = suggestion.display_name;

    return {
      fullAddress,
      streetAddress,
      ward,
      city,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
      displayName: suggestion.display_name,
    };
  };

  // Gọi Nominatim API
  const searchAddresses = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim().length < 5) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        format: 'json',
        addressdetails: '1',
        limit: '8',
        countrycodes: countryCode,
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            'Accept-Language': 'vi,en',
            'User-Agent': 'FastFoodDelivery/1.0',
          },
        }
      );

      if (response.ok) {
        const data: NominatimSuggestion[] = await response.json();
        console.log('🗺️ Nominatim suggestions:', data);
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching Nominatim suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [countryCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setHasUserSelected(false);
    setSelectedAddress(null);
    setHighlightedIndex(-1);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    if (newValue.trim().length >= 5) {
      setIsLoading(true);
      debounceTimer.current = setTimeout(() => {
        searchAddresses(newValue);
      }, 600); // 600ms debounce để tránh spam Nominatim
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: NominatimSuggestion) => {
    const parsed = parseAddress(suggestion);
    
    onChange(parsed.displayName, parsed);
    setSelectedAddress(parsed);
    setHasUserSelected(true);
    setShowSuggestions(false);
    setSuggestions([]);
    setHighlightedIndex(-1);

    console.log('✅ Selected address:', parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleClearSelection = () => {
    onChange('');
    setSelectedAddress(null);
    setHasUserSelected(false);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Label htmlFor="addressAutocomplete">
        Địa chỉ giao hàng {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative mt-1">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          {isLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
        </div>
        
        <Input
          ref={inputRef}
          id="addressAutocomplete"
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${hasUserSelected ? 'border-green-500 bg-green-50' : ''}`}
        />

        {/* Status icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {hasUserSelected ? (
            <button
              type="button"
              onClick={handleClearSelection}
              className="hover:bg-gray-100 rounded-full p-1"
              title="Xóa địa chỉ đã chọn"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          ) : value.length >= 5 && !isLoading ? (
            <Search className="w-4 h-4 text-gray-400" />
          ) : null}
        </div>
      </div>

      {/* Helper text */}
      <div className="mt-1 text-xs">
        {value.length < 5 ? (
          <p className="text-gray-500">Nhập ít nhất 5 ký tự để tìm kiếm địa chỉ từ OpenStreetMap</p>
        ) : hasUserSelected && selectedAddress ? (
          <div className="flex items-start gap-1 text-green-700">
            <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Địa chỉ đã được xác thực:</p>
              <p>📍 {selectedAddress.streetAddress}</p>
              {selectedAddress.ward && <p>🏘️ {selectedAddress.ward}</p>}
              <p>🏙️ {selectedAddress.city}</p>
              <p className="text-gray-600">📌 GPS: {selectedAddress.latitude.toFixed(6)}, {selectedAddress.longitude.toFixed(6)}</p>
            </div>
          </div>
        ) : (
          <p className="text-amber-600">⚠️ Vui lòng chọn địa chỉ từ danh sách gợi ý để đảm bảo tính chính xác</p>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
          <div className="p-2 bg-blue-50 border-b">
            <p className="text-xs text-blue-800 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {suggestions.length} kết quả từ OpenStreetMap
            </p>
          </div>
          <ul className="py-1">
            {suggestions.map((suggestion, index) => {
              const parsed = parseAddress(suggestion);
              return (
                <li key={suggestion.place_id}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 ${
                      highlightedIndex === index ? 'bg-blue-100' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {suggestion.display_name}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {parsed.streetAddress && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              📍 {parsed.streetAddress}
                            </span>
                          )}
                          {parsed.ward && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              🏘️ {parsed.ward}
                            </span>
                          )}
                          {parsed.city && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                              🏙️ {parsed.city}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          GPS: {suggestion.lat}, {suggestion.lon}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* No results */}
      {showSuggestions && !isLoading && suggestions.length === 0 && value.length >= 5 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <div className="text-center text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Không tìm thấy địa chỉ phù hợp</p>
            <p className="text-xs mt-1">Hãy thử nhập địa chỉ đầy đủ hơn</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenStreetMapAutocomplete;
