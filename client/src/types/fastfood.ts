// FastFood Types

// Restaurant Types
export interface Restaurant {
  restaurantId: string;
  restaurantName: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  status: number; // 0: Bảo trì, 1: Hoạt động
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRestaurantRequest {
  restaurantName: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  status: number;
}

export interface UpdateRestaurantRequest {
  restaurantName?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  status?: number;
}

// Drone Types
export interface Drone {
  droneId: string;
  restaurantId: string;
  model: string;
  capacity: number; // Sức chứa (kg)
  battery: number; // 0-100
  status: string; // "AVAILABLE", "IN_USE", "MAINTENANCE"
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDroneRequest {
  restaurantId: string;
  model: string;
  capacity: number;
  battery: number;
}

export interface UpdateDroneRequest {
  model?: string;
  capacity?: number;
  battery?: number;
  status?: string;
}

// FastFood Order Extension
export interface FastFoodOrderStats {
  total: number;
  pending: number;
  processing: number;
  shipping: number;
  completed: number;
  cancelled: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Restaurant Status
export type RestaurantStatus = 0 | 1; // 0 = Bảo trì, 1 = Hoạt động

// Drone Status
export type DroneStatus = 0 | 1 | 2; // 0 = Bảo trì, 1 = Sẵn sàng, 2 = Đang giao hàng

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
