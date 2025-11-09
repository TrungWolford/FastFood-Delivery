import axiosInstance from '../libs/axios';
import { API } from '../config/constants';

// Types
export interface RoleResponse {
  roleId: string;
  roleName: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
}

export interface CreateRoleRequest {
  roleName: string;
  description?: string;
  permissions?: string[];
}

// Role Service
export const roleService = {
  // Get all roles (no pagination - returns List)
  getAllRoles: async (): Promise<{ success: boolean; data?: RoleResponse[]; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_ALL_ROLES);
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error: any) {
      console.error('Error getting all roles:', error);
      
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Không thể tải danh sách vai trò'
      };
    }
  },

  // Get role by ID
  getRoleById: async (roleId: string): Promise<{ success: boolean; data?: RoleResponse; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_ROLE_BY_ID(roleId));
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting role:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải thông tin vai trò'
      };
    }
  },

  // Create new role
  createRole: async (request: CreateRoleRequest): Promise<{ success: boolean; data?: RoleResponse; message?: string }> => {
    try {
      const response = await axiosInstance.post(API.CREATE_ROLE, request);
      return {
        success: true,
        data: response.data,
        message: 'Tạo vai trò thành công'
      };
    } catch (error: any) {
      console.error('Error creating role:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tạo vai trò'
      };
    }
  },
};
