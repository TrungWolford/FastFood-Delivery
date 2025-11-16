/**
 * Location Types - Realtime Drone Tracking (Redis-based)
 * 
 * Location entity được cache trong Redis để tracking vị trí drone realtime.
 * Backend sử dụng Redis để lưu cache vị trí mới nhất của drone.
 */

// Location Response từ backend
export interface LocationResponse {
  locationId: string;
  droneId: string;
  latitude: number;
  longitude: number;
  recordedAt: string; // ISO date string
  timestamp: number;  // Unix timestamp (milliseconds)
}

// Request để update vị trí drone
export interface CreateLocationRequest {
  droneId: string;
  latitude: number;
  longitude: number;
  recordedAt?: string; // Optional, backend sẽ set nếu không có
  timestamp?: number;   // Optional, backend sẽ set nếu không có
}

// Parsed Location với Date object (for UI usage)
export interface Location {
  locationId: string;
  droneId: string;
  latitude: number;
  longitude: number;
  recordedAt: Date;
  timestamp: number;
}

// Helper function to parse LocationResponse to Location
export const parseLocation = (response: LocationResponse): Location => ({
  locationId: response.locationId,
  droneId: response.droneId,
  latitude: response.latitude,
  longitude: response.longitude,
  recordedAt: new Date(response.recordedAt),
  timestamp: response.timestamp,
});

// Validation constraints (match backend)
export const LOCATION_CONSTRAINTS = {
  LATITUDE_MIN: -90,
  LATITUDE_MAX: 90,
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX: 180,
} as const;
