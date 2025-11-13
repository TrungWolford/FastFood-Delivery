import axiosInstance from '../libs/axios';
import { API } from '../config/constants';

// Types
export interface RestaurantResponse {
  restaurantId: string;
  ownerId: string;
  restaurantName: string;
  address: string;
  city: string;
  district: string;
  phone: string;
  latitude: number;
  longitude: number;
  avatarImage?: string;
  rating: number;
  status: number; // 0 = Chờ duyệt, 1 = Đã duyệt
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantRequest {
  ownerId: string; // Backend expects ObjectId but we send string
  restaurantName: string;
  address: string;
  city: string;
  district: string;
  phone: string;
  latitude: number;
  longitude: number;
  avatarImage?: string;
}

export interface UpdateRestaurantRequest {
  restaurantName?: string;
  address?: string;
  city?: string;
  district?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  avatarImage?: string;
}

// Restaurant Detail Types
export interface RestaurantDetailResponse {
  restaurantDetailId: string;
  restaurantId: string;
  openingHours: string;
  restaurantTypes: string[]; // Max 2
  cuisines: string[];
  specialties: string[]; // Max 3
  description: string;
  coverImage?: string;
  menuImages?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantDetailRequest {
  openingHours: string;
  restaurantTypes: string[];
  cuisines: string[];
  specialties: string[];
  description: string;
  coverImage?: string;
  menuImages?: string[];
}

export interface UpdateRestaurantDetailRequest {
  openingHours?: string;
  restaurantTypes?: string[];
  cuisines?: string[];
  specialties?: string[];
  description?: string;
  coverImage?: string;
  menuImages?: string[];
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

  // Get restaurants by city
  getRestaurantsByCity: async (city: string): Promise<{ success: boolean; data?: RestaurantResponse[]; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_RESTAURANTS_BY_CITY(city));
      return {
        success: true,
        data: response.data || []
      };
    } catch (error: any) {
      console.error('Error getting restaurants by city:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Không thể tải danh sách nhà hàng'
      };
    }
  },

  // Get restaurants by city and district
  getRestaurantsByCityAndDistrict: async (city: string, district: string): Promise<{ success: boolean; data?: RestaurantResponse[]; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_RESTAURANTS_BY_CITY_DISTRICT(city, district));
      return {
        success: true,
        data: response.data || []
      };
    } catch (error: any) {
      console.error('Error getting restaurants by city and district:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Không thể tải danh sách nhà hàng'
      };
    }
  },

  // Get restaurants by status
  getRestaurantsByStatus: async (status: number): Promise<{ success: boolean; data?: RestaurantResponse[]; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_RESTAURANTS_BY_STATUS(status));
      return {
        success: true,
        data: response.data || []
      };
    } catch (error: any) {
      console.error('Error getting restaurants by status:', error);
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

// Restaurant Detail Service
export const restaurantDetailService = {
  // Create restaurant detail
  createRestaurantDetail: async (restaurantId: string, request: CreateRestaurantDetailRequest): Promise<{ success: boolean; data?: RestaurantDetailResponse; message?: string }> => {
    try {
      const response = await axiosInstance.post(API.CREATE_RESTAURANT_DETAIL(restaurantId), request);
      return {
        success: true,
        data: response.data,
        message: 'Tạo thông tin chi tiết nhà hàng thành công'
      };
    } catch (error: any) {
      console.error('Error creating restaurant detail:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tạo thông tin chi tiết nhà hàng'
      };
    }
  },

  // Get restaurant detail by restaurant ID
  getRestaurantDetailByRestaurant: async (restaurantId: string): Promise<{ success: boolean; data?: RestaurantDetailResponse; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_RESTAURANT_DETAIL_BY_RESTAURANT(restaurantId));
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting restaurant detail:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Chưa có thông tin chi tiết'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải thông tin chi tiết nhà hàng'
      };
    }
  },

  // Update restaurant detail
  updateRestaurantDetail: async (restaurantDetailId: string, request: UpdateRestaurantDetailRequest): Promise<{ success: boolean; data?: RestaurantDetailResponse; message?: string }> => {
    try {
      const response = await axiosInstance.put(API.UPDATE_RESTAURANT_DETAIL(restaurantDetailId), request);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật thông tin chi tiết thành công'
      };
    } catch (error: any) {
      console.error('Error updating restaurant detail:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật thông tin chi tiết'
      };
    }
  },

  // Delete restaurant detail
  deleteRestaurantDetail: async (restaurantId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await axiosInstance.delete(API.DELETE_RESTAURANT_DETAIL(restaurantId));
      return {
        success: true,
        message: 'Xóa thông tin chi tiết thành công'
      };
    } catch (error: any) {
      console.error('Error deleting restaurant detail:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể xóa thông tin chi tiết'
      };
    }
  }
};
