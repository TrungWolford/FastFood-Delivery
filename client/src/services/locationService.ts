/**
 * Location Service - Realtime Drone Tracking
 * 
 * Service để track vị trí drone realtime thông qua LocationController.
 * Backend sử dụng Redis để cache vị trí mới nhất của drone.
 * 
 * Redis Flow:
 * 1. POST /api/locations - Update location → Cache in Redis (TTL: 5 minutes)
 * 2. GET /api/locations/drone/{droneId} - Get location → Check Redis first, fallback to MongoDB
 */

import apiClient from '../libs/axios';
import { CONFIG, API } from '../config/constants';
import type {
  LocationResponse,
  CreateLocationRequest,
  Location,
} from '../types/location';
import { parseLocation, LOCATION_CONSTRAINTS } from '../types/location';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
}

class LocationService {
  /**
   * Update drone location (cached in Redis for 5 minutes)
   * POST /api/locations
   * 
   * Use case: Drone gửi vị trí mỗi 5-10 giây để track realtime
   * 
   * @param request - Location data (droneId, lat, lng)
   * @returns Updated location response
   */
  async updateDroneLocation(request: CreateLocationRequest): Promise<ApiResponse<LocationResponse>> {
    try {
      // Validate coordinates
      if (request.latitude < LOCATION_CONSTRAINTS.LATITUDE_MIN || 
          request.latitude > LOCATION_CONSTRAINTS.LATITUDE_MAX) {
        return {
          success: false,
          message: 'Latitude must be between -90 and 90',
          data: {} as LocationResponse,
          errors: { latitude: 'Invalid latitude value' },
        };
      }

      if (request.longitude < LOCATION_CONSTRAINTS.LONGITUDE_MIN || 
          request.longitude > LOCATION_CONSTRAINTS.LONGITUDE_MAX) {
        return {
          success: false,
          message: 'Longitude must be between -180 and 180',
          data: {} as LocationResponse,
          errors: { longitude: 'Invalid longitude value' },
        };
      }

      // Set timestamp if not provided
      const payload: CreateLocationRequest = {
        ...request,
        recordedAt: request.recordedAt || new Date().toISOString(),
        timestamp: request.timestamp || Date.now(),
      };

      const response = await apiClient.post<ApiResponse<LocationResponse>>(
        `${CONFIG.API_GATEWAY}${API.UPDATE_DRONE_LOCATION}`,
        payload
      );

      return response.data;
    } catch (error: any) {
      console.error('Error updating drone location:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update drone location',
        data: {} as LocationResponse,
        errors: error.response?.data?.errors,
      };
    }
  }

  /**
   * Get current drone location (from Redis cache or MongoDB)
   * GET /api/locations/drone/{droneId}
   * 
   * Use case: Display drone location on map, check if drone is moving
   * 
   * Backend logic:
   * 1. Check Redis cache first (faster)
   * 2. If not in cache, query MongoDB
   * 3. Return null if location not found
   * 
   * @param droneId - Drone ID
   * @returns Current location or null
   */
  async getDroneLocation(droneId: string): Promise<ApiResponse<LocationResponse | null>> {
    try {
      if (!droneId) {
        return {
          success: false,
          message: 'Drone ID is required',
          data: null,
          errors: { droneId: 'Drone ID is required' },
        };
      }

      const response = await apiClient.get<ApiResponse<LocationResponse>>(
        `${CONFIG.API_GATEWAY}${API.GET_DRONE_LOCATION(droneId)}`
      );

      return response.data;
    } catch (error: any) {
      // 404 means no location found (not an error, just no data)
      if (error.response?.status === 404) {
        return {
          success: true,
          message: 'No location found for this drone',
          data: null,
        };
      }

      console.error('Error fetching drone location:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch drone location',
        data: null,
        errors: error.response?.data?.errors,
      };
    }
  }

  /**
   * Parse LocationResponse to Location (with Date object)
   * Helper for UI components
   */
  parseLocation(response: LocationResponse): Location {
    return parseLocation(response);
  }

  /**
   * Validate coordinates
   * Helper for form validation
   */
  validateCoordinates(latitude: number, longitude: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (latitude < LOCATION_CONSTRAINTS.LATITUDE_MIN || latitude > LOCATION_CONSTRAINTS.LATITUDE_MAX) {
      errors.push(`Latitude must be between ${LOCATION_CONSTRAINTS.LATITUDE_MIN} and ${LOCATION_CONSTRAINTS.LATITUDE_MAX}`);
    }

    if (longitude < LOCATION_CONSTRAINTS.LONGITUDE_MIN || longitude > LOCATION_CONSTRAINTS.LONGITUDE_MAX) {
      errors.push(`Longitude must be between ${LOCATION_CONSTRAINTS.LONGITUDE_MIN} and ${LOCATION_CONSTRAINTS.LONGITUDE_MAX}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * Helper for calculating drone travel distance
   * 
   * @returns Distance in kilometers
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;
