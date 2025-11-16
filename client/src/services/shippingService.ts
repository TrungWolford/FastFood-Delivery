import axiosInstance from '../libs/axios';
import { API } from '../config/constants';
import type {
  ShippingResponse,
  CreateShippingRequest,
  UpdateShippingRequest,
  UpdateShippingStatusRequest,
} from '../types/shipping';
import { SHIPPING_STATUS_LABELS, SHIPPING_STATUS_COLORS } from '../types/shipping';

// Export for backward compatibility
export type { ShippingResponse, CreateShippingRequest, UpdateShippingRequest, UpdateShippingStatusRequest };
export { SHIPPING_STATUS_LABELS as SHIPPING_STATUS, SHIPPING_STATUS_LABELS, SHIPPING_STATUS_COLORS };

// ============================================
// SHIPPING SERVICE (Based on Delivery from Backend)
// ============================================

export const shippingService = {
  // Get deliveries by order ID
  getShippingsByOrder: async (orderId: string): Promise<{ success: boolean; data?: ShippingResponse[]; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_DELIVERIES_BY_ORDER(orderId));
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting shippings by order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải thông tin vận chuyển'
      };
    }
  },

  // Get shipping by ID
  getShippingById: async (deliveryId: string): Promise<{ success: boolean; data?: ShippingResponse; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_DELIVERY_BY_ID(deliveryId));
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting shipping:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải thông tin vận chuyển'
      };
    }
  },

  // Create new shipping/delivery
  createShipping: async (request: CreateShippingRequest): Promise<{ success: boolean; data?: ShippingResponse; message?: string }> => {
    try {
      const response = await axiosInstance.post(API.CREATE_DELIVERY, request);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating shipping:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tạo vận chuyển'
      };
    }
  },

  // Update shipping
  updateShipping: async (deliveryId: string, request: UpdateShippingRequest): Promise<{ success: boolean; data?: ShippingResponse; message?: string }> => {
    try {
      const response = await axiosInstance.put(API.UPDATE_DELIVERY(deliveryId), request);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error updating shipping:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật vận chuyển'
      };
    }
  },

  // Update shipping status
  updateShippingStatus: async (deliveryId: string, request: UpdateShippingStatusRequest): Promise<{ success: boolean; data?: string; message?: string }> => {
    try {
      const response = await axiosInstance.patch(API.CHANGE_DELIVERY_STATUS(deliveryId), request);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật trạng thái thành công'
      };
    } catch (error: any) {
      console.error('Error updating shipping status:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật trạng thái'
      };
    }
  },
};

export default shippingService;
