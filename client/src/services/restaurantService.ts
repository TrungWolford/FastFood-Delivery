import axiosInstance from '../libs/axios';
import type { AxiosResponse } from 'axios';
import { API } from '../config/constants';
import type { 
  Restaurant, 
  CreateRestaurantRequest, 
  UpdateRestaurantRequest,
  PaginatedResponse 
} from '../types/fastfood';

// Restaurant Service
export const restaurantService = {
  // Get all restaurants with pagination
  getAllRestaurants: async (page = 0, size = 10): Promise<PaginatedResponse<Restaurant>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<Restaurant>> = await axiosInstance.get(
        `${API.GET_ALL_RESTAURANTS}?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.warn('⚠️ Backend API not available, using mock data for restaurants');
      // Mock data for development
      return {
        content: [
          {
            restaurantId: '1',
            restaurantName: 'FastFood Chi nhánh 1',
            address: '123 Nguyễn Huệ, Q.1',
            city: 'TP.HCM',
            phone: '0123456789',
            email: 'chinhanh1@fastfood.com',
            status: 1,
            createdAt: new Date().toISOString(),
          },
          {
            restaurantId: '2',
            restaurantName: 'FastFood Chi nhánh 2',
            address: '456 Lê Lợi, Q.3',
            city: 'TP.HCM',
            phone: '0987654321',
            email: 'chinhanh2@fastfood.com',
            status: 1,
            createdAt: new Date().toISOString(),
          },
          {
            restaurantId: '3',
            restaurantName: 'FastFood Chi nhánh 3',
            address: '789 Trần Hưng Đạo, Q.5',
            city: 'TP.HCM',
            phone: '0912345678',
            email: 'chinhanh3@fastfood.com',
            status: 0,
            createdAt: new Date().toISOString(),
          },
        ],
        totalElements: 3,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false,
      };
    }
  },

  // Get restaurant by ID
  getRestaurantById: async (restaurantId: string): Promise<Restaurant> => {
    try {
      const response: AxiosResponse<Restaurant> = await axiosInstance.get(
        API.GET_RESTAURANT_BY_ID(restaurantId)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  },

  // Create new restaurant
  createRestaurant: async (restaurantData: CreateRestaurantRequest): Promise<Restaurant> => {
    try {
      const response: AxiosResponse<Restaurant> = await axiosInstance.post(
        API.CREATE_RESTAURANT,
        restaurantData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  },

  // Update restaurant
  updateRestaurant: async (
    restaurantId: string,
    restaurantData: UpdateRestaurantRequest
  ): Promise<Restaurant> => {
    try {
      const response: AxiosResponse<Restaurant> = await axiosInstance.put(
        API.UPDATE_RESTAURANT(restaurantId),
        restaurantData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  },

  // Delete restaurant
  deleteRestaurant: async (restaurantId: string): Promise<void> => {
    try {
      await axiosInstance.delete(API.DELETE_RESTAURANT(restaurantId));
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      throw error;
    }
  },

  // Get restaurants by status
  getRestaurantsByStatus: async (
    status: number,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<Restaurant>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<Restaurant>> = await axiosInstance.get(
        `${API.GET_RESTAURANTS_BY_STATUS(status)}?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants by status:', error);
      throw error;
    }
  },

  // Search restaurants
  searchRestaurants: async (
    keyword: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<Restaurant>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<Restaurant>> = await axiosInstance.get(
        `${API.SEARCH_RESTAURANTS}?keyword=${keyword}&page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching restaurants:', error);
      throw error;
    }
  },
};

export default restaurantService;
