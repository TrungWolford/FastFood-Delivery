import axiosInstance from '../libs/axios';
import { API } from '../config/constants';

// ===========================
// Constants
// ===========================

/**
 * Order Status Constants
 */
export const ORDER_STATUS = {
  PENDING: 'PENDING' as const,        // Chờ xác nhận
  CONFIRMED: 'CONFIRMED' as const,    // Đã xác nhận
  PREPARING: 'PREPARING' as const,    // Đang chuẩn bị
  SHIPPING: 'SHIPPING' as const,      // Đang giao hàng
  DELIVERED: 'DELIVERED' as const,    // Hoàn thành
  CANCELLED: 'CANCELLED' as const,    // Đã hủy
} as const;

/**
 * Order Status Labels - tiếng Việt
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao hàng',
  DELIVERED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

/**
 * Order Status Colors - cho UI
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PREPARING: 'processing',
  SHIPPING: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

// ===========================
// Type Definitions
// ===========================

/**
 * Order Status Type - sử dụng constants từ ORDER_STATUS
 */
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

/**
 * Order Status Number - giá trị số từ backend (nếu cần convert)
 */
export type OrderStatusNumber = 0 | 1 | 2 | 3 | 4;

// New Order Response from MongoDB backend (NEW structure)
export interface OrderItem {
  itemId: string;
  name?: string;        // Tên món ăn (từ backend)
  itemName?: string;    // Alias cho backward compatibility
  imageUrl?: string;    // URL hình ảnh
  quantity: number;
  price: number;
  subTotal?: number;
  note?: string;
}

export interface OrderResponseNew {
  orderId: string;
  customerId: string;
  restaurantId: string;
  receiverName: string;
  receiverEmail?: string;
  receiverPhone: string;
  deliveryAddress: string;
  ward: string; // Phường (sau sáp nhập hành chính 2025)
  city: string; // Thành phố (sau sáp nhập hành chính 2025)
  orderNote?: string;
  shippingFee: number;
  totalPrice: number;
  finalAmount: number;
  orderItems: OrderItem[];
  status: string; // PENDING, CONFIRMED, DELIVERING, COMPLETED, CANCELLED
  createdAt: string;
  updatedAt: string;
  paymentExpiresAt?: string;
}

/**
 * Order Item (matches MongoDB backend OrderItem)
 */
export interface OrderItemResponse {
  orderItemId: string;
  itemId: string; // menuItemId
  name: string;
  price: number;
  quantity: number;
  subTotal: number;
  imageUrl?: string; // URL ảnh món ăn
}

/**
 * Order Response (matches MongoDB backend OrderResponse)
 */
export interface OrderResponse {
  orderId: string;
  customerId: string;
  restaurantId: string;
  
  // Thông tin người nhận
  receiverName: string;
  receiverEmail?: string;
  receiverPhone: string;
  deliveryAddress: string;
  ward: string; // Phường/Xã
  city: string; // Thành phố
  
  // Tọa độ khách hàng
  customerLatitude?: number;
  customerLongitude?: number;
  
  // Thông tin đơn hàng
  orderNote?: string;
  shippingFee: number;
  totalPrice: number; // Tổng tiền hàng
  finalAmount: number; // Tổng tiền cuối cùng (totalPrice + shippingFee)
  
  orderItems: OrderItemResponse[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paymentExpiresAt?: string; // Thời gian hết hạn thanh toán
}

// Request để tạo order mới - Sau sáp nhập hành chính 2025
export interface CreateOrderRequest {
  customerId: string;
  restaurantId: string;
  receiverName: string;
  receiverEmail?: string;
  receiverPhone: string;
  deliveryAddress: string;
  ward: string; // Phường/Xã (sau sáp nhập)
  city: string; // Thành phố (sau sáp nhập)
  customerLatitude?: number; // Tọa độ từ OpenStreetMap
  customerLongitude?: number;
  orderNote?: string;
  shippingFee?: number;
  orderItems: Array<{
    itemId: string;
    quantity: number;
    note?: string;
  }>;
}

/**
 * Update Order Request (matches MongoDB backend UpdateOrderRequest)
 */
export interface UpdateOrderRequest {
  // Thông tin người nhận
  receiverName?: string;
  receiverEmail?: string;
  receiverPhone?: string;
  deliveryAddress?: string;
  ward?: string;
  city?: string;
  customerLatitude?: number;
  customerLongitude?: number;
  
