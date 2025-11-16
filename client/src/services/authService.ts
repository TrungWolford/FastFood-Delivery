import axiosInstance from '../libs/axios';
import type { AxiosResponse } from 'axios';
import { API } from '../config/constants';
import type { User as Account } from '../types/user';

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: Account
  message?: string
}

// Real API login
export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      // Backend AuthController is at /api/account/login
      console.log('🔐 Attempting login with:', {
        phone: credentials.email,
        endpoint: API.LOGIN
      });
      
      // Backend returns LoginResponse with { success, message, user }
      const response: AxiosResponse<LoginResponse> = await axiosInstance.post(API.LOGIN, {
        accountPhone: credentials.email, // Using email field as phone
        password: credentials.password
      });
      
      console.log('📡 Login response:', response.data);
      
      // Check if login was successful
      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        
        // Normalize user data: ensure accountId exists
        // Backend trả về userID, frontend cần accountId
        const normalizedUser: Account = {
          ...userData,
          accountId: userData.userID || userData.accountId, // Use userID as accountId
          accountName: userData.fullname || userData.accountName, // Use fullname as accountName
          accountPhone: userData.phone || userData.accountPhone, // Use phone as accountPhone
        };
        
        console.log('✅ Login successful, normalized user data:', normalizedUser);
        console.log('   - User ID (accountId):', normalizedUser.accountId);
        console.log('   - User Name:', normalizedUser.accountName);
        console.log('   - Phone:', normalizedUser.accountPhone);
        console.log('   - Roles:', normalizedUser.roles);
        
        // Save normalized user data to localStorage
        localStorage.setItem('user', JSON.stringify(normalizedUser))
        localStorage.setItem('isAuthenticated', 'true')
        
        return {
          success: true,
          user: normalizedUser,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Đăng nhập thất bại'
        };
      }
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Đăng nhập thất bại';
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },
  
  // Load user from localStorage
  loadUserFromStorage: (): Account | null => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        return JSON.parse(userStr) as Account
      }
    } catch (error) {
      // Silent error handling
    }
    return null
  },
  
  // Logout and clear localStorage
  logout: (): void => {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return localStorage.getItem('isAuthenticated') === 'true'
  }
}
