import axios from '../libs/axios';
import { CONFIG, API } from '../config/constants';
import type { 
  AddToCartRequest, 
  UpdateCartItemRequest,
  CartResponse,
  AddToCartResponse,
  AddMenuItemToCartRequest 
} from '../types/cart';

export const cartService = {
  // Lấy giỏ hàng theo account ID
  async getCartByAccount(accountId: string): Promise<CartResponse> {
    try {
      const response = await axios.get(`${CONFIG.API_GATEWAY}${API.GET_CART_BY_ACCOUNT(accountId)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi lấy giỏ hàng',
        error: error.message
      };
    }
  },

  // Tạo giỏ hàng mới
  async createCart(accountId: string): Promise<CartResponse> {
    try {
      console.log('🔄 CartService: Creating cart with URL:', `${CONFIG.API_GATEWAY}${API.CREATE_CART(accountId)}`);
      
      const response = await axios.post(`${CONFIG.API_GATEWAY}${API.CREATE_CART(accountId)}`);
      
      console.log('✅ CartService: Create cart success:', response.data);
      
      // Wrap response data trong success format
      return {
        success: true,
        message: 'Tạo giỏ hàng thành công',
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ CartService: Error creating cart:', error);
      console.error('❌ CartService: Error response:', error.response?.data);
      console.error('❌ CartService: Error status:', error.response?.status);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Lỗi khi tạo giỏ hàng',
        error: error.message
      };
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(request: AddToCartRequest): Promise<AddToCartResponse> {
    try {
      console.log('🔄 CartService: Adding to cart with URL:', `${CONFIG.API_GATEWAY}${API.ADD_ITEM_TO_CART(request.accountId)}`);
      console.log('🔄 CartService: Request body:', {
        productId: request.productId,
        quantity: request.quantity
      });
      
      const response = await axios.post(`${CONFIG.API_GATEWAY}${API.ADD_ITEM_TO_CART(request.accountId)}`, {
        productId: request.productId,
        quantity: request.quantity
      });
      
      console.log('✅ CartService: Success response:', response.data);
      
      // Nếu backend trả về trực tiếp data, wrap nó trong success response
      return {
        success: true,
        message: 'Thêm vào giỏ hàng thành công',
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ CartService: Error adding to cart:', error);
      console.error('❌ CartService: Error response:', error.response?.data);
      console.error('❌ CartService: Error status:', error.response?.status);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Lỗi khi thêm vào giỏ hàng',
        error: error.message
      };
    }
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  async updateCartItem(request: UpdateCartItemRequest): Promise<CartResponse> {
    try {
      console.log('🔄 CartService: Updating cart item with URL:', `${CONFIG.API_GATEWAY}/carts/${request.cartId}/items/${request.cartItemId}`);
      console.log('🔄 CartService: Request body:', request);
      
      const response = await axios.put(
        `${CONFIG.API_GATEWAY}/carts/${request.cartId}/items/${request.cartItemId}`, 
        { quantity: request.quantity }
      );
      
      console.log('✅ CartService: Update cart item success:', response.data);
      
      // Đảm bảo response format nhất quán
      if (response.data && typeof response.data === 'object') {
        // Nếu backend trả về success: true/false
        if ('success' in response.data) {
          return response.data;
        }
        // Nếu backend chỉ trả về message hoặc data
        return {
          success: true,
          message: response.data.message || 'Cập nhật số lượng thành công',
          data: response.data.data || response.data
        };
      }
      
      // Fallback response
      return {
        success: true,
        message: 'Cập nhật số lượng thành công',
        data: undefined
      };
    } catch (error: any) {
      console.error('❌ CartService: Error updating cart item:', error);
      console.error('❌ CartService: Error response:', error.response?.data);
      console.error('❌ CartService: Error status:', error.response?.status);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Lỗi khi cập nhật giỏ hàng',
        error: error.message
      };
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  async removeFromCart(cartId: string, cartItemId: string): Promise<CartResponse> {
    try {
      console.log('🔄 CartService: Removing cart item with URL:', `${CONFIG.API_GATEWAY}/carts/${cartId}/items/${cartItemId}`);
      
      const response = await axios.delete(`${CONFIG.API_GATEWAY}/carts/${cartId}/items/${cartItemId}`);
      
      console.log('✅ CartService: Remove from cart success:', response.data);
      
      // Đảm bảo response format nhất quán
      if (response.data && typeof response.data === 'object') {
        // Nếu backend trả về success: true/false
        if ('success' in response.data) {
          return response.data;
        }
        // Nếu backend chỉ trả về message hoặc data
        return {
          success: true,
          message: response.data.message || 'Xóa sản phẩm khỏi giỏ hàng thành công',
          data: response.data.data || response.data
        };
      }
      
      // Fallback response
      return {
        success: true,
        message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
        data: undefined
      };
    } catch (error: any) {
      console.error('❌ CartService: Error removing from cart:', error);
      console.error('❌ CartService: Error response:', error.response?.data);
      console.error('❌ CartService: Error status:', error.response?.status);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Lỗi khi xóa sản phẩm khỏi giỏ hàng',
        error: error.message
      };
    }
  },

  // Lấy danh sách cart items
  async getCartItems(accountId: string): Promise<CartResponse> {
    try {
      console.log('🔄 CartService: Getting cart items with URL:', `${CONFIG.API_GATEWAY}${API.GET_CART_ITEMS(accountId)}`);
      
      const response = await axios.get(`${CONFIG.API_GATEWAY}${API.GET_CART_ITEMS(accountId)}`);
      
      console.log('✅ CartService: Get cart items success:', response.data);
      
      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ CartService: Error getting cart items:', error);
      console.error('❌ CartService: Error response:', error.response?.data);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Lỗi khi lấy danh sách giỏ hàng',
        error: error.message
      };
    }
  },

  // Xóa toàn bộ giỏ hàng
  async clearCart(accountId: string): Promise<CartResponse> {
    try {
      console.log('🔄 CartService: Clearing cart with URL:', `${CONFIG.API_GATEWAY}${API.CLEAR_CART(accountId)}`);
      
      const response = await axios.delete(`${CONFIG.API_GATEWAY}${API.CLEAR_CART(accountId)}`);
      
      console.log('✅ CartService: Clear cart success:', response.data);
      console.log('✅ CartService: Clear cart status:', response.status);
      
      // Backend trả về ResponseEntity<Void> với status 200 = success
      if (response.status === 200) {
        return {
          success: true,
          message: 'Xóa giỏ hàng thành công',
          data: undefined
        };
      }
      
      // Fallback case
      return {
        success: false,
        message: 'Có lỗi xảy ra khi xóa giỏ hàng',
        error: 'Unexpected response'
      };
    } catch (error: any) {
      console.error('❌ CartService: Error clearing cart:', error);
      console.error('❌ CartService: Error response:', error.response?.data);
      console.error('❌ CartService: Error status:', error.response?.status);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Lỗi khi xóa giỏ hàng',
        error: error.message
      };
    }
  },

  // ===== MULTI-CART METHODS (Restaurant-based carts) =====
  
  // Lấy tất cả giỏ hàng của user (mỗi restaurant = 1 cart)
  async getAllCartsByUser(userId: string): Promise<CartResponse> {
    try {
      const response = await axios.get(`${CONFIG.API_GATEWAY}${API.GET_ALL_CARTS_BY_USER(userId)}`);
      
      return {
        success: true,
        message: 'Lấy danh sách giỏ hàng thành công',
        data: response.data
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Lỗi khi lấy danh sách giỏ hàng',
        error: err.message
      };
    }
  },

  // Lấy tất cả giỏ hàng của user (với đầy đủ thông tin món ăn)
  async getAllCartsDetailByUser(userId: string): Promise<CartResponse> {
    try {
      const response = await axios.get(
        `${CONFIG.API_GATEWAY}${API.GET_ALL_CARTS_DETAIL_BY_USER(userId)}`
      );
      
      return {
        success: true,
        message: 'Lấy danh sách giỏ hàng chi tiết thành công',
        data: response.data
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Lỗi khi lấy danh sách giỏ hàng',
        error: err.message
      };
    }
  },

  // Lấy giỏ hàng của user tại 1 restaurant cụ thể
  async getCartByUserAndRestaurant(userId: string, restaurantId: string): Promise<CartResponse> {
    try {
      const response = await axios.get(
        `${CONFIG.API_GATEWAY}${API.GET_CART_BY_USER_AND_RESTAURANT(userId, restaurantId)}`
      );
      
      return {
        success: true,
        message: 'Lấy giỏ hàng thành công',
        data: response.data
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Lỗi khi lấy giỏ hàng',
        error: err.message
      };
    }
  },

  // Thêm menu item vào cart của restaurant (auto-create cart nếu chưa có)
  async addItemToRestaurantCart(
    userId: string, 
    restaurantId: string, 
    request: AddMenuItemToCartRequest
  ): Promise<CartResponse> {
    try {
      const response = await axios.post(
        `${CONFIG.API_GATEWAY}${API.ADD_ITEM_TO_RESTAURANT_CART(userId, restaurantId)}`,
        request
      );
      
      return {
        success: true,
        message: 'Thêm vào giỏ hàng thành công',
        data: response.data
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Lỗi khi thêm vào giỏ hàng',
        error: err.message
      };
    }
  }
};