  // Thông tin đơn hàng
  orderNote?: string;
  shippingFee?: number;
  status?: OrderStatus;
}

/**
 * Paginated Response from Spring Backend
 */
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

/**
 * Service Response Wrapper
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  totalPages?: number;
  totalElements?: number;
}

// ===========================
// Helper Functions
// ===========================

/**
 * Convert date from backend to ISO string
 * Backend có thể trả về date ở nhiều format:
 * - ISO string: "2024-11-15T10:30:00Z"
 * - dd/MM/yyyy format: "15/11/2024" (from @JsonFormat)
 * - Array: [2024, 11, 15, 10, 30, 0]
 * - LocalDateTime object: { year: 2024, month: 11, day: 15, hour: 10, minute: 30, second: 0 }
 */
const convertDateToISO = (dateValue: any): string => {
  if (!dateValue) return new Date().toISOString();

  // If it's a string
  if (typeof dateValue === 'string') {
    // Check if it's dd/MM/yyyy format (from @JsonFormat in backend)
    const ddMMyyyyPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateValue.match(ddMMyyyyPattern);

    if (match) {
      const [, day, month, year] = match;
      // JavaScript Date expects: year, month (0-indexed), day
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toISOString();
    }

    // Check if it's dd/MM/yyyy HH:mm format
    const ddMMyyyyHHmmPattern = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/;
    const matchWithTime = dateValue.match(ddMMyyyyHHmmPattern);

    if (matchWithTime) {
      const [, day, month, year, hour, minute] = matchWithTime;
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );
      return date.toISOString();
    }

    // If it's already ISO format or other standard format, return as is
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (e) {
      console.warn('Failed to parse date string:', dateValue);
    }

    return dateValue;
  }

  // If it's an array [year, month, day, hour, minute, second, nano]
  if (Array.isArray(dateValue)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    // Note: month in JavaScript Date is 0-indexed, but from backend it's 1-indexed
    return new Date(year, month - 1, day, hour, minute, second).toISOString();
  }

  // If it's an object with year, month, day properties
  if (typeof dateValue === 'object' && 'year' in dateValue) {
    const { year, monthValue, dayOfMonth, hour = 0, minute = 0, second = 0 } = dateValue;
    return new Date(year, (monthValue || dateValue.month) - 1, dayOfMonth || dateValue.day, hour, minute, second).toISOString();
  }

