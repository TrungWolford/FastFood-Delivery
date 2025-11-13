import axiosInstance from '../libs/axios';
import { API } from '../config/constants';

// Types
export interface CCCDDocument {
  side: string; // "front" or "back"
  url: string;
}

export interface AccountRestaurantDetailResponse {
  id: string;
  userId: string;
  restaurantId: string;
  // Thông tin người đại diện lấy từ User entity thông qua userId
  cccdImages: CCCDDocument[];
  businessLicenseImages: string[];
  verificationStatus: string; // "pending", "approved", "rejected"
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRestaurantDetailRequest {
  userId: string;
  restaurantId: string;
  // Không cần gửi thông tin người đại diện vì đã có trong User entity
  cccdImages: CCCDDocument[];
  businessLicenseImages: string[];
}

export interface UpdateAccountRestaurantDetailRequest {
  // Chỉ update tài liệu xác minh
  cccdImages?: CCCDDocument[];
  businessLicenseImages?: string[];
}

// Account Restaurant Detail Service
export const accountRestaurantDetailService = {
  // Create account restaurant detail
  createAccountRestaurantDetail: async (
    request: CreateAccountRestaurantDetailRequest
  ): Promise<{ success: boolean; data?: AccountRestaurantDetailResponse; message?: string }> => {
    try {
      const response = await axiosInstance.post(API.CREATE_ACCOUNT_RESTAURANT_DETAIL, request);
      return {
        success: true,
        data: response.data,
        message: 'Tạo thông tin đăng ký thành công'
      };
    } catch (error: any) {
      console.error('Error creating account restaurant detail:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tạo thông tin đăng ký'
      };
    }
  },

  // Update account restaurant detail
  updateAccountRestaurantDetail: async (
    accountDetailId: string,
    request: UpdateAccountRestaurantDetailRequest
  ): Promise<{ success: boolean; data?: AccountRestaurantDetailResponse; message?: string }> => {
    try {
      const response = await axiosInstance.put(
        API.UPDATE_ACCOUNT_RESTAURANT_DETAIL(accountDetailId),
        request
      );
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật thông tin đăng ký thành công'
      };
    } catch (error: any) {
      console.error('Error updating account restaurant detail:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật thông tin đăng ký'
      };
    }
  },

  // Get by user ID
  getByUserId: async (
    userId: string
  ): Promise<{ success: boolean; data?: AccountRestaurantDetailResponse; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_ACCOUNT_RESTAURANT_DETAIL_BY_USER(userId));
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting account restaurant detail by user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không tìm thấy thông tin đăng ký'
      };
    }
  },

  // Get by restaurant ID
  getByRestaurantId: async (
    restaurantId: string
  ): Promise<{ success: boolean; data?: AccountRestaurantDetailResponse; message?: string }> => {
    try {
      const response = await axiosInstance.get(
        API.GET_ACCOUNT_RESTAURANT_DETAIL_BY_RESTAURANT(restaurantId)
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting account restaurant detail by restaurant:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không tìm thấy thông tin đăng ký'
      };
    }
  },

  // Get pending verifications (Admin only)
  getPendingVerifications: async (): Promise<{
    success: boolean;
    data?: AccountRestaurantDetailResponse[];
    message?: string;
  }> => {
    try {
      const response = await axiosInstance.get(API.GET_PENDING_VERIFICATIONS);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting pending verifications:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải danh sách chờ duyệt'
      };
    }
  },

  // Get approved verifications (Admin only)
  getApprovedVerifications: async (): Promise<{
    success: boolean;
    data?: AccountRestaurantDetailResponse[];
    message?: string;
  }> => {
    try {
      const response = await axiosInstance.get(API.GET_APPROVED_VERIFICATIONS);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting approved verifications:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải danh sách đã duyệt'
      };
    }
  },

  // Get rejected verifications (Admin only)
  getRejectedVerifications: async (): Promise<{
    success: boolean;
    data?: AccountRestaurantDetailResponse[];
    message?: string;
  }> => {
    try {
      const response = await axiosInstance.get(API.GET_REJECTED_VERIFICATIONS);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting rejected verifications:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải danh sách bị từ chối'
      };
    }
  }
};
