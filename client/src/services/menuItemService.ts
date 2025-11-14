import axiosInstance from '../libs/axios';
import { API, CONFIG } from '../config/constants';

// MenuItem interfaces theo backend
export interface MenuItemResponse {
  itemId: string;
  restaurantId: string;
  restaurantAddress: string;
  name: string;
  description: string;
  categoryName: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemRequest {
  restaurantId: string;
  name: string;
  description: string;
  categoryName: string;
  price: number;
  imageUrl: string;
  isAvailable?: boolean; // Optional, defaults to true in backend if not provided
}

export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  categoryName?: string;
  price?: number;
  imageUrl?: string;
  isAvailable?: boolean; // Add isAvailable to update request
}

export interface PaginatedMenuItemResponse {
  content: MenuItemResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// MenuItem Service
export const menuItemService = {
  // Get all menu items with pagination
  getAllMenuItems: async (page: number = 0, size: number = 10): Promise<PaginatedMenuItemResponse> => {
    const response = await axiosInstance.get(`${CONFIG.API_GATEWAY}${API.GET_ALL_MENU_ITEMS}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get menu item by ID
  getMenuItemById: async (menuItemId: string): Promise<MenuItemResponse> => {
    const response = await axiosInstance.get(`${CONFIG.API_GATEWAY}${API.GET_MENU_ITEM_BY_ID(menuItemId)}`);
    return response.data;
  },

  // Get menu items by restaurant ID
  getMenuItemsByRestaurant: async (restaurantId: string): Promise<MenuItemResponse[]> => {
    const response = await axiosInstance.get(`${CONFIG.API_GATEWAY}${API.GET_MENU_ITEMS_BY_RESTAURANT(restaurantId)}`);
    return response.data;
  },

  // Create new menu item
  createMenuItem: async (request: CreateMenuItemRequest): Promise<MenuItemResponse> => {
    const response = await axiosInstance.post(`${CONFIG.API_GATEWAY}${API.CREATE_MENU_ITEM}`, request);
    return response.data;
  },

  // Update menu item
  updateMenuItem: async (menuItemId: string, request: UpdateMenuItemRequest): Promise<MenuItemResponse> => {
    const response = await axiosInstance.put(`${CONFIG.API_GATEWAY}${API.UPDATE_MENU_ITEM(menuItemId)}`, request);
    return response.data;
  },

  // Change menu item status (toggle isAvailable)
  changeMenuItemStatus: async (menuItemId: string): Promise<MenuItemResponse> => {
    const response = await axiosInstance.patch(`${CONFIG.API_GATEWAY}${API.CHANGE_MENU_ITEM_STATUS(menuItemId)}`);
    return response.data;
  }
};
