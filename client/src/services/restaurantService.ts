import axiosInstance from '../libs/axios';
import { API } from '../config/constants';

// Types
export interface RestaurantResponse {
  restaurantId: string;
  ownerId: string;
  restaurantName: string; // Backend uses restaurantName, not name
  address: string;
  phone?: string; // Backend uses phone, not phoneNumber
  openingHours?: string;
  rating?: number;
  status?: number; // Backend uses int status (0/1), not boolean
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRestaurantRequest {
  ownerId: string; // Backend expects ObjectId but we send string
  restaurantName: string; // Backend uses restaurantName, not name
  address: string;
  phone?: string; // Backend uses phone, not phoneNumber
  openingHours?: string;
  description?: string;
}

export interface UpdateRestaurantRequest {
  restaurantName?: string; // Backend uses restaurantName, not name
  address?: string;
  phone?: string; // Backend uses phone, not phoneNumber
  openingHours?: string;
  description?: string;
}

// Restaurant Service
export const restaurantService = {
  // Get all restaurants with pagination
  getAllRestaurants: async (page: number = 0, size: number = 10): Promise<{ success: boolean; data?: { content: RestaurantResponse[]; totalPages: number; totalElements: number }; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_ALL_RESTAURANTS, {
        params: { page, size }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting all restaurants:', error);
      
      if (error.response?.status === 500) {
        return {
          success: true,
          data: { content: [], totalPages: 0, totalElements: 0 },
          message: 'Không có dữ liệu nhà hàng'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải danh sách nhà hàng'
      };
    }
  },

  // Get restaurant by ID
  getRestaurantById: async (restaurantId: string): Promise<{ success: boolean; data?: RestaurantResponse; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_RESTAURANT_BY_ID(restaurantId));
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting restaurant:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải thông tin nhà hàng'
      };
    }
  },

  // Get restaurants by owner
  getRestaurantsByOwner: async (ownerId: string): Promise<{ success: boolean; data?: RestaurantResponse[]; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_RESTAURANTS_BY_OWNER(ownerId));
      return {
        success: true,
        data: response.data || []
      };
    } catch (error: any) {
      console.error('Error getting restaurants by owner:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Không thể tải danh sách nhà hàng'
      };
    }
  },

  // Create new restaurant
  createRestaurant: async (request: CreateRestaurantRequest): Promise<{ success: boolean; data?: RestaurantResponse; message?: string }> => {
    try {
      const response = await axiosInstance.post(API.CREATE_RESTAURANT, request);
      return {
        success: true,
        data: response.data,
        message: 'Tạo nhà hàng thành công'
      };
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tạo nhà hàng'
      };
    }
  },

  // Update restaurant
  updateRestaurant: async (restaurantId: string, request: UpdateRestaurantRequest): Promise<{ success: boolean; data?: RestaurantResponse; message?: string }> => {
    try {
      const response = await axiosInstance.put(API.UPDATE_RESTAURANT(restaurantId), request);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật nhà hàng thành công'
      };
    } catch (error: any) {
      console.error('Error updating restaurant:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật nhà hàng'
      };
    }
  },

  // Change status restaurant
  changeRestaurantStatus: async (restaurantId: string, status: number): Promise<{ success: boolean; data?: RestaurantResponse; message?: string }> => {
    try {
      const response = await axiosInstance.patch(API.CHANGE_RESTAURANT_STATUS(restaurantId), null, {
        params: { status }
      });
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật trạng thái nhà hàng thành công'
      };
    } catch (error: any) {
      console.error('Error updating restaurant status:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật trạng thái nhà hàng'
      };
    }
  },
};