  // Fallback: try to parse as Date
  try {
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (e) {
    console.warn('Failed to parse date:', dateValue);
  }

  return new Date().toISOString();
};

/**
 * Transform order response from backend to frontend format
 * Converts date fields from backend format to ISO strings
 */
const transformOrderResponse = (order: any): OrderResponse => {
  console.log('🔄 Transforming order response:', {
    orderId: order.orderId,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    createdAtType: typeof order.createdAt,
    updatedAtType: typeof order.updatedAt
  });

  const transformed = {
    ...order,
    createdAt: convertDateToISO(order.createdAt),
    updatedAt: convertDateToISO(order.updatedAt),
  };

  console.log('✅ Transformed dates:', {
    createdAt: transformed.createdAt,
    updatedAt: transformed.updatedAt
  });

  return transformed;
};

/**
 * Get order status label (Vietnamese)
 */
export const getOrderStatusLabel = (status: OrderStatus): string => {
  return ORDER_STATUS_LABELS[status] || 'Không xác định';
};

/**
 * Get order status color for UI
 */
export const getOrderStatusColor = (status: OrderStatus): string => {
  return ORDER_STATUS_COLORS[status] || 'default';
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (status: OrderStatus): boolean => {
  return status === ORDER_STATUS.PENDING || status === ORDER_STATUS.CONFIRMED;
};

/**
 * Check if order can be confirmed
 */
export const canConfirmOrder = (status: OrderStatus): boolean => {
  return status === ORDER_STATUS.PENDING;
};

/**
 * Check if order can start preparing
 */
export const canStartPreparing = (status: OrderStatus): boolean => {
  return status === ORDER_STATUS.CONFIRMED;
};

/**
 * Check if order can start delivery
 */
export const canStartDelivery = (status: OrderStatus): boolean => {
  return status === ORDER_STATUS.PREPARING;
};

/**
 * Check if order can be completed
 */
export const canCompleteOrder = (status: OrderStatus): boolean => {
  return status === ORDER_STATUS.SHIPPING;
};

/**
 * Get next possible order statuses
 */
export const getNextOrderStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  switch (currentStatus) {
    case ORDER_STATUS.PENDING:
      return [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED];
    case ORDER_STATUS.CONFIRMED:
      return [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED];
    case ORDER_STATUS.PREPARING:
      return [ORDER_STATUS.SHIPPING];
    case ORDER_STATUS.SHIPPING:
      return [ORDER_STATUS.DELIVERED];
    case ORDER_STATUS.DELIVERED:
    case ORDER_STATUS.CANCELLED:
      return [];
    default:
      return [];
  }
};

/**
 * Validate order status transition
 */
export const isValidStatusTransition = (
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean => {
  const nextStatuses = getNextOrderStatuses(currentStatus);
  return nextStatuses.includes(newStatus);
};

// ===========================
// Order Service
// ===========================

export const orderService = {
  /**
   * Get all orders (Admin only - with pagination)
   * Backend: GET /api/orders?page=0&size=10
   */
  getAllOrders: async (
    page: number = 0,
    size: number = 10
  ): Promise<ServiceResponse<OrderResponse[]>> => {
    try {
      console.log('📦 Fetching orders from API...');

      const response = await axiosInstance.get<PageResponse<OrderResponse>>(API.GET_ALL_ORDERS, {
        params: { page, size },
      });

      console.log('✅ Orders fetched successfully:', response.data);

      // Transform date fields from backend format to ISO strings
      const transformedOrders = response.data.content.map(transformOrderResponse);

      return {
        success: true,
        data: transformedOrders,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      };
    } catch (error: any) {
      console.error('❌ Error getting all orders:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Không thể tải danh sách đơn hàng',
      };
    }
  },

  /**
   * Get order by ID
   * Backend: GET /api/orders/{orderId}
   */
  // getOrderById: async (orderId: string): Promise<ServiceResponse<OrderResponse>> => {
  //   try {
  //     console.log('📦 Fetching order by ID from API:', orderId);

  //     const response = await axiosInstance.get<OrderResponse>(API.GET_ORDER_BY_ID(orderId));

  //     console.log('✅ Order fetched successfully:', response.data);

  //     return {
  //       success: true,
  //       data: transformOrderResponse(response.data),
  //     };
  //   } catch (error: any) {
  //     console.error('❌ Error getting order by ID:', error);
  //     return {
  //       success: false,
  //       message: error.response?.data?.message || 'Không thể tải đơn hàng',
  //     };
  //   }
  // },

  /**
   * Get orders by customer ID (with pagination)
   * Backend: GET /api/orders/user/{customerId}?page=0&size=10
   */
  getOrdersByCustomerId: async (
    customerId: string,
    page: number = 0,
    size: number = 10
  ): Promise<ServiceResponse<OrderResponse[]>> => {
    try {
      const response = await axiosInstance.get<PageResponse<OrderResponse>>(
        API.GET_ORDERS_BY_CUSTOMER(customerId),
        {
          params: { page, size },
        }
      );

      return {
        success: true,
        data: response.data.content.map(transformOrderResponse),
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      };
    } catch (error: any) {
      console.error('❌ Error getting orders by customer:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Không thể tải đơn hàng',
      };
    }
  },

  /**
   * Get orders by restaurant ID (with pagination)
   * Backend: GET /api/orders/restaurant/{restaurantId}?page=0&size=10
   */
  getOrdersByRestaurantId: async (
    restaurantId: string,
    page: number = 0,
    size: number = 10
  ): Promise<ServiceResponse<OrderResponse[]>> => {
    try {
      const response = await axiosInstance.get<PageResponse<OrderResponse>>(
        API.GET_ORDERS_BY_RESTAURANT(restaurantId),
        {
          params: { page, size },
        }
      );

      return {
        success: true,
        data: response.data.content.map(transformOrderResponse),
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      };
    } catch (error: any) {
      console.error('❌ Error getting orders by restaurant:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Không thể tải đơn hàng',
      };
    }
  },

  /**
   * Get order items by order ID
   * Backend: GET /api/orders/{orderId}/items
   */
  getOrderItemsByOrderId: async (orderId: string): Promise<ServiceResponse<OrderItemResponse[]>> => {
    try {
      const response = await axiosInstance.get<OrderItemResponse[]>(API.GET_ORDER_ITEMS(orderId));

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ Error getting order items:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Không thể tải danh sách món trong đơn hàng',
      };
    }
  },

  /**
   * Create new order
   * Backend: POST /api/orders
   */
  createOrder: async (request: CreateOrderRequest): Promise<ServiceResponse<OrderResponse>> => {
    try {
      console.log('📦 Creating order with request:', request);

      const response = await axiosInstance.post<OrderResponse>(API.CREATE_ORDER, request);

      console.log('✅ Order created successfully:', response.data);

      return {
        success: true,
        data: transformOrderResponse(response.data),
        message: 'Đơn hàng đã được tạo thành công',
      };
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tạo đơn hàng',
      };
    }
  },

