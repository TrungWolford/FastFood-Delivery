/**
 * Restaurant Detail Service
 * Handles all API calls related to restaurant details
 * Based on RestaurantDetailController.java endpoints
 */

import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { CONFIG, API } from '../config/constants';
import type {
  RestaurantDetail,
  RestaurantDetailResponse,
  CreateRestaurantDetailRequest,
  UpdateRestaurantDetailRequest,
} from '../types/restaurantDetail';
import {
  validateOpeningHours,
  validateRestaurantTypes,
  validateSpecialties,
  validateCuisines,
  validateDescription,
} from '../types/restaurantDetail';

// Axios instance with base configuration
const apiClient = axios.create({
  baseURL: CONFIG.API_GATEWAY,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Restaurant Detail API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Create Restaurant Detail
 * POST /api/restaurant-details/{restaurantId}
 * 
 * @param restaurantId - The restaurant ID
 * @param request - Create restaurant detail request
 * @returns RestaurantDetailResponse
 */
export const createRestaurantDetail = async (
  restaurantId: string,
  request: CreateRestaurantDetailRequest
): Promise<RestaurantDetailResponse> => {
  // Validate request data
  if (!validateOpeningHours(request.openingHours)) {
    throw new Error('Định dạng giờ mở cửa không hợp lệ. Sử dụng: HH:mm-HH:mm');
  }
  if (!validateRestaurantTypes(request.restaurantTypes)) {
    throw new Error('Chọn từ 1-2 loại hình nhà hàng');
  }
  if (!validateSpecialties(request.specialties)) {
    throw new Error('Chọn từ 1-3 món đặc trưng');
  }
  if (!validateCuisines(request.cuisines)) {
    throw new Error('Chọn ít nhất 1 loại ẩm thực');
  }
  if (!validateDescription(request.description)) {
    throw new Error('Mô tả phải từ 50-1000 ký tự');
  }

  try {
    const response: AxiosResponse<RestaurantDetailResponse> = await apiClient.post(
      API.CREATE_RESTAURANT_DETAIL(restaurantId),
      request
    );
    console.log('✅ Created restaurant detail:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating restaurant detail:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể tạo thông tin chi tiết nhà hàng');
  }
};

/**
 * Get Restaurant Detail by Restaurant ID
 * GET /api/restaurant-details/{restaurantId}
 * 
 * @param restaurantId - The restaurant ID
 * @returns RestaurantDetailResponse or null if not found
 */
export const getRestaurantDetailByRestaurantId = async (
  restaurantId: string
): Promise<RestaurantDetailResponse | null> => {
  try {
    const response: AxiosResponse<RestaurantDetailResponse> = await apiClient.get(
      API.GET_RESTAURANT_DETAIL_BY_RESTAURANT(restaurantId)
    );
    console.log('✅ Fetched restaurant detail:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('ℹ️ Restaurant detail not found for restaurant:', restaurantId);
      return null;
    }
    console.error('❌ Error fetching restaurant detail:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể tải thông tin chi tiết nhà hàng');
  }
};

/**
 * Update Restaurant Detail
 * PUT /api/restaurant-details/{restaurantDetailId}
 * 
 * @param restaurantDetailId - The restaurant detail ID
 * @param request - Update restaurant detail request
 * @returns RestaurantDetailResponse
 */
export const updateRestaurantDetail = async (
  restaurantDetailId: string,
  request: UpdateRestaurantDetailRequest
): Promise<RestaurantDetailResponse> => {
  // Validate request data if fields are present
  if (request.openingHours && !validateOpeningHours(request.openingHours)) {
    throw new Error('Định dạng giờ mở cửa không hợp lệ. Sử dụng: HH:mm-HH:mm');
  }
  if (request.restaurantTypes && !validateRestaurantTypes(request.restaurantTypes)) {
    throw new Error('Chọn từ 1-2 loại hình nhà hàng');
  }
  if (request.specialties && !validateSpecialties(request.specialties)) {
    throw new Error('Chọn từ 1-3 món đặc trưng');
  }
  if (request.cuisines && !validateCuisines(request.cuisines)) {
    throw new Error('Chọn ít nhất 1 loại ẩm thực');
  }
  if (request.description && !validateDescription(request.description)) {
    throw new Error('Mô tả phải từ 50-1000 ký tự');
  }

  try {
    const response: AxiosResponse<RestaurantDetailResponse> = await apiClient.put(
      API.UPDATE_RESTAURANT_DETAIL(restaurantDetailId),
      request
    );
    console.log('✅ Updated restaurant detail:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating restaurant detail:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin chi tiết nhà hàng');
  }
};

/**
 * Delete Restaurant Detail by Restaurant ID
 * DELETE /api/restaurant-details/{restaurantId}
 * 
 * @param restaurantId - The restaurant ID
 * @returns void
 */
export const deleteRestaurantDetail = async (restaurantId: string): Promise<void> => {
  try {
    await apiClient.delete(API.DELETE_RESTAURANT_DETAIL(restaurantId));
    console.log('✅ Deleted restaurant detail for restaurant:', restaurantId);
  } catch (error: any) {
    console.error('❌ Error deleting restaurant detail:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể xóa thông tin chi tiết nhà hàng');
  }
};

/**
 * Create or Update Restaurant Detail
 * Helper function that checks if detail exists and creates or updates accordingly
 * 
 * @param restaurantId - The restaurant ID
 * @param request - Create/Update restaurant detail request
 * @returns RestaurantDetailResponse
 */
export const createOrUpdateRestaurantDetail = async (
  restaurantId: string,
  request: CreateRestaurantDetailRequest
): Promise<RestaurantDetailResponse> => {
  try {
    // Check if restaurant detail exists
    const existing = await getRestaurantDetailByRestaurantId(restaurantId);
    
    if (existing) {
      // Update existing detail
      console.log('ℹ️ Restaurant detail exists, updating...');
      return await updateRestaurantDetail(existing.restaurantDetailId, request);
    } else {
      // Create new detail
      console.log('ℹ️ Restaurant detail does not exist, creating...');
      return await createRestaurantDetail(restaurantId, request);
    }
  } catch (error: any) {
    console.error('❌ Error in createOrUpdateRestaurantDetail:', error.message);
    throw error;
  }
};

/**
 * Check if Restaurant Detail exists
 * 
 * @param restaurantId - The restaurant ID
 * @returns boolean
 */
export const restaurantDetailExists = async (restaurantId: string): Promise<boolean> => {
  try {
    const detail = await getRestaurantDetailByRestaurantId(restaurantId);
    return detail !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Convert RestaurantDetailResponse to RestaurantDetail (internal format)
 * Converts date strings from backend format to Date objects
 * 
 * @param response - RestaurantDetailResponse from API
 * @returns RestaurantDetail
 */
export const convertToRestaurantDetail = (response: RestaurantDetailResponse): RestaurantDetail => {
  return {
    restaurantDetailId: response.restaurantDetailId,
    restaurantId: response.restaurantId,
    openingHours: response.openingHours,
    restaurantTypes: response.restaurantTypes,
    cuisines: response.cuisines,
    specialties: response.specialties,
    description: response.description,
    coverImage: response.coverImage,
    menuImages: response.menuImages,
    createdAt: parseVietnameseDate(response.createdAt),
    updatedAt: parseVietnameseDate(response.updatedAt),
  };
};

/**
 * Parse Vietnamese date format (dd/MM/yyyy HH:mm:ss) to Date object
 * 
 * @param dateStr - Date string in Vietnamese format
 * @returns Date object
 */
const parseVietnameseDate = (dateStr: string): Date => {
  try {
    // Format: "dd/MM/yyyy HH:mm:ss"
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');
    
    return new Date(
      parseInt(year),
      parseInt(month) - 1, // Month is 0-indexed
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return new Date(); // Return current date as fallback
  }
};

/**
 * Export all service functions as default object
 */
const restaurantDetailService = {
  createRestaurantDetail,
  getRestaurantDetailByRestaurantId,
  updateRestaurantDetail,
  deleteRestaurantDetail,
  createOrUpdateRestaurantDetail,
  restaurantDetailExists,
  convertToRestaurantDetail,
};

export default restaurantDetailService;
