// Debug: Log environment variables
console.log('🔍 Environment Variables Debug:');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_WS_URL:', import.meta.env.VITE_WS_URL);
console.log('VITE_DEBUG_API_CALLS:', import.meta.env.VITE_DEBUG_API_CALLS);
console.log('VITE_APP_NAME:', import.meta.env.VITE_APP_NAME);
console.log('VITE_APP_VERSION:', import.meta.env.VITE_APP_VERSION);
console.log('---');

export const CONFIG = {
  API_GATEWAY: (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080") + "/api",
  WS_ENDPOINT: import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws",
};

// Debug log để kiểm tra
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Debug: Log final config values
console.log('🔧 Final Config Values:');
console.log('CONFIG.API_GATEWAY:', CONFIG.API_GATEWAY);
console.log('CONFIG.WS_ENDPOINT:', CONFIG.WS_ENDPOINT);
console.log('API_URL:', API_URL);
console.log('---');

export const API = {
  // Accounts - Theo AccountController.java
  GET_ALL_ACCOUNTS: '/account', // GET /api/account?page=0&size=10
  GET_ACCOUNT_BY_ID: (accountId: string) => `/account/${accountId}`, // GET /api/account/{accountId}
  CREATE_ACCOUNT: '/account', // POST /api/account
  UPDATE_ACCOUNT: (accountId: string) => `/account/${accountId}`, // PUT /api/account/{accountId}
  DELETE_ACCOUNT: (accountId: string) => `/account/${accountId}`, // DELETE /api/account/{accountId}
  GET_ACCOUNTS_BY_STATUS: (status: number) => `/account/status/${status}`, // GET /api/account/status/{status}?page=0&size=10
  GET_ACCOUNT_BY_PHONE: (accountPhone: string) => `/account/phone/${accountPhone}`, // GET /api/account/phone/{accountPhone}
  SEARCH_ACCOUNTS: '/account/search', // GET /api/account/search?accountName=xxx&page=0&size=10
  ACCOUNT_LOGIN: '/account/login', // POST /api/account/login

  // Menu Items - Theo MenuItemController.java
  GET_ALL_MENU_ITEMS: '/menu-items', // GET /api/menu-items?page=0&size=10
  GET_MENU_ITEM_BY_ID: (menuItemId: string) => `/menu-items/${menuItemId}`, // GET /api/menu-items/{menuItemId}
  GET_MENU_ITEMS_BY_RESTAURANT: (restaurantId: string) => `/menu-items/restaurant/${restaurantId}`, // GET /api/menu-items/restaurant/{restaurantId}
  CREATE_MENU_ITEM: '/menu-items', // POST /api/menu-items
  UPDATE_MENU_ITEM: (menuItemId: string) => `/menu-items/${menuItemId}`, // PUT /api/menu-items/{menuItemId}
  CHANGE_MENU_ITEM_STATUS: (menuItemId: string) => `/menu-items/${menuItemId}/status`, // PATCH /api/menu-items/{menuItemId}/status

  // Products - DEPRECATED - Use Menu Items instead
  GET_ALL_PRODUCTS: '/product', // GET /api/product?page=0&size=10
  GET_PRODUCT_BY_ID: (productId: string) => `/product/${productId}`, // GET /api/product/{productId}
  CREATE_PRODUCT: '/product', // POST /api/product (Admin only)
  UPDATE_PRODUCT: (productId: string) => `/product/${productId}`, // PUT /api/product/{productId} (Admin only)
  DELETE_PRODUCT: (productId: string) => `/product/${productId}`, // DELETE /api/product/{productId} (Admin only)
  FILTER_PRODUCTS: '/product/filter', // GET /api/product/filter?categoryId=xxx&status=1&minPrice=0&maxPrice=999999999&page=0&size=10
  SEARCH_PRODUCTS: '/product/search', // GET /api/product/search?keywords=xxx&page=0&size=10
 
  // File Upload - Cloudinary
  UPLOAD_IMAGE: '/upload/image', // POST /api/upload/image
  UPLOAD_FILE: '/upload/file', // POST /api/upload/file  
  GET_FILE_INFO: '/upload/info', // GET /api/upload/info?publicId=xxx
  DELETE_FILE: '/upload/delete', // DELETE /api/upload/delete/{publicId}
  OPTIMIZE_URL: '/upload/optimize', // POST /api/upload/optimize

  // Categories - Theo CategoryController.java
  GET_ALL_CATEGORIES: '/category', // GET /api/category?page=0&size=10
  GET_CATEGORY_BY_ID: (categoryId: string) => `/category/${categoryId}`, // GET /api/category/{categoryId}
  CREATE_CATEGORY: '/category', // POST /api/category (Admin only)
  UPDATE_CATEGORY: (categoryId: string) => `/category/${categoryId}`, // PUT /api/category/{categoryId} (Admin only)
  DELETE_CATEGORY: (categoryId: string) => `/category/${categoryId}`, // DELETE /api/category/{categoryId} (Admin only)
  SEARCH_CATEGORIES: '/category/search', // GET /api/category/search?keyword=xxx&page=0&size=10

  // Orders - Theo OrderController.java
  GET_ALL_ORDERS: '/orders', // GET /api/orders (Admin only)
  GET_ORDER_BY_ID: (orderId: string) => `/orders/${orderId}`, // GET /api/orders/{orderId}
  GET_ORDERS_BY_CUSTOMER: (customerId: string) => `/orders/user/${customerId}`, // GET /api/orders/user/{customerId}?page=0&size=10
  GET_ORDERS_BY_RESTAURANT: (restaurantId: string) => `/orders/restaurant/${restaurantId}`, // GET /api/orders/restaurant/{restaurantId}?page=0&size=10
  GET_ORDER_ITEMS: (orderId: string) => `/orders/${orderId}/items`, // GET /api/orders/{orderId}/items
  CREATE_ORDER: '/orders', // POST /api/orders (Customer only)
  UPDATE_ORDER: (orderId: string) => `/orders/${orderId}`, // PUT /api/orders/{orderId} (Admin only)
  DELETE_ORDER: (orderId: string) => `/orders/${orderId}`, // DELETE /api/orders/{orderId} (Admin only)
  GET_ORDERS_BY_ACCOUNT: (accountId: string) => `/orders/account/${accountId}`, // GET /api/orders/account/{accountId} (Customer only)
  CANCEL_ORDER: (orderId: string) => `/orders/${orderId}/cancel`, // PUT /api/orders/{orderId}/cancel (Customer only)
  COMPLETE_ORDER: (orderId: string) => `/orders/${orderId}/complete`, // PUT /api/orders/{orderId}/complete (Customer confirms delivery)
  CONFIRM_ORDER: (orderId: string) => `/orders/${orderId}/confirm`, // PUT /api/orders/{orderId}/confirm (Admin confirms order)
  START_DELIVERY: (orderId: string) => `/orders/${orderId}/start-delivery`, // PUT /api/orders/{orderId}/start-delivery (Admin starts delivery)
  UPDATE_ORDER_STATUS: (orderId: string) => `/orders/${orderId}/update-status`, // PUT /api/orders/{orderId}/update-status?status=xxx (Admin only)
  GET_ORDER_DETAILS: (orderId: string) => `/orders/${orderId}/details`, // GET /api/orders/{orderId}/details
  FILTER_ORDERS_BY_STATUS: '/orders/status', // GET /api/orders/status?status=xxx&page=0&size=10 (Admin only)
  FILTER_ORDERS_BY_DATE: '/orders/date-range', // GET /api/orders/date-range?startDate=xxx&endDate=xxx&page=0&size=10 (Admin only)
  SEARCH_ORDERS: '/orders/search', // GET /api/orders/search?keyword=xxx&page=0&size=10 (Admin only)
  FILTER_ORDERS: '/order/filter', // GET /api/order/filter?status=xxx&page=0&size=10 (Admin only)
  SEARCH_AND_FILTER_ORDERS: '/order/search-filter', // GET /api/order/search-filter?keyword=xxx&status=xxx&page=0&size=10 (Admin only)

  // Cart - Theo CartController.java (mapping: /api/carts)
  GET_CART_BY_ACCOUNT: (accountId: string) => `/carts/account/${accountId}`, // GET /api/carts/account/{accountId}
  CREATE_CART: (accountId: string) => `/carts/account/${accountId}`, // POST /api/carts/account/{accountId}
  DELETE_CART: (cartId: string) => `/carts/${cartId}`, // DELETE /api/carts/{cartId}
  ADD_ITEM_TO_CART: (accountId: string) => `/carts/account/${accountId}/items`, // POST /api/carts/account/{accountId}/items
  UPDATE_CART_ITEM: (cartItemId: string) => `/carts/items/${cartItemId}`, // PUT /api/carts/items/{cartItemId}
  REMOVE_ITEM_FROM_CART: (cartItemId: string) => `/carts/items/${cartItemId}`, // DELETE /api/carts/items/{cartItemId}
  GET_CART_ITEMS: (accountId: string) => `/carts/account/${accountId}/items`, // GET /api/carts/account/{accountId}/items
  CLEAR_CART: (accountId: string) => `/carts/account/${accountId}/clear`, // DELETE /api/carts/account/{accountId}/clear
  
  // Multi-cart endpoints (new)
  GET_ALL_CARTS_BY_USER: (userId: string) => `/carts/user/${userId}/all`, // GET /api/carts/user/{userId}/all
  GET_ALL_CARTS_DETAIL_BY_USER: (userId: string) => `/carts/user/${userId}/detail`, // GET /api/carts/user/{userId}/detail - with menu item details
  GET_CART_BY_USER_AND_RESTAURANT: (userId: string, restaurantId: string) => `/carts/user/${userId}/restaurant/${restaurantId}`, // GET /api/carts/user/{userId}/restaurant/{restaurantId}
  ADD_ITEM_TO_RESTAURANT_CART: (userId: string, restaurantId: string) => `/carts/user/${userId}/restaurant/${restaurantId}/items`, // POST /api/carts/user/{userId}/restaurant/{restaurantId}/items

  // Users - Theo UserController.java
  GET_ALL_USERS: '/users', // GET /api/users?page=0&size=10
  GET_USER_BY_ID: (userId: string) => `/users/${userId}`, // GET /api/users/{userId}
  CREATE_USER: '/users', // POST /api/users
  UPDATE_USER: (userId: string) => `/users/${userId}`, // PUT /api/users/{userId}
  CHANGE_USER_STATUS: (userId: string) => `/users/${userId}`, // PATCH /api/users/{userId}
  FILTER_USERS_BY_ROLE: (roleId: string) => `/users/filter-role/${roleId}`, // GET /api/users/filter-role/{roleId}?page=0&size=10

  // Roles - Theo RoleController.java
  GET_ALL_ROLES: '/roles', // GET /api/roles (FIXED: added 's')
  GET_ROLE_BY_ID: (roleId: string) => `/roles/${roleId}`, // GET /api/roles/{roleId}
  CREATE_ROLE: '/roles', // POST /api/roles

  // Restaurants - Theo RestaurantController.java
  GET_ALL_RESTAURANTS: '/restaurants', // GET /api/restaurants?page=0&size=10
  GET_RESTAURANT_BY_ID: (restaurantId: string) => `/restaurants/${restaurantId}`, // GET /api/restaurants/{restaurantId}
  GET_RESTAURANTS_BY_OWNER: (ownerId: string) => `/restaurants/owner/${ownerId}`, // GET /api/restaurants/owner/{ownerId}
  GET_RESTAURANTS_BY_CITY: (city: string) => `/restaurants/city/${city}`, // GET /api/restaurants/city/{city}
  GET_RESTAURANTS_BY_CITY_DISTRICT: (city: string, district: string) => `/restaurants/city/${city}/district/${district}`, // GET /api/restaurants/city/{city}/district/{district}
  GET_RESTAURANTS_BY_STATUS: (status: number) => `/restaurants/status/${status}`, // GET /api/restaurants/status/{status}
  CREATE_RESTAURANT: '/restaurants', // POST /api/restaurants
  UPDATE_RESTAURANT: (restaurantId: string) => `/restaurants/${restaurantId}`, // PUT /api/restaurants/{restaurantId}
  CHANGE_RESTAURANT_STATUS: (restaurantId: string) => `/restaurants/${restaurantId}/status`, // PATCH /api/restaurants/{restaurantId}/status?status=0
  DELETE_RESTAURANT: (restaurantId: string) => `/restaurants/${restaurantId}`, // DELETE /api/restaurants/{restaurantId}

  // Restaurant Details - Theo RestaurantDetailController.java
  CREATE_RESTAURANT_DETAIL: (restaurantId: string) => `/restaurant-details/${restaurantId}`, // POST /api/restaurant-details/{restaurantId}
  GET_RESTAURANT_DETAIL_BY_RESTAURANT: (restaurantId: string) => `/restaurant-details/${restaurantId}`, // GET /api/restaurant-details/{restaurantId}
  UPDATE_RESTAURANT_DETAIL: (restaurantDetailId: string) => `/restaurant-details/${restaurantDetailId}`, // PUT /api/restaurant-details/{restaurantDetailId}
  DELETE_RESTAURANT_DETAIL: (restaurantId: string) => `/restaurant-details/${restaurantId}`, // DELETE /api/restaurant-details/{restaurantId}

  // Account Restaurant Details - Theo AccountRestaurantDetailController.java
  CREATE_ACCOUNT_RESTAURANT_DETAIL: '/account-restaurant-details', // POST /api/account-restaurant-details
  UPDATE_ACCOUNT_RESTAURANT_DETAIL: (accountDetailId: string) => `/account-restaurant-details/${accountDetailId}`, // PUT /api/account-restaurant-details/{accountDetailId}
  GET_ACCOUNT_RESTAURANT_DETAIL_BY_USER: (userId: string) => `/account-restaurant-details/user/${userId}`, // GET /api/account-restaurant-details/user/{userId}
  GET_ACCOUNT_RESTAURANT_DETAIL_BY_RESTAURANT: (restaurantId: string) => `/account-restaurant-details/restaurant/${restaurantId}`, // GET /api/account-restaurant-details/restaurant/{restaurantId}
  GET_PENDING_VERIFICATIONS: '/account-restaurant-details/verification/pending', // GET /api/account-restaurant-details/verification/pending
  GET_APPROVED_VERIFICATIONS: '/account-restaurant-details/verification/approved', // GET /api/account-restaurant-details/verification/approved
  GET_REJECTED_VERIFICATIONS: '/account-restaurant-details/verification/rejected', // GET /api/account-restaurant-details/verification/rejected
  APPROVE_VERIFICATION: (accountDetailId: string) => `/account-restaurant-details/${accountDetailId}/verify/approve`, // POST /api/account-restaurant-details/{accountDetailId}/verify/approve
  REJECT_VERIFICATION: (accountDetailId: string) => `/account-restaurant-details/${accountDetailId}/verify/reject`, // POST /api/account-restaurant-details/{accountDetailId}/verify/reject

  // Drones - Theo DroneController.java (thay thế Shipping)
  GET_ALL_DRONES_BY_RESTAURANT: (restaurantId: string) => `/drones/restaurant/${restaurantId}`, // GET /api/drones/restaurant/{restaurantId}?page=0&size=10
  GET_DRONES_BY_RESTAURANT_AND_STATUS: (restaurantId: string, status: string) => `/drones/restaurant/${restaurantId}/status/${status}`, // GET /api/drones/restaurant/{restaurantId}/status/{status}?page=0&size=10
  GET_DRONE_BY_ID: (droneId: string) => `/drones/${droneId}`, // GET /api/drones/{droneId}
  CREATE_DRONE: '/drones', // POST /api/drones
  UPDATE_DRONE: (droneId: string) => `/drones/${droneId}`, // PUT /api/drones/{droneId}
    UPDATE_DRONE_STATUS: (droneId: string) => `/drones/${droneId}/status`, // PUT /api/drones/{droneId}/status?status={status}
  CHANGE_DRONE_STATUS: (droneId: string) => `/drones/${droneId}/status`, // PATCH /api/drones/{droneId}/status

  // Deliveries - Theo DeliveryController.java
  GET_DELIVERIES_BY_ORDER: (orderId: string) => `/deliveries/order/${orderId}`, // GET /api/deliveries/order/{orderId}
  GET_DELIVERIES_BY_DRONE_AND_RESTAURANT: (droneId: string, restaurantId: string) => `/deliveries/drone/${droneId}/restaurant/${restaurantId}`, // GET /api/deliveries/drone/{droneId}/restaurant/{restaurantId}
  GET_DELIVERY_BY_ID: (deliveryId: string) => `/deliveries/${deliveryId}`, // GET /api/deliveries/{deliveryId}
  CREATE_DELIVERY: '/deliveries', // POST /api/deliveries
  UPDATE_DELIVERY: (deliveryId: string) => `/deliveries/${deliveryId}`, // PUT /api/deliveries/{deliveryId}
  CHANGE_DELIVERY_STATUS: (deliveryId: string) => `/deliveries/${deliveryId}`, // PATCH /api/deliveries/{deliveryId}

  // Locations - Theo LocationController.java (Redis-based realtime drone tracking)
  UPDATE_DRONE_LOCATION: '/locations', // POST /api/locations - Update drone location (cached in Redis)
  GET_DRONE_LOCATION: (droneId: string) => `/locations/drone/${droneId}`, // GET /api/locations/drone/{droneId} - Get current drone location from Redis/DB

  // Ratings - Theo RatingController.java
  GET_ALL_RATINGS: '/rating', // GET /api/rating?page=0&size=10
  GET_RATINGS_BY_ACCOUNT: (accountId: string) => `/rating/account/${accountId}`, // GET /api/rating/account/{accountId}?page=0&size=10
  GET_RATINGS_BY_PRODUCT: (productId: string) => `/rating/product/${productId}`, // GET /api/rating/product/{productId}?page=0&size=10
  GET_RATING_BY_ACCOUNT_AND_PRODUCT: (accountId: string, productId: string) => `/rating/account/${accountId}/product/${productId}`, // GET /api/rating/account/{accountId}/product/{productId}
  GET_AVERAGE_RATING_BY_PRODUCT: (productId: string) => `/rating/product/${productId}/average`, // GET /api/rating/product/{productId}/average
  CREATE_RATING: '/rating', // POST /api/rating
  UPDATE_RATING: (ratingId: string) => `/rating/${ratingId}`, // PUT /api/rating/{ratingId}
  CHANGE_RATING_STATUS: (ratingId: string) => `/rating/${ratingId}/status`, // PATCH /api/rating/{ratingId}/status
  DELETE_RATING: (ratingId: string) => `/rating/${ratingId}`, // DELETE /api/rating/{ratingId}

  // MoMo Payment - Theo MomoController.java
  CREATE_MOMO_PAYMENT: '/momo/create-payment', // POST /api/momo/create-payment
  MOMO_IPN_HANDLER: '/momo/ipn-handler', // POST /api/momo/ipn-handler (called by MoMo)
  MOMO_RETURN: '/momo/return', // GET /api/momo/return
  CHECK_MOMO_STATUS: (orderId: string) => `/momo/check-status/${orderId}`, // GET /api/momo/check-status/{orderId}
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PROFILE: 'user_profile',
  THEME: 'theme',
  LANGUAGE: 'language',
  REMEMBER_ME: 'remember_me',
  CART: 'cart',
} as const;

// Application Constants
export const APP_CONFIG = {
  APP_NAME: 'WebSach',
  APP_VERSION: '1.0.0',
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  
  // Account status constants
  ACCOUNT_STATUS: {
    INACTIVE: 0,   // Không hoạt động
    ACTIVE: 1,     // Đang hoạt động
  },
  
  // Product status constants
  PRODUCT_STATUS: {
    INACTIVE: 0,   // Không hoạt động
    ACTIVE: 1,     // Đang hoạt động
  },
  
  // Menu Item status constants (same as Product)
  MENU_ITEM_STATUS: {
    INACTIVE: 0,   // Không hoạt động
    ACTIVE: 1,     // Đang hoạt động
  },
  
  // Order status constants
  ORDER_STATUS: {
    PENDING: 0,      // Chờ xử lý
    CONFIRMED: 1,    // Đã xác nhận
    SHIPPING: 2,     // Đang giao hàng
    DELIVERED: 3,    // Đã giao hàng
    CANCELLED: 4,    // Đã hủy
  },
  
  // Role types
  ROLE_TYPES: {
    ADMIN: 'ADMIN',
    CUSTOMER: 'CUSTOMER',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền truy cập tính năng này.',
  NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  FILE_TOO_LARGE: 'File quá lớn. Kích thước tối đa cho phép là 10MB.',
  INVALID_FILE_TYPE: 'Định dạng file không được hỗ trợ.',
  
  // Account specific errors
  ACCOUNT_NOT_FOUND: 'Không tìm thấy tài khoản.',
  ACCOUNT_CREATE_FAILED: 'Tạo tài khoản thất bại.',
  ACCOUNT_UPDATE_FAILED: 'Cập nhật tài khoản thất bại.',
  LOGIN_FAILED: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
  
  // Product specific errors
  PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm.',
  PRODUCT_CREATE_FAILED: 'Tạo sản phẩm thất bại.',
  PRODUCT_UPDATE_FAILED: 'Cập nhật sản phẩm thất bại.',
  
  // Menu Item specific errors
  MENU_ITEM_NOT_FOUND: 'Không tìm thấy món ăn.',
  MENU_ITEM_CREATE_FAILED: 'Tạo món ăn thất bại.',
  MENU_ITEM_UPDATE_FAILED: 'Cập nhật món ăn thất bại.',
  MENU_ITEM_STATUS_CHANGE_FAILED: 'Thay đổi trạng thái món ăn thất bại.',
  
  // Category specific errors
  CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục.',
  CATEGORY_CREATE_FAILED: 'Tạo danh mục thất bại.',
  CATEGORY_UPDATE_FAILED: 'Cập nhật danh mục thất bại.',
  
  // Order specific errors
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng.',
  ORDER_CREATE_FAILED: 'Tạo đơn hàng thất bại.',
  ORDER_UPDATE_FAILED: 'Cập nhật đơn hàng thất bại.',
  ORDER_CANCEL_FAILED: 'Hủy đơn hàng thất bại.',
  
  // Cart specific errors
  CART_NOT_FOUND: 'Không tìm thấy giỏ hàng.',
  CART_ADD_ITEM_FAILED: 'Thêm sản phẩm vào giỏ hàng thất bại.',
  CART_UPDATE_FAILED: 'Cập nhật giỏ hàng thất bại.',
  CART_REMOVE_ITEM_FAILED: 'Xóa sản phẩm khỏi giỏ hàng thất bại.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  // General success messages
  UPDATE_SUCCESS: 'Cập nhật thành công!',
  DELETE_SUCCESS: 'Xóa thành công!',
  SAVE_SUCCESS: 'Lưu thành công!',
  
  // Account specific success
  ACCOUNT_CREATED: 'Tạo tài khoản thành công!',
  ACCOUNT_UPDATED: 'Cập nhật tài khoản thành công!',
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  LOGOUT_SUCCESS: 'Đăng xuất thành công!',
  
  // Product specific success
  PRODUCT_CREATED: 'Tạo sản phẩm thành công!',
  PRODUCT_UPDATED: 'Cập nhật sản phẩm thành công!',
  PRODUCT_STATUS_CHANGED: 'Thay đổi trạng thái sản phẩm thành công!',
  
  // Menu Item specific success
  MENU_ITEM_CREATED: 'Tạo món ăn thành công!',
  MENU_ITEM_UPDATED: 'Cập nhật món ăn thành công!',
  MENU_ITEM_STATUS_CHANGED: 'Thay đổi trạng thái món ăn thành công!',
  
  // Category specific success
  CATEGORY_CREATED: 'Tạo danh mục thành công!',
  CATEGORY_UPDATED: 'Cập nhật danh mục thành công!',
  
  // Order specific success
  ORDER_CREATED: 'Tạo đơn hàng thành công!',
  ORDER_UPDATED: 'Cập nhật đơn hàng thành công!',
  ORDER_CANCELLED: 'Hủy đơn hàng thành công!',
  
  // Cart specific success
  CART_ITEM_ADDED: 'Thêm sản phẩm vào giỏ hàng thành công!',
  CART_ITEM_UPDATED: 'Cập nhật giỏ hàng thành công!',
  CART_ITEM_REMOVED: 'Xóa sản phẩm khỏi giỏ hàng thành công!',
  CART_CLEARED: 'Xóa toàn bộ giỏ hàng thành công!',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  
  // Auth routes
  REGISTER: '/account/register',
  
  // Product routes
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  PRODUCT_CREATE: '/products/create',
  PRODUCT_EDIT: (id: string) => `/products/edit/${id}`,
  
  // Category routes
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: (id: string) => `/categories/${id}`,
  CATEGORY_CREATE: '/categories/create',
  CATEGORY_EDIT: (id: string) => `/categories/edit/${id}`,
  
  // Order routes
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  ORDER_HISTORY: '/orders/history',
  
  // Cart routes
  CART: '/cart',
  CHECKOUT: '/checkout',
  
  // Account routes
  PROFILE: '/profile',
  ACCOUNT_SETTINGS: '/account/settings',
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin',
    ACCOUNTS: '/admin/accounts',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders',
    ROLES: '/admin/roles',
    DRONES: '/admin/drones',
    RATINGS: '/admin/ratings',
  },
  
  // Search
  SEARCH: '/search',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Email không hợp lệ',
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    MESSAGE: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
  },
  PHONE: {
    PATTERN: /^(\+84|84|0)?([3|5|7|8|9])+([0-9]{8})$/,
    MESSAGE: 'Số điện thoại không hợp lệ',
  },
  ACCOUNT_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    MESSAGE: 'Tên tài khoản phải từ 2-50 ký tự',
  },
  PRODUCT_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 200,
    MESSAGE: 'Tên sản phẩm phải từ 2-200 ký tự',
  },
  CATEGORY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    MESSAGE: 'Tên danh mục phải từ 2-100 ký tự',
  },
  PRICE: {
    MIN: 0,
    MESSAGE: 'Giá sản phẩm phải lớn hơn 0',
  },
  QUANTITY: {
    MIN: 0,
    MESSAGE: 'Số lượng phải lớn hơn hoặc bằng 0',
  },
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Language Configuration
export const LANGUAGE_CONFIG = {
  VI: 'vi',
  EN: 'en',
} as const;

export default {
  CONFIG,
  API_URL,
  API,
  HTTP_STATUS,
  STORAGE_KEYS,
  APP_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  VALIDATION_RULES,
  THEME_CONFIG,
  LANGUAGE_CONFIG,
};
