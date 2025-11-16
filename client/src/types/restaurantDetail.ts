// Restaurant Detail Types - Based on Backend RestaurantDetail entity

/**
 * RestaurantDetail entity from Backend
 */
export interface RestaurantDetail {
  restaurantDetailId: string;
  restaurantId: string;
  openingHours: string;           // Format: "06:00-23:00"
  restaurantTypes: string[];      // Max 2 items (e.g., ["Phở", "Cơm Tấm"])
  cuisines: string[];             // (e.g., ["Châu Á", "Việt Nam"])
  specialties: string[];          // Max 3 items (e.g., ["Phở Bò", "Cơm Tấm Sướn"])
  description: string;            // Long text description
  coverImage: string;             // Banner image URL
  menuImages: string[];           // Menu photo URLs
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Response from Backend - RestaurantDetailResponse.java
 */
export interface RestaurantDetailResponse {
  restaurantDetailId: string;
  restaurantId: string;
  openingHours: string;
  restaurantTypes: string[];
  cuisines: string[];
  specialties: string[];
  description: string;
  coverImage: string;
  menuImages: string[];
  createdAt: string;              // Format: "dd/MM/yyyy HH:mm:ss"
  updatedAt: string;              // Format: "dd/MM/yyyy HH:mm:ss"
}

/**
 * Create Restaurant Detail Request - CreateRestaurantDetailRequest.java
 */
export interface CreateRestaurantDetailRequest {
  openingHours: string;
  restaurantTypes: string[];
  cuisines: string[];
  specialties: string[];
  description: string;
  coverImage: string;
  menuImages: string[];
}

/**
 * Update Restaurant Detail Request - UpdateRestaurantDetailRequest.java
 */
export interface UpdateRestaurantDetailRequest {
  openingHours?: string;
  restaurantTypes?: string[];
  cuisines?: string[];
  specialties?: string[];
  description?: string;
  coverImage?: string;
  menuImages?: string[];
}

/**
 * Common cuisine options for Vietnam
 */
export const CUISINE_OPTIONS = [
  'Châu Á',
  'Việt Nam',
  'Trung Quốc',
  'Nhật Bản',
  'Hàn Quốc',
  'Thái Lan',
  'Âu Mỹ',
  'Ý',
  'Pháp',
  'Fusion',
] as const;

/**
 * Common restaurant types
 */
export const RESTAURANT_TYPE_OPTIONS = [
  'Phở',
  'Cơm Tấm',
  'Bún',
  'Bánh Mì',
  'Gỏi Cuốn',
  'Lẩu',
  'Nướng',
  'Hải Sản',
  'Chay',
  'Ăn Vặt',
  'Quán Nhậu',
  'Café',
  'Trà Sữa',
  'Tráng Miệng',
  'Fastfood',
] as const;

/**
 * Helper function to format opening hours
 */
export const formatOpeningHours = (hours: string): string => {
  if (!hours) return 'Chưa cập nhật';
  return hours; // Format: "06:00-23:00"
};

/**
 * Helper function to parse opening hours
 */
export const parseOpeningHours = (hours: string): { open: string; close: string } | null => {
  if (!hours || !hours.includes('-')) return null;
  const [open, close] = hours.split('-');
  return { open: open.trim(), close: close.trim() };
};

/**
 * Validation rules
 */
export const RESTAURANT_DETAIL_VALIDATION = {
  restaurantTypes: {
    min: 1,
    max: 2,
    message: 'Chọn từ 1-2 loại hình nhà hàng'
  },
  specialties: {
    min: 1,
    max: 3,
    message: 'Chọn từ 1-3 món đặc trưng'
  },
  cuisines: {
    min: 1,
    max: 5,
    message: 'Chọn ít nhất 1 ẩm thực'
  },
  description: {
    min: 50,
    max: 1000,
    message: 'Mô tả từ 50-1000 ký tự'
  },
  openingHours: {
    pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    message: 'Định dạng giờ: HH:mm-HH:mm (VD: 06:00-23:00)'
  }
} as const;

/**
 * Default values for creating restaurant detail
 */
export const DEFAULT_RESTAURANT_DETAIL: Partial<CreateRestaurantDetailRequest> = {
  openingHours: '08:00-22:00',
  restaurantTypes: [],
  cuisines: [],
  specialties: [],
  description: '',
  coverImage: '',
  menuImages: []
};

/**
 * Type guard to check if restaurant detail is complete
 */
export const isRestaurantDetailComplete = (detail: Partial<RestaurantDetailResponse>): detail is RestaurantDetailResponse => {
  return !!(
    detail.restaurantDetailId &&
    detail.restaurantId &&
    detail.openingHours &&
    detail.restaurantTypes && detail.restaurantTypes.length > 0 &&
    detail.cuisines && detail.cuisines.length > 0 &&
    detail.description
  );
}

/**
 * API Response wrapper
 */
export interface RestaurantDetailApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Validate opening hours format
 */
export const validateOpeningHours = (hours: string): boolean => {
  return RESTAURANT_DETAIL_VALIDATION.openingHours.pattern.test(hours);
};

/**
 * Validate restaurant types count
 */
export const validateRestaurantTypes = (types: string[]): boolean => {
  const { min, max } = RESTAURANT_DETAIL_VALIDATION.restaurantTypes;
  return types.length >= min && types.length <= max;
};

/**
 * Validate specialties count
 */
export const validateSpecialties = (specialties: string[]): boolean => {
  const { min, max } = RESTAURANT_DETAIL_VALIDATION.specialties;
  return specialties.length >= min && specialties.length <= max;
};

/**
 * Validate cuisines count
 */
export const validateCuisines = (cuisines: string[]): boolean => {
  const { min } = RESTAURANT_DETAIL_VALIDATION.cuisines;
  return cuisines.length >= min;
};

/**
 * Validate description length
 */
export const validateDescription = (description: string): boolean => {
  const { min, max } = RESTAURANT_DETAIL_VALIDATION.description;
  const length = description.trim().length;
  return length >= min && length <= max;
};

/**
 * Validate create restaurant detail request
 */
export const validateCreateRestaurantDetailRequest = (
  request: CreateRestaurantDetailRequest
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!request.openingHours || !validateOpeningHours(request.openingHours)) {
    errors.push(RESTAURANT_DETAIL_VALIDATION.openingHours.message);
  }

