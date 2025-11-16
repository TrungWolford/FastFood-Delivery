// @ts-nocheck
// ===== MIGRATION NOTICE =====
// This service is deprecated. Use userService.ts instead.
// AccountController endpoints are replaced by UserController.
// ============================

import axiosInstance from '../libs/axios';
import type { AxiosResponse } from 'axios';
import { API } from '../config/constants';
import type { 
  User as Account, 
  CreateUserRequest as CreateAccountRequest, 
  UpdateUserRequest as UpdateAccountRequest, 
  LoginRequest, 
  PaginatedResponse,
  Role 
} from '../types/user';
import { userService, type UserResponse } from './userService';

// Helper function to convert UserResponse to Account format for backward compatibility
function convertUserToAccount(user: UserResponse): Account {
  return {
    ...user,
    userID: user.userId || user.userID || '',
    accountId: user.userId || user.userID || '',
    accountName: user.username || user.fullName || '',
    accountEmail: user.email,
    accountPhone: user.phoneNumber || user.phone || '',
    accountAddress: user.address || '',
    status: user.status ? 1 : 0,
    role: user.roles?.[0]?.roleName || '',
    roleId: user.roles?.[0]?.roleId || '',
    fullname: user.fullName || '',
    phone: user.phoneNumber || user.phone || '',
    roleText: user.roles?.[0]?.roleName || '',
    roles: user.roles || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  } as Account;
}

// Account Service - MIGRATED to UserController
export const accountService = {
  // Get all accounts with pagination - MIGRATED
  getAllAccounts: async (page = 0, size = 10): Promise<PaginatedResponse<Account>> => {
    const response = await userService.getAllUsers(page, size);
    if (response.success && response.data) {
      return {
        content: response.data.content.map(convertUserToAccount),
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        size: size,
        number: page,
        first: page === 0,
        last: page >= response.data.totalPages - 1,
        empty: response.data.content.length === 0
      };
    }
    throw new Error(response.message || 'Failed to get accounts');
  },

  // Get account by ID - MIGRATED
  getAccountById: async (accountId: string): Promise<Account> => {
    const response = await userService.getUserById(accountId);
    if (response.success && response.data) {
      return convertUserToAccount(response.data);
    }
    throw new Error(response.message || 'Failed to get account');
  },

  // Create new account - MIGRATED
  createAccount: async (accountData: CreateAccountRequest): Promise<Account> => {
    const createRequest = {
      username: accountData.accountName || accountData.fullname,
      password: accountData.password,
      email: accountData.email || `${accountData.accountPhone}@temp.com`,
      phoneNumber: accountData.accountPhone || accountData.phone,
      fullName: accountData.accountName || accountData.fullname,
      address: accountData.address,
      roleIds: accountData.roleIds || (accountData.roleId ? [accountData.roleId] : [])
    };
    const response = await userService.createUser(createRequest);
    if (response.success && response.data) {
      return convertUserToAccount(response.data);
    }
    throw new Error(response.message || 'Failed to create account');
  },

  // Update account - MIGRATED
  updateAccount: async (accountId: string, accountData: UpdateAccountRequest): Promise<Account> => {
    const updateRequest = {
      username: accountData.accountName || accountData.fullname,
      email: accountData.email,
      phoneNumber: accountData.accountPhone || accountData.phone,
      fullName: accountData.accountName || accountData.fullname,
      address: accountData.address,
      password: accountData.password,
      roleIds: accountData.roleIds || (accountData.roleId ? [accountData.roleId] : undefined),
      status: accountData.status
    };
    const response = await userService.updateUser(accountId, updateRequest);
    if (response.success && response.data) {
      return convertUserToAccount(response.data);
    }
    throw new Error(response.message || 'Failed to update account');
  },

  // Delete account - NO EQUIVALENT in UserController
  deleteAccount: async (accountId: string): Promise<void> => {
    throw new Error('Delete user is not supported. Use changeUserStatus instead.');
  },

  // Get accounts by status - NO EQUIVALENT, return all and filter client-side
  getAccountsByStatus: async (status: number, page = 0, size = 10): Promise<PaginatedResponse<Account>> => {
    const response = await userService.getAllUsers(page, size);
    if (response.success && response.data) {
      const filtered = response.data.content.filter(u => (u.status ? 1 : 0) === status);
      return {
        content: filtered.map(convertUserToAccount),
        totalPages: response.data.totalPages,
        totalElements: filtered.length,
        size: size,
        number: page,
        first: page === 0,
        last: true,
        empty: filtered.length === 0
      };
    }
    throw new Error(response.message || 'Failed to get accounts by status');
  },

  // Get account by phone - NO EQUIVALENT
  getAccountByPhone: async (accountPhone: string): Promise<Account> => {
    throw new Error('Get account by phone is not supported in UserController');
  },

  // Search accounts by name - NO EQUIVALENT, return all and filter client-side
  searchAccountsByName: async (accountName: string, page = 0, size = 10): Promise<PaginatedResponse<Account>> => {
    const response = await userService.getAllUsers(page, size * 10); // Get more to filter
    if (response.success && response.data) {
      const filtered = response.data.content.filter(u => 
        u.username?.toLowerCase().includes(accountName.toLowerCase()) ||
        u.fullName?.toLowerCase().includes(accountName.toLowerCase())
      );
      return {
        content: filtered.slice(0, size).map(convertUserToAccount),
        totalPages: Math.ceil(filtered.length / size),
        totalElements: filtered.length,
        size: size,
        number: page,
        first: page === 0,
        last: true,
        empty: filtered.length === 0
      };
    }
    throw new Error(response.message || 'Failed to search accounts');
  },

  // Update account status - MIGRATED
  updateAccountStatus: async (accountId: string, status: number): Promise<Account> => {
    const response = await userService.changeUserStatus(accountId);
    if (response.success) {
      return await accountService.getAccountById(accountId);
    }
    throw new Error(response.message || 'Failed to update account status');
  },

  // Login - Should use AuthController, not AccountController
  login: async (credentials: LoginRequest): Promise<Account> => {
    throw new Error('Login should use AuthController, not AccountController/UserController');
  },
};

// Role Service
export const roleService = {
  // Get all roles
  getAllRoles: async (): Promise<Role[]> => {
    const response: AxiosResponse<Role[]> = await axiosInstance.get(API.GET_ALL_ROLES);
    return response.data;
  },

  // Get role by ID
  getRoleById: async (roleId: string): Promise<Role> => {
    const response: AxiosResponse<Role> = await axiosInstance.get(API.GET_ROLE_BY_ID(roleId));
    return response.data;
  },

  // Create role
  createRole: async (roleData: Omit<Role, 'roleId'>): Promise<Role> => {
    const response: AxiosResponse<Role> = await axiosInstance.post(API.CREATE_ROLE, roleData);
    return response.data;
  },

  // Update role
  updateRole: async (roleId: string, roleData: Partial<Role>): Promise<Role> => {
    const response: AxiosResponse<Role> = await axiosInstance.put(API.UPDATE_ROLE(roleId), roleData);
    return response.data;
  },

  // Delete role
  deleteRole: async (roleId: string): Promise<void> => {
    await axiosInstance.delete(API.DELETE_ROLE(roleId));
  },
};
