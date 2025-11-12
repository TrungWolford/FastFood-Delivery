import axiosInstance from '../libs/axios';
import type { AxiosResponse } from 'axios';
import { API } from '../config/constants';
import type { 
  Drone, 
  CreateDroneRequest, 
  UpdateDroneRequest,
  PaginatedResponse 
} from '../types/fastfood';

// Drone Service
export const droneService = {
  // Get all drones with pagination
  getAllDrones: async (page = 0, size = 10): Promise<PaginatedResponse<Drone>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<Drone>> = await axiosInstance.get(
        `${API.GET_ALL_DRONES}?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.warn('⚠️ Backend API not available, using mock data for drones');
      // Mock data for development
      return {
        content: [
          {
            droneId: '1',
            droneCode: 'DRONE-001',
            model: 'DJI Mavic 3',
            batteryLevel: 95,
            status: 1,
            restaurantId: '1',
            restaurantName: 'Chi nhánh 1',
            currentLocation: 'Chi nhánh 1',
            createdAt: new Date().toISOString(),
          },
          {
            droneId: '2',
            droneCode: 'DRONE-002',
            model: 'DJI Mini 3 Pro',
            batteryLevel: 65,
            status: 2,
            restaurantId: '1',
            restaurantName: 'Chi nhánh 1',
            currentOrderId: 'ORD001',
            currentLocation: 'Đang giao hàng',
            createdAt: new Date().toISOString(),
          },
          {
            droneId: '3',
            droneCode: 'DRONE-003',
            model: 'DJI Air 2S',
            batteryLevel: 15,
            status: 0,
            restaurantId: '2',
            restaurantName: 'Chi nhánh 2',
            currentLocation: 'Chi nhánh 2',
            lastMaintenanceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            droneId: '4',
            droneCode: 'DRONE-004',
            model: 'DJI Mavic 3',
            batteryLevel: 88,
            status: 1,
            restaurantId: '2',
            restaurantName: 'Chi nhánh 2',
            currentLocation: 'Chi nhánh 2',
            createdAt: new Date().toISOString(),
          },
          {
            droneId: '5',
            droneCode: 'DRONE-005',
            model: 'DJI Mini 3 Pro',
            batteryLevel: 92,
            status: 1,
            restaurantId: '3',
            restaurantName: 'Chi nhánh 3',
            currentLocation: 'Chi nhánh 3',
            createdAt: new Date().toISOString(),
          },
        ],
        totalElements: 5,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false,
      };
    }
  },

  // Get drone by ID
  getDroneById: async (droneId: string): Promise<Drone> => {
    try {
      const response: AxiosResponse<Drone> = await axiosInstance.get(
        API.GET_DRONE_BY_ID(droneId)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching drone:', error);
      throw error;
    }
  },

  // Create new drone
  createDrone: async (droneData: CreateDroneRequest): Promise<Drone> => {
    try {
      const response: AxiosResponse<Drone> = await axiosInstance.post(
        API.CREATE_DRONE,
        droneData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating drone:', error);
      throw error;
    }
  },

  // Update drone
  updateDrone: async (
    droneId: string,
    droneData: UpdateDroneRequest
  ): Promise<Drone> => {
    try {
      const response: AxiosResponse<Drone> = await axiosInstance.put(
        API.UPDATE_DRONE(droneId),
        droneData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating drone:', error);
      throw error;
    }
  },

  // Delete drone
  deleteDrone: async (droneId: string): Promise<void> => {
    try {
      await axiosInstance.delete(API.DELETE_DRONE(droneId));
    } catch (error) {
      console.error('Error deleting drone:', error);
      throw error;
    }
  },

  // Get drones by status
  getDronesByStatus: async (
    status: number,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<Drone>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<Drone>> = await axiosInstance.get(
        `${API.GET_DRONES_BY_STATUS(status)}?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching drones by status:', error);
      throw error;
    }
  },

  // Get drones by restaurant
  getDronesByRestaurant: async (
    restaurantId: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<Drone>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<Drone>> = await axiosInstance.get(
        `${API.GET_DRONES_BY_RESTAURANT(restaurantId)}?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching drones by restaurant:', error);
      throw error;
    }
  },

  // Update drone battery level
  updateDroneBattery: async (
    droneId: string,
    batteryLevel: number
  ): Promise<Drone> => {
    try {
      const response: AxiosResponse<Drone> = await axiosInstance.patch(
        API.UPDATE_DRONE_BATTERY(droneId),
        { batteryLevel }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating drone battery:', error);
      throw error;
    }
  },

  // Assign order to drone
  assignOrderToDrone: async (
    droneId: string,
    orderId: string
  ): Promise<Drone> => {
    try {
      const response: AxiosResponse<Drone> = await axiosInstance.post(
        API.ASSIGN_ORDER_TO_DRONE(droneId),
        { orderId }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning order to drone:', error);
      throw error;
    }
  },

  // Search drones
  searchDrones: async (
    keyword: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<Drone>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<Drone>> = await axiosInstance.get(
        `${API.SEARCH_DRONES}?keyword=${keyword}&page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching drones:', error);
      throw error;
    }
  },

  // Get drone statistics
  getDroneStats: async () => {
    try {
      const allDrones = await droneService.getAllDrones(0, 1000);
      const drones = allDrones.content;
      
      return {
        total: drones.length,
        active: drones.filter(d => d.status === 1).length,
        delivering: drones.filter(d => d.status === 2).length,
        maintenance: drones.filter(d => d.status === 0).length,
        averageBattery: Math.round(
          drones.reduce((sum, d) => sum + d.batteryLevel, 0) / drones.length
        ),
      };
    } catch (error) {
      console.warn('⚠️ Backend API not available, using mock stats for drones');
      // Mock stats
      return {
        total: 24,
        active: 18,
        delivering: 5,
        maintenance: 1,
        averageBattery: 75,
      };
    }
  },
};

export default droneService;