  if (!validateRestaurantTypes(request.restaurantTypes)) {
    errors.push(RESTAURANT_DETAIL_VALIDATION.restaurantTypes.message);
  }

  if (!validateCuisines(request.cuisines)) {
    errors.push(RESTAURANT_DETAIL_VALIDATION.cuisines.message);
  }

  if (!validateSpecialties(request.specialties)) {
    errors.push(RESTAURANT_DETAIL_VALIDATION.specialties.message);
  }

  if (!request.description || !validateDescription(request.description)) {
    errors.push(RESTAURANT_DETAIL_VALIDATION.description.message);
  }

  if (!request.coverImage || request.coverImage.trim().length === 0) {
    errors.push('Ảnh bìa không được để trống');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate update restaurant detail request
 */
export const validateUpdateRestaurantDetailRequest = (
  request: UpdateRestaurantDetailRequest
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (request.openingHours !== undefined && !validateOpeningHours(request.openingHours)) {
    errors.push(RESTAURANT_DETAIL_VALIDATION.openingHours.message);
  }

  if (request.restaurantTypes !== undefined && !validateRestaurantTypes(request.restaurantTypes)) {
    errors.push(RESTAURANT_DETAIL_VALIDATION.restaurantTypes.message);
  }

  if (request.cuisines !== undefined && !validateCuisines(request.cuisines)) {
    errors.push(RESTAURANT_DETAIL_VALIDATION.cuisines.message);
  }

  if (request.specialties !== undefined && !validateSpecialties(request.specialties)) {
    errors.push(RESTAURANT_DETAIL_VALIDATION.specialties.message);
  }

  if (request.description !== undefined && !validateDescription(request.description)) {
    errors.push(RESTAURANT_DETAIL_VALIDATION.description.message);
  }

  if (request.coverImage !== undefined && request.coverImage.trim().length === 0) {
    errors.push('Ảnh bìa không được để trống');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create empty restaurant detail request with defaults
 */
export const createEmptyRestaurantDetailRequest = (): CreateRestaurantDetailRequest => ({
  ...DEFAULT_RESTAURANT_DETAIL as CreateRestaurantDetailRequest
});
