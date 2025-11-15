import axiosInstance from '../libs/axios';
import type { AxiosResponse } from 'axios';
import { API } from '../config/constants';
import type { 
  Drone, 
  CreateDroneRequest, 
  UpdateDroneRequest,
  PaginatedResponse 
} from '../types/fastfood';

/**
 * Drone Service - Aligned with DroneController.java
 * 
 * Available endpoints:
 * - GET /api/drones/restaurant/{restaurantId}?page=0&size=10
 * - GET /api/drones/{droneId}
 * - POST /api/drones
 * - PUT /api/drones/{droneId}
 * - PATCH /api/drones/{droneId}/status
 */
export const droneService = {
  /**
   * Get all drones by restaurant with pagination
   * GET /api/drones/restaurant/{restaurantId}?page=0&size=10
   */
  getDronesByRestaurant: async (
    restaurantId: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<Drone>> => {
    try {
      const response: AxiosResponse<PaginatedResponse<Drone>> = await axiosInstance.get(
        `${API.GET_ALL_DRONES_BY_RESTAURANT(restaurantId)}?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching drones by restaurant:', error);
      // Mock data for development
      return {
        content: [
          {
            droneId: '1',
            droneCode: 'DRONE-001',
            model: 'DJI Mavic 3',
            batteryLevel: 95,
            status: 1,
            restaurantId: restaurantId,
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
            restaurantId: restaurantId,
            restaurantName: 'Chi nhánh 1',
            currentOrderId: 'ORD001',
            currentLocation: 'Đang giao hàng',
            createdAt: new Date().toISOString(),
          },
        ],
        totalElements: 2,
        totalPages: 1,
        size: size,
        number: page,
        first: true,
        last: true,
        empty: false,
      };
    }
  },

  /**
   * Get drone by ID
   * GET /api/drones/{droneId}
   */
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

  /**
   * Create new drone
   * POST /api/drones
   */
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

  /**
   * Update drone
   * PUT /api/drones/{droneId}
   */
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

  /**
   * Change drone status
   * PATCH /api/drones/{droneId}/status
   */
  changeDroneStatus: async (droneId: string): Promise<Drone> => {
    try {
      const response: AxiosResponse<Drone> = await axiosInstance.patch(
        API.CHANGE_DRONE_STATUS(droneId)
      );
      return response.data;
    } catch (error) {
      console.error('Error changing drone status:', error);
      throw error;
    }
  },

  /**
   * @deprecated Use getDronesByRestaurant instead
   * This method is kept for backward compatibility
   */
  getAllDrones: async (page = 0, size = 10): Promise<PaginatedResponse<Drone>> => {
    console.warn('⚠️ getAllDrones is deprecated. Use getDronesByRestaurant instead.');
    // Return empty result since backend doesn't have this endpoint
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: true,
    };
  },
};

export default droneService;