  /**
   * Update order (deliveryAddress, status)
   * Backend: PATCH /api/orders/{orderId}
   */
  updateOrder: async (
    orderId: string,
    request: UpdateOrderRequest
  ): Promise<ServiceResponse<OrderResponse>> => {
    try {
      console.log('🔄 Updating order:', orderId, request);

      // Validate status transition if status is being updated
      if (request.status) {
        const currentOrder = await orderService.getOrderById(orderId);
        if (currentOrder.success && currentOrder.data) {
          const currentStatus = currentOrder.data.status as OrderStatus;
          const isValid = isValidStatusTransition(currentStatus, request.status);
          if (!isValid) {
            console.warn('⚠️ Invalid status transition:', {
              from: currentStatus,
              to: request.status,
            });
            return {
              success: false,
              message: `Không thể chuyển trạng thái từ ${getOrderStatusLabel(currentStatus)} sang ${getOrderStatusLabel(request.status)}`,
            };
          }
        }
      }

      const response = await axiosInstance.patch<OrderResponse>(
        API.UPDATE_ORDER(orderId),
        request
      );

      console.log('✅ Order updated successfully:', response.data);

      return {
        success: true,
        data: transformOrderResponse(response.data),
        message: 'Đơn hàng đã được cập nhật thành công',
      };
    } catch (error: any) {
      console.error('❌ Error updating order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật đơn hàng',
      };
    }
  },

  /**
   * Cancel order
   * Backend: PATCH /api/orders/{orderId}/cancel
   */
  cancelOrder: async (orderId: string): Promise<ServiceResponse<void>> => {
    try {
      console.log('🚫 Cancelling order:', orderId);

      await axiosInstance.patch(API.CANCEL_ORDER(orderId));

      console.log('✅ Order cancelled successfully');

      return {
        success: true,
        message: 'Đã hủy đơn hàng thành công',
      };
    } catch (error: any) {
      console.error('❌ Error cancelling order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể hủy đơn hàng',
      };
    }
  },

  // ===========================
  // Convenience Methods (using updateOrder under the hood)
  // ===========================

  /**
   * Confirm order (Admin: PENDING -> CONFIRMED)
   */
  confirmOrder: async (orderId: string): Promise<ServiceResponse<OrderResponse>> => {
    try {
      console.log('✅ Confirming order:', orderId);
      return await orderService.updateOrder(orderId, { status: 'CONFIRMED' });
    } catch (error: any) {
      console.error('❌ Error confirming order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể xác nhận đơn hàng',
      };
    }
  },

  /**
   * Start preparing (Admin: CONFIRMED -> PREPARING)
   */
  startPreparing: async (orderId: string): Promise<ServiceResponse<OrderResponse>> => {
    try {
      console.log('🍳 Starting prepare:', orderId);
      return await orderService.updateOrder(orderId, { status: 'PREPARING' });
    } catch (error: any) {
      console.error('❌ Error starting preparation:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể bắt đầu chuẩn bị',
      };
    }
  },

  /**
   * Start delivery (Admin: PREPARING -> SHIPPING)
   */
  startDelivery: async (orderId: string): Promise<ServiceResponse<OrderResponse>> => {
    return orderService.updateOrder(orderId, { status: 'SHIPPING' });
  },

  /**
   * Assign drone to order and start delivery (Admin: PREPARING -> SHIPPING)
   * Note: droneId is managed by Shipping/Delivery entity, not Order entity
   */
  assignDroneAndStartDelivery: async (
    orderId: string,
    droneId: string
  ): Promise<ServiceResponse<OrderResponse>> => {
    try {
      console.log('🚁 Assigning drone and starting delivery:', { orderId, droneId });

      // Just update order status to SHIPPING
      // DroneId should be assigned in Shipping/Delivery creation
      return await orderService.updateOrder(orderId, {
        status: 'SHIPPING'
      });
    } catch (error: any) {
      console.error('❌ Error assigning drone:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể giao nhiệm vụ cho drone',
      };
    }
  },

