// Shipping types based on Delivery entity from Backend

// LocationPoint interface matching Backend
export interface LocationPoint {
  latitude: number;
  longitude: number;
}

export interface Shipping {
  deliveryId: string;
  droneId: string;
  orderId: string;
  startLocation: LocationPoint;
  endLocation: LocationPoint;
  status: ShippingStatus;
  deliveredAt: string | Date;
  statusText?: string;
}

export const ShippingStatus = {
  CANCELLED: -1,
  PENDING: 0,
  DELIVERING: 1,
  DELIVERED: 2,
} as const;

export type ShippingStatus = typeof ShippingStatus[keyof typeof ShippingStatus];

export const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  [ShippingStatus.CANCELLED]: 'Đã hủy',
  [ShippingStatus.PENDING]: 'Chờ xử lý',
  [ShippingStatus.DELIVERING]: 'Đang giao',
  [ShippingStatus.DELIVERED]: 'Đã giao hàng',
};

export const SHIPPING_STATUS_COLORS: Record<ShippingStatus, string> = {
  [ShippingStatus.CANCELLED]: 'bg-red-600',
  [ShippingStatus.PENDING]: 'bg-yellow-600',
  [ShippingStatus.DELIVERING]: 'bg-blue-600',
  [ShippingStatus.DELIVERED]: 'bg-green-600',
};

// Request types
export interface CreateShippingRequest {
  droneId: string;
  orderId: string;
  startLocation: LocationPoint;
  endLocation: LocationPoint;
  status: ShippingStatus;
  deliveredAt?: string | Date;
}

export interface UpdateShippingRequest {
  orderId?: string;
  startLocation?: LocationPoint;
  endLocation?: LocationPoint;
  status?: ShippingStatus;
}

export interface UpdateShippingStatusRequest {
  status: ShippingStatus;
}

// Response type
export interface ShippingResponse extends Shipping {
  statusText: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
