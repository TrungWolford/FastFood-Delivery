import axiosInstance from '../libs/axios';
import type { AxiosResponse } from 'axios';
import { API } from '../config/constants';
import type { Role, User, CreateUserRequest } from '../types/user';

export interface RegisterRequest {
  accountName: string;
  accountPhone: string;
  email: string;
  address: string;
  password: string;
}

export interface RegisterResponse {
  userID: string;
  accountId?: string;     // Alias for userID
  fullname: string;
  accountName?: string;   // Alias for fullname
  phone: string;
  accountPhone?: string;  // Alias for phone
  status: number;
  roles: Role[];
  message?: string;
}

// Register Service
export const registerService = {
  // Get CUSTOMER role
  getCustomerRole: async (): Promise<Role> => {
    try {
      const response: AxiosResponse<Role[]> = await axiosInstance.get(API.GET_ALL_ROLES);
      const customerRole = response.data.find(role => role.roleName === 'CUSTOMER');
      if (!customerRole) {
        throw new Error('Không tìm thấy role CUSTOMER');
      }
      return customerRole;
    } catch (error) {
      throw error;
    }
  },

  // Register new account with CUSTOMER role
  registerAccount: async (registerData: RegisterRequest): Promise<RegisterResponse> => {
    try {
      // First, get the CUSTOMER role
      const customerRole = await registerService.getCustomerRole();
      
      // Prepare user data with CUSTOMER role (using UserController and CreateUserRequest from types)
      // Backend expects 'role' (ObjectId), not 'roleIds' (array)
      const userData = {
        fullname: registerData.accountName,
        password: registerData.password,
        email: registerData.email,
        phone: registerData.accountPhone,
        address: registerData.address,
        role: customerRole.roleId // Backend expects single ObjectId as string
      };

      console.log('🔍 Sending registration data:', userData);

      // Create user using UserController endpoint
      const response: AxiosResponse<User> = await axiosInstance.post(API.CREATE_USER, userData);
      
      // Map User response to RegisterResponse
      const userResponse = response.data;
      
      console.log('✅ Registration successful:', userResponse);
      
      return {
        userID: userResponse.userID,
        accountId: userResponse.userID,
        fullname: userResponse.fullname,
        accountName: userResponse.fullname,
        phone: userResponse.phone,
        accountPhone: userResponse.phone,
        status: userResponse.status,
        roles: userResponse.roles.map(r => ({
          roleId: r.roleId,
          roleName: r.roleName
        })),
        message: 'Đăng ký thành công'
      };
    } catch (error: any) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      throw error;
    }
  },


};