  /**
   * Complete order (Admin/Customer: SHIPPING -> DELIVERED)
   */
  completeOrder: async (orderId: string): Promise<ServiceResponse<OrderResponse>> => {
    try {
      console.log('✅ Completing order:', orderId);
      return await orderService.updateOrder(orderId, { status: 'DELIVERED' });
    } catch (error: any) {
      console.error('❌ Error completing order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể hoàn thành đơn hàng',
      };
    }
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus
  ): Promise<ServiceResponse<OrderResponse>> => {
    return orderService.updateOrder(orderId, { status });
  },

  // ===========================
  // Query & Filter Methods
  // ===========================

  /**
   * Get orders by status
   * @param status - Order status to filter by
   * @param page - Page number (default: 0)
   * @param size - Page size (default: 10)
   */
  getOrdersByStatus: async (
    status: OrderStatus,
    page: number = 0,
    size: number = 10
  ): Promise<ServiceResponse<OrderResponse[]>> => {
    try {
      const response = await axiosInstance.get<PageResponse<OrderResponse>>(
        API.GET_ALL_ORDERS,
        {
          params: { status, page, size },
        }
      );

      return {
        success: true,
        data: response.data.content.map(transformOrderResponse),
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      };
    } catch (error: any) {
      console.error('❌ Error getting orders by status:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Không thể tải danh sách đơn hàng',
      };
    }
  },

  // Get orders by account ID - Returns NEW structure
  getOrdersByAccount: async (accountId: string): Promise<{ success: boolean; data?: OrderResponseNew[]; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_ORDERS_BY_ACCOUNT(accountId));
      // Backend returns paginated response: { content: [...], totalElements, totalPages, ... }
      const orders: OrderResponseNew[] = Array.isArray(response.data)
        ? response.data
        : response.data?.content || [];

      return {
        success: true,
        data: orders
      };
    } catch {
      return {
        success: false,
        message: 'Không thể tải đơn hàng'
      };
    }
  },
  /**
   * Search orders by order number or customer info
   */
  searchOrders: async (
    keyword: string,
    page: number = 0,
    size: number = 10
  ): Promise<ServiceResponse<OrderResponse[]>> => {
    try {
      const response = await axiosInstance.get<PageResponse<OrderResponse>>(
        API.GET_ALL_ORDERS,
        {
          params: { keyword, page, size },
        }
      );

      return {
        success: true,
        data: response.data.content.map(transformOrderResponse),
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      };
    } catch (error: any) {
      console.error('❌ Error searching orders:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Không thể tìm kiếm đơn hàng',
      };
    }
  },

  // Get order by ID - Returns NEW structure  
  getOrderById: async (orderId: string): Promise<{ success: boolean; data?: OrderResponseNew; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_ORDER_BY_ID(orderId));
      return {
        success: true,
        data: response.data
      };
    } catch {
      return {
        success: false,
        message: 'Không thể tải đơn hàng'
      };
    }
  },
  /**
   * Get orders with multiple filters
   */
  filterOrders: async (filters: {
    status?: OrderStatus;
    customerId?: string;
    restaurantId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<ServiceResponse<OrderResponse[]>> => {
    try {
      const { page = 0, size = 10, ...otherFilters } = filters;

      const response = await axiosInstance.get<PageResponse<OrderResponse>>(
        API.GET_ALL_ORDERS,
        {
          params: { ...otherFilters, page, size },
        }
      );

      return {
        success: true,
        data: response.data.content.map(transformOrderResponse),
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      };
    } catch (error: any) {
      console.error('❌ Error filtering orders:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Không thể lọc đơn hàng',
};
    }
  },

// ===========================
// Statistics Methods
// ===========================

/**
 * Get order statistics
 */
getOrderStatistics: async (filters?: {
  startDate?: string;
  endDate?: string;
  restaurantId?: string;
}): Promise<ServiceResponse<{
  total: number;
  pending: number;
  confirmed: number;
  shipping: number;
  delivered: number;
  cancelled: number;
  revenue: number;
}>> => {
  try {
    const response = await axiosInstance.get('/orders/statistics', {
      params: filters,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('❌ Error getting order statistics:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể tải thống kê đơn hàng',
    };
  }
},

  // ===========================
  // Legacy/Compatibility Methods (for backward compatibility)
  // ===========================

  /**
   * Get orders by account ID (alias for getOrdersByCustomerId)
   * @deprecated Use getOrdersByCustomerId instead
   */
  // getOrdersByAccount: async (
  //   accountId: string,
  //   page: number = 0,
  //   size: number = 10
  // ): Promise<ServiceResponse<OrderResponse[]>> => {
  //   return orderService.getOrdersByCustomerId(accountId, page, size);
  // },
};

export default orderService;
