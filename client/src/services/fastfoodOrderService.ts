// @ts-nocheck
import axiosInstance from '../libs/axios';
import type { AxiosResponse } from 'axios';
import { API } from '../config/constants';
import type { OrderResponse } from './orderService';
import type { FastFoodOrderStats, PaginatedResponse } from '../types/fastfood';

// FastFood Order Service - Extended features for FastFood admin
export const fastfoodOrderService = {
  // Get all orders (admin only)
  getAllOrders: async (page = 0, size = 10): Promise<PaginatedResponse<OrderResponse>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<OrderResponse>> = await axiosInstance.get(
        `${API.GET_ALL_ORDERS}?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.warn('⚠️ Backend API not available, using mock data for orders');
      // Mock data for development
      return {
        content: [
          {
            orderId: 'ORD001',
            accountId: 'ACC001',
            accountName: 'Nguyễn Văn A',
            orderDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 1,
            paymentMethod: 0,
            totalAmount: 250000,
            orderDetails: [
              {
                orderDetailId: '1',
                productId: 'P001',
                productName: 'Burger Phô Mai',
                quantity: 2,
                unitPrice: 50000,
                totalPrice: 100000,
                productImages: [],
              },
              {
                orderDetailId: '2',
                productId: 'P002',
                productName: 'Pizza Hải Sản',
                quantity: 1,
                unitPrice: 150000,
                totalPrice: 150000,
                productImages: [],
              },
            ],
            shipping: {
              shippingId: 'SHIP001',
              accountId: 'ACC001',
              receiverName: 'Nguyễn Văn A',
              receiverPhone: '0123456789',
              receiverAddress: '123 Nguyễn Huệ, Q.1',
              city: 'TP.HCM',
              status: 1,
            },
          },
          {
            orderId: 'ORD002',
            accountId: 'ACC002',
            accountName: 'Trần Thị B',
            orderDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            status: 2,
            paymentMethod: 1,
            totalAmount: 180000,
            orderDetails: [
              {
                orderDetailId: '3',
                productId: 'P003',
                productName: 'Gà Rán',
                quantity: 3,
                unitPrice: 60000,
                totalPrice: 180000,
                productImages: [],
              },
            ],
            shipping: {
              shippingId: 'SHIP002',
              accountId: 'ACC002',
              receiverName: 'Trần Thị B',
              receiverPhone: '0987654321',
              receiverAddress: '456 Lê Lợi, Q.3',
              city: 'TP.HCM',
              status: 3,
            },
          },
          {
            orderId: 'ORD003',
            accountId: 'ACC003',
            accountName: 'Lê Văn C',
            orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 1,
            paymentMethod: 0,
            totalAmount: 320000,
            orderDetails: [
              {
                orderDetailId: '4',
                productId: 'P004',
                productName: 'Combo Gia Đình',
                quantity: 1,
                unitPrice: 320000,
                totalPrice: 320000,
                productImages: [],
              },
            ],
            shipping: {
              shippingId: 'SHIP003',
              accountId: 'ACC003',
              receiverName: 'Lê Văn C',
              receiverPhone: '0912345678',
              receiverAddress: '789 Trần Hưng Đạo, Q.5',
              city: 'TP.HCM',
              status: 1,
            },
          },
        ],
        totalElements: 3,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false,
      };
    }
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    try {
      const response: AxiosResponse<OrderResponse> = await axiosInstance.get(
        API.GET_ORDER_BY_ID(orderId)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: number): Promise<OrderResponse> => {
    try {
      const response: AxiosResponse<OrderResponse> = await axiosInstance.put(
        `${API.UPDATE_ORDER_STATUS(orderId)}?status=${status}`
      );
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Filter orders by status
  filterOrdersByStatus: async (
    status: number,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<OrderResponse>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<OrderResponse>> = await axiosInstance.get(
        `${API.FILTER_ORDERS_BY_STATUS}?status=${status}&page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error('Error filtering orders by status:', error);
      throw error;
    }
  },

  // Search orders
  searchOrders: async (
    keyword: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<OrderResponse>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<OrderResponse>> = await axiosInstance.get(
        `${API.SEARCH_ORDERS}?keyword=${keyword}&page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching orders:', error);
      throw error;
    }
  },

  // Get order statistics
  getOrderStats: async (): Promise<FastFoodOrderStats> => {
    try {
      const allOrders = await fastfoodOrderService.getAllOrders(0, 1000);
      const orders = allOrders.content;

      return {
        total: orders.length,
        pending: orders.filter(o => o.status === 0).length,
        processing: orders.filter(o => o.status === 1).length,
        shipping: orders.filter(o => o.status === 1 && o.shipping?.status === 2).length,
        completed: orders.filter(o => o.status === 2).length,
        cancelled: orders.filter(o => o.status === 0).length,
      };
    } catch (error) {
      console.warn('⚠️ Backend API not available, using mock stats for orders');
      // Mock stats for development
      return {
        total: 125,
        pending: 15,
        processing: 25,
        shipping: 32,
        completed: 78,
        cancelled: 10,
      };
    }
  },

  // Confirm order (admin)
  confirmOrder: async (orderId: string): Promise<OrderResponse> => {
    try {
      const response: AxiosResponse<OrderResponse> = await axiosInstance.put(
        API.CONFIRM_ORDER(orderId)
      );
      return response.data;
    } catch (error) {
      console.error('Error confirming order:', error);
      throw error;
    }
  },

  // Start delivery (admin)
  startDelivery: async (orderId: string): Promise<OrderResponse> => {
    try {
      const response: AxiosResponse<OrderResponse> = await axiosInstance.put(
        API.START_DELIVERY(orderId)
      );
      return response.data;
    } catch (error) {
      console.error('Error starting delivery:', error);
      throw error;
    }
  },

  // Get orders by date range
  getOrdersByDateRange: async (
    startDate: string,
    endDate: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<OrderResponse>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<OrderResponse>> = await axiosInstance.get(
        `${API.FILTER_ORDERS_BY_DATE}?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by date range:', error);
      throw error;
    }
  },

  // Get order details
  getOrderDetails: async (orderId: string) => {
    try {
      const response = await axiosInstance.get(API.GET_ORDER_DETAILS(orderId));
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },
};

export default fastfoodOrderService;
