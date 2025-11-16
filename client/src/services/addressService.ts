import axios from 'axios';

// Nominatim API từ OpenStreetMap
const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

export interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  place_id: number;
  osm_type: string;
  osm_id: number;
  boundingbox?: string[];
}

export interface GeocodeResult {
  isValid: boolean;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  message?: string;
}

class AddressService {
  /**
   * Tìm kiếm địa chỉ autocomplete dựa trên input người dùng
   * @param street - Tên đường/số nhà người dùng nhập
   * @param ward - Phường/Xã
   * @param city - Tỉnh/Thành phố (sau sáp nhập hành chính 2025, không còn quận/huyện)
   */
  async searchAddress(
    street: string,
    ward?: string,
    city?: string
  ): Promise<AddressSuggestion[]> {
    if (!street || street.trim().length < 3) {
      return [];
    }

    try {
      // Xây dựng query với độ ưu tiên cao hơn cho địa chỉ cụ thể
      const parts = [street.trim()];
      if (ward) parts.push(ward);
      if (city) parts.push(city);
      parts.push('Vietnam');

      const query = parts.join(', ');

      const response = await axios.get<AddressSuggestion[]>(`${NOMINATIM_API}/search`, {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 10,
          countrycodes: 'vn', // Chỉ tìm ở Việt Nam
        },
        headers: {
          'Accept-Language': 'vi',
          'User-Agent': 'FastFood-Delivery-App',
        },
      });

      return response.data || [];
    } catch {
      // Silent error handling
      return [];
    }
  }

  /**
   * Geocode địa chỉ đầy đủ thành tọa độ và validate
   * @param street - Số nhà, tên đường
   * @param ward - Phường/Xã
   * @param city - Tỉnh/Thành phố (sau sáp nhập hành chính 2025, không còn quận/huyện)
   */
  async geocodeAddress(
    street: string,
    ward: string,
    city: string
  ): Promise<GeocodeResult> {
    if (!street || !ward || !city) {
      return {
        isValid: false,
        message: 'Vui lòng điền đầy đủ thông tin địa chỉ',
      };
    }

    try {
      // Xây dựng địa chỉ đầy đủ (không còn quận/huyện sau sáp nhập)
      const fullAddress = `${street}, ${ward}, ${city}, Vietnam`;

      const response = await axios.get<AddressSuggestion[]>(`${NOMINATIM_API}/search`, {
        params: {
          q: fullAddress,
          format: 'json',
          addressdetails: 1,
          limit: 1,
          countrycodes: 'vn',
        },
        headers: {
          'Accept-Language': 'vi',
          'User-Agent': 'FastFood-Delivery-App',
        },
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        
        // Kiểm tra xem kết quả có phải là địa chỉ cụ thể không
        // (có road hoặc ít nhất có suburb/city)
        const hasSpecificLocation = result.address && 
          (result.address.road || result.address.suburb || result.address.city);

        if (!hasSpecificLocation) {
          return {
            isValid: false,
            message: 'Địa chỉ không đủ cụ thể. Vui lòng nhập đầy đủ số nhà và tên đường.',
          };
        }

        return {
          isValid: true,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          formattedAddress: result.display_name,
        };
      } else {
        return {
          isValid: false,
          message: 'Không tìm thấy địa chỉ này. Vui lòng kiểm tra lại tên đường.',
        };
      }
    } catch {
      return {
        isValid: false,
        message: 'Không thể xác minh địa chỉ. Vui lòng thử lại.',
      };
    }
  }

  /**
   * Reverse geocode từ tọa độ sang địa chỉ
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const response = await axios.get(`${NOMINATIM_API}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'Accept-Language': 'vi',
          'User-Agent': 'FastFood-Delivery-App',
        },
      });

      return response.data?.display_name || null;
    } catch {
      // Silent error handling
      return null;
    }
  }
}

export const addressService = new AddressService();
