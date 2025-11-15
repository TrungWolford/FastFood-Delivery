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
      // Mock data for development - aligned with backend structure
      return {
        content: [
          {
            droneId: '673726c8e5f123456789abc1',
            restaurantId: restaurantId,
            model: 'DJI Mavic 3',
            capacity: 10.5,
            battery: 95,
            status: 'AVAILABLE',
            createdAt: new Date().toISOString(),
          },
          {
            droneId: '673726c8e5f123456789abc2',
            restaurantId: restaurantId,
            model: 'DJI Mini 3 Pro',
            capacity: 8.0,
            battery: 65,
            status: 'IN_USE',
            createdAt: new Date().toISOString(),
          },
          {
            droneId: '673726c8e5f123456789abc3',
            restaurantId: restaurantId,
            model: 'DJI Air 2S',
            capacity: 12.0,
            battery: 30,
            status: 'MAINTENANCE',
            createdAt: new Date().toISOString(),
          },
        ],
        totalElements: 3,
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
