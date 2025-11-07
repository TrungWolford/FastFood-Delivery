import axiosInstance from '../libs/axios';
import type { AxiosResponse } from 'axios';
import { API } from '../config/constants';
import type { Account } from '../types/account';

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
      // Backend returns LoginResponse with { success, message, user }
      const response: AxiosResponse<LoginResponse> = await axiosInstance.post(API.ACCOUNT_LOGIN, {
        accountPhone: credentials.email, // Using email field as phone
        password: credentials.password
      });
      
      // Check if login was successful
      if (response.data.success && response.data.user) {
        // Save user data to localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('isAuthenticated', 'true')
        
        return {
          success: true,
          user: response.data.user,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Đăng nhập thất bại'
        };
      }
      
    } catch (error: any) {
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
