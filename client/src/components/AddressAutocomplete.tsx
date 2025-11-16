import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { addressService, type AddressSuggestion } from '../services/addressService';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface AddressAutocompleteProps {
  value: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string, suggestion?: AddressSuggestion) => void;
  ward?: string;
  city?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  ward,
  city,
  disabled = false,
  placeholder = 'VD: 123 Nguyễn Huệ',
  required = false,
}) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasUserSelected, setHasUserSelected] = useState(false);
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

  // Debounced search
  const searchAddresses = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim().length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await addressService.searchAddress(
        searchTerm,
        ward,
        city
      );
      setSuggestions(results);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [ward, city]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setHasUserSelected(false);
    setHighlightedIndex(-1);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    if (newValue.trim().length >= 3) {
      setIsLoading(true);
      debounceTimer.current = setTimeout(() => {
        searchAddresses(newValue);
      }, 500); // 500ms debounce
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    // Lấy phần địa chỉ cụ thể (số nhà + tên đường)
    let addressText = '';
    
    if (suggestion.address) {
      const parts = [];
      if (suggestion.address.house_number) parts.push(suggestion.address.house_number);
      if (suggestion.address.road) parts.push(suggestion.address.road);
      addressText = parts.join(' ');
    }
    
    // Nếu không parse được từ address object, fallback về display_name
    if (!addressText) {
      const displayParts = suggestion.display_name.split(',');
      addressText = displayParts[0]?.trim() || suggestion.display_name;
    }

    onChange(addressText, suggestion);
    setHasUserSelected(true);
    setShowSuggestions(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
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

  const getDisplayText = (suggestion: AddressSuggestion): string => {
    return suggestion.display_name;
  };

  const canSearch = ward && city;

  return (
    <div ref={wrapperRef} className="relative">
      <Label htmlFor="deliveryAddress">
        Số nhà, tên đường {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative mt-1">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          {isLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
        </div>
        
        <Input
          ref={inputRef}
          id="deliveryAddress"
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          disabled={disabled || !canSearch}
          placeholder={canSearch ? placeholder : 'Vui lòng chọn phường/xã trước'}
          className="pl-10 pr-10"
        />

        {!canSearch && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
        )}
      </div>

      {/* Helper text */}
      {canSearch && (
        <p className="text-xs text-gray-500 mt-1">
          {value.length < 3 
            ? 'Nhập ít nhất 3 ký tự để tìm kiếm địa chỉ' 
            : hasUserSelected 
              ? '✓ Địa chỉ đã được chọn từ gợi ý'
              : 'Vui lòng chọn địa chỉ từ danh sách gợi ý'}
        </p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.osm_type}-${suggestion.osm_id}`}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === highlightedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {getDisplayText(suggestion)}
                  </p>
                  {suggestion.address && (
                    <p className="text-xs text-gray-500 mt-1">
                      {suggestion.address.road && `${suggestion.address.road} • `}
                      {suggestion.address.suburb || suggestion.address.city || ''}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showSuggestions && !isLoading && value.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Search className="w-4 h-4" />
            <p className="text-sm">Không tìm thấy địa chỉ phù hợp</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Hãy thử nhập đầy đủ số nhà và tên đường
          </p>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
