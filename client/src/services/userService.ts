import axiosInstance from '../libs/axios';
import { API } from '../config/constants';
import type { 
  User as UserResponse, 
  RoleInfo as UserRole,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  ServiceResponse
} from '../types/user';

// Re-export for backward compatibility
export type { UserResponse, UserRole, CreateUserRequest, UpdateUserRequest };

// Helper function to normalize backend response
function normalizeUserResponse(backendUser: any): UserResponse {
  return {
    userId: backendUser.userID || backendUser.userId,
    userID: backendUser.userID || backendUser.userId,
    accountId: backendUser.userID || backendUser.userId,
    fullName: backendUser.fullname || backendUser.fullName,
    fullname: backendUser.fullname || backendUser.fullName,
    accountName: backendUser.fullname || backendUser.fullName,
    email: backendUser.email,
    phoneNumber: backendUser.phone || backendUser.phoneNumber,
    phone: backendUser.phone || backendUser.phoneNumber,
    accountPhone: backendUser.phone || backendUser.phoneNumber,
    address: backendUser.address,
    accountAddress: backendUser.address,
    status: (backendUser.status === 1 || backendUser.status === true) ? 1 : 0,
    statusText: backendUser.statusText || (backendUser.status === 1 ? "Đang hoạt động" : "Đã khóa"),
    roleId: backendUser.roleId,
    roleText: backendUser.roleText,
    roles: backendUser.roles || (backendUser.roleText ? [{
      roleId: backendUser.roleId || '',
      roleName: backendUser.roleText
    }] : []),
    restaurantId: backendUser.restaurantId,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt
  };
}

// User Service
export const userService = {
  // Get all users with pagination
  getAllUsers: async (page: number = 0, size: number = 10): Promise<ServiceResponse<PaginatedResponse<UserResponse>>> => {
    try {
      const response = await axiosInstance.get(API.GET_ALL_USERS, {
        params: { page, size }
      });
      
      // Normalize backend response
      let users: UserResponse[] = [];
      
      if (response.data && response.data.content) {
        // Spring Page format
        users = response.data.content.map((u: any) => normalizeUserResponse(u));
      } else if (Array.isArray(response.data)) {
        // Direct array format
        users = response.data.map((u: any) => normalizeUserResponse(u));
      }
      
      return {
        success: true,
        data: {
          content: users,
          totalPages: response.data?.totalPages || 1,
          totalElements: response.data?.totalElements || users.length,
          size: size,
          number: page,
          first: page === 0,
          last: page >= (response.data?.totalPages || 1) - 1,
          empty: users.length === 0
        }
      };
    } catch (error: any) {
      console.error('Error getting all users:', error);
      
      if (error.response?.status === 500) {
        return {
          success: true,
          data: {
            content: [],
            totalPages: 0,
            totalElements: 0,
            size: size,
            number: page,
            first: true,
            last: true,
            empty: true
          },
          message: 'Không có dữ liệu người dùng'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải danh sách người dùng'
      };
    }
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<ServiceResponse<UserResponse>> => {
    try {
      const response = await axiosInstance.get(API.GET_USER_BY_ID(userId));
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải thông tin người dùng'
      };
    }
  },

  // Create new user
  createUser: async (request: CreateUserRequest): Promise<ServiceResponse<UserResponse>> => {
    try {
      const response = await axiosInstance.post(API.CREATE_USER, request);
      return {
        success: true,
        data: response.data,
        message: 'Tạo người dùng thành công'
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tạo người dùng'
      };
    }
  },

  // Update user
  updateUser: async (userId: string, request: UpdateUserRequest): Promise<ServiceResponse<UserResponse>> => {
    try {
      const response = await axiosInstance.put(API.UPDATE_USER(userId), request);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật người dùng thành công'
      };
    } catch (error: any) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật người dùng'
      };
    }
  },

  // Change user status
  changeUserStatus: async (userId: string): Promise<ServiceResponse<null>> => {
    try {
      const response = await axiosInstance.patch(API.CHANGE_USER_STATUS(userId));
      return {
        success: true,
        message: response.data || 'Thay đổi trạng thái thành công'
      };
    } catch (error: any) {
      console.error('Error changing user status:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể thay đổi trạng thái'
      };
    }
  },

  // Filter users by role
  filterUsersByRole: async (roleId: string, page: number = 0, size: number = 10): Promise<ServiceResponse<PaginatedResponse<UserResponse>>> => {
    try {
      const response = await axiosInstance.get(API.FILTER_USERS_BY_ROLE(roleId), {
        params: { page, size }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error filtering users by role:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lọc người dùng'
      };
    }
  },
};
